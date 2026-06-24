# 12 — Prototype as Implementation Reference

This document maps the **clickable prototype** (`prototype\`) onto features and data so
backend/full-stack engineers can model real schemas and rebuild behaviour faithfully.
Everything here is extracted from `prototype\assets\data.js` and the render / `data-action`
handlers in `prototype\assets\app.js`. Cross-reference the canonical data model in
`docs\08-data-model.md` and the implementation guidance in `docs\10-*`.

> The prototype is front-end-only: no backend, no persistence. The shapes below are the
> *demo* shapes — treat them as field/relationship hints, not as the production schema.

---

## 1. Screen → Feature → Data

| Prototype screen / flow | View / handler (`app.js`) | Feature demonstrated | Underlying data (`KB.*`) |
|---|---|---|---|
| Landing / role selection | `viewLanding` · `selectRole`, `preLoginChoose` | Pick role; **pre-login role choice** for multi-role identity | `KB.roleGroups`, `KB.assigners` |
| Simulated login | `viewLogin` · `submitLogin` | Adult auth (pre-filled, always succeeds) | `KB.assigners` (demo identity) |
| MFA | `viewMfa` · `submitMfa` | 6-digit MFA, auto-advance (simulated) | — (no data) |
| Dashboard shell + role switcher | `viewDashboard`, `topbar` · `switchRole` | Role-scoped dashboard; **in-app role switcher** | `KB.roleScope`, `KB.roleGroups` |
| Overview tab | `renderDashTab` (overview) | Summary cards, medal leaderboard, recent activity | `KB.kids`, `KB.tasks`, `KB.redemptions` |
| Tasks tab | tasks branch · `openCreateTask`, `filterStatus`, `taskDetail` | Searchable/filterable list, create-task modal w/ **late-decay**, live decay countdown | `KB.tasks`, `KB.kids`, `KB.assigners` |
| Approvals tab | approvals branch · `approveTask`, `rejectTask` | Approve (pending→earned) / reject kid completions | `KB.tasks`, `KB.kids.accounts` |
| People / Students tab | people branch · `showQR`, `giftFromTask`, `approveKidLogin`, `inviteCoParent`, search | Per-assigner balances, QR, gift points, first-login approval, **≥3-char search**, parent **overall picture** | `KB.kids.accounts`, `KB.assigners`, `KB.currencies` |
| Redeem tab | `renderDashTab` (redeem), `renderRedemptionList` · `setCurrency`, `redeem` | Rate display, currency chips, **two-step redemption**, redemption history | `KB.currencies`, `KB.kids.accounts`, `KB.redemptions` |
| Oversight tab (Moderator) | oversight branch · `moderate` | Moderation queue + audit log | `KB.moderationQueue`, `KB.auditLog` |
| Notifications | notifications branch · `markNotif`, `markAllRead`, `filterNotif` | Type filters, per-item/bulk read, unread badge | `KB.notifications` |
| Settings | settings branch · `setCurrency`, `setLang`, `setTheme` | Currency / language+RTL / theme / sign out | `KB.currencies` |
| Kid onboarding | `kidOnboarding` · `kidRequest`, `kidApproved` | QR scan → waiting-for-approval → approved | `KB.kids.loginApproved` |
| Kid · Tasks | `renderKidTab` (tasks) | Tasks labelled with **who assigned them** (name+role); "Done!" → pending approval | `KB.tasks`, `KB.assigners` |
| Kid · Points | `renderKidTab` (points) · `confirmRedemption`, decline, `kidScanNew` | Earned/redeemed/pending cards, reward goal, streak, badges, per-account balances, **redemptions to confirm**, **scan new assigner QR** | `KB.kids`, `KB.redemptions`, `KB.assigners` |
| Kid · History | `renderKidTab` (history) | Reward/earning history w/ granter | `KB.redemptions`, `KB.tasks` |
| Scan-new-assigner modal | `kidScanNew` · `simScan` → `scanReveal` → `createAcct` | **Post-scan assigner reveal** (v9): assigner hidden until scan, then opens new account | `KB.assigners`, `KB.kids.accounts` |

---

## 2. Reference data shapes (from `data.js`)

Annotated examples. Backend devs should model real schemas to match these fields and
relationships; align names/types with `docs\08-data-model.md`.

### `KB.currencies` — conversion table
```js
USD: { symbol: "$",  ratePer10: 5,  label: "US Dollar" }   // 10 points = 5 USD
// keys: USD | EUR | AED ; ratePer10 = money value of 10 points
```

### `KB.assigners` — adult accounts (parent / co-parent / teacher / moderator)
```js
a_parent: {
  id:    "a_parent",
  name:  "Sara Aziz",
  role:  "Parent",        // Parent | Co-Parent | Teacher | Moderator
  avatar:"👩",
  color: "#6C5CE7"        // used for badges / theming
}
```

### `KB.kids` — kids/students, with **per-assigner accounts**
A kid holds a separate "bank account" per assigner — this is the core multi-assigner model.
```js
k_yusuf: {
  id: "k_yusuf", name: "Yusuf", nameAr: "يوسف",   // localized name
  emoji: "🦊", grade: "Grade 4",
  streak: 12,
  badges: ["First task", "10-day streak", ...],
  accounts: {                                      // keyed by assigner id
    a_teacher: {
      earned: 25,          // confirmed points available to redeem
      redeemed: 0,         // points already converted to a real reward
      pending: 10,         // points awaiting task approval (not yet earned)
      pendingRedeem: 15,   // points HELD: redemption initiated, awaiting kid confirm
      acctNo: "TC-3001"    // human-readable account number (prefix per assigner)
    }
    // a_parent → "PR-####", a_coparent → "CP-####", a_moder → "MD-####"
  },
  loginApproved: true      // has the kid's first login been approved?
}
```
Notes: `pendingRedeem` may be absent (treat as 0). Account-number prefixes encode the
assigner role (PR/CP/TC/MD). Redeemable balance = `earned` (held points sit in
`pendingRedeem` until the kid confirms).

### `KB.tasks` — assignments (multi-assigner), with **decay**
```js
{
  id: "t1", title: "Finish math homework", points: 15,
  kidId: "k_yusuf", assignerId: "a_teacher",
  deadline: "2026-06-24 18:00",
  decay: "-1 pt / 5 min late",   // late-penalty rule (free text; "none" if no decay)
  status: "pending_approval",    // assigned | pending_approval | completed
  category: "School"             // School | Home | Learning | Behavior
}
```

### `KB.redemptions` — redemption ledger (**status lifecycle**)
Two-step redemption: a record is created `pending_confirmation`, then the kid confirms
(`redeemed`) or rejects (`declined`).
```js
{
  id: "rd_seed1", kidId: "k_yusuf", assignerId: "a_teacher",
  amount: 15,            // points
  money: "$7.50",        // money value at the rate when initiated
  cur: "USD",
  ts: "2026-06-23 17:10",
  acctNo: "TC-3001",
  status: "pending_confirmation"   // pending_confirmation → redeemed | declined
}
```

### `KB.redemptionLog` — parent-visible redemption audit
One row per lifecycle event (initiated / confirmed / declined). Parents are notified the
moment a redemption is initiated, even when a non-parent assigner started it.
```js
{
  id: "rl1", redemptionId: "rd_seed1",
  kidId: "k_yusuf", assignerId: "a_teacher",
  parentId: "a_parent",            // parent who should be notified
  amount: 15, money: "$7.50", cur: "USD",
  event: "initiated",              // initiated | confirmed | declined
  ts: "2026-06-23 17:10"
}
```

### `KB.notifications` — per-assigner notifications
```js
{ id:"n1", to:"a_teacher", text:"Yusuf marked '…' as complete.",
  time:"2 min ago", unread:true, type:"approval" }   // type: approval | gift | safety
```

### `KB.roleGroups` — multi-role identities (v6)
One adult can hold several roles; drives pre-login role choice + in-app switcher.
```js
Parent: ["Parent", "Teacher"]   // demo identity holds both
```
Related: `KB.roleScope` maps a role → `{ assignerId, kids[], label }` for dashboard scoping.

### Supporting collections
- `KB.auditLog` — moderator oversight: `{ actor, action, target, time, risk }` (`risk: low | review`).
- `KB.moderationQueue` — safeguarding: `{ id, title, detail, status }` (`pending | review`).

---

## 3. Interaction patterns worth preserving

1. **Two-step redemption.** Initiating a redemption **holds** points (moves `earned` →
   `pendingRedeem`) and writes a `pending_confirmation` record + a `redemptionLog`
   `initiated` event + a parent notification. The **kid confirms** (→ `redeemed`) or
   **declines** (points returned to `earned`). Prevents double-spend; keeps the kid in the
   loop. (`redeem` → `confirmRedemption` / decline handlers.)
2. **Post-scan assigner reveal.** The kid's "scan a new assigner's QR" flow keeps the
   assigner **hidden** until `#simScan` fires; only then does `#scanReveal` show the
   avatar/name/role, and `#createAcct` opens a new zero-balance per-assigner account.
   Mirrors a real QR scan where identity is unknown beforehand.
3. **Search-after-3-characters.** People/Students name search activates only at **≥3
   chars** (else the full list shows with a "type 3+ letters" hint); case-insensitive,
   matches English **or** Arabic names live.
4. **Role switcher / pre-login role choice.** Multi-role adults pick a role **before**
   login (home screen) and can re-scope live via the dashboard top-bar switcher; both reuse
   `KB.roleScope`.
5. **Status badges.** Every redemption / task row carries an explicit status badge
   (pending vs redeemed vs declined; assigned / pending_approval / completed) so state is
   always visible — preserve these as first-class UI affordances.
