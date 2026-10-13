# Glow menu integration

The site keeps its existing static pages and React 18 islands. It previously used plain CSS and compiled JSX; TypeScript, Tailwind CSS 4, and shadcn-compatible aliases are now configured manually. A framework migration or another initialization step is not needed.

## Files and defaults

| Path | Purpose |
| --- | --- |
| `components/ui/glow-menu.tsx` | Reusable menu with typed items, active state, native links, and motion. |
| `components/ui/demo.tsx` | Importable Home / Notifications / Settings / Profile example; no public demo route. |
| `lib/utils.ts` | `cn()` using `clsx` and `tailwind-merge`. |
| `client/glow-navigation.tsx` | Connects the menu to the six existing HRT navigation destinations. |
| `styles/ui.css` | Tailwind imports, component tokens, and responsive HRT header adjustments. |
| `tsconfig.json` | Strict TypeScript checks and the `@/*` project-root alias. |
| `components.json` | shadcn component, utility, and style aliases. |
| `build-glow-menu.cjs` | Compiles scoped CSS and bundles the TypeScript entry point. |

Use `components/ui` for reusable UI and `styles/ui.css` for its styling. The folder itself is not a runtime requirement; it gives imports such as `@/components/ui/glow-menu` and the shadcn CLI a consistent destination. Existing page styles remain in their current root-level CSS files.

## Run locally

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:8000/HRT%20Home.html`. `npm run build:ui` rebuilds only the UI assets; use the full build before reviewing the site so generated pages and asset fingerprints are current.

The browser cannot load TSX directly. Import new UI components through `client/glow-navigation.tsx`, or add another explicit bundled entry in the build script. The legacy Babel page compiler continues handling the existing JSX pages.

## Styling and behavior

- Tailwind Preflight is excluded. The build scopes generated utilities to `.hrt-ui` using PostCSS, preserving the established page typography and layout.
- The header retains the original `#site-navigation` node, mobile controls, Symptom Check dropdown, Shop destination, and portal actions. Regular anchor clicks continue through the existing navigation handlers.
- Audience active state follows the current page and `body[data-gender]`. The existing Men/Women transitions remain responsible for audience changes.
- `next-themes` supplies the component's theme context with a forced light UI theme. This does not control the separate HRT audience palette or recolor the homepage.
- Each link handles its own hover and keyboard focus. Duplicate animated faces are hidden from assistive technology. Reduced-motion and coarse-pointer preferences disable the 3D flip.
- No image assets are required by this component. The supplied HRT logo and existing page images are preserved; no unrelated Unsplash photographs were added.

`MenuBar` accepts `items`, optional `activeItem`, optional `onItemClick(label)`, a forwarded `HTMLElement` ref, and motion-compatible `<nav>` props. Each item supplies an icon, label, real `href`, CSS gradient, and static Tailwind icon-color class. The callback does not replace native navigation.

## Verification — 2026-10-11

- `npm run typecheck` and `npm run build` passed; `npm audit` reported no known vulnerabilities after dependency updates.
- All 300 pages with shared navigation include one component mount, its assets, correctly ordered React dependencies, and six native fallback links.
- Ten representative runtime routes passed active-page, root destination, dropdown, console, and overflow checks.
- Checked widths: 320, 390, 768, 1000, 1001, 1024, 1200, 1251, 1280, and 1440 pixels. All six primary links have at least 44px touch height.
- Verified individual hover/focus behavior, Control-click opening a new tab, reduced motion, dropdown Escape handling, and same-document Women/Men switching on desktop, tablet, and mobile.
- Captured and reviewed desktop/mobile header screenshots and full homepage screenshots. Evidence and the focused verification script are in `scraps/glow-navigation/`; existing audience-switch checks are in `verify-header-audience.cjs`.
- Shop and portal destinations are preserved. No live orders, bookings, or submissions were made.

## Setup references and provenance

For a new project, use the [shadcn manual setup guide](https://ui.shadcn.com/docs/installation/manual) or its CLI initialization flow, then configure the [Tailwind CLI](https://tailwindcss.com/docs/installation/tailwind-cli). Do not rerun initialization over this project's completed configuration. Accessibility behavior follows the [Motion accessibility guidance](https://motion.dev/docs/react-accessibility).

The menu began with the component supplied in the task and was adapted for HRT routes, TypeScript compatibility, accessibility, and responsive integration. No external license was asserted for that supplied snippet. Installed React, React DOM, Framer Motion, next-themes, Tailwind CSS, tailwind-merge, and clsx packages declare MIT licenses; lucide-react declares ISC. Keep dependency license notices and the generated JavaScript legal-notice file with distributed assets.
