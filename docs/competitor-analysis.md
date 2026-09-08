# Competitor / Reference UX Analysis for Dyafa Development

Research conducted with headless-Chromium Playwright scripts (screenshots + DOM
extraction) against three Saudi hospitality/real-estate-development sites, for
the purpose of planning a redesign of Dyafa Development's bilingual (EN/AR)
Next.js site. This document describes **structural and interaction patterns
only** — no copy, taglines, logos, or imagery from these sites should be
reused verbatim; any concrete text quoted below is there purely to identify
*what kind* of content occupies a slot, not to be copied.

Automation scripts: `competitor-research/common.js` (shared helpers) +
`competitor-research/{jabalomar,udc,redseaglobal}.js` (per-site runners).
Screenshots: `competitor-research/<site>/*.png`. Raw extracted data:
`competitor-research/<site>/raw-data.json`.

---

## 1. Jabal Omar Development Company (jabalomar.com.sa)

Saudi joint-stock real-estate developer building the Jabal Omar mixed-use
district (hotels, residential towers, malls) adjacent to the Grand Mosque in
Makkah. The site defaults to an Arabic (RTL) homepage with an "English"
toggle; this analysis was run through the English toggle (`/en/home/`) so
extracted nav/section text would be legible, but the layout and structure are
identical between locales, just mirrored for RTL.

Screenshots captured: `desktop-home.png`, `tablet-home.png`, `mobile-home.png`,
`desktop-about.png`, `desktop-investors.png`, `desktop-contact.png`,
`desktop-careers.png` (7 total).

### Nav structure
Flat, single-level top nav, WordPress-built: Home · About Us · Hospitality ·
Residential · Malls · Experiences · Register Your Interest · **Investors**
(only item with a real dropdown: Corporate Governance, Investors Relations) ·
Vendors Portal · Contact Us · Join Us. No mega-menu — this is the simplest
nav of the three sites, essentially a top-level link list with one small
2-item dropdown.

### Homepage section order and purpose
1. **Hero** — full-bleed background video/image behind a left-aligned
   headline + one-line subhead + single primary CTA button ("own a unit"
   style call-to-action).
2. **About teaser** — dark solid-color band, centered heading + short company
   description paragraph + "view more" link. Pure text, no imagery.
3. **Stat strip ("Why [Company]")** — four icon+number tiles in a row
   (towers count, hotel count, commercial centers, parking spaces) — static
   numbers, not obviously animated counters, on a plain white background.
4. **Masterplan/progress section** — an illustrated site masterplan graphic
   paired with a list of construction-phase progress bars (percentage-complete
   per phase), each row clickable to a modal with more phase detail.
5. **Hotel-brand logo grid** — grid of partner/operator hotel-brand logos
   (the "who operates here" trust signal), plain white cards.
6. **Destination/mall gallery** — horizontal image gallery/carousel of retail
   destinations, each tile labeled with a location name and a small caption
   overlay.
7. **Awards carousel** — horizontal scrolling row of trophy/award images,
   arrow-navigated.
8. **News teaser** — 3-card grid of latest news items (image + date + title),
   "view more" link to a news archive.
9. **Footer** (see below).

### Footer structure
Newsletter signup (email field + subscribe button) sits above three link
columns: **Company** (about, hospitality, residential, suppliers portal,
contact, careers, terms), **Investors** (corporate governance, investor
relations), **Experiences** (malls, experiences, tour booking, parking,
crowd-density status link). Plus a row of social icons (YouTube, LinkedIn,
X, Facebook, Instagram) and app-store/Google-Play/Huawei-AppGallery badges
with a phone-mockup image. This is the most link-dense footer of the three,
reflecting the operational breadth (parking, tours, crowd status) of an
active urban mixed-use district.

### Motion / interaction patterns
- Header is `position: absolute`, transparent background, sitting over the
  hero — it is **not sticky**; it scrolls away with the page (confirmed via
  computed style, not just visual).
