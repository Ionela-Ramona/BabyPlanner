# BabyPlanner design system

> The built system, documented from the code (BP-UI-19). Source of truth for values: `frontend/baby-planner/src/styles/_tokens.scss`. Machine-readable copy: `.impeccable/design.json` (`npm run export:tokens`). Live reference: `/dev/components` in a dev build.
> Background: [PRODUCT.md](PRODUCT.md) · [Redesign plan](docs/redesign/REDESIGN_PLAN.md) · [ADR 0001](docs/adr/0001-ui-foundation.md) · [Audit report](docs/redesign/audit-report.md)

## 1. The world: baby-book paper

The app is a page of a baby book that a tired parent writes in at 3am, one-handed. Warm paper, cocoa ink, watercolor washes at the edges, caramel stitches, and activity types as painted wooden blocks. It comes from one reference illustration, [`docs/design/reference/little-moments.png`](docs/design/reference/little-moments.png).

- **Storybook lives in frames, not in data.** The script name, ribbons, bubbles and illustrations appear on Azi's greeting, the profile, empty states and the welcome page. Istoric, forms and the timeline stay clean and dense enough to scan.
- **No pure black, no pure white.** Every neutral is tinted warm.
- **Color is never the only signal.** An activity type is always icon + label + color.
- **Logging is two taps.** ＋ Adaugă, then a block. Everything else is optional.

## 2. Tokens

Use semantic tokens (`--color-*`, `--act-*`) in components. Family tokens (`--honey-*`, …) are for the token layer and for decoration. **No hex values outside `_tokens.scss`.**

### 2.1 Paper (day) and Night nursery

| Role | Token | Paper | Night |
|---|---|---|---|
| Page ground | `--paper-ground` → `--color-bg` | `#f9efe5` | `#2a221e` |
| Card | `--paper-card` → `--color-surface` | `#fbf5ed` | `#342a25` |
| Raised highlight | `--paper-highlight` → `--color-surface-raised` | `#fdfbf7` | `#3c312b` |
| Sunk well | `--paper-sunk` → `--color-surface-muted` | `#f3e7d9` | `#231c19` |
| Sand (ribbons) | `--paper-sand` | `#e8d3b9` | `#4a3d35` |
| Headings | `--ink-strong` → `--color-text-strong` | `#4a3727` | `#f5ebdd` |
| Body text | `--ink` → `--color-text` | `#4e4034` | `#efe3d3` |
| Muted text | `--ink-muted` → `--color-text-muted` | `#6e5b4a` | `#c2b09c` |
| Control boundary (≥ 3:1) | `--ink-line` → `--color-line` | `#927a63` | `#957f6d` |
| Hairline (decorative) | `--ink-hairline` → `--color-border` | `#e3d3bf` | `#4a3d35` |
| Stitch | `--caramel` → `--stitch-color` | `#b28b67` | `#a68664` |
| Focus ring | `--focus` → `--color-focus` | `#4f5c70` | `#b9c4d6` |
| Scrim | `--scrim` | cocoa 38% | cocoa 62% |

Five optional day backgrounds (Crem, Roz, Mentă, Bleu, Lavandă) replace only the five `--paper-*` surfaces through `[data-background]`. Ink stays the same, and `npm run check:contrast` verifies every palette. Night ignores them on purpose.

### 2.2 Pastel families: fill / soft / line / ink

Pastels alone fail WCAG, so each family has four steps. `fill` and `soft` are decoration, `line` is for control boundaries (≥ 3:1), and `ink` is for text and icons (≥ 4.5:1 on paper and on `soft`).

| Family | `-fill` | `-soft` | `-line` | `-ink` |
|---|---|---|---|---|
| Honey | `--honey-fill` `#e2b88a` | `--honey-soft` `#f3e1cd` | `--honey-line` `#a0733f` | `--honey-ink` `#7c5630` |
| Dusk | `--dusk-fill` `#a9b4c2` | `--dusk-soft` `#e1e0df` | `--dusk-line` `#727e90` | `--dusk-ink` `#525e72` |
| Sage | `--sage-fill` `#c1ae7e` | `--sage-soft` `#e8dec9` | `--sage-line` `#827c5c` | `--sage-ink` `#5b5b3f` |
| Blush | `--blush-fill` `#f0c0a8` | `--blush-soft` `#f7e4d7` | `--blush-line` `#a76f59` | `--blush-ink` `#8a5440` |
| Stone | `--stone-fill` `#d7cbbc` | `--stone-soft` `#efe8dd` | `--stone-line` `#847c72` | `--stone-ink` `#635c55` |

