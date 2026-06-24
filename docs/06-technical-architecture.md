# Section 10 — Technical Architecture

**Project:** KidsBank (KidsBanking)
**Author:** Dell — Solutions Architect
**Audience:** Solo, bootstrapped founder
**Standing constraints:** Boring, proven, managed, low-cost, low-ops · region-agnostic (region-driven decisions flagged) · MVP vs scale clearly distinguished · secrets / auth / child-data protection are non-negotiable.

> **What this app is (architecturally):** A motivational reward system. Kids earn **in-app points** by completing tasks; assigners (parents, co-parents, teachers, moderators) approve completions and later mark points **redeemed/deemed** after settling value **outside the app**. KidsBank is **not** a payment, wallet, or money-movement system in MVP. Keeping it that way is an explicit architectural goal — it avoids financial-regulation surface area. See the "non-banking guardrails" note below.

---

## 10.0 Guiding principles

1. **Managed-first.** Prefer BaaS/PaaS (auth, DB, push, hosting) over self-managed servers. The founder's time is the scarcest resource.
2. **One backend, many clients.** A single API/service layer serves mobile (kid + adult) and the adult web dashboard.
3. **Ledger is append-only.** Points are an immutable transaction ledger; balances are derived. Never mutate-in-place a balance.
4. **Multi-tenant from day one in the data model, lazy in the infrastructure.** Model `tenant`/`account-context` boundaries now; defer heavy isolation (separate DBs/clusters) until scale.
5. **Child data is special.** Minimize collection, isolate, encrypt, gate every child action behind an adult approval where the prompt requires it.
6. **No real money in MVP.** No card processing, no payouts, no PCI scope. "Redemption" = marking points as deemed; settlement happens offline.

### Non-banking guardrails (architectural)
- No funds custody, no IOUs, no transferable balances between users.
- Points are non-monetary, non-withdrawable reward units scoped to a single kid↔assigner relationship.
- "Currency" is **display/valuation metadata only** (e.g., 10 pts ≈ 5 USD) — it never triggers a transaction.
- Keep these properties enforceable in code (ledger entry types, no transfer endpoint) so positioning can't drift accidentally.

---

## 10.1 System context (high level)

```
        ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
        │ Kid mobile  │   │ Adult mobile│   │ Adult web    │
        │ (tablet/    │   │ (parent/    │   │ dashboard    │
        │  phone)     │   │ co-parent/  │   │ (parent/     │
        │             │   │ teacher/mod)│   │ teacher/mod) │
        └──────┬──────┘   └──────┬──────┘   └──────┬───────┘
               │                 │                 │
               └────────── HTTPS / JSON ───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     API / Backend       │
                    │  (auth, RBAC, ledger,   │
                    │   tasks, QR, approvals) │
                    └─────┬───────────┬───────┘
          ┌───────────────┘           └───────────────┐
   ┌──────▼──────┐  ┌──────────────┐  ┌──────────────┐ │
   │ Relational  │  │ Auth/Identity│  │ Push/Notif   │ │
   │ DB (Postgres│  │ provider     │  │ (FCM/APNs)   │ │
   │  + ledger)  │  │ (MFA)        │  │              │ │
   └─────────────┘  └──────────────┘  └──────────────┘ │
   ┌─────────────┐  ┌──────────────┐  ┌────────────────▼┐
   │ Object store│  │ Analytics +  │  │ Audit log sink   │
   │ (avatars,   │  │ crash report │  │ (append-only)    │
   │  QR assets) │  └──────────────┘  └──────────────────┘
   └─────────────┘
```

---

## 10.2 Mobile app architecture options

Three realistic shapes (detailed stack comparison in `07-tech-stack.md`):

