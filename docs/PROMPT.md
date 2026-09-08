# PROMPT — One-shot build instruction for Claude Code
**Dyafa Development Website · paste this entire file as the task prompt. `BRD.md` and `FEATURES.md` must be in the repo root.**

---

## 0. Session setup (do this first, before any code)

1. If the **claude-mem** plugin/MCP is available in this environment, initialize it and store: project name (`dyafa-development-website`), the locked stack, brand tokens, and the compliance rules from §3 below — so context survives compaction and future sessions.
2. If the **task-observer** plugin is available, register the build phases from §6 as tracked tasks and update status as you complete each one. If either plugin is not installed, note it once and continue with your built-in todo/plan tooling — do not stop the build.
3. Read `BRD.md` and `FEATURES.md` completely. They are the source of truth. If anything in this prompt conflicts with them, FEATURES.md wins for technical detail and BRD.md wins for business/compliance rules.

## 1. Mission

Build, in this single session, a **complete, production-ready bilingual (EN/AR) website** for **Dyafa Development | ضيافة للتطوير** — frontend + backend + database + API + admin CMS — implementing **every** feature in FEATURES.md. Do not skip, stub, or "TODO" any listed feature. If a third-party value is unknown (WhatsApp number, domain, SMTP), wire it through env vars with safe defaults and mark it `[NEEDS VERIFICATION]` in README — never invent it.

## 2. Locked stack

Next.js 14+ App Router + TypeScript · Tailwind (tokens as CSS variables) · next-intl (`/en`, `/ar`, full RTL) · Prisma + PostgreSQL (`DATABASE_URL`, SQLite fallback for dev) · NextAuth credentials with RBAC · Zod everywhere · Nodemailer/Resend adapter · Vitest + Playwright. Single repo, single deployable.

## 3. Absolute brand & compliance rules (violations = failed build)

1. Public name **Dyafa Development | ضيافة للتطوير** everywhere; legal name **Dyafa Real Estate Investment & Development | شركة ضيافة للاستثمار والتطوير العقاري** only in footer/legal pages/JSON-LD `legalName`.
2. **Never** generate: project names, pipeline sizes, costs, IRR/returns, occupancy, approvals, financing, partner names, government references, delivery dates. Use approved copy from FEATURES.md §2.1 and the seed content in §5 below; where proof is needed, render nothing publicly (hide the block) and use `[Insert approved …]` only in admin/seed drafts.
3. Banned phrases (seed the `banned_phrases` table and hard-block on publish): *guaranteed returns, best developer, risk-free, dream project/investment, once-in-a-lifetime, unmatched luxury, invest now before it is too late, cheapest construction, fully approved, world-class* (unevidenced); Arabic: *عوائد مضمونة، أفضل مطور، فرصة لا تعوض، استثمار بلا مخاطر، مشروع الأحلام، فخامة لا مثيل لها، أعلى عائد، مضمون الإشغال، أرخص تكلفة، ضيافة ديفلوبمنت*.
4. Tone: disciplined Saudi hospitality development partner — never contractor, broker, or luxury promoter. Every development message connects to **operation and long-term value**. Modular = disciplined repeatability, never cheap/temporary.
5. Arabic is natural Saudi business Arabic (use the approved AR strings provided; do not machine-translate new marketing slogans), stored in separate fields, visually equal to English, correct RTL with logical CSS properties.
6. Vision 2030: do not reference it anywhere in seed content.

## 4. Design brief — "frontend beautiful, attractive, eye-catching, modern"

Interpret this as **investment-grade architectural modernism**, not decoration:

- Tokens (exact): navy `#13212C` / `#1D2F3E` / `#22394A`, slate `#4A5A66`, teal `#07727A` / `#0A9EA8` / `#5FBEC3` / `#C7E7E8` / `#EAF7F7`, bronze `#C08034`, alert `#B4423C`, stone `#F7F5F2` / `#EFECE6`, greys `#EDEFF0 #E3E6E8 #B4BABE #8A9199 #6E767C`. Fonts: **Montserrat** (EN), **Almarai** (AR), self-hosted, `font-display: swap`.
- Surfaces white/stone-dominant; navy for hero/footer depth; **teal-500 is the only interactive accent**; bronze appears sparingly for investment-discipline moments; red only for errors/compliance.
- **One signature element**: an animated modular-grid motif — blocks assembling from "land" into an "operating asset" — used in the Home hero and reused statically as the 5-gate diagram on /development-model. Everything else stays quiet and disciplined.
- No generic AI-design tells: no all-caps eyebrow labels, no `01/02/03` markers unless the content is truly sequential (the 5 gates ARE sequential — numbering allowed there), no identical rounded-card kits, no gradient washes, no per-section fade-up spam. One orchestrated hero reveal; motion otherwise answers user actions only; respect `prefers-reduced-motion`.
- Fully responsive to 360px; WCAG 2.1 AA (contrast, focus rings, labels, skip link); RTL mirroring of layout, icons, and the gate diagram.
- Photography placeholders: neutral architectural/site imagery slots with bilingual alt text; never luxury-lifestyle clichés.

