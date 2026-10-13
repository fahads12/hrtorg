# External reference and legacy-route audit

Read-only verification on 12 October 2026: 38 external URL records (37 distinct requests) outside portal/store; 19 uncertain destinations checked independently in Chrome. Requests used no credentials, forms, POSTs, or writes. Clinical references were not altered.

## Status summary

- reachable: 5
- page-content-unavailable: 1
- redirected-reachable: 16
- unreachable-in-both-clients: 6
- access-blocked-or-verification-required: 10

## Unavailable or changed references requiring review

- `https://www.facebook.com/hrthealth`
  - Result: page-content-unavailable; HTTP 200; destination `https://www.facebook.com/hrthealth`.
  - HTTP Error 400: Bad Request
  - Used on: Shared footer on 303 routes (full list in JSON).
- `http://www.indianspringherbs.com/black-cohosh-cimifuga-racemosa/`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  - Used on: `health/black-cohosh-natural-treatment-menopause-relief/index.html`
- `http://technicianonline.org/your-career-as-an-ekg-technician/`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  - Used on: `health/ecg-and-ekg-encyclopedia/index.html`
- `http://www.webmd.com/urinary-incontinence-oab/picture-of-the-kidneys`
  - Result: redirected-reachable; HTTP 200; destination `https://www.webmd.com/a-to-z-guides/keep-kidneys-healthy`.
  - Old kidney anatomy/picture reference now resolves to a kidney-health guidance article. Check support for cited claim.
  - Used on: `health/human-growth-hormone-hgh-its-uses-and-abuses-what-you-need-to-know/index.html`
- `https://www.medmind.com/`
  - Result: redirected-reachable; HTTP 200; destination `https://medmind.com/`.
  - Current title and page describe a broad AI healthcare-support platform; archived article describes a medication/pill tracker. Source-owner review required.
  - Used on: `health/medmind-medication-pill-tracking-reminders-alerts/index.html`
- `http://umm.edu/health/medical/altmed/condition/osteoporosis`
  - Result: access-blocked-or-verification-required; HTTP 403; destination `https://www.umms.org/ummc/hl`.
  - Original osteoporosis reference redirects to generic /ummc/hl endpoint, which presents a verification challenge. Exact source availability unconfirmed.
  - Used on: `health/osteoporosis-protecting-bone-health/index.html`
- `http://www.med.umich.edu/intmed/endocrinology/patients/Osteoporosis.htm`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error timed out>
  - Used on: `health/osteoporosis-protecting-bone-health/index.html`
- `https://www.niams.nih.gov/health_info/bone/Osteoporosis/default.asp`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  - Used on: `health/osteoporosis-protecting-bone-health/index.html`
- `https://www.niams.nih.gov/Health_Info/Bone/Osteoporosis/overview.asp`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  - Used on: `health/osteoporosis-protecting-bone-health/index.html`
- `http://www.uwosteoporosis.org/`
  - Result: unreachable-in-both-clients; HTTP none; destination `unresolved`.
  - URLError: <urlopen error [Errno 11001] getaddrinfo failed>
  - Used on: `health/osteoporosis-protecting-bone-health/index.html`
- `https://1.usa.gov/1Nxq0tj`
  - Result: redirected-reachable; HTTP 200; destination `https://www.usa.gov/`.
  - Short reference now ends at generic USA.gov homepage, not a menopause source.
  - Used on: `health/post-menopause-what-to-expect-after-the-change/index.html`

## Verification limitations

- NCBI Books displays a reCAPTCHA/browser check despite HTTP 200. Four PubMed destinations return 403 in Chrome (203 interstitial responses in urllib). This does not establish broken source records.
- HealthCentral (old EndocrineWeb), Mayo Clinic, UMMS, and Honeybee support return access/security challenges. Keep them unverified rather than claiming successful content access.
- CDC returns 403 to urllib but loads the proper current homepage with HTTP 200 in Chrome.
- NIAMS returned DNS failure in both clients here. This is an observed environment result, not evidence that the institution/domain ceased operating.
- Facebook responds with HTTP 200 but says its HRT page content is unavailable; public profile availability needs owner confirmation.
- Successful references and redirect chains, including PMC, NHLBI, MedlinePlus, WomensHealth, Oregon State, WebMD, X and Google ads settings, are listed with exact source routes in `external-reference-check.json`. Google preferences ends in its blocked-cookies guidance; no settings were changed.

## Legacy-route mappings

The source page index has ten original slugs without matching published directory files. Current Vercel configuration initially did not cover them. Suggested permanent mappings:

- `/conditions` → `/Resources.html`
- `/contact` → `/Contact.html`
- `/join-our-network` → `/Join Our Network.html`
- `/privacy-policy` → `/Privacy Policy.html`
- `/providers` → `/Providers.html`
- `/return-policy` → `/Return Policy.html`
- `/search` → `/Resources.html`
- `/symptoms` → `/Resources.html`
- `/terms-and-conditions` → `/Terms and Conditions.html`
- `/about` → `/About.html`

`/lab-testing` already has an HTML directory alias; an HTTP permanent redirect to `/Lab Testing.html` is a cleaner canonical handoff. The encoded old heart-health category already has explicit redirect coverage. Parent audit agent owns deployment mapping implementation.

Evidence: `external-reference-check.json`, `external-reference-browser-check.json`, `legacy-route-suggestions.json`.
