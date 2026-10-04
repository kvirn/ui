import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { checks, masks, useMask } from '../index.ts'
import type { MaskInputPartProps, UseMaskOptions, UseMaskResult } from '../index.ts'
import type { TextInputChangeDetails } from '../text-input/use-text-input.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'

// Contract: text-input.a11y.md (masked rows). The keys are also covered end to end in
// apps/storybook/src/components/mask/mask.e2e.ts.

type Report = { value: string; details: TextInputChangeDetails }

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** Your own `<input>` with the hook's props: the way an adopter uses it. */
function MaskedInput({
  options,
  ownProps = {},
  reports,
  label = 'Fält',
}: {
  options: UseMaskOptions
  ownProps?: Record<string, unknown>
  reports?: Report[]
  label?: string
}) {
  const mask = useMask({
    ...options,
    onValueChange: (value, details) => {
      reports?.push({ value, details })
      options.onValueChange?.(value, details)
    },
  })
  return <input aria-label={label} {...mergeProps(mask.inputProps, ownProps)} />
}

/** Sets the value the way the browser does, so React sees a real change (not its own setter). */
function setNativeValue(element: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  const setter: unknown = Reflect.get(descriptor ?? {}, 'set')
  if (typeof setter === 'function') {
    Reflect.apply(setter, element, [value])
  }
}

const field = () => page.getByRole('textbox', { name: 'Fält' })
const lastReport = (reports: Report[]): Report => {
  const report = reports.at(-1)
  if (report === undefined) {
    throw new Error('onValueChange was not called')
  }
  return report
}

