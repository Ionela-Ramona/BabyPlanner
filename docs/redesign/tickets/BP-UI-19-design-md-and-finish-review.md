# BP-UI-19 · DESIGN.md and finish review

**Epic:** D. Quality & docs · **Size:** S · **Depends on:** 18

## Goal
Write down the built design system so future screens (e.g. the login page for JWT in Etapa 7) and future AI sessions extend it instead of reinventing it.

## Scope
- Run the impeccable finish review on Azi, the quick-log sheet, Istoric, Bebeluși and the profile (390px and 1440px, both themes, next to the BP-UI-01 baseline and the reference image). Fix what it flags in one batch.
- Generate `DESIGN.md` at the repo root from the **built** code (`impeccable document`): the world ("baby-book paper"), tokens, the four borders and three gradients, type rules (script limits), the activity color system and `ACTIVITY_META`, the component inventory with usage, do/don't examples, and Night nursery rules.
- Add `.impeccable/design.json` (the machine-readable token sidecar).
- Update `frontend/baby-planner/README.md`: required Node and .NET versions, running with the API, where the showcase is, and how to add an activity type.

## Acceptance criteria
- [ ] Every token named in DESIGN.md exists in `_tokens.scss`.
- [ ] Adding a "Baie" activity type needs only: the backend enum value, an `ACTIVITY_META` entry, and an icon. This is proved by a dry run on a branch.
- [ ] The finish review returns "ship", or its remaining items become follow-up tickets.
