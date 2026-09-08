# Dyafa Development — design.md
## Website Design System & UX Direction
## Version 1.0 — 02 September 2026

## 1. Design objective

Build a premium Saudi institutional website that feels like a **development intelligence platform**, not a hotel brochure and not a generic real-estate developer website.

The interface must communicate:

- feasibility before hype
- operating reality before aesthetics
- modular discipline
- investment clarity
- Saudi market depth
- development-to-operation continuity

The approved core message is:

> **Developing hospitality assets built for performance, scalability, and long-term value.**

Brand promise:

> **From opportunity to operating asset.**

## 2. Unique visual concept — "Operating Asset Engine"

Create one recognizable visual language used across the website:

**site geometry + modular grid + data layer + hospitality imagery**

A thin architectural grid can morph into cards, timelines, maps and metric blocks. This creates a visual connection between:

**land → planning → modules → operations → value**

Do not copy a competitor's exact compositions, typography, gradients, animations or artwork.

## 3. Art direction

### 3.1 Core look

- Editorial architecture
- Saudi institutional
- Premium but restrained
- Technical details mixed with human/place photography
- Large whitespace
- Strong grid discipline
- High-quality aerials and architectural photography
- Thin line diagrams
- Selective bronze/gold accents
- Charcoal technical layers
- Subtle texture inspired by stone/sand, never as a heavy background effect

### 3.2 Recommended palette direction

These are implementation recommendations, not a claim that they are the official brand hex values:

```css
--dyafa-ink: #12211D;
--dyafa-navy: #142936;
--dyafa-bronze: #A77A3B;
--dyafa-sand: #EDE3D2;
--dyafa-stone: #D7D0C4;
--dyafa-charcoal: #202426;
--dyafa-cloud: #F7F5F0;
--dyafa-white: #FFFFFF;
```

Use bronze as an accent, not as the dominant UI colour.

## 4. Typography

Recommended web pairing:

- English: Inter or a similarly neutral modern sans-serif.
- Arabic: IBM Plex Sans Arabic or another modern professional Arabic sans-serif.
- Avoid decorative display fonts.
- Use larger editorial headlines only where the content supports them.
- Arabic and English must have equal visual importance.
- RTL must be treated as a first-class layout, not a translated afterthought.

### Type scale

```text
Display: 64–84px desktop / 42–56px mobile
H1:      48–64px / 34–42px
H2:      36–48px / 28–36px
H3:      24–32px / 22–28px
Body:    17–20px / 16–18px
Label:   12–14px
Metric:  44–68px / 34–48px
```

Adjust fluidly with `clamp()`.

## 5. Layout system

Use a responsive 12-column desktop grid and 4-column mobile grid.

- Maximum content width: approximately 1280–1440px.
- Section vertical rhythm: 96–160px desktop; 64–96px mobile.
- Card radius: restrained, approximately 12–18px.
- Borders: low-contrast 1px.
- Shadows: minimal; rely on spacing, borders and imagery.
- Use asymmetrical compositions sparingly to create editorial character.

## 6. Global navigation

### Desktop

Sticky transparent navbar over hero, transitioning to solid background after scroll.

Primary navigation:

1. About
2. Development
3. Opportunities
4. Projects
5. Insights
6. Partnerships

Right-side actions:

- EN / العربية
- Search
- **Submit Your Site**
- Menu on compact breakpoints

### Mega menu

Group navigation by user intent, not by internal departments:

**Explore Dyafa**
- About
- Development Model
- Capabilities
- Ecosystem

**Explore Opportunities**
- Investment Opportunities
- Landowners
- Partnerships
- Investors

**Explore Proof**
- Projects
- Insights
- News
- Leadership
- Sustainability

**Take Action**
- Submit Your Site
- Request a Development Discussion
- Contact

## 7. Homepage section stack

### 01 Hero
Visual: cinematic Saudi site/urban/hospitality image with dark overlay.

Content:
- eyebrow: `DYafa Development | ضيافة للتطوير`
- headline: `From opportunity to operating asset.`
- subheadline: concise explanation of feasibility + modular development + investment structure + operating readiness.
- primary CTA: `Submit Your Site`
- secondary CTA: `Explore Our Development Model`

Add a subtle bottom rail showing:
`Opportunity → Feasibility → Development → Operations`

### 02 What we develop
Four large interactive cards:
- Hospitality Assets
- Modular Hospitality
- Hospitality-Linked Real Estate
- Existing Asset Repositioning

### 03 Development pathway
Horizontal/scrollable interactive timeline:
1. Opportunity
2. Site
3. Demand
4. Product
5. Feasibility
6. Structure
7. Design
8. Development
9. Readiness
10. Operations
11. Value

Clicking a stage updates an explanatory panel.

### 04 Proof
Only approved metrics. Use number + label + source/status.

Example placeholders:
- `[X]+ projects`
- `[X] cities`
- `[X] keys`
- `[X] m² pipeline`

Until approved, show qualitative proof or remove the block.

### 05 Modular hospitality
Split-screen with real modular/manufacturing/assembly visuals.
Include:
- What modular means
- What it does not mean
- Standardisation
- Quality
- Scalability
- Operational impact
- CTA

### 06 Featured projects
Project cards with:
- image
- city
- asset type
- stage
- one approved proof point
- explore button

### 07 Investment / partnership
Three audience routes:
- `I own land`
- `I want to invest`
- `I want to partner`

Each opens a dedicated path.

### 08 Ecosystem
Visual map:
Dyafa Holding → Dyafa Development → Operations / Services / Aqar Dyafa / Dyafa One

Make the development role visually dominant.

### 09 Insights
Editorial cards with filters:
- Hospitality Development
- Modular
- Investment
- Site & Market
- Operations
- Saudi Hospitality

