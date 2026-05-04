---
layout: post
title: "BPF Selftests: Troubleshooting vmtest.sh"
date: 2026-05-05 10:26:10 +0200
categories: ebpf
description: This post covers the most common errors when trying to run the eBPF selftests using vmtest.sh, including compilation errors on kfuncs declarations, missing or mismatched libraries, and other miscellaneous issues.
published: true
---

I recently had to reinstall my setup to contribute to Linux on a new laptop, and as usual, ran into a few issues with the BPF selftests.
This short blog post is my attempt to document these issues---and a couple others I had ran into previously---both for my future self and for anyone else interested.
If you run into something not documented here, please give me a shout! I'll try to keep this up-to-date.

Running the BPF selftests is as simple as:
```bash
tools/testing/selftests/bpf/vmtest.sh
```
or, to run specific tests:
```bash
# Run the mcpu=v4 version of the verifier_bounds selftests.
tools/testing/selftests/bpf/vmtest.sh -- ./test_progs-cpuv4 -t verifier_bounds
```
Unfortunately, because the selftests have a number of dependencies (LLVM, pahole, libelf, etc.) and things sometimes break, it is not that uncommon to run into compilation, linking, and runtime errors.

<br>

### Conflicting kfunc declarations
```
In file included from progs/stream.c:8:
bpf_arena_common.h:47:15: error: conflicting types for 'bpf_arena_alloc_pages'
47 | void __arena* bpf_arena_alloc_pages(void *map, void __arena *addr, __u32 page_cnt,
| ^
tools/include/vmlinux.h:152158:14: note: previous declaration is here
152158 | extern void *bpf_arena_alloc_pages(void *p__map, void *addr__ign, u32 page_cnt, int node_id, u64 flags) __weak __ksym;
| ^
```
In my case, LLVM was too old and generated different prototypes to what the test already had.
The same sort of errors can also happen with older pahole versions.

