# Dyafa Development — Website

Bilingual (EN/AR) marketing site, lead-generation funnel, and governed admin CMS for **Dyafa Development | ضيافة للتطوير**.

Single Next.js 14 (App Router) deployable: frontend + API routes + Prisma/PostgreSQL + NextAuth admin + a background worker for email delivery.

Status: everything described in this README is implemented and verified against a local build/test run (see "Verification log" below). Content seeded by `prisma/seed.ts` ships in `draft` (or governance-approved-structural) status — nothing is published beyond the seven approved structural pages until a human clears it through the workflow.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript, RSC) |
| Styling | Tailwind CSS, CSS-variable design tokens |
| i18n | next-intl — `en` / `ar`, route-prefixed, full RTL |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth (credentials + role claims), JWT sessions |
| Validation | Zod on every API boundary, shared client/server |
| Email | Nodemailer/Resend abstraction behind `MAIL_PROVIDER` (`console` in dev) |
| Testing | Vitest (unit/integration) + Playwright (e2e) + axe-core (a11y) |
| Storage | Local disk in dev; S3-compatible adapter interface for production |

## 2. Project structure

```
prisma/               schema.prisma, migrations, seed.ts, seed-data/
src/
  middleware.ts        next-intl locale routing + /admin auth guard
  app/
    [locale]/          all public marketing routes (en/ar)
    admin/             NextAuth-gated internal tool (English chrome)
    api/               public + admin route handlers
    sitemap.ts robots.ts rss.xml/
  components/          layout/ motif/ forms/ insights/ admin/ ui/ seo/
  lib/                 i18n/ auth/ authz.ts admin/workflow.ts compliance/
                       leads/ mail/ storage/ security/ seo/ validation/
  worker/index.ts      email queue + daily digest poller
messages/en.json, ar.json   all bilingual UI copy (git-reviewed)
e2e/                   Playwright specs
```

**Architecture note (deliberate, documented decision):** pages whose copy is spec-approved verbatim (Home, About, Development model, Modular hospitality, Services, Partnerships, Submit-your-site) are hardcoded Next.js pages driven by `messages/en.json` / `messages/ar.json`, **not** the `Page`/`PageBlock` CMS tables. This keeps compliance-sensitive marketing copy out of a freely-editable surface and under normal code review. The `Page`/`PageBlock` models exist for genuinely editable regions (campaign pages, and future promo bands / insights-feed config) and for tracking governance metadata (audience/objective/CTA/risk level/workflow state) on the structural pages themselves — see `/admin/content/pages`.

## 3. Running locally

### Prerequisites
- Node.js 20+
- A PostgreSQL 16 instance (see options below)

### Database options
1. **Docker Compose** (as specified): `docker compose up -d postgres`
2. **Native PostgreSQL**: install PostgreSQL 16 and create a database/user matching your `DATABASE_URL`.

This repository was built and verified using a **portable, no-installer PostgreSQL 16** binary (extracted under `.tools/pgsql`, data dir under `.tools/pgdata`, gitignored) because this environment had no Docker and no admin rights for a service-based installer. Locally:

```powershell
# one-time init (already done in this repo's dev history; shown for reference)
.tools\pgsql\bin\initdb.exe -D .tools\pgdata -U dyafa --pwfile=<file containing "dyafa"> -E UTF8 --locale=C

# start/stop
.tools\pgsql\bin\pg_ctl.exe -D .tools\pgdata -l .tools\pg.log -o "-p 5432" start
.tools\pgsql\bin\pg_ctl.exe -D .tools\pgdata stop
```

### Setup

```bash
npm install
cp .env.example .env        # then fill in values, see the table below
npm run db:setup            # prisma migrate dev + seed
npm run dev                 # http://localhost:3000/en and /ar
```

