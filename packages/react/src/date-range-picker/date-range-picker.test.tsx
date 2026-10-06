import { masks } from '@kvirn-ui/core'
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
import {
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
  isoDateToMaskedDate,
  maskedDateToIsoDate,
} from '../date-picker/date-bridge.ts'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { DateRangePicker } from './date-range-picker.tsx'
import type { DateRangePickerRootProps } from './date-range-picker.tsx'

// Contract: date-range-picker.a11y.md. The range grid's own keys and the restart rule are proved
// in calendar-range.test.tsx and core; these tests prove the dialog around it: opening, the draft,
// closing on the end, Escape, focus, the two fields' bridge and the announcement.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(async () => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  await page.viewport(1280, 900)
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface FieldTexts {
  start: string
  end: string
}

const emptyTexts: FieldTexts = { start: '', end: '' }

function Example({
  initial = emptyTexts,
  isTriggerRemovedOnSelect = false,
  ...props
}: Partial<DateRangePickerRootProps> & {
  initial?: FieldTexts
  isTriggerRemovedOnSelect?: boolean
}) {
  const [texts, setTexts] = useState(initial)
  const [hasTrigger, setHasTrigger] = useState(true)
  return (
    <KvirnProvider locale="sv" messages={sv}>
      <DateRangePicker.Root
        today="2026-10-14"
        {...props}
        value={{
          start: maskedDateToIsoDate(texts.start, 'sv'),
          end: maskedDateToIsoDate(texts.end, 'sv'),
        }}
        onValueChange={(range) => {
          setTexts({
            start: isoDateToMaskedDate(range.start, 'sv'),
            end: isoDateToMaskedDate(range.end, 'sv'),
          })
          props.onValueChange?.(range)
          if (isTriggerRemovedOnSelect) {
            setHasTrigger(false)
          }
        }}
      >
        <Fieldset.Root group>
          <Fieldset.Legend>Datum för vistelsen</Fieldset.Legend>
          <div className="kv-date-range-row">
            <Field.Root>
              <Field.Label>Från</Field.Label>
              <TextInput
                name="start"
                mask={masks.date()}
                value={texts.start}
                onValueChange={(start) => setTexts((current) => ({ ...current, start }))}
              />
              <Field.HelpText>Till exempel 2026-10-27</Field.HelpText>
            </Field.Root>
            <Field.Root>
              <Field.Label>Till</Field.Label>
              <TextInput
                name="end"
                mask={masks.date()}
                value={texts.end}
                onValueChange={(end) => setTexts((current) => ({ ...current, end }))}
              />
              <Field.HelpText>Till exempel 2026-10-27</Field.HelpText>
            </Field.Root>
            {hasTrigger ? <DateRangePicker.Trigger /> : null}
          </div>
        </Fieldset.Root>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
    </KvirnProvider>
  )
}

const trigger = () => page.getByRole('button', { name: 'Välj datumen', exact: true })
const dialog = () => page.getByRole('dialog', { name: 'Välj perioden' })
const day = (name: string) => page.getByRole('gridcell', { name, exact: true })
const startsWith = (text: string) => page.getByRole('gridcell', { name: new RegExp(`^${text}`) })
const button = (name: string) => page.getByRole('button', { name, exact: true })
const field = (name: string) => page.getByRole('textbox', { name: new RegExp(`^${name}`) })
const politeRegion = () => page.getByRole('status')
const dialogRegion = () => page.getByRole('dialog').getByRole('status')
const dialogText = () => dialog().element().textContent
const fieldValues = () => ({
  start: (field('Från').element() as HTMLInputElement).value,
  end: (field('Till').element() as HTMLInputElement).value,
})

const expectClosed = async () =>
  await expect.poll(() => (document.querySelector('dialog') as HTMLDialogElement).open).toBe(false)

const open = async () => {
  trigger().element().focus()
  await userEvent.keyboard('{Enter}')
  await expect.element(dialog()).toBeVisible()
}

/** Opens on the range from 16 October with the end step pending: the first press is made. */
const openWithStart = async () => {
  await open()
  startsWith('fredag 16 oktober 2026').element().focus()
  await userEvent.keyboard('{Enter}')
}