**Solution:** Upgrade [LLVM](https://apt.llvm.org/) and [pahole](https://git.kernel.org/pub/scm/devel/pahole/pahole.git) to the latest stable versions.
<br><br>


### Undeclared kfuncs
```
progs/bpf_iter_tasks.c:98:8: error: call to undeclared function 'bpf_copy_from_user_task_str'; ISO C99 and later do not support implicit function declarations [-Wimplicit-function-declaration]
   98 |         ret = bpf_copy_from_user_task_str((char *)task_str1, sizeof(task_str1), ptr, task, 0);
      |               ^
1 error generated.
```
Pahole v1.27 or newer is needed to parse vmlinux and discover exported kfuncs.
With older versions, you'll run into the above error because the kfuncs declarations are missing.

**Solution:** Upgrade [pahole](https://git.kernel.org/pub/scm/devel/pahole/pahole.git).
<br><br>


### Shared object file not found
```
./test_progs: error while loading shared libraries: libpcap.so.0.8: cannot open shared object file: No such file or directory
```
That can happen if the selftests binaries (ex., `test_progs` here) have been linked against a library that isn't present in the selftests VM.

**Solution:** Use static linking:
```
LDLIBS=-static PKG_CONFIG='pkg-config --static' ./vmtest.sh
```
**Workaround:** If the error is specific to libpcap, you can also uninstall libpcap-dev as that library is optional and only required to run some selftests.
<br><br>


### Incompatible glibc version
```
./test_progs -t verifier_xdp
./test_progs: /usr/lib/libc.so.6: version `GLIBC_2.38' not found (required by ./test_progs)
```
That will happen if your host system has a newer glibc version than the selftests VM.

**Solution:** Use static linking as above.
<br><br>


### Cannot find libsystemd
```
/usr/bin/ld: cannot find -lsystemd: No such file or directory
```
Since Linux v6.12, the selftests may optionally rely on libpcap-dev.
When linking statically, that can cause the above error because libpcap-dev pulls in a lot of dependencies, including libsystemd.
On some distros[^include-ubuntu24], installing libsystemd doesn't fix it because its packaging is broken[^libcap-dep-bug], causing the following errors:
```
/usr/bin/ld: (.text.change_capability+0x71): undefined reference to `cap_set_flag'
/usr/bin/ld: (.text.change_capability+0x80): undefined reference to `cap_set_proc'
/usr/bin/ld: (.text.change_capability+0x9f): undefined reference to `cap_free'
```

**Solution:** Install libsystemd-dev.<br>
**Workaround:** Uninstall libpcap-dev if libsystemd-dev is broken on your distro.
<br><br>


### No rule to make target
```
make: *** No rule to make target 'bpf_arena_common.h', needed by 'tools/testing/selftests/bpf/arena_htab.test.o'.  Stop.
make: *** Waiting for unfinished jobs....
```
or
```
make[5]: *** No rule to make target 'str_error.h', needed by 'tools/bpf/resolve_btfids/libbpf/staticobjs/libbpf.o'.  Stop.
make[4]: *** [Makefile:152: tools/bpf/resolve_btfids/libbpf/staticobjs/libbpf-in.o] Error 2
make[3]: *** [Makefile:62: tools/bpf/resolve_btfids//libbpf/libbpf.a] Error 2
```
These errors can happen after changing branches.
They happen because stale `.cmd` files remain, referencing header files that no longer exist.
For instance, in my second example, I tried to run the selftests on bpf-next after running them on v6.6.
It fails because `tools/bpf/resolve_btfids/libbpf/staticobjs/.libbpf.o.cmd` from my v6.6 run refers to `str_error.h`, but that header file was removed in v6.18.

**Solution:** Run `make -C tools/testing/selftests/bpf clean && make -C tools/bpf/resolve_btfids clean` to clean up stale object files.
<br><br>


### Undefined references to zstd
```
/usr/bin/ld: /usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu/libelf.a(elf_compress.o): in function `__libelf_compress':
(.text+0x113): undefined reference to `ZSTD_createCCtx'
/usr/bin/ld: (.text+0x2a9): undefined reference to `ZSTD_compressStream2'
/usr/bin/ld: (.text+0x2b4): undefined reference to `ZSTD_isError'
/usr/bin/ld: (.text+0x2db): undefined reference to `ZSTD_freeCCtx'
```
If linking statically, you might hit this on kernels before v6.8 because newer versions of libelf require libzstd, but the kernel doesn't include it in LD flags.

**Solution:** [`8998a479fd96`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=8998a479fd96) (v6.8+).<br>
**Workaround:** If the above commit doesn't apply cleanly, you can also just add `-lzstd` to `LDLIBS` manually.
<br><br>


### LLVM not detected
```
Auto-detecting system features:
...                                    llvm: [ OFF ]
```
There's a number of reasons this can happen[^llvm-off-reasons], but one I encountered recently is when the version of `llvm-config` doesn't match the libllvm version you installed.

**Solution:** Update `llvm-config` to match the libllvm & clang versions.
<br><br>


### Unexpected `__counted_by` attribute
```
In file included from test_tag.c:18:
/usr/include/linux/if_alg.h:45:22: error: expected ‘:’, ‘,’, ‘;’, ‘}’ or ‘__attribute__’ before ‘__counted_by’
   45 |         __u8    iv[] __counted_by(ivlen);
```
With commit [`dacbfc167808`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=dacbfc167808) (v7.0), two selftests started indirectly relying on the `__counted_by` macro that wasn't defined in the tools headers.
That is only an issue if the installed UAPI headers (ex., `/usr/include/linux/if_alg.h` above) include commit `dacbfc167808`.
It's also unlikely to affect many people because the issue was fixed shortly after.

**Solution:** [`0c7ae130698e`](https://git.kernel.org/pub/scm/linux/kernel/git/bpf/bpf.git/commit/?id=0c7ae130698e) (bpf tree).<br>
**Workaround:** Define `__counted_by` manually in `tools/include/uapi/linux/stddef.h` or install an older version of the UAPI headers via `make headers_install INSTALL_HDR_PATH=/usr`.
<br><br>


[^include-ubuntu24]: Including Ubuntu 24.04.
[^libcap-dep-bug]: It doesn't declare libcap-dev as a dependency, leading to linking errors.
[^llvm-off-reasons]: I'm happy to document others if people run into them in the context of BPF selftests.
