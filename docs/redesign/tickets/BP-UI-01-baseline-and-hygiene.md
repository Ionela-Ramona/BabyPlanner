# BP-UI-01 · Baseline screenshots and project hygiene

**Epic:** A. Foundation · **Size:** S · **Depends on:** — · **Plan:** [§2](../REDESIGN_PLAN.md#2-the-current-design-baseline), [§3.3](../REDESIGN_PLAN.md#33-technical-findings)

## Goal
Freeze a "before" picture of the current design, and remove the small problems that would get in the way of the redesign.

## Scope
- **Environment**: document the required versions in the root `README.md`: Node ≥ 22.22.3 (Angular CLI 22 refuses v22.17.0) and the .NET 8 runtime/SDK (the machine has only .NET 10.0.12). Optional: add `"engines"` to `package.json` and an `.nvmrc`.
- **Baseline screenshots** of every current route (`/dashboard`, `/babies`, `/babies/1/activities`, `/babies/1/activities?type=Feeding`, `/nu-exista`) at **390×844** and **1440×900**, in light and dark (system) themes, saved to `docs/redesign/baseline/`. These are what every later ticket compares against.
- Move `public/image.png` → `docs/design/reference/little-moments.png` so it doesn't ship in the bundle, and update the path in `PRODUCT.md`.
- `index.html`: add `<meta name="description">`, `<meta name="theme-color">` for light and dark (`media` attribute), and a placeholder for the apple-touch-icon (the real icon comes in BP-UI-05).
- Add `.playwright-mcp/` to `.gitignore`.
- Split `src/styles.scss` into partials (`styles/_tokens.scss`, `_base.scss`, `_legacy.scss` for `.card`/`.button`/`.text-muted`) **without changing any values**. This is a pure move that makes BP-UI-03 a values-only diff.

## Acceptance criteria
- [ ] `npm start` and the API run with the documented versions. The screenshots exist for every route × size × theme.
- [ ] `ng build` output contains no `image.png`.
- [ ] After the stylesheet split, the app looks pixel-identical (compare with the baseline).
- [ ] `npm test` passes.
