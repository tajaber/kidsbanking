# 11 — Requirements Traceability & Implementation-Readiness

**Owner**: Ryan (Mobile PM) · **Date**: 2026-06-24
**Purpose**: Tie the clickable prototype's *real* behaviour (v1–v9) to the PRD
functional requirements, define what "done" means per feature, and give a
sprint-ready backlog to build the MVP. Solo/bootstrapped, region-agnostic,
**reward-and-motivation product — not a bank/wallet/payments service**.

**Source of truth**: `docs\frontend-features.md` (prototype behaviour),
`docs\02-prd.md` (FR-/NFR- IDs), `docs\01-feature-inventory.md`, `CHANGELOG.md`.

Status legend: **Prototyped** = demonstrated in the clickable prototype with
simulated (in-memory) behaviour; needs real backend/persistence to ship.

---

## 1. Traceability matrix

| # | Prototype feature (v1–v9) | FR ref (02-prd) | Acceptance criteria (testable) | MVP / Phase | Status |
|---|---|---|---|---|---|
| 1 | Landing / role selection (Parent, Co-Parent, Teacher, Moderator, Kid) | FR-6 | Five role cards keyboard-navigable; adult role → auth flow, Kid → QR onboarding; chosen role scopes the session. | MVP (Teacher/Moderator Phase 2) | Prototyped |
| 2 | Adult login + MFA (6-digit, auto-advance) | FR-1, FR-2, FR-3, FR-4 | Email/phone+password login; MFA step required before dashboard; valid OTP advances, invalid is rejected; recovery path exists and preserves MFA. | MVP | Prototyped |
| 3 | Kids never password-login (QR + approved device only) | FR-5, FR-14 | No kid password field anywhere; kid access only via scanned QR + parent-approved device. | MVP | Prototyped |
| 4 | Multi-role identity + in-app active-role switcher | FR-6a | One login holds ≥2 roles; switcher appears only when >1 role; switching rescopes people/tasks; no cross-scope data leak. | MVP | Prototyped |
| 5 | Pre-login role choice (choose role before authenticating) | FR-6b | Multi-role identity can pick sign-in role on landing; choice sets initial scope; re-validated server-side vs memberships; single-role skips chooser. | MVP | Prototyped |
| 6 | Invite a co-parent | FR-7, FR-10 | Parent sends invite; on acceptance co-parent links to shared kids; removal revokes access but keeps ledger history. | MVP | Prototyped |
| 7 | Per-assigner accounts ("multiple bank accounts per kid") | FR-8, FR-12a, FR-27 | Each (kid, assigner) pair has its own account/number and isolated balances; no pooling across assigners. | MVP | Prototyped |
| 8 | Assigner-only approval & redemption authority | FR-9 | Only the task's creating assigner can approve/reject and redeem that task's points; others cannot. | MVP | Prototyped |
| 9 | Any-assigner QR onboarding + post-scan name reveal | FR-12, FR-12a | QR is single-use & short-lived; assigner hidden before scan; after scan reveals assigner (avatar/name/role); confirm provisions a **new** account on first-login approval; re-scan is idempotent. | MVP | Prototyped |
| 10 | First-login approval (parent approves kid device) | FR-13, FR-14, FR-15 | Scan triggers parent approval request; no access until approved; parent can revoke an approved device. | MVP | Prototyped |
| 11 | Task creation (title, points, deadline, multi-kid assign) | FR-16, FR-17 | Create task with required fields; assign to ≥1 kid; each task row shows assigner name + role badge. | MVP | Prototyped |
| 12 | Two-box late-decay rule (points / minutes) | FR-16a, FR-21 | Decay entered as two positive integers (points, minutes); preview shows points lost over time; points reduce per interval after deadline, floored at 0, based on kid completion time. | MVP | Prototyped |
| 13 | Kid marks task done → pending approval | FR-18 | "Done!" moves task to pending and notifies the assigner; points not yet credited. | MVP | Prototyped |
| 14 | Approvals (approve adds points / reject returns) | FR-19, FR-20, FR-23 | Approve writes a points ledger entry to that assigner↔kid balance; reject returns task (optional reason); ledger append-only. | MVP | Prototyped |
| 15 | Bonus / gift points outside tasks | FR-22 | Assigner grants positive bonus points; written as ledger entry on the correct account. | MVP | Prototyped |
| 16 | Earned / pending / redeemed history per relationship | FR-24 | Kid and assigner can view earned, pending, redeemed per (kid, assigner). | MVP | Prototyped |
| 17 | Two-step redemption: initiate → hold (`pending_confirmation`) | FR-25, FR-25a, FR-25b | Assigner initiates full/partial redeem; amount held (reserved out of earned, not redeemed); status badge `pending confirmation`; held amount not re-redeemable. | MVP | Prototyped |
| 18 | Kid confirm / decline finalizes redemption | FR-25b, FR-25c | Kid confirms → settled `redeem` ledger entry (earned↓, redeemed↑); decline/expiry releases held points back to earned; each transition timestamped with initiating assigner. | MVP | Prototyped |
| 19 | Full / partial redemption amount validation | FR-25a, FR-27 | Amount validated `1 ≤ amount ≤ available earned` (available excludes held); rejects <1, non-integer, over-balance; settlement isolated to that account. | MVP | Prototyped |
| 20 | No real funds (status/record action only) | FR-26 | Redemption never moves money; value shown is an offline estimate, labelled as such. | MVP | Prototyped |
| 21 | Point→currency conversion + multi-currency switch (USD/EUR/AED) | FR-28, FR-29 | Assigner sets pts→currency rule; value displayed at current rate; changing rate preserves historical recorded values; no summing across currencies. | MVP | Prototyped |
| 22 | Parent redemption event log + status badges | FR-25c, FR-34 | Parent gets chronological log of every redemption lifecycle event (kid, initiating assigner, amount, money snapshot, timestamp, status) for any of their kids, any assigner; scoped to redemption records only. | MVP | Prototyped |
| 23 | Redemption history (own + parent cross-assigner) | FR-24a | Each assigner sees own redemptions; parent sees consolidated redemption history per kid across all assigners; no cross-currency summing; no access to others' task management. | MVP | Prototyped |
| 24 | Notifications (in-app inbox + push) with type filters | FR-30, FR-31, FR-32 | Notify on task/completion/approval/grant/redemption events/login-approval; in-app inbox + push; filterable; mark-read updates unread badge; content localizable. | MVP | Prototyped |
| 25 | Adult dashboard (mobile + web) summary cards | FR-33 | Dashboard shows total tasks, points earned, points redeemed, pending approvals, scoped to the active role's kids/students; renders on mobile and web. | MVP | Prototyped |
| 26 | "Your Kids" roll-ups + parent overall account picture | FR-33a, FR-33c | Per-kid and overall totals: earned, pending approval, value-if-redeemed (estimate, never funds-held); parent overall view lists each assigner balance + per-kid grand total; grouped by currency. | MVP | Prototyped |
| 27 | Name search (≥3 chars, EN/AR, in-scope) | FR-33b | Filtering starts only at the 3rd character; live thereafter; case-insensitive; matches English/Arabic; scoped to active role's people. | MVP | Prototyped |
| 28 | Moderator oversight queue + audit log | FR-34, FR-35 | Approve/block queue + audit trail of sensitive events; abuse controls (rate limit, mandatory login approval, report/escalation). | Phase 2 | Prototyped |
| 29 | Full English/Arabic with RTL mirroring | FR-36, NFR-6 | One-tap language toggle flips whole UI to RTL; complete Arabic for every label/flow; no hardcoded strings. | MVP | Prototyped |
| 30 | Accessibility (landmarks, focus trap, ARIA, reduced-motion) | NFR-5 + WCAG AA | Skip link, focus-visible, ARIA labels, modal focus trap + Escape, live regions, prefers-reduced-motion respected, AA contrast. | MVP | Prototyped |

