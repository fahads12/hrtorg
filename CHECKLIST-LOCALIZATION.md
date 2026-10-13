# Local symptom checklists — 12 October 2026

All nine assessments in the Symptom Check menu now run on this site. Their question wording, answer choices, scoring rules and n8n field mappings were recovered from the original public forms. The local pages use the existing HRT navigation, footer and visual style.

Open the [local checklist directory](http://localhost:8000/Symptom%20Check.html).

| Checklist | Recovered content | Canonical local route |
| --- | --- | --- |
| Women | 51 symptom/factor choices in four groups | `checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test/` |
| Men | 55 symptom/factor choices in four groups | `checklist/hormone-symptom-checklist-men/` |
| PMS | 15 yes/no questions | `checklist/pms-assessment/` |
| Thyroid | 27 frequency questions | `checklist/thyroid-assessment/` |
| Adrenal | 5 frequency questions | `checklist/adrenal-fatigue/` |
| Osteoporosis | 13 yes/no questions, including two reverse-scored protective factors | `checklist/osteoporosis-assessment/` |
| Andropause | 10 frequency questions | `checklist/andropause-assessment/` |
| Menopause | 18 yes/no questions | `checklist/menopause-assessment/` |
| Perimenopause | 20 yes/no questions | `checklist/perimenopause-assessment/` |

Fourteen older URLs also render the matching local form, including both low-testosterone aliases, whose original 55 options match the men's questionnaire. Header, directory and article links are normalized to canonical local destinations. Direct access and refresh work.

## Implemented behavior

- All nine checklists show results on the same page with a responsive SVG score gauge. Its needle and arc animate once to the questionnaire score; screen readers receive the final score and maximum immediately, and reduced-motion preferences disable the animation. Hormone checklists also show four category count bars. The visual is a questionnaire score, not a clinical probability or measured hormone level.
- The email status card distinguishes confirmed send acceptance, unconfirmed delivery, failure, local-only results and the zero-symptom exception. It displays the recipient only after the email service acknowledges the send. Failures preserve results and the existing manual retry. No external results redirect is used.
- Blank section-divider screens have been merged into the next selectable question in both hormone checklists. Original section headings remain above their corresponding options; question wording, order, choices and scoring are unchanged. All nine forms use explicit Back/Continue arrows.
- Each checklist has a unique generated editorial image, served as responsive 480/960px WebP with descriptive alt text and reserved dimensions. Prompts, originals and final paths are indexed in [the image manifest](source-content/checklist-images/README.md).
- Native checkbox/radio controls, progress, back/continue navigation, required contact validation and an initially unselected mailing preference.
- Local results, original score/category calculations, selected-answer review, editing and restart. Answers stay in memory; refresh or restart clears them.
- The n8n adapter is enabled in local source following explicit user approval on 12 October 2026. Final submission sends the original contact, mailing-choice and health-answer fields to the configured workflows; results distinguish email-service acceptance from inbox delivery and do not claim newsletter enrollment. Zero-symptom hormone results stay local.
- Responsive layouts, accessible labels, keyboard controls, focus handling and reduced-motion support. Educational prose from each source page remains available below its form.
- Source category names are displayed as questionnaire classifications with non-diagnostic context. Original medical narratives are archived; the local results do not prescribe supplements or infer measured hormone levels from answers.

The women's and men's source algorithm assigns category 4 to zero selections; this case now displays “No symptoms selected.” Other scoring is preserved. PMS has an unreachable original result branch; thyroid text thresholds conflict with its source gauge. Exact differences and integration contracts are in [CHECKLIST-N8N-INTEGRATION.md](CHECKLIST-N8N-INTEGRATION.md).

## Build fixes

`build-checklists.cjs` generates the forms from archived source definitions. `localize-checklist-links.cjs` handles links in HTML, JSX and nested article data. The generator is part of `npm run build`.

Fixed the recovered-page builder's exact `<main>` match, which stopped replacing content after `tabindex` was added and could put Return Policy content into assessment/product pages. Replacement now accepts additional attributes and checks for the expected main element. Rebuilding preserves the correct checklist bodies. Assessment styles are scoped to checklist pages.

## Verified

- Production build and repeated-build regression passed.
- Source scoring and payload harness: **1,433,755 cases**, including exhaustive hormone count combinations, binary responses, reachable specialty scores and exact payload fields.
- Browser flows: **27/27 passed** — all nine forms at 1440, 768 and 390px, covering validation, back/edit persistence, restart, score results, review/education accordions and local result CTAs.
- Route audit: **23 forms/aliases × four widths = 92 renders** at 1440, 768, 390 and 320px. No incorrect policy body, overflow, broken images, local resource failures or runtime errors.
- **2,926 assessment links** scanned; 55 distinct local destinations/anchors checked successfully.
- Full-page and question/result screenshots captured; representative desktop/tablet/mobile layouts reviewed visually. Reduced-motion browser runs and a normal-motion smoke check passed.
- Mock delivery checks passed: errors retain answers, retries preserve the original payload, pending requests block duplicate sends, and an accepted request is distinguished from confirmed email delivery.
- **No live webhook submissions, subscriptions, emails or patient records were created.**

Evidence: [browser flows](scraps/checklist-localization/after/browser-report.json), [route audit](scraps/checklist-localization/BROWSER-AUDIT.md), [delivery mocks](scraps/checklist-localization/delivery-mock-report.json). Rerun scripts: `verify-checklist-scoring.cjs`, `verify-checklist-flows.cjs`, `verify-checklist-delivery.cjs`.

## Remaining dependencies and scope

The **nine n8n JSON exports have now been reviewed** and the adapter in `checklist-integration.js` is enabled (`LIVE_ENABLED=true`) in local source with the matching destinations and response handling. The user explicitly approved transferring names, email addresses, mailing choices and health answers to `https://vmi3206755.contaboserver.net` and triggering results emails on 12 October 2026. All nine preflights and 27 guarded integration checks passed before enablement; verification requests were intercepted mocks. Production deployment, live execution and inbox delivery remain unverified. No n8n workflows were changed, and the optional repair copies remain inactive and unimported. See [the integration guide](CHECKLIST-N8N-INTEGRATION.md) for workflow defects, including the zero-symptom hormone behavior guarded locally.

Eight additional legacy URLs remain separately classified in the route audit. The older ED, weight-loss and menopause-quiz pages contain distinct Typeform forms; they have not been replaced with one of these nine assessments. Nutrition, hormone-imbalance, hormone-checklist overview, assessment directory and supplement-intake pages expose education or static content rather than one of the recovered n8n forms. These are not claimed as newly implemented interactive questionnaires.

Original HTML, scripts, exact fields, result narratives and source URLs are archived under `source-content/checklist-refresh/`, which is not served publicly by the local preview server.
