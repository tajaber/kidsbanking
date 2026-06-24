# Squad Decisions

## Active Decisions

### 2026-06-16: Team founded — KidsBank build-and-launch advisory crew
**By:** tajaber (via Squad Coordinator)
**What:** Cast a five-specialist team (Ocean — Strategist, Ryan — Product Manager, Dell — Solutions Architect, Caldwell — UX Strategist, Bloom — Go-to-Market Advisor) plus silent members Scribe, Ralph, and Rai. Mandate: collaboratively produce a comprehensive, highly detailed, step-by-step **internal execution plan and practical guide** for building and launching the KidsBank mobile app.
**Why:** Solo, bootstrapped founder needs on-call specialist consultation across the full build-and-launch lifecycle.

### 2026-06-16: Standing constraints — apply to ALL agents on every task
**By:** tajaber (via Squad Coordinator)
**What:**
1. **Audience = solo / bootstrapped founder.** Limited time, money, team. Favor lean, high-leverage, low-cost approaches. Never assume hires, ad budget, or fundraising.
2. **Region-agnostic by default.** No country/market/currency/language/store/regulatory assumptions unless the founder specifies. Flag where region matters.
3. **Internal Execution Plan only.** Output is internal planning/execution guidance — not an external pitch, investor doc, or marketing copy.
**Why:** These three constraints frame every recommendation; baked into each charter and surfaced here so the whole team stays aligned.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction

---

## Session Decisions — 2026-06-24 (Prototype Build + Frontend Iteration)

### 2026-06-23: MVP scope cut & regulation-light positioning
**By:** Ryan (Mobile Product Manager) · **Date:** 2026-06-23 · **Status:** Proposed

Defined KidsBank MVP as a single-family motivational loop (Parent + Co-parent + Kid); deferred Teacher/Student hierarchy and School moderation to Phase 2; Merchant/store redemption to Future. Established MVP defaults:
- No real funds, ever — redemption is record-only + ledger action
- Points ledger is append-only; each assigner↔kid relationship is separate balance ("multiple bank accounts for same kid")
- MFA via TOTP/email OTP
- Decay = linear, floored at 0, based on kid's completion timestamp
- Bonus points positive-only
- Currency = manual value, one per relationship
- i18n + RTL architectural from day one (1–2 launch languages ship)
- First-login approval is a hard, non-bypassable child-safety gate

Optimizes for founder priorities: fastest demand validation, safest/simplest MVP, child safety/trust, low-complexity architecture, clean family→teacher/school path, avoiding accidental regulated-financial positioning.

**Open questions for founder:** Co-parent equal-peer vs owner; launch language/region; MFA channel; recurring tasks in MVP; web dashboard depth; kid data minimum; decay defaults; data retention (needs legal counsel).

### 2026-06-23: MVP technical architecture & stack for KidsBank
**By:** Dell (Solutions Architect) · **Date:** 2026-06-23 · **Status:** Proposed

Key architectural decisions:
1. Keep points non-monetary; settlement is offline — no funds custody, no transfers, no card processing in MVP
2. Per-assigner accounts ("multiple bank account numbers for same kid") — each kid has one Account per assigner with append-only ledger, separate balance, currency config
3. Relational database (PostgreSQL) with append-only ledger over NoSQL — ACID + FKs + RLS essential for ledger/relationship/audit integrity
4. MVP stack = **Flutter + Supabase** (Postgres, Auth/MFA, Storage, Edge Functions, RLS) + FCM + PostHog/Sentry + Cloudflare; alternative if JS/TS-native: React Native + Expo + Next.js + Supabase
5. Scale path is migration, not rewrite — keep Postgres; promote into modular monolith (NestJS/.NET) on managed container platform
6. Multi-tenancy via single shared-schema Postgres + `tenant_id` + RLS for families (MVP), schools (later), merchants (future)
7. Auth model: adults use email/social + MFA; kids have no credentials, onboard via single-use short-TTL QR + mandatory adult first-login approval

**Region flags (founder + legal must resolve):** Child age threshold/parental-consent mechanism (configurable gate, not hardcoded); data residency; supported locales/currencies.

### 2026-06-23: UX Design-Agent Prompt Pack
**By:** Caldwell (UX Strategist) · **Date:** 2026-06-24T00:09+03:00

Created `docs/ux-design-agent-prompts.md` — reusable, copy-paste-ready prompt file for UX/UI design AI to generate KidsBank visual design for both kids and assigners.

