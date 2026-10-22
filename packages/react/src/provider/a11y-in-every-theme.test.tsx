import { getDefaultEnv, getThemeStore } from '@kvirn-ui/core'
import { expectNoA11yViolations, expectNoA11yViolationsInEveryTheme } from '@kvirn-ui/testing'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { useTheme } from './use-theme.ts'

const themeStore = getThemeStore(getDefaultEnv())

const lowContrastUnder = (selector: string) => `
  <style>${selector} .text { color: #777777; background: #888888; }</style>
  <p class="text">Low contrast only here</p>`

const mount = (html: string) => {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container
}

function ResolvedSchemeButton() {
  const { resolvedColorScheme } = useTheme()
  return <button type="button" aria-label={resolvedColorScheme === 'dark' ? undefined : 'Open'} />
}

afterEach(() => {
  document.body.replaceChildren()
  themeStore.actions.selectColorScheme('system')
  themeStore.actions.selectContrast('system')
})

describe('expectNoA11yViolationsInEveryTheme', () => {
  it('rejects an empty theme list instead of passing without a check', async () => {
    const element = document.createElement('div')
    document.body.append(element)
    await expect(
      expectNoA11yViolationsInEveryTheme(element, {
        themeStore: getThemeStore(getDefaultEnv()),
        themes: [],
      }),
    ).rejects.toThrow('`themes` is empty')
    element.remove()
  })

  it('rejects a colour-contrast failure that only the dark theme has, while light/standard passes', async () => {
    const container = mount(lowContrastUnder('[data-kv-color-scheme="dark"]'))
    await expect(
      expectNoA11yViolationsInEveryTheme(container, {
        themeStore,
        themes: [{ colorScheme: 'light', contrast: 'standard' }],
      }),
    ).resolves.toBeUndefined()
    await expect(expectNoA11yViolationsInEveryTheme(container, { themeStore })).rejects.toThrow(
      /color-contrast/,
    )
  })

  it('rejects a colour-contrast failure that only the more-contrast theme has', async () => {
    const container = mount(lowContrastUnder('[data-kv-contrast="more"]'))
    await expect(
      expectNoA11yViolationsInEveryTheme(container, {
        themeStore,
        themes: [{ colorScheme: 'light', contrast: 'standard' }],
      }),
    ).resolves.toBeUndefined()
    await expect(expectNoA11yViolationsInEveryTheme(container, { themeStore })).rejects.toThrow(
      /color-contrast/,
    )
  })

  it('names each failing theme in the rejection message', async () => {
    const container = mount(lowContrastUnder('[data-kv-color-scheme="dark"]'))
    const error = await expectNoA11yViolationsInEveryTheme(container, { themeStore }).then(
      () => undefined,
      (caught: Error) => caught,
    )
    expect(error?.message).toMatch(/^dark\/standard: .*\[color-contrast\]/ms)
    expect(error?.message).toMatch(/^dark\/more: /m)
    expect(error?.message).not.toMatch(/^light\//m)
  })

  it('restores the html attributes and the store selection after a pass and after a failure', async () => {
    themeStore.actions.selectColorScheme('dark')
    themeStore.actions.selectContrast('standard')
    const root = document.documentElement
    const before = {
      preference: { ...themeStore.getState().preference },
      colorScheme: root.getAttribute('data-kv-color-scheme'),
      contrast: root.getAttribute('data-kv-contrast'),
    }
    const passing = mount('<button type="button">Ok</button>')
    await expectNoA11yViolationsInEveryTheme(passing, { themeStore })
    const failing = mount('<button type="button"></button>')
    await expect(expectNoA11yViolationsInEveryTheme(failing, { themeStore })).rejects.toThrow(
      /button-name/,
    )
    expect({
      preference: themeStore.getState().preference,
      colorScheme: root.getAttribute('data-kv-color-scheme'),
      contrast: root.getAttribute('data-kv-contrast'),
    }).toEqual(before)
  })

  it('shows the switched theme to a component that reads useTheme when axe runs', async () => {
    const { container } = await render(<ResolvedSchemeButton />)
    await expect(
      expectNoA11yViolationsInEveryTheme(container, {
        themeStore,
        themes: [{ colorScheme: 'light', contrast: 'standard' }],
      }),
    ).resolves.toBeUndefined()
    await expect(
      expectNoA11yViolationsInEveryTheme(container, {
        themeStore,
        themes: [{ colorScheme: 'dark', contrast: 'standard' }],
      }),
    ).rejects.toThrow(/dark\/standard: .*\[button-name\]/s)
    await expectNoA11yViolations(container)
  })
})
