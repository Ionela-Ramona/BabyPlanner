# BP-UI-03 · Design tokens, borders, gradients, and themes (Paper + Night nursery)

**Epic:** A. Foundation · **Size:** M · **Depends on:** 01 · **Plan:** [§4.1–4.4, 4.6, 4.7](../REDESIGN_PLAN.md#4-what-we-extracted-from-the-reference-image), [§8 step 1](../REDESIGN_PLAN.md#8-migration-strategy-why-this-order)

## Goal
Change the values of the existing tokens so the whole app moves to the new world at once. Then add the new tokens that the kit needs.

## Scope
- **Re-map the existing tokens (same names, new values)** in `styles/_tokens.scss`:

  | Token | Today | New |
  |---|---|---|
  | `--color-bg` | `#faf8f6` | ground `#F9EFE5` (+ paper wash, see below) |
  | `--color-surface` | `#ffffff` | card `#FBF5ED` |
  | `--color-surface-muted` | `#f2efec` | sand-tint, e.g. `#F4E8DA` |
  | `--color-border` | `#e2ddd8` | warm line, e.g. `#E3D3BF` (decorative); controls use the *line* tokens |
  | `--color-text` | `#1f1d29` | cocoa `#4E4034` |
  | `--color-text-muted` | `#5c5769` | muted cocoa, ≥4.5:1 on card |
  | `--color-primary` / `-hover` / `-soft` / `on-primary` | violet `#5b53d3` | honey family; `on-primary` = cocoa |
  | `--color-focus` | violet | a focus color with ≥3:1 on ground, card and honey (e.g. dusk-ink `#657184` or caramel ink) |
  | `--shadow-sm/md` | grey | warm cocoa-tinted shadows |
  | `--radius-*` | 6/10/16 | 8/14/24 + `--radius-pill` |

- **New tokens**: the palette primitives; `--color-{success|warning|danger|info}-{fill|line|ink}`; `--act-{feeding|sleep|diaper|medicine|other}-{fill|line|ink}` (plan §4.2); motion (`--dur-fast 150ms`, `--dur 220ms`, `--ease-out`); a z-index scale.
- **`styles/_surfaces.scss`**: the four borders (stitch, rim, scallop, baseline) and three gradients (paper wash, card lift, honey button) as mixins and utility classes.
- **`styles/_themes.scss`**: replace the current cool purple-black dark theme with **Night nursery** (plan §4.7). It is driven by `prefers-color-scheme` **and** `[data-theme='light'|'dark']` on `<html>` (the toggle arrives in BP-UI-11).
- Replace the HSL `--badge-hue` pills in `activity-list.scss` with `--act-*` tokens. This is the only template-adjacent change.
- A contrast test (Vitest) that asserts every documented text/background pair is ≥4.5:1 (text) or ≥3:1 (control lines, focus, large text) in **both** themes.

## Acceptance criteria
- [ ] Bebeluși, Activități, Dashboard and Not-found render in the new palette with **no template changes**. Screenshots are compared side by side with the BP-UI-01 baseline.
- [ ] No raw hex values outside `_tokens.scss`.
- [ ] The contrast test passes in both themes.
- [ ] Stitch dashes are identical in Chrome, Safari and Firefox. The paper wash has no banding.
- [ ] Every component style file stays under the 4 kB budget, because surface utilities are global.

## Notes
- Bans: gradient text, glassmorphism, neon or high-chroma gradients, pure `#000`/`#fff`.
- Keep the existing Romanian comments' spirit: explain *why* a token exists, not what it is.
