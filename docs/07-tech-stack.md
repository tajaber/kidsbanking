# Section 11 — Recommended Tech Stack

**Project:** KidsBank (KidsBanking)
**Author:** Dell — Solutions Architect
**Audience:** Solo, bootstrapped founder
**Lens:** Boring, proven, managed, low-cost, low-ops. Optimize for fastest validated MVP without painting into a corner for scale. Region-agnostic; region-driven points flagged.

> **TL;DR recommendation**
> - **MVP stack:** **Flutter** (mobile + web dashboard) + **Supabase** (Postgres, Auth w/ MFA, Storage, Edge Functions, RLS) + **FCM** push + **PostHog/Firebase analytics** + **Sentry/Crashlytics** + Supabase-managed hosting. Cheap, ~zero ops, real relational ledger.
> - **Scale stack:** Keep **Postgres** (managed: Supabase/Neon/RDS). Move app logic into a **modular monolith** (NestJS/.NET) on a managed container platform (Fly.io/Render/Cloud Run). Add **dedicated web dashboard (Next.js)**, queue-based notifications, and a privacy-segregated analytics pipeline.

---

## 11.1 Mobile framework: Flutter vs React Native vs Native

| Criterion | **Flutter** | **React Native** | **Native (Swift + Kotlin)** |
|---|---|---|---|
| Language | Dart | JS/TS | Swift / Kotlin |
| Codebases for iOS+Android | 1 | 1 | 2 |
| Web dashboard reuse | Flutter Web (decent) | RN-Web (okay) + share logic w/ React | None (separate build) |
| UI consistency | Excellent (own render engine) | Good (native widgets, occasional drift) | Best (platform-perfect) |
| RTL / i18n | First-class, strong | Good (I18nManager) | Native, full control |
| QR / camera / secure storage | Mature plugins | Mature plugins | Direct APIs |
| Talent availability | Growing, smaller | Largest (JS ecosystem) | Specialized, costly |
| Solo-founder velocity | **High** | **High** | Low |
| Performance | Very good | Good | Best |
| Maturity/stability | Proven, Google-backed | Proven, Meta-backed | Gold standard |

**Pros/cons**

- **Flutter** — *Pros:* single codebase incl. web, pixel-consistent UI great for a gamified kid experience, excellent RTL, fast iteration. *Cons:* Dart is a less common language; larger app binary; web is good-not-perfect.
- **React Native** — *Pros:* huge JS/TS ecosystem (share types/logic with a web/Next dashboard), easy hiring, Expo makes setup trivial. *Cons:* native-module friction at edges; UI parity needs care; web story weaker than Next.
- **Native** — *Pros:* best UX/perf, full API access. *Cons:* 2× cost and maintenance — disqualifying for a solo founder at MVP.

**Recommendation:**
- **MVP → Flutter.** Best single-codebase coverage (phone, tablet, **and** the adult web dashboard), strong RTL/i18n for the multilingual requirement, and a polished UI that suits the gamified kid mode — all from one skillset.
- **Alternative if the founder is already a JS/TS developer → React Native + Expo**, paired with a **Next.js** web dashboard sharing TypeScript types. This is equally valid and may be *faster* for a JS-native founder. Pick based on the founder's existing skills.

---

## 11.2 Backend: Node.js vs .NET vs Firebase vs Supabase

