# Section 10 — Build-Ready Implementation Guide

**Project:** KidsBank (KidsBanking)
**Author:** Dell — Solutions Architect
**Audience:** Implementation dev team (solo/bootstrapped, region-agnostic, **non-banking / offline settlement**)
**Purpose:** Turn the clickable prototype (`prototype\assets\data.js`, `app.js`) into a real, build-ready application. This is the single source of truth for schema, APIs, state machines, authorization, events, and build order. It reflects the prototype's actual v1–v9 behavior.

> **Framing (non-negotiable):** KidsBank is a **chore/reward points tracker**, NOT a bank. "Accounts", "bank account numbers", "earned/redeemed", and "money value" are **points ledgers and display conversions only**. No real funds move in-app. Redemption settlement happens **offline in the real world**; the app only records the agreement. Keep all currency as **display-only conversion** (`10 pts = $5 / €4 / 20 AED`).

---

## 1. System Overview

KidsBank lets **adult assigners** (Parent, Co-Parent, Teacher, Moderator) assign **tasks** to **kids**, approve completions, grant **points**, and **redeem** points for real-world rewards via a **two-step (initiate → kid-confirm)** flow. A kid can hold **multiple accounts — one per assigner** (each with its own account number and balances). Moderators provide safeguarding oversight (moderation queue + audit log).

Core domain facts grounded in the prototype:
- **One kid → many accounts**, keyed by assigner. Each account: `earned`, `pending`, `pendingRedeem`, `redeemed`, `acctNo` (e.g. `PR-1001`, `TC-3001`).
- **One adult identity → many role memberships** (v6: demo identity is both Parent and Teacher). A **role switcher** rescopes the dashboard; the active role determines visibility.
- **Tasks** carry `points`, `deadline`, a **late-decay rule** (`decay {points, minutes}`, e.g. −1 pt / 5 min), `category`, and a status lifecycle.
- **Redemption is two-step (v8):** an assigner initiates → status `pending_confirmation` → kid **confirms** (`redeemed`) or **declines** (`declined`). Points are held in `pendingRedeem` while awaiting confirmation.
- **Parents get cross-assigner visibility** of all redemptions/balances for their kids; other assigners see only their own.
- **Name search** activates at **≥ 3 characters**, case-insensitive, matches English or Arabic.
- **Kid onboarding by QR:** scanning **any** assigner's QR opens a **new per-assigner account** (new acctNo, zero balances). First login requires **parent approval** (`loginApproved`).

**MVP stack pointer (see `docs\07-tech-stack.md`):** **Flutter** (mobile + web dashboard) + **Supabase** (Postgres, Auth w/ MFA, Storage, Edge Functions, **RLS**) + **FCM** push + Sentry/Crashlytics + PostHog. Postgres is the right shape for an auditable points ledger; RLS gives defense-in-depth for role scoping. Region-agnostic; currency/rate is config-driven.

---

## 2. Data Schema (Implementation-Ready)

Postgres dialect. All ids `uuid` (PK `id`) unless noted; all tables carry `created_at timestamptz default now()`, `updated_at timestamptz`. Money is **never stored as currency** — only points + a config rate produce display values.

### 2.1 `users`
| field | type | notes |
|---|---|---|
| id | uuid PK | maps to Supabase auth user |
| display_name | text not null | |
| name_ar | text null | Arabic name (search) |
| email | citext unique null | adults |
| phone | text null | |
| avatar | text null | emoji/url |
| color | text null | UI accent |
| mfa_enabled | bool default false | |
| is_kid | bool default false | kid vs adult identity |
| login_approved | bool default false | kids: first-login gate |
| locale | text default 'en' | en/ar |
| status | text default 'active' | active/suspended |

Indexes: `idx_users_name_trgm` (GIN trigram on `display_name`, `name_ar`) for ≥3-char search; `unique(email)`.

### 2.2 `role_memberships` (multi-role identity)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→users | |
| role | text not null | Parent\|Co-Parent\|Teacher\|Moderator\|Kid |
| school_id | uuid FK→schools null | Teacher/Moderator scope |
| verified | bool default false | independent teacher/mod verification |
Indexes: `unique(user_id, role, school_id)`, `idx_role_user (user_id)`.

