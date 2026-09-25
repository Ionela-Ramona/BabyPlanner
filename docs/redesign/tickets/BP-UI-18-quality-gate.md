# BP-UI-18 · Quality gate: legacy removal, accessibility, performance, motion, PWA basics

**Epic:** D. Quality & docs · **Size:** M · **Depends on:** 14–17

## Scope
- **Remove legacy**: delete `styles/_legacy.scss` (`.card`, `.button`, `.button--ghost`) once nothing uses it (grep-check).
- **Tooling**: add `angular-eslint` with template accessibility rules and the `app` selector prefix rule, and an `expectNoAxeViolations(fixture)` helper using `axe-core` in Vitest specs. Optionally, a Playwright smoke test that runs axe on every route in both themes (Playwright is already used locally via MCP).
- **Accessibility audit** (`impeccable audit`): keyboard paths for add, edit, delete and switching baby; a screen reader pass (NVDA + Chrome, VoiceOver + iOS Safari) in Romanian; 200% zoom; 320px reflow; `prefers-reduced-motion`; forced colors (stitches may disappear, control boundaries must not).
- **Motion**: 150–250ms, state changes only (sheet, toast, chip select, row insert). One small delight: the sleepy star "breathes" once when a Somn is logged, disabled under reduced motion.
- **Performance**: initial JS within budget, lazy routes verified, fonts ≤ 60 kB, illustrations lazy-loaded, LCP < 2.5s and CLS < 0.05 on throttled mobile Lighthouse.
- **PWA basics**: web manifest (name "BabyPlanner", Romanian description), icons, and `theme-color` per theme. Offline logging is out of scope (future ticket).
- Run `impeccable detect --json` over `src/` and fix the mechanical findings.

## Acceptance criteria
- [ ] Zero AXE violations on every route in both themes.
- [ ] Lighthouse mobile: Accessibility 100, Performance ≥ 90, Best Practices ≥ 95.
- [ ] The report is saved as `docs/redesign/audit-report.md` with findings and fixes.
