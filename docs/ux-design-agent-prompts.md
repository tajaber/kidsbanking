# KidsBank — UX/UI Design-Agent Prompt Pack

**Owner:** Caldwell (UX Strategist) · **Audience:** founder (@tajaber) + any UX/UI design AI agent
**Purpose:** a single, reusable, copy-paste-ready prompt file that drives a design AI to produce a **modern, catchy, attractive visual design** for the whole KidsBank app — for **kids** and **assigners** (parents, co-parents, teachers, moderators).

---

## 0. How to use this file

1. **Feed ONE chunk at a time.** Each chunk (A–G) is a self-contained prompt. Paste the **Global Design Brief** reference *plus* the chunk into the design agent. Don't dump the whole file at once — the agent goes deeper when scoped to a few screens.
2. **Iterate per chunk.** Review the agent's output, give targeted feedback ("make the kid points number bigger / add the empty state / show the RTL mirror"), and re-run the same chunk until it's right *before* moving on.
3. **Keep tokens consistent.** After Chunk A produces the design tokens (color, type, spacing, radius, elevation, motion), **paste those exact tokens into every later chunk** so all screens stay cohesive. See the Consistency Checklist (§ End).
4. **Order matters.** Do **A first** (it establishes auth + the token system), then B–G in any order. D and E share adult components, so do them back-to-back if possible.
5. **Each chunk already restates** the brief reference, audience, RTL, accessibility, responsive, and output-format requirements, so a chunk works even if pasted alone.

> Tip: keep a running "design system" doc. Every time the agent invents a new token, component, or name, paste it back in the next prompt so it reuses rather than reinvents.

---

## 1. GLOBAL DESIGN BRIEF (reused by every chunk)

> Paste this whole section at the top of any chunk, or say *"Use the KidsBank Global Design Brief defined earlier"* if the agent retains context.

### 1.1 What KidsBank is
KidsBank is a motivation & reward app. **Kids earn points in-app** by completing tasks/goals assigned by adults. **Assigners** (parents, co-parents, teachers, moderators) create tasks, approve completions, and later **redeem** points by giving real money/gifts *outside* the app and marking them redeemed. It is **not** a payment app. A kid can be connected to multiple assigners, each keeping a **separate per-assigner point balance** ("multiple bank account numbers for the same kid").

### 1.2 Brand personality
- **Trustworthy + playful.** Safe and reassuring for kids; credible, controlled, and professional for adults.
- **Encouraging, never gambling.** Celebrate effort and progress. **No casino/slot-machine cues**, no flashing jackpots, no fake urgency, no streak-guilt, no dark patterns.
- **Calm and clear.** Predictable layouts, gentle motion, generous spacing.

### 1.3 Two cohesive visual modes (same DNA, different energy)
Design **one shared token system** with **two theme expressions**:
- **Kid Mode** — colorful, gamified, rewarding. Rounded shapes, big friendly numbers, mascot/character, stars/coins/badges metaphor, playful celebratory micro-animations, icon-forward (reading-light). One primary action per screen.
- **Assigner Mode** — clean, efficient, data-clear. Calmer palette, denser information, strong tables/cards, clear status, audit/history affordances, trust signals (assigner labels, MFA status, "I paid offline" attestation). Professional but warm — not corporate-cold.
- Both share the same logo, type family, spacing scale, and core iconography so they feel like **one product wearing two hats**. Provide a subtle **per-role accent** so an adult always knows "which hat" they're wearing.

### 1.4 Color direction
- A **trust-anchor brand color** (recommend a friendly deep blue/teal) + a **warm reward/accent** (recommend amber/gold for points & coins) + **success green**, **caution amber**, **danger red** semantic set.
- **Kid mode** leans into a brighter, higher-saturation, multi-hue playful palette built from the same base hues.
- **Assigner mode** uses lower-saturation, more neutral surfaces with the brand color for primary actions.
- Provide **light AND dark** themes for both modes. Meet **WCAG 2.1 AA** (≥4.5:1 body text, ≥3:1 large text/icons). **Never use color alone** — always pair with icon + label (status, points up/down).

