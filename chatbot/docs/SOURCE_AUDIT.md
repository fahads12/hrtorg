# HRT source audit — October 16, 2026

Authoritative business sources: [HRT](https://hrt.org) and [HRT Store](https://store.hrt.org). Their marketing does not establish clinical efficacy. The source crawl and reviewed excerpts are separate files and indexes.

## Business and visitor journeys

HRT presents healthcare for men and women, hormone replacement therapy, peptide therapy, weight management, sexual health, hair loss and lab testing. Current men/women service pages were fetched, including menopause and erectile dysfunction. The store offers supplements and tests. Its public feed includes older unavailable items; those are intentionally retained.

The main site’s published Get Started link is `https://portal.hrt.org/app/symptoms-tracker`. It returned HTTP 200 at audit time. No private intake was completed and no appointment was booked. The app offers this route only after the user selects United States + Florida/California and the reviewed source evidence is still valid. It never claims eligibility or guaranteed treatment.

The homepage footer lists telehealth in Florida and California. The store’s FAQ separately prohibits kit shipping to New York/Maryland, requires prior licensed-professional authorization for California testing, and excludes PO boxes. These are distinct restrictions. The FAQ mentions international duties but does not establish a complete international shipping list.

Store contact: [Contact Us](https://store.hrt.org/pages/contact-us) lists `support@hrt.org` and `(888) 574-5524`. The main site and refund policy also contain `info@hrt.org`; the guide keeps the store support route for order questions. No support opening hours are inferred.

## Inventory reconciliation

| Check | Successful audit |
|---|---:|
| Unique feed and sitemap products | 1,177 |
| Imported product records | 1,177 |
| Variants | 1,576 |
| Unavailable products | 833 |
| Collections traversed | 46 |
| Product sitemap files | 2 |
| Nonempty product feed pages | 5 |
| Empty terminal feed page | 6 |
| Missing sitemap products | 0 |
| Feed-only product URLs | 0 |
| Failed requests | 0 |

Current source/sync timestamps, missing-attribute counts and errors live in `data/import-report.json`. The live importer may change these counts as the public catalog changes. Completeness is scoped to the available public feed and sitemaps, not unpublished products or private metafields.

The importer uses the public Shopify JSON feeds, product and collection sitemaps, collection membership feeds, and permitted HTML pages. Public product `.json` includes prices/currency/alt text but omits stock; `.js` provides availability. Both are consulted for live card rechecks. Images are real CDN/store URLs; broken images get a visible unavailable state.

## Unresolved source differences

| Topic | Source evidence | Guide behavior |
|---|---|---|
| Return window | [Store refund policy](https://store.hrt.org/policies/refund-policy): 30 days from purchase; [main-site return policy](https://hrt.org/return-policy): 30 days from delivery for eligible unopened products | Flag the difference and ask support to confirm the order’s terms. |
| Sale items | Store policy excludes sale-item refunds; the main-site policy does not state the same exclusion | Do not promise refunds. |
| Shipping vs returns | Prepaid test-sample shipping to a lab is described separately from customer-paid purchase returns | Never equate sample return postage with a refundable product return. |
| Dispatch | Store refund policy describes effort to ship same day before 11am PST; FAQ says generally within two business days | Attribute both; do not promise a delivery date. |
| Results | [FAQ](https://store.hrt.org/pages/easy-faqs): 5–7 business days after sample receipt; some product descriptions: 4–9 days | Do not collapse distinct timing statements into a guarantee. |
| Separate shipping page | `/policies/shipping-policy` contains a heading without substantive policy text | Exclude as policy evidence; use the FAQ and refund page with attribution. |
| Preparation/medicines | FAQ contains medication-timing instructions and broad efficacy statements | Do not turn these into personalized medication or clinical advice; defer to the kit instructions and clinician. |

## Excluded and quarantined content

The main site contains Heyday UI-kit copy, Lorem ipsum, “Is this the real life?”, fictional FAQ answers and a template support address. The lab-testing page includes unrelated subscription/organic-ingredient FAQs, a `shop.hrt.org` instruction and unclear “results on your door” language. These are not approved knowledge. Navigation includes duplicate staging Webflow links; they are not used as canonical sources.

Raw content remains in `knowledge-sources.json` / `source-audit.json` for inspection. Only entries in `knowledge-review.json` reach retrieval. Each is tied to exact evidence and a hash of the reviewed document content and links. Any source change quarantines its entries on reload until editorial review. Clinical/efficacy claims, general price estimates for prescriptions and template sections were not copied into the reviewed summaries.

## Attribute limits

- Public feed descriptions sometimes contain image-only Supplement Facts. Those images are preserved for viewing; no OCR or invented ingredient transcription is performed.
- Missing or unstructured biomarkers, collection/preparation details, restrictions and warnings stay unknown. Full descriptions and label images remain accessible.
- Collection method text is only extracted when an explicit source section exists. General FAQ information is retrieved separately and never silently assigned to a specific kit.
- Image alt text absent from the bulk feed is not generated as if it were source metadata. Live product JSON enriches it; UI fallback alt text uses the exact product name for accessibility.
- UI category is derived from explicit catalog type/name/collection evidence. Supplier names such as “Davinci Labs” are not treated as test categories.
- Prices/stock represent a timestamped check, not a reservation. If a live check fails the UI directs the visitor to verify on the real product page.

HRT needs to confirm the conflicting policies and approve the service/safety content before a public clinical-adjacent deployment. No private inventory, checkout, practitioner scheduling or customer records were accessed.
