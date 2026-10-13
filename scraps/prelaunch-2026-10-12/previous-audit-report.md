# HRT.org prelaunch audit — 12 October 2026

**Assessment: not ready for an unrestricted production launch.** The local website and Vercel build have been audited and repaired. Live assessment/email delivery, incomplete source content, and current business details still need confirmation. Nothing was deployed, and no real emails, patient records, bookings, orders, or payments were created.

The current evidence is in the [searchable route and screenshot gallery](scraps/prelaunch/index.html), [route checklist](scraps/prelaunch/route-checklist.csv), and [machine-readable ledger](scraps/prelaunch/route-checklist.json). These private audit files are intentionally excluded from the published site.

## Coverage

- **306 public HTML files plus 15 query variants**, checked at **1440px desktop, 768px tablet, and 390px mobile**: **963 route/viewport slots visually reviewed**, including **168 refreshed full-page reviews** after fixes. The ledger distinguishes exact default URLs, query variants, initial visual review, final automated checks, and refreshed visual review. It does not claim every screenshot was recaptured after every build.
- Pages include Home, both audience views, Treatments, Lab Testing, How It Works, consultation preparation, all service/product variations, pricing/store handoffs, Resources, **182 health articles**, article/category aliases, About, Contact, provider directory/profiles, network enquiries, FAQs, policies, native assessments, legacy forms, GLP-1 routes, and 404.
- Chrome **154.0.8037.98** performed the broad review. Edge **155.0.4283.45** additionally checked six final mobile pages: Home, Women, Treatments, How It Works, Resources, and Contact. These were desktop browsers with emulated viewport sizes, not physical devices. Safari and Firefox were not tested.
- Every route received a top-to-bottom full-page composition review. Readable close-ups covered shared templates and affected sections. Full-page overview review is not word-by-word proofreading of every long article or medical/legal validation.
- [Main/service report](scraps/prelaunch/main-services/REPORT.md), [article/resource report](scraps/prelaunch/articles/REPORT.md), and [support/form/policy report](scraps/prelaunch/forms-info/REPORT.md) record detailed scope and limits. Final Edge evidence is in [deployment verification](scraps/prelaunch/deployment-verification.json) and [screenshots](scraps/prelaunch/edge/).

## Issues fixed

| Severity | Finding and completed repair |
| --- | --- |
| High | Contact could send personal fields in a native GET URL if JavaScript failed. Submission starts disabled until its preventing handler attaches; a no-script email fallback is available. Normal use accurately opens an email draft and does not claim a message was sent. |
| High | React-only pages initially shipped empty bodies. Build-time rendering now provides **203 populated page bodies**, metadata, and native article anchors. Audience/product variants select the correct initial content before paint; script-disabled query pages offer neutral, working care links. |
| High | Source archives and audit/workflow files needed a safe deployment boundary. The new publish build allowlists **873 public files** into `dist`; private exports, archives, dependencies, dotfiles, and audit evidence are excluded. |
| High | Some reveal observers were attached to DOM nodes replaced by React, leaving content hidden. Shared animation code now rebinds inserted content, uses visible CSS defaults, and preserves reduced-motion/script-failure readability. |
| Medium | Article contents links could point at homepage anchors because of `<base>`. Links now retain the actual article path; converted headings and seven osteoporosis bibliography destinations also resolve correctly. |
| Medium | Several CTA labels implied booking/intake while opening a local guide. Preparation links now say what they do; actual consultation/sign-in handoffs use the existing portal. Unsupported legacy forms no longer resemble functioning submissions. |
| Medium | Low-contrast roadmap labels, men's secondary text, Lab Testing controls, and prose primary buttons were corrected. Resource tabs now have 44px targets, keyboard focus, a clear-search action, and useful empty results. |
| Medium | Late font swaps caused layout shifts. Approved fonts are now self-hosted with their licenses, critical Latin faces are preloaded, and optional font loading prevents disruptive late swaps. On a slow first visit a fallback font may remain for that visit. The logo is optimized as WebP. |
| Medium | Preserved **112 legacy/store redirects** in Vercel configuration and the local preview. Added complete canonical/social metadata, a **252-URL sitemap**, safe indexing gates, branded missing-page responses, and basic security headers. |
| Low | Fixed duplicate source sections/credentials, two exact article spacing defects, the inherited “Premesntrual” spelling, an unrelated peptide paragraph on the women's weight page, legacy menopause template clutter, and incorrect old contact details. Enhanced provider portraits and approved main-page styling remain. |

All eight policy/legal body texts retain their original words, verified by normalized SHA-256 comparison. Clinical claims and uncertain commercial terms were not silently rewritten.

## Verified functionality

