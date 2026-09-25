// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Lint pentru TypeScript si pentru template-urile Angular.
 *
 * Regulile de accesibilitate din template (`templateAccessibility`) prind devreme
 * greseli pe care altfel le-am vedea abia in AXE: imagini fara alt, click fara
 * tastatura, etichete lipsa. Prefixul `app` tine selectoarele unitare.
 */
module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // Componentele din kit isi pun singure continutul / aria-label (din `label`),
      // deci un `<button app-icon-button label="...">` gol in template e corect.
      '@angular-eslint/template/elements-content': [
        'error',
        { allowList: ['app-add-button', 'app-icon-button', 'label'] },
      ],
    },
  },
]);
