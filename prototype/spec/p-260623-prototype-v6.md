# KidsBank Prototype — Spec v6 (Round 5a)

**Author**: Linus (Frontend) · **Date**: 2026-06-23

## Current state (after v5)
Offline vanilla-JS SPA with full multi-role flows, partial/full redemption,
two-box late decay, Your-Kids totals, and complete English/Arabic + RTL i18n.
Validated by a 55-assertion jsdom smoke test.

## Additions implemented this round (v6)

### v6-1 — Multi-role switching for assigners
- An adult identity can hold **multiple roles** (the demo identity is both
  **Parent** and **Teacher**). Seeded via `KB.roleGroups` in `data.js`:
  `Parent → [Parent, Teacher]`, `Teacher → [Teacher, Parent]`.
- On role selection (and on hash restore) `state.roles` is populated; `state.role`
  holds the **active** role.
- A **role switcher** (segmented control) renders in the dashboard top bar whenever
  `state.roles.length > 1`. Switching (`data-action="switchRole"`) sets `state.role`,
  resets to the Overview tab, and re-renders.
- Scope is reused unchanged: `scope()` / `kidsForRole()` / `myAssignerId()` key off
  `state.role`, so a switch flips both the kids/students list and the tasks shown
  (Parent → their kids; Teacher → their students).
- All new strings (`activeRole`, `switchRole`, `roleSwitched`) are translated EN+AR.

### v6-2 — Name search (results after the 3rd character)
- The People / Your-Kids page search now activates **only at ≥ 3 characters**.
  Below 3 chars the full list is shown and a hint ("Type 3+ letters to search" /
  "اكتب 3 أحرف أو أكثر للبحث") appears once the user starts typing.
- Matching is case-insensitive and also matches **Arabic names** (`kid.nameAr`,
  seeded for every kid) via a `data-search` attribute on each people card.
- Implemented in `window.__kbPeopleFilter` on the `input` event.

## Acceptance
- Multi-role identity shows a switcher; switching rescopes kids + tasks.
- People search ignores queries < 3 chars; filters live by EN or AR name at ≥ 3.
- `node test\smoke.js` extended and green; `node --check` clean; no runtime errors.
