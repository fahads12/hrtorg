# HRT.org technical prelaunch audit — 12 October 2026

The final local publish build passes the route, asset, metadata, source-preservation, and dependency checks below. This is evidence for the local static artifact, not approval of clinical claims or proof that production infrastructure and external patient/store transactions work. Nothing was deployed and no external form, purchase, account, message, or health-data submission was made.

## Final inventory and routing

| Check | Result |
| --- | --- |
| Archived source inventory | 288 entries, 285 distinct routes; no source routes missing from the public inventory |
| Published HTML | 306 routes, including deliberate aliases and unavailable/noindex pages |
| Published allowlist | 874 files; archives, audit evidence, development dependencies, and workflow exports excluded |
| Local referenced destinations | 839 distinct local request URLs, exact filename case, responsive image sources and native fragment checks; no failures |
| Direct HTML HTTP checks | All 306 routes tested, with intentional Shop and legacy-category redirects accounted for |
| Sitemap | 252 unique eligible canonical URLs; no invalid, duplicate, or unavailable-page entries |
| Configured redirects | 112 local-mirror checks passed, including 307 Shop and 308 legacy routes; internal destinations resolve |
| Missing/private paths | Branded 404 for missing public pages; private paths return 404 |
| Final metadata | No missing required title, description, canonical, Open Graph, language, viewport, or applicable H1 checks |
| Query metadata | 20 direct query-response checks passed; no actionable duplicate title/description groups across distinct eligible canonicals |

Evidence: [technical scan](technical.json), [all internal destinations](internal-links.json), [route inventory and direct responses](technical-extra.json), [route checklist CSV](technical-route-checklist.csv), [SEO query and duplicate analysis](seo-verification.json), [all-page social/viewport/language checks](seo-extra-verification.json), [redirect, query-paint and Edge checks](deployment-verification.json).

Aliases intentionally share their canonical page metadata. Audience/filter views identify their generic base canonical. Product variations remain permanently noindex. The current publish artifact is intentionally preview-safe: robots disallows crawling and pages remain noindex. The three indexing configuration fixtures pass: preview stays closed even when the enable flag is set; production without the flag stays closed; only explicit production plus `HRT_ALLOW_INDEXING=true` enables eligible pages. Unavailable routes remain closed. [Indexing evidence](indexing-verification.json).

Structured-data inventory across all 306 pages found no JSON-LD, microdata or RDFa. There is consequently no structured-data syntax or rich-result eligibility result to claim. Organization, WebSite, Article and Breadcrumb schema can be a later editorially approved SEO enhancement; no unverified business or medical attributes were invented. [Structured-data inventory](structured-data-verification.json).

## Repairs and exact preservation

| Severity | Proven defect | Repair and verification |
| --- | --- | --- |
| High | Product service prose vanished from server-rendered fallback because LinkeDOM parsed an HTML fragment differently from a browser. A blocked application script left service pages without their full body. | Wrap the fragment in an explicit HTML/body document before parsing. All 11 canonical service pages now retain every remaining section and all 56 accordion Q&A pairs with JavaScript disabled. |
| Medium | Product topic/subnavigation fragment URLs resolved against the homepage base URL on canonical service paths when copied or opened directly. | Qualify anchors with the current path and current product/gender query state. Direct copied FAQ URLs, clicks, retained topic IDs and gender switches tested. |
| Medium | 49 Q&A pairs appeared twice in dedicated body FAQ groups and the accordion, across 11 services. | Remove a body group only when every plain Q&A exactly matches the saved accordion text. Keep all 56 accordion pairs, every other source section, and the original FAQ topic title/anchor. Three negative guard fixtures preserve unique prose, links and differing answers. |
| Medium, preview tooling | A percent-encoded NUL path crashed the local preview server. | Reject control characters before filesystem access. Four malformed/control paths return 400 and a subsequent normal page still returns 200. This repair affects the local server; Vercel serves static output. |
| Medium, performance | About used a lazy 1440-pixel hero at a narrow viewport; its measured mobile LCP was 6.772 seconds. | Give only the About hero eager/high priority and a responsive 720-pixel derivative of the same approved photo. Image bytes fall from 197,338 to 66,106; repeat mobile LCP is 3.104 seconds under the same local throttle. Other callers retain their existing lazy loading and sizes. |
| Low | Audience and several distinct native assessments had copied generic descriptions. | Give distinct pages accurate neutral descriptions, retaining intentional alias metadata. Final canonical-aware duplicate checks pass. |

