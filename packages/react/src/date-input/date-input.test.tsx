import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Fieldset } from '../fieldset/fieldset.tsx'
import type { FieldsetRootProps } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { DateInput } from './date-input.tsx'
import type { DateInputRootProps } from './date-input.tsx'
import { useDateInput } from './use-date-input.ts'
import type {
  DateInputChangeDetails,
  DateInputInputPartProps,
  DateInputPart,
  DateInputValue,
  UseDateInputOptions,
  UseDateInputResult,
} from './use-date-input.ts'

// Contract: date-input.a11y.md. The keyboard rows are covered end to end in
// apps/storybook/src/components/date-input/date-input.e2e.ts.

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

/** The boxes' labels in DOM order: the order a user meets them. */
const boxOrder = (container: Element) =>
  [...container.querySelectorAll('label')].map((label) => label.textContent)

const inLocale = (locale: string, messages: KvirnMessages, children: ReactNode) => (
  <KvirnProvider locale={locale} messages={messages}>
    {children}
  </KvirnProvider>
)

interface BirthProps extends DateInputRootProps {
  fieldset?: Omit<FieldsetRootProps, 'children'>
}

/** The design spec's question, in Swedish: a legend, the boxes, a hint with an example, an error. */
function Birth({ fieldset, ...dateProps }: BirthProps) {
  return (
    <Fieldset.Root group required {...fieldset}>
      <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
      <DateInput.Root {...dateProps} />
      <Fieldset.Hint>Till exempel 2007 3 27</Fieldset.Hint>
      <Fieldset.ErrorMessage>Ange ditt födelsedatum</Fieldset.ErrorMessage>
    </Fieldset.Root>
  )
}

const day = () => page.getByRole('textbox', { name: 'Dag', exact: true })
const month = () => page.getByRole('textbox', { name: 'Månad', exact: true })
const year = () => page.getByRole('textbox', { name: 'År', exact: true })

describe('rendering', () => {
  test('the group is named by its legend and each box by its label', async () => {
    const { container } = await render(inLocale('sv-SE', sv, <Birth />))
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum', exact: true }))
      .toBeVisible()
    // Names without "(valfritt)": a box is a part of one question, never optional on its own.
    expect(page.getByRole('textbox').elements()).toHaveLength(3)
    await expect.element(day()).toBeVisible()
    await expect.element(month()).toBeVisible()
    await expect.element(year()).toBeVisible()
    expectNoDanglingReferences(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a box is a text input with a numeric keypad, and no maxlength, pattern or placeholder', async () => {
    await render(inLocale('sv-SE', sv, <Birth />))
    for (const box of [day(), month(), year()]) {
      await expect.element(box).toHaveAttribute('type', 'text')
      await expect.element(box).toHaveAttribute('inputmode', 'numeric')
      await expect.element(box).toHaveAttribute('spellcheck', 'false')
      await expect.element(box).not.toHaveAttribute('maxlength')
      await expect.element(box).not.toHaveAttribute('pattern')
      await expect.element(box).not.toHaveAttribute('placeholder')
      await expect.element(box).not.toHaveAttribute('autocomplete')
    }
  })

  test('forwards refs, native props and render, and the part classes join a consumer’s', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const dayRef = createRef<HTMLInputElement>()
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root group>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root ref={rootRef} className="egen" data-testid="row" lang="sv">
            <DateInput.Day ref={dayRef} className="egen-dag" data-egen="" />
            <DateInput.Month
              render={(partProps, state) => (
                <input {...partProps} data-egen={String(state.isInvalid)} />
              )}
            />
            <DateInput.Year />
          </DateInput.Root>
        </Fieldset.Root>,
      ),
    )
    const row = page.getByTestId('row').element()
    expect(rootRef.current).toBe(row)
    expect(row.classList.contains('kv-date-input')).toBe(true)
    expect(row.classList.contains('egen')).toBe(true)
    expect(dayRef.current).toBe(day().element())
    await expect.element(day()).toHaveClass('kv-input', 'egen-dag')
    await expect.element(day()).toHaveAttribute('data-egen', '')
    await expect.element(month()).toHaveAttribute('data-egen', 'false')
    // Each box is a Field with the class the theme sizes it by.
    const fields = [...row.children]
    expect(
      fields.map((field) => [...field.classList].filter((name) => name !== 'kv-field')),
    ).toEqual([['kv-date-input-day'], ['kv-date-input-month'], ['kv-date-input-year']])
    expect(fields.every((field) => field.classList.contains('kv-field'))).toBe(true)
  })

  test('a consumer’s className, onChange and onBlur merge with the hook’s', async () => {
    const onChange = vi.fn<(value: string) => void>()
    const onBlur = vi.fn<() => void>()
    const onValueChange = vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root group>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root onValueChange={onValueChange}>
            <DateInput.Day
              className="egen-dag"
              onChange={(event) => onChange(event.currentTarget.value)}
              onBlur={onBlur}
            />
          </DateInput.Root>
        </Fieldset.Root>,
      ),
    )
    await userEvent.type(day(), '2')
    await userEvent.tab()
    // Both handlers ran: the hook's reported the date, and the consumer's its own.
    expect(onValueChange.mock.calls.at(-1)?.[1].part).toBe('day')
    expect(onChange).toHaveBeenCalledWith('2')
    expect(onBlur).toHaveBeenCalledTimes(1)
    await expect.element(day()).toHaveClass('kv-input', 'egen-dag')
  })

  test('the server renders each label for its input, in the field order', () => {
    const markup = renderToString(inLocale('sv-SE', sv, <Birth name="birth" />))
    const host = document.createElement('div')
    host.innerHTML = markup
    const inputs = [...host.querySelectorAll('input')]
    expect(inputs.map((input) => input.name)).toEqual(['birth-year', 'birth-month', 'birth-day'])
    for (const input of inputs) {
      expect(host.querySelector(`label[for="${input.id}"]`)).not.toBeNull()
    }
  })
})

