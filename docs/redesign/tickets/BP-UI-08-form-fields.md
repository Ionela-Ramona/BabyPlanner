# BP-UI-08 · Baby-book form fields (Signal Forms) + API validation errors

**Epic:** B. Reusable components · **Size:** M · **Depends on:** 03, 04, 05 · **Plan:** [§4.3 #3](../REDESIGN_PLAN.md#43-design-principles-found-in-the-image) · **Needed by:** Etapa 6 forms (15, 17)

## Goal
Form fields that look like the reference's "Date: ……" rows (icon, label, value on a dashed baseline) but are fully accessible native inputs. Errors from the .NET API show on the right field.

## Scope
- `app-field` wrapper: `icon`, `label`, `hint` and `error` slots. It connects `<label for>`, `aria-describedby` (hint + error) and `aria-invalid`, and works with **Signal Forms** (`@angular/forms/signals`).
- Controls, all native and styled through the wrapper: text (baby name), textarea (notes, auto-grow), date (`dateOfBirth`, `YYYY-MM-DD`), datetime-local (`occurredAt`), and `app-select` (Angular Aria select) for longer lists when needed.
- **Server errors**: a small helper that maps `ValidationProblemDetails.errors` (uses the existing `isValidationProblem`) onto field errors by name (`Name` → `name`, `OccurredAt` → `occurredAt`). Non-field problems (`ProblemDetails.detail`) show in a form-level `app-error-state`.
- **Time zones**: `occurredAt` is edited in local time and sent as ISO UTC. `dateOfBirth` stays a plain date string and is never converted to a `Date` (the existing model comment explains why).
- Visual: a 1px dashed baseline that becomes a solid 2px honey line on focus, the label above the value (no floating labels), and ≥16px input text (prevents iOS zoom).
- Errors: blush ink + icon + Romanian message ("Numele este obligatoriu."). Color is never the only signal.

## Acceptance criteria
- [ ] A screen reader announces the label, hint and error for every control.
- [ ] The resting boundary/baseline is ≥3:1 against the surface.
- [ ] Validation shows after blur or submit, not on every keystroke.
- [ ] A test posts an invalid form to a mocked `HttpTestingController` 400 response and shows the error under the right field.
- [ ] The showcase includes empty, filled, focused, invalid, disabled and read-only states.
