import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Listbox } from './listbox.tsx'
import type { ListboxRootProps } from './listbox.tsx'
import { useListbox } from './use-listbox.ts'
import type {
  ListboxOpenChangeDetails,
  ListboxValueChangeDetails,
  UseListboxMultipleOptions,
  UseListboxResult,
  UseListboxSingleOptions,
} from './use-listbox.ts'

// Contract: listbox.a11y.md (custom rendering). The keyboard rows are also covered end to end in
// apps/storybook/src/components/listbox/listbox.e2e.ts. Component tests load no theme: the popup
// is the browser's own `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface Municipality {
  code: string
  name: string
  disabled?: boolean
}

const municipalities: readonly Municipality[] = [
  { code: 'angelholm', name: 'Ängelholm' },
  { code: 'arvika', name: 'Arvika' },
  { code: 'gbg', name: 'Göteborg' },
  { code: 'malmo', name: 'Malmö' },
  { code: 'orebro', name: 'Örebro' },
  { code: 'sthlm', name: 'Stockholm', disabled: true },
  { code: 'uppsala', name: 'Uppsala' },
]

const numbered: readonly Municipality[] = Array.from({ length: 30 }, (_, index) => ({
  code: `n${index + 1}`,
  name: `Alternativ ${index + 1}`,
}))

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Listbox. */
const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

type SingleProps = Partial<UseListboxSingleOptions<Municipality>>
type MultipleProps = Partial<UseListboxMultipleOptions<Municipality>>

function Example({ items = municipalities, ...rootProps }: SingleProps) {
  return (
    <>
      {/* Above the trigger, so the popup (placed under it) never covers the text a test presses. */}
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Field.Description>Där du är folkbokförd.</Field.Description>
        <Listbox.Root
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          native="never"
          {...rootProps}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj kommun" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <button type="button" style={fixtureButtonStyle}>
        Efter
      </button>
    </>
  )
}

function MultipleExample({ items = municipalities, ...rootProps }: MultipleProps) {
  return (
    <>
      <p>Text utanför</p>
      <Field.Root required>
        <Field.Label>Kommuner</Field.Label>
        <Listbox.Root
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          multiple
          {...rootProps}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj kommuner" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
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

const trigger = () => page.getByRole('combobox', { name: /Kommun/ })
const triggerElement = () => trigger().element()

/** A located element as an HTML element: the locators type it as `HTMLElement | SVGElement`. */
function asHtmlElement(element: HTMLElement | SVGElement): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('Expected an HTML element')
  }
  return element
}

function asSelectElement(element: HTMLElement | SVGElement): HTMLSelectElement {
  if (!(element instanceof HTMLSelectElement)) {
    throw new TypeError('Expected a <select>')
  }
  return element
}
const popupElement = () => document.querySelector<HTMLElement>('.kv-listbox-popup')
const listElement = () => document.querySelector<HTMLElement>('.kv-listbox-list')
const isShown = () => popupElement()?.matches(':popover-open') === true
const option = (name: string) => page.getByRole('option', { name, exact: true })

/** The option that `aria-activedescendant` points at, or `undefined`. It must be in the document. */
function activeOption(): HTMLElement | undefined {
  const id = triggerElement().getAttribute('aria-activedescendant')
  if (id === null) {
    return undefined
  }
  const element = document.getElementById(id)
  expect(element, 'aria-activedescendant points at a rendered option').not.toBeNull()
  expect(element?.getAttribute('role')).toBe('option')
  return element ?? undefined
}
const activeName = () => activeOption()?.textContent

/** Presses a key that the browser keyboard helper can't type, such as å, ä and ö. */
function pressCharacter(character: string) {
  triggerElement().dispatchEvent(
    new KeyboardEvent('keydown', { key: character, bubbles: true, cancelable: true }),
  )
}

async function openWithClick() {
  await userEvent.click(trigger())
  await expect.poll(isShown).toBe(true)
}