| Option | What it is | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. Single cross-platform codebase (Flutter or React Native)** | One app project, role-aware UI; kid vs adult experiences are different navigation trees in the same binary (or two flavors from one codebase). | One team/skillset; fastest for solo founder; iOS+Android+ (web) from one base; strong RTL/i18n support. | Some native edges (deep camera/QR, secure storage) need plugins. | **Recommended for MVP.** |
| **B. Native iOS + native Android** | Separate Swift + Kotlin apps. | Best performance/UX fidelity; full platform API access. | 2× build/maintenance; impossible for solo founder at MVP. | Only at large scale with a real team. |
| **C. Mobile (cross-platform) + separate web SPA for dashboard** | Cross-platform app for phones/tablets; a React/Next web app for the adult dashboard. | Web dashboard is genuinely better on desktop; SEO/landing reuse. | Two front-end codebases. | **Recommended at scale**, or sooner if the web dashboard is a priority. |

**MVP decision:** **Option A** — one cross-platform codebase. Inside it:
- **Kid mode:** large-touch, gamified, minimal navigation, no destructive actions.
- **Adult mode:** task management, approvals, redemption marking, dashboards.
- Mode is selected by **role from the authenticated session**, not a toggle the kid can flip.

**Client architecture (inside the app):**
- Layered: `UI → state/view-model → repository → API client`.
- **Offline-tolerant reads** (cached task lists, balances) but **writes go online** (approvals, ledger changes must be server-authoritative).
- **Secure storage** for tokens (Keychain/Keystore), never plain prefs.
- **Feature flags** to dark-ship teacher/school/merchant features.

> **Web dashboard for MVP:** Adults need a web dashboard per the product brief. Cheapest path: a **responsive web build of the same cross-platform framework** (Flutter Web / RN-Web) OR a thin separate web app. If using Flutter, Flutter Web covers it; if React Native, add a small Next.js dashboard sharing the API. Decision recorded in decisions inbox.

---

## 10.3 Backend architecture

| Option | Description | Pros | Cons | Fit |
|---|---|---|---|---|
| **BaaS (Firebase / Supabase)** | Managed auth + DB + functions + push. | Almost no ops; auth/MFA/push out of the box; fastest MVP. | Vendor lock-in; complex authorization logic can get awkward; ledger/transactional integrity needs care. | **MVP.** |
| **Single deployable API (modular monolith)** on managed PaaS | One Node/.NET service, cleanly module-separated (auth, tasks, ledger, notifications, admin), deployed to a managed container/app platform. | Full control of authz & ledger transactions; still low ops; easy to reason about; clean migration target. | You own more (migrations, scaling config). | **MVP→scale bridge / scale.** |
| **Microservices** | Separate services per domain. | Independent scaling; team autonomy. | Massive ops overhead; premature for solo founder. | **Avoid until real scale + team.** |

**Recommendation:**
- **MVP:** Managed BaaS **or** a modular monolith on a managed platform. For a solo founder who wants the absolute least ops and built-in MFA/push, **Supabase (Postgres + Auth + Edge Functions)** is the sweet spot — it gives a real relational DB (critical for the ledger) plus managed auth. (Full rationale in `07-tech-stack.md`.)
- **Scale:** Keep the **modular monolith** on a managed container platform, extracting only proven hotspots (e.g., notifications, analytics ingestion) into separate workers. Resist microservices until org/scale demands it.

**Backend module boundaries (logical, not physical):**
- `identity` — accounts, sessions, MFA, device approval.
- `directory` — families, schools, memberships, role assignments.
- `tasks` — task definitions, assignments, schedules, decay rules.
- `completions` — completion requests, approvals/rejections.
- `ledger` — append-only points transactions, balances (per account), redemption records.
- `notifications` — fan-out to push/in-app.
- `admin/moderation` — review queues, flags, escalations.
- `config` — currency/valuation, localization, feature flags.
- `audit` — append-only audit sink (cross-cutting).

---

## 10.4 Database design direction

**Primary store: a relational database (PostgreSQL).** Rationale: the core domain is relationships + an auditable financial-style ledger + approval workflows — all of which want ACID transactions, foreign keys, and constraints. NoSQL would push integrity into app code, which is risky for a points ledger.

