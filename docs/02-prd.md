# 02 — Product Requirements Document (PRD)

**Project:** KidsBank (KidsBanking)
**Author:** Ryan — Mobile Product Manager
**Date:** 2026-06-23
**Status:** Draft for internal execution
**Source:** `prompts/p-260623-prototype.md`
**Companion docs:** `01-feature-inventory.md`, `03-mvp-definition.md`

---

## 1. Product overview

KidsBank is a **mobile-first motivational rewards app** that helps parents (and later co-parents, teachers, coaches, and school moderators) encourage children to complete tasks and build responsibility. Children earn **points inside the app**; adults reward them with **real money or gifts outside the app**, then mark the points **redeemed/deemed** in-app.

The app is a **reward and motivation system — not a bank, wallet, or money-transfer service.** No real funds are ever held or moved inside the app. This positioning is a deliberate constraint to keep the MVP out of financial regulation scope.

---

## 2. Product goals

| # | Goal | Why it matters |
|---|---|---|
| G1 | Make it effortless for a parent to set a task, approve completion, and reward a child | This is the core loop; everything else supports it |
| G2 | Keep children safe by design (adult-controlled onboarding, login approval, minimal data) | Child safety is existential for trust and survival |
| G3 | Stay clearly outside financial-services regulation in MVP | Avoid legal/regulatory blockers for a bootstrapped founder |
| G4 | Be region-agnostic (multi-currency, multilingual, RTL/LTR) from the architecture up | Broadens reach without rework later |
| G5 | Provide adults a clear summary (mobile + web dashboard) of tasks, points, and approvals | Drives retention and perceived value |
| G6 | Preserve a clean upgrade path to teacher/school (Phase 2) and merchant (Future) without bloating MVP | Protects speed-to-validation while keeping growth optionality |

### Non-goals (explicit)

- Not a real banking, wallet, payment, or money-transfer product (MVP and Phase 2).
- Not a social network or chat platform for children.
- Not an in-app marketplace (merchant redemption is Future phase only).
- No live FX/financial-data feeds in MVP.

---

## 3. Target users / roles

| Role | MVP? | Summary |
|---|---|---|
| **Parent** | ✅ | Registers, creates kids, assigns tasks, approves, configures point value, marks redeemed |
| **Co-parent** | ✅ | Linked guardian; same capabilities, own task/points relationship with the kid |
| **Kid** | ✅ | QR-onboarded; views tasks, marks complete, sees points/history |
| **Teacher / coach** | Phase 2 | Parent-like flow scoped to assigned students |
| **Moderator (school)** | Phase 2 | Oversees/approves teachers under a school; safeguarding governance |
| **Merchant / store** | Future | Offers point redemption as discounts/rewards |

> Per the prompt, **parent flows apply to co-parents, teachers, and moderators**, each scoped to the kids/students they own and the tasks they created. The **assigner is always the approver and the real-world payer** for their tasks. **A single adult identity may hold several of these roles at once** (e.g., Parent *and* Teacher) and **switch the active role** to manage their kids vs their students; scope always follows the active role. A multi-role adult may also **choose which role to sign in *as* from the home/landing screen before authenticating** (setting the initial post-login scope), in addition to the in-app switcher.

---

## 4. Scope

### 4.1 In scope (MVP)

