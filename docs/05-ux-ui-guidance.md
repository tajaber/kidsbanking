# 05 — UX / UI Guidance

**Owner:** Caldwell (UX Strategist)
**Source:** `prompts/p-260623-prototype.md` §9 (UX / UI guidance)
**Scope:** Information architecture, navigation, role dashboards, child-friendly UX, accessibility, safe visual design, RTL & localization, notification UX, trust & safety patterns, and sample MVP screens.
**Standing constraints honored:** solo/bootstrapped founder (lean, low-cost), region-agnostic, internal execution plan only.

> **Design north star:** *Trustworthy for adults, delightful and safe for kids.* Adults need control, accountability, and clarity (who assigned what, who approves, what's owed offline). Kids need encouragement, simplicity, and zero exposure to risk (no strangers, no credentials, no money handling).

---

## 1. Information architecture (IA)

KidsBank is **role-first**: the same person never sees two role UIs at once. Pick role → enter that role's IA. **A single identity may hold several roles** (e.g., Parent *and* Teacher) and **switch the active role**; even then only **one** role's IA is shown at a time (the active role), so scope never blends.

### 1.1 Top-level IA by role

| Role | Primary sections |
|---|---|
| **Parent / Co-Parent** | Home (overview) · Kids · Tasks · Approvals · Redeem · Family (co-parents) · Settings |
| **Kid** | My Tasks · My Points · Rewards/History · (no settings beyond avatar/theme) |
| **Teacher** | Home · Students · Tasks · Approvals · Redeem · Settings (school link if any) |
| **Moderator** | Home · Teachers · Students (oversight) · Activity/Audit · Policies · Settings |

### 1.2 IA principles

- **Separate the four mental models:** *manage children*, *manage tasks*, *act on approvals*, *settle value offline (redeem)*. These are the four jobs adults return for.
- **Assigner is always visible.** Anywhere a task appears, show **"Assigned by [name/role]"**. The assigner is the accountable approver/redeemer.
- **Per-assigner ledgers ("multiple bank accounts for one kid").** A kid's points are grouped by assigner-account. The kid sees a combined total **and** a per-source breakdown.
- **Progressive disclosure.** Advanced options (late-decay, currency rules, scopes) are collapsed by default.
- **Empty states teach.** Every empty screen contains the next best action.

### 1.3 Sitemap (text)

```
App
├─ Role chooser (Parent / Co-Parent / Kid / Teacher / Moderator) — **pre-login role choice for multi-role identities; sets initial post-login scope (re-validated after auth)**
├─ Auth (register, login, MFA, recovery)
├─ Parent/Co-Parent
│  ├─ Home (summary cards)
│  ├─ Kids → Kid detail (ledger, devices, tasks)
│  ├─ Tasks → Task editor
│  ├─ Approvals (pending completions)
│  ├─ Redeem (offline settlement)
│  ├─ Family (co-parent invites/scopes)
│  └─ Settings (profile, MFA, currency rules, language/RTL, notifications)
├─ Kid
│  ├─ My Tasks (to-do / waiting / done)
│  ├─ My Points (total + per-source)
│  └─ Rewards & History
├─ Teacher (Students instead of Kids; same task/approval/redeem)
└─ Moderator (Teachers, oversight, audit, policies)
```

---

## 2. Navigation recommendations

| Surface | Pattern | Rationale |
|---|---|---|
| **Mobile (all adult roles)** | Bottom tab bar (Home · Tasks · Approvals · Redeem · More) | Thumb-reachable; approvals deserve a permanent slot |
| **Mobile (kid)** | Large bottom tabs (Tasks · Points · Rewards) — 3 max | Fewer choices, bigger targets |
| **Web dashboard (adults)** | Left sidebar nav + top context bar (current kid/class, language switch) | Dense management work suits a sidebar |
| **Approvals** | Persistent badge count + inline approve/reject | Reduce time-to-approval; the core loop |
| **Role switching** | Explicit **active-role switcher** in the account menu (shown only when an identity holds >1 role) | One login can be Parent *and* Teacher; switching re-scopes people/tasks to the active role. Explicit, never an accidental toggle, to prevent cross-role exposure |
| **Pre-login role choice** | **Role chooser on the home/landing screen, before auth** (multi-role identities pick the role to sign in as) | Sets the initial post-login scope; a scope **hint** re-validated server-side after auth; single-role users skip it |

**Rules of thumb**
- **≤5 primary destinations** per role on mobile.
- **Approvals are never buried** — always one tap from Home with a live badge.
- **Redeem is distinct from Approve** (different mental model: settling offline value vs confirming work).
- Breadcrumbs on web for deep task/kid drilldowns.

---

## 2a. Key interaction patterns (new prototype requirements)

These five patterns implement the founder's new requirements. Build them as reusable components.

### 2a.1 Active-role switcher (multi-role identity)
- **Where:** account/profile menu; a compact role pill in the top bar on web.
- **Behavior:** shown **only** when the signed-in identity holds more than one role. Selecting a role (e.g., **Parent → Teacher**) re-scopes the whole app — people list (kids vs students), dashboards, tasks, approvals — to that **active role**. The last active role is remembered.
- **Safety:** an **explicit** choice, never an accidental toggle; a clear current-role label is always visible so adults know "which hat" they're wearing. No screen ever shows a union of roles; scope follows the active role only.
- **Empty/edge:** single-role users see no switcher (no clutter); switching mid-draft prompts to keep/discard, and a draft stays bound to the role it began in.

### 2a.2 Name search — reveal after 3 characters
- **Where:** top of any people list (Parent's **Kids**, Teacher's **Students**).
- **Behavior:** a search field that **does nothing until the 3rd character** is typed (**min 3 chars**); from the 3rd character on, the list **filters live** as the user types. Below 3 characters, show the full, unfiltered list (with a hint like "Type 3+ letters to search").
- **Scope & safety:** searches only the **active role's** people; never returns anyone outside scope. Duplicate names are disambiguated by avatar/initial.
- **States:** <3 chars → full list + hint; ≥3 chars, matches → filtered list; ≥3 chars, no match → friendly empty state ("No one matches '…'").

### 2a.3 Redemption history view
- **Assigner (own):** kid/account → **Redemption history** → reverse-chronological list of *their* redemptions: points redeemed, **value at the time** (snapshot), method note, date; filter by date.
- **Parent (cross-assigner):** kid → **Redemption history (all sources)** → every redemption on that kid across **all** assigners, grouped/filterable by **assigner**, date, amount; each row shows **who redeemed**. Mixed currencies are **labeled per row / per-currency subtotaled, never summed**.
- **Kid:** a celebratory timeline of their own cash-outs (no money pressure).
- **Safety:** read-only over the append-only ledger; the parent view shows **redemption records only**, not another assigner's task management; values are **offline-value snapshots**, never in-app funds.

### 2a.4 Parent overall account picture
- **Where:** Parent → kid detail → **Overall picture** tab.
- **Shows:** each assigner's account for that kid (earned / pending / redeemed + that account's **value-if-redeemed**), a **per-kid grand total of points**, and a **per-kid total value-if-redeemed**.
- **Safety:** clearly **read-only and not a pooled/redeemable balance**; group/label by **currency** (no cross-currency sums); label money as an **estimate of offline value**.

