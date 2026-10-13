# Footer policy audit

Audit date: 2026-10-11. Read-only review of current localhost:8000 build. Application files and policy wording were not changed.

## Implementation update

After the audit, the parent agent authorized structural policy repairs in `format-inner-pages.cjs`. The orphan list, missing heading, telehealth heading-level, and plain contact-link findings below are now fixed. The formatter updated six policy HTML outputs. The shared skip-link and footer contrast findings remain assigned to the parent agent.

Verification: exact DOM `textContent` remained unchanged on all eight policy routes; a second formatter run returned no changes. All 24 responsive views were rechecked with no overflow, orphan list items, nested anchors, broken images, or page errors. New screenshots are in `fixed/`; `fix-verification.json` and `fixed/responsive-verification.json` contain the results. No CSS was edited and no build was run by this agent. The audit sections below record the original findings and before screenshots.
## Coverage and verification

Eight routes were checked at 1440×960, 768×960, and 390×960. Every route has a full-page PNG plus five sectional PNGs in this directory. `results.json` contains the complete rendered body text, block geometry, headings, lists, links, fonts, errors, and image state for all 24 views. `local-link-checks.json` contains all 29 unique local link destination checks. `targeted-checks.json` records mobile-menu behavior and footer colors.

| Route | Desktop height | Tablet height | Mobile height |
| --- | ---: | ---: | ---: |
| Privacy Policy.html | 14,702 | 16,426 | 25,599 |
| Terms and Conditions.html | 22,978 | 26,105 | 45,002 |
| Return Policy.html | 2,085 | 2,604 | 3,121 |
| legal/consent-to-telehealth/index.html | 2,979 | 3,645 | 5,295 |
| legal/health-information-privacy-practices/index.html | 4,598 | 5,424 | 7,630 |
| legal/pharmacy-information/index.html | 1,059 | 1,523 | 1,523 |
| legal/informed-consent-regarding-nutritional-and-herbal-supplements/index.html | 1,905 | 2,431 | 3,306 |
| legal/privacy-policy/index.html | 14,673 | 16,397 | 25,571 |

- All 24 page responses and all 29 unique local link targets returned 200.
- No page/console errors, failed network requests, broken images, or horizontal viewport overflow occurred.
- Geist body text and Newsreader headings loaded. Body is 16px, 28.8px line height on desktop/tablet and 28px on mobile. Reading measures are 836px, 704px, and 350px respectively.
- There are no content images or tables in these eight policies. Header/footer logos loaded correctly.
- Footer columns and navigation align without collisions at all three widths. The mobile menu opened at 768 and 390, and Escape closed it and returned focus to the Menu button.
- Current policy body links include the local supplement consent destination and the external Ads Settings destination. The local supplement route returned 200. No external forms were submitted.

## Concrete fixes

### P2 — Skip link leaves every policy page

Affected: all eight routes. Selector: `.skip-link`. Current `href="#main-content"` resolves through `<base href="./">` or `../../` to the site root, not the current page.

Keyboard reproduction on `legal/consent-to-telehealth/index.html`: Tab focuses “Skip to content”; Enter navigates to `http://localhost:8000/#main-content`, loads the homepage title, and leaves focus on BODY. See `skip-check.cjs` for the exact reproduction.

Source: `site-shell.json:1` supplies the fragment-only link; generated policy HTML has the relevant base element. Fix route-qualify the fragment during generation, or handle the skip action by preventing navigation, scrolling and focusing the existing main element. Ensure `main` can receive programmatic focus, and test with Tab/Enter on both root-level and nested pages.

### P2 — Health privacy bullets lack list containers and sit against the mobile edge

Affected: `legal/health-information-privacy-practices/index.html`. Selector: `.source-prose > li` (36 elements); there are no UL or OL containers in this article.

The markers sit around x=4 on the 390px viewport, while normal content starts at x=20; the list does not receive the established list indentation. The rest of the policy pages put markers and wrapped text inside the reading measure. This also loses list grouping semantics.

Evidence: `legal-health-information-privacy-practices-390-section-1.png`, `legal-health-information-privacy-practices-1440-section-1.png`, and `health-contact.png`.

Fix: in `format-inner-pages.cjs`, wrap each contiguous run of direct LI nodes in UL. Retain all LI contents and their order. The existing `inner-pages.css:50–53` styles then provide consistent indentation and spacing.

### P2 — Several section labels have no visible heading hierarchy

Affected: `Terms and Conditions.html` and `legal/informed-consent-regarding-nutritional-and-herbal-supplements/index.html`. The following standalone labels remain ordinary 16px P elements while adjacent section titles use larger serif headings:

- Additional Terms and Conditions
- Release of Liability
- Testing Products Solely for Preliminary Screening Purposes
- Informed Consent Regarding Nutritional and Herbal Supplements
- Nutritional Counseling and Supplements from HRT.org
- Privacy
- Type of Information Collected
- Use of Cookies
- Use of Information
- Disclosure of Information
- Privacy of “Confidential Testing Information”
- Security Policy
- Additional Telehealth Terms

Examples: Terms `.source-prose > :nth-child(28)` is “Additional Terms and Conditions”; `:nth-child(106)` is “Additional Telehealth Terms”. The supplement page `.source-prose > :nth-child(2)` is “Nutritional Counseling and Supplements from HRT.org”.

Evidence: `terms-additional-heading.png`, `terms-flat-heading.png`, `supplements-flat-heading.png`.

Fix: extend the exact `policyLabels` allowlist in `format-inner-pages.cjs:12` and promote those existing labels to semantic headings. Keep the legal text unchanged and retain the text-signature guard. Use an intentional hierarchy for broad sections and their subsections.

Related: `legal/consent-to-telehealth/index.html` jumps from H1 directly to H4 for “Possible Benefits of Telemedicine” and “Possible Risks of Telemedicine”. Promote these two to H2 while retaining their text. Evidence: `legal-consent-to-telehealth-390-section-1.png`.

### P3 — Complaint contact details are not actionable

Affected: `legal/health-information-privacy-practices/index.html`. The paragraphs under “What if I have a Complaint?” and the final “For Additional Information” paragraph contain the phone number and email as plain text. There are no content links anywhere in this article.

Evidence: `health-contact.png`. Current selectors: `.source-prose > :nth-child(54)`, `:nth-child(55)`, and `:nth-child(61)`.

Fix: wrap only the existing phone text with `tel:+18885745524` and existing `info@hrt.org` text with `mailto:info@hrt.org`. Preserve the exact visible text and prefixes. The same enhancement can be applied to unambiguous info@hrt.org occurrences in the Privacy and Terms policies.

### P3 — Footer copyright is too faint at 12px

Affected: shared footer on all routes. Source: `styles.css:425`, selector `.footer-bottom`. Computed foreground is `rgba(255,255,255,0.4)` on `rgb(11,41,74)`, giving a calculated contrast of 3.55:1. The link color at 0.65 alpha produces 6.99:1 and is visibly clearer.

Evidence: `legal-pharmacy-information-390-full.png` and `legal-pharmacy-information-1440-full.png`.

Fix: raise the copyright foreground to an appropriate higher-contrast color (for example the existing 0.65 alpha used for footer links), and verify the final contrast after compositing.

## Optional navigation improvement

The mobile Terms page is 45,002px high and Privacy is 25,599px high, with no contents links or heading IDs. Once heading semantics are restored, a compact on-page contents list would make these policies much easier to navigate while preserving the full text. Each fragment must resolve against the current route; see the skip-link defect above. This is an enhancement, not a failed destination check.

## Content observations to retain, not silently rewrite

These oddities are present in the archived source text as well as the current pages:

- Privacy “Contacting Us” contains `below.minfo@hrt.org` (`source-content/privacy-policy.txt:138` and `source-content/legal__privacy-policy.txt:138`).
- The health privacy notice contains a trailing `>` after “medical record” (`source-content/legal__health-information-privacy-practices.txt:110`).
- Privacy and Terms contain repeated headings/passages; Terms also contains a solitary numbered “1. Disclosures.” heading (`terms-numbering.png`).

Any wording, numbering, date, or duplication correction should be checked against the policy owner's approved text. None was altered in this audit.

## Page-specific outcome

- Privacy and its nested alias: clean responsive rendering; shared skip/footer defects, some inactive contact text, and poor navigation through very long content. Existing lists and numbered paragraphs stay inside the reading area.
- Terms: clean wrapping with no horizontal clipping, but several meaningful section labels lack heading treatment. The local supplement consent link resolves correctly.
- Return Policy: headings, paragraphs, bullets, and support mail link render cleanly at all sizes; shared skip/footer defects apply.
- Telehealth Consent: bullets wrap cleanly; correct the H1-to-H4 heading jump and shared skip/footer defects.
- Health Information Privacy: correct orphan list elements and inactive complaint contacts; otherwise headings and paragraphs wrap cleanly.
- Pharmacy Information: address and links fit all sizes. The displayed support email currently links to the pharmacy support request form rather than a mailto destination; this may be intentional, so verify intent before changing it.
- Supplement Consent: the long hero title balances without clipping at all widths. Restore the missing body section heading; dense text remains readable and contained.

