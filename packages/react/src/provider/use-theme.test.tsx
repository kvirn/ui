import { colorSchemeAttribute, contrastAttribute, themeStorageKey } from '@kvirn-ui/core'
import type { Env } from '@kvirn-ui/core'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { cdp, page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from './kvirn-provider.tsx'
import type { KvirnProviderProps } from './kvirn-provider.tsx'
import { ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'

interface MediaFeature {
  name: 'prefers-color-scheme' | 'prefers-contrast' | 'forced-colors'
  value: string
}

/** Real OS-preference emulation through Chromium's DevTools protocol, not a mocked matchMedia. */
async function emulateSystem(features: MediaFeature[]) {
  await cdp().send('Emulation.setEmulatedMedia', { features })
}

/** A fresh document per test gives a fresh per-document theme store. */
function createEnv(): Env {
  return { window, document: document.implementation.createHTMLDocument('') }
}

function renderSwitcher(env: Env, providerProps: Omit<KvirnProviderProps, 'children'> = {}) {
  return render(
    <KvirnProvider locale="sv-SE" messages={sv} env={env} {...providerProps}>
      <ThemeSwitcherFixture />
    </KvirnProvider>,
  )
}

const radio = (name: string) => page.getByRole('radio', { name, exact: true })
const readStorage = () => localStorage.getItem(themeStorageKey)
const readAttributes = (env: Env) => ({
  colorScheme: env.document.documentElement.getAttribute(colorSchemeAttribute),
  contrast: env.document.documentElement.getAttribute(contrastAttribute),
})

let consoleWarn: MockInstance<Console['warn']>

beforeEach(async () => {
  localStorage.clear()
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  await emulateSystem([
    { name: 'prefers-color-scheme', value: 'light' },
    { name: 'prefers-contrast', value: 'no-preference' },
  ])
})

afterEach(async () => {
  consoleWarn.mockRestore()
  await emulateSystem([])
  localStorage.clear()
})

describe('theme preference', () => {
  test('follows the OS until the user chooses', async () => {
    await emulateSystem([
      { name: 'prefers-color-scheme', value: 'dark' },
      { name: 'prefers-contrast', value: 'more' },
    ])
    const env = createEnv()
    const { container } = await renderSwitcher(env)

    await expect.element(radio('Följ systemet').first()).toBeChecked()
    await expect.element(page.getByText('Används nu: Mörkt, Hög kontrast')).toBeVisible()
    expect(readAttributes(env)).toEqual({ colorScheme: 'dark', contrast: 'more' })
    expect(readStorage()).toBeNull()
    await expectNoA11yViolations(container)
  })

  test('OS changes update the resolved values while the preference is system', async () => {
    const env = createEnv()
    await renderSwitcher(env)
    await expect.element(page.getByText('Används nu: Ljust, Normal kontrast')).toBeVisible()

    await emulateSystem([
      { name: 'prefers-color-scheme', value: 'dark' },
      { name: 'prefers-contrast', value: 'more' },
    ])
    await expect.element(page.getByText('Används nu: Mörkt, Hög kontrast')).toBeVisible()
    expect(readAttributes(env)).toEqual({ colorScheme: 'dark', contrast: 'more' })
    expect(readStorage()).toBeNull()
  })

  test('an explicit choice wins over the OS', async () => {
    const env = createEnv()
    await renderSwitcher(env)
    await radio('Ljust').click()
    await emulateSystem([{ name: 'prefers-color-scheme', value: 'dark' }])
    await expect.element(radio('Ljust')).toBeChecked()
    await expect.element(page.getByText('Används nu: Ljust, Normal kontrast')).toBeVisible()
    expect(readAttributes(env).colorScheme).toBe('light')
  })

  test('selecting persists the choice, and a new page load reads it', async () => {
    const env = createEnv()
    const screen = await renderSwitcher(env)
    await radio('Mörkt').click()
    await radio('Hög kontrast').click()
    await expect.element(page.getByText('Används nu: Mörkt, Hög kontrast')).toBeVisible()
    expect(JSON.parse(readStorage() ?? 'null')).toEqual({ colorScheme: 'dark', contrast: 'more' })
    expect(readAttributes(env)).toEqual({ colorScheme: 'dark', contrast: 'more' })
    await screen.unmount()

    await renderSwitcher(createEnv())
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect.element(radio('Hög kontrast')).toBeChecked()
  })

  test('selecting system on both axes clears storage', async () => {
    localStorage.setItem(themeStorageKey, JSON.stringify({ colorScheme: 'dark', contrast: 'more' }))
    await renderSwitcher(createEnv())
    await expect.element(radio('Mörkt')).toBeChecked()

    await radio('Följ systemet').first().click()
    expect(JSON.parse(readStorage() ?? 'null')).toEqual({ contrast: 'more' })
    await radio('Följ systemet').last().click()
    await expect.element(radio('Följ systemet').last()).toBeChecked()
    expect(readStorage()).toBeNull()
  })

  test('arrow keys change the radio group; focus stays and nothing is announced', async () => {
    await renderSwitcher(createEnv())
    const system = radio('Följ systemet').first()
    await expect.element(system).toBeChecked()
    await userEvent.tab()
    await expect.element(system).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect.element(radio('Mörkt')).toHaveFocus()
    await expect.element(page.getByText('Används nu: Mörkt, Normal kontrast')).toBeVisible()

    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('Följ systemet').first()).toBeChecked()
    // The provider's two live regions exist, and stay empty: nothing is announced.
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
    await expect.element(page.getByRole('alert')).toBeEmptyDOMElement()
  })

  test('syncs with another tab through the storage event', async () => {
    await renderSwitcher(createEnv())
    await expect.element(radio('Följ systemet').first()).toBeChecked()

    localStorage.setItem(themeStorageKey, JSON.stringify({ colorScheme: 'dark' }))
    window.dispatchEvent(new StorageEvent('storage', { key: themeStorageKey }))
    await expect.element(radio('Mörkt')).toBeChecked()
  })

  test('theme options set the defaults and the storage', async () => {
    await renderSwitcher(createEnv(), {
      theme: { defaultColorScheme: 'dark', defaultContrast: 'more', storage: 'none' },
    })
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect.element(radio('Hög kontrast')).toBeChecked()
    await radio('Ljust').click()
    await expect.element(radio('Ljust')).toBeChecked()
    expect(readStorage()).toBeNull()
  })

  test('nested providers share one store, and a nested theme prop warns', async () => {
    const env = createEnv()
    await render(
      <KvirnProvider locale="sv-SE" messages={sv} env={env}>
        <ThemeSwitcherFixture />
        <KvirnProvider locale="fi-FI" messages={fi} theme={{ defaultColorScheme: 'dark' }}>
          <ThemeSwitcherFixture />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(radio('Följ systemet').first()).toBeChecked()
    await expect.element(radio('Järjestelmän mukaan').first()).toBeChecked()

    await radio('Tumma').click()
    await expect.element(radio('Mörkt')).toBeChecked()
    expect(readAttributes(env).colorScheme).toBe('dark')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('theme')
  })

  test('reports forced colors, so a switcher can say the system colours are in use', async () => {
    await renderSwitcher(createEnv())
    await expect.element(page.getByText('Används nu: Ljust, Normal kontrast')).toBeVisible()
    await emulateSystem([{ name: 'forced-colors', value: 'active' }])
    await expect
      .element(page.getByText('Systemets tvingade färger används och går före ditt val.'))
      .toBeVisible()
    await radio('Mörkt').click()
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect
      .element(page.getByText('Systemets tvingade färger används och går före ditt val.'))
      .toBeVisible()
  })

  test('a second outermost provider with different theme options warns that they are ignored', async () => {
    const env = createEnv()
    await render(
      <>
        <KvirnProvider env={env} theme={{ defaultColorScheme: 'dark' }} />
        <KvirnProvider env={env} theme={{ defaultColorScheme: 'dark', storage: 'local' }} />
        <KvirnProvider env={env} theme={{ defaultContrast: 'more' }} />
      </>,
    )
    await expect.poll(() => readAttributes(env).colorScheme).toBe('dark')
    expect(readAttributes(env).contrast).toBe('standard')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('already')
  })

  test('invalid theme options fall back to system and warn, and never reach <html>', async () => {
    const env = createEnv()
    // Untyped input, as from plain JavaScript or a CMS.
    const hostileTheme = JSON.parse(
      JSON.stringify({ defaultColorScheme: '"><script>', storage: 'session' }),
    ) as KvirnProviderProps['theme']
    await renderSwitcher(env, { theme: hostileTheme })
    await expect.element(radio('Följ systemet').first()).toBeChecked()
    expect(readAttributes(env)).toEqual({ colorScheme: 'light', contrast: 'standard' })
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('defaultColorScheme, storage')
  })
})

describe('theme switcher keyboard', () => {
  test('Tab moves focus to the checked radio of the colour-scheme group', async () => {
    await renderSwitcher(createEnv())
    await userEvent.tab()

    await expect.element(radio('Följ systemet').first()).toHaveFocus()
    await expect.element(radio('Följ systemet').first()).toBeChecked()
  })

  test('Tab moves to the next group: one Tab stop per radio group', async () => {
    await renderSwitcher(createEnv())
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(radio('Följ systemet').last()).toHaveFocus()

    await userEvent.tab({ shift: true })
    await expect.element(radio('Följ systemet').first()).toHaveFocus()
  })

  test('ArrowUp / ArrowLeft select the previous option and keep focus on it', async () => {
    const env = createEnv()
    await renderSwitcher(env)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect.element(radio('Mörkt')).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(radio('Ljust')).toBeChecked()
    await expect.element(radio('Ljust')).toHaveFocus()
    expect(readAttributes(env).colorScheme).toBe('light')
  })

  test('ArrowDown / ArrowRight select the next option and wrap around', async () => {
    const env = createEnv()
    await renderSwitcher(env)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(radio('Ljust')).toBeChecked()

    await userEvent.keyboard('{ArrowRight}')
    await expect.element(radio('Mörkt')).toBeChecked()
    await expect.element(radio('Mörkt')).toHaveFocus()
    expect(readAttributes(env).colorScheme).toBe('dark')
  })

  test('Arrow keys change the contrast group independently', async () => {
    const env = createEnv()
    await renderSwitcher(env)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowUp}')

    await expect.element(radio('Hög kontrast')).toBeChecked()
    await expect.element(radio('Följ systemet').first()).toBeChecked()
    expect(readAttributes(env).contrast).toBe('more')
  })
})
