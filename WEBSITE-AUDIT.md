# Website audit — current status 12 October 2026

The latest [deep prelaunch audit](PRELAUNCH-AUDIT.md) supersedes earlier coverage and launch-readiness statements below. It covers 306 public HTML files plus 15 query variants at desktop, tablet, and mobile widths, with a [route checklist and screenshot gallery](scraps/prelaunch/index.html).

**Launch assessment: not ready for unrestricted production.** Local UI, routing, accessibility, static-rendering, form-failure, and Vercel build fixes are complete. Live n8n/email verification, 26 missing GLP-1 articles, five unsupported legacy workflows, current business/source confirmations, and actual deployment verification remain. Nothing was deployed and no live submissions or external records were created during this audit. The current output stays noindex; only an approved production build with `HRT_ALLOW_INDEXING=true` enables eligible pages.

The historical audit and implementation notes follow; retain them as a record of earlier verification, not the current launch assessment.

## Previous audit — 11 October 2026

Current checklist integration status (12 October 2026): the user explicitly approved the external contact/health data transfer and results-email trigger. The website adapter is enabled for all nine forms in local source (`LIVE_ENABLED=true`), with zero-symptom hormone submissions kept local. Earlier audit sections below preserve their status at the time; the current enablement addendum at the end supersedes disabled/pending-approval statements. Production deployment and live workflow/email execution remain unverified.

## Coverage and evidence

### Animated on-site checklist results — 12 October 2026

- Implemented a shared semicircular SVG gauge for all nine local results pages, with a single needle/arc sweep to the actual score and maximum. Added category count bars to the women’s and men’s results. Kept the source calculations and category wording unchanged.
- Added clearly labeled email status cards. A sent acknowledgement appears only after the adapter confirms email-service acceptance; uncertain/failed requests retain their results and manual retry action. Pending requests remain guarded against duplicate submission. No completion redirect or additional score transfer was introduced.
- Build passed. All 54 focused checks passed: nine assessments at 1440/768/390px, zero/maximum endpoints, normal/reduced-motion rendering, the six final delivery states and pending submission. The real enabled adapter also passed all 27 intercepted integration checks; existing delivery/retry tests passed. No real emails or submissions occurred.
- Reviewed fresh desktop and mobile result screenshots for gauge sizing, category text, count bars and email confirmation. The native SVG/CSS implementation adds no animation library or additional runtime dependency. [Focused results report](scraps/checklist-results/gauge-report.json) and screenshots are under `scraps/checklist-results/`; rerun `node verify-checklist-gauge.cjs`.

### Checklist navigation and imagery update — 12 October 2026

- Removed the optionless physical-symptom divider from the women’s and men’s wizard flows. The section title now appears with the first relevant checkbox group. No questions, choices, ordering, scoring or n8n mappings changed.
- Added decorative direction arrows to native Back/Continue buttons across all nine forms, preserving keyboard controls and reduced-motion behavior.
- Added nine unique generated editorial visuals with 480/960px WebP sources, descriptive alt text and reserved image dimensions. [Assets and generation prompts](source-content/checklist-images/README.md); [file validation](source-content/checklist-images/asset-validation.json).
- Fresh verification: build passed; all 27 full flows at 1440/768/390px passed; all 23 canonical/alias routes at 320px passed; 1,433,755 source scoring comparisons passed; 27 guarded n8n checks passed (22 mock requests, zero live submissions). Keyboard selection, back navigation and focus worked with normal and reduced motion.
- Reviewed all nine desktop/mobile introductory full-page screenshots, plus representative question, result and tablet views. No visible image-crop, alignment or wrapping defects found. [Visual review](scraps/checklist-images/visual-review.md), [320px route report](scraps/checklist-images/320-report.json), [keyboard/motion check](scraps/checklist-images/keyboard-motion.json). Main-page designs were not changed by this update. Physical-device and live-email delivery checks remain outside this verification.