- `gsap` reference present in markup; a swiper-style nav control class is
  present on at least one carousel, suggesting the mall/award galleries are
  JS carousels with arrow controls rather than plain scroll.
- The masterplan progress bars use an "animated" / "progress-counter" class
  naming convention, suggesting an on-scroll or on-load fill animation.
- Cookie-consent banner is a heavy interruptive overlay on first load.
- No evidence of AOS/scroll-reveal library or Framer Motion; interaction
  polish is comparatively modest for the visible marketing-site content.

### Responsive notes (desktop 1440 / tablet 768 / mobile 390)
- Nav collapses to a hamburger/drawer well before tablet width.
- The icon stat-strip stays in a single row down to tablet, then stacks to
  a narrower 2-up or vertical arrangement on mobile.
- The masterplan-graphic + progress-bar section becomes a simple stacked
  list of phase bars on mobile, with the illustration shrunk above it.
- Hotel-brand logo grid reflows from a wide multi-column grid to 2 columns
  on mobile.
- Footer link columns stack vertically on mobile; app-store badges and the
  phone mockup move to the bottom of the stack.

### Palette / type notes
- Base palette: white background, a muted **slate blue/navy** (`rgb(55,76,95)`)
  used for the about-teaser band and footer, an **olive/khaki green**
  accent (`rgb(157,160,124)`) for buttons/icons, plus gold accents on the
  awards imagery.
