# HRT.org website

The HRT.org website redesign, static content pages, local symptom assessments, and UI-only patient portal.

## Local development

Tested with Node.js 24 and npm.

```sh
npm ci
npm start
```

Open `http://localhost:8000/` for the website or `http://localhost:8000/portal/` for the patient portal. The symptom tracker is at `/portal/app/symptoms-tracker/`.

## Build

```sh
npm run build:vercel
```

The build compiles the React JSX, generates and prerenders the static pages, and writes the public website to `dist/`. `vercel.json` contains the deployment configuration. The required content data lives in `source-content/`; visual assets are in `uploads/` and `assets/`.

To preview the packaged build:

```sh
node serve.cjs --dist --port 8015
```

The patient portal is a frontend demo. It has no database, real authentication, email delivery, appointment booking, or checkout. Demo state resets on reload. See [PORTAL-UI.md](PORTAL-UI.md) for its scope.

Dependencies, generated publish output, private tool files, credentials, tunnel logs, and large audit captures are excluded from Git. Source code, build data, verification scripts, and required website assets are included.

Project notes and validation results are documented in the repository's audit and implementation Markdown files. This repository is the website source; transferring it to GitHub does not deploy it.