- 312 local routes and query variants exercised at 390px mobile, 768px tablet and 1440px desktop: 936 initial browser visits. Coverage includes all local HTML pages, 182 article routes, service routes, policy pages, category archives, provider pages, audience pages and all treatment/gender combinations.
- Full-page screenshots captured for all local rendered pages; redirect cases tested separately. 932 initial captures, followed by replacement captures for flagged/changed pages. Additional section screenshots cover the hero, care walkthrough, testimonials, audience hero/library, treatment list, product hero, contact form and mobile menu.
- All 309 distinct collected local link destinations returned successful responses. In-page anchor targets, heading counts, image loading, horizontal overflow and browser runtime exceptions were checked in the full pass.
- Visual review used page overview sheets and close-up section captures. This is Chrome desktop with emulated viewport sizes, not a physical-device or Safari/Firefox certification. Automated layout checks cover all routes; they do not establish a formal accessibility or medical-content certification.
- Evidence: [screenshot gallery](scraps/full-audit/index.html), [route inventory](scraps/full-audit/routes.csv), [initial results](scraps/full-audit/results.json), [flagged-view rechecks](scraps/full-audit/rechecks.json), [supplemental checks](scraps/full-audit/supplemental.json), [final changed-page checks](scraps/full-audit/final-rechecks.json).

## Fixed

1. Long medical article titles could overflow mobile screens. Added safe word wrapping to article and source-page headings.
2. Invalid extensionless URLs returned blank responses. Added a branded, responsive 404 document with useful navigation; preview server returns HTTP 404 for missing paths and files.
3. A malformed heart-health category URL contained encoded whitespace. Added a redirect to the valid category route.
4. Desktop symptom-menu trigger was undersized. Increased its minimum height; improved mobile menu containment/scrolling, primary touch controls and footer-link spacing. Menu closes on navigation and resets when returning to desktop width.
5. Removed a leftover announcement-bar template sentence and replaced an irrelevant empty-product message in the health category with a library destination.
6. Added descriptive headings/titles to 26 empty-title GLP-1 pages. Their unavailable medical content remains explicitly unavailable rather than invented.
7. Provider listing cards cropped enhanced portraits. Switched those images to contained presentation.
8. The ED product's women selection fell back to male ED copy. Direct access and switching now select the existing women's sexual-health content; unknown product keys normalize to the HRT page.

## Verified interactions

- Men/women selection, homepage photo links and hover effects, stable homepage palette, retired landing redirects, treatment filters and product breadcrumbs.
- Mobile menu, assessment dropdown, scrolling on a short mobile screen, Escape dismissal and focus return.
- Native FAQs, resource search including empty results, article bookmarks and table-of-contents navigation.
- Testimonial previous/next buttons, direct-selection dots, keyboard navigation and reduced motion.
- Six-step consultation preparation, required inputs, consent controls, completion handoff and reset on refresh. No health information is persisted or submitted by this flow.
- Contact form required-field validation. This form opens an email draft; it does not send through a backend.
- Shopify redirect destination verified by intercepting external navigation. No order, booking, email or live record was submitted.
- Hero and care-roadmap motion, reduced-motion settings, responsive image loading. Initial lazy-image flags disappeared when image decoding was awaited; no missing files were found in those rechecks.

## Requires owner input or external verification

- Store and portal HTTPS availability checks were blocked by the environment's certificate trust error. The URLs and local handoffs are verified; authenticated booking, payment, checkout, confirmation emails and account behavior are not.
- 26 GLP-1 topic pages remain without recovered substantive body content. The two recovered Semaglutide product-information pages are different routes and do not resolve those 26 topics. See the recovery addendum below.
- Correction: the public men's and women's checklist scripts contain questions, category scoring, result text, contact fields, and n8n webhook destinations. Both checklists now have local questions and category summaries. Email delivery and remote submission remain unverified and disabled; other assessment integrations were not recovered in this pass.
- Source discrepancies are documented below. The women's hair-loss lab-testing introduction was omitted; no replacement medical copy was invented. Its relevant sections and FAQs were recovered. Membership availability still needs confirmation.
- Contact submission backend is not configured; provider-network enquiries use email. Real submissions were intentionally not performed.
- Production hosting must serve `404.html` with HTTP 404 and carry over the malformed-category redirect; the supplied local preview server now does both. Deployment configuration is outside this local audit.