### 1.5 Typography
- One legible, friendly, **multi-script** family (must include **strong Arabic** coverage). Recommend a humanist sans (e.g. a Cairo/IBM Plex Arabic + Latin pairing or equivalent) — kid-friendly, not childish.
- Clear type scale: oversized display for kid point totals; readable, dense-friendly sizes for adult data. Respect OS dynamic type; layouts reflow without clipping; allow **30–40% text expansion** for localization.

### 1.6 Iconography
- Consistent, rounded, friendly icon set. Define **core verb icons once** and reuse everywhere: **assign, complete, approve, reject, gift/bonus, redeem, history, points/coin, badge, streak.**
- Kid icons can be more illustrative; adult icons more utilitarian — same geometry/stroke so they're clearly one family.
- **Direction-aware icons** (back, arrows, progress, next) must mirror in RTL. **Do NOT mirror** non-directional icons (clock face, logo, avatars).

### 1.7 Motion
- Purposeful, gentle, fast (150–300ms). Kid celebrations (task done, points earned, badge unlocked) are delightful but calm — **no overstimulation**.
- **Honor "reduce motion"**: every celebration has a static fallback. Audio cues optional and mutable; never required to understand state.

### 1.8 Component style
- Card-based. Soft corners, soft elevation. Touch targets **≥44–48px** with forgiving hit areas (especially kid). Visible **:focus** states. Clear primary/secondary/tertiary button hierarchy. Chips for filters/per-source balances. Inline approve/reject action cards. Badges for counts (approvals).
- Every interactive component must show its **states: default, hover/focus, pressed, disabled, loading, error, success.**

### 1.9 Accessibility (mandatory, every screen)
WCAG 2.1 AA contrast; don't rely on color alone; ≥44–48px targets; screen-reader labels & logical order; visible focus; reduced-motion fallbacks; plain language; inline, kind, specific error messages; alt text for avatars/illustrations. Accessibility doubles as child-friendliness.

### 1.10 RTL / Arabic / localization (mandatory, every screen)
- Provide **both an LTR (English) and a fully mirrored RTL (Arabic) version** of every screen. Use **logical start/end**, not left/right. Mirror nav, progress, directional icons; keep non-directional icons & brand upright.
- No hard-coded strings; design for **complete real Arabic** (not a token subset). Handle **bidi** (Latin name inside Arabic UI) with isolation. Locale-aware numbers/dates.

### 1.11 Multi-currency
- Points are universal. **Money framing lives in adult surfaces** (kids see points/stars by default; a soft "worth about…" only if a guardian enables it). Show currency as **symbol + code** (e.g. "$ USD", "AED", "€ EUR") with a clear currency switcher. Conversion preview example baseline: **10 pts = $5 / €4 / 20 AED**.

### 1.12 Responsive
- **Mobile-first.** Kid & auth use a **phone frame / single column**. Adults get a **mobile bottom-tab** layout AND a **web dashboard** with left sidebar + top context bar. Cards reflow 4→2→1.

### 1.13 Deliverable expectations (what the agent must return for every chunk)
1. **High-fidelity mockups** of each requested screen, in **Kid or Assigner mode** as specified, in **light + dark**, and in **LTR + RTL (Arabic)**.
2. All **key states** per screen: empty, loading, error, success (and waiting/pending where relevant).
3. **Responsive variants**: mobile, plus web dashboard for adult screens.
4. **Reusable components** introduced, with names + variants/states.
5. **Design tokens used/added** (color, type, spacing, radius, elevation, motion).
6. **Annotations**: tap targets, contrast notes, motion notes, RTL mirroring notes, accessibility/aria intent.
7. **Redlines/specs** sufficient for a developer to build.