**Key modeling directions** (full entity detail in `08-data-model.md`):
- **Append-only `points_transaction` ledger.** Every earn, decay, bonus, and redemption is a row. Balances are computed (and optionally cached in a materialized `account_balance` row updated transactionally).
- **Per-assigner accounts.** A kid has **one account per assigner relationship** ("multiple bank account numbers for the same kid"). Balances are scoped to `(kid, assigner_account)`. This is the spine of the data model.
- **Soft tenancy column** (`tenant_id` / `org_id`) on tenant-scoped tables so families and schools are isolatable by query and, later, by row-level security.
- **Row-Level Security (RLS)** (native in Postgres/Supabase) to enforce "you can only see your kids / your students / your tenant" at the DB layer as defense-in-depth — not relying on app code alone.
- **No hard deletes for ledger/audit/child records** — use status flags + retention policy.

**Caching:** none needed for MVP. At scale, add a read cache (managed Redis) for hot balances and a search index only if needed.

---

## 10.5 API design approach

- **Style:** **REST/JSON over HTTPS** for MVP (boring, universally tooled, easy to cache/debug). Consider GraphQL only if client over-fetching becomes a real problem at scale — not before.
- **Versioning:** `/v1/...` path prefix from day one.
- **AuthN:** Bearer tokens (JWT/opaque) issued by the auth provider; short-lived access token + refresh token; tokens in secure storage.
- **AuthZ:** every endpoint checks **role + relationship + tenant** (see 10.7). Authorization is server-side and also enforced at the DB via RLS.
- **Idempotency:** completion/approval/redemption writes accept an idempotency key to avoid double-credit on retries (important on flaky mobile networks).
- **Validation:** strict schema validation at the edge; reject unknown fields.
- **Pagination & filtering:** cursor-based lists for tasks/ledger history.
- **Webhooks/events (later):** internal event bus for notification fan-out and analytics; can start as in-process function calls.
- **Rate limiting & abuse controls** at the API gateway/edge.

**Representative resources:**
```
POST   /v1/auth/login                (MFA challenge flow)
POST   /v1/session/active-role        (set active role for multi-role identity)
POST   /v1/kids                       (create kid profile)
POST   /v1/kids/{id}/qr               (issue onboarding QR — bound to issuing assigner)
POST   /v1/devices/claim              (kid scans QR -> pending device)
POST   /v1/devices/approve            (parent approves first login -> ensures (kid,assigner) account, idempotent)
POST   /v1/tasks                      (create task + point value + deadline + decay)
POST   /v1/tasks/{id}/assignments     (assign to one/many kids)
POST   /v1/assignments/{id}/complete  (kid marks complete -> completion request)
POST   /v1/completions/{id}/approve   (assigner approves -> ledger earn entry)
POST   /v1/kids/{id}/bonus            (gift bonus points)
POST   /v1/accounts/{id}/redeem       (mark points redeemed/deemed)
GET    /v1/accounts/{id}/ledger       (paged history)
GET    /v1/accounts/{id}/redemptions  (assigner's own redemption history for this account)
GET    /v1/kids/{id}/redemptions      (parent: redemption history across ALL assigners)
GET    /v1/kids/{id}/overview         (parent: overall account picture across ALL assigners)
GET    /v1/people/search?q=           (name search; server enforces min-3-char + active-role scope)
GET    /v1/dashboard/summary          (counts: earned/redeemed/pending)
```

---

## 10.6 Authentication & authorization model

**Non-negotiable: secrets, auth, and child-data protection.**

**Authentication**
- **Adults:** email/password or social login **+ MFA** (TOTP/SMS/email OTP). MFA is required by the brief ("simulate authentication with MFA") and is a genuine safety control for accounts that manage children.
- **Kids:** **no independent credentials and no PII-heavy signup.** A kid logs in via **QR onboarding** (10.8) on their own device. **First-time login must be approved by the owning adult.** Kid sessions are long-lived-but-revocable and scoped strictly to kid-mode capabilities.
- **Device approval:** new device for a kid = pending state until an adult approves; store device fingerprint + approval record in audit log.
- **Session/token:** short-lived access + refresh; revoke on suspicious activity; secure storage only.

