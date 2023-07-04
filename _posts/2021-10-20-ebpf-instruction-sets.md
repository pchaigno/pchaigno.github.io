---
layout: post
title: "eBPF Instruction Sets"
date: 2021-10-20 18:00:10 +0200
categories: bpf
image: /assets/illustration-ebpf-instruction-sets.png
published: true
uses_plotly: true
---

Not everyone who develops BPF programs knows that several versions of the instruction set exist.
This isn't really surprising given documentation on the subject is scarce.
So let's go through the different eBPF instruction sets, why they exist, and why their choice matters.

<br>

### LLVM's Backend Selector

If you've been using `llc` to compile your BPF program, you might have noticed an `-mcpu` parameter.
The help output gives us the following information:

    $ llc -march=bpf -mcpu=help
    Available CPUs for this target:
    
      generic - Select the generic processor.
      probe   - Select the probe processor.
      v1      - Select the v1 processor.
      v2      - Select the v2 processor.
      v3      - Select the v3 processor.
    
    Available features for this target:
    
      alu32    - Enable ALU32 instructions.
      dummy    - unused feature.
      dwarfris - Disable MCAsmInfo DwarfUsesRelocationsAcrossSections.
    
    Use +feature to enable a feature, or -feature to disable it.
    For example, llc -mcpu=mycpu -mattr=+feature1,-feature2

The `-mcpu` parameter is used as follows:

    $ clang -O2 -Wall -target bpf -emit-llvm -c example.c -o example.bc
    $ llc example.bc -march=bpf -mcpu=probe -filetype=obj -o example.o

That parameter allows us to tell LLVM which eBPF instruction set to use.
It defaults to `generic`, an alias for `v1`, the oldest instruction set.
`probe` will select the newest instruction set your kernel supports.
We will see below that selecting newer versions allows LLVM to generate smaller and more efficient bytecode.

<br>

### Prerequisites

The two extensions of the base instruction set (v2 and v3) add support for new jump instructions.
Specifically, v2 adds support for lower-than jumps where only greater-than jumps were previously available.
Of course, the first kind of jumps can be rewritten into the second, but that requires an additional register load:

{% highlight bpf %}
// Using mcpu=v1:
0: r2 = 7
1: if r2 s> r1 goto pc+1
// Using mcpu=v2's BPF_JSLT:
0: if r1 s< 7 goto pc+1
{% endhighlight %}

The second extension, v3, adds 32-bit variants of the existing conditional 64-bit jumps.
Again, you can work around the lack of 32-bit conditional jumps by clearing the 32 most-significant bits.
But using 32-bit conditional jump is shorter:

{% highlight bpf %}
0: call bpf_skb_load_bytes
// Using mcpu=v2's 64-bit jumps:
1: r0 <<= 32
2: r0 s>>= 32
3: if r0 s< 0 goto +1785 <LBB10_90>
// Using mcpu=v3's 32-bit jumps:
1: if w0 s< 0 goto +1689 <LBB10_90>
{% endhighlight %}

`w0` is the 32-bit subregister of `r0`.

You need recent-enough versions of Linux and LLVM to use the v2 and v3 extensions.
The following table sums it up.

| BPF ISA version | New instructions             | Linux version        | LLVM version                         |
|-----------------|------------------------------|----------------------|--------------------------------------|
| v1 (generic)    | -                            | [v3.18][linux-v1]    | [v3.7][llvm-v1]                      |
| v2              | `BPF_J{LT,LE,SLT,SLE}`       | [v4.14][linux-v2]    | [v6.0][llvm-v2]                      |
| `mattr=+alu32`  | 32-bit calling convention    | [v5.0][linux-32arsh][^alu32-support] | [v7.0][llvm-alu32]                   |
| v3              | 32-bit variants of all jumps | [v5.1][linux-v3]     | [v9.0][llvm-v3], with `mattr=+alu32` |

