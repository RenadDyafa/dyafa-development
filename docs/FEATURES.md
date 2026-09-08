# FEATURES — Dyafa Development Website
**Complete feature specification · frontend + backend + database + API · v1.0 DRAFT**

Companion to `BRD.md` (business rules) and `PROMPT.md` (one-shot build prompt). Nothing here may be skipped; features marked 🚩 ship behind a feature flag until content is approved.

---

## 1. Tech stack (locked)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14+ (App Router, TypeScript, RSC) | SSR/SSG for SEO, i18n routing |
| Styling | Tailwind CSS + design tokens (CSS variables) | Enforces brand system |
| i18n | next-intl — locales `en`, `ar` with `dir="rtl"` | Route-based `/en/*`, `/ar/*` |
| DB | PostgreSQL + Prisma ORM (SQLite fallback for local dev) | Typed schema, migrations |
| Auth (admin) | NextAuth (credentials + role claims) | RBAC |
| Email | Nodemailer/Resend abstraction (`MAIL_PROVIDER` env) | Lead notifications |
| Validation | Zod on every API boundary | Shared client/server schemas |
| Analytics | Plausible or GA4 via env flag + first-party event table | UTM attribution |
| Testing | Vitest (unit) + Playwright (e2e happy paths) | Launch gate |

## 2. Sitemap & pages (frontend)

```
/{locale}                          Home
├── /about                         About + ecosystem + leadership
├── /development-model             From Land to Operating Asset (5 gates)
├── /modular-hospitality           Modular explained (own the category)
├── /services                      Site review · Feasibility · Investment structuring ·
│                                  Development management · Operating readiness
├── /projects            🚩        Approved milestones only (flagged off at launch)
│   └── /projects/[slug] 🚩
├── /partnerships                  Models: land contribution, JV/SPV, dev management, co-invest
├── /insights                      Blog/thought leadership (bilingual)
│   ├── /insights/[slug]
│   └── /insights/category/[cat]   Pillars as categories
├── /submit-your-site              Primary lead funnel (form + WhatsApp)
├── /contact                       General contact + map + talent form
├── /campaigns/[slug]              Clonable campaign landing pages
├── /privacy · /terms              Legal (legal-entity name appears here + footer)
└── /404 · /500                    Branded, bilingual
```

Rules: 3-click depth max; EN⇄AR switcher preserves the current route; canonical + `hreflang` pairs on every page; no page ever shows an unapproved number, partner, or project.

### 2.1 Page-level content requirements (approved copy sources)

| Page | Hero message (EN / AR) | Key modules | Primary CTA |
|------|------------------------|-------------|-------------|
| Home | "Developing hospitality assets built for performance, scalability, and long-term value." / "نطوّر أصول ضيافة مبنية على الأداء، وقابلية التوسع، والقيمة طويلة الأمد." | Promise band ("From opportunity to operating asset"), 5-gate strip, audience router (Landowner/Investor/Partner), modular teaser, insights feed, submit-site band | Submit your site for review / قدّم موقعك للمراجعة الأولية |
| About | Approved long description (§5.21 of brand doc) | Ecosystem diagram (Holding, Hotels, Services, Aqar, Fandaqah), what-we-are / what-we-are-not, principles | Request a development discussion |
| Development model | "From land to operating hospitality asset." | Interactive 5 gates: site & demand review → product concept → feasibility & capex → modular strategy → delivery & operating readiness; risk-gates diagram | Submit your site |
| Modular hospitality | "Modular is not cheap. Modular is disciplined." | What it means / doesn't mean, repeatability, scale, where it works; FAQ (schema.org FAQPage) | Explore modular with Dyafa |
| Services | Service cards ×5 with outcome-led copy | Process map, engagement models | Request a review |
| Partnerships | "The right structure is as important as the right design." | Model cards: land contribution, SPV/JV, development management, co-investment, operator partnership | Start a partnership conversation |
| Submit your site | "Land value is unlocked when the right operating asset is built on it." | Lead form (§4), what-happens-next timeline, WhatsApp alternative | Form submit |
| Insights | Pillar-filtered listing | Bilingual articles, author, reading time | Newsletter signup |