| Criterion | **Supabase** | **Firebase** | **Node (NestJS) self-run** | **.NET (ASP.NET Core) self-run** |
|---|---|---|---|---|
| Database | **Postgres (relational)** | Firestore (NoSQL doc) | Bring your own (Postgres) | Bring your own (Postgres/SQL) |
| Ledger/ACID fit | **Excellent** | Weak (no multi-doc ACID at scale, manual integrity) | Excellent | Excellent |
| Auth + MFA | Built-in (GoTrue) | Built-in (strong) | DIY / library | DIY / Identity |
| Authorization | **RLS at DB** + policies | Security rules (powerful but fiddly) | App-layer + RLS | App-layer + RLS |
| Push | Integrations (FCM) | **Native FCM** | Integrate FCM | Integrate FCM |
| Ops burden | **Very low** | **Very low** | Medium | Medium |
| Lock-in | Low (it's just Postgres — portable) | **High** (Firestore/rules proprietary) | Low | Low |
| Cost at MVP | Free tier → cheap | Free tier → cheap | VPS/PaaS cost | PaaS cost |
| Local dev / SQL tooling | Excellent (standard SQL) | Limited | Excellent | Excellent |
| Best for | **Relational + low ops** | Realtime/simple apps | Custom logic | Enterprise/C# shops |

**Pros/cons**

- **Supabase** — *Pros:* a **real Postgres** (the right shape for a points ledger + relationships + approvals), managed Auth with MFA, Storage, Edge Functions, **RLS** for defense-in-depth, and **portability** (you can lift the Postgres out later — low lock-in). *Cons:* Edge Functions less mature than a full backend framework; complex business logic may eventually want a dedicated service.
- **Firebase** — *Pros:* best-in-class managed auth + push, generous tooling, instant realtime. *Cons:* **Firestore is document/NoSQL** — a poor fit for an auditable financial-style ledger with cross-entity integrity; high lock-in; complex queries/joins are painful. Good for many apps, **wrong shape for this ledger-centric one.**
- **Node/NestJS self-run** — *Pros:* total control, great ecosystem, shares TS with an RN/Next front-end, clean modular monolith. *Cons:* you own auth/MFA, deploys, scaling — more ops than BaaS at MVP.
- **.NET / ASP.NET Core** — *Pros:* outstanding performance, mature, strong typing, great for ledgers. *Cons:* only if the founder is a C# developer; otherwise unnecessary; ecosystem heavier than needed for MVP.

**Recommendation:**
- **MVP → Supabase.** It uniquely gives **low ops *and* a relational ledger *and* managed MFA auth *and* portability**. This is the single highest-leverage backend choice for this specific product.
- **Why not Firebase:** the ledger/relationship/audit core wants relational integrity; Firestore would push correctness into app code — risky for points/money-valuation data.
- **Scale → modular monolith (NestJS or .NET) over the same Postgres.** When authorization/business logic outgrows RLS + Edge Functions, stand up a dedicated API service on a managed container platform, keeping the database. Because MVP used plain Postgres, this is a **migration, not a rewrite**.

---

## 11.3 Database options

| Option | Type | Fit | Notes |
|---|---|---|---|
| **PostgreSQL** | Relational | **Best** | Ledger, FKs, transactions, RLS, JSONB for flexible bits. **Chosen.** |
| MySQL/MariaDB | Relational | Good | Fine, but Postgres RLS + JSONB + ecosystem win here. |
| Firestore/DynamoDB | NoSQL | Poor for core | Integrity in app code; avoid for ledger. Possible for ancillary high-volume logs at scale. |
| SQLite | Embedded | Client-side only | Good for on-device cache/offline reads in the app. |

**Recommendation:** **PostgreSQL** everywhere server-side (managed via Supabase for MVP; Supabase/Neon/RDS/Cloud SQL at scale). **SQLite/local store** on-device for offline-tolerant reads.

---

## 11.4 Push notifications

| Service | Pros | Cons | Verdict |
|---|---|---|---|
| **FCM (Firebase Cloud Messaging)** | Free, reliable, Android+iOS (via APNs relay), ubiquitous | Setup for iOS needs APNs keys | **Chosen (MVP + scale).** |
| APNs (direct) | Native iOS | iOS-only; manage separately | Use under the hood for iOS. |
| OneSignal / Expo Push | Easy multi-platform, dashboards | Third-party dependency/limits | Fine for RN/Expo MVP; OneSignal for quick campaigns. |

**Recommendation:** **FCM** for transactional push (approvals, device-claim, due-soon). Always **persist an in-app notification record** as the reliable source of truth; push is best-effort. **No promotional push to kids.**

---

## 11.5 Hosting / cloud

| Layer | MVP (cheap, managed) | Scale |
|---|---|---|
| Backend/API | Supabase (Edge Functions) | Fly.io / Render / Google Cloud Run (managed containers) |
| Database | Supabase Postgres | Supabase / Neon / RDS / Cloud SQL (+ read replicas) |
| Web dashboard | Flutter Web on Supabase/Cloudflare Pages/Netlify | Next.js on Vercel/Cloudflare |
| Object storage | Supabase Storage | S3 / Cloudflare R2 / GCS |
| CDN/edge | Cloudflare (free tier) | Cloudflare |

**Recommendation:** Stay inside **one managed ecosystem for MVP** (Supabase) to minimize moving parts; add a CDN (Cloudflare) for static/web. At scale, split the API onto a managed container platform while keeping managed Postgres. Avoid raw VMs/Kubernetes until there's a team to run them.

> **Region flag:** **data-residency** requirements (where child data must physically live) are region-driven and may dictate hosting region or provider. Pick the Supabase/cloud **region** to match your target market and get legal review before storing child PII.

---

## 11.6 Analytics & crash reporting

| Tool | Use | Notes |
|---|---|---|
| **PostHog** | Product analytics (self-host or cloud), session/funnel | Privacy-friendly, can self-host; good for activation/retention. |
| Firebase Analytics | Product analytics | Easy if already in Firebase/FCM; mind child-data policy. |
| **Sentry** | Error/crash (mobile + backend) | Excellent cross-stack error tracking. |
| Crashlytics | Mobile crash | Great if in Firebase ecosystem. |

**Recommendation:** **PostHog** (product) + **Sentry** (errors/crash) for one consistent cross-stack story; or Firebase Analytics + Crashlytics if you're leaning Firebase for FCM anyway. **Hard rule:** child-facing flows carry **no advertising/marketing SDKs**; kid analytics stay minimal, aggregate, and segregated from any marketing tooling (also an app-store policy matter — flag for review).

---

## 11.7 Supporting libraries (proven, boring)

- **i18n:** `intl`/`flutter_localizations` (Flutter) or `i18next`/`react-i18next` (RN/Next). ICU message format.
- **QR:** generate + scan via maintained packages (`qr_flutter` + `mobile_scanner` for Flutter; `react-native-vision-camera` + QR for RN).
- **Secure storage:** Keychain/Keystore wrappers (`flutter_secure_storage` / `react-native-keychain`).
- **State management:** Riverpod/Bloc (Flutter) or Redux Toolkit/Zustand (RN).
- **Validation:** server-side schema validation (e.g., Zod for Node).

---

## 11.8 What NOT to use (for this product, now)

- **Firestore/NoSQL as the system-of-record ledger** — wrong shape; integrity risk.
- **Microservices / Kubernetes at MVP** — ops you can't afford solo.
- **Self-hosted auth you wrote yourself** — auth/MFA is non-negotiable; use a proven provider.
- **Ad/marketing SDKs in kid-facing flows** — safety + policy risk.
- **Bleeding-edge/unmaintained frameworks** — boring and proven only.
- **Raw VMs you patch by hand** — prefer managed platforms.

---

## 11.9 Final recommendation

**MVP (fastest validated, lowest ops/cost):**
> **Flutter** (kid app + adult app + web dashboard) · **Supabase** (Postgres + Auth/MFA + Storage + Edge Functions + RLS) · **FCM** push · **PostHog + Sentry** · **Cloudflare** edge. Single managed ecosystem, real relational ledger, near-zero ops.

*(If the founder is a JS/TS developer: **React Native + Expo** app + **Next.js** dashboard + **Supabase** backend is an equally valid MVP — choose by existing skill.)*

**Scale (proven, more headroom, still low-ops):**
> Keep **Postgres** (managed). Promote business logic into a **modular monolith** (NestJS or .NET) on **Fly.io/Render/Cloud Run**. Add a **dedicated Next.js web dashboard**, **queue-based notification workers**, **read replicas/cache** for hot balances, and a **privacy-segregated analytics pipeline**. Isolate any large school tenant that needs it.

**Why this path:** every MVP component is managed, cheap, and proven; the **Postgres-centric** design means the jump to scale is incremental (extract services, add workers) rather than a rewrite — and the deliberate "points are non-monetary, settlement offline" rule keeps the whole stack out of payment/PCI/banking complexity.