| Journey or check | Evidence and boundary |
| --- | --- |
| Home → audience → treatment → next step | Local navigation, gender state, filters, query normalization, FAQs, section anchors, and guide/portal destinations pass. Portal authentication, actual appointments, and prescriptions were not tested. |
| Lab Testing → kit → Shopify | Local comparisons and kit destinations work. **26 store/portal/related destinations** loaded in Chrome with expected content. No cart, checkout, payment, login, or account changes. |
| Nine native symptom assessments | **27/27 responsive full flows**, **54/54 gauge/motion cases**, and **1,433,755 offline scoring comparisons** pass. Required fields, email validation, back/edit/reset, local results, failure/retry, and duplicate-click protection were exercised. Scoring matches supplied logic; this does not establish clinical validity. |
| n8n adapter | **27/27 mocked integration checks**, with **22 intercepted POSTs** and zero live submissions. Success/failure parsing and email status are tested locally; real workflow execution and inbox delivery remain unverified. |
| Resources → search/category → article | Search/clear/empty states, article destinations, copied/direct contents anchors, related links, Back/Forward, save/unsave, and reduced motion work. Clipboard/share/print dispatch was stubbed; actual OS dialogs and printers were not tested. |
| Contact/network/provider paths | Contact passes five safe validation/failure checks; directory/profile/back paths and enquiry destinations work. Contact is an email draft handoff. Real email-app delivery and network enquiry processing were not tested. |
| Global interactions | Responsive menus, symptom dropdown, keyboard dismissal/focus, testimonial controls, FAQs, audience switching, and preparation-guide validation/reset were checked. No simulated booking or submission was added. |

The final technical scan reports **818 distinct local link/asset targets**, with no unresolved local targets, missing metadata, empty content roots, or detected public secret patterns. Missing routes return the intended HTTP 404; private paths are denied. Pattern scanning is not a penetration test. All **112 redirect cases** and **14 initial product query states** pass locally. See [technical results](scraps/prelaunch/technical.json).

`npm run build:vercel` and `npm run typecheck` pass. `npm audit --json` reported **zero known dependency vulnerabilities**. No lint script is configured. Automated axe WCAG A/AA checks on **11 templates × 2 widths** report zero violations; this is not a site-wide accessibility certification.

Cold-cache mobile measurements used 1.6Mbps, 150ms latency, and 4× CPU throttling on localhost. Final measured CLS was **0 on all 11 mobile templates**. LCP was approximately **1.48–2.45 seconds**, except the men's audience view at **3.76 seconds**. The homepage's separate foreground rerun measured **2.23 seconds**; its earlier missing LCP entry was not treated as a zero-time load. These are lab samples, not production Core Web Vitals. See [template measurements](scraps/prelaunch/accessibility-performance.json) and [homepage rerun](scraps/prelaunch/home-performance-final.json).

## Required before launch

1. **Verify and secure the deployed n8n workflows.** Confirm workflow versions, credential bindings, final-origin CORS, and truthful responses after Gmail acceptance, then run an authorized-recipient test. Supplied exports need backend review for payload validation, abuse/idempotency protection, escaped email HTML, specialty score fields after Gmail, and an incomplete men's SMTP branch. Existing [inactive repair files](source-content/n8n-review/repairs/README.md) were not imported or activated. The previously authorized browser adapter remains enabled; no live-delivery claim is made.
2. **Resolve 26 GLP-1 pages without recovered source content.** Only `glp-1/ozempic-vs-wegovy/index.html` has a complete article in that set. Approve accurate content or retirement of the remaining routes. They currently remain honest unavailable-content pages, noindexed and excluded from the sitemap. The gallery's `glp-1` filter lists every route.
3. **Supply or retire five unsupported legacy workflows:** ED symptom checklist, nutritional deficiency checklist, supplement intake, weight-loss checklist, and the separate `menopause-quiz` route. These now offer truthful information/handoffs and stay noindexed; they are distinct from the nine working native questionnaires. Exact routes are in the support report.
4. **Confirm current business/source details.** Inherited service wording about 3–7 business days and free consultation conflicts with product-specific testing/inclusion wording. Lab/store sources include 5–7, 4–9, and Optimal Male 7–10 day estimates. Inherited men's HRT `$100–500/month` and peptide `$250–600/month` FAQs require current approval. The main [return policy](https://hrt.org/return-policy) supports 30 days for eligible unused kits; no unsupported 60-day standardization or `$49.95` membership was added. The [store FAQ](https://store.hrt.org/pages/easy-faqs) is a separate source and should be reconciled by the owner.
5. **Review external citations and the Facebook destination.** Six references could not be reached in either test client, ten were blocked/challenged, and the Facebook page reported unavailable content. Some successful redirects now lead to different/general content. Exact routes, URLs, and uncertainty are in the [external-reference report](scraps/prelaunch/EXTERNAL-REFERENCE-REPORT.md). Clinical references were not replaced without supporting evidence.
6. **Verify the real Vercel deployment after authorization.** HTTPS/domain behavior, actual edge redirects/headers, production asset caching, authenticated portal actions, checkout, and delivered emails remain untested. Recheck the slower audience page on that deployment and include physical mobile/Safari testing before broad launch.

## Vercel setup prepared

Use the repository root, framework preset **Other**, the tested **Node 24** runtime, build command `npm run build:vercel`, and output directory `dist`. [vercel.json](vercel.json) contains routing and headers; [build-public.cjs](build-public.cjs) controls publication. Do not serve the raw project folder.

Indexing is intentionally disabled in the current output. Only an approved **Production** build with `HRT_ALLOW_INDEXING=true` and Vercel's `VERCEL_ENV=production` enables eligible pages. Preview builds remain noindex even if the flag is set. Unavailable pages and unsupported forms remain noindex in production. All three environment combinations passed the [indexing fixture checks](scraps/prelaunch/indexing-verification.json). This flag is not a secret and should be set only after the launch dependencies above are resolved.

To inspect the publish output locally: `node serve.cjs --dist --port 8011`. Restart an older preview process to pick up server-routing changes. Local tests verify the configured behavior, not Vercel's live edge. No deployment was performed.