The approved design, original article/policy bodies, Shopify separation and portal destinations were preserved.


## Source recovery follow-up - 11 October 2026

- **Semaglutide:** recovered descriptions, usage information, side effects, and four FAQs each at `hrt-products/semaglutide-injections/index.html` and `hrt-products/semaglutide-bioboost-injections/index.html`. Linked these informational pages from both weight-management treatment pages. Purchases remain external to the Shopify store; prescribing enquiries retain the patient-portal destination. No matching content was inferred for unrelated GLP-1 topics.
- **Assessments:** recovered 51 women's and 55 men's selections, four category counts, five category labels, the exact category-selection function, and submission schema. The two canonical checklist routes and four existing gender aliases now have accessible local checkboxes, summaries, reset, and keyboard support. No contact details, mailing-list subscriptions, email sends, or POST requests are made. Original diagnostic-style result narratives are archived rather than presented as a diagnosis. All-zero answers now show "No symptoms selected."; the original function otherwise categorizes that case as category 4.
- **Scoring verification:** compared the generated category function with the function independently extracted from each saved source script for every possible count combination: 34,650 women's cases and 47,040 men's cases. This verifies code equivalence, not clinical validity.
- **Submission dependencies:** recovered destinations are `https://vmi3206755.contaboserver.net/webhook/hormone-women-typeform-submit` and `https://vmi3206755.contaboserver.net/webhook/hormone-men-typeform-submit`. Source payload fields: `first_name`, `email`, `mailing_list`, `cat1`, `cat2`, `cat3`, `cat4`. The source displays inline results regardless of webhook success and can imply email delivery without confirmation. Production ownership, consent/data handling, CORS, workflow responses, and actual email delivery must be verified before enabling submission. No endpoint was POST-tested.
- **Returns:** replaced the local Return Policy body with the current main-site policy, preserving its wording. It says 30 days from delivery for eligible unopened, unused kits. The current About page separately says 60 days from purchase for over-the-counter products and explicitly excludes lab testing. This explains the location/scope of the older wording but does not reconcile its overlap with the policy's 30-day supplement rule. No store policy was changed.
- **Timelines:** reverified 5-7 business days after sample receipt in store FAQs and 7-10 in the main-site Optimal Male kit-with-consultation page. The Shopify Optimal Male product page fetched in this pass does not itself state a numerical timeline. No timeline was standardized.
- **Women's hair loss:** retained relevant signs, symptoms, benefits, care information, and FAQs; removed the lab-testing intro and unrelated/template blocks. An approved replacement introduction remains optional and outstanding.
- **Membership:** contrary to the earlier unsuccessful lookup, the current About page contains $49.95 annually. Publication is verified; current commercial availability is not. Removed the advertised price/benefits from Pricing and shared About output pending owner confirmation.
- **Checks:** 12 affected routes at 390, 768, and 1440px; 36 full-page screenshots in `scraps/content-recovery/`. Checked HTTP responses, overflow, FAQs, checklist counts, empty selections, all-category selection, reset, keyboard selection, refresh reset, and lack of POSTs/runtime exceptions. Close-up screenshots inspected for desktop checklist and mobile treatment information. Script: `node verify-content-recovery.cjs`.
- **Evidence:** fresh HTML, extracted scripts, parsed questions/scoring, and recovered content are archived in `source-content/recovery/`. `recover-source-content.py` extracts content from those snapshots; `build-recovery.cjs` regenerates the public pages during the regular build. No source-tracking labels were added to the public site.

