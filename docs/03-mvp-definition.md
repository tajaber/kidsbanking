# 03 — MVP Definition

**Project:** KidsBank (KidsBanking)
**Author:** Ryan — Mobile Product Manager
**Date:** 2026-06-23
**Source:** `prompts/p-260623-prototype.md`
**Companion docs:** `01-feature-inventory.md`, `02-prd.md`

---

## 1. MVP thesis (one paragraph)

The leanest useful KidsBank MVP is a **single-family motivational loop**: a parent (with an optional co-parent) creates a child account, onboards the child safely via QR + approval, assigns point-valued tasks, the child completes them, the parent approves, points post to a ledger, and the parent later marks points **redeemed/deemed** after paying the child in real life. Everything else — teachers, schools, merchants, advanced analytics, broad language coverage — is deferred. This is the smallest scope that still delivers the app's core promise (**motivate kids, reward responsibly, keep them safe**) and lets a bootstrapped founder **validate real demand fast** without touching financial regulation.

---

## 2. What's IN the MVP — and why

| In-MVP feature | Why it's essential to the core loop |
|---|---|
| Adult **registration + MFA** | No account, no app; MFA protects accounts controlling children's data (prompt-required). |
| **Role system** (Parent, Co-parent, Kid) | The loop is defined by who assigns vs who completes vs who approves. |
| **Co-parent linking** | Two-guardian households are the common real case (mother + father); cheap to support, high value. |
| **Kid account creation** (minimal data) | The child is the subject of the entire app. |
| **QR onboarding + first-login approval** | The safe, password-free way kids get in — and the central child-safety gate. Non-negotiable. |
| **Task management** (create, assign 1..N kids, complete, approve/reject) | The heart of the product. |
| **Deadline + basic decay** (floored at 0, completion-time based) | Prompt-required; drives timeliness; kept simple. |
| **Bonus/gift points** | Lets parents reward off-task good behavior; reinforces motivation; trivial to build. |
| **Points ledger/history** (append-only, per assigner↔kid balance) | Source of truth; without it, trust and redemption break. |
| **Redemption/deemed flow** (record-only) | The "cash-out" that closes the loop while keeping the app out of money movement. |
| **Multi-currency value config** (manual) | Region-agnostic value definition (prompt-required); manual avoids financial complexity. |
| **i18n + RTL-capable layout** (scaffold + 1–2 languages) | Prompt-required; must be architectural from day one or it's painful later. |
| **Essential notifications** (push + in-app) | The loop is asynchronous; without notifications, approvals stall and engagement dies. |
| **Basic audit log** | Trust, dispute resolution, and a foundation for later safety/governance. |
| **Baseline abuse prevention** | Login approval, rate limits, report entry point — minimum to protect children. |
| **Basic dashboard** (mobile for adults + lightweight web) | Prompt explicitly requires a web dashboard summarizing tasks, points earned, points redeemed, pending approvals. |

---

## 3. What's OUT of the MVP — and why

### 3.1 Deferred to Phase 2 (Later)

| Out-of-MVP | Why deferred |
|---|---|
| **Teacher/student hierarchy** | Connects non-guardian adults to children → needs consent + moderation + legal review first. High value but not needed to validate the family loop. |
| **School moderation/safeguarding admin** | Complex multi-tenant governance + safeguarding liability; only relevant once teachers exist. |
| **Advanced reporting/analytics & exports** | Basic summary dashboard is enough to prove value; rich analytics is polish. |
| **Advanced moderation / anomaly detection** | Baseline controls suffice for a small, invite-based family beta. |
| **Full multilingual catalog + pixel-perfect RTL everywhere** | Scaffolding + 1–2 languages proves the capability; breadth follows demand. |
| **Recurring/scheduled-repeat tasks** | Adds state/complexity; one-off tasks validate the loop. Add later if cheap. |
| **Live FX / currency conversion tables** | Manual per-relationship value avoids financial-data complexity and regulatory optics. |

### 3.2 Deferred to Future (Nice-to-have)

| Out | Why deferred |
|---|---|
| **Merchant/store registration & in-store redemption** | Explicitly a later phase in the prompt; introduces partnerships, payments optics, and ops the founder shouldn't carry pre-validation. |
| **Partner discounts / sponsored rewards** | Depends on merchant phase + scale. |
| **Deep gamification, AI task suggestions** | Engagement polish, not core proof. |
| **Any real money movement / wallet / payments** | Would convert the app into a regulated financial product — explicitly avoided. |

### 3.3 Hard exclusions (never in MVP)

- The app **never holds, moves, or processes real funds.** Redemption is a record-only status action.
- No open child discovery, child-to-child contact, or public child profiles.
- No collection of children's PII beyond the minimum the loop requires.

---

## 4. MVP user types

| User type | In MVP scope | Capabilities in MVP |
|---|---|---|
| **Parent** | ✅ | Register/MFA, invite co-parent, create kids, generate QR, approve logins, create/assign tasks, set decay, give bonus points, approve/reject completions, configure currency value, mark redeemed, view dashboard |
| **Co-parent** | ✅ | Same as parent, scoped to shared kids; maintains own tasks and own points balance with each kid |
| **Kid** | ✅ | QR onboard, await approval, view assigned tasks (with assigner shown), mark complete, view earned/pending/redeemed history |
| Teacher / Moderator / Merchant | ❌ (later/future) | Not active in MVP; roles designed but gated |

