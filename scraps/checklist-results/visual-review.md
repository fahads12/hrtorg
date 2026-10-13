# Checklist results visual review

Reviewed on 2026-10-12 after the animated results update.

- Visually inspected desktop (1440px) and mobile (390px) result close-ups for all nine checklists: women, men, PMS, thyroid, adrenal, osteoporosis, andropause, menopause, and perimenopause.
- Inspected the PMS tablet (768px) results, the women's complete mobile page, and mobile confirmed-email presentation.
- The shared result layout has consistent spacing, readable score and category text, aligned gauge elements, clear email status, and correctly sized controls. Long category labels wrap within the card. No visible clipping, overlap, or layout defect was found in the reviewed captures.
- The initial mobile locator capture showed Chromium's offscreen fixed skip-link compositing artifact. The complete page capture was clean. The verification script now derives close-ups from document-origin captures, and the regenerated close-ups are clean.

`gauge-report.json` records 54 passing checks, 64 full-page and close-up screenshots, and zero live submissions. Automated checks cover all nine forms at 1440, 768, and 390 pixels; score zero/max endpoints; animation settling; reduced motion; accessible values; local completion URLs; and delivery states.

Delivery states were tested with explicit browser-only fixtures. Every write request and external request was blocked. These captures do not verify actual inbox arrival or live n8n availability.