Source changes are in `product-app.jsx`, `product-styles.css`, `serve.cjs`, `build-page-metadata.cjs`, `restored-components.jsx`, `about-app.jsx`, and `optimize-about-image.cjs`, with the responsive image in `uploads/generated/wellness-editorial-720.webp`. Related article/category, native form, policy and main-page fixes are documented in the other audit reports.

[Pure source preservation](product-faq-preservation.json) covers all 11 services and 49 removed dedicated duplicates. [Browser text and copied-anchor verification](product-render-verification.json) covers 24 hydrated states plus 11 script-disabled canonical pages. [Service interactions](main/dedup/service-interactions.json) pass all 72 route/viewport cases: Product default, 12 query variants and 11 direct services at 1440, 768 and 390 pixels. Checks include keyboard FAQ expansion/closing, six subnavigation anchors, topic navigation, gender switch/reload and horizontal overflow.

All 72 service states received fresh full-page screenshots. This technical reviewer inspected all 36 query-variant contact sheets after the fixes: hero image, title wrapping, body sections, care cards, a single dedicated FAQ presentation, related treatments and footer. No unresolved layout defect was observed. [36 visual-review entries](main/dedup/technical-visual-review.json). The root and content reviewers cover the remaining 36 states. Screenshot inspection does not clinically validate inherited medical statements.

## External destinations

All 66 final distinct external destinations were requested read-only: the original 63-target pass plus three newly recovered source-backed Typeform entries. Final classification: 51 content responses, 9 challenge/blocked responses, and 6 unresolved network failures. A browser follow-up checked 20 uncertain or key handoff URLs, blocking non-read requests. Store product/collection pages, the patient login/symptom entry shells, and all three Typeform entry pages were reachable; authenticated flows, form submission/scoring, fulfillment, payment, messaging and record persistence were not exercised.

Two responses need owner attention despite returning HTML: the Facebook destination displays unavailable content; the `1.usa.gov/1Nxq0tj` citation shortlink lands on the general USA.gov homepage and has lost its citation relevance. Six destinations remain unresolved from both the HTTP and browser checks: Indian Spring Herbs black cohosh, Technician Online EKG, both NIAMS osteoporosis paths, UW Osteoporosis, and the University of Michigan osteoporosis page. These are recorded as unresolved, rather than universally proven dead. Nine publisher/support responses were blocked or challenged, including NCBI/PubMed, HealthCentral, UMMS and Honeybee support; blocking is not evidence that a citation is false or absent. Replacement medical references require editorial review.

[Complete destinations with source-page mappings](external-verification.json), [three final Typeform GET checks](external-handoff-addendum.json), [original 63-target snapshot](external-verification-63.json), [browser follow-up](external-browser-verification.json), [external link inventory](external-links.json). The first Node request pass encountered a local trust-store mismatch. The recorded final pass used Node's system CA store with TLS verification enabled; validation was not disabled.

## Security and deployment boundaries

Published-file pattern scans found no private keys or recognized credential/token signatures, credential-bearing URLs, or local development URLs. Private source, `.git`, audit and dependency URLs returned 404. These are bounded static checks, not a penetration test or a guarantee that no sensitive data exists. `npm audit --json` reports zero vulnerabilities across 165 dependencies at audit time. [Dependency evidence](dependency-audit.json).

The Vercel configuration publishes only `dist`, sets `nosniff`, strict-origin referrer policy, frame denial and a limited CSP for base/object/frame restrictions. The CSP is not a comprehensive script-source policy. Local routing mirrors configuration; actual Vercel edge rules, deployed headers, HTTPS/certificates, DNS, caching/compression and production indexing were not observed because this task did not deploy. An authorized production smoke check remains necessary after deployment.

## Accessibility, performance and browsers

The 36-case baseline (18 templates × two widths) reports zero axe violations, page exceptions or horizontal document overflow. After the resulting About optimization, both About widths were measured again with the same throttle and again report zero violations/errors/overflow. This is a representative automated accessibility sample, not a WCAG conformance certification or a manual screen-reader audit.

