# Sealed — GTM Report

_Written 2026-08-04, using the GTM Engine framework (`~/Desktop/gtm-framework.html`) as
the structure. Grounded in `tasks.md`, `docs/OUTREACH.md`, `docs/PROSPECTS.md`,
`docs/LAUNCH-POST.md`, and `docs/feedback.md` as of this date — not invented._

## The honest read first

The framework this report follows is written for a pre-launch product asking
"how do we get our first users." That's not where Sealed is. Sealed is
**14 days past its first distribution push, across 5 channels, with zero
external replies.** X: 18 views, 0 replies. LinkedIn: 73 impressions, 2
reactions, 0 comments. Reddit: post removed by spam filter before anyone saw
it. Show HN: 1 point (your own upvote), 0 comments. Indie Hackers: the
posting page itself is broken — can't confirm the post is even live. The 3
warm DMs (Mars, filmmaker friend, sister) and 7 cold IG DMs to niche prospects
are still sitting at "awaiting reply" in the capture sheet.

That is not "the product is bad" signal. Zero-of-five channels producing
literally nothing — not even a hostile comment — is a **reach** failure, not
a **reception** failure. You don't have negative data yet; you have no data.
The fix is not a new landing page or a repositioning exercise. It's getting
in front of actual humans who fit the ICP, one conversation at a time, until
you have 5-10 real reactions to work with. Everything below is written
against that reality, not against a generic "launch checklist."

---

## 1. Positioning & Messaging

