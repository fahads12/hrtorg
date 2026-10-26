# HRT patient portal: verified client handoff requirements

Reviewed 2026-10-26. Scope: restore or adapt the supplied production frontend/backend code, preserving the existing patient journeys and, if requested, existing accounts/data. This is a source review, not a test of the production deployment.

## What was checked

- Original frontend ZIP: 227 files; original backend ZIP: 221 files. Every extracted file was compared with its ZIP entry by SHA-256; all 448 matched. Archive comparison evidence is retained in the local review workspace.
- Application entry points, configuration, environment references, database models/bootstrap, authentication/encryption, active integration services, frontend service calls, and the included deployment workflow were reviewed.
- Neither archive contains an environment file, SQL/database export, migrations, or seed scripts. The frontend README is generic Create React App documentation.
- The backend contains a compiled frontend. Some public build configuration and an inlined client encryption key are recoverable from that build; their presence was checked without publishing values. They still need to be checked against the intended environment.
- No app was started against production, credentials used, patient records accessed, appointments made, or payments attempted during this recheck.

## What to request from the client

### 1. Existing deployment access and environment configuration

Ask the current technical owner to provide secure access to the hosting environment, or securely export the active application settings and deployment configuration. Ask which server/API and database should remain in use and whether any deployed changes postdate these ZIPs.

The included workflow deploys to AWS EC2 and restarts a Node application through PM2. To retain this arrangement, request access to that EC2 instance, the PM2 process configuration, reverse-proxy/TLS configuration, and the person/account controlling `portal.hrt.org` DNS. A second copy of the repositories is not required. GitHub access is only needed if we will maintain the original repositories or use their deployment automation.

Evidence: backend `.github/workflows/deploy-backend.yml`, `server.js:9`, `server.js:26`, `server.js:52`.

### 2. Database and account continuity

Request the current MySQL schema, database version/connection configuration, and a de-identified development dataset. An isolated development database provided by their technical team is an alternative to an export. A full production-data transfer is not required to begin development.

Confirm whether existing accounts, intake records, kit associations, lab results, orders, appointments, and provider relationships must be retained. If they must be retained, arrange an authorized migration/continued-use plan for the existing database and uploaded documents. Obtain or verify the original encryption configuration against the data: existing names, email addresses, passwords and some intake fields use application encryption. Do not replace its key blindly.

The startup script initializes only 10 of the 17 defined models; there are no supplied migrations. We can create complete migrations and synthetic seed data ourselves. An existing JWT signing key is not essential for a fresh deployment; a new key can be generated, with the consequence that old sessions and signed email links will no longer validate.

Evidence: backend `models/tableSync.js`, `models/userModel.js`, `services/security/encryptionDescription.services.js:2`, `utils/common.utils.js:3`.

### 3. ZRT laboratory integration

Request the active ZRT API base URL and the **complete Authorization header value** expected by their account; the code forwards the `ZRT` environment value directly without adding a scheme. Also request:

- Confirmation of the correct buyer account and any provider contact account.
- Current permitted panel/kit, supply and shipping codes and the applicable kit pricing.
- API documentation/integration contact and a vendor-approved test procedure, with test kit/result examples where available.
- Existing result-ready callback configuration, including verification/authentication requirements. The supplied route is `GET <backend-origin>/api/zrt/resultReady`, consuming an `id` query parameter.

The buyer account is currently hardcoded; a working API credential alone does not establish that fulfillment will use the right account.

Evidence: backend `services/kitOrder.service.js:299`, `services/kitOrder.service.js:319`, `services/zrt.services.js:349`, `routes/zrt.routes.js:9`, `controllers/zrt.controller.js:59`.

### 4. PayPal payments

Request access to the relevant PayPal developer/business account, matching client ID/client secret, selected sandbox/live environment, and sandbox buyer/merchant test accounts for testing. If retaining existing subscriptions/orders, retain the associated database records and confirm their PayPal merchant/app, product and plan IDs.

Frontend kit checkout and the backend must use the same intended merchant/environment. The frontend also has a separate hardcoded PayPal client ID that we must consolidate. There is no PayPal webhook handler or webhook-secret configuration in the supplied source; a webhook secret is not an existing missing setup prerequisite.

Evidence: backend `config/prod.config.js:17`, `services/paypal.services.js`; frontend `src/App.js`, `src/pages/UserKitOrders/userKitCheckout.jsx:283`.

### 5. Google email, Calendar and Meet

Request the Google Cloud OAuth application's client ID/client secret and access to configure its authorized redirect URI. The code's callback is `<backend-origin>/api/calenderAuth/callback` (the spelling `calenderAuth` is intentional in the existing route).

The authorized Google account owner needs to complete OAuth consent for Calendar and Gmail sending. Ask which Google account sends portal emails and owns the appointment calendar, whether appointments are shared or provider-specific, and what availability/time zone/appointment duration should apply.