## 3. Design system (frontend)

Tokens extracted from the approved brand-guidelines file:

```css
:root {
  --navy-900:#13212C; --navy-800:#1D2F3E; --navy-700:#22394A; --slate:#4A5A66;
  --teal-600:#07727A; --teal-500:#0A9EA8; --teal-300:#5FBEC3; --teal-100:#C7E7E8; --teal-050:#EAF7F7;
  --bronze:#C08034;                 /* investment-discipline accent — sparing */
  --alert:#B4423C;                  /* compliance/error only */
  --stone-050:#F7F5F2; --stone-100:#EFECE6; --grey-100:#EDEFF0; --grey-200:#E3E6E8;
  --grey-400:#B4BABE; --grey-500:#8A9199; --grey-600:#6E767C;
  --font-en:'Montserrat',sans-serif; --font-ar:'Almarai',sans-serif;
}
```

- **Look**: precise, modular, architectural, investment-grade. White/stone-dominant surfaces, navy for institutional depth, teal-500 as the single interactive/brand accent, bronze reserved for "investment discipline" highlights. Never contractor-like, never luxury-render galleries.
- **Signature visual**: a modular grid motif (repeating blocks/gates) used in the hero and the 5-gate diagram — the one "bold" element; everything else stays quiet.
- Typography: Montserrat 600–700 headings / 400 body (EN); Almarai (AR) with equal visual weight — Arabic is never smaller than English in bilingual layouts.
- RTL: logical CSS properties throughout (`ms-`, `me-`, `text-start`); mirrored icons/diagrams; Arabic-correct punctuation.
- Motion: one orchestrated hero reveal + interaction-answering transitions only; `prefers-reduced-motion` respected.
- Imagery rules: architectural/site photography, planning, drawings, modular assembly; **banned**: gold skyscrapers, handshake stock, fake luxury interiors, unexplained render galleries.
- Accessibility: WCAG 2.1 AA — contrast ≥ 4.5:1, keyboard focus visible, semantic landmarks, form labels/errors announced, skip link.

## 4. Lead engine (core feature — cannot be skipped)

### 4.1 Site-review form (`/submit-your-site`)
Fields: full name*, role* (landowner/investor/developer/government/hotel-owner/other), organization, email*, phone/WhatsApp*, city*, land/asset location (text + optional map pin), land area (m²), legal status (owned/deed/leased/other), asset type (raw land/existing building/underperforming hotel), documents upload (PDF/JPG ≤ 10 MB ×5, virus-scan hook), message, PDPL consent checkbox* , honeypot + rate limit.
Behavior: inline Zod validation (bilingual messages), progress-friendly single page, success screen with "what happens next" (3 steps) + optional WhatsApp deep link `wa.me/[NEEDS VERIFICATION: number]?text=<approved intro>`.

### 4.2 Other capture points
- Meeting request (investors/partners) — short form on Partnerships & Services.
- Newsletter subscribe (double opt-in).
- Contact + talent form.
- Campaign landing pages inherit the site-review form with `campaign_id`.

### 4.3 Lead pipeline (backend)
- Auto-tag persona (from role field) + source (UTM: source/medium/campaign/term/content persisted from first touch via cookie).
- Statuses: `new → contacted → qualified → meeting → handed_to_bd → closed/archived`.
- Notification: email to BD list ≤ 1 min (queued, retried); daily digest.
- Admin views: filter by persona/status/campaign/date; CSV export; notes per lead; audit trail.
- GDPR/PDPL: delete-lead action, consent timestamp stored.

## 5. CMS & governance engine (admin at `/admin`)