(Paper values shown. Night redefines all twenty, with `-ink` becoming the light accent.)

Status colors are aliases: success = sage, warning = honey, danger = blush, info = dusk (`--color-success-ink`, `--color-danger-line`, …).

### 2.3 Scale

| Group | Tokens |
|---|---|
| Space (4px base) | `--space-1` 0.25rem · `--space-2` 0.5 · `--space-3` 0.75 · `--space-4` 1 · `--space-5` 1.25 · `--space-6` 1.5 · `--space-8` 2 · `--space-10` 2.5 · `--space-12` 3 · `--space-16` 4rem |
| Radius | `--radius-sm` 0.5rem · `--radius-md` 0.75 · `--radius-lg` 1 · `--radius-xl` 1.5 · `--radius-pill` |
| Shadow (cocoa, never grey) | `--shadow-sm` · `--shadow-md` · `--shadow-lg`, built on `--shadow-rgb` |
| Tap targets | `--tap-min` 3rem (48px) · `--tap-lg` 3.5rem (logging actions) |
| Motion | `--dur-fast` 150ms · `--dur` 220ms · `--dur-slow` 320ms · `--ease-out` · `--ease-settle` (small overshoot) |
| Layers | `--z-base` · `--z-sticky` · `--z-nav` · `--z-overlay` · `--z-toast` · `--z-skip` |
| Layout | `--layout-max-width` 45rem (task pages) · `--layout-wide` 64rem (profile) · `--rail-width` 15rem · `--bottom-nav-height` 4.5rem |

## 3. Type

| Token | Face | Use |
|---|---|---|
| `--font-sans` | Nunito (variable, 400–800) | Everything by default: labels, data, buttons |
| `--font-display` | Mali 600 | Headings, wordmark "Baby", avatar initials, bubbles |
| `--font-script` | Dancing Script 600 | **Only** the wordmark "Planner", the baby's name and greetings. Never data, labels or buttons. ≥ 24px. |

- Fixed scale, ratio about 1.2, no `clamp()`: `--text-caption` 0.8125rem, `--text-small` 0.875, `--text-body` 1, `--text-lead` 1.125, `--text-h3` 1.1875, `--text-h2` 1.4375, `--text-h1` 1.75, `--text-display` 2.25, `--text-script` 2.5rem.
- Times use `.tabular-nums`, so the timeline's time column lines up.
- A heading that shows the name in script still contains the name as plain text (the `.script` class is styling only).
- Fonts are self-hosted subsets in `public/fonts/` (59.7 kB in total), declared in `styles/_fonts.scss`. Each face is split into a Latin file and a Romanian-diacritics file (ă ș ț) by `unicode-range`. Regenerate with `npm run subset:fonts`. Each stack includes a metric-matched fallback (`Nunito Fallback`, `Mali Fallback`, `Dancing Script Fallback`): Arial with `size-adjust` and ascent/descent overrides, so text doesn't reflow when the web font arrives. Re-measure them if a font changes.

## 4. Four borders, three gradients

Mixins live in `styles/_mixins.scss`. Do not invent a fifth border or a fourth gradient.

| Border | Built with | Where |
|---|---|---|
| **Stitch**: 1.5px dashed caramel, inset 7px | `app-stitch` (SVG `stroke-dasharray`: `--stitch-dash`, `--stitch-width`, `--stitch-inset`) | `app-card variant="stitched"`, frames, framed empty states. Decoration only. |
| **Rim**: 6px pale paper band + shadow | `@include rim` | Framed media (`app-frame`) |
| **Scallop**: lace edge | `@include scallop` / `app-edge` (CSS mask of radial gradients) | Top of the bottom nav and of sheets |
| **Baseline**: 1px dashed underline, solid 2px honey on focus | `@include baseline` | Form fields (`.field-control`) |

| Gradient | Built with | Where |
|---|---|---|
| **Paper wash** | `--wash-blush`, `--wash-sage`, `--wash-honey` radial washes on `body` | Page ground only |
| **Card lift** | `@include card-lift` (`--paper-highlight` → `--paper-card`) | `app-card` |
| **Honey button** | `@include honey-button` (`--honey-button-top/-mid/-bottom` + `--honey-button-highlight`) | Primary buttons, ＋ Adaugă. The darkest stop stays ≥ `#D9AA78` so cocoa text keeps 4.5:1. |

