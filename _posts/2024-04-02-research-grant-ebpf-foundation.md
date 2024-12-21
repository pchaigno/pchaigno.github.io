---
layout: post
title: "Research Grant from the eBPF Foundation"
date: 2024-04-02 10:26:10 +0200
categories: ebpf
description: This post discusses the publication of the first grant dedicated to eBPF research, with a short introduction on the links between industry and academia in the eBPF community.
published: true
---

Last year, the first workshop entirely dedicated to eBPF was hosted by the SIGCOMM conference.
Today, I'm happy to share the first eBPF research grant, from the eBPF Foundation!

[ebpf.foundation/funding-opportunities](https://ebpf.foundation/funding-opportunities)
{: style="font-size: 110%; text-align: center;"}

Despite being developed and maintained in large part by industry, eBPF has always had strong ties with the academic community.
The eBPF ancestor, [cBPF](https://www.tcpdump.org/papers/bpf-usenix93.pdf), was first published at Usenix Winter 1993.
Subsequent work on eBPF, such as [XDP](https://raw.githubusercontent.com/tohojo/xdp-paper/master/xdp-the-express-data-path.pdf) or [PREVAIL](/ebpf/2023/09/06/prevail-understanding-the-windows-ebpf-verifier.html), was also published at top academic conferences, often in the context of industry-academia partnerships.
In addition, on multiple occasions, Alexei Starovoitov stated his goal to build eBPF as an enabler for innovation.
I believe this was always well understood by the academic community, with papers at top conferences regularly building on eBPF[^building-on-ebpf].

This new grant comes as a $25–50k unrestricted gift and can for instance be used to cover part of a PhD student's salary.
I hope it will serve as an additional incentive for the kernel and academic communities to collaborate.
I'm a strong believer that the kernel community would benefit from further research on eBPF and its verifier, particularly in formal verification, static analysis, and compiler theory.

Thanks a lot to Daniel Borkmann and Bill Mulligan for setting this up!

<br>

[^building-on-ebpf]: The [Hyperupcalls](https://www.usenix.org/system/files/conference/atc18/atc18-amit.pdf) (ATC'18), [hXDP](/ebpf/2020/11/04/hxdp-efficient-software-packet-processing-on-fpga-nics.html) (OSDI'20), [BMC](/ebpf/2021/04/12/bmc-accelerating-memcached-using-bpf-and-xdp.html) (NSDI'21), and [Tigger](https://www.vldb.org/pvldb/vol16/p3335-butrovich.pdf) (VLDB'23) papers come to mind, among many others.
