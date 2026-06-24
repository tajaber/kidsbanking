# 01 — Feature Inventory

**Project:** KidsBank (a.k.a. KidsBanking)
**Author:** Ryan — Mobile Product Manager
**Date:** 2026-06-23
**Source:** `prompts/p-260623-prototype.md`
**Audience:** Internal execution team (solo / bootstrapped founder context)

---

## How to read this document

This is the full, implementation-ready feature inventory derived from the prompt's **Feature breakdown** list. Each feature is described by:

- **Business purpose** — why it exists / what value it delivers
- **User flow** — the happy-path interaction
- **Edge cases** — situations the build must handle
- **Risks** — product, technical, safety, or compliance exposure
- **Priority** — `P0` (critical), `P1` (important), `P2` (secondary)
- **Phase** — `MVP`, `Later`, or `Nice-to-have`

### Conventions and assumptions (explicit)

- **A1.** "Parent" flows apply equally to **Co-parents, Teachers, and Moderators**, except each assigner only sees the kids/students they own and the tasks they created. (Per prompt.)
- **A2.** Points are **earned in-app only**; real-world payout/gifts happen **outside the app**; the assigner marks points **redeemed/deemed** inside the app. The app is a **motivational/reward system, not a banking or money-movement app** in MVP. This positioning is a hard constraint to avoid regulatory classification as a financial product.
- **A3.** **Region-agnostic by default** — no fixed country, currency, language, or store assumptions. Anything region-dependent is flagged for founder/legal review.
- **A4.** The **assigner of a task is the approver** of that task's completion and the party responsible for converting points to real-world value ("multiple bank account numbers for the same kid" = each assigner relationship is a separate points balance).
- **A5.** Legal/compliance items in this doc are **flags for professional review, not legal advice.**

### MVP phasing summary