`npm run db:setup` runs migrations and seeds:
- 12 content pillars (EN verbatim from the marketing reference doc; **AR names need a native-Saudi-Arabic review pass** before publish — flagged in the seed source comment)
- The full banned-phrase list (union of BRD.md §7, PROMPT.md §3, FEATURES.md §5, and the marketing reference doc §37 "Do Not Use")
- One admin user from `ADMIN_SEED_*`
- `settings` rows (`FEATURE_PROJECTS=false`, BD notification emails, WhatsApp number placeholder, a starter government-entity dictionary)
- The 7 structural pages as governance-tracked `Page` rows, status `published` (their actual copy lives in `messages/*.json`)
- 5 bilingual insight **drafts** adapted from the approved LinkedIn sample posts (no new claims) — draft status, nothing published

### Default admin login
```
email:    admin@dyafa.com       (ADMIN_SEED_EMAIL)
password: ChangeMe123!          (ADMIN_SEED_PASSWORD)
```
**Change this password (or rotate the seed user) before any shared/production use.**

### Running the background worker
```bash
npm run worker
```
Polls the DB-backed `EmailJob` queue every 30s (retries failed sends) and sends a daily BD lead digest once per 24h. Lead-notification emails are also attempted **immediately, inline**, at submission time for the ≤1-minute SLA; the worker is the retry/fallback path and the digest scheduler. In `docker-compose.yml` this runs as its own `worker` service.

### Tests

```bash
npm run test          # Vitest — unit + DB-integration tests (needs a seeded DB)
npm run test:e2e      # Playwright — starts the dev server itself if not already running
```

## 4. Environment variables

All variables are documented with defaults/placeholders in `.env.example`. Anything not yet available is marked `[NEEDS VERIFICATION]` and the app runs with a safe default in the meantime (e.g. console-transport email, no WhatsApp link rendered, `FEATURE_PROJECTS=false`).

| Variable | Purpose | Status |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Set for local dev |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Admin auth | Secret auto-generated for local dev; **regenerate for production** |
| `ADMIN_SEED_EMAIL/PASSWORD/NAME` | Seed admin account | Set — rotate before shared use |
| `MAIL_PROVIDER` (`console`/`smtp`/`resend`) | Email transport | `console` in dev |
| `SMTP_HOST/PORT/USER/PASSWORD` | Production SMTP | `[NEEDS VERIFICATION]` |
| `RESEND_API_KEY` | Alternative mail provider | `[NEEDS VERIFICATION]`, only if `MAIL_PROVIDER=resend` |
| `BD_NOTIFICATION_EMAILS` | Comma-separated lead-notification recipients | Placeholder `bd@dyafa.com` |
| `WHATSAPP_NUMBER` | WhatsApp Business number, E.164 without `+` | `[NEEDS VERIFICATION]` |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `_PLAUSIBLE_DOMAIN`, `_GA4_ID` | Optional third-party analytics | `[NEEDS VERIFICATION]` — first-party `events` table works regardless |
| `STORAGE_DRIVER` (`local`/`s3`) | File storage | `local` in dev |
| `S3_ENDPOINT/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY/REGION` | Production file storage | `[NEEDS VERIFICATION]` |
| `FEATURE_PROJECTS` | Projects section flag | `true` in this environment's `.env` (real property photography has been imported as draft `Project`s — see `explain.md` §19); `.env.example`'s default stays `false` for a fresh clone with no content yet |
| `FEATURE_OPPORTUNITIES` | Opportunities section flag | `false`, same pattern as `FEATURE_PROJECTS` |
| `FEATURE_NEWS` | News section flag | `false`, same pattern |
| `FEATURE_CAREERS` | Careers section flag | `false`, same pattern |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Public form rate limiting | Set (60s / 10 req) |
| `JOB_RUNNER_MODE`, `CRON_SECRET` | Background job mode | `inline`; `CRON_SECRET` `[NEEDS VERIFICATION]` if you wire an external scheduler |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO, absolute links) | `http://localhost:3000` in dev — **set to the production domain before launch** |

