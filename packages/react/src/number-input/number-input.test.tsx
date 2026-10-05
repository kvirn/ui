import type { MaskInput } from '@kvirn-ui/core'
import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { InputGroup } from '../input-group/input-group.tsx'
import { masks } from '../index.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import type { TextInputChangeDetails } from '../text-input/use-text-input.ts'
import { NumberInput } from './number-input.tsx'
import type { NumberInputProps, NumberInputState } from './number-input.tsx'
import { useNumberInput } from './use-number-input.ts'
import type {
  NumberInputPartProps,
  UseNumberInputOptions,
  UseNumberInputResult,
} from './use-number-input.ts'

// Contract: number-input.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** The value as the page shows it, with every kind of space as a plain one. */
const plainSpaces = (value: string) => value.replace(/\s/g, ' ')

type ValueChange = (value: string, details: TextInputChangeDetails) => void

describe('rendering', () => {
  test('renders a native text box, not a spinbutton, with no min, max or pattern attribute', async () => {
    const { container } = await render(
      <Field.Root required>
        <Field.Label>Hur många barn bor hos dig?</Field.Label>
        <NumberInput name="children" min={0} max={12} />
        <Field.HelpText>Ett heltal från 0 till 12.</Field.HelpText>
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: /Hur många barn bor hos dig\?/ })
    expect(page.getByRole('spinbutton').elements()).toHaveLength(0)
    await expect.element(input).toHaveAttribute('type', 'text')
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect.element(input).toHaveAttribute('spellcheck', 'false')
    for (const attribute of ['min', 'max', 'step', 'pattern', 'maxlength']) {
      await expect.element(input).not.toHaveAttribute(attribute)
    }
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test.each([
    ['whole numbers', {}, 'numeric'],
    ['decimals', { decimals: 2 }, 'decimal'],
    ['negative whole numbers', { allowNegative: true }, 'text'],
    ['negative decimals', { decimals: 2, allowNegative: true }, 'text'],
  ] as const)('inputMode follows the mask: %s', async (_name, props, inputMode) => {
    await render(<NumberInput aria-label="Belopp" {...props} />)
    await expect
      .element(page.getByRole('textbox', { name: 'Belopp' }))
      .toHaveAttribute('inputmode', inputMode)
  })

  test('forwards its ref and native props, and the part classes join a consumer’s', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <NumberInput
        ref={ref}
        aria-label="Antal"
        className="kv-input--width-2"
        name="count"
        autoComplete="off"
        defaultValue="4"
      />,
    )
    const input = page.getByRole('textbox', { name: 'Antal' })
    expect(ref.current).toBe(input.element())
    await expect.element(input).toHaveClass('kv-input--width-2', 'kv-input', 'kv-input--numeric')
    await expect.element(input).toHaveAttribute('name', 'count')
    await expect.element(input).toHaveAttribute('autocomplete', 'off')
    await expect.element(input).toHaveValue('4')
  })

  test('an inputMode of your own wins over the mask’s suggestion', async () => {
    await render(<NumberInput aria-label="Belopp" decimals={2} inputMode="numeric" />)
    await expect
      .element(page.getByRole('textbox', { name: 'Belopp' }))
      .toHaveAttribute('inputmode', 'numeric')
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: NumberInputState[] = []
    await render(
      <Field.Root invalid required>
        <Field.Label>Antal</Field.Label>
        <Field.ErrorMessage>Ange ett tal</Field.ErrorMessage>
        <NumberInput
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
      isRequired: true,
      isDisabled: false,
      isFocusVisible: false,
    })
  })
})