### 2a.5 Any-assigner QR scan → new account
- **Kid side:** **I'm a Kid → Scan code** works for **any** assigner's QR (parent, co-parent; teacher/mod Later). On a guardian's approval, the kid gains a **new per-assigner account** and sees that assigner's tasks; re-scanning a known assigner is idempotent ("You're already connected to [assigner]").
- **Guardian side:** the approval card names the **issuing assigner** and states that approving **creates a new account** for the kid; nothing is created until approval.
- **Safety:** account creation is **gated by approval, never automatic on scan**; new assigner = new isolated account (balances never pool).

### 2a.6 Two-step redemption (assigner initiates → kid confirms)
- **Assigner (initiate):** the **Redeem** flow ends by creating a **`pending confirmation`** redemption — the amount is **held**, not yet redeemed. Confirmation copy: "Sent to [kid] to confirm." The held amount is **excluded from the available-to-redeem balance** shown next time.
- **Status badges:** everywhere a redemption appears (assigner history, kid timeline, parent log), show a clear badge — **🕓 Pending confirmation** vs **✅ Redeemed** (and **✖ Declined**). Use color + icon + text (not color alone) for accessibility and RTL.
- **Kid confirm screen:** a prominent **Confirm / Decline** card — "[Assigner] is redeeming **20 points (≈10 USD)** — did you receive your reward?" with two clear actions. Child-friendly, celebratory on confirm ("Nice! 🎉"); a calm, non-punitive path on decline. Pending items sit in the kid's inbox until resolved or expired.
- **Parent notification + event log:** the kid's parent(s) get a **notification on every event** (initiated, completed, declined) and a **Redemption event log** view listing **kid · initiating assigner · amount · money value (snapshot) · timestamp · status** — for **any** of their kids, regardless of which assigner initiated. Read-only; **redemption-lifecycle records only** (never another assigner's task data).
- **Edge/empty:** a pending redemption can be **cancelled by the assigner** before the kid confirms (releases the hold); unconfirmed redemptions **expire** after a window (shown as Declined/Expired); never display held points as both available and redeemed.

