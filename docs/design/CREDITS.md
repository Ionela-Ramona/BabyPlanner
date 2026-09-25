# Credite: iconite si ilustratii

## Iconite (`frontend/baby-planner/public/icons/sprite.svg`)

Sursa: [Tabler Icons](https://tabler.io/icons), licenta MIT
(https://github.com/tabler/tabler-icons/blob/main/LICENSE), setul `outline`,
descarcate din CDN-ul jsDelivr (`https://cdn.jsdelivr.net/npm/@tabler/icons@3.48.0/icons/outline/<nume>.svg`).
Din fiecare SVG original am pastrat doar path-urile de contur (am scos atributele
de pe radacina `<svg>` si path-ul invizibil `stroke="none" d="M0 0h24v24H0z"`
folosit de Tabler ca zona de click); stroke/fill/stroke-width vin acum din CSS
(`app-icon`), nu din fisier.

| Nume in `IconName` | Iconita Tabler sursa |
| --- | --- |
| `feeding` | `baby-bottle` |
| `sleep` | `moon-stars` |
| `medicine` | `medicine-syrup` |
| `other`, `heart` | `heart` |
| `calendar` | `calendar` |
| `clock` | `clock` |
| `note` | `notes` |
| `star` | `star` |
| `today` | `sun-high` |
| `history` | `history` |
| `babies` | `mood-kid` |
| `plus` | `plus` |
| `close` | `x` |
| `back` | `arrow-left` |
| `chevron-down` | `chevron-down` |
| `chevron-right` | `chevron-right` |
| `edit` | `pencil` |
| `delete` | `trash` |
| `check` | `check` |
| `undo` | `arrow-back-up` |
| `refresh` | `refresh` |
| `alert` | `alert-circle` |
| `sun` | `sun` |
| `moon` | `moon` |
| `monitor` | `device-desktop` |

## Facute in casa (in-house)

- **`diaper`** (`public/icons/sprite.svg#diaper`): nu exista in Tabler Icons.
  Desenat de la zero: un trapez moale cu banda de talie sus si doua curbe de
  picior jos, pe aceeasi grila de 24px si aceeasi gramatica de contur ca restul
  setului.
- **Wordmark-ul** (`src/app/shared/components/wordmark/wordmark.ts`): steaua
  somnoroasa (marca produsului) e desenata de la zero, inline in componenta.
- **`public/icons/favicon.svg`** si **`public/icons/apple-touch-icon.png`**:
  aceeasi stea somnoroasa, pe fundal crem rotunjit; PNG-ul e randat din SVG
  cu Playwright.
- **Piesele decorative din `public/illustrations/`** (`star.svg`,
  `sleepy-star.svg`, `cloud.svg`, `bunting.svg`, `balloon.svg`, `blocks.svg`,
  `confetti.svg`): forme vectoriale geometrice, desenate de la zero, inspirate
  de compozitia din imaginea de referinta (`docs/design/reference/little-moments.png`
  sau `frontend/baby-planner/public/image.png`), nu sunt o copie a acelei
  ilustratii. Vor fi inlocuite in BP-UI-05 partea 2 cu ilustratii acuarela
  licentiate/comandate (acelasi nume de fisier, fara schimbari de cod).
