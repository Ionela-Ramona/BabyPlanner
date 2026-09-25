# BabyPlanner — Frontend Redesign Plan

> Status: proposed · Updated: 2026-09-25 · Branch baseline: `feature/domain-entities` (e7f807b)
> Scope: `frontend/baby-planner` (Angular 22) · Product context: [`PRODUCT.md`](../../PRODUCT.md) · Tickets: [`tickets/`](tickets/)

## 1. Summary

The app on `feature/domain-entities` works and is well-engineered: shell, navigation, a typed API layer, the **Bebeluși** list, the **Activități** list with a type filter, and accessibility basics. But its look is a generic SaaS starter (white header, purple accent, system font, 🍼 emoji logo). It has nothing of the warmth the product needs, and its most important screens are not built yet: the **Today dashboard** is a placeholder, and there is **no way to log an activity** from the UI.

This plan **redesigns the existing app** into the visual world of the reference illustration ("Little Moments", a watercolor baby-book page). It keeps everything that is already right in the code, and it builds the missing screens (Etapa 5 dashboard, Etapa 6 forms) **directly in the new design** so nothing is built twice.

Decisions confirmed with the user:

| Decision | Choice |
|---|---|
| What to redesign | The current app on `feature/domain-entities` |
| Primary device | Phone, one-handed, mobile-first. Desktop adapts. |
| UI language | Romanian (already the case in code) |
| Component foundation | Researched (§6). Recommended: **Angular Aria + Angular CDK + our own design tokens** |
| Look | Professional, with refined borders and gradients, in the reference image's world |
| Illustrations | Only the reference image exists. Use SVG placeholders, then a ticket to source a matching set. |
| Tickets | Markdown in `docs/redesign/tickets/` |

## 2. The current design (baseline)

Evidence: the screenshots in `.playwright-mcp/` (captured 2026-09-25, desktop ~1036px) and the source code. Phone-width baseline screenshots are captured in BP-UI-01. They couldn't be taken during planning because this machine's shell has Node v22.17.0 (Angular CLI 22 needs ≥ 22.22.3) and no .NET 8 runtime.

| Route | Screen | State today |
|---|---|---|
| `/dashboard` | Dashboard | Placeholder card "În construcție" |
| `/babies` | Bebeluși | List of cards: name, "Data nașterii: 25 martie 2026", and a "Vezi activitățile" ghost button |
| `/babies/:babyId/activities` | Activități — Maria | Back link, native `<select>` type filter (kept in the URL), and one card per activity: colored type pill + "25 septembrie, 16:04" + notes |
| `**` | Pagina nu există | Card with a link back |

**Current tokens** (`src/styles.scss`): bg `#faf8f6`, surface `#fff`, text `#1f1d29`, primary `#5b53d3` (violet), system font stack (Segoe UI), 4px spacing scale, radii 6/10/16, and a cool purple-black dark theme via `prefers-color-scheme`. Activity pills use HSL hues (green, violet, orange, pink, blue) that are unrelated to any palette.

## 3. Audit of the current design

### 3.1 Design critique (what the user sees)

