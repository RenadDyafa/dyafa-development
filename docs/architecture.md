# Dyafa Development — architecture.md
## Website Information Architecture, Data Architecture & System Design
## Version 1.0 — 02 September 2026

## 1. Architecture principles

1. Content-first and CMS-driven.
2. Bilingual from the data model up: EN + AR / LTR + RTL.
3. Every public page is editable without code.
4. Project, opportunity and insight data must be structured, not hard-coded.
5. Lead capture is a first-class system.
6. SEO metadata is editable per page.
7. Build for progressive enhancement and strong Core Web Vitals.
8. Never duplicate business logic across pages.
9. Preserve an existing production stack where practical; refactor only when justified.
10. Keep the architecture extensible for CRM, analytics and AI features.

## 2. Public sitemap

```text
/
├── about
│   ├── company-role
│   ├── why-dyafa
│   ├── leadership
│   ├── governance
│   └── ecosystem
├── development
│   ├── model
│   ├── development
│   ├── investment
│   ├── hospitality
│   └── modular
├── modular-hospitality
├── projects
│   └── [project-slug]
├── opportunities
│   └── [opportunity-slug]
├── landowners
├── partnerships
├── investors
├── insights
│   └── [insight-slug]
├── news
│   └── [news-slug]
├── leadership
├── sustainability
├── careers
├── contact
├── submit-your-site
├── search
├── privacy
├── terms
└── cookies
```

Admin:

```text
/admin
├── dashboard
├── projects
├── opportunities
├── services
├── insights
├── news
├── team
├── partners
├── locations
├── sustainability
├── FAQs
├── forms
├── leads
├── media
├── navigation
├── SEO
├── translations
├── settings
└── audit-log
```

## 3. Audience routing

The site should offer audience routes at strategic points:

- Landowner → `/landowners` → `/submit-your-site`
- Investor → `/investors` → qualified contact/investment discussion
- Developer/JV → `/partnerships`
- Government/municipality → `/partnerships`
- Existing asset owner → `/landowners#existing-asset`
- Media → `/news`
- Talent → `/careers`

## 4. Content entities

### Project

```ts
Project {
  id
  slug
  title_en
  title_ar
  summary_en
  summary_ar
  city
  region
  country
  asset_type
  status
  development_stage
  operator_brand
  land_area
  gfa
  key_count
  project_start
  target_completion
  coordinates
  overview_en
  overview_ar
  market_logic_en
  market_logic_ar
  sustainability_summary_en
  sustainability_summary_ar
  investment_visibility
  gallery
  documents
  related_news
  seo
  published
}
```

### Opportunity

```ts
Opportunity {
  id
  slug
  title_en
  title_ar
  opportunity_type
  city
  region
  asset_type
  site_size
  status
  development_stage
  demand_drivers
  proposed_product
  partnership_models
  public_summary
  confidential_note
  contact_route
  documents
  seo
  published
}
```

Financial figures, returns, financing or approvals must never become public fields automatically. If they are ever used, create approval-gated fields and workflow.

### Insight

```ts
Insight {
  id
  slug
  title_en
  title_ar
  excerpt_en
  excerpt_ar
  body_en
  body_ar
  category
  author
  publish_date
  reading_time
  featured_image
  downloadable_asset
  related_projects
  seo
  published
}
```

### News

```ts
News {
  id
  slug
  title_en
  title_ar
  type
  excerpt_en
  excerpt_ar
  body_en
  body_ar
  date
  location
  featured_image
  attachments
  related_project
  seo
  published
}
```

### Team member

```ts
TeamMember {
  id
  name_en
  name_ar
  role_en
  role_ar
  bio_en
  bio_ar
  photo
  linkedin
  expertise[]
  display_order
  published
}
```

### Service / Capability

```ts
Service {
  id
  slug
  group
  title_en
  title_ar
  summary_en
  summary_ar
  description_en
  description_ar
  icon
  process_steps[]
  related_projects[]
  published
}
```

### Site review lead

```ts
SiteReviewLead {
  id
  reference_number
  status
  score
  lead_type
  name
  company
  email
  phone
  preferred_language
  city
  location
  asset_type
  site_size
  ownership_status
  zoning_status
  existing_asset
  hospitality_interest
  notes
  document_ids[]
  source
  campaign
  consent_status
  assigned_to
  created_at
  updated_at
}
```

## 5. Lead scoring model

Keep it transparent and editable in admin.

Example signals:

```text
+20 clear hospitality intent
+15 complete site data
+15 location provided
+10 ownership status provided
+10 appropriate land/asset size
+10 existing documentation
+10 company/investor information complete
+05 existing asset repositioning
+05 strategic city/market fit
```

Do not infer or promise investment attractiveness automatically. The score is an internal routing score, not an investment recommendation.

Statuses:

`New → Reviewing → Qualified → Meeting → Active Opportunity → Nurture → Closed`

## 6. CMS requirements

All of these must be editable:

- homepage sections
- hero media/text
- projects
- opportunities
- services
- modular content
- team
- leadership
- ecosystem entities
- partners
- insights
- news
- sustainability content
- careers/jobs
- FAQs
- menus
- footer
- SEO metadata
- redirects
- forms
- lead statuses
- email templates
- media assets
- translations