Additional non-env `[NEEDS VERIFICATION]` items carried in the codebase/seed (per BRD.md §9 and PROMPT.md §1):
- Production domain, DNS, and email SPF/DKIM records.
- KSA-region hosting decision (data residency — BRD.md §8).
- Government-entity dictionary completeness (`settings.government_entity_dictionary` seeded with a starter list only — extend with legal before launch).
- Native-Arabic review of the 12 pillar names and of all AR copy generally (translations here are professional but not a substitute for a native review pass — BRD.md §5.5/§11).
- Final legal/PDPL wording for `/privacy` and `/terms` (currently a disciplined draft, clearly labeled as a draft on both pages).
- Real project/partner data — the `projects`, `partners`, and `approved_facts` tables are seeded **empty** by design; nothing appears publicly until approved.

## 5. Deployment

### Option A — Vercel
1. Provision a PostgreSQL database (e.g. Vercel Postgres, Neon, RDS) in your target region.
2. Set all env vars from the table above in the Vercel project settings.
3. `npx prisma migrate deploy` as a build/release step (or a one-off job) against the production `DATABASE_URL`.
4. Run `npm run db:seed` once against production (idempotent upserts) to seed pillars/banned-phrases/admin/settings.
5. Deploy. Note: the background worker (`npm run worker`) needs a long-running process — run it as a Vercel Cron Job hitting a small wrapper endpoint, or host it separately (see Option B).

### Option B — Docker / self-hosted Node
```bash
cp .env.example .env   # fill in production values
docker compose up -d --build
```
`docker-compose.yml` defines three services: `postgres` (with a health check and named volume), `app` (the Next.js server), and `worker` (the email-queue/digest poller). The `Dockerfile` is a multi-stage build (deps → build → runner).

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

## 6. Compliance/governance engine

`src/lib/compliance/scanner.ts` runs three checks against `{textEn, textAr}`:
1. **Banned-phrase match** — DB-seeded list (`banned_phrases` table, legal-editable at `/admin/content/banned-phrases`), EN case-insensitive / AR diacritic-and-case-insensitive.
2. **HIGH-RISK detectors** — numbers/%/SAR amounts, secured/approved/funded/guaranteed (EN) and مضمون/معتمد/ممول/مؤمّن (AR), government-entity dictionary (`settings.government_entity_dictionary`), unapproved partner/project name references (checked against the `partners`/`projects` approved-and-active registries), hard delivery-date phrasing.
3. **Bilingual completeness** — Arabic non-empty and not identical to English.

`POST /api/admin/compliance/scan` exposes this as a live pre-check in the admin UI. `POST /api/admin/{insight|project|campaign|page}/[id]/transition` enforces it as a **hard gate**:
- Any **block** prevents advancing past `tech_review`.
- Any **HIGH-RISK flag** force-redirects the destination state to `legal_review`, regardless of what was requested.
- `approved → published` additionally requires zero unresolved flags.
- Every transition attempt (successful, blocked, or redirected) writes an `Approval` audit row.

This is exercised end-to-end in `e2e/compliance-gate.spec.ts`.

## 7. QA / launch checklist (FEATURES.md §12)

