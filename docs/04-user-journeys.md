# 04 — User Journeys & Workflows (UX)

**Owner:** Caldwell (UX Strategist)
**Source:** `prompts/p-260623-prototype.md` §7 (User journeys and workflows)
**Scope:** End-to-end flows, unhappy paths, and security/safety checks for KidsBank (a.k.a. KidsBanking).
**Standing constraints honored:** solo/bootstrapped founder, region-agnostic, internal execution plan only.

> **Domain reminder — kids + money/rewards.** Every flow below treats child safety, parental consent, and assigner accountability as first-class requirements, not afterthoughts. Points are **in-app only**; real value is transferred **offline** by the assigner, who then marks points redeemed/deemed.

---

## 0. Conventions used in this document

| Term | Meaning |
|---|---|
| **Assigner** | The adult who created a task (Parent, Co-Parent, Teacher, Moderator). The assigner is the **only** role that can approve completion and redeem points for that task. |
| **Guardian** | Parent or Co-Parent who owns the kid profile and holds consent authority. |
| **Happy path** | The intended, successful flow. |
| **Unhappy path** | Error, abuse, edge, or refusal cases and how the UX recovers. |
| **Safety check** | A control that protects a child, prevents abuse, or preserves an audit trail. |
| **MFA** | Multi-factor authentication (simulated in prototype; real in MVP). |

### Cross-cutting assumptions (call-outs)

- **A1.** A kid account is always **owned by at least one Guardian**; teachers/moderators get **scoped access**, never ownership.
- **A2.** Region-agnostic: no specific consent age is hard-coded; the UI exposes a **configurable "guardian consent" gate** the founder can map to local law later. *(Legal review needed — see §Security notes.)*
- **A3.** Points have **no cash value inside the app**; redemption is a **two-step, kid-confirmed offline confirmation** action (assigner initiates → points held → kid confirms → completed, or declines/expires → hold released) with an audit record and parent notifications.
- **A4.** Every state-changing action by an adult on a child account is **logged to an immutable audit trail**.
- **A5.** Notifications are the connective tissue between roles; each journey lists the notifications it emits.

---

## 1. Parent registration

**Goal:** A first-time adult creates a guardian account and reaches an empty, guided dashboard.

> **Pre-login role selection (home/landing screen).** The first screen offers a **role choice** (Parent / Co-Parent / Kid / Teacher / Moderator). A **returning multi-role adult** (e.g. someone who is both **Parent** and **Teacher**) can **pick the role to sign in *as* here, before authenticating** — this sets the **initial post-login scope**, complementing the in-app active-role switcher (§10b). The choice is only a **scope hint**: after login the server **re-validates it against the user's actual memberships** and never grants a role the user doesn't hold. Single-role identities skip straight to auth.

### Happy path
1. Open app → on the home screen **choose role** (here, **Parent**) → **Get started** (or **Sign in** if returning).
2. Enter email/phone + password (or social/passkey).
3. **Verify identity factor** (email/SMS OTP) — establishes a real contact channel.
4. **Enroll MFA** (authenticator app or SMS) — required before any child data exists.
5. Accept **Terms** + **Privacy** + **Child-safety acknowledgment** (explicit, separate checkbox for the child-data clause).
6. Land on **empty-state dashboard** with a 3-step setup checklist: *Add a co-parent (optional) → Create a kid → Create first task*.

| Step | Notification emitted | Safety check |
|---|---|---|
| Verify factor | "Confirm your email/phone" | Blocks fake/typo contacts; needed for recovery |
| Enroll MFA | "MFA enabled" | Protects child data behind 2 factors |
| Accept terms | — | Records consent version + timestamp (audit) |

### Unhappy paths
- **Email already registered** → offer **Sign in / Reset password** instead of duplicate account.
- **OTP not received** → resend with cooldown; fallback channel; never reveal whether an account exists (anti-enumeration).
- **MFA device lost mid-setup** → cannot skip; provide **backup codes** at enrollment.
- **Declines child-safety acknowledgment** → registration cannot complete; explain why (cannot manage a child account without it).
- **Weak/breached password** → block with guidance (length + breach check).

