# BP-UI-17 · Bebeluși: list redesign, "Little Moments" profile, baby form (Etapa 6), first run

**Epic:** C. Screens · **Size:** L · **Depends on:** 06, 08, 10, 11, 13 · **Mode:** Read (profile), Operate (list, form) · **API:** `/api/babies` CRUD

## Goal
This is where the reference image lives most literally. The baby profile **is** the "Little Moments" page, built from real data.

## Screens
- **List `/babies`** (redesign of `baby-list`): cards with `app-avatar`, the name, **age** ("6 luni") first and the birth date secondary ("Data nașterii: 25 martie 2026"; neutral wording, since the app doesn't know the baby's gender). The whole card links to the profile, and a secondary action links to "Istoric". Adds "＋ Adaugă bebeluș". With one baby, the list still shows (it's the place to add a second one). Migrate off `.card` and `.button`.
- **Profile `/babies/:babyId`** (new):
  - `app-frame` cloud shape with the initials on a honey wash (a photo upload needs a backend field; out of scope).
  - The name in the accent script at display size, and a ribbon subtitle with the birth date.
  - A **fact card** (`app-card stitched`) with baby-book rows: Data nașterii, Vârsta, Azi (count per type), Ultima masă / Ultimul somn. Height, weight and "Îi place" appear only if the backend adds them later. Never show fake data.
  - An `app-bubble` affirmation (decorative): "Ești cea mai mare aventură a noastră".
  - Actions: "Istoric", "Editează", "Șterge" (ConfirmService: "Ștergi bebelușul Maria și toate activitățile?". The API cascades, so this can't be undone).
  - Desktop: the reference's two-column composition (frame left, fact card right).
- **Form `/babies/new`, `/babies/:babyId/edit`** (Etapa 6): Nume (required, trimmed) and Data nașterii (not in the future), with `app-field` + Signal Forms. Server validation maps to fields. Saving goes to the profile with the toast "Salvat".
- **First run `/welcome`**: when there are no babies. It shows the illustration, "Bun venit! Hai să adăugăm bebelușul." and "Adaugă bebelușul", then lands on Azi after save. A guard on `/dashboard` redirects here when `hasBabies()` is false.

## Acceptance criteria
- [ ] Age is correct across boundaries (BP-UI-13 tests).
- [ ] Deleting the active baby switches to another baby, or to `/welcome`.
- [ ] The heading contains the name as plain text (the script is just styling), and decorative images have `alt=""`.
- [ ] The profile at 390px and 1440px is compared side by side with the reference image and critiqued (`impeccable critique`).
- [ ] The existing `baby-api.spec.ts` still passes, and new specs cover the form and the delete flow.
