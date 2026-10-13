# Checklist image set

Created on 12 October 2026 using the **built-in image-generation tool**, with one new generation for each checklist. The full final prompt, descriptive alt text, source location and responsive image dimensions are recorded in each linked manifest.

These are illustrative generated people and settings, not photographs of actual HRT staff or patients. The images do not establish a diagnosis, treatment outcome or endorsement. No product packaging or diagnostic report was invented for this set.

## Final assets and prompts

All original PNGs are saved within the project at 1536 × 1024 pixels. Each WebP pair preserves the 3:2 composition at 480 × 320 and 960 × 640 pixels.

| Checklist | Subject | Full prompt and metadata | Original | Responsive WebP |
| --- | --- | --- | --- | --- |
| Women’s hormone symptoms | Discussing a symptom notebook with a clinician | [women.json](women.json) | [PNG](generated/women.png) | [480px](../../uploads/checklists/women-480.webp) · [960px](../../uploads/checklists/women-960.webp) |
| Men’s hormone symptoms | An attentive conversation about symptoms | [men.json](men.json) | [PNG](generated/men.png) | [480px](../../uploads/checklists/men-480.webp) · [960px](../../uploads/checklists/men-960.webp) |
| PMS | Recording cycle symptoms beside a calendar | [pms.json](pms.json) | [PNG](generated/pms.png) | [480px](../../uploads/checklists/pms-480.webp) · [960px](../../uploads/checklists/pms-960.webp) |
| Thyroid | A clinician gently examining the neck | [thyroid.json](thyroid.json) | [PNG](generated/thyroid.png) | [480px](../../uploads/checklists/thyroid-480.webp) · [960px](../../uploads/checklists/thyroid-960.webp) |
| Adrenal fatigue and stress | Reflecting on sleep and stress in a journal | [adrenal.json](adrenal.json) | [PNG](generated/adrenal.png) | [480px](../../uploads/checklists/adrenal-480.webp) · [960px](../../uploads/checklists/adrenal-960.webp) |
| Osteoporosis | Discussing bone health with a spinal model | [osteoporosis.json](osteoporosis.json) | [PNG](generated/osteoporosis.png) | [480px](../../uploads/checklists/osteoporosis-480.webp) · [960px](../../uploads/checklists/osteoporosis-960.webp) |
| Andropause | Preparing questions about sleep and energy | [andropause.json](andropause.json) | [PNG](generated/andropause.png) | [480px](../../uploads/checklists/andropause-480.webp) · [960px](../../uploads/checklists/andropause-960.webp) |
| Menopause | A thoughtful conversation about midlife care | [menopause.json](menopause.json) | [PNG](generated/menopause.png) | [480px](../../uploads/checklists/menopause-480.webp) · [960px](../../uploads/checklists/menopause-960.webp) |
| Perimenopause | Recording symptoms and questions at home | [perimenopause.json](perimenopause.json) | [PNG](generated/perimenopause.png) | [480px](../../uploads/checklists/perimenopause-480.webp) · [960px](../../uploads/checklists/perimenopause-960.webp) |

## Asset checks

The [validation report](asset-validation.json) records each file’s decoded dimensions, byte size and SHA-256 hash.

- All nine manifests contain an ID, built-in generation mode, full prompt and descriptive alt text.
- All nine project-local originals and 18 responsive WebP files exist and decode successfully in Chromium.
- Dimensions match the manifests: nine 1536 × 1024 originals, nine 480 × 320 WebP files and nine 960 × 640 WebP files.
- All 27 files have distinct hashes. Original copies match their generated source files.
- Combined size of all 18 WebP files: 756,218 bytes (approximately 739 KiB).
- All nine small derivatives were visually reviewed for scene relevance, cropping and agreement with their alt text. These checks are not a clinical accuracy assessment.

Page layout, responsive selection and form behavior are verified separately by the checklist browser audit.
