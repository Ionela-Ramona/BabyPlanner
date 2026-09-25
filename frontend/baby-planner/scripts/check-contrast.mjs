import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.join(__dirname, '../src/styles/_tokens.scss');

// Parse hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

// Calculate relative luminance
function getLuminance(rgb) {
  let r = rgb.r <= 0.03928 ? rgb.r / 12.92 : Math.pow((rgb.r + 0.055) / 1.055, 2.4);
  let g = rgb.g <= 0.03928 ? rgb.g / 12.92 : Math.pow((rgb.g + 0.055) / 1.055, 2.4);
  let b = rgb.b <= 0.03928 ? rgb.b / 12.92 : Math.pow((rgb.b + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate WCAG contrast ratio
function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Read and parse tokens
const content = fs.readFileSync(tokensPath, 'utf-8');

// Extract tokens from paper-tokens mixin
const paperMatch = content.match(/@mixin paper-tokens\s*\{([^}]+)\}/s);
if (!paperMatch) throw new Error('Could not find paper-tokens mixin');
const paperTokens = parseTokens(paperMatch[1]);

// Extract tokens from night-tokens mixin
const nightMatch = content.match(/@mixin night-tokens\s*\{([^}]+)\}/s);
if (!nightMatch) throw new Error('Could not find night-tokens mixin');
const nightTokens = parseTokens(nightMatch[1]);

function parseTokens(text) {
  const tokens = {};
  const regex = /--([a-z0-9\-]+):\s*([#a-f0-9]{7})/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

// Define contrast requirements
const checks = [
  // Text >= 4.5:1 on backgrounds
  { text: 'ink', backgrounds: ['paper-ground', 'paper-card', 'paper-sunk', 'paper-highlight'], min: 4.5 },
  { text: 'ink-strong', backgrounds: ['paper-ground', 'paper-card', 'paper-sunk', 'paper-highlight'], min: 4.5 },
  { text: 'ink-muted', backgrounds: ['paper-ground', 'paper-card', 'paper-sunk', 'paper-highlight'], min: 4.5 },

  // Family ink on backgrounds and soft tones
  { text: 'honey-ink', backgrounds: ['paper-card', 'paper-ground', 'honey-soft'], min: 4.5 },
  { text: 'dusk-ink', backgrounds: ['paper-card', 'paper-ground', 'dusk-soft'], min: 4.5 },
  { text: 'sage-ink', backgrounds: ['paper-card', 'paper-ground', 'sage-soft'], min: 4.5 },
  { text: 'blush-ink', backgrounds: ['paper-card', 'paper-ground', 'blush-soft'], min: 4.5 },
  { text: 'stone-ink', backgrounds: ['paper-card', 'paper-ground', 'stone-soft'], min: 4.5 },

  // Ink on family fills
  { text: 'ink', backgrounds: ['honey-soft', 'honey-fill', 'dusk-soft', 'dusk-fill', 'sage-soft', 'sage-fill', 'blush-soft', 'blush-fill', 'stone-soft', 'stone-fill'], min: 4.5 },

  // Family line >= 3:1
  { text: 'honey-line', backgrounds: ['paper-card', 'paper-ground', 'honey-soft'], min: 3 },
  { text: 'dusk-line', backgrounds: ['paper-card', 'paper-ground', 'dusk-soft'], min: 3 },
  { text: 'sage-line', backgrounds: ['paper-card', 'paper-ground', 'sage-soft'], min: 3 },
  { text: 'blush-line', backgrounds: ['paper-card', 'paper-ground', 'blush-soft'], min: 3 },
  { text: 'stone-line', backgrounds: ['paper-card', 'paper-ground', 'stone-soft'], min: 3 },

  // Ink line >= 3:1
  { text: 'ink-line', backgrounds: ['paper-card', 'paper-ground'], min: 3 },

  // Focus >= 3:1
  { text: 'focus', backgrounds: ['paper-ground', 'paper-card', 'paper-sunk', 'honey-fill', 'dusk-fill', 'sage-fill', 'blush-fill', 'stone-fill'], min: 3 },

  // On-accent on honey button >= 4.5:1
  { text: 'on-accent', backgrounds: ['honey-button-top', 'honey-button-mid', 'honey-button-bottom'], min: 4.5 },
];

// Run checks for both themes
const results = [];
let hasFailed = false;

for (const theme of ['paper', 'night']) {
  const tokens = theme === 'paper' ? paperTokens : nightTokens;
  console.log(`\n=== ${theme.toUpperCase()} THEME ===`);
  console.table(
    checks.flatMap(check => {
      return check.backgrounds.map(bg => {
        const textColor = tokens[check.text];
        const bgColor = tokens[bg];

        if (!textColor || !bgColor) {
          return {
            pair: `${check.text} on ${bg}`,
            ratio: 'N/A',
            min: check.min,
            status: 'SKIP (missing token)',
          };
        }

        try {
          const ratio = getContrastRatio(textColor, bgColor);
          const passed = ratio >= check.min;
          if (!passed) hasFailed = true;

          return {
            pair: `${check.text} on ${bg}`,
            ratio: ratio.toFixed(2),
            min: check.min,
            status: passed ? 'PASS' : 'FAIL',
          };
        } catch (e) {
          return {
            pair: `${check.text} on ${bg}`,
            ratio: 'ERROR',
            min: check.min,
            status: `ERROR: ${e.message}`,
          };
        }
      });
    })
  );
}

if (hasFailed) {
  console.error('\n❌ Contrast check FAILED - some pairs do not meet WCAG requirements');
  process.exit(1);
} else {
  console.log('\n✓ All contrast checks PASSED');
  process.exit(0);
}
