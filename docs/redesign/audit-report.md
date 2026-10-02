# BP-UI-18 · Quality gate: audit report

> Date: 2026-10-02 · Build: production (`ng build`), served with gzip from `dist/` and proxied to the .NET 8 API with seed data · Browser: Chrome 154 (Playwright-driven for axe and screenshots, Lighthouse 12 for scores)

## Summary

| Gate (ticket acceptance criteria) | Target | Result |
|---|---|---|
| AXE on every route, both themes | 0 violations | **0** across 40 route × width × theme runs, plus the quick-log sheet (quick and details modes) |
| Lighthouse mobile · Accessibility | 100 | **100** on all 6 routes |
| Lighthouse mobile · Performance | ≥ 90 | **97–99** over HTTP/2 (see F1); 89–96 over a plain HTTP/1.1 test server |
| Lighthouse mobile · Best Practices | ≥ 95 | **100** on all 6 routes |
| Fonts | ≤ 60 kB | **59.7 kB** for all six files; 38–59 kB actually downloaded per page (was ~133 kB) |
| CLS | < 0.05 | **0.006–0.013**, including Azi with a sleep in progress (was 0.158, F1) |
| LCP (simulated slow 4G) | < 2.5 s | **1.8–2.3 s over HTTP/2: met.** 2.5–3.4 s over the HTTP/1.1 test server (see F1) |
| Initial JS | < 500 kB budget | 394 kB raw / 105 kB transferred (was 473 / 120 kB); CDK Dialog/Overlay and the Aria menu now load on first use |
| No horizontal scroll at 320 / 390 / 1440px | none | **none** (after fix 1) |
| Legacy `.card` / `.button` / `.button--ghost` | removed | **removed**: `styles/_legacy.scss` deleted, no usages left (grep-checked) |

## Lighthouse (mobile, simulated throttling)

**Current numbers (after F1, 2026-10-02).** The production build is served over HTTP/2 + TLS, the way any real host serves it:

| Route | Perf | FCP | LCP | CLS |
|---|---|---|---|---|
| `/dashboard` (Azi) | 98 | 1.5 s | 2.1 s | 0.006 |
| `/babies/1/activities` (Istoric) | 98 | 1.6 s | 2.1 s | 0.006 |
| `/babies` | 99 | 1.6 s | 2.0 s | 0.006 |
| `/babies/1` (profile) | 97 | 1.6 s | 2.3 s | 0.013 |
| `/welcome` | 99 | 1.4 s | 1.8 s | 0.006 |
| `/nu-exista` | 99 | 1.4 s | 1.8 s | 0.006 |

Accessibility is 100 and Best Practices 100 on every route.

**First pass (before F1).** Same build pipeline, served by a plain HTTP/1.1 Node server:

| Route | Perf | A11y | Best Pr. | FCP | LCP | CLS | Fonts |
|---|---|---|---|---|---|---|---|
| `/dashboard` (Azi) | 92 | 100 | 100 | 2.1 s | 3.1 s | 0.006 | 57 kB |
| `/babies/1/activities` (Istoric) | 92 | 100 | 100 | 2.3 s | 3.0 s | 0.006 | 38 kB |
| `/babies` | 92 | 100 | 100 | 2.2 s | 3.0 s | 0.006 | 40 kB |
| `/babies/1` (profile) | 90 | 100 | 100 | 2.3 s | 3.2 s | 0.013 | 59 kB |
| `/welcome` | 94 | 100 | 100 | 2.0 s | 2.7 s | 0.006 | 40 kB |
| `/nu-exista` | 94 | 100 | 100 | 2.0 s | 2.7 s | 0.006 | 40 kB |

## Automated checks run

- **axe-core** (all rules, including color contrast in a real browser) on `/dashboard`, `/babies/1/activities`, `/babies/1/activities?type=Feeding`, `/babies`, `/babies/1`, `/babies/1/edit`, `/dev/components` and a 404 route. Run at 390×844 and 1440×900 in light and dark (`prefers-color-scheme`), and at 320×640 in light, with reduced motion on.
- **Reflow**: `document.scrollWidth - innerWidth` measured on every run above.
- **Quick-log flow** at 390×844: ＋ Adaugă sits at y = 748 (bottom 25% ✓). Tapping the button, then a block, shows the "Masă înregistrată" toast in about 0.6–0.85 s. Focus returns to ＋ Adaugă when the sheet closes. "Cu detalii" moves focus to the first block. "Anulează" deletes the created activity.
- **Unit tests**: 43 spec files, 261 tests, all passing in Vitest. Components and pages call `expectNoAxeViolations(fixture)`. The new specs cover the quick-log sheet (2-tap save, undo, edit undo, delete + undo restores exactly the same activity, validation, server errors), the baby form, and the baby delete flow (switches to another baby, or to `/welcome`).
- **Lint**: angular-eslint `templateAccessibility` + the `app` selector prefix rule: clean.
- **Contrast**: `npm run check:contrast` covers every token pair in both themes and all five day backgrounds.

## Findings and fixes

