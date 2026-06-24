# KidsBank Prototype — Spec v2 (Round 1)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v1)
A self-contained, offline, clickable vanilla-JS SPA covering all four roles
(Parent/Co-Parent, Kid, Teacher, Moderator):
- Landing/role select → simulated login → **MFA** → role-scoped dashboard.
- Adult dashboard: overview cards, task management (create/assign/late-decay),
  approvals (approve/reject → points), people/students with per-assigner
  ("bank account") balances, point redemption + multi-currency conversion,
  inline-SVG QR generation, notifications, settings (currency/language/RTL/theme),
  moderator oversight (moderation queue + audit log).
- Kid flow: QR scan → waiting-for-approval → tasks (each shows **who assigned it**),
  mark complete → pending approval, points & accounts, reward history.
- Cross-cutting: light/dark theme, English/Arabic + LTR/RTL toggle, live point-decay
  countdowns, task search & status filters, toasts, accessible semantics.

## New additions to implement this round (R1 → v2)
1. **Co-Parent as a first-class role** on the landing screen (distinct entry; shares
   the parent pattern but its own scoped account).
2. **Task detail modal** — an info action on every task opens a detail view:
   assigner + role badge, points, deadline, live decay countdown, status timeline.
3. **Kid reward goal / wishlist** — kid can set a points goal; progress bar and
   "points to go" update against it.
4. **Quick currency switcher in the top bar** — cycle USD→EUR→AED from anywhere,
   with all money figures updating live.
5. **Empty/disabled-state polish** — redeem button disabled at 0 pts (done), plus
   clearer empty states for approvals/notifications.

## Acceptance for this round
- All new actions are keyboard reachable and have ARIA labels.
- `node test\smoke.js` passes with added assertions covering the new flows.
- No regressions in existing flows; no console/runtime errors.
