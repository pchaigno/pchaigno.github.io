---
layout: post
title: "The Cost of BPF Tail Calls"
date: 2021-03-22 16:00:00 +0200
categories: ebpf
image: /assets/illustration-cost-bpf-tail-calls.png
published: true
uses_plotly: true
---

For an upcoming blog post, I wanted to measure the cost of [BPF tail calls](https://docs.cilium.io/en/stable/bpf/#tail-calls).
Tail calls allow you to jump from one BPF program to another.
Their overhead varied a lot in recent kernels, with a first increase caused by Spectre mitigations and a decrease thanks to improvements in Linux 5.5.

In this blog post, I'll quickly go over [how I measured that overhead](#methodology) for diverse configurations and will then present [the results](#results).

An evaluation of tail call costs was presented before at [Linux Plumbers 2020](https://linuxplumbersconf.org/event/7/contributions/676/).
That evaluation focused on extracting realistic numbers for Cloudflare's environment on two Linux releases, whereas I'm interested in variations across a larger set of kernel releases.
I am therefore using cheaper but less realistic hardware.

<br>

### Methodology

I wanted to measure the cost of both a single tail call and a chain of tail calls.
The maximum number of chained tail calls is 33[^33-tail-calls], so I wrote the following [BPF program](https://github.com/pchaigno/tail-call-bench/blob/main/image/kern.c).

{% highlight c %}
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

struct bpf_map_def SEC("maps") progs = {
	.type = BPF_MAP_TYPE_PROG_ARRAY,
	.key_size = sizeof(__u32),
	.value_size = sizeof(__u32),
	.max_entries = 34,
};

/* Macro to define the Xth BPF program, in its own section. */
#define PROG(X) SEC("action/prog" #X)		\
int bpf_prog ## X(void *ctx) {			\
	bpf_tail_call(ctx, &progs, X+1);	\
	return 0;				\
}

PROG(0)
...
PROG(33)
{% endhighlight %}

Then, from userspace, we can fill the tail call map such that a given number of tail calls are performed.
For example, to perform 2 tail calls, we update the map such that:
- `1` maps to program `action/prog1`;
- `2` maps to program `action/prog2`.

When running program `action/prog0`, it will tail call to `action/prog1`, which will tail call to `action/prog2`.
`action/prog2` will attempt a tail call using `3` as index, fail as there are no such map entry, and exit.

Finally, I rely on `BPF_PROG_TEST_RUN` to run the chain of programs and retrieve the mean runtime.

<br>

### Results

I ran all measurements on a low-end `t1.small.x86` [Packet](https://www.packet.com/) server with the following specs, and used [an Ansible playbook](https://github.com/pchaigno/tail-call-bench) to automate and parallelize the installation of Linux releases.

> 1x Intel Atom C2750 @ 2.4GHz<br>
> Turbo frequency (enabled): 2.6 GHz<br>
> 8GB of RAM

I first measured the cost of tail call chains of varying lengths on the last three LTS Linux releases, plus v5.5 for which better performance is expected.
I instructed `BPF_PROG_TEST_RUN` to run the chain of programs 100 million times and repeated the experiment 10 times[^duration-experiment], taking the average over all runs.

{% include plot-tail-call-costs.html %}

In this first plot, [retpoline](https://support.google.com/faqs/answer/7625886) is enabled.
We can observe that the difference between the three apparent lines is not very visible until we reach 6 chained tail calls.
For shorter tail call chains, differences in measurements tend to be covered by noise.

The performance of v4.19 varies a lot for long tail call chains, causing its mean to be higher than v5.4's.
Those variations seem be have been introduced at some point between v5.2 and v5.3.
I did not investigate further[^bisect-variations] as I'm more interested in changes introduced by v5.5 and v5.10.

The lower cost of tail calls on v5.5 is expected and is the result of work to compile direct tail calls into jumps, which removed the need for a retpoline.
That work is best covered in [Cilium v1.7's blog post](https://cilium.io/blog/2020/02/18/cilium-17#live-patching-of-ebpf-programs).
The increased cost in v5.10 is however unexpected.

In the next plot, we'll zoom in on the apparent performance regression in v5.10 and compare our numbers to those with retpoline disabled.
We'll focus on chains of 33 tail calls, but you can use the **slider below the figure** to observe shorter chains.

{% include plot-tail-call-costs-33.html %}

This time we can see a clear difference with and without retpoline before v5.5.
Version 5.5 eliminates the difference and lowers the overall cost.

We can also observe that the performance regression was introduced in v5.10; previous releases have similar performance to v5.5's.
Further bisecting narrowed down the regression to commit [`ebf7d1f`] ("bpf, x64: rework pro/epilogue and tailcall handling in JIT").
That commit reworked the x86 JIT compiling of tail calls to enable [their combination with BPF function calls](https://twitter.com/pchaigno/status/1310628945805676544).

Looking at the code changes, it's unclear why they would lower performance.
I'll have to retrieve some `perf` samples (and maybe write a second blog post if we solve it).

<br>

### A Note on the Standard Deviation

I started this blog post several months ago.
It took me a while to finish it because I initially wanted to measure the standard deviation of tail call costs.
Easy right?

`BPF_PROG_TEST_RUN` runs 100 million times and reports the mean of runtimes.
If I compute the standard deviation of `BPF_PROG_TEST_RUN`'s results, I'll get the standard deviation of means and not the standard deviation itself.
The standard deviation of the mean runtimes doesn't tell us anything on the runtime variations.

I tried to extend `BPF_PROG_TEST_RUN` to report the standard deviation, but whichever way I implemented it, it impacted the results a lot.
Thus, I eventually decided to not include any standard deviation at all in the plots, to not give a false impression of stability.
Except for v4.19, the runtime means are very stable, but that doesn't imply that the actual runtimes are.

<br>

### Conclusion

To sum up, the performance of tail calls improved a lot in v5.5 and worsened a bit in v5.10.
The changes appear to be smaller on the hardware I used than on other hardware.
For example, on my i7-9750H CPU clocked at 2.60GHz, the mean runtime decreases by ~10x in v5.5 and increases back by ~4x in v5.10.
<!-- 42 on 5.5; 160 on 5.10; 404 on 5.4 -->

Obviously this BPF program isn't representative of production workloads.
It's hard to say to what extent the performance changes we observed here would affect production workloads.

BPF tail calls are most often used to tackle BPF complexity issues, which I'll cover in an upcoming blog post :-)

<br>

Thanks Céline and Quentin for the reviews!

<br>

[^33-tail-calls]: It looks like the maximum number of tail calls was intended to be 32, but ended up being 33 because of an off-by-one error. The few JIT compilers using a limit of 32 were later updated to 33 for compatibility and consistency.
[^duration-experiment]: On the slowest kernel versions, it took 4h to complete. The playbook runs the experiment for each kernel version in parallel on different machines.
[`ebf7d1f`]: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=ebf7d1f508a73871acf3b2bfbfa1323a477acdb3
[^bisect-variations]: Bisecting variations is very time consuming since you need to repeat each experiment many times. I did check that [`3193c08`] is not the culprit.
[`3193c08`]: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=3193c0836f203a91bef96d88c64cccf0be090d9c

<!--
# cat /proc/cpuinfo 
processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 77
model name	: Intel(R) Atom(TM) CPU  C2750  @ 2.40GHz
stepping	: 8
microcode	: 0x12d
cpu MHz		: 2600.105
cache size	: 1024 KB
physical id	: 0
siblings	: 8
core id		: 0
cpu cores	: 8
apicid		: 0
initial apicid	: 0
fpu		: yes
fpu_exception	: yes
cpuid level	: 11
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 cx16 xtpr pdcm sse4_1 sse4_2 movbe popcnt tsc_deadline_timer aes rdrand lahf_lm 3dnowprefetch cpuid_fault epb pti ibrs ibpb stibp tpr_shadow vnmi flexpriority ept vpid tsc_adjust smep erms dtherm ida arat md_clear
bugs		: cpu_meltdown spectre_v1 spectre_v2 mds msbds_only
bogomips	: 4800.19
clflush size	: 64
cache_alignment	: 64
address sizes	: 36 bits physical, 48 bits virtual
power management:
-->
