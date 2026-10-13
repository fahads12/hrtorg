# Care interface and motion sources

Reviewed October 11, 2026.

- [21st.dev timeline collection](https://21st.dev/community/components/explore/timeline-component): explored timeline/process patterns through the indexed catalog. Direct access to the individual timeline implementation and related blog failed in this environment. Its implementation license could not be verified, so no registry code or assets were copied.
- [Motion scroll-animation documentation](https://motion.dev/docs/react-scroll-animations): reviewed the distinction between viewport-triggered reveals and scroll-linked progress. The effects required here are small enough for existing React, CSS, IntersectionObserver and the native Web Animations API. No Motion package, paid component or additional library was installed.

`CareJourney` is an original vertical timeline implementation in `premium-components.jsx`. Its steps retain the site's existing content. `care-polish.css` defines the cards, responsive stacking and hero layout. `care-motion.js` adds scroll progress, active-step emphasis, restrained photo depth and one-time card reveals on audience, About and resource pages. Content is visible without these enhancements. Reduced-motion changes cancel running animations, remove photo movement and show the complete timeline line. No scroll interception, continuous animation, 3D or WebGL is needed.

New hero image: `uploads/generated/home-care-hero.webp` (1120×1400, approximately 87 KB) and `home-care-hero-640.webp` (640×800, approximately 42 KB). Generated with the built-in image tool. Fictional adults illustrate an at-home care conversation; they are not identified as actual patients. No text, branding, kit packaging or medical outcomes were generated. No additional purchase was made. Prompt is recorded in `source-content/hero-image-prompt.json`.