### Security/safety checks
- Rate-limit + lockout on OTP and login attempts.
- Store consent **version, timestamp, and IP/device** for audit.
- No child data can be created until **MFA is active**.

---

## 2. Inviting a co-parent

**Goal:** A Guardian shares a child profile with a second trusted adult at an appropriate permission level.

### Happy path
1. Dashboard → **Family / Co-parents** → **Invite co-parent**.
2. Enter co-parent email/phone + choose **permission scope** (Full co-guardian vs View-only vs Approver-only).
3. Select **which kids** the co-parent can access (default: all; can be narrowed).
4. System sends a **time-boxed invite link** (expires, single-use).
5. Co-parent registers/sign-in → sees **invite preview** (who invited, which kids, what scope) → **Accept** or **Decline**.
6. On accept: link is recorded; both adults see each other in the family roster.

| Field | Default | Why |
|---|---|---|
| Scope | Full co-guardian | Common 2-parent case |
| Kid selection | All kids | Convenience; narrow for blended families |
| Invite expiry | 72h | Limits stale-link risk |

### Unhappy paths
- **Invite expires / already used** → clear "link expired" screen + **request new invite**.
- **Wrong person invited** → inviter can **revoke** before acceptance; access is revocable after acceptance too.
- **Co-parent declines** → inviter notified; no access granted; logged.
- **Disputed access (separated parents)** → no auto-removal of the original guardian; **conflicts require both-or-owner action**; see Decision note D-001.
- **Co-parent tries to delete a kid they don't own** → blocked unless Full co-guardian; destructive actions need owner confirmation.

### Security/safety checks
- Invites are **single-use, expiring, and scoped**; never a public link.
- **Least-privilege default** is offered prominently (View-only / Approver-only).
- Revoking a co-parent **immediately** cuts access and is **audit-logged** (who/when).
- Removing the **last** guardian is blocked (a kid must always have an owner).

---

## 3. Creating a kid profile

**Goal:** Guardian creates a minimal child profile to assign tasks against.

### Happy path
1. Dashboard → **Add a kid**.
2. Enter **display name / nickname** (no requirement for full legal name), optional avatar (pick from safe preset set), optional birth year (for age-appropriate UI only).
3. Set **currency & point value rule** for this kid (e.g., 10 pts = 5 USD) — can be edited later.
4. Choose **device model**: *Kid uses own device (QR onboarding)* **or** *Parent-managed (no kid login)*.
5. Save → kid appears on dashboard with **0 points** and an **onboarding nudge**.

| Data captured | Required? | Minimization note |
|---|---|---|
| Display name / nickname | Yes | Prefer nickname over legal name |
| Avatar | No | Preset, moderated images only |
| Birth year | No | Used only to tune UI/reading level |
| Currency + value rule | Yes (default offered) | Needed for redemption math |

### Unhappy paths
- **Duplicate kid name in same family** → allow, but show a disambiguator (avatar/initial).
- **Guardian over-collects data** → UI nudges **data minimization** ("You don't need a full name").
- **No device for kid** → default to **Parent-managed** mode; QR can be enabled later.

### Security/safety checks
- **Data minimization by design**: full legal name, school, address are **not** requested in MVP.
- Avatar images come from a **moderated preset library** (no free uploads in MVP) to avoid inappropriate content.
- Point-value rule changes are **logged** (prevents silent devaluation disputes).

---

## 4. QR onboarding for a kid (any assigner's QR → a new per-assigner account)

**Goal:** A kid opens the app on their own tablet/phone and links to an **assigner** by scanning that assigner's QR code, **without** handling adult credentials. Scanning **any assigner's** QR — a parent, co-parent, or (Later) a teacher/moderator — provisions a **new per-(kid, assigner) account** for the kid under that assigner once a guardian approves, after which the kid receives that assigner's tasks/points and can redeem from that account. Balances never mix across assigners ("multiple bank account numbers for the same kid").