- RBAC roles: `marketing`, `dev_lead`, `ceo`, `legal`, `admin`.
- Content types: pages (structured blocks), insights, projects, campaigns, partners registry, approved-facts registry, media library (with "concept visual" internal label field).
- **Workflow states**: `draft → tech_review → positioning_review → legal_review → approved → published` (+ `archived`). Transitions restricted by role; every transition logged (who/when/diff).
- **Compliance gate (blocking)** on publish:
  1. Banned-phrase scanner EN+AR (full 17_DO_NOT_USE list seeded in DB, editable by legal): guaranteed returns, best developer, risk-free, dream project, once-in-a-lifetime, fully approved, عوائد مضمونة, أفضل مطور, فرصة لا تعوض, استثمار بلا مخاطر, مشروع الأحلام, فخامة لا مثيل لها, أعلى عائد, مضمون الإشغال, ضيافة ديفلوبمنت …
  2. HIGH-RISK detectors: numbers/%/SAR amounts, secured/approved/funded/guaranteed (EN+AR), government-entity dictionary, partner names not in approved registry, project names not in approved registry, hard delivery dates → forces `legal_review`.
  3. Bilingual completeness check (AR field non-empty, not identical to EN).
- Every content item carries: audience, pillar, objective, CTA, risk level (low/medium/high), approver record.
- Preview mode (draft URLs, signed, non-indexed).

## 6. Insights/blog engine

Bilingual title/slug/body (rich text with limited marks), pillar category (12 pillars seeded), author, cover image + alt (EN/AR), reading time, related posts, RSS, share meta. SEO fields per locale: meta title/description, OG image. Draft scheduling. Comments: none (brand-safe).

## 7. Backend architecture

- Next.js Route Handlers (`/app/api/*`) — single deployable.
- Layers: `routes → services → repositories (Prisma)`; Zod DTOs shared with frontend.
- Background jobs: email queue (DB-backed, cron-triggered), sitemap regeneration, scheduled publishing.
- File storage: S3-compatible adapter (env-driven; local disk in dev). Uploads scanned/size-checked, never publicly listed.
- Env config: `DATABASE_URL, MAIL_*, WHATSAPP_NUMBER, NEXT_PUBLIC_ANALYTICS_*, ADMIN_SEED_*, STORAGE_*, FEATURE_PROJECTS=false`.
- Logging: structured (pino); error boundary reporting; health endpoint `/api/health`.
- Security: CSRF on admin mutations, rate limiting (IP+route), Helmet-equivalent headers, input sanitization, signed upload URLs, no PII in logs/URLs.

## 8. Database schema (PostgreSQL / Prisma)

```
users(id, email, name, password_hash, role, is_active, created_at)
leads(id, type[site_review|meeting|contact|talent|newsletter], persona, status,
      name, org, email, phone, city, locale, message,
      land_location, land_area_m2, legal_status, asset_type,
      campaign_id?, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      consent_at, created_at, updated_at)
lead_notes(id, lead_id, author_id, body, created_at)
lead_files(id, lead_id, path, filename, mime, size, created_at)
pages(id, key, template, status, published_at)
page_blocks(id, page_id, order, type, data_json)          -- bilingual fields inside data
insights(id, slug_en, slug_ar, title_en, title_ar, body_en, body_ar,
         excerpt_en, excerpt_ar, pillar_id, author_id, cover_media_id,
         status, risk_level, published_at, seo_json)
pillars(id, key, name_en, name_ar)                          -- 12 seeded
projects 🚩(id, name_en, name_ar, stage, city, summary_en, summary_ar,
         approved_by, approved_at, status, media...)
campaigns(id, slug, name, headline_en, headline_ar, form_variant, status, starts_at, ends_at)
partners(id, name_en, name_ar, logo_media_id, approved_by, approved_at, active)
approved_facts(id, statement_en, statement_ar, source, owner, approved_by, approved_at, expires_at)
banned_phrases(id, phrase, lang, severity[block|flag], active)
media(id, path, alt_en, alt_ar, kind, is_concept_visual, created_by)
approvals(id, entity_type, entity_id, from_state, to_state, actor_id, note, created_at)  -- audit
subscribers(id, email, locale, confirmed_at, unsubscribed_at)
events(id, name, path, utm_json, session_hash, created_at)  -- first-party analytics
settings(key, value_json)                                    -- whatsapp number, BD emails, flags
```