**Authorization (RBAC + relationship + tenant)**
Authorization is a function of **three** things, all checked server-side:
1. **Role** (parent, co-parent, teacher, moderator, kid, admin) — for a multi-role identity, the **active role** resolved for the request (from session/JWT claim or explicit active-role context), evaluated against **that role's** memberships/relationships only (never the union of the user's roles).
2. **Relationship** (is this kid/student actually linked to you *in the active role*?).
3. **Tenant/context** (which family or school does this action belong to?).

Critically: **the assigner of a task is the approver/redeemer of that task.** A parent cannot approve a task a teacher assigned, and vice-versa, even though both can *view* the kid. This relationship-scoped permission is enforced at the ledger-account level (each assigner operates on their own account with the kid).

> **Region flag:** the legal **age threshold and parental-consent mechanism** for child accounts is region-driven (e.g., COPPA-style vs GDPR-K vs others). Architect consent as a **configurable, recorded gate**, not a hardcoded age. Founder must get legal review per target region.

---

## 10.7 Role / permission model

**Roles:** `parent`, `co_parent`, `teacher`, `moderator`, `kid`, `platform_admin`.

| Capability | Parent | Co-parent | Teacher | Moderator | Kid |
|---|---|---|---|---|---|
| Create kid profile | ✅ | ✅ (shared family) | ⛔ | ⛔ | ⛔ |
| View kids/students | own family | own family | assigned students | school's teachers/students (oversight) | self only |
| Search people by name (min 3 chars, active-role scope) | own kids | own kids | own students | school scope | ⛔ |
| Create/assign tasks | ✅ | ✅ | ✅ (to own students) | ✅ (to own students) | ⛔ |
| Approve completion | own tasks only | own tasks only | own tasks only | own tasks only | ⛔ |
| Mark redeemed/deemed | own account w/ kid | own account w/ kid | own account w/ student | own account w/ student | ⛔ |
| View own redemption history | own accounts | own accounts | own accounts | own accounts | own (read) |
| View kid's redemption history + overall picture across ALL assigners | own kids | own kids | ⛔ | ⛔ | ⛔ |
| Hold multiple roles + switch active role | ✅ | ✅ | ✅ | ✅ | ⛔ |
| Gift bonus points | ✅ | ✅ | ✅ | ✅ | ⛔ |
| Mark task complete (request) | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Approve kid first-login | ✅ | ✅ | ✅ (own students) | ✅ | ⛔ |
| Review teacher access/activity | ⛔ | ⛔ | ⛔ | ✅ (school scope) | ⛔ |
| Platform moderation/escalation | ⛔ | ⛔ | ⛔ | partial (school) | ⛔ |

**Model design:**
- **Permissions are derived**, not stored per-user: `(role) × (relationship) × (tenant) → allowed actions`. Keep a single policy module so rules live in one place and are testable.
- **One identity, many roles.** A single `User` can hold **multiple role memberships** (e.g., `parent` in a family tenant **and** `teacher` in a school tenant) — one login, multiple role contexts. The client exposes an **active-role switcher**; the server resolves an **active role** per request (from the session/JWT claim or an explicit `X-Active-Role`/context parameter) and **scopes people and tasks to that active role**. Authorization MUST evaluate against the **active role's** memberships/relationships only — never the union of all the user's roles — to prevent cross-role data bleed.
- **Relationships are first-class rows** (parent↔kid, teacher↔student, moderator↔teacher), each carrying status (active/pending/revoked) and an audit trail.
- **Account-per-assigner is provisioned on QR claim approval.** When a kid scans **any** assigner's QR and the owning guardian approves (10.8), the system creates the assigner↔kid **Relationship** (if absent) and its **one Account** — idempotently (re-scanning an existing assigner reuses the account). A new assigner ⇒ a new isolated account/ledger; balances never pool across assigners.
- **Parent cross-account visibility.** A parent (guardian) can **read** the consolidated picture of their kid's accounts across **all** assigners — per-assigner balances, a per-kid grand total, value-if-redeemed, and **redemption history across all assigners**. This is a **read-only aggregation** scoped to the parent's guardianship of that kid; it exposes balances/redemption records only, **not** another assigner's private task management, and never creates a pooled, redeemable balance. Enforce via policy: `guardian(parent, kid) ⇒ read accounts/redemptions WHERE kid = X` (read), distinct from `assigner-owns-account ⇒ write`.
- **Name search is scope-bound.** People search (kids/students) runs against the **active role's** relationships only; the API enforces the scope server-side (and at the DB via RLS), so a min-3-char client filter can never widen visibility beyond the caller's scope.
- **Co-parent** = a second adult linked to the same family tenant with parent-equivalent rights but their **own** assigner account/ledger with each kid.
- **Moderator** is an **oversight** role (governance/safeguarding) within a school tenant — it reviews teacher associations and activity; it is *not* a super-admin over the platform.