describe('the group’s description', () => {
  test('the hint and the error describe the group', async () => {
    const { container } = await render(
      inLocale('sv-SE', sv, <Birth fieldset={{ invalid: true }} />),
    )
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum', exact: true }))
      .toHaveAccessibleDescription('Till exempel 2007 3 27 Fel: Ange ditt födelsedatum')
    // The boxes are described by their labels only.
    for (const box of [day(), month(), year()]) {
      await expect.element(box).not.toHaveAttribute('aria-describedby')
    }
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })
})

describe('field order', () => {
  test('the order follows the locale: year first for sv-SE, day first for sv-FI, fi, nb and en', async () => {
    const cases: Array<[string, KvirnMessages, string[]]> = [
      ['sv-SE', sv, ['År', 'Månad', 'Dag']],
      ['sv', sv, ['År', 'Månad', 'Dag']],
      ['sv-FI', sv, ['Dag', 'Månad', 'År']],
      ['fi', fi, ['Päivä', 'Kuukausi', 'Vuosi']],
      ['nb', nb, ['Dag', 'Måned', 'År']],
      // Month first in Intl for en-US, but it becomes day first.
      ['en', en, ['Day', 'Month', 'Year']],
      ['en-US', en, ['Day', 'Month', 'Year']],
      ['en-GB', en, ['Day', 'Month', 'Year']],
    ]
    for (const [locale, messages, expected] of cases) {
      const { container, unmount } = await render(
        inLocale(
          locale,
          messages,
          <Fieldset.Root group>
            <Fieldset.Legend>Datum</Fieldset.Legend>
            <DateInput.Root />
          </Fieldset.Root>,
        ),
      )
      expect({ locale, order: boxOrder(container) }).toEqual({ locale, order: expected })
      await unmount()
    }
  })

  test('useDateInput exposes the order, and the order option replaces it', async () => {
    function Probe({ order }: { order?: readonly DateInputPart[] }) {
      const result: UseDateInputResult = useDateInput({ order })
      return <output data-testid="order">{result.order.join(',')}</output>
    }
    const locale = await render(inLocale('sv-SE', sv, <Probe />))
    await expect.element(page.getByTestId('order')).toHaveTextContent('year,month,day')
    await locale.unmount()
    await render(inLocale('sv-SE', sv, <Probe order={['month', 'day', 'year']} />))
    await expect.element(page.getByTestId('order')).toHaveTextContent('month,day,year')
  })

  test('children and the order option override the locale’s order', async () => {
    const { container } = await render(
      inLocale(
        'sv-SE',
        sv,
        <>
          <Fieldset.Root group>
            <Fieldset.Legend>Eget</Fieldset.Legend>
            <DateInput.Root>
              <DateInput.Day />
              <DateInput.Month />
              <DateInput.Year />
            </DateInput.Root>
          </Fieldset.Root>
          <Fieldset.Root group>
            <Fieldset.Legend>Valt</Fieldset.Legend>
            <DateInput.Root order={['month', 'year', 'day']} />
          </Fieldset.Root>
        </>,
      ),
    )
    const groups = [...container.querySelectorAll('fieldset')]
    expect(groups.map((group) => boxOrder(group))).toEqual([
      ['Dag', 'Månad', 'År'],
      ['Månad', 'År', 'Dag'],
    ])
  })
})