- Adult registration + **MFA authentication**
- Role system (Parent, Co-parent, Kid) — **one identity may hold multiple roles with an active-role switcher and a pre-login role choice at the home screen; people/task scope follows the active role**
- Co-parent invitation/linking
- Kid account creation (minimal data)
- **QR onboarding** (a kid scanning **any assigner's QR** creates a **new per-assigner account** on guardian approval) + **first-login approval**
- Task management (create, assign to one/many kids, complete, approve/reject)
- Deadline + **decay/reduction logic** (basic, floored at 0)
- **Bonus/gift points**
- **Points ledger/history** (append-only, per assigner↔kid balance) **+ redemption history (each assigner's own; parents' cross-assigner view per kid)**
- **Two-step redemption/deemed flow** (assigner initiates → status `pending_confirmation` with points **held** → **kid confirms** → `redeemed`/completed, or **declines**/expires → hold released; status + ledger only, no real funds) **+ parent notifications on each event + parent-visible event log**
- **Multi-currency** value configuration (manual, one currency per relationship)
- **Full i18n + RTL** layout with **complete real Arabic translation** and a language toggle (English + full Arabic; full-UI RTL mirroring)
- **Notifications** (essential events, push + in-app)
- **Basic audit log** (auth, approvals, points, redemptions)
- **Baseline abuse prevention** (login approval, rate limits, report button)
- **Basic dashboard** — mobile for all adults + a **lightweight web dashboard** (tasks, points earned, points redeemed, pending approvals), including **name search (min-3-char live filter)**, **redemption history**, and the **parent overall account picture** (each kid's accounts across all assigners)

### 4.2 Out of scope for MVP (Later — Phase 2)

- Teacher/student hierarchy
- School moderation/safeguarding admin
- Advanced reporting/analytics & exports
- Advanced moderation/anomaly detection
- Full multilingual catalog **beyond English + Arabic** + pixel-perfect RTL polish across every additional language/screen
- Recurring/scheduled-repeat tasks (if complexity warrants deferral)

### 4.3 Out of scope (Future / Nice-to-have)

- Merchant/store registration and point redemption at stores
- Partner discounts, sponsored rewards
- Deep gamification, AI task suggestions
- Any real money movement / wallet / payment processing

---

## 5. Functional requirements

Requirements use **MUST / SHOULD / MAY** (RFC-2119 sense). IDs are stable references for engineering/QA.

### 5.1 Authentication & accounts

- **FR-1** The system MUST let an adult register with email (or phone) and password.
- **FR-2** The system MUST verify the adult's email/phone before full access.
- **FR-3** The system MUST enforce **MFA** (TOTP or email OTP) on adult login.
- **FR-4** The system MUST provide account recovery that does not weaken MFA protections.
- **FR-5** Kids MUST NOT use password login; kids authenticate via QR + approved device only.

### 5.2 Roles & linking

- **FR-6** The system MUST assign a role at registration/invitation and render role-scoped UI and permissions.
- **FR-6a** The system MUST allow **one adult identity (single account/login) to hold multiple roles** (e.g., Parent **and** Teacher) via multiple role memberships, and MUST provide an explicit **active-role switcher** when more than one role exists. The **active role MUST determine the scope** of people and tasks shown (Parent/Co-parent → that adult's kids; Teacher/Moderator → that adult's students). Switching roles MUST NOT leak data across role scopes.
- **FR-6b** The system MUST let a multi-role adult **choose which role to sign in *as* from the home/landing screen, before authenticating**; the chosen role MUST set the **initial active role / post-login scope**. The pre-login choice is a **scope hint only** and MUST be **re-validated server-side against the user's actual memberships after authentication** (it MUST NOT grant a role the user does not hold). A single-role identity MAY skip the chooser. This is in addition to (not a replacement for) the in-app active-role switcher (FR-6a).
- **FR-7** A parent MUST be able to invite a co-parent who, upon acceptance, is linked to shared kid profiles.
- **FR-8** Co-parents MUST each maintain their own task set and their own points balance with each kid.
- **FR-9** Only the **creator (assigner)** of a task MUST be able to approve/reject and redeem that task's points.
- **FR-10** Removing a co-parent MUST revoke their access to shared kids without deleting historical ledger entries.

### 5.3 Kid onboarding

- **FR-11** A parent MUST be able to create a kid profile with minimal data (nickname, optional avatar, coarse age, currency/value rule).
- **FR-12** The system MUST generate a **single-use, short-lived QR code** per kid for device onboarding.
- **FR-12a** A kid MUST be able to scan a QR from **any assigner**, and on **guardian first-login approval** the system MUST provision a **new per-(kid, assigner) account** under that assigner, after which the kid receives that assigner's tasks/points and can redeem from that account. Scanning a **new** assigner's QR MUST create a **new** account; re-scanning an assigner the kid already has MUST be **idempotent** (reuse the existing account, never duplicate). Account creation MUST be gated by approval (never automatic on scan), and balances MUST stay isolated per assigner (no pooling).
- **FR-13** A kid scanning the QR MUST trigger a **first-login approval** request to the parent.
- **FR-14** A kid device MUST NOT gain access until a parent approves it.
- **FR-15** A parent MUST be able to revoke a previously approved kid device.

### 5.4 Tasks, points, decay

- **FR-16** An assigner MUST be able to create a task with title, description, point value, optional deadline, optional decay rule, and one or more assignees.
- **FR-16a** When a decay rule is set, the assigner MUST enter it as **two numeric inputs** — `points to reduce` and `minutes interval` — meaning "reduce `points` for every `minutes` elapsed after the deadline" (not a fixed preset). Both values MUST be positive integers; the UI SHOULD show a live preview of points lost over time.
- **FR-17** A task MUST clearly display **who assigned it**.
- **FR-18** A kid MUST be able to mark a task complete, notifying the assigner.
- **FR-19** The assigner MUST be able to approve or reject a completion (rejection MAY include a reason).
- **FR-20** On approval, the system MUST write a points entry to the ledger for that assigner↔kid balance.
- **FR-21** If a decay rule is set, points MUST reduce by `decay_points` for every `decay_interval_minutes` elapsed after the deadline, **floored at 0**, based on the **kid's completion timestamp** (not approval time).
- **FR-22** An assigner MUST be able to grant **positive bonus points** outside of any task.
- **FR-23** The system MUST maintain an **append-only ledger**; corrections MUST be new offsetting entries, never silent edits.
- **FR-24** Kids and assigners MUST be able to view earned, pending, and redeemed history per relationship.
- **FR-24a** The system MUST provide a **redemption history**: each assigner MUST be able to view their **own** redemption records (per their account with a kid), and a **parent MUST be able to view the consolidated redemption history for each of their kids across ALL assigners** (who redeemed, points redeemed, snapshotted value, method note, timestamp), regardless of which assigner redeemed. The parent cross-assigner view MUST be scoped to **redemption records only** (not another assigner's private task management) and MUST NOT sum across differing currencies.

### 5.5 Redemption & currency

- **FR-25** An assigner MUST be able to **initiate** marking points **redeemed/deemed** — **fully or partially** — for a specific assigner↔kid account. Initiation MUST NOT be instantly final: the redemption MUST enter status **`pending_confirmation`** with the chosen amount **held** (reserved against the account's earned balance, **not** yet counted as redeemed), and MUST require the **kid to confirm** before it becomes final.
- **FR-25a** The system MUST let the assigner enter the redemption **amount**, supporting any value from **1 up to the available earned balance** (partial redemption leaves a remaining balance; full redemption empties it). The **held amount MUST reduce the redeemable balance** while pending (it MUST NOT be re-redeemable or double-counted).
- **FR-25b** The redemption MUST have a **status lifecycle**: `pending_confirmation` → (kid confirms) **`redeemed`/completed**, or (kid declines or the confirmation window expires) **`declined`**. On **confirm**, the system MUST write a settled `redeem` ledger entry and the account's earned MUST decrease and redeemed MUST increase by the amount. On **decline/expiry**, the **held amount MUST be released** back to the available earned balance and **nothing MUST be redeemed**. The system MUST record a **timestamp for each transition** and the **initiating assigner**. Status MUST be surfaced as a **badge** (`pending confirmation` vs `redeemed`) wherever the redemption appears.
- **FR-25c** The **kid who receives the redemption MUST be able to confirm or decline** a `pending_confirmation` redemption. The kid's **parent(s) MUST be notified on every lifecycle event** (initiated, kid-confirmed/completed, declined) for **any** of their kids — **regardless of which assigner** (parent/co-parent/teacher/moderator) initiated it — and MUST be able to view a **chronological event log** of redemption activity on their kids showing **kid, initiating assigner, amount, money value (snapshot), timestamp, and status**. The parent event log MUST be scoped to **redemption lifecycle records only** (not another assigner's task management).
- **FR-26** The system MUST NOT hold, move, or process real funds; redemption is a status/record action only.
- **FR-27** The system MUST validate the redemption amount as `1 ≤ amount ≤ available earned balance` (reject amounts below 1, non-integers, or above the available earned balance — where **available earned excludes any amount already held by a pending redemption**) and MUST apply final settlement to **only** that account — decreasing its earned and increasing its redeemed total **on kid confirmation**, with per-account isolation preserved (no pooling across the kid's other accounts).
- **FR-28** An assigner MUST be able to configure a point→currency value (e.g., 10 pts = 5 USD) used for display and redemption.
- **FR-29** Changing currency/value MUST preserve historical entries' original recorded value.

### 5.6 Notifications

- **FR-30** The system MUST notify relevant users on: new task, completion submitted, approval/rejection, points granted, bonus granted, **redemption lifecycle events (initiated/pending confirmation, kid-confirmed/completed, declined)**, and login-approval request. For redemption events, the **kid** MUST receive a confirm/decline prompt and the kid's **parent(s) MUST be notified on each event** (see FR-25c).
- **FR-31** Notifications MUST be delivered via push and an in-app inbox.
- **FR-32** Notification content MUST be localizable.

### 5.7 Dashboard, audit, safety

- **FR-33** Each adult MUST have a dashboard (mobile **and** a lightweight web view) summarizing tasks, points earned, points redeemed, and pending approvals, scoped to their kids/students.
- **FR-33a** The dashboard's **"Your Kids" view** MUST show, **per kid and as an overall roll-up**, three totals: **total earned points**, **total pending approval** (completions awaiting the assigner), and **total value if all points redeemed** (earned points converted to money via the account's conversion rule). The "value if redeemed" MUST be presented as an estimate of offline value, never as funds held in-app, and MUST NOT sum across differing currencies.
- **FR-33b** The dashboard MUST provide **name search** over the active role's people (kids/students): the system MUST begin filtering the list **only after the 3rd character** is typed (**minimum 3 characters**) and MUST filter the list **live** as more characters are entered. With fewer than 3 characters the unfiltered list MUST be shown, and search MUST be scoped to the **active role's** relationships (never returning people outside scope).
- **FR-33c** A **parent** MUST be able to view an **overall account picture** per kid: a consolidated, read-only view of that kid's accounts across **ALL assigners**, showing **each assigner's balance** (earned / pending / redeemed and that account's value-if-redeemed), a **per-kid grand total of points**, and a **per-kid total value-if-redeemed**. This view MUST NOT be a pooled or redeemable balance and MUST group/label by currency rather than summing across differing currencies.
- **FR-34** The system MUST log sensitive events (logins, device approvals, approvals, point grants, redemptions, role/permission changes) to an audit trail.
- **FR-35** The system MUST provide baseline abuse controls: rate limiting, mandatory login approval, and a report/escalation entry point.
- **FR-36** The UI MUST support **LTR and RTL** layout and selectable language via a **language toggle**. The prototype MUST ship **complete, real Arabic translations for all UI text** (every label and flow, not a subset), and selecting Arabic MUST flip the **entire UI** to RTL with full mirroring.

---

## 6. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | **Security** | Passwords hashed (modern KDF); MFA enforced; QR codes single-use & short-lived; secrets never in source. |
| NFR-2 | **Privacy** | Minimize children's PII; data collection limited to what the loop needs; retention policy defined (review with counsel). |
| NFR-3 | **Child safety** | No adult↔child connection without explicit adult onboarding + approval; no open child discovery; no child-to-child contact. |
| NFR-4 | **Reliability** | Ledger writes must be consistent and durable; no lost or duplicated point entries. |
| NFR-5 | **Performance** | Core screens (task list, approvals, dashboard) load responsively on mid-range mobile devices. |
| NFR-6 | **Localization** | i18n framework from day one; RTL-capable layout system; no hardcoded user-facing strings. |
| NFR-7 | **Availability** | MVP targets reasonable uptime on managed/low-ops infra; no high-availability SLA promised in MVP. |
| NFR-8 | **Accessibility** | Readable contrast, scalable text, child-friendly touch targets; follow platform accessibility basics. |
| NFR-9 | **Auditability** | Sensitive actions traceable to actor + timestamp; logs tamper-resistant. |
| NFR-10 | **Maintainability** | Single codebase strategy preferred (cross-platform) to fit a solo/bootstrapped team. |
| NFR-11 | **Cost** | Favor low-fixed-cost, managed services; avoid premature scale infrastructure. |
| NFR-12 | **Compliance-readiness** | Architecture supports data export/delete and consent records for future regional requirements (review with counsel). |

---

## 7. Assumptions (explicit)

- **AS-1** Audience is a **solo, bootstrapped founder** — lean, low-cost, high-leverage choices preferred; no assumed hires, ad budget, or fundraising.
- **AS-2** **Region-agnostic** — no fixed country/currency/language/store/regulatory assumptions; region-dependent items are flagged.
- **AS-3** Output is an **internal execution plan**, not an external pitch.
- **AS-4** Families (parent + co-parent + kid) are the **beachhead**; teacher/school is Phase 2; merchant is Future.
- **AS-5** Real-world payout happens offline; the app only **records** the redemption, which is a **two-step, kid-confirmed** action (assigner initiates → points held as `pending_confirmation` → kid confirms → `redeemed`, or declines/expires → hold released).
- **AS-6** Each assigner↔kid relationship is a **separate points balance** ("multiple bank account numbers for the same kid").
- **AS-7** MVP ships with i18n + **English and complete Arabic** (full-UI RTL); broader language coverage follows demand.
- **AS-8** Decay logic is **linear and floored at 0** in MVP, configured per task as two numbers (`points` reduced every `minutes`); more complex schedules are later.
- **AS-9** A single adult **identity can hold multiple roles** (one login, many role memberships); the **active role** scopes people and tasks. Switching role never merges scopes. A multi-role adult may pick a role **at the home screen before login** (a scope hint re-validated post-auth) in addition to the in-app switcher.
- **AS-10** A kid can be linked to **multiple assigners** via QR; **each (kid, assigner) is its own account** (created on guardian approval), and parent-facing consolidated views are **read-only displays**, never pooled balances.

---

## 8. Constraints

- **C1** Must not be positioned or operate as a regulated financial/banking/payment product in MVP. *(Compliance flag.)*
- **C2** Children's data handling must follow data-minimization; specific regional child-privacy rules require **legal review before launch**. *(Compliance flag.)*
- **C3** Teacher/school (adult↔non-guardian-child) connections require consent + moderation design and **legal review before Phase 2 rollout**. *(Compliance flag.)*
- **C4** Solo/bootstrapped resourcing limits scope, parallel surfaces, and ops complexity.
- **C5** Both **mobile** apps and a **web dashboard** for adults are required, increasing surface area — favor a shared/reusable approach.
- **C6** App store policies for apps directed at/used by children must be reviewed before submission. *(Compliance flag.)*

---

## 9. Open questions (need founder decisions)

| # | Question | Default assumption (if unanswered) |
|---|---|---|
| OQ-1 | Are co-parents equal peers, or is one the account owner? | Equal peers; only task creator approves/redeems (FR-9) |
| OQ-2 | Initial launch language(s) and region? | English + one RTL language (e.g., Arabic) for i18n proof; region TBD |
| OQ-3 | MFA channel for MVP — TOTP, email OTP, or SMS? | TOTP/email OTP (avoid SMS cost) |
| OQ-4 | Should bonus points ever be negative/punitive? | No; positive-only in MVP |
| OQ-5 | Recurring tasks in MVP or Phase 2? | Phase 2 unless cheap to add |
| OQ-6 | Minimum data stored per kid? | Nickname + coarse age only |
| OQ-7 | Web dashboard depth in MVP — view-only or full management? | Lightweight management of tasks/approvals/redemptions |
| OQ-8 | Decay granularity & defaults (e.g., −1 pt / 5 min)? | Configurable per task; sensible default, floor 0 |
| OQ-9 | Data retention period for kids' activity/audit logs? | Define with counsel before launch |

---

## 10. KPIs / success metrics

| Stage | KPI | Indicative target (to refine) |
|---|---|---|
| **Activation** | % of registered parents who create ≥1 kid and assign ≥1 task | ≥ 60% |
| **Core loop** | % of assigned tasks that reach completion → approval → points granted | ≥ 50% |
| **Approval health** | Median time from kid completion to assigner approval | < 24h |
| **Engagement** | Weekly active parent–kid pairs | Trend up week-over-week |
| **Redemption** | % of active families using redeem/deemed ≥1 time per month | ≥ 30% |
| **Onboarding** | QR onboarding success rate (scan → approved login) | ≥ 80% |
| **Retention** | Week-4 retention of activated families | ≥ 30% |
| **Safety** | First-login approval enforced on 100% of kid devices | 100% (hard gate) |
| **Notification health** | Opt-out / mute rate (proxy for fatigue) | Keep low |

> Targets are starting hypotheses for a bootstrapped MVP and should be calibrated against real beta data.

---

## 11. Acceptance criteria (PRD-level)

The MVP is acceptable when **all** of the following are demonstrably true:

- **AC-1** A parent can register, pass MFA, and reach a role-appropriate home.
- **AC-1a** An adult holding multiple roles sees an **active-role switcher**; switching from Parent to Teacher (or back) re-scopes the people list, dashboard, and tasks to that role, with no cross-role data leakage.
- **AC-1b** A multi-role adult can **choose a role to sign in as on the home/landing screen before authenticating**; that choice sets the initial post-login scope and is **re-validated against the user's memberships after auth** (a choice for a role the user doesn't hold is rejected). A single-role identity may skip the chooser.
- **AC-2** A parent can invite and link a co-parent; both see shared kids; each keeps separate tasks and balances.
- **AC-3** A parent can create a kid, generate a QR, and the kid can scan it on a separate device.
- **AC-3a** A kid scanning **any assigner's** QR results, **after guardian first-login approval**, in a **new per-(kid, assigner) account**; the kid then receives that assigner's tasks/points and can redeem from that account. Re-scanning an existing assigner is idempotent (no duplicate account); balances stay isolated per assigner.
- **AC-4** A kid device gains access **only after** parent first-login approval; revocation works.
- **AC-5** An assigner can create a task (with point value, deadline, decay, ≥1 assignee); the task shows who assigned it. When set, the decay rule is entered as **two numbers** (points-to-reduce and minutes-interval) with a live preview.
- **AC-6** A kid can mark a task complete; the assigner is notified and can approve or reject.
- **AC-7** On approval, points post to the correct assigner↔kid ledger balance; decay is applied per rule, floored at 0, based on completion time.
- **AC-8** An assigner can grant positive bonus points, reflected in the ledger.
- **AC-9** An assigner can **initiate** marking points redeemed/deemed **in full or in part**; the entered amount is validated as `1 ≤ amount ≤ available earned` (available earned excludes amounts already held by a pending redemption); on initiate, the redemption is **`pending_confirmation`** and the amount is **held** (not yet redeemed); over-redemption (and amounts < 1 or non-integer) is blocked; other accounts for the kid are unaffected; no real funds are moved.
- **AC-9a** A `pending_confirmation` redemption becomes final **only when the kid confirms**: on confirm it transitions to **`redeemed`/completed**, the hold settles into a `redeem` ledger entry, and that account's earned decreases / redeemed increases by the amount; on **decline or expiry** it becomes **`declined`**, the **hold is released** back to available earned, and nothing is redeemed. Each transition records a **timestamp** and the **initiating assigner**; a **status badge** distinguishes *pending confirmation* vs *redeemed*.
- **AC-9b** The kid's **parent(s) are notified on every redemption lifecycle event** (initiated, kid-confirmed/completed, declined) for any of their kids — **regardless of which assigner initiated it** — and can view a **chronological event log** showing kid, initiating assigner, amount, money value (snapshot), timestamp, and status (redemption-lifecycle records only).
- **AC-10** Point values display in the configured currency; historical values are preserved on currency change.
- **AC-11** Essential notifications fire for all key events via push + in-app.
- **AC-12** Each adult sees a summary dashboard (mobile + lightweight web) of tasks, points earned, points redeemed, and pending approvals, scoped correctly. The **"Your Kids" view** shows, per kid and overall, **total earned**, **total pending approval**, and **total value if all points redeemed**.
- **AC-12a** The dashboard's **name search** filters the active role's kids/students **only after the 3rd character** and updates **live** thereafter; below 3 characters the full list shows; results never include people outside the active role's scope.
- **AC-12b** A parent can open a kid's **overall account picture**: each assigner's balance (earned/pending/redeemed + value-if-redeemed), a per-kid grand total of points, and a per-kid value-if-redeemed — read-only, grouped by currency, never pooled or redeemable.
- **AC-12c** Each assigner can view their **own redemption history**, and a parent can view a kid's **redemption history across ALL assigners** (assigner, points, snapshotted value, timestamp); the cross-assigner view shows redemption records only and never sums across differing currencies.
- **AC-13** Sensitive events appear in the audit log with actor + timestamp.
- **AC-14** The app renders correctly in both LTR and RTL; a language toggle switches between English and **complete Arabic** (all UI text translated), flipping the **entire UI** to RTL with full mirroring.
- **AC-15** No screen, label, or flow positions the app as moving/holding real money.

---

## 12. Dependencies & risks (summary)

- **Notifications infra** (push service) — required for the core loop; pick a low-cost managed provider.
- **Auth/MFA** — use a vetted auth solution rather than hand-rolling.
- **i18n/RTL framework** — must be chosen at project start (retrofitting is costly).
- **Child-safety + privacy legal review** — gating dependency before public launch. *(Flag for professional review — not legal advice.)*
- **Scope discipline** — Phase 2 (teacher/school) and Future (merchant) ambitions must stay out of MVP to protect speed-to-validation.

See `01-feature-inventory.md` for per-feature risk detail and `03-mvp-definition.md` for the exact MVP cut and launch criteria.
