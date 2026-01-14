---
layout: post
title: "eBPF Workshops"
date: 2025-09-17 10:26:10 +0200
last_modified_at: 2026-01-14 12:31:00 +0200
categories: ebpf
description: This post presents the material (papers and presentation slides) from the three editions of the eBPF workshop at ACM SIGCOMM, from 2023 to 2025.
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

<!-- {% raw %} -->
<ul id="toc" class="section-nav">
<li class="toc-entry toc-h3"><a href="#ebpf25-third-edition">eBPF'25: Third Edition</a></li>
<li class="toc-entry toc-h3"><a href="#ebpf24-second-edition">eBPF'24: Second Edition</a></li>
<li class="toc-entry toc-h3"><a href="#ebpf23-first-edition">eBPF'23: First Edition</a></li>
</ul>
<!-- {% endraw %}) -->

<br/>

### eBPF'25: Third Edition

<div class="papers">

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
<blockquote style="display:none;">The Linux BPF framework enables the execution of verified custom bytecode in the critical path of various Linux kernel routines, allowing for efficient in-kernel extensions. The safety properties and low execution overhead of BPF programs have led to advancements in kernel extension use-cases that can be broadly categorized into tracing, custom kernel policies, and application acceleration. However, BPF is fundamentally event-driven and lacks native support for periodic or continuous tasks such as background tracing, metric aggregation, or kernel housekeeping. Existing approaches such as kernel modules with kthreads, userspace daemons, or BPF timers fail to satisfy all the essential requirements for periodic kernel extensions such as fine-grained CPU control, kernel safety, and minimal overhead. To address this gap, we propose SchedBPF—a conceptual framework that enables periodic execution of BPF programs on kernel threads. SchedBPF program executions are sandboxed and preemptible, as governed by the existing BPF verifier and JIT engine. They also adopt time-slice semantics, cgroup-style CPU quotas, and nice-level priority control, similar to kernel threads. SchedBPF aims to enable low-overhead, periodic execution of safe BPF code with fine-grained CPU resource management.</blockquote>
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
<blockquote style="display:none;">BPF programs are extensively used for tracing and observability in production systems where performance overheads matter. Many individual BPF programs do not incur serious performance degrading overhead on their own, but increasingly more than a single BPF program is used to understand production system performance. BPF deployments have begun to look more like distributed applications; however, this is a mismatch with the underlying Linux kernel, potentially leading to high overhead cost. In particular, we identify that many BPF programs follow a pattern based on pairwise program deployment where entry and exit probes will be attached to measure a single quantity. We find that the pairwise BPF program pattern results in unnecessary overheads. We identify three optimizations—BPF program inlining, context aware optimization, and intermediate state internalization—that apply to pairwise BPF programs. We show that applying these optimizations to an example pairwise BPF program can reduce overhead on random read throughput from 28.13% to 8.98% and on random write throughput from 26.97% to 8.60%. We then examine some key design questions that arise when seeking to integrate optimizations with the existing BPF system.</blockquote>
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
<blockquote style="display:none;">Machine-learning (ML) techniques can optimize core operating system paths—scheduling, I/O, power, and memory—yet practical deployments remain rare. Existing prototypes either (i) bake simple heuristics directly into the kernel or (ii) off-load inference to user space to exploit discrete accelerators, both of which incur unacceptable engineering or latency cost. We argue that eBPF, the Linux kernel's safe, hot-swappable byte-code runtime, is the missing substrate for moderately complex in-kernel ML. We present eBPFML, a design that (1) extends the eBPF instruction set with matrix-multiply helpers, (2) leverages upcoming CPU matrix engines such as Intel Advanced Matrix Extensions (AMX) through the eBPF JIT, and (3) retains verifier guarantees and CO-RE portability.</blockquote>
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
<br/>



### eBPF'24: Second Edition

<div class="papers">

