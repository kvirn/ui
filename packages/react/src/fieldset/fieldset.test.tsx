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
import { Input } from '../input/input.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  Fieldset,
  FieldsetDescription,
  FieldsetErrorMessage,
  FieldsetLegend,
  FieldsetRoot,
} from './fieldset.tsx'
import type { FieldsetLegendProps, FieldsetRootProps, FieldsetState } from './fieldset.tsx'
import { useFieldset } from './use-fieldset.ts'
import type {
  FieldsetLegendPartProps,
  FieldsetRootPartProps,
  UseFieldsetOptions,
  UseFieldsetResult,
} from './use-fieldset.ts'

// Contract: fieldset.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/fieldset/fieldset.e2e.ts.

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

const sweden = (children: ReactNode) => (
  <KvirnProvider locale="sv-SE" messages={sv}>
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

/** The design spec's contact question: a group of options, in Swedish. */
function ContactGroup({
  invalid = false,
  required = false,
  disabled = false,
  group = true,
  withDescription = true,
}: ContactGroupProps) {
  return (
    <Fieldset.Root invalid={invalid} required={required} disabled={disabled} group={group}>
      <Fieldset.Legend>Hur ska vi kontakta dig om tillståndet?</Fieldset.Legend>
      {withDescription ? <Fieldset.Description>Välj alla som passar.</Fieldset.Description> : null}
      <Fieldset.ErrorMessage>Välj hur vi ska kontakta dig</Fieldset.ErrorMessage>
      <Field.Root>
        <Field.Label>E-post</Field.Label>
        <Input type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Telefon</Field.Label>
        <Input type="tel" autoComplete="tel" />
      </Field.Root>
    </Fieldset.Root>
  )
}

describe('rendering', () => {
  test('renders a <fieldset> with a <legend>, and the text parts, each with its class', async () => {
    const { container } = await render(
      <Fieldset.Root data-testid="root" invalid>
        <Fieldset.Legend data-testid="legend">Adress</Fieldset.Legend>
        <Fieldset.Description data-testid="description">Där du bor.</Fieldset.Description>
        <Fieldset.ErrorMessage data-testid="error">Ange din adress</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const root = page.getByTestId('root').element()
    expect([root.tagName, root.className]).toEqual(['FIELDSET', 'kv-fieldset'])
    expect(container.firstElementChild).toBe(root)
    const legend = page.getByTestId('legend').element()
    expect([legend.tagName, legend.className]).toEqual(['LEGEND', 'kv-fieldset-legend'])
    expect(root.firstElementChild).toBe(legend)
    const description = page.getByTestId('description').element()
    expect([description.tagName, description.className]).toEqual(['P', 'kv-field-description'])
    const error = page.getByTestId('error').element()
    expect([error.tagName, error.className]).toEqual(['P', 'kv-field-error-message'])
  })

  test('forwards refs and other props, and joins className with the part class', async () => {
    const rootRef = createRef<HTMLFieldSetElement>()
    const legendRef = createRef<HTMLLegendElement>()
    await render(
      <Fieldset.Root ref={rootRef} className="egen" data-testid="root" lang="sv">
        <Fieldset.Legend ref={legendRef} className="egen-forklaring">
          Adress
        </Fieldset.Legend>
      </Fieldset.Root>,
    )
    expect(rootRef.current).toBe(page.getByTestId('root').element())
    await expect.element(page.getByTestId('root')).toHaveClass('egen', 'kv-fieldset')
    await expect.element(page.getByTestId('root')).toHaveAttribute('lang', 'sv')
    expect(legendRef.current?.className).toBe('egen-forklaring kv-fieldset-legend')
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: FieldsetState[] = []
    await render(
      <Fieldset.Root
        invalid
        required
        render={(partProps, state) => {
          seenStates.push(state)
          return <fieldset {...partProps} data-egen="" />
        }}
      >
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Fieldset.ErrorMessage>Ange din adress</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Adress' }))
      .toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({ isInvalid: true, isRequired: true, isDisabled: false })
  })

  test('the compound and the named exports are the same parts, and Description and ErrorMessage are Field’s', () => {
    expect(Fieldset.Root).toBe(FieldsetRoot)
    expect(Fieldset.Legend).toBe(FieldsetLegend)
    expect(Fieldset.Description).toBe(FieldsetDescription)
    expect(Fieldset.ErrorMessage).toBe(FieldsetErrorMessage)
    expect(FieldsetDescription).toBe(Field.Description)
    expect(FieldsetErrorMessage).toBe(Field.ErrorMessage)
  })
})

describe('wiring: name and description per state', () => {
  test('the legend is the group’s name, and the description is its description, in sv', async () => {
    const { container } = await render(sweden(<ContactGroup required />))
    const group = page.getByRole('group', { name: 'Hur ska vi kontakta dig om tillståndet?' })
    await expect.element(group).toHaveAccessibleName('Hur ska vi kontakta dig om tillståndet?')
    await expect.element(group).toHaveAccessibleDescription('Välj alla som passar.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: the description is followed by "Fel:" and the message, in sv', async () => {
    const { container } = await render(sweden(<ContactGroup invalid group={false} />))
    const group = page.getByRole('group', { name: 'Hur ska vi kontakta dig om tillståndet?' })
    await expect
      .element(group)
      .toHaveAccessibleDescription('Välj alla som passar. Fel: Välj hur vi ska kontakta dig')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: "Error:" in en', async () => {
    await render(<ContactGroup invalid group={false} />)
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription('Välj alla som passar. Error: Välj hur vi ska kontakta dig')
  })

  test('invalid without a description: the description is just the error', async () => {
    const { container } = await render(sweden(<ContactGroup invalid withDescription={false} />))
    const fieldset = container.querySelector('fieldset')
    expect(fieldset?.getAttribute('aria-describedby')?.split(' ')).toHaveLength(1)
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription('Fel: Välj hur vi ska kontakta dig')
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
    await expect.element(group).toHaveAccessibleDescription('Välj alla som passar.')
    await screen.rerender(<ContactGroup invalid />)
    await expect
      .element(group)
      .toHaveAccessibleDescription('Välj alla som passar. Error: Välj hur vi ska kontakta dig')
    await screen.rerender(<ContactGroup />)
    await expect.element(group).toHaveAccessibleDescription('Välj alla som passar.')
    expectNoDanglingReferences(screen.container)
  })

  test('a Field inside a Fieldset keeps its own description and error, apart from the group’s', async () => {
    const { container } = await render(
      <Fieldset.Root invalid group required>
        <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
        <Fieldset.Description>Till exempel 27 3 2007</Fieldset.Description>
        <Fieldset.ErrorMessage>Ange ett datum</Fieldset.ErrorMessage>
        <Field.Root invalid>
          <Field.Label>År</Field.Label>
          <Field.ErrorMessage>Ange ett år</Field.ErrorMessage>
          <Input inputMode="numeric" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Månad</Field.Label>
          <Field.Description>Siffror</Field.Description>
          <Input inputMode="numeric" />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum' }))
      .toHaveAccessibleDescription('Till exempel 27 3 2007 Error: Ange ett datum')
    await expect
      .element(page.getByRole('textbox', { name: 'År' }))
      .toHaveAccessibleDescription('Error: Ange ett år')
    await expect
      .element(page.getByRole('textbox', { name: 'Månad' }))
      .toHaveAccessibleDescription('Siffror')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
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
          aria-label="Ansökan"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setError('Välj hur vi ska kontakta dig')
          }}
        >
          <Fieldset.Root invalid={error !== undefined} group required>
            <Fieldset.Legend>Hur ska vi kontakta dig?</Fieldset.Legend>
            <Fieldset.ErrorMessage>{error}</Fieldset.ErrorMessage>
            <Field.Root>
              <Field.Label>E-post</Field.Label>
              <Input
                ref={inputRef}
                type="email"
                onFocus={(event) => {
                  const fieldset = event.currentTarget.closest('fieldset')
                  describedByAtFocus.push(fieldset?.getAttribute('aria-describedby') ?? null)
                }}
              />
            </Field.Root>
          </Fieldset.Root>
          <button type="submit">Skicka</button>
        </form>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toHaveFocus()
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0] ?? '')?.className).toBe('kv-field-error-message')
    expectNoDanglingReferences(container)
  })
})

describe('states', () => {
  test('invalid: data-invalid on every part and no aria-invalid on the group', async () => {
    await render(
      <Fieldset.Root invalid data-testid="root">
        <Fieldset.Legend data-testid="legend">Adress</Fieldset.Legend>
        <Fieldset.Description data-testid="description">Där du bor.</Fieldset.Description>
        <Fieldset.ErrorMessage data-testid="error">Ange din adress</Fieldset.ErrorMessage>
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
        <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
        <Fieldset.ErrorMessage>Ange ett datum</Fieldset.ErrorMessage>
        <Field.Root data-testid="field">
          <Field.Label>Dag</Field.Label>
          <Input />
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
    await expect.element(page.getByRole('textbox', { name: 'Telefon' })).toBeDisabled()
  })

  test('not disabled: the controls inside are enabled', async () => {
    await render(<ContactGroup />)
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeEnabled()
    await expect.element(page.getByRole('group')).not.toHaveAttribute('data-disabled')
  })
})

describe('marker defaults in a group (ADR-0029, item 10)', () => {
  test('a plain Fieldset has no legend marker, and its Fields mark themselves', async () => {
    const { container } = await render(
      <Fieldset.Root>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Field.Root>
          <Field.Label>Gata</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group', { name: 'Adress' })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Gata (optional)' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })

  test('a group that isn’t required marks its legend, and its Fields drop the marker', async () => {
    const { container } = await render(sweden(<ContactGroup />))
    await expect
      .element(
        page.getByRole('group', { name: 'Hur ska vi kontakta dig om tillståndet? (valfritt)' }),
      )
      .toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'E-post' })).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Telefon' })).toBeVisible()
    const markers = [...container.querySelectorAll('.kv-field-optional')]
    expect(markers.map((marker) => marker.closest('legend') !== null)).toEqual([true])
    await expectNoA11yViolations(container)
  })

  test('a required group has no legend marker, and its Fields stay unmarked', async () => {
    const { container } = await render(<ContactGroup required />)
    await expect
      .element(page.getByRole('group', { name: 'Hur ska vi kontakta dig om tillståndet?' }))
      .toBeVisible()
    expect(container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('Legend marker overrides the default, both ways', async () => {
    const { container } = await render(
      <>
        <Fieldset.Root>
          <Fieldset.Legend marker="optional">Adress</Fieldset.Legend>
        </Fieldset.Root>
        <Fieldset.Root group>
          <Fieldset.Legend marker="none">Kontakt</Fieldset.Legend>
        </Fieldset.Root>
      </>,
    )
    await expect.element(page.getByRole('group', { name: 'Adress (optional)' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Kontakt' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })

  test('a Field’s own marker prop wins over the group default', async () => {
    await render(
      <Fieldset.Root group required>
        <Fieldset.Legend>Kontakt</Fieldset.Legend>
        <Field.Root>
          <Field.Label marker="optional">Telefon</Field.Label>
          <Input />
        </Field.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Telefon (optional)' })).toBeVisible()
  })

  test('a plain Fieldset inside a group stops the group defaults', async () => {
    const { container } = await render(
      <Fieldset.Root group required>
        <Fieldset.Legend>Kontakt</Fieldset.Legend>
        <Fieldset.Root>
          <Fieldset.Legend>Adress</Fieldset.Legend>
          <Field.Root>
            <Field.Label>Gata</Field.Label>
            <Input />
          </Field.Root>
        </Fieldset.Root>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Gata (optional)' })).toBeVisible()
    expect(container.querySelectorAll('.kv-field-optional')).toHaveLength(1)
  })
})

describe('messages (ADR-0007 resolution)', () => {
  test('uses the provider’s catalog for the legend marker and the prefix', async () => {
    const { container } = await render(sweden(<ContactGroup invalid />))
    expect(container.querySelector('legend .kv-field-optional')?.textContent).toBe('(valfritt)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Fel:')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the Root’s messages prop beats the provider', async () => {
    const { container } = await render(
      sweden(
        <Fieldset.Root
          group
          invalid
          messages={{ optional: '(ej obligatoriskt)', errorPrefix: 'Problem:' }}
        >
          <Fieldset.Legend>Kontakt</Fieldset.Legend>
          <Fieldset.ErrorMessage>Välj ett sätt</Fieldset.ErrorMessage>
        </Fieldset.Root>,
      ),
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(ej obligatoriskt)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Problem:')
  })
})

describe('dev warnings', () => {
  test('a Legend outside a Fieldset warns once and renders a <legend>', async () => {
    await render(<FieldsetLegend>Adress</FieldsetLegend>)
    await expect.element(page.getByText('Adress')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Fieldset.Legend')
  })

  test('an invalid Fieldset without an ErrorMessage warns once, naming WCAG 3.3.1', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Adress</Fieldset.Legend>
      </Fieldset.Root>,
    )
    await expect.element(page.getByRole('group')).not.toHaveAttribute('aria-describedby')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('3.3.1')
  })

  test('warns when render doesn’t produce a <fieldset>', async () => {
    await render(
      <Fieldset.Root render={<div />}>
        <Fieldset.Legend>Adress</Fieldset.Legend>
      </Fieldset.Root>,
    )
    await expect.element(page.getByText('Adress')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('<fieldset>')
  })

  test('a complete group doesn’t warn', async () => {
    await render(sweden(<ContactGroup invalid />))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useFieldset', () => {
  function HookFieldset(options: UseFieldsetOptions) {
    const fieldset = useFieldset({ hasDescription: true, ...options })
    return (
      <fieldset {...fieldset.fieldsetProps}>
        <legend {...fieldset.legendProps}>
          Adress{' '}
          {fieldset.optionalMarker === undefined ? null : (
            <span className="kv-field-optional">{fieldset.optionalMarker}</span>
          )}
        </legend>
        <p {...fieldset.descriptionProps}>Där du bor.</p>
        {fieldset.isInvalid ? (
          <p {...fieldset.errorMessageProps}>
            <span className="kv-field-error-prefix">{fieldset.errorPrefix}</span> Ange din adress
          </p>
        ) : null}
      </fieldset>
    )
  }

  test('gives spreadable props for your own elements', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <HookFieldset invalid group />
      </KvirnProvider>,
    )
    const group = page.getByRole('group', { name: 'Adress (valfritt)' })
    await expect.element(group).toHaveAccessibleDescription('Där du bor. Fel: Ange din adress')
    expect(container.querySelector('fieldset')?.className).toBe('kv-fieldset')
    expect(container.querySelector('legend')?.className).toBe('kv-fieldset-legend')
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

describe('several descriptions (ADR-0031)', () => {
  /** The default order: legend, hints, controls, then the error. */
  function AddressGroup({ invalid = false }: { invalid?: boolean }) {
    return (
      <Fieldset.Root invalid={invalid}>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Fieldset.Description data-testid="where">Där du är folkbokförd.</Fieldset.Description>
        <Fieldset.Description data-testid="format">Gatan och numret.</Fieldset.Description>
        <Field.Root>
          <Field.Label>Gatuadress</Field.Label>
          <Input />
        </Field.Root>
        <Fieldset.ErrorMessage>Ange din adress</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  }

  test('aria-describedby lists every Description in DOM order, then the error', async () => {
    const { container } = await render(<AddressGroup invalid />)
    const group = page.getByRole('group', { name: 'Adress' })
    const ids = (group.element().getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('where').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.className).toBe('kv-field-error-message')
    expect(new Set(ids).size).toBe(3)
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        'Där du är folkbokförd. Gatan och numret. Error: Ange din adress',
      )
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('a Description removed later leaves aria-describedby at once', async () => {
    function Removable() {
      const [show, setShow] = useState(true)
      return (
        <Fieldset.Root>
          <Fieldset.Legend>Adress</Fieldset.Legend>
          <Fieldset.Description>Först.</Fieldset.Description>
          {show ? <Fieldset.Description>Sist.</Fieldset.Description> : null}
          <button type="button" onClick={() => setShow(false)}>
            Dölj
          </button>
        </Fieldset.Root>
      )
    }
    const { container } = await render(<Removable />)
    await expect
      .element(page.getByRole('group', { name: 'Adress' }))
      .toHaveAccessibleDescription('Först. Sist.')
    await userEvent.click(page.getByRole('button', { name: 'Dölj' }))
    await expect
      .element(page.getByRole('group', { name: 'Adress' }))
      .toHaveAccessibleDescription('Först.')
    expectNoDanglingReferences(container)
  })

  test('a Description that mounts later is listed in DOM order, with its own id', async () => {
    function LateHint() {
      const [showFirst, setShowFirst] = useState(false)
      return (
        <Fieldset.Root>
          <Fieldset.Legend>Adress</Fieldset.Legend>
          {showFirst ? (
            <Fieldset.Description data-testid="first">Först.</Fieldset.Description>
          ) : null}
          <Fieldset.Description data-testid="last">Sist.</Fieldset.Description>
          <button type="button" onClick={() => setShowFirst(true)}>
            Visa
          </button>
        </Fieldset.Root>
      )
    }
    const { container } = await render(<LateHint />)
    const group = page.getByRole('group', { name: 'Adress' })
    expect(group.element().getAttribute('aria-describedby')).toBe(
      page.getByTestId('last').element().id,
    )
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    await expect.element(group).toHaveAccessibleDescription('Först. Sist.')
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
          <legend {...fieldset.legendProps}>Adress</legend>
          <p {...fieldset.descriptionProps}>Först.</p>
          <p {...fieldset.getDescriptionProps('under')}>Sist.</p>
        </fieldset>
      )
    }
    const { container } = await render(<Mixed />)
    await expect
      .element(page.getByRole('group', { name: 'Adress' }))
      .toHaveAccessibleDescription('Först. Sist.')
    expectNoDanglingReferences(container)
  })

  test('two ErrorMessages in one Fieldset give a dev warning, once', async () => {
    await render(
      <Fieldset.Root invalid>
        <Fieldset.Legend>Adress</Fieldset.Legend>
        <Fieldset.ErrorMessage>Ange din adress</Fieldset.ErrorMessage>
        <Fieldset.ErrorMessage>Ange din fullständiga adress</Fieldset.ErrorMessage>
      </Fieldset.Root>,
    )
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('two Fieldset.ErrorMessages'))
    expect(warnings).toHaveLength(1)
  })

  test('useFieldset: descriptions gives each hint its own id, in order, then the error, on the server', () => {
    function TwoHints() {
      const fieldset = useFieldset({ invalid: true, descriptions: ['where', 'format'] })
      return (
        <fieldset {...fieldset.fieldsetProps}>
          <legend {...fieldset.legendProps}>Adress</legend>
          <p {...fieldset.getDescriptionProps('where')}>Där du bor.</p>
          <p {...fieldset.getDescriptionProps('format')}>Gatan och numret.</p>
          <p {...fieldset.errorMessageProps}>Fel: Ange din adress</p>
        </fieldset>
      )
    }
    const html = renderToString(<TwoHints />)
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

describe('server rendering', () => {
  test('renders the Fieldset and its parts to a string without touching the page', () => {
    const html = renderToString(sweden(<ContactGroup invalid />))
    expect(html).toContain('<fieldset class="kv-fieldset"')
    expect(html).toContain('<legend class="kv-fieldset-legend"')
    expect(html).toContain('Fel:')
  })
})

describe('types', () => {
  test('Root takes invalid, required, disabled, group, messages and render', () => {
    expectTypeOf<FieldsetRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps['group']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldsetRootProps>().toHaveProperty('messages')
    expectTypeOf<FieldsetRootProps>().toHaveProperty('render')
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
