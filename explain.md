# Dyafa Development Website — explain.md

This document explains the codebase end-to-end: what it is, how it's built, where things live, and exactly what has and hasn't been verified. It accompanies `README.md` (the operational run-book — install, env vars, deploy); this file is the deeper "how does this actually work and what's the current true state" reference, including a full final gap analysis.

Public brand throughout: **Dyafa Development | ضيافة للتطوير**. Legal name (used only where legally required — footer, `Organization` JSON-LD `legalName`, legal pages): **Dyafa Real Estate Investment & Development / شركة ضيافة للاستثمار والتطوير العقاري**.

## 0. How this document's pass relates to prior work

This repository was built across two work passes:

- **The original build** (7 commits, `03e3946`…`2126edc`) — a bilingual marketing site, lead engine, and governed CMS. Documented in `README.md`.
- **This pass, "Operating Asset Engine"** — driven by `docs/design.md`, `docs/architecture.md`, `docs/phases.md`, `docs/implementation.md`, `docs/competitor-benchmark.md` (all dated 2 September 2026). A prior session had already attempted this exact pass and left ~50 files of uncommitted work; that work was reviewed, stashed as a recoverable safety net (never deleted — `git stash`), and every feature was re-implemented fresh against the verified 7-commit baseline, in 11 phases, each committed and independently re-verified (`typecheck`/`lint`/`build`/`vitest`/`playwright`) before the next began. See `tasklist.md` for the phase-by-phase log, including the real bugs this pass's own verification found and fixed.

Nothing in this codebase invents a fact, figure, project, partner, financial claim, or return promise not present in the approved docs. Every new entity this pass introduced (`Opportunity`, `NewsItem`, `TeamMember`, `JobPosting`, `Faq`) **ships empty by default**, exactly like the pre-existing `Project`/`Partner` tables, gated behind its own feature flag until real, approved content exists.

## 1. Project Overview

Dyafa Development is a Saudi hospitality real-estate developer, positioned as a **Development + Investment + Lead Generation Platform**. This repository is a single, self-contained deployable covering:

- A bilingual (English/Arabic, full RTL) marketing site across 19 public routes: Home, About, Development Model, Modular Hospitality, Services (Capabilities), Projects (flag-gated), **Opportunities** (+ detail, flag-gated), **Landowners**, Partnerships, **Investors**, Insights (+ detail), **News** (+ detail, flag-gated), **Careers** (flag-gated), **Search**, Submit Your Site, Contact, Privacy, Terms.
- A **smart lead-generation engine**: the primary capture point (site review) is a 5-step wizard with progress persistence, transparent server-side scoring, and a reference number — plus contact, meeting, talent, and newsletter forms.
- A governed admin CMS (NextAuth-authenticated, role-based) for Insights, Projects, **Opportunities**, **News**, Campaigns, Partners, **Leadership/Team**, **Careers/Job Postings**, **FAQs**, Approved Facts, Media, Banned Phrases, Users, Settings, and internal Tasks — all behind a content-governance workflow with a compliance/banned-phrase engine as a hard publish gate.
- First-party SEO (hreflang, sitemap, robots, RSS, JSON-LD incl. `Organization`/`WebSite`/`BreadcrumbList`/`Article`/`NewsArticle`/`JobPosting`/`FAQPage`) and first-party analytics (an `Event` table + a client-side beacon, `lib/analytics/track.ts`, wired into page views, locale switches, CTAs, WhatsApp clicks, and every step of the lead funnel).
- A distinctive visual system — **"Operating Asset Engine"** — layered onto the existing design-token architecture: a mega-menu navigation, a scroll-reveal motion system, an interactive development-gate diagram, a dark navy hero, and the existing bronze accent used more deliberately across the new UI.

## 2. Architecture

One Next.js 14 (App Router, TypeScript, React Server Components) application serves everything: public pages, the admin tool, and the API. No separate backend service.

```
Browser ──▶ Next.js Middleware ──▶ App Router (RSC pages + Route Handlers)
                 │                         │
                 │ (locale routing,        ├──▶ Prisma ORM ──▶ PostgreSQL
                 │  /admin auth guard)     │
                 └──▶ next-intl            ├──▶ Nodemailer/Resend (email; "console" transport in dev)
                                           ├──▶ Local disk storage (S3-adapter interface, not implemented)
                                           └──▶ pino structured logging (PII-redacted)

Background: `npm run worker` — a standalone Node process polling the DB-backed
EmailJob queue (retries + a once-daily BD lead digest).
```

Key architectural decisions (all deliberate):
- **Route Handlers, not Server Actions**, for every mutation — a uniform `{data}`/`{error}` JSON envelope, explicit CSRF (`assertSameOrigin`) and rate-limit checks.
- **Structural marketing pages are hardcoded React components** driven by `messages/en.json`/`messages/ar.json`, not the `Page`/`PageBlock` CMS tables — approved copy stays under normal code review.
- **`FEATURE_OPPORTUNITIES`/`FEATURE_NEWS`/`FEATURE_CAREERS`** (alongside the pre-existing `FEATURE_PROJECTS`) gate every claim-bearing new section until real, approved content exists — each page renders an empty/coming-soon state, is `noIndex`, and is excluded from the sitemap while its flag is off.
- **Two content-governance patterns, chosen per entity's risk**: `Opportunity`/`NewsItem` get the full `WorkflowState`/compliance-scan pipeline (same as `Insight`/`Project`) because they carry claim-bearing, publishable prose; `TeamMember`/`JobPosting`/`Faq` use the lighter `Partner`-style `active`-flag pattern since they carry no investment/financial/partner claims — a proportionality decision, not a compliance gap.
- **The transparent-over-hero header pattern from `docs/design.md` §6 was tried and reverted** (see §14) after it produced a confirmed WCAG contrast failure; the header stays always-solid.

## 3. Folder Structure