Sources: [Semaglutide](https://hrt.org/hrt-products/semaglutide-injections), [Semaglutide + BioBoost](https://hrt.org/hrt-products/semaglutide-bioboost-injections), [women's checklist](https://hrt.org/checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test), [men's checklist](https://hrt.org/checklist/hormone-symptom-checklist-men), [women's hair loss](https://hrt.org/women/hair-loss), [return policy](https://hrt.org/return-policy), [About](https://hrt.org/about), [store FAQs](https://store.hrt.org/pages/easy-faqs), [Optimal Male kit with consultation](https://hrt.org/hrt-products/optimal-male-hormone-test-kit-hormone-consultation).

## Complete inner-page formatting audit — 11 October 2026

Implemented shared-template fixes and reviewed the saved desktop (1440px), tablet (768px), and mobile (390px) screenshots, including full-page captures, overview sheets, and detailed section captures. The approved homepage, audience, Lab Testing, Treatments, and How It Works layouts were retained and checked for regressions.

### Coverage

| Page group | Local HTML routes | Coverage |
| --- | ---: | --- |
| Articles | 183 | All 182 article URLs and Article.html |
| Service details | 12 | Men's and women's hormone therapy, peptides, weight management, sexual health and hair loss; men's ED; Product.html and the matching query variants |
| Static inner pages | 94 | Category archives, provider profiles and directory, contact, provider network, FAQ, policies/legal pages, assessments and aliases, recovered product information, unavailable GLP topic pages |
| Supporting pages | 5 | About, Pricing, Consultation, Resources, 404 |
| Main pages, aliases and redirects | 9 | Audience, homepage and index alias, How It Works, Lab Testing and its alias, Treatments, retired landing redirect, Shopify redirect |
| Total inventory | 303 | Every inventory route accounted for; external Shopify navigation tested without entering checkout |

Final coverage reconciles 302 rendered pages at three widths (906 primary screenshot checks), three additional men's audience screenshots, and the verified external store redirect. The combined [internal-link check](scraps/inner-audit/internal-links.json) covers 235 distinct destinations with no failures.

### Implemented fixes

- **Articles:** proportional original images; balanced reading columns and sidebars; consistent paragraph, heading, list and related-card spacing; stronger dark-panel contrast; comfortable utility controls; accessible, expandable mobile contents; removed empty source headings; throttled reading-progress updates.
- **Service details:** corrected Treatments breadcrumb, aligned containers, fixed sticky navigation/header overlap, structured preserved prose into readable sections, added desktop/mobile contents navigation, improved list and card alignment, and fixed the ED icon. Women's hair-loss accordions now use the existing hair-loss questions instead of unrelated test-kit questions.
- **Static inner pages:** unified readable text measures, heading hierarchy, paragraph/list/table formatting, card alignment, form sizing, responsive contact layout and CTA wrapping. Restored paragraph and list semantics lost during import on 15 files, including policies and Dr. Lee's biography. The formatter checks that policy/body words remain unchanged. Restored the support email and Back to providers links.
- **Pricing:** restored missing care-card styling, fixed the active toggle's contrast, aligned actions, and improved responsive cards and supporting information.
- **Consultation preparation:** replaced the fixed-height nested scroll area with native page scrolling; improved mobile choices, input sizing, ten-point selector targets, review-summary formatting and checkbox alignment; added selected-state accessibility and focus movement between steps. Notes remain ephemeral and no submission is simulated.
- **Supporting controls:** corrected a duplicated word on About, clarified preparation CTA captions, and made Resources hash handling safe for invalid encoded fragments and reduced-motion preferences.
- **Build integration:** static formatting and scoped inner-page CSS are part of `node build-site.cjs`, so the fixes survive regeneration. Updated asset fingerprints prevent stale styles/scripts.

### Verified

- All rendered inventory routes at desktop, tablet and mobile widths; direct service/query access and refresh; expected landing, malformed-category and Shopify redirects; invalid URL returns the branded HTTP 404.
- No unresolved horizontal overflow, failed image loading, missing contents anchors or JavaScript runtime errors in the final route checks.
- Native FAQs and keyboard operation; service audience switching; article Save/unsave persistence, share fallback, print handler and reading navigation; resource search and no-result state; mobile menu and assessment dropdown.
- All six consultation preparation steps, required-field/email validation, back/review/completion, URL prefills, reset on refresh, and absence of POST requests or stored health notes.
- Men's and women's checklist selection, summaries and reset; contact required-field/email validation. Contact remains an email-draft flow.
- Reduced motion and preserved reveal/hover behavior on representative affected templates. This is Chrome at emulated viewport widths, not a physical-device, Safari/Firefox or formal accessibility certification.

### Evidence and reruns

- [Combined route and screenshot gallery](scraps/inner-audit/index.html) and [coverage inventory](scraps/inner-audit/coverage.json).
- [Article audit](scraps/inner-audit/articles/ARTICLE-AUDIT.md), [service audit](scraps/inner-product-audit/REPORT.md), [static-page report](scraps/inner-static/README.md), [static-page evidence](scraps/inner-static/results.json), [supporting-page evidence](scraps/inner-audit/root/results.json), [interaction checks](scraps/inner-audit/root/interactions.json), [main-page/alias regression checks](scraps/inner-audit/aliases/results.json).
- Rerun scripts: `verify-article-layouts.cjs`, `verify-inner-static.cjs`, `verify-inner-root.cjs`, `audit-inner-root.cjs`, `verify-inner-aliases.cjs`. Product verification scripts and detailed captures are in `scraps/inner-product-audit/`.
- Very tall pages exceeded this Chrome installation's full-page screenshot bitmap limit. Their final evidence uses bounded screenshot tiles joined into complete images; this was a capture artifact, not repeated page content.

### Existing dependencies and limits

- Substantive source content is still unavailable for 26 GLP topic routes and `checklist/menopause-quiz/index.html`. The Medical Team profile has no biography beyond its existing directory link. Those gaps were not filled with invented content.
- Some specialty assessment routes contain education rather than recovered scored questionnaires. Remote assessment/email delivery and the contact backend remain unconfigured/unverified as detailed above.
- Real portal authentication, booking, payment, checkout, confirmation emails, native OS share dialogs and printer output were not exercised. Local destinations and handoffs were checked without creating live records.
- Existing source discrepancies about membership, return periods and test-result timelines remain documented above; this formatting audit did not change their medical or commercial meaning.

## Homepage portrait alignment and motion — 11 October 2026

- Matched men's and women's portrait widths, heights, top/bottom edges and caption baselines. Removed opposing margins and the hover width change.
- Added a shared entrance using the existing motion observer, image-only zoom, a single soft sheen, restrained colored shadow, and arrow motion on hover/keyboard focus. Card bounds remain equal during interaction.
- Improved tablet hero proportions and reserved caption space at small mobile widths. Existing photos, care links, copy and homepage palette remain intact. No animation library or external asset was added.
- Verified 1440, 1024, 960, 768, 390 and 320px layouts, loaded images, equal bounds before/during hover, keyboard navigation, touch navigation to the correct audience and reduced motion. No browser errors or horizontal overflow. Final screenshots and results: `scraps/home-portrait-alignment/`.
- Original CSS implementation informed by [MDN reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) and [WebKit's interaction-motion examples](https://webkit.org/blog-files/prefers-reduced-motion/prm.htm); no third-party component code was copied.


## Footer-linked pages and descendants ? 11 October 2026

Completed a fresh, focused audit of 247 local route URLs/aliases: six people/company pages, eight policy routes, Contact and FAQ, and 231 journal/category/GLP routes. Responsive checks covered 1440, 768 and 390px (plus 320px for Contact/FAQ). Both Audience portrait variants were also checked. Every route was rendered/measured; full-page and section screenshots were visually reviewed across affected pages and representative article templates/outliers. This does not claim manual review of every paragraph of every article.

Fixed provider portrait sizing/alignment and enhanced-image usage, About story spacing and caption baselines, Medical Board media, profile links, Medical Team's empty directory, network CTA instructions/alignment, FAQ grouping, policy heading/list semantics, Resources sticky navigation/product cropping, and unavailable-GLP body spacing. Connected the comparison article's existing lab and consultation actions. Repaired route-safe keyboard skip navigation and improved footer contrast. Main-page designs, policy wording, biographies and existing purchase/portal destinations are preserved.

Build, formatter idempotency, links, image loading, keyboard controls, menus, FAQ interactions, article search/contents/Save and contact validation passed; no unresolved horizontal overflow or runtime errors in this scope. Exact policy text hashes are unchanged. Contact draft generation was verified without sending mail. Live authentication, appointments, checkout and delivery remain untested. Twenty-six GLP topics/quiz still need real source content; Medical Team now provides existing clinician links rather than a fabricated biography.

Full coverage, fixes, limitations and screenshot evidence: [footer audit](scraps/footer-audit/README.md).

## Local symptom checklists — 12 October 2026

Recovered and implemented all nine current Symptom Check forms, plus 14 matching aliases, using the original questions, choices, score rules and submission field names. This supersedes the earlier finding that the seven specialty assessments had only educational content. Results now stay local; original educational text is retained below each form.

Fixed the recovered-page builder's main-element match so added accessibility attributes cannot cause Return Policy content to appear on checklist or product pages. Added validation, answer persistence across back/edit navigation, restart, accessible controls and responsive wizard styling. No live n8n endpoint is enabled; the workflow export remains the integration dependency.

Verification: repeated production build, 1,433,755 scoring cases, 27 complete browser flows across desktop/tablet/mobile, 92 route renders including 320px, assessment-link checks and mocked delivery failures/success states. No unintended submissions, browser errors or overflow found. Full scope, screenshots, scoring exceptions and the eight separately classified legacy URLs: [CHECKLIST-LOCALIZATION.md](CHECKLIST-LOCALIZATION.md).

## Supplied n8n exports — 12 October 2026

Reviewed all nine user-supplied workflow exports. Implemented the allowlisted browser adapter, exact flat payload validation, success normalization, timeout/error handling, no automatic retry, and local-only handling of zero-symptom hormone results. UI distinguishes email-service acceptance from inbox delivery and does not claim newsletter enrollment. Existing local forms remain functional with live delivery disabled.

All nine read-only OPTIONS checks passed for localhost. The guarded integration suite passed 27 checks with 22 mocked POSTs and zero live submissions. Production build and delivery-state regression passed. Prepared nine inactive technical repair copies for explicit upstream response references, HTML greeting escaping and removal of the incomplete extra men's SMTP branch. Original exports, scoring and clinical email content remain unchanged.

Live enablement was blocked by automatic approval review because the final submit action transfers contact/health data to the external n8n server and triggers emails. User approval is required before enabling. Workflow imports, production execution, Gmail credentials and inbox delivery remain unverified; clinical wording conflicts and missing newsletter/CRM handling are documented in [CHECKLIST-N8N-INTEGRATION.md](CHECKLIST-N8N-INTEGRATION.md).

## Approved checklist enablement — 12 October 2026

The user explicitly approved sending names, email addresses, mailing choices and health answers from all nine forms to `https://vmi3206755.contaboserver.net` and triggering results emails. The website adapter is now enabled (`LIVE_ENABLED=true`) in local source. This resolves the approval dependency recorded in the preceding historical audit; it does not establish production deployment.

The production build and all 27 integration checks passed after enablement, loading the actual enabled adapter unchanged. All 22 test POSTs were intercepted mocks; no live assessment POSTs or emails were sent during this review. Live workflow versions, Gmail credentials, processing and inbox delivery remain unverified. No n8n workflow was changed, and the nine optional repair copies remain inactive and unimported.

Zero-symptom women's and men's results remain local to avoid the original workflows' category-4 email defect. Existing specialty response-reference problems, the extra men's SMTP branch, unescaped email greetings, input-validation gaps, clinical wording differences, missing newsletter/CRM handling, idempotency and failure-response limitations remain documented in [CHECKLIST-N8N-INTEGRATION.md](CHECKLIST-N8N-INTEGRATION.md).
