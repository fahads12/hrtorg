# People/footer audit - 11 October 2026

Read-only application audit. Only audit scripts, screenshots, and reports in this directory were written. The baseline reflects the site before any root-agent follow-up fixes.

## Coverage

Chrome (Playwright, channel chrome, headless) at 1440, 768, and 390 CSS pixels. Full pages plus hero, story, team/cards, body, values, trust, and CTA close-ups were captured as applicable.

- About.html
- Providers.html
- Join Our Network.html
- providers/dr-clarence-lee-jr/index.html
- providers/jessica-kikla/index.html
- providers/medical-team/index.html

These are all three provider subpages on disk. Supplemental portrait inspection also tested Audience.html?g=women and Audience.html?g=men at the same three widths. The initial six routes have 18 complete captures and machine checks in results.json; audience captures are section viewport views, not new full-page audits.

All 18 visits returned 200, one H1, loaded portrait images, no horizontal overflow, and no JavaScript page exceptions. All six distinct main-content internal destinations returned 200. Actual browser clicks verified all three provider directory cards, Medical Team's return link, and About's consultation CTA. The network CTA destination is mailto:info@hrt.org?subject=Provider%20network%20enquiry. No email, provider registration, or other external record was submitted. Links/interaction evidence is in supplemental.json.

## Concrete UI findings

1. **Provider card artwork and titles are misaligned.** Providers.html uses 200px portrait images but a 155px Medical Team `.card-mark`. The third card's eyebrow/title sits 45px higher. More visibly, inner-pages.css:85 `.source-card a > div > span:last-child` affects `.card-mark span`, applying margin-top:auto and pushing the tagline to the bottom while the HRT letters touch the upper edge. Restrict the CTA rule to `div:not(.card-mark) > .text-link`; give the provider marker the same 200px media height. Evidence: Providers_html-1440-cards.png and 768/390 counterparts.

2. **About's tablet team section is disproportionately large.** restored-layouts.css:3 switches `.ab-team-grid` to one column below 800px. At 768px, each photo is 704x880px and the section is 2269px tall, versus two columns on desktop. At 1440 the 578x723 panels also overwhelm 15.5px captions. Keep two columns through tablet, one on phones, and cap or revise photo-stage aspect ratio/height. Preserve source names and credentials. Evidence: About_html-768-team.png, About_html-1440.png, About-1440-team-viewport.png.

3. **About portrait base alignment differs.** Both portraits correctly use enhanced WebP with object-fit:contain, but the default centered fit leaves a large band beneath Jessica while Lee ends near the panel base. Scope object-position:center bottom for `.ab-person .photo img`; use consistent panel sizing/padding. No face is clipped. In the profile and directory layouts, contain fitting already preserves the complete supplied image. Evidence: About-1440-team-viewport.png and About_html-390-team.png.

4. **About story heading collides with the next block on mobile/tablet.** about-styles.css defines a 32px single-column grid gap below 960px, but restored-layouts.css:3 changes `.ab-story .wrap` to display:block below 800px. The first bold body paragraph starts immediately below the section H2. Keep a one-column grid or restore an explicit 24-32px margin before `.body`. The repeated source headings should remain verbatim. Evidence: About_html-390-story.png.

5. **Jessica's visible phone/email are inert.** providers/jessica-kikla/index.html `.source-prose` has plain paragraphs for `Phone: 561-246-3751` and `Email: jessica@hrt.org`. Apply semantic tel:+15612463751 and mailto:jessica@hrt.org links without changing visible words. Add this through format-inner-pages.cjs if preserving build durability. Evidence: providers_jessica_kikla_index_html-390.png and -1440.png.

6. **The two named profile pages have no local return action.** Their only main-content link points to HRT Home. Medical Team has a working Back to providers link. Adding the existing directory return navigation consistently would avoid forcing users through the footer/browser back. Preserve biographies. Routes and links are in results.json.

7. **Network mobile CTA text is left aligned inside a full-width button.** inner-pages.css gives `.source-cta .btn` width:100% below650px but `.btn` is inline-flex without justify-content:center. Add centered content for the stacked CTA treatment. Evidence: Join_Our_Network_html-390.png.

8. **Supplemental: Audience tablet portraits balloon and select an undersized source.** At768px `.aud-quote-portrait` is704x704; desktop is240x240 and mobile180x180. audience-styles.css:313 changes `.aud-quote-inner` to one column below960px, but the width cap starts only below700px. The image uses fixed `sizes="240px"` at audience-app.jsx:191 and loads enhanced512.webp even at704px. Cap the tablet portrait at240px or set an intentional bounded width and correct responsive sizes. Evidence: Audience-women-768-portrait.png and Audience-men-768-portrait.png. Both still preserve the complete portrait and use the enhanced assets.

## Existing source/integration gaps (not invented fixes)

- Medical Team's source has no recovered biography or portrait, only the directory return link. The directory card promises Read more but leads to a minimal page. Keep it honest; no new biography or substitute individual should be invented.
- Join Our Network's original paragraph says to fill out a form below. The current page only provides an email CTA, and no registration form/backend is configured. This is an existing content/integration mismatch; a UI-only pass should report it rather than silently rewriting the paragraph or claiming a submission works.
- About's source dataset has an empty intro and a large source title, while the current approved template uses its own headline. No content change was made or proposed in this audit.
- Source-backed Jessica title/credential repetition is visible in About, profile, and audience attribution. Do not silently shorten credentials during a layout pass.

## Portrait inventory

Full generated-page/runtime inventory is in portrait-inventory.json. Jessica appears on About, Providers, her profile, and Audience.html?g=women. Lee appears on About, Providers, his profile, and Audience.html?g=men. Static providers and About use enhanced1024.webp; Audience correctly references both enhanced512/1024.webp (with the tablet sizes issue above). No rendered original source-file portrait use was found.

Available enhanced clinician assets are only Jessica's 512/1024 WebPs and 4096px PNG, and Lee's512/1024 WebPs and4096px PNG. The PNGs are upscaled derivatives, as AI-ASSETS.md records; no new identity detail was generated here. Medical Team has no portrait. Other generated home/audience lifestyle people are illustrations of care, not additional named-provider enhancements.

## Evidence notes

Some oversized element screenshots show an offscreen Skip to content link because Chromium captures a fixed offscreen element while stitching an element larger than the viewport. This is a capture artifact: supplemental.json confirms it remains top:-100px, unfocused, and fully outside the viewport during ordinary viewing. About-1440-team-viewport.png is a clean actual-viewport close-up.

Read existing WEBSITE-AUDIT.md, scraps/inner-static/README.md, source source-content text/JSON, page templates, and build scripts before browser review. No substantive source wording was edited.
