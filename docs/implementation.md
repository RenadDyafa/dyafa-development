# Dyafa Development — implementation.md
## Engineering Implementation Brief + Master Build Prompt
## Version 1.0 — 02 September 2026

# Part A — Engineering rules

## 1. First instruction: inspect before changing

Before writing new code:

1. inspect the existing repository
2. inspect the current routes
3. inspect existing components
4. inspect current admin/CMS
5. inspect database/schema
6. inspect API integrations
7. inspect environment variables
8. run the application locally
9. record the baseline
10. identify what can be reused

Do not delete working functionality because it is inconvenient.

## 2. Product goal

Build **Dyafa Development | ضيافة للتطوير** as a bilingual, premium, institutional **Development + Investment + Lead Generation Platform**.

The website should feel inspired by the quality standards of major Saudi and regional development sites but remain distinctly Dyafa.

The unique design story is:

> **Opportunity → Site → Demand → Product → Feasibility → Structure → Development → Readiness → Operations → Value**

## 3. Stack guidance

Use the existing stack when it is viable.

For a greenfield or controlled migration, a strong default is:

- Next.js
- TypeScript
- Tailwind CSS
- reusable component library
- PostgreSQL
- typed ORM/data access
- secure object storage for uploads/media
- transactional email provider
- analytics
- optional CRM integration

Recommended integrations should be adapter-based so the project can change vendor later.

## 4. Frontend implementation

Create a component system before assembling pages.

Required primitives:
- Button
- Link
- IconButton
- Input
- Select
- Checkbox
- Radio
- Textarea
- FileUpload
- FormField
- Modal
- Drawer
- Tabs
- Accordion
- Tooltip
- Breadcrumbs
- Card
- Badge
- Pagination
- Skeleton
- Toast

Required composed components:
- SiteHeader
- MegaMenu
- Hero
- Metrics
- DevelopmentTimeline
- ProjectGrid
- OpportunityGrid
- FilterBar
- InteractiveMap
- LeadForm
- MultiStepSiteReview
- NewsGrid
- InsightGrid
- LeadershipGrid
- Footer

## 5. Pages to implement

### Priority 1
`/`
`/about`
`/development/model`
`/development/capabilities`
`/modular-hospitality`
`/projects`
`/opportunities`
`/landowners`
`/partnerships`
`/investors`
`/submit-your-site`
`/contact`

### Priority 2
`/projects/[slug]`
`/opportunities/[slug]`
`/insights`
`/insights/[slug]`
`/news`
`/news/[slug]`
`/leadership`
`/ecosystem`
`/sustainability`
`/careers`
`/search`

## 6. Homepage implementation order

1. Hero
2. What we develop
3. Development pathway
4. Proof
5. Modular hospitality
6. Featured projects
7. Investment/partnership routes
8. Ecosystem
9. Insights
10. News
11. Final CTA

Keep sections modular so marketing can reorder or hide them from CMS.

## 7. Project detail implementation

Every project must be an entity, not a hand-built page.

Sections:
- hero
- overview
- approved metrics
- location
- market logic
- development stage
- product
- operator/brand if approved
- development pathway
- sustainability
- gallery
- map
- related insights/news
- CTA

Tabs:
`Overview | Opportunity | Development | Operations | Sustainability | Media`

Hide empty tabs automatically.

## 8. Opportunity detail implementation

Sections:
- opportunity hero
- location
- asset type
- site size
- demand drivers
- proposed product
- development stage
- partnership model
- next step
- request discussion

Avoid publishing confidential or financial fields unless explicitly approved.

## 9. Site review implementation

Create a 5-step form with a visible progress bar.

### Step 1 — Contact
Required:
- name
- company
- email
- phone

### Step 2 — Site
Required:
- city
- location
- asset/site type
- approximate size
- ownership status

### Step 3 — Hospitality
- desired asset type
- existing asset
- development status
- intended user/demand type

### Step 4 — Documents
- site plan
- title/ownership documents where appropriate
- existing studies/plans
- supporting files

### Step 5 — Consent
- privacy
- contact permission
- optional newsletter

### Submit pipeline

```text
POST /api/site-review
      ↓
validate
      ↓
store lead
      ↓
store documents securely
      ↓
calculate internal routing score
      ↓
notify assigned team
      ↓
send acknowledgement
      ↓
show reference number
```

## 10. Form error handling

Never only show "Something went wrong."

Show:
- what failed
- what the user needs to correct
- whether their data was saved
- safe retry path

## 11. Admin implementation

Build a real CMS/admin area.

Dashboard widgets:
- new leads
- qualified leads
- active opportunities
- recent projects
- pending approvals
- recent content
- form completion rate

CRUD:
Projects
Opportunities
Services
Insights
News
Team
Partners
Locations
FAQs
Careers
Media
SEO
Navigation
Forms
Leads
Settings

## 12. Approval workflow

Add a status field:

`draft | review | approved | scheduled | published | archived`

High-risk content requires explicit review.

High-risk examples:
- investment figures
- returns
- valuation
- financing
- government relationships
- approvals
- partner names
- named project timelines
- land ownership details

## 13. API and server rules

- validate every incoming payload server-side
- authorise every admin route
- sanitise rich text
- rate-limit public forms
- protect uploads
- use signed media URLs where needed
- avoid returning sensitive lead data to the client
- log administrative changes
- keep secrets server-side

## 14. SEO implementation

For each page:
- title
- description
- canonical
- OG tags
- language alternates
- schema
- index/noindex
- sitemap inclusion
- breadcrumbs

Use server-rendered content for indexable pages.

## 15. Arabic implementation

