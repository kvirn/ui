import type { Preview } from '@storybook/react-vite'
import { getDefaultEnv, getThemeStore } from '@kvirn-ui/core'
import type { ColorSchemePreference, ContrastPreference } from '@kvirn-ui/core'
import { wcagTags } from '@kvirn-ui/testing'
// The default theme (ADR-0013), as text, so the Theme toolbar can take it off the page again:
// "None (unstyled)" shows the headless components exactly as they ship, with no CSS.
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
// Self-hosted Inter, the same files as the docs site: no network request (hard rule 7).
import '../../docs/fonts/inter/inter.css'
import '../src/story-canvas.css'

/** The Theme toolbar's values. `system` follows the OS on both axes. */
const storyThemes = {
  system: ['system', 'system'],
  light: ['light', 'standard'],
  dark: ['dark', 'standard'],
  'light-contrast': ['light', 'more'],
  'dark-contrast': ['dark', 'more'],
} as const satisfies Record<string, readonly [ColorSchemePreference, ContrastPreference]>
type StoryTheme = keyof typeof storyThemes | 'none'

const isStoryTheme = (value: unknown): value is StoryTheme =>
  typeof value === 'string' && (value === 'none' || value in storyThemes)

const themeStyleId = 'kv-theme-css'

/** Adds or removes theme.css, as importing it or not would. */
function setThemeStylesheet(isEnabled: boolean): void {
  const existing = document.getElementById(themeStyleId)
  if (isEnabled && existing === null) {
    const style = document.createElement('style')
    style.id = themeStyleId
    style.textContent = themeCss
    document.head.append(style)
  } else if (!isEnabled) {
    existing?.remove()
  }
}

/**
 * Selects the theme through the document's theme store, like a user would. Writing the
 * `data-kv-*` attributes directly wouldn't last: a provider re-applies the store's values.
 */
function selectStoryTheme(theme: keyof typeof storyThemes): void {
  const [colorScheme, contrast] = storyThemes[theme]
  const themeStore = getThemeStore(getDefaultEnv())
  themeStore.actions.selectColorScheme(colorScheme)
  themeStore.actions.selectContrast(contrast)
}

/** Back to `system` on both axes, which also removes the stored key. */
const resetStoryTheme = (): void => selectStoryTheme('system')

const isFixedTheme = (theme: StoryTheme) => theme !== 'system' && theme !== 'none'

/**
 * The themed canvas. `system` and `none` don't select anything, so the provider's own theme
 * stories and a stored choice keep working.
 */
function StoryCanvas({
  theme,
  locale,
  dir,
  forcedColors,
  children,
}: {
  theme: StoryTheme
  locale: string
  dir: string
  forcedColors: string
  children: ReactNode
}) {
  // Like a provider: the store follows the OS and writes the resolved theme to <html>.
  useLayoutEffect(() => getThemeStore(getDefaultEnv()).connect(), [])
  useLayoutEffect(() => {
    if (theme === 'system' || theme === 'none') {
      return undefined
    }
    selectStoryTheme(theme)
    return resetStoryTheme
  }, [theme])
  return (
    // Unstyled means the browser's defaults: no canvas styles either.
    <div
      className={theme === 'none' ? undefined : 'kv-story-canvas'}
      lang={locale}
      dir={dir}
      data-forced-colors={forcedColors}
    >
      {children}
    </div>
  )
}

const preview: Preview = {
  globalTypes: {
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
    theme: {
      description:
        'Selects the theme through the theme store, or removes theme.css. The fixed theme stories are the axe gate',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'system', title: 'Follow system' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'light-contrast', title: 'Light, high contrast' },
          { value: 'dark-contrast', title: 'Dark, high contrast' },
          { value: 'none', title: 'None (unstyled)' },
        ],
      },
    },
  },
  initialGlobals: { locale: 'sv', dir: 'ltr', forcedColors: 'none', theme: 'system' },
  decorators: [
    (Story, context) => {
      const theme = isStoryTheme(context.globals['theme']) ? context.globals['theme'] : 'system'
      setThemeStylesheet(theme !== 'none')
      return (
        <StoryCanvas
          theme={theme}
          locale={String(context.globals['locale'] ?? 'sv')}
          dir={String(context.globals['dir'] ?? 'ltr')}
          forcedColors={String(context.globals['forcedColors'] ?? 'none')}
        >
          <Story />
        </StoryCanvas>
      )
    },
  ],
  // A fixed theme must not leak into the next story, even if the canvas isn't unmounted.
  beforeEach: ({ globals }) =>
    isStoryTheme(globals['theme']) && isFixedTheme(globals['theme']) ? resetStoryTheme : undefined,
  parameters: {
    layout: 'fullscreen',
    // Every story state is an axe test in `vp test run` (AGENTS.md, gate 2). Never lower to 'todo' or 'off'.
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: [...wcagTags] } },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundation',
          [
            'Overview',
            'Colors',
            ['Palette', 'Semantic tokens', 'Text on surface'],
            'Typography',
            ['Type scale', 'Prose'],
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
}

export default preview
