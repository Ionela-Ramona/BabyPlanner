# BP-UI-05 · Wordmark, icon set, and illustration kit

**Epic:** A. Foundation · **Size:** M (part 1) + L (part 2, sourcing) · **Depends on:** 03 · **Plan:** [§4.3, 4.6](../REDESIGN_PLAN.md#43-design-principles-found-in-the-image)

## Goal
Replace the 🍼 emoji with a real mark, and give activity types and fields icons drawn in the reference's soft, hand-made language.

## Part 1: SVG kit (now)
- **Wordmark**: "BabyPlanner" set in the UI face with "Planner" (or "Baby") in the accent script, plus the sleepy-star mark. It replaces `brand__mark` 🍼 in `app.html`. Include an SVG favicon + apple-touch-icon (sleepy star on cream).
- **Activity icons** (24px, 1.75px rounded stroke): Masă (bottle), Somn (moon + star), Scutec (diaper), Medicamente (dropper), Altele (heart-star).
- **Field icons** (from the reference card): calendar, star (age), clock, note, and later ruler/scale for BP-UI-20.
- **UI icons**: plus, close, back (it replaces the "←" character in "← Toți bebelușii"), chevron, edit, delete, filter, sun/moon, check.
- One sprite `assets/icons/sprite.svg` and an `app-icon` component (`name`, optional `label` → `role="img"` + `aria-label`, otherwise `aria-hidden`). Colors use `currentColor`.
- **Decorative pieces**: sleepy star, small star, cloud, dot confetti, bunting strip, balloon, scallop edge, wooden block. They are loaded as `<img alt="">` or CSS backgrounds, never inside component styles (4 kB budget).

## Part 2: Watercolor illustration set (later)
- Source or commission a set matching the reference: teddy bear (sitting, sleeping), blocks, stacking rings, balloon, bunting, cloud, stars. Transparent PNG/WebP at 2×, plus a dimmed variant for Night nursery.
- It replaces the Part 1 decorative files without code changes (same file names).
- Record the source and license of each asset in `assets/illustrations/CREDITS.md`.

## Acceptance criteria
- [ ] No emoji left in the UI chrome.
- [ ] Icons are crisp at 16, 20, 24 and 32px in both themes. The sprite is ≤ 15 kB gzipped.
- [ ] Decorative images have `alt=""`. Meaningful icons have Romanian accessible names.
