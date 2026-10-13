# Article inner-page audit

Date: 2026-10-11. Scope: every article in `source-content/restored-data.json` (182 canonical routes) and `Article.html` (one alias).

## Template fixes

- Kept article prose, original images, destinations, and overall article structure.
- Rebalanced the desktop reading column and sidebars; tablet/mobile place supporting actions after the reading content.
- Corrected the fixed-height mobile hero image crop. Original editorial images now remain proportional and fully visible.
- Standardized introductory text, headings, paragraphs, lists, related cards, and section spacing. Removed compounded list-item gaps.
- Improved dark sidebar/final-action text contrast and made the sidebar consultation button light against its dark background.
- Added comfortable utility buttons, visible keyboard focus, and an expandable all-sections contents list so mobile readers can reach sections beyond the first four.
- Removed invisible, zero-width-only source headings/paragraphs from the rendered article and contents list; restored nested-bold section headings semantically without changing their words.
- Added current-section accessibility state and animation-frame throttling to reading progress; preserved reduced-motion and print behavior.

## Verification

`node verify-article-layouts.cjs` completed 549 URL/viewport visits: 183 routes at 1440px, 768px, and 390px.

- 549 full-page screenshots; no HTTP failures, horizontal overflow, article-element overflow, missing images, broken contents anchors, duplicate main headings, or browser errors.
- 123 unique local destinations linked from article templates and body content returned HTTP 200.
- Visual overview review across all article screenshots, plus detailed hero, body, contents, sidebar, mobile final-section, and print captures.
- Verified Save/unsave and persistence after refresh, Share clipboard fallback, Print button handler, expandable contents, and mobile section navigation with reduced motion.
- Source-content plain text and original image assets were preserved. No bookings, payments, or live records were submitted.

## Evidence

- `results.json`: every route, viewport, layout metrics, image checks, console errors, and screenshot filename.
- `link-results.json`: local destination status results.
- `failures.json`: empty final failure list.
- `1440/`, `768/`, `390/`: final full-page screenshots.
- `overview-{width}-{1..8}.jpg`: visual contact sheets for all routes.
- `hero-detail-1440.png`, `body-detail-1440.png`, `contents-detail-390.png`, `body-detail-390.png`, `print-detail.png`: section/interaction closeups.
- `tiled-captures.json`: 17 long viewport captures corrected for this Chrome installation's 16,384px full-bitmap wrap artifact. `article-audit-capture.cjs` now uses bounded 7,000px CDP captures and a lossless composite for pages over 16,000px. This was a screenshot artifact, not duplicated page content.

No unresolved article-template layout or functional failures were found. This was a formatting and functionality audit, not a new medical accuracy review of the retained source articles. External portal authentication, native operating-system sharing/printing dialogs, and third-party transactions were not exercised.
