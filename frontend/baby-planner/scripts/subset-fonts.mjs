// Regenereaza fonturile din public/fonts/ (BP-UI-18: fonturi <= 60 kB).
//
// Pachetele @fontsource au doua fisiere per font (latin si latin-ext), fiecare
// cu sute de glife pe care interfata romaneasca nu le foloseste. Pastram doar
// ce afisam: ASCII, cateva litere Latin-1 frecvente in nume, diacriticele
// romanesti si punctuatia tipografica. O litera care lipseste nu strica nimic:
// browserul o ia din fontul urmator din `font-family` (system-ui).
//
// Rulare (o singura data, dupa ce actualizezi un pachet @fontsource):
//   npx --yes -p subset-font node scripts/subset-fonts.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// subset-font nu e dependinta a proiectului: il ia `npx -p subset-font` (sau un node_modules din directorul curent).
const subsetFont = require(require.resolve('subset-font', { paths: [process.cwd(), ...(process.env.NODE_PATH ?? '').split(';')] }));

const NM = new URL('../node_modules/', import.meta.url);
const OUT = new URL('../public/fonts/', import.meta.url);

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('');

/** Ce sta in fisierul "latin" (unicode-range-ul din _fonts.scss trebuie sa se potriveasca). */
const LATIN = range(0x20, 0x7e) + ' «°·»ÂÎâîéèëäöüç' + '–—‘’‚“”„…•€';
/** Ce sta in fisierul "ro" (din latin-ext). */
const ROMANIAN = 'ĂăȘșȚțŞşŢţ';

const FONTS = [
  // [pachet, prefixul fisierelor, numele de iesire, axa wght: interval sau o singura valoare]
  ['@fontsource-variable/nunito', 'nunito', 'wght-normal', 'nunito', { min: 400, max: 800 }],
  ['@fontsource/mali', 'mali', '600-normal', 'mali-600', undefined],
  ['@fontsource-variable/dancing-script', 'dancing-script', 'wght-normal', 'dancing-script-600', 600],
];

await mkdir(OUT, { recursive: true });
for (const [pkg, prefix, suffix, name, wght] of FONTS) {
  for (const [subset, text, label] of [
    ['latin', LATIN, 'latin'],
    ['latin-ext', ROMANIAN, 'ro'],
  ]) {
    const source = await readFile(new URL(`${pkg}/files/${prefix}-${subset}-${suffix}.woff2`, NM));
    const options = { targetFormat: 'woff2', ...(wght === undefined ? {} : { variationAxes: { wght } }) };
    const result = await subsetFont(source, text, options);
    await writeFile(new URL(`${name}-${label}.woff2`, OUT), result);
    console.log(`${name}-${label}.woff2`, `${(result.length / 1024).toFixed(1)} kB`);
  }
}
