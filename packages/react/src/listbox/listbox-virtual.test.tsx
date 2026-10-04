import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Listbox } from './listbox.tsx'
import type { UseListboxMultipleOptions, UseListboxSingleOptions } from './use-listbox.ts'

// Contract: listbox.a11y.md › Virtualization. The keys are
// also covered end to end in apps/storybook/src/components/listbox/listbox.e2e.ts. Component tests
// load no theme, so the fixture gives the list the height limit and the scroll that the theme gives
// it, and every option the 2rem height that `estimateSize` guesses.

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
/** "Ort 1" to "Ort 10000", with one place that starts with its own letter, far from the first window. */
const places: readonly Place[] = Array.from({ length: count }, (_, index) => ({
  code: `ort-${index + 1}`,
  name: index === 7000 ? 'Västerås' : `Ort ${index + 1}`,
}))
const farPlaceIndex = 7000

const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }
const listStyle = { maxBlockSize: '12rem', overflowY: 'auto' } as const
const optionStyle = { blockSize: '2rem', boxSizing: 'border-box' } as const

type ExampleProps = Partial<UseListboxSingleOptions<Place>>
type MultipleProps = Partial<UseListboxMultipleOptions<Place>>

function Example({ items = places, ...rootProps }: ExampleProps) {
  return (
    <>
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Ort</Field.Label>
        <Listbox.Root
          items={items}
          itemToString={(place) => place.name}
          itemToKey={(place) => place.code}
          native="never"
          virtualize={{ estimateSize: 32, overscan: 3 }}
          {...rootProps}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj ort" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List style={listStyle}>
              {(place: Place) => <Listbox.Option item={place} style={optionStyle} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <button type="button" style={fixtureButtonStyle}>
        Efter
      </button>
    </>
  )
}

function MultipleExample({ items = places, ...rootProps }: MultipleProps) {
  return (
    <Field.Root required>
      <Field.Label>Ort</Field.Label>
      <Listbox.Root
        items={items}
        itemToString={(place) => place.name}
        itemToKey={(place) => place.code}
        multiple
        virtualize={{ estimateSize: 32, overscan: 3 }}
        {...rootProps}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder="Välj orter" />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List style={listStyle}>
            {(place: Place) => <Listbox.Option item={place} style={optionStyle} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

const trigger = () => page.getByRole('combobox', { name: /Ort/ })
const triggerElement = () => trigger().element()
const popupElement = () => document.querySelector<HTMLElement>('.kv-listbox-popup')
const listElement = () => document.querySelector<HTMLElement>('.kv-listbox-list')
const sizerElement = () => document.querySelector<HTMLElement>('.kv-listbox-virtual-sizer')
const isShown = () => popupElement()?.matches(':popover-open') === true
const option = (name: string) => page.getByRole('option', { name, exact: true })
const renderedCount = () => page.getByRole('option').elements().length
const renderedOptions = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')]

/** The option that `aria-activedescendant` points at. It must be in the document: that is the contract. */
function activeOption(): HTMLElement | undefined {
  const id = triggerElement().getAttribute('aria-activedescendant')
  if (id === null) {
    return undefined
  }
  const element = document.getElementById(id)
  expect(element, 'aria-activedescendant points at an option that is in the DOM').not.toBeNull()
  expect(element?.getAttribute('role')).toBe('option')
  return element ?? undefined
}
const activeName = () => activeOption()?.textContent

async function openWithKey(key: string) {
  triggerElement().focus()
  await userEvent.keyboard(key)
  await expect.poll(isShown).toBe(true)
}

describe('virtualize: the window', () => {
  test('a closed list renders no option and no sizer', async () => {
    await render(<Example />)
    expect(renderedCount()).toBe(0)
    expect(sizerElement()).toBeNull()
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(false)
  })

  test('10 000 items mount only a window of options, inside a sizer as tall as the whole list', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.poll(renderedCount).toBeGreaterThan(5)
    expect(renderedCount()).toBeLessThan(60)
    const list = listElement()
    expect(list?.hasAttribute('data-virtualized')).toBe(true)
    expect(list?.getAttribute('role')).toBe('listbox')
    const sizer = sizerElement()
    expect(sizer?.parentElement).toBe(list)
    expect(Number.parseFloat(sizer?.style.blockSize ?? '0')).toBeGreaterThan(count * 20)
    // The list scrolls: it is the scroll element.
    expect((list?.scrollHeight ?? 0) > (list?.clientHeight ?? 0)).toBe(true)
  })

  test('every rendered option carries aria-setsize and its place in the whole list', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(renderedCount).toBeGreaterThan(5)
    for (const element of renderedOptions()) {
      const index = Number(element.getAttribute('data-index'))
      expect(element.getAttribute('aria-setsize')).toBe(String(count))
      expect(element.getAttribute('aria-posinset')).toBe(String(index + 1))
      expect(element.textContent).toBe(places[index]?.name)
    }
    expect(renderedOptions()[0]?.getAttribute('aria-posinset')).toBe('1')
  })

  test('the options are placed inside the sizer, one after the other in index order', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(renderedCount).toBeGreaterThan(5)
    const indexes = renderedOptions().map((element) => Number(element.getAttribute('data-index')))
    expect(indexes).toEqual([...indexes].sort((first, second) => first - second))
    for (const element of renderedOptions()) {
      expect(element.parentElement).toBe(sizerElement())
    }
  })

  test('a list that is not virtualized is unchanged: every option, no sizer, no set size', async () => {
    await render(<Example items={places.slice(0, 40)} virtualize={undefined} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(false)
    for (const element of renderedOptions()) {
      expect(element.hasAttribute('aria-setsize')).toBe(false)
      expect(element.hasAttribute('aria-posinset')).toBe(false)
      expect(element.hasAttribute('data-index')).toBe(false)
    }
  })

  test('virtualize={false} renders every option', async () => {
    await render(<Example items={places.slice(0, 40)} virtualize={false} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
  })

  test('virtualize={true} uses the defaults', async () => {
    await render(<Example virtualize />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.poll(renderedCount).toBeGreaterThan(5)
    expect(renderedCount()).toBeLessThan(100)
  })

  test('an open virtualized list has no axe violations', async () => {
    const { container } = await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(renderedCount).toBeGreaterThan(5)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('virtualize: keys reach options that are not rendered', () => {
  test('End activates the last option, which is mounted with its place, and scrolls to it', async () => {
    await render(<Example />)
    await openWithKey('{End}')
    const last = activeOption()
    expect(last?.textContent).toBe('Ort 10000')
    expect(last?.getAttribute('aria-posinset')).toBe(String(count))
    expect(last?.getAttribute('aria-setsize')).toBe(String(count))
    expect(last?.getAttribute('data-active')).toBe('')
    await expect.element(trigger()).toHaveFocus()
    expect(renderedCount()).toBeLessThan(60)
    // The list scrolled: the option is inside the list's box, not just in the DOM.
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
    // The option 0 is not rendered any more, and the active one is.
    await expect.poll(() => option('Ort 1').elements().length).toBe(0)
    expect(
      document.getElementById(triggerElement().getAttribute('aria-activedescendant') ?? ''),
    ).toBe(last)
  })

  test('Home goes back to the first option after End, and the last one is unmounted', async () => {
    await render(<Example />)
    await openWithKey('{End}')
    expect(activeName()).toBe('Ort 10000')
    await userEvent.keyboard('{Home}')
    const first = activeOption()
    expect(first?.textContent).toBe('Ort 1')
    expect(first?.getAttribute('aria-posinset')).toBe('1')
    await expect.poll(() => option('Ort 10000').elements().length).toBe(0)
    await expect.poll(() => listElement()?.scrollTop).toBe(0)
  })

  test('ArrowDown at the end stops: it does not wrap', async () => {
    await render(<Example />)
    await openWithKey('{End}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Ort 10000')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ort 9999')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('9999')
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
    // The list followed the active option: it is not at the top any more.
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 0).toBe(true)
  })

  test('typeahead reaches an option that was not rendered', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    expect(option('Västerås').elements()).toHaveLength(0)
    await userEvent.keyboard('v')
    const far = activeOption()
    expect(far?.textContent).toBe('Västerås')
    expect(far?.getAttribute('aria-posinset')).toBe(String(farPlaceIndex + 1))
    expect(far?.getAttribute('aria-setsize')).toBe(String(count))
    await expect.element(option('Västerås')).toBeInTheDocument()
    await expect.element(trigger()).toHaveFocus()
  })

  test('Enter chooses the active option that was far away, and the value is its key', async () => {
    const onValueChange = vi.fn<NonNullable<ExampleProps['onValueChange']>>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithKey('{End}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('ort-10000', { reason: 'key' })
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(triggerElement().textContent).toBe('Ort 10000')
  })

  test('the pointer moving over an option makes it active without scrolling the list', async () => {
    await render(<Example />)
    await openWithKey('{ArrowDown}')
    await expect.poll(renderedCount).toBeGreaterThan(5)
    const before = listElement()?.scrollTop
    await userEvent.hover(option('Ort 3'))
    await expect.element(option('Ort 3')).toHaveAttribute('data-active', '')
    expect(listElement()?.scrollTop).toBe(before)
  })
})

describe('virtualize: the chosen option', () => {
  test('opening scrolls to the chosen option and renders it', async () => {
    await render(<Example defaultValue="ort-5000" />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(option('Ort 5000')).toBeInTheDocument()
    await expect.element(option('Ort 5000')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Ort 5000')).toHaveAttribute('aria-posinset', '5000')
    await expect.poll(() => (listElement()?.scrollTop ?? 0) > 1000).toBe(true)
    expect(renderedCount()).toBeLessThan(60)
  })

  test('opening with a key activates the chosen option, far from the top', async () => {
    await render(<Example defaultValue="ort-5000" />)
    await openWithKey('{ArrowDown}')
    expect(activeName()).toBe('Ort 5000')
    expect(activeOption()?.getAttribute('aria-posinset')).toBe('5000')
  })

  test('the chosen option stays mounted while the list is scrolled far from it', async () => {
    await render(<Example defaultValue="ort-3" />)
    await openWithKey('{End}')
    expect(activeName()).toBe('Ort 10000')
    const chosen = option('Ort 3')
    await expect.element(chosen).toBeInTheDocument()
    await expect.element(chosen).toHaveAttribute('aria-selected', 'true')
    await expect.element(chosen).toHaveAttribute('aria-posinset', '3')
  })

  test('closing and opening again starts at the top', async () => {
    await render(<Example />)
    await openWithKey('{End}')
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(option('Ort 1')).toBeInTheDocument()
    expect(option('Ort 10000').elements()).toHaveLength(0)
    expect(listElement()?.scrollTop).toBe(0)
  })
})

describe('virtualize: several choices', () => {
  test('every chosen option stays mounted and Enter toggles an option far away', async () => {
    await render(<MultipleExample defaultValue={['ort-2', 'ort-9000']} />)
    await openWithKey('{End}')
    expect(activeName()).toBe('Ort 10000')
    await expect.element(option('Ort 2')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Ort 9000')).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    await expect.element(option('Ort 10000')).toHaveAttribute('aria-selected', 'true')
    expect(isShown()).toBe(true)
    expect(listElement()?.getAttribute('aria-multiselectable')).toBe('true')
  })
})

describe('virtualize: what it does not do', () => {
  test('groups are not virtualized: a development warning, and every option renders', async () => {
    const groups = [
      { key: 'a', label: 'Norr', items: places.slice(0, 20) },
      { key: 'b', label: 'Söder', items: places.slice(20, 40) },
    ]
    await render(
      <>
        <Field.Root required>
          <Field.Label>Ort</Field.Label>
          <Listbox.Root
            groups={groups}
            itemToString={(place) => place.name}
            itemToKey={(place) => place.code}
            native="never"
            virtualize
          >
            <Listbox.Trigger>
              <Listbox.Value placeholder="Välj ort" />
            </Listbox.Trigger>
            <Listbox.Popup>
              <Listbox.List style={listStyle}>
                {(place: Place) => <Listbox.Option item={place} />}
              </Listbox.List>
            </Listbox.Popup>
          </Listbox.Root>
        </Field.Root>
      </>,
    )
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(40)
    expect(sizerElement()).toBeNull()
    expect(listElement()?.hasAttribute('data-virtualized')).toBe(false)
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
    expect(page.getByRole('group').elements()).toHaveLength(2)
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('virtualize')
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('groups')
  })

  test('the native select ignores it and lists every option', async () => {
    await render(<Example items={places.slice(0, 50)} native="always" />)
    const select = document.querySelector('select')
    expect(select).not.toBeNull()
    expect(select?.querySelectorAll('option').length).toBeGreaterThanOrEqual(50)
    expect(document.querySelector('.kv-listbox-virtual-sizer')).toBeNull()
  })

  test('children that are not a function are rendered as they are, with a development warning', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Ort</Field.Label>
        <Listbox.Root
          items={places.slice(0, 5)}
          itemToString={(place) => place.name}
          itemToKey={(place) => place.code}
          native="never"
          virtualize
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj ort" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List style={listStyle}>
              {places.slice(0, 5).map((place) => (
                <Listbox.Option key={place.code} item={place} />
              ))}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(renderedCount()).toBe(5)
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('function')
    expect(renderedOptions()[0]?.hasAttribute('aria-setsize')).toBe(false)
  })
})