### 2.3 `parent_links` (co-parent / parent linkage)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| parent_user_id | uuid FK→users | inviter |
| coparent_user_id | uuid FK→users null | null until accepted |
| invite_email | text null | pending invite |
| status | text default 'pending' | pending/accepted/revoked |
Index: `unique(parent_user_id, coparent_user_id)`.

### 2.4 `kids`
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→users null | if kid has login |
| name | text not null | |
| name_ar | text null | |
| emoji | text null | |
| grade | text null | |
| streak | int default 0 | |
| reward_goal_points | int null | editable goal |
| login_approved | bool default false | mirrors users gate |
Index: trigram on `name`, `name_ar`.

### 2.5 `assigner_relationships` (adult ↔ kid)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| assigner_user_id | uuid FK→users | the adult |
| kid_id | uuid FK→kids | |
| role | text not null | role at link time |
| status | text default 'active' | active/pending/blocked |
Index: `unique(assigner_user_id, kid_id)`, `idx_rel_kid (kid_id)`.

### 2.6 `accounts` (PER kid + assigner — "multiple bank accounts per kid")
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| kid_id | uuid FK→kids | |
| assigner_user_id | uuid FK→users | owning assigner |
| acct_no | text unique not null | e.g. PR-1001 / TC-3001 |
| earned | int default 0 | available balance |
| pending | int default 0 | awaiting task approval |
| pending_redeem | int default 0 | held awaiting kid confirm |
| redeemed | int default 0 | lifetime redeemed |
| currency | text default 'USD' | display currency |
Constraints: `unique(kid_id, assigner_user_id)`; `check (earned>=0 and pending>=0 and pending_redeem>=0 and redeemed>=0)`. Index `idx_acct_kid (kid_id)`.

### 2.7 `tasks`
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| title | text not null | |
| points | int not null check(points>=0) | |
| assigner_user_id | uuid FK→users | creator/approver |
| category | text null | School/Home/Learning/Behavior |
| deadline | timestamptz null | |
| decay_points | int default 0 | pts lost per interval |
| decay_minutes | int default 0 | interval; 0 = no decay |
| status | text default 'assigned' | see §4.1 |
Index: `idx_task_assigner (assigner_user_id, status)`.

### 2.8 `task_assignments` (multi-kid assignment)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| task_id | uuid FK→tasks | |
| kid_id | uuid FK→kids | |
| status | text default 'assigned' | per-kid lifecycle (§4.1) |
| awarded_points | int null | after decay applied |
Index: `unique(task_id, kid_id)`, `idx_ta_kid (kid_id, status)`.

### 2.9 `task_completion_requests`
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| task_assignment_id | uuid FK | |
| kid_id | uuid FK→kids | |
| submitted_at | timestamptz default now() | |
| status | text default 'pending_approval' | pending_approval/approved/rejected |
| decided_by | uuid FK→users null | assigner |
| decided_at | timestamptz null | |
| reject_reason | text null | |

### 2.10 `points_transactions` (immutable ledger)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| account_id | uuid FK→accounts | |
| kid_id | uuid FK→kids | denormalized for query |
| assigner_user_id | uuid FK→users | actor |
| type | text not null | task_award\|bonus_gift\|redeem_hold\|redeem_settle\|redeem_release\|decay |
| points | int not null | signed delta |
| ref_task_id | uuid null | |
| ref_redemption_id | uuid null | |
| note | text null | |
Append-only (no UPDATE/DELETE). Index `idx_pt_account (account_id, created_at)`.

### 2.11 `redemption_records` (two-step lifecycle)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| kid_id | uuid FK→kids | |
| account_id | uuid FK→accounts | |
| acct_no | text | snapshot |
| initiating_assigner_id | uuid FK→users | who started it |
| amount_points | int not null check(>0) | |
| currency | text not null | snapshot |
| money_value | numeric(10,2) not null | display conversion snapshot |
| status | text default 'pending_confirmation' | pending_confirmation→redeemed/declined |
| confirmed_by_kid | uuid FK→users null | set on confirm/decline |
| initiated_at | timestamptz default now() | |
| confirmed_at | timestamptz null | |
| declined_at | timestamptz null | |
Index `idx_redemp_kid (kid_id, status)`, `idx_redemp_assigner (initiating_assigner_id)`.