describe('the props become the mask', () => {
  test('a whole number takes digits only: a letter and a decimal mark are left out', async () => {
    const onValueChange = vi.fn<ValueChange>()
    await render(<NumberInput aria-label="Antal" onValueChange={onValueChange} />)
    const input = page.getByRole('textbox', { name: 'Antal' })
    await userEvent.type(input, 'a2b')
    await expect.element(input).toHaveValue('2')
    await userEvent.type(input, ',')
    await expect.element(input).toHaveValue('2')
    expect(onValueChange.mock.lastCall?.[1].rejected).toHaveLength(1)
  })

  test('decimals takes the page’s decimal mark and no more digits than asked for', async () => {
    await render(
      <>
        <KvirnProvider locale="sv" messages={sv}>
          <NumberInput aria-label="Belopp sv" decimals={2} />
        </KvirnProvider>
        <NumberInput aria-label="Belopp en" decimals={2} />
      </>,
    )
    const swedish = page.getByRole('textbox', { name: 'Belopp sv' })
    const english = page.getByRole('textbox', { name: 'Belopp en' })
    await userEvent.type(swedish, '1.5')
    await userEvent.type(english, '1,5')
    await expect.element(swedish).toHaveValue('1,5')
    await expect.element(english).toHaveValue('1.5')
    await userEvent.type(swedish, '55')
    await expect.element(swedish).toHaveValue('1,55')
  })

  test('allowNegative takes a leading minus sign, and without it the sign is left out', async () => {
    await render(
      <>
        <NumberInput aria-label="Saldo" allowNegative />
        <NumberInput aria-label="Antal" />
      </>,
    )
    const balance = page.getByRole('textbox', { name: 'Saldo' })
    const count = page.getByRole('textbox', { name: 'Antal' })
    await userEvent.type(balance, '-5')
    await userEvent.type(count, '-5')
    await expect.element(balance).toHaveValue('-5')
    await expect.element(count).toHaveValue('5')
  })

  test('grouping writes the separators of the page’s language', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Belopp" grouping />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250000')
    expect(plainSpaces((input.element() as HTMLInputElement).value)).toBe('1 250 000')
  })

  test('onValueChange gets the shown value, the machine form and the range', async () => {
    const onValueChange = vi.fn<ValueChange>()
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput
          aria-label="Belopp"
          decimals={2}
          grouping
          min={0}
          max={5000}
          onValueChange={onValueChange}
        />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Belopp' }), '1250,5')
    const [value, details] = onValueChange.mock.lastCall ?? []
    expect(plainSpaces(value ?? '')).toBe('1 250,5')
    expect(details?.reason).toBe('input')
    expect(details?.unmaskedValue).toBe('1250.5')
    expect(details?.isWithinRange).toBe(true)
  })

  test('min and max are reported as isWithinRange, never enforced', async () => {
    const onValueChange = vi.fn<ValueChange>()
    await render(<NumberInput aria-label="Barn" min={1} max={12} onValueChange={onValueChange} />)
    const input = page.getByRole('textbox', { name: 'Barn' })
    await userEvent.type(input, '25')
    // Over the maximum: the answer stays as typed, and the form decides what to say.
    await expect.element(input).toHaveValue('25')
    expect(onValueChange.mock.lastCall?.[1].isWithinRange).toBe(false)
    await userEvent.clear(input)
    await userEvent.type(input, '0')
    await expect.element(input).toHaveValue('0')
    expect(onValueChange.mock.lastCall?.[1].isWithinRange).toBe(false)
    await userEvent.clear(input)
    await userEvent.type(input, '5')
    expect(onValueChange.mock.lastCall?.[1].isWithinRange).toBe(true)
  })

  test('a form submit sends the value as shown, also for a value you set', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <NumberInput aria-label="Antal" name="count" />
        <NumberInput aria-label="Fast" name="fixed" value="12" readOnly />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), '7')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('count')).toBe('7')
    expect(submitted?.get('fixed')).toBe('12')
  })
})