describe('rendering', () => {
  test('a closed listbox: a combobox div wired to a hidden listbox popup', async () => {
    const { container } = await render(<Example />)
    const element = triggerElement()
    const popup = popupElement()
    expect(element.tagName).toBe('DIV')
    expect(element.getAttribute('role')).toBe('combobox')
    expect(element.getAttribute('tabindex')).toBe('0')
    expect(element.className).toBe('kv-listbox-trigger')
    expect(element.getAttribute('aria-expanded')).toBe('false')
    expect(element.getAttribute('aria-haspopup')).toBe('listbox')
    expect(element.getAttribute('aria-required')).toBe('true')
    expect(element.hasAttribute('aria-activedescendant')).toBe(false)
    expect(element.hasAttribute('data-open')).toBe(false)
    const list = listElement()
    // The popup is the role-less shell, and the list inside it is the listbox that aria-controls points at.
    expect(popup?.hasAttribute('role')).toBe(false)
    expect(popup?.getAttribute('popover')).toBe('manual')
    expect(popup?.className).toContain('kv-listbox-popup')
    expect(list?.getAttribute('role')).toBe('listbox')
    expect(list?.parentElement).toBe(popup)
    expect(list?.id).not.toBe('')
    expect(element.getAttribute('aria-controls')).toBe(list?.id)
    expect(list?.hasAttribute('aria-multiselectable')).toBe(false)
    expect(isShown()).toBe(false)
    expect(page.getByRole('option').elements()).toHaveLength(0)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the Field’s label and the value name the trigger, and the hint describes it', async () => {
    await render(<Example />)
    const element = triggerElement()
    const label = document.querySelector('label')
    expect(label?.id).not.toBe('')
    const value = element.querySelector('.kv-listbox-value')
    expect(element.getAttribute('aria-labelledby')).toBe(`${label?.id} ${value?.id}`)
    expect(listElement()?.getAttribute('aria-labelledby')).toBe(label?.id)
    expect(element.id).toBe(label?.getAttribute('for'))
    await expect.element(trigger()).toHaveAccessibleName('Kommun Välj kommun')
    await expect.element(trigger()).toHaveAccessibleDescription('Där du är folkbokförd.')
  })

  test('the placeholder shows with data-placeholder, and the chosen text replaces it', async () => {
    await render(<Example defaultValue="gbg" />)
    const value = triggerElement().querySelector('.kv-listbox-value')
    expect(value?.textContent).toBe('Göteborg')
    expect(value?.hasAttribute('data-placeholder')).toBe(false)
    await render(<Example />)
    const placeholder = document.querySelectorAll('.kv-listbox-value')[1]
    expect(placeholder?.textContent).toBe('Välj kommun')
    expect(placeholder?.hasAttribute('data-placeholder')).toBe(true)
  })

  test('an open listbox: expanded, data-open, options with their state, focus on the trigger', async () => {
    const { container } = await render(<Example defaultValue="malmo" />)
    await openWithClick()
    const element = triggerElement()
    expect(element.getAttribute('aria-expanded')).toBe('true')
    expect(element.hasAttribute('data-open')).toBe(true)
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    await expect.element(page.getByRole('listbox')).toBeVisible()
    expect(page.getByRole('option').elements()).toHaveLength(7)
    await expect.element(option('Malmö')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Malmö')).toHaveAttribute('data-selected', '')
    await expect.element(option('Arvika')).toHaveAttribute('aria-selected', 'false')
    await expect.element(option('Arvika')).not.toHaveAttribute('data-selected')
    // Opening with a press activates nothing, and focus never leaves the trigger.
    expect(element.hasAttribute('aria-activedescendant')).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('every option has its own id and role, and data-disabled marks a disabled one', async () => {
    await render(<Example />)
    await openWithClick()
    const ids = page
      .getByRole('option')
      .elements()
      .map((element) => element.id)
    expect(new Set(ids).size).toBe(7)
    expect(ids.every((id) => id !== '')).toBe(true)
    await expect.element(option('Stockholm')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(option('Stockholm')).toHaveAttribute('data-disabled', '')
    await expect.element(option('Malmö')).not.toHaveAttribute('aria-disabled')
  })

  test('groups: role=group named by its label, with axe clean', async () => {
    const { container } = await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root
          native="never"
          groups={[
            { key: 'west', label: 'Västra Götaland', items: ['Göteborg', 'Borås'] },
            { key: 'south', label: 'Skåne', items: ['Malmö'] },
          ]}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj kommun" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>{(item: string) => <Listbox.Option item={item} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(page.getByRole('group', { name: 'Västra Götaland' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Skåne' })).toBeVisible()
    const groups = container.querySelectorAll('.kv-listbox-group')
    expect(groups).toHaveLength(2)
    expect(groups[0]?.querySelectorAll('[role="option"]')).toHaveLength(2)
    await expectNoA11yViolations(container)
  })

  test('Listbox.Empty shows "No results" as plain text beside a hidden listbox, not as an option', async () => {
    const { container } = await render(<Example items={[]} />)
    await openWithClick()
    await expect.element(page.getByText('No results')).toBeVisible()
    // Not an option, and not inside the listbox: no screen reader reads it as "option 1 of 1".
    expect(page.getByRole('option').elements()).toHaveLength(0)
    const empty = document.querySelector('.kv-listbox-empty')
    expect(empty?.hasAttribute('role')).toBe(false)
    expect(empty?.closest('[role="listbox"]')).toBeNull()
    expect(empty?.parentElement).toBe(popupElement())
    // The listbox stays in the DOM, so aria-controls points at an element, but it is hidden while there is nothing in it.
    expect(listElement()?.hasAttribute('hidden')).toBe(true)
    expect(listElement()?.hasAttribute('data-empty')).toBe(true)
    expect(triggerElement().getAttribute('aria-controls')).toBe(listElement()?.id)
    await expectNoA11yViolations(container)
  })

  test('Listbox.Empty is in the provider’s locale, and renders nothing while there are options', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Example items={[]} />
      </KvirnProvider>,
    )
    await openWithClick()
    await expect.element(page.getByText('Inga resultat')).toBeVisible()
  })

  test('there is no Listbox.Empty element while the list has options', async () => {
    await render(<Example />)
    await openWithClick()
    expect(document.querySelector('.kv-listbox-empty')).toBeNull()
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLDivElement>()
    const popupRef = createRef<HTMLDivElement>()
    const optionRef = createRef<HTMLDivElement>()
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root native="never" items={['Göteborg']} defaultOpen>
          <Listbox.Trigger ref={triggerRef} className="egen" data-egen="trigger" />
          <Listbox.Popup ref={popupRef} className="egen" data-egen="popup">
            <Listbox.List>
              {(item: string) => <Listbox.Option ref={optionRef} className="egen" item={item} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(optionRef.current).toBe(option('Göteborg').element())
    expect(triggerRef.current?.className).toBe('egen kv-listbox-trigger')
    expect(popupRef.current?.className).toContain('egen')
    expect(popupRef.current?.className).toContain('kv-listbox-popup')
    expect(optionRef.current?.className).toBe('egen kv-listbox-option')
    expect(triggerRef.current?.getAttribute('data-egen')).toBe('trigger')
    // The part's own ref still reaches the hook: the popup was placed next to the trigger.
    expect(popupRef.current?.style.position).toBe('fixed')
  })

  test('render replaces the element and gives the state', async () => {
    const optionStates: boolean[] = []
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root native="never" items={['Göteborg', 'Malmö']} defaultOpen>
          <Listbox.Trigger render={(partProps) => <section {...partProps} data-egen="render" />} />
          <Listbox.Popup>
            <Listbox.List>
              {(item: string) => (
                <Listbox.Option
                  item={item}
                  render={(partProps, state) => {
                    optionStates.push(state.isSelected)
                    return <p {...partProps}>{state.label}</p>
                  }}
                />
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().tagName).toBe('SECTION')
    expect(triggerElement().getAttribute('data-egen')).toBe('render')
    expect(option('Malmö').element().tagName).toBe('P')
    expect(optionStates).toContain(false)
  })

  test('a rich option: your own children replace the text, which stays the option’s label', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root native="never" items={['Göteborg']} defaultOpen>
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(item: string) => (
                <Listbox.Option item={item}>
                  <strong>{item}</strong> <small>Västra Götaland</small>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await expect.poll(isShown).toBe(true)
    await expect
      .element(page.getByRole('option', { name: 'Göteborg Västra Götaland' }))
      .toBeVisible()
  })
})

describe('in a Field', () => {
  test('invalid, required and disabled come from the Field', async () => {
    const { container } = await render(
      <>
        <Field.Root invalid required>
          <Field.Label>Kommun</Field.Label>
          <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
          <Listbox.Root native="never" items={['Göteborg']}>
            <Listbox.Trigger />
            <Listbox.Popup>
              <Listbox.List>{(item: string) => <Listbox.Option item={item} />}</Listbox.List>
            </Listbox.Popup>
          </Listbox.Root>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label marker="none">Land</Field.Label>
          <Listbox.Root native="never" items={['Sverige']}>
            <Listbox.Trigger />
            <Listbox.Popup>
              <Listbox.List>{(item: string) => <Listbox.Option item={item} />}</Listbox.List>
            </Listbox.Popup>
          </Listbox.Root>
        </Field.Root>
      </>,
    )
    const invalid = trigger().element()
    expect(invalid.getAttribute('aria-invalid')).toBe('true')
    expect(invalid.getAttribute('aria-required')).toBe('true')
    expect(invalid.hasAttribute('data-invalid')).toBe(true)
    expect(invalid.hasAttribute('data-required')).toBe(true)
    await expect.element(trigger()).toHaveAccessibleDescription('Error: Välj en kommun')
    const disabled = page.getByRole('combobox', { name: /Land/ }).element()
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    expect(disabled.hasAttribute('tabindex')).toBe(false)
    expect(disabled.hasAttribute('data-disabled')).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('a disabled listbox does not open, and is not focusable', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example disabled onOpenChange={onOpenChange} />)
    // A DOM click: an element that is aria-disabled isn't actionable for the browser's pointer.
    asHtmlElement(triggerElement()).click()
    expect(isShown()).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(triggerElement().getAttribute('aria-disabled')).toBe('true')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).not.toBe(triggerElement())
  })

  test('clicking the label focuses the trigger', async () => {
    await render(<Example />)
    await userEvent.click(page.getByText('Kommun', { exact: true }))
    await expect.element(trigger()).toHaveFocus()
  })

  test('a trigger in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <Listbox.Root native="never" items={['Göteborg']}>
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>{(item: string) => <Listbox.Option item={item} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a trigger outside a Field with no name warns once, and aria-label names it', async () => {
    await render(
      <Listbox.Root native="never" items={['Göteborg']}>
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List aria-label="Kommuner">
            {(item: string) => <Listbox.Option item={item} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
    resetDevWarnings()
    consoleWarn.mockClear()
    await render(
      <Listbox.Root native="never" items={['Göteborg']}>
        <Listbox.Trigger aria-label="Kommun">
          <Listbox.Value placeholder="Välj kommun" />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List aria-label="Kommuner">
            {(item: string) => <Listbox.Option item={item} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
    await expect.element(page.getByRole('combobox', { name: 'Kommun' })).toBeVisible()
  })
})

describe('opening and closing', () => {
  test('a press on the trigger opens the popup, and a second press closes it', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithClick()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(false)
    expect(onOpenChange.mock.calls).toEqual([
      [true, { reason: 'trigger-press' }],
      [false, { reason: 'trigger-press' }],
    ])
  })

  test('a press outside closes the popup, and focus stays where the press put it', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithClick()
    // The button above the trigger: the popup sits under the trigger and would cover "Efter".
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'outside-press' })
  })

  test('a press inside the popup keeps focus on the trigger', async () => {
    await render(<Example />)
    await openWithClick()
    const popup = popupElement()
    expect(popup).not.toBeNull()
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    popup?.dispatchEvent(press)
    expect(press.defaultPrevented).toBe(true)
    await userEvent.click(option('Göteborg'))
    await expect.element(trigger()).toHaveFocus()
  })

  test('defaultOpen shows the popup from the start', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('a controlled open follows the prop, and a refused change is pulled back', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example open={false} onOpenChange={onOpenChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'key' })
    // The parent didn't set `open`, so nothing opens and nothing is active.
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('false')
    expect(isShown()).toBe(false)
    expect(triggerElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('a controlled open that the parent updates opens and closes', async () => {
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false)
      return <Example open={isOpen} onOpenChange={setIsOpen} />
    }
    await render(<Controlled />)
    await openWithClick()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
  })
})

describe('keyboard', () => {
  test('ArrowDown on the closed trigger opens it and activates the first option', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Ängelholm')
    await expect.element(option('Ängelholm')).toHaveAttribute('data-active', '')
    await expect.element(trigger()).toHaveFocus()
  })

  test('ArrowUp on the closed trigger opens it and activates the last option', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Uppsala')
  })

  test('opening with a key activates the chosen option', async () => {
    await render(<Example defaultValue="malmo" />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Malmö')
  })

  test('ArrowDown and ArrowUp move the active option and stop at the ends: no wrap', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Arvika')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{End}')
    expect(activeName()).toBe('Uppsala')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Uppsala')
  })

  test('Home and End activate the first and the last option', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{End}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Uppsala')
    await userEvent.keyboard('{Home}')
    expect(activeName()).toBe('Ängelholm')
  })

  test('PageDown and PageUp move ten options, and stop at the ends', async () => {
    await render(<Example items={numbered} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Alternativ 1')
    await userEvent.keyboard('{PageDown}')
    expect(activeName()).toBe('Alternativ 11')
    await userEvent.keyboard('{PageDown}')
    await userEvent.keyboard('{PageDown}')
    expect(activeName()).toBe('Alternativ 30')
    await userEvent.keyboard('{PageUp}')
    expect(activeName()).toBe('Alternativ 20')
  })

  test('Enter chooses the active option, closes the popup and keeps focus on the trigger', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('arvika', { reason: 'key' })
    await expect.element(trigger()).toHaveFocus()
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Arvika')
    expect(triggerElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Enter with no active option chooses nothing and leaves the popup open', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithClick()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
  })

  test('Enter and Space on the closed trigger open it', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.keyboard(' ')
    await expect.poll(isShown).toBe(true)
  })

  test('Space chooses the active option', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard(' ')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('angelholm', { reason: 'key' })
  })

  test('Escape closes the popup and keeps the value and the focus', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(
      <Example defaultValue="gbg" onValueChange={onValueChange} onOpenChange={onOpenChange} />,
    )
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'escape' })
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Göteborg')
    await expect.element(trigger()).toHaveFocus()
  })

  test('Escape does nothing while the popup is closed', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('Tab chooses the active option and moves focus on', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('arvika', { reason: 'key' })
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab chooses the active option and moves focus back', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('angelholm', { reason: 'key' })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Tab with no active option closes the popup and chooses nothing', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithClick()
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Alt+ArrowDown opens the popup without activating an option', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Alt+ArrowUp chooses the active option and closes the popup', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('arvika', { reason: 'key' })
  })

  test('typing a letter opens the popup and activates the next option that starts with it', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('u')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Uppsala')
    // A pause ends the word: a new letter starts over.
    await new Promise((resolve) => setTimeout(resolve, 650))
    await userEvent.keyboard('g')
    await expect.poll(activeName).toBe('Göteborg')
  })

  test('typeahead keeps å, ä and ö apart from a and o in Swedish', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Example />
      </KvirnProvider>,
    )
    triggerElement().focus()
    pressCharacter('ä')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Ängelholm')
    // A pause ends the word: a new letter starts over.
    await new Promise((resolve) => setTimeout(resolve, 650))
    pressCharacter('ö')
    await expect.poll(activeName).toBe('Örebro')
    await new Promise((resolve) => setTimeout(resolve, 650))
    await userEvent.keyboard('a')
    await expect.poll(activeName).toBe('Arvika')
  })

  test('a disabled option can be reached with the arrow keys and cannot be chosen', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    for (let step = 0; step < 5; step += 1) {
      await userEvent.keyboard('{ArrowDown}')
    }
    expect(activeName()).toBe('Stockholm')
    await expect.element(option('Stockholm')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
    asHtmlElement(option('Stockholm').element()).click()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
  })

  test('aria-activedescendant always points at a rendered option', async () => {
    await render(<Example items={numbered} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    for (const key of ['{PageDown}', '{End}', '{PageUp}', '{Home}', '{ArrowDown}']) {
      await userEvent.keyboard(key)
      expect(activeOption()).toBeDefined()
    }
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(triggerElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Tab leaves the listbox: it is one tab stop', async () => {
    await render(<Example />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('the keys it handles are cancelled, and the others are left to the browser', async () => {
    await render(<Example />)
    triggerElement().focus()
    const press = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      triggerElement().dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(press('ArrowDown')).toBe(true)
    expect(press('F5')).toBe(false)
    // Escape cancels while the popup is open, and Tab is the browser's (it closes the popup first).
    expect(press('Escape')).toBe(true)
    expect(press('ArrowDown')).toBe(true)
    expect(press('Tab')).toBe(false)
  })
})

describe('pointer', () => {
  test('a click on an option chooses it, closes the popup and keeps focus on the trigger', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    const onOpenChange = vi.fn<(open: boolean, details: ListboxOpenChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} onOpenChange={onOpenChange} />)
    await openWithClick()
    await userEvent.click(option('Malmö'))
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('malmo', { reason: 'option-press' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'option-press' })
    await expect.element(trigger()).toHaveFocus()
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Malmö')
  })

  test('moving the pointer over an option makes it the active option', async () => {
    await render(<Example />)
    await openWithClick()
    await userEvent.hover(option('Göteborg'))
    await expect.poll(activeName).toBe('Göteborg')
    await expect.element(option('Göteborg')).toHaveAttribute('data-active', '')
  })
})

describe('value', () => {
  test('uncontrolled: defaultValue shows, and a choice is kept without a parent', async () => {
    await render(<Example defaultValue="gbg" />)
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Göteborg')
    await openWithClick()
    await userEvent.click(option('Uppsala'))
    await expect.poll(isShown).toBe(false)
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Uppsala')
  })

  test('controlled: shows the value it is given and follows it', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('gbg')
      return (
        <>
          <Example value={value} onValueChange={setValue} />
          <output>{value ?? 'none'}</output>
        </>
      )
    }
    await render(<Controlled />)
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Göteborg')
    await openWithClick()
    await userEvent.click(option('Malmö'))
    await expect.element(page.getByRole('status')).toHaveTextContent('malmo')
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Malmö')
  })

  test('controlled: stays as it is when the parent does not update the value', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(<Example value="gbg" onValueChange={onValueChange} />)
    await openWithClick()
    await userEvent.click(option('Malmö'))
    expect(onValueChange).toHaveBeenCalledWith('malmo', { reason: 'option-press' })
    await expect
      .poll(() => triggerElement().querySelector('.kv-listbox-value')?.textContent)
      .toBe('Göteborg')
  })

  test('controlled null shows the placeholder', async () => {
    await render(<Example value={null} />)
    const value = triggerElement().querySelector('.kv-listbox-value')
    expect(value?.textContent).toBe('Välj kommun')
    expect(value?.hasAttribute('data-placeholder')).toBe(true)
  })

  test('the items can change: the chosen text stays, and a new list is rendered', async () => {
    function Changing() {
      const [items, setItems] = useState<readonly Municipality[]>(municipalities)
      return (
        <>
          <button type="button" onClick={() => setItems([{ code: 'lund', name: 'Lund' }])}>
            Byt lista
          </button>
          <Example items={items} defaultValue="gbg" />
        </>
      )
    }
    await render(<Changing />)
    await userEvent.click(page.getByRole('button', { name: 'Byt lista' }))
    await openWithClick()
    expect(page.getByRole('option').elements()).toHaveLength(1)
    await expect.element(option('Lund')).toBeVisible()
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Göteborg')
  })

  test('Listbox.Value takes a function that gets the chosen items', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root native="never" items={['Göteborg', 'Malmö']} defaultValue="Malmö">
          <Listbox.Trigger>
            <Listbox.Value>{(items: readonly string[]) => `${items.length} vald`}</Listbox.Value>
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>{(item: string) => <Listbox.Option item={item} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('1 vald')
  })
})