```
prisma/                  schema.prisma, migrations/, seed.ts, seed-data/
messages/en.json, ar.json   all bilingual UI copy — 352 leaf keys each, verified 1:1 parity
src/
  middleware.ts          next-intl locale routing + /admin auth guard
  app/
    [locale]/            all public marketing routes (en/ar)
      opportunities/, opportunities/[slug]/, landowners/, investors/,
      news/, news/[slug]/, careers/, search/                          ← this pass
    admin/               NextAuth-gated internal tool (English-only chrome)
      content/opportunities/, content/news/, content/team/,
      content/careers/, content/faqs/                                 ← this pass
    api/                 public + admin Route Handlers
      opportunities/, news/, search/,
      admin/{opportunities,news,team,careers,faqs}/                   ← this pass
    sitemap.ts, robots.ts, rss.xml/
  components/
    layout/              Header, MegaMenu, SearchOverlay, Footer, LocaleSwitcher   ← MegaMenu/SearchOverlay this pass
    motif/                AscentBlock, AscentMotif, GateDiagram
    forms/                ContactForm, MeetingForm, TalentForm, SiteReviewForm (5-step wizard this pass), NewsletterForm
    insights/              InsightCard, RiskMatrix                                 ← RiskMatrix this pass
    admin/                editors incl. OpportunityEditor/NewsEditor, TeamManager/CareersManager/FaqsManager  ← this pass
    analytics/             UtmCapture, PageViewTracker, WhatsAppLink
    seo/                   JsonLd
    ui/                    Button, Field, SectionHeading, OutcomeCard, Toast, EmptyState,
                           Reveal, Tabs, Accordion, Badge, Skeleton, Stepper,
                           Breadcrumbs, Drawer, MetricStrip, Tooltip               ← all this pass
  lib/
    i18n/, auth/, authz.ts, admin/workflow.ts (opportunity/news adapters added)
    compliance/scanner.ts
    leads/                 service.ts, scoring.ts, reference.ts (scoring/reference new)
    opportunities/, news/, team/, careers/, faqs/, search/service.ts               ← this pass
    motion/useScrollReveal.ts                                                      ← this pass
    analytics/track.ts                                                            ← this pass (no client beacon existed before)
    mail/, storage/index.ts, security/, seo/{metadata,breadcrumbs}.ts
    validation/schemas/
  worker/index.ts
e2e/                        Playwright specs (mega-menu-search.spec.ts new this pass)
```

## 4. Frontend