---

## 2. Definition of Done (per feature)

A feature is **Done** only when ALL apply:

- **Functional**: behaviour matches its FR row above against a real persistent
  backend (no in-memory simulation); ledger writes are append-only, consistent,
  and idempotent (NFR-4); edge cases (zero balance, held-amount, expiry,
  re-scan, role-switch) handled.
- **Accessibility (WCAG 2.1 AA)**: keyboard-operable; visible focus; ARIA names
  on icon controls; modal focus trap + Escape; ≥4.5:1 text contrast (light/dark);
  honours `prefers-reduced-motion`; live regions announce async results.
- **RTL / Arabic**: every new user-facing string in EN + AR; UI fully mirrors in
  RTL; no hardcoded strings; numerals/dates/currency localized; verified in both
  directions.
- **Security / child-safety**: server-side authorization (assigner-only actions,
  role scope re-validated, FR-6b); MFA enforced for adults; kids never password
  login; QR single-use & short-lived; no real funds moved; minimal child PII
  (NFR-2/3); secrets never in source.
- **Tests**: unit tests for business rules (decay floor, hold/release,
  amount validation, currency preservation); integration test for the flow;
  a11y check (axe) and RTL snapshot; happy + at least one failure path covered.

---

## 3. Sprint-ready backlog (MVP from the prototype)