### Happy path
1. Assigner: kid/student profile → **Connect kid device / Invite kid** → app shows a **rotating QR code** (short-lived).
2. Kid device: open app → **I'm a Kid → Scan code**.
3. Kid scans → device sends a **pairing + claim request** naming the assigner to the **owning guardian**.
4. Guardian gets a **first-login approval** prompt (see §5) showing the device **and** the assigner who issued the QR, and approves.
5. On approval: if the device is new it is **bound** to the kid; and a **new account for (kid, assigner)** is provisioned (unless one already exists). The kid sees a friendly welcome and that assigner's tasks.
6. **Adding more assigners:** the same kid later scans a **different** assigner's QR → after guardian approval, a **second account** is created. Re-scanning an assigner the kid already has is **idempotent** — it reuses the existing account, never duplicates it.

| Property | Value | Why |
|---|---|---|
| QR lifetime | Short (e.g., 60–120s, rotating) | Limits screenshot/replay abuse |
| Binding | One profile ↔ approved device(s) | Prevents stranger linking |
| Kid credentials | **None handled by kid** | Kid never sees adult password |
| Account created | **One per (kid, assigner)**, on approval | Per-assigner isolation; new assigner = new account |
| Approval gate | **Always** before any account/access | Account is never auto-created on scan |

### Unhappy paths
- **QR expired** → kid sees "Ask the grown-up to show the code again"; assigner taps **Refresh**.
- **Wrong/garbage scan** → friendly retry, no error codes.
- **Stranger scans a leaked QR** → useless without **guardian approval** in §5; the request appears to the guardian with **device info + the issuing assigner** to reject. No account is created until approval.
- **Kid scans an assigner they already have** → idempotent; the existing account is reused; no duplicate account, gentle "You're already connected to [assigner]".
- **Kid scans a brand-new assigner** → after guardian approval, a **new account** is created and the kid is linked to that assigner.
- **Non-guardian (teacher, Later) issues the QR** → still requires guardian consent/approval before any account is created (a teacher cannot unilaterally create a child account).
- **Kid device offline** → queue pairing/claim; show "waiting for a grown-up".
- **Kid loses device** → guardian can **unbind device** remotely (revokes device access; existing accounts/ledgers are preserved).

### Security/safety checks
- QR encodes a **single-use, expiring token** bound to the issuing assigner, not the account itself.
- Pairing **and account creation** **always** require explicit guardian approval (no silent link, no silent account).
- Device fingerprint **and the issuing assigner** are shown to the guardian at approval.
- New assigner = new isolated account; balances are never pooled across assigners.
- Guardian can **revoke/unbind** any device at any time; revoking a device does not delete the kid's accounts/history.

---

## 5. Parent approval for first login

**Goal:** No child device gains access until a Guardian explicitly approves it.

### Happy path
1. Kid pairing/login (or a new-assigner QR claim) triggers a **push + in-app approval card** to all Full guardians.
2. Card shows: kid name, **device type/name**, **the assigner who issued the QR**, whether this will **create a new per-assigner account**, time, approximate location hint (coarse), and **Approve / Reject**.
3. Guardian taps **Approve** → kid device activated and/or the **new (kid, assigner) account is provisioned**; kid notified "You're in!".

### Unhappy paths
- **Guardian unavailable** → request stays **pending**; kid sees "waiting"; reminder re-notifies after a delay.
- **Guardian rejects** → device blocked; kid sees gentle "Ask your parent for help".
- **Repeated rejected attempts** → flag as **suspicious**; offer guardian a "block this device" action.
- **Approval tapped by a non-owner co-parent (Approver-only)** → allowed only if their scope includes this kid; otherwise hidden.

### Security/safety checks
- **Default-deny**: pending = no access.
- Approvals/rejections are **audit-logged** with device + actor.
- Coarse-only location (never precise tracking of a child).
- Re-approval required when a **new device** appears (not just first ever).

---

## 6. Creating and assigning tasks

**Goal:** An assigner (any adult role) creates a task with points, deadline, and optional late-decay, then assigns it to one or more kids/students.