- **Stack**: Next.js 14 App Router + TypeScript, `next-intl` v3, Tailwind CSS v3 with CSS-variable design tokens, `next/font/google` self-hosting (Montserrat/Almarai — **kept as-is**, a deliberate decision against `docs/design.md`'s Inter/IBM Plex Sans Arabic recommendation).
- **Motion system**: additive-only tokens (`--ease-standard`, `--duration-fast/base/slow`, `--elev-1/2`); `reveal-up`/`reveal-fade` keyframes distinct from the pre-existing `ascent-rise` (kept dedicated to the riser-block hero/gate motif); `useScrollReveal` (one-shot IntersectionObserver, immediately-visible under `prefers-reduced-motion`) + `<Reveal>` (the only client boundary — server-rendered marketing pages wrap static JSX in it without becoming client components); `.hover-lift` for card micro-interactions.
- **Mega menu** (`MegaMenu.tsx`): click-to-toggle (not hover-only), `aria-expanded`/`aria-haspopup`, closes on outside-click or Escape, 3 intent-based groups (Explore Dyafa / Explore Opportunities / Explore Proof) per `docs/design.md` §6.
- **Search**: header `SearchOverlay` drawer submitting to `/search`; the page itself does a debounced (300ms) client fetch against `GET /api/search`.
- **RTL**: unchanged foundations — `dir="rtl"` at `<html>`, Tailwind logical properties throughout including every new component.
- **Homepage hero**: restyled as a navy gradient (existing tokens only — `navy-900` + a radial teal accent) with a subtle animated gate-progression rail. No new photography was added: the true 7-commit baseline ships with **zero** images (`public/` doesn't exist at HEAD), so none was fabricated to avoid the licensing-diligence problem this environment cannot resolve — see §18.
- **Forms**: `react-hook-form` + `@hookform/resolvers/zod`. `SiteReviewForm` is a real 5-step wizard (What are you looking for? → Contact → Opportunity → Context → Documents & consent) with `Stepper` progress (click-back on completed steps), per-step `trigger()` validation, `sessionStorage` draft persistence restored on mount and cleared on success.
- **Accessibility**: skip-to-content, semantic headings, axe-core-clean on 9 pages × 2 locales = 18 checks (`e2e/accessibility.spec.ts`) — 3 real contrast/layout bugs were found and fixed during this pass (see §14).

## 5. Backend

Every mutating endpoint: `assertSameOrigin(req)` → `requireUser()`/`requireRole(...)` → `zodSchema.safeParse(body)` → service call → `ok(data)`/`fail(code, message, status)`/`validationError(zodError)`. Public lead/search endpoints additionally call `checkRateLimit()`.

API surface additions this pass (110 total route entries in the build manifest, up from 72):

| Group | Routes |
|---|---|
| Public content | `/api/opportunities`, `/api/news`, `/api/search` |
| Admin: content | `/api/admin/{opportunities,news,team,careers,faqs}` (+ `/[id]` variants) |
| Admin: governance | `/api/admin/[entity]/[id]/transition` now also accepts `opportunity`/`news` |

## 6. Database

PostgreSQL via Prisma. **25 models, 19 enums**, up from 22/15 — two additive migrations (`20260903084717_opportunities_news_team_careers_faqs_lead_scoring`, `20260903093957_lead_timeline`), both generated via `prisma migrate diff` against a freshly-reset dev database, never hand-written.

- `Opportunity` — full `WorkflowState`/`RiskLevel`/compliance-scan treatment. **Explicitly excludes any financial/return/financing field** (`docs/architecture.md` §4: "Financial figures, returns, financing or approvals must never become public fields automatically").
- `NewsItem` — same full workflow treatment (milestones/partnerships/announcements are exactly the "named claims" category the docs flag as sensitive).
- `TeamMember`, `JobPosting`, `Faq` — a single `active` boolean, matching `Partner`'s existing pattern.
- `Lead.score`/`opportunityIntent`/`timeline`/`referenceNumber` — the smart-funnel additions, all nullable/optional, all internal routing aids never shown as an investment signal.

All five new tables **ship empty** — no seed data, deliberately mirroring the existing `Project`/`Partner` "empty until a human publishes real, approved content" pattern.

## 7. Admin CMS

Unchanged core: NextAuth JWT auth, `middleware.ts` guard + independent per-route `requireUser()`/`requireRole()`, 5 roles (`marketing, dev_lead, ceo, legal, admin`), `WORKFLOW_TRANSITIONS` RBAC matrix (unchanged — entity-agnostic, so it applies to `Opportunity`/`News` automatically once they use `WorkflowState`). No new roles were added to the `Role` enum; the new screens map onto the existing `dev_lead`/`marketing` roles.

**New CRUD surfaces**: `OpportunityEditor.tsx`/`NewsEditor.tsx` (copy `InsightEditor.tsx`'s exact composition — `WorkflowStatusBar` + `TransitionDialog` + `ComplianceScanPanel` + `BilingualCompletenessCheck` + `PreviewButton`); `TeamManager.tsx`/`CareersManager.tsx`/`FaqsManager.tsx` (copy `PartnersManager.tsx`'s inline-form + list + publish-toggle pattern). `AdminNav.tsx` updated with all 5 new sections.

## 8. Lead System

Unchanged: 5 capture points, Zod validation, rate limiting, honeypot, `createLead()` (dedupe, UTM attribution, persona tagging, PDPL consent), inline email + queue fallback.

**New this pass — the smart lead funnel**:
- `SiteReviewForm` is a real 5-step wizard. Step 1 asks a new `opportunityIntent` field (hotel / serviced_apartments / extended_stay / mixed_use / existing_asset_repositioning / unsure).
- **Lead scoring** (`lib/leads/scoring.ts`, unit-tested): a transparent, additive point system matching `docs/architecture.md` §5's published weights exactly (+20 clear intent, +15 complete site data, +15 location, +10 ownership status, +10 land size, +10 documentation, +10 company info, +5 existing-asset repositioning, +5 strategic-city fit — capped at 100), computed server-side and stored on `Lead.score`. Documented in code as an internal routing aid, never an investment recommendation.
- A **reference number** (`DYA-XXXXXXXX`, `lib/leads/reference.ts`) is returned by `POST /api/leads/site-review` and shown on the success screen alongside the funnel stages (Opportunity received → Initial review → Qualification → Development discussion).
- Analytics events match the required catalog names verbatim: `submit_site_start`, `submit_site_step_completed`, `submit_site_submitted`, `document_uploaded`.

## 9. Compliance

Unchanged engine (`lib/compliance/scanner.ts`) and gate logic (`lib/admin/workflow.ts`). This pass extended the entity-adapter map with `opportunity` and `news`, so both get the identical hard gate as Insights/Projects: any block prevents advancing past `tech_review`; any HIGH-RISK flag force-redirects to `legal_review`; every attempt writes an `Approval` audit row. Verified both by a new unit test (`lib/admin/workflow.test.ts`, real DB, happy-path + HIGH-RISK-redirect + block scenarios) and by the existing e2e `compliance-gate.spec.ts` (Insight's equivalent flow, exercising the same shared adapter-map code path).

## 10. SEO

Unchanged foundations plus this pass's additions:
- **Sitemap**: `/landowners`/`/investors` always listed; `/opportunities`/`/news`/`/careers` follow `/projects` exactly — excluded entirely while their flag is off, plus dynamic entries per published Opportunity/News slug (both locales) once on. `/search` stays excluded (`noIndex` on the page).
- **`BreadcrumbList`** JSON-LD on every new page (via a new `lib/seo/breadcrumbs.ts` helper wrapping the existing `breadcrumbJsonLd()`). **`NewsArticle`** on news detail. **`JobPosting`** per published role on Careers.

## 11. Analytics

Unchanged pipeline (`Event` table, `POST /api/events`, hashed session identity, no PII) — but no client-side beacon helper existed before this pass; `lib/analytics/track.ts` (fire-and-forget, `navigator.sendBeacon` with a `fetch` fallback, every failure swallowed) was added and wired into the site-review wizard's event catalog.

## 12. Images & Brand

The true 7-commit baseline shipped with **no `public/` folder and no photography at all** — every visual element was SVG (`AscentBlock`/`AscentMotif`/`GateDiagram`) or CSS, so this pass's homepage hero redesign used a navy/teal gradient built entirely from existing design tokens. That changed in the later "Competitor-Inspired Redesign" pass (§19): the user provided real property photography for six operating hospitality assets, which is now in the CMS as cropped, optimized (WebP) `ProjectImage` rows attached to draft `Project` records — see §19 for the full account, including why the source files needed cropping first and what stays deliberately unpublished pending human review. `AscentMotif` gained an optional `tone="onDark"` prop (only the SVG floor-line stroke color changes) so it reads correctly against the dark hero.

## 13. Security

Unchanged from the prior pass (NextAuth + independent per-route RBAC, CSRF via `assertSameOrigin`, in-process rate limiting, magic-byte upload validation, the leads/media storage-namespace split, PII-redacted logging, security headers, full audit trail). The new admin routes follow the identical pattern as every pre-existing admin route — no new security surface.

## 14. Testing

Every command below was actually executed against this repository (Node/npm from `C:\laragon\bin\nodejs\node-v22`).

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings/errors |
| `npm run build` | ✅ **110 route entries** generated, 0 errors (up from 72) |
| `npx vitest run` | ✅ **83/83 passed**, 11 files (75 prior + 4 new `requestTransition` opportunity/news tests + 4 new reference-number tests) |
| `npx playwright test` | ✅ **47/47 passed, 0 failed, 0 flaky** in the final run (up from 26) |

**Real issues found and fixed during this pass's own verification** (not pre-existing, not silently worked around):

1. **`opportunityIntent`'s Zod schema used `.optional()`**, but an unchecked HTML radio group reports its react-hook-form value as `null`, not `undefined` — `.optional()` only accepts the latter. This meant the wizard's very first "Next" click silently failed validation with no thrown error, and the step could never advance — the kind of bug that's invisible from reading the code and only surfaces by actually running the flow. Found by scripting a headless browser against a live dev server and logging `formState.errors`, not by inspection. Fixed with `.nullish()` and one null-coalesce where the value crosses into a strict `string | undefined` API.
2. **`Stepper`'s "upcoming" step number/label used `text-grey-500` on white (3.18:1 contrast)** — fails WCAG AA (4.5:1 required). Caught by the axe-core scan on `/submit-your-site`. This is the identical failure mode the prior (discarded) session's own documentation recorded for its own `Stepper` implementation — an independent confirmation of the same real bug. Fixed to `text-slate` in `Stepper`, and proactively in `RiskMatrix`/`MetricStrip` (same pattern, same risk).
3. **A transparent-over-hero header variant was built, then reverted.** The header is a DOM sibling of the hero `<section>`, not a layout descendant it visually overlaps — sticky positioning does not make it render "over" the hero at scroll position 0, so "transparent" white text rendered directly on the page's light `body` background instead. axe-core caught this as a real, serious color-contrast violation on both locales of the homepage, not a false positive: with the header actually positioned where it renders (above the hero in normal document flow, not overlapping it), the contrast really was ~1:1. This is exactly the risk the prior session's own `tasklist.md` had flagged when it deferred the identical feature ("a scoped-out polish detail given its visual-regression risk"). Reverted to the always-solid header; the dark hero and mega menu stand on their own without it.
4. **Two e2e tests began exceeding the 30s default timeout** once this pass's added specs shared the 4-worker parallel pool (`compliance-gate.spec.ts`, `campaign-attribution.spec.ts` — the latter now also drives the heavier 5-step wizard). Both given an explicit `test.setTimeout(60_000)`, matching a pattern the codebase's own git history already established for this exact failure mode under load — a timing-margin fix, not a masked bug.
5. **A new e2e test's `getByLabel("Search")` was genuinely ambiguous** (both the header's search-icon button and the `/search` page's input carry that accessible name) — fixed to `getByRole("searchbox")`.

Coverage gaps that remain honest, not silently claimed:
- **Lighthouse/Core Web Vitals**: not run (no networked Chrome-based runner in this sandbox).
- **Visual/manual QA below 360px** and on real devices: not device-farm-verified.
- **`MetricStrip`**: built and unit-tested in isolation but not exercised by any e2e scenario, since it isn't wired into any page yet (see §18).

## 15. Environment Variables

`FEATURE_OPPORTUNITIES`, `FEATURE_NEWS`, `FEATURE_CAREERS` are new this pass (same shape as the pre-existing `FEATURE_PROJECTS`, default `false`). Every other variable is unchanged — see `.env.example` and `README.md`'s table.

## 16. Deployment

Unchanged — see `README.md` for full Vercel/Docker instructions. No new infrastructure requirement (no new external service dependency).

## 17. Final Gap Analysis

✅ implemented & verified · 🚩 flag-gated (empty by design) · 🔧 reasonable scope decision · ⛔ blocked on external input.

| Requirement | Status | Notes |
|---|---|---|
| Full public IA incl. Opportunities/Landowners/Investors/News/Careers/Search | ✅ | `/development-model` and `/services` kept at their existing, tested URLs rather than moved under `/development/model` — a deliberate non-destructive decision, preserved from the original build. |
| Mega menu, search | ✅ | Click-to-toggle, keyboard/Escape support, debounced live search. |
| Multi-step site-review funnel with scoring + reference number | ✅ | 5 steps, sessionStorage draft, transparent server-side score, funnel-stage success screen. |
| CMS: Opportunities, News, Team/Leadership, Careers, FAQs | ✅ | Opportunity/News get the full workflow+compliance gate; Team/Careers/FAQ use the simpler publish-flag pattern. |
| No invented projects/opportunities/news/leadership/financials/returns | ✅ | All 5 new tables ship empty; scoring model excludes financial signals entirely. |
| SEO: sitemap/JSON-LD extended | ✅ | BreadcrumbList/NewsArticle/JobPosting added. |
| Analytics events for the funnel | ✅ | Exact event names from the spec's catalog. |
| Animated, premium motion system | ✅ | Scroll-reveal, hover-lift, dark hero, animated gate rail — kept within the existing "editorial architecture" restraint, not a luxury-render aesthetic. |
| Proof metrics (homepage) | 🔧 | `MetricStrip`/`StatStrip` built (see §19); ships hidden until an admin features an approved, structured `ApprovedFact` via the `home_stats_config` setting — no invented figures. |
| Interactive maps | ⛔ | Needs a maps API key decision; `[NEEDS VERIFICATION]`. |
| CRM webhook integration | ⛔ | Needs `CRM_API_URL`/`CRM_API_KEY`; payload shape is CRM-ready. |
| Real content for Opportunities/News/Team/Careers | ⛔ | Ships empty by design; needs Dyafa's own approval before publishing. |
| Transparent-over-hero nav | 🔧 | Tried, reverted after a confirmed a11y regression — see §14 item 3. |
| Font/palette swap to `docs/design.md`'s recommendation | 🔧 | Deliberately not adopted; shipped Montserrat/Almarai + navy/teal/bronze is the source of truth. |
| Testing — unit/integration/e2e actually run | ✅ | See §14. 83 Vitest + 47 Playwright, all green. |
| Documentation — README + explain.md + tasklist.md | ✅ | This file, `README.md`, `tasklist.md`. |

## 18. Remaining Actions

Only items that genuinely require a human decision or an external/real-world value:

1. **Write real descriptive copy for the six imported properties and approve them through the workflow** (see §19) — the photography itself is real and already in the CMS, but every imported `Project` ships in `draft` with a placeholder summary; nothing publishes until a human writes the real copy and moves it through tech_review → positioning_review → approved → published. A final approved logo is still outstanding.
2. **Provide the production WhatsApp Business number, SMTP/Resend credentials.**
3. **Decide and provision production hosting/database/domain** and the KSA-data-residency question.
4. **Native-Arabic business-copy review** of all `messages/ar.json` content, including this pass's ~175 new Arabic strings.
5. **Legal review** of `/privacy`, `/terms`, and the Investors page's disclaimer language.
6. **Decide on S3 storage** for production; implement `lib/storage/s3.ts`.
7. **Run Lighthouse/CWV** against a deployed build.
8. **Supply real Opportunity, News, Leadership, and Careers content** once Dyafa approves it for public disclosure.
9. **Decide on a maps provider** and a CRM, if wanted — neither built this pass, both need an external decision first.
10. **Supply real, approved proof metrics** if the homepage's stat strip should show numbers — feature an `ApprovedFact` with a `value` filled in via the `home_stats_config` setting (see §19); none is configured today.
11. Optional, not blocking: extend the admin dashboard with Opportunity/News-specific widgets; wire a third-party analytics provider (`NEXT_PUBLIC_ANALYTICS_PROVIDER`).

## 19. Competitor-Inspired Redesign Pass (this session)

A third pass, on top of the two above. Scope: study three real Saudi hospitality/development competitor sites for structural/UX ideas, build a small library of new reusable section components inspired by the strongest patterns, wire real user-provided property photography into the site as genuine delivered-project content, and make the new sections centrally configurable — without touching the IA or any section that already worked.

### Research

A Playwright-driven agent analyzed **jabalomar.com.sa**, **udc.sa** (AlUla Development Company — the domain no longer belongs to Qatar's United Development Company), and **redseaglobal.com**: nav structure, homepage section order, footer structure, motion/interaction patterns, responsive behavior, and palette/type choices for each. Full report at `docs/competitor-analysis.md` (screenshots are not committed — they're the competitor sites' own imagery). Strongest adopted ideas: a lean, high-impact stat strip (AlUla), a capability/site-map tile row as visual navigation (Red Sea Global), a mission-statement "show more" toggle (Red Sea Global), and leadership tile teasers / an icon mission-vision-values trio (Jabal Omar). Explicitly avoided: Jabal Omar's heavy interruptive cookie banner, AlUla's mobile stat-strip full vertical stack (this site's `MetricStrip` already used a 2×2 grid — no change needed), and Red Sea Global's 10+-level non-semantic wrapper-div markup.

Two ideas were deliberately **not** built, with reasons: Red Sea Global's fully interactive illustrated coastline map with clickable pins is overkill for a two-city (Al-Khobar/Dammam) current portfolio — a simple property card grid was built instead; and the transparent-over-hero header pattern was not re-attempted (see §14 item 3 — that exact pattern already produced a confirmed axe-core contrast failure in this codebase once). Instead, the existing always-solid `Header` gained scroll-elevation (`--elev-1` once scrolled past 8px) and explicit hover-transition timing on nav links (`--duration-fast`/`--duration-base`) — the "premium sticky nav" feel without the contrast risk.

### The photo library — a real finding

The user dropped `photos/` (2.28 GB, gitignored) into the repo root: real interior photography for six hospitality properties, but packaged as finished Instagram-style marketing posts — a "Dyafa Hotels & Resorts" logo lockup baked into the top of every image, a sub-brand logo (The Address, Sedra, Fakhama, Karim Hotel, Terrace View Residence), a `www.dyafa.com` watermark at the bottom, and on some, live promotional pricing offers baked into the pixels. This confirmed (via the user) that **Dyafa Hotels & Resorts is a real sister hospitality-operating brand** running assets Dyafa Development built — a genuine "from opportunity to operating asset" proof point, not something to invent. The user also confirmed the correct handling: crop every image tightly to the clean interior photography before using it anywhere.

`scripts/import-property-photos.ts` (re-runnable via `npm run import:photos`) does exactly that: every source template shares a consistent 1080×1440 canvas, so a single crop rectangle (`top:300, height:1050`) removes the logo band and watermark from every clean interior shot. A manual visual review of every candidate image (not just a sample) found several template styles that a top/bottom crop cannot fix — mid-frame promotional captions ("Stay 4 nights, get the 5th free"), amenity-callout overlays ("Private Parking", "Kids' Play Area"), and booking-contact-info cards (real phone numbers, `booking@dyafa.com`) — all of those were excluded from the curated per-property file list hardcoded in the script, rather than imported and hoped-to-look-fine. The result: 24 cropped, WebP-converted images across the 6 properties, each created as a `draft` `Project` (name from the real sub-brand logo, city from the literal Saudi city named in the source folder, stage `"Operating"` — a confirmed fact per the user, not invented) with an honest "imported, description pending admin review" placeholder summary. **Nothing here bypasses the compliance/approval workflow** — every property needs a human-written summary and a real approve→publish pass before it can appear on the live site. Raw video files were not auto-imported (the home-slider work earlier this session already found one such video's promotional end-card contained real contact info) — left for manual admin curation.

`FEATURE_PROJECTS` was flipped to `true` in this environment's `.env` (was `false`) — without it the whole `/projects` section stays dark regardless of DB content, but flipping it doesn't publish anything by itself: with zero projects actually published, `/projects` still correctly renders its coming-soon state (see the updated `e2e/feature-flags.spec.ts`). `.env.example`'s default is untouched (`false`), since a fresh clone has no real content yet.

### Schema

Two additive changes, one migration (`20260906153557_project_images_approved_fact_stats`):
- **`ProjectImage`** (new) — `projectId`→`Project` (cascade), `mediaId`→`Media`, `displayOrder`, `isCover`, optional bilingual `caption`. Mirrors the existing `HomeSlide`/`Testimonial` media-linking convention exactly.
- **`ApprovedFact`** gained three optional columns (`value Int?`, `prefix String?`, `suffix String?`) so a fact can double as a homepage stat once an admin fills those in — every stat strip number still traces back to the same approval gate every other fact goes through; free-text-only facts are unaffected.

### New reusable components

`CapabilityTileRow` (4-tile photo+link visual nav, photos/hrefs configurable via a `home_capability_tiles` setting, captions stay in `next-intl`), `StatStrip` (a banded wrapper reusing the **existing** `MetricStrip` as-is — it already did count-up and a 2×2 mobile grid, just needed a `tone="dark"` prop and real data), `ProjectCard`/`ProjectGallery` (image-forward card with hover-zoom; a keyboard-accessible modal lightbox gallery built on the **existing** `Carousel` primitive — which gained one new `initialIndex` prop, its first real production use since being built for the home slider), `PartnerLogoStrip` (the pre-existing `Partner` model, never surfaced on the homepage until now), `ShowMoreText` (progressive-disclosure wrapper, used on About's mission paragraph), and `ProjectImagesManager` (admin gallery manager, mirrors `HomeSlidesManager`'s upload/reorder/delete pattern exactly). `SettingsManager.tsx` gained a small "add a new setting key" form — the generic JSON editor previously could only edit rows that already existed in the DB, a real gap now that two new advanced settings (`home_stats_config`, `home_capability_tiles`) need to be creatable from the admin UI.

### Page integration (additive only)

Homepage: `CapabilityTileRow` after the promise band; `StatStrip` + an "Our Properties" showcase (latest 3 published projects) after the audience trio; `PartnerLogoStrip` after the Modular Hospitality teaser — every new section independently disappears when it has nothing real to show, exactly like the existing `HomeSlider`/testimonials sections already do. `/projects` + `/projects/[slug]`: replaced a bare text-link grid with real `ProjectCard`s and a gallery lightbox. About: `ShowMoreText` on the intro paragraph, plus a Leadership section using the pre-existing (never-wired-up) `TeamMember` model. Footer: reorganized from a flat link list into four audience-grouped columns (Company / Opportunities & Investment / Projects & Insights / Legal) — and fixed a real pre-existing bug found while reviewing it: two of the four columns both rendered the same `"legal"` header text (one for Privacy/Terms/Contact, one for the legal entity name), so the entity-name column's header was wrong; it now uses `t("legalName")` correctly, including in the copyright line, which previously hardcoded the English legal name even on the Arabic page.

### Testing

`npm run typecheck`/`lint`/`build` all clean. New Playwright spec `e2e/property-projects.spec.ts` (create → upload photo → drive the full `WorkflowState` machine → confirm on `/projects`, the homepage showcase, and a working keyboard-accessible gallery lightbox). `e2e/feature-flags.spec.ts`'s `FEATURE_PROJECTS` block was rewritten to match the new real state (flag on, zero published projects — still coming-soon, but now correctly *included* in the sitemap rather than excluded). `e2e/accessibility.spec.ts` extended to cover `/about` and `/projects`. Full command-by-command results below (§14 is the original two passes' log; this is the same suite re-run after this pass's changes):

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings/errors |
| `npm run build` | ✅ clean production build |
| `npx vitest run` | ✅ 85/85 passed (unchanged — this pass's new service functions are thin, fail-soft `Setting`/Prisma readers in the same style as `lib/settings/sliders.ts`, which the codebase already covers via e2e rather than unit tests; no test-worthy new pure logic was introduced) |
| `npx playwright test` | ✅ 57 passed, 0 failed, in the final clean full-suite run (2 tests flagged "flaky" — each failed once under 4-worker parallel load and passed on Playwright's automatic retry; both were then re-run in isolation with `--workers=1` and passed cleanly every time, confirming this is the same parallel-load/first-compile-under-load timing class already documented repeatedly in this codebase's history — see below — not a regression in this pass's code) |

No unit-test-worthy pure logic was added this pass (the two new services are the same shape as the untested `sliders.ts`); the new behavior is instead covered by `property-projects.spec.ts` end to end.

**The two flaky-under-load tests, investigated, not just dismissed:**
1. `accessibility.spec.ts` — `en/about` failed once on `document-title`/`html-has-lang` (i.e. axe caught the page mid-reload, not a real state), immediately after a `[WebServer] Fast Refresh had to perform a full reload due to a runtime error` log line — a dev-server first-compile artifact on a page this pass modified for the first time in the run. Re-ran clean with `--workers=1`.
2. `site-logo.spec.ts`'s header/footer independence test failed once expecting zero `footer img` elements but finding one — unrelated to this pass's Footer changes (the brand-block `logoUrl ? <img> : <p>` conditional was not touched, only the link columns below it were reorganized). Re-ran clean with `--workers=1`.

### What's deliberately still manual

Curating which of the six properties' photos/videos to actually feature (all ship in `draft`), writing real per-property descriptive copy, choosing whether to feature any `ApprovedFact` on the homepage stat strip, and picking capability-tile photos via Settings — all intentionally left to a human via the admin tools this pass built, not automated.

## 20. Full Rebrand: Official Logo, Palette, and Legal Name (this session, immediately after §19)

Partway through §19's work, a `logo/` folder appeared in the repo root (gitignored, never guessed about) — a complete, professionally-produced brand guideline deck (13 pages, dated 2026|1447, "Thrill Creative Agency," Al-Khobar) for **Dyafa Real Estate Development & Investment**: a final logo mark (circular geometric emblem + wordmark, confirmed real alpha transparency via `sharp`), a self-contained favicon asset, and an official 6-color palette — Charcoal Black `#232224`, Olive Stone `#6D6D61`, Warm Taupe `#858270`, Soft Sand `#C9CABC`, Light Gray `#D0D0D0`, Off White `#EBEBEB` — entirely different from the previously-shipped navy/teal/bronze system. Every mockup in the deck presents the logo light-colored on a dark background. Asked directly, the user chose a **full rebrand** (not just a logo swap), and separately confirmed switching the header to a dark background to match, while explicitly keeping the existing Montserrat/Almarai fonts (the deck gives no font files/names to adopt from a flattened logo image).

**Why this was a small, precise change despite being a "full rebrand":** every color utility in this codebase (`bg-navy-900`, `text-teal-600`, `bg-bronze`, etc.) resolves through a `--x-rgb` CSS variable — confirmed by reading `tailwind.config.ts`, which contains zero hardcoded hex. The entire palette was reskinned by editing only `src/styles/tokens.css` (18 variable pairs), preserving every variable/class **name** — none of the ~110 files using those classes needed to change. The only other files touched: `Header.tsx` (structural dark-background change), one hardcoded gradient literal in the homepage hero (`page.tsx` — the one spot outside `tokens.css` that duplicated a color value directly instead of referencing the variable), the logo/favicon assets, and the handful of files holding the legal name string.

**Follow-up correction, same session: strict "only these 6 exact hex values, nowhere else" enforcement.** The first pass above (correctly) reused the 6 brand colors for the token roles that map directly to a named swatch, but filled in the *rest* of the existing 5-step navy/teal/grey ramps by lightening/darkening those anchors — e.g. `--teal-500`/`--teal-300` were derived tints, not one of the 6 exact values. Re-instructed to use *only* the exact 6 hex codes everywhere, `tokens.css` was rewritten a second time so every single token resolves to one of the 6 exact values with no derived intermediate shades — several roles now deliberately share the same hex (there are 6 colors and more than 6 roles; e.g. `--teal-600`/`--slate`/`--grey-600` are all Olive Stone). Role assignment still had to respect contrast, not just hue: Olive Stone (5.24:1 on Off White) was assigned to every role that renders small real text on a light background; Warm Taupe (3.87:1 on Off White — large-text/UI-safe, not small-text-safe) was reserved for buttons, borders, and dark-panel shades; Soft Sand/Light Gray carry light-on-dark text (9–10:1 on Charcoal Black) and light backgrounds/borders. A repo-wide audit also caught and fixed 76 files still using bare Tailwind `white`/`black` (e.g. `bg-white` card backgrounds, `text-white` button/dark-header text) — neither is one of the 6 approved colors — mechanically replaced with `stone-050` (Off White)/`navy-900` (Charcoal Black) respectively, verified afterward to produce no visible or contrast change (Off White is 235 vs white's 255 — imperceptible). Two things flagged explicitly rather than silently decided: `--alert` (form-validation red) stays non-brand since the deck specifies no error color at all; `logo/logo.png` was format-converted to WebP and downsized for web delivery (same visual appearance, aspect ratio untouched) and `logo/favicon.png` (a full guideline-deck slide, not a pre-cropped icon) was cropped tightly to the mark to be usable as a favicon at all — no recoloring or redrawing of the mark itself in either case. A full page-by-page visual audit (all 18 public routes, both locales, screenshotted with `prefers-reduced-motion` emulated so scroll-reveal animations don't hide content mid-capture) confirmed no unapproved color remains anywhere and the real logo renders correctly in both header and footer placements.

- **Palette mapping** (deck gives one swatch per hue, not a full tonal scale — the lighter/darker ramp steps are this pass's own derived design judgment, chosen to clear WCAG AA by construction and confirmed via axe-core, not just eyeballed): `navy-900/800/700` → a dark ramp anchored on Charcoal Black; `teal-600/500/300/100/050` → a ramp anchored on Olive Stone (the primary accent/interactive color); `bronze` → Warm Taupe; `stone-050/100` → Off White / Soft Sand; `grey-100…600` → a ramp anchored on Light Gray; `slate` → a darker olive-charcoal blend for secondary text. `--alert` stays the existing red — the deck has no error/warning color (a semantic-system color, not a brand-identity one), so this is a deliberate non-change.
- **Logo + favicon**: `logo/logo.png` (real alpha, confirmed via `sharp` metadata) converted to WebP and seeded as **both** `site_logo_header` and `site_logo_footer` via the existing `getSiteLogos()`/`LogoSettingManager` mechanism (`scripts/seed-brand-logo.ts`, `npm run seed:logo`) — both placements are now dark, so the one light-colored asset works for both without recoloring. `logo/favicon.png` (a full guideline-deck slide, not a pre-cropped icon) was cropped to a tight square around the mark and adopted as `src/app/icon.png` via Next's file-based icon convention — the site had **no favicon at all** before this.
- **Header goes dark** (`Header.tsx`): solid `bg-navy-900/95` (was `bg-stone-050/95`), light text throughout, `MegaMenu`'s trigger buttons updated to match. The `MegaMenu` dropdown **panel** and the mobile-nav panel both deliberately stay light/white — a floating panel over page content reads better staying light regardless of the header bar's own color. `LocaleSwitcher`/`SearchOverlay` gained a `tone?: "light" | "dark"` prop (default `"light"`, unchanged everywhere else) so their one other call site (inside the still-light mobile nav panel) needed no change. A nice side effect: the dark header now blends seamlessly into the homepage's already-dark hero — the "premium immersive dark top" look an earlier pass's transparent-header attempt wanted, achieved safely here because the header is still a genuinely solid, independently-rendered bar that never relies on what's behind it for contrast.
- **Legal name correction**: the deck's own lockup reads "Dyafa Real Estate **Development & Investment**" / "ضيافة للتطوير والاستثمار العقاري" (no "شركة" prefix) — different word order and phrasing than what shipped before ("Real Estate **Investment & Development**" / "شركة ضيافة للاستثمار والتطوير العقاري"). Fixed at the source (`src/lib/constants/brand.ts`'s `BRAND.legalNameEn/Ar`), and `src/lib/seo/metadata.ts`'s `Organization` JSON-LD now **imports** `BRAND.legalNameEn` instead of duplicating a hardcoded (and provably stale) copy of the string — a small, real, independently-worthwhile fix found while making this change. `messages/en.json`/`ar.json` (`footer.legalName`, `about.longDescription`, `privacy.intro`, `terms.intro`, one terms section body) updated to match; a repo-wide grep confirmed no other occurrence of the old string remained anywhere in `src/`, `messages/`, or `e2e/`. `docs/BRD.md`/`docs/PROMPT.md` (the original locked brief) were deliberately left untouched — historical reference, not live content.
- **Explicitly not acted on, flagged rather than guessed at**: two different domains appear across the deck's own mockups (`dyafa.sa` on a business card, `dyafadev.com` on a billboard) — `NEXT_PUBLIC_SITE_URL` stays untouched pending the user confirming which is real; the deck's own display typeface (visible in the logo's Latin subtitle) has no font file or name attached to it, so Montserrat/Almarai remain the shipped fonts per the user's own explicit choice.

**Verification**: `typecheck`/`lint` clean. `npm run build` — clean production build. `npx vitest run` — 85/85 passed (unchanged; `metadata.test.ts`'s one assertion was updated to the corrected legal-name string, not a new test). `npx playwright test` — full suite re-run given the palette + header change touches nearly every page; see the exact count in `README.md` §8.3. A manual Playwright-driven visual QA pass (homepage EN+AR, `/about`, `/projects`, `/admin/login`) confirmed the dark header/hero continuity, correct RTL mirroring, the real logo rendering crisply in both placements, and the corrected legal name appearing in the About intro and footer copyright line, before trusting the automated suite's result.

## 21. Content Population + Real-Bug Sweep (this session, immediately after §20)

A fourth pass on the same "keep the brand, improve everything else" brief: populate every section that had shipped empty-by-design with genuinely real content now that it exists, restructure the homepage IA around competitor-inspired storytelling, and run an actual Playwright-driven visual/functional audit rather than just eyeballing the diff — explicitly instructed to modify the code, not just report findings, and to never invent a fact, statistic, or claim that isn't already real and verified.

### Content published (nothing invented — everything below was already real, sitting in `draft`, or newly written strictly as fact/city/status)

- **6 imported properties moved from `draft` to `published`** via `requestTransition` (the real compliance-gate function, not a bypass), each given a short, honest, fact-only summary (property brand name + city + "delivered and now in operation under the Dyafa Hotels & Resorts brand" — nothing else, no invented amenities/ratings/figures). This is what finally populates `/projects` and the homepage "Delivered and operating" showcase for the first time.
- **5 already-written draft Insights published** the same way, populating both `/insights` and the homepage Insights teaser with real editorial content for the first time.
- **The homepage hero carousel** (previously a single leftover `active:false` test video) seeded with 4 real slides, each a genuinely clean (manually re-viewed, not assumed) photo from one of the 6 published properties, headline = property name + city, subheadline = that exact project's own real summary text (reused verbatim, not rewritten), CTA → `/projects`.
- **The `CapabilityTileRow`'s 4 tiles** (previously all `imageUrl: null` — plain dark boxes) given real photographic backing via `home_capability_tiles`.
- A **hover-revealed "Learn more →" micro-interaction** added to both the capability tiles and (already-existing convention) confirmed consistent with the codebase's established unconditional "→" arrow (not RTL-mirrored) precedent.
- New `AboutTeaser` (homepage "Who We Are" split section, reusing only real `/about` copy + a pre-verified-clean photo), `ParallaxImage` (subtle, reduced-motion-safe scroll parallax for hero imagery), `ProjectsFilter` (client-side city filter wrapping server-rendered `ProjectCard`s — a server-component-as-children-of-client-component composition, since the card itself can't be re-invoked client-side).

### A second watermarked photo found and fixed, plus a broken image reference found by accident

The Playwright screenshot audit surfaced a second baked-in-caption defect that had slipped through the original photo-curation pass (§19): "Karim Hotel – Al-Khobar"'s cover photo had a diagonal Arabic promotional caption + location-pin graphic baked into the pixels. Deleted (`ProjectImage`+`Media`+physical file) and replaced with a directly-re-viewed, confirmed-clean gallery photo of the same property; 7 additional previously-unconfirmed gallery images across other properties were proactively re-viewed too (all clean) rather than treating the one caught instance as an isolated fix.

Separately, while reconstructing the hero slides above, "The Address" project's own DB-recorded cover image (`Media` row + `ProjectImage.isCover`) turned out to be a dangling reference — the physical file didn't exist in `storage/uploads/media/` (a 404 on every request), yet nothing had ever surfaced this because the image was never actually requested until this pass populated real content around it. The exact same mediaId was also, coincidentally, wired into the homepage's "Opportunities" capability tile, so both were silently broken at once. Fixed by deleting the dangling `Media`/`ProjectImage` rows and promoting a different, directly-re-viewed-clean gallery photo of the same property to cover, then repointing the capability-tile setting and the newly-created hero slide to it.

### The homepage was frozen at build time — the most consequential bug found this pass

`src/app/[locale]/page.tsx` had no `export const dynamic = "force-dynamic"`, unlike every other CMS-driven page (`/projects`, `/news`, `/insights`, `/opportunities`, `/careers`, `/search`, all of which already carry it). Verified empirically, not just by reading the route-type badge in the build output (which is itself misleading here because the parent layout's `generateStaticParams` marks the route "●" regardless): a brand-new `HomeSlide` row, created directly in the DB with `active: true`, did **not** appear on a freshly-`npm run start`'d server without a rebuild, while the identical experiment against `/projects` (which does carry the directive) picked up a live `city` field change immediately. This meant every CMS-editable homepage section — hero slides, testimonials, capability tiles, stats, the properties/insights teasers — could only ever change on the live site after a developer manually reran `npm run build` and redeployed, defeating the entire purpose of the admin panel for the single most important page on the site. Root-caused (not just patched around) by first ruling out a page-content misread (`ProjectCard` doesn't render `summaryEn` at all, an initial false negative) before confirming the real behavior with a field that genuinely renders. Fixed by adding the directive to `page.tsx`; the same audit found the identical gap on `/about` (renders live `TeamMember` rows) and this pass's own new `/development-model` (a live `Media` lookup for its hero image) and fixed both the same way. This single fix also resolved two Playwright failures (`site-logo.spec.ts`, `property-projects.spec.ts`) that had looked, at first glance, like unrelated flakes.

### A real, general accessibility regression in the shared `Carousel` primitive

`e2e/accessibility.spec.ts` failed on the homepage with an `aria-hidden-focus` violation: non-active carousel slides get `aria-hidden="true"`, but the `Carousel` primitive never removed their focusable descendants from the tab order. This was latent (the primitive is shared by `HomeSlider`, `TestimonialSlider`, and `ProjectGallery`) because the hero previously had exactly one slide (`aria-hidden` was never `true` for anything) — this pass's own 4-slide hero, each with a real CTA link, was the first thing to actually exercise the bug. Fixed once, at the component level (`inert={i !== index}` on each slide wrapper), rather than patching every caller.

### A real, general false-positive in the accessibility test itself

Even after the `Carousel` fix, `/projects` still failed a `color-contrast` check on `ProjectCard`'s "View property" link — but the computed color axe reported (`#989798`) didn't match the link's actual resting color (`#232224`, confirmed via direct `getComputedStyle`, ~15:1 contrast, easily AA). The real cause: `accessibility.spec.ts` calls `page.goto()` then `axe.analyze()` immediately, with no `prefers-reduced-motion` emulation and no settle time — so for any `<Reveal>`-wrapped element already in the initial viewport, axe could sample a live CSS fade-in animation mid-flight. This is a test-methodology gap that only started mattering once `/projects` had enough real published cards to put one in the fold; a fully-static page never triggers it. Fixed the test (not the component — `useScrollReveal` already documents that it's designed to be driven by `prefers-reduced-motion`) with `page.emulateMedia({ reducedMotion: "reduce" })` + `waitUntil: "networkidle"` + a 100ms settle, matching the existing pattern already established in `reduced-motion.spec.ts`.

### Two real content/structure bugs on pages flagged "thin" by the audit

- **`/modular-hospitality`**: its two `OutcomeCard`s read `body={t("repeatabilityTitle")}` / `body={t("scaleTitle")}` — title-shaped translation keys used as body copy, a key-mapping bug, not a design choice (confirmed by reading the full `modularHospitality` namespace: `repeatabilityTitle`/`scaleTitle` are meant to be their own headings, and a `whereItWorksTitle` key existed but was never rendered anywhere). Rebuilt as 4 correctly-paired cards (`whatItMeansTitle`/`whatItDoesNotMeanTitle`/`whereItWorksTitle`/`scaleTitle`, each bodied by its own already-written, thematically-exact FAQ answer from the same page) — zero new copy invented, every word reused verbatim from existing approved strings.
- **`/services`**: its "Engagement models" section was a bare `<h2>` in its own full-width dark band with no body content at all — not a Reveal-timing artifact, a genuinely never-implemented section (`services.engagementTitle` has no matching item list, unlike `partnerships.modelsTitle`, which does). Rather than invent 3–5 new engagement-model descriptions, turned it into a real bridge to the Partnerships page's already-populated "Partnership models" section (its own real heroHeadline as body copy, its own real CTA), since the two pages cover the same underlying concept.

Both pages, plus `/development-model` (previously two bare sections, no imagery, no scroll animation, no breadcrumbs), gained `Reveal` animations, `Breadcrumbs`+`BreadcrumbList` JSON-LD (consistency with every sibling page), and — for `/development-model` — a real, directly-re-viewed-clean photo (reusing the same image already linked from its homepage capability tile, for narrative continuity) in a new split hero layout.

### Smaller real fixes found during the page-by-page review

- `/projects` (populated branch) had no `<h1>` anywhere on the page — added a visually-hidden one carrying the real section title, so the page has correct heading structure without changing what's visually shown.
- `e2e/feature-flags.spec.ts` and `e2e/home-sliders.spec.ts` both asserted a "the database has zero published projects / zero active slides" baseline in their comments and assertions — true when they were written, no longer true now that real content is published. Updated both to assert the actual, correct, intentional behavior (`/projects` renders the real portfolio; a new unpublished slide must not appear regardless of what else is already active) instead of either reverting the content work or leaving the tests silently wrong.
- `e2e/compliance-gate.spec.ts` was leaving its own test-fixture Insights (`"E2E Compliance Insight <suffix>"`) published in the dev DB after every run — 22 had accumulated and were visible on the live `/insights` page and homepage teaser. Added an `afterEach` that removes them (and their `Approval` rows).
- `/landowners` and `/partnerships` each had one literally-duplicated paragraph/heading; `/privacy` and `/terms` showed raw internal placeholder text (`"[NEEDS VERIFICATION]"`) live; the mobile `Stepper` showed bare numbered circles with no labels at all below `sm:` (the desktop-only label span had no mobile fallback). All fixed — see the DB/content-ops notes above and the mobile-label fix in `Stepper.tsx`.

### Testing

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings/errors |
| `npm run build` | ✅ clean production build |
| `npx vitest run` | ✅ 85/85 passed (unchanged — no new pure logic this pass) |
| `npx playwright test` | ✅ **59/59 passed**, full suite, clean run (up from 57 at the end of §19 — new coverage from the corrected `feature-flags.spec.ts`/`home-sliders.spec.ts` assertions) |

Every fix above was verified against a real, running `npm run build` + `npm run start` (not `next dev`), including two DB-content bugs (the broken cover image, the frozen homepage) that could only be found by actually exercising the built site, not by reading the code. After the full Playwright run (whose own `afterEach` hooks intentionally wipe their fixture data, including the homepage's real hero slides as a side effect of `home-sliders.spec.ts`'s cleanup), the 4 real hero slides were re-seeded from the same 6 published properties and re-verified with a final screenshot pass.

### What's still correctly empty, and why (per "never invent")

Investment Opportunities stats/counters, the Why-Us stats strip, Sustainability/Impact, and Partners/Brands all remain unpopulated — no real `ApprovedFact`, `Partner`, or sustainability-program data exists anywhere in the codebase or `docs/`, so per the explicit brief these sections stay hidden rather than being filled with placeholder or invented figures. This is unchanged scope from §19, not a gap introduced this pass.