describe('multiple', () => {
  test('aria-multiselectable, and a choice toggles the option and keeps the popup open', async () => {
    const onValueChange = vi.fn<(value: string[], details: ListboxValueChangeDetails) => void>()
    const { container } = await render(<MultipleExample onValueChange={onValueChange} />)
    await openWithClick()
    expect(listElement()?.getAttribute('aria-multiselectable')).toBe('true')
    await userEvent.click(option('Malmö'))
    await userEvent.click(option('Arvika'))
    expect(isShown()).toBe(true)
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([
      ['malmo'],
      ['malmo', 'arvika'],
    ])
    await expect.element(option('Malmö')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Arvika')).toHaveAttribute('aria-selected', 'true')
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe('Malmö, Arvika')
    await userEvent.click(option('Malmö'))
    expect(onValueChange).toHaveBeenLastCalledWith(['arvika'], { reason: 'option-press' })
    await expectNoA11yViolations(container)
  })

  test('Enter and Space toggle the active option, and the popup stays open', async () => {
    const onValueChange = vi.fn<(value: string[], details: ListboxValueChangeDetails) => void>()
    await render(<MultipleExample onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith(['angelholm', 'arvika'], { reason: 'key' })
    expect(isShown()).toBe(true)
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['arvika'], { reason: 'key' })
  })

  test('Tab closes the popup without choosing the active option', async () => {
    const onValueChange = vi.fn<(value: string[], details: ListboxValueChangeDetails) => void>()
    await render(<MultipleExample onValueChange={onValueChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('controlled: the keys it is given are chosen, in order', async () => {
    await render(<MultipleExample value={['uppsala', 'gbg']} />)
    expect(triggerElement().querySelector('.kv-listbox-value')?.textContent).toBe(
      'Uppsala, Göteborg',
    )
  })
})

describe('forms', () => {
  test('with a name, a hidden input carries the chosen key in a plain form', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Example name="municipality" />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('')
    await openWithClick()
    await userEvent.click(option('Uppsala'))
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('uppsala')
  })

  test('multiple: one hidden input per chosen key, none when nothing is chosen', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <MultipleExample name="municipality" defaultValue={['malmo', 'gbg']} />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.getAll('municipality')).toEqual(['malmo', 'gbg'])
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(2)
  })

  test('a disabled listbox sends nothing, and there is no hidden input without a name', async () => {
    await render(<Example name="municipality" disabled defaultValue="gbg" />)
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })

  test('without a name there is no hidden input', async () => {
    await render(<Example defaultValue="gbg" />)
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })
})

describe('native rendering', () => {
  test('native="always" renders a native select with the Field’s label, description and error', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Kommun</Field.Label>
        <Field.Description>Där du är folkbokförd.</Field.Description>
        <Listbox.Root
          native="always"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          name="municipality"
          autoComplete="address-level2"
          placeholder="Välj kommun"
        >
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
      </Field.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    const element = asSelectElement(select.element())
    expect(element.tagName).toBe('SELECT')
    expect(element.className).toBe('kv-listbox-native')
    expect(element.getAttribute('name')).toBe('municipality')
    expect(element.getAttribute('autocomplete')).toBe('address-level2')
    expect(element.getAttribute('aria-invalid')).toBe('true')
    await expect
      .element(select)
      .toHaveAccessibleDescription('Där du är folkbokförd. Error: Välj en kommun')
    // The popup parts aren't rendered, and the empty option carries the placeholder.
    expect(document.querySelector('.kv-listbox-popup')).toBeNull()
    expect(element.options).toHaveLength(8)
    expect(element.options[0]?.value).toBe('')
    expect(element.options[0]?.textContent).toBe('Välj kommun')
    expect(element.options[6]?.disabled).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('native groups become optgroups', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root
          native="always"
          groups={[
            { key: 'west', label: 'Västra Götaland', items: ['Göteborg'] },
            { key: 'south', label: 'Skåne', items: ['Malmö'] },
          ]}
        >
          <Listbox.Trigger />
        </Listbox.Root>
      </Field.Root>,
    )
    const element = page.getByRole('combobox', { name: 'Kommun' }).element()
    expect(element.querySelectorAll('optgroup')).toHaveLength(2)
    expect(element.querySelector('optgroup')?.getAttribute('label')).toBe('Västra Götaland')
  })

  test('choosing in the native select reports the key and goes in the form', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Example native="always" name="municipality" onValueChange={onValueChange} />
        <button type="submit">Skicka</button>
      </form>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await userEvent.selectOptions(select, 'malmo')
    expect(onValueChange).toHaveBeenCalledWith('malmo', { reason: 'native' })
    await expect.element(select).toHaveValue('malmo')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('malmo')
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })

  test('the empty option of the native select clears the choice', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ListboxValueChangeDetails) => void>()
    await render(
      <Example
        native="always"
        placeholder="Välj kommun"
        defaultValue="gbg"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Kommun' }), 'Välj kommun')
    expect(onValueChange).toHaveBeenCalledWith(null, { reason: 'native' })
  })

  test('the choice survives a switch of rendering, and the popup is closed after it', async () => {
    function Switching() {
      const [native, setNative] = useState<'never' | 'always'>('never')
      return (
        <>
          <button type="button" onClick={() => setNative('always')}>
            Byt
          </button>
          <Example native={native} defaultValue="gbg" />
        </>
      )
    }
    await render(<Switching />)
    await openWithClick()
    await userEvent.click(page.getByRole('button', { name: 'Byt' }))
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await expect.element(select).toHaveValue('gbg')
    expect(select.element().tagName).toBe('SELECT')
    expect(document.querySelector('.kv-listbox-popup')).toBeNull()
  })

  test('multiple always renders the popup, and native="always" with it warns once', async () => {
    await render(<MultipleExample native="always" />)
    expect(triggerElement().tagName).toBe('DIV')
    expect(
      consoleWarn.mock.calls.some(([message]) => String(message).includes('CheckboxGroup')),
    ).toBe(true)
  })

  test('native="auto" renders the popup on a fine pointer', async () => {
    await render(<Example native="auto" />)
    // The test browser's pointer is fine, so the custom trigger renders.
    expect(triggerElement().tagName).toBe('DIV')
  })

  test('native="auto" reads the pointer once after mount: a later change never swaps the rendering', async () => {
    let isCoarse = true
    const addEventListener = vi.fn<(...args: unknown[]) => void>()
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      get matches() {
        return isCoarse
      },
      media: query,
      onchange: null,
      addEventListener,
      removeEventListener: vi.fn<(...args: unknown[]) => void>(),
      addListener: vi.fn<(...args: unknown[]) => void>(),
      removeListener: vi.fn<(...args: unknown[]) => void>(),
      dispatchEvent: () => false,
    }))
    try {
      function Rerendering() {
        const [count, setCount] = useState(0)
        return (
          <>
            <button type="button" onClick={() => setCount(count + 1)}>
              Rendera om
            </button>
            <Example native="auto" />
          </>
        )
      }
      await render(<Rerendering />)
      // A coarse pointer, read right after mount: the native select.
      await expect.poll(() => triggerElement().tagName).toBe('SELECT')
      // The pointer changes while the user is on the page: nothing listens, and nothing swaps,
      // not even when the component renders again (focus would fall to the page).
      isCoarse = false
      await userEvent.click(page.getByRole('button', { name: 'Rendera om' }))
      expect(triggerElement().tagName).toBe('SELECT')
      expect(addEventListener).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })
})