---

## 2. PROMPT CHUNKS

Each block below is **ready to copy**. Begin every paste with: *"Use the KidsBank Global Design Brief (§1) above. Output per §1.13."*

---

### Chunk A — Onboarding & Auth

```text
ROLE: You are a senior product designer. Use the KidsBank Global Design Brief (§1).
Establish the foundational token system here — every later screen reuses it.

DESIGN THESE SCREENS:
1. Landing / Role Select — five role cards: Parent, Co-Parent, Teacher, Moderator, Kid.
   Adult cards lead to login; the Kid card leads to QR onboarding. Show clear visual
   distinction between "adult" cards (trust/clean) and the "Kid" card (playful).
   Keyboard-navigable list; one card is the recommended/most-common path.
2. Adult Login — email/phone + password, plus passkey option. Friendly, trustworthy,
   minimal. Includes "forgot/recovery" entry and a language + currency switch in the
   top bar.
3. MFA / OTP — six single-digit auto-advancing inputs, resend-code, backup-codes link.
   Clear "secure sign-in" success confirmation (toast).
4. Terms & child-safety acknowledgment — explicit consent capture, plain language.

AUDIENCE & TONE: Mixed. Role select is the bridge (welcoming to both). Login/MFA are
Assigner Mode (clean, secure, professional). The Kid card hints at Kid Mode.

KEY ELEMENTS & STATES per screen:
- Empty/initial, focused-field, loading (verifying), error (wrong code/credentials —
  kind + specific), success.
- MFA: invalid code error, expired code, locked-out edge, resend cooldown.
- Visible security/trust signals (MFA, encryption reassurance) WITHOUT scaring kids.

COMPONENTS TO DEFINE (reused later): app top bar (brand, notifications, currency
switch, language switch, theme toggle), role card, primary/secondary buttons, text
input, OTP input group, toast/snackbar, link, focus ring, brand logo lockup.

DELIVER ALSO: the FULL design token set (color light/dark for both modes, type scale,
spacing, radius, elevation, motion) — this is the source of truth for all chunks.

RTL/ARABIC: Provide Arabic RTL mirror of every screen. Mirror nav/arrows; keep OTP
digit order logical; keep brand upright.
ACCESSIBILITY: WCAG AA, ≥44–48px targets, labeled inputs, visible focus, screen-reader
order, reduced-motion. Don't rely on color for error states.
RESPONSIVE: Mobile-first phone frame; show how login adapts to web width.
OUTPUT: Per Global Design Brief §1.13 (hi-fi, states, light/dark, LTR/RTL, tokens,
components, annotations, redlines).
```

---

### Chunk B — Kid Home & Tasks

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) and the design
tokens defined in Chunk A. This is KID MODE — colorful, gamified, encouraging,
reading-light, ONE primary action per screen.

DESIGN THESE SCREENS:
1. Kid Dashboard / Home — big friendly POINTS total with a mascot/progress visual,
   "Today's tasks" cards, a "Waiting for [Assigner]" strip, quick glance at streak &
   goal. 3 large bottom tabs max (Tasks · Points · Rewards).
2. Task List — simple cards: task title, point value, and a clear "Assigned by
   [Name + role badge]" (mom/dad/teacher) because the assigner approves & rewards.
   Status grouping: To-do · Waiting · Done.
3. Task Detail — what to do, points, who assigned it, deadline (gentle, no pressure),
   optional photo-proof slot, big "Mark as done!" action.
4. Mark-Complete flow — confirm → celebratory (calm) success → moves task to "Waiting
   for [Assigner]".

AUDIENCE & TONE: Kids (incl. pre/early readers). Icons + color + short words. Positive
reinforcement; NEVER shame late/rejected tasks ("Try again!" framing). No money figures
forced; points/stars primary.