### Happy path
1. Dashboard → **New task**.
2. Fill: **title**, optional description/photo-proof requirement, **point value**, **deadline/schedule**, optional **late-decay rule** entered as **two numbers** — **points to reduce** and **minutes interval** (e.g., reduce **1 pt every 5 min** after due).
3. Choose **assignees** (one or many kids/students the assigner can access).
4. (Optional) require **proof on completion** (photo/checkbox).
5. **Publish** → each assignee's kid view shows the new task with **who assigned it**.

| Field | Required | Notes |
|---|---|---|
| Title | Yes | Kid-readable, short |
| Points | Yes | Tied to kid's currency rule for preview |
| Deadline | No | Enables decay logic if set |
| Late decay | No | Two numbers: **points to reduce** + **minutes interval** (reduce X pts every Y min late); capped so points can't go below 0 |
| Proof required | No | Photo or simple confirm |
| Assigner label | Auto | **Always shown** — assigner owns approval |

### Unhappy paths
- **No assignee selected** → block publish with inline hint.
- **Deadline in the past** → warn; allow only as "due now".
- **Decay makes points ≤ 0** → floor at 0; show preview of minimum earnable.
- **Invalid decay inputs** → either decay field blank/zero means **no decay**; reject non-positive or non-integer `points`/`minutes` with an inline hint.
- **Assigner edits a task after kid completed it** → completed instances **freeze** their terms; edits apply to future only (prevents moving the goalposts).
- **Assigner lacks access to a chosen kid** → that kid is not selectable.

### Security/safety checks
- **Assigner identity stamped** on every task (accountability + approval routing).
- Photo-proof uploads are **private to the assigner/guardians**, not public.
- Decay rules are **bounded** (no punitive negative balances).
- Bulk-assign respects each role's **access scope**.

---

## 7. Kid completing a task

**Goal:** A kid marks a task done (optionally with proof) and submits it for the assigner's approval.

### Happy path
1. Kid view → **My tasks** → tap a task → **Mark done**.
2. If proof required → take photo / confirm checklist.
3. Submit → task moves to **Waiting for approval**; assigner notified.
4. Kid sees encouraging confirmation ("Great job! Waiting for [Assigner] to confirm").

### Unhappy paths
- **Marked done past deadline** → show **adjusted points preview** from decay; still submit.
- **Proof upload fails (no signal)** → save locally, **retry/queue**; don't lose the kid's effort.
- **Kid taps done by mistake** → allow **undo** while still pending.
- **Kid spams completions** → rate-limit; assigner sees one pending item per task.

### Security/safety checks
- Kid **cannot self-grant points**; completion is only a **request**.
- Proof media stored privately; auto-expire per retention policy.
- No free-text that broadcasts to others (limits grooming/contact surface in MVP).

---

## 8. Parent / assigner confirming completion → granting points

**Goal:** The **assigner** reviews a completion request and approves (grant points) or rejects (with reason).

### Happy path
1. Assigner gets **push + approval card**: task, kid, optional proof, points (with any decay applied).
2. **Approve** → points credited to that kid's **ledger** under that assigner's "account"; kid notified with celebration.
3. Ledger entry records: task, points, assigner, timestamp.

### Unhappy paths
- **Reject** → require a **kid-friendly reason** template ("Not finished yet", "Try again"); task returns to **To-do**, not deleted.
- **Partial credit** → assigner may grant adjusted points with a note (optional MVP+).
- **Wrong approval** → assigner can **reverse within a window**; reversal is logged and kid is gently notified.
- **Co-parent tries to approve another assigner's task** → blocked; only the **assigner** approves (clear message).

### Security/safety checks
- **Only the assigner** can confirm their own task's completion (enforced + shown in UI).
- Every grant/reject/reversal is **audit-logged**.
- Rejection UX is **non-punitive** and encouraging (child wellbeing).
- Points are **scoped per assigner-account** so balances stay attributable (multi-"account" model).

---

## 9. Granting bonus / gift points