---

## 10.8 QR onboarding flow architecture

Goal: let a kid log in on their own device without handling kid credentials, with adult approval as a safety gate. **The same flow also lets a kid connect to *any* assigner: scanning an assigner's QR provisions a new per-(kid, assigner) account on guardian approval.**

```
Parent app                         Backend                         Kid app
   │  POST /kids/{id}/qr              │                                │
   │ ───────────────────────────────►│  create short-lived           │
   │                                  │  onboarding token (kid_id,    │
   │ ◄─── QR encodes opaque token ────│  assigner_id, nonce,          │
   │      + claim URL                 │  exp ~ few min, single-use)   │
   │                                  │                                │
   │                                  │        kid scans QR ──────────►│
   │                                  │  POST /devices/claim {token,   │
   │                                  │       device fingerprint}      │
   │                                  │◄───────────────────────────────│
   │                                  │  create PENDING device         │
   │   push: "Approve <kid>'s        │  + notify owning guardian      │
   │   device for <assigner>?" ◄──────│                                │
   │  POST /devices/approve ─────────►│  mark APPROVED, ensure         │
   │                                  │  Relationship + Account for    │
   │                                  │  (kid, assigner) [idempotent], │
   │                                  │  issue kid session ───────────►│  logged in (kid mode)
```

**Security properties (non-negotiable):**
- QR encodes an **opaque, single-use, short-TTL token** bound to the **issuing assigner** — never the kid's identity, never a long-lived secret.
- Claiming a token only creates a **pending** device; **no access and no account** until an adult approves.
- **First login always requires explicit adult approval.** Record device fingerprint, **issuing assigner**, time, approver, IP/region in the audit log.
- **Account provisioning is gated by approval, not by scan.** On approval the backend **ensures** the assigner↔kid Relationship and its **one Account** exist (creating them if absent) — **idempotently**, so re-scanning an assigner the kid already has never duplicates an account. A **new** assigner ⇒ a **new, isolated** account/ledger; balances never pool across assigners.
- A **non-guardian assigner** (teacher/moderator, Later) issuing a QR still requires **guardian consent/approval** before any account is created.
- Tokens are revocable; expired/used tokens are rejected. Re-issuable if expired; rate-limit issuance to prevent QR spamming.

---

## 10.9 Notification services

- **Channels:** push (mobile), in-app inbox, optional email for adults (approvals, security events).
- **Provider:** managed push — **FCM** (Android + can relay to APNs) for MVP; APNs directly for iOS. If on Supabase/Firebase, use their integrations; otherwise a managed push service.
- **Architecture:** domain events (`completion.requested`, `completion.approved`, `device.claim.pending`, `points.redeemed`, `task.due_soon`) → notification module → channel adapters. Start in-process; move to a queue/worker at scale.
- **Persistence:** every notification is also stored as an in-app record (source of truth), so push is best-effort, inbox is reliable.
- **Preferences & fatigue control:** per-user notification settings; batching/quiet-hours to avoid notification fatigue (a named product risk).
- **Child-safety:** kid-facing notifications are limited, non-promotional, and contain no external links in MVP.

