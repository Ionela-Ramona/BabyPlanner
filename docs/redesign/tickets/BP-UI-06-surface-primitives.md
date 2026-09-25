# BP-UI-06 · Surface primitives: card, frames, ribbon, cloud bubble, edges

**Epic:** B. Reusable components · **Size:** M · **Depends on:** 03, 05 · **Plan:** [§4.3 #1, 2, 5, 6, 9](../REDESIGN_PLAN.md#43-design-principles-found-in-the-image), [§4.4](../REDESIGN_PLAN.md#44-borders-and-gradients-the-professional-layer)

## Goal
The containers that carry the baby-book look, replacing the global `.card` class, so screens never style their own boxes.

## Components (`shared/components/`, presentational, `input()` only)
| Component | Reference element | Inputs |
|---|---|---|
| `app-card` | info card | `variant: 'plain' \| 'stitched' \| 'tinted'`, `tone` (activity/semantic), `padding` |
| `app-frame` | scalloped cloud photo frame | `shape: 'cloud' \| 'circle' \| 'rounded'`, `size`, projected `<img>` or initials |
| `app-ribbon` | "♡ Big Memories ♡" banner | projected text, `decorated` (hearts) |
| `app-bubble` | "Greatest Adventure" cloud | projected content, optional script line |
| `app-edge` | scalloped lace bottom | `position: 'top' \| 'bottom'`, `tone` |
| `app-divider` | stitched line | `variant: 'stitch' \| 'line'` |

## Migration
- `.card` stays as an alias in `_legacy.scss` (styled like `app-card variant="plain"`) until the existing pages are migrated in 16 and 17. It is deleted in BP-UI-18.

## Rules
- Border and gradient treatments come only from the `_surfaces.scss` utilities (BP-UI-03).
- `app-card` never decides semantics. The caller wraps it in `<li>`, `<article>` or `<section>` (the existing lists use `<li class="card">`, so keep the list semantics).
- The stitch is decorative (`aria-hidden`) and never the only visible boundary of an interactive element.
- Scallops use `mask`, not `clip-path` polygons, with a solid fallback.

## Acceptance criteria
- [ ] Every variant is shown in the showcase (BP-UI-12) in both themes.
- [ ] `app-frame` uses `object-fit: cover` and `NgOptimizedImage` for static images.
- [ ] Unit tests cover the variant/tone → class mapping.
- [ ] Each component's styles are under 4 kB.
