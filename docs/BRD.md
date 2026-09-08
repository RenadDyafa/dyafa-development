# BRD — Dyafa Development Website
**Business Requirements Document · v1.0 DRAFT · 2026-09-01**
Public brand: **Dyafa Development | ضيافة للتطوير**
Legal entity (footer / legal pages only): **Dyafa Real Estate Investment & Development | شركة ضيافة للاستثمار والتطوير العقاري**

> Status: DRAFT for human approval. Nothing in this document authorizes publishing. All facts marked **[NEEDS VERIFICATION]** must be confirmed before launch.

---

## 1. Purpose

Build the official bilingual (EN/AR) website for Dyafa Development: a credibility hub and lead-generation engine that positions the company as a Saudi hospitality development platform and converts landowners, investors, and partners into qualified BD conversations.

The site is **not** a real-estate listing site, a contractor portfolio, or a guest-facing hotel site. Its single strongest message is the approved brand promise:

- EN: **From opportunity to operating asset.**
- AR: **من الفرصة إلى أصل يعمل بكفاءة.**

## 2. Business objectives & KPIs

| # | Objective | Primary KPI | Secondary KPI |
|---|-----------|-------------|---------------|
| O1 | Generate qualified landowner leads | Site-review form submissions | WhatsApp qualified enquiries |
| O2 | Generate investor/fund conversations | Meeting requests | Investor page engagement |
| O3 | Own "modular hospitality" education in KSA | Organic traffic to modular pages | Saves/shares of linked content |
| O4 | Build institutional credibility | Time on About/Model pages | Returning visitors |
| O5 | Support events & campaigns (Cityscape Nov 16–19, FII10 Oct 26–29) | Campaign landing-page conversions | UTM-attributed leads |