Key decisions:
- One shared token system, two theme expressions — Kid Mode (colorful/gamified) and Assigner Mode (clean/data-clear)
- Chunked, feed-one-at-a-time structure (A–G) with reusable Global Design Brief (§1) restated in every chunk (each chunk works standalone)
- Chunk A establishes design tokens; all later chunks reuse them
- Every chunk mandates: exact screens, key UI states (empty/loading/error/success + waiting), audience/tone, components, mobile + web responsive, RTL/Arabic mirror, accessibility (WCAG AA), fixed output format
- Grounded in prototype prompts, `docs/05-ux-ui-guidance.md`, `docs/frontend-features.md` (screen list, multi-assigner per-account model, two-box decay, full/partial redeem, full Arabic RTL, multi-currency)

**Chunks:** A Onboarding & auth; B Kid home & tasks; C Kid rewards/progress & kid onboarding; D Assigner dashboard & people; E Task management; F Redemption + role switcher + currency/language; G Moderation/oversight, notifications, settings.

### 2026-06-23: UX Decision — Assigner-scoped ledgers, least-privilege defaults & default-deny child onboarding
**By:** Caldwell (UX Strategist) · **Date:** 2026-06-23 · **Status:** Proposed

Four core UX decisions:

**D-001 — Co-parent / teacher access is least-privilege, scoped, revocable; kids always guardian-owned**
- Kid profiles owned by ≥1 Guardian; co-parents and teachers receive scoped, guardian-approved access (never ownership)
- Invites are single-use, expiring, scoped; safest scope is highlighted default
- Last guardian cannot be removed (kid must always have owner); custody conflicts handled via scopes/revocation

**D-002 — Points tracked per assigner-account ("multiple bank accounts for one kid")**
- Kid's points grouped by assigner; assigner is only role who can approve completion and redeem their own tasks' points
- Kid UI shows combined total plus per-source breakdown; parent/teacher redemption scoped to their own account

**D-003 — Default-deny child onboarding**
- QR onboarding uses short-lived, single-use tokens; kid devices gain access only after explicit guardian approval with device fingerprint shown
- Guardians can revoke/unbind any device anytime; kids never handle adult credentials

**D-004 — App never processes money; redemption requires offline-payment attestation**
- Redemption marks points redeemed/deemed after assigner attests they paid offline
- Keeps KidsBank out of regulated-payment positioning

**Needs founder/team input:** Consent-age gating per launch region; reversal-window durations; whether kids see money-equivalents; presets-only vs moderated custom avatars.

### 2026-06-23: Frontend prototype stack & architecture
**By:** Linus (Frontend Engineer) · **Date:** 2026-06-23 · **Status:** Accepted

Context: clickable, stakeholder-ready prototype demonstrating four KidsBank user types (Parent/Co-Parent, Kid, Teacher, Moderator), multi-assigner approval flow, point redemption, MFA auth, QR onboarding, multi-currency, RTL/localization; must run offline by double-clicking `index.html` with no build step.

**Decisions:**
1. No framework / vanilla JS SPA — plain HTML + CSS + vanilla JavaScript with hash-aware client router (avoids build tooling, npm deps, CDN scripts that break offline `file://` usage)
2. Single-page app with view functions, not many separate `.html` files — eliminates broken-link bugs, keeps navigation consistent
3. CSS custom properties for theming — light/dark and LTR/RTL via CSS variables + `[data-theme]` / `dir` attributes
4. Navigation pattern: bottom tab bar on mobile (≤760px), left sidebar on web (≥761px)
5. Inline SVG pseudo-QR generated deterministically — no QR library, stays offline
6. In-memory mutable state seeded from `data.js`; actions mutate and re-render; no backend/persistence (prototype scope)
7. Testing: headless `jsdom` smoke test (`test\smoke.js`, dev-only, `--no-save`) drives every flow, asserts no runtime/console errors

**Consequences:** Pros — zero-install, offline, fast, fully clickable, easy for any teammate to open. Cons — not production architecture (should use component framework); state not persisted between reloads.

### 2026-06-24: v5 doc updates (four new prototype requirements)
**By:** Ryan (Mobile Product Manager) · **Date:** 2026-06-24

Founder (tajaber) requested four new prototype requirements; docs updated to stay consistent:

**D-1 — Redemption supports full OR partial amounts (per-account)**
- Redemption is an amount, not forced full cash-out; assigners can redeem any amount `1 ≤ amount ≤ available earned balance`
- Redeeming subtracts from earned, adds to redeemed on specific account only; per-assigner isolation preserved
- Validation rejects amounts < 1, non-integers, amounts above available earned

**D-2 — Late-decay rule entered as two numbers**
- Task creation uses two inputs: `points to reduce` + `minutes interval` (reduce X points every Y minutes after deadline)
- Both must be positive integers; blank/zero = no decay; still linear, floored at 0, based on kid's completion timestamp
- Data model stores `{decay_points, decay_interval_minutes, decay_floor}`