describe('rejections (contract: number-input.a11y.md › Announcements)', () => {
  test.each([
    ['sv', sv, 'Här kan du bara skriva siffror.'],
    ['en', en, 'Only digits can be entered here.'],
  ] as const)(
    'a letter is left out and announced politely, in the provider language (%s)',
    async (locale, messages, announcement) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <NumberInput aria-label="Antal" />
        </KvirnProvider>,
      )
      const input = page.getByRole('textbox', { name: 'Antal' })
      await userEvent.type(input, 'a')
      await expect.element(input).toHaveValue('')
      await expect.element(page.getByRole('status')).toHaveTextContent(announcement)
    },
  )

  test.each([
    ['sv', sv, '1250,505', '1 250,50', 'Du kan inte skriva fler decimaler.'],
    ['en', en, '1250.505', '1,250.50', 'No more decimals can be entered here.'],
  ] as const)(
    'a digit past the decimals is left out and announced as decimals, not as a full field (%s)',
    async (locale, messages, typed, shown, announcement) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <NumberInput aria-label="Belopp" decimals={2} grouping />
        </KvirnProvider>,
      )
      const input = page.getByRole('textbox', { name: 'Belopp' })
      await userEvent.type(input, typed)
      expect(plainSpaces((input.element() as HTMLInputElement).value)).toBe(shown)
      await expect.element(page.getByRole('status')).toHaveTextContent(announcement)
    },
  )

  test('mask={false} announces nothing: a letter is kept and the live region stays empty', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Antal" mask={false} />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Antal' })
    await userEvent.type(input, 'a')
    await expect.element(input).toHaveValue('a')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
  })

  test('a custom mask announces its own rejections, in the provider language', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Kod" mask="digits" />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Kod' })
    await userEvent.type(input, 'a')
    await expect.element(input).toHaveValue('')
    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('Här kan du bara skriva siffror.')
  })

  test('accepted digits announce nothing', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Antal" />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), '12')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
  })
})