<div class="paper">
<h4>An Empirical Study on Challenges of eBPF Application Development</h4>
<span class="authors">Mugdha Deokar, Jingyang Men, Lucas Castanheira, Ayush Bhardwaj, Theophilus A. Benson</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673429" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-deokar.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">eBPF has become a crucial tool for the development of specialized and customized network functions, observability frameworks, and security tools. To support these growing use cases, the eBPF ecosystem (i.e., tool chains, set of language primitives, and kernel interfaces) has evolved at an extremely fast pace. Despite its rapid evolution, as a community, we understand very little about the challenges faced by developers in designing eBPF programs or the issues that hamper operators in managing them. This study aims to shed light on these challenges by analyzing eBPF issues on Stack Overflow along several eBPF-specific dimensions. We make several interesting observations that call attention to under-explored areas of the eBPF ecosystem, as well as highlight interesting research directions.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Understanding Performance of eBPF Maps</h4>
<span class="authors">Chang Liu, Byungchul Tak, Long Wang</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673430" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">The Linux community has witnessed the rapid development of eBPF technology that allows users to load custom programs into the Linux kernel to extend its capabilities. A key feature that makes eBPF powerful is eBPF maps, which provide data storage and communication capabilities for eBPF programs. However, despite being widely used in eBPF programs, the performance of eBPF maps has received little attention. To understand the performance characteristics of eBPF maps, we conduct a comprehensive benchmark on them. The benchmark results demonstrate the access overhead of different types of eBPF maps and reveal the impact of various factors on the access overhead. By analyzing the benchmark results, we derive some implications for eBPF users to use eBPF maps more efficiently.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Kgent: Kernel Extensions Large Language Model Agent</h4>
<span class="authors">Yusheng Zheng, Yiwei Yang, Maolin Chen, Andrew Quinn</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673434" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-zheng.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">The extended Berkeley Packet Filters (eBPF) ecosystem allows for the extension of Linux and Windows kernels, but writing eBPF programs is challenging due to the required knowledge of OS internals and programming limitations enforced by the eBPF verifier. These limitations ensure that only expert kernel developers can extend their kernels, making it difficult for junior sys admins, patch makers, and DevOps personnel to maintain extensions. This paper presents Kgent, an alternative framework that alleviates the difficulty of writing an eBPF program by allowing Kernel Extensions to be written in Natural language. Kgent uses recent advances in large language models (LLMs) to synthesize an eBPF program given a user's English language prompt. To ensure that LLM's output is semantically equivalent to the user's prompt, Kgent employs a combination of LLM-empowered program comprehension, symbolic execution, and a series of feedback loops. Kgent's key novelty is the combination of these techniques. In particular, the system uses symbolic execution in a novel structure that allows it to combine the results of program synthesis and program comprehension and build on the recent success that LLMs have shown for each of these tasks individually.
To evaluate Kgent, we develop a new corpus of natural language prompts for eBPF programs. We show that Kgent produces correct eBPF programs on 80%—which is an improvement of a factor of 2.67 compared to GPT-4 program synthesis baseline. Moreover, we find that Kgent very rarely synthesizes "false positive" eBPF programs—i.e., eBPF programs that Kgent verifies as correct but manual inspection reveals to be semantically incorrect for the input prompt. The code for Kgent is publicly accessible at https://github.com/eunomia-bpf/KEN.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Eliminating eBPF Tracing Overhead on Untraced Processes</h4>
<span class="authors">Milo Craun, Khizar Hussain, Uddhav Gautam, Zhengjie Ji, Tanuj Rao, Dan Williams</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673431" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-craun.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Current eBPF-based kernel extensions affect entire systems, and are coarse-grained. For some use cases, like tracing, operators are more interested in tracing a subset of processes (e.g., belonging to a container) rather than all processes. While overhead from tracing is expected for targeted processes, we find untraced processes—those that are not the target of tracing—also incur performance overhead. To better understand this overhead, we identify and explore three techniques for per-process filtering for eBPF: post-eBPF, in-eBPF, and pre-eBPF filtering, finding that all three approaches result in excessive overhead on untraced processes. Finally, we propose a system that allows for zero-untraced-overhead per-process eBPF tracing by modifying kernel virtual memory mappings to present per-process kernel views, effectively enabling untraced processes to execute on the kernel as if no eBPF programs are attached.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Honey for the Ice Bear - Dynamic eBPF in P4</h4>
<span class="authors">Manuel Simon, Henning Stubbe, Sebastian Gallenmüller, Georg Carle</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673436" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-simon.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Software updates typically require system reboots, leading to service downtimes. We aim to solve this problem for network components allowing updates while avoiding service degradation. In this paper, we explore the integration of eBPF into the P4 pipeline for efficient packet processing. This way, we combine the flexibility and dynamic adaptability of eBPF with the efficiency of P4. The integration enhances the power of applications and enables the network operator to provide customizable data paths as a service. Our solution allows updating the data path at runtime and without downtime. We implement the approach for the P4 target T4P4S, discuss different performance models, and share implementation insights. The evaluation focuses on the overhead in terms of throughput and the costs of code updates expressed in the latency of the related packets. We show that eBPF execution is possible with reasonable costs, promising dynamic network functions within P4.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Towards Functional Verification of eBPF Programs</h4>
<span class="authors">Dana Lu, Boxuan Tang, Michael Paper, Marios Kogias</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673435" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-lu.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">eBPF is being used to implement increasingly critical pieces of system logic. eBPF's verifier raises the cost of adoption of the technology, as making programs pass the verifier can be very effortful. We observe that the guarantees provided by the verifier have only been used for the narrow objective of verifying these programs' safety, despite them also enabling the automatic verification of program functional correctness. We envision a framework allowing developers to easily specify and automatically verify their eBPF programs with very little extra cost compared to simply passing the verifier.
We showcase our implementation of DRACO, built on top of KLEE. DRACO allows developers to fully or partially specify eBPF programs, add verification-time assert statements, and reason about multiple eBPF programs interacting with each other and userspace, all at minimal additional cost to the developers. We use DRACO to either fully or partially verify the correctness of several real-world or experimental XDP programs.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Unsafe Kernel Extension Composition via BPF Program Nesting</h4>
<span class="authors">Siddharth Chintamaneni, Sai Roop Somaraju, Dan Williams</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673440" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-chintamaneni.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">BPF programs provide the ability to extend the kernel while ensuring safety. The safety guarantees are provided by the in-kernel verifier. However, the verification guarantees may not hold when multiple BPF programs interact with each other through helper functions. This is because, while verifying a BPF program, the verifier considers each BPF program as an individual unit rather than part of a composite system. One aspect affected by this unsafe composition is the kernel stack. In this paper, we highlight how different possible nesting scenarios can affect the safety of the kernel stack. To address this problem, we propose a helper-rooted callgraph-based approach, which enables the verifier to have a global view of the system. By using the callgraph and maximum stack depth information during verification, the verifier will either accept or reject a program by considering all the possible nesting scenarios, which ensures runtime stack safety.</blockquote>
<br/>
</div>

