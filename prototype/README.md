# KidsBank — Clickable Prototype

A self-contained, front-end-only prototype of KidsBank: a kids' chore-and-reward
"bank" where adults (parents, co-parents, teachers, moderators) assign tasks, approve
completions, and redeem earned points for real-world rewards. This folder is the
**implementation reference** for the real build (see _Reference for real implementation_).

## How to run

### Option A — open offline (no server)
Double-click `index.html`, or open it in any modern browser. It works straight from the
file system (`file://`) — no build step, no network, no CDN. Plain HTML + CSS + vanilla JS.

### Option B — static server
From this `prototype\` folder:

```powershell
python -m http.server 8000
# then browse to http://localhost:8000/
```

Any static file server works (the prototype never calls a backend).

### Run the tests
A headless jsdom smoke test drives every flow and asserts there are no runtime/console
errors:

```powershell
npm install   # first time only — installs jsdom (devDependency)
npm test      # runs test\smoke.js → 91/91 assertions green
```

(`npm test` is wired to `node test\smoke.js`.)

## What it is / what it isn't

- **It is** a fully clickable, in-browser demonstration of the product's screens and
  flows for stakeholder walkthroughs and as a spec for engineers.
- **It is not** a real app: there is **no backend, no database, no auth, no
  persistence**. All data is the in-memory seed in `assets\data.js`; every mutation
  lives only for the session and **resets on page reload**. Login/MFA always succeed and
  QR codes are deterministic inline SVGs.

## File layout

```
prototype\
├─ index.html            # single page; loads the three asset files
├─ package.json          # "npm test" → node test\smoke.js
├─ package-lock.json
├─ assets\
│  ├─ data.js            # window.KB.* seed data (entities & shapes)
│  ├─ app.js             # SPA: hash router, data-action delegation, view render fns
│  └─ styles.css         # design system (CSS custom properties → light/dark, LTR/RTL)
├─ test\
│  └─ smoke.js           # jsdom smoke test (91 assertions)
└─ spec\                 # versioned change specs, v2 … v9 (history of the prototype)
```

The app is a single-page app: `app.js` renders views as functions into `#app` and
dispatches user interactions via `data-action` event delegation; navigation is hash-aware.

## Demo accounts & roles

No credentials are required — the login screen is pre-filled and any input is accepted.

| Role        | Demo adult         | Sees                        |
|-------------|--------------------|-----------------------------|
| Parent      | Sara Aziz 👩        | Yusuf, Layla (+ tasks they assigned) |
| Co-Parent   | Omar Aziz 👨        | Yusuf, Layla                |
| Teacher     | Ms. Lina Haddad 🧑‍🏫 | Yusuf, Sami                 |
| Moderator   | Mr. Khalid Nour 🛡️  | Layla, Sami (+ oversight)    |
| Kid         | Yusuf 🦊 (demo kid) | own tasks / points / history |

The demo adult identity holds **both Parent and Teacher** roles, so the **pre-login role
choice** (home screen) and the in-app **role switcher** can be demonstrated. Each kid keeps
**separate balances per assigner** ("multiple bank account numbers for the same kid").

## Language / RTL & currency toggles

- **Language:** the 🌐 top-bar button (and Settings) switches English ⇄ العربية and flips
  text direction **LTR ⇄ RTL** document-wide. Kid names are localized (e.g. Yusuf / يوسف).
- **Currency:** the top-bar currency button cycles, and currency chips in Redeem/Settings
  pick **USD / EUR / AED**. Rate is 10 pts = $5 / €4 / 20 AED (`KB.currencies`).
- **Theme:** 🌙/☀️ toggles light/dark. ❔ (or the `?` key) opens the presenter demo guide.

## Reference for real implementation

This prototype is the authoritative behavioural reference for the production build. See:

- `..\docs\10-*` — (implementation guidance)
- `..\docs\11-*` — (implementation guidance)
- `..\docs\12-prototype-reference.md` — **Screen → Feature → Data** mapping, annotated
  **reference data shapes** extracted from `data.js`, and the **interaction patterns**
  worth preserving in the real build.

For the full screen-by-screen feature narrative see `..\docs\frontend-features.md`.