Epics → stories with acceptance criteria, sequenced. Solo-founder cadence;
each sprint is a shippable slice. Teacher/Moderator/Oversight are **Phase 2**.

### Epic A — Foundation & platform
- **A1** As a developer I want an i18n + RTL framework and design tokens from day
  one. *AC*: language toggle flips LTR/RTL globally; no hardcoded strings; EN+AR
  loaded; theming light/dark. (NFR-6, FR-36)
- **A2** As a developer I want an append-only ledger + per-(kid,assigner) account
  model. *AC*: writes are immutable; corrections are offsetting entries; balances
  isolated per assigner. (FR-23, FR-8, FR-27)

### Epic B — Identity, auth & roles
- **B1** Adult register + verify email/phone. *AC*: FR-1, FR-2.
- **B2** Adult login with enforced MFA + recovery. *AC*: FR-3, FR-4.
- **B3** Multi-role identity, pre-login chooser + in-app switcher, server-side
  re-validation. *AC*: FR-6, FR-6a, FR-6b; no cross-scope leak.
- **B4** Co-parent invite / accept / revoke. *AC*: FR-7, FR-10.

### Epic C — Kid onboarding & device safety
- **C1** Create kid profile (minimal PII) + QR generation. *AC*: FR-11, FR-12.
- **C2** Any-assigner scan → post-scan reveal → first-login approval → new
  per-assigner account; re-scan idempotent. *AC*: FR-12a, FR-13, FR-14.
- **C3** Parent revoke approved device. *AC*: FR-15.

### Epic D — Tasks, points & decay
- **D1** Create task (fields + multi-kid assign + who-assigned badge). *AC*: FR-16, FR-17.
- **D2** Two-box decay rule + live preview + floored decay on completion time.
  *AC*: FR-16a, FR-21.
- **D3** Kid mark-done → assigner approve/reject → ledger credit. *AC*: FR-18, FR-19, FR-20.
- **D4** Bonus points grant. *AC*: FR-22.
- **D5** Earned/pending/redeemed history per relationship. *AC*: FR-24.

### Epic E — Redemption & currency
- **E1** Initiate redemption (full/partial) with hold + `pending_confirmation`
  + validation. *AC*: FR-25, FR-25a, FR-25b, FR-27.
- **E2** Kid confirm/decline + expiry release; settled ledger entry. *AC*: FR-25b, FR-25c.
- **E3** Currency conversion rule + multi-currency display + historical value
  preservation; no cross-currency sums. *AC*: FR-28, FR-29.
- **E4** Redemption history (own + parent cross-assigner) + parent event log +
  status badges. *AC*: FR-24a, FR-25c.

