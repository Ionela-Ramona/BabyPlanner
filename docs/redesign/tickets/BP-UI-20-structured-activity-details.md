# BP-UI-20 · (Optional, backend + frontend) Structured activity details

**Epic:** Backend (optional) · **Size:** M · **Depends on:** a product decision · **Blocks nothing in the redesign**

## Why
Parents already put structured data in free-text notes. The seed data shows it: "120 ml lapte praf", "Alaptat 15 minute", "A dormit 45 de minute", "Vitamina D, o picatura". Because it's text, the dashboard can only show counts and "last time", not the things parents actually ask: "how much did she eat today?" and "how long did she sleep?".

## Proposal (option A from `BabyPlannerDoc.docx`: one entity, optional fields)
- Domain `Activity`: add `AmountMl?` (Feeding), `DurationMinutes?` or `EndedAt?` (Sleep, breastfeeding), `DiaperKind?` (Wet / Dirty / Both). Add an EF migration, update the DTOs, and add FluentValidation rules (e.g. `AmountMl` 1–500, `EndedAt ≥ OccurredAt`).
- Frontend: extend the `Activity` model; the quick-log details mode shows the fields for the selected type (number with "ml", duration chips, diaper kind as three blocks); Azi tiles show totals ("540 ml azi", "Somn · 9 h 40 min"); an "Încă doarme" open sleep with a one-tap "S-a trezit".

## Acceptance criteria
- [ ] Existing activities stay valid (all new fields nullable). The migration runs on the dev DB and the seeder is updated.
- [ ] Unit and integration tests cover the new validation rules.
- [ ] The frontend shows totals only when the data exists, and never parses numbers out of notes.

## Decision needed
Do we want this now (it fits right after Etapa 6), or keep the model minimal until the redesign ships?
