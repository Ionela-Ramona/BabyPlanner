# BP-UI-11 · App shell redesign: top bar, baby switcher, bottom nav, desktop rail, theme toggle

**Epic:** B. Reusable components · **Size:** M · **Depends on:** 06, 07, 09, 10, 13 · **Plan:** [§5](../REDESIGN_PLAN.md#5-information-architecture-existing-urls-kept) · **Replaces:** `app.html` header/footer, `shared/components/nav-bar`

## Scope
- **Keep**: the skip link ("Sari la conținut"), `<main id="continut" tabindex="-1">`, `aria-current` via `ariaCurrentWhenActive`, and route `title`s.
- **Top bar**: the wordmark (BP-UI-05), the active baby (`app-avatar` + name) as an **Angular Aria menu** switcher (a plain label when there's one baby), and a theme toggle (Sistem / Luminos / Noapte, remembered in `localStorage` inside try/catch).
- **Bottom nav** (<1024px): **Azi** (`/dashboard`) · **＋ Adaugă** (opens the quick-log sheet, BP-UI-15) · **Istoric** (`/babies/:activeId/activities`) · **Bebeluși** (`/babies`). It has a scalloped top edge, 56px targets, and is safe-area aware.
- **Left rail** (≥1024px): the same items; ＋ Adaugă becomes a full-width primary button at the top.
- **Page frame**: paper-wash background, content max-width ~45rem for task pages (replaces the 64rem that caused the desktop dead space), wider for the profile's two columns.
- **Footer**: remove the permanent "Proiect de învățare…" footer. Move that line to the Bebeluși page bottom or an "Despre" note on desktop.
- **Not-found page**: restyle with `app-empty-state` ("Pagina nu există" + "Înapoi la Azi").
- **`ThemeService`** (`@Service()`, signals): combines the system preference and the user override, sets `data-theme` on `<html>`, and updates `meta[name=theme-color]`. A tiny inline script in `index.html` sets the theme before bootstrap so there's no flash.
- **Focus on navigation**: after each route change, move focus to the page `<h1>` (or `main`) so screen reader users hear the new page.

## Acceptance criteria
- [ ] Tab order: skip link → top bar → main → nav. Every nav item is announced with its state.
- [ ] Works at 320, 390, 768, 1024 and 1440px with no horizontal scroll. ＋ Adaugă is in the bottom 25% of a 390×844 screen.
- [ ] No wrong-theme flash on reload in either theme.
- [ ] The existing `app.spec.ts` is updated to the new shell and passes.
