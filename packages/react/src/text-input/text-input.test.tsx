import type { MaskInput } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { masks } from '../index.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { TextInput } from './text-input.tsx'
import type {
  TextInputChangeDetails,
  TextInputProps,
  TextInputState,
  TextInputType,
} from './text-input.tsx'
import { useTextInput } from './use-text-input.ts'
import type {
  TextInputPartProps,
  UseTextInputOptions,
  UseTextInputResult,
} from './use-text-input.ts'

// Contract: text-input.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/text-input/text-input.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('renders a native <input type="text">, outside a Field', async () => {
    const { container } = await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('type', 'text')
    await expect.element(input).not.toHaveAttribute('id')
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await expect.element(input).not.toHaveAttribute('aria-invalid')
    await expect.element(input).not.toHaveAttribute('aria-required')
    await expect.element(input).not.toHaveAttribute('data-kv')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref and native props, and the part class kv-input joins a consumer’s', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <TextInput
        ref={ref}
        aria-label="Namn"
        className="egen"
        name="name"
        autoComplete="name"
        maxLength={40}
        placeholder="Förnamn Efternamn"
        defaultValue="Maja"
      />,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    expect(ref.current).toBe(input.element())
    await expect.element(input).toHaveClass('egen', 'kv-input')
    await expect.element(input).toHaveAttribute('name', 'name')
    await expect.element(input).toHaveAttribute('autocomplete', 'name')
    await expect.element(input).toHaveAttribute('maxlength', '40')
    await expect.element(input).toHaveValue('Maja')
  })

  test.each(['text', 'email', 'tel', 'url', 'password', 'search'] as const)(
    'type="%s" renders that type',
    async (type) => {
      const { container } = await render(<TextInput type={type} aria-label="Fält" />)
      const element = container.querySelector('input')
      expect(element?.getAttribute('type')).toBe(type)
      expect(consoleWarn).not.toHaveBeenCalled()
    },
  )

  test.each([
    ['text', 'textbox'],
    ['email', 'textbox'],
    ['tel', 'textbox'],
    ['url', 'textbox'],
    ['search', 'searchbox'],
  ] as const)('type="%s" has the role %s', async (type, role) => {
    await render(<TextInput type={type} aria-label="Fält" />)
    await expect.element(page.getByRole(role, { name: 'Fält' })).toBeVisible()
  })

  test('passes autoComplete, inputMode and spellCheck for numbers', async () => {
    const { container } = await render(
      <TextInput
        aria-label="Antal barn"
        inputMode="numeric"
        spellCheck={false}
        autoComplete="off"
      />,
    )
    const input = page.getByRole('textbox', { name: 'Antal barn' })
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect.element(input).toHaveAttribute('spellcheck', 'false')
    await expect.element(input).toHaveAttribute('type', 'text')
    await expectNoA11yViolations(container)
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: TextInputState[] = []
    await render(
      <Field.Root invalid disabled={false}>
        <Field.Label>Namn</Field.Label>
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <TextInput
          render={(partProps, state) => {
            seenStates.push(state)
            return <input {...partProps} data-egen="" />
          }}
        />
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox')).toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({
      isInvalid: true,
      isRequired: false,
      isDisabled: false,
      isFocusVisible: false,
    })
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, its id links them, and the type stays text', async () => {
    const { container } = await render(
      <Field.Root required>
        <Field.Label>Fullständigt namn</Field.Label>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    const id = input.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('takes invalid, required and disabled from the Field', async () => {
    await render(
      <Field.Root invalid required>
        <Field.Label>Namn</Field.Label>
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <TextInput />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAttribute('data-invalid', '')
    await expect.element(input).toHaveAttribute('data-required', '')
    expect((input.element() as HTMLInputElement).required).toBe(false)
  })

  test('a disabled Field disables the input, and the input’s own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Field.Label marker="none">Namn</Field.Label>
          <TextInput />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Efternamn</Field.Label>
          <TextInput disabled />
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Namn' })).toBeDisabled()
    const second = page.getByRole('textbox', { name: 'Efternamn' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    const { container } = await render(
      <>
        <p id="extra">Extra information.</p>
        <Field.Root>
          <Field.Label>Namn</Field.Label>
          <Field.Prose>Som i passet.</Field.Prose>
          <TextInput aria-describedby="extra" />
        </Field.Root>
      </>,
    )
    const input = page.getByRole('textbox', { name: 'Namn (optional)' })
    await expect.element(input).toHaveAccessibleDescription('Som i passet. Extra information.')
    expect(input.element().getAttribute('aria-describedby')?.endsWith(' extra')).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('your own aria-describedby alone is kept when the Field has no parts', async () => {
    await render(
      <>
        <p id="extra">Extra information.</p>
        <Field.Root>
          <Field.Label marker="none">Namn</Field.Label>
          <TextInput aria-describedby="extra" />
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .toHaveAttribute('aria-describedby', 'extra')
  })

  test('an id on the TextInput inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Field.Label marker="none">Namn</Field.Label>
        <TextInput id="annat" />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })

  test('the accessible name and description follow the locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid>
          <Field.Label>Telefonnummer</Field.Label>
          <Field.Prose>Vi ringer bara om något är fel.</Field.Prose>
          <Field.ErrorMessage>Ange ett telefonnummer</Field.ErrorMessage>
          <TextInput type="tel" autoComplete="tel" />
        </Field.Root>
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Telefonnummer (valfritt)' })
    await expect
      .element(input)
      .toHaveAccessibleDescription('Vi ringer bara om något är fel. Fel: Ange ett telefonnummer')
  })
})

describe('value', () => {
  test('typing calls onValueChange with the value and the reason, and onChange too', async () => {
    const onValueChange = vi.fn<(value: string, details: TextInputChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    await render(<TextInput aria-label="Namn" onValueChange={onValueChange} onChange={onChange} />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await userEvent.type(input, 'Maja')
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(['M', 'Ma', 'Maj', 'Maja'])
    const details = onValueChange.mock.calls.at(-1)?.[1]
    expect(details?.reason).toBe('input')
    expect(details?.event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  test('controlled: the value comes from state', async () => {
    function Controlled() {
      const [value, setValue] = useState('Maja')
      return (
        <>
          <TextInput aria-label="Namn" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    await render(<Controlled />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveValue('Maja')
    await userEvent.type(input, 'x')
    await expect.element(input).toHaveValue('Majax')
    await expect.element(page.getByRole('status')).toHaveTextContent('Majax')
  })

  test('uncontrolled: defaultValue is kept', async () => {
    await render(<TextInput aria-label="Namn" defaultValue="Maja" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await userEvent.type(input, ' Berg')
    await expect.element(input).toHaveValue('Maja Berg')
  })

  test('no form state: a plain <form> submit gets the typed value from the native input', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root>
          <Field.Label marker="none">Namn</Field.Label>
          <TextInput name="name" />
        </Field.Root>
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Namn' }), 'Maja')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('name')).toBe('Maja')
  })

  test('no form state: a form library’s spread props and ref reach the native input', async () => {
    const registered: { element: HTMLInputElement | null; changes: string[]; blurs: number } = {
      element: null,
      changes: [],
      blurs: 0,
    }
    // The shape of a form library's register(): name, ref and native handlers.
    const register = (name: string) => ({
      name,
      ref: (element: HTMLInputElement | null) => {
        registered.element = element
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        registered.changes.push(event.currentTarget.value)
      },
      onBlur: () => {
        registered.blurs += 1
      },
    })
    await render(
      <Field.Root required>
        <Field.Label>E-post</Field.Label>
        <TextInput type="email" {...register('email')} />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'E-post' })
    expect(registered.element).toBe(input.element())
    await expect.element(input).toHaveAttribute('name', 'email')
    await userEvent.type(input, 'a@b')
    await userEvent.keyboard('{Tab}')
    expect(registered.changes).toEqual(['a', 'a@', 'a@b'])
    expect(registered.blurs).toBe(1)
  })

  test('paste is not blocked', async () => {
    const onValueChange = vi.fn<(value: string, details: TextInputChangeDetails) => void>()
    await render(<TextInput aria-label="Namn" onValueChange={onValueChange} />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await userEvent.click(input)
    await userEvent.fill(input, 'Inklistrat namn')
    await expect.element(input).toHaveValue('Inklistrat namn')
    expect(onValueChange).toHaveBeenCalledWith(
      'Inklistrat namn',
      expect.objectContaining({ reason: 'input' }),
    )
  })

  test('numbers are text: leading zeros are kept and nothing is filtered', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Ärendenummer</Field.Label>
        <TextInput inputMode="numeric" spellCheck={false} />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Ärendenummer' })
    await userEvent.type(input, '004512abc')
    await expect.element(input).toHaveValue('004512abc')
  })

  test('clicking the label focuses the input', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Namn</Field.Label>
        <TextInput />
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Namn', { exact: true }))
    await expect.element(page.getByRole('textbox')).toHaveFocus()
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only', async () => {
    await render(
      <>
        <TextInput aria-label="Ett" />
        <TextInput aria-label="Två" />
      </>,
    )
    const first = page.getByRole('textbox', { name: 'Ett' })
    await userEvent.keyboard('{Tab}')
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await expect.element(page.getByRole('textbox', { name: 'Två' })).toHaveFocus()
  })

  test('Tab moves through the inputs in DOM order', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label marker="none">Ett</Field.Label>
          <Field.Prose>Hint</Field.Prose>
          <TextInput />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Två</Field.Label>
          <TextInput />
        </Field.Root>
      </>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('textbox', { name: 'Ett' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('textbox', { name: 'Två' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('textbox', { name: 'Ett' })).toHaveFocus()
  })
})

describe('dev warnings', () => {
  test('type="number" warns once, with the reason, and still renders what was asked', async () => {
    const props = { type: 'number', 'aria-label': 'Antal' } as unknown as TextInputProps
    const { container } = await render(<TextInput {...props} />)
    expect(container.querySelector('input')?.getAttribute('type')).toBe('number')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('type="number"')
    expect(message).toContain('NumberInput')
  })

  test('type="date" warns once', async () => {
    const props = { type: 'date', 'aria-label': 'Datum' } as unknown as TextInputProps
    await render(<TextInput {...props} />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('type="date"')
  })

  test('a TextInput without a label, outside a Field, warns once', async () => {
    await render(<TextInput placeholder="Namn" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('accessible name')
    expect(message).toContain('placeholder')
  })

  test('a TextInput inside a Field without a Label warns once', async () => {
    await render(
      <Field.Root>
        <TextInput />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Field.Label')
  })

  test('aria-label, aria-labelledby and a wrapping <label> are names enough', async () => {
    await render(
      <>
        <TextInput aria-label="Sök" type="search" />
        <span id="rubrik">Postnummer</span>
        <TextInput aria-labelledby="rubrik" />
        <label htmlFor="gata">
          Gata
          <TextInput id="gata" />
        </label>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useTextInput', () => {
  function HookInput(options: UseTextInputOptions & { label: string }) {
    const { label, ...inputOptions } = options
    const input = useTextInput(inputOptions)
    return <input aria-label={label} {...input.inputProps} />
  }

  test('gives spreadable props for your own <input>, reading the nearest Field', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Namn</Field.Label>
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <HookInput label="Namn" />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAccessibleDescription('Error: Ange ditt namn')
    await expectNoA11yViolations(container)
  })

  test('onValueChange and type work without a Field', async () => {
    const onValueChange = vi.fn<(value: string, details: TextInputChangeDetails) => void>()
    await render(<HookInput label="E-post" type="email" onValueChange={onValueChange} />)
    const input = page.getByRole('textbox', { name: 'E-post' })
    await expect.element(input).toHaveAttribute('type', 'email')
    await userEvent.type(input, 'a')
    expect(onValueChange).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'input' }))
  })

  test('reports its state', async () => {
    const seen: Pick<UseTextInputResult, 'isInvalid' | 'isRequired' | 'isDisabled'>[] = []
    function Probe() {
      const { isInvalid, isRequired, isDisabled } = useTextInput()
      seen.push({ isInvalid, isRequired, isDisabled })
      return null
    }
    await render(
      <Field.Root invalid required disabled>
        <Probe />
      </Field.Root>,
    )
    expect(seen.at(-1)).toEqual({ isInvalid: true, isRequired: true, isDisabled: true })
  })
})

describe('server rendering', () => {
  test('renders the input to a string without touching the page', () => {
    const html = renderToString(<TextInput aria-label="Namn" defaultValue="Maja" />)
    expect(html).toContain('type="text"')
  })
})

describe('types', () => {
  test('type is the text-like union, never number or date', () => {
    expectTypeOf<TextInputType>().toEqualTypeOf<
      'text' | 'email' | 'tel' | 'url' | 'password' | 'search'
    >()
    expectTypeOf<TextInputProps['type']>().toEqualTypeOf<TextInputType | undefined>()
  })

  test('onValueChange takes the string value and details', () => {
    expectTypeOf<TextInputProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: TextInputChangeDetails) => void) | undefined
    >()
    expectTypeOf<TextInputChangeDetails['reason']>().toEqualTypeOf<'input'>()
    expectTypeOf<TextInputProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TextInputProps['defaultValue']>().toEqualTypeOf<string | undefined>()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<TextInputPartProps['className']>().toEqualTypeOf<'kv-input'>()
    expectTypeOf<TextInputPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseTextInputResult['inputProps']>().toEqualTypeOf<TextInputPartProps>()
    expectTypeOf<UseTextInputResult['isFocusVisible']>().toEqualTypeOf<boolean>()
  })
})

describe('mask (contract: text-input.a11y.md › Masked input)', () => {
  const personalIdentityNumber = masks.personalIdentityNumber({ country: 'SE' })

  test('without a mask nothing changes: no suggested attributes, no announcer warning', async () => {
    await render(<TextInput aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).not.toHaveAttribute('inputmode')
    await expect.element(input).not.toHaveAttribute('spellcheck')
    await expect.element(input).not.toHaveAttribute('dir')
    await userEvent.type(input, 'Maja 1')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a mask shapes the value, adds no role, and keeps the Field wiring', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Field.Root required invalid>
          <Field.Label>Personnummer</Field.Label>
          <Field.Prose>12 siffror, till exempel 19900101-1234.</Field.Prose>
          <Field.ErrorMessage>Ange personnumret</Field.ErrorMessage>
          <TextInput name="personalIdentityNumber" mask={personalIdentityNumber} />
        </Field.Root>
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Personnummer' })
    await userEvent.fill(input, '19900101 1234')

    await expect.element(input).toHaveValue('19900101-1234')
    await expect.element(input).toHaveAttribute('type', 'text')
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect.element(input).toHaveAttribute('spellcheck', 'false')
    await expect.element(input).toHaveAttribute('dir', 'ltr')
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).not.toHaveAttribute('maxlength')
    await expect.element(input).not.toHaveAttribute('pattern')
    await expect
      .element(input)
      .toHaveAccessibleDescription('12 siffror, till exempel 19900101-1234. Fel: Ange personnumret')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('onValueChange gets the masked value and the mask details, once per change', async () => {
    const onValueChange = vi.fn<(value: string, details: TextInputChangeDetails) => void>()
    await render(
      <KvirnProvider>
        <TextInput
          aria-label="Personnummer"
          mask={personalIdentityNumber}
          onValueChange={onValueChange}
        />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Personnummer' }), '1234')

    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(['1', '12', '123', '1234'])
    const details = onValueChange.mock.calls.at(-1)?.[1]
    expect(details?.reason).toBe('input')
    expect(details?.unmaskedValue).toBe('1234')
    expect(details?.isComplete).toBe(false)
    expect(details?.rejected).toEqual([])
  })

  test('your own inputMode, spellCheck and dir win over the preset’s', async () => {
    await render(
      <TextInput
        aria-label="Personnummer"
        mask={personalIdentityNumber}
        inputMode="text"
        spellCheck
        dir="rtl"
      />,
    )
    const input = page.getByRole('textbox', { name: 'Personnummer' })
    await expect.element(input).toHaveAttribute('inputmode', 'text')
    await expect.element(input).toHaveAttribute('spellcheck', 'true')
    await expect.element(input).toHaveAttribute('dir', 'rtl')
  })

  test('your own onChange, ref and onFocus still run next to the mask', async () => {
    const onChange = vi.fn<(event: unknown) => void>()
    const onFocus = vi.fn<(event: unknown) => void>()
    const ref = createRef<HTMLInputElement>()
    await render(
      <TextInput
        ref={ref}
        aria-label="Postnummer"
        mask={masks.postalCode({ country: 'SE' })}
        onChange={onChange}
        onFocus={onFocus}
      />,
    )
    const input = page.getByRole('textbox', { name: 'Postnummer' })
    await userEvent.type(input, '12345')
    expect(ref.current).toBe(input.element())
    expect(onChange).toHaveBeenCalledTimes(5)
    expect(onFocus).toHaveBeenCalledTimes(1)
    await expect.element(input).toHaveValue('123 45')
  })

  test('controlled: the value is rendered as given and follows onValueChange', async () => {
    function Controlled() {
      const [value, setValue] = useState('19900101 1234')
      return (
        <>
          <TextInput
            aria-label="Personnummer"
            mask={personalIdentityNumber}
            value={value}
            onValueChange={setValue}
          />
          <output>{value}</output>
        </>
      )
    }
    await render(
      <KvirnProvider>
        <Controlled />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Personnummer' })
    await expect.element(input).toHaveValue('19900101 1234')
    await userEvent.fill(input, '199001011234')
    await expect.element(input).toHaveValue('19900101-1234')
  })

  test('a plain form submits the masked value, and mask.unmask gives the plain one', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <TextInput aria-label="Personnummer" name="pin" mask={personalIdentityNumber} />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Personnummer' }), '199001011234')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('pin')).toBe('19900101-1234')
    expect(personalIdentityNumber.unmask('19900101-1234')).toBe('199001011234')
  })

  test('announces a refused character once per field, from the TextInput’s own messages too', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TextInput aria-label="Antal" mask={masks.digits()} />
        <TextInput
          aria-label="Kod"
          mask={masks.digits()}
          messages={{ characterNotAllowed: () => 'Bara siffror i koden.' }}
        />
      </KvirnProvider>,
    )
    const status = page.getByRole('status')
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), 'a')
    await expect.element(status).toHaveTextContent('Här kan du bara skriva siffror.')
    await userEvent.type(page.getByRole('textbox', { name: 'Kod' }), 'a')
    await expect.element(status).toHaveTextContent('Bara siffror i koden.')
  })

  test('announceRejections={false} keeps the live region quiet', async () => {
    await render(
      <KvirnProvider>
        <TextInput aria-label="Antal" mask={masks.digits()} announceRejections={false} />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), 'a')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
  })

  test('a masked TextInput in a Field without a help text warns once (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Personnummer</Field.Label>
        <TextInput mask={personalIdentityNumber} />
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('<Field.HelpText>')
    expect(message).toContain('3.3.2')
  })

  test('no description warning when the Field has one, or the TextInput has its own aria-describedby', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Personnummer</Field.Label>
          <TextInput mask={personalIdentityNumber} />
          <Field.Prose>12 siffror, till exempel 19900101-1234.</Field.Prose>
        </Field.Root>
        <Field.Root>
          <Field.Label>Postnummer</Field.Label>
          <TextInput mask={masks.postalCode({ country: 'SE' })} aria-describedby="eget-tips" />
        </Field.Root>
        <p id="eget-tips">Fem siffror.</p>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a masked TextInput with a Field.HelpText under it counts as hinted and does not warn', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Personnummer</Field.Label>
          <TextInput mask={personalIdentityNumber} />
          <Field.HelpText>12 siffror, ÅÅÅÅMMDD-NNNN</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Field.Label>Postnummer</Field.Label>
          <TextInput mask={masks.postalCode({ country: 'SE' })} />
          <Field.HelpText>Fem siffror.</Field.HelpText>
        </Field.Root>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a TextInput without a mask in a Field without a description does not warn about it', async () => {
    await render(
      <Field.Root>
        <Field.Label>Namn</Field.Label>
        <TextInput />
      </Field.Root>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a mask other than masks.email() on type="email" warns once', async () => {
    await render(<TextInput aria-label="E-post" type="email" mask={masks.digits()} />)
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('type="email"')
  })

  test('masks.email() on type="email" is fine, and filters whitespace', async () => {
    await render(
      <KvirnProvider>
        <TextInput aria-label="E-post" type="email" mask={masks.email()} />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'E-post' })
    await userEvent.type(input, 'maja @example.se')
    await expect.element(input).toHaveValue('maja@example.se')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('number masks use the provider’s locale, and sv and en differ', async () => {
    await render(
      <>
        <KvirnProvider locale="sv" messages={sv}>
          <TextInput aria-label="Belopp sv" mask={masks.number({ decimals: 2 })} />
        </KvirnProvider>
        <TextInput aria-label="Belopp en" mask={masks.number({ decimals: 2 })} />
      </>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Belopp sv' }), '1.5')
    await userEvent.type(page.getByRole('textbox', { name: 'Belopp en' }), '1,5')
    await expect.element(page.getByRole('textbox', { name: 'Belopp sv' })).toHaveValue('1,5')
    await expect.element(page.getByRole('textbox', { name: 'Belopp en' })).toHaveValue('1.5')
  })

  test('the new props have types', () => {
    expectTypeOf<TextInputProps['mask']>().toEqualTypeOf<MaskInput | undefined>()
    expectTypeOf<TextInputProps['announceRejections']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextInputProps['messages']>().toEqualTypeOf<
      Partial<KvirnMessages['mask']> | undefined
    >()
  })
})

describe('mask by name (Plan 0039)', () => {
  const typeInto = async (name: string, text: string) => {
    const input = page.getByRole('textbox', { name })
    await userEvent.type(input, text)
    return input
  }

  test.each([
    ['sv', sv, 'SE'],
    ['fi', fi, 'FI'],
    ['nb', nb, 'NO'],
  ] as const)(
    'a named mask is the explicit one under a %s provider: postal-code, personal-identity-number and ssi',
    async (locale, messages, country) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <TextInput aria-label="Postnummer" mask="postal-code" />
          <TextInput aria-label="Postnummer explicit" mask={masks.postalCode({ country })} />
          <TextInput aria-label="Personnummer" mask="personal-identity-number" />
          <TextInput aria-label="Personnummer ssi" mask="ssi" />
          <TextInput
            aria-label="Personnummer explicit"
            mask={masks.personalIdentityNumber({ country })}
          />
        </KvirnProvider>,
      )
      const postal = await typeInto('Postnummer', '12345')
      const postalExplicit = await typeInto('Postnummer explicit', '12345')
      const identity = await typeInto('Personnummer', '010190123')
      const identitySsi = await typeInto('Personnummer ssi', '010190123')
      const identityExplicit = await typeInto('Personnummer explicit', '010190123')
      const value = (locator: typeof postal) => (locator.element() as HTMLInputElement).value
      expect(value(postal)).toBe(value(postalExplicit))
      expect(value(identity)).toBe(value(identityExplicit))
      expect(value(identitySsi)).toBe(value(identityExplicit))
    },
  )

  test('the region of the locale wins: sv-FI gives the Finnish postcode, and no space', async () => {
    await render(
      <KvirnProvider locale="sv-FI" messages={sv}>
        <TextInput aria-label="Postnummer" mask="postal-code" />
      </KvirnProvider>,
    )
    await expect.element(await typeInto('Postnummer', '00100')).toHaveValue('00100')
  })

  test('a provider country wins over the locale', async () => {
    await render(
      <KvirnProvider locale="sv" country="NO" messages={sv}>
        <TextInput aria-label="Postnummer" mask="postal-code" announceRejections={false} />
      </KvirnProvider>,
    )
    await expect.element(await typeInto('Postnummer', '12345')).toHaveValue('1234')
  })

  test('{ preset, country } overrides the provider for that one input', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TextInput aria-label="Postnummer" mask={{ preset: 'postal-code', country: 'FI' }} />
      </KvirnProvider>,
    )
    await expect.element(await typeInto('Postnummer', '12345')).toHaveValue('12345')
  })

  test('{ pattern } and a RegExp make a custom mask, and names without a country work anywhere', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TextInput aria-label="Mönster" mask={{ pattern: '999 99' }} />
        <TextInput aria-label="Uttryck" mask={/^\d{0,3}$/} announceRejections={false} />
        <TextInput aria-label="Siffror" mask="digits" announceRejections={false} />
      </KvirnProvider>,
    )
    await expect.element(await typeInto('Mönster', '12345')).toHaveValue('123 45')
    await expect.element(await typeInto('Uttryck', 'a1234')).toHaveValue('123')
    const digits = await typeInto('Siffror', '1a2')
    await expect.element(digits).toHaveValue('12')
    await expect.element(digits).toHaveAttribute('inputmode', 'numeric')
  })

  test('a name keeps the preset’s details: onValueChange gets unmaskedValue and isComplete', async () => {
    const onValueChange = vi.fn<(value: string, details: TextInputChangeDetails) => void>()
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TextInput aria-label="Postnummer" mask="postal-code" onValueChange={onValueChange} />
      </KvirnProvider>,
    )
    await typeInto('Postnummer', '12345')
    expect(onValueChange.mock.lastCall?.[0]).toBe('123 45')
    expect(onValueChange.mock.lastCall?.[1].unmaskedValue).toBe('12345')
    expect(onValueChange.mock.lastCall?.[1].isComplete).toBe(true)
  })

  test('a country mask with no country falls back to digits and warns once, naming the mask', async () => {
    await render(
      <KvirnProvider locale="en">
        <TextInput aria-label="Postnummer" mask="postal-code" announceRejections={false} />
        <TextInput aria-label="Postnummer två" mask="postal-code" announceRejections={false} />
      </KvirnProvider>,
    )
    await expect.element(await typeInto('Postnummer', '12 a345')).toHaveValue('12345')
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('postal-code')
    expect(message).toContain('country')
  })

  test('the help text warning and the email warning read the resolved mask of a name', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Field.Root>
          <Field.Label>Personnummer</Field.Label>
          <TextInput mask="personal-identity-number" />
        </Field.Root>
        <TextInput aria-label="E-post" type="email" mask="digits" />
        <TextInput aria-label="E-postadress" type="email" mask="email" />
      </KvirnProvider>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(2)
    })
    const messages = consoleWarn.mock.calls.map((call) => String(call[0]))
    expect(messages.some((message) => message.includes('<Field.HelpText>'))).toBe(true)
    expect(messages.some((message) => message.includes('masks.email()'))).toBe(true)
  })

  test('the types: a name, a preset object, a pattern object and a RegExp are masks', () => {
    expectTypeOf<'postal-code'>().toExtend<NonNullable<TextInputProps['mask']>>()
    expectTypeOf<'ssi'>().toExtend<NonNullable<TextInputProps['mask']>>()
    expectTypeOf<{ preset: 'postal-code'; country: 'FI' }>().toExtend<
      NonNullable<TextInputProps['mask']>
    >()
    expectTypeOf<{ pattern: string }>().toExtend<NonNullable<TextInputProps['mask']>>()
    expectTypeOf<RegExp>().toExtend<NonNullable<TextInputProps['mask']>>()
  })
})
