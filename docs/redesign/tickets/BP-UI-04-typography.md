# BP-UI-04 · Typography: UI face, accent script, fixed type scale

**Epic:** A. Foundation · **Size:** S · **Depends on:** 03 · **Plan:** [§4.5](../REDESIGN_PLAN.md#45-type)

## Goal
Two voices like the reference: a clear rounded sans that replaces the Segoe UI stack and does all the work, and a brush script used sparingly for warmth.

## Scope
- **Pick the UI face**: compare *Nunito*, *Mali* and *Delius* against the "Little" and "Date:" lettering in the reference. Criteria: legibility at 14–16px, tabular numerals (times), weights 400/600/700, and **full Romanian diacritics with comma-below ș ț** (not cedilla ş ţ).
- **Pick the accent script**: rank candidates against the "Moments" crop (`impeccable font-match --measure/--rank` on the reference). It must include ă â î ș ț.
- Self-host (`@fontsource` or local files): `font-display: swap`, Latin + Latin Extended subsets, preload only the UI regular weight. Update `--font-sans` and add `--font-script`.
- `styles/_typography.scss`: a fixed `rem` scale with a 1.2 ratio. This replaces the fluid `h1 { font-size: clamp(...) }`: caption 13, body 16, lead 18, h3 19, h2 23, h1 28, script display 32+. Add a `tabular-nums` utility for times.
- Script usage rule (documented in DESIGN.md later): the wordmark, the baby's name and greetings only, ≥24px. Never data, labels or buttons.

## Acceptance criteria
- [ ] The test string "Ștefănuț a mâncat 120 ml la 03:15 — îngrijire, țâța" renders with no fallback glyphs in both faces.
- [ ] Existing headings ("Bebeluși", "Activități — Maria", "Pagina nu există") render in the new face at the fixed scale.
- [ ] No layout shift from fonts (CLS < 0.05). Font payload for the first view ≤ 60 kB.
