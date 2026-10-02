# BabyPlanner frontend

Angular 22 web application for the BabyPlanner baby activity logger. The design system is documented in [`DESIGN.md`](../../DESIGN.md) at the repository root.

## Requirements

- **Node** >= 22.22.3 (set via `.nvmrc`: run `nvm use 24`). Angular CLI 22 refuses older versions.
- **.NET 8** runtime and SDK for the API (or a newer runtime with `DOTNET_ROLL_FORWARD=Major`).

## Running with the API

In one terminal, from the repository root:

```bash
dotnet run --project backend/src/BabyPlanner.Api --launch-profile https
```

The API listens on `https://localhost:7057`, applies migrations and seeds a baby with activities in Development.

In a second terminal, from `frontend/baby-planner/`:

```bash
npm install
npm start
```

The dev server runs on `http://localhost:4300` and proxies `/api` to the API (`proxy.conf.json`).

## Commands

- `npm start` — dev server
- `npm test` — unit tests (Vitest), including axe checks via `expectNoAxeViolations`
- `npm run lint` — ESLint with angular-eslint template accessibility rules
- `npm run build` — production build (budgets: 500 kB initial, 4 kB per component style)
- `npm run check:contrast` — WCAG contrast check of every token pair, in every theme and background
- `npm run export:tokens` — regenerate `.impeccable/design.json` from `src/styles/_tokens.scss`
- `npm run subset:fonts` — regenerate the font subsets in `public/fonts/` after updating an `@fontsource` package

## Component showcase

Visit `/dev/components` while the dev server runs. Every component, variant and state is shown in both themes side by side, with the token page (palette, contrast, type scale, borders, gradients). The route is registered only in development builds (`dev-routes.development.ts`).

## Styles and design tokens

Everything lives in `src/styles/` (the `src` folder is on the Sass include path, so use `@use 'styles/...'`):

- `_tokens.scss` — the only file with hex values: palette, spacing, radii, type, motion, layout
- `_themes.scss` — Paper (day) and Night nursery, `prefers-color-scheme` plus `[data-theme]` / `[data-background]`
- `_fonts.scss` — `@font-face` for the self-hosted font subsets
- `_typography.scss`, `_surfaces.scss`, `_mixins.scss` — type utilities, the four borders and three gradients
- `_buttons.scss`, `_fields.scss`, `_overlays.scss` — global styles for directives and CDK overlays

## Adding an activity type

The frontend reads every type from one map, so a new type (for example "Baie") needs only:

1. **Backend**: the new value in the `ActivityType` enum (serialized as text, e.g. `"Bath"`).
2. **`src/app/core/models/activity-type.ts`**: the value in `ACTIVITY_TYPES` and an entry in `ACTIVITY_META` — label, icon, tone (one of the five color families), noun for counts, notes placeholder and the four Romanian sentences in `copy`. The compiler refuses a type without an entry.
3. **Icon**: a `<symbol id="...">` in `public/icons/sprite.svg` and its name in `ICON_NAMES` (`shared/components/icon/icon-names.ts`). Reusing an existing icon also works.

The picker, chips, badges, Azi tiles, Istoric summaries, toasts and empty states all pick it up from there.
