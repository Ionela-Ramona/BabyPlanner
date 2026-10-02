import balloon from '../../../../../public/illustrations/balloon.svg';
import blocks from '../../../../../public/illustrations/blocks.svg';
import cloud from '../../../../../public/illustrations/cloud.svg';
import sleepyStar from '../../../../../public/illustrations/sleepy-star.svg';

/**
 * Ilustratiile starilor goale, puse inline (text SVG in bundle), nu ca `<img>`.
 *
 * Pe o pagina goala ilustratia e cel mai mare element, deci LCP-ul. Ca `<img>`,
 * browserul o descoperea abia dupa ce randa pagina si mai facea o cerere pentru
 * ea; inline, apare odata cu textul. Sunt mici (sub 3 kB fiecare, fara comentarii)
 * si decorative: `aria-hidden`, fara `id`-uri care s-ar putea ciocni in pagina.
 *
 * Aceleasi fisiere raman in public/illustrations/ pentru `<img>`-urile din profil,
 * bun venit si vitrina.
 */
export const EMPTY_STATE_ILLUSTRATIONS = {
  'balloon.svg': prepare(balloon),
  'blocks.svg': prepare(blocks),
  'cloud.svg': prepare(cloud),
  'sleepy-star.svg': prepare(sleepyStar),
} as const;

export type EmptyStateIllustration = keyof typeof EMPTY_STATE_ILLUSTRATIONS;

/** Scoate comentariile si fixeaza marimea (160px, ca vechiul `<img>`), decorativ. */
function prepare(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace('<svg ', '<svg width="160" height="160" aria-hidden="true" focusable="false" ')
    .trim();
}
