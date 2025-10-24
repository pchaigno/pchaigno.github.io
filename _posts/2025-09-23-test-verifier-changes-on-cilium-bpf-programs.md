---
layout: post
title: "Test Verifier Changes on Cilium's BPF Programs"
date: 2025-09-23 10:26:10 +0200
categories: ebpf
description: This post describes how to use Cilium's large BPF programs to test and evaluate your changes to the Linux BPF verifier or to any other aspect of the kernel.
published: true
image: /assets/illustration-cilium-test-verifier-changes.png
---

At [SIGCOMM'25](https://conferences.sigcomm.org/sigcomm/2025/workshop/ebpf/), I was asked on two occasions how to test verifier changes on Cilium's BPF programs.
That has been a recurring ask for a while and it makes a lot of sense to want to do this.
Cilium probably still has the largest open sourced BPF programs out there.
There are many heuristics in the Linux verifier, most notably around state pruning.
Thus, changes to the verifier can have hard to predict impacts, on the ability to verify programs or on the *complexity*, i.e., the number of instructions the verifier has to walk to analyze a program.
Testing your changes on Cilium is one way to evaluate them.

Testing verifier changes on Cilium is also a well-established practice of the kernel community[^testing-verifier-with-cilium].
Yet, it can be difficult to know how to test on Cilium.
Its BPF programs can be compiled with many different configurations and only a few really maximize the size and complexity.

In this post, I'll show how to run Cilium's complexity test suite on your patched kernel.
The complexity test suite is built to try and maximize the complexity, in an effort to spot complexity issues before they reach users.

We'll start by building a test VM with your changes, but you can also skip to [Run the Complexity Tests](#run-the-complexity-tests) if you prefer to boot on your patched kernel directly.
The VM is mostly useful if you don't want to boot on your kernel or if you want to run the full Cilium end-to-end tests.

<!-- {% raw %} -->
<ul id="toc" class="section-nav">
<li class="toc-entry toc-h3"><a href="#download-repositories">Download Repositories</a></li>
<li class="toc-entry toc-h3"><a href="#cilium-test-vm">Cilium Test VM</a>
<ul>
  <li class="toc-entry toc-h4"><a href="#build-the-vm">Build the VM</a></li>
  <li class="toc-entry toc-h4"><a href="#boot-and-prepare-the-vm">Boot and Prepare the VM</a></li>
</ul>
</li>
<li class="toc-entry toc-h3"><a href="#cilium-complexity-tests">Cilium Complexity Tests</a>
<ul>
<li class="toc-entry toc-h4"><a href="#run-the-complexity-tests">Run the Complexity Tests</a></li>
<li class="toc-entry toc-h4"><a href="#parse-the-results">Parse the Results</a></li>
<li class="toc-entry toc-h4"><a href="#comparing-results-across-versions">Comparing Results Across Versions</a></li>
</ul>
</li>
<li class="toc-entry toc-h3"><a href="#run-ciliums-end-to-end-tests">Run Cilium’s End-to-End Tests</a></li>
</ul>
<!-- {% endraw %} -->

<br>

### Download Repositories
```bash
WORKDIR=/tmp
git clone --depth 1 -b v1.19.0-pre.0 https://github.com/cilium/cilium
# Only needed if building the test VM:
git clone --depth 1 https://github.com/cilium/little-vm-helper-images
git clone --depth 1 -b v0.0.26 https://github.com/cilium/little-vm-helper
```

<br>

### Cilium Test VM

This part is only required if you don't want to boot on your patched kernel, or if you want to [run Cilium's end-to-end tests](#run-ciliums-end-to-end-tests) afterward.

#### Build the VM
We will build the VM image using [Little VM Helper](https://github.com/cilium/little-vm-helper) (LVH), the tool used to run end-to-end tests in Cilium's CI.
```bash
cd $WORKDIR/little-vm-helper-images/
vim _data/kernels.json
```
We first need to edit the configuration to add our patched kernel.
Note how the URL follows the format `your_repo_url?depth=1#your_branch`.
```json
{
  "name": "my-kernel",
  "url": "https://github.com/pchaigno/linux?depth=1#change-pruning-point-heuristic"
},
```
With that, we can build the kernel and extract the VM image:
```bash
KERNEL_VERSIONS="my-kernel" make complexity-test
c=$(docker create quay.io/lvh-images/complexity-test-ci:my-kernel)
docker cp $c:/data/images/complexity-test_my-kernel.qcow2.zst /tmp
zstd --decompress /tmp/complexity-test_my-kernel.qcow2.zst
```
If you want to compare complexity numbers between different kernel versions, you may want to build multiple kernels at once.
For example, if your patch is based on bpf-next, you may want to pass run:
```bash
KERNEL_VERSIONS="bpf-next my-kernel" make complexity-test
```

#### Boot and Prepare the VM
We can then run the VM image using LVH:
```bash
cd $WORKDIR/little-vm-helper/
make
./lvh run --host-mount ~/cilium --image /tmp/complexity-test_my-kernel.qcow2
```
Username is `root`. There's no password.

Finally, we need to extract the LLVM version used by Cilium to compile its BPF programs:
```bash
/host/contrib/scripts/extract-llvm.sh /tmp/llvm
mv /tmp/llvm/usr/local/bin/{clang,llc} /bin/
rm -r /tmp/llvm
mkdir -p /host/datapath-verifier
```

<br>

### Cilium Complexity Tests

#### Run the Complexity Tests
If you're running in the LVH VM, the following command will execute Cilium's complexity test suite:
```bash
cd /host/
export PRIVILEGED_TESTS=true
go test -v -timeout=20m ./pkg/datapath/loader -run "TestPrivilegedVerifier" \
  --cilium-base-path /host --result-dir /host/datapath-verifier \
  --kernel-version netnext
```
`/host` points to the base of the Cilium clone.
If running this on the host (if you booted on your patched kernel), you'll need to modify `/host` in the command to point to the Cilium clone.

The argument `--kernel-version` points to the set of configurations used by Cilium and, unless testing an old kernel (<= v6.1), it should remain set to `netnext`.

#### Parse the Results
Results are found in the `datapath-verifier/` directory in the Cilium clone and take the form of a JSON file.
```bash
cd $WORKDIR/cilium/datapath-verifier/
cat verifier-complexity.json
```
```json
[
  {
    "collection": "lxc",
    "build": "5",
    "load": "0",
    "program": "cil_from_container",
    "insns_processed": 748,
    "insns_limit": 1000000,
    "max_states_per_insn": 5,
    "total_states": 57,
    "peak_states": 57,
    "mark_read": 13,
    "verification_time_microseconds": 306,
    "stack_depth": 64
  },
  ...
```
`collection` refers to a set of BPF programs (typically one of Cilium's `bpf/bpf_[collection].c` files). `program` is the name of the BPF program being tested. `build` and `load` are the IDs of the build-time and load-time configurations used for this test case. The combination of `program`, `build`, and `load` can serve as an index for the complexity results.

`insns_processed` is the number of instructions the verifier had to walk to verify the program. It's typically referred to as the complexity of the program for that kernel. `insns_limit` is the complexity limit for that kernel (1M on recent kernels). `verification_time_microseconds` is the total verification time in microseconds.

`max_states_per_insn` is the maximum number of verifier states the verifier attached to an instruction in the program. A `max_states_per_insn` of 5 means that there is at least one instruction in the program for which the verifier saved 5 different states (for different paths). `total_states` is the number of verifier states that were allocated during verification. Given states can also be freed during the analysis, `peak_states` gives the maximum number of verifier states that existed at any point in time; it is closely related to the verifier's memory consumption.

`mark_read` is the size of the longest parentage chain the verifier had to walk for liveness tracking. `stack_depth` is the maximum stack depth used by the BPF program.

#### Comparing Results Across Versions

The largest BPF programs are typically found in the `lxc` and `host` collections.

The following command can be used to compare results between different kernels.
It will emit a large number of plots, with comparisons for each program and each configuration.
```bash
cd $WORKDIR/cilium/
python ./contrib/scripts/verifier_diff.py \
  datapath-verifier/verifier-complexity-bpf-next.json \
  datapath-verifier/verifier-complexity-my-kernel.json
```

The following image shows an example plot, for the patched kernel I'm using, in the case of the bpf_host Cilium program.

{:refdef: style="text-align: center;"}
<div>
<img src="/assets/illustration-cilium-test-verifier-changes.png" title="" alt="" style="width: 100%;" class="zoomable"/>
</div>
{: refdef}

<br>

### Run Cilium's End-to-End Tests

You can also use LVH images with your patched kernel to run end-to-end tests in Cilium's CI.
To that end, you will need to build additional images:
```bash
KERNEL_VERSIONS="my-kernel" make kind
```
This command will create a new image `quay.io/lvh-images/kind-ci:my-kernel@sha256:xxxxxxx`.
You will need to retag and push this image to a Docker repository.

To have Cilium's CI run your kernel, we just need a few changes.
First, we have to edit the `kernel:` lines in `.github/actions/e2e/configs.yaml` and `.github/actions/e2e/ipsec_configs.yaml` to refer to your kernel (i.e., `kernel: "my-kernel"`).
Then, apply the following diff, with whatever Docker repository you used (`docker.io/pchaigno` in my case):
```diff
diff --git a/.github/actions/lvh-kind/action.yaml b/.github/actions/lvh-kind/action.yaml
index ecc8896cd4..7a7925686e 100644
--- a/.github/actions/lvh-kind/action.yaml
+++ b/.github/actions/lvh-kind/action.yaml
@@ -58,6 +58,8 @@ runs:
       uses: cilium/little-vm-helper@01debd6cb7e5514cfdb4a33e776bdc647bc5306e # v0.0.27
       with:
         test-name: ${{ inputs.test-name }}
+        image-repo: 'docker.io/pchaigno'
+        image: 'kind-ci'
         image-version: ${{ inputs.kernel }}
         images-folder-parent: "/tmp"
         host-mount: ./
```

Commit, open a draft pull request on [Cilium's repositories](https://github.com/cilium/cilium), and ping your favorite Cilium committer to trigger the end-to-end tests.

<br>

Thanks to Simone Magnani for the `verifier_diff.py` script, to Mahé Tardy for his help running LVH, and to all my colleagues who contributed to our complexity test suite over time!

<br>

[^testing-verifier-with-cilium]: See examples of using Cilium to test the complexity impact of verifier changes in commits [`18a433b62061`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=18a433b62061), [`6715df8d5d24`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=6715df8d5d24), [`a3ce685dd01a`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=a3ce685dd01a), and [`979d63d50c0c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=979d63d50c0c).