### 2a.7 Pre-login role chooser (home/landing screen)
- **Where:** the **first screen** (before authentication). A multi-role adult (e.g. **Parent + Teacher**) picks **which role to sign in as** — e.g. *Continue as Parent* / *Continue as Teacher* — setting the **initial post-login scope**. This complements the in-app active-role switcher (2a.1).
- **Behavior:** single-role identities **skip** the chooser and go straight to auth; the last-used choice may be remembered. After login the current-role label remains visible so adults know "which hat" they're wearing.
- **Safety:** the pre-login choice is a **scope hint only** — entitlement is **re-validated server-side** against the user's actual memberships after auth; the UI must never imply the choice itself grants access to a role the user doesn't hold.

---

## 3. Dashboard ideas by role

### 3.1 Parent / Co-Parent dashboard

**Goal:** at-a-glance family status + the day's required actions.

| Card / module | Shows |
|---|---|
| **Action needed** | Pending approvals + first-login approvals (count + inline action) |
| **Kids strip** | Each kid: avatar, current points, this-week earned. **Name search** above the list (filters after 3+ chars) |
| **Points summary** | Earned vs redeemed (this week/month), pending **(incl. points held by pending redemptions)** |
| **Per-kid overall picture** | Each kid's accounts across **all assigners** — per-assigner balances, per-kid total points, per-kid value-if-redeemed (read-only, grouped by currency) |
| **Redemption event log** | Every redemption event on the parent's kids (any assigner): **status badge** (pending/redeemed/declined), initiating assigner, amount, money value, timestamp — driven by lifecycle notifications |
| **Redemption history** | This kid's redemptions across **all** assigners (who redeemed, points, snapshotted value) |
| **Recent activity** | Task completed, points granted, redemptions — with assigner labels |
| **Quick actions** | New task · Add bonus · Redeem · Invite co-parent |
| **Setup checklist** (new users) | Add kid → create task → connect device |

Co-parent view is identical but **scoped** to permitted kids and **read-only badges** where their scope is View/Approver-only.

### 3.2 Kid dashboard

**Goal:** motivate; make "what do I do next" obvious; celebrate progress.

| Module | Shows |
|---|---|
| **Big points number** | Total points, with a friendly mascot/progress visual |
| **Today's tasks** | Simple cards: title, points, "who gave me this", Do/Done |
| **Waiting** | Tasks submitted, "Waiting for [Assigner]" |
| **Confirm rewards** | **Pending redemptions to confirm/decline** ("[Assigner] is redeeming 20 pts — did you get it?") — the kid's half of the two-step flow |
| **My rewards** | Redemption history as a fun timeline, with **pending / redeemed / declined** badges |
| **Per-source chips** | Points from Mom / Dad / Teacher (the multi-account view, kid-friendly) |

No money figures forced on kids; show **points** primarily, with a soft "worth about…" only if a guardian enables it.

### 3.3 Teacher dashboard

**Goal:** manage a class of connected students and the task/approval loop.

| Module | Shows |
|---|---|
| **Action needed** | Pending student approvals |
| **Students** | Connected (guardian-approved) students, grouped by class/group |
| **Tasks** | Active assignments, completion rates |
| **Redeem** | Settle teacher-account points offline |
| **School status** | If under moderation: school name + policy banner |

### 3.4 Moderator dashboard

**Goal:** safeguarding oversight and governance — not day-to-day teaching.

