# Checklist and n8n integration

The nine supplied n8n exports have been inspected and their production paths configured in the website adapter. **Following explicit user approval on 12 October 2026, live submission is enabled (`LIVE_ENABLED=true`) in the local website source for all nine forms.** Submitting sends names, email addresses, mailing choices and health answers to `https://vmi3206755.contaboserver.net` and can trigger results emails. Local questionnaire summaries continue to work; zero-symptom hormone results stay local. This source change does not establish production deployment or successful live workflow execution. Verification uses intercepted requests; no assessment POSTs or emails were sent during this review.

All nine URLs returned HTTP 204 to body-free OPTIONS requests from `http://localhost:8000`, allowing POST and the `content-type` header. This verifies preflight for that origin, not successful workflow execution or the final deployment origin. See [preflight evidence](source-content/n8n-review/preflight.json).

## Verified request contracts

The configured host is `https://vmi3206755.contaboserver.net`. All exported Webhook nodes use POST and `responseNode`. All exports are marked active; live activation and deployed versions remain unverified. No webhook authentication is configured in the exported nodes. External proxy controls and Gmail credential validity cannot be established from these files.

Shared body fields are `first_name`, `email`, and `mailing_list`. Send the flat `payload`, not the adapter's `{assessmentId, payload}` argument envelope. Specialty answers use exact option text such as `Yes` or `Occasionally`, rather than numeric scores.

| Assessment ID | Production path | Answer fields and scoring |
| --- | --- | --- |
| `women` | `/webhook/hormone-women-typeform-submit` | `cat1` through `cat4`: selected-option counts; maxima 10/14/14/13. |
| `men` | `/webhook/hormone-men-typeform-submit` | `cat1` through `cat4`: selected-option counts; maxima 14/13/13/15. |
| `pms` | `/webhook/pms-typeform-submit` | 15 question keys; Yes=2, No=0; weighted maximum 30. |
| `thyroid` | `/webhook/thyroid-typeform-submit` | 27 question keys; Never/Occasionally/Frequently/Constantly=0/1/2/3; maximum 81. |
| `adrenal` | `/webhook/adrenal-typeform-submit` | 5 question keys; Never/Occasionally/Frequently/Constantly=0/2/5/8; maximum 40. |
| `osteoporosis` | `/webhook/osteoporosis-typeform-submit` | 13 question keys; Yes=1, No=0, except protective `q1_exercise` and `q7_calcium`, where No=1 and Yes=0; maximum 13. |
| `andropause` | `/webhook/andropause-typeform-submit` | 10 question keys; Never/Occasionally/Frequently/Constantly=0/1/2/3; maximum 30. |
| `menopause` | `/webhook/menopause-typeform-submit` | 18 question keys; Yes=1, No=0; maximum 18. |
| `perimenopause` | `/webhook/perimenopause-typeform-submit` | 20 question keys; Yes=1, No=0; maximum 20. |

Exact question fields and option text are in [the local specifications](assets/checklists/) and [specialty recovery specifications](source-content/checklist-refresh/specialty-specs.json). Counts-only hormone payloads select the supported flat-category branch. Do not add a frontend total as `score` or `S`: the hormone workflows interpret those as packed category digits and give them precedence over `cat1` through `cat4`.

Mailing choices remain unselected initially. Specialty forms use `Yes, add me to your mailing list` and `No, just send me the results`; hormone forms retain an exclamation mark on the affirmative choice. The workflows read the preference but implement no newsletter enrollment or CRM/contact creation. The results email runs regardless of the choice and includes product/test promotions. The website must not claim the person was subscribed.

## Adapter and response behavior

The interface is `HRTChecklistDelivery.submit({ assessmentId, payload })`. The adapter has nine allowlisted destinations and a live-submission guard, now enabled following explicit approval for the concrete data transfer. Local verification intercepts and mocks all outgoing writes.

When enabled, the adapter posts JSON and normalizes the inspected workflow response for the wizard's `{accepted, emailSent}` interface. A generic HTTP success or workflow-start message alone does not establish processing. The original success nodes return `success: true` only after Gmail; the optional repaired exports add explicit `accepted: true` and `emailSent: true` fields. These flags mean the Gmail send step succeeded, not that final inbox delivery was confirmed.

**Zero-symptom hormone submissions stay local.** With delivery enabled, `women` or `men` submissions with all four counts zero return `{accepted:false, localOnly:true, reason:'no-symptoms'}` without a POST. While delivery is disabled, the live guard rejects direct `submit()` calls before validation and the wizard stays local. The original hormone workflows fall through to category 4 and select cardiometabolic-risk email wording for zero counts; the website guard prevents this email until the workflow is corrected.

