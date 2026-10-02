import type { Mask } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
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
import { Input } from './input.tsx'
import type { InputChangeDetails, InputProps, InputState, InputType } from './input.tsx'
import { useInput } from './use-input.ts'
import type { InputPartProps, UseInputOptions, UseInputResult } from './use-input.ts'

// Contract: input.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/input/input.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('renders a native <input type="text"> with its class, outside a Field', async () => {
    const { container } = await render(<Input aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    const element = input.element()
    expect(element.tagName).toBe('INPUT')
    expect(element.className).toBe('kv-input')
    await expect.element(input).toHaveAttribute('type', 'text')
    await expect.element(input).not.toHaveAttribute('id')
    await expect.element(input).not.toHaveAttribute('aria-describedby')
    await expect.element(input).not.toHaveAttribute('aria-invalid')
    await expect.element(input).not.toHaveAttribute('aria-required')
    await expect.element(input).not.toHaveAttribute('data-kv')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref, className and native props', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <Input
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
      const { container } = await render(<Input type={type} aria-label="Fält" />)
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
    await render(<Input type={type} aria-label="Fält" />)
    await expect.element(page.getByRole(role, { name: 'Fält' })).toBeVisible()
  })

  test('passes autoComplete, inputMode and spellCheck for numbers (ADR-0030)', async () => {
    const { container } = await render(
      <Input aria-label="Antal barn" inputMode="numeric" spellCheck={false} autoComplete="off" />,
    )
    const input = page.getByRole('textbox', { name: 'Antal barn' })
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect.element(input).toHaveAttribute('spellcheck', 'false')
    await expect.element(input).toHaveAttribute('type', 'text')
    await expectNoA11yViolations(container)
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: InputState[] = []
    await render(
      <Field.Root invalid disabled={false}>
        <Field.Label>Namn</Field.Label>
        <Field.ErrorMessage>Ange ditt namn</Field.ErrorMessage>
        <Input
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
        <Input name="name" autoComplete="name" />
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
        <Input />
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
          <Input />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Efternamn</Field.Label>
          <Input disabled />
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
          <Field.Description>Som i passet.</Field.Description>
          <Input aria-describedby="extra" />
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
          <Input aria-describedby="extra" />
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Namn' }))
      .toHaveAttribute('aria-describedby', 'extra')
  })

  test('an id on the Input inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Field.Label marker="none">Namn</Field.Label>
        <Input id="annat" />
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
          <Field.Description>Vi ringer bara om något är fel.</Field.Description>
          <Field.ErrorMessage>Ange ett telefonnummer</Field.ErrorMessage>
          <Input type="tel" autoComplete="tel" />
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
    const onValueChange = vi.fn<(value: string, details: InputChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    await render(<Input aria-label="Namn" onValueChange={onValueChange} onChange={onChange} />)
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
          <Input aria-label="Namn" value={value} onValueChange={setValue} />
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
    await render(<Input aria-label="Namn" defaultValue="Maja" />)
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
          <Input name="name" />
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
        <Input type="email" {...register('email')} />
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
    const onValueChange = vi.fn<(value: string, details: InputChangeDetails) => void>()
    await render(<Input aria-label="Namn" onValueChange={onValueChange} />)
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
        <Input inputMode="numeric" spellCheck={false} />
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
        <Input />
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
        <Input aria-label="Ett" />
        <Input aria-label="Två" />
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
          <Field.Description>Hint</Field.Description>
          <Input />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Två</Field.Label>
          <Input />
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
    const props = { type: 'number', 'aria-label': 'Antal' } as unknown as InputProps
    const { container } = await render(<Input {...props} />)
    expect(container.querySelector('input')?.getAttribute('type')).toBe('number')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('type="number"')
    expect(message).toContain('inputMode')
  })

  test('type="date" warns once', async () => {
    const props = { type: 'date', 'aria-label': 'Datum' } as unknown as InputProps
    await render(<Input {...props} />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('type="date"')
  })

  test('an Input without a label, outside a Field, warns once', async () => {
    await render(<Input placeholder="Namn" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('accessible name')
    expect(message).toContain('placeholder')
  })

  test('an Input inside a Field without a Label warns once', async () => {
    await render(
      <Field.Root>
        <Input />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Field.Label')
  })

  test('aria-label, aria-labelledby and a wrapping <label> are names enough', async () => {
    await render(
      <>
        <Input aria-label="Sök" type="search" />
        <span id="rubrik">Postnummer</span>
        <Input aria-labelledby="rubrik" />
        <label htmlFor="gata">
          Gata
          <Input id="gata" />
        </label>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useInput', () => {
  function HookInput(options: UseInputOptions & { label: string }) {
    const { label, ...inputOptions } = options
    const input = useInput(inputOptions)
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
    await expect.element(input).toHaveClass('kv-input')
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAccessibleDescription('Error: Ange ditt namn')
    await expectNoA11yViolations(container)
  })

  test('onValueChange and type work without a Field', async () => {
    const onValueChange = vi.fn<(value: string, details: InputChangeDetails) => void>()
    await render(<HookInput label="E-post" type="email" onValueChange={onValueChange} />)
    const input = page.getByRole('textbox', { name: 'E-post' })
    await expect.element(input).toHaveAttribute('type', 'email')
    await userEvent.type(input, 'a')
    expect(onValueChange).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'input' }))
  })

  test('reports its state', async () => {
    const seen: Pick<UseInputResult, 'isInvalid' | 'isRequired' | 'isDisabled'>[] = []
    function Probe() {
      const { isInvalid, isRequired, isDisabled } = useInput()
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
    const html = renderToString(<Input aria-label="Namn" defaultValue="Maja" />)
    expect(html).toContain('class="kv-input"')
    expect(html).toContain('type="text"')
  })
})

describe('types', () => {
  test('type is the text-like union, never number or date (ADR-0030)', () => {
    expectTypeOf<InputType>().toEqualTypeOf<
      'text' | 'email' | 'tel' | 'url' | 'password' | 'search'
    >()
    expectTypeOf<InputProps['type']>().toEqualTypeOf<InputType | undefined>()
  })

  test('onValueChange takes the string value and details', () => {
    expectTypeOf<InputProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: InputChangeDetails) => void) | undefined
    >()
    expectTypeOf<InputChangeDetails['reason']>().toEqualTypeOf<'input'>()
    expectTypeOf<InputProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InputProps['defaultValue']>().toEqualTypeOf<string | undefined>()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<InputPartProps['className']>().toEqualTypeOf<'kv-input'>()
    expectTypeOf<InputPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseInputResult['inputProps']>().toEqualTypeOf<InputPartProps>()
    expectTypeOf<UseInputResult['isFocusVisible']>().toEqualTypeOf<boolean>()
  })
})

