# Checklist completion destinations

Reviewed 12 October 2026. Current public scripts match the archived originals. No live form submissions or emails were sent.

**Current direction:** the user replaced the redirect request with an animated, on-site results display and email status. All nine checklists keep their results on the local page. External completion URLs and score transfers are no longer requested; no redirect approval or destination URLs are needed.

| Checklist | Original browser behavior | Destination finding |
| --- | --- | --- |
| Thyroid | Redirects after completion | `https://www.hrt.org/score-total?type=th&score=<numeric score>` displays thyroid results. |
| Women | Inline results | The workflow's original checklist URL with `cat1`–`cat4` parameters starts the questionnaire again; it does not display the submitted results. |
| Men | Inline results | The workflow's original checklist URL with `cat1`–`cat4` parameters starts the questionnaire again; it does not display the submitted results. |
| Andropause | Inline results | The workflow's `score-total?type=an&score=...` URL displays thyroid results. The destination ignores the `type` parameter. |
| PMS | Inline results | No separate results-page destination in the supplied workflow. |
| Adrenal | Inline results | No separate results-page destination in the supplied workflow. |
| Osteoporosis | Inline results | No separate results-page destination in the supplied workflow. |
| Menopause | Inline results | No separate results-page destination in the supplied workflow. |
| Perimenopause | Inline results | No separate results-page destination in the supplied workflow. |

## Superseded redirect proposal

After a confirmed successful thyroid submission, display a completion message and a manual “Continue to my results” link, then navigate to the original thyroid results URL after 1.2 seconds. Include only the original assessment type and numeric score in its query parameters; do not include names, email addresses or individual answers. Keep failed or uncertain submissions on the local page with their existing retry behavior. Do not trust arbitrary redirect URLs returned by a webhook.

**Status: not implemented and superseded by the user's request for on-site results.** Automatic approval review previously rejected the redirect because it would transfer a health-derived score to external HRT.org in the URL. No redirect was enabled. The existing authorized n8n submission and email flow remains unchanged.

The destination findings above are retained as historical evidence, not outstanding requirements for the current on-site results experience.

## Evidence

- [Source and workflow comparison](source-content/checklist-refresh/completion-destinations-review.json)
- [Read-only live source checks](source-content/checklist-refresh/completion-destinations-live-review.json)
- [Browser destination checks](source-content/checklist-refresh/completion-destinations-browser-review.json)

This review checks navigation behavior, not medical accuracy of external results content.