### 2.12 `redemption_log` (event audit, parent-visible)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| redemption_id | uuid FK | |
| kid_id | uuid FK | |
| assigner_user_id | uuid FK | initiator |
| parent_user_id | uuid FK null | for parent cross-view |
| event | text not null | initiated\|confirmed\|declined |
| amount_points | int | |
| money_value | numeric(10,2) | |
| currency | text | |
| ts | timestamptz default now() | |

### 2.13 `notifications`
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| recipient_user_id | uuid FK→users | |
| type | text not null | approval\|gift\|safety\|redemption |
| text | text not null | |
| ref_id | uuid null | task/redemption/etc |
| unread | bool default true | |
Index `idx_notif_recipient (recipient_user_id, unread)`.

### 2.14 `currency_config`
| field | type | notes |
|---|---|---|
| code | text PK | USD/EUR/AED |
| symbol | text not null | |
| rate_per_10 | numeric(10,2) not null | 10 pts → value |
| label | text not null | |

### 2.15 `audit_log` (governance/safeguarding)
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| actor_user_id | uuid FK | |
| action | text not null | |
| target | text not null | human-readable |
| risk | text default 'low' | low/review/high |
| ts | timestamptz default now() | |

### 2.16 `schools` & `moderators`
`schools`: id, name, status. `moderation_queue`: id, title, detail, status (pending/review/approved/blocked), school_id, raised_by. Moderators are `role_memberships.role='Moderator'` optionally scoped to `school_id`.

---

## 3. REST API Contracts

