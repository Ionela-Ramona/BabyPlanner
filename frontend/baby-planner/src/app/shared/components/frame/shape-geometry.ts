/**
 * Geometria formelor "baby-book": rama festonata (nor), cerc, patrat rotunjit si
 * norul-bula. Toate sunt calculate aici, o singura data, ca aceeasi forma sa fie
 * folosita pentru margine (rim), pentru masca continutului si pentru cusatura.
 *
 * Formele sunt facute din arce de cerc (comanda `A` din SVG), nu din poligoane cu
 * multe puncte: raman netede la orice marime si au lungime calculabila exact,
 * de care avem nevoie ca liniutele cusaturii sa se inchida fara "cusatura" vizibila.
 */

export interface ShapePath {
  /** Atributul `d` al unui `<path>`. */
  readonly d: string;
  /** Lungimea conturului, in aceleasi unitati ca `d`. */
  readonly length: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Numere scurte in `d`: doua zecimale ajung si pentru 320px. */
const num = (value: number): string => String(Math.round(value * 100) / 100);

/**
 * Un arc care iese in afara formei, de la `from` la `to`, cu inaltimea (sageata)
 * `sagitta`. Conturul e parcurs in sensul acelor de ceasornic, deci sweep=1
 * inseamna "bombat spre exterior".
 */
function bulge(from: Point, to: Point, sagitta: number): { cmd: string; length: number } {
  const chord = Math.hypot(to.x - from.x, to.y - from.y);
  // Un arc mai inalt decat un semicerc ar parea balon, nu feston.
  const s = Math.min(Math.max(sagitta, 0.01), chord * 0.45);
  const radius = (chord * chord) / (8 * s) + s / 2;
  const angle = 2 * Math.asin(Math.min(1, chord / (2 * radius)));
  return {
    cmd: `A${num(radius)} ${num(radius)} 0 0 1 ${num(to.x)} ${num(to.y)}`,
    length: radius * angle,
  };
}

interface Segment {
  readonly to: Point;
  readonly rise: number;
}

/** Un contur inchis din arce: pleaca din `start`, ultimul segment se intoarce in `start`. */
function closedPath(start: Point, segments: readonly Segment[]): ShapePath {
  let d = `M${num(start.x)} ${num(start.y)}`;
  let length = 0;
  let from = start;
  for (const { to, rise } of segments) {
    const arc = bulge(from, to, rise);
    d += arc.cmd;
    length += arc.length;
    from = to;
  }
  return { d: `${d}Z`, length };
}

/** Numarul de festoane al ramei; 12 seamana cel mai bine cu rama din referinta. */
export const SCALLOP_COUNT = 12;

/** Cat de bombat e un feston, ca fractie din coarda lui. */
const SCALLOP_DEPTH = 0.2;

/**
 * Rama-nor: un cerc cu festoane egale, inscris in patratul [offset, offset + box].
 * Un feston sta sus, pe axa, ca rama sa para "asezata", nu rotita.
 */
export function scallopPath(box: number, offset = 0, count = SCALLOP_COUNT): ShapePath {
  const half = Math.PI / count;
  // Varful unui feston = apotema coardei + sageata; il fixam la box / 2.
  const radius = box / 2 / (Math.cos(half) + 2 * Math.sin(half) * SCALLOP_DEPTH);
  const chord = 2 * radius * Math.sin(half);
  const center = offset + box / 2;
  // Pornim de jos: daca liniutele se intalnesc imperfect, se intampla unde se vede cel mai putin.
  const points = Array.from({ length: count }, (_, i) => {
    const angle = Math.PI / 2 + half + i * 2 * half;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  });
  const rise = chord * SCALLOP_DEPTH;
  return closedPath(
    points[0],
    points.map((_, i) => ({ to: points[(i + 1) % count], rise })),
  );
}

export function circlePath(box: number, offset = 0): ShapePath {
  const r = box / 2;
  const c = offset + r;
  return {
    d: `M${num(c)} ${num(offset + box)}A${num(r)} ${num(r)} 0 1 1 ${num(c)} ${num(offset)}A${num(r)} ${num(r)} 0 1 1 ${num(c)} ${num(offset + box)}Z`,
    length: Math.PI * box,
  };
}

export function roundedPath(box: number, radius: number, offset = 0): ShapePath {
  const r = Math.max(0, Math.min(radius, box / 2));
  const a = offset;
  const b = offset + box;
  const arc = (x: number, y: number) => `A${num(r)} ${num(r)} 0 0 1 ${num(x)} ${num(y)}`;
  return {
    d:
      `M${num(a + r)} ${num(a)}H${num(b - r)}${arc(b, a + r)}V${num(b - r)}${arc(b - r, b)}` +
      `H${num(a + r)}${arc(a, b - r)}V${num(a + r)}${arc(a + r, a)}Z`,
    length: 4 * (box - 2 * r) + 2 * Math.PI * r,
  };
}

/* ---- Norul-bula ---- */

/**
 * Cat loc lasa norul pentru "lobi" in jurul corpului, in px. E fix (nu depinde de
 * inaltime), altfel padding-ul textului ar depinde de forma, iar forma de padding.
 */
export const CLOUD_MARGIN = 22;

/** Cum sunt impartiti lobii; se calculeaza o data pe contur, apoi se refoloseste pentru cusatura. */
export interface CloudLayout {
  /** Latimile relative ale lobilor de sus, de la stanga la dreapta. */
  readonly top: readonly number[];
  /** Inaltimile relative ale lobilor de sus (x CLOUD_MARGIN). */
  readonly topRise: readonly number[];
  /** Latimile relative ale lobilor de jos, de la dreapta la stanga. */
  readonly bottom: readonly number[];
  /** Cati lobi are fiecare latura. */
  readonly sides: number;
}

// Tipare fixe, nu aleatoare: acelasi continut da mereu acelasi nor (si teste stabile).
const TOP_WIDTHS = [1.2, 0.85, 1.3, 0.95, 1.15, 0.9, 1.25];
const TOP_RISES = [0.9, 0.7, 1, 0.75, 0.95, 0.72, 0.88];
const BOTTOM_WIDTHS = [1, 1.25, 0.9, 1.15, 1.05];

const cornerReach = (width: number, height: number) =>
  Math.max(4, Math.min((height - 2 * CLOUD_MARGIN) * 0.32, (width - 2 * CLOUD_MARGIN) * 0.2));

const cycle = (pattern: readonly number[], count: number) =>
  Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);