<div class="paper">
<h4>µBPF: Using eBPF for Microcontroller Compartmentalization</h4>
<span class="authors">Szymon Kubica, Marios Kogias</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673433" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-kubica.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Although eBPF (Extended Berkeley Packet Filter) started as a virtualization technology used in the Linux kernel to allow for executing user code inside the kernel in a safe way, it is a general purpose software fault isolation technology. The specification of eBPF instruction set is, also, suitable for using it as a VM for low-end network-enabled embedded devices to achieve software isolation, compartmentalization and allow for updating deployed firmware over-the-air. Existing solutions for running eBPF programs on microcontrollers use bytecode interpreters which incurs execution time and code size overhead compared to native code execution. Additionally, they don't support data relocations which limits the space of programs that can be executed. We implement μBPF - an eBPF virtual machine and a JIT compiler targeting ARMv7-eM architecture. μBPF is compatible with embedded operating systems capable of supporting SUIT firmware update protocol. We implement a secure program deployment pipeline for RIOT - an operating system commonly used in embedded IoT applications. Our evaluation shows that μBPF JIT achieves close-to-native performance and up to of 50% code size reduction compared to the eBPF binaries.</blockquote>
<br/>
</div>

<div class="paper">
<h4>BOAD: Optimizing Distributed Communication with In-Kernel Broadcast and Aggregation</h4>
<span class="authors">Jianchang Su, Yifan Zhang, Linpu Huang, Wei Zhang</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673438" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-su.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Efficient communication is crucial for the performance of big data and distributed computing systems. Two key communication patterns in these systems are broadcasting, which involves sending data from one to multiple nodes, and aggregation, which combines data from multiple nodes into a single result. Traditional methods using socket-based communication often suffer from significant latency due to frequent user-kernel crossing and network stack processing, limiting the scalability and efficiency of these systems.
To address this issue, we propose BOAD, a new system designed to enhance distributed communication by leveraging eBPF (extended Berkeley Packet Filter) and kernel hooks such as XDP (eX-press Data Path) and TC (Traffic Control). By offloading broadcasting and aggregation tasks to the kernel space, BOAD minimizes the overhead caused by user-kernel crossings and network stack traversals. This innovative approach streamlines data transmission and aggregation, bypassing conventional network layers and substantially reducing communication latency. Our evaluations demonstrate that BOAD significantly enhances the efficiency and scalability of distributed systems, achieving up to 84.5% reduction in broadcast latency compared to baseline implementations.</blockquote>
<br/>
</div>