Banned: gradient text, glassmorphism, neon or high-chroma gradients, gradient borders on every card. Interactive controls always have a ≥ 3:1 boundary (a `-line` token). Stitches never count as one.

## 5. Activity color system

One map drives every type: `ACTIVITY_META` in `frontend/baby-planner/src/app/core/models/activity-type.ts`.

| Type (API) | Label | Tone (`data-tone`) | Family | Icon | Noun for counts |
|---|---|---|---|---|---|
| `Feeding` | Masă | `feeding` | honey | `feeding` (bottle) | masă / mese |
| `Sleep` | Somn | `sleep` | dusk | `sleep` (moon + star) | somn / somnuri |
| `Diaper` | Scutec | `diaper` | sage | `diaper` | scutec / scutece |
| `Medicine` | Medicamente | `medicine` | blush | `medicine` (dropper) | medicament / medicamente |
| `Other` | Altele | `other` | stone | `other` (heart-star) | activitate / activități |

Each entry also holds `notesPlaceholder` and `copy` (`noneToday`, `noneRecorded`, `add`, `logged`). These are full Romanian sentences, because gender changes the words ("Nicio masă", "Niciun somn"). Components set `[data-tone]`. `_surfaces.scss` maps a tone to `--act-<tone>-fill/-soft/-line/-ink`, and those become the local `--block-*` variables. Change a type's color in `--act-*`, never in a component.

### Structured details (BP-UI-20)

