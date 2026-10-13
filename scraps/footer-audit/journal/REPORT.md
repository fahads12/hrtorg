# Footer Journal audit

Audit date: 2026-10-11. Local Chrome headless at localhost:8000, reduced-motion mode. Application files were not edited by this audit agent.

## Coverage completed: 231 route URLs at three widths (693 primary visits)

- 203 primary routes at 1440, 768, and 390 px: Resources.html; category/health/index.html; all 18 blog-categories from restored-data; Article.html alias; all 182 health article routes. 609 rendered visits, 1,218 top/bottom screenshots.
- Legacy encoded heart-health category alias checked at all three widths: redirects to canonical heart-health with 34 cards and no overflow/broken images. Three additional visits and six screenshots.
- All primary visits: HTTP 200, exactly one main H1, no document/main horizontal overflow, no clipped overflow containers, no broken images, no broken table-of-contents targets, no JavaScript page errors, no replacement-character/mojibake flags. All footers point Journal to Resources.html.
- All 249 unique internal URL path destinations found across journal and GLP pages returned HTTP 200 (222 journal destinations and 54 GLP destinations, with overlap). This checks status, not every linked page's content quality, external services, or remote form submission.
- Search query thyroid yields 9 articles at every width; unmatched query yields 0. Silo anchors, article section jump, Save/unsave with persistence across reload, and 768/390 mobile menus work.
- Endometriosis expanded contents includes 33 additional links, reaching section-37 successfully at all widths.
- No Jessica or Dr. Lee provider portraits are rendered in the primary 203-route journal set; no stale portrait asset usage was found there.

## Visual inspection

Manually reviewed 38 representative screenshot images across Resources hub top/sticky/search layout context, Conditions category cards at every width, category footer, generic Health alias, Article alias hero/body/sidebar/related/footer/mobile menu, image-free estrogen article, long-title endometriosis article and expanded 37-section contents, longest progesterone article middle at desktop/mobile, and shortest Wellness article body/full page.

Every route was rendered and automatically measured, and every visit has top/bottom evidence. This was a representative visual inspection, not a manual review of every paragraph of every article. Extra outlier/interactions captures are stored alongside the route screenshots.

## Findings

1. Resources silo navigation floats 76 px below viewport top after the main header scrolls away. `.silo-nav` in resources-styles.css sets top:76px, but source-site.css makes `.nav` position:relative. This overlays card headings with old content visibly remaining above the ribbon. Reproduced at 1440/768/390; evidence `1440/hub-sticky.jpg`, `390/hub-sticky.jpg`. Resolved by root. Fresh final-interactions.json and */final-hub-sticky.jpg confirm top:0 at 1440/768/390. Visually inspected all three corrected screenshots.
2. GLP source inventory: 26 of 27 `glp-1/*` routes have no substantive original article body. Their generated page states information is unavailable and links to Contact. Original crawl data and saved text contain blank headings and site/cart chrome for those routes, including glp-1/quiz. These are existing source gaps, not rendering loss. Only glp-1/ozempic-vs-wegovy has article content (~2,925 visible text characters, 11 paragraphs). Detailed inventory: glp-content-inventory.json.
3. The substantive Ozempic vs Wegovy page recommends three next steps in its final ordered list, but these entries are plain text. There are no body links for labs/consult, while the recommended quiz has no source content. Flagged to root as navigation improvement; no content edits made here.

## Evidence files

- results.json / flagged.json / links.json: 609 primary visits and destination results.
- alias.json: encoded category alias results.
- interactions.json: hub and article controls.
- outliers.json: expanded long-article table of contents.
- glp-content-inventory.json: all 27 GLP source-page content sizes and excerpts.
- Width folders contain fresh route top/bottom JPGs and targeted interaction/outlier captures.

## Completed follow-up

- All 27 GLP routes rendered at all three widths (81 primary visits, 162 top/bottom screenshots): no automatic layout/image/H1/page-error flags. 54 destination checks returned 200.
- The 26 unavailable-content pages originally placed the Contact text ~5 px above the footer because main > div.wrap.source-prose lacked vertical padding. Root fixed the existing selector in inner-pages.css. All 26 pages x 3 widths were rechecked after the latest build: padding-top 36 px, padding-bottom 48 px, footer clearance 48 px, no horizontal overflow, exact fallback text unchanged. Fresh representative desktop/tablet/mobile screenshots were visually inspected.
- The corrected Resources ribbon sits at viewport top on all three widths. Search, section jump, article Save persistence, and mobile menus were retested successfully after build.
- Both canonical blog-categories/heart-health/index.html and legacy encoded blog-categories/%20heart-health/index.html are covered. The encoded route redirects to canonical. The count is 231 distinct route URLs/aliases, so the redirected alias counts separately.
- Final geometry evidence: glp/final-fallback.json (78 post-fix checks). Final representative screenshots: glp/{1440,768,390}/final-fallback-top.jpg.
- GLP comparison was visually inspected through the final section, with full-page and final-list screenshots. Existing unavailable quiz has no form/quiz controls. No provider portraits appear in GLP pages either.
- Screenshot evidence total: 1,447 files, including initial top/bottom captures, targeted controls/outliers, and post-fix evidence. Visual review was representative, not all 1,447 captures.

## Optional remaining observations

- Ozempic vs Wegovy final next-step list contains no links to labs or consultation; it is inherited plain source text. Quiz remains unavailable at source. This is a source/navigation limitation rather than a rendering failure.
- Resources featured adrenal kit is cropped at 768 px by object-fit:cover (source 1024x724 rendered 702x280), visible in 768/final-hub-sticky.jpg. A contain treatment could preserve the entire package; current layout remains readable and has no overflow.

No application edits, content removals, live form submissions, or external messages were performed by this audit agent.


## Root final verification

The two optional observations above are now resolved: the featured original adrenal-kit image uses contain at 1440/768/390, and the comparison article links Order labs first to Lab Testing.html and Book a consult to Consultation.html. The missing GLP quiz remains a source limitation. Fresh image/action screenshots are in the width folders and glp width folders; final-smoke.json in the parent audit directory records loaded images, computed fit and resolved action URLs.
