import { fi } from '@kvirn-ui/i18n/fi'
import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useContext, useEffect, useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { TextInput } from '../text-input/text-input.tsx'
import { Prose } from '../prose/prose.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { FieldContext } from './field-context.ts'
import {
  ErrorMessage,
  Field,
  FieldErrorMessage,
  FieldHelpText,
  FieldLabel,
  FieldProse,
  FieldRoot,
  Label,
} from './field.tsx'
import type {
  FieldErrorMessageProps,
  FieldHelpTextProps,
  FieldLabelProps,
  FieldRootProps,
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

// Contract: field.a11y.md.

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

/** The design spec's phone number field, in English. */
function PhoneField({
  invalid = false,
  required = false,
  disabled = false,
  withDescription = true,
  marker,
}: PhoneFieldProps) {
  return (
    <Field.Root invalid={invalid} required={required} disabled={disabled}>
      <Field.Label marker={marker}>Phone number</Field.Label>
      {withDescription ? <Field.Prose>We only call if something is wrong.</Field.Prose> : null}
      <Field.ErrorMessage>Enter a phone number</Field.ErrorMessage>
      <TextInput name="phone" autoComplete="tel" />
    </Field.Root>
  )
}

describe('rendering', () => {
  test('Root renders one element with the kv-field class and the parts render their part classes', async () => {
    const { container } = await render(
      <Field.Root data-testid="root" invalid>
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Prose data-testid="description">
          <p>As in the passport.</p>
        </Field.Prose>
        <TextInput />
        <Field.HelpText data-testid="helpText" className="own">
          As in the passport.
        </Field.HelpText>
        <Field.ErrorMessage data-testid="error">Enter your name</Field.ErrorMessage>
      </Field.Root>,
    )
    const root = page.getByTestId('root').element()
    expect(root.className).toBe('kv-field')
    expect(container.firstElementChild).toBe(root)
    const label = page.getByTestId('label').element()
    expect(label.className).toBe('kv-field-label')
    const description = page.getByTestId('description').element()
    expect(description.className).toBe('kv-prose')
    // A help text is its own part, not a Prose, and a consumer class joins its part class.
    const helpText = page.getByTestId('helpText').element()
    expect(helpText.className).toBe('own kv-field-help-text')
    const error = page.getByTestId('error').element()
    expect(error.className).toBe('kv-field-error-message')
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-kv')
  })

  test('forwards refs and other props, and joins className with the part class', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const labelRef = createRef<HTMLLabelElement>()
    await render(
      <Field.Root ref={rootRef} className="own" data-testid="root">
        <Field.Label ref={labelRef} className="own-label" title="The name">
          Name
        </Field.Label>
        <TextInput />
      </Field.Root>,
    )
    expect(rootRef.current).toBe(page.getByTestId('root').element())
    await expect.element(page.getByTestId('root')).toHaveClass('own', 'kv-field')
    expect(labelRef.current?.className).toBe('own-label kv-field-label')
  })
})

