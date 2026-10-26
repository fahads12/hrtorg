# HRT AI Guide

A functioning HRT visitor guide with a vanilla JavaScript + HTML frontend, locally compiled Tailwind CSS, and a Node/Express backend. Catalog browsing, filters, product details, variant selection, comparisons, service discovery and location-checked care navigation work without OpenAI credentials.

**A fresh checkout requires your server-side key and model configuration for AI conversation.** No credentials are included. There are no pretend model answers or silent model substitutions.

## Run locally

Use Node.js 24 LTS (the scripts use the system certificate store). From this folder:

```powershell
npm ci
npm run build
npm start
```

The website-root `npm run chatbot` launcher instead uses port 3001 and disables scheduled refreshes; use that launcher for the bundled site widget.

Open **http://localhost:3000** when starting this package directly. Widget demo: **http://localhost:3000/embed-demo.html**. Key setup guide: **http://localhost:3000/setup.html**.

The imported public data is included, so starting the app does not require another crawl. Run `npm run sync` to update it. `npm run dev` enables server watch mode; rebuild CSS with `npm run build` after frontend edits.

## Add your OpenAI key later

For a fresh checkout, copy `.env.example` to the ignored `.env.local`. Edit these values **on the server only**:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=
```

1. Add your key to `OPENAI_API_KEY`; never put it in chat, `public/`, frontend JavaScript, analytics, a URL or browser storage.
2. Run `npm run models`. This calls the account's models endpoint and prints only available Luna model IDs, never the key.
3. Set `OPENAI_MODEL` to the exact account-verified identifier. [Official GPT-6 Luna documentation](https://developers.openai.com/api/docs/models/gpt-6-luna) identifies **`gpt-6-luna`** and supports Responses, tools, structured outputs and streaming. Its availability in your account has **not** been verified. No model is selected by default.
4. Restart the server. The first AI request also retrieves the configured model to verify account visibility; failure is explicit, with no fallback. Listing a model alone does not prove billing or Responses capability: run the live checks in `docs/VERIFICATION.md`.

The server uses the [Responses API](https://developers.openai.com/api/docs/guides/function-calling), strict tool schemas and [structured responses](https://developers.openai.com/api/docs/guides/structured-outputs). Validated answers are delivered over SSE; provisional model prose is withheld until schema, source and product references pass validation. Failed or incomplete responses produce a retry state.

## Data and coverage

The October 26, 2026 refresh reconciled **1,177 distinct products, 1,576 variants, 46 collections and 833 unavailable products**. All **1,177 product sitemap URLs** matched the public paginated product feed. Five nonempty feed pages plus an empty sixth page proved pagination exhaustion. Catalog requests completed successfully; the separate business-page crawl found one broken privacy link and retained explicit policy gaps. There are **37 reviewed knowledge entries** backed by 38 normalized source documents. See [the October 26 audit](docs/AUDIT-2026-10-26.md).

See `data/import-report.json` for current machine-readable counts, failures, missing attributes, excluded template snippets and coverage gaps; `docs/SOURCE_AUDIT.md` explains source conflicts. “Catalog complete” means inventory coverage against those public sources, not that every optional attribute was available or every image-only label transcribed.

Ingestion:

- Respects `robots.txt`, restricts source hosts, checks redirects, spaces requests, and retries network failures, 429s and server failures with backoff.
- Traverses product, collection and page sitemaps; paginates product and collection feeds; deduplicates products by ID; attempts a product JSON lookup for sitemap-only items.
- Preserves all variants, unavailable items, prices, compare-at prices, images, collections, vendor, tags, descriptions and source timestamps. Labeled attributes are extracted conservatively. Missing values remain `null`.
- Keeps source business content separate from the product catalog. Raw crawl content is quarantined. Only the 37 reviewed business-fact entries are eligible for retrieval. Evidence-block fingerprints, source evidence and verified action links are checked after every reload; changed evidence is rejected until reviewed. Failed fetches retain previous sources with their original dates and unverified status rather than silently deleting coverage.
- Rechecks displayed cards using public product JSON (currency, price, image alt text) plus product JS (availability). Results are cached for 15 minutes by default. Failed rechecks visibly say price and stock are unverified and link to the product page.
- Commits catalog snapshots atomically only after inventory coverage passes. An incomplete refresh keeps the previous catalog and records the failure. Cross-process locking prevents simultaneous imports.

Public catalog feed fallback is intentionally conservative: if the bulk feed becomes unavailable, sitemap product JSON is attempted, but completeness remains unverified without exhausted pagination. No private store API or checkout integration is configured. There is **no Add to Cart** button; real store links handle purchasing.

## Refreshing data

`SYNC_INTERVAL_HOURS=24` runs an in-process refresh every 24 hours while the server is running. The initial shipped snapshot is served immediately; the server does not crawl on every startup. Use `0` to disable the scheduler. Check timestamps and refresh before exposing the app publicly.

For authenticated refresh, set a randomly generated `ADMIN_TOKEN` of at least 32 characters in the server environment, restart, then run:

```powershell
npm run refresh
```

The helper reads the token from the environment and calls `POST /api/admin/refresh`; it never prints the token. `GET /api/admin/report` requires the same `Authorization: Bearer …` header and reports progress, coverage and active knowledge entries. Both endpoints reject missing/short/incorrect tokens. `npm run sync` is the trusted local operator alternative; restart the server afterward to reload a CLI-created snapshot. The authenticated refresh reloads automatically.

For an external scheduler, run `npm run sync` from the project working directory, with `SYNC_INTERVAL_HOURS=0` on the web server and a controlled server restart or use the authenticated endpoint. A crashed process may leave `data/sync.lock`; verify that no importer is active before removing that single lock file. Never remove a live import's lock.

**Knowledge review:** inspect `data/source-audit.json` and the current sources, resolve business facts against the original pages, and deliberately update the reviewed entries, evidence and review metadata in `data/knowledge-review.json`. Run `node scripts/review-knowledge.js` to validate the resulting corpus and inspect its rejected-entry diagnostics. This script is validation-only: it does not approve new facts or overwrite the reviewed corpus. Changed evidence requires editorial review, not automatic fingerprint replacement. Restart after updating the reviewed data. A clinician has not reviewed the safety behavior; see `docs/SAFETY.md`.

## Embed the widget

Deploy the backend and `public/` under one HTTPS origin, then add:

```html
<script src="https://YOUR-GUIDE-HOST/widget.js" defer></script>
```

Set `WIDGET_ORIGINS=https://hrt.org,https://store.hrt.org` (or your exact authorized embedding origins). The server's `frame-ancestors` policy enforces the list. Set `APP_ORIGIN` to the guide's own origin, not the parent store origin; the widget runs inside a same-origin iframe with its own backend. Parent pages must allow this host in `script-src`, `frame-src` and `style-src`. The widget's stylesheet is loaded from the guide host into its shadow root. Escape closes it; native dialogs support keyboard focus trapping. The ordinary full-page route is `/`; the compact view is `/?widget=1`.