Base `/api/v1`. JSON. Auth = Supabase JWT in `Authorization: Bearer`. Every request carries the **active role** via header `X-Active-Role` (validated against caller's `role_memberships`). Responses: `2xx` data, `4xx {error:{code,message,fields?}}`. All list endpoints paginate `?limit&cursor`.

### 3.1 Auth + MFA
- `POST /auth/login` → `{email,password}` → `{mfa_required:true, mfa_token}` | session.
- `POST /auth/mfa/verify` → `{mfa_token, code}` (6 digits) → `{access_token, refresh_token, roles:[...]}`. Scope: public. Validation: code 6 numeric.
- `POST /auth/refresh` → `{refresh_token}`.

### 3.2 Role selection
- `GET /me/roles` → `[{role, school_id, verified}]`. Auth: self.
- `POST /me/active-role` → `{role}` → `{active_role, scope:{kids:[...]}}`. Validation: role ∈ caller memberships, else `403 ROLE_NOT_HELD`.

### 3.3 Kid QR onboarding (any-assigner → new account, first-login approval)
- `POST /kids/qr/scan` → `{qr_token}` (encodes assigner_id) → creates `assigner_relationships(status=pending)` + **new `accounts`** (fresh `acct_no`, zero balances) → `{kid_id, account_id, acct_no, awaiting_approval:true}`. Auth: kid. Idempotent per (kid, assigner): returns existing account if present.
- `POST /kids/{kidId}/approve-login` → assigner-only; sets `login_approved=true`. Auth scope: parent/assigner of kid.
- `POST /assigners/{kidId}/qr` → generate QR token for a kid+assigner. Auth: assigner.

### 3.4 Task CRUD / assign
- `POST /tasks` → `{title, points, deadline, decay:{points,minutes}, category, kidIds:[...]}` → creates task + `task_assignments`. Auth: adult roles. Validation: points≥0, kidIds within caller scope.
- `GET /tasks?status=&q=` → caller-scoped tasks (assigner's own). Search `q` ≥3 chars.
- `PATCH /tasks/{id}` / `DELETE /tasks/{id}` → owner assigner only.

### 3.5 Completion request + approve/reject
- `POST /assignments/{id}/complete` → kid marks done → creates `task_completion_request(status=pending_approval)`, assignment→`pending_approval`, emits `approval` notification to assigner. Auth: kid owner.
- `POST /assignments/{id}/approve` → assigner; computes decay → `awarded_points`, moves `pending→earned`, writes `points_transactions(type=task_award)`, assignment→`completed`. Auth: owning assigner.
- `POST /assignments/{id}/reject` → `{reason}` → assignment→`assigned`, request→`rejected`.

### 3.6 Points grant + bonus
- `POST /accounts/{accountId}/bonus` → `{points, note}` → `points_transactions(type=bonus_gift)`, `earned += points`, emits `gift` notification. Auth: assigner owning account (or linked co-parent).

### 3.7 Redemption — two-step (initiate → kid confirm/decline)
- `POST /redemptions` → `{account_id, amount_points}` → validates `earned >= amount_points`; moves `earned → pending_redeem`; creates `redemption_records(status=pending_confirmation)`; `points_transactions(type=redeem_hold, -amount)`; `redemption_log(event=initiated)`; emits `redemption` notification to kid. Auth: initiating assigner. Response includes snapshot `money_value` from `currency_config`.
- `POST /redemptions/{id}/confirm` → kid: status→`redeemed`, `confirmed_by_kid`, `confirmed_at`; `pending_redeem -= amount`, `redeemed += amount`; `points_transactions(type=redeem_settle)`; `redemption_log(event=confirmed)`; notify assigner+parent. Auth: kid owner.
- `POST /redemptions/{id}/decline` → kid: status→`declined`, `declined_at`; `pending_redeem -= amount`, `earned += amount` (released); `points_transactions(type=redeem_release)`; `redemption_log(event=declined)`; notify assigner+parent. Auth: kid owner.

### 3.8 Redemption history (own + parent cross-assigner)
- `GET /redemptions?kidId=&scope=own|all` → assigner sees **own**; **Parent** with `scope=all` sees **all redemptions for their kids across every assigner/account**. Authz enforced server-side + RLS.
- `GET /kids/{kidId}/overview` → parent "Overall picture": every per-assigner account (earned/pending/redeemed/value-if-redeemed) + per-kid grand total.

### 3.9 Name search (≥3 chars)
- `GET /people?q=` → if `len(trim(q)) < 3` → `400 SEARCH_MIN_LENGTH` (client shows full list + "type 3+ letters" hint, no call). Else case-insensitive trigram match on English/Arabic names, caller-scoped.

### 3.10 Notifications
- `GET /notifications?type=all|approval|gift|safety` → recipient-scoped.
- `POST /notifications/{id}/read` and `POST /notifications/read-all`.

### 3.11 Currency config
- `GET /currency` → all configs. `PATCH /currency/{code}` → `{rate_per_10}` (admin/parent settings). Display values are recomputed; **never** stored as money on balances.

---

## 4. State Machines

### 4.1 Task (per `task_assignments`)
```
assigned ──kid "Done!"──▶ pending_approval ──approve──▶ completed
   ▲                              │
   └──────── reject ──────────────┘
(decay applied at approval: awarded = max(0, points - floor(minutesLate/decay_minutes)*decay_points))
```
Aggregate task.status reflects assignments (e.g. any pending_approval → shows pending). `completed` is terminal for that assignment.

### 4.2 Redemption (two-step, v8)
```
            POST /redemptions
   earned ───────────────▶ pending_confirmation
                                 │  (points held in pending_redeem)
                  kid confirm ───┼──▶ redeemed   (pending_redeem→redeemed)   [terminal]
                  kid decline ───┴──▶ declined   (pending_redeem→earned)     [terminal]
```
Invariant at all times: `earned + pending_redeem` is conserved across hold/settle/release; ledger rows make it auditable.

### 4.3 Kid-login approval
```
qr_scan → relationship.pending + account created → login_approved=false
   parent/assigner approve → login_approved=true → kid dashboard unlocked
```

---

## 5. Authorization Model

- **One user → many `role_memberships`.** JWT identifies the user; `X-Active-Role` selects the working scope; server validates membership before every action.
- **Active-role scoping:** Parent/Co-Parent see their linked kids + tasks **they** assigned; Teacher/Moderator see their students + their own assigned tasks. Switching role rescopes — never widens beyond memberships.
- **Parent cross-account read:** a Parent may **read** all accounts/redemptions for their own kids across **every** assigner (overview + history `scope=all`), but may **write** (bonus/redeem/approve) only on accounts they own, unless linked as co-parent.
- **Least privilege / defense-in-depth:** enforce in app layer **and** Postgres **RLS** policies keyed on `auth.uid()` → `assigner_relationships`/`parent_links`. Kids may act only on their own assignments/redemptions. Moderators get oversight read + moderation-queue write, not financial mutations.
- **Independent Teacher/Moderator** memberships require `verified=true` (moderation queue) before scoping to students.

---

## 6. Notification / Event Catalog

| Event | Trigger | Recipients | type |
|---|---|---|---|
| `task.completion_submitted` | kid marks Done | owning assigner | approval |
| `task.approved` / `task.rejected` | assigner decision | kid | approval |
| `points.bonus_gifted` | bonus grant | kid; co-parent (info) | gift |
| `redemption.initiated` | assigner starts redeem | **kid** (confirm/decline) | redemption |
| `redemption.confirmed` | kid confirms | initiating assigner + parent | redemption |
| `redemption.declined` | kid declines | initiating assigner + parent | redemption |
| `kid.access_requested` | QR scan / teacher link request | parent/moderator | safety |
| `kid.login_approved` | parent approves first login | kid | safety |
| `moderation.flagged` | point spike / new independent teacher | moderator | safety |

Persist every financial/safeguarding event to `audit_log` and (for redemptions) `redemption_log`. Push via FCM; mirror in `notifications`.

---

## 7. Non-Functional / Security / Child-Safety Must-Haves

- **MFA mandatory** for all adult roles (Supabase GoTrue). No adult mutation without verified session.
- **RLS on every table** — deny-by-default; policies as in §5. Ledger tables (`points_transactions`, `redemption_log`, `audit_log`) are **append-only** (revoke UPDATE/DELETE).
- **Ledger integrity:** all balance changes occur in a single DB transaction with the matching `points_transactions` row; reconcile `accounts` against the ledger nightly. Use row locks on `accounts` during redeem to prevent double-spend.
- **Child-safety:** kid identities require parent approval (`login_approved`) before use; minimize kid PII (first name + emoji only by default); no free-text chat; moderation queue for access requests and anomalies (point spikes).
- **Non-banking guardrail:** UI and ToS must state points are not money and redemptions settle **offline**; `money_value` is **display-only** conversion.
- **Privacy & data residency:** region-agnostic; make data region configurable. **⚠ Legal-review required (do not self-certify):** children's privacy (COPPA/GDPR-K/age-gating), parental consent records, data-retention/deletion, and any reward/“value” framing per local consumer law. Flag these for counsel — this guide provides no legal advice.
- **Observability:** Sentry/Crashlytics; structured audit; PostHog with PII-safe events.
- **i18n/RTL:** all strings translated EN/AR; LTR/RTL document-level switch; currency/locale configurable.
- **Accessibility:** carry prototype standards (focus-visible, focus-trap modals, ARIA, reduced-motion, contrast).

---

## 8. Build Sequencing

1. **Foundations:** Supabase project, schema (§2) + RLS skeleton; `currency_config` + `schools` seed.
2. **Auth + roles:** login, **MFA**, `role_memberships`, active-role selection/switcher (§3.1–3.2, §5).
3. **Kids & accounts:** kid entities, QR onboarding → **per-assigner account creation**, first-login approval (§3.3, §4.3).
4. **Tasks:** CRUD + multi-kid assignment + decay model (§3.4, §2.7–2.8).
5. **Completion & approvals:** request → approve/reject → `points_transactions(task_award)` + balance moves (§3.5, §4.1).
6. **Points:** bonus gifting + immutable ledger reconciliation (§3.6, §2.10).
7. **Redemption two-step:** initiate → **kid confirm/decline**, holds/settle/release, `redemption_records` + `redemption_log` (§3.7, §4.2). *Highest-risk: build with full ledger tests.*
8. **History & overviews:** own vs **parent cross-assigner** views; per-kid overview/grand total (§3.8).
9. **Search & notifications:** ≥3-char EN/AR search; notification center + FCM + event catalog (§3.9–3.10, §6).
10. **Oversight & governance:** moderation queue, audit log, anomaly flags (§2.15–2.16, §6).
11. **Settings/i18n/a11y polish:** currency/language/theme; RTL; accessibility parity.
12. **Hardening:** RLS test matrix, ledger reconciliation job, security/child-safety review, legal-review checklist sign-off (§7).