<div class="paper">
<h4>hyDNS: Acceleration of DNS Through Kernel Space Resolution</h4>
<span class="authors">Joshua Bardinelli, Yifan Zhang, Jianchang Su, Linpu Huang, Aidan Parilla, Rachel Jarvi, Sameer G. Kulkarni, Wei Zhang</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673439" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">The Domain Name System (DNS) is a core component of Internet infrastructure, mapping domain names to IP addresses. The recursive resolver plays a critical role in this process, requiring high performance due to multiple request-response exchanges. However, its performance is hindered by costly message copying, user-kernel space transitions, and kernel stack traversal. Kernel bypass techniques can mitigate these issues but often result in resource waste or deployment challenges.
To overcome these limitations, We present hyDNS, a hybrid recursive resolver that combines eBPF offloading in the kernel with a user-space resolver. The DNS kernel cache allows most requests to be served before reaching the kernel network stack. To manage limited DMA memory, excess requests are passed to user space once a threshold is reached, enabling the system to handle high query loads. hyDNS uses programmable NICs to create a scalable kernel cache, implementing a lockless per-core eBPF hash map. Filters on the NIC direct requests to each core. Preliminary results show significant performance improvements with eBPF offloading, achieving up to 4.4× the throughput and a 65% reduction in latency compared to user space implementations.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Unlocking Path Awareness for Legacy Applications through SCION-IP Translation in eBPF</h4>
<span class="authors">Lars-Christian Schulz, Florian Gallrein, David Hausheer</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673437" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-schulz.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Path-aware networking (PAN) is a novel network paradigm enabling hosts to control network path selection. PAN has been realized on Internet-scale by the SCION routing protocol. Despite the increasing adoption of SCION by ISPs, only few applications offer native SCION support. The SCION-IP Gateway (SIG) tunnels legacy IP traffic over SCION, but does not allow for interoperability with native applications. To unlock PAN for legacy IP applications while maintaining compatibility with native SCION, we introduce SCION-IP translation. We present a network stack component that uses IPv6 sockets for path aware SCION communication and implement a prototype in eBPF. The translator offers more than five times the throughput of the open-source SIG for UDP and achieves 75% of native single-threaded IP application performance.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Custom Page Fault Handling With eBPF</h4>
<span class="authors">Tal Zussman, Teng Jiang, Asaf Cidon</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3672197.3673432" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="/assets/ebpf24-slides/ebpf24_slides-zussman.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Traditionally, page faults have been handled by the kernel, with a fixed set of handling routines for different types of faults. However, some applications may benefit from custom page fault handling routines, allowing them to implement advanced functionality, such as more efficient live virtual machine migration and application checkpointing. To this end, Linux introduced the userfaultfd() syscall, which allows applications to handle their page faults in userspace. While userfaultfd() has proven useful in several applications, we identify some key scalability limitations in its design, which limit both performance and adoption. We propose a system that allows using eBPF programs to handle page faults in-kernel, yielding a simpler and more scalable implementation while also enabling novel use cases, such as accelerating the startup of large position-independent executables like browsers.</blockquote>
<br/>
</div>

</div>
<br/>



### eBPF'23: First Edition

