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
import { Combobox } from '../combobox/combobox.tsx'
import type { ComboboxInputChangeDetails } from '../combobox/use-combobox.ts'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Autocomplete } from './autocomplete.tsx'
import type { AutocompleteRootProps } from './autocomplete.tsx'
import { useAutocomplete } from './use-autocomplete.ts'
import type { UseAutocompleteOptions, UseAutocompleteResult } from './use-autocomplete.ts'
import { Prose } from '../prose/prose.tsx'

// Contract: autocomplete.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/autocomplete/autocomplete.e2e.ts. Component tests load no theme:
// the popup is the browser's own `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeAll(() => {
  // The theme sizes these buttons, and no theme is loaded here: give them the 24px that 2.5.8 asks
  // for, so axe checks the Autocomplete and not the missing styles.
  const style = document.createElement('style')
  style.textContent =
    '.kv-autocomplete-toggle, .kv-autocomplete-clear { min-block-size: 2rem; min-inline-size: 2rem; }'
  document.head.append(style)
})

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const streets: readonly string[] = [
  'Storgatan',
  'Stora Torget',
  'Kungsgatan',
  'Kyrkogatan',
  'Älvgatan',
  'Östra vägen',
]

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Autocomplete. */
const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

type ExampleProps = Partial<UseAutocompleteOptions<string>> & {
  swedish?: boolean
  withButtons?: boolean
}

