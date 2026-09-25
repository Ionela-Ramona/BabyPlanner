# BP-UI-16 · Istoric: redesign of the Activități page

**Epic:** C. Screens · **Size:** M · **Depends on:** 09, 10, 11, 13, 14 (reuses timeline rows) · **Mode:** Operate · **Route (unchanged):** `/babies/:babyId/activities?type=`

## Goal
Keep what the current page does well (the URL-driven filter, `rxResource`, input binding, loading/error/empty branches), and fix the inverted hierarchy, the costly `<select>`, and the desktop dead space.

## Changes to `features/activities/activity-list`
- **Header**: "Istoric" + `app-avatar` and the baby's name (it replaces "Activități — Maria"). The back link becomes an `appButton` ghost with a back icon ("Toți bebelușii").
- **Filter**: `app-filter-chips` replaces the native `<select>`. `onTypeChange` and the URL logic stay exactly as they are.
- **Group by day**: `GET …/activities` returns everything (no date parameter), so group on the client with `dayHeader()` ("Azi", "Ieri", "joi, 18 septembrie"). Headers are sticky `h2`s styled as compact `app-ribbon`s, with a per-day summary ("3 mese · 2 scutece · 1 somn").
- **Rows**: the same row component as Azi. The time is the lead, the notes are primary text, and the badge is secondary. Rows sit in one `app-card` per day (a list inside), not one card per row, which roughly halves the visual noise.
- **Row tap** opens the edit sheet (BP-UI-15).
- **States**: skeleton rows, `app-error-state` (keeps "Reîncarcă"), and empty states in plain language (no "Etapa 6" copy).
- Width: follows the shell's ~45rem content width, so there is no stretched row on desktop.
- Migrate this page off `.card` and `.button`.

## Acceptance criteria
- [ ] All the page's current behaviors still work: deep link `?type=Feeding`, Back restores the filter, and an unknown `?type=xyz` is ignored.
- [ ] Day headers are real headings (screen reader users can jump by day).
- [ ] With 60+ seeded activities, scrolling stays smooth (use `@for` with `track`; add CDK virtual scroll only if measured slow).
- [ ] Screenshots at 390px and 1440px in both themes next to the baseline.
