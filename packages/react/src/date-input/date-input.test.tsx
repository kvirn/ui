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

// Contract: date-input.a11y.md.

/** `dateInput.autoAdvanceHint` in the two locales the tests use. */
const svHint = sv.dateInput.autoAdvanceHint
const enHint = en.dateInput.autoAdvanceHint

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

/** The design spec's question, in Swedish: a legend, the boxes, a help text with an example, an error. */
function Birth({ fieldset, ...dateProps }: BirthProps) {
  return (
    <Fieldset.Root group required {...fieldset}>
      <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
      <DateInput.Root {...dateProps} />
      <Fieldset.HelpText>Till exempel 2007 3 27</Fieldset.HelpText>
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

  test('forwards refs and native props, and the part classes join a consumer’s', async () => {
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
            <DateInput.Month data-egen="false" />
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
    // The auto-advance hint comes first: it sits right under the boxes, before the consumer's.
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum', exact: true }))
      .toHaveAccessibleDescription(`${svHint} Till exempel 2007 3 27 Fel: Ange ditt födelsedatum`)
    // The boxes are described by their labels only.
    for (const box of [day(), month(), year()]) {
      await expect.element(box).not.toHaveAttribute('aria-describedby')
    }
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('the hint is visible, and autoAdvance={false} takes it out of the description', async () => {
    const { container } = await render(inLocale('sv-SE', sv, <Birth autoAdvance={false} />))
    await expect
      .element(page.getByRole('group', { name: 'Födelsedatum', exact: true }))
      .toHaveAccessibleDescription('Till exempel 2007 3 27')
    expect(page.getByText(svHint).elements()).toHaveLength(0)
    expectNoDanglingReferences(container)
    await expectNoA11yViolations(container)
  })

  test('the hint is visible text, in the group’s description, in sv and en', async () => {
    const swedish = await render(inLocale('sv-SE', sv, <Birth />))
    await expect.element(page.getByText(svHint)).toBeVisible()
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription(new RegExp(`^${svHint}`))
    await swedish.unmount()
    await render(
      inLocale(
        'en-GB',
        en,
        <Fieldset.Root group>
          <Fieldset.Legend>Date of birth</Fieldset.Legend>
          <DateInput.Root />
        </Fieldset.Root>,
      ),
    )
    await expect.element(page.getByText(enHint)).toBeVisible()
    await expect.element(page.getByRole('group')).toHaveAccessibleDescription(enHint)
  })

  test('the instance’s messages replace the hint, and the hint needs no Fieldset hint', async () => {
    await render(
      inLocale(
        'en-GB',
        en,
        <Fieldset.Root group>
          <Fieldset.Legend>Date of birth</Fieldset.Legend>
          <DateInput.Root
            messages={{ autoAdvanceHint: 'Typing a full box jumps to the next one.' }}
          />
        </Fieldset.Root>,
      ),
    )
    await expect
      .element(page.getByRole('group'))
      .toHaveAccessibleDescription('Typing a full box jumps to the next one.')
    expect(consoleWarn).not.toHaveBeenCalled()
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

/**
 * Fires what a browser fires for text that did not come from a key: `beforeinput`, then `input`,
 * with the given input type (`insertFromPaste`, `insertFromDrop`, `insertReplacementText` for
 * autofill, `deleteContentBackward`). The value is set the way a user agent sets it.
 */
function changeBox(box: HTMLInputElement, text: string, inputType: string) {
  box.focus()
  box.dispatchEvent(
    new InputEvent('beforeinput', { inputType, data: text, bubbles: true, cancelable: true }),
  )
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(box, text)
  box.dispatchEvent(new InputEvent('input', { inputType, data: text, bubbles: true }))
}

const selectedText = (box: HTMLInputElement) =>
  box.value.slice(box.selectionStart ?? 0, box.selectionEnd ?? 0)

describe('auto-advance', () => {
  test('typing the last digit of a box moves focus to the next box: year, month, day for sv-SE, and never from the last', async () => {
    await render(inLocale('sv-SE', sv, <Birth />))
    await userEvent.type(year(), '199')
    await expect.element(year()).toHaveFocus()
    await userEvent.keyboard('0')
    await expect.element(month()).toHaveFocus()
    await userEvent.keyboard('1')
    await expect.element(month()).toHaveFocus()
    await userEvent.keyboard('2')
    await expect.element(day()).toHaveFocus()
    // The last box: full, and focus stays.
    await userEvent.keyboard('27')
    await expect.element(day()).toHaveFocus()
    await expect.element(year()).toHaveValue('1990')
    await expect.element(month()).toHaveValue('12')
    await expect.element(day()).toHaveValue('27')
  })

  test('it follows the order of the boxes: day, month, year, and month, day, year', async () => {
    const dayFirst = await render(inLocale('fi', fi, <Birth />))
    await userEvent.type(page.getByRole('textbox', { name: 'Päivä', exact: true }), '27')
    await expect.element(page.getByRole('textbox', { name: 'Kuukausi', exact: true })).toHaveFocus()
    await userEvent.keyboard('03')
    await expect.element(page.getByRole('textbox', { name: 'Vuosi', exact: true })).toHaveFocus()
    await dayFirst.unmount()

    await render(inLocale('en-GB', en, <Birth order={['month', 'day', 'year']} />))
    const box = (name: string) => page.getByRole('textbox', { name, exact: true })
    await userEvent.type(box('Month'), '12')
    await expect.element(box('Day')).toHaveFocus()
    await userEvent.keyboard('27')
    await expect.element(box('Year')).toHaveFocus()
  })

  test('your own order of children is the order it follows, not the locale’s', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root group>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root>
            <DateInput.Day />
            <DateInput.Month />
            <DateInput.Year />
          </DateInput.Root>
        </Fieldset.Root>,
      ),
    )
    await userEvent.type(day(), '27')
    await expect.element(month()).toHaveFocus()
    await userEvent.keyboard('03')
    await expect.element(year()).toHaveFocus()
  })

  test('right to left: it still follows the DOM order', async () => {
    await render(
      <div dir="rtl">{inLocale('en-GB', en, <Birth order={['day', 'month', 'year']} />)}</div>,
    )
    await userEvent.type(page.getByRole('textbox', { name: 'Day', exact: true }), '27')
    await expect.element(page.getByRole('textbox', { name: 'Month', exact: true })).toHaveFocus()
  })

  test('a box that is not full, and text that is not digits, never advance', async () => {
    await render(inLocale('sv-SE', sv, <Birth />))
    await userEvent.type(year(), '199')
    await expect.element(year()).toHaveFocus()
    await userEvent.clear(year())
    // Four characters that are not digits: nothing is filtered, and focus stays.
    await userEvent.type(year(), 'tjug')
    await expect.element(year()).toHaveFocus()
    await expect.element(year()).toHaveValue('tjug')
    await expect.element(month()).toHaveValue('')
  })

  test('an edit of a box that was already full never advances', async () => {
    await render(
      inLocale('sv-SE', sv, <Birth defaultValue={{ year: '1990', month: '12', day: '27' }} />),
    )
    // More digits than the box takes are refused: nothing changes and nothing advances.
    await userEvent.click(year())
    await userEvent.keyboard('{End}1')
    await expect.element(year()).toHaveFocus()
    await expect.element(year()).toHaveValue('1990')
    // Replacing one character of a full box leaves it full: no advance.
    await userEvent.click(month())
    await userEvent.keyboard('{End}{Shift>}{ArrowLeft}{/Shift}3')
    await expect.element(month()).toHaveValue('13')
    await expect.element(month()).toHaveFocus()
  })

  test('a box takes only its own number of digits when typed in, and a paste is never cut', async () => {
    await render(inLocale('sv-SE', sv, <Birth />))
    await userEvent.type(day(), '2789')
    await expect.element(day()).toHaveValue('27')
    await userEvent.type(month(), '123')
    await expect.element(month()).toHaveValue('12')
    changeBox(year().element() as HTMLInputElement, '19901', 'insertFromPaste')
    await expect.element(year()).toHaveValue('19901')
  })

  test('paste, drop, autofill and deletion never advance', async () => {
    await render(inLocale('sv-SE', sv, <Birth />))
    const yearBox = year().element() as HTMLInputElement
    const monthBox = month().element() as HTMLInputElement
    for (const inputType of ['insertFromPaste', 'insertFromDrop', 'insertReplacementText']) {
      changeBox(yearBox, '1990', inputType)
      await expect.element(year()).toHaveValue('1990')
      await expect.element(year()).toHaveFocus()
    }
    // Deleting down to a full box, or to nothing, moves nothing.
    changeBox(monthBox, '12', 'deleteContentBackward')
    await expect.element(month()).toHaveFocus()
    // An input event that no `beforeinput` announced, such as some autofill: no advance either.
    yearBox.focus()
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(yearBox, '2007')
    yearBox.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await expect.element(year()).toHaveFocus()
  })

  test('Backspace and Delete never move focus, not even in an empty box', async () => {
    await render(inLocale('sv-SE', sv, <Birth defaultValue={{ day: '7' }} />))
    await userEvent.click(month())
    await userEvent.keyboard('{Backspace}')
    await expect.element(month()).toHaveFocus()
    await userEvent.keyboard('{Delete}')
    await expect.element(month()).toHaveFocus()
    await userEvent.click(day())
    await userEvent.keyboard('{Backspace}{Backspace}')
    await expect.element(day()).toHaveFocus()
    await expect.element(day()).toHaveValue('')
  })

  test('a value that changes from outside never moves focus', async () => {
    const empty: DateInputValue = { year: '', month: '', day: '' }
    const onValueChange = vi.fn<(value: DateInputValue, details: DateInputChangeDetails) => void>()
    const screen = await render(
      inLocale('sv-SE', sv, <Birth value={empty} onValueChange={onValueChange} />),
    )
    year().element().focus()
    await screen.rerender(
      inLocale(
        'sv-SE',
        sv,
        <Birth value={{ year: '1990', month: '12', day: '27' }} onValueChange={onValueChange} />,
      ),
    )
    await expect.element(year()).toHaveValue('1990')
    await expect.element(year()).toHaveFocus()
  })

  test('moving focus selects the whole next box, so typing replaces a prefilled value', async () => {
    await render(inLocale('sv-SE', sv, <Birth defaultValue={{ month: '12', day: '27' }} />))
    await userEvent.type(year(), '1990')
    await expect.element(month()).toHaveFocus()
    expect(selectedText(month().element() as HTMLInputElement)).toBe('12')
    await userEvent.keyboard('5')
    await expect.element(month()).toHaveValue('5')
  })

  test('a disabled next box keeps focus where it is', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Fieldset.Root group>
          <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
          <DateInput.Root>
            <DateInput.Year />
            <DateInput.Month disabled />
            <DateInput.Day />
          </DateInput.Root>
        </Fieldset.Root>,
      ),
    )
    await userEvent.type(year(), '1990')
    await expect.element(year()).toHaveFocus()
  })

  test('autoAdvance={false}: typing never moves focus, and the hint is gone', async () => {
    await render(inLocale('sv-SE', sv, <Birth autoAdvance={false} />))
    await userEvent.type(year(), '1990')
    await expect.element(year()).toHaveFocus()
    await userEvent.keyboard('12')
    await expect.element(year()).toHaveFocus()
    // Typing stops at the box's four digits: the extra keys are refused, and nothing moves.
    await expect.element(year()).toHaveValue('1990')
    await expect.element(month()).toHaveValue('')
  })

  test('the hook alone: getInputProps moves focus, and autoAdvanceHint is the message while it is on', async () => {
    function Probe({ autoAdvance }: { autoAdvance?: boolean }) {
      const dateInput = useDateInput({ order: ['month', 'day'], autoAdvance })
      return (
        <form>
          {(['month', 'day'] as const).map((part) => (
            <input key={part} aria-label={part} {...dateInput.getInputProps(part)} />
          ))}
          <output data-testid="hint">{dateInput.autoAdvanceHint ?? 'none'}</output>
        </form>
      )
    }
    const on = await render(inLocale('en-GB', en, <Probe />))
    await expect.element(page.getByTestId('hint')).toHaveTextContent(enHint)
    await userEvent.type(page.getByRole('textbox', { name: 'month' }), '12')
    await expect.element(page.getByRole('textbox', { name: 'day' })).toHaveFocus()
    await on.unmount()
    await render(inLocale('en-GB', en, <Probe autoAdvance={false} />))
    await expect.element(page.getByTestId('hint')).toHaveTextContent('none')
    await userEvent.type(page.getByRole('textbox', { name: 'month' }), '12')
    await expect.element(page.getByRole('textbox', { name: 'month' })).toHaveFocus()
  })
})

