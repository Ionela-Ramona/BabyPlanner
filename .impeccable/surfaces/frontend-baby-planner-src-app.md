---
version: 1
slug: "frontend-baby-planner-src-app"
primary_target: "frontend/baby-planner/src/app"
related_targets: []
---

# Surface brief: BabyPlanner app (Angular, all routes)

Scope: the whole app shell and its screens (Azi `/dashboard`, Istoric `/babies/:id/activities`, Bebeluși, profile, forms, welcome, not-found, quick-log sheet). Mode: **Operate** (profile page leans Read).

Audience and job: a caregiver, often at 3am, one-handed, logging a feed/nap/diaper in two taps; later reviewing the day. Constraints: data is only type + time + notes; Romanian UI; WCAG AA; 48px targets; mobile-first, desktop adapts. Plan and tickets: `docs/redesign/REDESIGN_PLAN.md`, `docs/redesign/tickets/`.

## Direction contract

THESIS: The day is built from wooden blocks laid on a baby-book page. Refuses the category default of stat cards, big metrics and charts on a white SaaS canvas.

OWN-WORLD: Warm paper ground with faint blush and sage watercolor washes; cocoa ink, never black. Activity types are painted wooden blocks (honey Masă, dusk Somn, sage Scutec, blush Medicamente, stone Altele): rounded squares with a lit top edge and a soft grounded shadow, each with its drawn icon. Caramel stitched frames, scalloped edges on the bottom nav and sheets, ribbon day headers. Rounded humanist sans does the work; brush script only for the wordmark, the baby's name and greetings. Night nursery: cocoa dark, blocks dimmed, nothing bright.

STORY: The parent sees whose day it is, when each thing last happened, and the day's blocks in order; taps ＋, taps a block, done.

FIRST VIEWPORT: 390×844. Top bar: wordmark left, active baby avatar right. Compact greeting: ribbon "Azi · joi, 25 septembrie", "Maria" in script, "6 luni". Three block tiles (Masă, Somn, Scutec) with last time and count. Chips row, then the timeline on a fixed tabular time gutter. Bottom nav with scalloped top and a raised honey ＋ block at center.

FORM: baby-book page × wooden toy blocks, candidate 4 of the grounded list (brief-pinned world from `docs/design/reference/little-moments.png`); seed key 1099c00e. Code-led build (no image generation). Signature interaction: logging drops a block into the day (new row settles in 220ms with a small overshoot; the matching tile's count ticks), static under reduced motion. Raise (oscilloscope graticule): every timeline row is measured against one fixed tabular time gutter. Raise (depot blind state vocabulary): refresh never blanks data; stale content dims in place. Raise (iridescent cloud edge): pastel color lives on block fills, edges and icons; text is always ink.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