KEY ELEMENTS & STATES per screen:
- Empty (no tasks yet — encouraging "All done! 🎉" / "Nothing yet"), loading, error
  (couldn't submit — retry, kind), success (task submitted), waiting/pending state.
- Per-source visibility: which assigner gave each task.

COMPONENTS: kid task card, assigner label + role badge, points pill/coin, mascot,
big primary "Do/Done" button, celebration animation (with reduced-motion fallback),
3-tab kid bottom nav, waiting chip.

RTL/ARABIC: Full Arabic RTL mirror; mirror layout & directional icons; keep mascot &
coin upright; numbers locale-aware.
ACCESSIBILITY: ≥48px targets, generous spacing, high contrast, optional/mutable audio,
reduced-motion celebration fallback, alt text for mascot/illustrations, plain words.
RESPONSIVE: Mobile phone frame primary (kid is mobile/tablet only).
OUTPUT: Per §1.13.
```

---

### Chunk C — Kid Rewards, Progress & Kid Onboarding

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) + Chunk A
tokens. KID MODE — gamified, rewarding, safe, calm celebrations (no gambling cues).

DESIGN THESE SCREENS:
1. My Points — earned / redeemed / pending cards, an editable REWARD GOAL with a
   progress visual, and PER-SOURCE chips (points from Mom / Dad / Teacher — the
   kid-friendly "multiple accounts" view).
2. Streaks & Badges — a 🔥 streak card (encouraging, never guilt-tripping) and an
   achievement-badges gallery (locked vs unlocked).
3. Rewards & History — redemption/earning history as a friendly celebratory timeline,
   showing who granted each.
4. QR Scan / Any-Assigner Onboarding — kid scans a QR from any assigner's app to
   request access; supports being connected to multiple assigners over time.
5. Waiting-for-Approval — default-deny gating: "Waiting for [parent/assigner] to let
   you in" — nothing else works until approved. Reassuring, not alarming.

AUDIENCE & TONE: Kids. Celebrate progress; motivation not addiction. Points/stars/
badges/coins metaphor; money framing only if a guardian enabled "worth about…".

KEY ELEMENTS & STATES:
- My Points: zero-points empty state, loading, per-source breakdown, goal-reached
  celebration.
- Badges: all-locked empty state, newly-unlocked highlight.
- History: empty timeline, loading.
- QR onboarding: scanning, scan-success "request sent", error (bad/expired code).
- Waiting: pending (calm), approved transition, denied (kind, "ask your parent").

COMPONENTS: points summary cards, goal/progress ring or bar, per-source chip, streak
card, badge tile (locked/unlocked), reward timeline item, QR scanner frame, waiting/
pending state screen.

RTL/ARABIC: Full Arabic RTL mirror; mirror progress direction & timeline; numbers/dates
locale-aware.
ACCESSIBILITY: Non-color status cues, reduced-motion celebrations, ≥48px targets,
screen-reader-friendly progress announcements, alt text for badges.
RESPONSIVE: Mobile phone frame.
OUTPUT: Per §1.13.
```

---

### Chunk D — Assigner Dashboard Overview & People ("Your Kids")

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) + Chunk A
tokens. ASSIGNER MODE — clean, efficient, data-clear, trustworthy. Components here are
SHARED across Parent / Co-Parent / Teacher / Moderator (differ only by data scope &
labels). Provide a subtle per-role accent.

DESIGN THESE SCREENS:
1. Adult Dashboard / Overview — summary cards (total tasks, points earned, points
   redeemed, pending approvals), an "Action needed" module (pending approvals +
   first-login approvals with inline action), a medal LEADERBOARD of the adult's
   kids by points, a recent-activity feed (with assigner labels), and recent tasks.
   New-user setup checklist (add kid → create task → connect device).
