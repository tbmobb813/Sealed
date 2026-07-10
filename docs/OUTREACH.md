# First-10 Outreach Drafts

_Drafted 2026-07-10. Goal: 10 freelancers trying Sealed and reporting where it
breaks. The ask is feedback, not sign-ups — at n=10 a reply beats a
registration._

**Constraint to stay honest about:** until go-live hardening (Resend domain,
Dropbox Sign paid plan, Clerk production instance — see tasks.md), a tester's
emails to *their* clients won't deliver; test tiers only send to the account
owner. So the pitch is "try it and tell me where it breaks," not "run your
business on it."

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
> It's live and free right now: https://sealed-api.vercel.app
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
> agreement (Dropbox Sign) → invoice with a Stripe payment link. The chain
> is enforced — you literally can't invoice an unsigned contract.
>
> It's free and early. I'm looking for ~10 freelancers to try it and tell
> me what's wrong with it before I take it further. Not selling anything —
> the most valuable thing you can give me is "here's where I got confused."
>
> [link] — I'll be in the comments answering everything.

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
