# Checklist browser audit ? 12 October 2026

PASS: 23 questionnaire URLs (nine canonical forms and fourteen aliases), rendered 92 times at desktop 1440, tablet 768, and mobile 390/320 pixels.

All loaded HTTP 200 with the correct questionnaire ID, one H1, one form and nonempty interactive content. No Return Policy template leakage, horizontal overflow, broken images, browser exceptions, missing local resources or unexpected POST requests occurred. Tests did not deliver data to live services.

Scanned 2,926 literal assessment hrefs across published HTML and compiled JavaScript, including nested article data; 55 unique local destinations/anchors passed. Representative rendered homepage, women/men, hub and article entry points contain no links to original-site questionnaires. All observed native menus use local routes.

## Screenshots

Captured full-page and initial question-panel screenshots for each of nine canonical forms at 1440,768,390 widths (54 screenshots). Visually inspected women desktop, PMS tablet, men mobile and women/men/PMS/osteoporosis question panels. Layouts are readable, aligned and unclipped. The original section-introduction screen before women?s physical questions intentionally has no input. A minor default-blue back-link color was reported for polish.

Full automated evidence: [report.json](browser-after/report.json). Captures are in [browser-after](browser-after). This route/layout audit does not claim full scoring or submission verification; separate runtime/scoring checks cover those behaviors.

## Additional legacy routes

These eight URLs remain separate from the nine recovered navigation questionnaires. All respond200 and staylocal. Their current forms status was inspected in Chrome; original embed classification comes from the fresh HTML archive.

| Route | Current state | Source classification |
| --- | --- | --- |
| checklist/erectile-dysfunction-ed-symptom-checklist/index.html | Educational page; no local form | Original embeds distinct Typeform JZXYRv (Q008 Erectile Dysfunction). Do not alias it to hormone or andropause scoring. |
| checklist/general-nutritional-nutrient-deficiency-symptom-checklist/index.html | Educational page; no local form | Fresh source contains educational material without an embedded interactive form. |
| checklist/hormone-imbalance/index.html | Educational article | Explains hormone checklists; no source form. Local hub link works. |
| checklist/hormone-symptom-checklist/index.html | Educational overview | Links to local female and male questionnaires; no standalone source form. |
| checklist/main-assessment-page/index.html | Assessment directory | Local male, thyroid and PMS destinations work; no standalone source form. |
| checklist/new-patient-health-supplement-required-intake-information/index.html | Static intake field text | Fresh source has field labels but no working embedded form or scoring; needs intake workflow specifications. |
| checklist/weight-loss/index.html | Educational page; no local form | Original embeds distinct Typeform live ID 01J35Z7M3QEK02NQKTXJZMFAJJ. Not interchangeable with hormone checklists. |
| menopause-quiz/index.html | Legacy landing page; no local form | Original embeds Typeform live ID 01J603B89E1NKEQCH6HBCRJKEF. Equivalence with current menopause-assessment has not been established. |

## Low Testosterone alias evidence

The original Low Testosterone page embeds Typeform EdKIn3, titled Q009 Hormone Symptom Checklist Men. Both the exact55 symptom strings and four question-group boundaries match the recovered men?s questionnaire. The old checklist and shortroot LowT URLs therefore serve the local men?s form. Source metadata is saved under source-forms/.
