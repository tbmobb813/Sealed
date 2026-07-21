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