**Goal:** An assigner rewards something great that wasn't a listed task.

### Happy path
1. Kid profile → **Give bonus points** → amount + short reason.
2. Confirm → points credited under that assigner's account; kid gets a delightful "Surprise reward!".

### Unhappy paths
- **Accidental large amount** → confirmation step + **undo window**.
- **Over-gifting / inflation** → optional soft cap or weekly summary so guardians notice patterns.

### Security/safety checks
- Bonus grants are **logged with reason + actor**.
- Reversible within a window; reversal logged.

---

## 10. Redeeming / deeming points after a real-world payment (two-step: assigner initiates → kid confirms)

**Goal:** After an assigner gives the kid **real money/gift offline**, they mark the matching points **redeemed/deemed** so the in-app ledger reflects reality. **No money moves through the app.** Redemption is **not instantly final**: the assigner **initiates**, the points are **held** (`pending redemption confirmation`), the **kid confirms** to complete it, and the kid's **parent is notified at each step** and can see an **event log**. This holds **regardless of which assigner** (parent/co-parent/teacher/moderator) initiated it.

### Happy path
1. **Assigner initiates:** Assigner → kid → **Redeem points**.
2. App shows the account's **available earned balance** (excluding any amount already held by a pending redemption) and a **conversion preview** using the kid's currency rule (e.g., 20 pts ≈ 10 USD).
3. Assigner enters **how many points** to redeem — **all or part** of the available earned balance (any amount from **1 up to the available max**) + **outside method** (cash/gift/other) + optional note. The converted value updates live as the amount changes.
4. **Confirm "I have paid this offline"** (explicit attestation) → the redemption is created with status **`pending confirmation`**; that amount is **held** (reserved against earned, **not** yet counted as redeemed). The **kid is prompted to confirm**; the kid's **parent(s) are notified ("redemption initiated")**; an **event-log entry** is appended.
5. **Kid confirms:** Kid sees a **Confirm / Decline** card ("[Assigner] is redeeming 20 points (≈10 USD) — did you receive it?") → **Confirm** → status becomes **`redeemed`/completed**: the hold settles into a `redeem` ledger entry, the account's **earned decreases and redeemed increases** by the amount (a partial redemption leaves the remainder intact). Parent(s) notified ("completed"); kid sees it in history ("You cashed out 20 points for a reward 🎉").

| UI element | Purpose |
|---|---|
| Available earned max | Shows how many points can be redeemed (full or partial), **excluding held/pending amounts** |
| Amount entry | Assigner picks full or partial; validated `1 ≤ amount ≤ available earned` |
| Conversion preview | Transparency; matches kid's currency rule; updates with the amount |
| Offline-payment attestation | Reinforces app is **not** a payment processor |
| **Status badge** | Distinguishes **"pending confirmation"** vs **"redeemed"** wherever the redemption appears |
| **Kid confirm/decline card** | Two-step gate — redemption is final only after the kid confirms |
| **Parent event log** | Kid, initiating assigner, amount, money value, timestamp, status — visible to the kid's parent(s) |
| Redemption note | Audit + dispute resolution |

### Unhappy paths
- **Redeem more than balance** → blocked; show available max (held/pending amounts already excluded).
- **Amount below 1 / non-integer / empty** → blocked with inline validation; nothing is recorded or held.
- **Partial redemption** → allowed; remaining earned balance stays in the account for a future redemption.
- **Kid declines** → status becomes **`declined`**; the **held amount is released** back to available earned; nothing is redeemed; **parent(s) notified ("declined")** and the event is logged.
- **Kid never confirms (expiry)** → after the confirmation window, the pending redemption **expires** and is treated like a decline: **hold released**, nothing redeemed, parent(s) notified, event logged.
- **Held balance during pending** → the held amount **cannot be re-redeemed or double-spent** while pending; it reduces the redeemable balance until the kid confirms or it is released.
- **Mis-clicked initiation** → assigner can **cancel a pending redemption** before the kid confirms (releases the hold); a *completed* redemption is corrected by **reversal within a window** (offsetting entry; logged; kid + parent notified).
- **Dispute ("I didn't get my money")** → the kid's confirm/decline + immutable ledger + parent event log provide a **shared truth**; no in-app money to claw back.
- **Currency rule changed mid-stream** → redemption uses the **rule at time of initiation**, snapshotted and shown explicitly.