| Phase | Included feature themes |
|---|---|
| **MVP** | Registration, MFA auth, role system (parent/co-parent/kid) **with multi-role identity + active-role switching + pre-login role selection at the home screen**, co-parent linking, kid account creation, QR onboarding **(any assigner's QR → a new per-assigner account)**, first-login approval, task management, deadline & decay, notifications **(incl. redemption-lifecycle events to parents)**, bonus points, points ledger, **two-step redemption/deemed flow (assigner initiates → kid confirms → completed) with held balance, status badges, parent notifications + event log** **+ redemption history (own + parent cross-assigner)**, multi-currency config, basic audit log, basic parent dashboard **with name search (min-3-char live filter) and the parent overall account picture** |
| **Later** | Teacher/student hierarchy, school moderation, advanced abuse prevention, advanced reporting/analytics dashboards, full multilingual + RTL polish at scale |
| **Nice-to-have / Future** | Merchant/store redemption, partner discounts, deep gamification, AI task suggestions |

> **Note on multilingual & RTL:** the prompt lists multi-language and RTL/LTR as core. We treat **i18n/RTL as MVP**: the architecture supports it from day one **and the prototype now ships complete, real Arabic translations for the entire UI with a language toggle that flips the whole app to RTL** (full mirroring, not a subset). Broad coverage of *additional* languages remains Later. See features 14–16.

---

## Feature 1 — Account Registration

- **Business purpose:** Entry point for every adult role (parent, co-parent, teacher, moderator). Establishes the identity that owns kids, tasks, and points configuration.
- **User flow:** Open app → choose role/intent → enter email (or phone) + password → verify email/phone → land in role-appropriate home.
- **Edge cases:** Duplicate email; partial/abandoned registration; invalid email; user later needs a second role; minimum-age self-attestation for the adult; corporate vs personal email for teachers.
- **Risks:** Weak verification enables fake accounts targeting children (**safety**); collecting more PII than needed (**privacy**); region-specific consent rules (**compliance — flag**).
- **Priority:** P0
- **Phase:** **MVP** (parent + co-parent registration). Teacher/moderator registration scaffolded but gated → see Phase notes in features 17–18.

## Feature 2 — Authentication (with MFA)

- **Business purpose:** Protect adult accounts that control children's data and points. Prompt explicitly requires **MFA**.
- **User flow:** Enter credentials → second factor (OTP via email/SMS or authenticator/TOTP) → session issued. Kid auth is QR-based (see feature 6), not password-based.
- **Edge cases:** Lost second-factor device; MFA fatigue; account recovery; session expiry/refresh; multiple devices; offline login attempt.
- **Risks:** SMS OTP cost & SIM-swap risk (**security**); recovery flow is a common takeover vector (**security**); lockout frustration (**UX**).
- **Priority:** P0
- **Phase:** **MVP.** *Decision:* MVP uses **TOTP/email OTP** to avoid SMS costs/complexity; SMS optional later.

## Feature 3 — Role System (multi-role identity + role switching + pre-login role selection)

- **Business purpose:** Drives all permissions and visibility. Roles: **Parent, Co-parent, Kid, Teacher, Moderator** (Merchant later). **One adult identity (one account/login) can hold multiple roles at once** — e.g. the same person is a **Parent** to their own kids **and** a **Teacher** to a class of students. They **switch the active role** to change context; people and tasks always scope to the *active* role. **A multi-role adult can also choose which role to sign in *as* from the home/landing screen, BEFORE authenticating** — this sets the initial post-login scope and complements the in-app active-role switcher.
- **User flow:** Role(s) assigned at registration/invitation → on the **home/landing screen** a returning adult may pick a **role to sign in as** (e.g. *Continue as Parent* / *Continue as Teacher*) before entering credentials; the chosen role becomes the initial active role after authentication → an adult with more than one role still sees an in-app **role switcher**; selecting an active role (e.g. Parent/Co-parent → manage *kids*; Teacher/Moderator → manage *students*) re-scopes navigation, dashboards, people lists, and capabilities to that role. Each assigner still sees only their own kids/students and the tasks they created, within the active role's scope.
- **Edge cases:** One human holding multiple roles (parent **and** teacher) — single login, multiple role contexts; **pre-login role choice for a single-role identity (skip the chooser — go straight to auth)**; **pre-login chosen role must be re-validated server-side against the user's actual memberships after auth** (a client choice can never grant a role the user doesn't hold); defaulting/remembering the last selected/active role; switching role mid-flow; a kid who is both a child to a parent and a student to a teacher (kept as separate per-assigner relationships/accounts); role escalation; co-parent with equal vs limited rights; kid "ages out."
- **Risks:** Over-broad permissions exposing children's data (**safety/privacy**); **cross-role data bleed** if scope doesn't follow the active role (**safety** — active-role scoping is mandatory); **pre-login role choice misread as an authorization grant** (**security** — it is only a scope *hint*; entitlement is always re-checked post-auth); confusing UX if roles overlap (**product** — mitigate with a clear, explicit switcher, never an accidental toggle).
- **Priority:** P0
- **Phase:** **MVP** for parent/co-parent/kid, **including multi-role identity + active-role switching + pre-login role selection** at the model and UX level; teacher/moderator role *capabilities* are designed in MVP and **activated Later**, but a single identity holding multiple roles, choosing a role at the home screen, and switching between them is an MVP construct so the path is a feature-flag flip, not a rebuild. *Decision: one User → many Role memberships; the pre-login choice sets the initial active role (a hint, re-validated post-auth) and the active role determines people/task scope (see `06-technical-architecture.md` §10.7 and `08-data-model.md` Membership).*

## Feature 4 — Parent / Co-parent Linking

- **Business purpose:** Lets two guardians (e.g., mother + father) co-manage the same kids and tasks.
- **User flow:** Parent invites co-parent (email/link) → co-parent registers/accepts → both linked to shared kid profiles; each can create their own tasks; each manages their own points balance with the kid.
- **Edge cases:** Invite to existing account; invite declined/expired; co-parent removal; **separated/divorced parents conflict**; unequal permission needs; co-parent abuse of access.
- **Risks:** **Co-parent conflict** over tasks/points/children (**product & safety**); revoked-access data leakage; custody disputes (**compliance — flag**).
- **Priority:** P0
- **Phase:** **MVP.**
- **Open question:** Are co-parents equal peers or is one an "owner"? *Default decision: equal peers, but only the creator of a task can approve/redeem it (per A4).*

## Feature 5 — Kid Account Creation

