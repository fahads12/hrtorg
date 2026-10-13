# How It Works redesign

## Implementation
- Page content now generated as complete HTML by build-how.cjs, invoked from build-site.cjs. Optional enhancements live in how-it-works.js, styles in how-styles.css.
- Preserved the shared shell, branding, original store product asset and existing portal/consultation routes.
- Added two clearly distinguished starting paths, five complete journey steps, three distinct service explanations, preparation checklist, eleven process FAQs and final actions.
- Native sticky scenes, progress line, reveal animations, focus/hover treatments and animated disclosure icons. No additional dependencies or licensed component code imported.
- Existing generated illustrative photos reused for consultation/preparation/follow-up; the kit image is original HRT packaging. No synthetic results or purchase promises.

## Rendering and label corrections
The old implementation put all page content behind a React mount and also attached a reveal mechanism to step containers. Removed that runtime content dependency and obsolete renderer. Essential text is visible by default; animation uses temporary Web Animations only. JavaScript disabled still shows all steps, inline imagery and functional native FAQ disclosures.
The old final CTA pointed to Consultation.html while nearby text claimed it continued in the portal. Labels now distinguish the local preparation guide, the symptoms-tracker portal entry, the general portal entry, and the external store. No visible standalone "svg" text remains; decorative arrow/disclosure marks are aria-hidden. The earlier text extraction itself cannot establish whether its "svg" token was visible in the browser.

## Evidence reviewed
- https://hrt.org/men/hormone-replacement-therapy — testing/results/consultation pathway, follow-up and state availability.
- https://hrt.org/men/weight-loss-and-management — health history, virtual review and prescribed delivery pathway.
- https://store.hrt.org/pages/easy-faqs — collection, return and secure results access.
- https://hrt.org/legal/consent-to-telehealth — telehealth context.
- Existing source-content/treatments-redesign, source-content/lab-redesign and the local consultation-preparation implementation.
- https://21st.dev/community/components and https://motion.dev/docs/scroll reviewed for disclosure, reveal and scroll interaction approaches; implemented native equivalents without copying components.

## Matters requiring owner confirmation
Testing estimates differ between source service pages and individual store products. No single timeline is promised. Current prices, consultation inclusions, specific follow-up frequency and delivery arrangements must be confirmed for the selected purchase. State availability reflects the original site's Florida/California wording; owner should confirm before expanding it. Laboratory results access must not be assumed to use the same account as the HRT care portal.

## Verification
verify-how.cjs passed at 1440, 768, 390 and 320px: five visible steps, image loading, zero horizontal overflow and zero page errors; all eleven FAQs open and close from keyboard. Verified five active scroll scenes, local link HTTP status and anchor existence, reduced motion (zero animations), and JavaScript-disabled reading/disclosures. Full-page and section captures in scraps/how-redesign were inspected.
External portal authentication, real booking and checkout were not submitted or transaction-tested. No new backend integration was introduced.

## Exclusive imagery set
Eight original images generated with the built-in image_gen tool exclusively for this page: personal telehealth, collection-space preparation, provider review, preparing questions, organizing health history, sample analysis, collaborative review, and continued support. Initial hero rejected because of extra hands on the video screen; a corrected generation was selected. No previous website photo is used in the page body.

Assets: uploads/how-it-works/{descriptive-name}-{640,1440}.webp. Generation prompts, provenance and master paths: source-content/how-redesign/image-prompts.json. Original PNG masters: source-content/how-redesign/generated/. People are fictional illustrative subjects. Collection materials are generic, unbranded preparation imagery, not a representation of supplied HRT kit contents or a collection demonstration.

Added compact images to the two existing starting-path cards and replaced the hero/five journey scenes. Preserved written content and interactions. Reserved intrinsic dimensions, eager high-priority hero, lazy supporting images, 640/1440 responsive WebP sizes. Adjusted focal points for faces and screens. New published asset references occur only in How It Works.html.

Re-ran all verify-how.cjs checks successfully; inspected desktop/mobile full-page and section screenshots. Final captures: scraps/how-redesign/new-images-full-1440.png and new-images-full-390.png. Both sizes load eight unique new images; no image errors. Previous 1440/768/390/320 layout, keyboard FAQ, scroll-scene, reduced-motion, no-JavaScript and link checks remain passing.
