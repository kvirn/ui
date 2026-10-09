import {
  colorSchemeAttribute,
  contrastAttribute,
  createThemeScriptSource,
  motionAttribute,
  createThemeStore,
  themeStorageKey,
} from '@kvirn-ui/core'
import type {
  ColorSchemePreference,
  ContrastPreference,
  MotionPreference,
  StoredThemePreference,
  ThemeScriptOptions,
} from '@kvirn-ui/core'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { cdp } from 'vite-plus/test/browser'
import { KvirnThemeScript } from './kvirn-theme-script.tsx'

const colorSchemes: ColorSchemePreference[] = ['light', 'dark', 'system']
const contrasts: ContrastPreference[] = ['standard', 'more', 'system']
const motions: MotionPreference[] = ['full', 'reduce', 'system']

const storedPreferences: (StoredThemePreference | undefined)[] = [
  undefined,
  {},
  ...colorSchemes.flatMap((colorScheme) =>
    contrasts.map((contrast): StoredThemePreference => ({ colorScheme, contrast })),
  ),
  ...colorSchemes.map((colorScheme): StoredThemePreference => ({ colorScheme })),
  ...contrasts.map((contrast): StoredThemePreference => ({ contrast })),
  ...motions.map((motion): StoredThemePreference => ({ motion })),
  { colorScheme: 'dark', contrast: 'more', motion: 'reduce' },
]

const systems = [
  { colorScheme: 'light', contrast: 'no-preference', motion: 'no-preference' },
  { colorScheme: 'light', contrast: 'more', motion: 'reduce' },
  { colorScheme: 'dark', contrast: 'no-preference', motion: 'reduce' },
  { colorScheme: 'dark', contrast: 'more', motion: 'no-preference' },
  { colorScheme: 'dark', contrast: 'less', motion: 'no-preference' },
] as const

const optionSets: ThemeScriptOptions[] = [
  {},
  { defaultColorScheme: 'dark', defaultContrast: 'more' },
  { defaultColorScheme: 'light', defaultContrast: 'standard' },
  { defaultMotion: 'reduce' },
]

function runThemeScript(source: string) {
  const root = document.documentElement
  root.removeAttribute(colorSchemeAttribute)
  root.removeAttribute(contrastAttribute)
  root.removeAttribute(motionAttribute)
  const script = document.createElement('script')
  script.textContent = source
  document.head.append(script)
  script.remove()
  return {
    colorScheme: root.getAttribute(colorSchemeAttribute),
    contrast: root.getAttribute(contrastAttribute),
    motion: root.getAttribute(motionAttribute),
  }
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  localStorage.clear()
})

describe('KvirnThemeScript stays in sync with the theme store', () => {
  test('sets the same attributes as the store for every preference × system combination', async () => {
    let combinations = 0
    for (const system of systems) {
      await cdp().send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'prefers-color-scheme', value: system.colorScheme },
          { name: 'prefers-contrast', value: system.contrast },
          { name: 'prefers-reduced-motion', value: system.motion },
        ],
      })
      for (const options of optionSets) {
        const source = createThemeScriptSource(options)
        for (const stored of storedPreferences) {
          if (stored === undefined) {
            localStorage.removeItem(themeStorageKey)
          } else {
            localStorage.setItem(themeStorageKey, JSON.stringify(stored))
          }
          const themeStore = createThemeStore(
            { window, document: document.implementation.createHTMLDocument('') },
            options,
          )
          // The combination is part of the compared value, so a failure names it.
          expect({ system, options, stored, attributes: runThemeScript(source) }).toEqual({
            system,
            options,
            stored,
            attributes: themeStore.getState().resolved,
          })
          combinations += 1
        }
      }
    }
    expect(combinations).toBe(systems.length * optionSets.length * storedPreferences.length)
  })

  test('ignores corrupt storage like the store does', () => {
    for (const corrupt of ['{', '"dark"', 'null', '[]', JSON.stringify({ colorScheme: 'blue' })]) {
      localStorage.setItem(themeStorageKey, corrupt)
      const themeStore = createThemeStore({
        window,
        document: document.implementation.createHTMLDocument(''),
      })
      expect({ corrupt, attributes: runThemeScript(createThemeScriptSource()) }).toEqual({
        corrupt,
        attributes: themeStore.getState().resolved,
      })
    }
  })
})

describe('KvirnThemeScript', () => {
  test('renders an inline script with the CSP nonce and the generated source', () => {
    const html = renderToString(
      <KvirnThemeScript
        nonce="r4nd0m"
        theme={{ defaultColorScheme: 'dark', defaultContrast: 'more' }}
      />,
    )
    const template = document.createElement('template')
    template.innerHTML = html
    const script = template.content.querySelector('script')
    expect(script?.getAttribute('nonce')).toBe('r4nd0m')
    expect(script?.textContent).toBe(
      createThemeScriptSource({ defaultColorScheme: 'dark', defaultContrast: 'more' }),
    )
  })
})