<div class="papers">
<div class="paper">
<h4>TCP's Third Eye: Leveraging eBPF for Telemetry-Powered Congestion Control</h4>
<span class="authors">Jörn-Thorben Hinz, Vamsi Addanki (TU Berlin), Csaba Györgyi (University of Vienna), Theo Jepsen (Intel), Stefan Schmid (TU Berlin)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609295" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/2-TCP-CC.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">For years, congestion control algorithms have been navigating in the dark, blind to the actual state of the network. They were limited to the course-grained signals that are visible from the OS kernel, which are measured locally (e.g., RTT) or hints of imminent congestion (e.g., packet loss and ECN). As applications and OSs are becoming ever more distributed, it is only natural that the kernel have visibility beyond the host, into the network fabric. Network switches already collect telemetry, but it has been impractical to export it for the end-host to react.
Although some telemetry-based solutions have been proposed, they require changes to the end-host, like custom hardware or new protocols and network stacks. We address the challenges of efficiency and protocol compatibility, showing that it is possible and practical to run telemetry-based congestion control algorithms in the kernel. We designed a framework that uses eBPF to run CCAs that can execute different control laws by selecting different types of telemetry. It can be deployed in brownfield environments, without requiring all switches be telemetry-enabled, or kernel recompilation at the end-hosts. When our eBPF program is deployed on hosts without hardware or OS changes, TCP incast workloads experience less queuing (thus lower latency), faster convergence and better fairness.</blockquote>
<br/>
</div>

<div class="paper">
<h4>On Augmenting TCP/IP Stack via eBPF</h4>
<span class="authors">Sepehr Abbasi Zadeh (University of Toronto, Huawei Technologies Canada Co. Ltd), Ali Munir, Mahmoud Mohamed Bahnasy, Shiva Ketabi (Huawei Technologies Canada Co. Ltd), Yashar Ganjali (University of Toronto, Huawei Technologies Canada Co. Ltd)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609300" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/3-TCP-IP.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">As the data center networks' bandwidth-delay product is increasing and the applications are moving to nano services (with many small flows), managing flows in the network is becoming more challenging. Current TCP/IP stack faces fundamental limitations to meet these challenges. First, it lacks the ability to accurately estimate the network state under dynamic network settings. Second, the current stack is not flexible enough to be extended easily. In this work, we propose a framework, Augmenter, that augments (i.e., increases the network visibility of) the TCP/IP stack to address these challenges. Leveraging eBPF, Augmenter gathers the state of ongoing flows and uses this information to manage other flows that are currently active or arriving in the future. We present one specific use case of setting the initial congestion window of flows dynamically based on network conditions. Our initial tests, show that Augmenter can improve the application performance by up to 1.4x compared to the fixed initial window-based solutions. Implementing Augmenter in the TCP/IP stack itself is not trivial. Augmenter employs eBPF to implement its desired functionality as it enables introducing such changes relatively easy. We discuss potential challenges and solutions in designing and implementing Augmenter applications.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Schooling NOOBs with eBPF</h4>
<span class="authors">Joel Sommers (Colgate University), Nolan Rudolph, Ramakrishnan Durairajan (University of Oregon)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609302" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/4-NOOBs.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">While networks have evolved in profound ways, the tools to measure them from end hosts have not kept pace. State-of-the-art tools are ill-suited for elucidating observed network performance impairments and path dynamics, and are susceptible to operational policies of the network. Consequently, the semantic gap between the application-view of network performance vs. actual conditions has resulted in network oblivious (NOOB) systems and applications.
To address this NOOB problem, we examine the Extended Berkeley Packet Filter (eBPF) as a new way to improve the practice of gathering fine-grained network telemetry from the edge. More specifically, by leveraging the safe and efficient in-kernel programming mechanism of eBPF, we design a high-performance telemetry framework called nooBpf with two tools—namely noobprobe and noobflow—to quantify the actual network performance from end hosts and offer unprecedented insights into the flow-level performance, including in-network queuing and routing-induced delays. We illustrate the potential of these two tools to address the NOOB problem through a variety of experiments. The results of our experiments strongly suggest eBPF as a promising foundation for high-performance telemetry and for addressing the NOOB problem.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Supercharge WebRTC: Accelerate TURN Services with eBPF/XDP</h4>
<span class="authors">Tamás Lévai (Budapest University of Technology and Economics, L7mp Technologies), Balázs Edvárd Kreith (Riverside.fm), Gábor Rétvári (Budapest University of Technology and Economics, L7mp Technologies)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609296" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/5-TURN.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Real-time communication (RTC) services, from videoconferencing to cloud gaming and remote rendering, are everywhere. WebRTC, an enabler technology for these applications, traditionally relies on a comprehensive NAT traversal protocol suite, most importantly, TURN, to interconnect clients and media servers behind NATs and firewalls. With the demise of residential public IP addresses, these massive-scale TURN services have become an indispensable component of WebRTC applications. Traditionally implemented as multi-protocol user-space packet relays, TURN servers are notoriously resource hungry. In this paper, we propose an eBPF/XDP offload engine to improve TURN server performance. We design a reusable eBPF/XDP TURN offload architecture, create a prototype on top of pion/turn, a popular WebRTC framework written in Go, and show on a fully functional WebRTC testbed that our offload significantly improves throughput and, more importantly, delay, by 2-3x compared to the state-of-the-art.</blockquote>
<br/>
</div>

