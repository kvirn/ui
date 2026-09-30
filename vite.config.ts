import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// Only core/src/store/ may import @tanstack/store, and core never imports React (ADR-0003).
const coreRestrictedImports = [
  { name: 'react', message: 'core stays framework-agnostic (ADR-0003).' },
  { name: 'react-dom', message: 'core stays framework-agnostic (ADR-0003).' },
]
const tanstackStoreRestriction = {
  name: '@tanstack/store',
  message: 'Import createComponentStore from core/src/store/ instead (ADR-0003).',
}
// core reaches the page only through the injected Env (ADR-0003).
const coreRestrictedGlobals = [
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'matchMedia',
].map((name) => ({ name, message: 'Use the injected Env instead of globals (ADR-0003).' }))

// Every Oxlint jsx-a11y rule, as errors. Static linting is the weakest a11y check (ADR-0002),
// so all of it is on. Turning one off needs an ADR.
const jsxA11yRules = Object.fromEntries(
  [
    'alt-text',
    'anchor-ambiguous-text',
    'anchor-has-content',
    'anchor-is-valid',
    'aria-activedescendant-has-tabindex',
    'aria-props',
    'aria-proptypes',
    'aria-role',
    'aria-unsupported-elements',
    'autocomplete-valid',
    'click-events-have-key-events',
    'control-has-associated-label',
    'heading-has-content',
    'html-has-lang',
    'iframe-has-title',
    'img-redundant-alt',
    'interactive-supports-focus',
    'label-has-associated-control',
    'lang',
    'media-has-caption',
    'mouse-events-have-key-events',
    'no-access-key',
    'no-aria-hidden-on-focusable',
    'no-autofocus',
    'no-distracting-elements',
    'no-interactive-element-to-noninteractive-role',
    'no-noninteractive-element-interactions',
    'no-noninteractive-element-to-interactive-role',
    'no-noninteractive-tabindex',
    'no-redundant-roles',
    'no-static-element-interactions',
    'prefer-tag-over-role',
    'role-has-required-aria-props',
    'role-supports-aria-props',
    'scope',
    'tabindex-no-positive',
  ].map((rule) => [`jsx-a11y/${rule}`, 'error' as const]),
)

export default defineConfig({
  fmt: {
    singleQuote: true,
    semi: false,
    printWidth: 100,
    ignorePatterns: ['pnpm-lock.yaml', 'CHANGELOG.md'],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import', 'vitest'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    ignorePatterns: ['**/dist/**', '**/storybook-static/**', 'apps/docs/.next/**'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      ...jsxA11yRules,
      'vite-plus/prefer-vite-plus-imports': 'error',
      'react/iframe-missing-sandbox': 'error',
      'no-restricted-imports': ['error', { paths: [tanstackStoreRestriction] }],
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/ban-ts-comment': ['error', { 'ts-expect-error': true, 'ts-ignore': true }],
    },
    overrides: [
      {
        files: ['packages/core/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            { paths: [...coreRestrictedImports, tanstackStoreRestriction] },
          ],
          'no-restricted-globals': ['error', ...coreRestrictedGlobals],
        },
      },
      {
        files: ['packages/core/src/store/**'],
        rules: { 'no-restricted-imports': ['error', { paths: coreRestrictedImports }] },
      },
      {
        files: ['packages/core/src/env/**'],
        rules: { 'no-restricted-globals': 'off' },
      },
    ],
  },
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['packages/{core,i18n,theme}/src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['packages/{react,testing}/src/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        // Every story is a test: it renders, runs its play function and fails on any axe violation.
        plugins: [storybookTest({ configDir: 'apps/storybook/.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
  run: {
    cache: true,
  },
})
