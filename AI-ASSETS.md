# Generated editorial assets

Created with the built-in image-generation tool in this environment. No external API key, paid asset purchase or separate service was used.

- `uploads/generated/wellness-editorial.webp`: fictional middle-aged woman and man walking in a coastal garden; navy and muted plum clothing; natural daylight; calm, premium editorial photography. These people are not identified as patients, clinicians or endorsers. Used on the homepage, About page and care layouts.
- `uploads/generated/science-editorial.webp`: clear glass laboratory vessels and an empty test tube in a ceramic rack on pale stone; restrained blue and plum daylight; no labels or branding. Used for treatment and process illustrations. It does not represent the contents of a sold test kit.

Generation specifications: landscape composition, realistic photographic finish, medically professional visual tone, no text, no logo, no invented packaging, no before/after comparisons or implied medical outcomes. The site uses descriptive alt text. Visible AI captions have been removed at the owner?s request; asset provenance remains documented here.

Optimized to WebP with a maximum 1440 × 960 canvas, lazy loading and explicit aspect-ratio dimensions. Original HRT.org product photographs and provider portraits remain separate and retain their original identities. Source assets and attribution details remain in `source-content/asset-manifest.json`.


## Additional images ? October 11 update

Four more images were generated with the built-in image tool, with no additional purchases or external API credentials. All are text-free editorial assets; the fictional people are not used as named providers or testimonial subjects.

| Asset | Use |
| --- | --- |
| `uploads/generated/women-care.webp` | Homepage women?s care card, women?s audience hero, women?s treatment heroes |
| `uploads/generated/men-care.webp` | Homepage men?s care card, men?s audience hero, men?s treatment heroes |
| `uploads/generated/telehealth-care.webp` | Homepage care section, How It Works provider conversation |
| `uploads/generated/lab-care.webp` | Homepage testing section, Treatments overview, How It Works |

Each has a `-720.webp` variant selected through responsive `srcset`. Main images are 1440?960; small variants are 720?480. The four main WebP files total about 321 KB. Original PNG outputs remain in Codex?s generated-image directory. Exact prompts are recorded in `source-content/editorial-image-prompts.json`.

The original product packaging, provider headshots and article images remain source assets. No generated visual stands in for a kit?s contents or a real provider profile. No visible AI labels, watermarks or captions are overlaid on the images.


## Treatment-card images

The five homepage treatment cards now use editorial photographs: existing wellness photography for hormone care, the existing laboratory image for peptides, and three new images for weight management, sexual health and hair loss. New project files: `uploads/generated/weight-care.webp`, `intimacy-care.webp`, `hair-care.webp`, each with a 720px variant. These illustrate nutrition, connection and hair-care concerns; they are not treatment results or product photos. Generated using the built-in image tool without a purchase. Exact prompts: `source-content/treatment-image-prompts.json`.


Homepage hero update: `uploads/generated/home-care-hero.webp` and its 640px variant show a fictional couple considering care at home. They replace the hero molecule illustration. Asset and motion-source details are in `MOTION-SOURCES.md`.

Women's audience hero refresh: uploads/generated/women-care-v2.webp and women-care-v2-720.webp. Generated through the built-in image tool; fictional woman on a sunlit garden terrace, no text or labels. Original image retained for other placements. Exact prompt: source-content/women-hero-v2-prompt.json.

## Jessica portrait enhancement and audience themes

Jessica Kikla's supplied provider portrait (`uploads/source/1f7c622dbce3646c.webp`) was enhanced with the built-in image tool while requesting preservation of her likeness, pose and clothing. The native generated output was 1254 x 1254 RGBA; the downloadable `uploads/generated/jessica-kikla-enhanced-4k.png` is a 4096 x 4096 Lanczos upscale, not native 4K detail. Generated restoration details are inferred. The original source is retained. Responsive 512px and 1024px WebP exports are used on the website.

`men-care-v2.webp` and its 720px variant show a fictional man on a garden terrace, matching the women's refreshed editorial direction. No products, credentials or outcomes are depicted. Exact prompts: `source-content/portrait-theme-prompts.json`. No external API purchase was required.

## Dr. Lee restoration and audience library

Dr. Clarence Lee Jr.'s original `uploads/source/10d5d243dc17a25f.webp` was enhanced using the built-in image tool with identity-preservation instructions. Native output: 1486 x 1059 RGBA. Empty transparent margins were trimmed for a larger provider presentation; responsive 512px/1024px WebP exports and an upscaled 4096px-wide PNG are in `uploads/generated/dr-lee-enhanced-*`. Restoration details are inferred, not newly captured photographic detail. Original source retained. Prompt: `source-content/dr-lee-enhancement-prompt.json`.

The audience libraries reuse existing generated editorial images, not patient testimonials or clinical results. Six explicit article selections and descriptive summaries are maintained in `source-content/audience-library.json`. Full article bodies were read from the saved original HRT.org crawl in `source-content/page-content.json`; live web-tool refresh failed for all six URLs on 2026-10-11. Article bodies and medical claims were not rewritten. The cards describe the topics covered without promising outcomes. Verified audience layouts at 390/768/1440, live audience switching, reduced motion, six article destinations, loaded library/provider assets and no runtime errors.

Homepage portrait refresh: `uploads/generated/home-men-portrait.webp` and `home-women-portrait.webp`, each with a 480px responsive variant, depict fictional white middle-aged adults as requested. Generated with the built-in image tool; no third-party asset purchase. Prompts: `source-content/home-split-portrait-prompts.json`. Portraits are editorial illustrations, not patient testimonials. Images have no visible text or watermark.

Care journey image refresh: `uploads/generated/care-journey-v2.webp` (1440px) and its 720px variant replace the homepage roadmap photo. Built-in image generation; fictional couple on a video consultation, not actual patients or provider endorsements. Exact prompt: `source-content/care-journey-v2-prompt.json`. No purchase required.

Audience library artwork restored: all six men/women library cards now read their original article image from `source-content/page-index.json`. The generated editorial replacements are no longer used for these cards. Article titles, summaries and destinations are unchanged. Library image/link checks and responsive care-motion checks passed.
