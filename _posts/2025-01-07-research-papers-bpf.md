---
layout: post
title: "eBPF Research Papers"
date: 2025-01-07 10:22:10 +0200
last_modified_at: 2026-07-17 12:31:00 +0200
categories: bpf
description: Interactive list of eBPF research papers from top conferences according to CSRankings. The list can be filtered according to types of publications (ex., improving, using) and areas (ex., networking, verifier, offload, security).
image: /assets/illustration-list-papers.png
published: true
---

When I started reading on BPF there weren't many academic papers to describe how it worked, how it didn't, or how it is used.
There are many blog posts and informal articles out there, but it's harder to find self-contained papers with references to older, sometimes unsuspected, related works.
They have become more frequent though, so I wanted to draw up a list with one-sentence summaries for anyone looking for related works or otherwise interested.

I expect this list to only grow with time.
If I want to keep things manageable, I need a way to select papers.
Except I'd rather not be the one having to decide which papers are the "best papers"[^cant-escape-choice].
So I opted to follow the selection from CSRankings: I will only list papers from [conference selected by CSRankings by default](https://csrankings.org/).
CSRankings tends to put the bar fairly high, but I think there is at least consensus on the top conferences they selected.

I've sorted papers according to their *type* of contribution and the field or *area* they focus on.
For example, papers improving either the JIT compilers or verifier of eBPF will have `improving`, `jit`, and `verifier`
<!-- {% raw %} -->
(<a href="?sel=all-types_foundation_using_analysis_all-areas_offload_networking_storage_security_tracing_misc_" class="selectors-link">see those papers</a>).
<!-- {% endraw %} -->

If you notice any bug in the selectors, missing papers, or other opportunity for improvement, as usual, don't hesitate to reach out via one of the contacts at the bottom of the page.

<br>

{% include academic-papers/academic-papers-bpf.html %}

<br>
<hr>
<br>

Thanks to Kahina for her reviews and for reporting multiple bugs with the early version of the selectors.

<br>

[^cant-escape-choice]: Of course, I can't really escape chosing a method to select papers, so it's not as if this is completely objective either.