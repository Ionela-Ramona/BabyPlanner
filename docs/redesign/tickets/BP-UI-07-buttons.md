# BP-UI-07 · Buttons, icon buttons, the ＋ Adaugă action

**Epic:** B. Reusable components · **Size:** S · **Depends on:** 03, 05

## Goal
One button family, used the same way everywhere. It replaces the global `.button` / `.button--ghost` classes. The existing idea is kept: the same look on `<button>` (action) and `<a>` (navigation), with the element chosen by what it does.

## Scope
- An `appButton` **attribute directive** with host styles on native `<button>` and `<a>` (no wrapper component, so forms, focus and router links keep working).
- Variants: `primary` (honey-button gradient, cocoa text, inner highlight, stitched inner line), `secondary` (card fill + line border; replaces `.button--ghost`), `ghost` (text-only, e.g. the back link "Toți bebelușii"), `danger` (blush ink, destructive confirms only).
- Sizes: `md` (48px min height, the tap-target floor) and `lg` (56px, logging actions).
- `app-icon-button`: 48×48 hit area and a **required** `label` input → `aria-label` (Romanian).
- `app-add-button`: the central "＋ Adaugă" in the bottom nav, 64px, raised, honey.
- States: default, hover (`@media (hover: hover)` only), pressed, `:focus-visible` (uses the existing global ring token), disabled, loading (`aria-busy`, width locked, inline spinner).

## Migration
- `.button` and `.button--ghost` stay as aliases in `_legacy.scss` until pages 16 and 17 are migrated. They are deleted in BP-UI-18.

## Acceptance criteria
- [ ] Every variant × state is in the showcase for both themes.
- [ ] Label ≥4.5:1 on every fill, and the focus ring ≥3:1 against the adjacent colors.
- [ ] Tests: disabled prevents activation, loading sets `aria-busy`, and an icon button without `label` fails to compile.
