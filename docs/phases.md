# Dyafa Development — phases.md
## Delivery Phases, Acceptance Criteria & Release Gates
## Version 1.0 — 02 September 2026

## Guiding rule

Do not start by polishing pages. Start by fixing the **system**: information architecture, content model, CMS, bilingual behavior, components, forms, analytics and quality gates.

## Phase 0 — Repository & content audit

### Objectives
- inspect the current application
- identify framework, routes, dependencies and database
- map current UI to desired sitemap
- identify reusable components
- locate duplicated/hard-coded content
- inspect current admin/CMS
- inspect logo/assets/fonts
- audit current mobile and RTL behavior

### Deliverables
- technical audit
- content inventory
- route inventory
- gap list
- risk register
- migration plan

### Gate
No destructive rewrite before the current codebase is understood.

---

## Phase 1 — Design foundation

### Build
- design tokens
- typography
- spacing
- color tokens
- buttons
- inputs
- cards
- tabs
- accordions
- navigation
- footer
- modal
- toast
- breadcrumbs
- responsive grid
- motion primitives

### Acceptance
- desktop/tablet/mobile
- EN + AR
- RTL
- keyboard accessible
- focus states
- reduced motion
- no console errors

---

## Phase 2 — Core corporate pages

Build:
- Home
- About
- Development Model
- Capabilities
- Ecosystem
- Leadership
- Sustainability
- Contact

### Acceptance
Every section maps to approved brand strategy. The site must not sound like a contractor or speculative property sales brand.

---

## Phase 3 — Commercial engine

Build:
- Projects
- Project Detail
- Opportunities
- Opportunity Detail
- Landowners
- Partnerships
- Investors
- Submit Your Site

### Acceptance
A user can move from any high-intent page to an appropriate CTA in 1–2 actions.

---

## Phase 4 — Smart lead funnel

### Build
- multi-step site review
- document upload
- validation
- anti-spam
- consent
- internal lead scoring
- CRM/webhook integration
- email acknowledgement
- admin assignment
- status workflow

### Acceptance
Test:
- successful submission
- invalid email
- missing required data
- upload failure
- large file
- duplicate submission
- mobile keyboard
- RTL fields
- network interruption

---

## Phase 5 — Insights, news and search

Build:
- Insights listing
- Insight detail
- News listing
- News detail
- filters
- search
- downloads
- related content

### Acceptance
Editors can publish without developer involvement.

---

## Phase 6 — CMS / Admin completion

Admin must support:
- CRUD for all content entities
- media library
- SEO
- navigation
- translations
- draft/publish workflow
- scheduled publish
- roles
- approvals
- form submissions
- leads
- audit log

### Acceptance
Create a new project, opportunity, insight, team member and news item from admin without code changes.

---

## Phase 7 — SEO / analytics / CRM

Build:
- metadata
- sitemap
- robots
- hreflang
- structured data
- analytics events
- UTM capture
- conversion events
- CRM mapping
- download tracking

### Acceptance
All major conversion paths are measurable end-to-end.

---

## Phase 8 — Performance / security / accessibility

Run:
- Lighthouse
- axe/accessibility checks
- broken link scan
- image audit
- upload security tests
- permission tests
- XSS/HTML sanitisation tests
- rate limiting tests
- mobile network tests

### Acceptance
No P0/P1 defects. Core pages should meet performance targets.

---

## Phase 9 — Content population

Populate in this order:

1. Approved global navigation
2. Homepage
3. Core corporate pages
4. Development model
5. Modular hospitality
6. Projects
7. Opportunities
8. Landowners / partnerships / investors
9. Insights / news
10. Leadership / sustainability / careers
11. SEO content
12. forms and CRM messages

Never insert invented project claims to make a page look complete.

---

## Phase 10 — Final QA and launch

### QA matrix

**Functional**
- links
- filters
- search
- tabs
- forms
- uploads
- CMS
- email
- CRM

**Visual**
- spacing
- typography
- images
- cards
- hover
- transitions
- RTL
- responsive breakpoints

**Content**
- spelling
- Arabic quality
- English executive tone
- no unsupported claims
- approved names/partners only

**Technical**
- performance
- security
- accessibility
- SEO
- analytics
- 404s
- redirects

### Launch gate

Require sign-off from:
- Marketing
- Development
- Leadership when required
- Legal/Finance for sensitive content
- Technical owner

---

## Phase 11 — Post-launch optimisation

First 30 days:
- monitor conversion rate
- monitor site-review completion
- review search terms
- review high-exit pages
- check lead quality
- fix UX friction

First 90 days:
- add high-value insight content
- refine CTA placement
- improve forms based on drop-off
- build project proof
- add new opportunities
- expand SEO landing pages

## Release definition of done

A feature is done only when:

- responsive
- bilingual
- accessible
- CMS-editable when content-driven
- instrumented when conversion-related
- secure
- performant
- tested
- documented
- approved