**D-3 — "Your Kids" page totals**
- People/"Your Kids" view shows per kid and overall: total EARNED, total PENDING approval, total VALUE IF ALL POINTS REDEEMED
- "Value if redeemed" labeled as estimate of offline value, never funds held in-app; read-only derived figure; never sum across differing currencies

**D-4 — Full Arabic (RTL) localization**
- Prototype ships real, complete Arabic translations for ALL UI text with language toggle flipping entire UI to RTL
- Architecture-level i18n/RTL remains MVP; additional languages stay Later

**Docs updated:** features 9, 13, 15, 16, 21; PRD FR-16a, FR-21, FR-25/25a/27, FR-33a, FR-36, AC-5/9/12/14; journeys §6 and §10; data-model; UX guidance.

### 2026-06-24: v6/v7 doc updates (five new prototype requirements)
**By:** Ryan (Mobile Product Manager) · **Date:** 2026-06-24

Founder requested five new prototype requirements; docs updated in place:

**D-1 — Multi-role identity + active-role switching**
- One adult identity (single login) can hold multiple roles (e.g., Parent AND Teacher) via multiple Role Memberships
- Client exposes active-role switcher; server resolves active role per request, scopes people + tasks to that active role only (never union, prevents cross-role data bleed)

**D-2 — Name search (reveal after 3 characters)**
- Assigners search kids/students by name; list filters only after 3rd character (min 3 chars), filters live thereafter
- Search scoped to active role's relationships, enforced server-side + RLS; client filter never widens visibility

**D-3 — Redemption history (own + parent cross-assigner)**
- Each assigner sees their own redemption history (per their account with a kid)
- Parents see consolidated redemption history per kid across ALL assigners (who redeemed, points, snapshotted value, method note, timestamp)
- Parent cross-assigner view is redemption-records-only; never sums across differing currencies; reversals are new entries

**D-4 — Parent overall account picture**
- Parent gets consolidated, read-only view of each kid's accounts across ALL assigners: per-assigner balances (earned/pending/redeemed + value-if-redeemed)
- Per-kid grand total of points and per-kid total value-if-redeemed; not pooled/redeemable; grouped by currency; money is estimate of offline value, never funds held in-app

**D-5 — Kid scans ANY assigner's QR → new per-assigner account**
- Kid can scan QR from any assigner (parent/co-parent now; teacher/moderator Later)
- On guardian first-login approval, system provisions new per-(kid, assigner) account; kid receives that assigner's tasks/points and can redeem from that account
- Account creation gated by approval, never automatic on scan; re-scanning existing assigner is idempotent (reuse existing account); new assigner ⇒ new isolated account/ledger
- Balances never pool across assigners ("multiple bank account numbers for the same kid")

**Docs updated:** Feature inventory (3, 6, 12, 13, 21); PRD (FR-6a, FR-12a, FR-24a, FR-33b/c, AC-1a/3a/12a/12b/12c, scope, roles, AS-9/AS-10); journeys (§4, §5, §10a/10b, §15–16); technical architecture (§10.6–10.8, representative resources); data-model (User Memberships, Relationship + Account provision, Redemption Record history queries, cardinalities/invariants); UX guidance (multi-role note, role-switch nav, switcher/search/history/overview/QR scan, dashboard, trust-safety).

### 2026-06-24: v6/v7 prototype — multi-role, search, redemption history, parent overview, any-assigner QR
**By:** Linus (Frontend Engineer) · **Date:** 2026-06-23 · **Status:** Implemented

v6/v7 added five behaviors to offline vanilla-JS prototype:

**Decision 1 — Multi-role via `KB.roleGroups`, not duplicate identities**
- Single adult can hold several roles; `state.roles` lists them, `state.role` is active one
- Role switcher changes `state.role` and reuses existing `scope()`/`kidsForRole()`/`myAssignerId()` scoping
- Demo identity holds Parent + Teacher so switcher is demonstrable; switching rescopes kids/students and tasks (different seed assigner per role)

**Decision 2 — Search threshold = 3 chars**
- Matched against `data-search` attribute including English and Arabic (`kid.nameAr`) names
- Keeps filter pure-DOM, avoids re-render churn; hint nudges users typing 1–2 chars

**Decision 3 — Single redemptions ledger (`KB.redemptions`)**
- Source of truth for history; assigner-scoped view = own records; Parent additionally gets all-kids view across every assigner
- Seeded with historical rows so view never empty; `doRedeem` appends on confirm

