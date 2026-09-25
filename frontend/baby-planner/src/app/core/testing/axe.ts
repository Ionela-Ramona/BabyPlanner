import { ComponentFixture } from '@angular/core/testing';
import axe from 'axe-core';

/**
 * Reguli pe care jsdom nu le poate verifica: nu calculeaza layout si culori reale,
 * deci contrastul ar da rezultate false. Contrastul il verificam separat, pe
 * token-uri (`npm run check:contrast`), si in browser, cu axe pe fiecare ruta.
 */
const RULES_NEEDING_A_BROWSER = ['color-contrast', 'color-contrast-enhanced'];

/**
 * Ruleaza axe-core pe ce a randat fixture-ul si pica testul la orice incalcare.
 *
 * Un fragment nu e o pagina intreaga, asa ca oprim regulile care cer structura
 * de document (landmark-uri, titlu, `lang`): pe acelea le prinde verificarea pe rute.
 * Mesajul de eroare listeaza regula si selectorul, ca sa gasesti repede elementul.
 */
export async function expectNoAxeViolations(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();

  const results = await axe.run(fixture.nativeElement as HTMLElement, {
    rules: Object.fromEntries(
      [
        ...RULES_NEEDING_A_BROWSER,
        'region',
        'landmark-one-main',
        'page-has-heading-one',
        'document-title',
        'html-has-lang',
      ].map((id) => [id, { enabled: false }]),
    ),
  });

  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.help}\n` +
      violation.nodes.map((node) => `  - ${node.target.join(' ')}`).join('\n'),
  );
  expect(summary, summary.join('\n')).toEqual([]);
}
