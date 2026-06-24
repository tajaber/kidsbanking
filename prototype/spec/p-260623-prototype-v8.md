# KidsBank Prototype — Spec v8 (Round 6)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v7)
Offline vanilla-JS SPA with multi-role switching, ≥3-char EN/AR name search, redemption
history, parent overview and any-assigner QR account creation. Validated by an extended
jsdom smoke test (70/70).

## Additions implemented this round (v8)

### v8-1 — Two-step redemption confirmation + parent notifications + event log
Redemption is no longer instant. It is now a **two-step** flow:

1. **Assigner initiates** (`doRedeem` confirm): instead of immediately marking points
   redeemed, the amount is moved out of `earned` into a held state
   `account.pendingRedeem` and a redemption record is created with
   **`status: "pending_confirmation"`** (label EN "Pending redemption confirmation" /
   AR "بانتظار تأكيد الاستبدال"). The balance can't be double-spent but is **not** yet
   counted as `redeemed`.
2. **Parent is notified + logged.** `notifyParentRedemption()` pushes a notification to
   the kid's parent (`parentForKid()` — the Parent-role assigner on the kid, else
   `a_parent`), and `logRedemptionEvent()` appends an entry to **`KB.redemptionLog`**
   (kid, assigner, amount, money value, event, timestamp). This fires even when a
   **non-parent** assigner (teacher / moderator / co-parent) initiates.
3. **Kid confirms (or declines).** The Kid Points view shows a **"Redemptions to
   confirm"** card (`kidPendingRedeemSection`) listing pending records with
   **Confirm** / **Decline** buttons.
   - **Confirm** (`confirmRedemption`): status → **`"redeemed"`**, finalize
     `account.redeemed += amount`, clear the `pendingRedeem` hold; logs a `completed`
     event and notifies the parent.
   - **Decline** (`declineRedemption`): status → **`"declined"`**, return the amount to
     `account.earned`, clear the hold; logs a `declined` event and notifies the parent.
4. **Parent log + status badges.** Parents see a **Redemption activity log** section
   (`redemptionEventLogSection`) on the Redeem tab listing every initiated / completed /
   declined event with kid, assigner, amount, money value and timestamp. **Status
   badges** (pending confirmation vs redeemed vs declined) render on every redemption
   row and in the kid pending list (`redemptionStatusBadge`).
5. **Seed.** `data.js` seeds one `pending_confirmation` redemption (`rd_seed1`,
   teacher-initiated for Yusuf, 15 pts held via `pendingRedeem`) plus completed history,
   and one seeded `initiated` event in `KB.redemptionLog`, so the kid-confirm and parent
   log flows are demoable out of the box.

New strings: `redeemInitiated`, `statusPendingRedeem`, `statusRedeemed`,
`statusDeclined`, `pendingRedeemTitle`, `pendingRedeemIntro`, `pendingRedeemRow`,
`pendingRedeemBy`, `confirmRedeemBtn`, `declineRedeemBtn`, `redeemConfirmedToast`,
`redeemDeclinedToast`, `parentRedeemLog`, `parentRedeemLogIntro`, `redeemEventInitiated`,
`redeemEventCompleted`, `redeemEventDeclined`, `notifRedeemInitiated`,
`notifRedeemCompleted`, `notifRedeemDeclined`, `justNowWord` — all EN+AR.

### v8-2 — Pre-login role choice at the home screen
A multi-role assigner (the demo Parent+Teacher identity in `KB.roleGroups`) can choose
which role to **sign in AS** from the landing screen, **before authenticating**, in
addition to the existing in-app role switcher.

- The landing renders a **"Have more than one role?"** panel (`#preLoginRolePanel`)
  built from `multiRoleChoices()` (roles belonging to any role-group of length > 1).
- `data-action="preLoginChoose"` sets the initial post-login `state.role` (and seeds
  `state.roles` with the full role group so the in-app switcher keeps working), then
  routes to the normal login → MFA → dashboard flow.
- The existing role cards and in-app switcher are unchanged (additive, non-breaking).

New strings: `preLoginTitle`, `preLoginIntro`, `preLoginSignInAs` — EN+AR.

## Acceptance
- A redemption starts `pending_confirmation` (held in `pendingRedeem`, not yet in
  `redeemed`); the parent gets a notification and an event-log entry.
- Kid confirm finalizes to `redeemed`; decline returns points to `earned`.
- Parents see the redemption activity log and status badges.
- Pre-login role choice sets the initial scope; in-app switcher still offered.
- `node test\smoke.js` extended and green (**88/88**); `node --check` clean for
  `app.js`, `data.js`, `smoke.js`; no runtime/console errors.
