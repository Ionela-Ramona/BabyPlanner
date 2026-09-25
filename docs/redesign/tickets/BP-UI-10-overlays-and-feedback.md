# BP-UI-10 · Overlays and feedback: bottom sheet, confirm, toast, skeleton, empty and error states

**Epic:** B. Reusable components · **Size:** M · **Depends on:** 02, 06, 07

## Goal
Give every async and empty moment real design. It replaces the plain "Se încarcă…" text and developer-facing empty copy ("…se construiește în Etapa 6") while keeping the existing `role="status"` / `role="alert"` semantics.

## Scope
- **`SheetService`** (CDK Dialog): a bottom sheet on mobile and a centered panel on ≥768px. It has a scalloped top edge (`app-edge`), a drag handle, focus trap, closes on `Esc` or backdrop, returns focus to the trigger, and respects the safe-area inset.
- **`ConfirmService`**: a small confirm dialog, only for destructive, non-undoable actions (e.g. "Ștergi bebelușul Maria și toate activitățile lui?").
- **`ToastService`** (CDK Overlay + `LiveAnnouncer`): "Masă înregistrată · Anulează". Undo is preferred over confirm for reversible actions. It auto-dismisses after 5s, pauses on hover/focus, and sits above the bottom nav.
- **`app-skeleton`**: presets for a timeline row, summary tile, baby card and profile. The container keeps `role="status"` with visually hidden "Se încarcă…".
- **`app-empty-state`**: illustration + an `app-bubble` message + one primary action. The copy teaches, e.g. "Nicio activitate azi. Apasă ＋ ca s-o adaugi pe prima."
- **`app-error-state`**: `role="alert"`, a plain-language message, and a "Reîncearcă" action (replaces the current error cards; same content idea).

## Acceptance criteria
- [ ] The sheet passes AXE, traps and restores focus, and is labelled by its title.
- [ ] Toasts are announced politely and never steal focus.
- [ ] Reduced motion: the sheet fades instead of sliding.
- [ ] Showcase has all states in both themes. Tests cover open/close/focus-return and the toast queue.
