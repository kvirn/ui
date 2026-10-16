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

// Contract: combobox.a11y.md › Virtualization. Component tests load no theme, so the fixture gives the list the height limit and the scroll that the theme
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
  name: index === 7000 ? 'Vasteras' : `Place ${index + 1}`,
}))

const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }
const listStyle = { maxBlockSize: '12rem', overflowY: 'auto' } as const
const optionStyle = { blockSize: '2rem', boxSizing: 'border-box' } as const

type ExampleProps = Partial<UseComboboxSingleOptions<Place>>
type MultipleProps = Partial<UseComboboxMultipleOptions<Place>>

function Example({ items = places, ...rootProps }: ExampleProps) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <p>Text outside</p>
      <button type="button" style={fixtureButtonStyle}>
        Before
      </button>
      <Field.Root required>
        <Field.Label>Place</Field.Label>
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
        After
      </button>
    </KvirnProvider>
  )
}

function MultipleExample({ items = places, ...rootProps }: MultipleProps) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <Field.Root required>
        <Field.Label>Places</Field.Label>
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

const input = () => page.getByRole('combobox', { name: /Place/ })

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
  test('ArrowDown at the last option stops: it does not wrap', async () => {
    await render(<Example />)
    await openWithKey('{ArrowUp}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Place 10000')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Place 9999')
  })

  test('virtualized: ArrowUp opens the popup and activates the last option, rendered and in view', async () => {
    await render(<Example />)
    await openWithKey('{ArrowUp}')
    expect(activeName()).toBe('Place 10000')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe(String(count))
    expect(activeOption()?.getAttribute('aria-setsize')).toBe(String(count))
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 1000).toBe(true)
    await expect.element(option('Place 1')).not.toBeInTheDocument()
    expect(renderedCount()).toBeLessThan(60)
  })

  test('virtualized: ArrowDown and ArrowUp always leave aria-activedescendant on an option in the page', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    expect(activeName()).toBe('Place 1')
    for (let step = 0; step < 40; step += 1) {
      await userEvent.keyboard('{ArrowDown}')
      expect(activeOption()).toBeDefined()
    }
    expect(activeName()).toBe('Place 41')
    for (let step = 0; step < 40; step += 1) {
      await userEvent.keyboard('{ArrowUp}')
      expect(activeOption()).toBeDefined()
    }
    expect(activeName()).toBe('Place 1')
  })

  test('virtualized: PageDown and PageUp move ten options that may not be rendered', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    for (let step = 0; step < 25; step += 1) {
      await userEvent.keyboard('{PageDown}')
      expect(activeOption()).toBeDefined()
    }
    expect(activeName()).toBe('Place 251')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('251')
    await userEvent.keyboard('{PageUp}')
    expect(activeName()).toBe('Place 241')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('241')
  })

  test('Enter chooses an option that was far away: its text goes in the input', async () => {
    const onValueChange = vi.fn<NonNullable<ExampleProps['onValueChange']>>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithKey('{ArrowUp}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('ort-10000', { reason: 'key' })
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Place 10000')
    await expect.element(input()).toHaveFocus()
  })

  test('typing a text that few options contain renders them all, and the window follows the list', async () => {
    await render(<Example />)
    // `fill` sets the whole text at once, with no key per letter.
    await userEvent.fill(input(), 'Vasteras')
    await expect.poll(isShown).toBe(true)
    await expect.poll(renderedCount).toBe(1)
    expect(renderedOptions()[0]?.getAttribute('aria-setsize')).toBe('1')
    expect(renderedOptions()[0]?.getAttribute('aria-posinset')).toBe('1')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Vasteras')
  })

  test('Home and End still move the caret, and leave no option active', async () => {
    await render(<Example />)
    await typeText('Place 9')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Place 9999')
    await userEvent.keyboard('{Home}')
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    expect(inputElement().selectionStart).toBe(0)
  })
})

describe('virtualize: the chosen option', () => {
  test('opening with a key activates the chosen option, far from the top, and renders it', async () => {
    await render(<Example defaultValue="ort-5000" />)
    await openWithKey('{ArrowDown}')
    expect(activeName()).toBe('Place 5000')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('5000')
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 1000).toBe(true)
  })

  test('every chosen option stays mounted, however far from the window it is', async () => {
    await render(<MultipleExample defaultValue={['ort-2', 'ort-9000']} />)
    // Opening with a key activates the first chosen option, as for a short list.
    await openWithKey('{ArrowUp}')
    expect(activeName()).toBe('Place 2')
    // The other one is 9 000 options away from the window, and is rendered all the same.
    await expect.element(option('Place 9000')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Place 9000')).toHaveAttribute('aria-posinset', '9000')
    for (let step = 0; step < 3; step += 1) {
      await userEvent.keyboard('{PageDown}')
    }
    expect(activeName()).toBe('Place 32')
    await expect.element(option('Place 2')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Place 9000')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('virtualize: what it does not do', () => {
  test('groups are not virtualized: a development warning, and every option renders', async () => {
    const groups = [
      { key: 'a', label: 'Norr', items: places.slice(0, 20) },
      { key: 'b', label: 'South', items: places.slice(20, 40) },
    ]
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root required>
          <Field.Label>Place</Field.Label>
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
