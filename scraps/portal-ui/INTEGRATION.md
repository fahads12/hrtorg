# Portal UI build integration

The portal is a static React preview. There is no authentication service, database, patient API, tracking integration, email delivery, or live form submission. The main site links to the local preview.

`portal-pages.json` is the route inventory. `build-portal.cjs` compiles the three portal JSX modules and prerenders each route into its own `index.html`, using an isolated VM with no network APIs. It runs after the main site's styling pass so care-site styling does not enter the portal. Portal styles, original artwork and Inter fonts are local files.

The normal `npm run build:vercel` command includes the portal and copies only public files into `dist`. New build evidence is written here; the previous prelaunch audit evidence is left intact. `serve.cjs` supports the original TTF fonts with `font/ttf` and serves direct portal paths without a catch-all route.

`localize-portal-links.cjs` rewrites navigation to the former portal host in public HTML, compiled assets and editable JSX/site-shell inputs. It runs before asset fingerprinting and prerendering. Sign-in and Patient Portal links open `/portal/`; existing symptoms-tracker/Get Started links open `/portal/app/symptoms-tracker/`. Query strings and fragments are retained. It changes only navigation values; source archives, surrounding care text, shop links and other external services remain intact.

Portal pages always receive `noindex, nofollow` and are excluded from the sitemap, including when production indexing is explicitly enabled. They have folder-form canonical URLs and do not inherit the main site's fonts. A no-JavaScript fallback explains the preview and links back to the main site.

Verification evidence:

- `main-html-preservation.json`: all 306 pre-existing HTML pages compared with the prior publish output before rebuilding; 303 differ only by portal href localization, 3 are unchanged, and there are no other HTML/body-copy differences.
- `link-localization-tests.json`: 16 URL, query/encoding and scope checks.
- `metadata-policy-tests.json`: 8 checks against the actual metadata builder with production indexing enabled in an isolated fixture.
- `build-verification.json`: generated after the complete publish build; direct route/status checks, CSS/font/runtime assets, canonical/indexing, local portal navigation, unknown-route handling and local POST rejection.
- `static-form-guards.json`: all 5 initially rendered forms have disabled inputs and submit controls before hydration, directly or through a disabled fieldset; all 15 routes were inspected. Appointment booking opens its form only after a client-side action.
- `portal-build.json`, `metadata.json` and `publish-manifest.json`: build inventories.

The repository TypeScript check covers existing TS/TSX modules. Portal JSX is compiled by Babel and rendered during the build. Browser interaction and visual checks are recorded separately by the portal UI reviewers.

The final build passed with 15 portal routes, 321 total public HTML pages and 917 publish files. HTTP checks passed for all 15 folder paths, all 15 direct `index.html` paths and all 15 slashless paths, together with 30 distinct portal assets. All local portal anchors resolved; no live portal href remained. Unknown portal routes returned 404 and the local preview rejected POST with 405. The final static checks used `http://localhost:8015/portal/`, a new process serving `dist`. The existing preview on port 8014 also serves the same final publish output. The final TypeScript check passed; portal JSX compilation and all 15 SSR renders passed in the full build.
