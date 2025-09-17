---
layout: post
title: "Third eBPF Workshop"
date: 2025-09-17 10:26:10 +0200
categories: ebpf
description: This post presents the material (papers and presentation slides) from the third edition of the eBPF workshop at ACM SIGCOMM 2025.
published: true
---

<script>
jqueryReady(function() {
	$('.abstract-dropdown').click(function() {
		$(this).parent().find('blockquote').toggle();
		return false;
	});
})
</script>

Last week, the SIGCOMM conference hosted the third edition of the eBPF workshop in Coimbra.
The SIGCOMM website has [links to the papers](https://conferences.sigcomm.org/sigcomm/2025/workshop/papers-workshop-info/), but cannot link to the presentation slides, so I'm writing this short blog post just to have everything in one place.
<br/><br/>

<div id="papers">

<div class="paper">
<h4>uXDP: Frictionless XDP Deployments in Userspace</h4>
<span class="authors">Yusheng Zheng (UC Santa Cruz), Panayiotis Gavriil (The D. E. Shaw Group), Marios Kogias (Imperial College London)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748360" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1xrGEn8AYAfqRt8hh2uCSJCnN0B_no96l" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Modern network function (NF) deployments face a fundamental trade-off: kernel-based extended Berkeley Packet Filter (eBPF) NFs provide safety, portability, and an extensive tooling ecosystem, but are limited in performance, while kernel-bypass frameworks deliver high throughput but lack integrated verification and ease of deployment. We present uXDP, a new runtime that unifies these worlds by running unmodified, verified XDP programs in userspace. uXDP ensures compatibility and preserves the verification-driven safety, portability, and familiar workflows of eBPF while moving execution into the userspace, enabling more aggressive optimizations and flexibility. Without recompiling eBPF code, uXDP achieves throughput gains of up to 3.3× over in-kernel execution and improves Meta's Katran load balancer performance by 40%, all while retaining the trusted eBPF development model and deployment simplicity.</blockquote>
<br />
</div>

<div class="paper">
<h4>No Two Snowflakes Are Alike: Studying eBPF Libraries' Performance, Fidelity and Resource Usage</h4>
<span class="authors">Carlos Machado, Bruno Gião (INESC TEC & U. Minho), Sebastião Amaro, Miguel Matos (IST Lisbon & INESC-ID), João Paulo, Tânia Esteves (INESC TEC & U. Minho)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748364" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1HpOKxNvEFhHlCwtnkA8lNs8jmukIGVQJ" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">As different eBPF libraries keep emerging, developers are left with the hard task of choosing the right one. Until now, this choice has been based on functional requirements (e.g., programming language support, development workflow), while quantitative metrics have been left out of the equation. In this paper, we argue that efficiency metrics such as performance, resource usage, and data collection fidelity also need to be considered for making an informed decision. We show it through an experimental study comparing five popular libraries: bpftrace, BCC, libbpf, ebpf-go, and Aya. For each, we implement three representative eBPF-based tools and evaluate them under different storage I/O workloads. Our results show that each library has its own strengths and weaknesses, as their specific features lead to distinct trade-offs across the selected efficiency metrics. These results further motivate experimental studies to increase the community's understanding of the eBPF ecosystem.</blockquote>
<br />
</div>

<div class="paper">
<h4>Performance Implications at the Intersection of AF_XDP and Programmable NICs</h4>
<span class="authors">Marco Molè, Farbod Shahinfar, Francesco Maria Tranquillo, Davide Zoni (Politecnico di Milano), Aurojit Panda (NYU), Gianni Antichi (Politecnico di Milano)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748359" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1Ec4Ycd_JMVZyFfcyewtkS0rpCMYoB-Hf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">AF_XDP is emerging as an easier way to implement zero-copy network bypass applications. This is because it allows mixed-mode deployments, where zero-copy and socket-based applications share the same NIC. However, AF_XDP relies on NIC hardware and driver features, but implementing these features on programmable NICs adds resource overheads and increases development complexity and thus might not be desirable. To address this, we examine the feasibility of using eBPF based kernel extensibility to implement the required features, and report on the tradeoff between an eBPF and a native NIC implementation. Our analysis involved updating the OpenNIC driver to support the loading of eBPF/XDP programs and zero-copy AF_XDP. Our implementation is of independent interest because it makes it easier to develop and evaluate alternate designs for mixed-mode zero-copy deployments, and new NIC accelerated applications. Our implementation is open-sourced.</blockquote>
<br />
</div>

<div class="paper">
<h4>Toward eBPF-Accelerated Pub-Sub Systems</h4>
<span class="authors">Beihao Zhou, Samer Al-Kiswany, Mina Tahmasbi Arashloo (University of Waterloo)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748365" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1GIUFAJ7HQzkQma-twqanw2otmpuypoX_" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Publish-subscribe (pub-sub) systems are a fundamental building block for real-time distributed applications, where high throughput and low latency are critical. Existing brokers can suffer performance bottlenecks as they operate in user space and rely on the socket API and full kernel stack traversal for every message. We present BPF-Broker, a novel pub-sub broker that leverages eBPF to accelerate message dissemination by decoupling the broker's control and data paths. Subscriber management is handled in user space, while message forwarding is done early in the kernel using the TC ingress and XDP hooks. Our evaluation shows that BPF-Broker achieves up to 3× higher throughput compared to our Socket-based baseline broker under high subscriber counts, and up to 2-10× lower end-to-end latency. These results highlight the potential of eBPF in accelerating pub-sub systems.</blockquote>
<br />
</div>

<div class="paper">
<h4>A Memory Pool Allocator for eBPF Applications</h4>
<span class="authors">Gyuyeong Kim (Sungshin Women's University), Dongsu Han (KAIST)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748370" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1iOxo9OS0ostBq5mUmnjqel3KpuTfN6l1" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">eBPF enables high-performance kernel-level execution by eliminating networking stack traversal and context switching. Despite the advantages, eBPF applications face strict memory management constraints due to the eBPF verifier requirements that mandate static memory allocation. This limitation imposes a fundamental tradeoff between application performance and memory efficiency, ultimately restricting the potential of eBPF. We present Kerby, a dynamic memory pool allocator for eBPF that enables eBPF applications to dynamically manage pre-allocated memory by representing variable-length data as collections of fixed-size blocks. This allows applications to increase the amount of kernel-resident data while minimizing internal fragmentation. Our preliminary evaluation with key-value store implementations demonstrates that Kerby achieves significant improvements in both memory utilization and throughput.</blockquote>
<br />
</div>

<div class="paper">
<h4>SchedBPF - Scheduling BPF programs</h4>
<span class="authors">Kavya Shekar, Dan Williams (Virginia Tech)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748366" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/15IJ0XNkNIeNnMiKiCcUaWMohiX9BDcGj" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">The Linux BPF framework enables the execution of verified custom bytecode in the critical path of various Linux kernel routines, allowing for efficient in-kernel extensions. The safety properties and low execution overhead of BPF programs have led to advancements in kernel extension use-cases that can be broadly categorized into tracing, custom kernel policies, and application acceleration. However, BPF is fundamentally event-driven and lacks native support for periodic or continuous tasks such as background tracing, metric aggregation, or kernel housekeeping. Existing approaches such as kernel modules with kthreads, userspace daemons, or BPF timers fail to satisfy all the essential requirements for periodic kernel extensions such as fine-grained CPU control, kernel safety, and minimal overhead. To address this gap, we propose SchedBPF --- a conceptual framework that enables periodic execution of BPF programs on kernel threads. SchedBPF program executions are sandboxed and preemptible, as governed by the existing BPF verifier and JIT engine. They also adopt time-slice semantics, cgroup-style CPU quotas, and nice-level priority control, similar to kernel threads. SchedBPF aims to enable low-overhead, periodic execution of safe BPF code with fine-grained CPU resource management.</blockquote>
<br />
</div>

<div class="paper">
<h4>ChainIO: Bridging Disk and Network Domains with eBPF</h4>
<span class="authors">Zheng Cao, He Xuhang (UC Merced), Yanpeng Hu (ShanghaiTech University), Yusheng Zheng, Yiwei Yang (UC Santa Cruz), Jianchang Su, Wei Zhang (University of Connecticut), Andi Quinn (UC Santa Cruz)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748371" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1Xh24x8qTNTVjMrelVHItCFUfFejFGToq" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Modern data-driven services from analytical databases and key-value stores to stream processors suffer high tail-latencies because each disk read and subsequent packet send/recv incurs a separate user-kernel crossing and redundant buffer copy. While Linux's io_uring now supports both block and socket I/O with asynchronous, batched submissions, it does not provide zero-copy transfers between storage and network domains; AF_XDP delivers high-performance packet I/O but is siloed to the network stack. No existing framework transparently unifies these mechanisms end-to-end. We present ChainIO, an eBPF-based system that intercepts and rewrites I/O syscalls, uses ring buffers to pass data descriptors directly between io_uring and AF_XDP, and orchestrates in-kernel execution to chain disk reads into network sends (and vice versa) with full POSIX semantics, fallback safety for unsupported cases, and zero application changes. Our prototype works with unmodified binaries and improves ClickHouse's TPC-H query throughput by up to 39%. ChainIO thus offers a general, safe, and high-performance path for cross-domain I/O optimization in diverse data-intensive workloads.</blockquote>
<br />
</div>

<div class="paper">
<h4>bpfCP: Efficient and Extensible Process Checkpointing via eBPF</h4>
<span class="authors">Juntong Deng (King's College London), Stephen Kell (King's College London)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748373" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1S7VHoJMSCiUNZ01I6yjn_T7Qd5tHqW2J" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Live migration, snapshotting, and accelerated startup of applications or containers have long been implemented using checkpoint and restore primitives. To save or 'checkpoint', it is necessary to dump not only its userspace state, but also a large amount of state in the kernel. The current widely used implementation on Linux relies heavily on the /proc file system and special system call interfaces, but these suffer from poor performance and lack extensibility. In this paper, we propose bpfCP, a process checkpointing scheme that dumps in-kernel state via eBPF programs, which improves performance and extensibility. Our preliminary evaluation shows that bpfCP can achieve significant performance improvements in dumping multiple types of in-kernel state of processes.</blockquote>
<br />
</div>

<div class="paper">
<h4>Automatic Synthesis of Abstract Operators for eBPF</h4>
<span class="authors">Harishankar Vishwanathan, Matan Shachnai, Srinivas Narayana, Santosh Nagarakatte (Rutgers University)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748361" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1BbMrdjV7h4XZ_clO_FqqG6OPUC9No9EA" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">This paper proposes an approach to automatically synthesize sound and precise abstract operators for the static analyzer in the eBPF verifier. The eBPF verifier ensures that only safe user-defined programs are loaded into the kernel. An unsound operator can lead to unsafe programs being accepted, while an imprecise operator can cause safe programs to be rejected. Our approach starts by generating candidate operators using input-output examples tailored for the eBPF verifier's abstract operators and iteratively refines it for soundness and precision. Using this approach, we have generated more precise variants of existing operators. Our approach also generates numerous sound and unsound operators that can serve as test suites for existing eBPF verification and fuzzing frameworks.</blockquote>
<br />
</div>

<div class="paper">
<h4>Pairwise BPF Programs Should Be Optimized Together</h4>
<span class="authors">Milo Craun, Dan Williams (Virginia Tech)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748362" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1Li0O9MDSuuvRF3NFezzvtNU-2HSXgJYB" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">BPF programs are extensively used for tracing and observability in production systems where performance overheads matter. Many individual BPF programs do not incur serious performance degrading overhead on their own, but increasingly more than a single BPF program is used to understand production system performance. BPF deployments have begun to look more like distributed applications; however, this is a mismatch with the underlying Linux kernel, potentially leading to high overhead cost. In particular, we identify that many BPF programs follow a pattern based on pairwise program deployment where entry and exit probes will be attached to measure a single quantity. We find that the pairwise BPF program pattern results in unnecessary overheads. We identify three optimizations---BPF program inlining, context aware optimization, and intermediate state internalization---that apply to pairwise BPF programs. We show that applying these optimizations to an example pairwise BPF program can reduce overhead on random read throughput from 28.13% to 8.98% and on random write throughput from 26.97% to 8.60%. We then examine some key design questions that arise when seeking to integrate optimizations with the existing BPF system.</blockquote>
<br />
</div>

<div class="paper">
<h4>Kernel Extension DSLs Should Be Verifier-Safe!</h4>
<span class="authors">Franco Solleza, Justus Adam, Akshay Narayan, Malte Schwarzkopf (Brown University), Andrew Crotty (Northwestern University), Nesime Tatbul (Intel Labs and MIT)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748368" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1zmL2l_oSqL73kmACr25FP5AByQx4b3b2" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">eBPF allows developers to write safe operating system extensions, but writing these extensions remains challenging because it requires detailed knowledge of both the extension's domain and eBPF's programming interface. Most importantly, the extension must pass the eBPF verifier. This paper argues that DSLs for extensions should guarantee verifier-safety: valid DSL programs should result in eBPF code that always passes the verifier. This avoids complex debugging and the need for extension developers to be eBPF experts. We show that three existing DSLs for different domains are compatible with verifier-safety. Beyond verifier-safety, practical extension DSLs must also achieve good performance. Inspired by database query optimization, we sketch an approach to creating DSL-specific optimizers capable of maintaining verifier-safety. A preliminary evaluation shows that optimizing verifier-safe extension performance is feasible.</blockquote>
<br />
</div>

<div class="paper">
<h4>Offloading the Tedious Task of Writing eBPF Programs</h4>
<span class="authors">Xiangyu Gao, Xiangfeng Zhu (University of Washington), Bhavana Vannarth Shobhana (Rutgers University), Yiwei Yang (UC Santa Cruz), Arvind Krishnamurthy, Ratul Mahajan (University of Washington)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748369" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1CfV8BK53ZGBR9fdyONYQHDbP_2cET4cZ" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">eBPF offers a lightweight method to extend the Linux kernel without modifying the source code in existing modules. However, writing correct and efficient eBPF programs is hard due to its unique verifier constraints and cumbersome debugging processes specific to the kernel execution environment. To tackle such an obstacle, we present a system, SimpleBPF, aiming at offloading the tedious eBPF development task. Developers only need to express their intent in a high-level domain-specific language, while the underlying eBPF code generation is handled automatically. SimpleBPF integrates four key components: a concise DSL, an LLM-based generator, a semantic checker, and an LLM-based optimizer. We use few-shot prompting to build both the code generator and optimizer in SimpleBPF, and evaluate the system on programs written in a representative DSL. The preliminary evaluation result shows that SimpleBPF can generate valid eBPF programs that pass the kernel verifier and exhibit competitive runtime performance. We also outline future directions based on current findings.</blockquote>
<br />
</div>

<div class="paper">
<h4>Empowering machine-learning assisted kernel decisions with eBPF^ML</h4>
<span class="authors">Prabhpreet Singh Sodhi, Georgios Liargkovas, Kostis Kaffes (Columbia University)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748363" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1vQYckf00_sgAMjM__yner1tDs93E_6Y1" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Machine-learning (ML) techniques can optimize core operating system paths---scheduling, I/O, power, and memory---yet practical deployments remain rare. Existing prototypes either (i) bake simple heuristics directly into the kernel or (ii) off-load inference to user space to exploit discrete accelerators, both of which incur unacceptable engineering or latency cost. We argue that eBPF, the Linux kernel's safe, hot-swappable byte-code runtime, is the missing substrate for moderately complex in-kernel ML. We present eBPFML, a design that (1) extends the eBPF instruction set with matrix-multiply helpers, (2) leverages upcoming CPU matrix engines such as Intel Advanced Matrix Extensions (AMX) through the eBPF JIT, and (3) retains verifier guarantees and CO-RE portability.</blockquote>
<br />
</div>

<div class="paper">
<h4>eInfer: Unlocking Fine-Grained Tracing for Distributed LLM Inference with eBPF</h4>
<span class="authors">Kexin Chu, Jianchang Su, Yifan Zhang (University of Connecticut), Chenxingyu Zhao (University of Washington), Yiwei Yang, Yusheng Zheng (UC Santa Cruz), Shengkai Lin, Shizhen Zhao (Shanghai Jiao Tong University), Wei Zhang (University of Connecticut)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748372" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1TOEShd7LJjyk0uLxwhw0FNX_xKxwuo1c" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">Modern large language model (LLM) inference workloads run on complex, heterogeneous distributed systems spanning CPUs, GPUs, multi-GPU setups, and network interconnects. Existing profiling tools either incur prohibitive overhead, provide limited visibility, or suffer from vendor lock-in, making real-time, fine-grained performance analysis impractical in production environments. We present eInfer, the first eBPF-based system enabling transparent, low-overhead end-to-end tracing of per-request performance across distributed LLM inference pipelines without requiring application modifications. eInfer uniquely correlates events across CPUs, accelerators, processes, and nodes, delivering unified, vendor-agnostic observability that approaches the accuracy of specialized GPU profiling tools. To address the challenges of scalability dynamic workloads, and instrumentation gaps on accelerators, we design a runtime-adaptive tracing mechanism that maintains comprehensive visibility in real time. Our initial evaluation demonstrates that eInfer delivers precise, low-overhead profiling, enabling critical insights to optimize LLM serving performance in production environments.</blockquote>
<br />
</div>

<div class="paper">
<h4>InXpect: Lightweight XDP Profiling</h4>
<span class="authors">Vladimiro Paschali, Andrea Monterubbiano, Francesco Fazzari (University of Rome "La Sapienza"), Michael Swift (University of Wisconsin—Madison), Salvatore Pontarelli (University of Rome "La Sapienza")</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748367" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1qsBSaMQPW3L3xBSgJfYqcLGKGNXjLoqf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">The eBPF eXpress Data Path (XDP) allows high-speed packet processing applications. Achieving high throughput requires careful design and profiling of XDP applications. However, existing profiling tools lack eBPF support. We introduce InXpect, a lightweight monitoring framework that profiles eBPF programs with fine granularity and minimal overhead, making it suitable for XDP-based in-production systems. We demonstrate how InXpect outperforms existing tools in profiling overhead and capabilities. InXpect is the first XDP/eBPF profiling system that provides real-time statistics streaming, enabling immediate detection of changes in program behavior.</blockquote>
<br />
</div>

<div class="paper">
<h4>BPFflow - Preventing information leaks from eBPF</h4>
<span class="authors">Chinecherem Dimobi, Rahul Tiwari, Zhengjie Ji, Dan Williams (Virginia Tech)</span><br />
<a href="https://dl.acm.org/doi/pdf/10.1145/3748355.3748374" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://drive.google.com/file/d/1B9tlw9ShgaWBGurTtayx37zkpHr-I676" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br />
<blockquote style="display:none;">eBPF has seen major industry adoption by enterprises to enhance observability, tracing, and monitoring by hooking at different points in the kernel. However, since the kernel is a critical resource, eBPF can also pose as a threat if misused, potentially leading to privilege escalation, information leaks and more. While effective to some extent, existing mitigation strategies like interface filtering are coarse-grained and often over-restrictive. We propose BPFflow, a flexible framework for the system administrator to define policies that specify sensitive data sources, trusted sinks and permitted flows between them. These policies are enforced by an Information Flow Control (IFC) system within the eBPF verifier to track the propagation of sensitive data to prevent unauthorized leakage to userspace or any other untrusted sinks without any runtime overhead.</blockquote>
<br />
</div>

</div>