Baseline numbers: **[NEEDS VERIFICATION: KPI baselines export — open item #3 in Q4 system, due Sep 5]**.

## 3. Audiences (priority order)

1. **Landowners** — own strategic land, unclear product. Need: concept logic, feasibility credibility, easy site submission.
2. **Investors / family offices** — need discipline, governance, risk visibility. No return promises.
3. **Developers / JV partners** — need modular logic, operator alignment, flexible structures.
4. **Municipalities / government** — need economic-impact framing, Saudi execution depth, compliance awareness.
5. **Hotel owners with underperforming assets** — need repositioning/conversion logic.
6. Secondary: banks, hotel brands, consultants, contractors, tourism authorities, media, talent.

## 4. Scope

### In scope (Phase 1 — launch)
- Bilingual marketing site (EN/AR, full RTL) with the pages defined in FEATURES.md §2.
- **"Submit Your Site for Review"** lead funnel (form + WhatsApp intake + email notification + CRM tagging).
- Insights/blog engine (SEO + thought leadership).
- Projects/milestones section with **approval-gated publishing** (no project appears without CEO/legal approval flag).
- Admin CMS with draft → review → approve → publish workflow and bilingual content editing.
- Newsletter capture, contact, careers-lite (talent form).
- Analytics, SEO (hreflang, JSON-LD), performance and accessibility baselines.

### Out of scope (Phase 1)
- Investor portal / gated data rooms.
- Online payments, e-commerce.
- Guest-facing hotel booking (belongs to hotel brands, never to Development).
- Public financial data, IRR calculators, return projections (HIGH-RISK, forbidden without approval).
- Arabic-only microsites, TikTok embeds.

## 5. Brand & content requirements (non-negotiable)

1. Public-facing name is always **Dyafa Development | ضيافة للتطوير**; legal name only in legal/footer contexts.
2. Never position as contractor, broker, design office, or generic developer.
3. Every development message links to **operation and long-term value**.
4. Modular = disciplined repeatability, never "cheap/temporary."
5. Arabic is natural Saudi business Arabic, never literal translation; visually equal to English, correct RTL.
6. **No invented facts**: no project names, pipeline size, costs, IRR, returns, approvals, financing, delivery dates. Placeholders: `[Insert approved project figure]`, `[Insert verified milestone]`.
7. Banned language enforced site-wide and in CMS (see FEATURES.md §9 compliance engine): "guaranteed returns / عوائد مضمونة", "best developer / أفضل مطور", "risk-free", "فرصة لا تعوض", "dream project", "fully approved", etc. (full list in 17_DO_NOT_USE).
8. Vision 2030 referenced only with specific, grounded substance.
9. Government entities, partner names/logos, and any numbers require documented approval before publish (HIGH-RISK flag in CMS).

## 6. Governance & approval workflow (must be enforced by the CMS)

Draft (Marketing) → Technical review (Development lead) → Positioning review (CEO, if flagged) → Legal/finance review (if HIGH-RISK triggers fire) → Marketing QA → Publish.

**HIGH-RISK auto-triggers** (content blocked from publish until an approver with `legal` or `ceo` role clears it): any number/currency/percentage, the words secured/approved/funded/guaranteed/مضمون/معتمد, government or ministry names, partner names not in the approved-partners table, project names not in the approved-projects table, dates presented as delivery commitments.

## 7. Functional requirements (business level)

| ID | Requirement |
|----|-------------|
| BR-01 | Visitor can switch EN ⇄ AR on any page and stay on the equivalent page. |
| BR-02 | Landowner can submit a site (location, area, legal status, documents) in under 3 minutes on mobile. |
| BR-03 | Every lead is auto-tagged by persona (landowner / investor / developer-JV / government / consultant / media / talent) and source (UTM). |
| BR-04 | BD team is notified of new leads within 1 minute (email + optional WhatsApp handoff link). |
| BR-05 | Marketing can publish bilingual insights without developer involvement. |
| BR-06 | Projects can only display **approved** name, stage, and copy; unapproved fields render as hidden, never as placeholders publicly. |
| BR-07 | Campaign landing pages can be cloned per campaign (e.g., "Submit Your Site", "Modular Hospitality Explained") with independent UTM tracking. |
| BR-08 | All published content passes the banned-language check automatically. |
| BR-09 | Site meets performance (LCP < 2.5s), accessibility (WCAG 2.1 AA), and SEO (hreflang, sitemap, JSON-LD) baselines. |
| BR-10 | Legal pages: privacy policy, terms, PDPL-compliant consent for forms. **[NEEDS VERIFICATION: approved legal wording]** |

## 8. Non-functional requirements

- **Hosting/stack**: modern SSR framework (Next.js), PostgreSQL, deployable to Vercel or self-hosted Node. See FEATURES.md §7.
- **Security**: HTTPS only, rate-limited forms, spam protection, RBAC admin, audit log of publish/approve actions, no PII in URLs.
- **Data**: leads stored in KSA-appropriate hosting region where feasible **[NEEDS VERIFICATION: data-residency requirement]**; PDPL consent text on all forms.
- **Localization**: `sar`/Arabic numerals policy decided per brand review; Hijri date display optional.
- **Uptime**: 99.9% target; static-first rendering so marketing pages survive backend outages.

## 9. Dependencies & open items

1. Identity kit for Dyafa Development (final logo files, favicon) — **[NEEDS VERIFICATION: open item #4, identity kits Holding/Development/Aqar]**.
2. Landing-page endpoints & WhatsApp business numbers — **[NEEDS VERIFICATION: open item #6]**.
3. Approved project list for the Projects section — currently **empty**; section ships behind a feature flag.
4. Legal wording for privacy/terms and PDPL consent.
5. Domain + DNS + email (SPF/DKIM) — **[NEEDS VERIFICATION]**.
6. Photography/renders: only approved assets; concept AI images labeled internally "concept visual."

## 10. Risks

| Risk | Mitigation |
|------|-----------|
| Content publishes with investment claims | CMS banned-language gate + HIGH-RISK approval roles (§6) |
| Site reads as contractor/broker | Copy sourced only from approved message house; brand QA checklist in FEATURES.md §12 |
| Weak Arabic (literal translation) | Native review step required before publish; AR stored as independent field, never machine-filled at publish time |
| Empty Projects section damages credibility | Launch with process/education-led IA; Projects behind flag until first approved milestone |
| Lead leakage | Single leads table, notification SLA, weekly lead-quality review (monthly review process from governance doc) |

## 11. Acceptance criteria (launch gate)

- All Phase-1 pages live in EN + AR, RTL verified by a native reviewer.
- Site-review form: end-to-end test lead reaches BD inbox with correct tags.
- Banned-language scan of all published content: zero hits.
- No numbers, partners, government names, or project claims present without an approval record.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 on Home, Model, Submit-Site (both locales).
- CEO/legal sign-off recorded for all HIGH-RISK content.
