# KidsBank Prototype — CHANGELOG

All notable changes to the frontend clickable prototype, by **Linus (Frontend)**.
Times are local (+03:00). Deadline for build work: **2026-06-24 01:00**.

---

## R0 — Initial build (v1)

### 2026-06-23 23:41 — v1 scaffold + first inner test pass
**What changed**
- Created self-contained, offline, clickable SPA prototype under `prototype\`:
  - `index.html` (no external/CDN deps; loads local CSS/JS).
  - `assets\styles.css` — mobile-first, responsive, light/dark, RTL-ready design system.
  - `assets\data.js` — seed data: 4 assigners (Parent, Co-Parent, Teacher, Moderator), 3 kids, 9 tasks from **different assigners**, per-account ("bank account") balances, notifications, audit log, moderation queue, multi-currency config.
  - `assets\app.js` — hash-aware SPA router + all flows.
  - `test\smoke.js` — headless jsdom smoke test driving every flow.
- Implemented flows: landing/role-select, simulated login → **MFA** → dashboard (adult roles), adult dashboard (overview cards, tasks, approvals, people/redeem, QR, notifications, settings, moderator oversight), Kid flow (QR scan → waiting-for-approval → tasks/points/history).
- Features: create task (form, points, deadline, late-decay, multi-kid assign), approve/reject, gift bonus points, point redemption with currency conversion, QR generation (inline SVG), per-assigner balances, language/RTL toggle, dark mode, live decay countdowns, search/filter on tasks.

**Why**: Deliver the full v1 covering all four user types and the multi-assigner approval/redemption model required by the prompt.

**Files touched**: `prototype\index.html`, `prototype\assets\{styles.css,data.js,app.js}`, `prototype\test\smoke.js`.

**Bugs found & fixed (inner pass 1)**
1. **Premature form submission (real bug).** The create-task `<form>` carried `data-action="submitCreateTask"`; the global *click* delegation uses `closest("[data-action]")`, so clicking any child (e.g. the kid-select chips) fired `submitCreateTask` early and closed the modal. **Fix**: handle that form in the `submit` listener only; removed it from the click switch. Verified clicking chips no longer submits.
2. **Responsive nav overlap.** Web dashboard rendered both sidebar and bottom tab bar at all widths. **Fix**: media queries — sidebar on ≥761px, bottom tab bar on ≤760px.

**Validation**: `node --check` passes for both JS files. `node test\smoke.js` → **29/29 assertions passed, no runtime errors**.

**Time check**: 23:41 (+03:00) — before deadline, continue.

### 2026-06-23 23:43 — inner passes 2 & 3 (v1)
**Tested**: extended `test\smoke.js` with deeper interaction assertions —
multi-currency symbol switching in Redeem (USD→AED), task **search** filter hiding
non-matching rows, status **filter chip** pressed-state, and Kid "Done!" moving a
task into pending-approval.
**Found**: no new defects; all interactions behaved correctly.
**Fixed**: n/a (no bugs). Minor: confirmed `aria-pressed` toggles on filter chips.
**Validation**: `node test\smoke.js` → **34/34 assertions passed, no runtime errors**.
**Time check**: 23:43 (+03:00) — before deadline, continue.

---

## R1 — Outer round 1 (v2)

### 2026-06-23 23:45 — implement v2 + inner test passes
**Spec**: `prototype\spec\p-260623-prototype-v2.md`.
**New features implemented**
- **Co-Parent** added as a first-class landing role (own scoped account).
- **Task detail modal** (ⓘ on every task): assigner + role, points, deadline, live
  decay countdown, status timeline.
- **Quick currency switcher** in the top bar (cycles USD→EUR→AED; all money updates).
- **Kid reward goal**: editable points goal with progress + "points to go".
- Empty/disabled-state polish retained (redeem disabled at 0 pts).

**Files touched**: `prototype\assets\app.js`, `prototype\spec\p-260623-prototype-v2.md`, `prototype\test\smoke.js`.

**Inner passes (test → find → fix)**
1. Updated smoke test (4→5 role cards). Found stale assertion only; fixed expectation.
2. Added coverage: Co-Parent flow, top-bar currency cycle, task-detail modal, kid goal modal.
3. Re-ran full suite; no regressions, no console/runtime errors.

**Validation**: `node test\smoke.js` → **43/43 assertions passed, no runtime errors**.
**Time check**: 23:45 (+03:00) — before deadline, continue.

---

## R2 — Outer round 2 (v3)

### 2026-06-23 23:47 — implement v3 + inner test passes
**Spec**: `prototype\spec\p-260623-prototype-v3.md`.
**New features implemented**
- **Co-Parent invite flow** (Parent/Co-Parent → People tab): email + relationship,
  simulated send with toast confirmation.
- **People/students live search** on the People tab.
- **Per-notification mark-as-read** (click/Enter on a notification) + **notification
  type filter** chips (All/Approvals/Gifts/Safety); unread badge recomputes.
- **Recent activity feed** on the Overview tab (role-scoped recent events).
- **Accessibility**: `prefers-reduced-motion` support; Enter/Space activates
  `role="button"` notification rows.

**Files touched**: `prototype\assets\app.js`, `prototype\assets\styles.css`,
`prototype\spec\p-260623-prototype-v3.md`, `prototype\test\smoke.js`.

**Inner passes (test → find → fix)**
1. Added coverage for activity feed + people search; verified search hides cards.
2. Added invite modal open/close + mark-read + notif filter assertions.
3. Re-ran full suite; no regressions, no console/runtime errors.

**Validation**: `node test\smoke.js` → **50/50 assertions passed, no runtime errors**.
**Time check**: 23:47 (+03:00) — before deadline, continue.

---

## R3 — Outer round 3 (v4)

### 2026-06-23 23:50 — implement v4 + inner test passes
**Spec**: `prototype\spec\p-260623-prototype-v4.md`.
**New features implemented**
- **Presenter / demo guide overlay** — top-bar ❔ button and `?` shortcut open a
  step-by-step demo script; closes on Escape.
- **Kid streaks & achievement badges** — 🔥 streak card + unlocked badge chips on the
  Kid points view (seed data added per kid).
- **Adult leaderboard** — medal-ranked list of the adult's own kids/students by
  points on the Overview tab.
- **Modal focus trap** — Tab/Shift+Tab cycles within an open modal.
- **Polish** — clickable-notification cursor affordance; consistent toasts.

**Files touched**: `prototype\assets\app.js`, `prototype\assets\styles.css`,
`prototype\assets\data.js`, `prototype\spec\p-260623-prototype-v4.md`,
`prototype\test\smoke.js`.

**Inner passes (test → find → fix)**
1. Added coverage: leaderboard present, demo guide via button.
2. Added coverage: demo guide via `?` shortcut, kid streak + achievements.
3. Re-ran the full suite **3×** for stability — deterministic, no regressions.

**Validation**: `node test\smoke.js` → **55/55 assertions passed, no runtime errors**
(3 consecutive identical runs). Live HTTP check: `index.html`, `styles.css`,
`app.js`, `data.js` all return **200**.
**Time check**: 23:50 (+03:00) — before deadline, continue.

---

## Completion summary

### 2026-06-23 23:52 — protocol complete (before deadline)
**Outcome**: Completed the full protocol — built **v1**, then ran **3 outer rounds**
(R1→v2, R2→v3, R3→v4), each with new feature specs, implementation, and **≥3 inner
test/fix passes**. Finished well before the 01:00 deadline (was **not** stopped).

**Final validation**: `node test\smoke.js` → **55/55 assertions, no runtime errors**
(3 consecutive stable runs). Live HTTP serve → all assets **200**. `node --check`
clean for `app.js` and `data.js`. All linked assets resolve.

**Cleanup**: removed temporary `node_modules` (jsdom installed `--no-save`); added
`prototype\package.json` declaring jsdom as a devDependency + `npm test` script so the
smoke test is reproducible. The prototype itself has **zero** runtime dependencies and
opens offline.

**Final file list**
- `prototype\index.html`
- `prototype\assets\styles.css`, `prototype\assets\data.js`, `prototype\assets\app.js`
- `prototype\spec\p-260623-prototype-v2.md`, `...-v3.md`, `...-v4.md`
- `prototype\test\smoke.js`, `prototype\package.json`
- `docs\frontend-features.md`
- `.squad\decisions\inbox\linus-prototype-stack.md`
- `CHANGELOG.md`





---

## R4 — v5 (backfilled log; previously verified, logging was interrupted)

### 2026-06-24 00:19 — v5 completed & verified (entry added retroactively)
The prior session implemented **v5** but was interrupted before logging it. v5 is
already applied and verified in the codebase; this entry records it.

**What v5 delivered**
- **Partial & full redemption**: redeem modal `redeemAmt` input + All/Half chips +
  live money preview; confirm validates `1..earned` and mutates
  `real.earned -= amount; real.redeemed += amount`; audit log updated.
- **Two-box late decay**: `ctDecayPts` / `ctDecayMin` inputs combined by
  `buildDecayString(pts, min)` (→ `none` when either is 0).
- **Your-Kids totals**: People page Earned / Pending / Value-if-redeemed plus
  `≈ {money} if redeemed` via `t("ifRedeemed")`.
- **Full English/Arabic i18n + RTL**: complete `I.en` / `I.ar` map + `t()` helper;
  language toggle flips `dir` document-wide.

**Validation**: `node test\smoke.js` → **55/55 assertions**, `node --check` clean,
no runtime errors. Spec: `prototype\spec\p-260623-prototype-v5.md`.

---

## R5 — v6 (multi-role switch + name search)

### 2026-06-24 00:19 — v6 implemented & verified
**Features**
- **v6-1 Multi-role switching**: `KB.roleGroups` seeds the demo identity as both
  **Parent + Teacher**; `state.roles` holds all held roles, `state.role` the active
  one. A top-bar role switcher (`switchRole`) rescopes kids/students + tasks via the
  existing `scope()`/`kidsForRole()`. Strings translated EN+AR.
- **v6-2 Name search (≥3 chars)**: People search filters only at ≥ 3 characters
  (full list + hint below that); matches English **and** Arabic (`kid.nameAr`) names
  via a `data-search` attribute in `window.__kbPeopleFilter`. Strings EN+AR.

**Bugs fixed during test pass**
- History test initially clicked a **disabled** redeem button (first kid's balance was
  already redeemed earlier in the suite) → retargeted the assertion to an enabled
  account (`k_layla`).

**Time check**: 00:19 (+03:00) — before deadline, continued.

---

## R5 — v7 (redemption history + parent overview + any-assigner QR)

### 2026-06-24 00:19 — v7 implemented & verified
**Features**
- **v7-1 Redemption history**: `KB.redemptions` ledger (seeded) records every confirmed
  redemption `{kidId, assignerId, amount, money, cur, ts, acctNo}`; `doRedeem` appends
  on confirm. Redeem tab shows history — every assigner sees their own, **Parents
  additionally** see all redemptions for their kids across every assigner. Strings EN+AR.
- **v7-2 Parent overall picture**: Parent-only `parentOverview()` panel on People lists
  every per-assigner account (earned/pending/redeemed/value) + per-kid grand total via
  `kidGrandTotals`. Strings EN+AR.
- **v7-3 Any-assigner QR → new account**: kid `kidScanNew` action lets a kid simulate
  scanning any unlinked assigner's QR; creates a new account `{earned:0, redeemed:0,
  pending:0, acctNo}` (role-prefixed `newAcctNo()`). Strings EN+AR.

**Validation**: `node test\smoke.js` → **70/70 assertions** (extended with role-switch
rescope, ≥3-char EN/AR search, redemption-history growth, parent overview panel,
new-account creation); 3 consecutive stable runs; `node --check` clean for `app.js`,
`data.js`, `smoke.js`; no runtime/console errors.

**Time check**: 00:19 (+03:00) — finished well before the 01:00 deadline (not stopped).

**Files touched (v6/v7)**
- `prototype\assets\data.js` (roleGroups, redemptions ledger, kid `nameAr`)
- `prototype\assets\app.js` (role switcher, search, redemption history, parent
  overview, any-assigner QR, new strings EN+AR)
- `prototype\assets\styles.css` (role-switch control)
- `prototype\test\smoke.js` (new assertions)
- `prototype\spec\p-260623-prototype-v5.md`, `...-v6.md`, `...-v7.md`
- `docs\frontend-features.md`
- `.squad\decisions\inbox\linus-v6v7-multirole-search-redemption.md`
- `CHANGELOG.md`

---

## R6 — Two-step redemption + pre-login role choice (v8)

### 2026-06-24 00:29 (+03:00) — v8 build + extended smoke pass
**Time check**: started ~00:22, building before the 01:00 deadline (not stopped).

**v8-1 — Two-step redemption confirmation + parent notifications + event log**
- Redemption is now **two-step**. doRedeem confirm no longer marks points redeemed
  instantly; it moves the amount out of `earned` into a held `account.pendingRedeem`
  and creates a record with `status:"pending_confirmation"` (EN "Pending redemption
  confirmation" / AR "بانتظار تأكيد الاستبدال").
- The kid's **parent is notified** (`notifyParentRedemption` → `KB.notifications`)
  and the event is **logged** (`logRedemptionEvent` → new `KB.redemptionLog`), even
  when a non-parent assigner initiates. `parentForKid()` resolves the parent.
- The **Kid Points** view shows a **"Redemptions to confirm"** card with **Confirm**
  (`confirmRedemption` → status `redeemed`, `redeemed += amount`, clear hold) and
  **Decline** (`declineRedemption` → status `declined`, points returned to
  `earned`). Both log an event and notify the parent.
- **Parents** get a **Redemption activity log** section (`redemptionEventLogSection`)
  on the Redeem tab; **status badges** (`redemptionStatusBadge`) render on every
  redemption row and in the kid pending list.
- Seeded one `pending_confirmation` redemption (`rd_seed1`, teacher-initiated for
  Yusuf, 15 pts held) + completed history + one seeded log event so flows are demoable.
- New strings (redeemInitiated, statusPendingRedeem/Redeemed/Declined, pendingRedeem*,
  confirm/declineRedeemBtn, redeemConfirmed/DeclinedToast, parentRedeemLog*,
  redeemEvent*, notifRedeem*, justNowWord) — all EN+AR.

**v8-2 — Pre-login role choice at the home screen**
- Landing renders a **"Have more than one role?"** panel (`#preLoginRolePanel`) from
  `multiRoleChoices()`. `data-action="preLoginChoose"` sets the initial post-login
  `state.role` (and seeds `state.roles` from the full role group), then routes
  through the normal login → MFA → dashboard flow. Existing role cards and the in-app
  switcher are unchanged. New strings (preLoginTitle/Intro/SignInAs) EN+AR.