### Epic F — Dashboard, notifications & search
- **F1** Adult dashboard (mobile + web) summary cards scoped to active role. *AC*: FR-33.
- **F2** "Your Kids" roll-ups + parent overall account picture. *AC*: FR-33a, FR-33c.
- **F3** Name search ≥3 chars, EN/AR, in-scope. *AC*: FR-33b.
- **F4** Notifications inbox + push + filters + localizable content. *AC*: FR-30, FR-31, FR-32.

### Epic G — Safety, audit & accessibility (cross-cutting)
- **G1** Audit trail of sensitive events. *AC*: FR-34.
- **G2** Abuse controls (rate limit, mandatory login approval, report). *AC*: FR-35.
- **G3** WCAG AA pass across all shipped screens. *AC*: §2 a11y bullet.

### Epic H — Phase 2 (post-MVP)
- Teacher/coach + Moderator(school) roles + Oversight queue. *AC*: FR (role-scoped reuse), FR-34, FR-35.

### Suggested sprint sequence (MVP)
- **Sprint 1 — Foundation & identity**: A1, A2, B1, B2, G3 (baseline).
- **Sprint 2 — Roles & co-parent**: B3, B4.
- **Sprint 3 — Kid onboarding & safety**: C1, C2, C3, G1.
- **Sprint 4 — Tasks & points**: D1, D2, D3, D4, D5.
- **Sprint 5 — Redemption & currency**: E1, E2, E3, E4.
- **Sprint 6 — Dashboard, notifications, search, hardening**: F1, F2, F3, F4, G2, final A11y/RTL pass.
- **Phase 2 (later)**: Epic H.

---

## 4. Gaps & open decisions (founder must resolve)

| # | Decision | Why it matters | Suggested default |
|---|---|---|---|
| 1 | **Auth/MFA provider** (build vs Auth0/Cognito/Firebase Auth) | Determines MFA, recovery, session security; the prototype only simulates login. | Managed provider (TOTP + email OTP) to avoid rolling crypto solo. |
| 2 | **Push provider** (FCM/APNs vs OneSignal/Expo) | Needed for real notifications beyond in-app inbox. | Expo/FCM for solo speed; in-app inbox is source of truth. |
| 3 | **QR lifetime & device-trust** (single-use TTL, token storage) | Child-safety core; "single-use, short-lived" must be defined. | One-time token, ~10-min TTL, server-bound device record. |
| 4 | **Currency rounding & precision** | Value-if-redeemed estimates; partial redemptions; no cross-currency sums. | Integer points; money shown to 2 dp, half-up; group totals by currency. |
| 5 | **Expiry of pending redemptions** | FR-25b expiry path needs a concrete window + who/what triggers release. | 72h auto-decline → release held points; configurable later. |
| 6 | **Data residency & retention** (children's PII) | NFR-2/3 + legal exposure for a bootstrapped founder. | Region-agnostic single region; documented retention; review w/ counsel. |
| 7 | **Co-parent removal semantics** | FR-10 must revoke access yet preserve ledger; define visibility of past data. | Soft-revoke membership; ledger immutable; historical entries read-only. |
| 8 | **Decay precision & timezone** | FR-21 floors at 0 on completion time; needs a canonical clock/TZ. | Store UTC timestamps; compute decay server-side. |
| 9 | **Account numbering scheme** | Per-(kid,assigner) "account numbers" need a stable, non-PII identifier. | Opaque UUID/short code; display-friendly alias optional. |
| 10 | **Offline/legal framing copy** | Keep clearly out of financial-services scope (G3/non-goals). | Persistent "not a bank/wallet; offline reward estimate" labelling. |

---

*This document is implementation-ready: every prototype feature maps to a PRD FR
with testable acceptance criteria, a Definition of Done, and a sprint plan. MVP
vs Phase 2 is distinguished throughout; framing stays solo/bootstrapped,
region-agnostic, and non-banking.*
