import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  Fieldset,
  FieldsetErrorMessage,
  FieldsetHelpText,
  FieldsetLegend,
  FieldsetProse,
  FieldsetRoot,
  Legend,
} from './fieldset.tsx'
import type { FieldsetLegendProps, FieldsetRootProps } from './fieldset.tsx'
import { useFieldset } from './use-fieldset.ts'
import type {
  FieldsetLegendPartProps,
  FieldsetRootPartProps,
  UseFieldsetOptions,
  UseFieldsetResult,
} from './use-fieldset.ts'

// Contract: fieldset.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function expectNoDanglingReferences(container: Element) {
  for (const element of container.querySelectorAll('[aria-describedby]')) {
    const ids = (element.getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids.every((id) => id !== '')).toBe(true)
    for (const id of ids) {
      expect(container.ownerDocument.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
    }
  }
}

const english = (children: ReactNode) => (
  <KvirnProvider locale="en" messages={en}>
    {children}
  </KvirnProvider>
)

interface ContactGroupProps {
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  group?: boolean
  withDescription?: boolean
}

/** The design spec's contact question: a group of options, in English. */
function ContactGroup({
  invalid = false,
  required = false,
  disabled = false,
  group = true,
  withDescription = true,
}: ContactGroupProps) {
  return (
    <Fieldset.Root invalid={invalid} required={required} disabled={disabled} group={group}>
      <Fieldset.Legend>How should we contact you about the permit?</Fieldset.Legend>
      {withDescription ? <Fieldset.Prose>Choose all that apply.</Fieldset.Prose> : null}
      <Fieldset.ErrorMessage>Choose how we should contact you</Fieldset.ErrorMessage>
      <Field.Root>
        <Field.Label>E-post</Field.Label>
        <TextInput type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Phone</Field.Label>
        <TextInput type="tel" autoComplete="tel" />
      </Field.Root>
    </Fieldset.Root>
  )
}

