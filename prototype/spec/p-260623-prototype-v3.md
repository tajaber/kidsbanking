# KidsBank Prototype — Spec v3 (Round 2)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v2 / R1)
Offline vanilla-JS SPA for all roles incl. **Co-Parent**, with: role select →
login → MFA → role-scoped dashboard; task management with late-decay & live
countdowns; approvals; per-assigner ("bank account") balances; redemption with a
top-bar **quick currency switcher** (USD/EUR/AED); inline-SVG QR onboarding;
notifications; moderator oversight (queue + audit log); **task detail modal**;
Kid flow with editable **reward goal**; light/dark, English/Arabic + RTL, search &
status filters, toasts, accessible semantics. Validated by a 43-assertion jsdom
smoke test.

## New additions to implement this round (R2 → v3)
1. **Co-Parent invite flow** — parents invite a partner by email (simulated),
   confirming the parent/co-parent linking requirement.
2. **People/students search** — live filter box on the People tab (mirrors tasks).
3. **Per-notification mark-as-read** — click a notification to mark it read; unread
   badge count updates.
4. **Recent activity feed** — a compact, role-scoped activity list on the Overview
   tab so adults see the latest events at a glance.
5. **Reduced-motion support** — honour `prefers-reduced-motion` to disable
   animations for accessibility.

## Acceptance for this round
- New actions are keyboard reachable with ARIA labels; modals close on Escape.
- `node test\smoke.js` extended to cover invite, people search, mark-read, activity.
- No regressions; no console/runtime errors.
