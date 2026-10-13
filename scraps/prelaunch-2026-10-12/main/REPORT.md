# Main pages and service journeys

Audit date: 12 October 2026 (Asia/Karachi). This report records the fresh audit in this folder; older `scraps/prelaunch` captures are not counted as fresh evidence.

## Scope and visual evidence

40 URL cases at 1440 × 900, 768 × 900 and 390 × 900: 120 full-page captures in Chrome 154.0.8037.98. The URL list includes Home/index aliases, both audience query variants, Landing aliases, Lab Testing and its alias, Treatments, How It Works, Pricing, Shop, Consultation, Product default plus 12 product/audience variants, 11 direct service pages and two HRT product pages. Full-height screenshots were inspected using contiguous section montages. Selected form states were also reviewed directly. Automated loads are not used as evidence of visual inspection.

The root reviewer covered 42 cases, the support/content reviewer 42 and the technical reviewer 36. Their manifests are `root-visual-review.json`, `content-visual-review.json` and `technical-visual-review.json`. Fresh affected captures are merged into the final route ledger. The discarded intermediate-build capture set in `coverage-initial.json` is excluded. Visual review covers layout, imagery and obvious text defects; it does not establish clinical validity or constitute word-by-word proofreading of every paragraph.

Shop redirects to the external Shopify site. Its entry page loaded at all three widths. Some external product images were absent in individual captures and long category names wrapped awkwardly. These are external-store observations, not repaired local defects. No cart, checkout or order was created.

## Fixes made in this audit

| Finding | Repair and verification |
| --- | --- |
| Changing the preparation goal or audience retained answers to now-invisible symptoms, allowing Continue. | Clear dependent symptom/severity/duration/success/consent values when the goal or audience changes. Keep unrelated basic/history/lifestyle fields. The before/after regression proves Continue is disabled until current questions are answered. |
| Back to the first preparation step left keyboard focus on the document body. | Focus the step heading after navigation, including step zero, while preserving normal initial-page focus. The regression verifies H1 receives focus. |
| Treatment-to-preparation links discarded the selected care topic. | Preserve audience and product context in the destination; men's ED maps to the guide's sexual-health topic. All 12 handoffs pass. |
| Neutral Pricing cards contained women's-only descriptions and destinations. | Reuse the already approved neutral descriptions from Treatments and link each of the five cards to its treatment section, which exposes both audience choices. All five anchors and ten choices pass. |
| Women's audience hair card showed a man's photo. | Reuse the existing women's hair asset with a matching alt description. Verify both audience states and switching. |
| Dedicated treatment FAQs appeared twice. | A guarded shared-template repair removes a prose copy only when every question and answer is preserved in the accordion. Original topic anchors remain. The technical report records all 49 Q&A preservation checks and negative guard fixtures. |
| Direct service anchor links could resolve to Home through the base URL, and build-time fragment parsing omitted service prose without JavaScript. | Qualify anchors with the current service path/query and parse complete body documents consistently during rendering. Final hydrated and script-disabled preservation checks are in the technical report. |

## Interaction checks

- Three full responsive journeys: Home → men → hormone service → preparation → review → finish → explicit patient-portal handoff. Invalid/future birth date and invalid email prevent progress; Back retains valid fields; mutually exclusive history choices behave correctly. Finish states explicitly say nothing was submitted or booked. No personal values appeared in the URL or browser storage; reload clears in-memory preparation.
- All 24 service entry cases × three widths: keyboard FAQ expansion/collapse, local section anchors, reading navigation, gender switching and refresh/query preservation. Women's ED normalizes to sexual care.
- Header/audience checks at three widths: keyboard navigation, responsive menus, rapid switching and reduced motion. Homepage carousel checks include all seven testimonials, dot/arrow navigation and wraparound.
- How It Works: 11 keyboard FAQ controls, five process scenes, destinations, reduced motion and script-disabled readability at desktop/tablet/mobile, with additional 320px checks.
- Lab Testing: comparison controls, three kit destinations, process scenes, responsive navigation, anchors, alias and script-disabled rendering.
- Treatments: filters, both audience destinations for each of five treatment areas, four process scenes and 320px layout checks.
- Script-disabled checks on seven main/service templates and blocked reveal-script checks confirm readable information and available fallback navigation. JavaScript-dependent controls are not claimed to function without JavaScript.

Machine-readable evidence: `journeys.json`, `context-handoffs.json`, `changed-answers-before.json`, `changed-answers-after.json`, `home-fallback.json` and `service-interactions.json`. Focused scripts and state screenshots are retained beside them.

After the final service repairs, all 72 service-route/viewport captures were refreshed. Reviewer records live under `dedup/`. The root reviewer inspected Product default at all three widths again; the other reviewers cover query variants and direct service routes. The final ledger includes those newer screenshots. The fresh 72-case interaction rerun passes in `dedup/service-interactions.json`.

## Boundaries and owner decisions

The preparation guide is local, in-memory preparation. It is not clinical intake, booking or submission. Portal authentication, appointment creation, prescriptions, store checkout and payment were not exercised. Store and portal entry checks were read-only.

Inherited clinical and business statements remain subject to owner review: testing turnaround, consultation inclusions, service availability, treatment prices and return terms have conflicting source wording. No replacement medical statistics, policies or commercial promises were invented. Desktop Chrome viewport emulation is not physical-device or Safari testing.