---

## 10.10 Multi-tenant considerations (families / schools / merchants)

Three tenant archetypes, modeled with **one shared mechanism** (`tenant`/`org` with a `type`), specialized by behavior:

| Tenant type | Phase | Members | Isolation needs |
|---|---|---|---|
| **Family** | MVP | parent(s), co-parent(s), kids | Strong per-family isolation; small; many tenants. |
| **School / org** | Later | moderator(s), teachers, students | Governance/oversight; teacher membership lifecycle; safeguarding review. |
| **Merchant / store** | Future | merchant admin, catalog, redemption offers | Mostly read of redemption eligibility; kept arms-length; **no access to child PII**. |

**Approach:**
- **Single database, shared schema, `tenant_id` discriminator + RLS** for MVP and well into scale. Cheapest, lowest ops, proven.
- **Membership table** links users↔tenant with a role and status; a user can belong to multiple tenants (a parent who is also a teacher).
- A **kid can exist in multiple tenants** (their family *and* a school) — but each assigner relationship has its **own account/ledger** with the kid, so cross-tenant point mixing never happens.
- **Merchant tenants are strongly fenced:** they see redemption tokens/eligibility, never child identity or family data. Design this boundary now even though merchants are future-phase, so it isn't bolted on unsafely later.
- **Scale option:** if a large school demands isolation/compliance, promote that tenant to a **dedicated schema or DB** — the `tenant_id` model makes this a migration, not a rewrite.

---

## 10.11 Localization architecture (i18n, RTL/LTR)

- **Externalized strings** via standard i18n resource files (ICU message format for plurals/gender/number).
- **Locale resolution order:** user setting → device locale → tenant default → app default.
- **RTL/LTR:** use the framework's directionality system (Flutter & RN both support `Directionality`/`I18nManager`); build layouts with start/end (not left/right); **test Arabic/Hebrew mirrored layouts** as a first-class case, not an afterthought.
- **Server-supplied content** (task titles, notes) is user-generated and rendered as-is with direction auto-detection; **system content** is translated.
- **Formatting:** dates, numbers, and point displays are locale-formatted on the client.
- **Pluralization & gender** handled via ICU, not string concatenation.
- **Translation pipeline:** keys in code, values in a managed catalog; missing-key fallback to default locale. A translation-management service can come later.

> **Region flag:** which locales/scripts to support first is a market decision; architecture stays locale-agnostic.

---

## 10.12 Currency configuration model

**Currency in KidsBank is valuation/display metadata only — never a transaction.**

- **`currency_config` per assigner-account (or per tenant default):** defines the **points-to-value mapping** the assigner uses, e.g. `10 points = 5 USD` (also expressible as 4 EUR / 20 AED). This is the parent's private valuation rule.
- Fields: currency code (ISO 4217), points-per-unit (or unit-per-points) ratio, optional rounding rule, effective-from timestamp (rules can change over time without rewriting history).
- **Historical integrity:** when points are marked redeemed, **snapshot the valuation used** onto the redemption record, so later changes to the rate don't rewrite past redemptions.
- **No FX, no conversion between currencies, no live rates.** Each assigner picks one display currency. Multi-currency = different assigners may use different currencies; the app never converts between them.
- Currency is **display metadata for redemption settlement that happens offline** — reinforcing the non-banking posture.

---

## 10.13 Audit logging