describe('keyboard', () => {
  const Around = ({ children }: { children: ReactNode }) => (
    <>
      <button type="button">Tillbaka</button>
      {children}
      <button type="button">Skicka</button>
    </>
  )
  const before = () => page.getByRole('button', { name: 'Tillbaka' })
  const after = () => page.getByRole('button', { name: 'Skicka' })

  test('Tab enters the date at the first box of the field order', async () => {
    const swedish = await render(
      inLocale(
        'sv-SE',
        sv,
        <Around>
          <Birth />
        </Around>,
      ),
    )
    await userEvent.tab()
    await expect.element(before()).toHaveFocus()
    await userEvent.tab()
    await expect.element(year()).toHaveFocus()
    await swedish.unmount()

    await render(
      inLocale(
        'sv-FI',
        sv,
        <Around>
          <Birth />
        </Around>,
      ),
    )
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(day()).toHaveFocus()
  })

  test('Tab moves from box to box in the field order and leaves after the last', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Around>
          <Birth />
        </Around>,
      ),
    )
    before().element().focus()
    for (const box of [year, month, day]) {
      await userEvent.tab()
      await expect.element(box()).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(after()).toHaveFocus()
  })

  test('Shift+Tab moves back through the boxes and leaves before the first', async () => {
    await render(
      inLocale(
        'sv-SE',
        sv,
        <Around>
          <Birth />
        </Around>,
      ),
    )
    after().element().focus()
    for (const box of [day, month, year]) {
      await userEvent.tab({ shift: true })
      await expect.element(box()).toHaveFocus()
    }
    await userEvent.tab({ shift: true })
    await expect.element(before()).toHaveFocus()
  })

  test('ArrowUp and ArrowDown never step the value', async () => {
    await render(inLocale('sv-SE', sv, <Birth defaultValue={{ day: '27' }} />))
    await userEvent.click(day())
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}')
    await expect.element(day()).toHaveValue('27')
    await expect.element(day()).toHaveFocus()
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and never leave the box', async () => {
    await render(inLocale('sv-SE', sv, <Birth defaultValue={{ day: '27' }} />))
    const dayBox = day().element() as HTMLInputElement
    await userEvent.click(day())
    await userEvent.keyboard('{Home}')
    expect(dayBox.selectionStart).toBe(0)
    await userEvent.keyboard('{ArrowRight}')
    expect(dayBox.selectionStart).toBe(1)
    await userEvent.keyboard('{End}')
    expect(dayBox.selectionStart).toBe(2)
    await userEvent.keyboard('{ArrowLeft}')
    expect(dayBox.selectionStart).toBe(1)
    await userEvent.keyboard('{End}{ArrowRight}')
    await expect.element(day()).toHaveFocus()
    await expect.element(month()).not.toHaveFocus()
  })

  test('Enter in a box submits the form', async () => {
    const onSubmit = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    )
    await render(
      inLocale(
        'sv-SE',
        sv,
        <form onSubmit={onSubmit}>
          <Birth />
          <button type="submit">Skicka</button>
        </form>,
      ),
    )
    await userEvent.type(day(), '27')
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  test('right to left: Tab follows the DOM order and the arrow keys stay in the box', async () => {
    await render(
      <div dir="rtl">{inLocale('en-GB', en, <Birth order={['day', 'month', 'year']} />)}</div>,
    )
    const box = (name: string) => page.getByRole('textbox', { name, exact: true })
    await userEvent.tab()
    await expect.element(box('Day')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}{ArrowRight}{ArrowLeft}')
    await expect.element(box('Day')).toHaveFocus()
    await userEvent.tab()
    await expect.element(box('Month')).toHaveFocus()
    await userEvent.tab()
    await expect.element(box('Year')).toHaveFocus()
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
    await userEvent.type(day(), '07')
    await userEvent.type(month(), '13')
    await userEvent.type(year(), 'tjug')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual({
      year: 'tjug',
      month: '13',
      day: '07',
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
    expectTypeOf<UseDateInputOptions['autoAdvance']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UseDateInputResult['autoAdvanceHint']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<UseDateInputResult['order']>().toEqualTypeOf<readonly DateInputPart[]>()
    expectTypeOf<ReturnType<UseDateInputResult['getBoxProps']>>().toHaveProperty('className')
    expectTypeOf<DateInputInputPartProps['inputMode']>().toEqualTypeOf<'numeric'>()
  })
})
