# KidsBank Prototype — Spec v7 (Round 5b)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v6)
Offline vanilla-JS SPA with multi-role switching, ≥3-char EN/AR name search, and all
prior flows. Validated by an extended jsdom smoke test.

## Additions implemented this round (v7)

### v7-1 — Redemption history
- A redemptions ledger lives in state: `KB.redemptions` (seeded with a few historical
  records in `data.js`). Each record is `{ kidId, assignerId, amount, money, cur, ts,
  acctNo }`.
- Every confirmed redemption in `doRedeem` pushes a new record (`unshift`) in addition
  to mutating balances and the audit log.
- A **Redemption history** section renders at the bottom of the Redeem tab:
  - **Every assigner** sees **their own** redemptions (`redemptionsForAssigner`).
  - **Parents additionally** see **all redemptions for their kids** across every
    assigner/account (`redemptionsForKids(scope().kids)`).
- New strings (`redemptionHistory`, `yourRedemptions`, `allKidRedemptions`,
  `noRedemptions`, `redemptionRow`) translated EN+AR.

### v7-2 — Parent overall picture of kids' accounts
- A Parent-only **Overall picture** panel renders on the People page
  (`parentOverview()`), listing **every per-assigner account** for each kid with
  earned / pending / redeemed / value-if-redeemed, plus a **per-kid grand total**
  across all accounts (via `kidGrandTotals`).
- New strings (`overallPicture`, `overallIntro`, `grandTotal`) translated EN+AR.

### v7-3 — Kid scans ANY assigner's QR → new account
- The Kid points view adds a **"Scan a new assigner's QR"** action
  (`data-action="kidScanNew"`). The modal lists assigners the kid is **not yet linked
  to** and simulates scanning their QR.
- On confirm, a **new per-assigner bank account** is created for the kid
  (`{ earned:0, redeemed:0, pending:0, acctNo }`, `acctNo` via `newAcctNo()` using a
  role-based prefix). The kid's accounts list and any of that assigner's tasks/points
  then appear and can be redeemed from the new account.
- New strings (`scanNewQr`, `scanNewTitle`, `scanNewPrompt`, `pickAssigner`,
  `createAccountBtn`, `accountCreated`, `allLinked`) translated EN+AR.

## Acceptance
- Redeeming records history; assigner sees own, parent sees all-kids history.
- Parent overall picture lists every account + grand totals per kid.
- Kid can open a new account by scanning any assigner's QR.
- `node test\smoke.js` extended and green; `node --check` clean; no runtime errors.
