# Dyafa Development Website — Build Task List

Tracks execution of the "Operating Asset Engine" rebuild pass against the already-shipped, tested codebase (7 commits, HEAD `2126edc` at the start of this pass). Status legend: `[x]` done and verified · `[deferred]` explicitly scoped out, with the reason.

## Scope decision (read first)

This is an **additive rebuild**, not a rewrite. A prior session's uncommitted second pass (~50 files: the same feature set this document describes) was reviewed and deliberately **not** restored as-is — it was stashed as a safety net (`git stash`, recoverable, never deleted) and every feature below was re-implemented fresh against the verified 7-commit baseline, phase by phase, each phase committed and fully re-verified (`typecheck`/`lint`/`build`/`vitest`/`playwright`) before the next began. Existing routes, schema, and tested behavior were preserved unchanged; `docs/*.md` reference specs from that prior session were kept (they're the user's own planning material) and are cited throughout.

## Milestone 0 — Baseline verification
- [x] Stashed the discarded second pass; reset the local dev database to the true 2-migration baseline (it had drifted — leftover tables from the earlier session's `migrate dev` runs were still present even after the file stash, since a stash affects git, not a running Postgres instance).
- [x] Added the missing `.eslintrc.json` (absent at HEAD — `next lint` could not run non-interactively without it).
- [x] Fixed two real pre-existing type errors: `storeUploadedFile()` call sites in the admin media route and the site-review route were missing the (now-required) `namespace` argument.
- [x] Full suite green against the clean baseline: typecheck/lint/build, `db:deploy`+seed, vitest 69/69, Playwright 26/26.

## Milestone 1 — Motion & design foundation
- [x] Additive-only tokens (`--ease-standard`, `--duration-fast/base/slow`, `--elev-1/2`) — no palette or font changes, per an explicit decision to keep the shipped navy/teal/bronze system and Montserrat/Almarai rather than `docs/design.md`'s aspirational Inter/IBM Plex Sans Arabic recommendation.
- [x] `reveal-up`/`reveal-fade` keyframes, `.hover-lift` utility; `useScrollReveal` + `<Reveal>` client-boundary wrapper so server-rendered marketing pages get a staggered scroll-reveal without becoming client components.
- [x] New primitives: `Tabs`, `Accordion`, `Badge`, `Skeleton`, `Stepper` (with back-navigation), `Breadcrumbs` (+ matching `BreadcrumbList` JSON-LD helper), `Drawer`, `MetricStrip` (count-up, renders only caller-supplied real numbers, unused today — see §Remaining below), `Tooltip`.

## Milestone 2 — Database & backend
- [x] Prisma: `Opportunity`, `NewsItem` (full `WorkflowState`/compliance-scan treatment, explicitly no financial/return field), `TeamMember`, `JobPosting`, `Faq` (simple `active`-flag pattern), `Lead.score`/`opportunityIntent`/`timeline`/`referenceNumber`. Two additive migrations, both generated via `prisma migrate diff` (never hand-written SQL).
- [x] `lib/leads/scoring.ts` — the exact additive-weight model from `docs/architecture.md` §5, unit-tested; `lib/leads/reference.ts` for the `DYA-XXXXXXXX` reference number.
- [x] `workflow.ts` adapter map extended with `opportunity`/`news`; admin CRUD for all 5 new entities following the existing Insight (full workflow) / Partner (simple) patterns exactly; public read services + CRM-ready `GET /api/opportunities` and `/api/news`; `GET /api/search` across Insight/Project/Opportunity/NewsItem/Faq.

## Milestone 3 — New public pages
- [x] `/landowners`, `/investors` (Tabs: Thesis/Lifecycle/Governance/Risk Framework incl. a new interactive `RiskMatrix`/Partnership Models) — always-indexed static content.
- [x] `/opportunities` (+`[slug]`), `/news` (+`[slug]`), `/careers` — each gated behind its own `FEATURE_*` flag, empty by design, following the `/projects` coming-soon pattern exactly.
- [x] `/search` + `SearchClient.tsx` — debounced client search against `/api/search`.
- [x] Mega menu (`MegaMenu.tsx`, 3 groups per `docs/design.md` §6) + `SearchOverlay.tsx` wired into `Header.tsx`.
- [x] Homepage hero restyled as a navy gradient with an animated gate-progression rail; `<Reveal>`/`.hover-lift` applied across existing sections.

## Milestone 4 — Smart lead funnel
- [x] `SiteReviewForm.tsx` reworked into the 5-step wizard (What are you looking for? → Contact → Opportunity → Context → Documents & consent), `Stepper` + per-step `trigger()` validation + back-navigation, `sessionStorage` draft persistence, analytics events (`submit_site_start/step_completed/submitted`, `document_uploaded`).
- [x] Server-side scoring + reference number on submit; success screen states the funnel (Opportunity received → Initial review → Qualification → Development discussion) and shows the reference number.

## Milestone 5 — Admin CMS
- [x] `OpportunityEditor`/`NewsEditor` (full workflow+compliance UI, matching `InsightEditor`), `TeamManager`/`CareersManager`/`FaqsManager` (matching `PartnersManager`); `AdminNav` updated with all 5 new sections.

## Milestone 6 — SEO / Analytics
- [x] Sitemap: `/landowners`+`/investors` always listed; `/opportunities`/`/news`/`/careers` (+ dynamic published-item entries) only while their flag is on — matching `/projects`. `BreadcrumbList` on every new page; `NewsArticle` on news detail; `JobPosting` on Careers.
- [x] `lib/analytics/track.ts` (new — no client event beacon existed before this pass) posting to the existing `/api/events`.

## Milestone 7 — Verification
- [x] `typecheck`/`lint`/`build` clean throughout (checked after every phase, not just at the end).
- [x] `vitest` — 83/83 passed (75 prior + 4 new `requestTransition` opportunity/news adapter tests + 4 new reference-number tests).
- [x] `playwright` — 47/47 passed, 0 failed, 0 flaky in the final run (21 prior scenarios + `mega-menu-search.spec.ts` [5] + extended `feature-flags`/`accessibility`/`reduced-motion` cases).
- [x] Real bugs found and fixed by this pass's own verification, not silently worked around:
  1. `opportunityIntent` used `z.enum().optional()`, but an unchecked HTML radio group reports its react-hook-form value as `null`, not `undefined` — Zod's `.optional()` only accepts the latter. The very first "Next" click in the wizard silently failed validation (no thrown error) and the step could never advance. Root-caused by running the flow against a live dev server, not just reading the code. Fixed with `.nullish()`.
  2. `Stepper`'s "upcoming" step number/label used `text-grey-500` on white (3.18:1, fails WCAG AA) — caught by the axe-core scan on `/submit-your-site`. This is the identical failure mode the prior (discarded) session's own documentation described hitting in its own `Stepper`. Fixed to `text-slate` in `Stepper`, and proactively in `RiskMatrix`/`MetricStrip` too.
  3. A transparent-over-hero header variant was built, then reverted after axe-core caught a real WCAG contrast failure: the header is a DOM sibling of the hero section, not a layout descendant it visually overlaps, so "transparent" text rendered on the page's light body background instead of the dark hero. This is exactly the risk the prior session's own `tasklist.md` had flagged when it deferred the same feature — reverted to the always-solid header rather than ship a known regression.
  4. Two e2e tests needed `test.setTimeout(60_000)` once this pass's added specs shared the 4-worker parallel pool and pushed past the default 30s margin (`compliance-gate.spec.ts`, `campaign-attribution.spec.ts`) — a timing-margin fix only, flow/assertions unchanged, matching a pattern the codebase's own history already established for this exact suite under load.
  5. A test selector (`getByLabel("Search")`) was genuinely ambiguous between the header's search button and the `/search` page's input — fixed to `getByRole("searchbox")`.

## Milestone 8 — Documentation
- [x] `explain.md` rewritten from scratch to reflect this pass's true, verified end state.
- [x] `tasklist.md` (this file) rewritten.
- [x] `README.md` verification log extended.

## Final status: all 8 milestones complete.

## Explicitly deferred (documented, not silently dropped)
- **Interactive maps** — needs a maps provider/API key decision; `[NEEDS VERIFICATION]`.
- **CRM webhook integration** — needs `CRM_API_URL`/`CRM_API_KEY`; the lead payload shape (`{data,error}` envelope) is CRM-ready, no endpoint is configured.
- **`MetricStrip` was built and tested but unused** at the time — now wired into the homepage via `StatStrip` (see Milestone 9); still shows nothing until an admin features an approved, structured `ApprovedFact`, so the "never invent financial figures" rule still holds.
- **Real Opportunity/News/Team/Careers content** — all four ship empty by design, exactly like the pre-existing Projects/Partners tables, pending Dyafa's own approval of real content.
- **Font/palette swap** to `docs/design.md`'s recommended Inter/IBM Plex Sans Arabic/`--dyafa-*` tokens — deliberately not adopted; the shipped Montserrat/Almarai + navy/teal/bronze system is the source of truth for this pass.
- Full CMS-editable navigation/redirects manager, admin MFA, image CDN — out of scope, no functional gap in what shipped.

## Milestone 9 — Competitor-Inspired Redesign Pass (a later session)

Full detail in `explain.md` §19. Summary:
- [x] Playwright-driven competitor research (jabalomar.com.sa, udc.sa, redseaglobal.com) → `docs/competitor-analysis.md`.
- [x] Real property photography (6 operating hospitality assets, user-provided) cropped/optimized and imported as **draft** `Project`s + a new `ProjectImage` model, via a re-runnable `scripts/import-property-photos.ts` (`npm run import:photos`) — every mid-frame-promotional or booking-contact-info source image was manually identified and excluded, not auto-processed and hoped-to-look-fine.
- [x] `ApprovedFact` gained optional `value`/`prefix`/`suffix` columns so a fact can double as an approved homepage stat.
- [x] New reusable components: `CapabilityTileRow`, `StatStrip` (wraps the existing `MetricStrip`), `ProjectCard`/`ProjectGallery` (built on the existing `Carousel`), `PartnerLogoStrip`, `ShowMoreText`, admin `ProjectImagesManager`.
- [x] Homepage/`/projects`/`/projects/[slug]`/About/Footer integration — all additive, every new section still disappears with nothing to show. Footer reorganized into 4 audience-grouped columns, fixing a real duplicate-header-label bug found along the way.
- [x] `FEATURE_PROJECTS` flipped to `true` in this environment's `.env` (still `false` in `.env.example`) — `e2e/feature-flags.spec.ts` updated to match (flag on, zero published, still coming-soon but now in the sitemap).
- [x] New `e2e/property-projects.spec.ts` (create → photo upload → full workflow → public homepage/`/projects` → keyboard-accessible gallery lightbox); `accessibility.spec.ts` extended to `/about` and `/projects`.
- [x] Full gate green: typecheck/lint/build/vitest (85/85, unchanged)/playwright (57 passed, 0 failed; 2 tests flaky under 4-worker parallel load, both confirmed passing cleanly with `--workers=1` — see `explain.md` §19 for the full investigation, not just a dismissal).
- [ ] Deliberately left to a human: real per-property descriptive copy + approval for all 6 imported properties, any homepage stat to feature, capability-tile photo choices, curating which raw videos (if any) to add per property.

## Milestone 10 — Full Rebrand: Official Logo, Palette, Legal Name (same session, right after Milestone 9)

Full detail in `explain.md` §20. A `logo/` folder (official brand guideline deck, "Thrill Creative Agency," 2026|1447) appeared mid-Milestone-9; the user chose a full rebrand plus a dark header, keeping the existing fonts.
- [x] Confirmed the entire color system resolves through CSS variables with zero hardcoded hex in `tailwind.config.ts` — the rebrand is a precise, one-file (`tokens.css`) palette swap, not a 110-file rename.
- [x] Recolored `tokens.css` (18 variable pairs) mapping the official 6-color palette onto the existing token roles, plus the one hardcoded gradient literal in the homepage hero that duplicated a color value outside the token system.
- [x] Seeded the real logo (`scripts/seed-brand-logo.ts`, `npm run seed:logo`) as both header and footer via the existing logo-setting mechanism; adopted a cropped `favicon.png` as `src/app/icon.png` (the site had none before).
- [x] `Header.tsx` goes solid dark; `MegaMenu`/mobile-nav dropdown panels deliberately stay light; `LocaleSwitcher`/`SearchOverlay` gained a `tone` prop for their one shared call site.
- [x] Legal name corrected at the source (`BRAND.legalNameEn/Ar`), `metadata.ts`'s JSON-LD now imports it instead of duplicating a stale copy, `messages/*.json` updated, repo-wide grep confirmed no stale occurrence remains.
- [x] Full gate green: typecheck/lint/build/vitest (85/85)/playwright (full suite), plus a manual Playwright-driven visual QA pass before trusting the automated result.
- [ ] Explicitly deferred, not guessed at: which of two domains seen in the deck's own mockups (`dyafa.sa`/`dyafadev.com`) is real; the deck's own display typeface (no font file/name provided).

**Follow-up correction (same session):** re-instructed to use *only* the 6 exact approved hex values everywhere, with zero derived/lightened/darkened shades. `tokens.css` rewritten a second time (every token now resolves to one of the 6 exact colors, several roles intentionally sharing a hex); a repo-wide audit found and fixed 76 files still using bare Tailwind `white`/`black` (`bg-white` cards, `text-white` button/header text) — replaced with `stone-050`/`navy-900`. Full page-by-page visual audit (all 18 public routes, both locales, `prefers-reduced-motion` emulated for the screenshot pass so Reveal-wrapped content isn't hidden mid-capture) confirmed no unapproved color remains and the real logo renders correctly everywhere. Full gate re-confirmed green after the correction. See `explain.md` §20 (follow-up paragraph) for the full account, including the two flagged exceptions (`--alert` stays non-brand; the logo/favicon were format-converted/cropped for technical use, never recolored or redrawn).

## Milestone 11 — Content Population + Real-Bug Sweep (same session, immediately after Milestone 10)

Full detail in `explain.md` §21. Populate every section that shipped empty-by-design now that real content exists, restructure the homepage around competitor-inspired storytelling, and run an actual Playwright audit rather than eyeballing the diff — never inventing a fact/statistic/claim.

- [x] Published the 6 real imported properties and 5 real draft Insights via `requestTransition` (honest, fact-only summaries), populating `/projects`, `/insights`, and both homepage teasers for the first time.
- [x] Seeded the homepage hero (previously one leftover inactive test video) with 4 real, directly-re-viewed-clean property photos + honest captions; gave all 4 `CapabilityTileRow` tiles real photographic backing.
- [x] New components: `AboutTeaser`, `ParallaxImage` (reduced-motion-safe hero parallax), `ProjectsFilter` (client city filter over server-rendered cards).
- [x] Found and fixed a **second** watermarked/captioned photo the original curation pass (Milestone 9) missed ("Karim Hotel – Al-Khobar"), plus proactively re-checked 7 other unconfirmed gallery images.
- [x] Found and fixed a **dangling Media reference**: "The Address"'s DB-recorded cover image (and, coincidentally, the homepage's "Opportunities" capability tile — same mediaId) pointed at a file that didn't exist on disk; discovered only because this pass's content work was the first thing to actually request it.
- [x] **Found and fixed the most consequential bug this pass**: the homepage had no `export const dynamic = "force-dynamic"`, unlike every other CMS-driven page — meaning it was frozen at build time and admin-published changes to hero slides/testimonials/capability tiles/stats/teasers would never appear on the live site without a manual rebuild. Verified empirically (a live DB write didn't appear on a running server until rebuilt), root-caused, and fixed on the homepage plus two other pages with the same gap (`/about`, `/development-model`). This single fix also resolved two Playwright failures that had looked like unrelated flakes.
- [x] Found and fixed a real, general accessibility bug in the shared `Carousel` primitive (hidden slides' focusable CTAs stayed tabbable — `aria-hidden-focus`), latent until this pass's multi-slide hero first exercised it; fixed once at the component level.
- [x] Found and fixed a real accessibility-*test* false positive (axe sampling a live Reveal fade-in animation mid-transition on `/projects`) — fixed the test's methodology (`emulateMedia` reduced-motion + settle wait), not the component, which was already correctly designed for this.
- [x] Fixed a real content/key-mapping bug on `/modular-hospitality` (title-keys used as body text) by re-pairing 4 cards with the page's own existing FAQ answers — no new copy invented — and fixed `/services`'s "Engagement models" section, which had zero backing content at all, by bridging it to Partnerships' already-populated equivalent.
- [x] `/development-model`, `/modular-hospitality`, `/services` all gained `Reveal`/`Breadcrumbs`/JSON-LD for consistency with sibling pages; `/development-model` gained its first real photo.
- [x] Updated `e2e/feature-flags.spec.ts` and `e2e/home-sliders.spec.ts`, both of which asserted a stale "database is empty" baseline that this pass's own legitimate content work made untrue — asserted the correct, intentional behavior instead.
- [x] Fixed several smaller real bugs found during page-by-page review: duplicate paragraphs on `/landowners` and `/partnerships`, raw `[NEEDS VERIFICATION]` placeholder text live on `/privacy`/`/terms`, an invisible mobile `Stepper` label, 22 leftover test-fixture Insights polluting the live site (root-caused in `e2e/compliance-gate.spec.ts`, not just deleted), and a missing `<h1>` on the populated `/projects` page.
- [x] Full gate green: typecheck/lint/build/vitest (85/85, unchanged)/playwright (**59/59 passed**, up from 57) — re-verified after re-seeding the 4 real hero slides that the Playwright run's own cleanup hooks wipe as a side effect.
- [ ] Deliberately still empty, not invented: Investment Opportunities stats, Why-Us stats, Sustainability/Impact, Partners/Brands — no real data exists for any of them anywhere in the codebase or `docs/`.