2. People / "Your Kids" (Students for teachers) — list of the adult's kids/students
   with avatar, current points, this-week earned; LIVE SEARCH; running TOTALS across
   kids. Each kid row reveals PER-ASSIGNER balances ("multiple bank account numbers for
   one kid"), plus QR generation, gift-bonus-points, and first-login approval entry.
3. Kid Detail — per-assigner ledger, connected devices, that kid's tasks, and a Redeem
   entry. Show the PARENT'S OVERALL PICTURE: combined total + per-source breakdown +
   audit/history affordance.

AUDIENCE & TONE: Assigners. Control, accountability, clarity. Trust signals visible:
assigner labels, MFA status, history/audit affordances.

KEY ELEMENTS & STATES:
- Overview: empty/new-account (show setup checklist), loading skeletons, populated,
  zero-pending-approvals success state.
- People: empty (no kids yet — "Add your first kid"), search-no-results, loading,
  populated with totals.
- Kid Detail: ledger empty, loading, multi-assigner populated.

COMPONENTS (reused in E/F/G): web left-sidebar nav + top context bar (current kid/class,
language, currency), mobile bottom tab bar (Home · Tasks · Approvals · Redeem · More)
with a persistent approvals badge, summary stat card, kid row/strip, per-assigner
balance chip, search field, leaderboard item, activity-feed item, setup-checklist,
quick-action bar (New task · Add bonus · Redeem · Invite co-parent).

RTL/ARABIC: Full Arabic RTL mirror — mirror sidebar to the right, mirror directional
icons; keep data tables readable; bidi-safe names.
ACCESSIBILITY: WCAG AA, labeled controls, keyboard-navigable tables/lists, badge counts
announced, visible focus, non-color status.
RESPONSIVE: BOTH mobile (bottom tabs) AND web dashboard (left sidebar + context bar).
Cards reflow 4→2→1.
OUTPUT: Per §1.13 — include the web dashboard layout AND mobile layout.
```

---

### Chunk E — Task Management (Create, Assign, Approvals)

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) + Chunk A
tokens, reusing the adult shell from Chunk D. ASSIGNER MODE.

DESIGN THESE SCREENS:
1. Tasks list — searchable, status-filterable list of the adult's tasks. Each row shows
   assigner + role badge; a detail (ⓘ) modal shows a status timeline and a LIVE DECAY
   COUNTDOWN.
2. Create Task (modal/page) — title, point value, deadline, a "TWO-BOX DECAY" rule
   control (e.g. reduce N points every M minutes after due time — design this as two
   linked inputs that read like a sentence), proof requirement toggle, and MULTI-KID
   assignment (assign to one or several kids at once). Progressive disclosure: advanced
   options collapsed by default.
3. Approvals Queue — kid-marked completions with context (kid, task, assigner, optional
   proof). Inline APPROVE (adds points, clears pending) and REJECT (kind preset reasons,
   sends back, non-punitive). Persistent badge count.

AUDIENCE & TONE: Assigners. Fast, low-friction, accountable. The approval loop is the
core daily action — make approve/reject one tap.

KEY ELEMENTS & STATES:
- Tasks list: empty ("No tasks yet — create one"), search-no-results, loading,
  populated, overdue/decaying task indication.
- Create Task: pristine, validation errors (missing title/points), the decay rule in
  sentence form, multi-select assignee picker (with select-all), saving, success.
- Approvals: empty/all-clear success state, loading, populated, approving (optimistic),
  reject-reason picker, error.

COMPONENTS: task row, assigner+role badge, decay-countdown chip, task-detail modal with
timeline, create-task form with the two-box decay control, multi-kid assignee selector,
approval card with inline approve/reject, kind-rejection reason templates, approvals
badge.

RTL/ARABIC: Full Arabic RTL mirror; the decay-rule "sentence" must read correctly in
Arabic; mirror timeline direction; locale-aware numbers/time.
ACCESSIBILITY: WCAG AA, labeled form fields, error text not color-only, keyboard multi-
select, focus management in modals (trap + Escape), announced approve/reject results.
RESPONSIVE: Mobile (bottom-sheet create-task, full-width approval cards) AND web
(modal/side panel, table-dense approvals).
OUTPUT: Per §1.13.
```

---

### Chunk F — Redemption + Role Switcher + Currency/Language Toggles

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) + Chunk A
tokens, reusing the adult shell from Chunk D. ASSIGNER MODE. Redeem is a DISTINCT mental
model from Approve (settling offline value, not confirming work) — design it to feel
different and deliberate.