<div class="paper">
<h4>HEELS: A Host-Enabled eBPF-Based Load Balancing Scheme</h4>
<span class="authors">Rui Yang (EPFL), Marios Kogias (Imperial College London & Azure Research)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609307" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/6-HEELS.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Layer 4 (L4) load balancing is crucial in cloud computing and elastic microservices. Existing L4 load balancer designs can be split into two main categories: centralized designs using a hardware or software middlebox, and decentralized designs in which every node can play the role of the load balancer. Centralized designs offer better scheduling policies and easier worker node management, but suffer from I/O and CPU limitations. Decentralized designs scale better, but are harder to manage. We introduce HEELS, a novel load balancing scheme designed for internal cloud workloads and microservices, achieving the best of both worlds. HEELS uses the load balancer only during the connection establishment and allows clients and servers to communicate directly after that. Supporting general L4 load balancers and requiring no kernel changes, HEELS is readily deployable on the public cloud. We implement HEELS as a set of eBPF programs split across the client and server. Our evaluation shows that HEELS introduces minimal overheads, works with off-the-shelf load balancers (e.g., Katran by Meta), and significantly reduces the costs of cloud load balancers.</blockquote>
<br/>
</div>

<div class="paper">
<h4>eXpress Data Path Extensions for High-Capacity 5G User Plane Functions</h4>
<span class="authors">Christian Scheich, Marius Corici, Hauke Buhr, Thomas Magedanz (Fraunhofer FOKUS Institute)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609298" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/7-5G.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">In 5th Generation mobile networks, a dedicated User Plane Function (UPF) is responsible for connecting users in the Access Networks with the destination networks. In this work, we extend the UPF with eXpress Data Path enhancements to speed up the forwarding of user plane traffic in the GPRS Tunneling Protocol (GTP-U). Also, we develop a Receive Side Scaling method in XDP based on GTP-U header information to distribute incoming uplink traffic to the available CPUs.</blockquote>
<br/>
</div>

