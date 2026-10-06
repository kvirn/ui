import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'
import { workspaceSourceAlias } from './tooling/vite-preset/workspace-source.ts'

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
// ProseMirror is reached only through `@tiptap/pm/*`, so the editor has one copy of it (two copies
// break `instanceof` and plugin keys silently). Tiptap lives in `@kvirn-ui/rich-text` and the
// Storybook app only (Plan 0036): `@kvirn-ui/react` and `core` never import it.
const prosemirrorRestriction = {
  group: ['prosemirror-*', 'prosemirror-*/*'],
  message: 'Import ProseMirror through @tiptap/pm/* so there is one copy of it.',
}
const tiptapRestriction = {
  group: ['@tiptap/*', '@tiptap/*/*'],
  message:
    'Tiptap is used in @kvirn-ui/rich-text only. Keep Tiptap code out of the other packages.',
}
const tanstackPatterns = [tanstackVirtualRestriction, tanstackTableRestriction]
const editorPatterns = [prosemirrorRestriction, tiptapRestriction]
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
    'no-static-element-interactions',
    'prefer-tag-over-role',
    'role-has-required-aria-props',
    'role-supports-aria-props',
    'scope',
    'tabindex-no-positive',
  ].map((rule) => [`jsx-a11y/${rule}`, 'error' as const]),
)

// The one approved exception (2026-10-06): WebKit and VoiceOver drop the list role from a `ul` with
// `list-style: none`, so `role="list"` isn't redundant there (WCAG 1.3.1). No other element/role pair.
const noRedundantRoles: ['error', { ul: string[] }] = ['error', { ul: ['list'] }]

// Workers per Vitest project. There are six projects and four of them start Chrome, each with its
// own pool. The default is a worker per core, which on a 28-thread machine is dozens of Chrome
// pages at once and makes the timing-based tests flaky (announcement throttles, 15s timeouts). A
// project doesn't inherit the root option, so every project sets it. Raise it for a one-off with
// `VITEST_MAX_WORKERS=4 vp test run <files>`.
const maxWorkers = Number(process.env['VITEST_MAX_WORKERS'] ?? 2)

// Packages export their built `dist`; tests and stories run on the source.
const resolve = { alias: workspaceSourceAlias() }

/**
 * One Vitest project of Storybook stories. Run them one per `vp test run` (`vp run test`): several
 * `storybookTest()` servers in one process make story files fail to load at random. `env` sets the preview's initial Mode and Contrast
 * globals (apps/storybook/.storybook/preview.tsx), so every story starts in that theme.
 */
const storybookProject = (name: string, mode: 'light' | 'dark', contrast: 'standard' | 'more') => ({
  resolve,
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
      'jsx-a11y/no-redundant-roles': noRedundantRoles,
      'vite-plus/prefer-vite-plus-imports': 'error',
      'react/iframe-missing-sandbox': 'error',
      'no-restricted-imports': [
        'error',
        { paths: [tanstackStoreRestriction], patterns: [...tanstackPatterns, ...editorPatterns] },
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
              patterns: [...tanstackPatterns, ...editorPatterns],
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
            { paths: coreRestrictedImports, patterns: [...tanstackPatterns, ...editorPatterns] },
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
              patterns: [tanstackTableRestriction, ...editorPatterns],
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
              patterns: [tanstackVirtualRestriction, ...editorPatterns],
            },
          ],
        },
      },
      {
        files: ['packages/core/src/env/**'],
        rules: { 'no-restricted-globals': 'off' },
      },
      {
        // Tiptap is allowed here and in the Storybook app. ProseMirror is still only through
        // @tiptap/pm/*.
        files: ['packages/rich-text/**', 'apps/storybook/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [tanstackStoreRestriction],
              patterns: [...tanstackPatterns, prosemirrorRestriction],
            },
          ],
        },
      },
    ],
  },
  test: {
    maxWorkers,
    projects: [
      {
        resolve,
        test: {
          name: 'node',
          maxWorkers,
          environment: 'node',
          include: [
            'packages/{core,i18n,theme}/src/**/*.test.ts',
            'tooling/**/*.test.ts',
            'apps/docs/**/*.test.ts',
          ],
        },
      },
      {
        resolve,
        test: {
          name: 'browser',
          maxWorkers,
          include: [
            'packages/{react,testing,rich-text}/src/**/*.test.{ts,tsx}',
            'apps/docs/**/*.test.tsx',
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