describe('roles, names and states', () => {
  test('there is one trigger after both fields: a button named by its visible text, with a hidden icon, aria-haspopup and aria-expanded false', async () => {
    await render(<Example />)
    expect(document.querySelectorAll('.kv-date-range-picker-trigger')).toHaveLength(1)
    const element = trigger().element()
    expect(element.tagName).toBe('BUTTON')
    expect(element.getAttribute('type')).toBe('button')
    expect(element.getAttribute('aria-haspopup')).toBe('dialog')
    expect(element.getAttribute('aria-expanded')).toBe('false')
    expect(element.textContent).toBe('Välj datumen')
    expect(element.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('the picker never starts open', async () => {
    await render(<Example />)
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
    expect(document.querySelector('[role="grid"]')).toBeNull()
  })

  test('opening makes aria-expanded true and shows a modal dialog named by its h2 title', async () => {
    await render(<Example />)
    await open()
    expect(trigger().element().getAttribute('aria-expanded')).toBe('true')
    const popup = dialog().element() as HTMLDialogElement
    expect(popup.matches(':modal')).toBe(true)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveTextContent('Välj perioden')
  })

  test('from 64rem the dialog shows two months, each grid named by its own heading', async () => {
    await render(<Example />)
    await open()
    await expect.element(page.getByRole('grid', { name: 'oktober 2026' })).toBeVisible()
    await expect.element(page.getByRole('grid', { name: 'november 2026' })).toBeVisible()
    expect(page.getByRole('grid').elements()).toHaveLength(2)
  })

  test('below 64rem the dialog shows one month', async () => {
    await page.viewport(800, 900)
    await render(<Example />)
    await open()
    expect(page.getByRole('grid').elements()).toHaveLength(1)
  })

  test('the grid is only mounted while the dialog is open', async () => {
    await render(<Example />)
    expect(document.querySelector('[role="grid"]')).toBeNull()
    await open()
    expect(document.querySelector('[role="grid"]')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await expectClosed()
    expect(document.querySelector('[role="grid"]')).toBeNull()
  })

  test('the title can be replaced with the question', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <DateRangePicker.Root today="2026-10-14">
          <DateRangePicker.Trigger />
          <DateRangePicker.Popup>
            <DateRangePicker.Title>Välj datum för vistelsen</DateRangePicker.Title>
            <DateRangePicker.Calendar />
          </DateRangePicker.Popup>
        </DateRangePicker.Root>
      </KvirnProvider>,
    )
    await trigger().click()
    await expect
      .element(page.getByRole('dialog', { name: 'Välj datum för vistelsen' }))
      .toBeVisible()
  })

  test('per-instance messages rename the trigger and the title', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <DateRangePicker.Root
          today="2026-10-14"
          messages={{ trigger: 'Öppna kalender', title: 'Kalender' }}
        >
          <DateRangePicker.Trigger />
          <DateRangePicker.Popup />
        </DateRangePicker.Root>
      </KvirnProvider>,
    )
    await page.getByRole('button', { name: 'Öppna kalender' }).click()
    await expect.element(page.getByRole('dialog', { name: 'Kalender' })).toBeVisible()
  })

  test('has no axe violations closed, and open at the start step', async () => {
    const { container } = await render(<Example />)
    await expectNoA11yViolations(container)
    await open()
    await expectNoA11yViolations(document.body)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('has no axe violations open at the end step', async () => {
    await render(<Example />)
    await openWithStart()
    await expect
      .element(dialogRegion())
      .toHaveTextContent('Startdatum fredag 16 oktober 2026. Välj slutdatum.')
    await expectNoA11yViolations(document.body)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('keyboard', () => {
  test('Tab moves from the From field to the To field and on to the trigger', async () => {
    await render(<Example />)
    field('Från').element().focus()
    await userEvent.tab()
    await expect.element(field('Till')).toHaveFocus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
  })

  test('Shift+Tab moves from the trigger back to the To field and the From field', async () => {
    await render(<Example />)
    trigger().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(field('Till')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(field('Från')).toHaveFocus()
  })

  test('Enter on the trigger opens the dialog with focus on today when both fields are empty', async () => {
    await render(<Example />)
    await open()
    await expect.element(day('onsdag 14 oktober 2026, idag')).toHaveFocus()
  })

  test('Space on the trigger opens the dialog', async () => {
    await render(<Example />)
    trigger().element().focus()
    await userEvent.keyboard(' ')
    await expect.element(dialog()).toBeVisible()
  })

  test('the dialog opens on the typed start, with the whole typed range selected', async () => {
    await render(<Example initial={{ start: '2026-10-16', end: '2026-10-23' }} />)
    await open()
    await expect.element(startsWith('fredag 16 oktober 2026')).toHaveFocus()
    await expect
      .element(startsWith('fredag 16 oktober 2026'))
      .toHaveAttribute('aria-selected', 'true')
    await expect
      .element(startsWith('fredag 23 oktober 2026'))
      .toHaveAttribute('aria-selected', 'true')
  })

  test('with only a start typed the dialog opens on it at the end step', async () => {
    await render(<Example initial={{ start: '2026-10-16', end: '' }} />)
    await open()
    await expect.element(startsWith('fredag 16 oktober 2026')).toHaveFocus()
    await expect.poll(dialogText).toMatch(/Startdatum fredag 16 oktober 2026\. Välj slutdatum\./)
  })

  test('with only an end typed the dialog opens on it at the start step', async () => {
    await render(<Example initial={{ start: '', end: '2026-10-23' }} />)
    await open()
    await expect.element(startsWith('fredag 23 oktober 2026')).toHaveFocus()
    await expect.poll(dialogText).toMatch(/Välj startdatum\./)
  })

  test('an end typed before the start opens on the start at the end step, nothing rewritten', async () => {
    await render(<Example initial={{ start: '2026-10-23', end: '2026-10-16' }} />)
    await open()
    await expect.element(startsWith('fredag 23 oktober 2026')).toHaveFocus()
    await expect.poll(dialogText).toMatch(/Välj slutdatum\./)
    await userEvent.keyboard('{Escape}')
    await expectClosed()
    expect(fieldValues()).toEqual({ start: '2026-10-23', end: '2026-10-16' })
  })

  test('partial text counts as no date: the dialog opens on today', async () => {
    await render(<Example initial={{ start: '2026-10', end: '' }} />)
    await open()
    await expect.element(day('onsdag 14 oktober 2026, idag')).toHaveFocus()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a typed date outside the range opens inside it', async () => {
    await render(<Example minimum="2026-10-20" initial={{ start: '2026-10-05', end: '' }} />)
    await open()
    await expect.element(startsWith('tisdag 20 oktober 2026')).toHaveFocus()
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

  test('Enter on a day sets the start: the dialog stays open, the fields are unchanged and the step line says to choose the end', async () => {
    const onValueChange = vi.fn<(range: unknown) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithStart()
    await expect.element(dialog()).toBeVisible()
    await expect.poll(dialogText).toMatch(/Startdatum fredag 16 oktober 2026\. Välj slutdatum\./)
    expect(fieldValues()).toEqual({ start: '', end: '' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('Enter on the end closes the dialog, fills both fields and returns focus to the trigger', async () => {
    const onValueChange = vi.fn<(range: unknown) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithStart()
    startsWith('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expectClosed()
    expect(fieldValues()).toEqual({ start: '2026-10-16', end: '2026-10-23' })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-16', end: '2026-10-23' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('Space on the end chooses it and closes the dialog', async () => {
    await render(<Example />)
    await openWithStart()
    startsWith('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard(' ')
    await expectClosed()
    expect(fieldValues()).toEqual({ start: '2026-10-16', end: '2026-10-23' })
  })

  test('a click on the start and on the end chooses the range the same way', async () => {
    await render(<Example />)
    await open()
    await startsWith('fredag 16 oktober 2026').click()
    await startsWith('söndag 18 oktober 2026').click()
    await expectClosed()
    expect(fieldValues()).toEqual({ start: '2026-10-16', end: '2026-10-18' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('Enter on the start again makes a one-day range and closes', async () => {
    await render(<Example />)
    await openWithStart()
    await userEvent.keyboard('{Enter}')
    await expectClosed()
    expect(fieldValues()).toEqual({ start: '2026-10-16', end: '2026-10-16' })
  })

  test('a day before the start restarts: it becomes the new start and the dialog stays open', async () => {
    await render(<Example />)
    await openWithStart()
    startsWith('onsdag 14 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog()).toBeVisible()
    await expect
      .element(dialogRegion())
      .toHaveTextContent('Startdatum onsdag 14 oktober 2026. Välj slutdatum.')
    expect(fieldValues()).toEqual({ start: '', end: '' })
  })

  test('a day that makes the range too long restarts, says so in its name, and the dialog stays open', async () => {
    await render(<Example maximumDays={8} />)
    await openWithStart()
    await expect
      .element(startsWith('fredag 30 oktober 2026'))
      .toHaveAccessibleName(/fler än 8 dagar/)
    startsWith('fredag 30 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog()).toBeVisible()
    await expect
      .element(dialogRegion())
      .toHaveTextContent('Startdatum fredag 30 oktober 2026. Välj slutdatum.')
    expect(fieldValues()).toEqual({ start: '', end: '' })
  })

  test('Enter on an unavailable day does nothing and the dialog stays open', async () => {
    const onValueChange = vi.fn<(range: unknown) => void>()
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

  test('Escape after the first press discards the half-chosen range: both fields stay as they were and focus returns to the trigger', async () => {
    const onValueChange = vi.fn<(range: unknown) => void>()
    await render(
      <Example
        initial={{ start: '2026-10-05', end: '2026-10-07' }}
        onValueChange={onValueChange}
      />,
    )
    await open()
    await startsWith('fredag 16 oktober 2026').click()
    await userEvent.keyboard('{Escape}')
    await expectClosed()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(fieldValues()).toEqual({ start: '2026-10-05', end: '2026-10-07' })
    await expect.element(trigger()).toHaveFocus()
    expect(trigger().element().getAttribute('aria-expanded')).toBe('false')
  })

  test('the dialog reopens on the typed range, not on the half-chosen one dropped by Escape', async () => {
    await render(<Example initial={{ start: '2026-10-05', end: '2026-10-07' }} />)
    await open()
    await startsWith('fredag 16 oktober 2026').click()
    await userEvent.keyboard('{Escape}')
    await expectClosed()
    await open()
    await expect.element(startsWith('måndag 5 oktober 2026')).toHaveFocus()
    await expect.element(startsWith('fredag 16 oktober 2026')).not.toHaveAttribute('aria-selected')
  })

  test('the Close button discards the half-chosen range and returns focus to the trigger', async () => {
    const onValueChange = vi.fn<(range: unknown) => void>()
    await render(<Example onValueChange={onValueChange} />)
    await openWithStart()
    await button('Stäng dialogrutan').click()
    await expectClosed()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(fieldValues()).toEqual({ start: '', end: '' })
    await expect.element(trigger()).toHaveFocus()
  })

  test('with the trigger gone, focus goes to the From field, never to body', async () => {
    await render(<Example isTriggerRemovedOnSelect />)
    await openWithStart()
    startsWith('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expectClosed()
    await expect.element(field('Från')).toHaveFocus()
  })

  test('a key with Control, Alt or Meta on the trigger does not open the dialog', async () => {
    await render(<Example />)
    trigger().element().focus()
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
  })
})

describe('announcements', () => {
  test('choosing the end announces the range on the page once the dialog has closed, and not inside it', async () => {
    await render(<Example />)
    await openWithStart()
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
    startsWith('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect
      .element(politeRegion())
      .toHaveTextContent('fredag 16 oktober 2026 till fredag 23 oktober 2026 valda, 8 dagar')
    observer.disconnect()
    expect(wasDialogOpenAtFirstText).toBe(false)
    expect(document.body.textContent?.match(/valda, 8 dagar/g)).toHaveLength(1)
  })

  test('calendarMessages overrides the text announced after the dialog closes', async () => {
    await render(
      <Example
        calendarMessages={{ rangeSelected: ({ start, end }) => `Period: ${start} – ${end}` }}
      />,
    )
    await openWithStart()
    startsWith('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect
      .element(politeRegion())
      .toHaveTextContent('Period: fredag 16 oktober 2026 – fredag 23 oktober 2026')
  })

  test('closing with Escape announces nothing', async () => {
    const { container } = await render(<Example />)
    await openWithStart()
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

  test('a month button announces both months inside the dialog', async () => {
    await render(<Example />)
    await open()
    await button('Nästa månad').click()
    await expect.element(dialogRegion()).toHaveTextContent('november 2026 och december 2026')
  })

  test('without a provider the choice is not announced and focus still returns', async () => {
    await render(
      <DateRangePicker.Root today="2026-10-14">
        <DateRangePicker.Trigger />
        <DateRangePicker.Popup />
      </DateRangePicker.Root>,
    )
    const choose = page.getByRole('button', { name: 'Choose dates' })
    await choose.click()
    await userEvent.keyboard('{Enter}{Enter}')
    await expect.element(choose).toHaveFocus()
  })
})

describe('read aloud', () => {
  test('reads the From field, the To field, then the trigger as a button with a popup that is not expanded', async () => {
    const { container } = await render(<Example />)
    const phrases = await readAloud(container)
    const triggerPhrase = phrases.find((phrase) => phrase.includes('Välj datumen'))
    expect(triggerPhrase).toContain('button')
    expect(triggerPhrase).toContain('not expanded')
    const indexOf = (text: string) => phrases.findIndex((phrase) => phrase.includes(text))
    expect(indexOf('textbox, Från')).toBeLessThan(indexOf('textbox, Till'))
    expect(indexOf('textbox, Till')).toBeLessThan(indexOf('Välj datumen'))
  })

  test('reads the open dialog by its title, then both grids and the typed range as selected', async () => {
    await render(<Example initial={{ start: '2026-10-16', end: '2026-10-23' }} />)
    await open()
    const phrases = await readAloud(dialog().element() as HTMLElement, { maxSteps: 600 })
    expect(
      phrases.some((phrase) => phrase.includes('Välj perioden') && phrase.includes('heading')),
    ).toBe(true)
    expect(
      phrases.some((phrase) => phrase.includes('oktober 2026') && phrase.includes('grid')),
    ).toBe(true)
    expect(
      phrases.some((phrase) => phrase.includes('november 2026') && phrase.includes('grid')),
    ).toBe(true)
    expect(
      phrases.some(
        (phrase) =>
          phrase.includes('fredag 16 oktober 2026') &&
          phrase.includes('startdatum') &&
          phrase.includes('selected'),
      ),
    ).toBe(true)
    expect(
      phrases.some(
        (phrase) =>
          phrase.includes('fredag 23 oktober 2026') &&
          phrase.includes('slutdatum') &&
          phrase.includes('selected'),
      ),
    ).toBe(true)
  })

  test('says "Startdatum … Välj slutdatum." as a polite announcement when the start is pressed', async () => {
    await render(<Example />)
    await open()
    const announced = await readAnnouncements(
      document.querySelector('dialog') as HTMLElement,
      async () => {
        startsWith('fredag 16 oktober 2026').element().focus()
        await userEvent.keyboard('{Enter}')
      },
    )
    expect(announced).toEqual(['polite: Startdatum fredag 16 oktober 2026. Välj slutdatum.'])
  })

  test('says "{start} till {end} valda, {length}" as a polite announcement when the end is chosen', async () => {
    const { container } = await render(<Example />)
    await openWithStart()
    const announced = await readAnnouncements(container, async () => {
      startsWith('fredag 23 oktober 2026').element().focus()
      await userEvent.keyboard('{Enter}')
    })
    expect(announced).toEqual([
      'polite: fredag 16 oktober 2026 till fredag 23 oktober 2026 valda, 8 dagar',
    ])
  })
})

describe('controlled open', () => {
  test('onOpenChange reports why: the trigger, the end, Escape and Close', async () => {
    const onOpenChange = vi.fn<NonNullable<DateRangePickerRootProps['onOpenChange']>>()
    await render(<Example onOpenChange={onOpenChange} />)
    await open()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await userEvent.keyboard('{Enter}{Enter}')
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

  test('an owner that keeps open true keeps the dialog open after the end is chosen', async () => {
    await render(<Example open />)
    await userEvent.keyboard('{Enter}{Enter}')
    await expect.element(dialog()).toBeVisible()
  })
})

describe('the three-box alternative', () => {
  const emptyDate: DateInputValue = { year: '', month: '', day: '' }

  function ThreeBoxExample({
    isTriggerRemovedOnSelect = false,
  }: {
    isTriggerRemovedOnSelect?: boolean
  }) {
    const [hasTrigger, setHasTrigger] = useState(true)
    const [start, setStart] = useState(emptyDate)
    const [end, setEnd] = useState(emptyDate)
    return (
      <KvirnProvider locale="sv" messages={sv}>
        <DateRangePicker.Root
          today="2026-10-14"
          value={{ start: dateInputValueToIsoDate(start), end: dateInputValueToIsoDate(end) }}
          onValueChange={(range) => {
            setStart(isoDateToDateInputValue(range.start))
            setEnd(isoDateToDateInputValue(range.end))
            if (isTriggerRemovedOnSelect) {
              setHasTrigger(false)
            }
          }}
        >
          <Fieldset.Root group>
            <Fieldset.Legend>Datum för vistelsen</Fieldset.Legend>
            <Fieldset.Root group>
              <Fieldset.Legend>Startdatum</Fieldset.Legend>
              <DateInput.Root name="start" value={start} onValueChange={setStart}>
                <DateInput.Year />
                <DateInput.Month />
                <DateInput.Day />
              </DateInput.Root>
            </Fieldset.Root>
            <Fieldset.Root group>
              <Fieldset.Legend>Slutdatum</Fieldset.Legend>
              <DateInput.Root name="end" value={end} onValueChange={setEnd}>
                <DateInput.Year />
                <DateInput.Month />
                <DateInput.Day />
                {hasTrigger ? <DateRangePicker.Trigger /> : null}
              </DateInput.Root>
            </Fieldset.Root>
          </Fieldset.Root>
          <DateRangePicker.Popup />
        </DateRangePicker.Root>
      </KvirnProvider>
    )
  }

  test('choosing a range writes the start and the end boxes without leading zeros and returns focus to the trigger', async () => {
    await render(<ThreeBoxExample />)
    await open()
    await startsWith('måndag 5 oktober 2026').click()
    await startsWith('onsdag 7 oktober 2026').click()
    await expectClosed()
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>('input')).map(
      (input) => input.value,
    )
    expect(boxes).toEqual(['2026', '10', '5', '2026', '10', '7'])
    await expect.element(trigger()).toHaveFocus()
  })

  test("with the trigger gone, focus goes to the end's first box, the nearest group around the trigger, never to body", async () => {
    await render(<ThreeBoxExample isTriggerRemovedOnSelect />)
    await open()
    await startsWith('måndag 5 oktober 2026').click()
    await startsWith('onsdag 7 oktober 2026').click()
    await expectClosed()
    const firstEndBox = page
      .getByRole('group', { name: /^Slutdatum/ })
      .element()
      .querySelector('input')
    expect(firstEndBox?.getAttribute('aria-label') ?? firstEndBox?.labels?.[0]?.textContent).toBe(
      'År',
    )
    expect(document.activeElement).toBe(firstEndBox)
  })
})

describe('dev warnings', () => {
  test('warns once for an end that is not an ISO date', async () => {
    await render(
      <DateRangePicker.Root value={{ start: '16.10.2026', end: '' }}>
        <DateRangePicker.Trigger />
        <DateRangePicker.Popup />
      </DateRangePicker.Root>,
    )
    expect(consoleWarn.mock.calls.flat().join('\n')).toContain('not an ISO date')
  })

  test('a part outside DateRangePicker.Root warns once and a Calendar renders nothing', async () => {
    await render(
      <>
        <DateRangePicker.Trigger />
        <DateRangePicker.Calendar />
      </>,
    )
    const warned = consoleWarn.mock.calls.flat().join('\n')
    expect(warned).toContain('DateRangePicker.Trigger was rendered outside DateRangePicker.Root')
    expect(warned).toContain('DateRangePicker.Calendar was rendered outside DateRangePicker.Root')
    expect(document.querySelector('.kv-calendar')).toBeNull()
    expect(document.querySelector('button')).toBeNull()
  })
})