## 5. Approved seed content (use verbatim; do not rewrite slogans)

- Master message — EN: *Developing hospitality assets built for performance, scalability, and long-term value.* AR: *نطوّر أصول ضيافة مبنية على الأداء، وقابلية التوسع، والقيمة طويلة الأمد.*
- Promise — EN: *From opportunity to operating asset.* AR: *من الفرصة إلى أصل يعمل بكفاءة.*
- About long description: use the approved EN + AR long descriptions from FEATURES.md §2.1 / brand guidelines §5.21.
- CTAs — EN: *Submit your site for review · Request a development discussion · Explore a partnership with Dyafa Development.* AR: *قدّم موقعك للمراجعة الأولية · اطلب اجتماعاً لمناقشة فرصة التطوير · ابدأ حوار شراكة مع ضيافة للتطوير.*
- Seed 5 bilingual insights drafts (status `draft`, pillar-tagged) using the 5 approved LinkedIn EN posts + 5 AR posts from the brand sample outputs (adapted to article intros, no new claims).
- WhatsApp intro (behind `WHATSAPP_NUMBER` env): the approved AR/EN intake message from the brand message house.
- Seed the 12 content pillars, banned phrases, one admin user from `ADMIN_SEED_*` env, and the `settings` row (`FEATURE_PROJECTS=false`).

## 6. Build phases (register in task-observer; complete ALL, in order; verify each before moving on)

1. **Scaffold** — Next.js + TS + Tailwind + next-intl + Prisma + NextAuth; tokens, fonts, layout shells (LTR+RTL), env template, README skeleton.
2. **Database** — full Prisma schema from FEATURES.md §8, migrations, seed script (pillars, banned phrases, admin, settings, insight drafts, page blocks). Verify: `prisma migrate dev && prisma db seed` clean.
3. **Design system** — Button, Input/Select/Upload, Card, SectionHeading, LocaleSwitcher, Nav (desktop+mobile), Footer (legal name), GateDiagram, ModularHero motif, Toast, EmptyState — all RTL-aware with stories/examples page at `/dev/ui` (excluded from prod).
4. **Public pages** — all routes in FEATURES.md §2 with approved copy EN+AR, SEO metadata, hreflang, JSON-LD, sitemap/robots/RSS, branded 404/500, campaigns/[slug], /projects flag-gated "coming soon".
5. **Lead engine** — site-review form (all fields, Zod bilingual validation, uploads, honeypot, rate limit, PDPL consent), meeting/contact/talent/newsletter endpoints, UTM cookie capture, email notification queue + daily digest, success states with WhatsApp deep link.
6. **Admin CMS** — NextAuth RBAC (marketing/dev_lead/ceo/legal/admin), CRUD for all content types, workflow transitions with the blocking compliance gate (banned-phrase scan EN+AR, HIGH-RISK detectors: numbers/currency/%, secured|approved|funded|guaranteed|مضمون|معتمد, unapproved partner/project names, government dictionary), bilingual completeness check, preview mode, media library with `is_concept_visual`, approvals audit log, leads inbox (filters, notes, status, CSV export), dashboard (funnel, compliance queue).
7. **Analytics & hardening** — events beacon + dashboard tiles, security headers, CSRF, rate limiting, structured logging, `/api/health`.
8. **Tests & verification** — Vitest for compliance scanner + lead service + i18n utils; Playwright e2e: (a) submit site-review lead EN and AR → appears in admin → status change → email queued; (b) publish blocked by banned phrase then succeeds after fix; (c) locale switch preserves route. Run `next build`, all tests, and Lighthouse CI (or note how to run) — fix everything until green.
9. **Handoff** — README: setup, env table (every `[NEEDS VERIFICATION]` item listed), seed credentials note, deploy steps (Vercel + Docker), the QA checklist from FEATURES.md §12 with each box checked or explicitly blocked-on-input. Store final state summary in claude-mem.

## 7. Non-negotiable working rules

- **No feature skipping.** Before declaring done, diff your implementation against FEATURES.md sections 2–11 line by line and list each item as ✅ implemented / 🚩 flag-gated / ⛔ blocked-on-verified-input (with the env/README marker). Anything else is unfinished.
- Verify before claiming: run the build, migrations, seeds, and tests; paste real command output, not assumptions.
- Commit in logical increments per phase with clear messages.
- Everything produced is a DRAFT for human approval — the seeded content ships in `draft` status; nothing is "published" by default except structural pages using approved copy.