describe('exports and types', () => {
  test('masks and checks are re-exported from the react entry', () => {
    expect(typeof masks.personalIdentityNumber).toBe('function')
    expect(typeof checks.personalIdentityNumber).toBe('function')
    expect(typeof useMask).toBe('function')
  })

  test('the option and result types', () => {
    expectTypeOf<UseMaskResult['inputProps']>().toEqualTypeOf<MaskInputPartProps>()
    expectTypeOf<UseMaskOptions['announceRejections']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextInputChangeDetails['unmaskedValue']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TextInputChangeDetails['isComplete']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<TextInputChangeDetails['isWithinRange']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('typing', () => {
  test('a literal is inserted only when the next character is typed (5.1)', async () => {
    await render(<MaskedInput options={{ mask: masks.pattern('999-999') }} />)
    await userEvent.type(field(), '123')
    await expect.element(field()).toHaveValue('123')
    await userEvent.keyboard('4')
    await expect.element(field()).toHaveValue('123-4')
  })

  test('a typed literal at its spot is accepted once, not doubled (5.2)', async () => {
    await render(<MaskedInput options={{ mask: masks.pattern('999-999') }} />)
    await userEvent.type(field(), '123-456')
    await expect.element(field()).toHaveValue('123-456')
  })

  test('reports the masked value with the reason and the mask details', async () => {
    const reports: Report[] = []
    await render(
      <MaskedInput
        options={{ mask: masks.personalIdentityNumber({ country: 'SE' }) }}
        reports={reports}
      />,
    )
    await userEvent.type(field(), '199001011234')

    const { value, details } = lastReport(reports)
    expect(value).toBe('19900101-1234')
    expect(details.reason).toBe('input')
    expect(details.unmaskedValue).toBe('199001011234')
    expect(details.isComplete).toBe(true)
    expect(details.rejected).toEqual([])
    expect('isWithinRange' in details).toBe(false)
    expect(details.event.nativeEvent.type).toBe('input')
  })

  test('a refused character is not inserted and is reported in details.rejected', async () => {
    const reports: Report[] = []
    await render(<MaskedInput options={{ mask: masks.digits() }} reports={reports} />)
    await userEvent.type(field(), '12a3')

    await expect.element(field()).toHaveValue('123')
    const refused = reports.find((report) => (report.details.rejected?.length ?? 0) > 0)
    expect(refused?.details.rejected).toEqual([{ reason: 'digits', characters: 'a' }])
  })

  test('no maxlength, pattern or placeholder characters are added', async () => {
    await render(<MaskedInput options={{ mask: masks.pattern('999-999') }} />)
    await expect.element(field()).not.toHaveAttribute('maxlength')
    await expect.element(field()).not.toHaveAttribute('pattern')
    await expect.element(field()).not.toHaveAttribute('placeholder')
    await expect.element(field()).toHaveValue('')
  })

  test('works without onValueChange', async () => {
    await render(<MaskedInput options={{ mask: masks.digits({ length: 3 }) }} />)
    await userEvent.type(field(), '12345')
    await expect.element(field()).toHaveValue('123')
  })

  test('Backspace next to a literal removes a character, and the caret stays (5.6)', async () => {
    await render(<MaskedInput options={{ mask: masks.postalCode({ country: 'SE' }) }} />)
    await userEvent.type(field(), '12345')
    await expect.element(field()).toHaveValue('123 45')
    const element = field().element() as HTMLInputElement
    element.setSelectionRange(4, 4)
    await userEvent.keyboard('{Backspace}')

    await expect.element(field()).toHaveValue('124 5')
    expect(element.selectionStart).toBe(2)
  })

  test('Delete before a literal removes the next character (5.6)', async () => {
    await render(<MaskedInput options={{ mask: masks.postalCode({ country: 'SE' }) }} />)
    await userEvent.type(field(), '12345')
    const element = field().element() as HTMLInputElement
    element.setSelectionRange(3, 3)
    await userEvent.keyboard('{Delete}')

    await expect.element(field()).toHaveValue('123 5')
    expect(element.selectionStart).toBe(3)
  })

  test('the caret ends after the literal and the character typed at the end (5.6)', async () => {
    await render(<MaskedInput options={{ mask: masks.postalCode({ country: 'SE' }) }} />)
    await userEvent.type(field(), '1234')
    await expect.element(field()).toHaveValue('123 4')
    expect((field().element() as HTMLInputElement).selectionStart).toBe(5)
  })

  test('the caret stays right after a character typed in the middle (5.6)', async () => {
    await render(<MaskedInput options={{ mask: masks.postalCode({ country: 'SE' }) }} />)
    await userEvent.type(field(), '1245')
    const element = field().element() as HTMLInputElement
    element.setSelectionRange(2, 2)
    await userEvent.keyboard('3')

    await expect.element(field()).toHaveValue('123 45')
    expect(element.selectionStart).toBe(3)
  })
})

describe('paste, drop and autofill (5.3)', () => {
  test.each([
    ['19900101-1234'],
    ['19900101 1234'],
    ['199001011234'],
    ['1990 0101 1234'],
    ['1990-01-01-1234'],
  ])('%s fills the mask and ends as 19900101-1234', async (pasted) => {
    const reports: Report[] = []
    await render(
      <MaskedInput
        options={{ mask: masks.personalIdentityNumber({ country: 'SE' }) }}
        reports={reports}
      />,
    )
    await userEvent.click(field())
    await userEvent.fill(field(), pasted)

    await expect.element(field()).toHaveValue('19900101-1234')
    expect(lastReport(reports).details.isComplete).toBe(true)
    expect(lastReport(reports).details.rejected).toEqual([])
  })

  test('a paste with letters drops them and says so', async () => {
    const reports: Report[] = []
    await render(<MaskedInput options={{ mask: masks.digits() }} reports={reports} />)
    await userEvent.fill(field(), '12ab34')

    await expect.element(field()).toHaveValue('1234')
    expect(lastReport(reports).details.rejected).toEqual([{ reason: 'digits', characters: 'ab' }])
  })

  test('an autofill input event without an inputType normalises the whole value', async () => {
    const reports: Report[] = []
    await render(
      <MaskedInput
        options={{ mask: masks.personalIdentityNumber({ country: 'SE' }) }}
        reports={reports}
      />,
    )
    const element = field().element() as HTMLInputElement
    element.focus()
    setNativeValue(element, '19900101 1234')
    element.dispatchEvent(new Event('input', { bubbles: true }))

    await expect.element(field()).toHaveValue('19900101-1234')
    expect(lastReport(reports).value).toBe('19900101-1234')
  })
})

describe('write-back (5.7) and controlled values', () => {
  test('writes to the input only when the mask changed the value', async () => {
    await render(<MaskedInput options={{ mask: masks.digits() }} />)
    const valueSetter = vi.spyOn(field().element() as HTMLInputElement, 'value', 'set')

    // Plain typing that fits goes through the browser: the mask never assigns the value, so
    // the browser's undo history is kept.
    await userEvent.type(field(), '123')
    expect(valueSetter).not.toHaveBeenCalled()

    // A refused character is removed by writing the masked value back.
    await userEvent.type(field(), 'a')
    expect(valueSetter).toHaveBeenCalledWith('123')
    valueSetter.mockRestore()
  })

  test('a controlled value is rendered as given and never rewritten', async () => {
    function Controlled() {
      const [value, setValue] = useState('19900101 1234')
      const mask = useMask({
        mask: masks.personalIdentityNumber({ country: 'SE' }),
        onValueChange: setValue,
      })
      return <input aria-label="Fält" {...mask.inputProps} value={value} />
    }
    await render(<Controlled />)
    await expect.element(field()).toHaveValue('19900101 1234')
  })

  test('a controlled field follows the masked value from onValueChange', async () => {
    const reports: Report[] = []
    function Controlled() {
      const [value, setValue] = useState('')
      const mask = useMask({
        mask: masks.personalIdentityNumber({ country: 'SE' }),
        onValueChange: (next, details) => {
          reports.push({ value: next, details })
          setValue(next)
        },
      })
      return <input aria-label="Fält" {...mask.inputProps} value={value} />
    }
    await render(<Controlled />)
    await userEvent.type(field(), '199001011234')

    await expect.element(field()).toHaveValue('19900101-1234')
    await userEvent.type(field(), '5')
    await expect.element(field()).toHaveValue('19900101-1234')
  })

  test('format and unmask give the stored value in the provider’s locale', async () => {
    function Probe() {
      const mask = useMask({ mask: masks.number({ decimals: 2 }) })
      return (
        <>
          <p>formatted: {mask.format('1234.5')}</p>
          <p>unmasked: {mask.unmask('1234,5')}</p>
        </>
      )
    }
    await render(
      <KvirnProvider locale="sv">
        <Probe />
      </KvirnProvider>,
    )
    await expect.element(page.getByText('formatted: 1234,5')).toBeVisible()
    await expect.element(page.getByText('unmasked: 1234.5')).toBeVisible()
  })
})

describe('suggested attributes', () => {
  test('an identifier mask suggests inputMode, spellCheck and dir="ltr"', async () => {
    await render(
      <MaskedInput options={{ mask: masks.personalIdentityNumber({ country: 'SE' }) }} />,
    )
    await expect.element(field()).toHaveAttribute('inputmode', 'numeric')
    await expect.element(field()).toHaveAttribute('spellcheck', 'false')
    await expect.element(field()).toHaveAttribute('dir', 'ltr')
  })

  test('the Finnish number asks for upper case', async () => {
    await render(
      <MaskedInput options={{ mask: masks.personalIdentityNumber({ country: 'FI' }) }} />,
    )
    await expect.element(field()).toHaveAttribute('autocapitalize', 'characters')
  })

  test('digits suggest numeric but no dir, and the consumer’s own props win', async () => {
    await render(
      <MaskedInput
        options={{ mask: masks.digits() }}
        ownProps={{ inputMode: 'tel', spellCheck: true }}
      />,
    )
    await expect.element(field()).toHaveAttribute('inputmode', 'tel')
    await expect.element(field()).toHaveAttribute('spellcheck', 'true')
    await expect.element(field()).not.toHaveAttribute('dir')
  })

  test('never sets autocomplete', async () => {
    await render(
      <MaskedInput options={{ mask: masks.personalIdentityNumber({ country: 'SE' }) }} />,
    )
    await expect.element(field()).not.toHaveAttribute('autocomplete')
  })

  test('the consumer’s onChange still runs next to the mask’s', async () => {
    const consumerOnChange = vi.fn<(event: unknown) => void>()
    await render(
      <MaskedInput options={{ mask: masks.digits() }} ownProps={{ onChange: consumerOnChange }} />,
    )
    await userEvent.type(field(), '12')
    expect(consumerOnChange).toHaveBeenCalledTimes(2)
  })
})

describe('number masks and the provider locale', () => {
  test('sv shows a decimal comma, and the unmasked value is machine form', async () => {
    const reports: Report[] = []
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <MaskedInput options={{ mask: masks.number({ decimals: 2 }) }} reports={reports} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), '12.5')

    await expect.element(field()).toHaveValue('12,5')
    expect(lastReport(reports).details.unmaskedValue).toBe('12.5')
  })

  test('en shows a decimal point, and the same mask without a provider does too', async () => {
    await render(<MaskedInput options={{ mask: masks.number({ decimals: 2 }) }} />)
    await userEvent.type(field(), '12,5')
    await expect.element(field()).toHaveValue('12.5')
  })

  test('min and max are reported as isWithinRange and never clamped', async () => {
    const reports: Report[] = []
    await render(
      <MaskedInput options={{ mask: masks.number({ min: 10, max: 100 }) }} reports={reports} />,
    )
    await userEvent.type(field(), '1')
    expect(lastReport(reports).details.isWithinRange).toBe(false)
    await expect.element(field()).toHaveValue('1')
    await userEvent.type(field(), '5')
    expect(lastReport(reports).details.isWithinRange).toBe(true)
    await userEvent.type(field(), '00')
    expect(lastReport(reports).details.isWithinRange).toBe(false)
    await expect.element(field()).toHaveValue('1500')
  })
})

/** Types into the input the way an IME does: composition events around input events. */
function compose(element: HTMLInputElement, steps: readonly string[]): void {
  element.focus()
  element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' }))
  for (const step of steps) {
    setNativeValue(element, step)
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: step,
        isComposing: true,
      }),
    )
  }
  element.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true, data: steps.at(-1) ?? '' }),
  )
}

