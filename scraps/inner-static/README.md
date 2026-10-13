# Static inner-page audit

Reviewed 94 static routes at 1440, 768, and 390 pixels: 282 page visits and full-page screenshots. The route inventory is in `routes.json`; individual checks and screenshot names are in `results.json`.

## Changes

- Added scoped `inner-pages.css` for the static `.source-hero` family, without changing approved main-page templates: narrower reading measure, consistent heading/paragraph/list rhythm, balanced long titles, aligned category cards, wrapping CTAs, tablet contact layout, and readable form/checklist controls.
- Added `format-inner-pages.cjs`, now integrated in the main build: original policy headings and bullet lists receive semantic markup, empty imported text blocks are removed, and Dr. Lee's biography is split at the original paragraph boundaries. Article wording signatures are asserted before writes; policy wording is preserved.
- Repaired the inert Return Policy support address as a `mailto:` link and the Medical Team page's “Back to providers” text as a real internal link.

## Verification

- All 282 visits returned HTTP 200, one main H1, and no horizontal page overflow, missing images, empty links, hidden content, or JavaScript page errors.
- A separate browser-console sweep of all 282 visits found no console errors (`console.json`).
- All 168 distinct internal destinations referenced by these pages exist (`links.json`).
- Keyboard-opened and closed all 20 FAQ entries across FAQ and the two recovered Semaglutide pages.
- Verified both hormone checklists: 55 men's options and 51 women's options, empty-state summary, selected-state summary, and reset. Answers remained local.
- Verified contact required-field and invalid-email validation, mobile menu, and symptom dropdown. No messages, bookings, or payments were submitted (`interactions.json`).
Full screenshots were reviewed through top/middle/bottom contact sheets (`visual-review-01.jpg` through `visual-review-12.jpg`) and readable detail captures for each template family. The 18 unusually tall pages use bounded Chromium screenshot tiles and stitched full-page images, avoiding the browser's large-image wrapping artifact (`long-screenshot-tiles.json`, `tiles/`).

## Coverage

- 19 blog category archives and the health category landing page.
- 22 checklist routes, four additional men's/women's aliases, and the thyroid assessment alias.
- 27 GLP-1 information routes, two recovered Semaglutide product-information routes.
- Five legal routes, plus Privacy, Terms, and Return Policy.
- Three provider profiles, Providers, Contact, Join Our Network, FAQ, Symptom Check, Menopause, and Menopause Quiz.

## Existing content/integration limitations

- 26 GLP-1 topics and Menopause Quiz still contain their honest unavailable-content notices. No medical information was invented to fill them.
- Medical Team has no recovered biography beyond its return link. Specialty symptom pages other than the two hormone checklists remain educational content; no scoring was fabricated.
- Contact remains an email-draft flow. Live provider registration, clinical booking, and Shopify order completion were not submitted.
- Existing repeated policy wording was retained because this audit changes formatting, not the legal text.