| # | Sev | Finding | Fix |
|---|---|---|---|
| 1 | P1 | **Azi scrolled sideways on phones** (265px overflow at 390, 335px at 320). The timeline grid had an implicit `auto` column, which grew to the full width of the filter-chip row. | `.timeline { grid-template-columns: minmax(0, 1fr) }` in `dashboard-page.scss` |
| 2 | P1 | **Fonts were 133 kB** (Nunito latin + latin-ext, Mali, Dancing Script, all full subsets and full weight axes). | Subsets for Romanian UI text, Nunito pinned to 400–800, Dancing Script instanced at 600, split per `unicode-range` (`scripts/subset-fonts.mjs`, `styles/_fonts.scss`), plus a preload for the body font. Now 59.7 kB. |
| 3 | P2 | **The LCP image was lazy-loaded**: the empty-state illustration on Azi and Istoric is above the fold. | `priority` on those `app-empty-state`s at first; superseded in F1 by inline SVG illustrations |
| 4 | P2 | Focus fell to `<body>` after "Cu detalii" in the quick-log sheet (the pressed button disappears). | Focus moves to the first type block, falling back to "Când" |
| 5 | P2 | The quick-log sheet's accessible name included the close button text ("…Închide"). | `SheetHeader` gained `titleId`, placed on the `<h2>`; used by the quick-log and background sheets |
| 6 | P3 | `heading-order` in the showcase: an `h2` empty state inside an `h4` demo group. | The empty state uses `headingLevel` 3 there |
| 7 | P3 | No web manifest. | `public/manifest.webmanifest` (name "BabyPlanner", Romanian description, `lang: ro`, SVG + 180px icons, theme and background colors) linked from `index.html` |

## Motion

- Sheet: slides up on phones and scales from 0.96 on desktop, at `--dur` (220ms). Toasts, chips and row insert use `--dur-fast` / `--dur`.
- The one delight: the Somn tile's block "breathes" once (scale 1 → 1.12 → 1) after a sleep is logged.
- `prefers-reduced-motion: reduce` turns every animation and transition instant (`_base.scss`). The review runs had reduced motion on.

## Not verified in this pass (needs a person)

These ticket items can't be automated here and were **not** done:

- Screen reader passes: NVDA + Chrome and VoiceOver + iOS Safari, in Romanian.
- 200% browser zoom (the 320px reflow run above covers the equivalent layout width).
- Forced-colors mode on Windows: the CSS has `forced-colors` fallbacks for rows, tiles, fields and the active filter, but nobody has looked at it.
- `impeccable audit` / `impeccable detect --json` / `impeccable critique`: the impeccable CLI isn't installed in this environment.

## Follow-ups

- **F1 · LCP 2.7–3.2 s on simulated slow 4G (target < 2.5 s). Resolved 2026-10-02.**
  - **What it really was.** Mostly the measurement setup. The first pass served the build from a plain HTTP/1.1 Node server. Lighthouse then models a handful of connections, each paying its own setup round trip, for the many small route chunks. The same `main` build served over HTTP/2 + TLS, as any real host would, already scored LCP 1.9–2.3 s. Both builds were measured side by side with the same API and data.
  - **Real problems found and fixed on the way:**
    - **CLS 0.158 on Azi whenever a sleep was in progress** (a BP-UI-20 regression). The "Încă doarme" banner arrived after the tiles and pushed them and the timeline down 160px. Azi now shows one loading block until both the day and the ongoing sleep are known, then renders everything in one frame: CLS 0.006.
    - **Font-swap shift** (up to 0.09 on slow loads): body text reflowed when Nunito arrived, and again when the ă ș ț subset arrived. The fix is metric-matched fallback faces (`Nunito/Mali/Dancing Script Fallback`, Arial with `size-adjust` and `ascent/descent-override` measured in Chrome on Romanian text) plus a preload for `nunito-ro.woff2`.
    - **Skeleton → content shift:** the greeting placeholder was shorter than the name line. Both are now one script line tall.
    - **Initial JS 473 → 394 kB raw (120 → 105 kB transferred):**
      - `SheetService.open()` is now async and loads CDK Dialog/Overlay/Portal from `sheet-opener.ts` on first use.
      - The baby switcher's Aria menu is `@defer`red, behind an identical placeholder button.
      - The sheet code is prefetched after the page settles (`load` + 3 s, or the first pointer/key press), so it doesn't compete with first paint.
    - **No image wait on empty pages:** the empty-state illustrations are inline SVG (`empty-state/illustrations.ts`, esbuild `text` loader), so an empty Azi, Istoric or 404 no longer waits for an image request. The `priority` input on `app-empty-state` is gone.
  - **Net effect, both over HTTP/2:** FCP 0.2–0.4 s faster on every route. LCP is unchanged on Azi and the profile, and up to 0.2 s faster on Bebeluși, Istoric, welcome and 404.
  - **Deploy note:** serve the app over HTTP/2 (any CDN or modern host does). Over HTTP/1.1 the data pages land at 3.1–3.4 s on simulated slow 4G.
- **F2 · PNG icons for installability.** The manifest has an SVG icon and the 180px touch icon. 192px and 512px PNGs (and a maskable variant) would make install prompts work everywhere.
- **F3 · Manual a11y pass**: the "Not verified" list above.

## Artifacts

- Screenshots: `docs/redesign/review/` (`<route>-<390|1440>-<light|dark>.png`, plus `quick-log-*.png`). Compare with the baseline in `docs/redesign/baseline/`.