| Module | Shows |
|---|---|
| **Teachers** | Roster, status (active/suspended), recent activity |
| **Oversight feed** | New student connections, flagged tasks, anomalies |
| **Audit / Activity** | Searchable log of teacher actions on students |
| **Policies** | Point caps, allowed actions, content rules per tenant |
| **Alerts** | Suspicious patterns (e.g., excessive connection requests) |

---

## 4. Children-friendly UX best practices

- **Reading-light:** rely on **icons + color + short words**; support pre/early-reader kids (icons + optional audio labels).
- **Big tap targets** (min ~48dp), generous spacing, no tiny controls.
- **One primary action per screen** for kids; avoid dense menus.
- **Positive reinforcement:** celebrate completion (animation, mascot, sound that can be muted). **Never shame** late/rejected tasks — use "Try again!" framing.
- **No open-ended input/chat in MVP** (limits contact/grooming risk). Use templated, safe interactions only.
- **No dark patterns / no pressure:** no fake urgency, no manipulative streak-guilt. Motivation, not addiction.
- **Predictable & calm:** consistent layouts, gentle transitions, avoid sensory overload.
- **Time-aware:** optional gentle "wind-down" / no aggressive late-night nudges to kids.
- **Kids can't see adult data:** no balances of others, no contact info, no settings that affect safety.

---

## 5. Accessibility recommendations

| Area | Guidance |
|---|---|
| **Contrast** | Meet WCAG 2.1 AA (≥4.5:1 text; ≥3:1 large text/icons). |
| **Don't rely on color alone** | Pair color with icon/label (status, points up/down). |
| **Text scaling** | Respect OS dynamic type; layouts reflow, no clipping. |
| **Touch targets** | ≥44–48px, adequate spacing; forgiving hit areas for kids. |
| **Screen readers** | Label all controls; meaningful order; announce approvals/celebrations politely. |
| **Motion** | Honor "reduce motion"; celebrations have a calm fallback. |
| **Audio** | All sound optional/mutable; never required to understand state. |
| **Captions/alt** | Alt text for avatars/illustrations; captions if any audio cues. |
| **Cognitive load** | Plain language, short steps, clear progress. |
| **Focus & errors** | Visible focus states; inline, specific, kind error messages. |

> Accessibility doubles as child-friendliness: large targets, clear language, and non-color cues help both groups.

---

## 6. Safe visual design principles

- **Calm, friendly, non-commercial palette.** Avoid casino/gambling cues (no slot-machine spins, no flashing jackpots) — this is reward *motivation*, not gambling.
- **Points ≠ cash visuals for kids.** Use stars/coins/badges metaphor; keep real-currency framing in **adult** surfaces.
- **Clear role theming.** Subtle visual distinction per role so adults always know "which hat" they're wearing; bright/playful for kids, calmer/utilitarian for adults.
- **Trust signals visible to adults:** assigner labels, audit/"history" affordances, approval requirements, MFA status.
- **No third-party ads or external links in kid surfaces** (MVP).
- **Moderated imagery only:** preset avatars/illustrations, no free uploads in kid-facing areas (MVP).
- **Consistent iconography** for the core verbs: assign, complete, approve, reject, grant, redeem.

---

## 7. RTL & localization UX requirements

KidsBank must support **multiple languages, currencies, and LTR + RTL** layouts.

| Requirement | Guidance |
|---|---|
| **Full RTL mirroring** | Mirror layout, navigation, icons with direction (arrows, progress, back) across **every screen**. Don't mirror inherently non-directional icons (e.g., a clock face) or brand marks. |
| **Real, complete Arabic** | The prototype now ships **real, complete Arabic translations for ALL UI text** (every label and flow — not a token subset), with a **language toggle** that flips the **entire UI** to RTL. This is the reference proof that the i18n + RTL pipeline works end-to-end. |
| **Logical layout** | Build with start/end (not left/right) so LTR↔RTL flips automatically. |
| **No hard-coded strings** | All copy from resource files; support pluralization & gender where languages need it. |
| **Expansion space** | Allow ~30–40% text growth; avoid truncation; no text baked into images. |
| **Numerals & dates** | Locale-aware number, date, and currency formatting. |
| **Currency display** | Show per-kid currency rule consistently (symbol + code, e.g., "AED"/"USD"); points are universal, money formatting is localized. |
| **Bidi safety** | Handle mixed LTR/RTL (e.g., a Latin name in Arabic UI) with proper isolation. |
| **Language switch** | Easy, discoverable switch; remember per-account; allow per-device for shared family tablets. |
| **Fonts** | Bundle fonts covering target scripts; verify kid-friendly legibility per script. |

