import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { DateInput } from '../date-input/date-input.tsx'
import type { DateInputValue } from '../date-input/use-date-input.ts'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { masks } from '@kvirn-ui/core'
import {
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  isoDateToMaskedDate,
  maskedDateToIsoDate,
} from './date-bridge.ts'
import { DatePicker } from './date-picker.tsx'
import type { DatePickerRootProps } from './date-picker.tsx'

// Contract: date-picker.a11y.md. The grid's own keys are proved in calendar.test.tsx; these tests
// prove the dialog around it: opening, choosing, closing, focus, the bridge and the announcement.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const emptyDate: DateInputValue = { year: '', month: '', day: '' }

function Example({
  initial = emptyDate,
  isTriggerRemovedOnSelect = false,
  ...props
}: Partial<DatePickerRootProps> & {
  initial?: DateInputValue
  isTriggerRemovedOnSelect?: boolean
}) {
  const [date, setDate] = useState(initial)
  const [hasTrigger, setHasTrigger] = useState(true)
  return (
    <KvirnProvider locale="sv" messages={sv}>
      <DatePicker.Root
        today="2026-10-14"
        {...props}
        value={dateInputValueToIsoDate(date)}
        onValueChange={(isoDate) => {
          setDate(isoDateToDateInputValue(isoDate))
          props.onValueChange?.(isoDate)
          if (isTriggerRemovedOnSelect) {
            setHasTrigger(false)
          }
        }}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>Datum för besöket</Fieldset.Legend>
          <DateInput.Root name="visit" value={date} onValueChange={setDate}>
            <DateInput.Year />
            <DateInput.Month />
            <DateInput.Day />
            {hasTrigger ? <DatePicker.Trigger /> : null}
          </DateInput.Root>
        </Fieldset.Root>
        <DatePicker.Popup />
      </DatePicker.Root>
    </KvirnProvider>
  )
}

const trigger = () => page.getByRole('button', { name: 'Välj datum', exact: true })
const dialog = () => page.getByRole('dialog', { name: 'Välj ett datum' })
const day = (name: string) => page.getByRole('gridcell', { name, exact: true })
const button = (name: string) => page.getByRole('button', { name, exact: true })
const box = (name: string) => page.getByRole('textbox', { name, exact: true })
const politeRegion = () => page.getByRole('status')
const focusedDayName = () =>
  document.querySelector('dialog [role="gridcell"][tabindex="0"]')?.getAttribute('aria-label')
const boxValues = () => ({
  year: (box('År').element() as HTMLInputElement).value,
  month: (box('Månad').element() as HTMLInputElement).value,
  day: (box('Dag').element() as HTMLInputElement).value,
})

const expectClosed = async () =>
  await expect.poll(() => (document.querySelector('dialog') as HTMLDialogElement).open).toBe(false)

const open = async () => {
  trigger().element().focus()
  await userEvent.keyboard('{Enter}')
  await expect.element(dialog()).toBeVisible()
}

