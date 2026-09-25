#!/usr/bin/env node
// Verifica ca fiecare nume din ICON_NAMES (icon-names.ts) are un <symbol id="..."> in
// public/icons/sprite.svg. Nu e un Vitest .spec.ts pentru ca Vitest (jsdom) nu are acces
// simplu la node:fs pentru citit fisiere din public/ in acest proiect; ruleaza separat:
//   node scripts/check-sprite.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const namesSource = readFileSync(join(root, 'src/app/shared/components/icon/icon-names.ts'), 'utf8');
const names = [...namesSource.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);

const sprite = readFileSync(join(root, 'public/icons/sprite.svg'), 'utf8');
const symbolIds = new Set([...sprite.matchAll(/<symbol\s+id="([^"]+)"/g)].map((m) => m[1]));

const missing = names.filter((name) => !symbolIds.has(name));
const extra = [...symbolIds].filter((id) => !names.includes(id));

if (missing.length > 0) {
  console.error(`Lipsesc din sprite.svg: ${missing.join(', ')}`);
}
if (extra.length > 0) {
  console.warn(`Simboluri in sprite.svg care nu mai sunt in ICON_NAMES: ${extra.join(', ')}`);
}

if (missing.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`OK: toate cele ${names.length} iconite din ICON_NAMES au un <symbol> in sprite.svg.`);
}