## Deployment

The included Dockerfile builds Tailwind and prunes development packages. Deploy it as a **single long-running Node service** behind HTTPS, with a persistent writable `data/` directory. Container initialization includes the audited snapshot; seed a mounted volume from it before mounting an empty directory over `/app/data`. Supply secrets via your host's secret manager, not the Docker build or image.

Required deployment settings:

```dotenv
HOST=0.0.0.0
PORT=3000
APP_ORIGIN=https://YOUR-GUIDE-HOST
WIDGET_ORIGINS=https://hrt.org,https://store.hrt.org
TRUST_PROXY_HOPS=1
SESSION_TTL_MINUTES=30
SYNC_INTERVAL_HOURS=24
```

Only set `TRUST_PROXY_HOPS=1` when exactly one trusted proxy stands in front of the app. Otherwise use `0` or your actual reviewed topology. Preserve SSE connections: disable response buffering on `/api/chat`, allow a response timeout above 120 seconds, and forward disconnects. Disable request-body, response-body and query-string logging for **all `/api/` routes** in the proxy, hosting platform and observability tools. This app has no analytics or transcript logging.

In-memory sessions, rate limiting and refresh coordination are designed for one process. Horizontal replicas need a shared expiring session/rate-limit store, distributed synchronization lock and shared versioned data storage before scaling. Do not claim HIPAA compliance; deployment/vendor assessment is outstanding. No hosting credentials were supplied and this project has not been publicly deployed.

## Verification

```powershell
npm test
npm run test:browser
npm audit --omit=dev
```

Run the server before browser tests. On Windows the tests use installed Microsoft Edge; other platforms use Playwright Chromium (`npx playwright install chromium` if needed). Real catalog requests are used for browser QA; provider calls are injected in deterministic integration tests. Screenshots are written to `test-results/`. Production dependency audit reported zero vulnerabilities during verification; the Tailwind CLI's development-only dependency chain has an unresolved `braces` advisory, recorded in `docs/VERIFICATION.md`.

## Layout

```text
public/       Standalone UI, vanilla JS, widget, setup page, compiled CSS
frontend/     Tailwind source and custom responsive styling
server/       API, source fetching, catalog queries, reviewed retrieval, AI, safety
scripts/      Import, knowledge validation, model verification, refresh, browser QA
data/         Imported catalog, reviewed knowledge, quarantined source audit, coverage report
tests/        Grounding, schema, safety, retrieval, HTTP and admin tests
docs/         Source audit, safety review status, verification scenarios
```

The October 26 local audit recorded 63 passing automated tests and a revised 24-question live-model evaluation; see [the audit report](docs/AUDIT-2026-10-26.md) for scope and limitations. Those results do not verify a new checkout, account or deployment. A fresh deployment still needs server-side credentials, account/model verification and end-to-end checks. Published policy conflicts need HRT clarification; authenticated portal actions, real purchases and appointments, clinical validation and public deployment were not verified.
