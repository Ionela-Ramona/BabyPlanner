import {
  CLOUD_MARGIN,
  SCALLOP_COUNT,
  circlePath,
  cloudLayout,
  cloudPath,
  roundedPath,
  scallopPath,
  stitchDash,
} from './shape-geometry';

/** Punctul de start si capetele fiecarui arc dintr-un `d`. */
function arcEnds(d: string): [number, number][] {
  return [...d.matchAll(/(?:M|A[\d.]+ [\d.]+ 0 0 1 )([\d.]+) ([\d.]+)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

describe('shape geometry', () => {
  it('should build the scallop from one arc per lobe', () => {
    const path = scallopPath(100);

    expect(path.d.startsWith('M')).toBe(true);
    expect(path.d.endsWith('Z')).toBe(true);
    expect(path.d.match(/A/g)?.length).toBe(SCALLOP_COUNT);
    // Festoanele fac conturul mai lung decat cercul inscris, dar nu cu mult.
    expect(path.length).toBeGreaterThan(Math.PI * 90);
    expect(path.length).toBeLessThan(Math.PI * 130);
  });

  it('should scale the scallop inside its box', () => {
    const vertices = arcEnds(scallopPath(80, 10).d);
    const xs = vertices.map(([x]) => x);
    const ys = vertices.map(([, y]) => y);

    // Varfurile dintre festoane stau in cutie si sunt centrate in ea.
    for (const value of [...xs, ...ys]) {
      expect(value).toBeGreaterThan(10);
      expect(value).toBeLessThan(90);
    }
    expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(100, 0);
  });

  it('should measure circles and rounded squares exactly', () => {
    expect(circlePath(100).length).toBeCloseTo(Math.PI * 100);
    expect(roundedPath(100, 0).length).toBeCloseTo(400);
    expect(roundedPath(100, 50).length).toBeCloseTo(Math.PI * 100);
  });

  it('should fit a whole number of dash pairs on the outline', () => {
    const length = 523.7;
    const [dash, gap] = stitchDash(length).split(' ').map(Number);
    const pairs = length / (dash + gap);

    expect(Math.abs(pairs - Math.round(pairs))).toBeLessThan(0.05);
    expect(dash + gap).toBeGreaterThan(8);
    expect(dash + gap).toBeLessThan(12);
  });

  it('should add lobes as the cloud gets wider instead of stretching them', () => {
    const narrow = cloudLayout(240, 140);
    const wide = cloudLayout(480, 140);

    expect(wide.top.length).toBeGreaterThan(narrow.top.length);
    expect(wide.bottom.length).toBeGreaterThanOrEqual(narrow.bottom.length);
  });

  it('should keep the cloud outline inside its box', () => {
    const layout = cloudLayout(320, 150);
    const path = cloudPath(0, 0, 320, 150, layout);
    const points = arcEnds(path.d);

    expect(points.length).toBeGreaterThan(8);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(CLOUD_MARGIN);
      expect(x).toBeLessThanOrEqual(320 - CLOUD_MARGIN);
      expect(y).toBeGreaterThanOrEqual(CLOUD_MARGIN);
      expect(y).toBeLessThanOrEqual(150 - CLOUD_MARGIN);
    }
  });
});
