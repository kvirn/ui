import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useContext, useEffect, useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Input } from '../input/input.tsx'
import { Prose } from '../prose/prose.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { FieldContext } from './field-context.ts'
import {
  ErrorMessage,
  Field,
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  FieldProse,
  FieldRoot,
  Label,
} from './field.tsx'
import type {
  FieldErrorMessageProps,
  FieldHintProps,
  FieldHintState,
  FieldLabelProps,
  FieldRootProps,
  FieldState,
} from './field.tsx'
import { useField } from './use-field.ts'
import type {
  FieldControlPartProps,
  FieldDescriptionPartProps,
  FieldErrorMessagePartProps,
  FieldLabelPartProps,
  FieldRootPartProps,
  UseFieldOptions,
  UseFieldResult,
} from './use-field.ts'

// Contract: field.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/field/field.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** Every id an `aria-describedby` or a `<label for>` points at exists exactly once. */
function expectNoDanglingReferences(container: Element) {
  for (const element of container.querySelectorAll('[aria-describedby]')) {
    const ids = (element.getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids.every((id) => id !== '')).toBe(true)
    for (const id of ids) {
      expect(container.ownerDocument.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
    }
  }
  for (const label of container.querySelectorAll('label[for]')) {
    const id = label.getAttribute('for') ?? ''
    expect(container.ownerDocument.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
  }
}

interface PhoneFieldProps {
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  withDescription?: boolean
  marker?: 'optional' | 'none'
}

/** The design spec's phone number field, in Swedish. */
function PhoneField({
  invalid = false,
  required = false,
  disabled = false,
  withDescription = true,
  marker,
}: PhoneFieldProps) {
  return (
    <Field.Root invalid={invalid} required={required} disabled={disabled}>
      <Field.Label marker={marker}>Telefonnummer</Field.Label>
      {withDescription ? <Field.Prose>Vi ringer bara om något är fel.</Field.Prose> : null}
      <Field.ErrorMessage>Ange ett telefonnummer</Field.ErrorMessage>
      <Input name="phone" autoComplete="tel" />
    </Field.Root>
  )
}

/** A consumer's own label component, for `render`. */
function EgenEtikett(props: React.ComponentPropsWithRef<'label'>) {
  return <label {...props} htmlFor={props.htmlFor} data-egen="" />
}

describe('rendering', () => {
  test('Root renders one element with the kv-field class and the parts render their part classes', async () => {
    const { container } = await render(
      <Field.Root data-testid="root" invalid>
        <Field.Label data-testid="label">Namn</Field.Label>
        <Field.Prose data-testid="description">
          <p>Som i passet.</p>
        </Field.Prose>
        <Field.ErrorMessage data-testid="error">Ange ditt namn</Field.ErrorMessage>
        <Input />
      </Field.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(root.className).toBe('kv-field')
    expect(container.firstElementChild).toBe(root)
    const label = page.getByTestId('label').element()
    expect(label.className).toBe('kv-field-label')
    const description = page.getByTestId('description').element()
    expect(description.className).toBe('kv-prose')
    const error = page.getByTestId('error').element()
    expect(error.className).toBe('kv-field-error-message')
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-kv')
  })

  test('forwards refs and other props, and joins className with the part class', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const labelRef = createRef<HTMLLabelElement>()
    await render(
      <Field.Root ref={rootRef} className="egen" data-testid="root" lang="sv">
        <Field.Label ref={labelRef} className="egen-etikett" title="Namnet">
          Namn
        </Field.Label>
        <Input />
      </Field.Root>,
    )
    expect(rootRef.current).toBe(page.getByTestId('root').element())
    await expect.element(page.getByTestId('root')).toHaveClass('egen', 'kv-field')
    await expect.element(page.getByTestId('root')).toHaveAttribute('lang', 'sv')
    expect(labelRef.current?.className).toBe('egen-etikett kv-field-label')
  })

  test('render changes the element of a part', async () => {
    await render(
      <Field.Root>
        <Field.Label render={<EgenEtikett />} marker="none">
          Namn
        </Field.Label>
        <Field.Prose render={<p data-beskrivning="" />}>Som i passet.</Field.Prose>
        <Input />
      </Field.Root>,
    )
    await expect.element(page.getByText('Namn')).toHaveAttribute('data-egen', '')
    const description = page.getByText('Som i passet.').element()
    expect(description.tagName).toBe('P')
  })

  test('render as a function gets the part’s props and the field’s state', async () => {
    const seenStates: FieldState[] = []
    await render(
      <Field.Root invalid required>
        <Field.Label
          render={(partProps, state) => {
            seenStates.push(state)
            return <label {...partProps} htmlFor={partProps.htmlFor} data-egen="" />
          }}
        >
          Namn
        </Field.Label>
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <Input />
      </Field.Root>,
    )
    await expect.element(page.getByText('Namn')).toHaveAttribute('data-egen', '')
    await expect.element(page.getByText('Namn')).toHaveAttribute('for')
    expect(seenStates.at(-1)).toEqual({ isInvalid: true, isRequired: true, isDisabled: false })
  })
})

describe('wiring: name and description per state', () => {
  const sweden = (field: React.ReactNode) => (
    <KvirnProvider locale="sv-SE" messages={sv}>
      {field}
    </KvirnProvider>
  )

  test('label and description: the label names the control, the description describes it', async () => {
    const { container } = await render(sweden(<PhoneField required />))
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect.element(input).toHaveAccessibleName('Telefonnummer')
    await expect.element(input).toHaveAccessibleDescription('Vi ringer bara om något är fel.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('optional: "(valfritt)" is part of the name in sv', async () => {
    const { container } = await render(sweden(<PhoneField />))
    const input = page.getByRole('textbox', { name: 'Telefonnummer (valfritt)' })
    await expect.element(input).toHaveAccessibleName('Telefonnummer (valfritt)')
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(valfritt)')
    await expectNoA11yViolations(container)
  })

  test('optional: "(optional)" is part of the name in en', async () => {
    const { container } = await render(<PhoneField />)
    await expect
      .element(page.getByRole('textbox', { name: 'Telefonnummer (optional)' }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('optional: "(vapaaehtoinen)" in fi', async () => {
    await render(
      <KvirnProvider locale="fi-FI" messages={fi}>
        <PhoneField />
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Telefonnummer (vapaaehtoinen)' }))
      .toBeVisible()
  })

  test('invalid: the description is followed by "Fel:" and the message, in sv', async () => {
    const { container } = await render(sweden(<PhoneField invalid required />))
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect
      .element(input)
      .toHaveAccessibleDescription('Vi ringer bara om något är fel. Fel: Ange ett telefonnummer')
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: the description is followed by "Error:" and the message, in en', async () => {
    const { container } = await render(<PhoneField invalid required />)
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect
      .element(input)
      .toHaveAccessibleDescription('Vi ringer bara om något är fel. Error: Ange ett telefonnummer')
    await expectNoA11yViolations(container)
  })

  test('invalid without a description: the description is just the error', async () => {
    const { container } = await render(
      sweden(<PhoneField invalid required withDescription={false} />),
    )
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect.element(input).toHaveAccessibleDescription('Fel: Ange ett telefonnummer')
    expect(input.element().getAttribute('aria-describedby')?.split(' ')).toHaveLength(1)
    expectNoDanglingReferences(container)
  })

  test('the error prefix is its own span, and the error comes after the description in aria-describedby', async () => {
    await render(<PhoneField invalid required />)
    const input = page.getByRole('textbox', { name: 'Telefonnummer' }).element()
    const [descriptionId, errorId] = (input.getAttribute('aria-describedby') ?? '').split(' ')
    expect(descriptionId).toBeTruthy()
    const error = document.getElementById(errorId ?? '')
    expect(error?.querySelector('.kv-field-error-prefix')?.textContent).toBe('Error:')
    // The icon is decorative.
    expect(error?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('neither description nor error: no aria-describedby at all', async () => {
    await render(<PhoneField required withDescription={false} />)
    await expect
      .element(page.getByRole('textbox', { name: 'Telefonnummer' }))
      .not.toHaveAttribute('aria-describedby')
  })

  test('valid: the error message renders nothing and is not referenced', async () => {
    const { container } = await render(<PhoneField required />)
    expect(container.querySelector('.kv-field-error-message')).toBeNull()
    expectNoDanglingReferences(container)
  })

  test('mounting and unmounting a Description updates aria-describedby', async () => {
    function Toggle({ show }: { show: boolean }) {
      return (
        <Field.Root>
          <Field.Label marker="none">Namn</Field.Label>
          {show ? <Field.Prose>Som i passet.</Field.Prose> : null}
          <Input />
        </Field.Root>
      )
    }
    const screen = await render(<Toggle show={false} />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await screen.rerender(<Toggle show />)
    await expect.element(input).toHaveAccessibleDescription('Som i passet.')
    await screen.rerender(<Toggle show={false} />)
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    expectNoDanglingReferences(screen.container)
  })

  test('toggling invalid adds and removes the error from aria-describedby', async () => {
    const screen = await render(<PhoneField required withDescription={false} />)
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await screen.rerender(<PhoneField required withDescription={false} invalid />)
    await expect.element(input).toHaveAccessibleDescription('Error: Ange ett telefonnummer')
    await screen.rerender(<PhoneField required withDescription={false} />)
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await expect.element(input).not.toHaveAttribute('aria-invalid')
    expectNoDanglingReferences(screen.container)
  })

  test('the ids are generated per Field, so two Fields never share one', async () => {
    const { container } = await render(
      <>
        <PhoneField invalid />
        <PhoneField invalid />
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    // control, label, description and error message, per Field
    expect(ids.length).toBe(8)
    expectNoDanglingReferences(container)
  })

  test('controlId sets the control’s id, and the label points at it', async () => {
    const { container } = await render(
      <Field.Root controlId="telefon">
        <Field.Label>Telefonnummer</Field.Label>
        <Field.Prose>Vi ringer bara om något är fel.</Field.Prose>
        <Input />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Telefonnummer (optional)' })
    await expect.element(input).toHaveAttribute('id', 'telefon')
    await expect
      .element(page.getByText('Telefonnummer (optional)'))
      .toHaveAttribute('for', 'telefon')
    expect(input.element().getAttribute('aria-describedby')).toContain('telefon')
    expectNoDanglingReferences(container)
  })

  test('Field.Label has an id derived from the control id, the context carries it, and htmlFor is unchanged', async () => {
    function LabelIdReader() {
      const field = useContext(FieldContext)
      return (
        <button type="button" aria-labelledby={`self ${field?.labelId ?? ''}`} id="self">
          Välj
        </button>
      )
    }
    const { container } = await render(
      <Field.Root controlId="telefon">
        <Field.Label>Telefonnummer</Field.Label>
        <Input />
        <LabelIdReader />
      </Field.Root>,
    )
    const label = container.querySelector('label')
    expect(label?.id).toBe('telefon-label')
    expect(label?.getAttribute('for')).toBe('telefon')
    await expect
      .element(page.getByRole('button', { name: 'Välj Telefonnummer (optional)' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: 'Telefonnummer (optional)' }))
      .toHaveAttribute('id', 'telefon')
    expectNoDanglingReferences(container)
  })
})

describe('focus on submit (accessibility review, Plan 0013)', () => {
  test('the error is in aria-describedby when the app focuses the field in an effect after submit', async () => {
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
            setError('Ange ett telefonnummer')
          }}
        >
          <Field.Root invalid={error !== undefined} required>
            <Field.Label>Telefonnummer</Field.Label>
            <Field.Prose>Vi ringer bara om något är fel.</Field.Prose>
            <Field.ErrorMessage>{error}</Field.ErrorMessage>
            <Input
              ref={inputRef}
              onFocus={(event) => {
                describedByAtFocus.push(event.currentTarget.getAttribute('aria-describedby'))
              }}
            />
          </Field.Root>
          <button type="submit">Skicka</button>
        </form>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    await expect.element(page.getByRole('textbox', { name: 'Telefonnummer' })).toHaveFocus()
    // Read synchronously when focus arrived, not after the attribute settles.
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[1] ?? '')?.textContent).toContain('Ange ett telefonnummer')
    expectNoDanglingReferences(container)
  })

  test('server-rendered markup of an invalid Field links its error', () => {
    const html = renderToString(<PhoneField invalid required withDescription={false} />)
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1] ?? ''
    expect(describedBy).not.toBe('')
    expect(html).toContain(`id="${describedBy}"`)
  })
})

describe('states', () => {
  test('invalid: aria-invalid on the control and data-invalid on every part', async () => {
    await render(
      <Field.Root invalid data-testid="root">
        <Field.Label data-testid="label">Namn</Field.Label>
        <Field.Prose data-testid="description">
          <p>Som i passet.</p>
        </Field.Prose>
        <Field.ErrorMessage data-testid="error">Ange ditt namn</Field.ErrorMessage>
        <Input />
      </Field.Root>,
    )
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    for (const testId of ['root', 'label', 'description', 'error']) {
      await expect.element(page.getByTestId(testId)).toHaveAttribute('data-invalid', '')
    }
    await expect.element(input).toHaveAttribute('data-invalid', '')
  })

  test('valid: nothing says invalid', async () => {
    await render(<PhoneField required />)
    const input = page.getByRole('textbox')
    await expect.element(input).not.toHaveAttribute('aria-invalid')
    await expect.element(input).not.toHaveAttribute('data-invalid')
    await expect.element(page.getByText('Telefonnummer')).not.toHaveAttribute('data-invalid')
  })

  test('required: aria-required and data-required, never native required', async () => {
    await render(<PhoneField required />)
    const input = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAttribute('data-required', '')
    expect(input.element().hasAttribute('required')).toBe(false)
    expect((input.element() as HTMLInputElement).required).toBe(false)
  })

  test('required: the label carries no optional marker', async () => {
    const { container } = await render(<PhoneField required />)
    expect(container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('not required: no aria-required', async () => {
    await render(<PhoneField />)
    await expect
      .element(page.getByRole('textbox', { name: 'Telefonnummer (optional)' }))
      .not.toHaveAttribute('aria-required')
  })

  test('marker="none" removes the optional text from the label', async () => {
    const { container } = await render(<PhoneField marker="none" />)
    await expect.element(page.getByRole('textbox', { name: 'Telefonnummer' })).toBeVisible()
    expect(container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('disabled: native disabled on the control and data-disabled on the parts', async () => {
    await render(
      <Field.Root disabled data-testid="root">
        <Field.Label data-testid="label">Namn</Field.Label>
        <Input />
      </Field.Root>,
    )
    const input = page.getByRole('textbox')
    await expect.element(input).toBeDisabled()
    await expect.element(input).toHaveAttribute('data-disabled', '')
    await expect.element(page.getByTestId('root')).toHaveAttribute('data-disabled', '')
    await expect.element(page.getByTestId('label')).toHaveAttribute('data-disabled', '')
  })

  test('not disabled: nothing says disabled', async () => {
    await render(<PhoneField required />)
    await expect.element(page.getByRole('textbox')).toBeEnabled()
    await expect.element(page.getByRole('textbox')).not.toHaveAttribute('data-disabled')
  })

  test('the optional marker is a span inside the label, after a normal space', async () => {
    const { container } = await render(<PhoneField />)
    const label = container.querySelector('label')
    expect(label?.textContent).toBe('Telefonnummer (optional)')
    expect(label?.querySelector('span.kv-field-optional')?.textContent).toBe('(optional)')
  })
})

describe('messages resolution', () => {
  test('uses the provider’s catalog: sv', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <PhoneField invalid />
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(valfritt)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Fel:')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a provider override beats the catalog', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ field: { optional: '(frivilligt)' } }}>
          <PhoneField invalid />
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(frivilligt)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Fel:')
  })

  test('the Root’s messages prop beats the provider, for the label and the error', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid messages={{ optional: '(ej obligatoriskt)', errorPrefix: 'Problem:' }}>
          <Field.Label>Telefonnummer</Field.Label>
          <Field.ErrorMessage>Ange ett telefonnummer</Field.ErrorMessage>
          <Input />
        </Field.Root>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(ej obligatoriskt)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Problem:')
  })

  test('an empty override falls through to the provider and warns once', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root messages={{ optional: ' ' }}>
          <Field.Label>Telefonnummer</Field.Label>
          <Input />
        </Field.Root>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(valfritt)')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('field.optional')
  })
})

describe('parts outside a Field or Fieldset, and invalid without a message', () => {
  test('a Label outside a Field warns once and still renders a <label>', async () => {
    await render(
      <>
        <FieldLabel>Namn</FieldLabel>
        <FieldLabel>Efternamn</FieldLabel>
      </>,
    )
    await expect.element(page.getByText('Namn')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('an ErrorMessage outside a Field warns and renders without an id, a Prose outside one doesn’t warn', async () => {
    await render(
      <>
        <Prose data-testid="description">Som i passet.</Prose>
        <FieldErrorMessage data-testid="error">Fel</FieldErrorMessage>
      </>,
    )
    await expect.element(page.getByTestId('description')).not.toHaveAttribute('id')
    await expect.element(page.getByTestId('error')).not.toHaveAttribute('id')
    expect(consoleWarn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining('Field.ErrorMessage'),
    ])
  })

  test('an invalid Field without an ErrorMessage warns once, naming WCAG 3.3.1', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label>Namn</Field.Label>
        <Input />
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    // Nothing is referenced that isn't there.
    await expect.element(page.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('3.3.1')
  })

  test('an invalid Field with an ErrorMessage does not warn', async () => {
    await render(<PhoneField invalid required />)
    await expect.element(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useField', () => {
  interface HookFieldProps extends UseFieldOptions {
    showDescription?: boolean
  }
  function HookField({ showDescription = true, ...options }: HookFieldProps) {
    const field = useField({ ...options, hasDescription: showDescription })
    return (
      <div {...field.rootProps}>
        <label {...field.labelProps}>
          Namn{' '}
          {field.optionalMarker === undefined ? null : (
            <span className="kv-field-optional">{field.optionalMarker}</span>
          )}
        </label>
        {showDescription ? <p {...field.descriptionProps}>Som i passet.</p> : null}
        {field.isInvalid ? (
          <p {...field.errorMessageProps}>
            <span className="kv-field-error-prefix">{field.errorPrefix}</span> Ange ditt namn
          </p>
        ) : null}
        <input {...field.controlProps} />
      </div>
    )
  }

  test('gives spreadable props for your own elements', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <HookField invalid required />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAccessibleDescription('Som i passet. Fel: Ange ditt namn')
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('returns the optional marker only when the field isn’t required and marker isn’t none', async () => {
    const { container } = await render(<HookField />)
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(optional)')
    const required = await render(<HookField required />)
    expect(required.container.querySelector('.kv-field-optional')).toBeNull()
    const none = await render(<HookField marker="none" />)
    expect(none.container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('hasErrorMessage={false} keeps the error id out of aria-describedby', async () => {
    function NoMessage() {
      const field = useField({ invalid: true, hasErrorMessage: false })
      return <input {...field.controlProps} aria-label="Namn" />
    }
    await render(<NoMessage />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).not.toHaveAttribute('aria-describedby')
  })

  test('takes an id, and instance messages', async () => {
    function Custom() {
      const field = useField({ id: 'eget', messages: { optional: '(egen text)' } })
      return (
        <>
          <label {...field.labelProps}>Namn {field.optionalMarker}</label>
          <input {...field.controlProps} />
        </>
      )
    }
    await render(<Custom />)
    await expect
      .element(page.getByRole('textbox', { name: 'Namn (egen text)' }))
      .toHaveAttribute('id', 'eget')
  })

  test('labelProps.id and labelId are the label’s id, derived from the control id, and htmlFor is unchanged', async () => {
    function Labelled() {
      const field = useField({ id: 'namn' })
      return (
        <div {...field.rootProps}>
          <label {...field.labelProps}>Namn {field.optionalMarker}</label>
          <input {...field.controlProps} />
          <output data-testid="label-id">{field.labelId}</output>
        </div>
      )
    }
    const { container } = await render(<Labelled />)
    const label = container.querySelector('label')
    expect(label?.id).toBe('namn-label')
    expect(label?.getAttribute('for')).toBe('namn')
    await expect.element(page.getByTestId('label-id')).toHaveTextContent('namn-label')
    await expect
      .element(page.getByRole('textbox', { name: 'Namn (optional)' }))
      .toHaveAttribute('id', 'namn')
    expectNoDanglingReferences(container)
  })

  test('the label id is unique per field and the same on the server', () => {
    function Labelled() {
      const field = useField()
      return (
        <label {...field.labelProps}>
          Namn <input {...field.controlProps} />
        </label>
      )
    }
    const html = renderToString(
      <>
        <Labelled />
        <Labelled />
      </>,
    )
    const labelIds = [...html.matchAll(/<label[^>]* id="([^"]+)"/g)].map((match) => match[1])
    expect(labelIds).toHaveLength(2)
    expect(new Set(labelIds).size).toBe(2)
  })

  test('hasDescription gives a complete aria-describedby in server-rendered markup', () => {
    const html = renderToString(<HookField invalid />)
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1])
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1] ?? ''
    expect(describedBy.split(' ')).toHaveLength(2)
    for (const id of describedBy.split(' ')) {
      expect(ids).toContain(id)
    }
  })

  test('descriptions gives each hint its own id, in the order given, then the error, on the server', () => {
    function TwoHints({ invalid }: { invalid: boolean }) {
      const field = useField({ invalid, descriptions: ['above', 'under'] })
      return (
        <div {...field.rootProps}>
          <label {...field.labelProps} htmlFor={field.labelProps.htmlFor}>
            Registreringsnummer
          </label>
          <p {...field.getDescriptionProps('above')}>Det står på registreringsbeviset.</p>
          <input {...field.controlProps} />
          <p {...field.getDescriptionProps('under')}>Till exempel ABC 123</p>
          {invalid ? <p {...field.errorMessageProps}>Fel: Ange ett nummer</p> : null}
        </div>
      )
    }
    const html = renderToString(<TwoHints invalid />)
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1] ?? ''
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    for (const id of ids) {
      expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1)
    }
    // DOM order: above, under, error.
    const positions = ids.map((id) => html.indexOf(`id="${id}"`))
    expect(positions).toEqual(positions.toSorted((first, second) => first - second))
    expect(ids[0]).toMatch(/-description-above$/)
    expect(ids[1]).toMatch(/-description-under$/)
    expect(ids[2]).toMatch(/-error$/)
  })

  test('descriptions works in the browser, and the hasDescription one (descriptionProps) comes first', async () => {
    function Mixed() {
      const field = useField({ hasDescription: true, descriptions: ['under'] })
      return (
        <div {...field.rootProps}>
          <label {...field.labelProps} htmlFor={field.labelProps.htmlFor}>
            Namn
          </label>
          <p {...field.descriptionProps}>Först.</p>
          <input {...field.controlProps} />
          <p {...field.getDescriptionProps('under')}>Sist.</p>
        </div>
      )
    }
    const { container } = await render(<Mixed />)
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .toHaveAccessibleDescription('Först. Sist.')
    expectNoDanglingReferences(container)
  })

  test('without descriptions or hasDescription, aria-describedby is absent', async () => {
    function NoHint() {
      const field = useField()
      return <input {...field.controlProps} aria-label="Namn" />
    }
    await render(<NoHint />)
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .not.toHaveAttribute('aria-describedby')
  })
})

describe('several descriptions', () => {
  /** The design spec's registration number field: a hint above the input, one under it. */
  function RegistrationField({ invalid = false }: { invalid?: boolean }) {
    return (
      <Field.Root invalid={invalid} required>
        <Field.Label>Registreringsnummer</Field.Label>
        <Field.Prose data-testid="where">Det står på registreringsbeviset.</Field.Prose>
        <Input name="registration" />
        <Field.Prose data-testid="format">Till exempel ABC 123</Field.Prose>
        <Field.ErrorMessage>Ange ett registreringsnummer</Field.ErrorMessage>
      </Field.Root>
    )
  }

  const describedByIds = (name: string) =>
    (page.getByRole('textbox', { name }).element().getAttribute('aria-describedby') ?? '').split(
      ' ',
    )

  test('aria-describedby lists every Description in DOM order, then the error', async () => {
    const { container } = await render(<RegistrationField invalid />)
    const input = page.getByRole('textbox', { name: 'Registreringsnummer' })
    const ids = describedByIds('Registreringsnummer')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('where').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain(
      'Ange ett registreringsnummer',
    )
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'Det står på registreringsbeviset. Till exempel ABC 123 Error: Ange ett registreringsnummer',
      )
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('each Description has its own id, so no id appears twice', async () => {
    const { container } = await render(<RegistrationField />)
    const where = page.getByTestId('where').element().id
    const format = page.getByTestId('format').element().id
    expect(where).not.toBe('')
    expect(format).not.toBe('')
    expect(where).not.toBe(format)
    expect(describedByIds('Registreringsnummer')).toEqual([where, format])
    expectNoDanglingReferences(container)
  })

  test('is in DOM order whichever Description mounted first', async () => {
    function LateHint() {
      const [showAbove, setShowAbove] = useState(false)
      return (
        <Field.Root>
          <Field.Label marker="none">Registreringsnummer</Field.Label>
          {showAbove ? <Field.Prose data-testid="above">Ovanför fältet.</Field.Prose> : null}
          <Input />
          <Field.Prose data-testid="under">Under fältet.</Field.Prose>
          <button type="button" onClick={() => setShowAbove(true)}>
            Visa
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<LateHint />)
    expect(describedByIds('Registreringsnummer')).toEqual([page.getByTestId('under').element().id])
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    // The late one mounted last but comes first in the DOM, so it comes first in the list.
    await expect
      .element(page.getByRole('textbox', { name: 'Registreringsnummer' }))
      .toHaveAccessibleDescription('Ovanför fältet. Under fältet.')
    expect(describedByIds('Registreringsnummer')).toEqual([
      page.getByTestId('above').element().id,
      page.getByTestId('under').element().id,
    ])
    expectNoDanglingReferences(container)
  })

  test('a Description that unmounts leaves aria-describedby at once and never leaves a missing id', async () => {
    function RemovableHint() {
      const [showUnder, setShowUnder] = useState(true)
      return (
        <Field.Root>
          <Field.Label marker="none">Registreringsnummer</Field.Label>
          <Field.Prose>Ovanför fältet.</Field.Prose>
          <Input />
          {showUnder ? <Field.Prose>Under fältet.</Field.Prose> : null}
          <button type="button" onClick={() => setShowUnder(false)}>
            Dölj
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<RemovableHint />)
    await expect
      .element(page.getByRole('textbox', { name: 'Registreringsnummer' }))
      .toHaveAccessibleDescription('Ovanför fältet. Under fältet.')
    await userEvent.click(page.getByRole('button', { name: 'Dölj' }))
    await expect
      .element(page.getByRole('textbox', { name: 'Registreringsnummer' }))
      .toHaveAccessibleDescription('Ovanför fältet.')
    expect(describedByIds('Registreringsnummer')).toHaveLength(1)
    expectNoDanglingReferences(container)
  })

  test('the error is linked from the first render of an invalid Field with two Descriptions', async () => {
    const describedByAtFocus: (string | null)[] = []
    function Form() {
      const [invalid, setInvalid] = useState(false)
      const inputRef = useRef<HTMLInputElement>(null)
      useEffect(() => {
        if (invalid) {
          inputRef.current?.focus()
        }
      }, [invalid])
      return (
        <>
          <Field.Root invalid={invalid}>
            <Field.Label marker="none">Registreringsnummer</Field.Label>
            <Field.Prose>Ovanför fältet.</Field.Prose>
            <Input
              ref={inputRef}
              onFocus={(event) => {
                describedByAtFocus.push(event.currentTarget.getAttribute('aria-describedby'))
              }}
            />
            <Field.Prose>Under fältet.</Field.Prose>
            <Field.ErrorMessage>Ange ett nummer</Field.ErrorMessage>
          </Field.Root>
          <button type="button" onClick={() => setInvalid(true)}>
            Skicka
          </button>
        </>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    await expect.element(page.getByRole('textbox', { name: 'Registreringsnummer' })).toHaveFocus()
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(3)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain('Ange ett nummer')
    expectNoDanglingReferences(container)
  })

  test('two ErrorMessages in one Field give a dev warning, once', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label>Namn</Field.Label>
        <Input />
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <Field.ErrorMessage>Ange ditt fullständiga namn</Field.ErrorMessage>
      </Field.Root>,
    )
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('two Field.ErrorMessages'))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('one id')
  })

  test('one ErrorMessage, or two hints, don’t warn', async () => {
    await render(<RegistrationField invalid />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Prose hint keeps its own props: state and ref, and render', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Field.Root invalid disabled>
        <Field.Label marker="none">Namn</Field.Label>
        <Field.Prose ref={ref} data-testid="first">
          Ovanför.
        </Field.Prose>
        <Field.Prose render={<p />} data-testid="second">
          Under.
        </Field.Prose>
        <Input />
        <Field.ErrorMessage>Ange</Field.ErrorMessage>
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('first').element())
    await expect.element(page.getByTestId('first')).toHaveAttribute('data-invalid', '')
    await expect.element(page.getByTestId('first')).toHaveAttribute('data-disabled', '')
    expect(page.getByTestId('second').element().tagName).toBe('P')
    // A render element's own id is never needed: both are listed, so both have ids.
    expect(describedByIds('Namn')).toHaveLength(3)
  })
})

describe('Field.Hint (Plan 0029)', () => {
  /** The design spec's personal identity number field: a description, the box, a hint, the error. */
  function PersonalNumberField({
    invalid = false,
    disabled = false,
  }: {
    invalid?: boolean
    disabled?: boolean
  }) {
    return (
      <Field.Root invalid={invalid} disabled={disabled} required>
        <Field.Label>Personnummer</Field.Label>
        <Field.Prose data-testid="why">
          <p>Vi använder det för att hämta dina uppgifter från Skatteverket.</p>
        </Field.Prose>
        <Input name="personalNumber" />
        <Field.Hint data-testid="format">12 siffror, ÅÅÅÅMMDD-NNNN</Field.Hint>
        <Field.ErrorMessage>Skriv personnumret med 12 siffror, ÅÅÅÅMMDD-NNNN</Field.ErrorMessage>
      </Field.Root>
    )
  }

  const describedByIds = (name: string) =>
    (page.getByRole('textbox', { name }).element().getAttribute('aria-describedby') ?? '').split(
      ' ',
    )

  test('renders a hint with the kv-field-hint class and an id, and not the Prose class', async () => {
    await render(<PersonalNumberField />)
    const hint = page.getByTestId('format').element()
    expect(hint.className).toBe('kv-field-hint')
    expect(hint.id).not.toBe('')
    expect(page.getByTestId('why').element().className).toBe('kv-prose')
  })

  test('aria-describedby lists the description, then the hint, then the error', async () => {
    const { container } = await render(<PersonalNumberField invalid />)
    const ids = describedByIds('Personnummer')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('why').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain(
      'Skriv personnumret med 12 siffror',
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Personnummer' }))
      .toHaveAccessibleDescription(
        'Vi använder det för att hämta dina uppgifter från Skatteverket. 12 siffror, ÅÅÅÅMMDD-NNNN Error: Skriv personnumret med 12 siffror, ÅÅÅÅMMDD-NNNN',
      )
    expectNoDanglingReferences(container)
  })

  test('a hint alone is the control’s description, and a valid field lists no error', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Registreringsnummer</Field.Label>
        <Input />
        <Field.Hint>Till exempel ABC 123</Field.Hint>
        <Field.ErrorMessage>Ange numret</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Registreringsnummer' }))
      .toHaveAccessibleDescription('Till exempel ABC 123')
    expect(describedByIds('Registreringsnummer')).toHaveLength(1)
  })

  test('is in DOM order when a hint above the control mounts after the one under it', async () => {
    function LateHint() {
      const [showAbove, setShowAbove] = useState(false)
      return (
        <Field.Root>
          <Field.Label marker="none">Registreringsnummer</Field.Label>
          {showAbove ? <Field.Hint data-testid="above">Ovanför fältet.</Field.Hint> : null}
          <Input />
          <Field.Hint data-testid="under">Under fältet.</Field.Hint>
          <button type="button" onClick={() => setShowAbove(true)}>
            Visa
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<LateHint />)
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    expect(describedByIds('Registreringsnummer')).toEqual([
      page.getByTestId('above').element().id,
      page.getByTestId('under').element().id,
    ])
    expectNoDanglingReferences(container)
  })

  test('a hint that unmounts leaves aria-describedby at once', async () => {
    function RemovableHint() {
      const [show, setShow] = useState(true)
      return (
        <Field.Root>
          <Field.Label marker="none">Namn</Field.Label>
          <Input />
          {show ? <Field.Hint>Som i passet.</Field.Hint> : null}
          <button type="button" onClick={() => setShow(false)}>
            Dölj
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<RemovableHint />)
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .toHaveAccessibleDescription('Som i passet.')
    await userEvent.click(page.getByRole('button', { name: 'Dölj' }))
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .not.toHaveAttribute('aria-describedby')
    expectNoDanglingReferences(container)
  })

  test('gets data-invalid and data-disabled from the Field, and none when the Field has neither', async () => {
    const { rerender } = await render(<PersonalNumberField />)
    await expect.element(page.getByTestId('format')).not.toHaveAttribute('data-invalid')
    await expect.element(page.getByTestId('format')).not.toHaveAttribute('data-disabled')
    await rerender(<PersonalNumberField invalid disabled />)
    await expect.element(page.getByTestId('format')).toHaveAttribute('data-invalid', '')
    await expect.element(page.getByTestId('format')).toHaveAttribute('data-disabled', '')
  })

  test('keeps its own props: class joins, ref and other props are forwarded, render swaps the element', async () => {
    const ref = createRef<HTMLParagraphElement>()
    const seenStates: FieldHintState[] = []
    await render(
      <Field.Root invalid disabled>
        <Field.Label marker="none">Namn</Field.Label>
        <Input />
        <Field.Hint ref={ref} className="egen" lang="sv" data-testid="first">
          Som i passet.
        </Field.Hint>
        <Field.Hint render={<div />} data-testid="second">
          Ett till.
        </Field.Hint>
        <Field.Hint
          render={(partProps, state) => {
            seenStates.push(state)
            return <p {...partProps} data-egen="" />
          }}
          data-testid="third"
        >
          Och ett.
        </Field.Hint>
        <Field.ErrorMessage>Ange</Field.ErrorMessage>
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('first').element())
    await expect.element(page.getByTestId('first')).toHaveClass('egen', 'kv-field-hint')
    await expect.element(page.getByTestId('first')).toHaveAttribute('lang', 'sv')
    expect(page.getByTestId('second').element().tagName).toBe('DIV')
    await expect.element(page.getByTestId('third')).toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({ isInvalid: true, isRequired: false, isDisabled: true })
    // All three are listed, so each has an id: 3 hints and the error.
    expect(describedByIds('Namn')).toHaveLength(4)
  })

  test('is never focusable and adds no role, live region or tabindex', async () => {
    await render(<PersonalNumberField invalid />)
    const hint = page.getByTestId('format').element()
    expect(hint.hasAttribute('tabindex')).toBe(false)
    expect(hint.hasAttribute('role')).toBe(false)
    expect(hint.hasAttribute('aria-live')).toBe(false)
  })

  test('outside a Field or Fieldset it warns once and renders a plain hint with no id', async () => {
    await render(
      <>
        <FieldHint data-testid="one">Till exempel ABC 123</FieldHint>
        <FieldHint data-testid="two">Ett till</FieldHint>
      </>,
    )
    const hint = page.getByTestId('one').element()
    expect(hint.hasAttribute('id')).toBe(false)
    expect(page.getByTestId('two').element().hasAttribute('id')).toBe(false)
    const warnings = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('Field.Hint')
    expect(warnings[0]).toContain('outside')
  })

  test('inside a Field it does not warn', async () => {
    await render(<PersonalNumberField invalid />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Field with a description, a hint and an error has no axe violations', async () => {
    const { container } = await render(<PersonalNumberField invalid />)
    await expectNoA11yViolations(container)
  })

  test('a disabled Field with a hint has no axe violations', async () => {
    const { container } = await render(<PersonalNumberField disabled />)
    await expectNoA11yViolations(container)
  })

  test('renders to a string with its id, for server rendering', () => {
    const html = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <PersonalNumberField />
      </KvirnProvider>,
    )
    expect(html).toContain('12 siffror')
  })
})

describe('server rendering', () => {
  test('renders the Field and its parts to a string without touching the page', () => {
    const html = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <PhoneField invalid required />
      </KvirnProvider>,
    )
    expect(html).toContain('Telefonnummer')
    expect(html).toContain('Fel:')
  })
})

describe('types', () => {
  test('Root takes invalid, required, disabled, controlId, messages and render', () => {
    expectTypeOf<FieldRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['controlId']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FieldRootProps>().toHaveProperty('messages')
    expectTypeOf<FieldRootProps>().toHaveProperty('render')
  })

  test('the parts can’t take an id or htmlFor that would break the wiring', () => {
    expectTypeOf<FieldLabelProps>().not.toHaveProperty('htmlFor')
    expectTypeOf<FieldLabelProps>().not.toHaveProperty('id')
    expectTypeOf<FieldErrorMessageProps>().not.toHaveProperty('id')
    expectTypeOf<FieldHintProps>().not.toHaveProperty('id')
    expectTypeOf<FieldHintProps>().toHaveProperty('render')
    expectTypeOf<FieldLabelProps['marker']>().toEqualTypeOf<'optional' | 'none' | undefined>()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<UseFieldResult['controlProps']>().toEqualTypeOf<FieldControlPartProps>()
    expectTypeOf<UseFieldResult['labelProps']>().toEqualTypeOf<FieldLabelPartProps>()
    expectTypeOf<UseFieldResult['descriptionProps']>().toEqualTypeOf<FieldDescriptionPartProps>()
    expectTypeOf<UseFieldResult['errorMessageProps']>().toEqualTypeOf<FieldErrorMessagePartProps>()
    expectTypeOf<UseFieldResult['getDescriptionProps']>().toEqualTypeOf<
      (name: string) => FieldDescriptionPartProps
    >()
    expectTypeOf<UseFieldOptions['descriptions']>().toEqualTypeOf<readonly string[] | undefined>()
    expectTypeOf<UseFieldResult['rootProps']>().toEqualTypeOf<FieldRootPartProps>()
    expectTypeOf<FieldRootPartProps['className']>().toEqualTypeOf<'kv-field'>()
    expectTypeOf<FieldLabelPartProps['className']>().toEqualTypeOf<'kv-field-label'>()
    expectTypeOf<FieldDescriptionPartProps['className']>().toEqualTypeOf<'kv-prose'>()
    expectTypeOf<
      FieldErrorMessagePartProps['className']
    >().toEqualTypeOf<'kv-field-error-message'>()
    expectTypeOf<FieldRootPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseFieldResult['optionalMarker']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<UseFieldResult['errorPrefix']>().toEqualTypeOf<string>()
  })

  test('the compound and the named exports are the same parts, each with its own display name', () => {
    expect(Field.Root).toBe(FieldRoot)
    expect(Field.Label).toBe(FieldLabel)
    expect(Field.Prose).toBe(FieldProse)
    expect(Field.Hint).toBe(FieldHint)
    expect(Field.ErrorMessage).toBe(FieldErrorMessage)
    expect(Field).not.toHaveProperty('Description')
    // The callable root stays callable: <Field> is the same component as <Field.Root>.
    expect(Field).toBe(FieldRoot)
    expect(Field.Root.displayName).toBe('Field.Root')
    expect(Field.Label.displayName).toBe('Field.Label')
    expect(Field.Prose.displayName).toBe('Field.Prose')
    expect(Field.Hint.displayName).toBe('Field.Hint')
    expect(Field.ErrorMessage.displayName).toBe('Field.ErrorMessage')
    // The shared Prose keeps its own name; Field.Prose is a wrapper around it.
    expect(Prose.displayName).toBe('Prose')
    expect(Field.Prose).not.toBe(Prose)
    // The deprecated bare names are the same components as Field.Label and Field.ErrorMessage.
    expect(Label).toBe(FieldLabel)
    expect(ErrorMessage).toBe(FieldErrorMessage)
  })

  test('the deprecated flat form wires the label, the hint and the error like the namespace form', async () => {
    await render(
      <Field required invalid>
        <Label>E-postadress</Label>
        <Prose>
          <p>Vi skickar beslutet till den här adressen.</p>
        </Prose>
        <Input name="email" type="email" autoComplete="email" />
        <ErrorMessage>Ange en adress</ErrorMessage>
      </Field>,
    )
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAccessibleName('E-postadress')
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'Vi skickar beslutet till den här adressen. Error: Ange en adress',
      )
  })
})