**Assumption (A2/region-agnostic):** no default language/currency is assumed; the founder configures launch locales. Design and copy must be **localization-ready from day one** — and the prototype goes further by shipping **complete real Arabic with full-UI RTL** (not just a subset), even though additional languages follow demand.

---

## 8. Notification UX

Notifications are the connective tissue of the approval loop (see `04-user-journeys.md` §16). They must be **timely, actionable, and safe**.

### 8.1 Principles

- **Actionable inline.** Approval pushes deep-link straight to the approve/reject card.
- **Prioritize, don't spam.** Tier notifications: **Action-required** (approvals, first-login) > **Status** (points granted, redeemed) > **Nudges** (reminders).
- **Batch low-urgency.** Group "task completed" digests where possible to fight fatigue.
- **Respect quiet hours / per-type settings.** Adults choose channels (push/email) per type; kids get minimal, gentle notifications.
- **Safety in content.** Never expose another user's email/phone in a notification; kid notifications never reveal contact info or invite outside contact.
- **First-login & suspicious attempts are high-signal** and always surfaced to guardians.
- **Per-role tailoring:** Parents → approvals/redemptions; Teacher → student completions; Moderator → oversight/anomaly alerts.

### 8.2 Notification types (MVP)

| Type | Audience | Tier |
|---|---|---|
| Approval needed (completion) | Assigner | Action |
| First-login / new device | Guardians | Action |
| Co-parent / teacher invite | Invitee/inviter | Action |
| Points granted / redeemed | Kid (+guardians) | Status |
| **Redemption initiated (pending confirmation)** | **Kid (+ parent)** | **Action (kid: confirm/decline) / Status (parent)** |
| **Redemption completed / declined / expired** | **Kid (+ parent)** | **Status** |
| Task assigned | Kid | Status |
| Deadline reminder | Kid (gentle) | Nudge |
| Suspicious attempt | Guardians/Moderator | Action |

---

## 9. Trust & safety UX patterns

These patterns make safety **visible and habitual**, not hidden in settings.

| Pattern | Where | What the user sees |
|---|---|---|
| **Default-deny gating** | Kid device pairing/login | "Waiting for parent approval" — nothing works until approved |
| **Approval cards** | Adult home | Inline approve/reject with context (device, proof, assigner) |
| **Assigner accountability label** | Every task | "Assigned by [name] — they confirm & reward" |
| **Least-privilege chooser** | Co-parent/teacher invite | Clear scope options with plain-language descriptions; safest default highlighted |
| **Revoke/unbind controls** | Kid devices, co-parents, teachers | One-tap revoke; immediate effect; confirms it's logged |
| **Audit/history affordance** | Kid detail, redemptions | "History" view of every adult action (transparency, dispute-proofing) |
| **Active-role scoping** | Role switcher | Explicit active-role label; people/tasks scoped to the active role only (no cross-role bleed) |
| **Approval-gated account creation** | Any-assigner QR scan | New per-assigner account is created only after guardian approval (names the issuing assigner) |
| **Offline-payment attestation** | Redeem flow | "I have paid this offline" — reinforces app isn't a payment processor |
| **Two-step redemption confirmation** | Redeem flow (kid side) | Redemption is **`pending`** until the **kid confirms**; points **held**, not spent; kid can **decline**; unconfirmed **expires**; **parent notified + event log** for every step |
| **Pre-login role re-validation** | Home-screen role chooser | Pre-login role is a **scope hint**, re-checked server-side after auth; never implies it grants an unheld role |
| **Data-minimization nudges** | Kid creation | "You don't need a full name" |
| **Kind rejection templates** | Approval reject | Encouraging, non-punitive preset reasons |
| **MFA & security status** | Adult settings/home | Clear MFA-on indicator; prompts if a factor is missing |
| **Report/flag (school)** | Moderator/teacher | Flag a task/activity for review; escalation path |