- **Business purpose:** Creates the child profile that receives tasks and accumulates points. Kid accounts are created **by an adult**, not self-registered.
- **User flow:** Parent → "Add kid" → enter name/nickname, optional avatar, birth year (coarse), currency/value rules → kid profile created, ready for QR onboarding.
- **Edge cases:** Multiple kids same name; minimal-data kid profile; one kid linked to multiple guardians and (later) teachers; deleting a kid with point history.
- **Risks:** Collecting children's PII (**privacy — minimize, flag for legal**); kid profile visible to wrong adult (**safety**).
- **Priority:** P0
- **Phase:** **MVP.** *Decision: collect minimal child data (nickname + coarse age only).*

## Feature 6 — QR Onboarding Flow (any assigner's QR → a new per-assigner account)

- **Business purpose:** Lets a kid log into their own device/tablet without managing passwords, by scanning an assigner-generated QR code. **A kid can scan a QR from *any* assigner** (a parent, a co-parent, or — Later — a teacher/moderator). Scanning an assigner's QR **creates a NEW per-assigner bank account** for that kid under that assigner (the "multiple bank account numbers for the same kid" model), after which the kid receives that assigner's tasks/points and can redeem from that account.
- **User flow:** Assigner opens kid/student profile (or an "invite a kid" action) → generates QR → kid opens app on their device → scans QR → device requests access → **first-login approval** (feature 7) by the owning guardian → on approval, a **per-(kid, assigner) account is provisioned** and the kid is linked to that assigner for tasks/points/redemption. A kid who scans a *second* assigner's QR gets a *second* account — balances never mix across assigners.
- **Edge cases:** QR screenshotted/shared; expired QR; QR scanned on multiple devices; re-issue QR; no camera/permission denied; offline scan; **kid scans the same assigner's QR twice** (idempotent — reuse the existing account, don't duplicate); **kid scans a brand-new assigner** (create a new account after approval); first scan that also onboards the device vs later scans that only add an account to an already-trusted device; a non-guardian (teacher, Later) inviting a kid still requires guardian consent/approval before an account is created.
- **Risks:** **QR interception/replay** → unauthorized access to a child account (**security — high**). Mitigate with short expiry, one-time use, bind-to-device + mandatory approval. **Unwanted account creation / stranger linking** if any QR auto-created an account — mitigated because account creation is gated behind guardian first-login approval (feature 7), never automatic on scan.
- **Priority:** P0
- **Phase:** **MVP** for parent/co-parent QR → new account; teacher/moderator-issued QR is **Later** (same mechanism, gated by the role activation + guardian consent). *Decision: QR is single-use, short-lived (e.g., minutes), and always requires first-login approval; account creation per (kid, assigner) happens on approval, not on scan.*

## Feature 7 — First-Login Approval

- **Business purpose:** Safety gate — a kid's device cannot access the account until the parent explicitly approves it.
- **User flow:** Kid scans QR → request appears in parent app → parent reviews device → approves/denies → on approval, kid device is trusted and signed in.
- **Edge cases:** Parent never approves (stuck kid); approve wrong device; revoke a previously approved device; re-approval after app reinstall.
- **Risks:** If skippable, defeats child-safety model (**safety — critical**); approval fatigue if too frequent (**UX**).
- **Priority:** P0
- **Phase:** **MVP.**

## Feature 8 — Task Management

- **Business purpose:** Core engine. Assigners create tasks with point values and assign to one or many kids; kids complete; assigner approves.
- **User flow:** Assigner creates task (title, description, point value, deadline, decay rule, assignee[s]) → kid sees task → kid marks complete → assigner notified → assigner approves/rejects → points granted on approval. **Every task clearly shows who assigned it** (the responsible approver/payer).
- **Edge cases:** Task assigned to multiple kids (per-kid completion state); editing a task after assignment; recurring tasks; kid marks complete falsely; reject with reason; task deleted mid-flight; overlapping tasks from different assigners.
- **Risks:** Gaming/false completions (**fraud**); disputes over approval (**product/co-parent conflict**); complexity creep (**scope**).
- **Priority:** P0
- **Phase:** **MVP.** Recurring/scheduled-repeat tasks → *Later* if they add complexity.

## Feature 9 — Deadline & Decay / Reduction Logic

