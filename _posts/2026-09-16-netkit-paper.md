---
layout: post
title: "netkit: Specializing Linux Packet Delivery for Container Networks"
date: 2026-09-22 10:26:10 +0200
categories: ebpf
description: This post summarizes our netkit paper from the eBPF'26 workshop at ACM SOSP. The netkit paper proposes an eBPF-based datapath to specialize the Linux networking stack and eliminate redundant backlog queue traversals during network namespace transitions.*
image: /assets/netkit/netkit-packet-paths.png
published: true
---

Next week at [the fourth eBPF workshop](https://ebpf.github.io/2026/), I will present our paper on *netkit* we wrote with [Daniel](http://www.borkmann.ch/).
In this paper, we show how the netkit devices and the ``bpf_redirect_peer`` helper can help tailor the Linux datapath for containers.
This blog post is a summary of [the paper](https://arxiv.org/pdf/2609.18633).

### Motivation

In this paper, we're interested in the overhead when traversing network namespaces in container networks.
In a first evaluation, we measured the throughput between two containers, in the same host and over the wire, using netperf's ``TCP_CRR``, a good test to stress the networking stack.
We then ran the same tests without containers and compared.
The results are striking:

> Two processes in the same network namespace achieve 31% higher throughput than two containers on the same host.
> Likewise, two hosts achieve 26% higher throughput than two containers communicating over the wire.

When not using containers, when everything runs in the host network namespace, we achieve 26–31% higher throughput!

> The persistence of this overhead is particularly striking when considering the nature of network namespace switches.
> Intuitively, transitions between network namespaces should not incur any performance penalty, as they represent logical rather than physical boundaries.

Although this overhead is well known, there's no fundamental reason it should exist.
So why does it?

In Linux, received packets may go through a per-CPU backlog queue, where they are buffered before being processed by the upper networking stack, as illustrated with a zigzag symbol on the diagram below.
For example, when Receive Packet Steering (RPS) is enabled, this allows distributing the processing load across cores, as explained in [the Linux docs](https://www.kernel.org/doc/html/v6.18/networking/scaling.html).
Most of the time though, RPS is disabled in favor of RSS, and packets coming from physical devices do not go through the backlog queue.

{:refdef: style="text-align: center;"}
<img src="/assets/netkit/linux-networking-stack.png" alt="Illustration of the usual TCP/IP networking stack and the main BPF networking hooks in Linux, on the receive side when traversing a backlog queue (illustrated with zigzags)." title="Illustration of the usual TCP/IP networking stack and the main BPF networking hooks in Linux, on the receive side when traversing a backlog queue (illustrated with zigzags)." style="width: 40%;"/>
{: refdef}

For Virtual Ethernet (veth) devices however, all packets go through the backlog queue:

> veth devices operate as interconnected pairs, with one device residing in the container's network namespace and the other in the host namespace.
> When a packet is transmitted from the container, it is received by the host device and enqueued to the per-CPU backlog queue of the target CPU for processing

As a result, container communications incur a lot of backlog queue traversals.
The figure below shows all of these traversals with zigzag symbols.
On the path inside the same host (2), and on the path over the wire (3)+(1), packets go through the backlog queues twice, at the veth pairs for the source and destination containers.

{:refdef: style="text-align: center;"}
<img src="/assets/netkit/vanilla-packet-paths.png" alt="Container-to-container packet paths through the Linux stack and veth device pairs, on a single host (path 2) and over the wire (paths 3 and 1)." title="Container-to-container packet paths through the Linux stack and veth device pairs, on a single host (path 2) and over the wire (paths 3 and 1)." style="width: 60%;"/>
{: refdef}

<br/>

### Elimination of Backlog Queue Traversals

The paper discusses how we eliminated most of these backlog queue traversals in [Cilium](https://cilium.io).
We first explain how we skip the backlog queue on path (1), from the physical device to the destination container.

> The core intuition behind netkit's first optimization is that the receive-side code path of the physical device is functionally identical to the code path executed after the backlog queue of the veth device inside the container, albeit in a different network namespace.

The logic that is executed for the upper networking stack when ingressing into the physical device or into the container's veth device is the same.
In the former case, it runs in the host network namespace; in the latter case, in the container's network namespace.
We can therefore skip the backlog queue on path (1) by switching the packet's current network namespace to that of the container and recirculating the packet through the upper stack logic.
We implement this redirect through the namespace boundary with a new BPF helper, ``bpf_redirect_peer``, [contributed to Linux v5.10 by Daniel](https://git.kernel.org/pub/scm/linux/kernel/git/bpf/bpf-next.git/commit/?id=9aa1206e8f48).

Bypassing the backlog queues when leaving the containers, as shown on paths (2) and (3), is a little trickier.
The backlog queue traversal happens very early on the host-side of the veth pair.
Ideally, to bypass it, we would need a BPF program inside the container's network namespace to perform the usual redirects.
That however has several downsides:

> Such a program may not only conflict with the application's own BPF programs, but it could also be unloaded by the application. [...]
> In addition, a BPF program running in the network namespace of the container would have no access to information in the host namespace, such as the routing table.

These challenges motivated the creation of a new type of Linux device pair, netkit devices, to replace the usual veth devices.
netkit devices can have multiple BPF programs attached without needing to setup tc qdics and filters.
Daniel upstreamed this new device type [in Linux v6.7](https://git.kernel.org/pub/scm/linux/kernel/git/bpf/bpf-next.git/commit/?id=35dfaad7188c).

Unlike veth devices, the two devices in a netkit pair are not interchangeable: one is the peer device, the other the primary device.
The peer device is meant for the container's network namespace and its BPF program can only be managed through the primary device.
This design ensures that applications inside the container cannot detach the BPF programs.

BPF programs attached to netkit devices are executed as part of the driver's logic on the transmit path, immediately after the network namespace switch.
As a result, a BPF program attached to the netkit device inside the container will run in the host network namespace and have access to its routing table and other information.

{:refdef: style="text-align: center;"}
<img src="/assets/netkit/netkit-packet-paths.png" alt="Container-to-container packet paths using BPF redirects and netkit device pairs, on a single host (path 2) and over the wire (paths 3 and 1)." title="Container-to-container packet paths using BPF redirects and netkit device pairs, on a single host (path 2) and over the wire (paths 3 and 1)." style="width: 60%;"/>
{: refdef}

The above diagram shows the packet paths when using both ``bpf_redirect_peer`` and netkit devices (as done in Cilium).
By leveraging the netkit devices, we can optimize paths (2) and (3) and bypass the backlog queues.
Using a BPF program attached to the netkit device inside the containers, we can redirect packets to either the destination container's (path (2)) or the native device (path (3)).
As noted in the paper:

> We don't need [to use ``bpf_redirect_peer``] here because netkit devices already execute their BPF programs after the namespace switch.

[The paper](https://arxiv.org/pdf/2609.18633) discusses other subtleties of the design that I won't detail here, such as why we don't rely on XDP, how this affects scheduler accounting, or why we need to keep the last backlog traversal.

<br/>

### Evaluations

For this short paper, we focused on a couple short benchmarks to evaluate the performance impact of netkit.
More specifically, we used netperf's ``TCP_RR`` and ``TCP_CRR`` tests.
The former is an indirect measure of latency as it tries to perform as many request-response transactions as possible.
The latter is similar but adds more stress on the networking stack (especially connection tracking) as it creates new TCP connections for each request-response.

In the evaluations, we compared Cilium v1.19.5 with and without netkit and ``bpf_redirect_peer`` enabled to a baseline setup where two processes communicate over the loopback device and over the wire.
[The paper](https://arxiv.org/pdf/2609.18633) has more details on Cilium's configuration, the hardware specs, and other relevant aspects of the setup.

{:refdef: style="text-align: center;"}
<img src="/assets/netkit/tcp_rr.png" alt="Transactions per second (TCP_RR benchmark) between hosts, between containers connected with veth, and between containers connected with netkit, on the same host and across the wire. When using containers, they are connected with Cilium." title="Transactions per second (TCP_RR benchmark) between hosts, between containers connected with veth, and between containers connected with netkit, on the same host and across the wire. When using containers, they are connected with Cilium." style="width: 49%;"/>
<img src="/assets/netkit/tcp_crr.png" alt="Connections per second (TCP_CRR benchmark) between hosts, between containers connected with veth, and between containers connected with netkit. When using containers, they are connected with Cilium." title="Connections per second (TCP_CRR benchmark) between hosts, between containers connected with veth, and between containers connected with netkit. When using containers, they are connected with Cilium." style="width: 49%;"/>
{: refdef}

As we can see, the results are very similar for ``TCP_RR`` and ``TCP_CRR``, with ``TCP_RR`` expectedly performing better.
In both cases, netkit is able to gain back the performance lost from using containers: with netkit enabled, Cilium has the same performance as host networking.

To get the full picture, we also looked at the impact on CPU consumption.
We measured the CPU consumption at the receiver (sender side has similar observations) for tests over the wire, and normalized it to the same throughput for all cases.

{:refdef: style="text-align: center;"}
<img src="/assets/netkit/cpu.png" alt="Normalized CPU consumption at the receiver for the TCP_RR and TCP_CRR netperf tests over the wire, with containers connected by Cilium, connected by Cilium and netkit, and without containers." title="Normalized CPU consumption at the receiver for the TCP_RR and TCP_CRR netperf tests over the wire, with containers connected by Cilium, connected by Cilium and netkit, and without containers." style="width: 55%;"/>
{: refdef}

For the ``TCP_RR`` test, Cilium with netkit does as well as Host networking.
And for the ``TCP_CRR`` test, it does even better!
In the Host networking case, all packets have to go through Linux conntrack on the host.
With ``TCP_CRR``, this conntrack logic accounts for a non negligible part of the overhead.
When using netkit, this logic is skipped and the overhead therefore decreases.

<br/>

### Conclusion

The improvements described in this paper can be enabled in Cilium with ``bpf.hostLegacyRouting=false`` and ``bpf.datapathMode=netkit``[^cilium-tuning-guide].
In addition, several large companies[^netkit-users] have started using netkit devices in production with significant performance gains.

We hope this paper will raise awareness of netkit within the research community and encourage new research in this area.
The netkit devices are already being used in new contexts to accelerate [software RDMA](https://netdevconf.info/0x1A/sessions/talk/accelerating-software-rdma-rxe-with-netkit-and-devmem.html) and [KubeVirt (via AF_XDP)](https://lpc.events/event/19/contributions/2275/).

[Our paper is available on arXiv](https://arxiv.org/pdf/2609.18633) and you can cite it with:
```bib
@inproceedings{netkit,
  author = {Borkmann, Daniel and Chaignon, Paul},
  title = {Netkit: Specializing Linux Packet Delivery for Container Networks},
  year = {2026},
  url = {https://doi.org/10.1145/3837779.3838164},
  booktitle = {Proceedings of the 4th Workshop on eBPF and Kernel Extensions},
  series = {eBPF'26}
}
```

<br/>

[^cilium-tuning-guide]: These Helm values have dependencies on other Cilium features and on kernel versions, so be sure to check Cilium's documentation and [its tuning guide](https://docs.cilium.io/en/latest/operations/performance/tuning/).
[^netkit-users]: In [a talk at FOSDEM'25](https://archive.fosdem.org/2025/schedule/event/fosdem-2025-4045-an-introduction-to-netkit-the-bpf-programmable-network-device/), Mike Willard described how Meta uses netkit for its containers. Chen Tang and Feng Zhou also gave [a talk at the eBPF Summit 2024](https://www.youtube.com/watch?v=0w788CqTp0c&list=PLDg_GiBbAx-m7yn_FYcc41PNrgtxlISBK&index=9) on how it's used inside ByteDance.