describe('rendering', () => {
  test('renders a <fieldset> with a <legend> first, and the text parts, each with its part class', async () => {
    const { container } = await render(
      <Fieldset.Root data-testid="root" invalid>
        <Fieldset.Legend data-testid="legend">Address</Fieldset.Legend>
        <Fieldset.Prose data-testid="description">Where you live.</Fieldset.Prose>
        <Fieldset.ErrorMessage data-testid="error">Enter your address</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(root.className).toBe('kv-fieldset')
    expect(container.firstElementChild).toBe(root)
    const legend = page.getByTestId('legend').element()
    expect(legend.className).toBe('kv-fieldset-legend')
    expect(root.firstElementChild).toBe(legend)
    const description = page.getByTestId('description').element()
    expect(description.className).toBe('kv-prose')
    const error = page.getByTestId('error').element()
    expect(error.className).toBe('kv-field-error-message')
  })

  test('forwards refs and other props, and joins className with the part class', async () => {
    const rootRef = createRef<HTMLFieldSetElement>()
    const legendRef = createRef<HTMLLegendElement>()
    await render(
      <Fieldset.Root ref={rootRef} className="own" data-testid="root">
        <Fieldset.Legend ref={legendRef} className="own-explanation">
          Address
        </Fieldset.Legend>
      </Fieldset.Root>,
    )
    expect(rootRef.current).toBe(page.getByTestId('root').element())
    await expect.element(page.getByTestId('root')).toHaveClass('own', 'kv-fieldset')
    expect(legendRef.current?.className).toBe('own-explanation kv-fieldset-legend')
  })

  test('the compound and the named exports are the same parts, each with its own display name', () => {
    expect(Fieldset.Root).toBe(FieldsetRoot)
    expect(Fieldset.Legend).toBe(FieldsetLegend)
    expect(Fieldset.Prose).toBe(FieldsetProse)
    expect(Fieldset.HelpText).toBe(FieldsetHelpText)
    expect(Fieldset.ErrorMessage).toBe(FieldsetErrorMessage)
    expect(Fieldset).not.toHaveProperty('Description')
    // The callable root stays callable: <Fieldset> is the same component as <Fieldset.Root>.
    expect(Fieldset).toBe(FieldsetRoot)
    expect(Fieldset.Root.displayName).toBe('Fieldset.Root')
    expect(Fieldset.Legend.displayName).toBe('Fieldset.Legend')
    expect(Fieldset.Prose.displayName).toBe('Fieldset.Prose')
    expect(Fieldset.HelpText.displayName).toBe('Fieldset.HelpText')
    // Fieldset.HelpText is its own component, not Field.HelpText.
    expect(Fieldset.HelpText).not.toBe(Field.HelpText)
    expect(Fieldset.ErrorMessage.displayName).toBe('Fieldset.ErrorMessage')
    // Fieldset.ErrorMessage is its own component, not Field.ErrorMessage.
    expect(Fieldset.ErrorMessage).not.toBe(Field.ErrorMessage)
    // The deprecated bare Legend is the same component as Fieldset.Legend.
    expect(Legend).toBe(FieldsetLegend)
  })

  test('the deprecated flat form wires the legend and the error like the namespace form', async () => {
    await render(
      <Fieldset invalid>
        <Legend>Address</Legend>
        <FieldsetErrorMessage>Enter an address</FieldsetErrorMessage>
      </Fieldset>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Address' }))
      .toHaveAccessibleDescription('Error: Enter an address')
  })
})

describe('wiring: name and description per state', () => {
  test('the legend is the group’s name, and the description is its description, in en', async () => {
    const { container } = await render(english(<ContactGroup required />))
    const group = page.getByRole('group', { name: 'How should we contact you about the permit?' })
    await expect.element(group).toHaveAccessibleName('How should we contact you about the permit?')
    await expect.element(group).toHaveAccessibleDescription('Choose all that apply.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: the description is followed by "Error:" and the message, in en', async () => {
    const { container } = await render(english(<ContactGroup invalid group={false} />))
    const group = page.getByRole('group', { name: 'How should we contact you about the permit?' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Choose all that apply. Error: Choose how we should contact you')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: "Error:" in en', async () => {
    await render(<ContactGroup invalid group={false} />)
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription('Choose all that apply. Error: Choose how we should contact you')
  })

  test('invalid without a description: the description is just the error', async () => {
    const { container } = await render(english(<ContactGroup invalid withDescription={false} />))
    const fieldset = container.querySelector('fieldset')
    expect(fieldset?.getAttribute('aria-describedby')?.split(' ')).toHaveLength(1)
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription('Error: Choose how we should contact you')
    expectNoDanglingReferences(container)
  })

  test('valid without a description: no aria-describedby, and no error message in the DOM', async () => {
    const { container } = await render(<ContactGroup withDescription={false} />)
    await expect.element(page.getByRole('group')).not.toHaveAttribute('aria-describedby')
    expect(container.querySelector('.kv-field-error-message')).toBeNull()
  })

  test('toggling invalid adds and removes the error from aria-describedby', async () => {
    const screen = await render(<ContactGroup />)
    const group = page.getByRole('group')
    await expect.element(group).toHaveAccessibleDescription('Choose all that apply.')
    await screen.rerender(<ContactGroup invalid />)
    await expect
      .element(group)
      .toHaveAccessibleDescription('Choose all that apply. Error: Choose how we should contact you')
    await screen.rerender(<ContactGroup />)
    await expect.element(group).toHaveAccessibleDescription('Choose all that apply.')
    expectNoDanglingReferences(screen.container)
  })

  test('a Field inside a Fieldset keeps its own description and error, apart from the group’s', async () => {
    const { container } = await render(
      <Fieldset.Root invalid group required>
        <Fieldset.Legend>Date of birth</Fieldset.Legend>
        <Fieldset.Prose>For example 27 3 2007</Fieldset.Prose>
        <Fieldset.ErrorMessage>Enter a date</Fieldset.ErrorMessage>
        <Field.Root invalid>
          <Field.Label>Year</Field.Label>
          <Field.ErrorMessage>Enter a year</Field.ErrorMessage>
          <TextInput inputMode="numeric" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Month</Field.Label>
          <Field.Prose>Digits</Field.Prose>
          <TextInput inputMode="numeric" />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Date of birth' }))
      .toHaveAccessibleDescription('For example 27 3 2007 Error: Enter a date')
    await expect
      .element(page.getByRole('textbox', { name: 'Year' }))
      .toHaveAccessibleDescription('Error: Enter a year')
    await expect
      .element(page.getByRole('textbox', { name: 'Month' }))
      .toHaveAccessibleDescription('Digits')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })
})

describe('keyboard', () => {
  test('Tab moves through the controls in DOM order and never stops on the group, its legend, its help text or its error', async () => {
    await render(<ContactGroup invalid />)
    const group = page.getByRole('group')
    await userEvent.tab()
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('textbox', { name: 'Phone' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement?.tagName).toBe('BODY')
    await expect.element(group).not.toHaveAttribute('tabindex')
    expect(group.element().querySelector('legend')?.hasAttribute('tabindex')).toBe(false)
  })

  test('Tab skips the controls of a disabled fieldset (native)', async () => {
    await render(
      <>
        <ContactGroup disabled />
        <button type="button">Continue</button>
      </>,
    )
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeDisabled()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Continue' })).toHaveFocus()
  })

  test('a legend that is the page heading is an h1 inside the legend', async () => {
    await render(
      <Fieldset.Root group required>
        <Fieldset.Legend>
          <h1>Var bor du?</h1>
        </Fieldset.Legend>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <TextInput />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('heading', { level: 1, name: 'Var bor du?' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Var bor du?' })).toBeVisible()
  })
})

describe('focus on submit (accessibility review, Plan 0013)', () => {
  test('the group’s error is in aria-describedby when focus enters the group in an effect after submit', async () => {
    const describedByAtFocus: (string | null)[] = []
    function Form() {
      const [error, setError] = useState<string | undefined>(undefined)
      const inputRef = useRef<HTMLInputElement>(null)
      useEffect(() => {
        if (error !== undefined) {
          inputRef.current?.focus()
        }
      }, [error])
      return (
        <form
          aria-label="Application"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setError('Choose how we should contact you')
          }}
        >
          <Fieldset.Root invalid={error !== undefined} group required>
            <Fieldset.Legend>How should we contact you?</Fieldset.Legend>
            <Fieldset.ErrorMessage>{error}</Fieldset.ErrorMessage>
            <Field.Root>
              <Field.Label>E-post</Field.Label>
              <TextInput
                ref={inputRef}
                type="email"
                onFocus={(event) => {
                  const fieldset = event.currentTarget.closest('fieldset')
                  describedByAtFocus.push(fieldset?.getAttribute('aria-describedby') ?? null)
                }}
              />
            </Field.Root>
          </Fieldset.Root>
          <button type="submit">Send</button>
        </form>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Send' }))
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toHaveFocus()
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0] ?? '')?.textContent).toBeTruthy()
    expectNoDanglingReferences(container)
  })
})

describe('states', () => {
  test('invalid: data-invalid on every part and no aria-invalid on the group', async () => {
    await render(
      <Fieldset.Root invalid data-testid="root">
        <Fieldset.Legend data-testid="legend">Address</Fieldset.Legend>
        <Fieldset.Prose data-testid="description">Where you live.</Fieldset.Prose>
        <Fieldset.ErrorMessage data-testid="error">Enter your address</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    for (const testId of ['root', 'legend', 'description', 'error']) {
      await expect.element(page.getByTestId(testId)).toHaveAttribute('data-invalid', '')
    }
    // ARIA doesn't support aria-invalid on the group role.
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('aria-invalid')
  })

  test('invalid does not cascade: the Fields inside stay valid', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Date of birth</Fieldset.Legend>
        <Fieldset.ErrorMessage>Enter a date</Fieldset.ErrorMessage>
        <Field.Root data-testid="field">
          <Field.Label>Dag</Field.Label>
          <TextInput />
        </Field.Root>
      </Fieldset.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Dag (optional)' })
    await expect.element(input).not.toHaveAttribute('aria-invalid')
    await expect.element(input).not.toHaveAttribute('data-invalid')
    await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-invalid')
  })

  test('valid: nothing says invalid', async () => {
    await render(<ContactGroup />)
    await expect.element(page.getByRole('group')).not.toHaveAttribute('data-invalid')
  })

  test('required: data-required, and no aria-required, which a group does not support', async () => {
    await render(<ContactGroup required />)
    const group = page.getByRole('group')
    await expect.element(group).toHaveAttribute('data-required', '')
    await expect.element(group).not.toHaveAttribute('aria-required')
  })

  test('disabled disables every control inside, natively', async () => {
    await render(<ContactGroup disabled />)
    const fieldset = page.getByRole('group')
    await expect.element(fieldset).toHaveAttribute('data-disabled', '')
    expect((fieldset.element() as HTMLFieldSetElement).disabled).toBe(true)
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeDisabled()
    await expect.element(page.getByRole('textbox', { name: 'Phone' })).toBeDisabled()
  })

  test('not disabled: the controls inside are enabled', async () => {
    await render(<ContactGroup />)
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeEnabled()
    await expect.element(page.getByRole('group')).not.toHaveAttribute('data-disabled')
  })
})

describe('marker defaults in a group', () => {
  test('a plain Fieldset has no legend marker, and its Fields mark themselves', async () => {
    const { container } = await render(
      <Fieldset.Root>
        <Fieldset.Legend>Address</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Street</Field.Label>
          <TextInput />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group', { name: 'Address' })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Street (optional)' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })

  test('a group that isn’t required marks its legend, and its Fields drop the marker', async () => {
    const { container } = await render(english(<ContactGroup />))
    await expect
      .element(
        page.getByRole('group', { name: 'How should we contact you about the permit? (optional)' }),
      )
      .toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Phone' })).toBeVisible()
    const markers = [...container.querySelectorAll('.kv-field-optional')]
    expect(markers.map((marker) => marker.closest('legend') !== null)).toEqual([true])
    await expectNoA11yViolations(container)
  })

  test('a required group has no legend marker, and its Fields stay unmarked', async () => {
    const { container } = await render(<ContactGroup required />)
    await expect
      .element(page.getByRole('group', { name: 'How should we contact you about the permit?' }))
      .toBeVisible()
    expect(container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('Legend marker overrides the default, both ways', async () => {
    const { container } = await render(
      <>
        <Fieldset.Root>
          <Fieldset.Legend marker="optional">Address</Fieldset.Legend>
        </Fieldset.Root>
        <Fieldset.Root group>
          <Fieldset.Legend marker="none">Contact</Fieldset.Legend>
        </Fieldset.Root>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'Address (optional)' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Contact' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })

  test('a Field’s own marker prop wins over the group default', async () => {
    await render(
      <Fieldset.Root group required>
        <Fieldset.Legend>Contact</Fieldset.Legend>
        <Field.Root>
          <Field.Label marker="optional">Phone</Field.Label>
          <TextInput />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Phone (optional)' })).toBeVisible()
  })

  test('a plain Fieldset inside a group stops the group defaults', async () => {
    const { container } = await render(
      <Fieldset.Root group required>
        <Fieldset.Legend>Contact</Fieldset.Legend>
        <Fieldset.Root>
          <Fieldset.Legend>Address</Fieldset.Legend>
          <Field.Root>
            <Field.Label>Street</Field.Label>
            <TextInput />
          </Field.Root>
        </Fieldset.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Street (optional)' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })
})

describe('messages resolution', () => {
  test('uses the provider’s catalog for the legend marker and the prefix', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <ContactGroup invalid />
      </KvirnProvider>,
    )
    // kv-lang-ok: the sv catalog strings
    expect(container.querySelector('legend .kv-field-optional')?.textContent).toBe('(valfritt)')
    // kv-lang-ok: the sv catalog strings
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Fel:')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the Root’s messages prop beats the provider', async () => {
    const { container } = await render(
      english(
        <Fieldset.Root
          group
          invalid
          messages={{ optional: '(ej required)', errorPrefix: 'Problem:' }}
        >
          <Fieldset.Legend>Contact</Fieldset.Legend>
          <Fieldset.ErrorMessage>Choose a way</Fieldset.ErrorMessage>
        </Fieldset.Root>,
      ),
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(ej required)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Problem:')
  })
})

describe('dev warnings', () => {
  test('a Legend outside a Fieldset warns once and renders a <legend>', async () => {
    await render(<FieldsetLegend>Address</FieldsetLegend>)
    await expect.element(page.getByText('Address')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Fieldset.Legend')
  })

  test('an invalid Fieldset without an ErrorMessage warns once, naming WCAG 3.3.1', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Address</Fieldset.Legend>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group')).not.toHaveAttribute('aria-describedby')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('3.3.1')
  })

  test('a complete group doesn’t warn', async () => {
    await render(english(<ContactGroup invalid />))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useFieldset', () => {
  function HookFieldset(options: UseFieldsetOptions) {
    const fieldset = useFieldset({ hasDescription: true, ...options })
    return (
      <fieldset {...fieldset.fieldsetProps}>
        <legend {...fieldset.legendProps}>
          Address{' '}
          {fieldset.optionalMarker === undefined ? null : (
            <span className="kv-field-optional">{fieldset.optionalMarker}</span>
          )}
        </legend>
        <p {...fieldset.descriptionProps}>Where you live.</p>
        {fieldset.isInvalid ? (
          <p {...fieldset.errorMessageProps}>
            <span className="kv-field-error-prefix">{fieldset.errorPrefix}</span> Enter your address
          </p>
        ) : null}
      </fieldset>
    )
  }

  test('gives spreadable props for your own elements', async () => {
    const { container } = await render(
      <KvirnProvider locale="en" messages={en}>
        <HookFieldset invalid group />
      </KvirnProvider>,
    )
    const group = page.getByRole('group', { name: 'Address (optional)' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Where you live. Error: Enter your address')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('the legend marker follows group and required', async () => {
    const plain = await render(<HookFieldset />)
    expect(plain.container.querySelector('.kv-field-optional')).toBeNull()
    const group = await render(<HookFieldset group />)
    expect(group.container.querySelector('.kv-field-optional')?.textContent).toBe('(optional)')
    const required = await render(<HookFieldset group required />)
    expect(required.container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('hasDescription gives a complete aria-describedby in server-rendered markup', () => {
    const html = renderToString(<HookFieldset invalid />)
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1] ?? ''
    expect(describedBy.split(' ')).toHaveLength(2)
    for (const id of describedBy.split(' ')) {
      expect(html).toContain(`id="${id}"`)
    }
  })
})

describe('several descriptions', () => {
  /** The default order: legend, help texts, controls, then the error. */
  function AddressGroup({ invalid = false }: { invalid?: boolean }) {
    return (
      <Fieldset.Root invalid={invalid}>
        <Fieldset.Legend>Address</Fieldset.Legend>
        <Fieldset.Prose data-testid="where">Where you are registered.</Fieldset.Prose>
        <Fieldset.Prose data-testid="format">The street and number.</Fieldset.Prose>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <TextInput />
        </Field.Root>
        <Fieldset.ErrorMessage>Enter your address</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  }

  test('aria-describedby lists every Description in DOM order, then the error', async () => {
    const { container } = await render(<AddressGroup invalid />)
    const group = page.getByRole('group', { name: 'Address' })
    const ids = (group.element().getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('where').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain('Enter your address')
    expect(new Set(ids).size).toBe(3)
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        'Where you are registered. The street and number. Error: Enter your address',
      )
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('a Description removed later leaves aria-describedby at once', async () => {
    function Removable() {
      const [show, setShow] = useState(true)
      return (
        <Fieldset.Root>
          <Fieldset.Legend>Address</Fieldset.Legend>
          <Fieldset.Prose>First.</Fieldset.Prose>
          {show ? <Fieldset.Prose>Last.</Fieldset.Prose> : null}
          <button type="button" onClick={() => setShow(false)}>
            Hide
          </button>
        </Fieldset.Root>
      )
    }
    const { container } = await render(<Removable />)
    await expect
      .element(page.getByRole('group', { name: 'Address' }))
      .toHaveAccessibleDescription('First. Last.')
    await userEvent.click(page.getByRole('button', { name: 'Hide' }))
    await expect
      .element(page.getByRole('group', { name: 'Address' }))
      .toHaveAccessibleDescription('First.')
    expectNoDanglingReferences(container)
  })

  test('a Description that mounts later is listed in DOM order, with its own id', async () => {
    function LateHelpText() {
      const [showFirst, setShowFirst] = useState(false)
      return (
        <Fieldset.Root>
          <Fieldset.Legend>Address</Fieldset.Legend>
          {showFirst ? <Fieldset.Prose data-testid="first">First.</Fieldset.Prose> : null}
          <Fieldset.Prose data-testid="last">Last.</Fieldset.Prose>
          <button type="button" onClick={() => setShowFirst(true)}>
            Show
          </button>
        </Fieldset.Root>
      )
    }
    const { container } = await render(<LateHelpText />)
    const group = page.getByRole('group', { name: 'Address' })
    expect(group.element().getAttribute('aria-describedby')).toBe(
      page.getByTestId('last').element().id,
    )
    await userEvent.click(page.getByRole('button', { name: 'Show' }))
    await expect.element(group).toHaveAccessibleDescription('First. Last.')
    expect((group.element().getAttribute('aria-describedby') ?? '').split(' ')).toEqual([
      page.getByTestId('first').element().id,
      page.getByTestId('last').element().id,
    ])
    expectNoDanglingReferences(container)
  })

  test('useFieldset: descriptions works in the browser, and the hasDescription one comes first', async () => {
    function Mixed() {
      const fieldset = useFieldset({ hasDescription: true, descriptions: ['under'] })
      return (
        <fieldset {...fieldset.fieldsetProps}>
          <legend {...fieldset.legendProps}>Address</legend>
          <p {...fieldset.descriptionProps}>First.</p>
          <p {...fieldset.getDescriptionProps('under')}>Last.</p>
        </fieldset>
      )
    }
    const { container } = await render(<Mixed />)
    await expect
      .element(page.getByRole('group', { name: 'Address' }))
      .toHaveAccessibleDescription('First. Last.')
    expectNoDanglingReferences(container)
  })

  test('two ErrorMessages in one Fieldset give a dev warning, once', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Address</Fieldset.Legend>
        <Fieldset.ErrorMessage>Enter your address</Fieldset.ErrorMessage>
        <Fieldset.ErrorMessage>Enter your full address</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('two Fieldset.ErrorMessages'))
    expect(warnings).toHaveLength(1)
  })

  test('useFieldset: descriptions gives each help text its own id, in order, then the error, on the server', () => {
    function TwoHelpTexts() {
      const fieldset = useFieldset({ invalid: true, descriptions: ['where', 'format'] })
      return (
        <fieldset {...fieldset.fieldsetProps}>
          <legend {...fieldset.legendProps}>Address</legend>
          <p {...fieldset.getDescriptionProps('where')}>Where you live.</p>
          <p {...fieldset.getDescriptionProps('format')}>The street and number.</p>
          <p {...fieldset.errorMessageProps}>Error: Enter your address</p>
        </fieldset>
      )
    }
    const html = renderToString(<TwoHelpTexts />)
    const ids = (html.match(/aria-describedby="([^"]+)"/)?.[1] ?? '').split(' ')
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    for (const id of ids) {
      expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1)
    }
    const positions = ids.map((id) => html.indexOf(`id="${id}"`))
    expect(positions).toEqual(positions.toSorted((first, second) => first - second))
    expect(ids[0]).toMatch(/-description-where$/)
    expect(ids[1]).toMatch(/-description-format$/)
  })
})

describe('Fieldset.HelpText (Plan 0029)', () => {
  /** The design spec's date question: the legend, the three boxes, a group help text under them. */
  function VisitDate({ invalid = false, disabled = false }) {
    return (
      <Fieldset.Root group invalid={invalid} disabled={disabled}>
        <Fieldset.Legend>When was the visit?</Fieldset.Legend>
        <Fieldset.Prose data-testid="why">Choose the day you visited us.</Fieldset.Prose>
        <Field.Root>
          <Field.Label>Dag</Field.Label>
          <TextInput inputMode="numeric" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Month</Field.Label>
          <TextInput inputMode="numeric" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Year</Field.Label>
          <TextInput inputMode="numeric" />
        </Field.Root>
        <Fieldset.HelpText data-testid="example">For example 2026-03-27</Fieldset.HelpText>
        <Fieldset.ErrorMessage>Write a date</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  }

  const describedByIds = () =>
    (
      page
        .getByRole('group', { name: 'When was the visit?', exact: false })
        .element()
        .getAttribute('aria-describedby') ?? ''
    ).split(' ')

  test('renders a help text with an id, in the group’s description', async () => {
    await render(<VisitDate />)
    expect(page.getByTestId('example').element().id).not.toBe('')
    await expect
      .element(page.getByRole('group', { name: 'When was the visit?', exact: false }))
      .toHaveAccessibleDescription('Choose the day you visited us. For example 2026-03-27')
  })

  test('aria-describedby lists the description, the help text, then the error', async () => {
    const { container } = await render(<VisitDate invalid />)
    const ids = describedByIds()
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('why').element().id)
    expect(ids[1]).toBe(page.getByTestId('example').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain('Write a date')
    expectNoDanglingReferences(container)
  })

  test('a Field’s own help text inside the group describes its input, not the group', async () => {
    await render(
      <Fieldset.Root group>
        <Fieldset.Legend>When was the visit?</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Dag</Field.Label>
          <TextInput inputMode="numeric" />
          <Field.HelpText>One or two numbers.</Field.HelpText>
        </Field.Root>
        <Fieldset.HelpText>For example 2026-03-27</Fieldset.HelpText>
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Dag' }))
      .toHaveAccessibleDescription('One or two numbers.')
    await expect
      .element(page.getByRole('group', { name: 'When was the visit?', exact: false }))
      .toHaveAccessibleDescription('For example 2026-03-27')
  })

  test('gets data-invalid and data-disabled from the Fieldset', async () => {
    const { rerender } = await render(<VisitDate />)
    await expect.element(page.getByTestId('example')).not.toHaveAttribute('data-invalid')
    await expect.element(page.getByTestId('example')).not.toHaveAttribute('data-disabled')
    await rerender(<VisitDate invalid disabled />)
    await expect.element(page.getByTestId('example')).toHaveAttribute('data-invalid', '')
    await expect.element(page.getByTestId('example')).toHaveAttribute('data-disabled', '')
  })

  test('a Fieldset.HelpText before the group’s controls warns once', async () => {
    await render(
      <Fieldset.Root group>
        <Fieldset.Legend>When was the visit?</Fieldset.Legend>
        <Fieldset.HelpText>For example 2026-03-27</Fieldset.HelpText>
        <Field.Root>
          <Field.Label>Dag</Field.Label>
          <TextInput inputMode="numeric" />
        </Field.Root>
      </Fieldset.Root>,
    )
    const warnings = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('before its control')
  })

  test('a group with a description, a help text and an error has no axe violations and no warnings', async () => {
    const { container } = await render(english(<VisitDate invalid />))
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('server rendering', () => {
  test('renders the Fieldset and its parts to a string without touching the page', () => {
    const html = renderToString(english(<ContactGroup invalid />))
    expect(html).toContain('<fieldset')
    expect(html).toContain('<legend')
    expect(html).toContain('Error:')
  })
})

describe('types', () => {
  test('Root takes invalid, required, disabled, group and messages', () => {
    expectTypeOf<FieldsetRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['group']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps>().toHaveProperty('messages')
    expectTypeOf<FieldsetLegendProps['marker']>().toEqualTypeOf<'optional' | 'none' | undefined>()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<UseFieldsetResult['fieldsetProps']>().toEqualTypeOf<FieldsetRootPartProps>()
    expectTypeOf<UseFieldsetResult['legendProps']>().toEqualTypeOf<FieldsetLegendPartProps>()
    expectTypeOf<UseFieldsetResult['getDescriptionProps']>().toBeFunction()
    expectTypeOf<UseFieldsetOptions['descriptions']>().toEqualTypeOf<
      readonly string[] | undefined
    >()
    expectTypeOf<FieldsetRootPartProps['className']>().toEqualTypeOf<'kv-fieldset'>()
    expectTypeOf<FieldsetLegendPartProps['className']>().toEqualTypeOf<'kv-fieldset-legend'>()
    expectTypeOf<FieldsetRootPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseFieldsetResult['optionalMarker']>().toEqualTypeOf<string | undefined>()
  })
})
