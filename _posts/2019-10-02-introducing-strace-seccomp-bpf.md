---
layout: post
title: "Introducing strace --seccomp-bpf"
date: 2019-10-02 15:00:00 +0200
last_modified_at: 2020-09-19 16:49:00 +0200
categories: strace
image: /assets/illustration-strace-seccomp-bpf.png
published: true
---

### News

I gave a talk at FOSDEM 2020 on the topic of this blog post, with some additional information on the BPF algorithms used in strace.
[The slides](/assets/strace-seccomp-bpf.pdf) are hosted on this site and [the recording](https://archive.fosdem.org/2020/schedule/event/debugging_strace_bpf/) on FOSDEM's website.


### Demo

The latest [strace](https://strace.io) release ([v5.3](https://github.com/strace/strace/releases/tag/v5.3)) has a new (experimental) feature to boost performance.
In this post, I'll explain how it works and some of its limitations.
Let's first try it out on a kernel build!

{% highlight shell %}
$ cd linux/
$ time strace -f -econnect make -j$(nproc) > /dev/null
#              |  |              |
#              |  |              +----> Build on all cores
#              |  +----> Display connect(2) syscalls
#              +----> Trace child processes
[...]
real    24m54,473s
user    264m28,911s
sys     64m18,720s
$ make clean
$ time strace -f -econnect --seccomp-bpf make -j$(nproc) > /dev/null
[...]
real    12m48,670s
user    295m43,826s
sys     33m0,825s
$ make clean
$ time make -j$(nproc) > /dev/null
[...]
real	12m27,010s
user	274m18,907s
sys	31m22,605s
{% endhighlight %}

On my machine, stracing a kernel build with the `--seccomp-bpf` option makes it about twice as fast to list `connect` syscalls[^linux-build-connect].
It only slightly slows the build.
Of course, the actual speedup will depend on your machine and the traced workload.
My kernel build is limited by disk writes, so you can expect larger speedups.


### Under the Hood

How does it work?
How does a sandboxing facility like seccomp help improve the performance of a debugger?

Seccomp-bpf was introduced in [Linux v3.5](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e2cfabdfd075648216f99c2c03821cf3f47c1727) by Will Drewry.
It allows userspace processes to attach a cBPF program to the seccomp hook, right before executing syscalls, to decide which syscalls should be allowed or denied.
The cBPF program returns `SECCOMP_RET_ALLOW` or `SECCOMP_RET_KILL` to allow or deny a syscall.
Alternatively, it can return `SECCOMP_RET_TRACE` to notify a ptracer, a process [attached](http://man7.org/linux/man-pages/man2/ptrace.2.html) to the process doing the syscalls (the tracee).

Why would you want to notify a ptracer process?
The use case then was for a sandbox to give control to a userspace process so that it could parse syscall arguments without the limitations of seccomp-bpf[^seccomp-ebpf].

So once you know that the strace process *is* a ptracer process, how `--seccomp-bpf` works becomes quite evident:
it defines a cBPF program that returns `SECCOMP_RET_TRACE` for any syscall strace is interested in and `SECCOMP_RET_ALLOW` for others.

Why does it speed up strace?
Well, strace usually behaves as a very normal ptracer: it intercepts all syscall entries and exits, with two context switches per syscall.
These slow the tracee *a lot*.
With `--seccomp-bpf`, we only switch to the strace process in userspace for syscalls the user actually wants to see.

When the strace process is done decoding and displaying the syscall, it can restart the tracee in the kernel with the `PTRACE_CONT` command.
To perform the same action, but stop the tracee at the next syscall entry or exit, the strace process can use `PTRACE_SYSCALL`.
Therefore, without `--seccomp-bpf`, strace mostly uses `PTRACE_SYSCALL`.
When we pass the `--seccomp-bpf` option, we restart the tracee with `PTRACE_CONT` at syscall exits and rely on the cBPF program to notify us at the next syscall of interest.
We can't do the same at syscall entries however.
Since the cBPF program can only notify us of syscall entries, we need to restart with `PTRACE_SYSCALL` to stop at the syscall exit.

{% highlight text %}
Traditional behavior:
         +---->----PTRACE_SYSCALL--->---+
         |                              |
+---------------+               +--------------+
| syscall-entry |               | syscall-exit |
+---------------+               +--------------+
         |                              |
         +----<----PTRACE_SYSCALL---<---+

--seccomp-bpf behavior (Linux 4.8+):
Tracee stops at syscall entry only when seccomp-bpf
program tells it to.
        +------>------PTRACE_SYSCALL------>-----+
        |                                       |
+--------------+                                |
| seccomp-stop |--<--+                          |
+--------------+     |                          |
                     |                          |
+---------------+    |                  +--------------+
| syscall-entry |    +-<-PTRACE_CONT-<--| syscall-exit |
+---------------+                       +--------------+
{% endhighlight %}


### Limitations

There are two main limitations with the current `--seccomp-bpf` option.
They relate to the fact that seccomp-bpf was originally meant for sandboxing and not tracing.

First, when using `--seccomp-bpf`, all child processes of the tracee are also traced (same as using `-f`).
We don't have a choice.
Once we attach a seccomp-bpf program to a process, all children inherit it.
If these child processes are stopped by a seccomp-bpf program with `SECCOMP_RET_TRACE` and don't have a ptracer attached, it won't end well: the syscall will error with `ENOSYS`.

Second, `--seccomp-bpf` does not work on processes attached with `strace -p [pid]` (processes that already exist).
The Linux kernel simply doesn't provide a way to attach seccomp-bpf programs to existing processes.


### Conclusion

`--seccomp-bpf` is currently an experimental feature, but if it proves succesful, we may enable it by default.
When/if we do, all strace users will get a transparent performance boost.
Nevertheless, `strace --seccomp-bpf` still stops at each syscall of interest and should therefore [not be used on production systems](http://www.brendangregg.com/blog/2014-05-11/strace-wow-much-syscall.html)!

I'm working on some improvements for the syscall matching algorithm of the cBPF program, which I may describe in a later post. 
I'm also hoping to lose at least one of the above limitations in a future version of `--seccomp-bpf`.
This is likely not my last strace post :-)

<br>

Thanks to Chen for the original version of the `--seccomp-bpf` patchset, Dmitry and Eugene for code reviews, and Céline and Yoann for their reviews of this post.

<br>

[^linux-build-connect]: Yes, there are a few `connect` syscalls during a kernel build. Only to Unix sockets though.
[^seccomp-ebpf]: The main limitation is the inability to examine syscall arguments passed by pointers. eBPF wouldn't have changed that, had it existed. Because of where in the stack the BPF programs are executed, any check on such arguments would be vulnerable to [time-of-check-to-time-of-use (TOCTTOU) races](https://lwn.net/Articles/799557/).
[^seccomp-bpf-return-codes]: Several [other return codes](https://elixir.bootlin.com/linux/v5.3.1/source/include/uapi/linux/seccomp.h#L35) are possible for the cBPF program, to kill the whole thread group, return an error code, or log the syscall for instance.