describe('invalid', () => {
  test('only the invalid boxes are marked invalid, and the group’s invalid marks none', async () => {
    const { container } = await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root group invalid>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root>
            <DateInput.Year invalid />
            <DateInput.Month />
            <DateInput.Day />
          </DateInput.Root>
          <Fieldset.ErrorMessage>Födelsedatumet måste innehålla ett år</Fieldset.ErrorMessage>
        </Fieldset.Root>,
      ),
    )
    await expect.element(year()).toHaveAttribute('aria-invalid', 'true')
    await expect.element(year()).toHaveAttribute('data-invalid', '')
    await expect.element(month()).not.toHaveAttribute('aria-invalid')
    await expect.element(month()).not.toHaveAttribute('data-invalid')
    await expect.element(day()).not.toHaveAttribute('aria-invalid')
    expect(container.querySelectorAll('label[data-invalid]')).toHaveLength(1)
    expect(container.querySelector('label[data-invalid]')?.textContent).toBe('År')
    await expectNoA11yViolations(container)
    // An invalid box expects no ErrorMessage of its own: the date has one, the Fieldset's.
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('invalidParts marks the boxes the Root renders itself', async () => {
    await render(
      inLocale('sv-SE', sv, <Birth fieldset={{ invalid: true }} invalidParts={['day', 'month']} />),
    )
    await expect.element(day()).toHaveAttribute('aria-invalid', 'true')
    await expect.element(month()).toHaveAttribute('aria-invalid', 'true')
    await expect.element(year()).not.toHaveAttribute('aria-invalid')
  })
})

