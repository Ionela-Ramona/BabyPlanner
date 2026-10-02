// Scrie .impeccable/design.json (sidecar-ul de tokeni citit de unelte) din
// src/styles/_tokens.scss, ca fisierul JSON sa nu poata deveni o a doua sursa de adevar.
//
// Rulare: node scripts/export-tokens.mjs   (sau npm run export:tokens)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const source = readFileSync(new URL('../src/styles/_tokens.scss', import.meta.url), 'utf8');

/** Corpul fiecarui `@mixin nume { ... }` (tokenii nu au acolade imbricate). */
function mixins(scss) {
  const result = {};
  for (const match of scss.matchAll(/@mixin ([\w-]+)\s*\{([\s\S]*?)\n\}/g)) {
    const body = match[2].replace(/\/\*[\s\S]*?\*\//g, '');
    result[match[1]] = Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
    );
  }
  return result;
}

const all = mixins(source);
const backgrounds = Object.fromEntries(
  Object.entries(all)
    .filter(([name]) => name.startsWith('background-'))
    .map(([name, tokens]) => [name.replace('background-', ''), tokens]),
);

const design = {
  name: 'BabyPlanner — baby-book paper',
  source: 'frontend/baby-planner/src/styles/_tokens.scss',
  generatedBy: 'frontend/baby-planner/scripts/export-tokens.mjs',
  themes: {
    paper: all['paper-tokens'],
    night: all['night-tokens'],
  },
  backgrounds: { cream: {}, ...backgrounds },
  static: all['static-tokens'],
  semantic: all['semantic-tokens'],
  activityTypes: {
    Feeding: { label: 'Masă', family: 'honey', icon: 'feeding' },
    Sleep: { label: 'Somn', family: 'dusk', icon: 'sleep' },
    Diaper: { label: 'Scutec', family: 'sage', icon: 'diaper' },
    Medicine: { label: 'Medicamente', family: 'blush', icon: 'medicine' },
    Other: { label: 'Altele', family: 'stone', icon: 'other' },
  },
  borders: ['stitch', 'rim', 'scallop', 'baseline'],
  gradients: ['paper-wash', 'card-lift', 'honey-button'],
};

const out = new URL('../../../.impeccable/design.json', import.meta.url);
mkdirSync(new URL('.', out), { recursive: true });
writeFileSync(out, JSON.stringify(design, null, 2) + '\n');
const count = Object.values(design.themes).concat(Object.values(backgrounds), design.static, design.semantic)
  .reduce((sum, tokens) => sum + Object.keys(tokens).length, 0);
console.log(`design.json: ${count} tokens`);