---

## 5. MVP KPIs (validation-focused)

The MVP exists to answer: **"Do families actually use the loop, and does it motivate kids?"**

| KPI | What it proves | Starting target (refine with data) |
|---|---|---|
| **Parent activation** = % of registered parents who create ≥1 kid **and** assign ≥1 task | Parents understand and start the loop | ≥ 60% |
| **Kid onboarding success** = % QR scans that reach approved login | Safe onboarding works in practice | ≥ 80% |
| **Loop completion** = % assigned tasks reaching complete → approve → points granted | The core value cycle works end-to-end | ≥ 50% |
| **Approval latency** = median kid-completion → assigner-approval | The async loop isn't stalling | < 24h |
| **Redemption usage** = % active families marking redeemed ≥1×/month | Parents close the loop with real rewards | ≥ 30% |
| **Week-4 retention** of activated families | The habit sticks | ≥ 30% |
| **Repeat tasking** = % of parents who assign tasks in ≥2 distinct weeks | Ongoing (not one-time) usage | ≥ 40% |
| **Safety gate integrity** = % kid devices that passed first-login approval | The safety model holds | 100% (non-negotiable) |

> These are bootstrapped-MVP hypotheses, not commitments. The point is a clear, small set of signals that tell the founder whether to invest in Phase 2.

---

## 6. MVP launch criteria

The MVP is ready to put in front of beta families when **all** are true:

### 6.1 Functional readiness
- [ ] All PRD MVP acceptance criteria (`02-prd.md` §11, AC-1…AC-15) pass.
- [ ] The full happy-path loop works on **two real devices** (parent device + kid device) end-to-end.
- [ ] Co-parent invite → link → separate balances verified.
- [ ] Redemption/deemed records correctly and blocks over-redemption.
- [ ] Web dashboard shows the required summary (tasks, points earned, points redeemed, pending approvals).

### 6.2 Safety & trust readiness
- [ ] First-login approval is enforced on **100%** of kid devices (no bypass path).
- [ ] QR codes are single-use and short-lived; device revocation works.
- [ ] Data collected on kids is minimized and documented.
- [ ] A report/escalation entry point exists.
- [ ] **Child-privacy & app-store-policy review completed with appropriate professional/legal counsel** for the chosen launch region. *(Flag — not legal advice; this is a gating dependency.)*

### 6.3 Quality & operational readiness
- [ ] Core screens are responsive on a mid-range phone.
- [ ] App renders correctly in **LTR and at least one RTL language**.
- [ ] No user-facing screen positions the app as holding/moving real money.
- [ ] Essential notifications deliver reliably (push + in-app).
- [ ] Append-only ledger verified (no lost/duplicated entries under normal use).
- [ ] Basic crash/error monitoring in place.
- [ ] Secrets are not in source; passwords hashed; MFA enforced.

### 6.4 Go-to-beta readiness
- [ ] A small invite-only cohort of **real families** is recruited (founder-led).
- [ ] A simple feedback channel exists (form/interview cadence).
- [ ] KPIs (§5) are instrumented and observable.

---

## 7. MVP sequencing (suggested build order)

A dependency-aware order that gets to a testable loop fastest:

1. **Auth foundation** — registration, MFA, role scaffolding, i18n/RTL framework (do this first; expensive to retrofit).
2. **Kid creation + QR onboarding + first-login approval** — the safety spine.
3. **Tasks + ledger** — create/assign/complete/approve → points post (append-only).
4. **Decay + bonus points + currency value** — round out the points economy.
5. **Redemption/deemed flow** — close the loop.
6. **Notifications** — wire essential events.
7. **Dashboards** — mobile summary + lightweight web.
8. **Audit log + baseline abuse controls + RTL/language pass** — harden before beta.

---

## 8. Key MVP decisions (defaults, pending founder confirmation)

| Decision | MVP default | Rationale |
|---|---|---|
| MFA channel | TOTP / email OTP | Avoid SMS cost & SIM-swap risk for a bootstrapped founder |
| Co-parent rights | Equal peers; only task creator approves/redeems | Matches "assigner is approver/payer" model; reduces conflict ambiguity |
| Decay model | Linear, floored at 0, based on kid completion time | Simple; protects kids from slow-approver penalties |
| Bonus points | Positive-only | Avoid punitive complexity and fairness disputes |
| Currency | Manual value, one currency per relationship | Region-agnostic without financial-data/FX complexity |
| Languages at launch | English + 1 (incl. one RTL) | Proves i18n/RTL capability; breadth follows demand |
| Recurring tasks | Deferred to Phase 2 | Keep MVP loop simple |
| Real funds | Never in-app | Stay out of financial regulation |

---

## 9. Why this MVP is the right cut (summary)

- **Fastest demand validation:** ships only the loop that proves the product's premise, recruitable as an invite-only family beta.
- **Safest & simplest:** child-safety gates are in; no money movement; minimal child data; low-ops infra.
- **Regulation-light:** record-only redemption + manual currency keeps MVP clearly outside banking/payments scope.
- **Region-agnostic by construction:** i18n/RTL/multi-currency are architectural from day one without over-building content breadth.
- **Clean growth path:** roles for teacher/school exist in design and activate in Phase 2; merchant is a clearly separated Future phase — none of it bloats the MVP.

> See `01-feature-inventory.md` for per-feature detail and `02-prd.md` for functional/non-functional requirements and acceptance criteria.
