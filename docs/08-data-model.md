# Section 12 — Data Model & Entities

**Project:** KidsBank (KidsBanking)
**Author:** Dell — Solutions Architect
**Audience:** Solo, bootstrapped founder
**Lens:** Relational (PostgreSQL). Append-only points ledger. Multi-tenant via `tenant_id` + RLS. Child-data minimization. Region-driven points flagged.

> **Spine of the model — "multiple bank account numbers for the same kid":**
> A kid does **not** have one global balance. A kid has **one `account` per assigner relationship** (one with mom, one with dad/co-parent, one with each teacher, one with a moderator/coach). Each account has its **own ledger, its own balance, its own currency/valuation rule, and its own redemptions**. The assigner who created a task is the one who approves its completion and redeems its points — against **their** account with the kid. Points never mix across accounts.

---

## 12.1 Entity-relationship overview

```
                         ┌──────────┐
                         │  Tenant  │  (family | school | merchant)
                         └────┬─────┘
              ┌───────────────┼───────────────────────┐
        ┌─────▼─────┐    ┌────▼─────┐            ┌─────▼──────┐
        │Membership │    │  Kid     │            │  Merchant  │ (future)
        │(user↔     │    │ Profile  │            │  / Store   │
        │ tenant +  │    └────┬─────┘            └────────────┘
        │ role)     │         │
        └─────┬─────┘         │  has many
              │               │
        ┌─────▼─────┐   ┌─────▼───────────────────────┐
        │   User    │   │   Account (per kid+assigner)│◄── the "bank account number"
        │ (adult)   │   │  - balance (derived)        │
        └─────┬─────┘   │  - currency_config          │
              │         └─────┬───────────────────────┘
   ┌──────────┼─────┐         │ has many
   │ Relationship   │   ┌─────▼───────────────┐   ┌──────────────────┐
   │ (assigner↔kid) │   │ Points Transaction  │   │ Redemption Record│
   └────────────────┘   │ (append-only ledger)│◄──│ (deemed payout)  │
                        └─────────────────────┘   └──────────────────┘
        ┌──────────┐         ▲
        │  Task    │  assigned via   ┌──────────────────┐
        │          ├────────────────►│ Task Assignment  │
        └──────────┘                 │ (task↔kid)       │
                                     └────────┬─────────┘
                                              │ produces
                                     ┌────────▼─────────────┐
                                     │ Task Completion Req. │ ── approve ──► ledger earn
                                     └──────────────────────┘

   Cross-cutting:  Notification · Audit Log · Currency Config · Co-parent Link · Device
```

---

## 12.2 Core entities (key data each holds)

