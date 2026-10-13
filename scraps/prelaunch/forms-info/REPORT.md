# Support, policy, provider, and assessment prelaunch audit

Audited 12 October 2026. This is the scoped companion to the complete site audit, not a production launch approval.

## Coverage and verification

- **77 routes at 1440, 768, and 390 px**: 231 initial full-page captures, scrolled top to bottom and inspected through 39 review sheets. Exact route list: `routes.json`. This covers About, Contact, provider directory and all three profiles/team pages, Join Our Network, FAQ, all eight policy/legal routes, Symptom Check, native and legacy checklist routes/aliases, all 27 GLP-1 routes, menopause routes, and 404.
- **Final publish preview at localhost:8011**: 231 direct loads and reloads passed without detected horizontal overflow, broken images, or JavaScript page errors. See `final/report.json`. Fresh captures cover changed support pages; policy and questionnaire section captures supplement full-page composition review. Long documents were reviewed visually for layout, not independently revalidated as medical or legal advice.
- All 12 FAQ disclosures open and close with Enter/Space at all three widths. Provider directory-to-Jessica-profile and back navigation works at all three widths. Provider photos use the existing enhanced Jessica Kikla and Dr. Clarence Lee files.
- All nine native assessment workflows pass **27/27** viewport cases: question selection, required fields, invalid email, unselected mailing preference, back/edit preservation, retake reset, local score, answer-review disclosure, education disclosure, local CTA destinations, and no persistent storage. `scraps/checklist-localization/after/browser-report.json`.
- All nine assessment result layouts, question layouts, and six delivery states were visually reviewed at the relevant widths. Result/motion verification passes **54/54** cases, including zero/max endpoints and reduced motion. `scraps/checklist-results/gauge-report.json`.
- Actual configured n8n adapter passes **27/27** checks with **22 intercepted mock POSTs and zero live submissions**. Checks cover exact nine payload contracts, response parsing, validation, errors, duplicate-click protection, timeout, preserved retry payload, and zero-symptom hormone guard. `scraps/checklist-localization/n8n-integration-mock-report.json`.
- Offline scoring command `node verify-checklist-scoring.cjs` passed **1,433,755 source-score cases**, with no network requests. This validates implementation against the supplied source logic, not clinical validity.
- Final rebuilt CTA/handoff checks pass **12/12** (four affected pages at three widths), with fresh screenshots visually reviewed. Primary button labels are white, layout remains aligned, and the menopause link opens the native questionnaire. handoffs/report.json.
- Contact passes **5/5** safe tests: three responsive widths plus JavaScript disabled and shared-script load failure. Browser handoff is intercepted; no mail app opens and no email is sent. `contact-verification.json`.
- The SHA-256 hashes of all **eight policy/legal main-body texts** match the initial snapshots exactly after whitespace normalization. Hash evidence is in `final/report.json` under `policyWordPreservation`. No policy words were changed.

## Fixed in this pass

1. **Contact fallback privacy flaw:** a native form GET could expose name, email, phone, and message in the URL if JavaScript failed. The submit control now starts disabled and is enabled only after its prevent-default handler attaches. A no-script direct-email fallback is provided. Valid use opens an encoded email draft; the site does not claim to submit a message.
2. **Misleading legacy form screens:** read-only intake, nutrition, ED, and weight routes no longer display flattened control/template labels or promise an unavailable submitted/scored quiz. Preparation content and actual service/portal routes provide an honest next step. The distinct unavailable menopause-quiz route links to the working native menopause assessment. These five unsupported original forms remain permanently noindex; original question/scoring implementation would need source-owner material.
3. **Menopause legacy clutter:** symptom items are a real list; empty process/final action headings link to working destinations; the incorrect telephone number is corrected to the shared `(888) 574-5524`; original image gets descriptive alt text. Removed unrelated greener-future copy, unanswered FAQ placeholders, and unverified commercial/testimonial template blocks. Original archived source is preserved.
4. **Prose CTA contrast:** the inner-page prose link rule was overriding primary-button text to dark teal. A scoped override restores white button text and removes link underlining for primary CTAs.
5. **Regression assertion maintenance:** checklist count verification now matches the existing “N of total selected” result wording instead of the obsolete “N selected” label. The underlying scoring and runtime form code were unchanged.

## Remaining dependencies and limitations

- **n8n live delivery is not verified.** Keep the currently authorized live adapter setting, but confirm deployed workflow versions, credential bindings, final-site-origin CORS, success/error responses after Gmail, and authorized-recipient email rendering/delivery before launch. No workflows were activated or edited during this audit.
- **Server protections need owner/backend review.** Supplied workflow exports have no webhook authentication or idempotency, weak server-side payload validation, unescaped names in email HTML, missing specialty score fields after Gmail, and an extra incomplete men's SMTP branch. Optional inactive repair files already exist in the private source archive; they were not imported. Client validation is not a substitute for endpoint controls. The original zero-symptom hormone classification and clinical category narratives also need owner review; the frontend zero-symptom guard remains in place.
- **26 GLP-1 routes lack recovered article content.** They retain honest unavailable-content screens and are excluded from the launch sitemap/noindexed by the main build. Only `glp-1/ozempic-vs-wegovy/index.html` has a full source article in this set. Do not infer content for the other routes from unrelated semaglutide product pages.
- **Five legacy form routes lack verified original workflows:** ED, nutritional deficiency, supplement intake, weight-loss checklist, and the separate menopause quiz. The nine supplied native questionnaires work locally and are separately mock-verified.
- **Menopause commercial content excluded pending confirmation:** the old Fundamental 5 kit / `$170` / “In Stock” / free shipping / 30-day guarantee block and Sheila P./Jenny Wilson testimonial material require verified current offer and quote provenance before reinstatement. No legal return-policy wording was changed.
- **Source policy and medical-content approval:** repetitive policy sections and source-specific testing/return discrepancies remain preserved. Current applicability, legal compliance, clinical wording, and promotions in downstream results emails require the source owner's review. This UI audit does not certify them.
- **External boundaries:** phone, email, patient portal, and Shopify destinations are preserved. No real appointment, purchase, newsletter record, payment, or external account action was performed. Contact mail-draft creation was tested through an intercepted boundary; actual user email-app configuration cannot be established here.
- Full-page screenshot artifacts were distinguished from real UI issues: Chrome rendered an offscreen fixed skip link into a scrolled full-page capture; actual viewport geometry and screenshots confirmed it stayed hidden. Final contact captures reset scroll first.

## Evidence locations

`report.json` / `review-sheets/`: initial route screenshots and recorded visual review.

`final/report.json` / `final/`: final direct/reload checks, policy hashes, refreshed pages and section screenshots.

`final-review/`: reviewed changed-page, question, result, and email-state sheets.

`handoffs/report.json` / `handoffs/`: final button contrast and real menopause-assessment handoff verification after the last two fixes.

`contact-verification.json` and `Contact-*.png`: validation, safe-failure, and contact screenshots.
