# KidsBank Prototype — Spec v4 (Round 3)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v3 / R2)
Offline vanilla-JS SPA for all roles incl. Co-Parent, with full task/approval/
redemption/QR/MFA flows, per-assigner balances, multi-currency, RTL/dark,
task-detail modal, kid reward goal, co-parent invite, people search, per-notification
mark-read + type filters, overview activity feed, reduced-motion support. Validated
by a 50-assertion jsdom smoke test.

## New additions to implement this round (R3 → v4)
1. **Presenter / demo guide overlay** — a help button (and `?` shortcut) opening a
   concise, step-by-step demo script overlay for stakeholder presentations.
2. **Kid streaks & achievement badges** — a 🔥 streak counter and unlocked
   achievement badges on the Kid view to reinforce motivation.
3. **Adult leaderboard** — a friendly ranked list of the adult's kids/students by
   points on the Overview tab (medals), scoped to that adult only.
4. **Modal focus trap** — Tab/Shift+Tab cycles within an open modal; focus returns
   logically; improves keyboard accessibility.
5. **Final polish** — consistent toasts, cursor affordance on clickable rows,
   contrast check.

## Acceptance for this round
- `?` opens the demo guide; Escape closes it; focus stays within open modals.
- `node test\smoke.js` extended to cover guide overlay, streaks/badges, leaderboard.
- No regressions; no console/runtime errors.
