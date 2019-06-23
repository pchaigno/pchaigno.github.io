---
layout: post
title: "Complexity of the BPF Verifier"
date: 2019-07-02 08:22:10 +0200
last_modified_at: 2023-05-01 12:31:00 +0200
categories: ebpf
image: /assets/illustration-complexity-post.png
published: true
uses_plotly: true
redirect_from:
  - /bpf/2019/07/02/bpf-verifier-complexity.html
---

A while ago I gave a talk on the [BPF](https://lwn.net/Articles/740157/) verifier at our internal system security seminar.
As an introduction, I showed a simple, annotated plot of the evolution of its number of lines of code over time.
[The verifier](https://www.spinics.net/lists/xdp-newbies/msg00185.html) ensures BPF programs are safe for the Linux kernel to execute.
It is therefore critical to Linux's robustness and security[^non-root-bpf].
In this post, I'll explore the verifier's size and complexity over time through a few additional plots.

<br>

### Update for the 5.5 Release

Linux v5.5 comes with [type checking for BPF tracing programs](https://lwn.net/Articles/803258/), made possible by BTF.
Thus, BTF, and its main source file at `kernel/bpf/btf.c`, now play a role in the verification of BPF programs.
I've updated the statistics retroactively, from Linux 4.18, when BTF was introduced, to take this into account.

<br>

### Verifier Size

Let's start with the simplest metric of complexity and plot the evolution of the number of lines of code (LoC).
The verifier lives at `kernel/bpf/verifier.c`[^verifier-headers], but since Linux v5.5, it relies on BTF at `kernel/bpf/btf.c` for type checking.
For the first plot, we can compute the number of LoCs with:
```bash
sed '/^\s*$/d' kernel/bpf/{verifier,btf}.c | wc -l
```
To compute the same without comment lines, I used [Lizard](https://github.com/terryyin/lizard).

{% include plot-bpf-verifier-size.html %}
<br>

The plot starts at [v3.18](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=51580e798cb61b0fc63fa3aa6c5c975375aa0550), when the current *ahead-of-time* verifier for eBPF was added.
Before that, verification was done at runtime.

The annotations on the plot show the new features that contributed the most to each LoC increase: [direct packet accesses](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=969bf05eb3cedd5a8d4b7c346a85c2ede87a6d6d), [function calls](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f4d7e40a5b7157e1329c3c5b10f60d8289fc2941) (bpf-2-bpf), [reference tracking](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=fd978bf7fd312581a7ca454a991f0ffb34c4204b)...
The logs can be easily explored with the following command:
```bash
git log --pretty=oneline --stat v5.4..v5.5 kernel/bpf/{verifier,btf}.c
```
<br>

Now, there's clearly a sharp increase of the number of lines over the last few releases.
But that's only fair given that several new features have been merged in the BPF subsystem recently (e.g., [`bpf_spin_lock`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=d83525ca62cf8ebe3271d14c36fb900c294274a2), [bounded loops](https://lwn.net/Articles/794934/), and [type checking](https://lwn.net/Articles/803258/)).
Using the following command, let's instead compare the size of the verifier with that of the whole BPF subsystem[^bpf-subsystem-content]:

```bash
sed '/^\s*$/d' kernel/bpf/*.c kernel/trace/bpf_trace.c \
	net/bpf/*.c net/sched/*_bpf.c net/core/filter.c | wc -l
```

{% include plot-bpf-size.html %}
<br>

The verifier initially made up 40% of the BPF subsystem, but that number kept decreasing toward 20%... until the addition of BTF in v4.18.
Since then the size of the verifier+BTF has been growing faster than the rest of the BPF subsystem.
It takes a lot of code to resolve and check BPF types loaded with the BPF programs and the verifier increasingly relies on BTF to enable new features (e.g., [`bpf_spin_lock`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=d83525ca62cf8ebe3271d14c36fb900c294274a2) and [type checking](https://lwn.net/Articles/803258/)).

<br>

### Cyclomatic Complexity

The number of lines of code is often a poor metric of a code's complexity though.
After all, a lot of the verifier's line of codes are simple switch statements over [helpers](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L2621) and [program](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L1516), [map](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L2545), and [register](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L1196) types.
Let's complete our analysis with another metric, McCabe's cyclomatic complexity.

In [his 1976 paper](http://www.literateprogramming.com/mccabe.pdf), McCabe defines the cyclomatic complexity of a function as the number of linearly independent paths in the code, those paths from which all others can be generated by linear combinations.
For instance, the following function has `ade`, <code>a(bc)<sup>2</sup>e</code>, and `abce` as linearly independent paths.
Path <code>a(bc)<sup>3</sup>e</code> can be constructed from <code>2 * a(bc)<sup>2</sup>e - abce</code>.

<!-- ![abcde graph](/assets/graph.png) -->
{:refdef: style="text-align: center;"}
<img src="/assets/graph.jpg" alt="abcde graph" style="width: 150px;"/>
{: refdef}

Given a function, McCabe shows that the cyclomatic complexity can be computed as either one of[^visual-ccn]:
```
cyclo. complex. = vertices - edges + 2
                = code blocks - transitions between code blocks + 2
cyclo. complex. = predicates + 1
```
Which gives us a cyclomatic complexity of 3 for the above function.
See [the paper](http://www.literateprogramming.com/mccabe.pdf) for other examples.

But how do we interpret this metric?
Well, McCabe's idea is that the control flow of a program tells us more about its complexity than the number of lines.
Unfortunately, the number of paths may well grow exponentially with the control flow complexity[^infinite_paths].
In contrast, by ignoring combinations of already counted paths, the cyclomatic complexity is commensurate with the control flow complexity.

<br>
To compute the cyclomatic complexities of the BPF verifier, I used Lizard again.
Lizard gives us the cylomatic complexity for each function in `verifier.c` and on average, over all functions.
I used the `-m` option to count entire switch statements as a single `if`, instead of counting each `case`[^lizard-switch]:
```bash
python lizard.py -m kernel/bpf/{verifier,btf}.c
```

{% include plot-cyclomatic-complexity.html %}
<br>

As we can see with the blue marks, the cyclomatic complexity is quite stable, with even a slight decrease over the last few releases.
This decrease is actually caused by an increase of the number of small, uncomplex functions.
This small functions are numerous in the BTF code in particular, as can be seen by the drop for Linux v4.18.
The verifier grew from 32 to 414 functions, most of which are very simple.

The 10 most complex functions, on the other hand, are getting more complex.
In the v6.3 release, these functions are:
```
103  do_misc_fixups
95   do_check
87   check_mem_access
86   check_map_func_compatibility
78   check_helper_call
77   check_kfunc_args
69   check_cond_jmp_op
66   check_kfunc_call
60   bpf_check_attach_target
55   print_verifier_state
```

<br>

### Any Other Complexity Metrics?

Given the two metrics I considered, it seems clear that the BPF verifier is getting more complex.
Whether this is an issue is a matter of opinion though.
But at least now we have metrics on which to base that opinion.
By the way, any ideas of other metrics I should include?

In addition, the two above metrics have their own limit: all lines of code (resp. independent paths) don't have the same complexity.
Besides, the `verifier.c` file does not only contain code for the verification of BPF programs.
It also performs some amount of rewriting for [BPF calls](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L7529), [the map references](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L6687), and [BTF](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L5501).
It looks debatable to me that these should be included in any complexity measure[^rewriting].

In the end, even with a perfect measure of complexity, it wouldn't tell us if this is a problem.
One thing is clear: we need to keep reviewing and testing the verifier to avoid bad surprises.

<br>

Thanks to Céline, Quentin, and Aurélien for their reviews of this first post!

<br>

[^non-root-bpf]: Currently, Linux allows only [two BPF program types](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/syscall.c#L1562-L1565) to be loaded without root privileges.
[^verifier-headers]: Since v4.9, some internal structures are also exposed at `include/linux/bpf_verifier.h`.
[^bpf-subsystem-content]: Not including JIT compilers, samples, tests, and tooling.
[^sockmap-move]: The drop in line counts between v4.19 and v4.20 corresponds to `kernel/bpf/sockmap.c`, which was moved out of the BPF subsystem.
[^visual-ccn]: He also proposes a quick visual method to devise the cyclomatic complexity for planar graphs.
[^infinite_paths]: `for (i = 0; i < 100; i++) { x = input(); if (x) acc += x; } return acc;`
[^lizard-switch]: As seen above, the verifier has many of these switch statements, which by themselves do not make the code more complex. The results are similar when counting all `case`s, with higher numbers but the same functions in the top 10.
[^rewriting]: Part of the bytecode rewriting happens for security reasons. For example, [divisions are patched](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L7548) to skip divisions by zero. When inlining helper calls, some [runtime checks](https://github.com/torvalds/linux/blob/e93c9c99a629c61837d5a7fc2120cd2b6c70dbdd/kernel/bpf/verifier.c#L7699-L7709) are also added. It might therefore be difficult to completely separate rewriting and verification.
