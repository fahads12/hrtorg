# HRT.org implementation

The main website keeps the approved navy, blue and plum design, serif headings, molecular hero, shared navigation and footer. **Shopify remains a separate store.** Navigation and test-kit purchase links go to `https://store.hrt.org/` or the original product URL. `Shop.html` is a redirect. There is no local catalog, cart, checkout or payment simulation.

## Pages and content

- Homepage; women’s and men’s care; all 11 original treatment/service pages; menopause information.
- The full original For Women / For Men audience layout is restored in `audience-app.jsx`: hero, interactive symptom selector, four life-stage panels, five treatment cards, provider profile, article library and consultation CTA. Source-backed content replaces prototype claims; Shopify remains external. Run `node verify-audience.cjs` for its responsive and interaction checks.
- Lab Testing, How It Works, Pricing/purchasing handoff, and 12 source test-kit FAQs.
- About, Contact, Medical Board and individual provider profiles, Join Our Network.
- Original health articles and category listings, with working local article search.
- Symptom assessment information pages; the nine-item navigation opens the corresponding page. The actual interactive assessments continue on the original HRT.org website.
- Eight policy/legal documents, including privacy, terms, returns, telehealth consent, health-information privacy, supplement consent and pharmacy information. Their normalized wording is compared with source snapshots during every content build.
- The original `.html` entry points continue to work. Product.html maps its existing treatment/gender query parameters to the appropriate treatment page. Article.html opens the journal instead of the old fabricated example article. Consultation.html hands off to the real patient portal.

Content was collected from the original site’s robots.txt, sitemap and linked public pages. The read-only crawl attempted 456 URLs, with 338 distinct successfully retrieved destinations. Raw HTML is retained in `source-content/html`, with an index in `source-content/crawl.json`. Main-site product pages supplied original kit photos and FAQs; Shopify catalog data is **not used in the website**.

`source-content/migration-report.json` lists generated pages, inaccessible source URLs, thin source pages, asset failures and policy comparisons. `source-content/verification.json` records the latest test results. These reports distinguish imported content from gaps in the original source.

## Functionality and dependencies

- **Consultations/sign-in:** live `portal.hrt.org` destinations. The original six-step intake layout is restored as an explicitly labelled, optional preparation tool. Answers live only in page memory, reset on navigation/refresh, and are not sent to HRT.org. Clinical intake, consent and booking continue through the real portal. Direct local submission still requires an approved clinical endpoint, authentication and consent configuration.
- **Purchasing:** live Shopify destinations. No Shopify credentials are needed for this handoff. Prices and stock remain in Shopify.
- **Contact:** verified phone/email links plus an explicitly labelled email-draft form. It opens the visitor’s email application and does not claim to send. A link to the original hosted contact form is also provided. To submit directly from this project, supply an approved form backend endpoint, its required fields and spam-protection configuration. The original Webflow form had no reusable public submission endpoint in its HTML.
- **Provider applications:** original hosted network application. A local submission service is not configured.
- **Assessments:** original hosted assessment flows. Their email/results integrations are not recreated without the actual integration configuration.

## Source issues requiring owner review

1. Nineteen source URL requests failed. The exact URLs/errors are in the migration report; working replacement routes were used where the crawl established them. Missing source material was not invented.
2. The 27 `/glp-1/` source pages contain no substantive published article body. Their local pages disclose the source gap and link to the original; they are not presented as completed articles in the journal. The `medical-team` and `menopause-quiz` sources are also sparse. Their available text/hosted destination is preserved.
3. The About page’s guarantee says **60 days for unused OTC products**; the Return Policy says **30 days for unopened supplements and unused sealed lab kits**. Both original wordings are retained. The owner needs to confirm which guarantee applies before changing either source claim.
4. Main-site product prices differ from some Shopify prices. Local purchase links leave pricing to the store. Lab Testing states **5–7 business days after receipt**, while individual kit FAQs state **7–10 business days**. Page-specific source wording is retained; the general process avoids a uniform timing promise.
5. The source About page advertises a **$49.95 annual membership**. Confirm that this legacy program is still offered; the original statement is preserved rather than replaced with prototype pricing.
6. The source Contact page lists an Australian address also associated with its template content. It is not presented as a verified HRT business address. Confirm the real postal address if it should be displayed. The phone `(888) 574-5524`, `info@hrt.org` and order-support `support@hrt.org` are preserved from the source.
7. The source footer’s Disclaimer link has no destination. Supply its actual document if it is a separate policy. No disclaimer wording was invented as a replacement.

## Build, run and verify

The existing editable JSX and CSS remain in the project. The homepage JSX is compiled ahead of time to local production JavaScript; visitors no longer download runtime Babel or React from a CDN. Original audience, treatment, About, process, pricing, resource and article JSX layouts are restored and compiled to production JavaScript. Policies and other source pages remain static HTML.

```powershell
python -X utf8 build-content.py
python -X utf8 prepare-restored.py
node build-site.cjs
node serve.cjs
# In another terminal:
node verify-site.cjs
node verify-restored.cjs
```

Build dependencies available locally: Python + BeautifulSoup/Pillow in `.tools`; Node + React 18, ReactDOM 18, Babel standalone and Playwright in `node_modules`; installed Chrome for browser verification. `update-home.cjs` is a one-time migration, not part of the normal build.

