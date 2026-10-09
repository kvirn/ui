import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Autocomplete } from '../autocomplete/autocomplete.tsx'
import { Combobox } from '../combobox/combobox.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Icon } from '../icon/icon.tsx'
import * as api from '../index.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Listbox } from './listbox.tsx'

// Plan 0030, phase 1: rich options. Contracts: listbox.a11y.md, combobox.a11y.md and
// autocomplete.a11y.md (Rich options). Keys, typeahead and filtering are unchanged and covered by
// their own tests. Component tests load no theme, so nothing here looks at how a rich option is laid out.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface Country {
  code: string
  name: string
  capital: string
}

const countries: readonly Country[] = [
  { code: 'se', name: 'Sverige', capital: 'Stockholm' },
  { code: 'fi', name: 'Finland', capital: 'Helsingfors' },
  { code: 'no', name: 'Norge', capital: 'Oslo' },
]

const itemToString = (country: Country) => country.name
const itemToKey = (country: Country) => country.code

/** Warnings that are about the rich parts, not the fixture. */
const richWarnings = () =>
  consoleWarn.mock.calls.filter((call) => String(call[0]).includes('Listbox.Option'))

/** A decorative flag: an empty `alt`, as the docs ask. */
function Flag() {
  return <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="16" height="16" />
}