### Security/safety checks
- App **never** processes funds (avoids regulated-payment positioning — see founder constraint #6). *(Legal/regulatory review recommended before any real-money features.)*
- **Two-step confirmation** (assigner initiates → kid confirms) + immutable ledger + parent event log create a **dispute-resistant record**; held points are never counted as both available and redeemed.
- The kid's **parent is notified on every lifecycle event** and sees an **event log** for **any** of their kids, regardless of which assigner initiated the redemption; the log exposes **redemption-lifecycle records only** (not another assigner's task management).
- Redemptions are **per assigner-account** (a teacher can't redeem a parent's points and vice-versa).

---

## 10a. Viewing redemption history

**Goal:** Each party can review what was settled offline. **Every assigner sees their own redemption history; a parent sees a consolidated redemption history for each of their kids across ALL assigners** (a full cross-assigner picture), regardless of who redeemed. Kids see a friendly version of their own.

### Happy path (assigner — own history)
1. Assigner → kid → account → **Redemption history**.
2. List shows their own redemptions: points redeemed, **value at the time** (snapshot), method note, date — newest first.
3. Filter by date range; tap a row for detail (note, snapshotted valuation, any reversal).

### Happy path (parent — across all assigners)
1. Parent → kid → **Redemption history (all sources)**.
2. List shows **every** redemption on that kid across **all** assigners' accounts, grouped/filterable by **assigner**, **date**, and **amount**; each row shows **who redeemed**, points, snapshotted value, and method note.
3. Differing currencies are **labeled per row and per-currency subtotaled — never summed across currencies**.

| UI element | Purpose |
|---|---|
| Source/assigner label | Shows which assigner redeemed (parent cross-assigner view) |
| Snapshotted value | Value at redemption time (immune to later rate changes) |
| Filters (date/assigner/amount) | Navigate long histories |
| Reversal indicator | Transparently shows corrected/reversed redemptions |

### Unhappy paths
- **No redemptions yet** → friendly empty state ("No rewards cashed out yet").
- **Reversed/corrected redemption** → shown transparently with its offsetting entry, never silently removed.
- **Parent opens cross-assigner view** → sees **redemption records only**, not another assigner's private task management (scope boundary).
- **Mixed currencies across assigners** → grouped and labeled per currency; no cross-currency total.

### Security/safety checks
- Redemption history is a **read over the append-only ledger** (no edits); reversals are new entries.
- Parent cross-assigner visibility is scoped to **redemption records**, preserving each assigner's task privacy.
- No figure implies pooled, in-app money — values are **snapshotted offline estimates**.

---

## 10b. Switching active role (multi-role adult)

**Goal:** A single adult identity that holds more than one role (e.g., **Parent** to their kids **and** Teacher to their students) switches the **active role**; people, tasks, dashboards, and approvals re-scope to that role. One account, multiple role contexts.

### Happy path
1. Adult with multiple roles opens the **account/role menu** → **Switch role**.
2. Picks an active role (e.g., **Teacher**) → app re-scopes to that role's people (students) and tasks; the previous role's kids are no longer in view.
3. Switching back to **Parent** restores the parent scope. The last active role is remembered for next launch.

### Unhappy paths
- **Adult has only one role** → no switcher shown (no clutter).
- **Switch mid-flow** (e.g., while drafting a task) → confirm to discard/keep the draft; the draft stays bound to the role it was started in.
- **Action attempted on a person outside the active role** → not selectable/visible (scope follows the active role).

### Security/safety checks
- **No cross-role data bleed:** every people/task/approval query is scoped by the **active role + relationship**, never the union of roles.
- Role switching is an **explicit** action (never an accidental toggle), keeping role contexts clearly separated.
- Switching role changes **scope only**, not identity — the audit log still attributes actions to the one underlying user (with the acting role recorded).

