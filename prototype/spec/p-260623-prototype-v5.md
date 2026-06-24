# KidsBank Prototype — Spec v5 (Round 4)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v4 / R3)
Offline vanilla-JS SPA for all roles (Parent, Co-Parent, Teacher, Moderator, Kid)
with task/approval/QR/MFA flows, per-assigner balances, multi-currency, dark mode,
task-detail modal, kid reward goal, co-parent invite, search, notifications,
demo-guide overlay, kid streaks/badges, adult leaderboard, modal focus trap.

## Additions implemented this round (R4 → v5)
1. **Partial & full redemption** — the redeem modal adds a `redeemAmt` input with
   All/Half quick-fill chips and a live money preview. Confirm validates `1..earned`
   and mutates the real account: `real.earned -= amount; real.redeemed += amount`,
   then logs to the audit trail.
2. **Two-box late-decay editor** — Create Task uses `ctDecayPts` / `ctDecayMin`
   inputs combined by `buildDecayString(pts, min)` into a human-readable rule
   (e.g. `-1 pt / 5 min late`, or `none` when either is zero).
3. **Your-Kids totals** — the People page shows per-kid Earned / Pending /
   Value-if-redeemed totals plus an `≈ {money} if redeemed` line via `t("ifRedeemed")`.
4. **Full English/Arabic i18n + RTL** — a complete `I.en` / `I.ar` string map with the
   `t(key, params)` helper; the language toggle flips `dir` (LTR/RTL) document-wide and
   every user-visible string is translated.

## Acceptance for this round
- Redemption supports any amount in `1..earned`; balances and audit log update.
- Decay string built from the two numeric inputs; "none" when disabled.
- People totals reflect live balances after approvals/redemptions.
- Arabic is complete; switching language flips direction.
- `node test\smoke.js` → **55/55** assertions, `node --check` clean, no runtime errors.

## Verification
- `node --check assets\app.js` / `assets\data.js` — clean.
- `node test\smoke.js` → **55/55 assertions passed**, no runtime/console errors
  (multiple consecutive stable runs).
