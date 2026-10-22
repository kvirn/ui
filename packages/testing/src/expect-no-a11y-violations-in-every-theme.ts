import { expectNoA11yViolations } from './expect-no-a11y-violations.ts'

export interface A11yTheme {
  colorScheme: 'light' | 'dark'
  contrast: 'standard' | 'more'
}

/** The part of `@kvirn-ui/core`'s theme store the helper needs, so this package stays dependency-free. */
export interface A11yThemeStore {
  connect: () => () => void
  getState: () => {
    preference: {
      colorScheme: 'light' | 'dark' | 'system'
      contrast: 'standard' | 'more' | 'system'
    }
  }
  actions: {
    selectColorScheme: (colorScheme: 'light' | 'dark' | 'system') => void
    selectContrast: (contrast: 'standard' | 'more' | 'system') => void
  }
}

export interface ExpectNoA11yViolationsInEveryThemeOptions {
  /** The document's theme store: `getThemeStore(getDefaultEnv())` from `@kvirn-ui/core`. */
  themeStore: A11yThemeStore
  /** Defaults to all four combinations. */
  themes?: readonly A11yTheme[]
}

export const everyA11yTheme: readonly A11yTheme[] = [
  { colorScheme: 'light', contrast: 'standard' },
  { colorScheme: 'dark', contrast: 'standard' },
  { colorScheme: 'light', contrast: 'more' },
  { colorScheme: 'dark', contrast: 'more' },
]

const themeAttributes = ['data-kv-color-scheme', 'data-kv-contrast'] as const

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

// The store write notifies React, which commits on the next frame; the second frame lets effects run.
async function settle() {
  await nextFrame()
  await nextFrame()
}

/**
 * Runs `expectNoA11yViolations` on `element` once per theme, switching through the theme store
 * like a user would, and throws one error that names every failing theme. The selection and the
 * `<html>` attributes from before the call are restored, also when it throws.
 */
export async function expectNoA11yViolationsInEveryTheme(
  element: Element,
  { themeStore, themes = everyA11yTheme }: ExpectNoA11yViolationsInEveryThemeOptions,
): Promise<void> {
  if (themes.length === 0) {
    throw new Error(
      'expectNoA11yViolationsInEveryTheme: `themes` is empty, so nothing would be checked.',
    )
  }
  const root = document.documentElement
  const previousPreference = themeStore.getState().preference
  const previousAttributes = themeAttributes.map((name) => [name, root.getAttribute(name)] as const)
  const disconnect = themeStore.connect()
  const failures: string[] = []
  try {
    for (const theme of themes) {
      themeStore.actions.selectColorScheme(theme.colorScheme)
      themeStore.actions.selectContrast(theme.contrast)
      await settle()
      try {
        await expectNoA11yViolations(element)
      } catch (error) {
        failures.push(
          `${theme.colorScheme}/${theme.contrast}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  } finally {
    themeStore.actions.selectColorScheme(previousPreference.colorScheme)
    themeStore.actions.selectContrast(previousPreference.contrast)
    await settle()
    disconnect()
    for (const [name, value] of previousAttributes) {
      if (value === null) root.removeAttribute(name)
      else root.setAttribute(name, value)
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `Accessibility violations in ${failures.length} of ${themes.length} themes:\n${failures.join('\n')}`,
    )
  }
}