---

## 11. Teacher joining independently

**Goal:** An individual teacher/coach creates a standalone account (no school).

### Happy path
1. Get started → role **Teacher** → register + verify factor + **MFA** + accept terms (incl. child-safety acknowledgment).
2. Land on teacher dashboard, empty state: *Connect with a guardian to add a student*.
3. Teacher **requests to connect** to a kid via a **guardian-approved invite** (teacher cannot add a child unilaterally).

### Unhappy paths
- **Teacher tries to create a kid profile directly** → not allowed; kid ownership stays with guardians (A1). Teacher must be **granted scoped access**.
- **Guardian doesn't approve connection** → no student access; request expires.
- **Unverified teacher** → cannot send connection requests until verified + MFA.

### Security/safety checks
- Teachers get **scoped, guardian-approved** access only — never ownership.
- Same child-safety acknowledgment + MFA gate as guardians.
- Independent (non-school) teachers may be **rate-limited** on how many guardian connection requests they can send (anti-abuse).

---

## 12. Teacher joining under school moderation

**Goal:** A teacher operates under a school's **moderator/admin** governance for safety and oversight.

### Happy path
1. Teacher receives a **school invite** (from a Moderator, see §13) → accepts → account is **associated** with the school tenant.
2. Teacher's activity (student connections, tasks) is **visible to the moderator** for oversight.
3. Teacher connects to students via **guardian-approved** consent **and** within moderator policy.

### Unhappy paths
- **Teacher already independent** → offer to **link** existing account to the school (preserve history) vs create new.
- **Teacher leaves school** → moderator can **disassociate**; teacher's school-scoped student access ends; guardians notified.
- **Policy conflict** (school disallows an action) → moderator policy **overrides** teacher within that tenant.

### Security/safety checks
- **Moderator oversight** of teacher activity and associations (safeguarding).
- Guardian consent is **still required** for each child — school context does **not** bypass guardian approval.
- Disassociation revokes school-scoped access **immediately** and is logged.

---

## 13. Moderator inviting a teacher

**Goal:** A school's moderator/admin onboards teachers into governed access.

### Happy path
1. Moderator dashboard → **Invite teacher** → enter email + **role/permission template** + scope (classes/groups).
2. Single-use, expiring invite sent.
3. Teacher accepts → appears in moderator's **teacher roster** with status + activity visibility.

### Unhappy paths
- **Invite to wrong person** → revoke before/after acceptance.
- **Teacher declines** → moderator notified; logged.
- **Bulk invites** → respect rate limits; show pending vs accepted clearly.

### Security/safety checks
- Moderator can **review, suspend, or revoke** teacher access and **audit activity**.
- Invites are scoped, single-use, expiring.
- All moderator actions on teachers/students are **audit-logged** (governance trail).

---

## 14. Teacher assigning student tasks

**Goal:** A teacher (independent or school-moderated) assigns tasks to students they have **approved** access to.

### Happy path
1. Teacher dashboard → **New task** → same task editor as §6 (title, points, deadline, optional decay/proof).
2. Assignees limited to **students the teacher is connected to** (guardian-approved; within moderator scope if school).
3. Publish → student sees task **labeled with the teacher's name** as assigner.
4. Teacher later **confirms completion** and may **redeem** points under the **teacher's account** for that kid.

### Unhappy paths
- **Teacher tries to assign to a non-connected kid** → not selectable.
- **School policy caps points/value** → editor enforces caps; explains why.
- **Guardian revokes the connection mid-task** → open tasks are **frozen/hidden**; guardian/kid notified; no orphaned approvals.
- **Moderator flags a task as inappropriate** → task can be **paused/removed**; teacher notified with reason.

### Security/safety checks
- Teacher tasks live under the **teacher's assigner-account** (separate from parent points — the "multiple bank accounts for the same kid" model).
- Guardian consent governs the relationship; revocation cascades safely.
- Moderator (if school) can oversee/intervene; all interventions logged.

