# BabyPlanner frontend

Angular 22 web application for the BabyPlanner baby activity logger.

## Requirements

- Node >= 22.22.3 (set via `.nvmrc`: run `nvm use 24`)
- Backend API running on `https://localhost:7057`

## Getting started

```bash
npm install
npm start
```

The dev server runs on `http://localhost:4300` and proxies API calls to the backend.

## Development commands

- `npm start` — Start the dev server
- `npm test` — Run unit tests with Vitest
- `npm run build` — Build for production

## Component showcase

Visit `/dev/components` to browse the design system components and patterns (dev mode only).

## Styles and design tokens

All design tokens, typography, and surface styles live in `src/styles/`:

- `_tokens.scss` — Color, spacing, radius, and shadow tokens
- `_themes.scss` — Light ("Paper") and dark ("Night nursery") themes
- `_typography.scss` — Type scale, font families, and utilities
- `_surfaces.scss` — Card, stitch, scallop, baseline, and gradient styles
- `_buttons.scss` — Button variants and sizes

Import the mixins and tokens with `@use 'styles/...'` (the `src` folder is on the Sass include path).
