import type { Decorator, Preview } from '@storybook/react-vite'
import { getDefaultEnv, getThemeStore } from '@kvirn-ui/core'
import type { ColorSchemePreference, ContrastPreference } from '@kvirn-ui/core'
import { wcagTags } from '@kvirn-ui/testing'
import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
// Self-hosted Inter, the same files as the docs site: no network request (hard rule 7).
import '../../docs/fonts/inter/inter.css'
// The default theme (ADR-0013), as an adopter imports it.
import '@kvirn-ui/theme/theme.css'
import './preview.css'

/** The Mode toolbar: a colour scheme, or `system` to follow the device. */
type StoryMode = ColorSchemePreference
/** The Contrast toolbar: the theme store's contrast without `system`. */
type StoryContrast = Exclude<ContrastPreference, 'system'>

const modeOf = (value: unknown): StoryMode =>
  value === 'dark' || value === 'system' ? value : 'light'
const contrastOf = (value: unknown): StoryContrast => (value === 'more' ? 'more' : 'standard')

/**
 * Selects the theme through the document's theme store, like a user would. Writing the
 * `data-kv-color-scheme` and `data-kv-contrast` attributes directly wouldn't last: a provider
 * re-applies the store's values.
 */
function selectStoryTheme(colorScheme: ColorSchemePreference, contrast: ContrastPreference) {
  const themeStore = getThemeStore(getDefaultEnv())
  themeStore.actions.selectColorScheme(colorScheme)
  themeStore.actions.selectContrast(contrast)
}

/** Back to `system` on both axes, which also removes the stored key. */
const resetStoryTheme = (): void => selectStoryTheme('system', 'system')

/** Stories that drive the theme store themselves set `parameters: { themeStore: 'story' }`. */
const drivesThemeStore = (parameters: Record<string, unknown>): boolean =>
  parameters['themeStore'] === 'story'

/**
 * `lang`, `dir` and the theme on `<html>`, so the story itself needs no wrapper. On a Docs
 * page the last story wins: they share one document (ADR-0023).
 */
function StoryEnvironment({
  theme,
  locale,
  dir,
  forcedColors,
  children,
}: {
  /** `undefined` when the story drives the theme store itself. */
  theme: { mode: StoryMode; contrast: StoryContrast } | undefined
  locale: string
  dir: string
  forcedColors: string
  children: ReactNode
}) {
  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = { lang: root.lang, dir: root.dir, forcedColors: root.dataset.forcedColors }
    root.lang = locale
    root.dir = dir
    root.dataset.forcedColors = forcedColors
    // Restore on cleanup, so a docs page without stories (the Introduction) doesn't keep the
    // last story's language or direction (3.1.1, 3.1.2).
    return () => {
      root.lang = previous.lang
      root.dir = previous.dir
      if (previous.forcedColors === undefined) delete root.dataset.forcedColors
      else root.dataset.forcedColors = previous.forcedColors
    }
  }, [locale, dir, forcedColors])
  const mode = theme?.mode
  const contrast = theme?.contrast
  useLayoutEffect(() => {
    if (mode === undefined || contrast === undefined) {
      return undefined
    }
    // Like a provider: the store follows the OS and writes the resolved theme to <html>.
    const disconnect = getThemeStore(getDefaultEnv()).connect()
    selectStoryTheme(mode, contrast)
    return () => {
      resetStoryTheme()
      disconnect()
    }
  }, [mode, contrast])
  return children
}

const withStoryEnvironment: Decorator = (Story, { globals, parameters }) => (
  <StoryEnvironment
    theme={
      drivesThemeStore(parameters)
        ? undefined
        : { mode: modeOf(globals['mode']), contrast: contrastOf(globals['contrast']) }
    }
    locale={String(globals['locale'] ?? 'sv')}
    dir={String(globals['dir'] ?? 'ltr')}
    forcedColors={String(globals['forcedColors'] ?? 'none')}
  >
    <Story />
  </StoryEnvironment>
)

const preview: Preview = {
  globalTypes: {
    mode: {
      description: 'Colour scheme, selected through the theme store',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System (follows the device)', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
    contrast: {
      description: 'Contrast, selected through the theme store',
      toolbar: {
        title: 'Contrast',
        icon: 'contrast',
        items: [
          { value: 'standard', title: 'Standard contrast' },
          { value: 'more', title: 'More contrast' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale for component strings',
      toolbar: { title: 'Locale', items: ['sv', 'fi', 'nb', 'nn', 'se', 'en'] },
    },
    dir: {
      description: 'Text direction',
      toolbar: { title: 'Direction', items: ['ltr', 'rtl'] },
    },
    forcedColors: {
      description:
        'Marks forced-colors stories. Real emulation runs in the chromium-forced-colors e2e project',
      toolbar: { title: 'Forced colors', items: ['none', 'active'] },
    },
  },
  // The four storybook Vitest projects (root vite.config.ts) start every story in one theme
  // each, so axe checks every story in all four (ADR-0023).
  initialGlobals: {
    mode: modeOf(import.meta.env.VITE_STORYBOOK_MODE),
    contrast: contrastOf(import.meta.env.VITE_STORYBOOK_CONTRAST),
    locale: 'sv',
    dir: 'ltr',
    forcedColors: 'none',
  },
  decorators: [withStoryEnvironment],
  // A selected theme must not leak into the next story, even if the canvas isn't unmounted.
  beforeEach: ({ parameters }) => (drivesThemeStore(parameters) ? undefined : resetStoryTheme),
  parameters: {
    // Every story state is an axe test in `vp test run` (AGENTS.md, gate 2). Never lower to 'todo' or 'off'.
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: [...wcagTags] } },
    },
    // Semantic tokens, so the canvas follows the theme. None is selected by default: the
    // body already has the canvas colour (preview.css), and the addon's background transition
    // would race axe's contrast check after a theme change.
    backgrounds: {
      options: {
        canvas: { name: 'Canvas', value: 'var(--kv-color-canvas)' },
        surface: { name: 'Surface', value: 'var(--kv-color-surface)' },
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundation',
          [
            // Colors and Typography have several stories each, in their file's export order:
            // storySort orders titles only.
            'Overview',
            'Colors',
            'Typography',
            'Prose',
            'Spacing',
            'Radius',
            'Borders and elevation',
            'Focus ring',
            'Motion',
            'Density',
            'Layout',
            'Theming',
            'KvirnProvider',
          ],
          'Components',
          '*',
        ],
      },
    },
  },
  tags: ['autodocs'],
}

export default preview
