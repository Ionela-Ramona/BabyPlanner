# BP-UI-14 · Azi: the Today dashboard (Etapa 5)

**Epic:** C. Screens · **Size:** L · **Depends on:** 11, 13 (+ 06–10) · **Mode:** Operate · **Replaces:** the "În construcție" placeholder at `/dashboard`

## Goal
Answer "what has happened today, and when did she last eat or sleep?" in one glance, with logging one tap away. Data: `GET /api/babies/{id}/activities/today?type=`.

## Layout (mobile, top to bottom)
1. **Greeting**: `app-ribbon` "Azi · joi, 25 septembrie", the baby's name in the accent script ("Maria"), and age ("6 luni"). It is the only storybook moment on the page and stays compact (≤ 25% of the first viewport).
2. **Summary tiles**, one per type present plus the core three (Masă, Somn, Scutec) even when zero. Each is an `app-card` tinted with the type's family, showing the **last time** ("Ultima masă · acum 2 ore", with the exact time "16:04" as secondary) and the **count today** ("5 mese"). There are no ml or duration totals (the data doesn't exist; see BP-UI-20). Tapping a tile filters the timeline to that type.
3. **Filter chips** (`app-filter-chips`), kept in the URL as `?type=`, the same way Activități does now.
4. **Timeline**: today's activities, newest first, grouped by part of day (Noaptea / Dimineața / După-amiaza / Seara) with a stitched divider. Each row shows the time (tabular numbers), `app-activity-badge`, and the notes as **primary** text (they carry the real information, e.g. "120 ml lapte praf"). Tapping a row opens edit (BP-UI-15).
5. **Empty**: `app-empty-state` with the sleepy star: "Nicio activitate azi." and "＋ Adaugă prima activitate".
6. **No babies**: redirect to `/welcome` (BP-UI-17).

Desktop: the greeting spans the top; tiles and timeline sit in two columns.

## States
Skeletons match the tile and row shapes. Error uses `app-error-state`. Filtered-empty: "Niciun somn azi" + "Arată toate".

## Acceptance criteria
- [ ] "acum X" labels update every minute (Clock) with no reload.
- [ ] The filter works from chips and tiles and survives refresh and Back.
- [ ] ＋ Adaugă and the chips are in the bottom 60% of a 390×844 screen.
- [ ] The timeline is a `ul` with meaningful row labels, and AXE is clean.
- [ ] Screenshots at 390px and 1440px in both themes, compared with the placeholder baseline.
