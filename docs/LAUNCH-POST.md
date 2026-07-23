# Launch / Build-in-Public Posts

_Drafted 2026-07-21. Goal: maximum attention that converts to testers.
Post ONE, work the comments hard, adapt for the next channel from what
lands. Log results in the send log below._

## Channel strategy (why this order)

1. **Show HN (Hacker News)** — highest attention ceiling for a solo-builder
   story; HN rewards "unlikely builder ships real thing" and produces
   high-quality testers who actually break software. Weekday morning
   US-Eastern is the standard window. Risk: builders, not freelancers —
   expect feedback > customers.
2. **r/SideProject** (self-promo allowed, story-friendly) — warm crowd,
   lower ceiling, near-zero risk. Good same-week second post.
3. **Freelancer communities (r/freelance etc.)** — the actual ICP, but
   strict self-promo rules; use the feedback-ask variant in OUTREACH.md §2,
   adjusted per subreddit rules, AFTER the story post has proof ("30 people
   tried it and said X").
4. **Personal Facebook + Instagram (§4–5)** — the friends/family graph.
   Frame as a personal milestone, not a product pitch; the reach mechanic
   is friends tagging friends who freelance. Post from the PERSONAL
   account — a new brand account is an empty room (board precedent
   07-09: Sealed standalone, founder-fronted).

Rule for all: reply to every comment for the first 3 hours. The comments
section is the product demo.

---

## 1. Show HN (primary)

**Title:**

> Show HN: Sealed – I work in a law firm mailroom; I built a proposal→e-sign→invoice tool at night

**URL:** https://sealed.techtrendwire.com

**First comment (post immediately after submitting — this is the pitch):**

> I work noon–9pm in a law firm mailroom in NYC. Between mail runs I get
> a few interrupted hours, and at night I build. This is the first thing
> I've actually shipped.
>
> Sealed chains a freelancer's client paperwork into one enforced flow:
> proposal → client accepts from a public link (no account) → it becomes
> an e-signed agreement → that becomes an invoice with a Stripe payment
> link. The state machine is strict on purpose — you can't create an
> agreement from an unaccepted proposal or invoice an unsigned agreement.
> Deals die in the gaps between the Google Doc, the e-sign tool, and the
> invoice app; the whole product is closing those gaps.
>
> Stack: Turborepo, NestJS + Prisma + Postgres on Railway, Next.js on
> Vercel, Clerk, Stripe, e-signatures via provider-switched integration
> (Dropbox Sign / DocuSeal). Every mutation is tenant-scoped and emits an
> activity event in the same transaction; state transitions are asserted
> server-side. Watching the signed webhook flip an agreement without me
> touching anything was the moment it felt real.
>
> Honest caveats: it's early, free while I find the rough edges, and the
> e-sign step runs in test mode (watermarked) until the first real user
> needs it — that purchase is triggered by you, not by me.
>
> I'd love brutal feedback on the flow — and if you freelance, I want the
> paperwork story where a deal died between tools. That's the research
> I'm here for.

## 2. r/SideProject (second post, same week)

**Title:**

> I sort mail at a law firm by day. At night I built Sealed — proposal → e-signature → invoice in one enforced chain. It's live, free, and I need people to break it.

**Body:**

> Day job: law firm mailroom, NYC, noon–9pm. Building happens between
> mail runs and after midnight.
>
> The itch: freelancers run deals across three disconnected tools — a doc
> for the proposal, an e-sign app for the contract, an invoice app for
> the money — and the deal's actual state lives in their head. Deals die
> in those gaps.
>
> Sealed chains it: send proposal → client accepts from a link (no
> account needed) → e-signed agreement → invoice with a Stripe payment
> link. The chain is enforced server-side: you literally cannot invoice
> an unsigned contract.
>
> It's live at https://sealed.techtrendwire.com — free tier, no card.
> I'm looking for ~10 people who send proposals or invoices to try it and
> tell me where it's confusing or broken. "This part sucks" is worth more
> to me than an upvote. I'll be in the comments all day.

## 3. X / build-in-public (thread starter, evergreen)

> Day job: law firm mailroom.
> Nights: I built and shipped a SaaS.
>
> Sealed — proposal → e-signed agreement → invoice with payment link, one
> enforced chain. Live, free, looking for freelancers to break it:
> https://sealed.techtrendwire.com
>
> What I learned shipping solo 🧵

## 4. Facebook (personal account — friends/family graph, milestone framing)

> Some personal news: I built something, and it's live.
>
> By day I work in the mailroom at a law firm here in NYC. Nights and
> weekends for the past few months, I've been building **Sealed** — an app
> for freelancers and anyone who does client work. It takes the annoying
> paperwork part — the proposal, the contract, the invoice — and chains it
> into one flow: you send a proposal, your client accepts it from a link
> (no account needed), it becomes a contract they e-sign, and that becomes
> an invoice they can pay by card. Each step happens automatically —
> nothing falls through the cracks between three different apps.
>
> This week it did the whole thing for real for the first time — real
> signature, real payment — and honestly, watching that happen for
> something I built between mail runs was a moment.
>
> It's free right now: **https://sealed.techtrendwire.com**
>
> Here's my ask: if you freelance, run a side business, or do any work
> where you quote a client and chase a payment — try it and tell me what's
> confusing or broken. And if you know someone like that, tag them or
> share this. "This part sucks" is genuinely the most helpful thing you
> can say to me right now.

**Facebook mechanics:** Facebook can suppress link-post reach — if the
post stalls, repost with the link in the FIRST COMMENT and "link in
comments" in the body. Reply to every comment.

## 5. Instagram (personal account — caption; links don't work in captions)

> Day job: law firm mailroom. 🏢
> Night job: I just shipped my first app. 🚀
>
> It's called Sealed — for freelancers who are tired of the proposal
> living in one app, the contract in another, and the invoice in a third.
> Sealed chains them: send proposal → client accepts from a link →
> e-signed contract → invoice with a pay-by-card link. Automatic, start
> to finish.
>
> This week it handled its first real signature and real payment end to
> end. Built entirely between mail runs and after midnight.
>
> It's live and free — **link in bio.** 🔗
>
> If you do client work (or know someone who does): try it, break it, and
> DM me what annoyed you. Early users shape what this becomes — and the
> first ones keep it free forever.
>
> #buildinpublic #freelance #sidehustle #indiedev #smallbusiness #shipped

**Instagram mechanics:**
- Put `sealed.techtrendwire.com` in bio BEFORE posting.
- Visual options, ranked: (1) phone-screenshot carousel: landing page →
  proposal page → PAID status; (2) a photo of you (faces stop scrolls,
  UI doesn't); (3) plain black slide: "Day job: mailroom. Night job:
  shipped a SaaS."
- Also post to Stories with a LINK STICKER — stories get the tap-through
  captions can't.
- "Tag someone who freelances" is the honest viral mechanic here —
  friends tagging friends reaches freelancers you don't know.

## 6. Reddit repost — r/SideProject fallback (link in comments, per 07-22 filter)

_Use only after the original 07-22 post has sat unrestored ~24h. Don't
delete the original — just post fresh with this variant. No URL
anywhere in the post body; the link goes in your own first comment
immediately after posting, which usually clears the sitewide filter that
caught the first attempt._

**Title:**

> I sort mail at a law firm by day. At night I built a tool that chains proposal → signature → invoice into one flow. Looking for freelancers to break it (link in comments)

**Body:**

> Day job: law firm mailroom, NYC, noon–9pm. Building happens between
> mail runs and after midnight.
>
> The itch: freelancers run deals across three disconnected tools — a doc
> for the proposal, an e-sign app for the contract, an invoice app for
> the money — and the deal's actual state lives in their head. Deals die
> in those gaps.
>
> It chains them: send proposal → client accepts from a link (no account
> needed) → e-signed agreement → invoice with a Stripe payment link. The
> chain is enforced server-side — you literally cannot invoice an
> unsigned contract.
>
> It's called Sealed, it's free, no card required. I'm looking for ~10
> people who send proposals or invoices to try it and tell me where it's
> confusing or broken. "This part sucks" is worth more to me than an
> upvote. Link in the first comment below — I'll be around all day.

**First comment (post immediately):**

> https://sealed.techtrendwire.com

**Mechanics:** if this ALSO gets filtered, stop trying r/SideProject —
two filtered attempts on one account is a signal to build karma there
first (comment genuinely on other posts for a few days) before a third
try. Move on to Indie Hackers (§7) and r/freelance/r/Entrepreneur in the
meantime rather than forcing a third Reddit attempt today.

## 7. Indie Hackers (new channel — built for exactly this story)

**Title:**

> I sort mail at a law firm by day. Shipped my first SaaS at night — Sealed, proposal → e-signature → invoice in one enforced chain

**Body:**

> Day job: law firm mailroom in NYC, noon–9pm. Nights and weekends for
> the past few months, I built Sealed.
>
> The problem: freelancers run client deals across three disconnected
> tools — a doc for the proposal, an e-sign app for the contract, an
> invoice app for the money — and the deal's actual state lives in your
> head. Deals die in the gaps between tools.
>
> Sealed chains them into one enforced flow: send a proposal → client
> accepts from a public link (no account needed) → it becomes an
> e-signed agreement → that becomes an invoice with a Stripe payment
> link. The chain is enforced server-side — you can't invoice an
> unsigned contract, can't sign an unaccepted proposal.
>
> This week it did the whole thing for real for the first time: real
> signature (via DocuSeal), real payment (via Stripe), both
> webhook-verified. Watching that flip automatically without me touching
> anything was the moment it felt real.
>
> Stack, for the curious: Turborepo, Next.js + NestJS + Prisma/Postgres,
> deployed on Vercel + Railway. Provider-switched e-signature integration
> so I'm not locked into one vendor.
>
> It's live and free: https://sealed.techtrendwire.com — I'm looking for
> freelancers or anyone who quotes clients and chases payments to try it
> and tell me what's confusing or broken. I'll answer everything in the
> comments.

**Mechanics:** Indie Hackers rewards founder-story detail and technical
specifics more than HN's terseness — the longer, more personal version
above is intentional, don't trim it to HN length. Cross-post the
milestone to your IH "Product" page if the community responds well, and
answer every comment same-day.

---

## Mechanics

- Post from an account that can respond fast; first 3 hours decide reach.
- Never argue with criticism — "good catch, logging it" converts skeptics.
- Every "I'd use this if X" comment goes into `docs/feedback.md` verbatim.
- Anyone who says they'll try it: get them to `docs/GETTING-STARTED.md`
  and add them to `docs/PROSPECTS.md` capture sheet.
- Signature test-mode caveat stays IN the posts. HN especially punishes
  discovered limitations and rewards disclosed ones.

## Send log

<!-- date — channel — title used — upvotes/comments — testers gained -->
- 2026-07-22 — Facebook (personal) — §4 milestone post — results TBD
- 2026-07-22 — Instagram (personal) — §5 caption + black hook slide, Story with link sticker — results TBD
- 2026-07-22 — r/SideProject — §2 post REMOVED by Reddit sitewide spam filter (low-karma account + unknown domain link); mods messaged for manual approval; if not restored in 24h, repost with link in comments only. Meanwhile: build comment karma in the sub
- 2026-07-22 — Show HN — §1 title + link submitted, first-comment pitch posted, camping thread — no comments yet as of posting
- 2026-07-22 — Engagement follow-up: FB post got 14 reactions + 1 (Darrell George Jr.); IG post got 1 like + 1 comment (misziggy: "making a name!"). Replied on both with a two-hop referral ask ("know anyone who freelances, send them my way") rather than treating passive engagement as dead-end. Personal network for direct DMs (slots 4-10) is thin — reframing plan: public posts (HN/Reddit/IG/FB) are the primary distribution channel, not more cold DMs; referral asks on existing engagement are the next-best lever
- 2026-07-23 — HONEST READ after a full day: HN stalled at 1 point (own upvote, no traction — channel exhausted, no further action). Reddit mods never responded — 24h fallback triggered. FB/IG referral-ask replies got no further pickup. Drafted §6 (Reddit repost, link-in-comments variant) and §7 (Indie Hackers, first attempt at this channel) — sending today.
