import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Combobox } from './combobox.tsx'
import type { UseComboboxMultipleOptions, UseComboboxSingleOptions } from './use-combobox.ts'

// Contract: combobox.a11y.md › Virtualization. The keys are
// also covered end to end in apps/storybook/src/components/combobox/combobox.e2e.ts. Component
// tests load no theme, so the fixture gives the list the height limit and the scroll that the theme
// gives it, and every option the 2rem height that `estimateSize` guesses.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface Place {
  code: string
  name: string
}

const count = 10_000
const places: readonly Place[] = Array.from({ length: count }, (_, index) => ({
  code: `ort-${index + 1}`,
  name: index === 7000 ? 'Västerås' : `Ort ${index + 1}`,
}))

const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }
const listStyle = { maxBlockSize: '12rem', overflowY: 'auto' } as const
const optionStyle = { blockSize: '2rem', boxSizing: 'border-box' } as const

type ExampleProps = Partial<UseComboboxSingleOptions<Place>>
type MultipleProps = Partial<UseComboboxMultipleOptions<Place>>

function Example({ items = places, ...rootProps }: ExampleProps) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Ort</Field.Label>
        <Combobox.Root
          items={items}
          itemToString={(place) => place.name}
          itemToKey={(place) => place.code}
          virtualize={{ estimateSize: 32, overscan: 3 }}
          {...rootProps}
        >
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List style={listStyle}>
              {(place: Place) => <Combobox.Option item={place} style={optionStyle} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
      <button type="button" style={fixtureButtonStyle}>
        Efter
      </button>
    </KvirnProvider>
  )
}

function MultipleExample({ items = places, ...rootProps }: MultipleProps) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <Field.Root required>
        <Field.Label>Orter</Field.Label>
        <Combobox.Root
          items={items}
          itemToString={(place) => place.name}
          itemToKey={(place) => place.code}
          multiple
          virtualize={{ estimateSize: 32, overscan: 3 }}
          {...rootProps}
        >
          <Combobox.ValueList />
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List style={listStyle}>
              {(place: Place) => <Combobox.Option item={place} style={optionStyle} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
    </KvirnProvider>
  )
}

const input = () => page.getByRole('combobox', { name: /Ort/ })

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
const option = (name: string) => page.getByRole('option', { name, exact: true })
const renderedCount = () => page.getByRole('option').elements().length
const renderedOptions = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')]

/** The option that `aria-activedescendant` points at. It must be in the document: that is the contract. */
function activeOption(): HTMLElement | undefined {
  const id = inputElement().getAttribute('aria-activedescendant')
  if (id === null) {
    return undefined
  }
  const element = document.getElementById(id)
  expect(element, 'aria-activedescendant points at an option that is in the DOM').not.toBeNull()
  expect(element?.getAttribute('role')).toBe('option')
  return element ?? undefined
}
const activeName = () => activeOption()?.textContent

/** Focuses the input and types with the keyboard, so the key events fire. */
async function typeText(text: string) {
  inputElement().focus()
  await userEvent.keyboard(text)
}

async function openWithKey(key: string) {
  inputElement().focus()
  await userEvent.keyboard(key)
  await expect.poll(isShown).toBe(true)
}

