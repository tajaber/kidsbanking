# KidsBank — Frontend Prototype Features

**Owner**: Linus (Frontend) · **Scope**: the clickable prototype only.
PRD, UX research, and technical architecture are documented separately by other
squad members. This document describes **what each screen does, the flows, the
simulated behaviours, and accessibility/responsive notes**.

## How to run
- Open `prototype\index.html` directly in a browser (works offline, `file://`),
  or serve the `prototype\` folder with any static server.
- No build step, no network, no CDN. Plain HTML + CSS + vanilla JS.
- Optional headless test: `cd prototype && node test\smoke.js` (needs `jsdom`).

## Architecture (frontend)
- Single-page app (`assets\app.js`) with a small hash-aware router and `data-action`
  event delegation. Views are rendered as functions into `#app`.
- Seed data in `assets\data.js`; design system in `assets\styles.css`
  (CSS custom properties → light/dark + LTR/RTL).
- State is in-memory and mutates on interaction (no backend/persistence).

## Roles & navigation
- **Roles**: Parent, Co-Parent, Teacher, Moderator (adults) and Kid.
- **Navigation pattern**: bottom tab bar on mobile (≤760px); left sidebar on web
  (≥761px). Same content, responsive switch. Consistent top bar with brand,
  notifications, currency switch, language, theme, demo guide, and exit.

## Screens & flows

### 1. Landing / role selection
Five role cards. Choosing an adult role starts the auth flow; choosing **Kid**
starts QR onboarding. Fully keyboard-navigable list.

### 2. Simulated authentication with MFA (adult roles)
Login screen (pre-filled demo credentials) → **MFA** screen with six single-digit
inputs (auto-advance) → dashboard. Any input is accepted (simulated). A toast
confirms a secure sign-in.

### 3. Adult dashboard (Parent / Co-Parent / Teacher / Moderator)
Role-scoped (each adult sees only their kids/students and their own assigned tasks).
Tabs:
- **Overview** — summary cards (total tasks, points earned, points redeemed, pending
  approvals), a medal **leaderboard** of the adult's kids by points, a **recent
  activity** feed, and recent tasks.
- **Tasks** — searchable, status-filterable list. **Create task** modal: title,
  point value, deadline, **late-decay rule** (e.g. −1 pt / 5 min), and multi-kid
  assignment. Each task row shows assigner + role badge and a detail (ⓘ) modal with a
  status timeline and a **live decay countdown**.
- **Approvals** — kid-marked completions; **Approve** adds points to the kid's
  account (and clears pending); **Reject** sends it back. Empty state when clear.