Open `http://localhost:8000/HRT%20Home.html`. The build fingerprints local CSS and JS to prevent stale cached versions.

Verification checks generated links and local assets, representative page rendering, desktop/tablet/mobile layouts, native assessment menus, article search, contact validation, external portal destinations, reduced motion, browser runtime errors and exact policy wording. It does not place orders, submit patient data or send messages.

Original page components are active again, with source-backed content supplied by `build-restored.cjs`. Pristine pre-restoration JSX copies are in `scraps/original-layout-backup`. `restore-original-pages.cjs` is a historical one-time migration, not a normal build command; rerunning it would overwrite later fixes. Do not deploy `.tools`, `node_modules`, `source-content`, `scraps` or the build/crawl scripts as public production content.


## Original-layout restoration and AI images

The homepage and full For Women / For Men pages retain the approved design. Original treatment filters and comparison table, product detail sections and gender switch, About story/team, five-step process layout, pricing cards, six resource categories and searchable library, article reading/sidebar rails, landing page audience switch, and six-step consultation preparation UI are active. Prototype claims, invented clinicians, fake reviews and unverified pricing are not restored; source material fills those sections. The store remains external Shopify.

Two generated editorial WebP images are used on the homepage and relevant care pages, with descriptive alt text and internal provenance records. The actual kit and provider photos remain original assets. See `AI-ASSETS.md` for asset paths and generation specifications. Motion uses IntersectionObserver/CSS with reduced-motion overrides; image loading is lazy and no scroll hijacking is used.

`prepare-restored.py` reads the saved source crawl. Generated WebP assets are committed project inputs; regenerating them is not required for a normal build. No credentials are needed for source-content rebuilds or Shopify redirects.


## Image and UI follow-up

Added four generated editorial photos plus responsive 720px variants. Removed visible AI captions at the owner?s request. Kept the molecular hero, actual product photographs and real provider portraits. Corrected audience hero typography and empty space, small-screen CTA sizing, treatment-grid balance, provider-image cropping, resource-card icon gaps, process-summary column counts, and treatment hero cropping. Homepage men/women cards now link to the same full audience pages as the navigation. See `AI-ASSETS.md` for the asset inventory.


## Hero and care-process refinement

The homepage now uses a generated at-home care photograph in place of the molecular hero. The five-step care process is a responsive vertical timeline with active-step emphasis and scroll-linked line progress. Additional audience, About and library cards use native viewport reveals. Shared scripts are injected by `build-site.cjs`; no new runtime dependency or paid assets were added. Source review, access limitations and licensing decisions are documented in `MOTION-SOURCES.md`. All enhancement content remains visible without animation.

Audience palette update: `care-theme.css` applies the selected plum women's or navy/blue men's theme across shared controls, sections and footer. `care-theme.js` retains only the audience palette in sessionStorage; no medical data is stored. Both audience pages retain the centered animated switch, hyphenated headlines, treatment images and reduced-motion support. Verified with `verify-care-theme.cjs`, `verify-audience.cjs` and `verify-restored.cjs`.

Homepage split portrait update: replaced the single couple hero with two real anchor panels using existing `men-care-v2` and `women-care-v2` editorial assets. Each links to its matching audience page. Fine-pointer hover expands the panel and subtly zooms the image; touch keeps stable side-by-side targets. Keyboard focus is visible and reduced motion disables transforms and expansion. Verified via `verify-split-hero.cjs`: widths 320/390/768/1440, image loading, hover expansion, both destinations, selected themes, keyboard activation and reduced motion. No new assets, libraries or external services.

Theme scope correction: `care-theme.js` now applies the audience palette only on `Audience.html` and clears the obsolete session preference. Home and general pages keep their standard design regardless of prior visits. Removed duplicate CareOverview men/women cards, retaining benefits and symptom sections. New homepage portraits retain hover, keyboard and reduced-motion behavior. Verified with verify-home-neutral.cjs, verify-split-hero.cjs and verify-care-theme.cjs.

Legacy-site reference cleanup: removed public migration credits, article source bylines, testimonial source footer, and old-site contact/application destinations. Main-domain content links resolve locally; unavailable referenced content is unlinked. The provider-network enquiry opens email honestly; legacy assessment CTAs open the local symptom-check directory. Shop, portal, email/phone contacts, clinical third-party references and HRT branding remain functional. `clean-site-references.cjs` runs before asset fingerprinting on every build, covering HTML and browser JS data. Private crawl/provenance records remain in the non-public source-content archive to preserve factual verification; they are not visitor-facing destinations. Verified 332 published files for legacy URLs, all 297 pages for links/assets, 71 rendered routes plus responsive/forms/menus/reduced-motion checks, and targeted reference-cleanup navigation checks.

Retired duplicate audience landing: `HRT Landing.html` now contains only a compatibility redirect to `Audience.html`, preserving men/women hash or query selection. The build no longer emits the alternate layout; the old JSX renderer is also a redirect. Shared navigation and treatment breadcrumbs link directly to current audience routes. Verified legacy URL variants and treatment-page links with verify-retired-landing.cjs.
