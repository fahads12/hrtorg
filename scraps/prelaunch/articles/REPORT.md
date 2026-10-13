# Article and resource audit — 12 October 2026

## Scope and evidence

- 204 distinct routes: `Article.html`, 182 `health/**/index.html` articles, `Resources.html`, 19 `blog-categories/**/index.html` archives (including the encoded legacy heart alias), and `category/health/index.html`.
- Every route was opened and scrolled top to bottom at 1440, 768 and 390 pixels: **612 browser visits and fresh full-page screenshots**. Every full-page image was actually reviewed in 69 overview sheets under `sheets/`.
- Inventory: `routes.json`. Browser findings: `results-1440.json`, `results-768.json`, `results-390.json`. Explicit visual-review ledger: `review-status.json`.
- Baseline uses source preview port 8000. Final post-fix regression uses clean publish output port 8011: **21 additional full-page captures** covering seven routes at all three widths: article alias, endometriosis, the long-title female-hormone article, osteoporosis, resource hub, hormone archive and health-category landing page. All 21 were reviewed in seven overview sheets under `recheck/`.
- Readable section screenshots were additionally inspected for article typography, heading wrapping, lists, expanded contents, sidebar and final calls to action, related cards, search empty state, keyboard focus, resource featured cards, tablet archive alignment, print CSS, and no-JavaScript content. Selected readable reviews are identified in the ledger.

**Review limit:** Full-page overviews establish composition and gross layout across every route. They are not text-size proofreading of every paragraph of every long article. Readable crops were reviewed on shared templates and selected pages. Original clinical claims, prices and cited research were not clinically revalidated. Chrome was tested; Safari/Firefox and physical-device testing were not performed in this delegated scope.

## Fixes

1. Qualified article contents URLs with the actual article pathname. Previously `<base>` caused copied/open-in-new-tab contents links to resolve to the homepage, masked by the ordinary-click handler.
2. Used a detached `div` for article formatting so browser and static prerender serialization match. This repairs generated contents IDs in eight articles with converted headings.
3. Restored exact numeric citation destinations in the osteoporosis References section from its existing numbered bibliography. All seven citation links now resolve to their corresponding references.
4. Corrected two exact source-copy spacing defects in perimenopause and endometriosis; removed stray citation-manager interface text from the osteoporosis bibliography. Preserved actual bibliography and clinical wording.
5. Changed article/resource consultation labels to describe their existing preparation-guide destination. The concise sidebar label avoids an orphaned arrow.
6. Improved resource search: whitespace normalization, live result status, useful empty-state explanation, accessible clear action and restored input focus. Added visible keyboard focus styling.
7. Set resource category tabs to at least 44 pixels high. Their intended horizontal scrolling stays inside the tab container.
8. Corrected related-card hierarchy and the independent sidebar heading while preserving typography. The library link now describes its full-library destination.

Changed sources: `article-app.jsx`, `article-styles.css`, `resources-app.jsx`, `resources-styles.css`. Root owns generated builds and shared route/content changes.

## Verified

- All 612 baseline requests returned 200 with exactly one H1; no console errors, failed requests, broken images, missing contents targets, detected placeholders or garbled text.
- No page-level horizontal overflow at any tested width. Only intentional resource-tab scrolling was detected.
- All 21 final regression visits passed image loading, console checks, contents targets and document-width checks.
- All 204 published static route bodies are present. No missing article contents IDs or numeric bibliography targets remain. Four JavaScript-disabled checks cover article alias, long-title article, Resources and the exact osteoporosis Reference 4 destination.
- Search matching, no-match/whitespace states, keyboard clear/reset, category navigation and article destinations work. Category tabs measure 44 pixels; keyboard navigation scrolls the active tab into view.
- Save/unsave persists after refresh. Contents click, direct hash refresh, copied contents URL in a new tab, keyboard contents expansion, related links and browser Back/Forward work. Reduced-motion articles remain visible with zero transition duration.
- Clipboard success/failure and storage-failure branches were tested with browser-local stubs. Print dispatch was stubbed and print-media CSS visually inspected. Operating-system share sheets, real clipboard permission prompts and physical printer output were not verified.
- All contexts blocked non-GET/HEAD/OPTIONS requests; **zero write attempts** were observed. No messages, orders, bookings or other live records were created.

## Final build regression

Evidence: `recheck/results.json`, `recheck/static-routes.json`, `recheck/nojs.json`, `recheck/states.json`, `interactions.json` and the `finalBuild` records in `review-status.json`.

All JavaScript/template/citation fixes passed against the final publish build. The final visual pass caught a scoped sidebar heading inheriting the global serif font; `font-family: inherit` restores its approved sans-serif styling. The final asset refresh was verified with three new readable sidebar screenshots at 1440, 768 and 390 pixels; the heading font matches its surrounding sans-serif text, all three images were visually reviewed, and no errors or horizontal overflow occurred. Evidence: `recheck/sidebar-final.json` and `recheck/sidebar-final-{width}.png`.

## Remaining boundaries

- Broad clinical/editorial approval remains separate from this layout audit; no clinical rewrite was attempted.
- Root separately audits historical external URLs, global SEO, deployment, forms and shared navigation; those are not independently claimed here.
- Search, save and share enhancements require JavaScript, while static article/resource content and native section links remain usable without it.
