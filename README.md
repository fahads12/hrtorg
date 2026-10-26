# HRT.org website and AI guide

The HRT.org website redesign, reviewed static content pages, local symptom assessments, UI-only patient portal, and the bundled HRT AI Guide service.

## Local development

Use Node.js 24 and npm. Install the website and chatbot dependencies separately:

```sh
npm ci
npm --prefix chatbot ci
npm start
```

Open `http://localhost:8000/` for the website or `http://localhost:8000/portal/` for the patient portal. The symptom tracker is at `/portal/app/symptoms-tracker/`.

In a second terminal, start the guide:

```sh
npm run chatbot
```

The launcher uses the bundled `chatbot/` folder and port 3001. `HRT_GUIDE_DIR` can select a different checkout; `HRT_GUIDE_PORT` and `HRT_GUIDE_WIDGET_ORIGINS` customize the local service. The website's default loader uses port 3001, so a different service port also needs a matching loader origin. The local launcher disables scheduled source refreshes.

For AI answers, copy `chatbot/.env.example` to the ignored `chatbot/.env.local` and configure the server-side model/key. Credentials are not included in Git. Catalog browsing works without an AI key. See [chatbot/README.md](chatbot/README.md) for setup, maintenance and verification.

## Package the reviewed website

```sh
npm run build:vercel
```

This command packages the checked-in HTML and assets into the allowlisted `dist/` directory. It preserves the reviewed copy, image repairs, symptom layouts and widget integration. It does **not** regenerate those pages from older templates. `vercel.json` uses this command and publishes `dist/`; chatbot server code, credentials, source records and development files are excluded from that output.

To preview the packaged website:

```sh
node serve.cjs --dist --port 8015
```

The legacy generator remains available through `npm run build`. It regenerates and prerenders pages from the JSX and `source-content/` templates and can overwrite reviewed static changes. Run it only when intentionally updating those generators and reviewing their resulting page changes. Visual assets live in `uploads/` and `assets/`.

## Portal and deployment scope

The website's `portal/` is a frontend demo. It has no database, real authentication, email delivery, appointment booking, or checkout. Demo state resets on reload. See [PORTAL-UI.md](PORTAL-UI.md). The original production portal ZIPs and private review workspace are not part of this repository.

The guide is a separate Node service, not part of the static website deployment. For a public widget, deploy `chatbot/` to an HTTPS service, set its `APP_ORIGIN` and `WIDGET_ORIGINS`, and configure the deployed guide origin in `assets/hrt-chatbot.js` (or the embed's `data-guide-origin` attribute). The default loader connects locally only. Run `npm run widget:sync` after changing that loader to refresh the embedded asset version. Committing or pushing this repository does not by itself deploy the website or guide.

Dependencies, credentials, raw chatbot crawl records, runtime files, local backups and audit working copies are excluded from Git. The reviewed public catalog and knowledge snapshots are included. The October 26 chatbot changes and their recorded checks are documented in [chatbot/docs/AUDIT-2026-10-26.md](chatbot/docs/AUDIT-2026-10-26.md).