describe('wiring: name and description per state', () => {
  const sweden = (field: React.ReactNode) => (
    <KvirnProvider locale="en" messages={en}>
      {field}
    </KvirnProvider>
  )

  test('label and description: the label names the control, the description describes it', async () => {
    const { container } = await render(sweden(<PhoneField required />))
    const input = page.getByRole('textbox', { name: 'Phone number' })
    await expect.element(input).toHaveAccessibleName('Phone number')
    await expect.element(input).toHaveAccessibleDescription('We only call if something is wrong.')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('optional: "(optional)" is part of the name in en', async () => {
    const { container } = await render(sweden(<PhoneField />))
    const input = page.getByRole('textbox', { name: 'Phone number (optional)' })
    await expect.element(input).toHaveAccessibleName('Phone number (optional)')
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(optional)')
    await expectNoA11yViolations(container)
  })

  test('optional: "(optional)" is part of the name in en', async () => {
    const { container } = await render(<PhoneField />)
    await expect
      .element(page.getByRole('textbox', { name: 'Phone number (optional)' }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })

  // kv-lang-ok: the fi catalog string for the optional marker
  test('optional: "(vapaaehtoinen)" in fi', async () => {
    await render(
      <KvirnProvider locale="fi-FI" messages={fi}>
        <PhoneField />
      </KvirnProvider>,
    )
    await expect
      // kv-lang-ok: the fi catalog string for the optional marker
      .element(page.getByRole('textbox', { name: 'Phone number (vapaaehtoinen)' }))
      .toBeVisible()
  })

  test('invalid: the description is followed by "Error:" and the message, in en', async () => {
    const { container } = await render(sweden(<PhoneField invalid required />))
    const input = page.getByRole('textbox', { name: 'Phone number' })
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'We only call if something is wrong. Error: Enter a phone number',
      )
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('invalid: the description is followed by "Error:" and the message, in en', async () => {
    const { container } = await render(<PhoneField invalid required />)
    const input = page.getByRole('textbox', { name: 'Phone number' })
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'We only call if something is wrong. Error: Enter a phone number',
      )
    await expectNoA11yViolations(container)
  })

  test('invalid without a description: the description is just the error', async () => {
    const { container } = await render(
      sweden(<PhoneField invalid required withDescription={false} />),
    )
    const input = page.getByRole('textbox', { name: 'Phone number' })
    await expect.element(input).toHaveAccessibleDescription('Error: Enter a phone number')
    expect(input.element().getAttribute('aria-describedby')?.split(' ')).toHaveLength(1)
    expectNoDanglingReferences(container)
  })

  test('the error prefix is its own span, and the error comes after the description in aria-describedby', async () => {
    await render(<PhoneField invalid required />)
    const input = page.getByRole('textbox', { name: 'Phone number' }).element()
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
      .element(page.getByRole('textbox', { name: 'Phone number' }))
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
          <Field.Label marker="none">Name</Field.Label>
          {show ? <Field.Prose>As in the passport.</Field.Prose> : null}
          <TextInput />
        </Field.Root>
      )
    }
    const screen = await render(<Toggle show={false} />)
    const input = page.getByRole('textbox', { name: 'Name' })
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await screen.rerender(<Toggle show />)
    await expect.element(input).toHaveAccessibleDescription('As in the passport.')
    await screen.rerender(<Toggle show={false} />)
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    expectNoDanglingReferences(screen.container)
  })

  test('toggling invalid adds and removes the error from aria-describedby', async () => {
    const screen = await render(<PhoneField required withDescription={false} />)
    const input = page.getByRole('textbox', { name: 'Phone number' })
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await screen.rerender(<PhoneField required withDescription={false} invalid />)
    await expect.element(input).toHaveAccessibleDescription('Error: Enter a phone number')
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
      <Field.Root controlId="phone">
        <Field.Label>Phone number</Field.Label>
        <Field.Prose>We only call if something is wrong.</Field.Prose>
        <TextInput />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Phone number (optional)' })
    await expect.element(input).toHaveAttribute('id', 'phone')
    await expect.element(page.getByText('Phone number (optional)')).toHaveAttribute('for', 'phone')
    expect(input.element().getAttribute('aria-describedby')).toContain('phone')
    expectNoDanglingReferences(container)
  })

  test('Field.Label has an id derived from the control id, the context carries it, and htmlFor is unchanged', async () => {
    function LabelIdReader() {
      const field = useContext(FieldContext)
      return (
        <button type="button" aria-labelledby={`self ${field?.labelId ?? ''}`} id="self">
          Choose
        </button>
      )
    }
    const { container } = await render(
      <Field.Root controlId="phone">
        <Field.Label>Phone number</Field.Label>
        <TextInput />
        <LabelIdReader />
      </Field.Root>,
    )
    const label = container.querySelector('label')
    expect(label?.id).toBe('phone-label')
    expect(label?.getAttribute('for')).toBe('phone')
    await expect
      .element(page.getByRole('button', { name: 'Choose Phone number (optional)' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: 'Phone number (optional)' }))
      .toHaveAttribute('id', 'phone')
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
          aria-label="Application"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setError('Enter a phone number')
          }}
        >
          <Field.Root invalid={error !== undefined} required>
            <Field.Label>Phone number</Field.Label>
            <Field.Prose>We only call if something is wrong.</Field.Prose>
            <Field.ErrorMessage>{error}</Field.ErrorMessage>
            <TextInput
              ref={inputRef}
              onFocus={(event) => {
                describedByAtFocus.push(event.currentTarget.getAttribute('aria-describedby'))
              }}
            />
          </Field.Root>
          <button type="submit">Send</button>
        </form>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Send' }))
    await expect.element(page.getByRole('textbox', { name: 'Phone number' })).toHaveFocus()
    // Read synchronously when focus arrived, not after the attribute settles.
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[1] ?? '')?.textContent).toContain('Enter a phone number')
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
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Prose data-testid="description">
          <p>As in the passport.</p>
        </Field.Prose>
        <Field.ErrorMessage data-testid="error">Enter your name</Field.ErrorMessage>
        <TextInput />
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
    await expect
      .element(page.getByText('Phone number', { exact: false }))
      .not.toHaveAttribute('data-invalid')
  })

  test('required: aria-required and data-required, never native required', async () => {
    await render(<PhoneField required />)
    const input = page.getByRole('textbox', { name: 'Phone number' })
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
      .element(page.getByRole('textbox', { name: 'Phone number (optional)' }))
      .not.toHaveAttribute('aria-required')
  })

  test('marker="none" removes the optional text from the label', async () => {
    const { container } = await render(<PhoneField marker="none" />)
    await expect.element(page.getByRole('textbox', { name: 'Phone number' })).toBeVisible()
    expect(container.querySelector('.kv-field-optional')).toBeNull()
  })

  test('disabled: native disabled on the control and data-disabled on the parts', async () => {
    await render(
      <Field.Root disabled data-testid="root">
        <Field.Label data-testid="label">Name</Field.Label>
        <TextInput />
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
    expect(label?.textContent).toBe('Phone number (optional)')
    expect(label?.querySelector('span.kv-field-optional')?.textContent).toBe('(optional)')
  })
})

