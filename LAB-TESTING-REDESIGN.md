# Lab Testing redesign

Implemented in `build-lab.cjs`, `lab-testing.css`, and `lab-testing.js`. Run `node build-site.cjs` to rebuild. Published local routes: `Lab Testing.html` and `lab-testing/index.html` (also accessible at `/lab-testing/`). Existing header/footer, typefaces, branding, portal links, and Shopify separation are retained.

## Content and assets

Sources read on 11 October 2026:

- [HRT lab testing](https://hrt.org/lab-testing): available sample methods, ordering, collection/return, results. Template FAQs and incomplete statistics were excluded.
- [HRT store](https://store.hrt.org/): supported categories and their destinations.
- [Fundamental 5](https://store.hrt.org/products/optimal-hormone-health-fundamental-5-easy-convenient-at-home-test-kit-saliva): intended audience, five biomarkers, saliva method, and profile-dependent cortisol schedule.
- [Thyroid Essentials](https://store.hrt.org/products/thyroid-test-at-home-thyroid-test-kit-essentials-optimal-thyroid): four biomarkers, blood spot method, prepaid return, independent physician review, recommendations, audience and timing.
- [Adrenal Stress](https://store.hrt.org/products/optimal-adrenal-health-complete-easy-convenient-at-home-test-kit-saliva): DHEA-S/four-point cortisol, saliva method, prepaid return, physician review, recommendations, audience and timing.
- [Store FAQs](https://store.hrt.org/pages/easy-faqs): preparation, collection, report delivery, return packaging, and location restrictions. The page directs people to kit-specific instructions and their prescriber rather than applying one medical preparation schedule to every test.
- [Optimal Male with consultation](https://hrt.org/hrt-products/optimal-male-hormone-test-kit-hormone-consultation): separate 7–10-business-day estimate, documented in the preceding recovery archive.

Fresh HTML/product JSON and exact original image URLs are saved in `source-content/lab-redesign/`. `asset-sources.json` maps local images to the actual product. Product photographs retain their original packaging and proportions; no invented kit contents, credentials, or certification graphics were created. Images are optimized WebP variants (approximately 15–34 KB each for displayed product images). These are source-store product assets reused for this requested HRT redesign, not independently licensed stock assets. There are no purchased assets or generated patient results. The report layout is explicitly illustrative and contains no medical readings.

## Animation research and implementation

- Reviewed [21st.dev's component catalogue](https://21st.dev/community/components), particularly its stepper, timeline, card, and accordion categories. No community source code was imported; no component-specific license is presumed. The attempted dedicated stepper URL was inaccessible.
- Reviewed [Motion scroll documentation](https://motion.dev/docs/scroll) for progress-driven transforms and scroll-linked versus triggered motion. No Motion package was added; its attempted GitHub license URL was unavailable, so no unverified license or imported code is relied on.
- Reviewed [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and the [standard license](https://gsap.com/community/standard-license/). GSAP is unnecessary for these effects and was not installed.
- Original implementation uses CSS, SVG, IntersectionObserver, requestAnimationFrame, and Web Animations. No new runtime dependency, copied component code, WebGL, or scroll hijacking.
- Hero stagger, subtle scroll-driven product depth, offscreen-paused background motion, card/report reveals, desktop sticky scene changes, animated step connector, and expandable FAQs. Mobile uses a regular vertical process. Keyboard focus/activation and native details remain available. Reduced-motion changes cancel effects; content stays visible if scripts are disabled.

## Verification

`node verify-lab.cjs` checks 390px, 768px, and 1440px widths, saves full-page and section screenshots to `scraps/lab-redesign/`, and verifies image decoding, horizontal overflow, headings, three product cards, FAQ keyboard toggles, five desktop scene states, mobile menu, anchor targets, reduced motion, direct-route refresh, and no-JavaScript content/FAQ behavior. No browser runtime exceptions were found. Visual screenshot review caught and fixed inherited dark heading colors on the navy results/CTA backgrounds.

All ten distinct external category/product destinations returned HTTP 200; details are in `source-content/lab-redesign/link-checks.json`. Shopify checkout, account authentication, and real bookings were not exercised. No orders or live records were created.

## Owner confirmation still needed

- Timing is inconsistent across sources: general FAQs say 5–7 business days after receipt; featured thyroid/adrenal listings say 4–9 days without defining the start; some kit-with-consultation listings say 7–10 business days after receipt. The page explains this instead of normalizing it.
- Fundamental 5 mentions several cortisol profiles; confirm the exact offered profile/collection schedule in the live listing.
- Physician review is not represented as a live consultation. Where a consultation is unspecified, the page says so.
- Store-published shipping restrictions are preserved with an instruction to confirm current eligibility. No prices or availability claims are hardcoded.
