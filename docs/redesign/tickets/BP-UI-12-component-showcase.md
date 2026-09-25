# BP-UI-12 · Component showcase route (`/dev/components`)

**Epic:** B. Reusable components · **Size:** S · **Depends on:** 06–11 (grows with each)

## Goal
One page where every component, variant and state can be reviewed in both themes. It is a lightweight Storybook replacement (nothing new to learn) and the visual-regression target.

## Scope
- A dev-only lazy route under `features/dev-showcase/`, registered only when `!environment.production` (the environments already exist).
- Sections per component: variants × states, both themes side by side (a `data-theme` wrapper per column).
- A token page: palette swatches with measured contrast ratios, the type scale, spacing, radii, shadows, and the four borders and three gradients.
- Every component ticket adds its showcase section as part of its definition of done.

## Acceptance criteria
- [ ] The route is absent from the production build (check the build output + a route test).
- [ ] The showcase itself passes AXE.
- [ ] Screenshots at 390px and 1440px are saved in `docs/redesign/review/` for design review.