| Measurement | Final observed range or result |
| --- | --- |
| Desktop LCP | 0.112–0.828 seconds across the representative templates, incorporating the missing Home repeat and final About repeat |
| Narrow viewport LCP | 1.496–3.912 seconds after replacing About's initial 6.772-second result with its final 3.104-second repeat |
| CLS | Desktop maximum 0.0317; narrow viewport 0 in these initial-load samples |
| About improvement | Mobile LCP 6.772 → 3.104 seconds (54% lower); desktop final 0.340 seconds |
| Remaining slower samples | Audience men 3.912 seconds (diagnostic repeat 3.768); About 3.104; hormones category 2.512 |

The first desktop Home measurement had no FCP/LCP entry. A separate cold-context repeat after initializing the browser compositor produced FCP 0.452 seconds and LCP 0.528 seconds. It is retained as a separate diagnostic, not silently substituted into the raw baseline. The initial 6.772-second About result remains in the raw baseline as evidence of the repaired issue. No unchanged route was rerun merely to improve its result.

Evidence: [36-case baseline](accessibility-performance.json), [LCP candidate and controlled priority experiment](lcp-diagnostics.json), [final About measurements](about-accessibility-performance-final.json). Final About and recovered handoff screenshots are in the content review evidence. The baseline precedes the final three legacy Typeform links and About loading optimization; the links received separate final direct/reload/GET-handoff checks, while About received the affected performance/accessibility rerun. The unchanged representative templates retain their baseline measurements.

Method: Chrome 154.0.8037.98, 18 representative templates at 1440×1000 and 390×1000, one fresh context and disabled cache per case, sequentially after other audit browser workers closed. The narrow viewport uses CDP 1.6 Mbps download, 150 ms latency and 4× CPU slowdown. Metrics are captured before the accessibility scroll pass; axe checks WCAG 2 A/AA and 2.1 A/AA tags after revealing the full page. This is viewport emulation on a local uncompressed server, not physical mobile, Safari/Firefox, assistive-technology certification, field Core Web Vitals, or a production CDN measurement. Missing LCP entries are reported as unavailable, never as a zero-millisecond page load.

Edge 155.0.4283.45 smoke checks at 390 pixels pass on Home, Audience women, Treatments, How It Works, Resources and Contact: HTTP 200, no page exceptions, no horizontal document overflow and no broken requested images. These are automated smoke checks with screenshots, not a complete second-browser visual audit. The two-word Resources singular/plural correction and the later About/legacy handoff changes were rebuilt afterward; final Chrome checks cover those affected routes. Edge was not rerun after those final changes. A separate 14-case Product query initial-paint check with application JavaScript blocked also passes.

## Reproduction

Commands run from the project root:

```text
npm run build:vercel
npm run typecheck
npm audit --json
node scraps/prelaunch-2026-10-12/technical-scan.cjs
node scraps/prelaunch-2026-10-12/technical-extra.cjs
node scraps/prelaunch-2026-10-12/seo-scan.cjs
node scraps/prelaunch-2026-10-12/seo-extra.cjs
node scraps/prelaunch-2026-10-12/structured-data-scan.cjs
node verify-indexing-config.cjs
node scraps/prelaunch-2026-10-12/verify-product-faq.cjs
node scraps/prelaunch-2026-10-12/verify-product-render.cjs
node scraps/prelaunch-2026-10-12/deployment-scan.cjs
node scraps/prelaunch-2026-10-12/main/dedup/service-interactions.cjs
node --use-system-ca scraps/prelaunch-2026-10-12/external-scan.cjs
node --use-system-ca scraps/prelaunch-2026-10-12/external-addendum.cjs
node scraps/prelaunch-2026-10-12/external-browser.cjs
node scraps/prelaunch-2026-10-12/browser-scan.cjs
```

The final build completed: 203 React bodies prerendered, metadata generated for 306 HTML pages, 874 allowlisted files emitted. TypeScript checking passes for the project's configured TypeScript scope; JSX pages are compiled and exercised separately. No lint or general test script is configured. The local dist server used port 8013. The initial sandboxed build hit an esbuild ancestor-directory read restriction; the approved local build rerun succeeded. This environment issue did not require a source change or deployment.