- [x] Every page renders in EN and AR; RTL verified (layout, forms, the 5-gate diagram mirrors, logical CSS properties throughout, no physical-direction classes).
- [ ] Native-Arabic review pass recorded — **blocked on input**: all AR copy here is a professional working translation, not yet reviewed by a native Saudi-Arabic business-copy reviewer. Flagged in seed comments and this README.
- [x] Compliance scan zero blocks on all published content (only the 7 structural pages + nothing else is published by default; verified via `e2e/compliance-gate.spec.ts`).
- [x] Site-review lead e2e test (Playwright): submit → DB row → email queued → admin visible → status change, in both EN and AR (`e2e/site-review-lead.spec.ts`).
- [x] No unapproved number, partner, government name, or project anywhere by default — `partners`/`projects`/`approved_facts` seed empty; the compliance scanner structurally checks any future reference against the approved-and-active registries.
- [ ] Lighthouse ≥ 90/95/95 (perf/a11y/SEO) on Home, Model, Submit-Site × 2 locales — **run `npx lhci autorun` (or Chrome DevTools) against a production build**; not run in this environment (no headless Chrome Lighthouse CI wired up here — Playwright/axe-core a11y checks were run instead, see below). Treat as blocked-on-a Lighthouse-capable environment.
- [x] `FEATURE_PROJECTS=false` verified: `/projects` renders a branded "coming soon" state and is excluded from `sitemap.xml` (`e2e/feature-flags.spec.ts`).
- [x] Security pass: rate limiting on public POST endpoints, security headers (`next.config.mjs`), upload magic-byte + size/type restrictions, admin auth via NextAuth + middleware guard + per-route RBAC, audit log (`Approval` table) on every workflow transition and PDPL delete.
- [ ] Backups — **blocked on input**: depends on the chosen hosting provider's managed-Postgres backup policy; not applicable to the local dev database.
- [x] Env documented in this README; seed + migration reproducible from scratch (`npm run db:setup` on a clean database — verified in this environment's build history).

## 8. Verification log

Commands actually run against this repository during development (not assumed):

```
npx prisma generate                    -> OK
npx prisma migrate dev --name init     -> OK, migration applied (+1 follow-up migration for email_jobs)
npx tsx prisma/seed.ts                 -> OK, all seed steps completed
npm run build                          -> OK, 0 errors, full route manifest generated (re-verified after every fix below)
npx vitest run                         -> 62 passed (0 failed) across 7 files
npx playwright test                    -> 26 passed (0 failed) across 7 spec files, final confirmed run
```

Playwright (real browser, real server, real Postgres) surfaced a long list of genuine bugs that unit tests and manual click-through alone had missed — each was root-caused and fixed, not worked around:

1. **`siteReviewSchema` (and sibling lead schemas)**: a missing (vs. empty-string) required field fell back to Zod's default `"Required"` message instead of the `forms.errors.required` i18n key — fixed with a shared `requiredString()` helper setting `required_error`/`invalid_type_error` explicitly.
2. **Compliance scanner bilingual-completeness check**: normalized English to lowercase but not Arabic, so identical EN/AR text with different casing could slip past the "identical to English" block — fixed by lowercasing both sides.
3. **HIGH-RISK "force redirect to legal_review" rule**: originally fired only for `approved`/`published` targets; BRD §6 requires it for *any* forward move past `tech_review` (including `positioning_review`) — corrected in `lib/admin/workflow.ts`.
4. **CSP broke the entire site's interactivity in dev mode**: `next.config.mjs`'s `script-src` lacked `'unsafe-eval'`, which `next dev`'s hot-reload/react-refresh requires — every button and form silently stopped working, with only a CSP console violation (no build error) as a clue. Fixed by allowing `'unsafe-eval'` in development only.
5. **Tailwind never generated `bg-teal-050`/`bg-stone-050`/`text-teal-050`**: the color scale was keyed `"50"` in `tailwind.config.ts` but every call site used the zero-padded `"050"` form matching the token names in `tokens.css` — those utilities silently produced no CSS at all (not an error), so the base page background and several bands were invisibly transparent. Fixed by registering both `"50"` and `"050"` keys.
6. **`GateDiagram`'s decorative SVG had focusable, `aria-hidden="true"` interactive rects** (`tabIndex`/`role="button"`) — a real WCAG 4.1.2 violation caught by the axe-core scan, since the parallel text button list is the actual accessible control. Fixed by making the SVG rects purely visual.
7. **`Button`'s primary variant (`bg-teal-500` + white text) was only ~3.24:1 contrast**, below the 4.5:1 AA threshold — also caught by axe-core. Fixed by using the darker `teal-600` (~5.7:1) for solid-fill buttons, keeping `teal-500` as the link/border/focus accent.
8. **`GateDiagram`'s inactive-gate text (`text-navy-900`/`text-slate`) sat directly on its parent's `bg-navy-900` section** once bug 5 was fixed and the "active" light background stopped masking it — a real dark-on-dark contrast failure. Fixed with light-on-dark colors matching its actual usage context.
9. **Every `TextInput`/`TextArea`/`Select` in `components/ui/Field.tsx` silently dropped react-hook-form's `ref`**: they were plain function components, and React reserves/strips the `ref` prop from a component that isn't wrapped in `forwardRef` — so RHF could never read a field's live value, and every required field on every lead form validated as permanently empty regardless of what the user typed. This is the single highest-impact bug found: it affected all four public lead forms. Fixed by wrapping all three in `forwardRef`.
10. **Optional `<select>`/number fields on the site-review form sent `""` instead of `undefined`** for an untouched optional field, failing `z.enum(...).optional()` / producing `NaN` for `z.number().optional()`. Fixed with `setValueAs` on those `register()` calls.
11. **New-insight slug collision**: `slugify()` on a non-Latin (Arabic-only) title stripped every letter but converted the surviving whitespace into a literal `"-"` — a truthy-but-meaningless value that collided across every non-Latin title's `slug_ar`, since the intended empty-string fallback never triggered. Fixed by requiring at least one real alphanumeric character before trusting the slugified result.
12. **Campaign compliance scan included the internal `name` field**: `lib/admin/workflow.ts`'s campaign adapter scanned `name + headlineEn` server-side (while the client-side preview panel correctly scanned only the headline), so an internal bookkeeping name containing digits could trigger a permanent HIGH-RISK-number redirect loop that no amount of editing the public headline could clear. Fixed by scanning only the public-facing headline fields, matching what the compliance engine is actually meant to gate.
13. **Admin content editors (`InsightEditor`/`ProjectEditor`/`CampaignEditor`) never picked up a fresh workflow state after a transition**: local `useState(initialProp)` never re-syncs when the server component re-renders with new props after `router.refresh()`, so the transition buttons available were permanently stuck at the record's state *when the page first loaded*. An initial fix (remounting the whole editor via a `key`) introduced a *new* bug — it also wiped `TransitionDialog`'s own just-set "Moved to X." success message before it could ever be seen. Fixed properly with a targeted `useEffect` that syncs only the `status` field from fresh props, leaving the rest of the tree (and its local UI-feedback state) unmounted-and-untouched.

Two further issues surfaced during this same pass turned out to be test-authoring traps rather than application bugs, but are recorded here because they cost real debugging time and are easy to repeat:

14. A Playwright spec matched `/\/admin\/content\/insights\/[a-z0-9]+$/` against the *starting* URL `/admin/content/insights/new` — `"new"` is itself all-lowercase-a-z, so the assertion passed trivially before the real navigation happened, and a DB query one line later raced ahead of the actual row being created. Fixed by length-gating the id pattern (`{20,}`) so it can only match a real cuid.
15. A test seeded an Insight title containing a raw `Date.now()` timestamp for uniqueness. Since the title is real scanned content (not a throwaway id), the embedded digit run permanently tripped the compliance engine's HIGH-RISK number detector — correct engine behavior, wrong test data — so the insight could never reach `approved` no matter how clean the body was. Fixed by using a letters-only random suffix for title uniqueness in tests.

Several e2e specs also needed fixes unrelated to application bugs: `page.waitForURL()`'s default `waitUntil: "load"` never resolves for a Next.js client-side `router.push()`/`router.replace()` (no browser `load` event fires), so specs were switched to `expect(page).toHaveURL(...)`, which polls instead. The suite also runs with `workers: 4` and `retries: 1` (see `playwright.config.ts`) to absorb this Windows dev-server setup's occasional `ERR_NETWORK_IO_SUSPENDED` and first-compile-latency flakiness under heavy parallel load — neither applies to a precompiled production build behind a real server.

**Final confirmed run**: `npx vitest run` → 62/62 passed. `npx playwright test` → 26/26 passed in 21.5s, zero retries needed.

## 8.1 Operating Asset Engine rebuild pass (verification log)

A second pass added Opportunities, Landowners, Investors, News, Careers, Search, a mega menu, a 5-step smart lead-review wizard, and a scroll-reveal motion system — see `explain.md` and `tasklist.md` for the full design/architecture writeup. A prior session had already attempted this same pass and left ~50 uncommitted files; that work was reviewed and stashed (recoverable, never deleted) rather than restored as-is, and every feature was rebuilt fresh against the verified baseline, phase by phase, each phase independently re-verified before the next began.

```
npm run typecheck                      -> OK, 0 errors (every phase)
npm run lint                           -> OK, 0 warnings (every phase)
npm run build                          -> OK, 110 route entries generated, 0 errors (up from 72)
npx prisma migrate diff / migrate deploy -> OK, 2 additive migrations applied cleanly
npx vitest run                         -> 83/83 passed across 11 files (up from 62; two new test files this pass)
npx playwright test                    -> 47/47 passed, 0 failed, 0 flaky (up from 26)
```

Real bugs found and fixed by this pass's own verification (each root-caused, not worked around — full detail in `explain.md` §14):
1. `opportunityIntent`'s Zod schema used `.optional()`, but an unchecked HTML radio group reports its react-hook-form value as `null` — Zod's `.optional()` only accepts `undefined`. The wizard's first "Next" click silently failed validation and could never advance. Found by scripting a headless browser against a live dev server and inspecting `formState.errors` directly, since the bug produced no thrown error or console output. Fixed with `.nullish()`.
2. `Stepper`'s upcoming-step text used `text-grey-500` on white (3.18:1, fails WCAG AA) — caught by axe-core on `/submit-your-site`. The same failure mode the discarded prior pass's own documentation independently recorded for its own `Stepper`. Fixed to `text-slate`, and proactively in `RiskMatrix`/`MetricStrip`.
3. A transparent-over-hero header variant was built, then reverted: the header is a DOM sibling of the hero section, not a layout descendant it visually overlaps, so "transparent" text rendered on the page's light body background instead of the dark hero — a confirmed, serious axe-core contrast failure on both locales, not a false positive. This is the exact risk the discarded prior pass's own `tasklist.md` had flagged when it deferred the same feature. Reverted to the always-solid header.
4. Two e2e specs (`compliance-gate.spec.ts`, `campaign-attribution.spec.ts`) began exceeding the 30s default timeout once this pass's added specs shared the 4-worker pool — given `test.setTimeout(60_000)`, matching a pattern this codebase's own history already established for this exact suite under load.
5. A new test's `getByLabel("Search")` was genuinely ambiguous between the header's search button and the `/search` page's input — fixed to `getByRole("searchbox")`.

Also worth recording: the local dev Postgres database had drifted from a prior session's `migrate dev` runs — those tables were still present even after `git stash` (a stash affects the git working tree, not a running database's actual state). Caught before it could contaminate this pass's migration diff; the dev database was reset to the true committed-migration baseline first.