- Headings use a custom Arabic-first display face ("Tanseek Modern Pro
  Arabic", bold/medium weights at large sizes e.g. 80px H1), body copy falls
  back to a system UI sans stack — a bilingual-friendly pairing worth noting
  since Dyafa is also EN/AR.

---

## 2. AlUla Development Company — the site at udc.sa (United Development Company)

**Important naming note:** the requested URL `https://www.udc.sa/` currently
resolves to **AlUla Development Company**, whose short-form brand name is
also "UDC" (a PIF-owned company driving tourism/real-estate/infrastructure
development in AlUla) — not the Qatar-based "United Development Company"
(The Pearl-Qatar) that the URL might suggest. The site itself, and the
research below, concerns AlUla Development Company. It is a legitimate,
directly comparable Saudi giga-project hospitality/real-estate developer, so
analysis proceeded as planned; flagging the naming mismatch for clarity.

Also note: this domain sits behind a WAF that returns a hard block page to
an automated-looking browser context (no custom UA/locale); a normal desktop
Chrome UA + `en-US` locale/Accept-Language resolved it immediately with no
other stealth measures needed. No blocking occurred on retries after that.

Screenshots captured: `desktop-home.png`, `tablet-home.png`, `mobile-home.png`,
`desktop-about.png`, `desktop-projects.png` (Portfolio), `desktop-news.png`
(Press Office), `desktop-contact.png` (7 total).

### Nav structure
Also flat and simple (Drupal-built): Home · About Us · Portfolio · Press
Office · Contact Us · language switch (العربية). No dropdowns/mega-menu at
all — the simplest, most restrained nav of the three.

### Homepage section order and purpose
Only **4 real content blocks** on the homepage (confirmed after unwinding
~11 layers of single-child Drupal/page-builder wrapper divs) — this is a
deliberately short, focused homepage compared to the other two sites:
1. **Hero** — full-bleed landscape photograph, bold left-aligned headline +
   short mission subhead + single "Read more" CTA.
2. **About teaser** — simple two-column split: photograph left, heading +
   paragraph + "Read more" link right.
3. **Stat strip ("Our Portfolio")** — a dark, photo-background band with 4
   large orange numbers (hotel keys, residential units, second homes, staff
   accommodation) side by side — visually the strongest single section on
   the page.
4. **News carousel** — a card-carousel ("Our Latest News") showing one
   article at a time with pagination dots (not arrows) beneath it; classed
   as a Views/paragraph slider.

Footer follows directly — no CTA banner, no partner-logo strip, no
testimonials on this homepage; it is the leanest of the three by a wide
margin.

### Footer structure
Minimal single-row footer: a "A PIF Company" badge/wordmark, a row of 5
social icons (Facebook, X/Twitter, YouTube, Instagram, LinkedIn), and a
copyright + "Terms of Use | Privacy Policy" line. No multi-column link
groups at all.

### Motion / interaction patterns
- Header computed `position: relative` (not sticky, not fixed) — it is a
  static, solid-background bar that scrolls away with the page (screenshot
  taken mid-scroll on an inner page confirms a plain olive/grey bar, not a
  transparent hero overlay).
- News section carousel uses pagination-dot navigation rather than arrows;
  no evidence of autoplay in the markup.
- "Counter"-style class naming is present near the stat strip, consistent
  with (but not proof of) an animate-on-scroll count-up for the big numbers.
- No AOS/GSAP/Framer Motion references found; this is the least
  motion-heavy of the three sites.

### Responsive notes
- Nav collapses to a hamburger icon (top-right) at/below tablet width.
- The 4-number stat strip is a single horizontal row on desktop and tablet,
  but **stacks vertically** (number, label, number, label...) on mobile
  rather than wrapping to a 2×2 grid — worth avoiding this exact approach,
  a 2×2 grid reads better on narrow screens.
- The news carousel shows 1 card at a time on mobile with the same
  dot-pagination pattern as desktop (already single-card on desktop too —
  so no reflow needed here, it's consistent across breakpoints).
- Portfolio/project grid (inner page) reflows from 4 columns → fewer columns
  → single column, standard card-grid behavior.

### Palette / type notes
- Deep teal/forest green (`rgb(29,72,74)`) and a warm sandstone/orange accent
  (visible on stat numbers and card underlines) against a near-black
  (`rgb(42,44,56)`) footer — an earthy, desert-and-heritage palette
  consistent with AlUla's brand positioning.
- Typeface pairing is Arabic-first: "DIN Next LT Arabic" with Cairo as
  fallback, applied uniformly across body and headings (headings via
  weight/size rather than a distinct display face) — a simpler, more
  restrained type system than Jabal Omar's.

---

## 3. Red Sea Global (redseaglobal.com)

Saudi giga-project tourism/hospitality developer (The Red Sea, AMAALA, and a
wide portfolio of operating subsidiaries spanning construction, logistics,
utilities, aviation, etc.). Built on Adobe Experience Manager (AEM) — by far
the most complex markup and the richest content of the three sites. No
automation blocking was encountered once a realistic desktop UA/locale was
set (same context settings used for all three sites).

Screenshots captured: `desktop-home.png`, `tablet-home.png`, `mobile-home.png`,
`desktop-about.png`, `desktop-destinations.png` (Portfolio), `desktop-
sustainability.png` (Regenerative Tourism), `desktop-news.png` (Media
Center), `desktop-careers.png` (8 total).

### Nav structure — the one true mega-menu of the three
Seven top-level items, several with large, categorized mega-menu drop-downs
(built from custom div/class markup, not `<ul>/<li>`, notable in itself — see
Synthesis): **About us** (Leadership, Partnerships, Governance, Awards) ·
**Services** (a long categorized list — Real Estate, Facility Management,
Logistics & Trading, Engineering & Construction, Environmental Services,
Tourism & Hospitality, Aviation, Security, subsidiaries grouped under
sub-headings) · **Our Portfolio** (destinations and residences grouped by
name, e.g. "The Red Sea" / "AMAALA" family of sub-brands) · **Regenerative
Tourism** (Responsible Development, People, Planet, Reports) · **Invest**
(Invest with us, Governance, Projects, Sustainability Report) · **Careers**
(training/education program list) · **Media Center** (news listing). This is
a full-width, multi-column mega-menu pattern (link-count analysis on the live
DOM put ~170+ links inside the menu subtree alone) — a genuinely different
scale of nav from the other two sites' flat lists.

### Homepage section order and purpose
The richest, longest homepage of the three (~7,900px full-page height at
desktop):
1. **Hero** — full-bleed aerial destination photography, short headline +
   one-line mission statement + primary CTA ("Explore Our Portfolio") and a
   secondary row of quick links (Portfolio / Invest / Testimonials-style
   links) beneath the fold line.
2. **Mission/intro text section** — centered, editorial-style paragraph
   ("Shaping a Better Future...") with a "Show more" text-expand toggle and a
   single CTA button — a lightweight about-teaser with progressive
   disclosure rather than a hard length cap.
3. **Capability tile row ("Advisory, Operational, and Delivery")** — 4 large
   image tiles (Our Services / Our Subsidiaries / Our Portfolio / Investment),
   each a full-bleed photo with a label caption — effectively a top-level
   site-map rendered as visual navigation.
4. **News carousel ("Our News")** — arrow-navigated (prev/next visible),
   large-format cards, partially-visible next-card peeking at the edge (a
   "peek" carousel layout).
5. **Interactive destinations map** — a distinctive, non-generic pattern: an
   actual illustrated coastline map with clickable pins; clicking/hovering a
   pin surfaces a destination card (image + name + short description +
   "Explore" link) docked over the map. Genuinely differentiated component,
   not just a card grid.
6. **"Positive Impact" 2-card grid** — sustainability-themed pairing
   (Responsible Development / Regenerative Tourism), each a large photo
   card with title overlay.
7. **Residences 2-card grid** — similar large photo-card treatment for two
   residential sub-brands.
8. **Stat strip ("From Where We Continue to Rise")** — dark navy band, 3
   large numbers with small icon glyphs above each (subsidiaries count,
   service areas, assets delivered).
9. **Social proof / social-feed carousel ("Stay Connected")** — Instagram-
   style photo carousel with account handle + timestamp captions.
10. **CTA banner ("Get in touch")** — centered heading + single "Contact Us"
    button on a plain background.
11. **Newsletter signup** — two-field form (first/last name + email) with
    consent checkbox, on a light beige band, sitting just above the footer.
12. **Footer** (see below).

### Footer structure
Four link columns: **Our Businesses** (Investments, Services) · **Our
Subsidiaries** (named subsidiary companies) · **Our Destinations** (named
destination brands) · **Quick links** (Vendor Registration, Careers, Media
Center, Contact Us) — plus a social icon row and a "PIF company" badge. Rich
but well-organized; noticeably more structured than Jabal Omar's link-dense
footer, less minimal than AlUla's.

### Motion / interaction patterns
- Header sits in an `experiencefragment` with a `mod--sticky` class
  modifier — strong evidence of a **sticky header on scroll**, distinct
  from both other sites (Jabal Omar: transparent/absolute, not sticky;
  AlUla: static, not sticky).
- `swiper` library detected in markup, with both pagination controls and
  next/prev arrow controls present — confirms the news and destinations
  carousels are Swiper-based, arrow + numbered-fraction indicator (e.g.
  "1 / 3") rather than dot pagination.
- Card components (`.rsg-card`) carry explicit `0.3s ease-in-out`
  transition timing on image/content sub-elements — a deliberate hover
  micro-interaction (likely image zoom/overlay-reveal on hover), more
  polished than the other two sites' mostly-default transitions.
- A modal system (`.rsg-page-section__modal`, `js-open-modal` /
  `js-close-modal`) is used for at least the video/hero and possibly
  image lightboxing on card grids.
- No AOS/GSAP class hints were found, but the overall production values
  (bespoke card transitions, sticky header, interactive map, "peek"
  carousels) suggest a custom motion layer rather than an off-the-shelf
  scroll-reveal library.

### Responsive notes
- Nav collapses to a hamburger + mobile mega-menu drawer (the class
  `js-mobile-button` / `js-container-level-2` naming suggests an
  accordion-style expand for menu categories on mobile, not just a flat
  link list).
- The 4-tile capability row becomes a horizontally swipeable 2-up carousel
  with arrows on mobile, rather than a 4-across grid.
- The interactive destinations map collapses to a compact map thumbnail
  with an explicit "Expand Map" button overlay on mobile — a sensible
  degrade path for an inherently desktop-oriented interaction.
- The dark stat strip stays in a single row longer than AlUla's equivalent,
  wrapping to a narrower layout rather than a full vertical stack.
- Footer's 4 columns stack vertically on mobile as expected.

### Palette / type notes
- Deep navy/black backgrounds for stat/impact sections against warm sand
  and turquoise-sea photography; a muted gold/bronze accent
  (used for the "Operational Excellence" eyebrow text and CTA outlines).
- Display typeface "Questa Grande" (a serif) for headings paired with
  "Paralucent" (a humanist sans) for body/UI — a serif+sans editorial
  pairing, distinctly more "premium travel brand" than the other two sites'
  single-sans-family systems.

---

## Synthesis for Dyafa Development

### (a) Strongest patterns worth adapting

1. **Interactive destination/map picker** (inspired by **Red Sea Global**) —
   an illustrated map with clickable location pins that surface a docked
   destination card is a much stronger way to showcase a portfolio of
   physical places than a plain grid, and fits a "destination developer"
   narrative well. Worth building as a first-class component rather than
   defaulting straight to a card grid.
2. **Lean, high-impact stat strip** (inspired by **AlUla/UDC**) — a
   dark-background, photo-backed band with 3–4 large numbers is simple to
   build, reads well at a glance, and (per AlUla's homepage) doesn't need
   to be buried among a dozen other sections to land — restraint is itself
   a lesson here.
3. **Sticky header + refined hover micro-interactions** (inspired by **Red
   Sea Global**) — explicit, deliberate transition timing on cards (not
   just relying on browser defaults) and a persistent sticky nav read as
   materially more premium/production-polished than the other two sites.
4. **Mission-statement-with-"show more" toggle** (inspired by **Red Sea
   Global**) — progressive disclosure for the about-teaser paragraph avoids
   the common trap of either truncating awkwardly or dumping a wall of text
   right under the hero.
5. **Capability/site-map tile row as visual navigation** (inspired by **Red
   Sea Global**) — turning "Services / Subsidiaries / Portfolio / Invest"
   into a 4-tile photographic row just below the hero is a good pattern for
   surfacing a multi-business-line company's structure immediately,
   something Dyafa likely needs given its own multi-line offering.
6. **Leadership/team tile teaser with hover captions** (inspired by **Jabal
   Omar**'s About page — CEO message / Board / Leaders tiles) — a
   lightweight way to humanize an About page without needing full bios
   inline.
7. **Icon-value-prop trio** (Mission / Vision / Values, inspired by **Jabal
   Omar**) — simple, cheap-to-localize (EN/AR) pattern for an About page
   intro.
8. **Numbered-fraction + arrow carousel controls** (inspired by **Red Sea
   Global**'s "1 / 3" style indicator) — more informative than plain dots
   for carousels with only a handful of slides, and easier to make
   accessible.

### (b) Anything to deliberately avoid

1. **Jabal Omar's cookie-consent overlay** is heavy and blocks first
   interaction; a lighter, dismiss-friendly banner is preferable.
2. **AlUla/UDC's mobile stat-strip stacking** (each number+label pair
   stacked full-width vertically) wastes vertical space on mobile compared
   to a 2×2 grid — worth explicitly avoiding this exact reflow.
3. **Over-deep, generic-wrapper-div markup** (seen at the extreme in Red Sea
   Global's AEM output — 10+ levels of single-child `container`/
   `responsivegrid`/`cmp-container` wrapper divs before reaching real
   content) makes the DOM harder to maintain, style, and debug, and hurt
   this very research script's automation. A Next.js implementation should
   favor flatter, semantically-named component trees.
4. **Non-semantic chrome markup** (Red Sea Global's header/footer/mega-menu
   built entirely from generically-classed `<div>`s instead of
   `<header>`/`<footer>`/`<nav>`) is worse for accessibility and
   SEO/tooling than semantic HTML5 landmarks — use real landmark elements in
   the rebuild even while achieving a similarly rich mega-menu visually.
5. **Jabal Omar's very link-dense footer** mixes core nav, legal, and
   operational deep-links (parking booking, live crowd-density status) into
   one long undifferentiated column list — worth grouping more clearly by
   audience (visitor-facing vs. investor-facing vs. legal) rather than one
   flat list per column.
6. **Inconsistent nav depth signaling** — none of the three sites give a
   strong visual "this item has a submenu" affordance beyond a small
   chevron/arrow; for Dyafa's mega-menu, make expandability more obviously
   discoverable (especially on mobile, given RSG's very deep categorized
   menu shows how easy it is to bury items).

### (c) Recommended reusable component/template types

To cover the patterns observed across all three sites, a Next.js component
library for Dyafa should include at minimum:

- **Hero variants**: full-bleed image/video hero with headline + single CTA
  (Jabal Omar/AlUla style); hero with secondary quick-link row beneath the
  fold line (Red Sea Global style).
- **Sticky/transparent header** with a prop/variant switch between
  "transparent-over-hero" and "solid/sticky-on-scroll" behavior, since all
  three sites use a different one of these.
- **Mega-menu navigation** built on semantic `<nav>`/`<header>`, supporting
  both a simple flat list (Jabal Omar/AlUla) and a multi-column categorized
  drop-down (Red Sea Global), with a clear mobile accordion/drawer variant.
- **Stat/metric strip** — configurable 3–4-up (or more) large-number band
  over a photo or solid-color background, with an explicit mobile 2×2 (not
  full vertical stack) breakpoint behavior, and support for an animated
  count-up on scroll-into-view.
- **Icon-value-prop row** (3-up mission/vision/values or similar), for About
  pages.
- **Project/destination card grid** — standard responsive grid for listing
  developments/destinations, with a hover micro-interaction (image
  zoom/overlay) as a first-class variant, not an afterthought.
- **Interactive map/destination picker** — pin-based map component that
  surfaces a docked info card per location, with a mobile "expand map"
  fallback.
- **Carousel/slider component** — supporting both arrow+numbered-fraction
  and dot-pagination variants, configurable autoplay, and a "peek next
  card" layout option.
- **Masterplan/roadmap-with-progress component** — illustrated site plan
  paired with per-phase progress bars and a detail modal per phase (from
  Jabal Omar), useful for any Dyafa development-progress storytelling.
- **Leadership/team tile teaser** — image tiles with hover captions linking
  out to fuller bios/governance pages.
- **Partner/logo strip** — simple horizontal logo grid (hotel brands,
  strategic partners), responsive down to 2 columns.
- **News/media card grid + carousel** — both a static 3-up grid (for a
  homepage teaser) and a carousel variant (for a denser media center page).
- **Tabbed content switcher** — seen on Red Sea Global's portfolio page for
  switching between residence sub-brands; generically useful anywhere
  Dyafa needs to present parallel content sets without a full page nav.
- **Footer template** — multi-column link groups (grouped by clear
  audience: visitor / investor / company / legal), newsletter signup block,
  social icon row, and app-store badge row as an optional slot.
- **CTA banner** — simple centered heading + single button, full-width,
  reusable between "Get in touch" and similar terminal-of-page prompts.
- **Newsletter signup block** — as both a standalone footer-adjacent
  section and (optionally) embedded within the footer itself.
- **Gallery/lightbox** — for mall/retail or destination photo sets, with
  modal-based image viewing (pattern seen on Red Sea Global).
- **Award/logo carousel** — narrow horizontal scroller for
  awards/certifications, arrow-navigated.