<div class="paper">
<h4>PRAVEGA: Scaling Private 5G RAN via eBPF/XDP</h4>
<span class="authors">Udhaya Kumar Dayalan, Ziyan Wu, Gaurav Gautam, Feng Tian, Zhi-Li Zhang (University of Minnesota – Twin Cities, USA)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609303" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/8-PRAVEGA.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">We exploit eBPF+XDP to scale and accelerate software packet processing in (O-RAN compliant) disaggregated 5G RAN (Radio Access Network). We argue that the Central Unit User Plane (CU-UP) component is likely the bottleneck in the 5G RAN user plane data path and therefore focuses on optimizing its performance. We propose an eBPF/XDP-based framework, PRAVEGA, and discuss additional options for further improvements.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Seeing the Invisible: Auditing eBPF Programs in Hypervisor with HyperBee</h4>
<span class="authors">Yutian Wang, Dan Li (Tsinghua University), Li Chen (Zhongguancun Laboratory)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609305" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/10-HyperBee.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">The flexibility of eBPF makes it widely used in performance, security, and monitoring. However, this flexibility is a double-edged sword, allowing attackers to use eBPF for malicious purposes. Security researchers have discovered multiple backdoors built by eBPF. Detecting malicious eBPF programs is challenging since eBPF exploits are almost invisible to inspection in both the user and kernel space. To defend against malicious eBPF programs, auditing an operating system's eBPF programs externally at load time is a more efficient approach. We propose HyperBee, a system integrated into the hypervisor that enables auditing of eBPF programs loaded in guests without performance impact during the execution. Guests relinquish their ability to load eBPF programs and must complete verification and JIT compilation of their eBPF programs through HyperBee. We implement a prototype of HyperBee on KVM and the HyperBee-aware guest based on Linux and evaluate its performance when loading eBPF programs. Our results show that HyperBee only brings overhead at load time: 9% extra load time when there is no security policy and 17% extra load time when using security policies against known eBPF malicious programs.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Comparing Security in eBPF and WebAssembly</h4>
<span class="authors">Jules Dejaeghere (University of Namur), Bolaji Gbadamosi, Tobias Pulls (Karlstad University), Florentin Rochet (University of Namur)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609306" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/11-Security.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">This paper examines the security of eBPF and WebAssembly (Wasm), two technologies that have gained widespread adoption in recent years, despite being designed for very different use cases and environments. While eBPF is a technology primarily used within operating system kernels such as Linux, Wasm is a binary instruction format designed for a stack-based virtual machine with use cases extending beyond the web. Recognizing the growth and expanding ambitions of eBPF, Wasm may provide instructive insights, given its design around securely executing arbitrary untrusted programs in complex and hostile environments such as web browsers and clouds. We analyze the security goals, community evolution, memory models, and execution models of both technologies, and conduct a comparative security assessment, exploring memory safety, control flow integrity, API access, and side-channels. Our results show that eBPF has a history of focusing on performance first and security second, while Wasm puts more emphasis on security at the cost of some runtime overheads. Considering language-based restrictions for eBPF and a security model for API access are fruitful directions for future work.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Enabling BPF Runtime policies for better BPF management</h4>
<span class="authors">Raj Sahu, Dan Williams (Virginia Tech)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609297" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/12-Runtime.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">As eBPF increasingly and rapidly gains popularity for observability, performance, troubleshooting, and security in production environments, a problem is emerging around how to manage the multitude of BPF programs installed into the kernel. Operators of distributed systems are already beginning to use BPF-orchestration frameworks with which they can set load and access policies for who can load BPF programs and access their resultant data. However, other than a guarantee of eventual termination, operators currently have little to no visibility into the runtime characteristics of BPF programs and thus cannot set policies that ensure their systems still meet crucial performance targets when instrumented with BPF programs. In this paper, we propose that having a runtime estimate will enable better policies that will govern the allowed latency in critical paths. Our key insight is to leverage the existing architecture within the verifier to statically track the runtime cost of all possible branches. Along with dynamically determined runtime estimates for helper functions and knowledge of loop-based helpers' effects on control flow, we generate an accurate—although broad—range estimate for making runtime policy decisions. We further discuss some of the limitations of this approach, particularly in the case of broad estimate ranges as well as complementary tools for BPF runtime management.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Enabling eBPF on Embedded Systems Through Decoupled Verification</h4>
<span class="authors">Milo Craun, Adam Oswald, Dan Williams (Virginia Tech)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609299" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/13-Embedded.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">eBPF (Extended Berkeley Packet Filter) is a Linux kernel subsystem that aims to allow developers to write safe and efficient kernel extensions by employing an in-kernel verifier and just-in-time compiler (JIT). We find that verification is prohibitively expensive for resource-constrained embedded systems. To solve this we describe a system that allows for verification to occur outside of the embedded kernel and before BPF program load time. The in-kernel verifier and JIT are coupled so they must be decoupled together. A designated verifier kernel accepts a BPF program, then verifies, compiles, and signs a native precompiled executable. The executable can then be loaded onto an embedded device without needing the verifier and JIT on the embedded device. Decoupling verification and JIT from load-time opens the door to much more than running BPF programs on embedded devices. It allows larger and more expressive BPF programs to be verified, provides a way for new approaches to verification to be used without extensive kernel modification and creates the possibility for BPF program verification as a service.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Network Profiles for Detecting Application-Characteristic Behavior Using Linux eBPF</h4>
<span class="authors">Lars Wüstrich, Markus Schacherbauer, Markus Budeus, Dominik Freiherr von Künßberg, Sebastian Gallenmüller (Technical University of Munich), Marc-Oliver Pahl (IMT Atlantique), Georg Carle (Technical University of Munich)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609294" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/14-NetProfiles.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Applications often show unique communication behavior. Knowledge about this behavior is beneficial in various use cases, such as anomaly or dependency detection. In this paper, we present network profiles that characterize typical application behavior. This requires a reliable and accurate association of processes and applications, which is challenging. We, therefore, introduce an eBPF-based matcher for this task that enables the creation of network profiles. In our evaluation we show that eBPF allows us to efficiently collect the relevant data to build application profiles, addressing issues of other data collection approaches. We further evaluate our work by using a network profile to identify emulated botnet activity masqueraded as a benign process.</blockquote>
<br/>
</div>

