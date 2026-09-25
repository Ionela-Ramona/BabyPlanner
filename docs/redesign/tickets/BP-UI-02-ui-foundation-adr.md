# BP-UI-02 · UI foundation decision (ADR) and install Angular Aria + CDK

**Epic:** A. Foundation · **Size:** S · **Depends on:** 01 · **Plan:** [§6](../REDESIGN_PLAN.md#6-component-library-research-and-recommendation)

## Goal
Record why we use headless Angular Aria + Angular CDK with our own tokens instead of Angular Material (which `BabyPlannerDoc.docx` proposed), and install them.

## Scope
- Write `docs/adr/0001-ui-foundation.md`: context (the redesign toward the reference world; phone-first; AXE rule), options (Aria, CDK, Spartan/ui, Material, PrimeNG, Taiga), decision, consequences, and Spartan/ui as the fallback. It explicitly supersedes the Material suggestion in `BabyPlannerDoc.docx`.
- `npm i @angular/aria @angular/cdk`, versions matched to `@angular/core` 22.x.
- Import only the CDK pieces we use (`dialog`, `overlay`, `a11y`, `layout`), plus the CDK overlay structural CSS.
- Add a "Which primitive do I use?" table to the ADR: listbox/radiogroup → Aria, menu → Aria, dialog/sheet → CDK Dialog, toast → CDK Overlay + `LiveAnnouncer`, date/time → native input.

## Acceptance criteria
- [ ] ADR committed and linked from `REDESIGN_PLAN.md`.
- [ ] `ng build` succeeds, and the initial bundle is within the 500 kB warning budget.
- [ ] A throwaway spike: an Aria listbox of the five activity types works with keyboard only, and screen reader names are in Romanian.