DESIGN THESE SCREENS:
1. Redeem — per-kid, per-assigner-account redemption. Currency chips (USD/EUR/AED) and a
   live CONVERSION PREVIEW (baseline 10 pts = $5 / €4 / 20 AED). Support FULL and
   PARTIAL redeem (choose an amount of points to redeem). An "I have paid this offline"
   ATTESTATION step that reinforces the app is not a payment processor. On confirm,
   balances move earned → redeemed and the dashboard updates.
2. Redemption History — a clear ledger of past redemptions (date, points, money
   equivalent at the rate used, assigner, kid). Filterable; dispute-proof / audit tone.
3. Role Switcher — explicit, rare, account-menu action to switch between the user's
   roles. Must feel deliberate (prevents accidental cross-role exposure); confirm the
   "hat" you're switching to.
4. Currency & Language toggles — the in-context switchers (top bar + Settings): currency
   (symbol + code) and language (English/العربية) that flips the ENTIRE UI to RTL.

AUDIENCE & TONE: Assigners. Trustworthy, precise, auditable. Money framing is fine here
(adult surface).

KEY ELEMENTS & STATES:
- Redeem: nothing-to-redeem empty state, choosing full vs partial, amount validation
  (can't exceed balance), conversion preview update, attestation checkbox required,
  confirming, success, error.
- History: empty, loading, populated, filtered-no-results.
- Role switcher: current role indicated, switch confirmation.
- Toggles: show before/after for currency change and for English→Arabic full-RTL flip.

COMPONENTS: redeem panel, full/partial amount control (slider or stepper + input),
currency chip set, conversion-preview card, offline-payment attestation, redemption
history row, role-switcher menu, currency switcher, language switcher.

RTL/ARABIC: This chunk MUST demonstrate the full-UI RTL flip (show a complete Arabic
redeem + history screen). Mirror layout; money symbol/code placement correct per locale;
bidi-safe numbers.
ACCESSIBILITY: WCAG AA, attestation clearly labeled (not color-only), amount errors
inline, keyboard-operable amount control, announced success.
RESPONSIVE: Mobile (bottom-sheet redeem) AND web (side panel + history table).
OUTPUT: Per §1.13.
```

---

### Chunk G — Moderation/Oversight, Notifications & Settings

```text
ROLE: Senior product designer. Use the KidsBank Global Design Brief (§1) + Chunk A
tokens, reusing the adult shell from Chunk D. ASSIGNER MODE — Moderator screens lean
even more utilitarian/governance.

DESIGN THESE SCREENS:
1. Oversight / Moderation (Moderator only) — a moderation QUEUE (approve/block actions)
   plus a searchable AUDIT LOG of teacher/assigner actions on students. Safeguarding &
   governance tone; flag/escalation affordance. Also show the teacher roster + oversight
   feed (new connections, flagged tasks, anomalies/alerts) and Policies (point caps,
   allowed actions).
2. Notifications — tiered, actionable list with TYPE FILTERS (All / Approvals / Gifts /
   Safety), per-item and bulk mark-as-read, and an unread badge. Action-required items
   (approvals, first-login, suspicious attempts) are visually prioritized over status &
   nudges. Never expose other users' contact info.
3. Settings — currency, language (English/العربية with LTR/RTL), light/dark theme, MFA/
   security status, notification preferences (per-type channels, quiet hours), profile,
   and sign out.

AUDIENCE & TONE: Assigners/Moderators. Oversight = control + accountability + audit
trail. Notifications = timely, actionable, safe. Settings = clear, reassuring,
security-forward.

KEY ELEMENTS & STATES:
- Oversight: empty queue (all clear), loading, populated, flagged/anomaly highlight,
  audit search-no-results.
- Notifications: empty ("You're all caught up"), loading, populated, all-read state,
  filtered view.
- Settings: default, changed-unsaved, saving, success, MFA-missing prompt.

COMPONENTS: moderation queue item (approve/block), audit-log row + search, policy
control, alert/anomaly banner, notification row (tiered with action buttons), filter
chips, mark-as-read controls, settings rows/toggles, MFA status indicator, theme/
currency/language switchers (reuse from F), sign-out.

RTL/ARABIC: Full Arabic RTL mirror; mirror lists/filters; audit timestamps locale-aware;
keep security icons clear.
ACCESSIBILITY: WCAG AA, non-color tiering for notifications, keyboard-operable filters &
queue, announced mark-as-read, labeled toggles, visible focus.
RESPONSIVE: Mobile (filtered list, settings list) AND web (queue table + audit search,
two-column settings).
OUTPUT: Per §1.13.
```

---

## 3. Iterating with the design agent (tips)

- **One chunk, then critique.** Don't advance until the chunk's screens, all states, light/dark, and LTR/RTL are right.
- **Pin the tokens.** After Chunk A, paste the finalized token table into every later chunk. If the agent invents a new token mid-stream, decide to keep or kill it, then propagate.
- **Ask for the states explicitly** if any are missing: "Show the empty, loading, error, and success states for screen X."
- **Force the RTL proof.** Ask for a full Arabic mirror, not a note — especially in Chunk F (the full-UI flip) and Chunk B (kid mode mirrored).
- **Stress the two modes.** If kid screens feel too corporate or adult screens feel too toy-like, say so directly and reference §1.3.
- **Guard against gambling cues.** Reject any slot-machine spin, jackpot flash, or pressure/urgency — reference §1.2.
- **Request redlines** (spacing, sizes, tokens) once visuals are approved, so engineering can build.
- **Keep a changelog** of accepted components/tokens; feed it forward.
- **Compare across chunks** at the end: put representative kid + adult screens side by side to confirm one cohesive product.

## 4. Consistency checklist (run across all chunks)

**Tokens**
- [ ] Same color tokens (brand, reward/accent, semantic) across every screen; light + dark defined.
- [ ] Same type scale & font family (with Arabic coverage) everywhere.
- [ ] Same spacing, radius, elevation, and motion tokens reused — none reinvented per chunk.

**Components**
- [ ] App shell (top bar, adult sidebar/bottom-tabs, kid 3-tab nav) identical across chunks.
- [ ] Core verb icons (assign, complete, approve, reject, gift, redeem, history, points, badge, streak) consistent.
- [ ] Buttons, inputs, cards, chips, modals, toasts, badges share one spec & state set.
- [ ] Assigner label + role badge identical wherever a task appears.
- [ ] Per-assigner balance chip consistent (kid view & adult view).

**Modes & roles**
- [ ] Kid mode = colorful/gamified; Assigner mode = clean/data-clear; both clearly one family.
- [ ] Per-role accent applied consistently (Parent/Co-Parent/Teacher/Moderator).

**Quality gates (every screen)**
- [ ] Empty / loading / error / success (+ waiting/pending where relevant) all designed.
- [ ] Light + dark provided.
- [ ] LTR (English) + RTL (Arabic) mirror provided; directional icons mirrored, brand/clock not.
- [ ] WCAG AA contrast; ≥44–48px targets; non-color status; visible focus; reduced-motion fallback.
- [ ] Multi-currency shown as symbol + code; money only in adult surfaces.
- [ ] Mobile + (for adult screens) web dashboard variants.

**Naming**
- [ ] Token names, component names, and screen names are consistent and reused verbatim across chunks.
```
