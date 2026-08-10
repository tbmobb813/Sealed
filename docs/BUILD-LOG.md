# Build-in-Public Log

Started 2026-08-10. Purpose: a running place to drop raw material the moment
something ships, so there's always a backlog of real posts instead of a
blank page when it's time to post. Same "capture first, shape later" rule
as `docs/feedback.md` — add a rough note here immediately, polish it into
a post when you actually sit down to post.

**No asks in these posts.** That's the whole point of build-in-public vs.
the launch/outreach pushes in `docs/LAUNCH-POST.md` and `docs/OUTREACH.md`
— this is documentation, not a pitch. Let people opt in on their own time.

**Cadence:**
- **X**: 2–3x/week, short, no hashtags, no hype.
- **LinkedIn**: ~weekly, roll up 2–3 X-sized items into one slightly more
  reflective post rather than mirroring X 1:1 — that audience is warmer
  and a rapid-fire feed reads as noise there.
- Reddit / HN / Indie Hackers: not part of this cadence — see
  `docs/GTM-REPORT.md` for why (one-shot-post platforms, already tried,
  audience-mismatch or mechanically broken, not a build-log format).

---

## Ready to post (X)

_Drafted 2026-08-10 from real work done that session — nothing invented.
Delete or check off each one once posted, log it under "Posted" below._

- [ ] **The three-bugs-at-once deploy story:**
  > Spent an evening chasing why my API stopped deploying. Turned out three
  > things were broken at once: a config path issue from a library
  > upgrade, a GitHub connection that had silently died a month ago
  > (nobody noticed because nothing needed deploying), and a shell command
  > that was never actually valid syntax on the platform I use. Fixed all
  > three, confirmed the fix by actually hitting the live health endpoint
  > instead of trusting a green checkmark. Ship it, then go verify it
  > shipped.

- [ ] **Webhook reliability:**
  > Added a dedup ledger so a webhook that gets delivered twice
  > (Stripe/DocuSeal/Clerk all retry on failure) can't double-charge or
  > double-process anything. Boring infrastructure work nobody sees until
  > the one day it saves you. That's most of what "reliable" actually is.

- [ ] **Self-pentest (strong one — lead with this or #4):**
  > Ran a pentest on my own app before pushing for more users. Made a fake
  > account, tried to view another customer's invoices by guessing the
  > URL. 404. Tried a forged auth token. Rejected. Tried getting my own
  > app to leak another tenant's data three different ways. Couldn't.
  > Small win, but the kind you want confirmed before real money and real
  > client data are on the line.

- [ ] **Shipped-it-then-found-the-bug-in-my-own-fix (strong one):**
  > Added a robots.txt and social preview card so links I share actually
  > look like something instead of a blank box. Deployed it. Went to
  > double check it actually worked live — turned out my own login system
  > was blocking Google and every social-media bot from ever seeing those
  > files. Fixed in an hour. The lesson holds: check the live thing, not
  > the deploy log.

- [ ] **Positioning tweak:**
  > Realized my landing page copy kept saying "freelancers" everywhere,
  > which quietly tells a photographer, a consultant, or a handyman with
  > a quote book that it's not for them. Fixed the copy. Small thing, but
  > "who is this for" is doing a lot of unpaid work in a page nobody reads
  > past the first ten seconds.

- [ ] **Zoom-out / slow-week filler:**
  > Two weeks into building Sealed at night around a full-time job. This
  > week: found and closed a handful of real security gaps, fixed a
  > webhook reliability bug, and caught a deploy that had quietly been
  > broken. None of it is a feature. All of it is the difference between
  > a toy and something someone can actually run their business on.

## Ready to post (LinkedIn — lower frequency, more reflective)

- [ ] _Roll up 2–3 of the above once there are a few X posts out — draft
  here when that day comes rather than pre-writing now, since the exact
  rollup should reflect what actually got posted._

## Posted

<!-- date — channel — which post — any reaction -->

- 2026-08-10 — X — Comparison pages (3-pages-not-1 SEO reasoning)

## Raw material (unshaped — drop notes here the moment something ships)

<!-- one line is fine: what happened, why it's interesting, don't polish it here -->

- 2026-08-10 — Shipped three "Sealed vs X" comparison pages (Dubsado, HoneyBook, Bonsai) plus an /alternatives hub page that rounds them up. Each vs/ page targets a specific head-to-head search query; the hub targets broader "alternatives to X" searches without diluting the individual pages. First real SEO/pull-intent play distinct from the direct-outreach push — worth a post on why comparison pages instead of one big page (the "why 3 pages not 1" reasoning is itself decent content).
- 2026-08-10 — Twice caught the new pages 404ing for search engines/crawlers right after deploy (Clerk middleware blocks anything not explicitly listed as public) before verifying live — same root cause as the earlier robots.txt/OG image bug from launch week. Consistent enough now to be a pattern worth naming: every new public route needs an explicit middleware exemption or it's invisible to the exact audience it's for.
