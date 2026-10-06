import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Combobox } from './combobox.tsx'
import type { ComboboxRootProps } from './combobox.tsx'
import { useCombobox } from './use-combobox.ts'
import type {
  ComboboxInputChangeDetails,
  ComboboxOpenChangeDetails,
  ComboboxValueChangeDetails,
  UseComboboxMultipleOptions,
  UseComboboxResult,
  UseComboboxSingleOptions,
} from './use-combobox.ts'

// Contract: combobox.a11y.md. Component tests load no theme: the popup is the browser's own
// `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeAll(() => {
  // The theme sizes these buttons, and no theme is loaded here: give them the 24px that 2.5.8 asks
  // for, so axe checks the Combobox and not the missing styles.
  const style = document.createElement('style')
  style.textContent =
    '.kv-combobox-toggle, .kv-combobox-clear, .kv-combobox-value-remove { min-block-size: 2rem; min-inline-size: 2rem; }'
  document.head.append(style)
})

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

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Combobox. */
const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

type SingleProps = Partial<UseComboboxSingleOptions<Municipality>> & {
  swedish?: boolean
  withButtons?: boolean
}
type MultipleProps = Partial<UseComboboxMultipleOptions<Municipality>> & { swedish?: boolean }

function Example({
  items = municipalities,
  swedish = false,
  withButtons = false,
  ...rootProps
}: SingleProps) {
  return (
    <KvirnProvider locale={swedish ? 'sv-SE' : 'en'} messages={swedish ? sv : undefined}>
      {/* Above the input, so the popup (placed under it) never covers the text a test presses. */}
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <Field.Prose>Där du är folkbokförd.</Field.Prose>
        <Combobox.Root
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          {...rootProps}
        >
          {withButtons ? (
            // Narrower than the viewport: a popup is never wider than the viewport minus its padding.
            <Combobox.Control style={{ inlineSize: '24rem' }}>
              <Combobox.Input />
              <Combobox.Clear />
              <Combobox.Toggle />
            </Combobox.Control>
          ) : (
            <Combobox.Input />
          )}
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
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

function MultipleExample({ items = municipalities, swedish = false, ...rootProps }: MultipleProps) {
  return (
    <KvirnProvider locale={swedish ? 'sv-SE' : 'en'} messages={swedish ? sv : undefined}>
      <p>Text utanför</p>
      <Field.Root required>
        <Field.Label>Kommuner</Field.Label>
        <Combobox.Root
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          multiple
          {...rootProps}
        >
          <Combobox.ValueList />
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
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

const input = () => page.getByRole('combobox', { name: /Kommun/ })

/** A located element as an input element: the locators type it as `HTMLElement | SVGElement`. */
function asInputElement(element: HTMLElement | SVGElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new TypeError('Expected an <input>')
  }
  return element
}

function asHtmlElement(element: HTMLElement | SVGElement): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('Expected an HTML element')
  }
  return element
}

const inputElement = () => asInputElement(input().element())
const popupElement = () => document.querySelector<HTMLElement>('.kv-listbox-popup')
const listElement = () => document.querySelector<HTMLElement>('.kv-listbox-list')
const emptyText = () => document.querySelector('.kv-listbox-empty')?.textContent
const isShown = () => popupElement()?.matches(':popover-open') === true
const option = (name: string) => page.getByRole('option', { name, exact: true })
const optionNames = () =>
  page
    .getByRole('option')
    .elements()
    .map((element) => element.textContent)
const status = () => page.getByRole('status')

/** The option that `aria-activedescendant` points at, or `undefined`. It must be in the document. */
function activeOption(): HTMLElement | undefined {
  const id = inputElement().getAttribute('aria-activedescendant')
  if (id === null) {
    return undefined
  }
  const element = document.getElementById(id)
  expect(element, 'aria-activedescendant points at a rendered option').not.toBeNull()
  expect(element?.getAttribute('role')).toBe('option')
  return element ?? undefined
}
const activeName = () => activeOption()?.textContent

/** Focuses the input and types with the keyboard, so the key events fire. */
async function typeText(text: string) {
  inputElement().focus()
  await userEvent.keyboard(text)
}

describe('rendering', () => {
  test('a closed combobox: a native input wired to a hidden listbox popup', async () => {
    const { container } = await render(<Example />)
    const element = inputElement()
    const popup = popupElement()
    expect(element.type).toBe('text')
    expect(element.getAttribute('role')).toBe('combobox')
    expect(element.getAttribute('aria-autocomplete')).toBe('list')
    expect(element.getAttribute('aria-expanded')).toBe('false')
    expect(element.getAttribute('aria-required')).toBe('true')
    expect(element.getAttribute('autocomplete')).toBe('off')
    expect(element.hasAttribute('aria-activedescendant')).toBe(false)
    expect(element.hasAttribute('data-open')).toBe(false)
    const list = listElement()
    // The popup is the role-less shell, and the list inside it is the listbox that aria-controls points at.
    expect(popup?.hasAttribute('role')).toBe(false)
    expect(popup?.getAttribute('popover')).toBe('manual')
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

  test('the Field’s label names the input, and the help text describes it', async () => {
    await render(<Example />)
    const label = document.querySelector('label')
    expect(inputElement().id).toBe(label?.getAttribute('for'))
    expect(listElement()?.getAttribute('aria-labelledby')).toBe(label?.id)
    await expect.element(input()).toHaveAccessibleName('Kommun')
    await expect.element(input()).toHaveAccessibleDescription('Där du är folkbokförd.')
  })

  test('typing opens the popup with the matching options, and focus stays on the input', async () => {
    const { container } = await render(<Example />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().getAttribute('aria-expanded')).toBe('true')
    expect(inputElement().hasAttribute('data-open')).toBe(true)
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    expect(optionNames()).toEqual(['Arvika', 'Göteborg', 'Örebro'])
    // Nothing is active until an arrow key, so Enter never chooses something the user didn't move to.
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await expect.element(input()).toHaveFocus()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a click on the input does not open the popup', async () => {
    await render(<Example />)
    await userEvent.click(input())
    await expect.element(input()).toHaveFocus()
    expect(isShown()).toBe(false)
  })

  test('every option has its own id and role, and data-disabled marks a disabled one', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    const ids = page
      .getByRole('option')
      .elements()
      .map((element) => element.id)
    expect(new Set(ids).size).toBe(7)
    expect(ids.every((id) => id !== '')).toBe(true)
    await expect.element(option('Stockholm')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(option('Stockholm')).toHaveAttribute('data-disabled', '')
    await expect.element(option('Malmö')).not.toHaveAttribute('aria-disabled')
    await expect.element(option('Malmö')).toHaveAttribute('aria-selected', 'false')
  })

  test('groups: role=group named by its label, with axe clean', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Field.Root required>
          <Field.Label>Kommun</Field.Label>
          <Combobox.Root
            groups={[
              { key: 'west', label: 'Västra Götaland', items: ['Göteborg', 'Borås'] },
              { key: 'south', label: 'Skåne', items: ['Malmö'] },
            ]}
          >
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await expect.element(page.getByRole('group', { name: 'Västra Götaland' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Skåne' })).toBeVisible()
    expect(container.querySelectorAll('.kv-listbox-group')).toHaveLength(2)
    await typeText('b')
    // The filter keeps the groups that still have a match, and drops the empty ones.
    await expect.poll(() => page.getByRole('group').elements().length).toBe(1)
    await expectNoA11yViolations(container)
  })

  test('Combobox.Empty says "No results" in the locale when nothing matches, as text beside a hidden listbox', async () => {
    const { container } = await render(<Example />)
    await typeText('zzz')
    await expect.poll(isShown).toBe(true)
    expect(emptyText()).toBe('No results')
    // Plain text, not an option: no screen reader reads it as "option 1 of 1".
    expect(optionNames()).toEqual([])
    expect(document.querySelector('.kv-listbox-empty')?.closest('[role="listbox"]')).toBeNull()
    expect(listElement()?.hasAttribute('hidden')).toBe(true)
    // Nothing to move into, so the combobox reports collapsed (and the count is announced).
    expect(inputElement().getAttribute('aria-expanded')).toBe('false')
    expect(inputElement().getAttribute('aria-controls')).toBe(listElement()?.id)
    await expectNoA11yViolations(container)
  })

  test('Combobox.Empty is Swedish in the Swedish provider', async () => {
    await render(<Example swedish />)
    await typeText('zzz')
    await expect.poll(isShown).toBe(true)
    expect(emptyText()).toBe('Inga resultat')
  })

  test('there is no Combobox.Empty element while the list has options', async () => {
    await render(<Example />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    expect(document.querySelector('.kv-listbox-empty')).toBeNull()
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const inputRef = createRef<HTMLInputElement>()
    const popupRef = createRef<HTMLDivElement>()
    const controlRef = createRef<HTMLDivElement>()
    await render(
      <KvirnProvider>
        <Field.Root required>
          <Field.Label>Kommun</Field.Label>
          <Combobox.Root items={['Göteborg']} defaultOpen>
            <Combobox.Control ref={controlRef} className="egen" data-egen="control">
              <Combobox.Input
                ref={inputRef}
                className="egen"
                data-egen="input"
                placeholder="Börja skriva"
                autoComplete="address-level2"
              />
            </Combobox.Control>
            <Combobox.Popup ref={popupRef} className="egen" data-egen="popup">
              <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await expect.poll(isShown).toBe(true)
    expect(inputRef.current).toBe(inputElement())
    expect(popupRef.current).toBe(popupElement())
    expect(controlRef.current?.className).toBe('egen kv-combobox-control')
    expect(inputRef.current?.className).toBe('egen kv-combobox-input')
    expect(inputRef.current?.getAttribute('data-egen')).toBe('input')
    expect(inputRef.current?.getAttribute('placeholder')).toBe('Börja skriva')
    // Your own autoComplete replaces the default.
    expect(inputRef.current?.getAttribute('autocomplete')).toBe('address-level2')
    // The part's own ref still reaches the hook: the popup was placed against the control.
    expect(popupRef.current?.style.position).toBe('fixed')
  })

  test('render replaces the element and gives the state', async () => {
    await render(
      <KvirnProvider>
        <Field.Root required>
          <Field.Label>Kommun</Field.Label>
          <Combobox.Root items={['Göteborg', 'Malmö']} defaultOpen>
            <Combobox.Input
              render={(partProps, state) => (
                <input {...partProps} data-open-state={String(state.isOpen)} />
              )}
            />
            <Combobox.Popup>
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Option
                    item={item}
                    render={(partProps, state) => <p {...partProps}>{state.label}</p>}
                  />
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await expect.poll(isShown).toBe(true)
    expect(inputElement().getAttribute('data-open-state')).toBe('true')
    expect(option('Malmö').element().tagName).toBe('P')
  })
})

describe('in a Field', () => {
  test('invalid, required and disabled come from the Field', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Field.Root invalid required>
          <Field.Label>Kommun</Field.Label>
          <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
          <Combobox.Root items={['Göteborg']}>
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label marker="none">Land</Field.Label>
          <Combobox.Root items={['Sverige']}>
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    const invalid = inputElement()
    expect(invalid.getAttribute('aria-invalid')).toBe('true')
    expect(invalid.getAttribute('aria-required')).toBe('true')
    expect(invalid.hasAttribute('data-invalid')).toBe(true)
    expect(invalid.hasAttribute('data-required')).toBe(true)
    await expect.element(input()).toHaveAccessibleDescription('Error: Välj en kommun')
    const disabled = asInputElement(page.getByRole('combobox', { name: /Land/ }).element())
    expect(disabled.disabled).toBe(true)
    expect(disabled.hasAttribute('data-disabled')).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('a disabled combobox does not open, and is not focusable', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example disabled onOpenChange={onOpenChange} />)
    expect(inputElement().disabled).toBe(true)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(isShown()).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('clicking the label focuses the input', async () => {
    await render(<Example />)
    await userEvent.click(page.getByText('Kommun', { exact: true }))
    await expect.element(input()).toHaveFocus()
    expect(isShown()).toBe(false)
  })

  test('an input in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <Combobox.Root items={['Göteborg']}>
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('an input outside a Field with no name warns once, and aria-label names it', async () => {
    await render(
      <Combobox.Root items={['Göteborg']}>
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List aria-label="Kommuner">
            {(item: string) => <Combobox.Option item={item} />}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
    resetDevWarnings()
    consoleWarn.mockClear()
    await render(
      <Combobox.Root items={['Göteborg']}>
        <Combobox.Input aria-label="Kommun" />
        <Combobox.Popup>
          <Combobox.List aria-label="Kommuner">
            {(item: string) => <Combobox.Option item={item} />}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
    await expect.element(page.getByRole('combobox', { name: 'Kommun' })).toBeVisible()
  })

  test('a part outside a Root warns once', async () => {
    await render(<Combobox.Input aria-label="Kommun" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('outside a Combobox.Root')
  })
})

describe('opening and closing', () => {
  test('typing opens the popup with the reason "input", and Escape closes it with "escape"', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(onOpenChange.mock.calls).toEqual([
      [true, { reason: 'input' }],
      [false, { reason: 'escape' }],
    ])
  })

  test('a press outside closes the popup, and focus stays where the press put it', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'outside-press' })
  })

  test('a press inside the popup keeps focus on the input', async () => {
    await render(<Example />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    popupElement()?.dispatchEvent(press)
    expect(press.defaultPrevented).toBe(true)
    await userEvent.click(option('Arvika'))
    await expect.element(input()).toHaveFocus()
  })

  test('leaving the input with Tab closes the popup', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('focus moving to another control closes the popup with the reason "blur"', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    asHtmlElement(page.getByRole('button', { name: 'Efter' }).element()).focus()
    await expect.poll(isShown).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'blur' })
  })

  test('defaultOpen shows the popup from the start', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    expect(inputElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('a controlled open follows the prop, and a refused change is pulled back', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example open={false} onOpenChange={onOpenChange} />)
    await typeText('{ArrowDown}')
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'key' })
    // The parent didn't set `open`, so nothing opens and nothing is active.
    await expect.poll(() => inputElement().getAttribute('aria-expanded')).toBe('false')
    expect(isShown()).toBe(false)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('a controlled open that the parent updates opens and closes', async () => {
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false)
      return <Example open={isOpen} onOpenChange={setIsOpen} />
    }
    await render(<Controlled />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
  })
})

describe('keyboard', () => {
  test('ArrowDown on the closed input opens it and activates the first option', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Ängelholm')
    await expect.element(option('Ängelholm')).toHaveAttribute('data-active', '')
    await expect.element(input()).toHaveFocus()
  })

  test('ArrowUp on the closed input opens it and activates the last option', async () => {
    await render(<Example />)
    await typeText('{ArrowUp}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Uppsala')
  })

  test('opening with a key activates the chosen option', async () => {
    await render(<Example defaultValue="malmo" />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Malmö')
  })

  test('ArrowDown and ArrowUp move the active option and stop at the ends: no wrap', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Arvika')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ängelholm')
    for (let step = 0; step < 8; step += 1) {
      await userEvent.keyboard('{ArrowDown}')
    }
    expect(activeName()).toBe('Uppsala')
  })

  test('PageDown and PageUp move ten options, and stop at the ends', async () => {
    await render(<Example items={numbered} />)
    await typeText('{ArrowDown}')
    expect(activeName()).toBe('Alternativ 1')
    await userEvent.keyboard('{PageDown}')
    expect(activeName()).toBe('Alternativ 11')
    await userEvent.keyboard('{PageDown}')
    await userEvent.keyboard('{PageDown}')
    expect(activeName()).toBe('Alternativ 30')
    await userEvent.keyboard('{PageUp}')
    expect(activeName()).toBe('Alternativ 20')
  })

  test('Home, End, ArrowLeft, ArrowRight and Space are left to the input: the caret moves, a space is typed, and no option stays active', async () => {
    await render(<Example />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    const prevented: string[] = []
    // Only the caret keys and Space: the ArrowDown that activates an option is cancelled on purpose.
    const record = (event: KeyboardEvent) => {
      if (event.defaultPrevented && event.key !== 'ArrowDown') {
        prevented.push(event.key)
      }
    }
    document.addEventListener('keydown', record)
    for (const key of [
      '{Home}',
      '{End}',
      '{ArrowLeft}',
      '{ArrowRight}',
      '{Shift>}{Home}{/Shift}',
      '{Shift>}{ArrowLeft}{/Shift}',
    ]) {
      await userEvent.keyboard('{ArrowDown}')
      expect(activeOption()).toBeDefined()
      await userEvent.keyboard(key)
      // The caret moved natively, so visual focus is back in the field: nothing is active.
      expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
      expect(isShown()).toBe(true)
    }
    await userEvent.keyboard('{End}')
    await userEvent.keyboard(' ')
    document.removeEventListener('keydown', record)
    expect(prevented).toEqual([])
    expect(inputElement().value).toBe('r ')
  })

  test('Enter chooses the active option, puts its text in the input and closes the popup', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    const onInputValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} onInputValueChange={onInputValueChange} />)
    await typeText('m')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Malmö')
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('malmo', { reason: 'key' })
    expect(onInputValueChange).toHaveBeenLastCalledWith('Malmö', { reason: 'selection' })
    expect(inputElement().value).toBe('Malmö')
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await expect.element(input()).toHaveFocus()
  })

  test('Enter with no active option is the browser’s own: the form submits and nothing is chosen', async () => {
    const onSubmit = vi.fn<(event: unknown) => void>()
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(
      <KvirnProvider>
        <form
          aria-label="Ansökan"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <Field.Root>
            <Field.Label>Kommun</Field.Label>
            <Combobox.Root items={['Göteborg', 'Malmö']} onValueChange={onValueChange}>
              <Combobox.Input />
              <Combobox.Popup>
                <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
              </Combobox.Popup>
            </Combobox.Root>
          </Field.Root>
          <button type="submit" style={fixtureButtonStyle}>
            Skicka
          </button>
        </form>
      </KvirnProvider>,
    )
    await typeText('m')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(inputElement().value).toBe('m')
  })

  test('Enter on an active option chooses it and does not submit the form', async () => {
    const onSubmit = vi.fn<(event: unknown) => void>()
    await render(
      <KvirnProvider>
        <form
          aria-label="Ansökan"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <Field.Root>
            <Field.Label>Kommun</Field.Label>
            <Combobox.Root items={['Göteborg', 'Malmö']}>
              <Combobox.Input />
              <Combobox.Popup>
                <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
              </Combobox.Popup>
            </Combobox.Root>
          </Field.Root>
          <button type="submit" style={fixtureButtonStyle}>
            Skicka
          </button>
        </form>
      </KvirnProvider>,
    )
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(inputElement().value).toBe('Göteborg')
  })

  test('Escape closes the popup and keeps the text and the value, and a second Escape keeps them too', async () => {
    await render(<Example defaultValue="malmo" />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Malmö')
    await userEvent.keyboard('{Escape}')
    expect(inputElement().value).toBe('Malmö')
    await expect.element(input()).toHaveFocus()
  })

  test('Escape does nothing while the popup is closed', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    inputElement().focus()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('Tab closes the popup without choosing the active option, and moves focus on', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab closes the popup without choosing, and moves focus back', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Shift+Tab leaves the input backwards while the popup is closed', async () => {
    await render(<Example />)
    inputElement().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('right to left: ArrowDown and ArrowUp still mean next and previous option, and ArrowLeft and ArrowRight only move the caret', async () => {
    await render(
      <div dir="rtl">
        <Example />
      </div>,
    )
    await typeText('{ArrowDown}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Arvika')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{ArrowLeft}')
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Ängelholm')
    await userEvent.keyboard('{ArrowRight}')
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    expect(isShown()).toBe(true)
  })

  test('Alt+ArrowDown opens the popup without activating an option', async () => {
    await render(<Example />)
    inputElement().focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Alt+ArrowUp chooses the active option and closes the popup', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('arvika', { reason: 'key' })
    expect(inputElement().value).toBe('Arvika')
  })

  test('a disabled option can be reached with the arrow keys and cannot be chosen', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    for (let step = 0; step < 5; step += 1) {
      await userEvent.keyboard('{ArrowDown}')
    }
    expect(activeName()).toBe('Stockholm')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
    asHtmlElement(option('Stockholm').element()).click()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
  })

  test('aria-activedescendant always points at a rendered option, and typing clears it', async () => {
    await render(<Example items={numbered} />)
    await typeText('{ArrowDown}')
    for (const key of ['{PageDown}', '{ArrowDown}', '{PageUp}', '{ArrowUp}', '{ArrowDown}']) {
      await userEvent.keyboard(key)
      expect(activeOption()).toBeDefined()
    }
    // The list changes under the highlight, so nothing stays active: the id never points at a stale option.
    await userEvent.keyboard('1')
    await expect.poll(() => inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{ArrowDown}')
    expect(activeOption()).toBeDefined()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Tab goes through the field in order: the input is one stop', async () => {
    await render(<Example withButtons />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(input()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('the keys it handles are cancelled, and the others are left to the browser', async () => {
    await render(<Example />)
    inputElement().focus()
    const press = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      inputElement().dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(press('ArrowDown')).toBe(true)
    expect(press('F5')).toBe(false)
    expect(press('a')).toBe(false)
    // Escape cancels while the popup is open, and Tab is the browser's (it closes the popup first).
    expect(press('Escape')).toBe(true)
    expect(press('ArrowDown')).toBe(true)
    expect(press('Tab')).toBe(false)
  })

  test('a key during an IME composition is left to the composition', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Arvika')
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      isComposing: true,
      bubbles: true,
      cancelable: true,
    })
    inputElement().dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('pointer', () => {
  test('a click on an option chooses it, closes the popup and keeps focus on the input', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} onOpenChange={onOpenChange} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(option('Örebro'))
    await expect.poll(isShown).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('orebro', { reason: 'option-press' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'option-press' })
    await expect.element(input()).toHaveFocus()
    expect(inputElement().value).toBe('Örebro')
  })

  test('moving the pointer over an option makes it the active option', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await userEvent.hover(option('Göteborg'))
    await expect.poll(activeName).toBe('Göteborg')
    await expect.element(option('Göteborg')).toHaveAttribute('data-active', '')
  })
})

describe('filtering', () => {
  test('å, ä and ö are not a and o in the Swedish provider', async () => {
    await render(<Example swedish />)
    await typeText('a')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toEqual(['Arvika', 'Malmö', 'Uppsala'])
    await userEvent.fill(input(), 'ä')
    await expect.poll(optionNames).toEqual(['Ängelholm'])
    await userEvent.fill(input(), 'ö')
    await expect.poll(optionNames).toEqual(['Göteborg', 'Malmö', 'Örebro'])
  })

  test('in English the accents are ignored: a finds Ängelholm too', async () => {
    await render(<Example />)
    await typeText('a')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toEqual(['Ängelholm', 'Arvika', 'Malmö', 'Uppsala'])
  })

  test('the filter matches anywhere in the text, and removing the text brings the whole list back', async () => {
    await render(<Example />)
    await typeText('kh')
    await expect.poll(optionNames).toEqual(['Stockholm'])
    await userEvent.fill(input(), '')
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => optionNames().length).toBe(7)
  })

  test('your own filter replaces the default', async () => {
    await render(
      <Example
        filter={(municipality, query) => municipality.code.startsWith(query.trim().toLowerCase())}
      />,
    )
    await typeText('ar')
    await expect.poll(optionNames).toEqual(['Arvika'])
  })

  test('filter={false} shows the list as given, for results that the server has filtered', async () => {
    await render(<Example filter={false} items={municipalities.slice(0, 3)} />)
    await typeText('zzz')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toEqual(['Ängelholm', 'Arvika', 'Göteborg'])
  })

  test('new items from outside replace the list', async () => {
    function Changing() {
      const [items, setItems] = useState<readonly Municipality[]>(municipalities.slice(0, 2))
      return (
        <>
          <button type="button" style={fixtureButtonStyle} onClick={() => setItems(municipalities)}>
            Hämta
          </button>
          <Example items={items} defaultValue="arvika" />
        </>
      )
    }
    await render(<Changing />)
    expect(inputElement().value).toBe('Arvika')
    await userEvent.click(page.getByRole('button', { name: 'Hämta' }))
    await userEvent.fill(input(), '')
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => optionNames().length).toBe(7)
    expect(inputElement().value).toBe('')
  })
})

describe('the text is never cleared silently', () => {
  test('text that matches no option stays after Tab and after Escape, and the value is null', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('zzz')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    expect(inputElement().value).toBe('zzz')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(inputElement().value).toBe('zzz')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('editing away from the chosen text makes the value null, and keeps what was typed', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example defaultValue="gbg" onValueChange={onValueChange} />)
    expect(inputElement().value).toBe('Göteborg')
    await userEvent.fill(input(), 'Göteborgx')
    expect(inputElement().value).toBe('Göteborgx')
    expect(onValueChange).toHaveBeenCalledWith(null, { reason: 'input' })
  })

  test('the empty text of an unchosen field never turns into a value', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('r')
    await userEvent.keyboard('{Backspace}')
    expect(inputElement().value).toBe('')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('the Clear button empties the text and the value, and focus stays on the input', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example withButtons defaultValue="gbg" onValueChange={onValueChange} />)
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    expect(inputElement().value).toBe('')
    expect(onValueChange).toHaveBeenCalledWith(null, { reason: 'clear' })
    await expect.element(input()).toHaveFocus()
    // Nothing left to clear, so the button goes.
    await expect.poll(() => page.getByRole('button', { name: 'Clear' }).elements().length).toBe(0)
  })
})

describe('Clear with several choices', () => {
  test('empties the typed text only: every chosen value stays until its own remove button', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(
      <KvirnProvider>
        <Field.Root>
          <Field.Label>Kommuner</Field.Label>
          <Combobox.Root
            multiple
            items={['Göteborg', 'Malmö', 'Uppsala']}
            defaultValue={['Malmö', 'Uppsala']}
            onValueChange={onValueChange}
          >
            <Combobox.ValueList />
            <Combobox.Control>
              <Combobox.Input />
              <Combobox.Clear />
            </Combobox.Control>
            <Combobox.Popup>
              <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    const clear = () => page.getByRole('button', { name: 'Clear' })
    // Values alone don't make a Clear button.
    expect(clear().elements()).toHaveLength(0)
    await userEvent.type(page.getByRole('combobox', { name: /Kommuner/ }), 'gö')
    await userEvent.click(clear())
    expect(asInputElement(page.getByRole('combobox', { name: /Kommuner/ }).element()).value).toBe(
      '',
    )
    expect(onValueChange).not.toHaveBeenCalled()
    expect(page.getByRole('listitem').elements()).toHaveLength(2)
    await expect.element(page.getByRole('combobox', { name: /Kommuner/ })).toHaveFocus()
    await expect.poll(() => clear().elements().length).toBe(0)
  })
})

describe('Toggle and Clear', () => {
  test('Toggle is a named button, not a tab stop, that opens and closes the popup and keeps focus on the input', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: ComboboxOpenChangeDetails) => void>()
    const { container } = await render(<Example withButtons onOpenChange={onOpenChange} />)
    const toggle = page.getByRole('button', { name: 'Show options' })
    await expect.element(toggle).toHaveAttribute('tabindex', '-1')
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    await expect.poll(isShown).toBe(true)
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect.element(input()).toHaveFocus()
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    expect(optionNames()).toHaveLength(7)
    await expectNoA11yViolations(container)
    await userEvent.click(toggle)
    await expect.poll(isShown).toBe(false)
    await expect.element(input()).toHaveFocus()
    expect(onOpenChange.mock.calls).toEqual([
      [true, { reason: 'toggle-press' }],
      [false, { reason: 'toggle-press' }],
    ])
  })

  test('Toggle and Clear are named in the provider’s language', async () => {
    await render(<Example withButtons swedish defaultValue="gbg" />)
    await expect.element(page.getByRole('button', { name: 'Visa alternativ' })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toBeVisible()
  })

  test('Clear is not rendered while there is nothing to clear, and a disabled field disables the buttons', async () => {
    await render(<Example withButtons disabled />)
    expect(page.getByRole('button', { name: 'Clear' }).elements()).toHaveLength(0)
    await expect.element(page.getByRole('button', { name: 'Show options' })).toBeDisabled()
  })
})

describe('value', () => {
  test('uncontrolled: defaultValue shows its text, and a choice is kept without a parent', async () => {
    await render(<Example defaultValue="gbg" />)
    expect(inputElement().value).toBe('Göteborg')
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(inputElement().value).toBe('Malmö')
  })

  test('opening after a choice shows the whole list, with the chosen option marked', async () => {
    await render(<Example defaultValue="malmo" />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toHaveLength(7)
    await expect.element(option('Malmö')).toHaveAttribute('aria-selected', 'true')
    await expect.element(option('Malmö')).toHaveAttribute('data-selected', '')
  })

  test('controlled: shows the value it is given, and follows it', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('gbg')
      return (
        <>
          <button type="button" style={fixtureButtonStyle} onClick={() => setValue('uppsala')}>
            Uppsala
          </button>
          <Example value={value} onValueChange={setValue} />
        </>
      )
    }
    await render(<Controlled />)
    expect(inputElement().value).toBe('Göteborg')
    await userEvent.click(page.getByRole('button', { name: 'Uppsala' }))
    await expect.poll(() => inputElement().value).toBe('Uppsala')
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => inputElement().value).toBe('Örebro')
  })

  test('controlled: stays as it is when the parent does not update the value', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example value="gbg" onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('malmo', { reason: 'key' })
    await expect.poll(() => inputElement().value).toBe('Göteborg')
  })

  test('controlled inputValue: shows the text it is given, and a refused change is pulled back', async () => {
    const onInputValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example inputValue="Gö" onInputValueChange={onInputValueChange} />)
    expect(inputElement().value).toBe('Gö')
    await userEvent.type(input(), 'x')
    expect(onInputValueChange).toHaveBeenCalledWith('Göx', { reason: 'input' })
    await expect.poll(() => inputElement().value).toBe('Gö')
  })

  test('controlled inputValue that the parent updates follows the typing', async () => {
    function Controlled() {
      const [text, setText] = useState('')
      return <Example inputValue={text} onInputValueChange={setText} />
    }
    await render(<Controlled />)
    await typeText('o')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('r')
    await expect.poll(() => inputElement().value).toBe('or')
    expect(optionNames()).toEqual(['Göteborg', 'Örebro'])
  })

  test('the value is a key: onValueChange gets the key and the reason', async () => {
    const onValueChange =
      vi.fn<(value: string | null, details: ComboboxValueChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.click(option('Uppsala'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('uppsala', { reason: 'option-press' })
  })
})

describe('multiple', () => {
  test('aria-multiselectable, and a choice adds a value, empties the text and keeps the popup open', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    const onInputValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    const { container } = await render(
      <MultipleExample onValueChange={onValueChange} onInputValueChange={onInputValueChange} />,
    )
    await typeText('m')
    await expect.poll(isShown).toBe(true)
    expect(listElement()?.getAttribute('aria-multiselectable')).toBe('true')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Malmö')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith(['malmo'], { reason: 'key' })
    expect(onInputValueChange).toHaveBeenLastCalledWith('', { reason: 'selection' })
    expect(inputElement().value).toBe('')
    expect(isShown()).toBe(true)
    await expect.poll(() => optionNames().length).toBe(7)
    await expect.element(option('Malmö')).toHaveAttribute('aria-selected', 'true')
    await expect.element(page.getByRole('button', { name: 'Remove Malmö' })).toBeVisible()
    await expect.element(input()).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('choosing an option again takes the value away', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(<MultipleExample defaultValue={['malmo']} onValueChange={onValueChange} />)
    await typeText('{ArrowDown}')
    await userEvent.click(option('Malmö'))
    expect(onValueChange).toHaveBeenCalledWith([], { reason: 'option-press' })
    expect(page.getByRole('button', { name: 'Remove Malmö' }).elements()).toHaveLength(0)
  })

  test('the value list is a list named by the Field’s label, with a remove button per value', async () => {
    const { container } = await render(
      <MultipleExample defaultValue={['malmo', 'gbg', 'uppsala']} />,
    )
    const list = container.querySelector('ul.kv-combobox-value-list')
    const label = document.querySelector('label')
    expect(list?.getAttribute('aria-labelledby')).toBe(label?.id)
    expect(
      page
        .getByRole('listitem')
        .elements()
        .map((element) => element.textContent),
    ).toEqual(['Malmö', 'Göteborg', 'Uppsala'])
    const buttons = page.getByRole('button', { name: /^Remove / }).elements()
    expect(buttons).toHaveLength(3)
    expect(buttons.every((button) => button.getAttribute('type') === 'button')).toBe(true)
    // The value list comes before the input in the document.
    const listPosition = list?.compareDocumentPosition(inputElement())
    expect((listPosition ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await expectNoA11yViolations(container)
  })

  test('the value list renders nothing while no value is chosen', async () => {
    const { container } = await render(<MultipleExample />)
    expect(container.querySelector('ul')).toBeNull()
  })

  test('removing a value moves focus to the next remove button', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(
      <MultipleExample defaultValue={['malmo', 'gbg', 'uppsala']} onValueChange={onValueChange} />,
    )
    await userEvent.click(page.getByRole('button', { name: 'Remove Göteborg' }))
    expect(onValueChange).toHaveBeenCalledWith(['malmo', 'uppsala'], { reason: 'remove' })
    await expect.element(page.getByRole('button', { name: 'Remove Uppsala' })).toHaveFocus()
  })

  test('removing the last value moves focus to the previous remove button', async () => {
    await render(<MultipleExample defaultValue={['malmo', 'gbg', 'uppsala']} />)
    await userEvent.click(page.getByRole('button', { name: 'Remove Uppsala' }))
    await expect.element(page.getByRole('button', { name: 'Remove Göteborg' })).toHaveFocus()
  })

  test('removing the only value moves focus to the input', async () => {
    await render(<MultipleExample defaultValue={['malmo']} />)
    await userEvent.click(page.getByRole('button', { name: 'Remove Malmö' }))
    await expect.element(input()).toHaveFocus()
    expect(page.getByRole('button', { name: /^Remove / }).elements()).toHaveLength(0)
  })

  test('a remove button is operated with Enter and Space, and Tab reaches it before the input', async () => {
    await render(<MultipleExample defaultValue={['malmo', 'gbg']} />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Remove Malmö' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Remove Göteborg' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('button', { name: 'Remove Malmö' })).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.element(input()).toHaveFocus()
    expect(page.getByRole('listitem').elements()).toHaveLength(0)
  })

  test('a chip is one button that holds its text, so pressing the text removes the value', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(<MultipleExample defaultValue={['malmo', 'gbg']} onValueChange={onValueChange} />)
    const button = page.getByRole('button', { name: 'Remove Malmö' }).element()
    expect(button.textContent).toBe('Malmö')
    expect(button.closest('li')?.querySelectorAll('button')).toHaveLength(1)
    await userEvent.click(page.getByText('Malmö', { exact: true }))
    expect(onValueChange).toHaveBeenCalledWith(['gbg'], { reason: 'remove' })
    await expect.element(page.getByRole('button', { name: 'Remove Göteborg' })).toHaveFocus()
  })

  test('a custom removeIcon replaces the cross inside the button and stays hidden from the name', async () => {
    await render(
      <KvirnProvider locale="en">
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          multiple
          defaultValue={['malmo']}
        >
          <Combobox.ValueList>
            {(item) => <Combobox.Value item={item} removeIcon={<svg data-testid="icon" />} />}
          </Combobox.ValueList>
          <Combobox.Input aria-label="Kommun" />
        </Combobox.Root>
      </KvirnProvider>,
    )
    const button = page.getByRole('button', { name: 'Remove Malmö' }).element()
    expect(
      button.querySelector('.kv-tag-remove-icon[aria-hidden="true"] [data-testid="icon"]'),
    ).not.toBeNull()
  })

  test('warns in development when the children are a string that does not contain the item text', async () => {
    await render(
      <KvirnProvider locale="en">
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          multiple
          defaultValue={['malmo']}
        >
          <Combobox.ValueList>
            {(item) => <Combobox.Value item={item}>Sthlm</Combobox.Value>}
          </Combobox.ValueList>
          <Combobox.Input aria-label="Kommun" />
        </Combobox.Root>
      </KvirnProvider>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Combobox.Value'))
  })

  test('the old kv-combobox-value classes stay as aliases next to the Tag classes', async () => {
    const { container } = await render(<MultipleExample defaultValue={['malmo']} />)
    const chip = container.querySelector('li')
    expect(chip?.classList.contains('kv-tag')).toBe(true)
    expect(chip?.classList.contains('kv-combobox-value')).toBe(true)
    const button = chip?.querySelector('button')
    expect(button?.classList.contains('kv-tag-remove')).toBe(true)
    expect(button?.classList.contains('kv-combobox-value-remove')).toBe(true)
    expect(container.querySelector('ul')?.classList.contains('kv-tag-group-list')).toBe(true)
  })

  test('Backspace in the empty input does not remove a value', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(<MultipleExample defaultValue={['malmo', 'gbg']} onValueChange={onValueChange} />)
    inputElement().focus()
    await userEvent.keyboard('{Backspace}')
    await userEvent.keyboard('{Backspace}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(page.getByRole('listitem').elements()).toHaveLength(2)
  })

  test('Tab closes the popup without choosing, and the typed text stays', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(<MultipleExample onValueChange={onValueChange} />)
    await typeText('zz')
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('zz')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('controlled: the keys it is given are chosen, in order, and a refused removal is kept', async () => {
    const onValueChange = vi.fn<(value: string[], details: ComboboxValueChangeDetails) => void>()
    await render(<MultipleExample value={['uppsala', 'gbg']} onValueChange={onValueChange} />)
    expect(
      page
        .getByRole('listitem')
        .elements()
        .map((element) => element.textContent),
    ).toEqual(['Uppsala', 'Göteborg'])
    await userEvent.click(page.getByRole('button', { name: 'Remove Uppsala' }))
    expect(onValueChange).toHaveBeenCalledWith(['gbg'], { reason: 'remove' })
    await expect.poll(() => page.getByRole('listitem').elements().length).toBe(2)
    // Nothing was removed, so focus stays on the button that was pressed.
    await expect.element(page.getByRole('button', { name: 'Remove Uppsala' })).toHaveFocus()
  })

  test('the chosen values stay in the list when the filter hides their options', async () => {
    await render(<MultipleExample defaultValue={['malmo']} />)
    await typeText('r')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toEqual(['Arvika', 'Göteborg', 'Örebro'])
    expect(page.getByRole('button', { name: 'Remove Malmö' }).elements()).toHaveLength(1)
  })
})

describe('forms', () => {
  test('with a name, a hidden input carries the chosen key in a plain form, and the typed text is not sent', async () => {
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
        <button type="submit" style={fixtureButtonStyle}>
          Skicka
        </button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('')
    await typeText('{ArrowDown}')
    await userEvent.click(option('Uppsala'))
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('uppsala')
    expect(inputElement().hasAttribute('name')).toBe(false)
    expect([...(submitted?.keys() ?? [])]).toEqual(['municipality'])
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
        <button type="submit" style={fixtureButtonStyle}>
          Skicka
        </button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.getAll('municipality')).toEqual(['malmo', 'gbg'])
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(2)
  })

  test('a disabled combobox sends nothing, and there is no hidden input without a name', async () => {
    await render(<Example name="municipality" disabled defaultValue="gbg" />)
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
    await render(<Example defaultValue="gbg" />)
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })
})

describe('announcements', () => {
  test('the result count is announced politely once typing stops, in the provider’s language', async () => {
    await render(<Example announcementDebounceMilliseconds={30} />)
    await typeText('r')
    await expect.element(status()).toHaveTextContent('3 results')
  })

  test('the count is Swedish in the Swedish provider, and singular for one', async () => {
    await render(<Example swedish announcementDebounceMilliseconds={30} />)
    await typeText('kh')
    await expect.element(status()).toHaveTextContent('1 resultat')
  })

  test('no results and loading are announced', async () => {
    function Loading() {
      const [isLoading, setIsLoading] = useState(true)
      return (
        <>
          <button type="button" style={fixtureButtonStyle} onClick={() => setIsLoading(false)}>
            Klar
          </button>
          <Example
            filter={false}
            items={[]}
            isLoading={isLoading}
            announcementDebounceMilliseconds={30}
          />
        </>
      )
    }
    await render(<Loading />)
    await typeText('zz')
    await expect.element(status()).toHaveTextContent('Loading results')
    await expect.poll(emptyText).toBe('Loading results')
    expect(optionNames()).toEqual([])
    await userEvent.click(page.getByRole('button', { name: 'Klar' }))
    await typeText('z')
    await expect.element(status()).toHaveTextContent('No results')
  })

  test('nothing is announced while the user is typing, and the count comes after a pause', async () => {
    await render(<Example />)
    await typeText('o')
    await userEvent.keyboard('r')
    // The default wait is 500 ms: right after typing the region is still empty.
    expect(status().element().textContent).toBe('')
    await expect.element(status(), { timeout: 3000 }).toHaveTextContent('2 results')
  })

  test('opening with a key or the Toggle announces no count, and the active option is never announced by us', async () => {
    await render(<Example withButtons announcementDebounceMilliseconds={30} />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await userEvent.click(page.getByRole('button', { name: 'Show options' }))
    await expect.poll(isShown).toBe(true)
    // The list didn't change: wait longer than the debounce and the live region's own delay.
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(status().element().textContent).toBe('')
    // Typing is what gets a count.
    await userEvent.keyboard('r')
    await expect.element(status()).toHaveTextContent('3 results')
    expect(status().element().textContent).not.toContain('Arvika')
  })

  test('without a provider nothing is announced and one warning is logged', async () => {
    await render(
      <Field.Root>
        <Field.Label>Kommun</Field.Label>
        <Combobox.Root items={['Göteborg']} announcementDebounceMilliseconds={10}>
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>{(item: string) => <Combobox.Option item={item} />}</Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>,
    )
    await typeText('g')
    await expect
      .poll(
        () =>
          consoleWarn.mock.calls.filter(([message]) => String(message).includes('useAnnouncer()'))
            .length,
      )
      .toBe(1)
  })
})

describe('useCombobox', () => {
  test('spreads the same props on your own elements', async () => {
    function Own() {
      const countryCombobox: UseComboboxResult<string> = useCombobox({
        items: ['Sverige', 'Norge'],
        id: 'land',
      })
      return (
        <KvirnProvider>
          <label htmlFor="land">Land</label>
          <input {...countryCombobox.inputProps} />
          <div {...countryCombobox.popupProps}>
            <div {...countryCombobox.listProps}>
              {countryCombobox.isOpen
                ? countryCombobox.entries.map((entry) => (
                    <div key={entry.key} {...countryCombobox.getOptionProps(entry)}>
                      {entry.label}
                    </div>
                  ))
                : null}
            </div>
          </div>
        </KvirnProvider>
      )
    }
    await render(<Own />)
    expect(page.getByRole('combobox', { name: 'Land' }).element().id).toBe('land')
    await userEvent.type(page.getByRole('combobox', { name: 'Land' }), 'n')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(option('Norge'))
    await expect.poll(isShown).toBe(false)
  })
})

describe('server rendering', () => {
  test('the server markup has the input, a closed popup and a hidden input, and no options', () => {
    const markup = renderToString(
      <Field.Root controlId="kommun" required>
        <Field.Label>Kommun</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="gbg"
        >
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>,
    )
    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('id="kommun"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-autocomplete="list"')
    expect(markup).toContain('value="Göteborg"')
    expect(markup).toContain('popover="manual"')
    expect(markup).toContain('role="listbox"')
    expect(markup).not.toContain('role="option"')
    expect(markup).toContain('type="hidden"')
    expect(markup).toContain('value="gbg"')
  })
})

describe('types', () => {
  test('the value is a key or null, and an array with multiple', () => {
    expectTypeOf<UseComboboxSingleOptions<string>['value']>().toEqualTypeOf<
      string | null | undefined
    >()
    expectTypeOf<UseComboboxMultipleOptions<string>['value']>().toEqualTypeOf<
      readonly string[] | undefined
    >()
    expectTypeOf<UseComboboxMultipleOptions<string>['multiple']>().toEqualTypeOf<true>()
    expectTypeOf<ComboboxRootProps<Municipality>['items']>().toEqualTypeOf<
      readonly Municipality[] | undefined
    >()
    expectTypeOf<
      UseComboboxResult<Municipality>['selectedValues'][number]['item']
    >().toEqualTypeOf<Municipality>()
  })
})
