---
layout: post
title: "Linux XFRM Reference Guide for IPsec"
date: 2024-10-30 10:26:10 +0200
last_modified_at: 2025-02-13 12:31:00 +0200
categories: xfrm
description: This post aims to be a relatively complete reference guide for the XFRM subsystem in the Linux kernel, when used for IPsec. It covers the basic configuration, the packet flows, the meaning of all state and policy fields, the impact of all XFRM errors, and some performance considerations.
image: /assets/netfilter-with-xfrm.png
published: true
uses_mermaid: true
redirect_from:
  - /ebpf/2024/10/30/linux-xfrm-ipsec-reference-guide.html
  - /cilium/2024/10/30/linux-xfrm-ipsec-reference-guide.html
---

This post focuses on the XFRM building blocks Cilium uses to provide its IPsec support.
Therefore, only tunnel mode and ESP are discussed, XFRM devices are not described, and some focus is made on the use of packet marks in XFRM policies and states.

Several others have written on XFRM, usually with a slightly different focus.
James Bottomley gave a [quick introduction on his blog](https://blog.hansenpartnership.com/figuring-out-how-ipsec-transforms-work-in-linux/), with examples of configurations.
[Andrej Stender's blog](https://thermalcircle.de/doku.php?id=blog:linux:nftables_ipsec_packet_flow) has a very detailed description of the typical packet paths for IPsec gateways.

If you find mistakes, you can report them by email or via the other contact methods listed at the bottom.

<!-- {% raw %} -->
<ul id="toc" class="section-nav">
<li class="toc-entry toc-h3"><a href="#overview">Overview</a>
<ul>
<li class="toc-entry toc-h4"><a href="#xfrm-policies-and-states">XFRM Policies and States</a></li>
<li class="toc-entry toc-h4"><a href="#policy-templates">Policy Templates</a></li>
</ul>
</li>
<li class="toc-entry toc-h3"><a href="#xfrm-packet-flows">XFRM Packet Flows</a>
<ul>
<li class="toc-entry toc-h4"><a href="#egress-packet-flow">Egress Packet Flow</a></li>
<li class="toc-entry toc-h4"><a href="#ingress-packet-flow">Ingress Packet Flow</a></li>
</ul>
</li>
<li class="toc-entry toc-h3"><a href="#output-description-of-ip-xfrm">Output Description of `ip xfrm`</a></li>
<li class="toc-entry toc-h3"><a href="#updating-xfrm-states-and-policies">Updating XFRM States and Policies</a>
<ul>
<li class="toc-entry toc-h4"><a href="#identifying-fields-of-xfrm-states">Identifying Fields of XFRM States</a></li>
<li class="toc-entry toc-h4"><a href="#identifying-fields-of-xfrm-policies">Identifying Fields of XFRM Policies</a></li>
<li class="toc-entry toc-h4"><a href="#seamless-updates-of-xfrm-policies">Seamless Updates of XFRM Policies</a></li>
<li class="toc-entry toc-h4"><a href="#seamless-updates-of-xfrm-states">Seamless Updates of XFRM States</a></li>
</ul>
</li>
<li class="toc-entry toc-h3"><a href="#xfrm-errors">XFRM Errors</a></li>
<li class="toc-entry toc-h3"><a href="#performance-considerations">Performance Considerations</a>
<ul>
<li class="toc-entry toc-h4"><a href="#data-structure-for-xfrm-policies">Data Structure for XFRM Policies</a></li>
<li class="toc-entry toc-h4"><a href="#data-structure-for-xfrm-states">Data Structure for XFRM States</a></li>
</ul>
</li>
</ul>
<!-- {% endraw %} -->

### Overview

IPsec encryption in the Linux kernel relies on [XFRM](https://man7.org/linux/man-pages/man8/ip-xfrm.8.html).
XFRM is an IP framework intended for packet transformations, from encryption to compression.
It is configured via a set of *policy* and *state* objects, which for IPsec, correspond to [Security Policies and Security Associations](https://datatracker.ietf.org/doc/html/rfc4301).

#### XFRM Policies and States

At a high-level, XFRM policies define what traffic to accept and reject, whereas states define how to perform the encryption and decryption.
Policies can match on the direction (`out`, `in`, or `fwd`), the source and destination IP addresses with CIDRs, and the packet mark.
As an example, the following policy matches egressing packets with any source IP address, 10.56.1.X destination IP addresses, and `0xcb93eXX` packet marks.
Policies default to allowing traffic as done here.
```
src 0.0.0.0/0 dst 10.56.1.0/24 
	dir out priority 0 
	mark 0xcb93e00/0xffffff00 
	[...]
```
States are relatively similar, except that they are agnostic to the direction and can only match on exact IP addresses (or 0.0.0.0 to match all).
The following state will apply to packets with IP addresses 10.56.0.17 -> 10.56.1.238 and the same packet marks as above.
In the case of tunnel-mode IPsec, these IP addresses correspond to the outer IP addresses.
For ingressing, encrypted packets, the SPI will also be used (discussed below).
```
src 10.56.0.17 dst 10.56.1.238
	proto esp spi 0x00000003 reqid 1 mode tunnel
	replay-window 0 
	mark 0xcb93e00/0xffffff00 output-mark 0xe00/0xffffff00
	aead rfc4106(gcm(aes)) 0x6254fced5f7a5ea9401b9015ecf10d65eac51a69 128
	anti-replay context: seq 0x0, oseq 0x36, bitmap 0x00000000
	sel src 0.0.0.0/0 dst 0.0.0.0/0
```
You may notice that nothing specifies if this state should perform encryption or decryption.
That's because it can actually do both.
As said above, states are agnostic to the direction of traffic so the same state may theoretically be used for both encryption and decryption.
What to do will be determined based on where in the stack the state is matched (ex., decryption on ingress).

#### Policy Templates

XFRM policies also typically define a template, as below:
```
src 0.0.0.0/0 dst 10.56.1.0/24 
	dir out priority 0 
	mark 0xcb93e00/0xffffff00 
	tmpl src 10.56.0.17 dst 10.56.1.238
		proto esp spi 0x00000003 reqid 1 mode tunnel
```
How this template is used depends on the direction.
For egressing traffic, the template defines the encoding to perform.
For example, the above template will encapsulate packets with an IP header and an ESP header.
The IP header will have IP addresses 10.56.0.17 and 10.56.1.238.
The ESP header will have SPI 3.

For ingressing and forwarded traffic however, the template acts as an additional filter.
The following XFRM policy for example will only allow packets if they are ESP packets with outer IP addresses 10.56.1.238 and 10.56.0.17, in addition to having a packet mark matching `0xd00/0xf00`.
```
src 0.0.0.0/0 dst 10.56.0.0/24 
	dir in priority 0 
	mark 0xd00/0xf00 
	tmpl src 10.56.1.238 dst 10.56.0.17
		proto esp reqid 1 mode tunnel
```

The template of XFRM OUT policies points to the XFRM state to use for encryption.
The IP addresses, the SPI, the protocol, the mode, and the reqid should all match between the XFRM state and the template.


### XFRM Packet Flows

IPsec and XFRM are represented in [the usual Linux networking diagram](https://upload.wikimedia.org/wikipedia/commons/3/37/Netfilter-packet-flow.svg).
There are however several errors in that diagram when it comes to XFRM[^netfilter-diagram-errors], so I decided to write a new one.
It takes inspiration from [Andrej Stender's diagrams](https://thermalcircle.de/doku.php?id=blog:linux:nftables_ipsec_packet_flow) and simplifies the overall flow to focus on just what I want to explain here.
All pieces related to XFRM are in purple, routing decisions in orange, and the rest in yellow.

{:refdef: style="text-align: center;"}
<div>
<img src="/assets/netfilter-with-xfrm.png" alt="Packet flow in Netfilter and XFRM subsystems." class="zoomable"/>
</div>
{: refdef}

<br>

#### Egress Packet Flow

On egress, packets will first hit one of the `XFRM OUT policy` blocks.
At this point, a lookup is performed against the XFRM OUT policies.
If a match is found, the packet goes to the `XFRM encode` block and the template is used to lookup XFRM states.
If a state is found, its information is used to encrypt the packet.

The encrypted packet will then navigate again through the `OUTPUT` and `POSTROUTING` chains.

#### Ingress Packet Flow

On ingress, encrypted packets (ex., ESP packets) will hit the `XFRM decode` after they navigate through the `INPUT` chain.

In tunnel mode, encrypted packets will typically have one of the server's IP addresses as the outer destination address, so they should automatically be routed through the `INPUT` chain.
If not, it may be necessary to add IP routes to redirect packets to the `INPUT` chain.
As an example, Cilium identifies IPsec traffic on tc-bpf ingress and marks them with a special value which is then used to reroute those packets to the `INPUT` chain.

At the `XFRM decode`, if packets match an XFRM state, they will be decoded (i.e., decapsulated and decrypted) using the state's information.
The match is based on the source & destination addresses, the mark, the SPI, and the protocol.
In case of any decoding error (ex., wrong key), the packet is dropped and an error counter is increased.

As illustrated on the diagram, an XFRM policy matching the packet isn't required for the decoding to happen (it goes directly to `XFRM decode`), but it is required for the packet to proceed to a local process or through the `FORWARD` chain.
An XFRM policy with an optional template (i.e., `level use`) will allow all decrypted packets through.
Traffic that was never encrypted, and therefore does not come from `XFRM decode`, is allowed by default.

After a packet is decrypted, it is recirculated in the stack, as if coming from the interface it was initially received on.
More specifically, packets are recirculated before the tc layer, such that they are visible on the tc-bpf hook a second time (once before decryption, once after).
The packet mark is preserved when recirculated, so it's possible to identify and trace packets that have been decrypted and recirculated.
The packet mark can also be modified during decryption, using the `output-mark` field of the XFRM states.


### Output Description of `ip xfrm`

The example outputs below are from iproute2-6.1.0.
More fields will likely appear in newer versions.
For example, XFRM states have a `dir` field in newer kernels (v6.10+), which will likely appear in the `ip xfrm state` output at some point.

In the `ip xfrm` output, policies are ordered by date of creation, with newer policies at the top.
This is important because, in case two policies match a packet and have the same priority, the newest one is used.


<!-- {% raw %} -->
<div class="highlighter-rouge"><div class="highlight fake-pre">
$ ip -s xfrm policy<br>
<span class="field">src 0.0.0.0/0<span class="field-desc">The CIDR to match against the source IP address</span></span> <span class="field">dst 0.0.0.0/0<span class="field-desc">The CIDR to match against the destination IP address</span></span> uid 0<br>
&emsp;&emsp;<span class="field">dir fwd<span class="field-desc">States the direction. It defines where in the Linux stack this policy will be used, between ingress, egress, and forwarding.</span></span> <span class="field">action allow<span class="field-desc">The action to take on matching packets. Packets can only be allowed through (by default) or dropped.</span></span> <span class="field">index 18<span class="field-desc">Used to differentiate between different policies which might have the same or overlapping selectors. If not given or if it already exists, it is automatically (re-)generated (cf., `xfrm_gen_index`). The three LSBs encode the direction (ex., 1 for `XFRM_POLICY_OUT`). The MSBs are simply incremented by one (that is, the index is incremented by 8) until a free index is found.</span></span> <span class="field">priority 2975<span class="field-desc">States the priority for this policy in case multiple could match the packet. 0 is the highest priority.</span></span> <span class="field">share any<span class="field-desc">Always set to `any` and unused today.</span></span> <span class="field">flag  (0x00000000)<span class="field-desc">Set of flags for XFRM policies. Only `XFRM_POLICY_ICMP` (0x2) is supported at the moment; `XFRM_POLICY_LOCALOK` (0x1) is not implemented (anymore?). When `XFRM_POLICY_ICMP` is given, the policy will also apply to ICMP packet with a payload packet that matches the policy's selector.</span></span><br>
&emsp;&emsp;lifetime config:<br>
&emsp;&emsp;<span class="field">
&emsp;&emsp;limit: soft (INF)(bytes), hard (INF)(bytes)<br>
&emsp;&emsp;limit: soft (INF)(packets), hard (INF)(packets)<span class="field-desc">Not implement and not enforced.</span></span><br>
&emsp;&emsp;<span class="field">
&emsp;&emsp;expire add: soft 0(sec), hard 0(sec)<br>
&emsp;&emsp;expire use: soft 0(sec), hard 0(sec)<span class="field-desc">Various expiration times for the policy, based on the time since the policy was added or the time since the policy was last matched by a packet. When a soft expiration time is reached, a notification is sent to userspace via netlink (`struct xfrm_user_expire`). When a hard limit or expiration time is reached, the policy is deleted.</span></span><br>
&emsp;&emsp;lifetime current:<br>
&emsp;&emsp;&emsp;&emsp;<span class="field">0(bytes), 0(packets)<span class="field-desc">Not implemented; will always be 0.</span></span><br>
&emsp;&emsp;&emsp;&emsp;<span class="field">add 2024-06-17 11:24:49 use 2024-06-17 11:25:01<span class="field-desc">Timestamps for when the policy was added and when it was last matched by a packet, to be used if expiration times have been set.</span></span><br>
&emsp;&emsp;tmpl <span class="field">src 0.0.0.0<span class="field-desc">See Policy Templates for how this field is used.</span></span> <span class="field">dst 10.92.0.164<span class="field-desc">See Policy Templates for how this field is used.</span></span><br>
&emsp;&emsp;&emsp;&emsp;<span class="field">proto esp<span class="field-desc">See Policy Templates for how this field is used.</span></span> <span class="field">spi 0x00000000(0)<span class="field-desc">See Policy Templates for how this field is used.</span></span> <span class="field">reqid 1(0x00000001)<span class="field-desc">See Policy Templates for how this field is used.</span></span> <span class="field">mode tunnel<span class="field-desc">See Policy Templates for how this field is used.</span></span><br>
&emsp;&emsp;&emsp;&emsp;<span class="field">level use<span class="field-desc">The nonsensical way to indicate this template is optional, the alternative being `level required`. If no XFRM state matching the template is found, the template will be skipped if optional. Otherwise, the packet will be dropped with `XfrmInTmplMismatch`.</span></span> <span class="field">share any<span class="field-desc">Not implemented and will always be `any`.</span></span><br>
&emsp;&emsp;&emsp;&emsp;<span class="field">enc-mask ffffffff<span class="field-desc">Bit mask defining the list of allowed encryption algorithms. See Encryption algorithms in include/uapi/linux/pfkeyv2.h for the list of possible values.</span></span> <span class="field">auth-mask ffffffff<span class="field-desc">Bit mask defining the list of allowed authentication algorithms. See Authentication algorithms in include/uapi/linux/pfkeyv2.h for the list of possible values.</span></span> <span class="field">comp-mask ffffffff<span class="field-desc">Non-implemented bit mask (was probably defined for compression algorithms).</span></span>
</div></div>
<!-- {% endraw %} -->

<!-- {% raw %} -->
<div class="highlighter-rouge"><div class="highlight fake-pre">
& ip -s xfrm state<br>
<span class="field">src 10.92.1.189<span class="field-desc">The IP address to match against the packets' source IP addresses.</span></span> <span class="field">dst 10.92.0.164<span class="field-desc">The IP address to match against the packets' destination IP addresses.</span></span><br>
&emsp;&emsp;<span class="field">proto esp<span class="field-desc">The IPsec protocol to use.</span></span> <span class="field">spi 0x00000003(3)<span class="field-desc">The Security Parameter Index. A tag to distinguish between multiple IPsec streams that may be using different algorithms and/or keys. Particularly useful during key rotations.</span></span> <span class="field">reqid 1(0x00000001)<span class="field-desc">An ID only used to ensure the XFRM policy template and the state match. It doesn't seem to be used for anything else in the kernel.</span></span> <span class="field">mode tunnel<span class="field-desc">States whether the packet is encapsulated (`tunnel`) or if the ESP header is simply added to the existing packet (`transport`).</span></span><br>
&emsp;&emsp;<span class="field">replay-window 0<span class="field-desc">Size of the replay window used for the anti-replay checks (i.e., toleration setting).</span></span> seq 0x00000000 <span class="field">flag  (0x00000000)<span class="field-desc">Holds various flags including `XFRM_STATE_ESN` (0x80) for ESN mode.</span></span><br>
&emsp;&emsp;<span class="field">mark 0x4db50d00/0xffff0f00<span class="field-desc">The value and mask used to match against the packets' marks.</span></span> <span class="field">output-mark 0xd00/0xffffff00<span class="field-desc">The value and mask to apply to the packets' marks after they have been encrypted or decrypted.</span></span><br>
&emsp;&emsp;<span class="field">aead rfc4106(gcm(aes))<span class="field-desc">The type and name of algorithm in use.</span></span> <span class="field">0x856f15d0ccabe682286b4286bccf5d595b88b168 (160 bits)<span class="field-desc">The key and its size. It's of course sensitive information that should be treated as such.</span></span> <span class="field">128<span class="field-desc">The ICV length. Which lengths are supported depends on the algorithm in use.</span></span><br>
&emsp;&emsp;anti-replay context: <span class="field">seq 0x0<span class="field-desc">Holds the current receive-side sequence number, for the anti-replay check.</span></span>, <span class="field">oseq 0x0<span class="field-desc">The last emitted sequence number. If this number overflows (on 32-bits), packets are dropped and the error counter `XfrmOutStateSeqError` is increased. In ESN mode, this sequence number is coded on 64-bits.</span></span>, <span class="field">bitmap 0x00000000<span class="field-desc">Tracks the sequence numbers that have already been seen in the replay window.</span></span><br>
&emsp;&emsp;<span class="field">sel src 0.0.0.0/0 dst 0.0.0.0/0<span class="field-desc">An additional filter applying to the decrypted packets, to ensure the inner packets are coming and going where you expect.</span></span> <span class="field">uid 0<span class="field-desc">This field appears to be unused (`user` in `struct xfrm_selector`).</span></span><br>
&emsp;&emsp;<span class="field">lifetime config:<br>
&emsp;&emsp;limit: soft (INF)(bytes), hard (INF)(bytes)<br>
&emsp;&emsp;limit: soft (INF)(packets), hard (INF)(packets)<br>
&emsp;&emsp;expire add: soft 0(sec), hard 0(sec)<br>
&emsp;&emsp;expire use: soft 0(sec), hard 0(sec)<span class="field-desc">Various limits and expiration times for the state, based on the number of bytes received, the number of packets received, the time since the state was added, or the time since the state was last used for a packet. When a soft limit or expiration time is reached, a notification is sent to userspace via netlink (`struct xfrm_user_expire`). When a hard limit or expiration time is reached, the state is deleted.</span></span><br>
&emsp;&emsp;lifetime current:<br>
&emsp;&emsp;&emsp;&emsp;<span class="field">20124(bytes), 83(packets)<span class="field-desc">Counters for bytes and packets matched by this state, to be used if limits have been set.</span></span><br>
&emsp;&emsp;&emsp;&emsp;<span class="field">add 2024-06-17 11:15:48 use 2024-06-17 11:16:02<span class="field-desc">Timestamps for when the state was added and when it was last matched by a packet, to be used if expiration times have been set.</span></span><br>
&emsp;&emsp;stats:<br>
&emsp;&emsp;&emsp;&emsp;<span class="field">replay-window 0<span class="field-desc">Incremented whenever a packet is received with a sequence number outside the window.</span></span> <span class="field">replay 0<span class="field-desc">Incremented whenever a packet is received with a sequence number in the replay window that was already observed.</span></span> <span class="field">failed 0<span class="field-desc">Incremented when the checksums for authentication or encryption headers are incorrect (full name `integrity_failed` on kernel's side). `XfrmInStateProtoError` is always incremented when this counter is incremented.</span></span>
</div></div>
<!-- {% endraw %} -->


### Updating XFRM States and Policies

In Cilium, on several occasions, we had to make substantial changes to our XFRM states and policies.
In the process, we faced several conflicts: you try to add a new XFRM state and the kernel complains that it conflicts with an existing state.
These conflicts can be particularly non-obvious as they can depend on the order of additions for XFRM states.
With proper documentation that would be easy to resolve, but in its absence, you need to dig into the kernel sources to understand which fields matter to identify a state or a policy.

This section aims to document those aspects: which fields constitute the "key" of XFRM states and policies, how to avoid conflicts, and how to perform updates without dropping traffic.

#### Identifying Fields of XFRM States

<!-- {% raw %} -->
<div class="highlighter-rouge"><div class="highlight fake-pre">
$ ip xfrm state<br>
src 10.36.98.139 dst <span style="color: #D17638; font-weight: bold;">10.36.1.178</span><br>
&emsp;&emsp;proto <span style="color: #D17638; font-weight: bold;">esp</span> spi <span style="color: #D17638; font-weight: bold;">0x00000003</span> reqid 1 mode tunnel<br>
&emsp;&emsp;replay-window 0<br>
&emsp;&emsp;mark <span style="color: #D17638; font-weight: bold;">0xc90a</span>0000/0xffff0000 output-mark 0xd00/0xffffff00<br>
&emsp;&emsp;aead rfc4106(gcm(aes)) 0xf83bd6832d552fa23e9ab5fdb742e1241b054f6c 128<br>
&emsp;&emsp;anti-replay context: seq 0x0, oseq 0x0, bitmap 0x00000000<br>
&emsp;&emsp;sel src 0.0.0.0/0 dst 0.0.0.0/0<br>
</div></div>
<!-- {% endraw %} -->

XFRM states are identified by their destination IP address, the masked value of the mark, the SPI, and the protocol, as shown above, in bold orange.
The source IP address and the unmasked part of the mark are not considered when identifying XFRM states.
Thus, the "key" for XFRM states could be written as:
```
key = (dst_ip, proto, spi, (mark_value & mark_mask))
```

For the mark, it checks if the sanitized value (i.e., with the mask applied) from the new mark is matched by any of the existing marks:
```
(new_mark_value & new_mark_mask) & existing_mark_mask != existing_mark_value
```
For example, if the new mark is `0x12345600/0xffffff00` and mark `0x12340000/0xffff0000` already exists, the new mark will be rejected.
If however `0x12345600/0xffffff00` was added first and `0x12340000/0xffff0000` is the new mark, it will be accepted.
Hence, the order of addition of XFRM states can matter.

<div class="note">
Note that if you use unsanitized mark values, you may run into unexpected behavior at runtime.
An unsanitized value is one with bits set that are not part of the mask, ex. 0xabcd0001/0xffff0000.
If using such mark values, the kernel will apply the mask to the packet's mark and then compare it to the unsanitized value.
Therefore, it won't match any packets at runtime.
This bug concerns the marks of both policies and states, for ingress and egress.
</div>

For XFRM state deletions, note that it will complain if you pass any argument not part of the key... except for the source IP address.
But even if you give it a source IP address, it will not consider it when matching for the deletion.

#### Identifying Fields of XFRM Policies

<!-- {% raw %} -->
<div class="highlighter-rouge"><div class="highlight fake-pre">
$ ip xfrm policy<br>
src <span style="color: #D17638; font-weight: bold;">10.0.0.0/8</span> dst <span style="color: #D17638; font-weight: bold;">10.36.1.0/24</span><br>
&emsp;&emsp;dir <span style="color: #D17638; font-weight: bold;">in</span> priority 0<br>
&emsp;&emsp;mark <span style="color: #D17638; font-weight: bold;">0x58d73e00/0xffffff00</span><br>
&emsp;&emsp;tmpl src 10.36.1.179 dst 10.36.2.60<br>
&emsp;&emsp;&emsp;&emsp;proto esp reqid 0 mode transport<br>
</div></div>
<!-- {% endraw %} -->

XFRM policies are identified by their direction, source IP address & mask, destination IP address & mask, and their mark & mask, as shown above in bold orange.
However, contrary to XFRM states, the masks (ex., CIDR or mark masks) are not applied before using the related values (resp., CIDR IP addresses or mark values).
Thus, the "key" for XFRM policies could be written as:
```
key = (dir, src_cidr_ip, src_cidr_mask, dst_cidr_ip, dst_cidr_mask,
       mark_value, mark_mask)
```
So XFRM policies with `dst 10.0.0.0/8` and `dst 10.1.1.1/8` will be considered two different policies!
For updates and deletions, the exact values must be used: a more generic policy won't be considered a match.

#### Seamless Updates of XFRM Policies

Updating XFRM policies without disrupting ongoing traffic is relatively easy.
If you only need to update non-identifying fields such as the priority or the template, you can simply run `ip xfrm policy update`.

If you however need to identify fields (ex., change the mask for marks), then you can first de-prioritize existing policies, before adding the new policies with a higher priority.
By default, policies are created with the highest priority, 0.
Thus, de-prioritizing a policy is a simple matter of running `ip xfrm policy update` to increase the priority value.
This guarantees that the old policies stay in place and traffic is still processed during the update.
Then, new policies can be added as usual, with a higher priority, for example 0.
Once all new policies are in place, old policies shouldn't be used anymore and can be removed.

#### Seamless Updates of XFRM States

Similarly to policies, updating non-identifying fields of existing states is a simple matter of running `ip xfrm state update`.
If you need to update identifying fields however, there is no priority mechanism to keep both sets of states, old and new, in place during the update.

Instead, the best approach I'm aware of to avoid disrupting operations during the update is to rely on SPIs.
You can distinguish the sets of old and new states by their SPIs, for example by reserving bits in the SPI for a version number.
As an example, if your existing states have SPIs `0x0000xxxx`, you could assign SPIs `0x0001xxxx` for the new states.
This approach obviously requires some planning beforehand, when assigning the SPIs.

Then, you need some synchronization mechanism to only start encrypting traffic with the new SPIs once the receiver has installed XFRM states with the new SPIs as well.
Presumably, you already have such a synchronization mechanism to handle key rotations.


### XFRM Errors

All XFRM errors correspond to packet drops.
Some of them may also be associated with per-state counters increasing.
`CONFIG_XFRM_STATISTICS` is required to see these error counters in `/proc/net/xfrm_stat`.

- <ins>XfrmInError</ins>: If the kernel fails to allocate memory during encryption.
- <ins>XfrmInBufferError</ins>:
  - If a packet is going through too many XFRM states.
    The maximum is set to `XFRM_MAX_DEPTH` (6).
  - If too many XFRM policy templates apply to a packet.
    The maximum is also set to `XFRM_MAX_DEPTH` (6).
- <ins>XfrmInHdrError</ins>:
  - If the SPI portion of the packet is malformed.
  - If the outer IP header is malformed.
- <ins>XfrmInNoStates</ins>: If no XFRM IN state was found that matches the AH or ESP packet ingressing on the INPUT chain.
- <ins>XfrmInStateProtoError</ins>:
  - If the AH or ESP checksum is incorrect.
  - If the packet's IPsec protocol (ex., AH, ESP) doesn't match the protocol specified by the XFRM state.
  - Also includes all protocol specific errors (ex., from `esp_input`) listed below:
  - If decryption/encryption fails (ex., because the key specified in the XFRM IN state doesn't match the key with which the packet was encrypted).
  - If the protocol headers (ex., ESP) or trailers are malformed.
  - If there is not enough memory to perform encryption/decryption.
- <ins>XfrmInStateModeError</ins>: If the packet is in IPsec tunnel mode, but the matched XFRM state is in transport mode.
- <ins>XfrmInStateSeqError</ins>: If the anti-replay check rejected the packet.
  If the check failed because the sequence number was outside the window, the `replay-window` counter of the associated XFRM state will be incremented.
  If it failed because the sequence number was seen already, the `replay` counter is incremented instead.
- <ins>XfrmInStateExpired</ins>: There can be a delay between when a state expires (hard limits) and when it's actually deleted.
  During that time, matching packets are dropped with `XfrmInStateExpired` on ingress.
- <ins>XfrmInStateMismatch</ins>:
  - If the encapsulation protocol of the XFRM state (ex., `espinudp` in `encap` field of `ip xfrm state`) doesn't match the encapsulation protocol of the packet.
  - If the decrypted packet doesn't match the selector (`sel` field) of the used XFRM state.
- <ins>XfrmInStateInvalid</ins>: If received packet matched an XFRM state that is being deleted or that expired.
- <ins>XfrmInTmplMismatch</ins>:
    - If a packet matches an XFRM policy with a non-optional template, but the template doesn't match any of the XFRM states used to decrypt the packet (yes, a packet can be decoded multiple times).
    - If an XFRM state with `mode tunnel` was used on the packet and it doesn't match any XFRM policy template.
- <ins>XfrmInNoPols</ins>: If the ingressing packet doesn't match any XFRM policy and the default action is set to `block`.
See `ip xfrm policy {get,set}default` to view and set the default XFRM policy actions.
- <ins>XfrmInPolBlock</ins>: If the packet matches an XFRM IN policy with `action block`.
- <ins>XfrmOutError</ins>:
  - If the kernel fails to allocate memory during encryption.
  - In some cases, if the packet to encrypt is malformed.
- <ins>XfrmOutBundleCheckError</ins>: Unused.
- <ins>XfrmOutNoStates</ins>: If the packet matched an XFRM OUT policy, but no XFRM state was found that matches the policy's template.
- <ins>XfrmOutStateProtoError</ins>: If a protocol-specific (ex., ESP) encryption error happens.
- <ins>XfrmOutStateModeError</ins>: If the packet exceeds the MTU once encapsulated and it shouldn't be fragmented.
- <ins>XfrmOutStateSeqError</ins>: The output sequence number (`oseq`) of an XFRM state reached its maximum value, `UINT32_MAX` when not using ESN mode.
- <ins>XfrmOutStateExpired</ins>: There can be a delay between when a state expires (hard limits) and when it's actually deleted.
  During that time, matching packets are dropped with `XfrmOutStateExpired` on egress.
- <ins>XfrmOutPolBlock</ins>: If the packet matches an XFRM OUT policy with `action block`.
- <ins>XfrmOutPolDead</ins>: Unused.
  `XfrmOutStateInvalid` is reported instead for XFRM states that in the process of being deleted.
- <ins>XfrmOutPolError</ins>:
  - If too many XFRM policy templates apply to a packet.
    The maximum is also set to `XFRM_MAX_DEPTH` (6).
  - If no XFRM state is found for a non-optional template of the matching XFRM policy.
- <ins>XfrmFwdHdrError</ins>: If the packet is malformed when going through the FWD policy check.
- <ins>XfrmOutStateInvalid</ins>: If egressing packet matched an XFRM state that is being deleted or that expired.
- <ins>XfrmOutStateDirError</ins>: If the direction of the XFRM state found during the lookup is defined and isn't `XFRM_SA_DIR_OUT`.
  Only on kernels v6.10 and newer.
- <ins>XfrmInStateDirError</ins>: If the direction of the XFRM state found during the lookup is defined and isn't `XFRM_SA_DIR_IN`.
  Only on kernels v6.10 and newer.



### Performance Considerations

This section describes the data structures used to hold the XFRM policies and states.
This is useful to understand when dealing with a large number of states and policies as the information they hold can help improve indexing and speed up the lookups.
When dealing with thousands of policies and states, the lookup cost can become non-negligible even when compared to the encryption/decryption cost.

#### Data Structure for XFRM Policies

XFRM policies are stored in a rather complex data structure made of multiple red-black trees and hash tables.
At the root, everything is contained in a [resizable hash table](https://lwn.net/Articles/751974/) indexed by network namespace, IP family, direction, and interface (in case XFRM interfaces are used).
Each entry in this resizable hash table contains several black-red trees, which themselves hold the XFRM policies.
Those entries are represented by the structure `xfrm_pol_inexact_bin`.

<!-- {% raw %} -->
<div>
<div class="mermaid zoomable">graph LR
table(resizable<br>hashtable) --> bin1(...)
table(resizable<br>hashtable) --> bin(xfrm_pol_inexact_bin)
table(resizable<br>hashtable) --> bin2(...)
bin --> rbtree_dst(root_d)
bin --> rbtree_src(root_s)
bin --> list_anyany((any;any))
rbtree_src --> node_src1(( ))
rbtree_src --> node_src2(( ))
node_src1 --> node_src3(( ))
node_src1 --> node_src4(( ))
node_src2 --> node_src5(( ))
node_src2 --> node_src6(( ))
node_src6 --> list_srcany((src;any))
rbtree_dst --> node_dst1(( ))
rbtree_dst --> node_dst2(( ))
node_dst1 --> node_dst3(( ))
node_dst1 --> node_dst4(( ))
node_dst2 --> node_dst5(( ))
node_dst2 --> node_dst6(( ))
node_dst5 --> rbtree_dstsrc(root)
node_dst5 --> list_dstany((any;dst))
rbtree_dstsrc --> node_dstsrc1(( ))
rbtree_dstsrc --> node_dstsrc2(( ))
node_dstsrc1 --> node_dstsrc3(( ))
node_dstsrc1 --> node_dstsrc4(( ))
node_dstsrc2 --> node_dstsrc5(( ))
node_dstsrc2 --> node_dstsrc6(( ))
node_dstsrc6 --> list_dstsrc((src;dst))
</div>
</div>
<!-- {% endraw %} -->

Once `xfrm_pol_inexact_bin` has been retrieved (based on current IP family, namespace, and direction), each of its red-black trees is looked up using the source and destination IP addresses.
The `root_s` tree contains policies sorted by source IP addresses; the `root_d` tree contains policies sorted by destination IP addresses.
In addition, leaf nodes of the `root_d` tree also contain another tree with policies sorted by source IP addresses.
That allows the lookups into `root_s` and `root_d` to return three lists of candidate `(src_ip; dst_ip)` policies from the leaf nodes:
- A list of `(src_ip; any)` candidates from `root_s`.
- A list of `(any; dst_ip)` candidates from `root_d`.
- A list of `(src_ip; dst_ip)` candidates from the trees pointed by the leaf nodes of `root_d`.

These three lists of candidate XFRM policies are completed by a list of `(any; any)` candidates directly stored in the `xfrm_pol_inexact_bin` entry.

Note that an XFRM policy will only be present in one of the four candidate lists, according to its source and destination CIDRs.

These four lists of candidate XFRM policies are then evaluated.
The kernel iterates through each list, looking for the highest-priority (lowest `priority` number) candidate that matches the packet.
If two policies match and have the same priority, the newest one is preferred.
It's also only during this linear evaluation of candidates that the packet mark is compared with the policy marks.

#### Data Structure for XFRM States

XFRM states are organized in four hash tables, with different XFRM fields used for indexing and different purposes:
- `net->xfrm.state_bydst` is indexed by source and destination IP addresses as well as reqid.
- `net->xfrm.state_bysrc` is indexed only by source and destination IP addresses.
- `net->xfrm.state_byspi` is indexed by destination IP address, SPI, and protocol.
- `net->xfrm.state_byseq` is indexed by sequence number only.

`net->xfrm.state_byspi` is used when looking up an XFRM state for ingressing packets.
This makes sense to speed up the search as each XFRM state is encouraged to have its own SPI (cf., [RFC4301](https://datatracker.ietf.org/doc/html/rfc4301), section 4.1) and the encrypted packets carry the SPI.

When searching for the XFRM state that corresponds to an XFRM policy template (before encryption), `net->xfrm.state_bydst` is used.
That makes sense because the indexing information is what the XFRM policy template provides.
That hash table is typically also the one being used when iterating through all XFRM states (ex., when flushing them), but any hash table would do the job for that.

`net->xfrm.state_bysrc` and `net->xfrm.state_byseq` are used for various other management tasks, such as looking up an XFRM state to update, answering a netlink query from the user, or checking for existing states before adding a new one.



### Conclusion

There's still a lot that would need to be covered for this guide to be a complete reference on XFRM/IPsec in Linux.
To cite a few, this guide didn't cover [XFRM interfaces](https://docs.strongswan.org/docs/5.9/features/routeBasedVpn.html#_xfrm_interfaces_on_linux), [VTIs](https://docs.strongswan.org/docs/5.9/features/routeBasedVpn.html#_vti_devices_on_linux), [ESP-in-TCP](https://datatracker.ietf.org/doc/html/rfc8229), [ESP-in-UDP](https://datatracker.ietf.org/doc/html/rfc3948), [XFRM offloads](https://docs.kernel.org/networking/xfrm_device.html), or [per-resource child SAs](https://datatracker.ietf.org/doc/rfc9611/).
Nonetheless, it should constitute a good basis to configure and troubleshoot XFRM configurations for IPsec tunneling.

<br>

Thanks to Louis, Gray, and Simone for identifying several mistakes and helping with wordsmithing.

<br>

[^netfilter-diagram-errors]: For example, after XFRM decode, packets actually hit the tc/qdisc of the ingress device again, as you can see if you hook into tc-bpf.