describe('name, value and autocomplete', () => {
  test('name is a prefix for the three inputs, and a box’s own name wins', async () => {
    let submitted: FormData | undefined
    await render(
      inLocale(
        'sv-SE',
        sv,
        <form
          aria-label="Ansökan"
          onSubmit={(event) => {
            event.preventDefault()
            submitted = new FormData(event.currentTarget)
          }}
        >
          <Fieldset.Root group>
            <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
            <DateInput.Root name="birth">
              <DateInput.Day />
              <DateInput.Month name="mån" />
              <DateInput.Year />
            </DateInput.Root>
          </Fieldset.Root>
          <button type="submit">Skicka</button>
        </form>,
      ),
    )
    await expect.element(day()).toHaveAttribute('name', 'birth-day')
    await expect.element(month()).toHaveAttribute('name', 'mån')
    await expect.element(year()).toHaveAttribute('name', 'birth-year')
    await userEvent.type(day(), '27')
    await userEvent.type(month(), '3')
    await userEvent.type(year(), '2007')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(Object.fromEntries(submitted?.entries() ?? [])).toEqual({
      'birth-day': '27',
      mån: '3',
      'birth-year': '2007',
    })
  })

  test('controlled: value sets the boxes and a change reports the whole date', async () => {
    const onValueChange = vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()
    function Controlled() {
      const [value, setValue] = useState<DateInputValue>({ year: '2007', month: '3', day: '' })
      return (
        <Birth
          value={value}
          onValueChange={(next, details) => {
            onValueChange(next, details)
            setValue(next)
          }}
        />
      )
    }
    await render(inLocale('sv-SE', sv, <Controlled />))
    await expect.element(year()).toHaveValue('2007')
    await expect.element(month()).toHaveValue('3')
    await expect.element(day()).toHaveValue('')
    await userEvent.type(day(), '27')
    const [value, details] = onValueChange.mock.calls.at(-1) ?? []
    expect(value).toEqual({ year: '2007', month: '3', day: '27' })
    expect(details?.reason).toBe('input')
    expect(details?.part).toBe('day')
    expect(details?.event.type).toBe('change')
    await expect.element(day()).toHaveValue('27')
  })

  test('controlled: a parent that doesn’t update leaves the boxes as they were', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Birth
          value={{ year: '', month: '', day: '' }}
          onValueChange={vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()}
        />,
      ),
    )
    await userEvent.type(year(), '2007')
    await expect.element(year()).toHaveValue('')
  })

  test('uncontrolled: defaultValue and onValueChange', async () => {
    const onValueChange = vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Birth defaultValue={{ year: '1990' }} onValueChange={onValueChange} />,
      ),
    )
    await expect.element(year()).toHaveValue('1990')
    await expect.element(month()).toHaveValue('')
    await userEvent.type(month(), '3')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual({ year: '1990', month: '3', day: '' })
    await userEvent.type(day(), '27')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual({ year: '1990', month: '3', day: '27' })
    expect(onValueChange.mock.calls.at(-1)?.[1].part).toBe('day')
  })

  test('the value is the typed text: nothing is parsed or padded', async () => {
    const onValueChange = vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()
    await render(inLocale('sv-SE', sv, <Birth onValueChange={onValueChange} />))
    await userEvent.type(day(), '007')
    await userEvent.type(month(), '13')
    await userEvent.type(year(), 'tjugo')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual({
      year: 'tjugo',
      month: '13',
      day: '007',
    })
  })

  test('autoComplete bday sets the three tokens', async () => {
    await render(inLocale('sv-SE', sv, <Birth autoComplete="bday" />))
    await expect.element(day()).toHaveAttribute('autocomplete', 'bday-day')
    await expect.element(month()).toHaveAttribute('autocomplete', 'bday-month')
    await expect.element(year()).toHaveAttribute('autocomplete', 'bday-year')
  })

  test('readOnly makes the three boxes read-only', async () => {
    await render(inLocale('sv-SE', sv, <Birth readOnly defaultValue={{ day: '27' }} />))
    for (const box of [day(), month(), year()]) {
      await expect.element(box).toHaveAttribute('readonly')
    }
  })
})

describe('required and disabled', () => {
  test('required and disabled come from the Fieldset', async () => {
    await render(inLocale('sv-SE', sv, <Birth fieldset={{ required: true, disabled: true }} />))
    for (const box of [day(), month(), year()]) {
      await expect.element(box).toHaveAttribute('aria-required', 'true')
      await expect.element(box).toBeDisabled()
      await expect.element(box).toHaveAttribute('data-disabled', '')
    }
  })

  test('the Root’s own required and disabled win over the Fieldset’s', async () => {
    await render(
      inLocale('sv-SE', sv, <Birth fieldset={{ required: true }} required={false} disabled />),
    )
    await expect.element(day()).not.toHaveAttribute('aria-required')
    await expect.element(day()).toBeDisabled()
  })
})