| # | Issue | Evidence | Impact | Fixed in |
|---|---|---|---|---|
| 1 | **No identity.** The violet accent and white chrome could belong to any admin tool. The 🍼 emoji logo renders differently on every OS (a 3D bottle on Windows). | header, `styles.scss` | The product feels like a template, not a keepsake | 03, 04, 05, 11 |
| 2 | **The core job is impossible.** There is no way to add or edit an activity or a baby. | no forms (Etapa 6) | Parents can't log | 15, 17 |
| 3 | **The most important screen doesn't exist.** The dashboard is a placeholder. | `/dashboard` | No "what happened today" view | 14 |
| 4 | **Hierarchy is inverted on Activități.** The type pill is the loudest element, the date repeats on every row, and the useful information ("120 ml lapte praf", "A dormit 45 de minute") is small muted grey. | activities screenshot | Slow to scan | 16 |
| 5 | **Filter costs too much.** A native `<select>` means tap → OS picker → choose, and the options are hidden. | activity list | Chips show all five types at once and double as a legend | 09, 16 |
| 6 | **Desktop dead space.** Rows stretch to about 1000px while the content uses the left third. | activities screenshot | Looks unfinished | 11, 16 |
| 7 | **No thumb reach on phones.** The top-right text nav wraps and centers under 30rem. There is no bottom navigation and no primary action. | `app.scss` | Awkward one-handed | 11 |
| 8 | **Babies show a date, not an age.** Parents think in "6 luni", not "25 martie 2026". The only action is "Vezi activitățile". | babies screenshot | Missed warmth and usefulness | 13, 17 |
| 9 | **States are plain text.** Loading is "Se încarcă…". Empty-state copy talks to developers ("Formularul de adăugare se construiește în Etapa 6"). | list templates | Feels unfinished | 10, 16, 17 |
| 10 | **Permanent developer footer.** "Proiect de învățare — .NET 8 Web API + Angular 22" sits on every page and takes phone space. | `app.html` | Noise | 11 |
| 11 | **Dark theme is cool purple-black** and follows the system only (no toggle). | `styles.scss` | Not kind at night, which is the main usage scene | 03, 11 |
| 12 | **Fluid `h1`** (`clamp`) in product UI; the headings otherwise have no personality. | `styles.scss` | Inconsistent sizes | 04 |

### 3.2 What is already right (keep it)