### 10 News
Compact timeline/grid; distinguish `News`, `Milestone`, `Partnership`, `Event`.

### 11 Final CTA
Full-width section:
**Have a site with hospitality potential?**
Buttons:
- Submit Your Site
- Talk to the Development Team

## 8. Core UI components

Build reusable components with documented variants:

- `SiteHeader`
- `MegaMenu`
- `LanguageSwitcher`
- `HeroMedia`
- `SectionIntro`
- `MetricStrip`
- `ProofCard`
- `DevelopmentTimeline`
- `CapabilityCard`
- `ProjectCard`
- `OpportunityCard`
- `InvestmentOpportunityCard`
- `AudienceRouteCard`
- `InteractiveMap`
- `FilterBar`
- `TabNav`
- `Accordion`
- `QuoteBlock`
- `LogoWall`
- `NewsCard`
- `InsightCard`
- `LeadershipCard`
- `ImageGallery`
- `Lightbox`
- `DocumentDownloadCard`
- `LeadForm`
- `MultiStepSiteReview`
- `UploadField`
- `ConsentField`
- `Breadcrumbs`
- `SearchOverlay`
- `CookieBanner`
- `Toast`
- `Modal`
- `Footer`

## 9. Tabs

Use tabs only when content is truly parallel.

### Project page tabs
- Overview
- Opportunity
- Development
- Operations
- Sustainability
- Media

### Modular page tabs
- Concept
- Manufacturing
- Assembly
- Operating Impact
- FAQs

### Investor page tabs
- Thesis
- Lifecycle
- Governance
- Risk Framework
- Partnership Models

## 10. Forms

### A. Site Review — primary conversion

Step 1 — Contact:
- Full name
- Company
- Work email
- Phone
- Preferred language

Step 2 — Opportunity:
- City / region
- Site location
- Site type
- Land/asset size
- Ownership status
- Existing asset? yes/no
- Current use
- Development status

Step 3 — Hospitality intent:
- Hotel
- Serviced apartments
- Extended stay
- Hospitality mixed-use
- Existing asset repositioning
- Unsure / need assessment

Step 4 — Documents:
- Site plan
- Title/ownership evidence if appropriate
- Existing plans
- Studies
- Other documents

Step 5 — Consent:
- privacy consent
- permission to contact
- optional newsletter consent

After submit:
`Received → Initial Review → Qualification → Development Discussion`

Never promise feasibility, investment returns, approval, or project acceptance.

### B. Partnership form

Fields:
- company
- role
- partnership type
- asset/location
- investment/development scope
- proposed role
- message
- attachments

### C. Investor form

Fields:
- organisation
- investor type
- interest area
- preferred geography
- hospitality experience
- message
- consent

### D. General contact

Keep short:
- name
- company
- email
- phone
- reason
- message

## 11. Forms UX

- show progress indicator for multi-step forms
- preserve data between steps
- inline validation
- clear errors
- keyboard accessibility
- drag-and-drop upload plus browse button
- file type/size rules
- secure upload
- success page with reference number
- optional calendar booking only after qualification
- spam protection without damaging UX
- do not use dark patterns

## 12. Motion

Use subtle motion only:

- fade-up on section entry
- 150–350ms UI transitions
- image scale 1.00 → 1.03 on hover
- timeline progress animation
- metric count-up only for verified numbers
- parallax only for large hero imagery
- no excessive scroll-jacking
- respect `prefers-reduced-motion`

## 13. Image system

### Image priority

1. Dyafa-owned photography
2. Approved project imagery
3. Licensed professional architecture/hospitality photography
4. Official partner/project material when usage rights are confirmed
5. Licensed stock as secondary support
6. AI-generated concept imagery only when clearly treated as concept/internal until approved

Search engines are discovery tools, not evidence of image licensing.

### Google Images queries

- `Saudi Arabia hospitality development aerial architecture`
- `Saudi hotel development construction aerial`
- `Saudi urban corridor modern architecture`
- `Saudi secondary city skyline architecture`
- `modular hotel offsite construction`
- `modular hotel room factory`
- `hotel room module manufacturing`
- `prefabricated hotel assembly`
- `hotel back of house operations`
- `hotel feasibility architecture plans`
- `hotel masterplan aerial`
- `hospitality investment meeting Saudi`
- `Saudi architectural model hotel`
- `hospitality development site analysis`
- `hotel construction progress Saudi`

### Yandex Images queries

Use the same queries in English and Arabic where useful:
- `التطوير الفندقي السعودية`
- `التطوير المعياري للفنادق`
- `إنشاء فندق وحدات مسبقة الصنع`
- `مخطط تطوير فندقي`
- `موقع مشروع فندقي السعودية`
- `مخطط عمراني فندقي`
- `تشغيل الفنادق من الخلف`
- `استثمار سياحي السعودية`

### Ready-to-use search URLs

Google Images:
`https://www.google.com/search?tbm=isch&q=Saudi+Arabia+hospitality+development+aerial+architecture`

Yandex Images:
`https://yandex.com/images/search?text=Saudi%20Arabia%20hospitality%20development%20aerial%20architecture`

## 14. Photography shot list for Dyafa

Capture:
- leadership portraits in a real working setting
- project/site arrival
- site context
- aerial site geometry
- planning/model/table work
- engineering details
- modular manufacturing details
- assembly details
- hospitality operations
- pre-opening coordination
- meetings and partner workshops
- Saudi urban context
- material/detail close-ups

Avoid staged handshake-only photography.

## 15. SEO/accessible visual rules

- descriptive alt text
- empty alt for decorative images
- captions where proof needs context
- semantic headings
- visible focus states
- color contrast WCAG AA target
- keyboard navigation
- RTL support
- no information communicated by color alone