describe('composition (5.5)', () => {
  test('nothing is rewritten while composing, and the mask applies at compositionend', async () => {
    const reports: Report[] = []
    await render(<MaskedInput options={{ mask: masks.digits() }} reports={reports} />)
    const element = field().element() as HTMLInputElement
    element.focus()
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' }))
    setNativeValue(element, '´')
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: '´',
        isComposing: true,
      }),
    )

    // Mid-composition: the raw value stays, and it is reported without mask details.
    expect(element.value).toBe('´')
    expect(lastReport(reports).value).toBe('´')
    expect(lastReport(reports).details.unmaskedValue).toBeUndefined()

    setNativeValue(element, 'á')
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: 'á',
        isComposing: true,
      }),
    )
    expect(element.value).toBe('á')
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'á' }))

    await expect.element(field()).toHaveValue('')
    expect(lastReport(reports).value).toBe('')
    expect(lastReport(reports).details.rejected).toEqual([{ reason: 'digits', characters: 'á' }])
  })

  test('a composed character the mask accepts stays', async () => {
    const reports: Report[] = []
    await render(<MaskedInput options={{ mask: masks.letters() }} reports={reports} />)
    compose(field().element() as HTMLInputElement, ['´', 'á'])

    await expect.element(field()).toHaveValue('á')
    expect(lastReport(reports).details.unmaskedValue).toBe('á')
    expect(lastReport(reports).details.rejected).toEqual([])
  })
})

