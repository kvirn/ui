import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Autocomplete } from './autocomplete.tsx'
import type { UseAutocompleteOptions } from './use-autocomplete.ts'

// Contract: autocomplete.a11y.md › Virtualization. The keys
// are also covered end to end in apps/storybook/src/components/autocomplete/autocomplete.e2e.ts.
// Component tests load no theme, so the fixture gives the list the height limit and the scroll that
// the theme gives it, and every option the 2rem height that `estimateSize` guesses.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const count = 10_000
const streets: readonly string[] = Array.from({ length: count }, (_, index) =>
  index === 7000 ? 'Västra vägen' : `Gatan ${index + 1}`,
)

const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }
const listStyle = { maxBlockSize: '12rem', overflowY: 'auto' } as const
const optionStyle = { blockSize: '2rem', boxSizing: 'border-box' } as const

type ExampleProps = Partial<UseAutocompleteOptions<string>>

function Example({ items = streets, ...rootProps }: ExampleProps) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Gatuadress</Field.Label>
        <Autocomplete.Root
          items={items}
          virtualize={{ estimateSize: 32, overscan: 3 }}
          {...rootProps}
        >
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List style={listStyle}>
              {(street: string) => <Autocomplete.Option item={street} style={optionStyle} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <button type="button" style={fixtureButtonStyle}>
        Efter
      </button>
    </KvirnProvider>
  )
}

const input = () => page.getByRole('combobox', { name: /Gatuadress/ })

function asInputElement(element: HTMLElement | SVGElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new TypeError('Expected an <input>')
  }
  return element
}

const inputElement = () => asInputElement(input().element())
const popupElement = () => document.querySelector<HTMLElement>('.kv-listbox-popup')
const listElement = () => document.querySelector<HTMLElement>('.kv-listbox-list')
const sizerElement = () => document.querySelector<HTMLElement>('.kv-listbox-virtual-sizer')
const isShown = () => popupElement()?.matches(':popover-open') === true
const renderedCount = () => page.getByRole('option').elements().length
const renderedOptions = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')]

async function typeText(text: string) {
  inputElement().focus()
  await userEvent.keyboard(text)
}

describe('virtualize: the window', () => {
  test('typing opens a list of 10 000 suggestions that mounts only a window', async () => {
    await render(<Example />)
    await typeText('Gatan')
    await expect.poll(isShown).toBe(true)
    await expect.poll(renderedCount).toBeGreaterThan(5)
    expect(renderedCount()).toBeLessThan(60)
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(true)
    expect(sizerElement()?.parentElement).toBe(listElement())
    for (const element of renderedOptions()) {
      const index = Number(element.getAttribute('data-index'))
      expect(element.getAttribute('aria-setsize')).toBe(String(count - 1))
      expect(element.getAttribute('aria-posinset')).toBe(String(index + 1))
    }
  })

  test('an open virtualized autocomplete has no axe violations', async () => {
    const { container } = await render(<Example />)
    await typeText('Gatan')
    await expect.poll(renderedCount).toBeGreaterThan(5)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an autocomplete that is not virtualized is unchanged: every suggestion, no set size', async () => {
    await render(<Example items={streets.slice(0, 40)} virtualize={undefined} />)
    await typeText('Gatan')
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
  })
})

describe('virtualize: keys reach suggestions that are not rendered', () => {
  test('Enter fills the input with a suggestion that was far away', async () => {
    const onValueChange = vi.fn<NonNullable<ExampleProps['onValueChange']>>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('Gatan')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('Gatan 10000', { reason: 'selection' })
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Gatan 10000')
    await expect.element(input()).toHaveFocus()
  })
})

describe('virtualize: what it does not do', () => {
  test('groups are not virtualized: a development warning, and every suggestion renders', async () => {
    const groups = [
      { key: 'a', label: 'Norr', items: streets.slice(0, 20) },
      { key: 'b', label: 'Söder', items: streets.slice(20, 40) },
    ]
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root required>
          <Field.Label>Gatuadress</Field.Label>
          <Autocomplete.Root groups={groups} virtualize>
            <Autocomplete.Input />
            <Autocomplete.Popup>
              <Autocomplete.List style={listStyle}>
                {(street: string) => <Autocomplete.Option item={street} />}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await typeText('Gatan')
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('virtualize')
  })
})
