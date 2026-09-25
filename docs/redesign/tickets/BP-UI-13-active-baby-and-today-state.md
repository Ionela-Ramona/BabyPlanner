# BP-UI-13 · Active baby, today state, and Romanian time/age helpers

**Epic:** C. Screens · **Size:** M · **Depends on:** 01 (can run in parallel with phase B)

## Goal
The redesign needs app-level state that doesn't exist yet: **which baby is active**, and derived values like "last feed 2 h ago". It builds on the existing `BabyApi` / `ActivityApi`. No mock backend is needed, because the real API and seeder exist.

## Scope
- **`ActiveBaby`** (`@Service()`, signals): loads babies via `BabyApi.getAll()` (an `rxResource`), and holds the active baby id (remembered in `localStorage` inside try/catch; it falls back to the first baby). It exposes `babies`, `activeBaby` and `hasBabies`, plus `select(id)`. When the URL contains `:babyId` (Istoric, profile), the route wins and updates the active baby.
- **`Clock`** (`@Service()`): a `now` signal that ticks every 60s. Tests inject a fake clock (project rule: don't assume `new Date()`).
- **`shared/utils/ro-time.ts`**, all pure functions and all tested:
  - `ageLabel(dateOfBirth, today)` → "3 zile", "2 săptămâni", "6 luni", "1 an și 2 luni". Parse `YYYY-MM-DD` as a calendar date, never through `new Date(string)` in UTC.
  - `relativeLabel(instant, now)` → "acum", "acum 5 minute", "acum 2 ore". Use `Intl.RelativeTimeFormat('ro')`.
  - `countLabel(n, 'masă' | …)` using `Intl.PluralRules('ro')`, including the Romanian **"de"** rule for 20+ ("1 masă", "3 mese", "20 de mese"). Seed notes already use this form ("45 de minute").
  - `partOfDay(instant)` → "Noaptea" / "Dimineața" / "După-amiaza" / "Seara" for timeline grouping.
  - `dayHeader(instant, today)` → "Azi", "Ieri", "joi, 18 septembrie".
- **`TodayActivities`** (feature-level service or page-local `rxResource`): `ActivityApi.getToday(activeBabyId, type)` plus computed `lastOf(type)` and `countOf(type)`.
- Optimistic create/update/delete helpers with rollback, used by BP-UI-15.

## Acceptance criteria
- [ ] Unit tests for `ageLabel` across month and year boundaries, born today, and 29 Feb. `countLabel` is tested for 1, 2, 19, 20, 21, 101 and 120.
- [ ] Switching the active baby reloads Azi and Istoric without a page reload.
- [ ] No component calls `HttpClient` directly (the existing rule).
