# ADR 0001: UI Foundation — Component Library and Primitives

**Status:** Accepted · **Date:** 2026-09-25 · **Supersedes:** Angular Material suggestion in `BabyPlannerDoc.docx`

## Context

BabyPlanner is a phone-first activity logger for infants with a warm, storybook-inspired visual direction (the "Little Moments" reference illustration). The app needs a component library that is:

1. **Performance-conscious**: initial bundle ≤ 500 kB, per-component styles ≤ 4 kB
2. **Customizable**: supports refined borders (stitches, scallops), gradients, and warm pastel tokens without fighting a strong library theme
3. **Accessible**: WCAG 2.1 AA, AXE-clean, keyboard-navigable, with Romanian ARIA labels and proper contrast
4. **Learning-friendly**: this is a learning project; visibility into accessible patterns is valued over hiding complexity

The recommendation is to choose between a full-featured styled library (Angular Material, PrimeNG, Taiga UI) or a headless approach (Angular Aria, Angular CDK, or Spartan/ui).

## Options considered

| Option | Styling | Complexity | Fit | Verdict |
|--------|---------|-----------|-----|---------|
| **Angular Aria** | Headless | Low | **Best** | Official Angular package, stable since Angular 22. Handles listbox, select, combobox, menu, tabs, toolbar, accordion, tree, grid. Same release train as Angular; full Romanian locale support. Ships only behavior + ARIA; styles come from tokens. |
| **Angular CDK** | Headless utilities | Low | **Best, alongside Aria** | Official overlay management, dialog, focus trap, live announcer, breakpoint observer. Structural CSS only (no theme). Pairs perfectly with Aria for comprehensive coverage. |
| **Spartan/ui** | Headless + shadcn-style copy-paste | Medium | Good (fallback) | 1.0 stable, 55+ components. Requires Tailwind. Default theme is shadcn (dark, cool). Can be customized but adds build complexity. Recommended as Plan B if Aria + CDK gaps emerge. |
| **Angular Material** | Full Material 3 theme | High | Poor | Strong a11y and a large component set. BUT: the Material shape language (2px chips, straight edges, 4px radius) fights stitches, scallops, and the warm palette. Migrating away from it later is harder than building custom components. High performance overhead for a learning project. |
| **PrimeNG** | Styled or unstyled, 80+ components | High | Poor to OK | Built for data-heavy enterprise UIs. Harder to customize despite "unstyled" option. Reported performance issues with large grids. Overkill for this project's scope. |
| **Taiga UI** | Full design system | High | Poor | Strong own identity (geometric, modern). Smaller community. Deep customization requires understanding a proprietary system. Not a good fit for a keepsake-feeling baby app. |

### Key facts

- Angular Aria entered stable in June 2026 with Angular 22; it is the official direction.
- No component library is currently installed; there is no migration cost.
- The existing code has a11y base (skip link, `aria-current`, `.visually-hidden`, `:focus-visible` global ring, `prefers-reduced-motion` handling).
- TypeScript and Sass are locked in; we can control every token value.

## Decision

**Use Angular Aria + Angular CDK + our own SCSS tokens.**

### Why this works

1. **Performance**: we install only the primitives we import (behavior + ARIA only) and bundle no theme CSS. This fits the initial ≤ 500 kB budget and per-component ≤ 4 kB style budgets.
2. **Professional look**: every border, gradient, radius, and color comes from our design token system (`_tokens.scss`, `_surfaces.scss`). The result is a cohesive, refined visual identity without any library styling fighting it.
3. **Accessibility**: keyboard and ARIA come from the Angular team, which maintains alignment with WCAG 2.1 AA and the project's accessibility-first rule. We see how accessible patterns work instead of hiding the machinery.
4. **Romanian support**: native support for `lang="ro"`, locale-aware date/time rendering, and full diacritics (ă â î ș ț with comma-below).
5. **Learning value**: you build the components you use and understand the accessibility layer.

### What we import

- `@angular/aria` — Aria listbox, select, combobox, menu, tabs, toolbar, accordion, tree, grid
- `@angular/cdk` — Dialog, overlay, focus trap management, live announcer, `BreakpointObserver`
- `@angular/cdk/overlay` structural CSS only

### Versions

- `@angular/aria` ^22.2.0
- `@angular/cdk` ^22.2.0

Both match `@angular/core` ^22.1.0.

## Consequences

### What we build

Custom components in `src/app/shared/components/`:

- **Surfaces**: `app-card`, `app-frame` (stitched rim), `app-edge` (scalloped edge), `app-sheet` (bottom sheet)
- **Controls**: `app-button` (primary, secondary, ghost, danger), `app-icon`, `app-badge`
- **Form fields**: `app-text-input`, `app-textarea`, `app-date-input`, `app-time-input`, `app-select` (via Aria select), `app-listbox`, `app-combobox`
- **Feedback**: toast/notification (via CDK Overlay + LiveAnnouncer), confirmation dialog (via CDK Dialog)
- **Layout**: `app-tabs` (via Aria tabs), `app-activity-type-picker` (via Aria listbox)

### What we use directly

- **Aria listbox** for activity type filter (five wooden-block-style tiles)
- **CDK Dialog** for add/edit forms and confirmations
- **CDK Overlay** for toasts
- **CDK breakpoint observer** for responsive layouts
- **Aria tabs** for any tabbed UI (profile, settings)

### Fallback: Spartan/ui

If we discover that Aria + CDK gaps block shipping (e.g., a complex autocomplete, a data grid), we adopt Spartan/ui for those specific components:

1. Add Tailwind to the build (one-time; existing components keep working).
2. Copy the Spartan component (copy-paste, not npm).
3. Customize Tailwind config to use our token values instead of the default shadcn palette.

Spartan does not become a dependency; it is local code that can be audited and customized. The switch is a one-PR change if needed.

## Which primitive do I use?

| Need | Primitive | Notes |
|------|-----------|-------|
| **Single-select** (activity type, color, baby) | Aria listbox or Aria combobox | Listbox for ≤5 options; combobox for ≥10 (typeahead). Style with our tokens and wooden-block or pill design. |
| **Multiple-select** | Custom checkbox group or Aria listbox with `multiselectable` | Checkbox group for ≤5; consider Aria for larger lists. |
| **Dropdown menu** (actions, overflow) | Aria menu + CDK Overlay | Aria menu handles keyboard + ARIA; overlay positions it. |
| **Tabs** | Aria tabs | Keyboard auto-advances left/right. Full Romanian ARIA labels. |
| **Dialog / modal** | CDK Dialog | Manages focus, z-index, escape key, backdrop. Use for forms and confirmations. |
| **Bottom sheet** (quick-log, activity edit) | CDK Dialog with `position: 'bottom'` and custom backdrop/animation | Scalloped top edge (via `app-edge`), full-height on mobile, centered drawer on desktop. |
| **Toast / transient notification** | CDK Overlay + `LiveAnnouncer` | Toast is a positioned overlay; live announcer broadcasts to screen readers without visual UI. |
| **Date picker** | Native `<input type="date">` styled with our tokens | Phone OS provides the picker; desktop gets the browser's date input. Always better one-handed than a custom picker. |
| **Time picker** | Native `<input type="time">` styled with our tokens | Same rationale. Renders as "HH:MM" input. |
| **Text field** | Custom `app-text-input` with validation and error states | Built on `@angular/forms/signals` (Signal Forms). Handles label, hint, error, prefix/suffix, readonly. |
| **Textarea** | Custom `app-textarea` | Same validation and error handling. Autosize or fixed height. |

## Questions and answers

**Q: What if Aria listbox doesn't support a feature we need?**
A: The Aria package is maintained by the Angular team and updated with every Angular release. If a gap exists, we file an issue. In the interim, we can wrap Aria's behavior with additional features (e.g., virtual scrolling via CDK). If it's unfixable, Spartan/ui has components for that use case.

**Q: Can we style Aria listbox to look like wooden blocks?**
A: Yes. Aria listbox provides behavior and ARIA; we apply our `_surfaces.scss` mixins and custom design to the list items. The "block" style is CSS, not a library component.

**Q: Will the bundle still be small if we use both Aria and CDK?**
A: Yes. Aria listbox is ~5 kB (gzip), CDK dialog ~3 kB. We import only what we use. Compared to Angular Material (~50+ kB), this is negligible.

**Q: Do we need a theming system?**
A: No. We are using CSS custom properties (tokens) directly. Light and dark themes are defined in `_themes.scss` as `[data-theme="light|dark"]` or media query `prefers-color-scheme`. No library theming layer is needed.

**Q: What about internationalization?**
A: Angular Aria respects the document's `lang` attribute. We set `<html lang="ro">` and provide full Romanian ARIA labels in component templates. Date/time rendering uses the `'ro'` Angular locale.

## References

- [Angular 22: The Evolution of Modern Angular (Telerik)](https://www.telerik.com/blogs/angular-22-evolution-modern-angular)
- [Angular Aria in Angular 21 (DEV)](https://dev.to/hassantayyab/angular-aria-in-angular-21-the-future-of-accessible-headless-ui-components-26di)
- [spartan-ng on GitHub](https://github.com/spartan-ng/spartan)
- [Angular Material vs. PrimeNG (Syncfusion)](https://www.syncfusion.com/blogs/post/angular-material-vs-primeng)