Keep local scoring as the displayed questionnaire summary. Do not automatically follow exported `redirectUrl` or `landingPageUrl` values. A failure retains local answers and summary. A timeout or lost response leaves delivery uncertain. The workflows have no idempotency check, so a retry can duplicate an email if the first send succeeded before its response was lost. Avoid automatic retries.

## Export findings and optional repairs

- **Specialty response data:** Seven specialty success nodes read result fields from current `$json` immediately after Gmail. The official n8n Gmail implementation returns the provider response with item-linking metadata, without merging incoming JSON. Those scoring properties are therefore absent under the inspected implementation. Both hormone responses already use explicit upstream references. See [official Gmail v2 source](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Google/Gmail/v2/GmailV2.node.ts) and [saved evidence](source-content/n8n-review/gmail-output-evidence.json). The deployed n8n version remains unverified.
- **Men's extra email node:** The supplied men's workflow has an additional incomplete SMTP send node connected after Gmail. The prepared copy removes it and its connection.
- **HTML names:** All nine email templates interpolate the supplied name without HTML escaping. The prepared copies escape the dynamic name while preserving clinical wording.
- **Input validation:** Email checks only test for `@`. Missing specialty answers generally default to zero weight instead of being rejected; missing osteoporosis protective answers add risk points. Hormone counts lack finite-number, integer, and range checks. The adrenal score map permits inherited keys such as `constructor` to corrupt the score type. Server-side schema validation is still needed.
- **Consent and failures:** No newsletter/CRM branch, idempotency record, or explicit application-level send-failure response is present. Configured credential references do not prove usable credentials.
- **Hormone meanings:** Numeric classification matches for valid nonzero counts, but local category 1–3 labels differ from workflow clinical email interpretations. The zero-count behavior is a separate defect. Clinical wording requires source-owner review.

Nine optional inactive copies are in [the repairs directory](source-content/n8n-review/repairs/README.md), with hashes and exact changes in [the manifest](source-content/n8n-review/repairs/manifest.json). They fix specialty response references, add explicit post-Gmail response flags, escape names, and remove the extra men's SMTP branch. No copies were imported or activated; original Downloads files are unchanged. These internal files retain identity and credential references and must stay out of public site deployments.

The repair copies retain scoring and clinical narratives. They do not add consent branching, validation, zero-count correction, authentication, idempotency, or failure handling. Review changes against the intended existing workflows; do not activate duplicates alongside the originals.

## Verification and remaining checks

Detailed audits: [hormones.json](source-content/n8n-review/hormones.json), [first-four.json](source-content/n8n-review/first-four.json), and [other-three.json](source-content/n8n-review/other-three.json). Valid frontend fields, weights, and specialty tiers match the exported calculations. Offline scoring and mocked delivery checks do not establish live email delivery. Earlier source recovery compared 3,514 deterministic specialty vectors; see [score verification](source-content/checklist-refresh/score-verification.json).

After enablement, the unchanged actual adapter passed **27 checks**: all nine full form flows and exact outbound bodies, strict payload validation, bounded counts, zero-symptom guards, response parsing, HTTP errors, network failures, redirects, duplicate-click protection, preserved retry payloads and timeout behavior. All **22 POSTs were intercepted mocks**; only local reads left the test browser. No script fixture changed the enabled flag. The suite also verified that loading a page does not automatically submit. [Mock report](scraps/checklist-localization/n8n-integration-mock-report.json); rerun with `node verify-n8n-integration.cjs`.

Production build passed after enablement; the delivery-state regression script had also passed before enablement. Original exports remain unchanged; all nine repair copies are inactive and have not been imported. Automatic approval review initially rejected live enablement because names, email addresses, mailing choices and health answers would leave the site and trigger email sends. The user subsequently explicitly approved that specific transfer on 12 October 2026, resolving the approval dependency. No n8n workflow was changed by enabling the website adapter.

Live end-to-end verification is pending. With an authorized test recipient, verify the deployed workflow version, credential bindings, JSON after Gmail, email rendering, failure responses, and inbox result. Repeat preflight from the deployment origin. Production deployment remains unverified. No recipient data or assessment was sent in this review.

Source exceptions remain: PMS cannot exceed weighted score 30, so its source branch above 30 stays unreachable; its raw Yes count is out of 15. Thyroid uses textual thresholds 0–9, 10–22, 23–39, and 40+, with achievable maximum 81. Public results remain non-diagnostic questionnaire summaries. Clinical email narratives are preserved for separate source-owner review.