describe('useListbox', () => {
  test('spreads the same props on your own elements', async () => {
    function Own() {
      const countrySelect = useListbox({
        items: ['Sverige', 'Norge'],
        native: 'never',
        id: 'land',
      })
      return (
        <>
          <div {...countrySelect.triggerProps} aria-label="Land">
            Land
          </div>
          <div {...countrySelect.popupProps}>
            <div {...countrySelect.listProps}>
              {countrySelect.isOpen
                ? countrySelect.entries.map((entry) => (
                    <div key={entry.key} {...countrySelect.getOptionProps(entry)}>
                      {entry.label}
                    </div>
                  ))
                : null}
            </div>
          </div>
        </>
      )
    }
    await render(<Own />)
    expect(page.getByRole('combobox', { name: 'Land' }).element().id).toBe('land')
    await userEvent.click(page.getByRole('combobox', { name: 'Land' }))
    await expect.poll(isShown).toBe(true)
    await userEvent.click(option('Norge'))
    await expect.poll(isShown).toBe(false)
  })
})

describe('server rendering', () => {
  test('the server markup has the combobox, a closed popup and a hidden input, and no options', () => {
    const markup = renderToString(
      <Field.Root controlId="kommun" required>
        <Field.Label>Kommun</Field.Label>
        <Listbox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="gbg"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj kommun" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    // The first render is the popup: the native rendering only follows after mount.
    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('id="kommun"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-haspopup="listbox"')
    expect(markup).toContain('popover="manual"')
    expect(markup).toContain('role="listbox"')
    expect(markup).toContain('Göteborg')
    expect(markup).not.toContain('role="option"')
    expect(markup).not.toContain('<select')
    expect(markup).toContain('type="hidden"')
    expect(markup).toContain('value="gbg"')
  })
})

describe('types', () => {
  test('the value is a key or null, and an array with multiple', () => {
    expectTypeOf<UseListboxSingleOptions<string>['value']>().toEqualTypeOf<
      string | null | undefined
    >()
    expectTypeOf<UseListboxMultipleOptions<string>['value']>().toEqualTypeOf<
      readonly string[] | undefined
    >()
    expectTypeOf<UseListboxMultipleOptions<string>['multiple']>().toEqualTypeOf<true>()
    expectTypeOf<ListboxRootProps<Municipality>['items']>().toEqualTypeOf<
      readonly Municipality[] | undefined
    >()
    expectTypeOf<UseListboxResult<Municipality>['selectedItems']>().toEqualTypeOf<
      readonly Municipality[]
    >()
  })
})