> **Principle:** make the *safe* path the *easy* path — safe defaults, visible accountability, reversible actions, and a clear audit trail everywhere adults act on a child account.

---

## 10. Sample MVP screens

Lean set sufficient to demonstrate the full loop (matches prototype goal in the source prompt).

### 10.1 Shared / auth
1. **Role chooser (home/landing)** — Parent · Co-Parent · Kid · Teacher · Moderator; **multi-role adults pick the role to sign in as before auth** (sets initial scope, re-validated post-auth).
2. **Register / Login** — email/phone, password/passkey.
3. **MFA / OTP** — code entry + backup codes (simulated MFA in prototype).
4. **Terms & child-safety acknowledgment** — explicit consent capture.

### 10.2 Parent / Co-Parent
5. **Home dashboard** — Action-needed, kids strip, points summary, quick actions.
6. **Add kid** — minimal fields, currency/point-value rule, device mode.
7. **Kid detail** — ledger (per-assigner accounts), **overall picture (all assigners)**, **redemption history (all sources)**, devices, tasks, Redeem button.
8. **Task editor** — title, points, deadline, late-decay, proof, assignees.
9. **Approvals** — pending completions with proof + approve/reject.
10. **Redeem (initiate)** — conversion preview + offline-payment attestation; ends in a **`pending confirmation`** redemption (amount **held**, sent to kid).
11. **Redemption event log (parent)** — kid · initiating assigner · amount · money value · timestamp · **status badge** (pending/completed/declined) across all the parent's kids.
12. **Family / invite co-parent** — scope chooser, pending invites.
13. **QR connect device** — rotating QR + pending pairing (issued per assigner; scanning creates a new per-assigner account on approval).
14. **First-login approval** — device info + **issuing assigner** + "creates a new account" note + approve/reject.
15. **Role switcher** — active-role picker (only for multi-role identities).
16. **People search** — search field above Kids/Students (filters after 3+ chars).
17. **Pre-login role chooser** — home/landing screen *Continue as [role]* (multi-role identities; sets initial scope, re-validated after auth).

### 10.3 Kid
18. **My Tasks** — to-do / waiting / done, with assigner labels.
19. **Task detail / complete** — mark done, optional photo proof.
20. **My Points** — big total + per-source chips (one per assigner account); **held/pending amounts shown distinctly, not as spendable**.
21. **Confirm redemption** — **Confirm / Decline** card for a pending redemption ("[Assigner] is redeeming 20 pts ≈ 10 USD — did you get it?"); celebratory on confirm.
22. **Rewards & history** — redemption timeline (celebratory) with **status badges** (pending/redeemed/declined).

### 10.4 Teacher
23. **Teacher home** — pending approvals + students.
24. **Students list** — connected (guardian-approved), by class, with name search (3+ chars).
25. **Task editor / approvals / redeem** — reuse adult components (redeem follows the same two-step initiate → kid-confirm flow).

### 10.5 Moderator
26. **Moderator home** — teachers roster + oversight feed.
27. **Teacher detail / activity audit** — searchable actions.
28. **Policies** — point caps / allowed actions.
29. **Invite teacher** — scoped, expiring invite.

> **Build note (founder leverage):** the adult task/approval/redeem components are **shared** across Parent/Co-Parent/Teacher (differing only by data scope and labels). Build them once, theme/scope per role. This is the cheapest path to covering all four adult roles.

---

## 11. Assumptions & open questions

**Assumptions**
- **A1–A5** from `04-user-journeys.md` apply (kid always guardian-owned; points in-app only; offline settlement; audit everything; notifications drive the loop).
- Localization-ready architecture is in place even if MVP ships a single language/currency.
- Kid surfaces avoid free-text/chat and external links in MVP.

**Open questions for the founder**
1. Should kids ever see a money equivalent of points, or points-only by default? (affects kid dashboard).
2. Which locales/scripts ship first? (drives font bundling + RTL test matrix).
3. Notification channel mix for MVP (push only vs push+email)?
4. Are moderated **custom** avatars in scope, or presets-only for MVP?
5. Visual theming budget — how distinct should kid vs adult themes be at MVP?

---

*Companion document: `docs/04-user-journeys.md` (end-to-end flows, unhappy paths, security/safety checks).*
