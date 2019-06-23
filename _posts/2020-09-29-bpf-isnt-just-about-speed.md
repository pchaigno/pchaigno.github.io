---
layout: post
title: "BPF Isn't Just About Speed"
date: 2020-09-29 19:10:10 +0200
categories: ebpf
image: /assets/egress-filtering-benchmark/udp-throughput-all.png
published: true
uses_flamegraphs: true
redirect_from:
  - /bpf/2020/09/29/bpf-isnt-just-about-speed.html
---

In [a recent blog post](https://kinvolk.io/blog/2020/09/performance-benchmark-analysis-of-egress-filtering-on-linux), Alban Crequy and Mauricio Vásquez benchmarked _egress_ filtering solutions in the Linux kernel and compared iptables, ipsets, and BPF at the tc hook.
That is exciting, not only because egress benchmarks are missing with everyone focusing on ingress (e.g., XDP), but also because they:
- included short CPU traces, allowing us to understand what is happening.
- provided [the code](https://github.com/kinvolk/egress-filtering-benchmark) and ran it on [Packet machines](https://www.packet.com), allowing anyone to easily reproduce results.

In this blog post, I will [build on their initial investigation](https://github.com/kinvolk/egress-filtering-benchmark/pull/10) to highlight a point on BPF that I think is sometimes missed.

<br>

### BPF JIT Compiling

The first thing to notice in the original benchmarks is the `___bpf_prog_run` function in the CPU trace.
This is the [main eBPF interpreter function](https://elixir.bootlin.com/linux/v5.9.11/source/kernel/bpf/core.c#L1367) in the kernel and its presence indicates that JIT compiling wasn't enabled.
The authors added [a note in that regard](https://kinvolk.io/blog/2020/09/performance-benchmark-analysis-of-egress-filtering-on-linux/#conclusion) in a recent update of the blog post.

JIT compiling is critical to BPF's performance, so let's have a look at the UDP throughput results once it's enabled.
I reproduced the results on the same hardware (Packet's `c2.medium.x86` server), except I used Packet's default Ubuntu 20.04 image instead of Flatcar.
I also isolated the third core, on which the iperf3 client runs, from the Linux scheduler to reduce variance.

<img src="/assets/egress-filtering-benchmark/udp-throughput-with-jit.svg" alt="UDP throughput results with BPF's JIT compiler enabled" style="width: 100%;"/>

Ipset and BPF are close to the baseline (`none`), with ipset maybe slightly better than BPF for a large number of CIDRs.
As one could expect, enabling JIT compiling improves BPF's performance.
In the original blog post, ipset was noticeably more efficient at filtering packets than BPF.
With JIT compiling enabled, the situation is not as clear.
Other differences with the original results (higher throughput for the baseline and ipset) may be due to the different OS I used.

You may be wondering what's the big deal about BPF given it seems to perform worse than ipset.
We actually can't conclude that just yet.

<br>

### Packet Classification Algorithms

In the original blog post, egressing packets are filtered based on their destination IP address.
A denylist of CIDRs is defined beforehand and used by either iptables, ipsets, or BPF.
As the authors explain, however, the algorithm to match packets against the denylist is not the same in all three cases.

Iptables has a linear algorithm and doesn't offer another choice.
In the BPF program, the authors rely on the Longest Prefix Match (LPM) map, which stores the denylist as [a trie](https://elixir.bootlin.com/linux/v5.8.10/source/kernel/bpf/lpm_trie.c#L40).
Finally, ipsets offers several data structures, called set types, and associated lookup algorithms.
The authors chose to use [the `hash:net` data structure](https://ipset.netfilter.org/ipset.man.html#lbAZ).

Ipset's `hash:net` data structure consists of a hash table per CIDR length.
The packet's IP address is then looked up in each hash table, starting with the `/32`.
This is a fairly common algorithm, called a [Tuple Space Search classifier](http://cseweb.ucsd.edu/~varghese/PAPERS/Sigcomm99.pdf) in its more general form, and implemented for example in [Open vSwitch's classifiers](https://github.com/openvswitch/ovs/blob/0026d9dcb0865e8ba48b57429da25ace0df43d41/lib/dpif-netdev.c#L8891).

In this benchmark, however, the authors used only `/24` and `/16` CIDRs[^assumed-cidrs], so the ipset lookup consists of only two hash table lookups.
This denylist is essentially a best case scenario for ipset's `hash:net`.
Fortunately, we can easily change the BPF program to use a hash table per CIDR length, same as ipset’s `hash:net`.
Now, we are comparing apples to apples.

<img src="/assets/egress-filtering-benchmark/udp-throughput-hashmaps.svg" alt="UDP throughput results with BPF hashmaps" style="width: 100%;"/>

Our BPF program now seems to perform slightly better than its ipset counterpart, at least when the number of CIDRs grows.


<br>

### BPF Hook on Egress of Cgroupv2

The tc hook is not the only BPF hook on the way of packets egressing the system.
Neither is it the most efficient hook to filter egressing packets.
It actually [occurs quite late in the processing flow](https://en.wikipedia.org/wiki/Netfilter#/media/File:Netfilter-packet-flow.svg), not long before packets are sent on the wire.

A more efficient means of filtering packets is the cgroupv2 egress hook.
With a BPF program attached to the root cgroup, it is possible to filter data from all sockets on the system.

A minimal example, with our 2-hashmaps egress filtering logic, would look as follows:

{% highlight c %}
__section("cgroup/skb1")
int filter_egress(struct __sk_buff *skb) {
    struct iphdr iph;
    __u32 dstip = skb->remote_ip4;

    if (!dstip) {
        bpf_skb_load_bytes(skb, 0, &iph, sizeof(struct iphdr));
        if (iph.version == 4)
            dstip = iph.daddr;
    }

    if (bpf_map_lookup_elem(&hash_table24, &dstip))
        return 0;
    if (bpf_map_lookup_elem(&hash_table16, &dstip))
        return 0;
    return 1;
}
{% endhighlight %}

If we load this with [the Go ebpf library](https://github.com/cilium/ebpf) and run the same benchmarks as before, we get the following results.

<img src="/assets/egress-filtering-benchmark/udp-throughput-all.svg" alt="UDP throughput results including cgroup-bpf" style="width: 100%;"/>

Our BPF program attached at the cgroup egress hook seems to perform a bit better than the same program at the tc hook, but there's still a lot of variance.
If we reduce the target bandwidth and look at the CPU consumption instead, the picture is clearer.

<img src="/assets/egress-filtering-benchmark/cpu-bpf-tc-cgroup.svg" alt="CPU consumption of tc-bpf vs. cgroup-bpf" style="width: 100%;"/>

Our cgroup-bpf programs is slightly more efficient: it consumes a bit less CPU to achieve the same throughput.
Note that this is with a very idle system.
The more processing you have on your egress path, the larger the difference will be.
So on a system with lots of iptables rules (e.g., a Kubernetes node), the difference is likely to be larger.

Finally, to keep with the good habit of sharing what's happening on the CPU, I generated flame graphs corresponding to all five filtering hooks (including `none`).
In each case, 1M CIDRs were loaded and the perf samples were collected with the highest-possible frequency[^separate-perf-collection].

{% include egress-filtering-benchmark/flamegraphs.html %}

With BPF and ipset, the filtering overhead is small.
You can see it by clicking on the flame graphs, then on Search in the top-right corner and type `cls_bpf_classify`, `cgroup_bpf_run`, or `ip_set_test`.
In the last flame graph, however, the overhead of iptables with 1M entries is considerable and explains the null throughput.

<br>

### BPF's Superpower is not Speed

I'm going to stop here for this time, even though there's a lot more experiments we could build on this framework (e.g., run netperf's `TCP_RR` workload, try different hashmap sizes[^impact-hashmap-sizes], etc.).

As we've seen above, even with JIT compiling enabled, the same packet classication algorithms, and cgroup-bpf, BPF is only slightly more efficient than ipset.
A BPF implementation of a given algorithm is unlikely to be more efficient than its native implementation if run at the same point in the kernel.
So what's all the excitement around BPF?

BPF's superpower isn't speed, it's that it allows you to "program" the kernel.
As we've seen earlier, we can easily switch the packet classification algorithm used by BPF or implement our own, as befits our denylist.
And with recent kernels, we now dispose of a [large choice of kernel hooks](https://github.com/torvalds/linux/blob/v5.8/include/linux/bpf_types.h) to which we can attach our programs.
Why use netfilter if you can drop ingress packets at the NIC driver and egress packets at the socket-level?

This superpower often enables large performance improvements, by [avoiding unnecessary computations](https://linuxplumbersconf.org/event/2/contributions/109/), specializing your programs, or [skipping large parts of the kernel network stack](https://youtu.be/99jUcLt3rSk?t=524).
On ingress for example, BPF can run in the driver and filter packets sooner than any other filtering hook.
For that reason, the above comparisons are dramatically different on ingress, with [reports of XDP/BPF being more than 5 times faster than alternatives](https://blog.cloudflare.com/how-to-drop-10-million-packets/#summary)!
Despite these improvements, I really don't see performance as BPF's _first_ benefit.

<br>

### Addendum: A Note on Per-Packet Overheads

You may have noticed that, in the original blog post, the UDP benchmark is limited to ~3Gbps while the TCP benchmark easily reaches 10Gbps.
The cost of going through the Linux stack is a per-packet cost.
The default buffer length set by `iperf3`, used in the benchmarks, is much higher for TCP (128KB) than for UDP (path MTU if discovered or 1460B), resulting in a lot more packets sent for UDP.
Since Generic Segmentation Offload is enabled, this buffer length has a strong impact on throughput.

{% highlight shell %}
$ iperf3 -u -b 10G -l 65507 -c 10.80.68.129
...
[ ID] Interval           Transfer     Bitrate         Jitter    Lost/Total Datagrams
[  5]   0.00-10.00  sec  9.33 GBytes  8.01 Gbits/sec  0.000 ms  0/152901 (0%)  sender
[  5]   0.00-10.00  sec  9.33 GBytes  8.01 Gbits/sec  0.033 ms  0/152900 (0%)  receiver
{% endhighlight %}

Setting the UDP buffer length to its maximum (~64KB) increases throughput to ~8Gbps.

We would ideally report throughput results in packets per second, but given the buffer length is fixed in UDP's case, it's probably okay to stick to Gbps.
Thus, this post retained the 1460B default buffer length for easier comparison.

<br>

Thanks to Céline, Quentin, and Daniel for their advice and reviews.
Also, thanks to [Anthony Krivonos](https://anthonykrivonos.com/) who created [the library](https://github.com/anthonykrivonos/flix-carousel) on which I based my flame graph carousel.

<br>

[^assumed-cidrs]: Assuming they ran with their [default parameters](https://github.com/kinvolk/egress-filtering-benchmark/blob/37f9dbc45720f64cd8a24df5c7cfbbd00d18de5a/benchmark/parameters.py#L17).
[^separate-perf-collection]: Perf samples were collected during a separate benchmark run, so as to not impact throughput results.
[^impact-hashmap-sizes]: In the above BPF evaluations, the maps have a maximum size of 1M entries, meaning the `/24` hashmap is almost full for 1M CIDRs and leads to more hash collisions. With larger hashmaps, there would be more buckets and less collisions. 
