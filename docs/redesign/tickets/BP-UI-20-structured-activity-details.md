# BP-UI-20 · (Optional, backend + frontend) Structured activity details

**Epic:** Backend (optional) · **Size:** M · **Depends on:** a product decision · **Blocks nothing in the redesign**

## Why
Parents already put structured data in free-text notes. The seed data shows it: "120 ml lapte praf", "Alaptat 15 minute", "A dormit 45 de minute", "Vitamina D, o picatura". Because it's text, the dashboard can only show counts and "last time", not the things parents actually ask: "how much did she eat today?" and "how long did she sleep?".

## Proposal (option A from `BabyPlannerDoc.docx`: one entity, optional fields)
- Domain `Activity`: add `AmountMl?` (Feeding), `DurationMinutes?` or `EndedAt?` (Sleep, breastfeeding), `DiaperKind?` (Wet / Dirty / Both). Add an EF migration, update the DTOs, and add FluentValidation rules (e.g. `AmountMl` 1–500, `EndedAt ≥ OccurredAt`).
- Frontend: extend the `Activity` model; the quick-log details mode shows the fields for the selected type (number with "ml", duration chips, diaper kind as three blocks); Azi tiles show totals ("540 ml azi", "Somn · 9 h 40 min"); an "Încă doarme" open sleep with a one-tap "S-a trezit".

## Acceptance criteria
- [x] Existing activities stay valid (all new fields nullable). The migration runs on the dev DB and the seeder is updated.
- [x] Unit and integration tests cover the new validation rules.
- [x] The frontend shows totals only when the data exists, and never parses numbers out of notes.

## Decision needed
Do we want this now (it fits right after Etapa 6), or keep the model minimal until the redesign ships?

**Decided 2026-10-02: now.**

## Outcome (2026-10-02)

All three acceptance criteria are met:
- **Model:** the new fields are `AmountMl?`, `DurationMinutes?`, `DiaperKind?` (`Wet` / `Dirty` / `Both`) and `InProgress` (bool, default `false`). All are nullable or defaulted, so existing rows stay valid. Migration `AddStructuredActivityDetails` is applied to the dev DB. The seeder now writes structured values plus one sleep in progress (on a fresh database only).
- **Duration, not `EndedAt`:** duration chips and totals are simpler with minutes. An open sleep needs an explicit `InProgress` flag either way: old sleeps have no duration but aren't "still sleeping", so "duration is missing" can't mean "ongoing".
- **Validation** (`ActivityRules`, shared by create and update): `AmountMl` 1–500, Feeding only. `DurationMinutes` 1–1440, Sleep or Feeding, never while in progress. `DiaperKind` must be a valid value, Diaper only. `InProgress` is Sleep only. A detail on the wrong type is rejected, not silently dropped.
- **API:** `GET /api/babies/{id}/activities/ongoing` returns in-progress activities from any day. A sleep started at 22:00 is no longer in `/today` at 02:00, but the parent still needs to end it.
- **Tests:** 18 unit tests (validators) and 6 integration tests (`WebApplicationFactory` + in-memory SQLite with the real migrations). These are the first backend tests in the repository.
- **Frontend:**
  - The details form shows only the fields for the chosen type: ml + minutes (with 10/15/20 chips) for Masă, minutes (30 min…2 h chips) or "Încă doarme" for Somn, Ud / Murdar / Ud și murdar for Scutec. Hidden fields are sent as `null`.
  - The 2-tap Somn now *starts* a sleep in progress. Azi shows a "Încă doarme · de 1 h 10 min · S-a trezit" banner; waking computes the duration and offers "Anulează".
  - Tiles show "540 ml azi" / "9 h 40 min azi" only when values exist. Rows read "120 ml · Lapte praf".
  - Totals come only from the fields; a test checks that "200 ml" in notes is never counted.
