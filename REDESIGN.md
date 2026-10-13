# HRT.org redesign

> **Superseded prototype notes below.** The current implementation and dependencies are documented in [IMPLEMENTATION.md](IMPLEMENTATION.md). Run `node verify-site.cjs` for current checks. Shopify is separate; consultations use the real portal; original source articles and policies replace prototype content. The intake and generic assessments described below are retired and are not loaded by the current website.

Serve this folder over HTTP (for example `python -m http.server 8000`) and open `index.html` or `HRT Home.html`. Original page URLs remain available.

## Implementation

`premium.css` applies shared white, navy, blue, and muted plum styling to every page. `premium-components.jsx` adds care paths, symptom links, molecular SVG artwork, the testing sequence, and the five-step care journey. The supplied transparent logo is copied unchanged to `uploads/hrt-logo.png` and retains its proportions.

`premium-motion.js` uses IntersectionObserver for staggered reveals and requestAnimationFrame for scroll-driven hero depth. No scroll hijacking, video, paid assets, or extra animation libraries. Reduced motion disables effects, narrow screens disable parallax, and content stays visible when observers are unavailable.

Existing treatment categories, product links, gender routes, pricing, resources, portal link, and intake logic remain. Previously inert homepage plan/process/testing/resource controls now link to existing destinations.

## Verification

Run `node verify-redesign.cjs` with local `playwright`, `@babel/standalone`, and Chrome installed. Tests cover all 12 HTML entry points, JSX parsing, broken images, browser errors, 390/768/1440px layouts, motion preferences, testing CTA routing, intake validation, save/resume, all six intake steps, review, and local confirmation. Screenshots are saved in `scraps/`.

## Existing limitations

- No checkout integration or test-kit SKU/catalog exists in the source. Testing CTAs open the existing consultation or testing resources route. No purchase or payment is simulated.
- Consultation persists answers in localStorage and shows a local confirmation without submitting to a server. No live clinical submission was added or performed.
- Approved kit photos and verified contents are absent. The animation illustrates receiving, collecting/returning, and provider review without inventing packaging. A faithful packaging reveal requires approved product assets.
- Existing medical claims, testimonials, legal placeholder links, and external portal availability have not been independently verified. The source pages disagree on turnaround times; the new overview avoids a timing promise.

See `redesign-assets.md` for asset provenance.

## Symptom Check navigation

All page navigation includes the nine-option Symptom Check dropdown. Each entry opens `Symptom Check.html?test=...`, with a topic-specific educational checklist, printable notes, consultation link, and primary medical source link. Responses stay in React memory and are never saved or transmitted. These checklists are not validated diagnostic instruments and do not calculate risk scores or recommend treatment. The adrenal-fatigue route explicitly explains the limits of that term using Endocrine Society guidance.

Run `node verify-symptom-navigation.cjs` against the local server on port 8000 to check dropdown keyboard behavior, Escape/outside-click dismissal, all nine destinations, summary generation, and mobile layout. Run `node version-assets.cjs` after editing scripts/styles to update content-based asset versions and prevent stale browser components.
