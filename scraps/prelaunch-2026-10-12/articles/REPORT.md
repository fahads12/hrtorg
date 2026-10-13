# Article, Resources, and category audit — 2026-10-12

The article/library implementation passes the local visual and functional checks below. The major issue found in this pass was incorrect category membership, caused by importing shared navigation and footer links as category posts and omitting pagination. This is repaired from HRT.org source collections. Clinical approval of the supplied medical copy remains a separate owner responsibility.

## Coverage and visual evidence

- 204 distinct routes: 182 health articles, the Article.html alias, Resources.html, 19 category archive URLs (18 canonical categories plus the encoded Heart Health alias), and the category/health landing page.
- All 204 routes captured at 1440, 768, and 390 CSS pixels wide: 612 route/viewport slots. Initial evidence used the local source preview on port 8012. All changed renderings were captured again from the final publish directory on port 8013: Resources, 19 archives, and two articles, plus the unchanged category/health landing, for 69 final slots. Resources was refreshed again after the two singular-count labels were corrected.
- Every full-page screenshot was visually inspected through composition sheets. Readable section and state closeups supplemented this review for long titles, prose, citations, contents, the reading rail, calls to action, archive cards, empty collections, resource counts, and footer transitions. Long-page overviews are a layout review, not word-by-word clinical proofreading.
- [Final route-by-route evidence](final-coverage.json), [review record](review-status.json), [initial automated results](results.json), [final capture results](final/results.json), and [final Resources refresh](final-resources/results.json).
- Baseline composition sheets are in `sheets-final/`. Final changed-page sheets are in `final/sheets/`. Full PNGs and readable section captures are retained alongside their JSON records. Older results remain for comparison; the final coverage manifest selects the current evidence for every slot.

## Corrections made in this pass

1. **Source-backed category membership.** Imported category arrays previously mixed article links from the shared menus/footer with the actual collection and stopped at the first source page. All 18 canonical collections were verified against 29 public HRT.org pages, including pagination. Every first-page collection matched the archived source, and every paginated article already had a local route. Across the 18 categories, 261 unrelated memberships were removed and 205 omitted memberships restored; total memberships changed from 494 to 438. These are category memberships, not unique article counts. All 19 archive URLs now match the source membership. Advice and Product are genuinely empty in the source and now say so instead of displaying unrelated articles.
2. **Resources category data and featured reading.** Counts, collection cards, and featured articles use the corrected source memberships. The two one-article collections now say “1 article”. Article pages retain their existing category-independent journal recommendations; the category repair does not alter all 182 article renderings.
3. **Two heading hierarchies.** The skin-aging article skipped from H1 to H4; its four section headings are now H2. The men's HRT “Related products” subsection is now H3 under its H2 parent. Existing anchor IDs, wording, 20px Geist styling, and compact margins are retained. Final heading checks show no level jumps on either page.

The active build uses `build-category-archives.cjs` and `source-content/category-membership.json`. The legacy import scripts were also corrected so regeneration cannot reintroduce menu/footer membership. The original source HTML is retained. [Category membership provenance](../../../source-content/category-membership.json), [before/after detail](archive-membership-diff.json), and [category counts table](category-diff-table.md).

## Verification results

- Initial 612 visits returned HTTP 200 with one main H1, no browser errors, failed requests, broken images, missing contents targets, or document-width overflow. The Resources pill bar intentionally scrolls internally on narrow screens; keyboard focus scrolls its last item into view.
- Final 69 changed/control slots returned HTTP 200 with one H1, no errors, broken images, card-title overflow, document-width overflow, or missing/same-page contents-link errors. The final three Resources refreshes verify the count wording.
- All 204 final published HTML documents contain main content. All inspected article contents and numeric citation fragment destinations resolve in the static markup. [Static route checks](final/static-routes.json).
- Four no-JavaScript journeys pass: Article.html contents, a long-title article contents link, Resources category navigation, and an osteoporosis numeric reference. [No-JavaScript evidence](final/nojs.json).
- Final search-to-article, save/reload/unsave, category-to-archive-to-article, journal link, browser back/forward, direct hash refresh, and reduced-motion journeys pass. Hormones now opens an archive containing the correct 83 posts. [Journey evidence](final/interactions.json).
- Trimmed/whitespace/empty search, keyboard clear-and-focus recovery, keyboard access to the scrollable category bar, expanded contents, copied contents URLs in another tab, storage failure, and print dispatch pass. Share success/denial, storage failure, and print dispatch use controlled mocks. The actual operating-system share sheet and print dialog were not exercised. [State evidence](final/states.json).
- Axe WCAG 2 A/AA and 2.1 AA checks on Resources, a large category, an empty category, and both corrected articles at desktop/mobile widths report zero violations in 10 cases. Manual heading checks show no jumps on those routes. This is targeted automated accessibility evidence, not a full accessibility certification. [Accessibility evidence](final/accessibility.json).
- All 19 published archives exactly match the archived official membership, including empty states and the encoded alias. No duplicates, missing posts, or unexpected cards remain. Resource datasets match all 18 category memberships. [Membership regression](final/membership.json).
- Read-only browser request guards stayed enabled. No live form, purchase, portal, or message submission was made; no blocked write attempts occurred.

## Remaining owner review and limits

- The source-provided men's HRT article ends with an empty “References” heading. No medical references were invented. The content owner should supply/approve the bibliography or decide how this source gap should be handled before publishing medical guidance. [Exact finding](empty-reference-sections.json).
- Source medical claims, dated studies, and product statements were preserved; this work does not certify their present-day clinical accuracy. Source fidelity and functional citation targets are distinct from clinical review.
- Existing archive “Browse all articles” links use a plain blue treatment near the footer. This is minor visual polish, retained with the root reviewer's direction to preserve the shared design; it does not block navigation.
- These 612 visual slots used local Chrome at three viewport widths. Other browser coverage, production headers, external links, performance, deployment, and final launch decisions are reported by the main audit.

Reproducible audit scripts are `prelaunch-articles-current.cjs`, `prelaunch-article-final-*.cjs`, and the corresponding sheet-generation helpers at the workspace root. No deployment was performed.