export function cloudLayout(width: number, height: number): CloudLayout {
  const m = CLOUD_MARGIN;
  const corner = cornerReach(width, height);
  const along = Math.max(1, width - 2 * m - 2 * corner);
  const side = Math.max(1, height - 2 * m - 2 * corner);
  const topCount = Math.max(2, Math.round(along / (3 * m)));
  return {
    top: cycle(TOP_WIDTHS, topCount),
    topRise: cycle(TOP_RISES, topCount),
    bottom: cycle(BOTTOM_WIDTHS, Math.max(2, Math.round(along / (3.8 * m)))),
    sides: Math.max(1, Math.round(side / (2.6 * m))),
  };
}

/** Imparte segmentul [from, to] in bucati proportionale cu `weights`; intoarce capetele interioare + final. */
function split(from: number, to: number, weights: readonly number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let acc = 0;
  return weights.map((w) => {
    acc += w;
    return from + ((to - from) * acc) / total;
  });
}

/**
 * Conturul norului in dreptunghiul (x, y, width, height): lobi mari sus, lobi
 * turtiti jos, cate unul sau doi pe laturi si cate un lob rotund in fiecare colt.
 * Cusatura se obtine chemand functia cu un dreptunghi mai mic si ACELASI layout,
 * ca lobii ei sa urmeze exact lobii marginii.
 */
export function cloudPath(
  x: number,
  y: number,
  width: number,
  height: number,
  layout: CloudLayout,
): ShapePath {
  const m = CLOUD_MARGIN;
  const corner = cornerReach(width, height);
  const left = x + m;
  const right = x + width - m;
  const top = y + m;
  const bottom = y + height - m;

  const cornerRise = corner * 0.5;
  const sideRise = m * 0.8;
  const sides = Array.from({ length: layout.sides }, () => 1);
  const start = { x: left + corner, y: top };

  return closedPath(start, [
    // Sus: lobii mari, de inaltimi diferite, ca un nor adevarat.
    ...split(left + corner, right - corner, layout.top).map((px, i) => ({
      to: { x: px, y: top },
      rise: m * layout.topRise[i],
    })),
    { to: { x: right, y: top + corner }, rise: cornerRise },
    ...split(top + corner, bottom - corner, sides).map((py) => ({
      to: { x: right, y: py },
      rise: sideRise,
    })),
    { to: { x: right - corner, y: bottom }, rise: cornerRise },
    // Jos: lobi turtiti, ca in referinta.
    ...split(right - corner, left + corner, layout.bottom).map((px) => ({
      to: { x: px, y: bottom },
      rise: m * 0.5,
    })),
    { to: { x: left, y: bottom - corner }, rise: cornerRise },
    ...split(bottom - corner, top + corner, sides).map((py) => ({
      to: { x: left, y: py },
      rise: sideRise,
    })),
    { to: start, rise: cornerRise },
  ]);
}

/**
 * Liniutele cusaturii (6 plin / 4 gol) ajustate ca un numar intreg de perechi sa
 * incapa exact pe contur: fara o liniuta ciuntita acolo unde se inchide forma.
 */
export function stitchDash(length: number, period = 10): string {
  const step = length / Math.max(1, Math.round(length / period));
  return `${num(step * 0.6)} ${num(step * 0.4)}`;
}
