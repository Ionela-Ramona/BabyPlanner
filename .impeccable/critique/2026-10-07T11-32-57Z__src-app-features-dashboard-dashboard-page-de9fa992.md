---
target: dashboard
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:D:\\Projects\\BabyPlanner\\frontend\\baby-planner\\src\\app\\features\\dashboard\\dashboard-page"
timestamp: 2026-10-07T11-32-57Z
slug: src-app-features-dashboard-dashboard-page-de9fa992
closed: true
---
# Critique: Azi dashboard (2026-10-07)

## Design Health Score: 27/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Sleep banner, "acum X" and stale-dimming are good, but after midnight tiles say "Încă nimic azi" though a feed happened 40 min ago |
| 2 | Match System / Real World | 3 | Natural Romanian; parents think "since the last feed", not "since midnight" |
| 3 | User Control and Freedom | 4 | Undo toasts, tap-again clears filter, filter in URL so Back works |
| 4 | Consistency and Standards | 2 | Tile filters when it has data, opens the details form when empty; tiles and chips both filter; ＋ off-centre |
| 5 | Error Prevention | 3 | Undo on quick-saves; server-timezone midnight can disagree with the client's "today" |
| 6 | Recognition Rather Than Recall | 3 | Icon + label + colour everywhere; timeline below the fold on phones |
| 7 | Flexibility and Efficiency | 2 | Biggest targets (tiles) don't log; no "repeat last feed" |
| 8 | Aesthetic and Minimalist Design | 2 | Tiles, banner, greeting, ribbon, 6 chips, 3 theme radios and palette button compete |
| 9 | Error Recovery | 3 | Errors keep stale data visible; copy is generic ("Verifică conexiunea") |
| 10 | Help and Documentation | 2 | Tile-as-filter is undiscoverable |

## Design Specificity Verdict
Finish is specific (paper, cocoa ink, wooden blocks, script name, ribbon, scalloped nav, stitched dividers); composition is category-default (stat tile grid, chips, list). The brief's "day built from blocks" never appears: blocks are icons inside cards, the timeline is a plain list.
Detector: static scan clean (0). Browser overlay: 4 rules, all intentional or borderline: thin-border-wide-shadow on the nav ＋ (18px blur, check weight), flat-type-hierarchy (documented 1.2 scale; body to h3 is 1.19), cream-palette (documented paper ground, false positive), edge-flush chips scroller (intentional scroll hint, but still overflows at 1280 with no fade).

## Priority Issues
- [P0] Tiles answer "since midnight", not "since last time". summarizeToday reads only /today; server cuts at its own-timezone midnight (ActivityService.cs:57-61). At 3am the core question "când a mâncat ultima dată?" is answered with "Încă nimic azi". Fix: per-type latest activity (or rolling 24h) for "last"; show "ieri, 23:40 · acum 1 h 20 min". Command: harden.
- [P1] Tile has two meanings and duplicates the filter (summary-tile.ts tile click; chips beside it). Tapping Masă to log filters an off-screen timeline instead. Fix: tile logs (quick-save with undo, or details with type preselected); chips alone filter. Command: distill.
- [P1] Timeline below the fold on phones once a 4th tile or the sleep banner appears; empty-state heading hidden behind ＋. Fix: 3 core tiles in a compact row, fold rare types into one line, cut tile min-height, shrink empty-state illustration. Command: layout.
- [P2] Top-bar chrome and off-centre ＋: 3 theme radios + palette button outweigh the baby switcher; radios are 44px (below the 48px rule); nav is 4 columns with ＋ in slot 2. Fix: one theme control (or move to settings), symmetric 2 + ＋ + 2 nav. Command: layout.
- [P2] Tile labels break mid-word ("Medicament/e") from overflow-wrap: anywhere. Fix: overflow-wrap: normal + hyphens: auto, or a full-width/3-column tile. Command: typeset.

## Persona Red Flags
- 3am caregiver holding a baby: midnight reset; script name and ribbon take the top 150px for known info; two honey buttons compete during a sleep.
- Casey (one-handed): ＋ off-centre; tiles look like log buttons but filter; timeline needs a scroll.
- Sam (screen reader/keyboard): tile aria-pressed changes a later list with no announcement; two widgets announce the same filter; ＋ is the last tab stop.
- Alex (power user): no repeat-last, no ＋ shortcut; desktop wastes the left column on 5 tall tiles.

## Minor Observations
- Somn tile says "acum 1 oră" while the banner says "Încă doarme de 1 h 10 min"; should read "doarme acum".
- Sleep rows show start + duration; "11:09–12:44" scans faster.
- Dusk Somn tile reads as disabled next to warm tiles in day mode.
- Long notes wrap the badge under the text; uneven row heights.
- Compact wordmark is a lone star icon on phones, ambiguous as a home link.
- Chips scroller overflows at 1280 with no fade.

## Questions to Consider
- If the timeline were the stack of wooden blocks laid along a day ruler, would five stat tiles still be needed?
- Should Azi at 3am be "Noaptea asta", a rolling view, instead of a calendar day that resets mid-night?
- What if tapping a tile was the log (one tap, undo), leaving ＋ for the rare types?
