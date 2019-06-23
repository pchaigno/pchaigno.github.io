---
layout: post
title: "BPF Syntax Highlighting in GitHub Pages"
date: 2019-10-11 16:30:10 +0200
last_modified_at: 2019-12-04 18:41:00 +0200
categories: ebpf
image: /assets/illustration-bpf-syntax-highlight.png
published: true
redirect_from:
  - /bpf/2019/10/11/bpf-syntax-highlighting.html
---

GitHub Pages now have support for BPF syntax highlighting!

{% highlight bpf %}
   0: r6 = r1
   1: r7 = *(u16 *)(r6 +176)
   2: w8 = 0
   3: if r7 != 0x8 goto pc+14
   4: r1 = r6
   5: w2 = 12
   6: r3 = r10
   7: r3 += -4
   8: w4 = 4
   9: call bpf_skb_load_bytes#7684912
  10: r1 = map[id:218]
  12: r2 = r10
  13: r2 += -8
  14: *(u32 *)(r2 +0) = 32
  15: call trie_lookup_elem#120736
  ...
  36: exit
{% endhighlight %}

BPF highlighting is provided by [the Rouge library](https://github.com/rouge-ruby/rouge) since its version 3.5, but took some time to land in GitHub Pages.
The BPF lexer is so far very simple and lives at [`rouge/lexers/bpf.rb`](https://github.com/rouge-ruby/rouge/blob/master/lib/rouge/lexers/bpf.rb).
~~Several syntactic constructions are not currently supported by the lexer (e.g., helper names after call instructions and hexa. codes from bpftool/objdump outputs).~~They now are!
Don't hesitate to send pull requests for improvements!

Now you have no excuse to not write blog posts on BPF!