Activities can carry optional fields: `amountMl` (Masă), `durationMinutes` (Somn, Masă for breastfeeding), `diaperKind` (`Wet` / `Dirty` / `Both` → Ud / Murdar / Ud și murdar) and `inProgress` (a Somn that hasn't ended).

- **Show only what was measured.** Totals ("540 ml azi", "9 h 40 min azi") appear on a tile only when at least one activity has the field. Never "0 ml".
- **Never parse notes.** Numbers come only from fields. `detailsLabel()` and `durationLabel()` (`shared/utils/activity-details.ts`) format them, and rows read "120 ml · Lapte praf".
- **Only the fields that fit the type.** The sheet hides the rest and sends hidden fields as `null`, so switching Masă → Scutec can't leave "120 ml" on a diaper.
- **A sleep is started, then ended.** The 2-tap Somn creates an `inProgress` sleep. Azi shows the "Încă doarme · S-a trezit" banner (fed by `/activities/ongoing`, so a sleep from before midnight still shows). `ActivityLog.wake()` sets the duration to the time slept, between 1 minute and 24 h.

**Adding a type** needs only the backend enum value, an `ACTIVITY_META` entry (the compiler insists) and an icon. This was dry-run with a "Baie" type: the build and all tests passed with no other change. Steps are in the [frontend README](frontend/baby-planner/README.md#adding-an-activity-type).

## 6. Components

All are standalone, selector prefix `app`, signal `input()` / `output()` / `model()`. They are presentational: pages own data and services.

| Component | Use it for |
|---|---|
| `app-card` (`plain` · `stitched` · `tinted` + `tone`, `padding`) | Every raised surface. Wrap in `<li>`/`<section>` for semantics. |
| `app-frame` (cloud, circle, …) | The profile hero and initials frames (rim + stitch) |
| `app-ribbon` (`size`, `decorated`) | Day headers ("Azi · vineri, 2 octombrie"), section labels |
| `app-bubble` | Decorative affirmations on the profile and in empty states |
| `app-divider` | Stitched divider with a label (part-of-day groups on Azi) |
| `app-edge`, `app-stitch` | The scallop and stitch primitives used by the others |
| `appButton` directive (`primary` · `secondary` · `ghost` · `danger`, `size`, `block`, `loading`) | Every `<button>` and link-as-button |
| `app-icon-button`, `app-add-button` | Icon-only actions (with an accessible label); the raised honey ＋ block |
| `app-icon` (`name`, `size`, `label`) | Sprite icons. Decorative unless given a `label`. |
| `app-field` + `appFieldControl` | Label + native control + hint/error, with `aria-describedby` / `aria-invalid` wired for you. Use with Signal Forms `[formField]`. |
| `app-activity-picker` | The five blocks (Angular Aria listbox, explicit selection). `picked` fires only on activation. |
| `app-filter-chips` | "Toate" + types (Aria listbox, follow focus). Bind to the URL `?type=`. |
| `app-activity-badge`, `app-activity-row` | Type badge; a timeline row (time first, notes as primary text, whole row is one button → edit) |
| `app-avatar`, `app-wordmark` | Initials on a tone; the two-voice logo |
| `app-empty-state` (`illustration`, `headingLevel`, `framed`), `app-error-state` (`retry`) | Every empty/error branch. Illustrations are inline SVG from `empty-state/illustrations.ts` (so an empty page doesn't wait for an image); add a new one there. |
| `app-skeleton` (`text` · `row` · `tile`) | Loading, shaped like what will arrive. When data that arrives later would insert something *above* content already on screen (Azi's sleep banner), show one loading block and swap everything in a single frame instead. |
| `await SheetService.open()` + `app-sheet-header` (`titleId`) / `app-sheet-footer` | Bottom sheet on phones, centered panel from 48rem. Pass `ariaLabelledBy` = the header's `titleId`. `open()` is async: the CDK dialog code loads on first use, and the shell prefetches it once the page has settled. |
| `ConfirmService` | Only for what cannot be undone (deleting a baby, which cascades). Everything else uses undo. |
| `ToastService` (+ `app-toast-outlet` in the shell) | One toast at a time, announced politely, never steals focus; `action` / `secondaryAction` ("Anulează", "Adaugă detalii") |

App services: `ActiveBaby` (remembered active baby; routes with `:babyId` win), `Clock` (`now` ticks every minute; never call `new Date()` for "now"), `ActivityLog` (mutations; notifies `ActivityChanges` so Azi and Istoric reload), `QuickLogLauncher` (opens the quick-log sheet in `quick` / `details` / `edit` mode), `ThemeService` (Sistem / Luminos / Noapte + background, sets `data-theme`, `data-background` and `theme-color`). Romanian helpers live in `shared/utils/ro-time.ts`: `ageLabel`, `relativeLabel`, `countLabel` (with the "20 de mese" rule), `partOfDay`, `dayHeader`.

## 7. Do and don't

| Do | Don't |
|---|---|
| Put the real information first: "120 ml lapte praf", with the type as a small badge | Make the type pill the loudest thing in a row |
| Say "6 luni"; show the birth date second | Show only "Data nașterii: 24 martie 2026" |
| Save first, offer "Anulează" in a toast | Ask "Ești sigur?" before a reversible action |
| Use `--act-feeding-ink` for a Masă icon on paper | Use `--honey-fill` (or any `-fill`) for text |
| Use the script for the baby's name | Use the script for a label, number or button |
| Keep data visible and dimmed while it refreshes | Blank the page to a spinner on every reload |
| Write plain Romanian copy for parents | Leave developer copy ("Etapa 6", "În construcție") in the UI |
| Give every control a visible label and ≥ 48px target | Rely on a placeholder as the only label |

## 8. Night nursery rules

- The ground is warm cocoa `#2a221e`, never black. Text is cream (`--ink` `#efe3d3`, 12:1+).
- Pastels become **accents** (icons, lines, ink), not surfaces. Block fills are dimmed (`--honey-fill` `#5a493b`).
- Nothing flashes: the scrim is dim cocoa (`--scrim`), washes drop to ≤ 6%, the honey button is muted, and shadows use `--shadow-rgb` 12 8 6.
- Background palettes don't apply at night.
- The theme is set before Angular boots (inline script in `index.html`), so there is no wrong-theme flash. `meta[name=theme-color]` follows the resolved theme.

## 9. Motion

150–250ms, for state changes only: sheet in/out (`--dur`, slides up on phones, scales from 0.96 on desktop), toast, chip selection, a new row settling into the timeline (`--ease-settle`). One delight: the Somn tile's block "breathes" once after a sleep is logged. Everything is reduced to instant under `prefers-reduced-motion` (global rule in `_base.scss`).

## 10. Accessibility contract

- Zero axe violations on every route, in both themes, at 320, 390 and 1440px ([audit report](docs/redesign/audit-report.md)). Component specs call `expectNoAxeViolations(fixture)`.
- Skip link → top bar → main → nav. After each navigation, focus moves to the page `<h1>`.
- Sheets trap focus and return it to the opener. The quick-log sheet moves focus to the first block when switching to "Cu detalii".
- Every token pair is contrast-checked by `npm run check:contrast`. Forced-colors mode keeps control boundaries (stitches may disappear).