The refresh token is stored in the database, not an environment variable. The current code selects the token for `providerId = 1`, uses the primary calendar, and sends email as that account. Separate calendar IDs are not an existing required setting. Reauthorization can establish a fresh token; we must fix the existing token-update/provider-selection behavior when reconnecting it.

Evidence: backend `services/calenderAuth.service.js:14`, `services/calenderAuth.service.js:51`, `services/calender.service.js`, `services/email.services.js:26`.

### 6. S3 uploads and historical files

Request the S3 bucket name, region, and scoped access for the application to read/write its necessary objects. For migration, preserve or transfer the existing objects and their database references, including intake/identity documents, uploaded lab reports and product files. A database export alone does not include these files. Development should use synthetic files in an isolated bucket/prefix.

The existing code expects an AWS access key/secret; we can adapt the application to an appropriate deployment identity instead of requiring a root account or unrestricted credentials. If the existing server has any persisted local uploads, include those in its file inventory too.

Evidence: backend `services/upload.services.js`, `services/intakeForm.services.js`, `services/labTest.service.js`, `services/catalog.services.js`, `server.js:29`.

### 7. Provider mapping and test/acceptance contact

Ask which provider should receive newly registered patients: registration currently hardcodes `provider_id = 69`, separately from Google's `providerId = 1`. These identities cannot be inferred safely from source code alone.

Request test patient/provider/super-admin accounts on an isolated environment, or permission to create synthetic accounts. Ask for one staff member who can validate the real workflows, current prices, provider availability, and any changes to the supplied intake/consent/scoring content. Existing forms, assets, scoring rules and screens are already supplied; they do not need to be recreated by the client unless changes are wanted.

Evidence: backend `services/user.services.js:65`, `services/user.services.js:299`, `models/userModel.js:23`.

## Exact environment names traced in the code

These are configuration names, not a request to send secret values by email/chat. Access to the current secure configuration can replace a manually assembled list.

| Purpose | Names | Notes |
| --- | --- | --- |
| Backend environment/origins | `ENV`, `FRONTEND_HOST`, `BACKEND_HOST` | Supplied configurations are `dev`, `staging`, `prod`; their server port is hardcoded rather than read from a `PORT` variable. We can choose local/staging values. |
| MySQL | `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_DB_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Port is declared in config but not passed into Sequelize; developer fix needed if using a non-default port. |
| ZRT | `ZRT_EXTERNAL_APIS`, `ZRT` | `ZRT` is the complete outbound Authorization value. |
| PayPal | `PAYPAL_BASE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Must match frontend merchant/environment. |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIRECT_URI` | OAuth account consent and stored refresh token are also required for email/appointments. |
| S3 | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` | Current source uses explicit key configuration. |
| Backend application keys | `CRYPTO_SECRET_KEY`, `JWT_SECRET_KEY` | Legacy crypto compatibility matters for existing data; a fresh JWT key can be generated. |
| Active frontend build settings | `REACT_APP_API_URL`, `REACT_APP_CRYPTO_SECRET_KEY`, `REACT_APP_PAYPAL_C_CLIENT_KEY` | Public build settings are at least partly recoverable from the included bundle; verify environment consistency. |
| Existing GitHub deployment only | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_PATH` | GitHub Actions secrets, not app environment requirements. Only needed if keeping that automation. |

Do not request MongoDB, OpenAI, Mailgun or SMTP credentials for the current portal implementation. MongoDB/Mailgun packages or configuration are present but not the active data/email paths. No chatbot/OpenAI integration is required by these portal repositories. Shopify integration would be additional scope, not a missing credential needed to run the existing portal. Frontend `REACT_APP_ENV` and `REACT_APP_IMAGE_PATH` do not drive active behavior; `REACT_APP_PAYPAL_CLIENT_KEY` references are commented out.

## Work the developer must do; not client-supplied prerequisites

- Set up complete database migrations/test data and remove hardcoded provider/buyer assumptions.
- Repair server-side authentication, role/record ownership checks and password/reset handling; remove credential logging and redesign legacy password storage.
- Correct payment verification and amount authority, fulfillment failure recovery, calendar booking conflicts/cancellation, and other issues recorded in the earlier reviews.
- Configure the chosen domains, callback URLs, build settings and hosting; integrate the portal with the new website's navigation/design.
- Test registration/email, all roles, intake/uploads, lab claiming/results, scheduling and sandbox payments before production cutover.

Credentials alone do not resolve these source defects. Detailed source reviews are retained in the local review workspace.

## Minimum needed to begin versus complete

We already have enough source to start UI/design and code repairs. For realistic integration testing, the priority handoff is a development database/schema, the active configuration or technical-owner access, integration test access, and confirmed provider/account mappings. For preserving real accounts and launching, we additionally need the authorized data/file continuity plan, production service/domain access, and staff acceptance of the completed workflows.
