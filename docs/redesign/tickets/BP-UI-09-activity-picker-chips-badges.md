# BP-UI-09 · Activity type picker ("blocks"), filter chips, badges, avatar

**Epic:** B. Reusable components · **Size:** M · **Depends on:** 02, 03, 05 · **Plan:** [§4.3 #7](../REDESIGN_PLAN.md#43-design-principles-found-in-the-image), [§4.6](../REDESIGN_PLAN.md#46-activity-color-system)

## Goal
Activity types get one visual identity everywhere (icon + label + family color), drawn as the reference's wooden blocks. The native `<select>` filter gets a better replacement.

## Scope
- **`ACTIVITY_META`** in `core/models/activity-type.ts`: it extends `ACTIVITY_TYPE_LABELS` (keep that export working) with `icon` and `tone` per type. Everything below reads from it, so no component hard-codes types.
- **`app-activity-picker`**: single select, a grid of rounded "blocks" (icon + label, ≥72px tall), built on an **Angular Aria listbox** (or radiogroup) and bound with `model()`. Selected state: stronger fill + line border + check mark.
- **`app-filter-chips`**: replaces `<select id="type-filter">`. Chips: "Toate" + the five types. **Single select**, because the API's `?type=` takes one value (keeps today's behavior and URL). It scrolls horizontally on mobile with an edge fade. It emits the selection; pages keep writing it to the URL as `ActivityList.onTypeChange` does now.
- **`app-activity-badge`**: a small pill (icon + label) that replaces `.activity__type` and its HSL hues.
- **`app-avatar`**: baby initials (or a photo later) in an `app-frame` circle, with a rim tone per baby.

## Acceptance criteria
- [ ] Keyboard: arrows move, Space/Enter select, Home/End work. Screen readers announce e.g. "Masă, 1 din 6, selectat".
- [ ] Every type's ink and line tokens pass 4.5:1 and 3:1 in both themes.
- [ ] A unit test renders every `ACTIVITY_META` entry, which proves a new type only needs a new entry.
