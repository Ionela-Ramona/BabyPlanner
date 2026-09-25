# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents and caregivers of a newborn or infant. The defining scene: logging a feed, nap or diaper change at 3am, one-handed on a phone, in a dim nursery, often while holding the baby. A second, calmer scene: reviewing the day on the couch or at a desk to spot patterns or answer a pediatrician's question.

## Product Purpose

BabyPlanner records a baby's daily activities and shows what happened today at a glance. Success means a caregiver logs an activity in seconds without waking up fully, and can answer "când a mâncat ultima dată?" or "cât a dormit?" instantly.

## Positioning

A personal, keepsake-feeling baby log: the warmth of a printed baby memory book, with the speed of a utility app. Not a medical tool and not a social product.

## Operating Context

- Mobile-first, one-handed use; desktop is secondary (review, data entry).
- Frequent short sessions, many per day and night; low light at night.
- More than one baby can be tracked; the active baby is always explicit.
- UI language is **Romanian** (`<html lang="ro">`, `LOCALE_ID 'ro'`). Dates render as "25 septembrie, 16:04".

## Capabilities and Constraints

- Baby: `id`, `name`, `dateOfBirth` (DateOnly, `YYYY-MM-DD`).
- Activity: `id`, `babyId`, `type`, `occurredAt` (UTC instant, shown in local time), `notes` (optional). Types: Feeding (Masă), Sleep (Somn), Diaper (Scutec), Medicine (Medicamente), Other (Altele). There are **no** amount, duration or end-time fields today. Parents put those in notes ("120 ml lapte praf", "A dormit 45 de minute").
- API (.NET 8, `/api`, dev proxy to `https://localhost:7057`): babies CRUD; `/api/babies/{babyId}/activities` CRUD with an optional `?type=` filter; `/activities/today`. Errors are RFC 7807 ProblemDetails / ValidationProblemDetails.
- Frontend: Angular 22, standalone components, signals, `rxResource`, route/query params bound to `input()`s, the filter state lives in the URL, lazy feature routes, Vitest.
- Built so far (branch `feature/domain-entities`): app shell, nav, Bebeluși list, Activități list with a type filter, a Dashboard placeholder, and a not-found page. Still planned: the Today dashboard (Etapa 5), add/edit forms (Etapa 6), then JWT auth.
- Development seeds one baby, "Maria" (born 2026-03-25), with sample activities.

## Brand Commitments

- Visual reference pinned by the user: `docs/design/reference/little-moments.png` (watercolor nursery baby-book page: teddy bear, stitched scalloped frames, bunting, balloon, cream/blush/sage/honey palette, rounded sans + script lettering).
- The user wants a professional application with refined borders and gradients.
- This is a learning project: decisions are explained, and code carries short Romanian comments that explain *why* (existing convention).

## Evidence on Hand

- One reference illustration (above). There is no separate illustration set, no logo (the header uses the 🍼 emoji), and no photography. Do not fabricate testimonials, stats or medical claims.

## Product Principles

1. Logging beats browsing: the fastest path is always to record the next activity.
2. Warm, never childish: storybook craft lives in details; tasks stay clear and legible.
3. Kind at night: dim-light friendly, large targets, no jarring brightness or motion.
4. Every entry is explicit: which baby, which type, what time, always visible.

## Accessibility & Inclusion

WCAG 2.1 AA minimum and passing AXE checks (project rule). Pastel palette colors are decorative only; text and essential indicators use darker ink tones that meet contrast. Activity types are never distinguished by color alone (icon + label). Minimum 48px touch targets. Respect `prefers-reduced-motion`. Full Romanian diacritics (ă â î ș ț, comma-below forms) in every font.
