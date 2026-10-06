import { Disclosure, KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { DisplaySettingsPanel } from './display-settings.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { exampleLocaleStorageKey } from './example-locale.tsx'

const text = messages.docs.display

const exampleLanguage = () => page.getByLabelText(text.exampleLanguage)

const renderPage = () =>
  render(
    <KvirnProvider>
      <Disclosure.Root defaultOpen>
        <DisplaySettingsPanel />
      </Disclosure.Root>
      <ExampleFrame caption="A button" code="const size = 4">
        <p>An example</p>
      </ExampleFrame>
    </KvirnProvider>,
  )

afterEach(() => {
  localStorage.removeItem(exampleLocaleStorageKey)
})

describe('Display settings example language', () => {
  test('the select offers Swedish and English only', async () => {
    await renderPage()
    const options = [...exampleLanguage().element().querySelectorAll('option')]
    expect(options.map((option) => option.textContent)).toEqual(['Svenska', 'English'])
  })

  test('choosing English switches an example to English and keeps focus on the select', async () => {
    const { container } = await renderPage()
    const stage = () => container.querySelector('.docs-example-stage')
    expect(stage()?.getAttribute('lang')).toBe('sv')
    ;(exampleLanguage().element() as HTMLElement).focus()
    await userEvent.selectOptions(exampleLanguage(), 'English')
    await vi.waitFor(() => expect(stage()?.getAttribute('lang')).toBe('en'))
    expect(document.activeElement).toBe(exampleLanguage().element())
  })

  test('the choice survives a remount', async () => {
    const screen = await renderPage()
    await userEvent.selectOptions(exampleLanguage(), 'English')
    await vi.waitFor(() => expect(localStorage.getItem(exampleLocaleStorageKey)).toBe('en'))
    await screen.unmount()

    const { container } = await renderPage()
    expect((exampleLanguage().element() as HTMLSelectElement).value).toBe('en')
    expect(container.querySelector('.docs-example-stage')?.getAttribute('lang')).toBe('en')
  })

  test('an unknown stored value falls back to Swedish', async () => {
    localStorage.setItem(exampleLocaleStorageKey, 'fr')
    const { container } = await renderPage()
    expect((exampleLanguage().element() as HTMLSelectElement).value).toBe('sv')
    expect(container.querySelector('.docs-example-stage')?.getAttribute('lang')).toBe('sv')
  })

  test('the storage note is the library Alert and there is no "In use now" line', async () => {
    const { container } = await renderPage()
    const note = page.getByText(text.storageNote).element()
    expect(note.closest('.kv-alert')).not.toBeNull()
    expect(note.closest('.kv-alert')?.textContent).toContain(`Information: ${text.storageTitle}`)
    expect(container.textContent).not.toContain('In use now')
  })

  test('the display settings have no axe violations', async () => {
    const { container } = await renderPage()
    await expect.element(exampleLanguage()).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