function RichListbox({
  items = countries,
  withText = true,
  withDescription = true,
  withIndicator = true,
  withIcon = true,
  ...rootProps
}: {
  items?: readonly Country[]
  withText?: boolean
  withDescription?: boolean
  withIndicator?: boolean
  withIcon?: boolean
  native?: 'auto' | 'always' | 'never'
  defaultOpen?: boolean
  defaultValue?: string | null
  virtualize?: boolean | { estimateSize?: number; overscan?: number }
}) {
  return (
    <Field.Root>
      <Field.Label>Land</Field.Label>
      <Listbox.Root
        items={items}
        itemToString={itemToString}
        itemToKey={itemToKey}
        native="never"
        defaultOpen
        {...rootProps}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder="Välj land" />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List style={{ maxBlockSize: '12rem', overflowY: 'auto' }}>
            {(country: Country) => (
              <Listbox.Option item={country}>
                {withIcon ? (
                  <Listbox.OptionIcon>
                    <Flag />
                  </Listbox.OptionIcon>
                ) : null}
                {withText ? <Listbox.OptionText>{country.name}</Listbox.OptionText> : country.name}
                {withDescription ? (
                  <Listbox.OptionDescription>{country.capital}</Listbox.OptionDescription>
                ) : (
                  ` ${country.capital}`
                )}
                {withIndicator ? (
                  <Listbox.OptionIndicator>
                    <span>Vald</span>
                  </Listbox.OptionIndicator>
                ) : null}
              </Listbox.Option>
            )}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

const trigger = () => page.getByRole('combobox', { name: /Land/ })
const triggerElement = () => trigger().element()
const option = (name: string) => page.getByRole('option', { name, exact: true })
const optionElement = (name: string) => option(name).element()

describe('Listbox rich options: name and description', () => {
  test('OptionText is the option’s accessible name, so the second line is not part of it', async () => {
    const { container } = await render(<RichListbox />)
    // The name is the text alone, and the flag and the "Vald" mark are out of it.
    await expect.element(option('Sverige')).toBeInTheDocument()
    const element = optionElement('Sverige')
    const text = element.querySelector('.kv-listbox-option-text')
    expect(text?.id).not.toBe('')
    expect(element.getAttribute('aria-labelledby')).toBe(text?.id)
    await expectNoA11yViolations(container)
    expect(richWarnings()).toEqual([])
  })

  test('OptionDescription is the option’s accessible description', async () => {
    await render(<RichListbox />)
    const element = optionElement('Sverige')
    const description = element.querySelector('.kv-listbox-option-description')
    expect(description?.id).not.toBe('')
    expect(element.getAttribute('aria-describedby')).toBe(description?.id)
    await expect.element(option('Sverige')).toHaveAccessibleDescription('Stockholm')
    await expect.element(option('Norge')).toHaveAccessibleDescription('Oslo')
  })

  test('each option points at its own text and description', async () => {
    await render(<RichListbox />)
    const ids = page
      .getByRole('option')
      .elements()
      .flatMap((element) => [
        element.getAttribute('aria-labelledby'),
        element.getAttribute('aria-describedby'),
      ])
    expect(ids).toHaveLength(6)
    expect(new Set(ids).size).toBe(6)
  })

  test('with no OptionText the name is the option’s whole content, as before', async () => {
    await render(<RichListbox withText={false} withDescription={false} />)
    const element = optionElement('Sverige Stockholm')
    expect(element.hasAttribute('aria-labelledby')).toBe(false)
    expect(element.hasAttribute('aria-describedby')).toBe(false)
  })

  test('a description with no OptionText leaves the name as the content', async () => {
    await render(<RichListbox withText={false} />)
    const element = page.getByRole('option').first().element()
    expect(element.hasAttribute('aria-labelledby')).toBe(false)
    expect(element.getAttribute('aria-describedby')).not.toBeNull()
    // The description is still part of the content, so it is part of the name.
    await expect.element(page.getByRole('option').first()).toHaveAccessibleName(/Stockholm/)
  })

  test('the option’s own aria-label wins over OptionText, and its aria-describedby is kept', async () => {
    await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root items={countries} itemToString={itemToString} native="never" defaultOpen>
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(country: Country) => (
                <Listbox.Option item={country} aria-label="Eget namn" aria-describedby="extra">
                  <Listbox.OptionText>{country.name}</Listbox.OptionText>
                  <Listbox.OptionDescription>{country.capital}</Listbox.OptionDescription>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    const element = page.getByRole('option').first().element()
    expect(element.hasAttribute('aria-labelledby')).toBe(false)
    expect(element.getAttribute('aria-label')).toBe('Eget namn')
    expect(element.getAttribute('aria-describedby')?.split(' ')).toContain('extra')
    expect(element.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2)
  })

  test('the active rich option is read by its name through aria-activedescendant', async () => {
    await render(<RichListbox />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => triggerElement().hasAttribute('aria-activedescendant')).toBe(true)
    const active = document.getElementById(
      triggerElement().getAttribute('aria-activedescendant') ?? '',
    )
    expect(active?.getAttribute('role')).toBe('option')
    const text = document.getElementById(active?.getAttribute('aria-labelledby') ?? '')
    expect(text?.textContent).toBe('Sverige')
    await expect.element(option('Sverige')).toHaveAttribute('data-active')
  })

  test('the trigger’s value and typeahead still use itemToString', async () => {
    await render(<RichListbox defaultValue="fi" />)
    await expect.element(trigger()).toHaveAccessibleName('Land (optional) Finland')
    triggerElement().focus()
    await userEvent.keyboard('n')
    await expect.poll(() => option('Norge').element().hasAttribute('data-active')).toBe(true)
  })
})

describe('Listbox rich options: decorative parts', () => {
  test('OptionIcon and OptionIndicator are aria-hidden', async () => {
    await render(<RichListbox defaultValue="se" />)
    const element = optionElement('Sverige')
    const icon = element.querySelector('.kv-listbox-option-icon')
    const indicator = element.querySelector('.kv-listbox-option-indicator')
    expect(icon?.tagName).toBe('SPAN')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(indicator?.tagName).toBe('SPAN')
    expect(indicator?.getAttribute('aria-hidden')).toBe('true')
  })

  test('the indicator’s children replace the check and show only on the chosen option', async () => {
    await render(<RichListbox defaultValue="se" />)
    const chosen = optionElement('Sverige').querySelector('.kv-listbox-option-indicator')
    const other = optionElement('Finland').querySelector('.kv-listbox-option-indicator')
    expect(chosen?.textContent).toBe('Vald')
    expect(chosen?.hasAttribute('data-selected')).toBe(true)
    // The place is kept, so the options line up, and nothing shows.
    expect(other).not.toBeNull()
    expect(other?.textContent).toBe('')
    expect(other?.hasAttribute('data-selected')).toBe(false)
  })

  test('every option with an OptionIndicator is marked data-has-indicator', async () => {
    await render(<RichListbox defaultValue="se" />)
    for (const element of page.getByRole('option').elements()) {
      expect(element.hasAttribute('data-has-indicator')).toBe(true)
    }
  })

  test('without OptionIndicator no option is marked data-has-indicator', async () => {
    await render(<RichListbox withIndicator={false} defaultValue="se" />)
    for (const element of page.getByRole('option').elements()) {
      expect(element.hasAttribute('data-has-indicator')).toBe(false)
    }
    expect(document.querySelector('.kv-listbox-option-indicator')).toBeNull()
    // aria-selected is the state, with or without the mark.
    expect(optionElement('Sverige').getAttribute('aria-selected')).toBe('true')
  })

  test('the data-has-indicator mark follows the part when it mounts and unmounts', async () => {
    const { rerender } = await render(<RichListbox withIndicator={false} />)
    expect(optionElement('Sverige').hasAttribute('data-has-indicator')).toBe(false)
    await rerender(<RichListbox withIndicator />)
    await expect.poll(() => optionElement('Sverige').hasAttribute('data-has-indicator')).toBe(true)
    await rerender(<RichListbox withIndicator={false} />)
    await expect.poll(() => optionElement('Sverige').hasAttribute('data-has-indicator')).toBe(false)
  })

  test('a chosen rich option has no axe violations', async () => {
    const { container } = await render(<RichListbox defaultValue="fi" />)
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })
})

describe('Listbox rich options: the parts', () => {
  test('forward refs, className and native props, and keep their own class and id', async () => {
    const iconRef = createRef<HTMLSpanElement>()
    const textRef = createRef<HTMLSpanElement>()
    const descriptionRef = createRef<HTMLSpanElement>()
    const indicatorRef = createRef<HTMLSpanElement>()
    await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root items={['Sverige']} native="never" defaultOpen defaultValue="Sverige">
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(item: string) => (
                <Listbox.Option item={item}>
                  <Listbox.OptionIcon ref={iconRef} className="egen" data-egen="icon" />
                  <Listbox.OptionText ref={textRef} className="egen" data-egen="text">
                    {item}
                  </Listbox.OptionText>
                  <Listbox.OptionDescription
                    ref={descriptionRef}
                    className="egen"
                    data-egen="description"
                  >
                    Land
                  </Listbox.OptionDescription>
                  <Listbox.OptionIndicator
                    ref={indicatorRef}
                    className="egen"
                    data-egen="indicator"
                  >
                    ✓
                  </Listbox.OptionIndicator>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    expect(iconRef.current?.className).toBe('egen kv-listbox-option-icon')
    expect(textRef.current?.className).toBe('egen kv-listbox-option-text')
    expect(descriptionRef.current?.className).toBe('egen kv-listbox-option-description')
    expect(indicatorRef.current?.className).toBe('egen kv-listbox-option-indicator')
    expect(iconRef.current?.dataset.egen).toBe('icon')
    expect(textRef.current?.dataset.egen).toBe('text')
    expect(descriptionRef.current?.dataset.egen).toBe('description')
    expect(indicatorRef.current?.dataset.egen).toBe('indicator')
    expect(document.getElementById(textRef.current?.id ?? '')).toBe(textRef.current)
    expect(document.getElementById(descriptionRef.current?.id ?? '')).toBe(descriptionRef.current)
  })
})

describe('Listbox rich options: dev warnings', () => {
  test('an OptionText that differs from itemToString warns once, with both texts', async () => {
    await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root
          items={countries}
          itemToString={itemToString}
          itemToKey={itemToKey}
          native="never"
          defaultOpen
        >
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(country: Country) => (
                <Listbox.Option item={country}>
                  <Listbox.OptionText>{country.name}!</Listbox.OptionText>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    const warnings = richWarnings()
    expect(warnings.length).toBeGreaterThan(0)
    const first = String(warnings[0]?.[0])
    expect(first).toContain('OptionText')
    expect(first).toContain('itemToString')
    expect(first).toContain('Sverige!')
    // One per distinct text: three options, three warnings, none twice.
    expect(new Set(warnings.map((call) => String(call[0]))).size).toBe(warnings.length)
  })

  test('an OptionText that equals itemToString, however its markup is split, does not warn', async () => {
    await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root items={countries} itemToString={itemToString} native="never" defaultOpen>
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(country: Country) => (
                <Listbox.Option item={country}>
                  <Listbox.OptionText>
                    <mark>{country.name.slice(0, 2)}</mark>
                    {country.name.slice(2)}
                  </Listbox.OptionText>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    expect(richWarnings()).toEqual([])
  })

  test('OptionText with no children says the item’s text, and does not warn', async () => {
    await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root items={countries} itemToString={itemToString} native="never" defaultOpen>
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(country: Country) => (
                <Listbox.Option item={country}>
                  <Listbox.OptionText />
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await expect.element(option('Sverige')).toBeInTheDocument()
    expect(richWarnings()).toEqual([])
  })

  test('a part outside a Listbox.Option warns once', async () => {
    await render(
      <>
        <Listbox.OptionText>Sverige</Listbox.OptionText>
        <Listbox.OptionText>Norge</Listbox.OptionText>
      </>,
    )
    const warnings = richWarnings()
    expect(warnings).toHaveLength(1)
    expect(String(warnings[0]?.[0])).toContain('outside a Listbox.Option')
  })
})

describe('Listbox rich options: native rendering', () => {
  test('native="always" drops the parts and shows the itemToString text', async () => {
    const { container } = await render(<RichListbox native="always" />)
    const select = page.getByRole('combobox', { name: 'Land (optional)' }).element()
    expect(select.tagName).toBe('SELECT')
    expect(document.querySelector('.kv-listbox-option')).toBeNull()
    expect(document.querySelector('.kv-listbox-option-icon')).toBeNull()
    expect(document.querySelector('.kv-listbox-option-text')).toBeNull()
    expect(document.querySelector('.kv-listbox-option-description')).toBeNull()
    expect(document.querySelector('.kv-listbox-option-indicator')).toBeNull()
    const labels = [...(select as HTMLSelectElement).options].map((element) => element.textContent)
    expect(labels).toEqual(['', 'Sverige', 'Finland', 'Norge'])
    await expectNoA11yViolations(container)
    expect(richWarnings()).toEqual([])
  })
})

describe('Listbox rich options: virtualized', () => {
  const manyCountries: readonly Country[] = Array.from({ length: 2000 }, (_, index) => ({
    code: `land-${index + 1}`,
    name: `Land ${index + 1}`,
    capital: `Huvudstad ${index + 1}`,
  }))

  test('a two-line option keeps its name, description and place in the whole list', async () => {
    const { container } = await render(
      <RichListbox items={manyCountries} virtualize={{ estimateSize: 56, overscan: 2 }} />,
    )
    await expect.poll(() => page.getByRole('option').elements().length).toBeGreaterThan(3)
    expect(page.getByRole('option').elements().length).toBeLessThan(60)
    const first = optionElement('Land 1')
    expect(first.getAttribute('aria-setsize')).toBe('2000')
    expect(first.getAttribute('aria-posinset')).toBe('1')
    await expect.element(option('Land 1')).toHaveAccessibleDescription('Huvudstad 1')
    await expectNoA11yViolations(container)
  })

  test('moving the active option with the keys reaches a two-line option that is not rendered yet', async () => {
    await render(
      <RichListbox items={manyCountries} virtualize={{ estimateSize: 56, overscan: 2 }} />,
    )
    await expect.poll(() => page.getByRole('option').elements().length).toBeGreaterThan(3)
    triggerElement().focus()
    await userEvent.keyboard('{End}')
    await expect.poll(() => triggerElement().getAttribute('aria-activedescendant')).not.toBeNull()
    await expect.element(option('Land 2000')).toBeInTheDocument()
    await expect.element(option('Land 2000')).toHaveAccessibleDescription('Huvudstad 2000')
  })
})

describe('Combobox rich options', () => {
  function RichCombobox() {
    return (
      <KvirnProvider locale="en">
        <Field.Root>
          <Field.Label>Land</Field.Label>
          <Combobox.Root
            items={countries}
            itemToString={itemToString}
            itemToKey={itemToKey}
            defaultOpen
          >
            <Combobox.Input />
            <Combobox.Popup>
              <Combobox.List>
                {(country: Country) => (
                  <Combobox.Option item={country}>
                    <Combobox.OptionIcon>
                      <Flag />
                    </Combobox.OptionIcon>
                    <Combobox.OptionText>{country.name}</Combobox.OptionText>
                    <Combobox.OptionDescription>{country.capital}</Combobox.OptionDescription>
                    <Combobox.OptionIndicator />
                  </Combobox.Option>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Root>
        </Field.Root>
      </KvirnProvider>
    )
  }
  const input = () => page.getByRole('combobox', { name: /Land/ })

  test('the options are named by their text and described by their second line', async () => {
    const { container } = await render(<RichCombobox />)
    await expect.element(option('Sverige')).toHaveAccessibleDescription('Stockholm')
    await expect.element(option('Finland')).toHaveAccessibleDescription('Helsingfors')
    const element = optionElement('Sverige')
    expect(element.getAttribute('aria-labelledby')).toBe(
      element.querySelector('.kv-listbox-option-text')?.id,
    )
    expect(element.querySelector('.kv-listbox-option-icon')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    expect(element.hasAttribute('data-has-indicator')).toBe(true)
    expect(element.querySelector('.kv-listbox-option-indicator')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    await expectNoA11yViolations(container)
    expect(richWarnings()).toEqual([])
  })

  test('the active option, reached with ArrowDown, is a rich option named by its text', async () => {
    await render(<RichCombobox />)
    input().element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => input().element().getAttribute('aria-activedescendant')).not.toBeNull()
    const active = document.getElementById(
      input().element().getAttribute('aria-activedescendant') ?? '',
    )
    expect(
      document.getElementById(active?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toBe('Sverige')
    await expect.element(input()).toHaveFocus()
  })
})

describe('Autocomplete rich options', () => {
  const streets = [
    { name: 'Storgatan', area: 'Centrum' },
    { name: 'Stora Torget', area: 'Gamla stan' },
  ]

  function RichAutocomplete() {
    return (
      <KvirnProvider locale="en">
        <Field.Root>
          <Field.Label>Gatuadress</Field.Label>
          <Autocomplete.Root items={streets} itemToString={(street) => street.name}>
            <Autocomplete.Input />
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(street: (typeof streets)[number]) => (
                  <Autocomplete.Option item={street}>
                    <Autocomplete.OptionIcon>•</Autocomplete.OptionIcon>
                    <Autocomplete.OptionText>{street.name}</Autocomplete.OptionText>
                    <Autocomplete.OptionDescription>{street.area}</Autocomplete.OptionDescription>
                    <Autocomplete.OptionIndicator />
                  </Autocomplete.Option>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Root>
        </Field.Root>
      </KvirnProvider>
    )
  }

  test('the suggestions are named by their text and described by their second line', async () => {
    const { container } = await render(<RichAutocomplete />)
    await userEvent.click(page.getByRole('combobox', { name: /Gatuadress/ }))
    await userEvent.keyboard('sto')
    await expect.element(option('Storgatan')).toHaveAccessibleDescription('Centrum')
    await expect.element(option('Stora Torget')).toHaveAccessibleDescription('Gamla stan')
    const element = optionElement('Storgatan')
    expect(element.hasAttribute('data-has-indicator')).toBe(true)
    expect(element.querySelector('.kv-listbox-option-icon')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    await expectNoA11yViolations(container)
    expect(richWarnings()).toEqual([])
  })

  test('the active suggestion, reached with ArrowDown, is named by its text', async () => {
    await render(<RichAutocomplete />)
    const input = page.getByRole('combobox', { name: /Gatuadress/ })
    await userEvent.click(input)
    await userEvent.keyboard('sto{ArrowDown}')
    await expect.poll(() => input.element().getAttribute('aria-activedescendant')).not.toBeNull()
    const active = document.getElementById(
      input.element().getAttribute('aria-activedescendant') ?? '',
    )
    expect(
      document.getElementById(active?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toBe('Storgatan')
  })
})

describe('naming of the rich option parts', () => {
  const parts = ['OptionIcon', 'OptionText', 'OptionDescription', 'OptionIndicator'] as const

  test('Listbox, Combobox and Autocomplete each offer the parts under their own display name', () => {
    for (const part of parts) {
      expect(api.Listbox[part].displayName).toBe(`Listbox.${part}`)
      expect(api.Combobox[part].displayName).toBe(`Combobox.${part}`)
      expect(api.Autocomplete[part].displayName).toBe(`Autocomplete.${part}`)
      expect(api.Combobox[part]).not.toBe(api.Listbox[part])
      expect(api.Autocomplete[part]).not.toBe(api.Combobox[part])
    }
  })

  test('every part also has its flat export, which is the same component', () => {
    for (const part of parts) {
      expect(Reflect.get(api, `Listbox${part}`)).toBe(api.Listbox[part])
      expect(Reflect.get(api, `Combobox${part}`)).toBe(api.Combobox[part])
      expect(Reflect.get(api, `Autocomplete${part}`)).toBe(api.Autocomplete[part])
    }
  })
})

describe('Listbox rich options: any markup', () => {
  test('an <Icon>, an svg, divs and spans work in every part and in a bare option', async () => {
    const { container } = await render(
      <Field.Root>
        <Field.Label>Land</Field.Label>
        <Listbox.Root
          items={countries}
          itemToString={itemToString}
          itemToKey={itemToKey}
          native="never"
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder="Välj land" />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              <Listbox.Option item={countries[0]!}>
                <Listbox.OptionIcon>
                  <Icon name="check" />
                </Listbox.OptionIcon>
                <Listbox.OptionText>
                  <b>Sverige</b>
                </Listbox.OptionText>
                <Listbox.OptionDescription>
                  <div data-testid="free">
                    <em>Stockholm</em>
                  </div>
                </Listbox.OptionDescription>
                <Listbox.OptionIndicator>
                  <svg aria-hidden="true" width="12" height="12">
                    <circle cx="6" cy="6" r="5" />
                  </svg>
                </Listbox.OptionIndicator>
              </Listbox.Option>
              <Listbox.Option item={countries[1]!}>
                <div>
                  <span>Finland</span> <small>Helsingfors</small>
                </div>
              </Listbox.Option>
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>,
    )
    await expect.element(option('Sverige')).toHaveAccessibleDescription('Stockholm')
    expect(optionElement('Sverige').querySelector('[data-testid="free"] em')).not.toBeNull()
    await expect.element(option('Finland Helsingfors')).toBeVisible()
    await expectNoA11yViolations(container)
    expect(richWarnings()).toEqual([])
  })
})
