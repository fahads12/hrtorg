# Portal authentication UI verification

Implemented `portal-auth.jsx` and `portal-auth.css`, exporting `window.HRTPortalAuth` for login, registration, and password recovery. Patient/provider registration uses the original conditional fields. The component preserves the public header, footer, imagery, type, layout, and responsive behavior through `portal-reference.css`.

All form actions are local UI previews. Login/registration return only display-profile fields to the router; passwords are cleared and never stored, logged, or sent. Recovery explicitly says no email was sent. Form inputs and submit buttons remain disabled in static rendering until React's effect enables them, preventing a native form submission if hydration fails. Footer telephone/email links remain ordinary contact links; they were not activated during testing.

## Reference comparison

The six original public screenshots in `scraps/portal-reference` were compared against isolated auth renders using local assets and fonts. This harness omits the root router's deliberate UI-preview badge.

| View | Width | Comparison |
| --- | ---: | --- |
| Login | 1440 | Identical pixels and dimensions |
| Registration | 1440 | Identical pixels and dimensions |
| Recovery | 1440 | Identical pixels and dimensions |
| Login | 390 | Identical layout; tiny header-logo rasterization difference |
| Registration | 390 | Identical layout; tiny header-logo rasterization difference |
| Recovery | 390 | Identical layout; 0.026% pixels differ by more than 10/255, within rendered logo images |

All six images were visually inspected. Provider registration and the local recovery-confirmation state were also inspected. No baseline overflow or missing images was found. `visual-comparison.json` records dimensions and pixel metrics.

## Local functional checks

`../check-auth.cjs` validates required fields, invalid email, original signup password rules, first invalid field focus, signup password visibility, consent checkbox, provider-specific fields and phone format, role reset, local login/signup success payloads, password clearing, recovery confirmation, mobile menu, and auth navigation. It also confirms zero browser storage entries and no unexpected requests or JavaScript errors. Network interception permits only local GET assets and serves them from the workspace.

The public login/signup forms have no password-confirmation field or strength meter. Only signup has a password visibility icon. Those source details are preserved rather than adding fields absent from the reference.

Detailed results and eight captured states are in this directory. No live account, login, provider registration, password-recovery email, or backend delivery was exercised.

## Integrated portal checks

`../check-auth-integrated.cjs` passed against the candidate publish build at `http://localhost:8014/portal/`. Six desktop/mobile screenshots were captured and visually inspected; the root preview badge is the intentional addition. No overflow, missing images, browser errors, or unexpected requests occurred.

Keyboard checks passed for the skip link and actual main focus, field order, empty-form validation, local login routing to `/portal/app/home/`, mobile menu navigation to signup, password visibility, consent checkbox, and recovery confirmation. The shared public header and footer are also exported as `window.HRTPortalPublicHeader` and `window.HRTPortalFooter`.

Axe's WCAG 2/2.1 A/AA checks found only the inherited footer contrast issue on all six views: five text/link nodes use `#898989` against `#f8f8f8`, measuring **3.29:1** against the normal-text requirement of **4.5:1**. The description and Privacy Policy, Terms And Conditions, telephone, and email links are affected. Their original color was preserved because changing it would change the requested reference appearance. No other violations were reported by this automated check; it is not a certification of complete accessibility.

Integrated evidence is in `../auth-integrated/results.json` and the six corresponding PNG files.