[The BPF FAQ](https://github.com/torvalds/linux/blob/28806e4d9b97865b450d72156e9ad229f2067f0b/Documentation/bpf/bpf_design_QA.rst#q-why-bpf-jlt-and-bpf-jle-instructions-were-not-introduced-in-the-beginning) also gives good insight into why these instruction set extensions exist:

> **Why BPF_JLT and BPF_JLE instructions were not introduced in the beginning?**
>
> A: Because classic BPF didn't have them and BPF authors felt that compiler workaround would be acceptable.
> Turned out that programs lose performance due to lack of these compare instructions and they were added.
> These two instructions are a perfect example of the kind of new BPF instructions that are acceptable and can be added in the future.
> These two already had equivalent instructions in native CPUs. New instructions that don't have one-to-one mapping to HW instructions will not be accepted.

<br>

### Impact on Program Size and Complexity

Why does all this matter?
Is it so bad to use the default v1 instruction set?
Can we just set `mcpu=probe`?

Let's first have a look at the impact on the program sizes.
To that end, we can use [Cilium's BPF programs](https://github.com/cilium/cilium/tree/master/bpf).
They are open source, of heterogeneous sizes, and used in production systems.
The `check-complexity.sh` script from the Cilium repository loads the programs in the kernel and retrieves various statistics.
In the following, I'm using LLVM 10.0.0.

{% highlight shell %}
$ git checkout v1.10.0-rc0
$ for v in v1 v2 v3 "v1 -mattr=+alu32" "v2 -mattr=+alu32"; do \
        sed -i "s/mcpu=v[1-3].*/mcpu=$v/" bpf/Makefile.bpf && \
        make -C bpf KERNEL=netnext &&                         \
        sudo ./test/bpf/check-complexity.sh > ${v/ /-}.txt;   \
done
{% endhighlight %}

{% include plot-isa-versions-program-sizes.html %}

As expected, each newer instruction set version generates smaller BPF programs.
Since the new instructions have a one-to-one mapping to x86 instructions, we can expect a similar impact on the size of the JIT-compiled programs. 
You can therefore expect a small performance benefit in most cases when using newer instruction sets. 

The impact of `mattr=+alu32` is more nuanced---click on the legend to show it. It sometimes increases program size, especially when combined with `mcpu=v1`, instead of decreasing it.
Unless you are using `mcpu=v3`, many parts of the programs still require 64-bit instructions and operations.
So maybe the more nuanced impact is due to the extra instructions required to convert between 32 and 64-bits values.

For larger programs and kernels before v5.2[^4k-limit], the v2 and v3 instruction sets may also allow you to reduce your program size below the 4096 instruction limit imposed by the verifier. 
It is however not the only limit imposed by the verifier.
A more common source of problems for large programs is the limit on the number of instructions analyzed by the verifier.

As the verifier analyzes all paths through a program, it counts how many instructions it has already analyzed and stops after a given limit (e.g., 1 million on Linux 5.2+).
We'll refer to the number of instructions analyzed by the verifier as the *complexity* of the BPF program.
In the worst case, the complexity grows exponentially with the number of conditions in the program[^state-pruning].
[][bpf-complexity]

`check-complexity.sh` also reports the complexity of each loaded BPF program.
I executed it on a Linux 5.10 and report the results in the following plot.

{% include plot-isa-versions-complexity.html %}

By clicking on the legend to hide v3, we can notice that v1 and v2 are fairly close.
There are however stricking differences between the first two versions and the last one.
The v3 instruction set sometimes reduces complexity and other times exacerbates it.
Adding `mattr=+alu32` has a similar impact.

It's unclear why the newer instruction sets sometimes increase complexity when they reduce the number of instructions.
Given that they don't significantly modify the control flow, it could be that they reduce the efficiency of [the verifier's state pruning][bpf-complexity].

To sum up, if you are having complexity issues (i.e., hitting the verifier's threshold), you need to carefully test the impact of each instruction set before making the switch.
The only case that seems clear is switching from v2 + alu32 to v3, with v3 almost always holding lower complexities.

<br>

### Conclusion

We have seen that the Linux kernel supports not one but three eBPF instruction sets!
These instruction sets have an impact on program size and performance, and in most cases, you're better off setting `mcpu=probe` to use the newest supported version.
If you have very large BPF programs, a version switch can lead to a reject by the kernel's verifier, if you hit the complexity limit, so you should test thoroughly before making the switch.

<br>

[linux-v3]: <https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=092ed0968bb648cd18e8a0430cd0a8a71727315c>
[llvm-v3]: <https://reviews.llvm.org/rL353384>
[linux-v2]: <https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=92b31a9af73b3a3fc801899335d6c47966351830>
[llvm-v2]: <https://reviews.llvm.org/rL311522>
[^alu32-support]: As far as I can see, it should be supported since v3.19 with [the first helper calls][linux-alu32], but most programs break before v5.0 due to the lack of [support for 32-bit signed right shifts][linux-32arsh].
[linux-32arsh]: <https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=2dc6b100f928aac8d7532bf7112d3f8d3f952bad>
[linux-alu32]: <https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=d0003ec01c667b731c139e23de3306a8b328ccf5>
[llvm-alu32]: <https://reviews.llvm.org/rL325983>
[linux-v1]: <https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=daedfb22451dd02b35c0549566cbb7cc06bdd53b>
[llvm-v1]: <https://reviews.llvm.org/rL227008>
[^4k-limit]: The 4096 instructions limit on the program size was removed in Linux 5.2 for privileged users.
[^state-pruning]: In practice, the verifier uses state pruning to recognize equivalent paths and reduce the number of instructions to analyze.
[bpf-complexity]: </ebpf/2021/04/12/bmc-accelerating-memcached-using-bpf-and-xdp.html#bpfs-complexity-constraint>