Requirements:
- true RTL
- logical CSS properties where possible
- mirrored icons only where semantically correct
- Arabic numerals only if the content policy requires them; otherwise remain consistent
- proper Arabic line-height
- Arabic text must not be visually smaller than English
- no layout hacks that break when text expands

Test long Arabic headings.

## 16. Motion implementation

Use CSS/Framer Motion/compatible library already present in the repo.

Required:
- fade-up
- reveal
- hover
- timeline progress
- subtle image scale

Avoid:
- scroll-jacking
- long blocking animations
- auto-play audio
- animation that hides essential content

Respect `prefers-reduced-motion`.

## 17. Image implementation

Use responsive sources:

```html
<picture>
  <source ... />
  <img loading="lazy" decoding="async" ... />
</picture>
```

Hero image:
- eager load only when above fold
- explicit dimensions
- high-quality source
- compressed derivative

Gallery:
- lazy loaded
- lightbox
- keyboard controls

## 18. CMS migration strategy

If current pages are hard-coded:

1. define entity schemas
2. create admin
3. migrate content
4. replace page hard-coding with queries
5. keep fallback content temporarily
6. remove fallback only after QA

Do not migrate everything in a single risky rewrite.

## 19. Environment configuration

Example:

```text
DATABASE_URL=
CMS_SECRET=
MEDIA_BUCKET=
MEDIA_PUBLIC_BASE_URL=
EMAIL_API_KEY=
CRM_API_URL=
CRM_API_KEY=
ANALYTICS_ID=
MAPS_API_KEY=
```

Never commit secrets.

## 20. Testing plan

### Unit
- validation
- scoring
- content transformers
- permission checks

### Integration
- forms
- uploads
- CMS CRUD
- search
- filters
- email
- CRM

### E2E
- bilingual navigation
- lead funnel
- project discovery
- opportunity discovery
- mobile form completion
- admin publish workflow

### Visual
- desktop
- tablet
- mobile
- LTR
- RTL

## 21. Definition of done

The website is not done because the homepage looks good.

It is done when:
- content is CMS-driven
- major pages are bilingual
- forms work
- leads reach the correct team
- admin can update content
- SEO works
- analytics works
- security passes
- performance is strong
- accessibility is strong
- mobile/RTL are stable
- no invented claims exist

# Part B — MASTER BUILD PROMPT

You are the lead product designer, frontend engineer, backend engineer, CMS architect and QA engineer for **Dyafa Development | ضيافة للتطوير**.

Build a production-quality bilingual website for a Saudi hospitality development and investment platform.

The website must feel **modern, premium, institutional, architectural, data-aware and highly usable**.

Do NOT copy competitor websites. Study their best patterns only.

Use these benchmark lessons:
- Red Sea Global: ecosystem and full-lifecycle storytelling
- ASFAR: opportunity/investment journey
- Rua Al Madinah: project-level investment opportunities
- Taiba and Dur: portfolio + operations credibility
- Jabal Omar: approved metrics and development phases
- Diriyah/Soudah/KEC: place + demand + masterplan storytelling
- Emaar: discovery and UX
- JLL/CBRE: insights and data
- citizenM: standardisation/product logic
- Marriott: owner/development conversion flow

Create a **distinctive Dyafa visual system** around the concept:

**Opportunity → Site → Demand → Product → Feasibility → Structure → Development → Readiness → Operations → Value**

Use a restrained Saudi institutional palette with deep navy/deep green, warm bronze/gold accents, sand/stone neutrals and charcoal. Use premium photography, technical diagrams, modular grids, maps and data visuals. Avoid over-luxury visuals and decorative design without business meaning.

Build the sitemap and components described in `architecture.md` and `design.md`.

Make the website fully CMS-driven. Admin must be able to edit:
Projects, Opportunities, Services, Insights, News, Team, Partners, Locations, FAQs, Careers, Media, Navigation, SEO, translations and form/lead data.

Implement these conversion paths:
1. Submit Your Site
2. Explore Development Partnership
3. Investor Discussion
4. General Contact

The primary lead funnel must be a multi-step bilingual form with secure file upload, validation, anti-spam, consent, internal routing score, acknowledgement email and admin status workflow.

Implement:
- responsive design
- EN/AR
- LTR/RTL
- accessibility
- SEO
- analytics
- performance optimisation
- secure APIs
- role-based admin
- audit log
- structured data
- sitemap/robots/hreflang
- image optimisation
- reduced motion
- error states
- loading states
- empty states

Critical content rules:
- Never invent projects, partners, approvals, government relationships, pipeline values, returns, costs, dates, financing or operational statistics.
- Do not promise ROI or guaranteed returns.
- Treat modular hospitality as a disciplined development method, not cheap construction.
- Keep the brand focused on owners, investors, partners, developers and government stakeholders, not guest-facing hotel marketing.
- Keep Arabic professional Saudi business Arabic, not literal translation.

Engineering rules:
- Inspect the existing repository first.
- Reuse working code when possible.
- Do not perform a destructive rewrite without justification.
- Separate content/data from presentation.
- Use reusable components.
- Make every major recurring content pattern data-driven.
- Add tests for forms, permissions, CMS workflows and key user journeys.
- Finish with performance, security, accessibility and visual QA.

Before claiming completion, verify:
- EN and AR on desktop/mobile
- RTL layouts
- project and opportunity pages
- multi-step forms
- uploads
- CMS editing
- approval workflow
- SEO metadata
- analytics events
- Lighthouse
- accessibility
- broken links
- no console errors
- no fabricated content

The final result should feel like a **serious Saudi development platform with its own identity**, not a clone of Red Sea Global, Rua, ASFAR, Emaar or any other benchmark.
