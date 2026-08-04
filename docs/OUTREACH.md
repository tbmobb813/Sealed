# First-10 Outreach Drafts

_Drafted 2026-07-10. Goal: 10 freelancers trying Sealed and reporting where it
breaks. The ask is feedback, not sign-ups — at n=10 a reply beats a
registration._

**Status (updated 2026-07-21):** Resend domain and Clerk production are
DONE — proposal/invoice emails now deliver to any client address. Signatures
are also DONE and FULLY LIVE: DocuSeal Pro ($20/mo) is purchased and active
(`SIGNATURE_PROVIDER=docuseal`), verified end-to-end with a real signature
flipping an agreement to SIGNED via webhook. No watermarking, no test-mode
hedging needed — variant 1 and the community post below predate this and
still describe the old test-mode limit; treat 2b's framing as current when
sending.

---

## 1. Direct message — someone you know who freelances (warmest, use first)

> Hey [name] — I built something and you're one of the few people whose
> opinion on it actually matters.
>
> It's called Sealed. It chains a freelancer's client paperwork into one
> flow: send a proposal → client accepts from a link (no account needed) →
> it becomes an e-signed agreement → that becomes an invoice with a payment
> link. Each step unlocks the next, so nothing falls through the cracks.
>
> It's live and free right now: https://sealed.techtrendwire.com
>
> Would you poke at it for 10 minutes and tell me where it's confusing or
> broken? Brutal honesty is the favor I'm asking for — "this part sucks" is
> more useful to me than "looks cool."

## 2. Community post — r/freelance-style

_Adjust to each community's self-promo rules; post in ONE community first,
learn from the response, then adapt for the next._

> **I got tired of proposals, contracts, and invoices living in three
> different tools, so I built one flow — looking for freelancers to break it**
>
> Solo builder here. Day job in a law firm mailroom, nights building this.
>
> The problem I kept seeing: the proposal is a Google Doc, the contract is
> in some e-sign tool, the invoice is somewhere else, and the state of each
> lives in your head. Deals die in the gaps between them.
>
> Sealed chains them: proposal → client accepts via link → e-signed
> agreement (DocuSeal) → invoice with a Stripe payment link. The chain
> is enforced — you literally can't invoice an unsigned contract.
>
> It's free and early. I'm looking for ~10 freelancers to try it and tell
> me what's wrong with it before I take it further. Not selling anything —
> the most valuable thing you can give me is "here's where I got confused."
>
> [link] — I'll be in the comments answering everything.

## 2b. Niche-tailored DM variants (for prospect slots 4–10, drafted 2026-07-22)

_Same skeleton as variant 1 — personal opener, one pain, one mechanism,
feedback ask — with the pain swapped per niche. Product is now FULLY LIVE
(real signatures via DocuSeal, real payments), so no test-mode hedging.
Personalize the [bracket] in the first line or don't send it._

### Videographer / photographer

> Hey [name] — I built something with people like you in mind and I'd
> genuinely value your take on it.
>
> It's called Sealed. You know the dance: quote the shoot, chase the
> signed agreement, then chase the deposit — three tools, three follow-ups.
> Sealed chains it into one: send the proposal → client accepts from a
> link (no account on their side) → it becomes an e-signed contract →
> that becomes an invoice they pay by card. You can't get invoiced-but-
> unsigned or shot-but-unquoted; each step unlocks the next.
>
> It's live and free: https://sealed.techtrendwire.com
>
> Would you run one fake gig through it — 10 minutes — and tell me where
> it's confusing or where it doesn't fit how you actually book work?
> "This part sucks" is exactly the feedback I need.

### Freelance developer / designer