describe('roles, names and states', () => {
  test('the trigger is a button named by its visible text, with a hidden icon, aria-haspopup and aria-expanded false', async () => {
    await render(<Example />)
    const element = trigger().element()
    expect(element.tagName).toBe('BUTTON')
    expect(element.getAttribute('type')).toBe('button')
    expect(element.getAttribute('aria-haspopup')).toBe('dialog')
    expect(element.getAttribute('aria-expanded')).toBe('false')
    expect(element.textContent).toBe('Välj datum')
    expect(element.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('opening makes aria-expanded true and shows a modal dialog named by its h2 title', async () => {
    await render(<Example />)
    await open()
    expect(trigger().element().getAttribute('aria-expanded')).toBe('true')
    const popup = dialog().element() as HTMLDialogElement
    expect(popup.matches(':modal')).toBe(true)
    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent('Välj ett datum')
    await expect.element(page.getByRole('grid')).toBeVisible()
  })

  test('the title can be replaced with the question', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <DatePicker.Root today="2026-10-14">
          <DatePicker.Trigger />
          <DatePicker.Popup>
            <DatePicker.Title>Välj dag för ditt besök</DatePicker.Title>
            <DatePicker.Calendar />
          </DatePicker.Popup>
        </DatePicker.Root>
      </KvirnProvider>,
    )
    await page.getByRole('button', { name: 'Välj datum' }).click()
    await expect
      .element(page.getByRole('dialog', { name: 'Välj dag för ditt besök' }))
      .toBeVisible()
  })

  test('the grid is only mounted while the dialog is open', async () => {
    await render(<Example />)
    expect(document.querySelector('[role="grid"]')).toBeNull()
    await open()
    expect(document.querySelector('[role="grid"]')).not.toBeNull()
  })

  test('per-instance messages rename the trigger and the title', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <DatePicker.Root messages={{ trigger: 'Boka dag', title: 'Boka en dag' }}>
          <DatePicker.Trigger />
          <DatePicker.Popup />
        </DatePicker.Root>
      </KvirnProvider>,
    )
    await page.getByRole('button', { name: 'Boka dag', exact: true }).click()
    await expect.element(page.getByRole('dialog', { name: 'Boka en dag' })).toBeVisible()
  })

  test.each([
    ['en', en, 'Choose date', 'Choose a date'],
    ['sv', sv, 'Välj datum', 'Välj ett datum'],
    ['nb', nb, 'Velg dato', 'Velg en dato'],
    ['nn', nn, 'Vel dato', 'Vel ein dato'],
    ['fi', fi, 'Valitse päivämäärä', 'Valitse päivämäärä'],
    ['se', se, 'Choose date', 'Choose a date'],
  ] as const)(
    'the %s catalog names the trigger and the dialog',
    async (locale, messages, triggerName, title) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <DatePicker.Root>
            <DatePicker.Trigger />
            <DatePicker.Popup />
          </DatePicker.Root>
        </KvirnProvider>,
      )
      await page.getByRole('button', { name: triggerName, exact: true }).click()
      await expect.element(page.getByRole('dialog', { name: title })).toBeVisible()
    },
  )

  test('has no axe violations closed and open', async () => {
    const { container } = await render(
      <Example initial={{ year: '2026', month: '10', day: '20' }} />,
    )
    await expectNoA11yViolations(container)
    await open()
    await expectNoA11yViolations(document.body)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('keyboard', () => {
  test('Tab moves from the last box to the trigger', async () => {
    await render(<Example />)
    box('Dag').element().focus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
  })

  test('Shift+Tab moves from the trigger back to the last box', async () => {
    await render(<Example />)
    trigger().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(box('Dag')).toHaveFocus()
  })

  test('Enter on the trigger opens the dialog with focus on today when the field is empty', async () => {
    await render(<Example />)
    await open()
    await expect.element(day('onsdag 14 oktober 2026, idag')).toHaveFocus()
  })

  test('Space on the trigger opens the dialog', async () => {
    await render(<Example />)
    trigger().element().focus()
    await userEvent.keyboard(' ')
    await expect.element(dialog()).toBeVisible()
    await expect.element(day('onsdag 14 oktober 2026, idag')).toHaveFocus()
  })

  test('the dialog opens on the typed date when the field holds a real date', async () => {
    await render(<Example initial={{ year: '2026', month: '10', day: '20' }} />)
    await open()
    await expect.element(day('tisdag 20 oktober 2026')).toHaveFocus()
    await expect.element(day('tisdag 20 oktober 2026')).toHaveAttribute('aria-selected', 'true')
  })

  test.each([
    ['a partial date', { year: '2026', month: '10', day: '' }],
    ['a date that does not exist', { year: '2026', month: '2', day: '31' }],
    ['a year of two digits', { year: '26', month: '10', day: '20' }],
  ])('the dialog opens on today for %s, with no error from the picker', async (_name, initial) => {
    await render(<Example initial={initial} />)
    await open()
    await expect.element(day('onsdag 14 oktober 2026, idag')).toHaveFocus()
    expect(document.querySelector('[aria-selected]')).toBeNull()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a typed date outside the range opens inside it', async () => {
    await render(
      <Example
        initial={{ year: '2027', month: '3', day: '1' }}
        minimum="2026-10-01"
        maximum="2026-12-31"
      />,
    )
    await open()
    expect(focusedDayName()).toBe('torsdag 31 december 2026')
  })

  test('the dialog reopens on a date typed since it closed', async () => {
    await render(<Example />)
    await open()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger()).toHaveFocus()
    await box('År').fill('2026')
    await box('Månad').fill('11')
    await box('Dag').fill('3')
    await open()
    await expect.element(day('tisdag 3 november 2026')).toHaveFocus()
  })

  test('Shift+Tab from the day goes through the month buttons to Close, and Tab goes back', async () => {
    await render(<Example />)
    await open()
    await userEvent.tab({ shift: true })
    await expect.element(button('Nästa månad')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Föregående månad')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Stäng dialogrutan')).toHaveFocus()
    await userEvent.tab()
    await expect.element(button('Föregående månad')).toHaveFocus()
  })

  test('an arrow key moves between days inside the dialog', async () => {
    await render(<Example />)
    await open()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(day('torsdag 15 oktober 2026')).toHaveFocus()
  })

  test('Enter on an available day closes the dialog, fills the boxes without leading zeros and returns focus to the trigger', async () => {
    await render(<Example />)
    await open()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expectClosed()
    expect(boxValues()).toEqual({ year: '2026', month: '10', day: '15' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('Space on an available day chooses it and closes the dialog', async () => {
    await render(<Example />)
    await open()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard(' ')
    await expectClosed()
    expect(boxValues()).toEqual({ year: '2026', month: '10', day: '21' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('a click on a day chooses it and writes a day and month without leading zeros', async () => {
    await render(<Example />)
    await open()
    await button('Nästa månad').click()
    await day('tisdag 3 november 2026').click()
    await expectClosed()
    expect(boxValues()).toEqual({ year: '2026', month: '11', day: '3' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('Escape closes without choosing and returns focus to the trigger', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(
      <Example initial={{ year: '2026', month: '10', day: '20' }} onValueChange={onValueChange} />,
    )
    await open()
    await userEvent.keyboard('{ArrowRight}{Escape}')
    await expectClosed()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(boxValues()).toEqual({ year: '2026', month: '10', day: '20' })
    await expect.element(trigger()).toHaveFocus()
    expect(trigger().element().getAttribute('aria-expanded')).toBe('false')
  })

  test('the Close button closes without choosing and returns focus to the trigger', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await open()
    await button('Stäng dialogrutan').click()
    await expectClosed()
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(trigger()).toHaveFocus()
  })

  test('Enter on an unavailable day does nothing and the dialog stays open', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(
      <Example
        onValueChange={onValueChange}
        isDateUnavailable={(date) => date === '2026-10-15'}
        getDateDescription={(date) => (date === '2026-10-15' ? 'Stängt' : undefined)}
      />,
    )
    await open()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(dialog()).toBeVisible()
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(day('torsdag 15 oktober 2026, Stängt')).toHaveFocus()
  })

  test('with the trigger gone, focus goes to the first box of the field, never to body', async () => {
    await render(<Example isTriggerRemovedOnSelect />)
    await open()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expectClosed()
    await expect.element(box('År')).toHaveFocus()
  })
})

describe('announcements', () => {
  test('choosing a day announces it politely on the page once the dialog has closed', async () => {
    await render(<Example />)
    await open()
    const pageRegion = document.querySelector(
      'output[aria-live="polite"]:not(dialog *)',
    ) as HTMLElement
    let wasDialogOpenAtFirstText: boolean | undefined
    const observer = new MutationObserver(() => {
      if (wasDialogOpenAtFirstText === undefined && pageRegion.textContent !== '') {
        wasDialogOpenAtFirstText = (document.querySelector('dialog') as HTMLDialogElement).open
      }
    })
    observer.observe(pageRegion, { childList: true, characterData: true, subtree: true })
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(politeRegion()).toHaveTextContent('torsdag 15 oktober 2026 vald')
    observer.disconnect()
    expect(wasDialogOpenAtFirstText).toBe(false)
    expect(document.querySelectorAll('dialog [role="status"]')).toHaveLength(0)
  })

  test('calendarMessages overrides the text announced after the dialog closes', async () => {
    await render(<Example calendarMessages={{ selected: ({ date }) => `Vald dag: ${date}` }} />)
    await open()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(politeRegion()).toHaveTextContent('Vald dag: torsdag 15 oktober 2026')
  })

  test('a choice the owner keeps open is not announced later when Escape closes the dialog', async () => {
    function KeptOpen() {
      const [isOpen, setIsOpen] = useState(true)
      return (
        <Example
          open={isOpen}
          onOpenChange={(next, details) => {
            if (details.reason !== 'select') {
              setIsOpen(next)
            }
          }}
        />
      )
    }
    await render(<KeptOpen />)
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(dialog()).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expectClosed()
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('closing with Escape announces nothing', async () => {
    const { container } = await render(<Example />)
    await open()
    await expect(
      readAnnouncements(container, () => userEvent.keyboard('{Escape}'), { timeout: 400 }),
    ).rejects.toThrow('No live-region announcement')
  })

  test('closing with Close announces nothing', async () => {
    const { container } = await render(<Example />)
    await open()
    await expect(
      readAnnouncements(container, () => button('Stäng dialogrutan').click(), { timeout: 400 }),
    ).rejects.toThrow('No live-region announcement')
  })

  test('a month button announces the new month inside the dialog', async () => {
    await render(<Example />)
    await open()
    await button('Nästa månad').click()
    await expect
      .element(page.getByRole('dialog').getByRole('status'))
      .toHaveTextContent('november 2026')
  })

  test('without a provider the choice is not announced and focus still returns', async () => {
    await render(
      <DatePicker.Root today="2026-10-14">
        <DatePicker.Trigger />
        <DatePicker.Popup />
      </DatePicker.Root>,
    )
    await page.getByRole('button', { name: 'Choose date' }).click()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(page.getByRole('button', { name: 'Choose date' })).toHaveFocus()
  })
})

describe('read aloud', () => {
  test('reads the field, then the trigger as a button with a popup that is not expanded', async () => {
    const { container } = await render(<Example />)
    const phrases = await readAloud(container)
    const triggerPhrase = phrases.find((phrase) => phrase.includes('Välj datum'))
    expect(triggerPhrase).toContain('button')
    expect(triggerPhrase).toContain('not expanded')
    expect(phrases.findIndex((phrase) => phrase.includes('Dag'))).toBeLessThan(
      phrases.findIndex((phrase) => phrase.includes('Välj datum')),
    )
  })

  test('reads the open dialog by its title, then the grid and the typed day as selected', async () => {
    await render(<Example initial={{ year: '2026', month: '10', day: '20' }} />)
    await open()
    const phrases = await readAloud(dialog().element() as HTMLElement, { maxSteps: 400 })
    expect(
      phrases.some((phrase) => phrase.includes('Välj ett datum') && phrase.includes('heading')),
    ).toBe(true)
    expect(
      phrases.some((phrase) => phrase.includes('oktober 2026') && phrase.includes('grid')),
    ).toBe(true)
    expect(
      phrases.some(
        (phrase) => phrase.includes('tisdag 20 oktober 2026') && phrase.includes('selected'),
      ),
    ).toBe(true)
  })

  test('says "{date} vald" as a polite announcement when a day is chosen', async () => {
    const { container } = await render(<Example />)
    await open()
    const announced = await readAnnouncements(container, async () => {
      await userEvent.keyboard('{ArrowRight}{Enter}')
    })
    expect(announced).toEqual(['polite: torsdag 15 oktober 2026 vald'])
  })
})

describe('controlled open', () => {
  test('onOpenChange reports why: the trigger, a choice, Escape and Close', async () => {
    const onOpenChange = vi.fn<NonNullable<DatePickerRootProps['onOpenChange']>>()
    await render(<Example onOpenChange={onOpenChange} />)
    await open()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await userEvent.keyboard('{Enter}')
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'select' }),
    )
    await open()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    )
    await open()
    await button('Stäng dialogrutan').click()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'close-press' }),
    )
  })

  test('an owner that keeps open true keeps the dialog open after a choice', async () => {
    await render(<Example open />)
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog()).toBeVisible()
  })
})

describe('the field bridge', () => {
  test('three boxes become an ISO date only when all of them are a real date', () => {
    expect(dateInputValueToIsoDate({ year: '2026', month: '4', day: '5' })).toBe('2026-04-05')
    expect(dateInputValueToIsoDate({ year: '2026', month: '04', day: '05' })).toBe('2026-04-05')
    expect(dateInputValueToIsoDate({ year: '2026', month: '', day: '5' })).toBe('')
    expect(dateInputValueToIsoDate({ year: '26', month: '4', day: '5' })).toBe('')
    expect(dateInputValueToIsoDate({ year: '2026', month: '2', day: '30' })).toBe('')
    expect(dateInputValueToIsoDate({ year: '2026', month: 'a', day: '5' })).toBe('')
  })

  test('an ISO date is written into the boxes without leading zeros, and "" empties them', () => {
    expect(isoDateToDateInputValue('2026-04-05')).toEqual({ year: '2026', month: '4', day: '5' })
    expect(isoDateToDateInputValue('')).toEqual(emptyDate)
    expect(isoDateToDateInputValue('2026-02-30')).toEqual(emptyDate)
  })

  test('a masks.date() field converts both ways in the locale of its mask', () => {
    expect(maskedDateToIsoDate('04.10.2026', 'fi')).toBe('2026-10-04')
    expect(maskedDateToIsoDate('2026-10-04', 'sv')).toBe('2026-10-04')
    expect(maskedDateToIsoDate('04.10.', 'fi')).toBe('')
    expect(maskedDateToIsoDate('31.02.2026', 'fi')).toBe('')
    expect(isoDateToMaskedDate('2026-10-04', 'fi')).toBe('04.10.2026')
    expect(isoDateToMaskedDate('2026-10-04', 'sv')).toBe('2026-10-04')
    expect(isoDateToMaskedDate('', 'fi')).toBe('')
  })

  test('a masks.date() field opens on its date and receives the chosen day in its own format', async () => {
    function MaskedExample() {
      const [text, setText] = useState('20.10.2026')
      return (
        <KvirnProvider locale="fi" messages={fi}>
          <DatePicker.Root
            today="2026-10-14"
            value={maskedDateToIsoDate(text, 'fi')}
            onValueChange={(isoDate) => setText(isoDateToMaskedDate(isoDate, 'fi'))}
          >
            <Field.Root>
              <Field.Label>Käyntipäivä</Field.Label>
              <TextInput mask={masks.date()} value={text} onValueChange={setText} />
              <Field.HelpText>Esimerkiksi 27.3.2007</Field.HelpText>
            </Field.Root>
            <DatePicker.Trigger />
            <DatePicker.Popup />
          </DatePicker.Root>
        </KvirnProvider>
      )
    }
    await render(<MaskedExample />)
    const triggerButton = page.getByRole('button', { name: 'Valitse päivämäärä' })
    triggerButton.element().focus()
    await userEvent.keyboard('{Enter}')
    expect(
      document
        .querySelector('dialog [role="gridcell"][tabindex="0"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true')
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect
      .element(page.getByRole('textbox', { name: /^Käyntipäivä/ }))
      .toHaveValue('21.10.2026')
    await expect.element(triggerButton).toHaveFocus()
  })
})

describe('dev warnings', () => {
  test('warns once for a value that is not an ISO date', async () => {
    await render(
      <DatePicker.Root value="14.10.2026">
        <DatePicker.Trigger />
        <DatePicker.Popup />
      </DatePicker.Root>,
    )
    expect(consoleWarn.mock.calls.flat().join('\n')).toContain('not an ISO date')
  })

  test('a part outside DatePicker.Root warns once and a Calendar renders nothing', async () => {
    await render(
      <>
        <DatePicker.Trigger />
        <DatePicker.Calendar />
      </>,
    )
    const warned = consoleWarn.mock.calls.flat().join('\n')
    expect(warned).toContain('DatePicker.Trigger was rendered outside DatePicker.Root')
    expect(warned).toContain('DatePicker.Calendar was rendered outside DatePicker.Root')
    expect(document.querySelector('.kv-calendar')).toBeNull()
    expect(document.querySelector('button')).toBeNull()
  })
})