## 7. Admin roles

### Super Admin
Everything, including users and system settings.

### Marketing Editor
Content, media, SEO, navigation, campaigns.

### Development Editor
Projects, opportunities, technical development content.

### Investor/BD Editor
Opportunities, leads, partnership content.

### Reviewer
Draft approval and comments, no publishing.

### Analyst
Lead/read-only analytics access.

### Important control
Sensitive fields require review/publish approval before public display.

## 8. Workflow / approvals

```text
Draft
  ↓
Internal Review
  ├── Marketing
  ├── Development
  └── Legal/Finance if sensitive
  ↓
Approved
  ↓
Scheduled / Published
  ↓
Archived
```

Sensitive trigger examples:
- investment figures
- returns
- financing
- government relationship
- land ownership
- approvals/licensing
- partner claims
- named projects
- brand/franchise approval
- timelines

## 9. Media architecture

Media asset metadata:

```text
id
filename
alt_en
alt_ar
caption_en
caption_ar
copyright_owner
license_type
source_url
usage_scope
project_id
tags[]
focal_point
width
height
mime_type
created_at
```

Support:
- responsive image sizes
- WebP/AVIF
- lazy loading
- LQIP/blur placeholders
- focal point
- crop variants
- image sitemap where useful

## 10. API architecture

Recommended REST or typed server-actions boundary:

```text
GET    /api/projects
GET    /api/projects/:slug
POST   /api/projects              (admin)
PATCH  /api/projects/:id         (admin)

GET    /api/opportunities
GET    /api/opportunities/:slug
POST   /api/opportunities         (admin)

GET    /api/insights
GET    /api/news
GET    /api/team
GET    /api/services

POST   /api/site-review
POST   /api/partnership-inquiry
POST   /api/investor-inquiry
POST   /api/contact

POST   /api/media/upload
GET    /api/search
GET    /api/sitemap-data
```

Add rate limiting, spam protection and audit logging.

## 11. Search architecture

Site search should cover:
- projects
- opportunities
- insights
- news
- services
- FAQs

Filters:
- content type
- city
- asset type
- topic
- status
- year

Search results should be bilingual aware.

## 12. Localization

Do not create two unrelated sites.

Use one content object with:
- English fields
- Arabic fields
- shared IDs/slugs where possible
- language-aware metadata
- alternate/hreflang
- RTL at document and component level

Arabic route examples may be:
`/ar/...` or locale subdomains depending on the existing application. Prefer the pattern already established by the project.

## 13. SEO architecture

Every content page should support:
- title
- meta description
- canonical
- OG title/description/image
- Twitter/X cards where applicable
- schema.org structured data
- breadcrumbs
- language alternate
- noindex flag
- publish date
- last modified date

Suggested schemas:
- Organization
- LocalBusiness only where appropriate
- WebSite
- BreadcrumbList
- Article
- NewsArticle
- ImageObject
- JobPosting
- FAQPage
- Event where applicable

Never fabricate rating/review schema.

## 14. Analytics architecture

Track:
- page view
- language switch
- primary CTA click
- Submit Your Site start
- Submit Your Site completion
- partnership form start/completion
- investor form start/completion
- file upload
- WhatsApp click
- phone click
- email click
- PDF download
- project view
- opportunity view
- search
- filter usage
- video interaction
- calendar booking after qualification

Add UTM persistence across form submissions.

## 15. Security requirements

- server-side validation
- CSRF protection where applicable
- upload scanning
- MIME validation
- file size limits
- signed upload URLs
- least-privilege admin access
- MFA for privileged users where supported
- audit trail
- secrets only in environment variables
- never expose private documents through public URLs
- redact sensitive lead information from logs

## 16. Performance

Targets:
- Lighthouse performance >= 90 target on core pages
- LCP < 2.5s target
- CLS < 0.1 target
- INP < 200ms target
- avoid giant hero videos on mobile
- responsive image art direction
- code splitting
- font loading optimisation
- caching for public content
- CDN for assets

## 17. Recommended architecture pattern

Preferred, if the existing project permits:

```text
Next.js / TypeScript
├── App Router / server rendering
├── Tailwind CSS
├── reusable UI component system
├── typed forms
├── CMS/data layer
├── PostgreSQL
├── ORM/data access layer
├── object storage for media
├── email provider
├── analytics
└── CRM integration
```

Do not replace an existing working stack merely for fashion. Inspect the current repository first.

## 18. Visual-to-data relationship

A design block should never be a hard-coded one-off if it represents a recurring data concept.

Examples:

`ProjectCard` ← Project entity  
`OpportunityCard` ← Opportunity entity  
`InsightCard` ← Insight entity  
`MetricStrip` ← approved Metrics entity  
`LeadershipCard` ← TeamMember entity

## 19. Recommended URL and content rules

Use short, readable slugs:

`/projects/project-name`
`/opportunities/opportunity-name`
`/insights/why-feasibility-matters`
`/news/partnership-name`
`/team/person-name`

Avoid:
- database IDs
- dates inside slugs unless required
- duplicate localized URLs without canonicals
