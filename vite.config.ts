import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// Only core/src/store/ may import @tanstack/store, and core never imports React.
const coreRestrictedImports = [
  { name: 'react', message: 'core stays framework-agnostic.' },
  { name: 'react-dom', message: 'core stays framework-agnostic.' },
]
const tanstackStoreRestriction = {
  name: '@tanstack/store',
  message: 'Import createComponentStore from core/src/store/ instead.',
}
// Only core/src/virtual/ may import @tanstack/virtual-core, and only core/src/table/ may import
// @tanstack/table-core, subpaths included. Everything else uses core's wrappers.
const tanstackVirtualRestriction = {
  group: ['@tanstack/virtual-core', '@tanstack/virtual-core/*'],
  message: 'Import createListVirtualizer from @kvirn-ui/core instead.',
}
const tanstackTableRestriction = {
  group: ['@tanstack/table-core', '@tanstack/table-core/*'],
  message: 'Import useTable and the table re-exports from @kvirn-ui/core or @kvirn-ui/react.',
}
const tanstackPatterns = [tanstackVirtualRestriction, tanstackTableRestriction]
// core reaches the page only through the injected Env.
const coreRestrictedGlobals = [
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'matchMedia',
].map((name) => ({ name, message: 'Use the injected Env instead of globals.' }))

// Every Oxlint jsx-a11y rule, as errors. Static linting is the weakest a11y check,
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

// Workers per Vitest project. There are six projects and four of them start Chrome, each with its
// own pool. The default is a worker per core, which on a 28-thread machine is dozens of Chrome
// pages at once and makes the timing-based tests flaky (announcement throttles, 15s timeouts). A
// project doesn't inherit the root option, so every project sets it. Raise it for a one-off with
// `VITEST_MAX_WORKERS=4 vp test run <files>`.
const maxWorkers = Number(process.env['VITEST_MAX_WORKERS'] ?? 2)

/**
 * One Vitest project of Storybook stories. `env` sets the preview's initial Mode and Contrast
 * globals (apps/storybook/.storybook/preview.tsx), so every story starts in that theme.
 */
const storybookProject = (name: string, mode: 'light' | 'dark', contrast: 'standard' | 'more') => ({
  plugins: [storybookTest({ configDir: 'apps/storybook/.storybook' })],
  test: {
    name,
    maxWorkers,
    env: { VITE_STORYBOOK_MODE: mode, VITE_STORYBOOK_CONTRAST: contrast },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' as const }],
    },
  },
})

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
      'no-restricted-imports': [
        'error',
        { paths: [tanstackStoreRestriction], patterns: tanstackPatterns },
      ],
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
            {
              paths: [...coreRestrictedImports, tanstackStoreRestriction],
              patterns: tanstackPatterns,
            },
          ],
          'no-restricted-globals': ['error', ...coreRestrictedGlobals],
        },
      },
      {
        files: ['packages/core/src/store/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            { paths: coreRestrictedImports, patterns: tanstackPatterns },
          ],
        },
      },
      {
        files: ['packages/core/src/virtual/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [...coreRestrictedImports, tanstackStoreRestriction],
              patterns: [tanstackTableRestriction],
            },
          ],
        },
      },
      {
        files: ['packages/core/src/table/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [...coreRestrictedImports, tanstackStoreRestriction],
              patterns: [tanstackVirtualRestriction],
            },
          ],
        },
      },
      {
        files: ['packages/core/src/env/**'],
        rules: { 'no-restricted-globals': 'off' },
      },
    ],
  },
  test: {
    maxWorkers,
    projects: [
      {
        test: {
          name: 'node',
          maxWorkers,
          environment: 'node',
          include: ['packages/{core,i18n,theme}/src/**/*.test.ts', 'tooling/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          maxWorkers,
          include: [
            'packages/{react,testing}/src/**/*.test.{ts,tsx}',
            // The docs site shell is built on KvirnUI and tested like a component.
            'apps/docs/components/**/*.test.tsx',
          ],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      // Every story is a test: it renders, runs its play function and fails on any axe
      // violation. The same stories run once per theme.
      storybookProject('storybook', 'light', 'standard'),
      storybookProject('storybook-dark', 'dark', 'standard'),
      storybookProject('storybook-light-contrast', 'light', 'more'),
      storybookProject('storybook-dark-contrast', 'dark', 'more'),
    ],
  },
  run: {
    cache: true,
  },
})