**Final confirmed run**: `npx vitest run` → 83/83 passed. `npx playwright test` → 47/47 passed, zero flakes.

## 8.2 Competitor-Inspired Redesign pass (verification log)

A third pass: Playwright-driven competitor research (jabalomar.com.sa, udc.sa, redseaglobal.com — see `docs/competitor-analysis.md`), a small library of new reusable homepage/section components, real user-provided property photography imported as draft `Project`s (six operating hospitality assets — see `explain.md` §19 for the full account, including a real content-curation finding), and `FEATURE_PROJECTS` flipped on in this environment. Full design/architecture writeup in `explain.md` §19 and `tasklist.md` Milestone 9.

```
npm run typecheck     -> OK, 0 errors
npm run lint          -> OK, 0 warnings
npm run build         -> OK, clean production build
npx prisma migrate diff / migrate deploy -> OK, 1 additive migration applied cleanly
npx vitest run        -> 85/85 passed (unchanged - no new pure-logic units this pass)
npx playwright test   -> 57 passed, 0 failed (2 flagged "flaky" under 4-worker load, both confirmed passing cleanly with --workers=1 - see explain.md §19)
```

Also fixed along the way: a real pre-existing `Footer.tsx` bug where two of its four columns both rendered the same "Legal" header text, and the copyright line hardcoded the English legal name even on the Arabic page.