function Example({
  items = streets,
  swedish = false,
  withButtons = false,
  ...rootProps
}: ExampleProps) {
  return (
    <KvirnProvider locale={swedish ? 'sv-SE' : 'en'} messages={swedish ? sv : undefined}>
      <p>Text utanför</p>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Field.Root required>
        <Field.Label>Gatuadress</Field.Label>
        <Prose>Gatan där du bor.</Prose>
        <Autocomplete.Root items={items} {...rootProps}>
          {withButtons ? (
            <Autocomplete.Control>
              <Autocomplete.Input />
              <Autocomplete.Clear />
              <Autocomplete.Toggle />
            </Autocomplete.Control>
          ) : (
            <Autocomplete.Input />
          )}
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
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
  test('a closed autocomplete: a native input wired to a hidden listbox popup', async () => {
    const { container } = await render(<Example />)
    const element = inputElement()
    const popup = popupElement()
    expect(element.tagName).toBe('INPUT')
    expect(element.getAttribute('role')).toBe('combobox')
    expect(element.getAttribute('aria-autocomplete')).toBe('list')
    expect(element.getAttribute('aria-expanded')).toBe('false')
    expect(element.getAttribute('autocomplete')).toBe('off')
    expect(element.className).toBe('kv-autocomplete-input')
    expect(element.hasAttribute('aria-activedescendant')).toBe(false)
    const list = listElement()
    // The popup is the role-less shell, and the list inside it is the listbox that aria-controls points at.
    expect(popup?.hasAttribute('role')).toBe(false)
    expect(popup?.getAttribute('popover')).toBe('manual')
    expect(list?.getAttribute('role')).toBe('listbox')
    expect(list?.hasAttribute('aria-multiselectable')).toBe(false)
    expect(element.getAttribute('aria-controls')).toBe(list?.id)
    expect(isShown()).toBe(false)
    expect(page.getByRole('option').elements()).toHaveLength(0)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the Field’s label names the input, and the hint describes it', async () => {
    await render(<Example />)
    const label = document.querySelector('label')
    expect(inputElement().id).toBe(label?.getAttribute('for'))
    await expect.element(input()).toHaveAccessibleName('Gatuadress')
    await expect.element(input()).toHaveAccessibleDescription('Gatan där du bor.')
  })

  test('typing opens the popup with the matching suggestions, and focus stays on the input', async () => {
    const { container } = await render(<Example />)
    await typeText('sto')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().getAttribute('aria-expanded')).toBe('true')
    expect(optionNames()).toEqual(['Storgatan', 'Stora Torget'])
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await expect.element(input()).toHaveFocus()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the popup opens for text, and closes again when the text is emptied', async () => {
    await render(<Example />)
    await typeText('s')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Backspace}')
    await expect.poll(isShown).toBe(false)
  })

  test('a click on the input does not open the popup', async () => {
    await render(<Example defaultValue="Storgatan" />)
    await userEvent.click(input())
    await expect.element(input()).toHaveFocus()
    expect(isShown()).toBe(false)
  })

  test('no suggestion is selected, and Autocomplete.Empty says "No results" when nothing matches', async () => {
    const { container } = await render(<Example />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    for (const element of page.getByRole('option').elements()) {
      expect(element.getAttribute('aria-selected')).toBe('false')
    }
    await userEvent.keyboard('q')
    await expect
      .poll(() => document.querySelector('.kv-listbox-empty')?.textContent)
      .toBe('No results')
    // Plain text beside a hidden listbox, not an option.
    expect(optionNames()).toEqual([])
    expect(listElement()?.hasAttribute('hidden')).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('with no suggestion and nothing loading the input reports collapsed, with or without Empty', async () => {
    await render(
      <KvirnProvider>
        <Field.Root>
          <Field.Label>Gatuadress</Field.Label>
          <Autocomplete.Root items={streets}>
            <Autocomplete.Input />
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(street: string) => <Autocomplete.Option item={street} />}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    await typeText('sto')
    await expect.poll(() => inputElement().getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('qq')
    // No suggestion: the listbox is hidden, and the input says so.
    await expect.poll(() => inputElement().getAttribute('aria-expanded')).toBe('false')
    expect(inputElement().getAttribute('aria-controls')).toBe(listElement()?.id)
    expect(listElement()?.hasAttribute('hidden')).toBe(true)
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect.poll(() => inputElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('forwards refs and className, and merges them with its own', async () => {
    const inputRef = createRef<HTMLInputElement>()
    await render(
      <KvirnProvider>
        <Field.Root>
          <Field.Label>Gatuadress</Field.Label>
          <Autocomplete.Root items={streets}>
            <Autocomplete.Input ref={inputRef} className="egen" data-egen="input" />
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(street: string) => <Autocomplete.Option item={street} />}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    expect(inputRef.current).toBe(inputElement())
    expect(inputRef.current?.className).toBe('egen kv-autocomplete-input')
    expect(inputRef.current?.getAttribute('data-egen')).toBe('input')
  })

  test('the Combobox’s parts work under Autocomplete.Root: the Root decides how they behave', async () => {
    await render(
      <KvirnProvider>
        <Field.Root>
          <Field.Label>Gatuadress</Field.Label>
          <Autocomplete.Root items={streets} defaultValue="Kung">
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>{(street: string) => <Combobox.Option item={street} />}</Combobox.List>
            </Combobox.Popup>
          </Autocomplete.Root>
        </Field.Root>
      </KvirnProvider>,
    )
    expect(inputElement().className).toBe('kv-autocomplete-input')
  })
})

describe('the value is the text', () => {
  test('uncontrolled: defaultValue shows, and the popup stays closed', async () => {
    await render(<Example defaultValue="Kung" />)
    expect(inputElement().value).toBe('Kung')
    expect(isShown()).toBe(false)
  })

  test('typing reports the text with the reason "input", and nothing is turned into a key', async () => {
    const onValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('ab')
    expect(onValueChange.mock.calls).toEqual([
      ['a', { reason: 'input' }],
      ['ab', { reason: 'input' }],
    ])
    // Text that matches nothing is a fine value for an Autocomplete.
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Tab}')
    expect(inputElement().value).toBe('ab')
  })

  test('Enter on an active suggestion fills the input and closes the popup', async () => {
    const onValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await typeText('ky')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeName()).toBe('Kyrkogatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Kyrkogatan')
    expect(onValueChange).toHaveBeenLastCalledWith('Kyrkogatan', { reason: 'selection' })
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await expect.element(input()).toHaveFocus()
  })

  test('a click on a suggestion fills the input, closes the popup and keeps focus on the input', async () => {
    await render(<Example />)
    await typeText('sto')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(option('Stora Torget'))
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Stora Torget')
    await expect.element(input()).toHaveFocus()
  })

  test('Enter with no active suggestion is the browser’s own: the form submits what was typed', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Example name="street" />
        <button type="submit" style={fixtureButtonStyle}>
          Skicka
        </button>
      </form>,
    )
    await typeText('Ingen gata')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{Enter}')
    expect(submitted?.get('street')).toBe('Ingen gata')
  })

  test('with a name, the input itself carries the text, and there is no hidden input', async () => {
    await render(<Example name="street" defaultValue="Storgatan" />)
    expect(inputElement().getAttribute('name')).toBe('street')
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })

  test('controlled: shows the text it is given, and a refused change is pulled back', async () => {
    const onValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example value="Kung" onValueChange={onValueChange} />)
    expect(inputElement().value).toBe('Kung')
    await userEvent.type(input(), 's')
    expect(onValueChange).toHaveBeenCalledWith('Kungs', { reason: 'input' })
    await expect.poll(() => inputElement().value).toBe('Kung')
  })

  test('controlled: follows a parent that updates the value', async () => {
    function Controlled() {
      const [value, setValue] = useState('')
      return <Example value={value} onValueChange={setValue} />
    }
    await render(<Controlled />)
    await typeText('ky')
    await expect.poll(() => inputElement().value).toBe('ky')
    await expect.poll(optionNames).toEqual(['Kyrkogatan'])
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => inputElement().value).toBe('Kyrkogatan')
  })

  test('the text is never cleared silently: Escape and Tab keep it', async () => {
    await render(<Example />)
    await typeText('zz')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('zz')
    await userEvent.keyboard('{Escape}')
    expect(inputElement().value).toBe('zz')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(inputElement().value).toBe('zz')
  })

  test('the Clear button empties the text, closes the popup and keeps focus on the input', async () => {
    const onValueChange = vi.fn<(value: string, details: ComboboxInputChangeDetails) => void>()
    await render(<Example withButtons defaultValue="Storgatan" onValueChange={onValueChange} />)
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    expect(inputElement().value).toBe('')
    expect(onValueChange).toHaveBeenCalledWith('', { reason: 'clear' })
    await expect.element(input()).toHaveFocus()
    expect(isShown()).toBe(false)
  })

  test('Toggle opens the popup with every suggestion, and is not a tab stop', async () => {
    const { container } = await render(<Example withButtons />)
    const toggle = page.getByRole('button', { name: 'Show options' })
    await expect.element(toggle).toHaveAttribute('tabindex', '-1')
    await userEvent.click(toggle)
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toHaveLength(6)
    await expect.element(input()).toHaveFocus()
    await expectNoA11yViolations(container)
    await userEvent.click(toggle)
    await expect.poll(isShown).toBe(false)
  })
})