<div class="paper">
<h4>RingGuard: Guard io_uring with eBPF</h4>
<span class="authors">Wanning He (Southern University of Science and Technology), Hongyi Lu (Southern University of Science and Technology (SUSTech)/Hong Kong University of Science and Technology (HKUST)), Fengwei Zhang (Southern University of Science and Technology (SUSTech)), Shuai Wang (HKUST)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609304" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/15-RingGuard.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">io_uring offers a flexible yet efficient asynchronous I/O paradigm for Linux. Despite a significant performance improvement, it also brings many security concerns to the kernel. Not only does io_uring itself contain multiple vulnerabilities, but it can also be used to bypass existing security mechanisms such as seccomp. To address these problems, this paper proposes a security mechanism named RingGuard that safeguards io_uring with eBPF programs. RingGuard is carefully designed to reduce the overhead of I/O request submission and to ensure the security of inserted eBPF programs. Our evaluation shows that RingGuard provides encouraging security benefits with moderate overhead. For instance, the overhead of RingGuard in file I/O scenarios is merely 7.8%.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Unleashing Unprivileged eBPF Potential with Dynamic Sandboxing</h4>
<span class="authors">Soo Yee Lim (University of British Columbia), Xueyuan Han (Wake Forest University), Thomas Pasquier (University of British Columbia) </span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609301" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="https://conferences.sigcomm.org/sigcomm/2023/files/workshop-ebpf/16-Sandboxing.pdf" title="Link to presentation slides"><i class="fa-solid fa-file-pdf"></i>&nbsp;Slides</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">For safety reasons, unprivileged users today have only limited ways to customize the kernel through the extended Berkeley Packet Filter (eBPF). This is unfortunate, especially since the eBPF framework itself has seen an increase in scope over the years. We propose SandBPF, a software-based kernel isolation technique that dynamically sandboxes eBPF programs to allow unprivileged users to safely extend the kernel, unleashing eBPF's full potential. Our early proof-of-concept shows that SandBPF can effectively prevent exploits missed by eBPF's native safety mechanism (i.e., static verification) while incurring 0%-10% overhead on web server benchmarks.</blockquote>
<br/>
</div>

<div class="paper">
<h4>Practical and Flexible Kernel CFI Enforcement using eBPF</h4>
<span class="authors">Jinghao Jia, Michael V. Le, Salman Ahmed (IBM Research), Dan Williams (Virginia Tech), Hani Jamjoom (IBM Research)</span><br/>
<a href="https://dl.acm.org/doi/epdf/10.1145/3609021.3609293" title="Link to paper"><i class="fa-solid fa-file-lines"></i>&nbsp;Paper</a>&nbsp;
<a href="" class="abstract-dropdown" title="Show abstract"><i class="fa-solid fa-square-caret-down"></i>&nbsp;Abstract</a>&nbsp;
<br/>
<blockquote style="display: none;">Enforcing control flow integrity (CFI) in the kernel (kCFI) can prevent control-flow hijack attacks. Unfortunately, current kCFI approaches have high overhead or are inflexible and cannot support complex context-sensitive policies. To overcome these limitations, we propose a kCFI approach that makes use of eBPF (eKCFI) as the enforcement mechanism. The focus of this work is to demonstrate through implementation optimizations how to overcome the enormous performance overhead of this approach, thereby enabling the potential benefits with only modest performance tradeoffs.</blockquote>
<br/>
</div>
</div>