Indexes: leads(status, persona, created_at), insights(status, published_at), events(name, created_at). Migrations + seed script (pillars, banned phrases, admin user, approved copy blocks).

## 9. API surface

**Public** (rate-limited, Zod-validated, bilingual error messages):
```
POST /api/leads/site-review      POST /api/leads/meeting
POST /api/leads/contact          POST /api/leads/talent
POST /api/newsletter/subscribe   GET  /api/newsletter/confirm?token=
GET  /api/insights?locale&pillar&page      GET /api/insights/[slug]?locale
GET  /api/projects (flag-gated)  POST /api/events (analytics beacon)
GET  /api/health                 GET  /sitemap.xml · /robots.txt · /rss.xml
```
**Admin** (auth + RBAC + CSRF):
```
CRUD /api/admin/{insights|pages|projects|campaigns|partners|facts|media|banned-phrases|users}
POST /api/admin/{entity}/[id]/transition   { to_state, note }   -- runs compliance gate
GET  /api/admin/leads?filters   PATCH /api/admin/leads/[id]   POST /api/admin/leads/[id]/notes
GET  /api/admin/leads/export.csv
POST /api/admin/compliance/scan  { text_en, text_ar }  → { blocks[], flags[] }
GET  /api/admin/dashboard        -- lead funnel, top content, compliance queue
```
Conventions: JSON:API-ish envelopes `{ data, error }`, 422 validation shape, cursor pagination, idempotency key on lead POSTs.

## 10. SEO & discoverability

- Per-page bilingual metadata; `hreflang` en/ar/x-default; canonical; locale-aware sitemap.
- JSON-LD: `Organization` (legal name in `legalName`), `WebSite`, `BreadcrumbList`, `Article` (insights), `FAQPage` (modular page).
- Target keywords seeded from brand doc §13 (EN: hospitality development, modular hospitality development, hotel development Saudi Arabia, capital-efficient hotels… AR: تطوير الفنادق، التطوير المعياري، تطوير أصول الضيافة، دراسة جدوى فندقية…). **Never** target banned keywords (guaranteed returns, cheapest construction…).
- OG images auto-generated per locale (brand template).
- Core Web Vitals budget: LCP < 2.5s, CLS < 0.1, INP < 200ms; images `next/image`, fonts self-hosted with `font-display: swap`.

## 11. Analytics & reporting

First-party `events` table + provider (env). Tracked: page views, locale switch, form start/submit/success, WhatsApp click, CTA clicks, campaign attribution. Admin dashboard: leads by persona/week, conversion by campaign, top insights, compliance queue length — feeds the monthly review ritual.

## 12. QA / launch checklist (definition of done)

- [ ] Every page renders in EN and AR; RTL audited (layout, icons, forms, tables).
- [ ] Native-Arabic review pass recorded (no literal translation).
- [ ] Compliance scan zero blocks on all published content; HIGH-RISK queue empty or approved.
- [ ] Site-review lead e2e test (Playwright): submit → DB row → email → admin visible → status change.
- [ ] No unapproved number, partner, government name, or project anywhere (automated scan + manual pass).
- [ ] Lighthouse ≥ 90/95/95 (perf/a11y/SEO) on Home, Model, Submit-Site ×2 locales.
- [ ] `FEATURE_PROJECTS=false` verified: /projects returns branded "coming soon" and is excluded from sitemap.
- [ ] Security pass: rate limits, headers, upload restrictions, admin lockout, audit log writing.
- [ ] Backups configured; env documented in README; seed + migration reproducible from scratch.
