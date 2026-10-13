# Patient portal reconstruction evidence

## Reference and scope

The patient UI was reconstructed from the JavaScript and CSS publicly served by `https://portal.hrt.org/`, downloaded under `source-content/portal-reference/`. Selected component syntax was parsed and formatted for inspection; the original bundle was not executed. No authentication bypass, login attempt, private API request, form submission, or patient data access was used.

The public login, sign-up, recovery, and initial symptoms screens have captured desktop/mobile references in this directory. Authenticated patient screens were established from public component markup, copy, CSS, route declarations, and asset references. They do not have an authenticated rendered reference. The private UI should therefore be described as a source-based recreation, not a verified pixel-identical copy of every private screen.

## Implemented patient routes

The dashboard module exports `window.HRTPortalDashboard` from `portal-dashboard.jsx`; `portal-dashboard.css` adds scoped semantic, responsive, and demo adaptations to the localized original `portal-reference.css`.

| Local route under `/portal/app/` | Source-backed screen structure |
| --- | --- |
| `home/` | Welcome hero, three action cards, next steps, patient top navigation |
| `appointment-scheduling/` | Scheduled Appointments table and scheduling action |
| `lab-results/` | My Results, kit search/add action, results columns |
| `medical-history/` | Medical History Intake Questionnaire and four intake tabs |
| `my-orders/` | Patient Order table, search/status filter, Popular Products empty state |
| `user-kit-orders/` | Kit Orders search, empty state, pagination |
| `lab-tests/` | Lab Tests table and add/edit/view/delete controls |
| `tracker-history/` | Symptoms Tracker History and empty assessment state |
| `symptoms-tracker/` | Public four-step Profile / Questions / Results / Email wizard |
| `change-password/` | Current, new, and confirm password fields |

Patient navigation uses the original seven top navigation destinations. The account dropdown provides Change Password and Log Out. The original desktop logo dimensions and navigation typography are retained; the menu collapses below 1200px to keep all links usable. Public symptoms entry reuses the exact public header/footer components exported by the auth module.

## Deliberate UI-only behavior

- All sample patient, kit, lab-test, appointment, intake, and symptom-entry changes remain in React memory and disappear after a reload.
- Scheduling adds a local sample row. No appointment is booked and no meeting link is created.
- Password fields are cleared after the preview action. No password is saved, changed, transmitted, or persisted.
- File controls preview selection only; there is no upload or identity verification.
- Medical intake uses representative local fields within the source-backed four-tab structure; it does not recreate a clinical intake service.
- The symptoms wizard uses the public source's seven common and four profile-specific questions with the 0–5 controls. Results are explicitly illustrative; no clinical score, diagnostic category, treatment advice, or email delivery is generated.
- Mutating form fields remain disabled until hydration. Static no-JavaScript handling is supplied by the root portal page wrapper.

The module makes no API calls and uses no database, browser storage, or cookies. Integration/build/browser checks are tracked separately by the root and technical reviewers.

## Final precision changes

- Reused the source public footer and public symptoms header.
- Restored the source four-step symptoms initial screen, Women/Men card copy, icons, and bold button text.
- Restored the desktop patient logo at 153×45px, 15px navigation text, and original container/padding cascade.
- Replaced the initial appointments inline form with the source table-first structure and a local scheduling dialog.
- Preserved source button typography by removing the broad dashboard `font: inherit` override; kept Likert buttons free of the global 150px minimum width.
