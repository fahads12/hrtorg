# Original checklist recovery — 12 October 2026

## Scope and evidence

All nine current Symptom Check dropdown destinations returned HTTP 200 and contain working inline assessment code in the public HTML. These are custom JavaScript wizards with their own n8n endpoints, not Typeform-dependent widgets. `inventory.json` records current fetch results. Raw HTML and extracted `.assessment.js` files retain the original questions, options, result text, score logic and integration code. No endpoint was called and no contact information or symptoms were submitted.

`specialty-specs.json` contains normalized implementation data for seven specialty forms. Men’s and women’s group-based forms are recovered separately in `hormone-specs.json` by the other recovery agent.

| Canonical checklist slug | Question count | Original answer scoring | Original result ranges |
| --- | ---: | --- | --- |
| pms-assessment | 15 | Yes 2; No 0 | 0, 1–14, 15–30 |
| thyroid-assessment | 27 | Never 0; Occasionally 1; Frequently 2; Constantly 3 | 0–9, 10–22, 23–39, 40–100 (attainable max81) |
| adrenal-fatigue | 5 | Never 0; Occasionally 2; Frequently 5; Constantly 8 | 0–9, 10–22, 23–39, 40 |
| osteoporosis-assessment | 13 | Risk factor Yes 1; No 0. Protective q1_exercise and q7_calcium reverse this: No 1; Yes 0. | 0–3, 4–13 |
| andropause-assessment | 10 | Never 0; Occasionally 1; Frequently 2; Constantly 3 | 0–7, 8–30 |
| menopause-assessment | 18 | Yes 1; No 0 | 0, 1–14, 15–18 |
| perimenopause-assessment | 20 | Yes 1; No 0 | 0, 1–14, 15–20 |

502 deterministic answer vectors for each specialty were compared against the original scoring function in a network-free VM (3,514 comparisons, no differences). See `score-verification.json`.

## n8n contract

All seven specialties use questions → first name → email → mailing preference → results. JSON fields are `first_name`, `email`, `mailing_list`, plus each exact `questions[].name`. Each question value is the original case-sensitive option text, such as `Yes` or `Occasionally`. Mailing labels are `Yes, add me to your mailing list` / `No, just send me the results` (men/women add an exclamation mark to the first option).

The public scripts reference production webhook paths:

- `/webhook/pms-typeform-submit`
- `/webhook/thyroid-typeform-submit`
- `/webhook/adrenal-typeform-submit`
- `/webhook/osteoporosis-typeform-submit`
- `/webhook/andropause-typeform-submit`
- `/webhook/menopause-typeform-submit`
- `/webhook/perimenopause-typeform-submit`

Exact original URLs are archived under `submission.endpoint`. Their availability, ownership, payload processing, CORS configuration, email workflow, and response schema have not been tested. These are evidence, not instructions to activate a connection. The forthcoming user-supplied n8n export must be inspected before enabling delivery.

## Original quirks and intended local distinction

- PMS assigns two points per Yes (maximum30) and displays the raw number of Yes answers out of15. Its script also contains a >30 “Severe Symptoms / Possible PMDD” result that can never be reached. Do not alter score weights to make that category reachable.
- Thyroid waits for a POST response, reads optional `landingPageUrl` and `totalScore`, and redirects to `/score-total?type=th&score=...`. On request failure it still redirects using the local score. This public result page was recovered separately. Its text ranges (0–9/10–22/23–39/40+) disagree with its gauge colors (1–10/11–40/41+). Use the actual text classification ranges and a neutral score presentation.
- Six specialties show local results regardless of POST success and display an “email sent” style note merely because an email was entered. The local implementation must not reproduce this false delivery assertion.
- Original result narratives sometimes infer hormone levels or diagnoses from symptom answers and recommend specific supplements/doses. They are preserved verbatim in this recovery archive for comparison. The root implementation will preserve questions, answer values, scores and questionnaire-category labels while explicitly presenting results as non-diagnostic questionnaire summaries with selected answers and clinician/testing next steps, not measured hormone results or individualized treatment recommendations.

## Existing aliases and older forms

`alias-inventory.json` and `root-alias-inventory.json` record related public routes. The following existing pages concern the same subjects and should direct local calls to action to the current local wizard, preserving their educational article content where present:

- `checklist/adrenal-fatigue-stress-test` → `checklist/adrenal-fatigue`
- `checklist/andropause-symptoms-test-assessment` → `checklist/andropause-assessment`
- `checklist/osteoporosis-signs-symptoms-assessment-free-self-check-evaluation` → `checklist/osteoporosis-assessment`
- `checklist/perimenopause-symptom-self-assessment` → `checklist/perimenopause-assessment`
- `checklist/premenstrual-syndrome-pms-self-assessment` → `checklist/pms-assessment`
- `checklist/low-testosterone-low-t-quiz-free-evaluation` has a legacy Typeform titled “Q009 Hormone Symptom Checklist Men”, matching the legacy root men’s form; direct its checklist action to the current local men’s assessment.
- Root `thyroid-assessment` contains the same 11,394-byte current inline script as `checklist/thyroid-assessment`.
- Root `pms-symptom-self-assessment` redirects to the PMS article, and `symptom-checklist` redirects to the general hormone checklist article.
- Original assessment-hub links to root `perimenopause-symptom-self-assessment` and `menopause-symptoms-self-assessment` return 404; local aliases may route to the current corresponding forms.

Some older article pages still embed legacy Typeform IDs, which are not proof that their old question sets exactly match the current wizards. Extra forms beyond the nine-item dropdown include erectile dysfunction (`JZXYRv`), weight loss (live embed `01J35Z7M3QEK02NQKTXJZMFAJJ`), and an old menopause quiz (`01J603B89E1NKEQCH6HBCRJKEF`). Their embedded schemas, n8n contracts and score rules have not been recovered. Nutritional and supplement-intake pages had no inline question/scoring scripts in the retrieved HTML. Do not invent or claim duplication of these extra legacy forms.
