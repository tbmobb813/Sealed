# Sealed — Voiceover Scripts

Two versions. Use the short one for DM attachments (pairs with
`sealed-highlight-demo.mp4`); use the full one when you actually sit down to
record a new, complete, narrated walkthrough — it goes further than any
existing recording (those all start mid-session, already logged in; this one
starts at signup).

Tone: same voice as the OUTREACH.md drafts — direct, first-person builder,
no hype adjectives. Read it like you're showing a friend, not pitching a room.

---

## Short version (~45–50s) — matches `sealed-highlight-demo.mp4`

Four cuts, no dead air. Lines are short on purpose — they should finish
slightly *before* each screen transition, not run over it.

**[0:00–0:08] Cut 1 — proposal created → sent**
> "This is Sealed. I send a proposal — line items, price, one click —
> and it goes straight to the client. No PDF, no separate e-sign tool yet."

**[0:08–0:16] Cut 2 — proposal accepted → creating agreement**
> "They accept it from a link — no account needed on their end. The second
> they do, it unlocks the next step: turning it into a signed agreement."

**[0:16–0:30] Cut 3 — sent for signature → SIGNED**
> "Send it for signature, they sign, and it flips to SIGNED automatically.
> I'm not emailing a contract back and forth or chasing a 'did you get it?'"

**[0:30–0:48] Cut 4 — invoice created → sent with payment link**
> "Signed work becomes an invoice with a Stripe payment link, already
> attached. That's proposal to paid, one thread, nothing falling through
> the gaps."

*(Optional closing card, no VO needed: "sealed.techtrendwire.com — try it
free.")*

---

## Full version — signup through paid invoice

This one doesn't exist as a recording yet — none of the current clips start
at signup. Recording this properly means starting logged out. Use an
incognito/private window or sign out first so the signup step is real, not
skipped.

Estimated runtime: **2:30–3:30** depending on pacing. Don't rush the
accept/sign/pay moments — those are the proof, not the filler.

### Scene 1 — Landing page (0:00)

**Screen:** sealed.techtrendwire.com, logged out

> "This is Sealed — it takes a client from proposal to signed agreement to
> paid invoice in one flow, one link. I built it because those three things
> always live in three different tools, and deals die in the gaps between
> them. Let me show you the whole thing, start to finish."

### Scene 2 — Sign up (0:10)

**Click "Get started" → sign up with email/Google*
> "Signing up takes about two minutes — email or Google, that's it. No
> onboarding form, no setup wizard. Your workspace is just... there."

### Scene 3 — Dashboard, first look (0:25)

**Land on empty/near-empty dashboard*
> "This is the dashboard. Open proposals, pending agreements, outstanding
> invoices — everything's status-tracked from here. Right now it's empty
> because we haven't done anything yet, so let's fix that."

### Scene 4 — Add a contact (0:35)

**Contacts → Add Contact*
> "First, the client. Name and email — that's the only thing that matters,
> because the email is where their proposal actually goes."

### Scene 5 — Create a proposal (0:50)

**Proposals → Create Proposal → fill title, line items, price*
> "Now the proposal. Title, line items, price per item — totals calculate
> themselves. You can set an expiration if you want to create urgency, but
> that's optional."

### Scene 6 — Send it (1:10)

**Hit Send*
> "Hit send, and that's it on my end. The client gets an email with a
> private link — no login, no account, nothing to install."

### Scene 7 — Client-side view and accept (1:20)

**Switch to the client link — a second browser/incognito window*
> "This is what they see. Clean, no clutter — the proposal, the price, and
> two buttons: accept or decline. To accept, they just type their name —
> that's the consent, that's it."
*(client types name, clicks Confirm Acceptance)*
> "And the second they do, my dashboard updates. SENT, VIEWED, ACCEPTED —
> live, not something I have to go check on."

### Scene 8 — Turn it into an agreement (1:45)

**Back on internal dashboard → Agreements → Create from the accepted proposal*
> "Once it's accepted, I can turn it into an agreement — the actual signed
> contract. Sealed won't even let me skip ahead to this until the proposal's
> accepted. That's on purpose."

### Scene 9 — Send for signature (2:00)

**Fill agreement terms → Send for Signature*
> "I add the terms, hit send for signature, and it goes out through
> DocuSeal — legally binding e-signature, not a scanned PDF."

### Scene 10 — Client signs (2:15)

**Client-side signature flow*
> "On their end, they sign right in the browser. No printing, no scanning,
> no 'sign and send it back.'"

### Scene 11 — SIGNED, automatically (2:30)

**Back on dashboard — status flips to SIGNED*
> "The moment they sign, it flips to SIGNED on my side automatically. I'm
> not refreshing my inbox wondering if it came back yet."

### Scene 12 — Create the invoice (2:40)

**Invoices → Create from the signed agreement*
> "Signed work becomes an invoice — again, only unlockable once the
> agreement's actually signed. The amount's already pulled in from the
> agreement, so there's no retyping numbers."

### Scene 13 — Send the invoice (2:55)

**Hit Send*
> "Send it, and the client gets an invoice email with a real Stripe payment
> link attached — they pay by card, right there."

### Scene 14 — Client pays → PAID (3:05)

*Client clicks payment link, completes checkout (Stripe test mode is fine
for a demo — say so on camera if using test card numbers)*
> "They pay, and it flips to PAID on its own. No marking it paid manually,
> no chasing a Venmo screenshot. That's the whole loop — proposal to cash,
> one thread, and I never had to leave the app or open a second tool."

### Closing (3:25)

**Back on dashboard, showing the completed record*
> "That's Sealed. It's live and free right now at
> sealed.techtrendwire.com — if you send proposals or quotes for a living,
> I'd genuinely like to know where this breaks for you."

---

## Notes for whoever records this (probably future-you)

- **Use a fresh/demo contact**, not a real client — same pattern as the
  existing `Jordan Vale (Vale Creative Co.)` test contact already in the
  account.
- **Stripe test mode**: if `STRIPE_SECRET_KEY` is in live mode, either swap
  to a test key for this recording or say on camera that you're skipping
  the live charge — don't silently fake a "PAID" status.
- **Two windows side by side** (internal dashboard + client link) makes
  scenes 7 and 10 much clearer than tab-switching — worth the extra setup
  time.
- **Record in one continuous take if possible.** Cutting between scenes is
  fine for editing later, but a single take avoids re-establishing state
  (proposal IDs, contact names) between clips.
