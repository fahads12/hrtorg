# HRT patient portal UI

The sign-in, registration, recovery, and patient portal screens are available at `/portal/`. The main website's Sign In and Patient Portal links open this local interface.

Run `npm start` and open `http://localhost:8000/portal/`. `npm run build:vercel` includes the portal in the static `dist` output. No deployment is required to preview it.

Use sample details in the forms. A valid login or registration opens the patient demo. The patient home can also be opened directly at `/portal/app/home/`. Recovery displays a local confirmation explaining that no email was sent.

There is no database, authentication service, patient API, email delivery, checkout, or tracking integration. Form changes live only in the current browser tab and reset on reload. Passwords are not saved, logged, or transmitted. The small UI preview badge explains this behavior on every screen.

The current visual design follows the redesigned local HRT website: the updated HRT wordmark, Geist body text, Newsreader headings, navy buttons, teal accents, and portrait artwork. The public [HRT portal](https://portal.hrt.org/) supplied the workflow and patient-section references. Sample data supports account-specific screens. No private patient account was accessed. Fonts and artwork are served locally; the original portal JavaScript is not included in the website.

Editable sources:

- `portal-auth.jsx` and `portal-auth.css`: login, patient/provider registration, password recovery, public header and footer.
- `portal-dashboard.jsx` and `portal-dashboard.css`: patient screens and demo interactions.
- `portal-app.jsx` and `portal-base.css`: routing, in-memory demo profile, and shared preview notice.
- `portal-reference.css`: localized reference styles.
- `portal-modern.css`: the current website design applied across authentication, symptoms, and patient screens; loaded last to replace legacy branding.
- `portal-pages.json` and `build-portal.cjs`: static route inventory, compilation, and prerendering.

All portal pages are excluded from the sitemap and permanently marked `noindex, nofollow`. The previous prelaunch audit evidence remains intact. New build, browser, and visual evidence is recorded under `scraps/portal-ui/`.

The redesigned UI was checked on the user's local server at port 8000: 15 routes at 1440, 1024, 768, and 390 pixels (60 cases), plus complete demo workflows on desktop and mobile. No page overflow, broken images, runtime errors, API calls, or browser persistence were observed. Published route/asset checks also pass. Automated WCAG A/AA checks on login, signup, and the initial symptom screen report no violations. The production build passes; portal JSX is compiled and prerendered separately by the build. Earlier legacy screenshot comparisons are historical; current visual evidence uses the `modern-` screenshot filenames and the updated browser-verification reports under `scraps/portal-ui/`.

The authenticated patient layouts are reconstructed from public component source, not verified against a private logged-in account. Medical intake uses representative fields, and symptom results are illustrative rather than clinical calculations. See `scraps/portal-reference/PATIENT-UI.md` for the precise reconstruction scope.