### User (adult)
The authenticatable adult identity (parent, co-parent, teacher, moderator, platform admin).
- `id`, `email` (unique), `password_hash`/external auth ref, `display_name` (**searchable name field** — backs people search; index for prefix/substring lookup, surfaced only after 3+ chars and within the caller's active-role scope)
- `mfa_enabled`, `mfa_method` (totp/sms/email), MFA secret ref (in secure store, **not** plaintext)
- `locale`, `timezone`, `status` (active/suspended), `created_at`
- **One identity, many roles:** a single User may hold **multiple Memberships** (e.g., `parent` in a family **and** `teacher` in a school). There is no per-role duplicate account. An **active role** is resolved per request (session/JWT claim) and scopes what the user sees.
- **No child PII here.** Notification preferences (or in a child table).

### Parent
Not a separate table — a **User** with a `parent`/`co_parent` **role** via a **Membership** in a **family Tenant**. Modeling "parent" as a role (not a type) lets one person be a parent in one family and a teacher in a school.
- Derived: role = `parent` in a `family` tenant; full rights over that family's kids.

### Co-parent link
Represents two adults co-managing the same family (e.g., mother + father).
- `id`, `family_tenant_id`, `inviter_user_id`, `invitee_user_id`/`invitee_email`
- `status` (pending/accepted/revoked), `invited_at`, `accepted_at`
- Result: invitee gains a `co_parent` Membership in the family. **Each co-parent keeps their own Account/ledger with each kid** (mom's points ≠ dad's points).

### Kid profile
The child. **Minimal PII by design.**
- `id`, `family_tenant_id`, `display_name`/nickname (**searchable name field** — backs assigner people search; min-3-char, active-role-scoped), `avatar_ref`
- `birth_year`/age-band (only if needed for consent logic — minimize), `locale`
- `status` (active/suspended), `created_by` (adult), `created_at`
- **No email/password.** Auth is via QR onboarding + approved Device. May belong to multiple tenants (family + school) and link to **multiple assigners** — each assigner connection (created when the kid scans that assigner's QR and a guardian approves) yields its **own per-assigner Account**, keeping balances separate.

### Teacher
A **User** with a `teacher` role. Two onboarding shapes:
- **Independent teacher:** their own `family`-like personal tenant (or a solo `org`), self-managed students.
- **School-affiliated teacher:** a `teacher` Membership in a **school Tenant**, subject to moderator oversight.
- Holds: profile, locale, status, school membership(s), oversight flags.

### Moderator
A **User** with a `moderator` role **scoped to a school Tenant**. Governance/safeguarding, **not** platform super-admin.
- Holds: school membership, oversight permissions (review teacher access/activity/associations, suspend/escalate within school).

### School (Tenant of type `school`)
- `id` (tenant_id), `type = school`, `name`, `locale`, `default_currency_config_id`
- `status`, governance settings (who can invite teachers, safeguarding policy flags)
- Members via Membership; students linked through teacher relationships.

> **Tenant (generalization):** `id`, `type` (family | school | merchant), `name`, `default_locale`, `default_currency_config_id`, `status`, `created_at`. All tenant-scoped tables carry `tenant_id` for RLS isolation.

### Membership (user ↔ tenant ↔ role)
The join that gives a User a role inside a Tenant.
- `id`, `user_id`, `tenant_id`, `role` (parent/co_parent/teacher/moderator), `status` (active/pending/revoked), `invited_by`, `created_at`
- A user can have many memberships (parent in a family **and** teacher in a school). This is the data backbone of **multi-role identity**: the app exposes an **active-role switcher**, and the resolved active role (+ its memberships/relationships) scopes every query. Authorization evaluates against the **active role only**, never the union of a user's roles.

### Relationship (assigner ↔ kid)
First-class link that authorizes an adult to assign/approve for a specific kid/student.
- `id`, `assigner_user_id`, `kid_id`, `tenant_id`, `relationship_type` (parent/co_parent/teacher/moderator/coach)
- `status` (active/pending/revoked), `created_at`, audit refs
- **Each active Relationship implies exactly one Account** (the kid's "bank account number" with that assigner).
- **Created on QR claim approval:** when a kid scans **any** assigner's QR and the owning guardian approves (arch §10.8), the system **ensures** this Relationship and its Account exist — **idempotently** (re-scanning an existing assigner reuses them; a new assigner creates a new Relationship + Account). Account creation is gated by approval, never by scan.

### Device
A kid's (or adult's) registered device, central to QR onboarding & first-login approval.
- `id`, `owner_kind` (kid/adult), `owner_id`, `device_fingerprint`, `platform`
- `status` (pending/approved/revoked), `approved_by`, `approved_at`, `last_seen`, `created_at`
- For kids: a Device starts **pending** after QR claim and needs adult approval (see arch §10.8).

---

## 12.3 Accounts & the points ledger (the heart)

### Account (per kid + assigner) — "the bank account number"
One per active Relationship. This is the per-assigner balance container.
- `id` (the human-shareable account reference), `kid_id`, `assigner_user_id`, `relationship_id`, `tenant_id`
- `currency_config_id` (this assigner's valuation rule for this kid)
- `balance_points` (**derived/cached** from ledger, updated transactionally), `lifetime_earned`, `lifetime_redeemed`, **`pending_redeem_points`** (the sum of amounts **held by redemptions awaiting kid confirmation** — a hold that is **neither earned-available nor redeemed**)
- The **available (redeemable) balance** for this account = `lifetime_earned − lifetime_redeemed − pending_redeem_points` (≥ 0). A redemption draws down this available balance by **any amount up to the full available** (partial or full), never below 0. **Held (pending) amounts are excluded from the available balance** so the same points can never be redeemed twice while a confirmation is outstanding.
- `status`, `created_at`
- **Provisioning:** an Account is created when a kid connects to an assigner via QR and a guardian approves (see Relationship). One Account **per (kid, assigner)** — a kid with three assigners has three Accounts; balances never pool. This is the unit a parent's **overall account picture** aggregates over (read-only) across all of a kid's Accounts.
- **Invariant:** the settled balance is always reconstructable by summing this account's Points Transactions; `pending_redeem_points` is reconstructable by summing the amounts of this account's redemptions still in `pending_confirmation`.

### Points Transaction (append-only ledger)
The immutable record of every point movement **within one Account**.
- `id`, `account_id`, `kid_id`, `assigner_user_id`, `tenant_id`
- `type` (`earn` | `bonus` | `decay` | `redeem` | `adjustment`)
- `points_delta` (signed: +earn/+bonus, −decay/−redeem). For a `redeem` row, the magnitude is the redeemed **amount** — **any value from 1 up to the account's available earned balance** (supports partial redemption; not required to equal the whole balance). A `redeem` row is written **only when a redemption is confirmed/completed by the kid** — never at initiation. A **held** (pending) redemption is **not** a ledger row; the hold lives on the Redemption Record + the account's `pending_redeem_points` until the kid confirms (→ write the `redeem` row) or declines/expires (→ no ledger row, release the hold).
- `source_ref` (task_completion_id / bonus_id / redemption_id), `note`
- `created_at`, `created_by`, `idempotency_key` (prevents double-credit on retry)
- **Append-only:** never updated/deleted; corrections are new `adjustment` rows. This is what keeps the system audit-clean and out of "balance-mutation" bugs.

### Redemption Record (two-step, kid-confirmed deemed payout)

When an assigner settles value **outside the app** and marks points redeemed — **fully or partially**. **Redemption is a two-step, kid-confirmed action**: the assigner **initiates** (status `pending_confirmation`, amount **held**), and the **kid confirms** for it to become final (`redeemed`/completed) or **declines** (or it **expires**) → the hold is released.
- `id`, `account_id`, `kid_id`, **`initiating_assigner_user_id`** (the assigner who started the redemption — could be parent/co-parent/teacher/moderator), `tenant_id`
- `points_redeemed` — the redeemed **amount**, validated as **`1 ≤ points_redeemed ≤ account available earned balance`** (`lifetime_earned − lifetime_redeemed − pending_redeem_points`, i.e. **net of other holds**). A redemption is **an amount, not a full cash-out**: partial redemptions are first-class and leave the remaining earned balance available.
- **`status`** — lifecycle: **`pending_confirmation`** (initiated; amount **held**, counted in `pending_redeem_points`, **not** in `lifetime_redeemed`) → **`redeemed`** (kid confirmed/completed; hold settles into a `redeem` Points Transaction and `lifetime_redeemed` increments) → or **`declined`** (kid declined **or** the confirmation window expired; hold released, **no** ledger change). Optionally `cancelled` (assigner cancels before kid confirms — same release as decline).
- **Transition timestamps:** `initiated_at`, `confirmed_at` (kid confirm → completed), `declined_at`/`expired_at` (set on decline/expiry), plus `confirmation_expires_at` (the window after which an unconfirmed redemption auto-declines). **`confirmed_by_kid_id`** records the kid actor on confirm/decline.
- **`valuation_snapshot`** (the currency_config ratio + currency code **at initiation time**, frozen so later rate changes don't rewrite history)
- `real_world_value` (computed from snapshot for the redeemed amount, e.g., "5 USD"), `method_note` (e.g., "cash/gift — offline")
- `created_at`, `created_by`
- **On the kid's confirmation** (and only then): produces a `redeem` Points Transaction (negative delta of `points_redeemed`), increments the account's `lifetime_redeemed`, and **clears the matching hold** from `pending_redeem_points`, **scoped to this account only** (no pooling across the kid's other accounts). **On decline/expiry:** the hold is removed from `pending_redeem_points` and **no** ledger row is written. **No real money moves through the app** — this is a settlement record only.
- **Parent notification + event log:** **every status transition** (initiated, kid-confirmed/completed, declined/expired) emits a Notification to the kid's **parent(s)** — regardless of which assigner initiated — and is surfaced in a parent-visible **redemption event log** (kid, initiating assigner, amount, snapshotted money value, timestamp, status). The kid receiving the redemption gets the **confirm/decline** prompt.
- **History queries (redemption history):** Redemption Records are queryable for two views — (a) **by assigner**: `WHERE account_id IN (assigner's accounts)` or `WHERE initiating_assigner_user_id = me` → an assigner's **own** history; (b) **by parent across all of a kid's accounts**: `WHERE kid_id = X` (scoped by the parent's guardianship of that kid) → a **cross-assigner** picture of every redemption on that kid, regardless of who redeemed, **including status** (pending/completed/declined). Index on `(kid_id, created_at)`, `(account_id, created_at)`, and `(account_id, status)` to support both views and fast `pending_redeem_points` reconstruction. The parent view exposes **redemption/lifecycle records only** (assigner, amount, snapshotted value, note, timestamp, status) — not another assigner's task data — and is **never** summed across differing currencies.

> This trio (**Account → Points Transaction → Redemption Record**) implements "multiple bank account numbers for the same kid" with full auditability and the non-banking posture (offline settlement, snapshotted valuation).

---

## 12.4 Tasks & completion

### Task
A unit of work an assigner defines.
- `id`, `creator_user_id` (**the assigner = approver/redeemer**), `tenant_id`
- `title`, `description`, `point_value`
- `deadline_at` / schedule (recurring?), `decay_rule` — stored as **two assigner-entered numbers**: `decay_points` (points to reduce) and `decay_interval_minutes` (the interval), i.e. reduce `decay_points` for every `decay_interval_minutes` past the deadline, plus `decay_floor` (default 0). Both `decay_points` and `decay_interval_minutes` are positive integers; absence/zero means no decay.
- `status` (active/archived), `created_at`
- Localization: title/description are user content rendered with direction auto-detect.

### Task Assignment (task ↔ kid)
A task can be assigned to one or many kids; each assignment is the per-kid instance.
- `id`, `task_id`, `kid_id`, `account_id` (the assigner's account with this kid — where points will land)
- `status` (assigned/in_progress/completed/approved/rejected/expired)
- `due_at` (resolved from task), `assigned_at`
- **Carries who-assigned-it** through `task.creator_user_id` → shown clearly to the kid (the brief requires the kid to see who assigned each task).

### Task Completion Request
Kid marks an assignment complete → creates a request the assigner must approve.
- `id`, `assignment_id`, `kid_id`, `requested_at`
- `status` (pending/approved/rejected), `reviewed_by`, `reviewed_at`, `review_note`
- `computed_points` (point_value adjusted by decay at review/approval time)
- **On approval:** writes an `earn` Points Transaction to the kid's Account **with that assigner** (and updates cached balance transactionally). On rejection: no ledger change; kid notified.

### Bonus / Gift points
Assigner grants points for something great not tied to a task.
- `id`, `account_id`, `kid_id`, `assigner_user_id`, `points`, `reason`, `created_at`, `created_by`
- Produces a `bonus` Points Transaction. Same per-account scoping.

---

## 12.5 Configuration, comms, safety

### Currency Config
Valuation/display metadata only (never a transaction). Owned per Account (or tenant default).
- `id`, `tenant_id`/`account_id`, `currency_code` (ISO 4217)
- `points_per_unit` (or `unit_per_points`) ratio — e.g., 10 points = 5 USD
- `rounding_rule`, `effective_from` (history-preserving; rules can change without rewriting past redemptions)
- **No FX, no live rates, no conversion between currencies.** Different assigners may use different currencies; the app never converts.
- **Region flag:** which currencies/locales to support first is a market decision; the model is currency-agnostic.

### Notification
In-app record (source of truth) + push delivery.
- `id`, `recipient_user_id`/`recipient_kid_id`, `tenant_id`
- `type` (completion_requested, completion_approved/rejected, device_claim_pending, **redemption_initiated, redemption_confirmation_requested, redemption_completed, redemption_declined**, points_redeemed, task_due_soon, bonus_granted, moderation_*)
- `payload` (entity refs), `read_at`, `delivered_channels`, `created_at`
- Kid-facing notifications: limited, non-promotional, no external links. The kid receiving a redemption gets a **redemption_confirmation_requested** prompt (confirm/decline).
- **Redemption lifecycle → parent event log:** `redemption_initiated`/`_confirmed`/`_declined` notifications are emitted to the kid's **parent(s)** on every transition (regardless of initiating assigner) and back the parent-visible **redemption event log** (kid, initiating assigner, amount, snapshotted money value, timestamp, status). The log is **redemption-lifecycle records only** — never another assigner's task data.

### Audit Log (append-only)
Security/trust/safeguarding events.
- `id`, `actor_user_id`, `actor_role`, `tenant_id`, `action`, `target_type`, `target_id`
- `before`/`after` (where relevant), `ip`/`region`, `correlation_id`, `created_at`
- Write-once; never updated/deleted; restricted write path. Covers logins/MFA, device claim/approve/reject, relationship & role changes, approvals/rejections, redemptions, bonus grants, moderation, config changes.

### Merchant / Store (FUTURE phase)
Strongly fenced tenant for redemption-at-stores.
- `id` (tenant_id, `type = merchant`), `name`, `catalog`/offers, redemption-eligibility rules
- `status`, contact/admin membership
- **Hard boundary:** merchants see redemption tokens/eligibility only — **never child PII or family data.** Designed now (not built) so it isn't bolted on unsafely later.

---

## 12.6 Key relationships & cardinalities

| From | Relationship | To | Notes |
|---|---|---|---|
| Tenant | 1—N | Membership | family/school/merchant scoping |
| User | 1—N | Membership | a user can be in many tenants |
| Tenant (family) | 1—N | Kid profile | kids belong to a family; may also link to school |
| Relationship | 1—1 | Account | **each assigner↔kid relationship = one account** |
| Kid | 1—N | Account | **multiple accounts per kid (one per assigner)** ⭐ |
| Account | 1—N | Points Transaction | append-only ledger per account |
| Account | 1—N | Redemption Record | deemed payouts per account |
| Kid | 1—N | Redemption Record | **parent cross-assigner redemption history** (all of a kid's accounts) ⭐ |
| User | 1—N | Membership (role) | **multi-role identity**: one login, many roles; active role scopes access ⭐ |
| Task | 1—N | Task Assignment | one task → many kids |
| Task Assignment | 1—N | Task Completion Request | re-requestable after rejection |
| Completion Request (approved) | 1—1 | Points Transaction (earn) | credit lands in the assigner's account |
| Currency Config | 1—N | Account | valuation rule(s), history-preserving |

---

## 12.7 Modeling notes & invariants (explicit)

1. **Per-assigner accounts are non-negotiable.** Never compute a single global kid balance for spending/redemption; always operate within an Account. A "total across accounts" (e.g., the **"Your Kids" view's** total earned, total pending, and total value-if-all-redeemed) is a **read-only display convenience derived from each account's ledger and valuation rule, never a redeemable pooled balance**.
2. **Ledger is the source of truth; balances are derived/cached** and only changed inside the same DB transaction that appends the ledger row.
3. **Assigner = approver = redeemer.** `task.creator_user_id` flows through assignment → completion → ledger, enforcing that only the assigner approves/redeems their tasks.
4. **Valuation is snapshotted at redemption** so historical records stay correct when rates change.
5. **Child PII minimized**; no kid credentials; access via approved Device only.
6. **Soft-delete / status flags** for child, ledger, and audit data — no hard deletes (retention is region-driven; flag for legal review).
7. **Tenant isolation** via `tenant_id` + RLS on every tenant-scoped table.
8. **Merchant boundary** designed to exclude child PII from day one, even pre-build.
9. **One identity, many roles.** A User holds multiple Memberships; an **active role** is resolved per request and authorization evaluates against that role's memberships/relationships **only** (never the union) — no cross-role data bleed. Name search runs against the active role's people and is surfaced only after **3+ characters**.
10. **Account provisioning is gated by guardian approval, not by QR scan.** Scanning **any** assigner's QR ensures the (kid, assigner) Relationship + Account **idempotently** on approval; a new assigner ⇒ a new isolated Account; balances never pool across assigners.
11. **Parent visibility is read-only and record-scoped.** A guardian can read the **overall account picture** and **redemption history** across all of a kid's Accounts/assigners (per-assigner balances, per-kid grand total, value-if-redeemed). This is a derived read — never a pooled, redeemable balance — exposing balances/redemption records only, not other assigners' task management, and never summing across differing currencies.
12. **Redemption is two-step and kid-confirmed; held points are limbo.** A redemption is final **only after the kid confirms**. While `pending_confirmation`, its amount is **held** (`pending_redeem_points`) and is **neither counted as available-earned nor as redeemed** — so the same points can never be redeemed twice or double-counted. Confirmation writes the `redeem` ledger row and increments `lifetime_redeemed`; decline/expiry releases the hold with **no** ledger change. Available (redeemable) balance = `lifetime_earned − lifetime_redeemed − pending_redeem_points` (≥ 0).
13. **Parent notified on every redemption transition.** Each lifecycle event (initiated, kid-confirmed/completed, declined/expired) notifies the kid's parent(s) and is recorded in a parent-visible event log — regardless of which assigner initiated — exposing redemption-lifecycle records only.