**Headline (already in use, and it's good — keep it):**
> "I work in a law firm mailroom; I built a proposal→e-sign→invoice tool at
> night."

This is your actual differentiator and you already found it: not a feature,
a *builder-credibility* hook. Nobody else selling to solo freelancers has
"built this between mail runs" as their story. Don't bury it — it's stronger
than any feature description you could write.

**Subheadline:** Sealed chains a freelancer's client paperwork into one
enforced flow — proposal → client accepts (no account) → e-signed agreement
→ invoice with a Stripe payment link. The state machine won't let you skip a
step; deals can't die in the gap between the Google Doc, the e-sign tool, and
the Venmo request the way they do when it's three disconnected tools.

**ICP** (this is already precisely defined in `docs/PROSPECTS.md` — restating
it here because positioning should be written *to* it, not around it):
- Sends proposals or quotes to win work (not marketplace-only — Upwork/Fiverr
  escrow already solves this for them)
- Invoices clients directly — Stripe, PayPal, bank transfer, or "Word doc and
  prayer"
- Solo, up to ~3 people — paperwork is still personal, not delegated
- Reachable warm or lukewarm — you, or one hop from you

**Named competitors** (from your own disqualifier list): HoneyBook, Dubsado,
Bonsai. Your wedge against them isn't features — they have more. It's price
(free right now vs. their $20-40+/mo) and simplicity (one enforced chain vs.
their sprawling all-in-one CRM surface). Don't try to out-feature them in
copy. Say the thing that's true: "Dubsado has 40 things I don't need yet.
Sealed has the four that matter: propose, sign, invoice, get paid."

**Message hierarchy:**
1. One link replaces the proposal→sign→invoice paperwork chain
2. Free right now, built by a solo founder who does this job at night
3. For freelancers small enough that "the paperwork" is still your job, not
   an assistant's

---

## 2. Organic Channel Diagnosis (not "strategy" — you already ran the strategy)

The framework's default advice is "post to 4-5 organic channels." You did
that. Here's what actually happened, channel by channel, and what it means:

| Channel | Result | Diagnosis | Verdict |
|---|---|---|---|
| Show HN | 1 point (self), 0 comments | HN's audience is builders, not freelancers — you got exactly the outcome the channel-strategy doc predicted ("expect feedback > customers," and you got neither). Not a failure of execution, a mismatched audience. | **Deprioritize.** Right call to try once; wrong ICP to keep pushing. |
| LinkedIn | 73 impressions, 2 reactions, 0 comments | Reactions with zero comments = people who know you acknowledged the post and moved on. This is the *warmest* audience you have (your actual network) and it still didn't convert to conversation. | **Diagnose the ask, not the channel** — see below. |
| X | 18 views, 0 replies | Cold audience, no existing following = a post into the void. Expected outcome for a 0-follower account. | **Deprioritize until you have any following**, or use it purely for public build-log, not launch pressure. |
| Reddit (r/SideProject) | Removed by spam filter | This is a **mechanical** failure (karma/account-age threshold), not a market rejection. You never actually reached an audience. | **Fix and retry** — see action item below. |
| Indie Hackers | Page itself broken, can't confirm post is live | Also mechanical, not market signal. | **Fix or abandon** — low priority, small audience anyway. |
| 10 direct DMs (3 warm + 7 cold IG) | All still "awaiting reply" | This is your highest-quality channel and it hasn't had time to fully play out yet (7 of them sent 07-29, only ~6 days old as of this report). | **This is the channel.** Everything else is noise next to it. |

**The actual finding:** two of your five public channels failed for
mechanical reasons (Reddit filter, IH broken page) — meaning they never
tested anything. Two failed for predictable audience-mismatch reasons (HN,
X) — also not real signal. LinkedIn is the one channel where your actual
network saw the post and didn't engage, which is worth sitting with: **your
warmest 73 people saw it and 0 asked a follow-up question.** That's more
informative than all the cold-channel silence combined.

### Why LinkedIn likely produced acknowledgment but not conversation

Re-reading the LinkedIn post framing against the DM variants in
`docs/OUTREACH.md`: the DMs ask a direct, specific question ("could you mock
up one engagement and tell me what's missing") — an action with a low bar.
A public "personal news" post inherently asks nothing; a "like" is the
whole available response. If the LinkedIn post didn't end with a direct,
personal, low-effort ask, that's the fix, not the platform.

---

## 3. Paid Channels

Skip entirely. The framework's own warning applies doubly here: paid
amplifies a working funnel, and you don't have signal that the funnel works
yet — you have silence. Spending money to get more silence faster is not
useful information. Revisit only after you've had 5-10 real conversations
that produced *some* reaction (positive or negative) to react to.

---

## 4. Next-14-Day Plan (not "launch sprint" — this is a restart)

**Days 1-3: Fix the two mechanical failures**
- Reddit: check why the post was filtered (new-account karma threshold, per
  `feedback.md`'s own root-cause note — 47 vs 50 threshold). Either build
  karma with genuine participation first, or post from an account that
  clears the threshold. Don't repost blind into the same filter.
- Indie Hackers: confirm whether the site's JS error is still present. If
  still broken after 2+ weeks, deprioritize it — small enough audience that
  it's not worth more time chasing a broken tool.

**Days 1-7: Work the DM channel harder — it's the only one with real signal**
- Follow up on all 10 pending DMs per the existing 3-5 day nudge cadence
  already drafted in `docs/OUTREACH.md` §3. Several are now past that
  window.
- Don't wait for these 10 to resolve before finding more. Per
  `docs/PROSPECTS.md`'s own mining list — phone contacts, Instagram follows
  of local service businesses, Mars's network, sister's startup circle,
  former coworkers who freelance — get to 20 total warm/lukewarm contacts,
  not 10. Zero-of-ten replied is a small sample; zero-of-twenty starts being
  real signal.

**Days 7-14: Get to 5 real conversations, however small**
- The goal is not signups. It's 5 people who actually looked at Sealed and
  told you one true thing about it — even "not for me because X." That's
  the first row in `docs/feedback.md`, which is currently empty. An empty
  feedback log after 2 weeks of "launch" is the single most important fact
  in this whole report.
- If you get to 20 warm contacts and still have near-zero response *rate*
  (not zero absolute — rate), that's when you have real data suggesting a
  positioning or targeting problem, not a distribution-volume problem. You
  are not there yet.

---

## 5. Success Metrics

**North star for this phase: conversations, not signups.** MRR/signups are
the wrong north star while `feedback.md` is empty — you cannot optimize a
funnel you have no data on. The metric that unblocks everything else is: how
many of the ICP have actually looked at Sealed and reacted.

| Metric | Current | Target (14 days) | Why |
|---|---|---|---|
| Warm/lukewarm contacts reached | 10 | 20 | Below 20 for a 0-audience solo founder isn't a real sample |
| Entries in `docs/feedback.md` | 0 | 5+ | The actual deliverable — patterns across real reactions |
| Response rate on direct DMs | 0/10 (early, some still in window) | track honestly, don't round up | Tells you DM quality, independent of public-channel noise |
| Public-channel spend | 5 channels, ~2 weeks | 0 additional until DM channel plateaus | Don't add channel #6 while channel #1-5's actual lesson (DMs work, cold posts don't) hasn't been acted on |

---

## 6. Founder Advantage

You have it and you're already using it — the mailroom story is genuinely
rare and it's the reason to lead every conversation with it, not bury it
after a feature list. The risk is under-using it in the channels that
matter most (LinkedIn, DMs) by defaulting to product-description language
instead of the story. Every message variant in `docs/OUTREACH.md` should
open with a version of "I built this at night around a full-time mailroom
job" before it says anything about proposals or invoices.

## 7. Biggest Risk

Not "the product doesn't work" — it's fully verified end-to-end with real
signatures and real money. The actual risk is **mistaking channel-mechanics
failures (Reddit filter, broken IH page) and audience-mismatch failures (HN,
X) for market rejection**, and either giving up on distribution or pivoting
the product before you've had a single real conversation. Two of five
channels never even tested the market. Don't let that silence read as a
verdict.

---

## 8. Psychological Principles Applied to Sealed

Only the ones with real leverage at this stage — no padding for the sake of
covering all nine generically.

**Sell Benefits, Not Features.** Every outreach variant already does this
well ("send one link... they see it, sign it, pay it" vs. a feature list).
Keep doing it. The one place it's weaker is the LinkedIn post if it framed
Sealed as a product announcement rather than "here's the outcome for you."

**Power of Free.** "It's live and free" is already the lead in every DM
variant — correct, keep it there. The gap: nowhere in the current outreach
does it say *how long* it stays free or what happens later. Ambiguity about
future pricing can quietly suppress trial for a cautious freelancer type
(exactly your ICP — people who got burned by a Word-doc-and-prayer invoice
once are cautious by nature). Consider one line: "Free while I'm building
this out with real users like you" — frames free as a deliberate, honest
phase, not a bait-and-switch risk.

**Contrast Effect.** You have real named competitors (HoneyBook, Dubsado,
Bonsai) and haven't used them in outreach copy yet. A single line —
"Dubsado starts at $20/mo and takes a weekend to set up. Sealed is free and
takes ten minutes" — makes the free-and-simple positioning concrete instead
of abstract. Use only where you're confident on your own setup time; don't
guess at claims you can't back up if someone reads closely.

**Endowment Effect.** Not yet applicable — nobody has used the product long
enough to feel ownership over anything in it. Revisit once you have any
active users with real proposal/invoice history in their dashboard; the
IKEA/Endowment principles matter for *retention*, which isn't the current
bottleneck. Trying to apply them now would be optimizing a stage you haven't
reached.

---

## What this report is not

It's not a repositioning plan, a new landing page brief, or a pivot
argument. Nothing here says change the product or the pitch. Everything
here says: the sample size is too small and two of five channels were
mechanically broken — get the sample size up before drawing any conclusion
about whether Sealed's positioning works.
