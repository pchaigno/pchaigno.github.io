---
layout: post
title: "BPF Verifier State Pruning: Timeline"
date: 2026-01-20 10:26:10 +0200
categories: ebpf
description: This blog post presents a timeline of the main changes to state pruning in the eBPF verifier. State pruning allows the verifier to scale to larger BPF programs by eliminating paths.
image: /assets/illustration-state-pruning-timeline.png
published: true
---

<script>
$(document).ready(function() {
  $('.timeline-item').each(function(i) {
    $(this).delay(i * 200).animate({ opacity: 1 }, 500);
  });
  $('.timeline-content a').each(function(i) {
    if ($(this).text().indexOf('*') != -1) {
      $(this).attr('title', 'This commit was backported to at least one LTS kernel.');
    }
  });
  $('li.up').each(function(i) {
    $(this).attr('title', 'This change mostly increased complexity.');
  })
  $('li.down').each(function(i) {
    $(this).attr('title', 'This change mostly decreased complexity.');
  })
  $('li.neutral').each(function(i) {
    $(this).attr('title', 'This change didn\'t have an impact on complexity.');
  })
});
</script>

*This article is part of a series of notes that Mahé Tardy and I wrote to prepare a [presentation introducing the BPF verifier state pruning](https://lpc.events/event/19/contributions/2162/) for Linux Plumbers 2025 in Tokyo.
You can also find [the slides](https://lpc.events/event/19/contributions/2162/attachments/1820/3904/LPC25_State_Pruning.pdf) and [the video recording](http://www.youtube.com/watch?v=EoEBkFJ3St4) of the presentation.*

State pruning is what helps the BPF verifier in Linux scale to larger programs.
It mitigates [the path explosion problem](https://en.wikipedia.org/wiki/Path_explosion) by pruning paths that are equivalent to already-verified paths.
State pruning evolved alongside the verifier for the past decade.
As we illustrated in our talk, it started as a simple optimization and grew into a more complex and efficient component of the verifier.

This timeline tracks the main changes state pruning went through.
Each commit is prefixed with a symbol to indicate the overall impact the change had on the complexity (the "cost" of verification).
For example, `↓` means the commit decreased complexity and therefore helped the verifier scale.
Commits suffixed with a `*` have been backported to at least one LTS kernel.

As we publish more articles with Mahé, I'll include more link to Read more on important changes.

<!-- {% raw %} -->
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-date">v3.18, 2014</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=17a5267067f3">17a526</a>&nbsp;Initial verifier logic.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f1bca824dabb">f1bca8</a>&nbsp;Initial state pruning logic.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.7, 2016</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=07016151a446">070161</a>&nbsp;Add a pruning point after call instructions, in addition to existing pruning points on conditional jump target and after <code class="language-plaintext highlighter-rouge">BPF_JA</code>.<br><a href="https://mtardy.com/posts/prune-points/" target="_blank" class="read-more">Read more</a></span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.11, 2017</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f0318d01b694">f0318d</a>&nbsp;Track offseted map value pointers while on the stack.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.12, 2017</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=3c2ce60bdd3d">3c2ce6*</a>&nbsp;Add a pruning point on conditional jump instructions.<br><a href="https://mtardy.com/posts/prune-points/" target="_blank" class="read-more">Read more</a></span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.14, 2017</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=dc503a8ad984">dc503a</a>&nbsp;Track register liveness.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.16, 2017</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=2f18f62ee164">2f18f6</a>&nbsp;Fix liveness propagation in case of register with a pointer filled from the stack.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=3bf15921c58d">3bf159</a>&nbsp;Detect dead <code class="language-plaintext highlighter-rouge">BPF_JNE</code> branches.</span></li>
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f4d7e40a5b71">f4d7e4</a>&nbsp;Verification of subprogs (BPF-to-BPF function calls).</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=cc2b14d51053">cc2b14</a>&nbsp;Recognize zero-initialized stack slots.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v4.20, 2018</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=4f7b3e82589e">4f7b3e*</a>&nbsp;Extend dead-branch detection to all types of numeric conditions.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.0, 2018</div>
    <ul class="timeline-content">
      <li class="unknown"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e434b8cdf788">e434b8*</a>&nbsp;Track scalars through 32-bit assignments.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19e2dbb7dd97">19e2db</a>&nbsp;Don't assume a larger stack means verifier states aren't equivalent.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.2, 2019</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=9f4686c41bdf">9f4686</a>&nbsp;Least-recently used mechanism to limit number of saved states at pruning points.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.3, 2019</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f7cf25b2026d">f7cf25*</a>&nbsp;Track constant scalar registers as they are spilled to the stack.</span></li>
      <li class="unknown"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=2589726d12a1">258972</a>&nbsp;Support bounded loops, introduce heuristic to decide when to save the verifier state on a pruning point.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=b5dc0163d8fd">b5dc01</a>&nbsp;Introduce precise tracking of scalar values.</span></li>
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=a3ce685dd01a">a3ce68</a>&nbsp;Fix precision propagation in case of pruned paths.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=6754172c208d">675417</a>&nbsp;Fix precise tracking in case of subprogs.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.5, 2019</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=cc52d9140aa9">cc52d9</a>&nbsp;Require precise tracking of map lookup key for tail calls.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.6, 2020</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=51c39bb1d5d1">51c39b</a>&nbsp;Support function-by-function verification.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.10, 2020</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=75748837b7e5">757488</a>&nbsp;Allocate an ID for scalars to propagate infered ranges to identical scalars.</span></li>
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=5689d49b71ad">5689d4</a>&nbsp;Track 64-bit bounded scalar registers as they are spilled to the stack.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.15, 2021</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=bfc6bb74e4f1">bfc6bb</a>&nbsp;Add a pruning point on calls to asynchronous callback functions.<br/><a href="https://mtardy.com/posts/prune-points/" target="_blank" class="read-more">Read more</a></span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v5.16, 2021</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=354e8f1970f8">354e8f*</a>&nbsp;Track all bounded scalar registers as they are spilled to the stack.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.2, 2022</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=a3b666bfa9c9">a3b666*</a>&nbsp;Fix precision propagation in case of ALU operations.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=be2ef8161572">be2ef8*</a>&nbsp;Do not completely disable precise tracking whenever subprogs are used.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f63181b6ae79">f63181*</a>&nbsp;Improve accuracy of precision propagation.</span></li>
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=bffdeaa8a5af">bffdea*</a>&nbsp;Decouple jump history from pruning points.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=7a830b53c17b">7a830b*</a>&nbsp;Improve accuracy of precision propagation by actively forgetting precise marks.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.3, 2022–2023</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=4633a0068258">4633a0</a>&nbsp;Fix register comparison in state pruning to take into account ID remapping between paths.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=6715df8d5d24">6715df*</a>&nbsp;Relax slack slot equivalence when running with <code class="language-plaintext highlighter-rouge">CAP_PERFMON</code>.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.4, 2023</div>
    <ul class="timeline-content">
  <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=4b5ce570dbef">4b5ce5</a>&nbsp;Introduce force pruning points for <code class="language-plaintext highlighter-rouge">iter_next</code> kfuncs.</span></li>
  <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=13fbcee55706">13fbce</a>&nbsp;Improve <code class="language-plaintext highlighter-rouge">BPF_JEQ</code> and <code class="language-plaintext highlighter-rouge">BPF_JNE</code> dead-branch detection.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.5, 2023</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=407958a0e980">407958</a>&nbsp;Introduce <code class="language-plaintext highlighter-rouge">struct backtrack_state</code> to track the precise marking through backtracking.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=fde2a3882bd0">fde2a3</a>&nbsp;Support precise tracking for subprogs, including callback functions.</span></li>
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=904e6ddf4133">904e6d</a>&nbsp;Share precise mark between all scalars with the same ID.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.7, 2023</div>
    <ul class="timeline-content">
      <li class="unknown"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=2793a8b015f7">2793a8*</a>&nbsp;For <code class="language-plaintext highlighter-rouge">iter_next</code> loops, require exact state match in state pruning and introduce widening of registers.</span></li>
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=42d31dd601fa">42d31d</a>&nbsp;Improve <code class="language-plaintext highlighter-rouge">BPF_JEQ</code> and <code class="language-plaintext highlighter-rouge">BPF_JNE</code> dead-branch detection by using signed ranges.</span></li>
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=ab5cfac139ab">ab5cfa*</a>&nbsp;Add a pruning point on calls to synchronous callback functions, fix callback function verification to verify all iterations.<br/><a href="https://mtardy.com/posts/prune-points/" target="_blank" class="read-more">Read more</a></span></li>
      <li class="unknown"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=cafe2c21508a">cafe2c*</a>&nbsp;Extend use of register widening to synchronous callback functions.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.8, 2023</div>
    <ul class="timeline-content">
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=0acd03a5bd18">0acd03*</a>&nbsp;Require precise tracking of R0 on callback function return.</span></li>
      <li class="up"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=eabe518de533">eabe51</a>&nbsp;Require precise tracking of R0 when checking return code is within expected range.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=41f6f64e6999">41f6f6</a>&nbsp;Precise tracking on spill to the stack even if using non-R10 register.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=18a433b62061">18a433</a>&nbsp;Don't trigger precise tracking whenever writing zero register to aligned stack slots.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.9, 2024</div>
    <ul class="timeline-content">
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=9a4c57f52b5e">9a4c57</a>&nbsp;Don't trigger precise tracking whenever writing zero immediate to aligned stack slots, a pattern common for <code class="language-plaintext highlighter-rouge">mcpu=v4</code>.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=6efbde200bf3">6efbde</a>&nbsp;Improve state pruning when comparing unbounded spilled register to misc. stack slots.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.12, 2024</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=4bf79f9be434">4bf79f</a>&nbsp;Improving precise tracking at conditional jumps in case of linked registers.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.15, 2025</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=14c8552db644">14c855</a>&nbsp;Data-flow analysis for register liveness, before the actual program analysis.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.17, 2025</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=96c6aa4c63af">96c6aa</a>&nbsp;Compute Strongly Connected Components (SCCs) of control-flow graph.</span></li>
      <li class="unknown"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=c9e31900b54c">c9e319</a>&nbsp;Use SCC to improve read and precise marks propagation in case of loops.</span></li>
    </ul>
  </div>
  <div class="timeline-item">
    <div class="timeline-date">v6.18, 2025</div>
    <ul class="timeline-content">
      <li class="neutral"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=b3698c356ad9">b3698c</a>&nbsp;Introduce path-insensitive data flow analysis for liveness tracking.</span></li>
      <li class="down"><span><a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=f41345f47fb2">f41345*</a>&nbsp;Use tnum information to improve <code class="language-plaintext highlighter-rouge">BPF_JEQ</code> and <code class="language-plaintext highlighter-rouge">BPF_JNE</code> dead-branch detection.</span></li>
    </ul>
  </div>
</div>
<!-- {% endraw %}) -->