describe('keyboard', () => {
  test('ArrowDown on the closed input opens it with every suggestion and activates the first', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toHaveLength(6)
    expect(activeName()).toBe('Storgatan')
  })

  test('ArrowUp on the closed input activates the last suggestion', async () => {
    await render(<Example />)
    await typeText('{ArrowUp}')
    await expect.poll(isShown).toBe(true)
    expect(activeName()).toBe('Östra vägen')
  })

  test('arrows move the active suggestion and stop at the ends, and typing clears it', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeName()).toBe('Storgatan')
    for (let step = 0; step < 8; step += 1) {
      await userEvent.keyboard('{ArrowDown}')
    }
    expect(activeName()).toBe('Östra vägen')
    await userEvent.keyboard('a')
    await expect.poll(() => inputElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('Tab closes the popup without picking the active suggestion, and moves focus on', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await userEvent.keyboard('{Tab}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Alt+ArrowDown opens without activating, and Alt+ArrowUp picks the active suggestion', async () => {
    await render(<Example />)
    inputElement().focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(isShown).toBe(true)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().value).toBe('Storgatan')
  })

  test('Home, End, ArrowLeft, ArrowRight and Space are left to the input: the caret moves, and no suggestion stays active', async () => {
    await render(<Example />)
    await typeText('s')
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
    expect(inputElement().value).toBe('s ')
  })

  test('aria-activedescendant always points at a rendered option', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    for (const key of ['{ArrowDown}', '{PageDown}', '{PageUp}', '{ArrowUp}']) {
      await userEvent.keyboard(key)
      expect(activeOption()).toBeDefined()
    }
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(inputElement().hasAttribute('aria-activedescendant')).toBe(false)
  })

  test('a press outside closes the popup, and focus stays where the press put it', async () => {
    await render(<Example />)
    await typeText('s')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('the popup is under the input and never covers it', async () => {
    await render(<Example />)
    await typeText('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    const inputBox = inputElement().getBoundingClientRect()
    const popupBox = popupElement()?.getBoundingClientRect()
    expect(popupBox).toBeDefined()
    const popupTop = popupBox?.top ?? 0
    const popupBottom = popupBox?.bottom ?? 0
    expect(popupTop >= inputBox.bottom - 1 || popupBottom <= inputBox.top + 1).toBe(true)
  })
})

describe('suggestions', () => {
  test('the suggestions are filtered in the provider’s locale: å, ä and ö are not a and o in Swedish', async () => {
    await render(<Example swedish />)
    await userEvent.fill(input(), 'o')
    await expect.poll(isShown).toBe(true)
    // Ö is not o: Östra vägen is not among them.
    expect(optionNames()).toEqual(['Storgatan', 'Stora Torget', 'Kyrkogatan'])
    await userEvent.fill(input(), 'ä')
    await expect.poll(optionNames).toEqual(['Älvgatan', 'Östra vägen'])
  })

  test('your own filter replaces the default, and filter={false} shows what the server sent', async () => {
    await render(<Example filter={false} items={streets.slice(0, 2)} />)
    await typeText('zzz')
    await expect.poll(isShown).toBe(true)
    expect(optionNames()).toEqual(['Storgatan', 'Stora Torget'])
  })

  test('new suggestions from outside replace the list', async () => {
    function Fetched() {
      const [items, setItems] = useState<readonly string[]>([])
      return (
        <>
          <button type="button" style={fixtureButtonStyle} onClick={() => setItems(streets)}>
            Hämta
          </button>
          <Example items={items} filter={false} />
        </>
      )
    }
    await render(<Fetched />)
    await userEvent.click(page.getByRole('button', { name: 'Hämta' }))
    await typeText('s')
    await expect.poll(() => optionNames().length).toBe(6)
  })
})

describe('announcements', () => {
  test('the result count is announced politely once typing stops, in the provider’s language', async () => {
    await render(<Example announcementDebounceMilliseconds={30} />)
    await typeText('sto')
    await expect.element(status()).toHaveTextContent('2 results')
  })

  test('the count is Swedish in the Swedish provider', async () => {
    await render(<Example swedish announcementDebounceMilliseconds={30} />)
    await typeText('kung')
    await expect.element(status()).toHaveTextContent('1 resultat')
  })

  test('no results is announced', async () => {
    await render(<Example announcementDebounceMilliseconds={30} />)
    await typeText('qq')
    await expect.element(status()).toHaveTextContent('No results')
  })

  test('loading is announced while the server answers', async () => {
    await render(
      <Example filter={false} items={[]} isLoading announcementDebounceMilliseconds={30} />,
    )
    await typeText('a')
    await expect.element(status()).toHaveTextContent('Loading results')
  })

  test('nothing is announced while the user is typing', async () => {
    await render(<Example />)
    await typeText('s')
    await userEvent.keyboard('t')
    await userEvent.keyboard('o')
    expect(status().element().textContent).toBe('')
    await expect.element(status(), { timeout: 3000 }).toHaveTextContent('2 results')
  })
})

describe('useAutocomplete', () => {
  test('spreads the same props on your own elements', async () => {
    function Own() {
      const streetAutocomplete: UseAutocompleteResult<string> = useAutocomplete({
        items: ['Storgatan', 'Kungsgatan'],
        id: 'gata',
      })
      return (
        <KvirnProvider>
          <label htmlFor="gata">Gata</label>
          <input {...streetAutocomplete.inputProps} />
          <div {...streetAutocomplete.popupProps}>
            <div {...streetAutocomplete.listProps}>
              {streetAutocomplete.isOpen
                ? streetAutocomplete.entries.map((entry) => (
                    <div key={entry.key} {...streetAutocomplete.getOptionProps(entry)}>
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
    expect(page.getByRole('combobox', { name: 'Gata' }).element().id).toBe('gata')
    await userEvent.type(page.getByRole('combobox', { name: 'Gata' }), 'kun')
    await expect.poll(isShown).toBe(true)
    await userEvent.click(option('Kungsgatan'))
    await expect.poll(isShown).toBe(false)
  })
})

describe('server rendering', () => {
  test('the server markup has the input with its text, a closed popup and no options', () => {
    const markup = renderToString(
      <Field.Root controlId="gata">
        <Field.Label>Gatuadress</Field.Label>
        <Autocomplete.Root items={streets} name="street" defaultValue="Kung">
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>,
    )
    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('id="gata"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('value="Kung"')
    expect(markup).toContain('name="street"')
    expect(markup).toContain('popover="manual"')
    expect(markup).not.toContain('role="option"')
    expect(markup).not.toContain('type="hidden"')
  })
})

describe('types', () => {
  test('the value is the text', () => {
    expectTypeOf<UseAutocompleteOptions<string>['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<UseAutocompleteOptions<string>['defaultValue']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<AutocompleteRootProps<string>['items']>().toEqualTypeOf<
      readonly string[] | undefined
    >()
  })
})
