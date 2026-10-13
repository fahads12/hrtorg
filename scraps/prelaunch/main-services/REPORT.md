# Main pages and service-route prelaunch audit

Completed 2026-10-12 against the local source preview (8000) and clean publishing preview (8011). No deployment, real order, patient record, email, or authenticated portal action was performed.

## Coverage and visual evidence

- **40 route/query cases at 1440, 768, and 390 CSS pixels: 120 final full-page captures and actual visual reviews.** This includes 117 local route/viewport cases and the external Shopify destination in three widths.
- Pages: `index.html`, `HRT Home.html`, retired `HRT Landing.html` default/men redirects, `Audience.html` default/women/men, `Lab Testing.html`, `lab-testing/index.html`, `Treatments.html`, `How It Works.html`, `Pricing.html`, `Consultation.html`, `Shop.html`, and `Product.html` default plus all twelve treatment/audience combinations (including women/ED normalization to sexual health).
- Direct service pages: all six `men/` service routes, all five `women/` service routes, and both `hrt-products/semaglutide-.../` pages.
- `final/coverage.json` records each route, viewport, status, destination, screenshot, overflow, image and runtime findings, visual reviewer and review scope. All 117 local final cases returned HTTP 200 with no horizontal overflow, broken image, or recorded runtime error.
- Every final full-page capture was inspected as a full-height section montage. Close-up section/interaction screenshots supplement the page sheets. Forty-two final reviews were independently performed by the forms/info audit agent; 78 were performed by the main/services audit agent. This is layout and interaction verification, not clinical approval of supplied medical copy.
- Baseline `coverage.json` contains 117 initial cases: 116 were captured/reviewed; the first external Shop tablet attempt timed out. Final capture/review closed that gap and added exact default `Audience.html` coverage.

## Fixes made

1. Corrected misleading consultation actions: actual start-consultation links now use the existing approved HRT portal destination. Links opening the optional local preparation guide are explicitly labeled **Prepare for a consultation**.
2. Added preparation-guide birth-date validation: required date, native maximum date, invalid/future-date feedback and disabled continuation. Required name, email and state fields expose matching browser validation/autocomplete semantics. The final step says **Next step**, avoiding a false consent/submission implication.
3. Removed the unrelated peptide/hormone-optimization template block from the women's weight-management source rendering. The archived source remains intact. Root also removed the repeated BioBoost paragraph and repaired duplicated provider credentials and audience topic mappings.
4. Fixed a real server-rendering/reveal race: the reveal observer was attached to HTML that React subsequently replaced, leaving homepage sections permanently invisible. The observer now discovers added elements in a batched child-list observer; reveal animations are finite and content remains visible by default if animation code fails. Care/parallax initialization also rebinds after the rendered root is replaced. The final desktop, tablet and mobile screenshots show all homepage cards and images.
5. Removed the React 18 server-rendering warning for the treatment hero's `fetchpriority` attribute.

Root coordinated shared contrast, static rendering, metadata, query prepaint, font-loading, redirects and deployment-output fixes. This report does not duplicate the full global audit.

## Functional checks completed

- **72 service interaction cases:** all 24 meaningful Product/query/direct-service entry cases at three widths; treatment/audience normalization, opposite-audience navigation, reload, six section targets, table of contents, in-page anchors and keyboard FAQ open/close. Native smooth scrolling was allowed to settle before judging anchor visibility. Evidence: `service-interactions.json`.
- **Three complete local care journeys:** home to Men to direct service, browser Back/Forward, preparation guide, validation, all guide steps, previous-answer retention, exclusive None option, review and completion; clear not-submitted/no-appointment status; approved portal handoff; reload clears local preparation state. No health answers entered URLs or browser storage and no write requests were made. Evidence: `final/journeys.json` and `final/journey-*.png`.
- **Homepage:** parallel/equal portrait cards, seven testimonial slides, dots, arrow keys and wraparound, reduced-motion behavior; no runtime errors. Evidence: `final/home-fallback.json`.
- **Lab Testing:** kit destinations, details and FAQs by keyboard, all five process scenes, mobile menu, in-page links, alias refresh, reduced motion and no-JavaScript content.
- **How It Works:** all five process scenes, 11 images, FAQ keyboard behavior, anchors, reduced motion, no-JavaScript content and widths down to 320 pixels.
- **Treatments:** audience filter and five correct destinations, FAQ controls, four process scenes, all 15 local destinations, reduced motion and widths down to 320 pixels.
- **Header audience navigation:** desktop and mobile keyboard switching, current-state semantics, theme/URL updates, menu closing, rapid changes and reduced motion.
- **Fallbacks:** no-JavaScript checks on seven templates; direct service pages retain readable content. Query-driven Audience/Product use a neutral care fallback with direct route links. Both fallback screenshots were inspected; no wrong-gender default content is presented.
- **Reveal regression:** on final preview all reveal elements become visible after scrolling at 1440/768/390. Aborting `site-interactions.js` leaves all reveal content readable. Evidence: executable `verify-reveal-final.cjs`.
- **26 external read-only browser checks:** all linked store/portal/medicine destinations returned HTTP 200 with expected page titles. Chrome OS trust succeeded where the separate Node TLS check failed on this environment's certificate chain. Evidence: `external-browser.json` and external portal screenshots.

## Owner confirmation and untested boundaries

- The approved portal start URL currently renders the **Hormone Health Symptom Score** entry flow. Portal root renders login. These landing screens were verified; an authenticated booking, successful record submission, email delivery, cart, payment, and fulfillment were deliberately not exercised.
- Source service copy says testing results arrive in 3-7 business days and describes a consultation at no additional cost. Store/lab content contains product-specific 5-7, 7-10, and other timing wording, with consultation inclusions not consistently specified. Preserve product-specific wording pending owner reconciliation.
- Source men's HRT and peptide FAQs include $100-$500 and $250-$600 monthly ranges, respectively. This audit confirms the copied wording and presentation, not current commercial availability. The unverified $49.95 membership remains unavailable as a published offer.
- Source medical benefit claims, generalized FDA language, statistics and treatment suitability require the owner's clinical/content review before launch. Technical checks do not establish medical accuracy or regulatory status.
- External Shopify has awkward category title word wrapping on mobile. One blog image was absent in the desktop capture but present at other widths. These are external store presentation observations; the local redirect works. Blocked analytics writes during read-only testing can generate external console errors and were not classified as local page failures.
- Browser screenshots cover Chrome desktop/tablet/mobile emulation. Root separately recorded Edge smoke coverage. This does not replace testing on physical iOS/Android devices or authenticated external integrations.

No unresolved local layout or interaction defect remains from this scoped audit. Remaining content and external integration decisions are explicitly listed above.