describe('mask (ADR-0032, contract: input.a11y.md › Masked input)', () => {
  const personalIdentityNumber = masks.personalIdentityNumber({ country: 'SE' })

  test('without a mask nothing changes: no suggested attributes, no announcer warning', async () => {
    await render(<Input aria-label="Namn" />)
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).not.toHaveAttribute('inputmode')
    await expect.element(input).not.toHaveAttribute('spellcheck')
    await expect.element(input).not.toHaveAttribute('dir')
    await userEvent.type(input, 'Maja 1')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a mask shapes the value, adds no class or role, and keeps the Field wiring', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Field.Root required invalid>
          <Field.Label>Personnummer</Field.Label>
          <Field.Description>12 siffror, till exempel 19900101-1234.</Field.Description>
          <Field.ErrorMessage>Ange personnumret</Field.ErrorMessage>
          <Input name="personalIdentityNumber" mask={personalIdentityNumber} />
        </Field.Root>
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Personnummer' })
    await userEvent.fill(input, '19900101 1234')

    await expect.element(input).toHaveValue('19900101-1234')
    const element = input.element()
    expect(element.className).toBe('kv-input')
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
    const onValueChange = vi.fn<(value: string, details: InputChangeDetails) => void>()
    await render(
      <KvirnProvider>
        <Input
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
      <Input
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
      <Input
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
          <Input
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
        <Input aria-label="Personnummer" name="pin" mask={personalIdentityNumber} />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Personnummer' }), '199001011234')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('pin')).toBe('19900101-1234')
    expect(personalIdentityNumber.unmask('19900101-1234')).toBe('199001011234')
  })

  test('announces a refused character once per field, from the Input’s own messages too', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Input aria-label="Antal" mask={masks.digits()} />
        <Input
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
        <Input aria-label="Antal" mask={masks.digits()} announceRejections={false} />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), 'a')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
  })

  test('a masked Input in a Field without a Field.Description warns once (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Personnummer</Field.Label>
        <Input mask={personalIdentityNumber} />
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('Field.Description')
    expect(message).toContain('3.3.2')
  })

  test('no description warning when the Field has one, or the Input has its own aria-describedby', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Personnummer</Field.Label>
          <Input mask={personalIdentityNumber} />
          <Field.Description>12 siffror, till exempel 19900101-1234.</Field.Description>
        </Field.Root>
        <Field.Root>
          <Field.Label>Postnummer</Field.Label>
          <Input mask={masks.postalCode({ country: 'SE' })} aria-describedby="eget-tips" />
        </Field.Root>
        <p id="eget-tips">Fem siffror.</p>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an Input without a mask in a Field without a description does not warn about it', async () => {
    await render(
      <Field.Root>
        <Field.Label>Namn</Field.Label>
        <Input />
      </Field.Root>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a mask other than masks.email() on type="email" warns once (ADR-0032 item 9)', async () => {
    await render(<Input aria-label="E-post" type="email" mask={masks.digits()} />)
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('type="email"')
  })

  test('masks.email() on type="email" is fine, and filters whitespace', async () => {
    await render(
      <KvirnProvider>
        <Input aria-label="E-post" type="email" mask={masks.email()} />
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
          <Input aria-label="Belopp sv" mask={masks.number({ decimals: 2 })} />
        </KvirnProvider>
        <Input aria-label="Belopp en" mask={masks.number({ decimals: 2 })} />
      </>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Belopp sv' }), '1.5')
    await userEvent.type(page.getByRole('textbox', { name: 'Belopp en' }), '1,5')
    await expect.element(page.getByRole('textbox', { name: 'Belopp sv' })).toHaveValue('1,5')
    await expect.element(page.getByRole('textbox', { name: 'Belopp en' })).toHaveValue('1.5')
  })

  test('the new props have types', () => {
    expectTypeOf<InputProps['mask']>().toEqualTypeOf<Mask | undefined>()
    expectTypeOf<InputProps['announceRejections']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InputProps['messages']>().toEqualTypeOf<
      Partial<KvirnMessages['mask']> | undefined
    >()
  })
})