describe('announcing rejections', () => {
  const status = () => page.getByRole('status')

  test('a refused character is announced politely, in the provider language (sv, fi and en)', async () => {
    const swedish = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await expect.element(status()).toHaveTextContent('Här kan du bara skriva siffror.')
    await swedish.unmount()

    const finnish = await render(
      <KvirnProvider locale="fi" messages={fi}>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await expect.element(status()).toHaveTextContent('Tähän voi kirjoittaa vain numeroita.')
    await finnish.unmount()

    await render(
      <KvirnProvider>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await expect.element(status()).toHaveTextContent('Only digits can be entered here.')
  })

  test.each([
    ['letters', masks.letters(), '1', 'Only letters can be entered here.'],
    [
      'lettersAndDigits',
      masks.lettersAndDigits(),
      '-',
      'Only letters and digits can be entered here.',
    ],
    ['other', masks.telephone(), 'x', 'That character can’t be entered here.'],
  ] as const)('the %s variant names what the field takes', async (_name, mask, typed, text) => {
    await render(
      <KvirnProvider>
        <MaskedInput options={{ mask }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), typed)
    await expect.element(status()).toHaveTextContent(text)
  })

  test('a full mask says so, with the number of characters', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <MaskedInput options={{ mask: masks.digits({ length: 3 }) }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), '1234')
    await expect.element(field()).toHaveValue('123')
    await expect.element(status()).toHaveTextContent('Du har skrivit alla 3 tecken.')
  })

  test('holding a key announces once: the rest is throttled per field', async () => {
    await render(
      <KvirnProvider>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    const seen: string[] = []
    const observer = new MutationObserver(() => {
      const text = status().element().textContent
      if (text !== '') {
        seen.push(text)
      }
    })
    observer.observe(status().element(), { childList: true, characterData: true, subtree: true })

    await userEvent.type(field(), 'abcdef')
    await expect.element(status()).toHaveTextContent('Only digits can be entered here.')
    await new Promise((resolve) => setTimeout(resolve, 400))
    observer.disconnect()

    expect(seen).toEqual(['Only digits can be entered here.'])
  })

  test('two fields have their own throttle', async () => {
    await render(
      <KvirnProvider>
        <MaskedInput label="Första" options={{ mask: masks.digits() }} />
        <MaskedInput label="Andra" options={{ mask: masks.letters() }} />
      </KvirnProvider>,
    )
    const seen: string[] = []
    const observer = new MutationObserver(() => {
      const text = status().element().textContent
      if (text !== '') {
        seen.push(text)
      }
    })
    observer.observe(status().element(), { childList: true, characterData: true, subtree: true })

    await userEvent.type(page.getByRole('textbox', { name: 'Första' }), 'a')
    await expect.element(status()).toHaveTextContent('Only digits can be entered here.')
    await userEvent.type(page.getByRole('textbox', { name: 'Andra' }), '1')
    await expect.element(status()).toHaveTextContent('Only letters can be entered here.')
    observer.disconnect()

    expect(seen).toEqual(['Only digits can be entered here.', 'Only letters can be entered here.'])
  })

  test('announceRejections={false} turns the message off, but the details still report', async () => {
    const reports: Report[] = []
    await render(
      <KvirnProvider>
        <MaskedInput
          options={{ mask: masks.digits(), announceRejections: false }}
          reports={reports}
        />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await new Promise((resolve) => setTimeout(resolve, 300))

    await expect.element(status()).toBeEmptyDOMElement()
    expect(reports.some((report) => report.details.rejected?.length === 1)).toBe(true)
  })

  test('per-instance messages win over the provider’s', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <MaskedInput
          options={{
            mask: masks.digits(),
            messages: { characterNotAllowed: () => 'Endast siffror, tack.' },
          }}
        />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await expect.element(status()).toHaveTextContent('Endast siffror, tack.')
  })

  test('nothing is announced for accepted input', async () => {
    await render(
      <KvirnProvider>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), '123')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(status()).toBeEmptyDOMElement()
  })

  test('without a provider the mask still works, nothing is announced, and one warning is logged', async () => {
    await render(<MaskedInput options={{ mask: masks.digits() }} />)
    await userEvent.type(field(), 'a1b2')

    await expect.element(field()).toHaveValue('12')
    const announcerWarnings = consoleWarn.mock.calls.filter(([message]) =>
      String(message).includes('useAnnouncer()'),
    )
    expect(announcerWarnings).toHaveLength(1)
  })

  test('axe: no violations with the live region filled', async () => {
    const { container } = await render(
      <KvirnProvider>
        <MaskedInput options={{ mask: masks.digits() }} />
      </KvirnProvider>,
    )
    await userEvent.type(field(), 'a')
    await expect.element(status()).toHaveTextContent('Only digits can be entered here.')
    await expectNoA11yViolations(container)
  })
})