- Accessibility base: skip link, `aria-current="page"` on nav, `role="status"` / `role="alert"` on async states, `.visually-hidden`, a global `:focus-visible` ring, and `prefers-reduced-motion` handling.
- Architecture: lazy feature routes; `rxResource` for data; route and query params bound to `input()`s (`withComponentInputBinding`); **the filter lives in the URL**; typed `BabyApi` / `ActivityApi` (`@Service()`); `ProblemDetails` / `ValidationProblemDetails` models with `isValidationProblem`; `ACTIVITY_TYPES` + `ACTIVITY_TYPE_LABELS`; Romanian locale registered.
- Token-based global CSS with semantic names (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`). **We keep the names and change the values**, so existing pages restyle the moment BP-UI-03 lands.
- Conventions: Romanian explanatory comments (learning project), no `standalone: true`, no explicit `OnPush`, native control flow.

### 3.3 Technical findings

| Sev | Finding | Fix |
|---|---|---|
| P1 | The 1.15 MB reference image is untracked in `public/`, so it would ship in every build. | BP-UI-01 |
| P1 | Dev environment drift: Node v22.17.0 is too old for Angular CLI 22, and the .NET 8 runtime is missing on this machine (only 10.0.12 is installed). | BP-UI-01 (README: required versions) |
| P2 | Global `.card` / `.button` / `.button--ghost` utility classes will conflict with the component kit. | BP-UI-06/07 (alias, then remove) |
| P2 | `index.html` has no `theme-color`, description, or touch icon, and uses the default favicon. | BP-UI-01, 05 |
| P2 | Route changes don't move focus to the new page's heading. | BP-UI-11 |
| P3 | No lint and no automated axe checks. | BP-UI-18 |

## 4. What we extracted from the reference image

Source: `frontend/baby-planner/public/image.png` (1200×1200). BP-UI-01 moves it to `docs/design/reference/little-moments.png`.

### 4.1 Palette (sampled from the pixels)

| Role | Sampled from | Hex |
|---|---|---|
| Ground (paper) | page background | `#F9EFE5` |
| Card / raised paper | info card, frame rim | `#FBF5ED` |
| Highlight | brightest paper | `#FDFBF7` |
| Cocoa ink (headings) | "Little" lettering | `#574129` |
| Cocoa ink (body/labels) | "Date:" labels | `#4E4034` |
| Caramel (script, stitches) | "Greatest Adventure", dashed frame | `#B28B67` / `#B39473` |
| Honey | teddy bear, stars, blocks | `#E2B88A` (deep `#C1915E`) |
| Blush | hearts, "Moments", bunting | `#F0C0A8` (script `#E1AD94`) |
| Sage / olive | balloon, bunting | `#C1AE7E` / `#B8AB8F` |
| Stone | grey bunting | `#D7CBBC` |
| Sand | ribbon banner, scallop edge | `#E8D3B9` |

There is no pure black and no pure white. Every neutral is tinted warm.

### 4.2 Contrast reality check (WCAG AA)

- Cocoa `#4E4034` on card: **9.2:1**. This is the text color.
- Caramel script `#B28B67` on card: **2.86:1**. It is decorative only; large script uses the darker caramel ink.
- Blush `#E1AD94` on card: **1.83:1**. Never use it for text.
- Cocoa text **on** pastel fills passes everywhere: honey 5.44, blush 6.08, sage 4.57, dusk 4.74, stone 6.25, sand 6.86. It fails on honey-deep (3.55), so the darkest stop of the button gradient must stay ≥ `#D9AA78`.

Hue-preserving **line** (control borders, ≥3:1) and **ink** (text/icons, ≥4.5:1) tokens, mixed toward a same-hue dark:

| Family | Fill (decorative) | Line (≥3:1) | Ink (≥4.5:1) |
|---|---|---|---|
| Honey | `#E2B88A` | `#B38553` | `#92693B` |
| Blush | `#F0C0A8` | `#B9816B` | `#9D624E` |
| Sage | `#C1AE7E` | `#958F72` | `#727354` |
| Stone | `#D7CBBC` | `#958D82` | `#777068` |
| Dusk *(extension)* | `#A9B4C2` | `#838F9F` | `#657184` |

Dusk is the one added color: Sleep needs a hue that separates clearly from sand and stone. It keeps the image's low chroma.

### 4.3 Design principles found in the image

| # | What the image does | Principle | Where it shows up |
|---|---|---|---|
| 1 | Scalloped "cloud" photo frame with a dashed stitch inside a pale rim | **Stitched frames** | Baby avatar/initials frame; profile hero; empty-state vignettes |
| 2 | Rounded info card, slightly lighter paper, soft shadow | **Paper layering**: depth from tone and a warm shadow, not hard borders | `app-card` replaces `.card` |
| 3 | "Date: ……", "Age: ……" rows with a small icon and a dashed baseline | **Baby-book fields** | Forms (Etapa 6), the profile fact card, activity details |
| 4 | "Little" (rounded print) + "Moments" (script) | **Two-voice type** | Wordmark (replaces 🍼), the baby's name, greetings. Never data, labels or buttons. |
| 5 | Ribbon "♡ Big Memories ♡" | **Ribbon labels** | Day headers ("Azi · joi, 25 septembrie"), section labels |
| 6 | Cloud speech bubble with stitch | **Affirmation bubbles** | Empty states, confirmations |
| 7 | Wooden blocks with heart/star/rainbow | **Object tiles** | Activity type picker = "blocks" |
| 8 | Bunting, balloon, confetti dots, tiny stars | **Sparse celebration** | Background texture at the edges; bunting only for milestones |
| 9 | Scalloped lace edge along the bottom | **Soft terminators** | Top edge of the bottom nav and bottom sheets |
| 10 | Watercolor washes, no hard edges | **Wash gradients** | Page ground, card tint, primary button |
| 11 | Big frame left, info column right | **One hero, one column** | Profile: stacked on mobile, two columns on desktop |

### 4.4 Borders and gradients (the "professional" layer)

**Four borders, no more.**
1. **Stitch**: a 1.5px dashed caramel line inset 6–8px inside a container, drawn with an SVG stroke (`stroke-dasharray` 6 4, round caps) so dashes are identical in every browser.
2. **Rim**: a 6px pale paper band around framed media, plus a soft shadow.
3. **Scallop**: a CSS `mask` of repeating radial gradients (not a many-point `clip-path`).
4. **Baseline**: a 1px dashed underline under field values, which becomes a solid 2px honey line on focus.

Interactive controls always have a ≥3:1 boundary (the *line* tokens). Stitches are decoration only.

**Three gradients, all low contrast.**
1. **Paper wash** (page ground): cream with soft blush (top-right) and sage (bottom-left) radial washes at 20–35% alpha.
2. **Card lift**: `#FDFBF7 → #FBF5ED`, top to bottom.
3. **Honey button**: vertical honey gradient with a 1px inner highlight; the darkest stop ≥ `#D9AA78`.

Bans: gradient text, glassmorphism, neon or high-chroma gradients, gradient borders on every card.

### 4.5 Type
- **UI face**: one rounded humanist sans with full Romanian diacritics, replacing the Segoe UI stack. Candidates: *Nunito*, *Mali*, *Delius*, matched against the "Little" / "Date:" lettering.
- **Accent script**: a monoline brush script, ≥24px, only for the wordmark, the baby's name and greetings. Candidates are ranked with `impeccable font-match` against the "Moments" crop.
- Fixed `rem` scale with a 1.2 ratio (the fluid `h1` is removed). Tabular numbers for times.

### 4.6 Activity color system

The existing HSL pills are replaced. Type is always **icon + label + color**.

| Type | Label (existing) | Family | Icon |
|---|---|---|---|
| Feeding | Masă | Honey | bottle |
| Sleep | Somn | Dusk | crescent moon + star |
| Diaper | Scutec | Sage | diaper / safety pin |
| Medicine | Medicamente | Blush | dropper |
| Other | Altele | Stone | heart-star |

`ACTIVITY_TYPE_LABELS` grows into an `ACTIVITY_META` map (label, icon, tone) in `core/models/activity-type.ts`.

### 4.7 Night nursery theme

This replaces the current cool dark theme. The ground is warm cocoa `#2B2320`, text is cream `#EFE3D3` (12.2:1), and the pastels become accents (honey 8.4:1, blush 9.4:1, sage 7.1:1). There is no pure black and the stars stay dim. It follows `prefers-color-scheme` plus a remembered manual toggle.

## 5. Information architecture (existing URLs kept)

We keep the current URLs, because they mirror the API (`/babies/:babyId/activities` ↔ `/api/babies/{babyId}/activities`) and existing links keep working. We add what's missing.

| Route | Screen (new name in nav) | Status |
|---|---|---|
| `/dashboard` | **Azi**: today for the active baby | Placeholder → built (BP-UI-14) |
| `/babies/:babyId/activities` | **Istoric**: all activities, grouped by day, filter chips | Exists → redesigned (BP-UI-16) |
| `/babies` | **Bebeluși**: list, cards with age | Exists → redesigned (BP-UI-17) |
| `/babies/:babyId` | Baby profile, the "Little Moments" card | New (BP-UI-17) |
| `/babies/new`, `/babies/:babyId/edit` | Baby form | New, Etapa 6 (BP-UI-17) |
| Quick-log / edit activity | Bottom sheet (no route) | New, Etapa 6 (BP-UI-15) |
| `/welcome` | First run when there are no babies | New (BP-UI-17) |
| `**` | Pagina nu există | Exists → restyled (BP-UI-11) |
| `/dev/components` | Component showcase (dev only) | New (BP-UI-12) |

**Mobile shell**: a top bar with the wordmark, the active baby (switcher when there's more than one) and a theme toggle. The bottom nav (scalloped top edge) has **Azi · ＋ Adaugă · Istoric · Bebeluși**. **Desktop (≥1024px)**: a left rail with the same items.

The **active baby** is new app state (BP-UI-13). "Azi" and "Istoric" follow it, and it is remembered between visits. With one baby, this is invisible.

**Quick-log target: 2 taps.** Tap ＋ Adaugă, tap a type block, and it is saved as "acum". Time and notes are optional, in the same sheet.

## 6. Component library research and recommendation

The user asked which library performs best for a professional look with refined borders and gradients. There is no UI library installed today (`package.json` has only Angular core packages), so nothing needs migrating away from.

| Option | Styling model | Fit | Notes |
|---|---|---|---|
| **Angular Aria** (`@angular/aria`) | Headless: behavior + ARIA + keyboard | **Best** | Official Angular package, **stable since Angular 22 (June 2026)**. Listbox, select, combobox, menu, tabs, toolbar, accordion, tree, grid. Same release train as Angular. |
| **Angular CDK** | Headless utilities | Best, alongside Aria | Dialog/bottom sheet, Overlay, FocusTrap, LiveAnnouncer, BreakpointObserver |
| Spartan/ui | Headless brain + copy-paste shadcn styles | Good (fallback) | 1.0 stable, 55+ components; needs Tailwind; the default look is shadcn |
| Angular Material | Styled (Material 3) | Poor | Strong a11y, but the Material shape language fights stitches and scallops |
| PrimeNG | Styled or unstyled, 80+ components | Poor to OK | Built for data-heavy enterprise UIs; harder to customize; reported grid performance issues |
| Taiga UI | Full design system | Poor | Strong own identity; smaller community |

**Recommendation: Angular Aria + Angular CDK + our own SCSS tokens.**
- **Performance**: it ships only the behavior we import and no theme CSS, which fits the 500 kB initial and 4 kB per-component style budgets.
- **Look**: every border, gradient and radius comes from our tokens, so the baby-book world isn't fighting a library skin. That consistency is what reads as professional.
- **Accessibility**: keyboard and ARIA behavior come from the Angular team, which supports the AXE + WCAG AA project rule and the accessibility work already in the code.
- **Learning**: you see how accessible components work instead of hiding it.
- **Native where it wins**: date and time use native `<input type="date|datetime-local">`, styled. Phone pickers are the best one-handed option.

Decision recorded in [ADR 0001](../adr/0001-ui-foundation.md).

Sources: [Angular 22: The Evolution of Modern Angular (Telerik)](https://www.telerik.com/blogs/angular-22-evolution-modern-angular) · [Angular Aria in Angular 21 (DEV)](https://dev.to/hassantayyab/angular-aria-in-angular-21-the-future-of-accessible-headless-ui-components-26di) · [spartan-ng on GitHub](https://github.com/spartan-ng/spartan) · [Choosing an Angular Component Library in 2026 (Syncfusion)](https://www.syncfusion.com/blogs/post/angular-component-libraries-in-2026) · [Angular Material or PrimeNG? (Syncfusion)](https://www.syncfusion.com/blogs/post/angular-material-vs-primeng)

## 7. UI code architecture (extends the existing structure)

```
src/
├── styles.scss                 # entry; @use the partials below (was: everything inline)
├── styles/
│   ├── _tokens.scss            # existing --color-/--space-/--radius-/--shadow- names, new values + new tokens
│   ├── _themes.scss            # Paper (light) + Night nursery; prefers-color-scheme + [data-theme]
│   ├── _typography.scss
│   ├── _surfaces.scss          # stitch / rim / scallop / baseline + the three gradients
│   └── _legacy.scss            # .card / .button aliases during migration, deleted in BP-UI-18
├── assets/icons/ , assets/illustrations/
└── app/
    ├── core/models/            # existing: baby, activity, activity-type (+ ACTIVITY_META), problem-details
    ├── core/services/          # existing: BabyApi, ActivityApi (+ ActiveBaby, Theme, Clock)
    ├── shared/components/      # existing nav-bar + the new kit (app-card, app-frame, app-sheet, ...)
    ├── shared/utils/           # Romanian age / relative time / plural helpers
    └── features/
        ├── dashboard/ (Azi)  ├── activities/ (Istoric + activity sheet)  ├── babies/ (list, profile, form)
        ├── welcome/  ├── not-found/  └── dev-showcase/
```

Rules: keep the `app-` selector prefix and the existing folder names. Smart pages use services; `shared/components` are presentational (`input()` / `output()` / `model()`). No raw hex values outside `_tokens.scss`. Keep Romanian "why" comments.

## 8. Migration strategy (why this order)

1. **Re-skin first, at the token level (BP-UI-03/04).** Change the *values* of the existing tokens, so Bebeluși, Activități and Not-found immediately take on the new look with no template changes. This is the quickest visible win and a safe checkpoint.
2. **Build the kit (06–12)** and migrate the two existing pages off the global `.card` / `.button` classes onto components.
3. **Build Etapa 5 and 6 in the new design (14, 15, 17)** instead of building them old-style first. No double work.
4. **Remove legacy aliases, audit, and document (18, 19).**

## 9. Phases and tickets

| Phase | Tickets | Outcome |
|---|---|---|
| **A. Foundation** | [01](tickets/BP-UI-01-baseline-and-hygiene.md) baseline & hygiene · [02](tickets/BP-UI-02-ui-foundation-adr.md) Aria/CDK ADR · [03](tickets/BP-UI-03-design-tokens-and-themes.md) tokens & themes · [04](tickets/BP-UI-04-typography.md) typography · [05](tickets/BP-UI-05-icons-and-illustrations.md) icons & illustrations | Existing pages already wear the new world, in both themes |
| **B. Reusable components** | [06](tickets/BP-UI-06-surface-primitives.md) surfaces · [07](tickets/BP-UI-07-buttons.md) buttons · [08](tickets/BP-UI-08-form-fields.md) form fields · [09](tickets/BP-UI-09-activity-picker-chips-badges.md) picker/chips/badges · [10](tickets/BP-UI-10-overlays-and-feedback.md) overlays & feedback · [11](tickets/BP-UI-11-app-shell-navigation.md) app shell · [12](tickets/BP-UI-12-component-showcase.md) showcase | A tested kit, reviewable at `/dev/components` |
| **C. Screens** | [13](tickets/BP-UI-13-active-baby-and-today-state.md) active baby & state · [14](tickets/BP-UI-14-today-dashboard.md) Azi (Etapa 5) · [15](tickets/BP-UI-15-quick-log-flow.md) quick-log (Etapa 6) · [16](tickets/BP-UI-16-history.md) Istoric (redesign) · [17](tickets/BP-UI-17-babies-profile-onboarding.md) Bebeluși, profile, form (Etapa 6) | The full app on the real API |
| **D. Quality & docs** | [18](tickets/BP-UI-18-quality-gate.md) a11y/perf/motion gate · [19](tickets/BP-UI-19-design-md-and-finish-review.md) DESIGN.md + finish review | Audited, documented, shippable |
| **Backend (optional)** | [20](tickets/BP-UI-20-structured-activity-details.md) structured activity details | Unlocks totals (ml, sleep duration) |

Order: 01 → 02 → 03 → 04/05 → 06–10 → 11 → 12. Ticket 13 can run in parallel with phase B. 14–17 need 11 and 13. Then 18 → 19. Ticket 20 is independent and needs a product decision first.

## 10. How each ticket is verified

- Vitest unit tests with accessible queries (role/label). The existing `*.spec.ts` keep passing or are updated in the same ticket.
- AXE has no violations (tooling in BP-UI-18). Every new token pair gets a contrast check.
- Screenshots at 390px and 1440px in **both** themes, compared with the baseline from BP-UI-01.
- `impeccable detect --json` on the changed files, once per ticket.
- Reduced motion, 200% zoom and the keyboard-only path are checked.

## 11. Risks and open questions

- **Data is thin.** Activities have only type, time and notes, so the dashboard can show counts and "last time" but not ml totals or sleep duration. BP-UI-20 proposes the backend change (option A from `BabyPlannerDoc.docx`); the redesign does not depend on it.
- **Illustration quality**: SVG placeholders won't match watercolor art. BP-UI-05 part 2 budgets proper sourcing. Until then, keep texture sparse.
- **Cute vs. professional**: the storybook world lives in frames, headers, empty states and the profile. Istoric, forms and the timeline stay clean and dense enough to scan.
- **Stage plan alignment**: Etapa 5/6 in `BabyPlannerDoc.docx` become tickets 14/15/17. JWT (Etapa 7) will need a login screen later, using the same kit.