**Decision 4 — Parent overall picture reuses `kidGrandTotals`**
- Renders Parent-only panel on People, surfacing per-account earned/pending/redeemed/value plus per-kid totals

**Decision 5 — Any-assigner QR creates real account object**
- Creates account under kid keyed by assigner id with role-prefixed `acctNo`
- Makes kid's existing per-assigner account model (and redemption) work immediately for new link

**Consequences:** Switching role changes displayed adult identity (seed uses distinct assigner record per role); acceptable for prototype, real backend would key one identity to multiple role grants. All new strings in both `I.en` and `I.ar`. Validated by extended jsdom smoke test (**70/70**), `node --check` clean.

### 2026-06-24: v8 — Two-step redemption + pre-login role choice
**By:** Linus (Frontend Engineer) · **Date:** 2026-06-23 · **Status:** Implemented

v8 implemented (1) two-step redemption confirmation flow with parent notifications and auditable event log, and (2) multi-role assigner choosing role at home screen before authenticating.

**Decision v8-1 — Two-step redemption**
- Held balance via both record status AND `pendingRedeem` field; on initiate, amount moved out of `earned` into `account.pendingRedeem` AND redemption record carries `status: "pending_confirmation"`
- Prevents double-spend; amount stays out of `redeemed` total until kid confirms; confirm moves hold into `redeemed`; decline returns it to `earned`
- Parent resolution via `parentForKid()` — Parent-role assigner linked to kid, fallback to global `a_parent` for kids with no parent account (e.g. Sami)
- Separate `KB.redemptionLog` (not overloading `KB.auditLog` or `KB.redemptions`) so parent-facing activity log has clean, query-friendly shape `{redemptionId, kidId, assignerId, parentId, amount, money, event, ts}`
- Notifications reuse existing feed (`KB.notifications`, type `gift`) keyed to parent's assigner id
- Kid confirm UI lives in Points tab ("Redemptions to confirm" card) with explicit Confirm and Decline actions

**Decision v8-2 — Pre-login role choice**
- Additive landing panel, not replacement; separate `#preLoginRolePanel` lists multi-role identity's roles
- Keeps in-app switcher and prior behavior intact while satisfying "choose role before auth" requirement
- `state.roles` seeded from full role group so in-app switcher still offers every role after login

**Validation:** `node test\smoke.js` → 88/88 (70 prior + 18 new). `node --check` clean. No runtime errors.

### 2026-06-24: v8 doc updates (two new prototype requirements)
**By:** Ryan (Mobile Product Manager) · **Date:** 2026-06-24

Founder requested two new requirements; docs updated in place:

**D-1 — Two-step redemption confirmation + parent notifications + event log**
- Redemption no longer instantly final; assigner initiates → status `pending_confirmation` with amount held (reserved, not counted as redeemed) → kid must confirm to become `redeemed`/completed → if kid declines or confirmation window expires, status becomes `declined` and hold is released
- Held points are limbo: available balance = `lifetime_earned − lifetime_redeemed − pending_redeem_points`; same points never both available and redeemed
- `redeem` ledger row written only on kid confirmation; decline/expiry writes no ledger row
- Kid's parent notified on every lifecycle event (initiated, kid-confirmed/completed, declined/expired); parent views redemption event log (kid, initiating assigner, amount, snapshotted money value, timestamp, status) for any of their kids regardless of which assigner
- Status badges distinguish "pending confirmation" vs "redeemed" vs "declined" everywhere redemption appears
- Parent event log is redemption-lifecycle records only (not another assigner's task data)

**D-2 — Pre-login role choice at home screen**
- Multi-role adult (e.g. Parent + Teacher) can choose which role to sign in as from home/landing screen before authenticating; choice sets initial post-login scope
- Pre-login choice is scope hint only: re-validated server-side against user's actual memberships after auth; never grants role user doesn't hold
- Single-role identities skip chooser

**Docs updated:** Feature inventory (Feature 3 retitled, Feature 10 and 13 rewritten); PRD (§3 roles, §4.1 scope, FR-6b/FR-25/25a/25b/25c/FR-27/FR-30, AC-1b/AC-9/AC-9a/AC-9b); journeys (A3 assumption, §1 pre-login role selection, §10 fully rewritten for two-step redemption, §15 safety matrix, §16 notifications); data-model (Account `pending_redeem_points` + revised available-balance formula, Points Transaction `redeem` row timing, Redemption Record `status` lifecycle with timestamps, parent notification + event log, invariants 12–13); UX guidance (§1.3 sitemap, §2 nav, §2a.6–2a.7 two-step redemption and pre-login chooser, §3.1–3.2 dashboards, §8.2 notification types, §9 trust-safety patterns, §10 sample screens).

---
