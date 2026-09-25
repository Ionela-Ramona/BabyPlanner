# BP-UI-15 · Quick-log and edit activity (Etapa 6: activity form)

**Epic:** C. Screens · **Size:** L · **Depends on:** 08, 09, 10, 13 · **Mode:** Operate · **API:** `POST/PUT/DELETE /api/babies/{babyId}/activities[/{id}]`

## Goal
**2 taps** for the common case, at night and one-handed: ＋ Adaugă → tap a type block → saved as "acum". Everything else is optional.

## Flow
1. ＋ Adaugă opens a sheet titled "Adaugă pentru Maria" (the active baby is always explicit).
2. `app-activity-picker` blocks. Tapping one **saves immediately** with `occurredAt = now` and `notes = null`, closes the sheet, and shows the toast "Masă înregistrată · Anulează · Adaugă detalii".
3. "Adaugă detalii" (or the secondary "Cu detalii" button in the sheet) opens the same sheet in details mode, with the fields the API has:
   - **Tip**: the picker.
   - **Când**: `datetime-local`, default now, with quick chips "acum 5 min", "acum 15 min", "acum 30 min".
   - **Notițe**: a textarea with a per-type placeholder based on how parents already write notes: Masă "ex. 120 ml lapte praf / alăptat 15 minute", Somn "ex. a dormit 45 de minute", Scutec "ex. ud / murdar", Medicamente "ex. Vitamina D, o picătură".
4. **Edit** (tapping a row in Azi or Istoric) reuses the sheet, pre-filled, with "Șterge" in the footer. Delete uses Undo via toast, not a confirm (the item is restored with a POST if undone).

## Rules
- Validation messages are Romanian and plain. Server `ValidationProblemDetails` map to fields (BP-UI-08).
- Optimistic update with rollback and an error toast on failure (BP-UI-13 helpers).
- After a save, Azi and Istoric reflect the change without a manual reload.

## Acceptance criteria
- [ ] The 2-tap path takes about 2 seconds on a mid-range phone, and the sheet animation is ≤ 220ms.
- [ ] Undo restores exactly the previous state (tests with `HttpTestingController`).
- [ ] The flow works with keyboard only and a screen reader, and focus returns to ＋ Adaugă (or the edited row) on close.
- [ ] Night nursery: no bright flashes (the backdrop is dim cocoa).
- [ ] Empty-state copy that mentions "Etapa 6" is removed everywhere.