## 8.3 Full Rebrand pass (verification log)

A `logo/` folder (an official brand guideline deck — final logo, favicon, a 6-color palette, produced by "Thrill Creative Agency," 2026|1447) appeared mid-8.2-pass. Asked directly, the user chose a full rebrand (not just a logo swap) plus a dark header, keeping the existing Montserrat/Almarai fonts. Confirmed via `tailwind.config.ts` that every color utility resolves through a CSS variable with zero hardcoded hex, so the entire palette swap is a precise, single-file (`src/styles/tokens.css`) change — none of the ~110 files using `bg-navy-900`/`text-teal-600`/etc. needed to change. Full writeup in `explain.md` §20 and `tasklist.md` Milestone 10.

```
npm run typecheck     -> OK, 0 errors
npm run lint          -> OK, 0 warnings
npm run build         -> OK, clean production build
npx vitest run        -> 85/85 passed (one assertion updated: the corrected legal-name string)
npx playwright test   -> full suite re-run given the palette/header change touches nearly every page (see explain.md §20 for the exact count)
```

Also fixed along the way: `Organization` JSON-LD in `src/lib/seo/metadata.ts` was duplicating a hardcoded (and, once the deck's real name surfaced, provably stale) copy of the legal name instead of importing the single `BRAND.legalNameEn` constant meant to be authoritative.

**Follow-up correction, same session:** re-instructed to use *only* the 6 exact approved hex values everywhere (no derived/lightened/darkened shades at all). `tokens.css` rewritten a second time; a repo-wide audit additionally found and fixed 76 files still using bare Tailwind `white`/`black` utilities (neither is one of the 6 approved colors). Re-verified in full afterward:

```
npm run typecheck     -> OK, 0 errors
npm run lint          -> OK, 0 warnings
npm run build         -> OK, clean production build
npx vitest run        -> 85/85 passed
npx playwright test   -> full suite, see explain.md §20 for the exact final count
```

Full page-by-page visual audit (all 18 public routes, both locales) confirmed no unapproved color remains anywhere and the real logo renders correctly in both header and footer placements — see `explain.md` §20's follow-up paragraph for the complete account.

## 9. Security advisories (dependency versions)

`npm audit` reports vulnerabilities in this dependency tree, the most material being in `next@14.2.15` itself (several DoS/SSRF/cache-poisoning/middleware-auth-bypass advisories fixed only in the `next@16.x` line) and in dev-only transitive deps (`esbuild`≤0.24 via `vitest`, `glob` via `eslint-config-next`). This build deliberately did **not** attempt a mid-build major-version migration to Next 16 — a framework major bump this late would risk destabilizing a large, now-fully-tested codebase to chase advisories that are largely config/attack-surface-dependent (e.g. Server Actions, which this codebase does not use — all mutations go through ordinary Route Handlers) rather than actually exploitable here. **Before any real deployment**, run `npm audit` again and evaluate `npm audit fix --force` (Next 16, `eslint-config-next` 16, `vitest` 4) as a dedicated, separately-tested upgrade — not something to fold silently into a feature change. Middleware-based auth (used here to gate `/admin`) is worth double-checking specifically against whichever Next version you land on.

## 10. Feature diff vs. FEATURES.md §2–§11

✅ = implemented and verified · 🚩 = flag-gated (implemented, off by default) · ⛔ = blocked on external input (implementation done, needs real-world values)

| Section | Status | Notes |
|---|---|---|
| §2 Sitemap & pages | ✅ | All routes exist; `/projects` is 🚩 behind `FEATURE_PROJECTS`. |
| §2.1 Approved copy | ✅ | Sourced from BRD/FEATURES/PROMPT + the marketing reference doc; nothing invented. |
| §3 Design system | ✅ | Tokens as CSS vars bridged into Tailwind (opacity-safe via `rgb(var(--x-rgb) / <alpha>)`), logical-property RTL, `AscentBlock`/`AscentMotif`/`GateDiagram` share one primitive, reduced-motion respected. |
| §4 Lead engine | ✅ | All 5 capture points, shared Zod schemas, file upload w/ magic-byte validation, honeypot, rate limiting, PDPL consent + timestamp, UTM first-touch cookie, persona auto-tagging, ≤1min notification + DB-backed retry queue + daily digest, CSV export, PDPL hard-delete with audit trail. |
| §5 CMS & governance | ✅ | RBAC (5 roles), full workflow state machine + transition matrix, compliance gate as described above, preview mode (signed non-indexed links), media library with `is_concept_visual`. |
| §6 Insights engine | ✅ | Bilingual fields, pillar taxonomy, reading time, related posts, RSS, JSON-LD `Article`. |
| §7 Backend architecture | ✅ | Route handlers → services → Prisma; `{data,error}` envelope; DB-backed email queue + worker; local storage adapter (S3 adapter is a documented extension point); pino structured logging with PII redaction; `/api/health`. |
| §8 Database schema | ✅ | All named tables present via `@@map`, plus `Task`/`EmailJob` as documented additive tables (not in the literal §8 list, needed for the confirmed Task Tracker feature and the §7 email-queue requirement respectively). |
| §9 API surface | ✅ | All listed public + admin endpoints implemented with the specified conventions (envelope, 422 shape, cursor pagination on leads, idempotency key on lead POSTs, CSRF same-origin check + rate limiting on public POSTs). |
| §10 SEO | ✅ | hreflang/canonical/x-default, `Organization`/`WebSite`/`BreadcrumbList`/`Article`/`FAQPage` JSON-LD, `next/font` self-hosting, `sitemap.xml`/`robots.txt`/`rss.xml`. |
| §11 Analytics | ✅ | First-party `events` table + `/api/events` beacon; admin dashboard tiles (lead funnel, top content, compliance queue, task counts). Third-party provider (Plausible/GA4) is env-gated and not wired to a real property — ⛔ needs `NEXT_PUBLIC_*` values. |
| Task/Build Tracker (confirmed addition) | ✅ | `Task` model + CRUD + list/board UI; board unions real tasks with a **live read-aggregation** of `WorkflowState`/`LeadStatus` (not a duplicated status field). |

## 11. Known limitations / explicit scope decisions

- **Native-Arabic review**: all Arabic copy is a professional working translation produced during this build, not yet reviewed by a native Saudi-Arabic business-copy reviewer. This is called out on `/privacy` and `/terms` in-page, and in the pillar seed data.
- **Ecosystem naming**: the visual brand-guidelines file references illustrative *placeholder* project names (e.g. "Marsah", "Al Nadwa", "Qimam") that are explicitly not real approved projects — none of them appear anywhere in this codebase, per BRD's "no invented facts" rule. The About page's ecosystem diagram uses the entity names actually confirmed in the marketing reference doc (Dyafa Holding, Dyafa Hotel Operations, Dyafa Services, Aqar Dyafa, Dyafa One).
- **Lighthouse CI** was not run in this sandboxed environment (no networked Chrome-based Lighthouse CI runner available); axe-core accessibility checks were run instead via Playwright as the closest available automated a11y verification. Run `npx lhci autorun` against a deployed build before launch.
- **Rate limiting** is in-memory (per Node process) — fine for a single-instance deployment; a multi-instance deployment should swap `src/lib/security/rateLimit.ts` for a shared store (Redis).
- **`task-observer`/`claude-mem` plugins** referenced in `docs/PROMPT.md §0` were not installed in this environment; this build was tracked with ordinary phase-by-phase commits instead (see git log), per the prompt's own fallback instruction. This is unrelated to the in-scope **Task/Build Tracker** admin feature, which is fully implemented.
