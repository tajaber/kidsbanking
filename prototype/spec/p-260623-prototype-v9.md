# Prototype v9 — Post-scan assigner reveal (refinement)

Date: 2026-06-24 (Linus, Frontend)

## Refinement
The KID "Scan a new assigner's QR" flow no longer reveals the assigner's name
before scanning. `openKidScanNew(kid)` is now a two-stage modal:

- **Stage 1 (before scan):** Title, scan instruction (`scanInstruction`), the QR
  box (`qrSvg(...)`), and a "Simulate scan" button (`#simScan`, `simulateScanBtn`)
  plus Cancel. No assigner name and no `<select id="newAsg">` is shown. The QR
  "encodes" an assigner chosen internally from `avail` (random), kept hidden.
- **Stage 2 (after Simulate scan):** Reveals the scanned assigner
  (`#scanReveal`: avatar + name + role label, `scannedReveal`) with an
  "Open account" confirm button (`#createAcct`, `createAccountBtn`) plus Cancel.
  Confirm runs the existing logic: `newAcctNo`, add to `kid.accounts`, close,
  switch to points tab, toast `accountCreated`.

The "all linked" early-return case is unchanged.

## i18n
Added to both `I.en` and `I.ar` (real Arabic), routed through `t()`:
`scanInstruction`, `simulateScanBtn`, `scannedReveal`. The `pickAssigner` key is
retained but no longer used in this flow.

## Tests
Smoke test v7-3 block updated to the two-stage flow: assert assigner name not
shown pre-scan (`#newAsg` null, no `#scanReveal`), click `#simScan`, assert
`#scanReveal` appears, click `#createAcct`, assert account count increased.
Result: 91/91 assertions passing (was 88; +3 new).