- **Business purpose:** Encourages timeliness. Points reduce after the due time per a configurable rule the assigner enters **as two numbers**: how many points to reduce, and the minutes interval at which to reduce them (e.g., reduce **1 point every 5 minutes** late).
- **User flow:** When creating a task, the assigner sets an optional deadline and, if desired, the late-decay rule by entering **two values — `points to reduce` and `minutes interval`** (instead of picking a fixed preset). After the due time, displayed/earnable points decrease by `points` for every elapsed `minutes` interval → at approval, the decayed value is applied, **floored at 0**.
- **Edge cases:** Decay to zero / negative (floor at 0); either input left blank or zero (no decay applied); non-positive / non-integer inputs (validate and reject); very small interval causing rapid decay (show preview); timezone differences between assigner and kid; kid completed on time but approved late (don't penalize kid for slow approver); paused/disputed tasks; clock skew.
- **Risks:** **Unfair penalties from slow approval** (**product/trust — important**); confusing/misconfigured two-number rule (**UX** — mitigate with a live preview of points lost over time); timezone bugs (**technical**); demotivation if too punishing (**product**).
- **Priority:** P1
- **Phase:** **MVP** (linear `{points, minutes}` decay with a floor of 0). *Decision: the decay rule is entered as two numbers — points-to-reduce and minutes-interval — and is based on the kid's completion timestamp, not approval timestamp, to protect the child.*

## Feature 10 — Notification System

- **Business purpose:** Connects the asynchronous loop: kid completes → assigner approves → points granted. Drives engagement. Also drives the **two-step redemption lifecycle**: a kid's **parent is notified on every redemption event** (initiated/pending, kid-confirmed/completed, declined) for **any** of their kids, regardless of which assigner initiated it.
- **User flow:** Triggered on key events (new task, completion submitted, approval/rejection, points granted, **redemption initiated (pending kid confirmation), redemption confirmed/completed by kid, redemption declined**, login approval request, bonus given). Delivered via push + in-app inbox. The kid receiving the redemption gets a **confirm/decline** prompt; the kid's parent(s) get a **lifecycle notification + a visible event log**.
- **Edge cases:** Notification fatigue; batching; quiet hours; per-device tokens; failed delivery; kid vs parent notification differences; localization of content.
- **Risks:** **Notification fatigue → churn** (**product**); push infra cost/complexity (**technical**); kids over-notified (**safety/UX**).
- **Priority:** P0 (loop doesn't work without it)
- **Phase:** **MVP** (essential events only; push + in-app). Advanced scheduling/quiet-hours → *Later*.

## Feature 11 — Bonus / Gift Points

- **Business purpose:** Lets an assigner reward a kid spontaneously for good behavior **not tied to a task**.
- **User flow:** Assigner → kid profile → "Give bonus points" → amount + optional note → points added immediately to that assigner's balance with the kid; kid notified.
- **Edge cases:** Negative/penalty points (out of scope or explicit?); large accidental grants; bonus during disputes; audit of who granted what.
- **Risks:** Bypasses task structure → potential inconsistency (**product**); could be misused (**fairness**). Must be in audit log.
- **Priority:** P1
- **Phase:** **MVP.** *Decision: bonus points are positive-only in MVP; no punitive deductions outside task decay.*

## Feature 12 — Points Ledger / History (incl. redemption history)

- **Business purpose:** Single source of truth for every point change. Supports trust, dispute resolution, and the redemption flow. Each assigner↔kid relationship is a **separate balance** ("multiple bank account numbers for the same kid"). The ledger also backs a **redemption history** view (feature 13): every redeem event is queryable per account, per assigner, and — for parents — across **all** of a kid's accounts.
- **User flow:** Every event (task approved, bonus, decay applied, redemption/deemed) writes an immutable ledger entry → kid and assigner can view earned, pending, and redeemed history per relationship. **Each assigner sees their own redemption history; a parent can see the consolidated redemption history for each of their kids across every assigner who redeemed.**
- **Edge cases:** Concurrent writes; reversing an erroneous entry (correction entry, never silent edit); cross-assigner aggregation views; very long histories (paginate/filter by date, assigner, type); currency display across accounts with different currency rules.
- **Risks:** Ledger integrity bugs → trust loss (**product — critical**); confusion with multiple balances (**UX**).
- **Priority:** P0
- **Phase:** **MVP.** *Decision: append-only ledger; corrections are new offsetting entries; redemption history is a filtered read over the same ledger.*

## Feature 13 — Redemption / Deemed Flow (two-step: initiate → kid confirms → completed)

- **Business purpose:** The "cash-out" — assigner gives real money/gift **outside the app**, then marks points **redeemed/deemed** in-app. Keeps the app out of money-movement scope (A2). Redemption supports **full OR partial** cash-out of the kid's earned balance **within one assigner-account**. **Redemption is NOT instantly final: it is a two-step, kid-confirmed action.** When an assigner processes a redemption it enters **`pending redemption confirmation`** (points are **held**, not yet counted as redeemed); the **kid must confirm** for it to become fully **`redeemed`** (completed). The kid's **parent is notified on each event and can see a log** of redemption activity. This applies **regardless of which assigner** (parent/co-parent/teacher/moderator) initiated it — the parent is always notified for their own kids.
- **User flow:**
  1. **Assigner initiates:** Assigner → kid's per-account balance → "Mark redeemed" → choose **how many points** (any amount from **1 up to the available earned balance**, full or partial) + outside method + optional note, with converted value shown live → confirm offline payout → redemption is created with status **`pending_confirmation`**; that amount is **held** (reserved against the earned balance, **not** yet counted as redeemed). The **kid is prompted to confirm** and the **parent(s) are notified ("redemption initiated")**.
  2. **Kid confirms:** Kid sees a **confirm/decline** prompt → on **confirm**, the redemption transitions to **`redeemed`/completed**: the hold is released into a settled `redeem` ledger entry, the account's **earned decreases and redeemed increases** by the amount; **parent(s) notified ("completed")**.
  3. **Kid declines (or expiry):** On **decline**, status becomes **`declined`**; the **hold is released back** to the available earned balance (nothing is redeemed); **parent(s) notified ("declined")**. An unconfirmed redemption may **expire** after a window → treated like a decline (hold released).
  - **Status badges** distinguish **"pending confirmation"** vs **"redeemed"** everywhere a redemption appears. The kid's **parent sees an event log** (kid, initiating assigner, amount, money value, timestamp, status).
- **Edge cases:** **Partial redemption** (amount < earned balance — leaves a remaining balance); full redemption; redeem more than balance, or amount < 1, or non-integer (**block with validation**, show available max); **held amount cannot be re-redeemed or double-spent while pending** (the hold reduces the redeemable balance until confirmed/declined); **kid never confirms** (expiry → auto-release the hold); **kid declines** (release hold, no ledger redeem); reversing a *completed* redemption (offsetting entry, never a silent edit); a non-guardian assigner (teacher) initiating still notifies the kid's guardian; redemption across multiple assigner balances (each isolated — never pooled).
- **Risks:** **Positioning risk** — must never look like in-app payment/transfer (**compliance — critical flag**); off-app trust gap between kid and adult (**product**); disputes (**support**); partial-amount or **hold/release math** bugs eroding ledger trust (**product** — held points must never be counted as both available and redeemed); **kid-confirmation friction** stalling redemptions (**UX** — clear prompt + parent visibility).
- **Priority:** P0
- **Phase:** **MVP.** *Decision: redemption is a two-step status/ledger action only (assigner initiates → kid confirms → completed); the app never holds, moves, or processes real funds. While `pending_confirmation`, points are **held** and excluded from both available-earned and redeemed totals; on confirm they become redeemed, on decline/expiry the hold is released. The redeemed amount is validated as `1 ≤ amount ≤ available earned` and applied to that specific account only (per-account isolation). The kid's parent is notified on every lifecycle event and can view an event log. Both full and partial redemption ship in MVP.*

### Redemption event log & parent notifications (sub-feature of 13)

- **Business purpose:** Because redemption is now a **two-step, kid-confirmed** action, the kid's **parent must be notified on every lifecycle event** (initiated → kid-confirmed/completed → declined) and can review a **chronological event log** of all redemption activity on their kids. This holds **regardless of which assigner** initiated the redemption (parent, co-parent, teacher, moderator).
- **User flow:** Each lifecycle transition emits a notification to the kid's parent(s) and appends an entry to the parent-visible **redemption event log** showing **kid, initiating assigner, amount, money value (snapshot), timestamp, and status**. The **kid** receives the **confirm/decline** prompt; the **initiating assigner** sees the status move from *pending confirmation* → *redeemed*/*declined*.
- **Edge cases:** Multiple pending redemptions for one kid (each tracked separately with its own status); declined/expired entries shown with their resolution; differing currencies labeled per row (never summed); a teacher-initiated redemption still logged for and notified to the **guardian**.
- **Risks:** Notification fatigue if over-emitted (**UX** — tier these as status events, approvals stay highest); parent over-reach into another assigner's task data — the log exposes **redemption lifecycle records only** (**privacy**).
- **Priority:** P1
- **Phase:** **MVP** (parent notifications on each event + a parent-visible event log).

### Redemption history (sub-feature of 13)

- **Business purpose:** Every redemption is recorded and **reviewable as a history**, so each party can see what was settled offline. **Each assigner sees their own redemption history** (the redemptions they marked, per their account with the kid). **Parents see the redemption history for *each of their kids* across ALL assigners** — a full cross-assigner picture (who redeemed, how many points, the snapshotted value, when), regardless of which assigner did the redeeming.
- **User flow:** Assigner → kid/account → **Redemption history** (their own redemptions). Parent → kid → **Redemption history (all sources)** → list grouped/filterable by assigner, date, and amount; each row shows assigner, points redeemed, value at the time (snapshot), method note. Kid sees a friendly, celebratory version of their own redemptions.
- **Edge cases:** A kid with many assigners (group by assigner); reversed/corrected redemptions shown transparently; differing currencies across assigners (label per row, never silently summed); long histories (paginate, filter by date range).
- **Risks:** Parent over-reach into a co-parent's/teacher's *task* data — scope the cross-assigner view to **redemption records only**, not the other assigner's private task management (**privacy/product**); implying pooled money (**compliance** — show snapshotted offline value, never a live in-app balance).
- **Priority:** P1
- **Phase:** **MVP** (assigner's own history + parent cross-assigner history over a kid's accounts).

## Feature 14 — Multiple Currencies

- **Business purpose:** Region-agnostic value definition. Parent defines point value (e.g., 10 pts = 5 USD / 4 EUR / 20 AED).
- **User flow:** Assigner sets currency + conversion rule per kid (or per relationship) → all value displays use it; redemption shows converted real-world amount.
- **Edge cases:** Changing currency mid-history (preserve historical value); multiple currencies across co-parents; formatting/decimal/locale rules; no FX rates (manual value only).
- **Risks:** Locale formatting bugs (**technical**); confusion if currency changes (**UX**). **No live FX in MVP** — values are manual to avoid financial-data complexity.
- **Priority:** P1
- **Phase:** **MVP** (manual per-currency value config; single currency per relationship). Multi-currency conversion tables → *Later*.

## Feature 15 — Multilingual Support

- **Business purpose:** Broaden reach; serve non-English families; required by prompt. The prototype now ships **real, complete Arabic translations** for **all** UI text (not a partial subset), proving the i18n pipeline end-to-end.
- **User flow:** App detects/locale-selects language → all UI strings localized → user toggles language in settings (and a top-level **language toggle**) → the **entire UI** switches, including direction.
- **Edge cases:** Missing translations (fallback to default); mixed-language households; pluralization/gender rules; long strings breaking layout; ensuring **no string is left untranslated** when Arabic is active.
- **Risks:** Translation cost/maintenance (**ops**); untranslated strings shipping (**quality** — mitigated by full-coverage Arabic pass).
- **Priority:** P1 (architecture) / P2 (breadth of additional languages)
- **Phase:** **MVP = i18n framework + English and full Arabic.** Additional language catalog → *Later*. *Decision: the prototype ships complete real Arabic translations for the whole UI (every label/flow), not a token subset.*

## Feature 16 — RTL / LTR Support

- **Business purpose:** Correct layout for right-to-left languages (e.g., Arabic, Hebrew); required by prompt.
- **User flow:** A **language toggle flips the whole UI to RTL** when Arabic is selected → mirrors navigation, icons, progress bars, ledgers, dashboards, and forms across **every screen** (not just a subset); switching back returns to LTR.
- **Edge cases:** Mixed LTR/RTL content (numbers, currency); icon mirroring; charts/dashboards; QR screens; ensuring decay/redemption/Your-Kids screens mirror correctly too.
- **Risks:** RTL bugs are easy to miss without RTL testers (**quality**); retrofitting RTL late is expensive (**technical — build early**).
- **Priority:** P1
- **Phase:** **MVP = full-UI RTL mirroring driven by the language toggle**, validated with the complete Arabic translation. *Decision: bidirectional layout is an MVP requirement; the prototype demonstrates the entire UI flipping to RTL, not a partial mirror.*

## Feature 17 — Teacher / Student Hierarchy

- **Business purpose:** Extends the model beyond families to teachers/coaches/camps and their students — a key growth vector.
- **User flow:** Teacher registers independently (or is invited by a school) → creates/links to students → assigns tasks → approves → redeems via real-world rewards, same as parent flow but scoped to assigned students.
- **Edge cases:** A kid who has both parents and teachers (separate balances/visibility); student belongs to multiple teachers; teacher leaves school; consent for teacher↔child relationship; teacher offboarding.
- **Risks:** **Child-safety/consent** when non-guardian adults connect to children (**safety/compliance — high flag**); data-sharing boundaries (**privacy**).
- **Priority:** P1
- **Phase:** **Later** (Phase 2). Role designed in MVP, activated after family MVP validates. *Requires consent & moderation model before rollout.*

## Feature 18 — School Moderation

- **Business purpose:** Governance/safeguarding layer — a school registers a moderator/admin who oversees teacher access, associations, and activity.
- **User flow:** School registers moderator account → moderator invites teachers under the school → reviews teacher access/activity/associations → can suspend/escalate.
- **Edge cases:** Teacher in multiple schools; moderator overreach; independent teacher vs school-bound teacher; school offboarding; jurisdiction-specific safeguarding rules.
- **Risks:** **Safeguarding liability** (**compliance — critical flag**); complex multi-tenant permissions (**technical**); scope explosion (**product**).
- **Priority:** P1
- **Phase:** **Later** (Phase 2, paired with feature 17). Requires legal review before any school rollout.

## Feature 19 — Audit Logs

- **Business purpose:** Records who did what, when — essential for trust, dispute resolution, safety investigations, and (later) school governance.
- **User flow:** System auto-logs sensitive events (logins, approvals, point grants, redemptions, role/permission changes, device approvals). Reviewable by authorized roles.
- **Edge cases:** Log volume/retention; tamper-resistance; what's visible to whom; PII in logs; export for investigations.
- **Risks:** Storing children's activity = sensitive (**privacy — flag retention with legal**); missing logs undermine safety (**safety**).
- **Priority:** P1
- **Phase:** **MVP = essential audit trail** (auth, approvals, points, redemptions). Rich admin-reviewable audit UI → *Later* (needed for school/moderation phase).

## Feature 20 — Abuse Prevention

- **Business purpose:** Protect children and the integrity of the points system from fraud, gaming, grooming, and misuse.
- **User flow:** Background + explicit controls: rate limits, device/login approval, anomaly flags, reporting/blocking/escalation, moderation review (school phase).
- **Edge cases:** False positives blocking legit families; coordinated gaming of points; inappropriate task content; adult-to-child contact abuse; co-parent harassment via tasks.
- **Risks:** **Child grooming/abuse vectors** if adults connect to kids unchecked (**safety — critical**); fraud gaming points (**integrity**); under- vs over-moderation (**product**).
- **Priority:** P1
- **Phase:** **MVP = baseline** (login approval, rate limiting, append-only ledger, minimal content surfaces, report button). Advanced moderation/anomaly detection → *Later* (with school phase).

## Feature 21 — Reporting / Dashboard

- **Business purpose:** Gives adults a summary view: tasks, points earned/redeemed, pending approvals — including a **web dashboard** for parents/co-parents/teachers/moderators (prompt requires web dashboard + mobile). The **"Your Kids" (people) view** surfaces, per kid and overall, three headline totals: **total EARNED**, **total PENDING approval**, and **total VALUE IF ALL POINTS REDEEMED** (earned points converted to money via the conversion rule). The dashboard also provides **(a) name search** over the assigner's kids/students, **(b) redemption history** (own + parent cross-assigner — feature 13), and **(c) a parent "overall account picture"** consolidating each kid's accounts across ALL assigners.
- **User flow:** Adult opens dashboard (mobile + web) → **"Your Kids"** lists each kid with cards showing **Earned**, **Pending approval**, and **Value if all redeemed** (money, per the kid/account currency rule), plus an overall roll-up across kids → drills into tasks/kids/approvals.
  - **Name search:** the assigner types into a search box to filter the people list (kids/students) **by name**; **results appear only after the 3rd character is typed (minimum 3 characters)** and filter the list **live** as more characters are added. Below 3 characters, no filtering is applied (full list shown). Scope follows the **active role** (Parent → kids; Teacher → students).
  - **Parent overall account picture:** a parent opens a kid → a **consolidated view of that kid's accounts across every assigner**: each assigner's balance (earned/pending/redeemed + that account's value-if-redeemed), a **per-kid grand total** of points, and a **per-kid total value-if-redeemed**. This is read-only and never a pooled, redeemable balance.
- **Edge cases:** Aggregating across multiple kids and multiple assigner balances (totals shown per the assigner's own accounts; value-if-redeemed uses each account's currency rule and is a **read-only display convenience, never a redeemable pooled balance**); pending = approved-but-not-yet-granted completions awaiting the assigner; **search with <3 chars (no filter), no matches (empty state), duplicate names (disambiguate by avatar/initial), and search respecting active-role scope**; the parent overall picture spanning accounts with **different currencies** (group/label by currency — never sum across differing currencies; show a per-currency subtotal); empty states; large data; per-role scoping; export.
- **Risks:** Scope creep into heavy analytics (**product**); web + mobile = double surface to maintain (**engineering cost**); implying the "value if redeemed" or the parent overall total is real money held in-app (**compliance** — label clearly as an estimate of offline value); search leaking people outside the active role's scope (**safety/privacy** — scope every query by active role + relationship).
- **Priority:** P1 (basic) / P2 (advanced analytics)
- **Phase:** **MVP = basic summary dashboard with the "Your Kids" earned / pending / value-if-redeemed totals, name search (min-3-char live filter), redemption history, and the parent overall account picture** (mobile + lightweight web). Advanced reporting/analytics/exports → *Later*.

---

## Feature → Priority → Phase matrix

| # | Feature | Priority | Phase |
|---|---|---|---|
| 1 | Account registration | P0 | MVP |
| 2 | Authentication (MFA) | P0 | MVP |
| 3 | Role system **(multi-role identity + role switching + pre-login role selection)** | P0 | MVP (P/C/K + multi-role/switch/pre-login choice), Later (T/M capabilities) |
| 4 | Parent/co-parent linking | P0 | MVP |
| 5 | Kid account creation | P0 | MVP |
| 6 | QR onboarding **(any assigner's QR → new per-assigner account)** | P0 | MVP (parent/co-parent), Later (teacher/mod QR) |
| 7 | First-login approval | P0 | MVP |
| 8 | Task management | P0 | MVP |
| 9 | Deadline & decay logic | P1 | MVP (basic) |
| 10 | Notification system **(+ redemption-lifecycle events to parents)** | P0 | MVP (essential) |
| 11 | Bonus/gift points | P1 | MVP |
| 12 | Points ledger/history **(+ redemption history)** | P0 | MVP |
| 13 | Redemption/deemed flow **(two-step: initiate → kid-confirm → completed; held balance, status badges, parent notifications + event log)** | P0 | MVP |
| 14 | Multiple currencies | P1 | MVP (manual) |
| 15 | Multilingual support | P1 | MVP (English + full Arabic) |
| 16 | RTL/LTR support | P1 | MVP (full-UI RTL) |
| 17 | Teacher/student hierarchy | P1 | Later |
| 18 | School moderation | P1 | Later |
| 19 | Audit logs | P1 | MVP (essential) |
| 20 | Abuse prevention | P1 | MVP (baseline) |
| 21 | Reporting/dashboard **(+ name search, redemption history, parent overall account picture)** | P1 | MVP (basic) |
| — | Merchant/store redemption | P2 | Future / Nice-to-have |

---

## Cross-cutting risks (founder attention)

1. **Child safety is the existential risk.** Any feature connecting adults to children (QR, teacher hierarchy, school moderation) needs safety + legal review before launch. *(Flag for professional review.)*
2. **Avoid regulated-financial positioning.** Redemption/currency features must stay "marking" and "configuration" only — no funds held or moved. *(Compliance flag.)*
3. **Children's privacy compliance varies by region.** Data minimization is the safe default; specific rules require legal counsel per market. *(Compliance flag.)*
4. **Scope discipline.** Teacher/school/merchant ambitions are real but must not bloat MVP. The matrix above is the guardrail.