describe('keys and paste (contract: number-input.a11y.md › Keyboard)', () => {
  test('paste is not blocked: 1 250,50 and 1250.50 both read', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Belopp" decimals={2} grouping />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    const shown = () => plainSpaces((input.element() as HTMLInputElement).value)
    await userEvent.fill(input, '1250.50')
    expect(shown()).toBe('1 250,50')
    await userEvent.fill(input, ' 1 250,50 ')
    expect(shown()).toBe('1 250,50')
  })

  test('Enter in a form submits it with the shown value (native)', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <NumberInput aria-label="Antal" name="count" />
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), '12')
    await userEvent.keyboard('{Enter}')
    expect(submitted?.get('count')).toBe('12')
  })

  test('Tab and Shift+Tab move focus to and from the input, in DOM order', async () => {
    await render(
      <>
        <NumberInput aria-label="Ett" />
        <NumberInput aria-label="Två" />
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

describe('keyboard', () => {
  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  test('ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted', async () => {
    await render(<NumberInput aria-label="Belopp" />)
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250')
    const element = input.element() as HTMLInputElement
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{Home}')
    expect(element.selectionStart).toBe(0)
    await userEvent.keyboard('{End}')
    expect(element.selectionStart).toBe(4)
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(element.selectionStart).toBe(2)
    await userEvent.keyboard('{ArrowRight}')
    expect(element.selectionStart).toBe(3)
    recorder.stop()
    expect(element.value).toBe('1250')
    await expect.element(input).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('ArrowLeft and ArrowRight move the caret in a right-to-left page and are not intercepted', async () => {
    await render(
      <div dir="rtl">
        <NumberInput aria-label="Belopp" />
      </div>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250')
    const element = input.element() as HTMLInputElement
    await userEvent.keyboard('{Home}')
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{ArrowLeft}')
    const afterLeft = element.selectionStart ?? 0
    await userEvent.keyboard('{Home}{ArrowRight}')
    const afterRight = element.selectionStart ?? 0
    recorder.stop()
    expect(Math.max(afterLeft, afterRight)).toBeGreaterThan(0)
    expect(element.value).toBe('1250')
    await expect.element(input).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('ArrowUp and ArrowDown never change the value', async () => {
    await render(<NumberInput aria-label="Belopp" decimals={2} />)
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250.50')
    const before = (input.element() as HTMLInputElement).value
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}{ArrowDown}')
    recorder.stop()
    await expect.element(input).toHaveValue(before)
    await expect.element(input).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('Backspace and Delete remove a character, also next to a group separator', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Belopp" grouping />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    const element = input.element() as HTMLInputElement
    const digitCount = () => element.value.replace(/\D/g, '').length
    await userEvent.type(input, '12500')
    expect(digitCount()).toBe(5)
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{Backspace}')
    await expect.poll(digitCount).toBe(4)
    await userEvent.keyboard('{Home}{Delete}')
    await expect.poll(digitCount).toBe(3)
    recorder.stop()
    expect(recorder.keys).toEqual([])
  })

  test('Control/Command+A selects all the text', async () => {
    await render(<NumberInput aria-label="Belopp" decimals={2} />)
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250.50')
    const element = input.element() as HTMLInputElement
    await userEvent.keyboard('{Control>}a{/Control}')
    expect([element.selectionStart, element.selectionEnd]).toEqual([0, element.value.length])
  })

  test('Escape does nothing: the value and the focus stay', async () => {
    await render(<NumberInput aria-label="Belopp" decimals={2} />)
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.type(input, '1250.50')
    const before = (input.element() as HTMLInputElement).value
    const recorder = recordPreventedKeys()
    await userEvent.keyboard('{Escape}')
    recorder.stop()
    await expect.element(input).toHaveValue(before)
    await expect.element(input).toHaveFocus()
    expect(recorder.keys).toEqual([])
  })

  test('clicking the label focuses the input', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <NumberInput />
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Belopp', { exact: true }))
    await expect.element(page.getByRole('textbox', { name: 'Belopp' })).toHaveFocus()
  })
})

describe('in a Field', () => {
  test('the label names it, the help text and the error describe it, and the state is on it', async () => {
    const { container } = await render(
      <Field.Root required invalid>
        <Field.Label>Hur många barn bor hos dig?</Field.Label>
        <NumberInput name="children" max={12} />
        <Field.HelpText>Ett heltal från 0 till 12, till exempel 2.</Field.HelpText>
        <Field.ErrorMessage>Ange antalet barn som ett tal från 0 till 12</Field.ErrorMessage>
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: /Hur många barn bor hos dig\?/ })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAttribute('data-invalid', '')
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'Ett heltal från 0 till 12, till exempel 2. Error: Ange antalet barn som ett tal från 0 till 12',
      )
    expect(container.querySelector('label')?.getAttribute('for')).toBe(input.element().id)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a disabled Field disables it, and its own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Field.Label marker="none">Ett</Field.Label>
          <NumberInput />
        </Field.Root>
        <Field.Root>
          <Field.Label marker="none">Två</Field.Label>
          <NumberInput disabled />
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Ett' })).toBeDisabled()
    const second = page.getByRole('textbox', { name: 'Två' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Utan valutatecken.</p>
        <Field.Root>
          <Field.Label marker="none">Belopp</Field.Label>
          <NumberInput decimals={2} aria-describedby="extra" />
          <Field.HelpText>Till exempel 1 250,50.</Field.HelpText>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Belopp' }))
      .toHaveAccessibleDescription('Till exempel 1 250,50. Utan valutatecken.')
  })
})

describe('inside an InputGroup', () => {
  test('works in InputGroup.Root next to an Addon, and the label carries the unit', async () => {
    const { container } = await render(
      <Field.Root required>
        <Field.Label>Månadshyra i kronor</Field.Label>
        <InputGroup.Root>
          <NumberInput name="rent" grouping className="kv-input--width-10" />
          <InputGroup.Addon data-testid="addon">kr</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>Till exempel 8 450</Field.HelpText>
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: /Månadshyra i kronor/ })
    await expect.element(page.getByTestId('addon')).toHaveAttribute('aria-hidden', 'true')
    await expect.element(input).toHaveAccessibleDescription('Till exempel 8 450')
    // A click on the unit focuses the input, and the mask still shapes what is typed.
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(input).toHaveFocus()
    await userEvent.keyboard('8450')
    expect(plainSpaces((input.element() as HTMLInputElement).value)).toMatch(/^8[\s,.]?450$/)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('dev warnings', () => {
  test('a NumberInput without a label, outside a Field, warns once', async () => {
    await render(<NumberInput placeholder="Antal" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('NumberInput')
    expect(message).toContain('accessible name')
  })

  test('a NumberInput inside a Field without a Label warns once', async () => {
    await render(
      <Field.Root>
        <NumberInput />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Field.Label')
  })

  test('an id inside a Field is ignored, with a warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Field.Label marker="none">Antal</Field.Label>
        <NumberInput id="eget" />
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Antal' }))
      .toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('controlId')
  })

  test('decimals in a Field without a help text warn once (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Hyra</Field.Label>
        <NumberInput decimals={2} />
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('<Field.HelpText>')
    expect(message).toContain('3.3.2')
  })

  test('a whole number needs no help text, and decimals with a help text or your own description do not warn', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Antal</Field.Label>
          <NumberInput />
        </Field.Root>
        <Field.Root>
          <Field.Label>Hyra</Field.Label>
          <NumberInput decimals={2} />
          <Field.HelpText>Till exempel 1 250,50.</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Field.Label>Skuld</Field.Label>
          <NumberInput decimals={2} aria-describedby="eget-tips" />
        </Field.Root>
        <p id="eget-tips">Till exempel 300,25.</p>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('dev warnings: your own mask', () => {
  test('an own mask in a Field without a help text warns once (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Postnummer</Field.Label>
        <NumberInput mask={{ pattern: '999 99' }} />
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('<Field.HelpText>')
    expect(message).toContain('3.3.2')
  })

  test('an own mask with a help text or your own description, and mask={false}, do not warn', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Postnummer</Field.Label>
          <NumberInput mask="digits" />
          <Field.HelpText>Fem siffror, till exempel 123 45.</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Field.Label>Kod</Field.Label>
          <NumberInput mask={{ pattern: '99-99' }} aria-describedby="eget-tips" />
        </Field.Root>
        <p id="eget-tips">Fyra siffror, till exempel 12-34.</p>
        <Field.Root>
          <Field.Label>Belopp</Field.Label>
          <NumberInput mask={false} />
        </Field.Root>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useNumberInput', () => {
  function HookInput({ label, ...options }: UseNumberInputOptions & { label: string }) {
    const number = useNumberInput(options)
    return <input aria-label={label} {...number.inputProps} />
  }

  test('gives spreadable props for your own <input>, in the provider’s locale, reading the Field', async () => {
    const onValueChange = vi.fn<ValueChange>()
    const { container } = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Field.Root invalid required>
          <Field.Label>Belopp</Field.Label>
          <HookInput label="Belopp" decimals={2} onValueChange={onValueChange} />
          <Field.HelpText>Till exempel 1 250,50.</Field.HelpText>
          <Field.ErrorMessage>Ange ett belopp</Field.ErrorMessage>
        </Field.Root>
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('inputmode', 'decimal')
    await expect.element(input).toHaveAttribute('type', 'text')
    await userEvent.type(input, '1.5')
    await expect.element(input).toHaveValue('1,5')
    expect(onValueChange.mock.lastCall?.[1].unmaskedValue).toBe('1.5')
    await expectNoA11yViolations(container)
  })

  test('format and unmask follow the provider’s locale', async () => {
    let result: UseNumberInputResult | undefined
    function Probe() {
      result = useNumberInput({ decimals: 1, grouping: true, allowNegative: true })
      return null
    }
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Probe />
      </KvirnProvider>,
    )
    expect(plainSpaces(result?.format('-1234.5') ?? '')).toBe('-1 234,5')
    expect(result?.unmask('-1 234,5')).toBe('-1234.5')
  })

  test('reports its state', async () => {
    const seen: Pick<UseNumberInputResult, 'isInvalid' | 'isRequired' | 'isDisabled'>[] = []
    function Probe() {
      const { isInvalid, isRequired, isDisabled } = useNumberInput()
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

describe('the mask is optional (Plan 0039)', () => {
  test('mask={false} is a plain numeric text box: nothing is left out, and no mask details are reported', async () => {
    const onValueChange = vi.fn<ValueChange>()
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Antal" mask={false} onValueChange={onValueChange} />
        <NumberInput aria-label="Belopp" mask={false} decimals={2} />
        <NumberInput aria-label="Saldo" mask={false} allowNegative />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Antal' })
    await userEvent.type(input, 'a2b,')
    await expect.element(input).toHaveValue('a2b,')
    const details = onValueChange.mock.lastCall?.[1]
    expect(onValueChange.mock.lastCall?.[0]).toBe('a2b,')
    expect(details?.reason).toBe('input')
    expect(details?.unmaskedValue).toBeUndefined()
    expect(details?.rejected).toBeUndefined()
    // The keypad still follows the props.
    await expect.element(input).toHaveAttribute('inputmode', 'numeric')
    await expect
      .element(page.getByRole('textbox', { name: 'Belopp' }))
      .toHaveAttribute('inputmode', 'decimal')
    await expect
      .element(page.getByRole('textbox', { name: 'Saldo' }))
      .toHaveAttribute('inputmode', 'text')
    await expect.element(input).toHaveAttribute('type', 'text')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('mask={false} with decimals needs no format help text: the page’s decimal mark is not applied', async () => {
    await render(
      <Field.Root>
        <Field.Label>Belopp</Field.Label>
        <NumberInput mask={false} decimals={2} />
      </Field.Root>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a name replaces the number mask, with that mask’s unmaskedValue', async () => {
    const onValueChange = vi.fn<ValueChange>()
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput
          aria-label="Kod"
          mask="digits"
          decimals={2}
          onValueChange={onValueChange}
          announceRejections={false}
        />
      </KvirnProvider>,
    )
    const input = page.getByRole('textbox', { name: 'Kod' })
    await userEvent.type(input, '0,15')
    await expect.element(input).toHaveValue('015')
    expect(onValueChange.mock.lastCall?.[1].unmaskedValue).toBe('015')
  })

  test('a finished mask or a pattern object replaces the number mask too', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <NumberInput aria-label="Antal" mask={masks.number({ decimals: 1 })} />
        <NumberInput aria-label="Postnummer" mask={{ pattern: '999 99' }} />
      </KvirnProvider>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Antal' }), '1.5')
    await expect.element(page.getByRole('textbox', { name: 'Antal' })).toHaveValue('1,5')
    await userEvent.type(page.getByRole('textbox', { name: 'Postnummer' }), '12345')
    await expect.element(page.getByRole('textbox', { name: 'Postnummer' })).toHaveValue('123 45')
  })

  test('without a mask prop the number mask stays the default', async () => {
    await render(<NumberInput aria-label="Antal" />)
    const input = page.getByRole('textbox', { name: 'Antal' })
    await userEvent.type(input, 'a2')
    await expect.element(input).toHaveValue('2')
  })

  test('useNumberInput takes mask too, and its mask is undefined only for false', async () => {
    const seen: Record<string, UseNumberInputResult['mask']> = {}
    function Probe() {
      seen['default'] = useNumberInput().mask
      seen['off'] = useNumberInput({ mask: false }).mask
      seen['named'] = useNumberInput({ mask: 'digits' }).mask
      return null
    }
    await render(<Probe />)
    expect(seen['default']).toBeDefined()
    expect(seen['off']).toBeUndefined()
    expect(seen['named']).toBeDefined()
    expectTypeOf<UseNumberInputOptions['mask']>().toEqualTypeOf<MaskInput | false | undefined>()
  })
})

describe('server rendering', () => {
  test('renders the input to a string without touching the page', () => {
    const html = renderToString(<NumberInput aria-label="Antal" defaultValue="4" />)
    expect(html).toContain('type="text"')
  })
})

describe('types', () => {
  test('there is no type prop, mask is a mask or false, and min and max are numbers', () => {
    expectTypeOf<NumberInputProps>().not.toHaveProperty('type')
    expectTypeOf<NumberInputProps['mask']>().toEqualTypeOf<MaskInput | false | undefined>()
    expectTypeOf<NumberInputProps['min']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<NumberInputProps['max']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<NumberInputProps['decimals']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<NumberInputProps['allowNegative']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<NumberInputProps['grouping']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<NumberInputProps['value']>().toEqualTypeOf<string | undefined>()
  })

  test('onValueChange takes the shown value and the mask details', () => {
    expectTypeOf<NumberInputProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: TextInputChangeDetails) => void) | undefined
    >()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<NumberInputPartProps['className']>().toEqualTypeOf<'kv-input kv-input--numeric'>()
    expectTypeOf<NumberInputPartProps['type']>().toEqualTypeOf<'text'>()
    expectTypeOf<UseNumberInputResult['inputProps']>().toEqualTypeOf<NumberInputPartProps>()
    expectTypeOf<UseNumberInputResult['isFocusVisible']>().toEqualTypeOf<boolean>()
  })
})