> Hey [name] — shipped something and I want a builder's eyes on it.
>
> Sealed: proposal → e-signed agreement → Stripe invoice, one enforced
> state machine. The pitch is that deals die in the gaps between the
> Google Doc, the e-sign tool, and the invoice app — so it chains them,
> and the server enforces the chain (you literally can't invoice an
> unsigned contract).
>
> Live and free: https://sealed.techtrendwire.com — I built it nights
> around a day job, NestJS/Next/Postgres, real signatures and payments
> verified end to end.
>
> Two asks: run a fake client through it and tell me where the flow
> breaks — and if it's not something you'd use for your own client work,
> tell me why. That second answer is worth more than the first.

### Consultant / coach (B2B proposals)

> Hey [name] — I built a tool for exactly the paperwork side of what you
> do, and I'd love your honest read.
>
> Sealed takes a client engagement from proposal to paid in one thread:
> you send a proposal link, they accept it (no account, no PDF
> attachments), it becomes an e-signed agreement, and that becomes an
> invoice with a card-payment link. Every status — viewed, accepted,
> signed, paid — shows live on one dashboard, so nothing sits in your
> head or your follow-up list.
>
> It's live and free: https://sealed.techtrendwire.com
>
> Could you mock up one engagement in it and tell me what's missing for
> how you actually close clients? If your proposals need something it
> doesn't do, that's precisely what I'm trying to learn.

### Quote-based trades (detailer, handyman, cleaner, DJ, events)

> Hey [name] — built an app I think fits how you get jobs, want your
> opinion on it.
>
> It's called Sealed. Instead of texting a quote, hoping they say yes,
> and chasing the money after — you send one link. They see the quote,
> accept it, sign the agreement right on their phone, and when the job's
> done they get an invoice they can pay by card. You see where every job
> stands — viewed, agreed, signed, paid — in one place.
>
> Free right now: https://sealed.techtrendwire.com
>
> Try it with a made-up job and tell me straight — would you actually
> use this with your customers, and what's annoying about it? Blunt
> answers are the favor I'm asking for.

## 3. Follow-up nudge (send once, ~4–5 days after silence)

> No pressure at all — but if you had 10 minutes this week to click through
> Sealed and reply with one sentence about what annoyed you most, it'd
> genuinely shape what I build next. And if it's not for you, that's useful
> data too.

---

## Why the drafts read this way

- **The mailroom detail stays in.** Memorability + proof of building under
  real constraints; also the seed of the build-in-public story.
- **No feature lists.** One problem, one mechanism ("the chain is
  enforced"), one ask. People skim.
- **The ask is feedback, not sign-ups.** Replies start conversations;
  conversations are where first customers come from.
- **"I'll be in the comments"** separates a feedback request from removable
  spam.

## Sequencing

1. Variant 1 to the 2–3 warmest contacts today.
2. Variant 2 in ONE community; iterate on the message before the next.
3. Log every piece of feedback in `docs/feedback.md` — patterns across 10
   people are the real deliverable.

## Send log

<!-- date — who/where — variant — response -->

## Distribution post profile links (check these directly, don't re-search)

- **X**: https://x.com/tbmobb813 — pinned post, posted 2026-07-23
- **LinkedIn**: https://www.linkedin.com/in/jsn43/recent-activity/all/ — "Some personal news..." post, posted 2026-07-24 (5d as of 2026-07-29)
- **Reddit**: https://www.reddit.com/user/tbmobb813/submitted/ — u/tbmobb813, posted 2026-07-22, removed by Reddit filters
- **Hacker News**: https://news.ycombinator.com/submitted?id=tbmobb813 — Show HN, posted 2026-07-22, 1 point (self), 0 external comments
- **Indie Hackers**: https://www.indiehackers.com/tbmobb813 — post never actually went live; site itself broken (JS error) as of 2026-07-23, still broken 2026-07-29

**Checked 2026-07-29** — zero replies/comments across all five channels:
- X: 18 views, 0 replies
- LinkedIn: 73 impressions, 2 reactions, 0 comments
- Reddit: removed by filter, 0 comments
- HN: 1 point (own upvote), 0 external comments
- IH: page still non-functional, post status unconfirmable