- **People / Students** — each kid shows **per-assigner balances** ("multiple bank
  account numbers for the same kid"), QR generation, gift bonus points, and
  first-login approval. Parents/Co-Parents can **invite a co-parent** (simulated).
  Live search.
- **Redeem** — conversion rate display, currency chips (USD/EUR/AED), and per-kid
  **mark-as-redeemed** after a real-world reward; balances and dashboard update.
- **Oversight** (Moderator only) — moderation queue (approve/block) + **audit log**
  for safeguarding/governance.
- **Notifications** — type filters (All/Approvals/Gifts/Safety), per-item and
  bulk mark-as-read; unread badge updates.
- **Settings** — currency, language (English/العربية with LTR/RTL), light/dark theme,
  sign out.

### 4. Kid mobile view
- **QR scan** → request access → **waiting-for-parent-approval** state → approved.
- **Tasks** — each task **clearly shows who assigned it** (name + role badge), since
  the assigner approves completion and converts points. "Done!" → pending approval.
- **Points** — earned/redeemed/pending cards, an editable **reward goal** with
  progress, a 🔥 **streak** card, **achievement badges**, and per-account balances.
- **History** — simple reward/earning history with who granted each.

## Simulated behaviours (no backend)
- Login/MFA always succeed. QR codes are deterministic inline SVGs.
- Approving a task moves points from pending → earned on the relevant account.
- Redeeming moves earned → redeemed and shows the money equivalent at the current
  currency rate (10 pts = $5 / €4 / 20 AED).
- Gifting adds bonus points; co-parent invite and "resend code" show confirmation
  toasts only. State resets on page reload.

## Multi-assigner & multi-account model
Seed data includes tasks assigned to the same kids from **different assigners**
(parent, co-parent, teacher, moderator). Each kid keeps **separate balances per
assigner** (distinct account numbers), demonstrating the multi-assigner approval and
per-account redemption flows.

## Accessibility
- Semantic HTML landmarks, a skip link, `:focus-visible` outlines, ARIA labels on
  icon buttons, `aria-pressed` on toggles/chips, `aria-current` on active tabs.
- Modals are dialogs with **focus trap** (Tab cycles), Escape-to-close, and initial
  focus. Notification rows are keyboard-activatable (`role="button"`, Enter/Space).
- `prefers-reduced-motion` disables animations. Color palette chosen for contrast in
  both light and dark themes. Live regions (`role="status"`) for toasts.

## Responsive design
- Mobile-first; phone-frame max-width for kid/auth; full sidebar dashboard on wide
  screens. Cards reflow 4→2→1 columns; role grid reflows 2→1 at very small widths.

## Localization
- English/Arabic string subset with a one-tap language switch that also flips text
  direction (LTR/RTL) document-wide. Multi-currency switcher in the top bar and
  Settings.

## Presenter aids
- Top-bar ❔ button and the `?` keyboard shortcut open a **demo guide** overlay with a
  step-by-step script for stakeholder walkthroughs.

## Multi-role & identity (v6)
- An adult identity can hold **multiple roles** (the demo identity is both Parent and
  Teacher). A **role switcher** in the dashboard top bar appears when more than one
  role is held; switching the active role rescopes the dashboard — Parent/Co-Parent
  see their kids + tasks they assigned, Teacher/Moderator see their students + tasks
  they assigned. Reuses the existing role-scoping logic.

## Search (v6)
- The People / Your-Kids page has a name search that activates **only at ≥ 3
  characters** (below that the full list shows, with a "type 3+ letters" hint). It is
  case-insensitive and matches **English or Arabic** names live as you type.

## Redemption history & overviews (v7)
- A **redemptions ledger** records every confirmed redemption `{kid, amount, money,
  date, account}`. The Redeem tab shows a **Redemption history** section: every
  assigner sees **their own** redemptions, and **Parents additionally** see **all
  redemptions for their kids** across every assigner/account.
- Parents get an **Overall picture** panel on the People page: every per-assigner
  account for each kid (earned / pending / redeemed / value-if-redeemed) plus a
  **per-kid grand total** across accounts.
- A kid can **scan any assigner's QR** (parent, co-parent, teacher, moderator) to open
  a **new per-assigner bank account** (new account number, zero balances); that
  assigner's tasks/points then appear and can be redeemed from the new account.
- All new strings are fully translated (English + Arabic).

## Testing
- `prototype\test\smoke.js` drives every flow in jsdom and asserts no runtime/console
  errors (**70 assertions**, covering role switching, ≥3-char search, redemption
  history, parent overview, and any-assigner account creation). Run:
  `node prototype\test\smoke.js`.

## Two-step redemption & pre-login role choice (v8)
- **Redemption now requires kid confirmation.** When an adult processes a redemption,
  the points are **held** (moved out of `earned` into `pendingRedeem`) and the
  record is created with status **"Pending redemption confirmation"** — they are **not**
  counted as redeemed yet, so the balance can't be double-spent.
- **The kid's parent is notified and an event is logged** the moment a redemption is
  initiated — even when a teacher, moderator or co-parent started it.
- **The kid confirms or declines** from their Points view ("Redemptions to confirm"
  card). **Confirm** finalizes the redemption (counts as redeemed); **Decline** returns
  the points to the kid's earned balance.
- **Parents see a Redemption activity log** of every event (initiated / confirmed /
  declined) with kid, assigner, amount, money value and timestamp, plus clear
  **status badges** (pending vs redeemed vs declined) on every redemption row.
- **Pre-login role choice.** An adult who holds more than one role (e.g. Parent +
  Teacher) can pick **which role to sign in as** from the home screen, **before**
  logging in — in addition to the in-app role switcher. The chosen role sets the initial
  dashboard scope.
- All new strings are fully translated (English + Arabic).

## Testing (updated)
- `prototype\test\smoke.js` now runs **88 assertions** in jsdom (adds two-step
  redemption: pending-not-redeemed, held balance, parent notification + log entry,
  parent activity log + badges, kid confirmation finalization, and pre-login role choice
  scope). Run: `node prototype\test\smoke.js`.

## Post-scan assigner reveal (v9)
- The KID "Scan a new assigner's QR" modal no longer reveals the assigner's name
  before scanning. It is now a two-stage flow:
  1. **Before scan:** scan instruction + QR box + `#simScan` "Simulate scan"
     button. The QR-encoded assigner is chosen internally and kept hidden — no
     name and no `<select>` picker.
  2. **After scan:** `#scanReveal` shows the scanned assigner (avatar + name +
     role); confirming with `#createAcct` opens the new account as before.
- New i18n keys (en + ar): `scanInstruction`, `simulateScanBtn`, `scannedReveal`.
- Smoke test now runs **91 assertions** (adds pre-scan-hidden, simulate-scan, and post-scan-reveal checks).