describe('virtualize: the window', () => {
  test('a closed combobox renders no option and no sizer', async () => {
    await render(<Example />)
    expect(renderedCount()).toBe(0)
    expect(sizerElement()).toBeNull()
  })

  test('10 000 items mount only a window of options, each with its place in the whole list', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    await expect.poll(renderedCount).toBeGreaterThan(5)
    expect(renderedCount()).toBeLessThan(60)
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(true)
    expect(sizerElement()?.parentElement).toBe(listElement())
    for (const element of renderedOptions()) {
      const index = Number(element.getAttribute('data-index'))
      expect(element.getAttribute('aria-setsize')).toBe(String(count))
      expect(element.getAttribute('aria-posinset')).toBe(String(index + 1))
    }
    expect(inputElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('an open virtualized combobox has no axe violations', async () => {
    const { container } = await render(<Example />)
    await openWithKey('{ArrowDown}')
    await expect.poll(renderedCount).toBeGreaterThan(5)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a combobox that is not virtualized is unchanged: every option, no set size', async () => {
    await render(<Example items={places.slice(0, 40)} virtualize={undefined} />)
    await openWithKey('{ArrowDown}')
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(false)
  })
})

describe('virtualize: keys reach options that are not rendered', () => {
  test('ArrowUp on the closed input activates the last option, mounted, with its place', async () => {
    await render(<Example />)
    await openWithKey('{ArrowUp}')
    const last = activeOption()
    expect(last?.textContent).toBe('Ort 10000')
    expect(last?.getAttribute('aria-posinset')).toBe(String(count))
    expect(last?.getAttribute('aria-setsize')).toBe(String(count))
    await expect.element(input()).toHaveFocus()
    expect(renderedCount()).toBeLessThan(60)
    await expect
      .poll(() => {
        const box = last?.getBoundingClientRect()
        const area = listElement()?.getBoundingClientRect()
        return (
          box !== undefined &&
          area !== undefined &&
          box.top >= area.top - 1 &&
          box.bottom <= area.bottom + 1
        )
      })
      .toBe(true)
  })

  test('PageDown moves ten options, and the active one is always in the DOM', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    expect(activeName()).toBe('Ort 1')
    for (let step = 1; step <= 6; step += 1) {
      await userEvent.keyboard('{PageDown}')
      expect(activeName()).toBe(`Ort ${1 + step * 10}`)
      expect(activeOption()?.getAttribute('aria-posinset')).toBe(String(1 + step * 10))
    }
    await userEvent.keyboard('{PageUp}')
    expect(activeName()).toBe('Ort 51')
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 0).toBe(true)
  })

  test('ArrowDown at the last option stops: it does not wrap', async () => {
    await render(<Example />)
    await openWithKey('{ArrowUp}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Ort 10000')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ort 9999')
  })

  test('Enter chooses an option that was far away: its text goes in the input', async () => {
    const onValueChange = vi.fn<NonNullable<ExampleProps['onValueChange']>>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithKey('{ArrowUp}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('ort-10000', { reason: 'key' })
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Ort 10000')
    await expect.element(input()).toHaveFocus()
  })

  test('typing filters the 10 000 items, and the list keeps its size set up to date', async () => {
    await render(<Example />)
    await typeText('Ort 9')
    await expect.poll(isShown).toBe(true)
    // "Ort 9", "Ort 90" to "Ort 99", "Ort 900" to "Ort 999" and "Ort 9000" to "Ort 9999": 1111 options.
    await expect.poll(() => renderedOptions()[0]?.getAttribute('aria-setsize')).toBe('1111')
    expect(renderedCount()).toBeLessThan(60)
    expect(renderedOptions()[0]?.getAttribute('aria-posinset')).toBe('1')
    expect(renderedOptions()[0]?.textContent).toBe('Ort 9')
    // Nothing is active until a key moves there.
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ort 9999')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('1111')
  })

  test('typing a text that few options contain renders them all, and the window follows the list', async () => {
    await render(<Example />)
    // `fill` types the å and ä that the keyboard helper has no key for.
    await userEvent.fill(input(), 'Västerås')
    await expect.poll(isShown).toBe(true)
    await expect.poll(renderedCount).toBe(1)
    expect(renderedOptions()[0]?.getAttribute('aria-setsize')).toBe('1')
    expect(renderedOptions()[0]?.getAttribute('aria-posinset')).toBe('1')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Västerås')
  })

  test('Home and End still move the caret, and leave no option active', async () => {
    await render(<Example />)
    await typeText('Ort 9')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ort 9999')
    await userEvent.keyboard('{Home}')
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    expect(inputElement().selectionStart).toBe(0)
  })
})

describe('virtualize: the chosen option', () => {
  test('opening with a key activates the chosen option, far from the top, and renders it', async () => {
    await render(<Example defaultValue="ort-5000" />)
    await openWithKey('{ArrowDown}')
    expect(activeName()).toBe('Ort 5000')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('5000')
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 1000).toBe(true)
  })

  test('every chosen option stays mounted, however far from the window it is', async () => {
    await render(<MultipleExample defaultValue={['ort-2', 'ort-9000']} />)
    // Opening with a key activates the first chosen option, as for a short list.
    await openWithKey('{ArrowUp}')
    expect(activeName()).toBe('Ort 2')
    // The other one is 9 000 options away from the window, and is rendered all the same.
    await expect.element(option('Ort 9000')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Ort 9000')).toHaveAttribute('aria-posinset', '9000')
    for (let step = 0; step < 3; step += 1) {
      await userEvent.keyboard('{PageDown}')
    }
    expect(activeName()).toBe('Ort 32')
    await expect.element(option('Ort 2')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Ort 9000')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('virtualize: what it does not do', () => {
  test('groups are not virtualized: a development warning, and every option renders', async () => {
    const groups = [
      { key: 'a', label: 'Norr', items: places.slice(0, 20) },
      { key: 'b', label: 'Söder', items: places.slice(20, 40) },
    ]
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root required>
          <Field.Label>Ort</Field.Label>
          <Combobox.Root
            groups={groups}
            itemToString={(place) => place.name}
            itemToKey={(place) => place.code}
            virtualize
          >
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List style={listStyle}>
                {(place: Place) => <Combobox.Option item={place} />}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await openWithKey('{ArrowDown}')
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(false)
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('virtualize')
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('groups')
  })
})