---

## 15. Cross-journey safety & trust matrix (summary)

| Risk | Where it appears | UX/Control |
|---|---|---|
| Stranger linking to a child | §4 QR, §5 approval | Expiring single-use QR + mandatory guardian approval + device fingerprint; **new per-assigner account only created on approval, never on scan** |
| Cross-role data exposure (multi-role adult) | §10b role switch | All people/task/approval queries scoped by **active role + relationship**; explicit switcher; no union-of-roles view |
| Over-reach into another assigner's data | §10a parent redemption history, §10 parent event log | Parent cross-assigner view + redemption event log limited to **redemption-lifecycle records only**, not others' task management |
| Unilateral / disputed redemption | §10 two-step redemption | **Kid must confirm**; points **held** (not redeemed) until then; kid can **decline**; unconfirmed **expires**; **parent notified on every event** + sees an event log |
| Pre-login role spoofing | §1 home-screen role choice | Pre-login role is a **scope hint only**, **re-validated server-side** against actual memberships after auth; never grants an unheld role |
| Credential exposure to kids | §4 onboarding | Kids never handle adult credentials; no password on kid device |
| Self-granted points / gaming | §7–§8 | Completion is a **request**; only assigner grants; decay bounded; reversals logged |
| Wrong person approving | §8, §13 | Approval scoped to **assigner**; role/scope checks; hidden if not permitted |
| Account takeover | §1, all | MFA required before child data; lockouts; anti-enumeration |
| Over-collection of child data | §3 | Data minimization; nickname over legal name; moderated preset avatars |
| Co-parent / custody conflict | §2 | Least-privilege scopes; revocable; last-guardian protected; D-001 |
| Misuse of teacher access | §11–§14 | Guardian-approved scope only; moderator oversight; rate limits; revocation cascade |
| "App moved my money" confusion | §10 | Explicit offline-payment attestation; app never processes funds |
| Punitive UX harming a child | §8 | Encouraging rejection templates; no negative balances; celebration on success |
| Lost device | §4–§5 | Remote unbind/revoke by guardian |
| Audit gaps / disputes | all | Immutable audit log for every adult action on a child account |

---

## 16. Notifications emitted per journey (quick reference)

| Journey | Key notifications |
|---|---|
| Registration | Verify factor, MFA enabled |
| Invite co-parent | Invite sent/accepted/declined/revoked |
| QR onboarding | Pairing request, device approved/rejected, **new assigner connected / per-assigner account created** |
| First login | Approval needed, approved/rejected, suspicious attempt |
| Create/assign task | New task assigned (to kid) |
| Kid completes | Completion submitted (to assigner) |
| Confirm completion | Approved/rejected, points granted (to kid) |
| Bonus points | Surprise reward (to kid) |
| Redeem/deem (two-step) | **Redemption initiated / pending confirmation** (to kid + parent), **confirm/decline prompt** (to kid), **kid-confirmed/completed** (to kid + parent), **declined/expired** (to parent) |
| Teacher join (school) | School invite, association/disassociation |
| Moderator invite | Teacher invited/accepted/revoked |

> **Notification UX principle:** batch low-urgency items, make **approvals** prominent and actionable inline, and never send a child notifications that expose another user's contact details. (Full notification UX patterns in `05-ux-ui-guidance.md`.)

---

## 17. Open UX questions for the founder

1. **Consent age & flow** — what guardian-consent gate applies per launch region? (drives §1/§3/§11 copy and gating).
2. **Reversal windows** — how long can approvals/redemptions be reversed before they lock?
3. **Co-parent custody disputes** — should there be a formal "transfer/escalate ownership" flow beyond least-privilege scopes? (see D-001).
4. **Proof media retention** — default retention period for completion photos.
5. **Independent teacher trust** — is any verification/vetting required for non-school teachers before guardian connection?

---

*Companion document: `docs/05-ux-ui-guidance.md` (information architecture, dashboards, accessibility, RTL, notification & trust-safety patterns, sample MVP screens).*
