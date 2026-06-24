# Section 20 — Hosting & Infrastructure (brief)

**Project:** KidsBank (KidsBanking)
**Author:** Dell — Solutions Architect
**Audience:** Solo, bootstrapped founder
**Lens:** Boring, proven, managed, low-cost, low-ops. Secrets/auth/child-data protection non-negotiable. Region-driven points flagged.

> **TL;DR:** **MVP** = one managed ecosystem (Supabase) + Cloudflare + FCM + managed analytics/crash + Git-based CI/CD. **Scale** = managed Postgres + modular monolith on a managed container platform + dedicated web host + queue workers + proper observability + IaC. The data-residency *region* is the one infra decision the founder must make per target market.

---

## 20.1 Environments

| Env | Purpose | MVP | Scale |
|---|---|---|---|
| **dev** | Local/feature work | Local + a shared Supabase "dev" project; seeded fake data (no real child data) | Same + ephemeral preview envs per PR |
| **staging** | Pre-prod validation, QA, store review builds | A separate Supabase "staging" project mirroring prod config | Dedicated staging cluster mirroring prod |
| **prod** | Live | Supabase "prod" project, locked-down | Managed Postgres + container platform, locked-down |

**Rules:** strict separation of projects/credentials per env; **no real child/PII data outside prod**; seed/synthetic data only in dev/staging.

---

## 20.2 CI/CD

- **Source:** Git (GitHub). Trunk-based with short-lived branches; PR checks required.
- **Pipeline (GitHub Actions):** lint → unit tests → build → DB migration check → deploy.
- **DB migrations:** versioned, forward-only, reviewed (Supabase migrations / sqitch / Prisma-migrate). **Never** ad-hoc prod schema edits.
- **Mobile builds:** **Fastlane** + EAS (Expo) or Codemagic/GitHub Actions for Flutter; automated signing; deliver to TestFlight / Play Internal Testing for beta.
- **Promotion flow:** merge → auto-deploy to **staging** → manual approval gate → **prod**.
- **Scale:** add preview environments per PR, canary/blue-green for the API, automated rollback.

---

## 20.3 Cloud & app hosting

| Layer | MVP | Scale |
|---|---|---|
| API/backend | Supabase Edge Functions | Modular monolith on **Fly.io / Render / Cloud Run** (managed containers) |
| Web dashboard | Flutter Web on **Cloudflare Pages / Netlify** | **Next.js** on Vercel/Cloudflare |
| Edge/CDN/WAF | **Cloudflare** (free tier) | Cloudflare (WAF + rate limiting) |
| Region | Pick Supabase region near target market | Multi-region only if compliance/latency demands |

Avoid raw VMs/Kubernetes until there's a team to operate them.

> **Region flag:** choose the hosting region to satisfy **data residency** for your first market; revisit before expanding. Legal review required before storing child PII in any region.

---

## 20.4 Database hosting

- **MVP:** Supabase-managed **PostgreSQL** (daily automated backups on paid tier; RLS enabled; connection pooling on).
- **Scale:** managed Postgres (**Supabase / Neon / RDS / Cloud SQL**) with **read replicas**, PITR (point-in-time recovery), and a managed cache (Redis) for hot balances.
- **Migration path:** because MVP is plain Postgres, moving the DB or putting a dedicated API in front of it is a migration, not a rewrite.

---

## 20.5 File storage

- **MVP:** Supabase Storage (avatars, QR assets) with signed URLs and access policies.
- **Scale:** S3 / Cloudflare R2 / GCS behind the CDN.
- Keep child-related media minimal; signed, expiring URLs; no public buckets.

---

## 20.6 Notifications infrastructure

- **MVP:** **FCM** (transactional push) + in-app notification records (reliable source of truth); fan-out runs in-process in Edge Functions.
- **Scale:** a **queue + worker** (managed queue / Supabase-cron / cloud tasks) for reliable async fan-out, retries, batching, and quiet-hours to fight notification fatigue.
- **No promotional push to kids.**

---

## 20.7 Logging, monitoring, observability

| Concern | MVP | Scale |
|---|---|---|
| App/crash errors | **Sentry** (mobile + backend) / Crashlytics | Same + alerting SLOs |
| Product analytics | **PostHog** / Firebase Analytics (privacy-segregated) | + warehouse pipeline |
| Infra/uptime | Provider dashboards + **UptimeRobot/Better Stack** (free) | Full metrics/tracing (OpenTelemetry), dashboards, on-call alerts |
| Audit log | Append-only `audit_log` table (see data model) | Shipped to a restricted, tamper-evident sink |

**Child-data discipline:** logs must **never** contain child PII or secrets; scrub/structure logs; separate kid analytics from any marketing tooling.

---

## 20.8 Backup & recovery

- **MVP:** rely on managed **daily backups** (enable on Supabase paid tier); periodically **test a restore** into staging (an untested backup is not a backup).
- **Scale:** **PITR**, cross-region backup copies, documented **RPO/RTO**, runbook for restore + a quarterly restore drill.
- Audit and ledger tables are append-only → backups + immutability give strong recoverability for the financial-style data.

---

## 20.9 Secrets management (non-negotiable)

- **Never** commit secrets. `.env` files git-ignored; secrets live in the platform's secret store (Supabase config, GitHub Actions encrypted secrets, Cloudflare secrets).
- Distinct credentials per environment; **least privilege** service keys; the powerful `service_role` key is server-side only — **never** shipped in the mobile app.
- Rotate keys on a schedule and on any suspected exposure; record rotations in audit.
- MFA on all founder/admin accounts (cloud console, GitHub, app store, Supabase).
- **Scale:** dedicated secrets manager (Doppler / 1Password / cloud KMS), short-lived tokens, automated rotation.

---

## 20.10 Cost optimization

- **MVP target: very low (often free-tier → low-tens of dollars/month).** Stay inside **one managed ecosystem** to avoid sprawl; use free tiers (Cloudflare, FCM, UptimeRobot, Sentry/PostHog dev tiers).
- Pay-as-you-grow: turn on paid backups/PITR and a cache only when needed.
- Right-size: single small DB + serverless functions until real load appears; add replicas/workers reactively, guided by analytics.
- **Avoid premature spend:** no Kubernetes, no multi-region, no microservices, no enterprise tooling until usage and revenue justify it.
- Set **billing alerts** on every provider from day one.

---

## 20.11 Recommended setups

**MVP (simple, cheap, low-ops):**
> **Supabase** (Postgres + Auth/MFA + Storage + Edge Functions + daily backups + RLS) · **Cloudflare** (CDN/WAF, free) · **FCM** push · **Sentry + PostHog** · **GitHub Actions** CI/CD with versioned migrations · Fastlane/EAS for store delivery · secrets in platform stores · billing alerts on. Three Supabase projects: dev / staging / prod.

**Scale (proven, more headroom, still low-ops):**
> Managed **Postgres** with read replicas + PITR + Redis cache · **modular monolith** API on **Fly.io/Render/Cloud Run** · **Next.js** dashboard on Vercel/Cloudflare · **queue-based** notification workers · **OpenTelemetry** tracing + metrics + on-call alerting · IaC (Terraform) · dedicated **secrets manager** with rotation · cross-region backups + documented RPO/RTO and restore drills · isolate any large school tenant requiring it.

**Why:** every component is managed and proven, MVP cost stays near zero, and the Postgres-centric design plus environment/secret hygiene make scaling an incremental migration — while child-data protection, secrets discipline, and the non-banking posture stay intact throughout.