describe('strings', () => {
  test('the labels follow the provider’s locale and the instance messages', async () => {
    const { container } = await render(
      inLocale(
        'en-GB',
        en,
        <>
          <Fieldset.Root group>
            <Fieldset.Legend>Date</Fieldset.Legend>
            <DateInput.Root />
          </Fieldset.Root>
          <Fieldset.Root group>
            <Fieldset.Legend>Datum</Fieldset.Legend>
            <DateInput.Root messages={{ day: 'D', month: 'M', year: 'Y' }} />
          </Fieldset.Root>
        </>,
      ),
    )
    const groups = [...container.querySelectorAll('fieldset')]
    expect(groups.map((group) => boxOrder(group))).toEqual([
      ['Day', 'Month', 'Year'],
      ['D', 'M', 'Y'],
    ])
  })

  test('without a provider the built-in English labels show', async () => {
    const { container } = await render(
      <Fieldset.Root group>
        <Fieldset.Legend>Date</Fieldset.Legend>
        <DateInput.Root />
      </Fieldset.Root>,
    )
    expect(boxOrder(container)).toEqual(['Day', 'Month', 'Year'])
  })
})

describe('accessibility', () => {
  test('has no axe violations in every state', async () => {
    const { container } = await render(
      inLocale(
        'sv-SE',
        sv,
        <>
          <Birth name="a" autoComplete="bday" />
          <Birth name="b" fieldset={{ invalid: true, required: true }} invalidParts={['year']} />
          <Birth name="c" fieldset={{ disabled: true }} defaultValue={{ day: '27' }} />
          <Birth name="d" readOnly defaultValue={{ day: '27', month: '3', year: '2007' }} />
        </>,
      ),
    )
    await expectNoA11yViolations(container)
    expectNoDanglingReferences(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('dev warnings', () => {
  test('warns when the Root is outside a group, and when a box is outside a Root', async () => {
    await render(
      <>
        <DateInput.Root />
        <DateInput.Day />
      </>,
    )
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('not inside a group'))).toBe(true)
    expect(messages.some((message) => message.includes('outside a DateInput.Root'))).toBe(true)
  })

  test('warns when the Fieldset is neither group nor required, and not when it is either', async () => {
    await render(
      <Fieldset.Root>
        <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
        <DateInput.Root />
      </Fieldset.Root>,
    )
    expect(
      consoleWarn.mock.calls.some(([message]) => String(message).includes('neither `group`')),
    ).toBe(true)
    consoleWarn.mockClear()
    resetDevWarnings()
    await render(
      <>
        <Fieldset.Root group>
          <Fieldset.Legend>Ett</Fieldset.Legend>
          <DateInput.Root />
        </Fieldset.Root>
        <Fieldset.Root required>
          <Fieldset.Legend>Två</Fieldset.Legend>
          <DateInput.Root />
        </Fieldset.Root>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an optional date carries “(valfritt)” on its legend, never on a box', async () => {
    const { container } = await render(
      inLocale('sv-SE', sv, <Birth fieldset={{ required: false }} />),
    )
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum (valfritt)', exact: true }))
      .toBeVisible()
    expect(boxOrder(container)).toEqual(['År', 'Månad', 'Dag'])
  })

  test('a Fieldset that is neither group nor required still keeps “(valfritt)” off the boxes', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root />
        </Fieldset.Root>,
      ),
    )
    // The Root's own FieldGroupContext: the boxes are never optional on their own. The dev warning
    // for the missing `group` is expected here and is spied on in beforeEach.
    await expect.element(day()).toBeVisible()
    await expect.element(month()).toBeVisible()
    await expect.element(year()).toBeVisible()
    expect(page.getByRole('textbox').elements()).toHaveLength(3)
  })

  test('a native fieldset of your own counts as a group', async () => {
    await render(
      <fieldset>
        <legend>Födelsedatum</legend>
        <DateInput.Root />
      </fieldset>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('types', () => {
  test('the hook’s options and results are typed', () => {
    expectTypeOf<UseDateInputOptions['autoComplete']>().toEqualTypeOf<'bday' | undefined>()
    expectTypeOf<UseDateInputResult['order']>().toEqualTypeOf<readonly DateInputPart[]>()
    expectTypeOf<ReturnType<UseDateInputResult['getBoxProps']>>().toHaveProperty('className')
    expectTypeOf<DateInputInputPartProps['inputMode']>().toEqualTypeOf<'numeric'>()
  })
})