**Bugs fixed during build**
- Smoke pass exhausted Yusuf's parent balance in earlier passes (redeem button
  disabled at `earned<=0`); v8 test now tops up the balance before initiating the
  redemption so the modal opens deterministically.

**Validation**: `node test\smoke.js` → **88/88 assertions** (70 prior + 18 new:
pending-not-redeemed, held `pendingRedeem`, parent notification + log entry, parent
activity-log + badges, kid-confirm finalization, pre-login role choice sets scope, in-app
switcher still present). `node --check` clean for `app.js`, `data.js`, `smoke.js`;
no runtime/console errors.

**Files touched (v8)**
- `prototype\assets\data.js` (redemption `status` + `pendingRedeem`, new
  `KB.redemptionLog`, seeded pending redemption)
- `prototype\assets\app.js` (two-step `doRedeem`, confirm/decline, parent notify +
  log helpers, status badges, kid pending section, pre-login role panel + handler,
  new strings EN+AR)
- `prototype\test\smoke.js` (18 new v8 assertions)
- `prototype\spec\p-260623-prototype-v8.md`
- `docs\frontend-features.md`
- `.squad\decisions\inbox\linus-v8-two-step-redemption-prelogin-role.md`
- `CHANGELOG.md`

## v9 — 2026-06-24T00:43+03:00 (Linus, Frontend)
- KID "Scan a new assigner's QR" modal is now TWO-STAGE: assigner name is hidden until after a successful (simulated) QR scan.
  - Stage 1: title + scan instruction + QR box + `#simScan` "Simulate scan" button (no name, no `<select>`).
  - Stage 2: reveals scanned assigner (`#scanReveal`: avatar + name + role) with `#createAcct` "Open account" confirm.
  - QR-encoded assigner picked internally from `avail` and kept hidden until reveal.
- i18n: added `scanInstruction`, `simulateScanBtn`, `scannedReveal` to I.en + I.ar (real Arabic), via t().
- Smoke test v7-3 block updated to two-stage flow (assert no name pre-scan, click #simScan, assert #scanReveal, then #createAcct).
- Tests: 91/91 passing (was 88; +3 new). Time-check at test: 2026-06-24T00:43+03:00 — within deadline.
- Files: prototype\assets\app.js, prototype\test\smoke.js, docs\frontend-features.md, prototype\spec\p-260623-prototype-v9.md, CHANGELOG.md