- **Append-only `audit_log`** capturing security- and trust-relevant events: logins, MFA events, device claim/approval/rejection, role/relationship changes, task approvals/rejections, redemptions, bonus grants, moderation actions, config changes.
- Each entry: actor, role, tenant, action, target entity, before/after (where applicable), timestamp, source IP/region, request/correlation id.
- **Immutable & separate concern:** write-once; never updated/deleted; ideally a separate table/sink with restricted write path.
- **Child-safety value:** audit trails are a core safeguarding requirement (who approved a kid's device, who changed a relationship, who redeemed points).
- **Retention:** define retention windows; child-related logs handled under data-minimization/retention policy (region-driven — flag for legal review).

---

## 10.14 Analytics

- **Product analytics:** activation, task creation/completion, approval latency, redemption usage, retention. Use a managed analytics SDK.
- **Crash/error reporting:** managed crash reporter (e.g., Crashlytics/Sentry) on mobile + backend error tracking.
- **Child-data discipline:** **no behavioral tracking of children for advertising**, ever. Analytics on kid usage must be privacy-respecting, aggregate, and non-identifying. Keep kid analytics minimal and separate from any future marketing tooling.
- **No third-party ad SDKs in child-facing flows** (also an app-store policy concern — flag for review).
- **Separation:** route adult-app analytics and kid-app analytics through distinct configs so child data is never co-mingled with marketing pixels.

---

## 10.15 Admin / moderation system

- **Two layers:**
  1. **School moderator (tenant-scoped):** reviews teacher access, activity, and account associations within their school; can suspend/escalate. This is product functionality.
  2. **Platform admin (internal):** internal tooling for support, abuse handling, content/activity review, account recovery, and incident response. Minimal, audited, least-privilege.
- **Moderation primitives:** flag/report on tasks, accounts, and relationships; review queue; escalation path; suspend/restrict actions; every action audited.
- **Build cheap for MVP:** platform admin can start as a **secured internal web view / SQL-backed console** (low-ops); a richer admin dashboard comes at scale.
- **Safeguarding by design:** moderation hooks exist from MVP even if lightly used, because retrofitting safety is dangerous.

---

## 10.16 MVP vs Scale summary

| Concern | MVP (boring/managed/cheap) | Scale (still boring, more headroom) |
|---|---|---|
| Mobile | One cross-platform codebase, role-aware | + dedicated web SPA dashboard; maybe native modules for hot paths |
| Backend | Supabase BaaS **or** modular monolith on managed PaaS | Modular monolith + extracted workers (notifications, analytics) |
| DB | Single Postgres, shared schema, RLS | + read replicas/cache; isolate large school tenants if needed |
| Auth/MFA | Managed auth provider w/ MFA | Same, + stronger device/risk signals |
| Notifications | FCM + in-app inbox, in-process fan-out | Queue + worker fan-out |
| Tenancy | `tenant_id` + RLS, families only live | Add school + merchant tenants; promote big tenants to isolated schema |
| Admin | Secured internal console | Full moderation dashboard + workflows |
| Analytics | Managed product + crash SDKs | + warehouse/event pipeline (privacy-segregated) |

**Tradeoff headline:** Every MVP choice optimizes for *least ops + lowest cost + proven tech*, while the data model and module boundaries are designed so the scale path is a **migration, not a rewrite**. The biggest deliberate constraint — keeping points non-monetary and settlement offline — is both an architectural simplifier and a regulatory shield.

---

## 10.17 Key tradeoffs & decision points (explicit)

1. **BaaS vs own backend (MVP).** BaaS = fastest, least ops, but lock-in and awkward complex authz. Own modular monolith = more control, slightly more ops. **Chosen: Supabase (Postgres+Auth) for MVP** — keeps a real relational ledger *and* low ops. Revisit if authz rules outgrow RLS.
2. **REST vs GraphQL.** REST chosen for MVP simplicity; GraphQL only if client over-fetching becomes painful.
3. **Single codebase vs separate web dashboard.** Single codebase for speed now; separate web dashboard at scale (or sooner if desktop dashboard UX is a priority).
4. **Shared-schema multi-tenancy vs isolated DBs.** Shared schema + RLS now; isolate only specific large/compliance-bound tenants later.
5. **Where consent/age logic lives.** Configurable, recorded gate (not hardcoded) because it's region-driven and needs legal review.

> Notable decisions are recorded in `.squad/decisions/inbox/dell-*.md`.
