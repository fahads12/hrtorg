# Local checklist audit ? 12 October 2026

Read-only application audit. Chrome inspected 29 checklist-related routes including the hub. Every route responded HTTP 200 and remained on localhost; every main section currently has zero forms.

## Findings

1. **Critical template replacement regression.** build-recovery.cjs expects exact <main id="main-content">, but Return Policy.html contains tabindex="-1" after the latest accessibility improvement. Its replacement silently fails. The women/men checklist canonical pages and four aliases now contain the Return Policy body. Their scripts load but exit immediately because #hormone-assessment does not exist. Match the main element with arbitrary attributes, assert one replacement, and add an output assertion that each generated assessment contains the expected form/H1. The two recovered GLP product pages use this same writer and also need regression checks.
2. **Seven other navigation checklists have explanatory text only.** Their Start assessment links were flattened to a CTA returning to Symptom Check.html. No interactive form or source script was retained. The build-content.py page renderer deliberately strips forms and emits the source CTA for checklist pages. New recovered forms must be generated after this stage or integrated in the source generator.
3. **Shared menus already target local routes.** Verified homepage, both audience pages, hub and nested checklist pages. No current redirect to hrt.org was found in these menus.
4. **One real external assessment link remains.** assets/articles/your-health-and-hormones.js contains https://www.hrt.org/andropause-assessment/ twice (source data duplication); the rendered health/your-health-and-hormones/index.html exposes one external andropause link. clean-site-references.cjs only rewrites JS directly in assets, excluding nested assets/articles. Add the old short URL alias to the canonical andropause form and localize nested data before rendering.
5. **Older duplicate/extra assessment routes exist.** Legacy thyroid, PMS, adrenal, andropause, osteoporosis, perimenopause routes should direct to the matching local form, retaining their educational content where useful. Existing ED, nutritional deficiency, low testosterone and weight-loss pages have no forms either; recover only real available source forms, do not substitute another medical scoring system.
6. **Dormant generic React checklist is not original content.** symptom-check-app.jsx has short invented educational lists and is not mounted in the current hub. Do not reactivate it as the original source checklist.

## Existing recovered behavior and integration

source-content/recovery/assessments.json contains women (51 options), men (55 options), original category scoring and old webhook metadata. Recovery category order is intentional for payload cat1?cat4, not display order. Existing assessment.js only renders local summary and never sends contact data. The previous verification script verifies scoring, reset, keyboard and no POST, but was not rerun after the main tabindex regression. Do not send test traffic to old live webhook endpoints while waiting for n8n export.

## Verification plan

- Assert all nine shared navigation targets and hub cards load a real local form, with one H1 and matching title; direct URL and refresh stay local.
- Compare exact recovered question options, required fields, category/result text and scoring at boundaries against source files. Include women/men exhaustive count combinations and all source threshold boundaries for other quizzes.
- Test next/back, checkbox persistence within the wizard, accessible errors, contact field validation, result/reset, keyboard and reduced motion.
- Verify canonical routes and legacy aliases at 1440, 768, 390 and 320 pixels for overflow, clipped labels, touch targets and all images/scripts. Capture top, question, contact and results views.
- Fail on runtime errors, unexpected requests to hrt.org or old webhooks, wrong template body, and any fake success while delivery is unconfigured.
- For n8n integration once supplied, mock endpoint success/error/timeouts locally and verify one explicit opt-in submission without creating live records. Preserve source mailing-list preference semantics separately from sending assessment data.

## Evidence

- local-before.json: full per-route H1/forms/body excerpt/links inventory.
- local-links-before.json: rendered checklist destinations from main pages and article containing external link.

## Follow-up source identity verification

The Low Testosterone route was initially kept separate pending evidence. Fresh original HTML embeds Typeform EdKIn3, titled Q009 Hormone Symptom Checklist Men; the older root hormone-symptom-checklist-men page embeds that same form. Public Typeform configuration contains exactly the same 55 symptom options and four group boundaries as the current recovered men's questionnaire. Both checklist/low-testosterone-low-t-quiz-free-evaluation and low-testosterone-low-t-quiz-free-evaluation are now included as men's checklist aliases. The unrelated ID wMIKS4kW currently resolves to a Typeform incorrect-URL page and was not used. Evidence: source-forms/embed-evidence.json and source-forms/typeform-EdKIn3.json. No live form was submitted.