describe('keyboard', () => {
  const Form = ({ dir }: { dir?: 'rtl' }) => (
    <form dir={dir}>
      <Field.Root required>
        <Field.Label>Full name</Field.Label>
        <TextInput />
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>Vehicle</Field.Label>
        <TextInput />
      </Field.Root>
      <Field.Root invalid required>
        <Field.Label>Email address</Field.Label>
        <Field.Prose>We send the decision here.</Field.Prose>
        <TextInput />
        <Field.HelpText>For example name@example.se</Field.HelpText>
        <Field.ErrorMessage>Enter an email address</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required>
        <Field.Label>Personal identity number</Field.Label>
        <TextInput readOnly />
      </Field.Root>
    </form>
  )
  const names = ['Full name', 'Email address', 'Personal identity number']

  test('Tab moves through the controls in DOM order', async () => {
    await render(<Form />)
    for (const name of names) {
      await userEvent.tab()
      await expect.element(page.getByRole('textbox', { name })).toHaveFocus()
    }
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('textbox', { name: 'Email address' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('textbox', { name: 'Full name' })).toHaveFocus()
  })

  test('Tab moves through the controls in DOM order in right to left', async () => {
    await render(<Form dir="rtl" />)
    for (const name of names) {
      await userEvent.tab()
      await expect.element(page.getByRole('textbox', { name })).toHaveFocus()
    }
  })

  test('Tab goes to the control and never stops on the label, the help text or the error', async () => {
    await render(
      <Field.Root invalid required>
        <Field.Label>Email address</Field.Label>
        <Field.Prose>We send the decision here.</Field.Prose>
        <TextInput />
        <Field.HelpText>For example name@example.se</Field.HelpText>
        <Field.ErrorMessage>Enter an email address</Field.ErrorMessage>
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Email address' })
    await userEvent.tab()
    await expect.element(input).toHaveFocus()
    await userEvent.tab()
    expect(document.activeElement?.tagName).toMatch(/^(?:INPUT|BODY)$/)
    await userEvent.tab({ shift: true })
    expect(document.activeElement?.tagName).toMatch(/^(?:INPUT|BODY)$/)
  })

  test('clicking the label focuses the input, also on the optional text', async () => {
    await render(
      <KvirnProvider locale="en" messages={en}>
        <PhoneField />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Phone number (optional)' })
    await userEvent.click(page.getByText('Phone number', { exact: false }))
    await expect.element(input).toHaveFocus()
    input.element().blur()
    await userEvent.click(page.getByText('(optional)'))
    await expect.element(input).toHaveFocus()
  })
})

describe('messages resolution', () => {
  test('uses the provider’s catalog: sv', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <PhoneField invalid />
      </KvirnProvider>,
    )
    // kv-lang-ok: the sv catalog strings
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(valfritt)')
    // kv-lang-ok: the sv catalog strings
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Fel:')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a provider override beats the catalog', async () => {
    const { container } = await render(
      <KvirnProvider locale="en" messages={en}>
        <KvirnProvider messages={{ field: { optional: '(voluntary)' } }}>
          <PhoneField invalid />
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(voluntary)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Error:')
  })

  test('the Root’s messages prop beats the provider, for the label and the error', async () => {
    const { container } = await render(
      <KvirnProvider locale="en" messages={en}>
        <Field.Root invalid messages={{ optional: '(ej required)', errorPrefix: 'Problem:' }}>
          <Field.Label>Phone number</Field.Label>
          <Field.ErrorMessage>Enter a phone number</Field.ErrorMessage>
          <TextInput />
        </Field.Root>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(ej required)')
    expect(container.querySelector('.kv-field-error-prefix')?.textContent).toBe('Problem:')
  })

  test('an empty override falls through to the provider and warns once', async () => {
    const { container } = await render(
      <KvirnProvider locale="en" messages={en}>
        <Field.Root messages={{ optional: ' ' }}>
          <Field.Label>Phone number</Field.Label>
          <TextInput />
        </Field.Root>
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-field-optional')?.textContent).toBe('(optional)')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('field.optional')
  })
})

describe('parts outside a Field or Fieldset, and invalid without a message', () => {
  test('a Label outside a Field warns once and still renders a <label>', async () => {
    await render(
      <>
        <FieldLabel>Name</FieldLabel>
        <FieldLabel>Surname</FieldLabel>
      </>,
    )
    await expect.element(page.getByText('Name')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('an ErrorMessage outside a Field warns and renders without an id, a Prose outside one doesn’t warn', async () => {
    await render(
      <>
        <Prose data-testid="description">As in the passport.</Prose>
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
        <Field.Label>Name</Field.Label>
        <TextInput />
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
          Name{' '}
          {field.optionalMarker === undefined ? null : (
            <span className="kv-field-optional">{field.optionalMarker}</span>
          )}
        </label>
        {showDescription ? <p {...field.descriptionProps}>As in the passport.</p> : null}
        {field.isInvalid ? (
          <p {...field.errorMessageProps}>
            <span className="kv-field-error-prefix">{field.errorPrefix}</span> Enter your name
          </p>
        ) : null}
        <input {...field.controlProps} />
      </div>
    )
  }

  test('gives spreadable props for your own elements', async () => {
    const { container } = await render(
      <KvirnProvider locale="en" messages={en}>
        <HookField invalid required />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Name' })
    await expect
      .element(input)
      .toHaveAccessibleDescription('As in the passport. Error: Enter your name')
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
      return <input {...field.controlProps} aria-label="Name" />
    }
    await render(<NoMessage />)
    const input = page.getByRole('textbox', { name: 'Name' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).not.toHaveAttribute('aria-describedby')
  })

  test('takes an id, and instance messages', async () => {
    function Custom() {
      const field = useField({ id: 'own', messages: { optional: '(own text)' } })
      return (
        <>
          <label {...field.labelProps}>Name {field.optionalMarker}</label>
          <input {...field.controlProps} />
        </>
      )
    }
    await render(<Custom />)
    await expect
      .element(page.getByRole('textbox', { name: 'Name (own text)' }))
      .toHaveAttribute('id', 'own')
  })

  test('labelProps.id and labelId are the label’s id, derived from the control id, and htmlFor is unchanged', async () => {
    function Labelled() {
      const field = useField({ id: 'name' })
      return (
        <div {...field.rootProps}>
          <label {...field.labelProps}>Name {field.optionalMarker}</label>
          <input {...field.controlProps} />
          <output data-testid="label-id">{field.labelId}</output>
        </div>
      )
    }
    const { container } = await render(<Labelled />)
    const label = container.querySelector('label')
    expect(label?.id).toBe('name-label')
    expect(label?.getAttribute('for')).toBe('name')
    await expect.element(page.getByTestId('label-id')).toHaveTextContent('name-label')
    await expect
      .element(page.getByRole('textbox', { name: 'Name (optional)' }))
      .toHaveAttribute('id', 'name')
    expectNoDanglingReferences(container)
  })

  test('the label id is unique per field and the same on the server', () => {
    function Labelled() {
      const field = useField()
      return (
        <label {...field.labelProps}>
          Name <input {...field.controlProps} />
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

  test('descriptions gives each help text its own id, in the order given, then the error, on the server', () => {
    function TwoHelpTexts({ invalid }: { invalid: boolean }) {
      const field = useField({ invalid, descriptions: ['above', 'under'] })
      return (
        <div {...field.rootProps}>
          <label {...field.labelProps} htmlFor={field.labelProps.htmlFor}>
            Registration number
          </label>
          <p {...field.getDescriptionProps('above')}>It is on the registration certificate.</p>
          <input {...field.controlProps} />
          <p {...field.getDescriptionProps('under')}>For example ABC 123</p>
          {invalid ? <p {...field.errorMessageProps}>Error: Enter a number</p> : null}
        </div>
      )
    }
    const html = renderToString(<TwoHelpTexts invalid />)
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
            Name
          </label>
          <p {...field.descriptionProps}>First.</p>
          <input {...field.controlProps} />
          <p {...field.getDescriptionProps('under')}>Last.</p>
        </div>
      )
    }
    const { container } = await render(<Mixed />)
    await expect
      .element(page.getByRole('textbox', { name: 'Name' }))
      .toHaveAccessibleDescription('First. Last.')
    expectNoDanglingReferences(container)
  })

  test('without descriptions or hasDescription, aria-describedby is absent', async () => {
    function NoHelpText() {
      const field = useField()
      return <input {...field.controlProps} aria-label="Name" />
    }
    await render(<NoHelpText />)
    await expect
      .element(page.getByRole('textbox', { name: 'Name' }))
      .not.toHaveAttribute('aria-describedby')
  })
})

describe('several descriptions', () => {
  /** The design spec's registration number field: a description above the input, one under it. */
  function RegistrationField({ invalid = false }: { invalid?: boolean }) {
    return (
      <Field.Root invalid={invalid} required>
        <Field.Label>Registration number</Field.Label>
        <Field.Prose data-testid="where">It is on the registration certificate.</Field.Prose>
        <TextInput name="registration" />
        <Field.Prose data-testid="format">For example ABC 123</Field.Prose>
        <Field.ErrorMessage>Enter a registration number</Field.ErrorMessage>
      </Field.Root>
    )
  }

  const describedByIds = (name: string) =>
    (page.getByRole('textbox', { name }).element().getAttribute('aria-describedby') ?? '').split(
      ' ',
    )

  test('aria-describedby lists every Description in DOM order, then the error', async () => {
    const { container } = await render(<RegistrationField invalid />)
    const input = page.getByRole('textbox', { name: 'Registration number' })
    const ids = describedByIds('Registration number')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('where').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain(
      'Enter a registration number',
    )
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'It is on the registration certificate. For example ABC 123 Error: Enter a registration number',
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
    expect(describedByIds('Registration number')).toEqual([where, format])
    expectNoDanglingReferences(container)
  })

  test('is in DOM order whichever Description mounted first', async () => {
    function LateHelpText() {
      const [showAbove, setShowAbove] = useState(false)
      return (
        <Field.Root>
          <Field.Label marker="none">Registration number</Field.Label>
          {showAbove ? <Field.Prose data-testid="above">Above the field.</Field.Prose> : null}
          <TextInput />
          <Field.Prose data-testid="under">Below the field.</Field.Prose>
          <button type="button" onClick={() => setShowAbove(true)}>
            Show
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<LateHelpText />)
    expect(describedByIds('Registration number')).toEqual([page.getByTestId('under').element().id])
    await userEvent.click(page.getByRole('button', { name: 'Show' }))
    // The late one mounted last but comes first in the DOM, so it comes first in the list.
    await expect
      .element(page.getByRole('textbox', { name: 'Registration number' }))
      .toHaveAccessibleDescription('Above the field. Below the field.')
    expect(describedByIds('Registration number')).toEqual([
      page.getByTestId('above').element().id,
      page.getByTestId('under').element().id,
    ])
    expectNoDanglingReferences(container)
  })

  test('a Description that unmounts leaves aria-describedby at once and never leaves a missing id', async () => {
    function RemovableHelpText() {
      const [showUnder, setShowUnder] = useState(true)
      return (
        <Field.Root>
          <Field.Label marker="none">Registration number</Field.Label>
          <Field.Prose>Above the field.</Field.Prose>
          <TextInput />
          {showUnder ? <Field.Prose>Below the field.</Field.Prose> : null}
          <button type="button" onClick={() => setShowUnder(false)}>
            Hide
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<RemovableHelpText />)
    await expect
      .element(page.getByRole('textbox', { name: 'Registration number' }))
      .toHaveAccessibleDescription('Above the field. Below the field.')
    await userEvent.click(page.getByRole('button', { name: 'Hide' }))
    await expect
      .element(page.getByRole('textbox', { name: 'Registration number' }))
      .toHaveAccessibleDescription('Above the field.')
    expect(describedByIds('Registration number')).toHaveLength(1)
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
            <Field.Label marker="none">Registration number</Field.Label>
            <Field.Prose>Above the field.</Field.Prose>
            <TextInput
              ref={inputRef}
              onFocus={(event) => {
                describedByAtFocus.push(event.currentTarget.getAttribute('aria-describedby'))
              }}
            />
            <Field.Prose>Below the field.</Field.Prose>
            <Field.ErrorMessage>Enter a number</Field.ErrorMessage>
          </Field.Root>
          <button type="button" onClick={() => setInvalid(true)}>
            Send
          </button>
        </>
      )
    }
    const { container } = await render(<Form />)
    await userEvent.click(page.getByRole('button', { name: 'Send' }))
    await expect.element(page.getByRole('textbox', { name: 'Registration number' })).toHaveFocus()
    const ids = describedByAtFocus.at(-1)?.split(' ') ?? []
    expect(ids).toHaveLength(3)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain('Enter a number')
    expectNoDanglingReferences(container)
  })

  test('two ErrorMessages in one Field give a dev warning, once', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label>Name</Field.Label>
        <TextInput />
        <Field.ErrorMessage>Enter your name</Field.ErrorMessage>
        <Field.ErrorMessage>Enter your full name</Field.ErrorMessage>
      </Field.Root>,
    )
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('two Field.ErrorMessages'))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('one id')
  })

  test('one ErrorMessage, or two help texts, don’t warn', async () => {
    await render(<RegistrationField invalid />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Prose help text keeps its own props: state and ref', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Field.Root invalid disabled>
        <Field.Label marker="none">Name</Field.Label>
        <Field.Prose ref={ref} data-testid="first">
          Above.
        </Field.Prose>
        <Field.Prose as="section" data-testid="second">
          Under.
        </Field.Prose>
        <TextInput />
        <Field.ErrorMessage>Enter</Field.ErrorMessage>
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('first').element())
    await expect.element(page.getByTestId('first')).toHaveAttribute('data-invalid', '')
    await expect.element(page.getByTestId('first')).toHaveAttribute('data-disabled', '')
    expect(page.getByTestId('second').element().tagName).toBe('SECTION')
    // Both are listed, so both have ids.
    expect(describedByIds('Name')).toHaveLength(3)
  })
})

describe('Field.HelpText (Plan 0029)', () => {
  /** The design spec's personal identity number field: a description, the box, a help text, the error. */
  function PersonalNumberField({
    invalid = false,
    disabled = false,
  }: {
    invalid?: boolean
    disabled?: boolean
  }) {
    return (
      <Field.Root invalid={invalid} disabled={disabled} required>
        <Field.Label>Personal identity number</Field.Label>
        <Field.Prose data-testid="why">
          <p>We use it to fetch your details from the Tax Agency.</p>
        </Field.Prose>
        <TextInput name="personalNumber" />
        <Field.HelpText data-testid="format">12 digits, YYYYMMDD-NNNN</Field.HelpText>
        <Field.ErrorMessage>
          Write the identity number with 12 digits, YYYYMMDD-NNNN
        </Field.ErrorMessage>
      </Field.Root>
    )
  }

  const describedByIds = (name: string) =>
    (page.getByRole('textbox', { name }).element().getAttribute('aria-describedby') ?? '').split(
      ' ',
    )

  test('renders a help text with an id', async () => {
    await render(<PersonalNumberField />)
    expect(page.getByTestId('format').element().id).not.toBe('')
  })

  test('aria-describedby lists the description, then the help text, then the error', async () => {
    const { container } = await render(<PersonalNumberField invalid />)
    const ids = describedByIds('Personal identity number')
    expect(ids).toHaveLength(3)
    expect(ids[0]).toBe(page.getByTestId('why').element().id)
    expect(ids[1]).toBe(page.getByTestId('format').element().id)
    expect(document.getElementById(ids[2] ?? '')?.textContent).toContain(
      'Write the identity number with 12 digits',
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Personal identity number' }))
      .toHaveAccessibleDescription(
        'We use it to fetch your details from the Tax Agency. 12 digits, YYYYMMDD-NNNN Error: Write the identity number with 12 digits, YYYYMMDD-NNNN',
      )
    expectNoDanglingReferences(container)
  })

  test('a help text alone is the control’s description, and a valid field lists no error', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Registration number</Field.Label>
        <TextInput />
        <Field.HelpText>For example ABC 123</Field.HelpText>
        <Field.ErrorMessage>Enter number</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Registration number' }))
      .toHaveAccessibleDescription('For example ABC 123')
    expect(describedByIds('Registration number')).toHaveLength(1)
  })

  test('is in DOM order when a description above the control mounts after the help text under it', async () => {
    function LateDescription() {
      const [showAbove, setShowAbove] = useState(false)
      return (
        <Field.Root>
          <Field.Label marker="none">Registration number</Field.Label>
          {showAbove ? <Field.Prose data-testid="above">Above the field.</Field.Prose> : null}
          <TextInput />
          <Field.HelpText data-testid="under">Below the field.</Field.HelpText>
          <button type="button" onClick={() => setShowAbove(true)}>
            Show
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<LateDescription />)
    await userEvent.click(page.getByRole('button', { name: 'Show' }))
    expect(describedByIds('Registration number')).toEqual([
      page.getByTestId('above').element().id,
      page.getByTestId('under').element().id,
    ])
    expectNoDanglingReferences(container)
  })

  test('a help text that unmounts leaves aria-describedby at once', async () => {
    function RemovableHelpText() {
      const [show, setShow] = useState(true)
      return (
        <Field.Root>
          <Field.Label marker="none">Name</Field.Label>
          <TextInput />
          {show ? <Field.HelpText>As in the passport.</Field.HelpText> : null}
          <button type="button" onClick={() => setShow(false)}>
            Hide
          </button>
        </Field.Root>
      )
    }
    const { container } = await render(<RemovableHelpText />)
    await expect
      .element(page.getByRole('textbox', { name: 'Name' }))
      .toHaveAccessibleDescription('As in the passport.')
    await userEvent.click(page.getByRole('button', { name: 'Hide' }))
    await expect
      .element(page.getByRole('textbox', { name: 'Name' }))
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

  test('keeps its own props: ref and other props are forwarded', async () => {
    const ref = createRef<HTMLParagraphElement>()
    await render(
      <Field.Root invalid disabled>
        <Field.Label marker="none">Name</Field.Label>
        <TextInput />
        <Field.HelpText ref={ref} data-testid="first">
          As in the passport.
        </Field.HelpText>
        <Field.HelpText data-testid="second">One more.</Field.HelpText>
        <Field.ErrorMessage>Enter</Field.ErrorMessage>
      </Field.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('first').element())
    await expect.element(page.getByTestId('second')).toHaveAttribute('data-disabled', '')
    // Both help texts are listed, so each has an id: 2 help texts and the error.
    expect(describedByIds('Name')).toHaveLength(3)
  })

  test('is never focusable and adds no role, live region or tabindex', async () => {
    await render(<PersonalNumberField invalid />)
    const helpText = page.getByTestId('format').element()
    expect(helpText.hasAttribute('tabindex')).toBe(false)
    expect(helpText.hasAttribute('role')).toBe(false)
    expect(helpText.hasAttribute('aria-live')).toBe(false)
  })

  test('outside a Field or Fieldset it warns once and renders a plain help text with no id', async () => {
    await render(
      <>
        <FieldHelpText data-testid="one">For example ABC 123</FieldHelpText>
        <FieldHelpText data-testid="two">One more</FieldHelpText>
      </>,
    )
    const helpText = page.getByTestId('one').element()
    expect(helpText.hasAttribute('id')).toBe(false)
    expect(page.getByTestId('two').element().hasAttribute('id')).toBe(false)
    const warnings = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('Field.HelpText')
    expect(warnings[0]).toContain('outside')
  })

  test('inside a Field it does not warn', async () => {
    await render(<PersonalNumberField invalid />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a help text before its control warns once, and a help text under the control does not', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label marker="none">Postcode</Field.Label>
          <Field.HelpText>Five digits.</Field.HelpText>
          <TextInput />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Ort</Field.Label>
          <TextInput />
          <Field.HelpText>As in the address.</Field.HelpText>
        </Field.Root>
      </>,
    )
    const warnings = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('before its control')
    expect(warnings[0]).toContain('Field.Prose')
  })

  test('a Field with a description, a help text and an error has no axe violations', async () => {
    const { container } = await render(<PersonalNumberField invalid />)
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })

  test('a disabled Field with a help text has no axe violations', async () => {
    const { container } = await render(<PersonalNumberField disabled />)
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })

  test('renders to a string with its id, for server rendering', () => {
    const html = renderToString(
      <KvirnProvider locale="en" messages={en}>
        <PersonalNumberField />
      </KvirnProvider>,
    )
    expect(html).toContain('12 digits')
    // The id is rendered on the server. The host lists it in aria-describedby once it has mounted.
    expect(/<p[^>]*\bid="[^"]+"[^>]*>12 digits/.test(html)).toBe(true)
  })
})

describe('server rendering', () => {
  test('renders the Field and its parts to a string without touching the page', () => {
    const html = renderToString(
      <KvirnProvider locale="en" messages={en}>
        <PhoneField invalid required />
      </KvirnProvider>,
    )
    expect(html).toContain('Phone number')
    expect(html).toContain('Error:')
  })
})

describe('types', () => {
  test('Root takes invalid, required, disabled, controlId and messages', () => {
    expectTypeOf<FieldRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FieldRootProps['controlId']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FieldRootProps>().toHaveProperty('messages')
  })

  test('the parts can’t take an id or htmlFor that would break the wiring', () => {
    expectTypeOf<FieldLabelProps>().not.toHaveProperty('htmlFor')
    expectTypeOf<FieldLabelProps>().not.toHaveProperty('id')
    expectTypeOf<FieldErrorMessageProps>().not.toHaveProperty('id')
    expectTypeOf<FieldHelpTextProps>().not.toHaveProperty('id')
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
    expect(Field.HelpText).toBe(FieldHelpText)
    expect(Field.ErrorMessage).toBe(FieldErrorMessage)
    expect(Field).not.toHaveProperty('Description')
    // The callable root stays callable: <Field> is the same component as <Field.Root>.
    expect(Field).toBe(FieldRoot)
    expect(Field.Root.displayName).toBe('Field.Root')
    expect(Field.Label.displayName).toBe('Field.Label')
    expect(Field.Prose.displayName).toBe('Field.Prose')
    expect(Field.HelpText.displayName).toBe('Field.HelpText')
    expect(Field.ErrorMessage.displayName).toBe('Field.ErrorMessage')
    // The shared Prose keeps its own name; Field.Prose is a wrapper around it.
    expect(Prose.displayName).toBe('Prose')
    expect(Field.Prose).not.toBe(Prose)
    // The deprecated bare names are the same components as Field.Label and Field.ErrorMessage.
    expect(Label).toBe(FieldLabel)
    expect(ErrorMessage).toBe(FieldErrorMessage)
  })

  test('the deprecated flat form wires the label, the help text and the error like the namespace form', async () => {
    await render(
      <Field required invalid>
        <Label>Email address</Label>
        <Prose>
          <p>We send the decision to this address.</p>
        </Prose>
        <TextInput name="email" type="email" autoComplete="email" />
        <ErrorMessage>Enter an address</ErrorMessage>
      </Field>,
    )
    const input = page.getByRole('textbox')
    await expect.element(input).toHaveAccessibleName('Email address')
    await expect
      .element(input)
      .toHaveAccessibleDescription('We send the decision to this address. Error: Enter an address')
  })
})
