import { sv } from '@kvirn-ui/i18n/sv'
import { act, useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Calendar } from './calendar.tsx'
import type { CalendarRootProps } from './calendar.tsx'
import type { DateRange } from './use-calendar.ts'

// Contract: calendar.a11y.md (range mode). The restart rule, spans and the blocked scan are proved
// in core (calendar-range.test.ts); these tests prove the wiring: names, states, keys, focus,
// the values reported and what is announced.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(async () => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  await page.viewport(1280, 900)
})

afterEach(() => {
  consoleWarn.mockRestore()
  vi.restoreAllMocks()
})

type ExampleProps = Partial<Extract<CalendarRootProps, { mode: 'range' }>> & {
  dir?: 'ltr' | 'rtl' | undefined
  locale?: string | undefined
}

function Example({ dir, locale = 'sv', ...props }: ExampleProps) {
  return (
    <KvirnProvider locale={locale} dir={dir} messages={sv}>
      <button type="button">Före</button>
      <Calendar.Root today="2026-10-14" mode="range" {...props}>
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.Heading offset={1} />
        <Calendar.NextMonth />
        <Calendar.RangeHint />
        <Calendar.Grid />
        <Calendar.Grid offset={1} />
      </Calendar.Root>
      <button type="button">Efter</button>
    </KvirnProvider>
  )
}

/** A controlled Calendar that records what it reports. */
function Controlled({
  initial = { start: '', end: '' },
  onReport,
  ...props
}: ExampleProps & { initial?: DateRange; onReport?: (range: DateRange) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <Example
      {...props}
      value={value}
      onValueChange={(next) => {
        onReport?.(next)
        setValue(next)
      }}
    />
  )
}

const starts = (text: string) => page.getByRole('gridcell', { name: new RegExp(`^${text}`) })
const day = (name: string) => page.getByRole('gridcell', { name, exact: true })
const button = (name: string) => page.getByRole('button', { name, exact: true })
const politeRegion = () => page.getByRole('status')
const headings = () => page.getByRole('heading', { level: 3 })

describe('roles, names and states', () => {
  test('a range grid is multiselectable and named by its heading', async () => {
    await render(<Example />)
    const grid = page.getByRole('grid', { name: 'oktober 2026' })
    await expect.element(grid).toHaveAttribute('aria-multiselectable', 'true')
  })

  test('a single-date grid is not multiselectable', async () => {
    await render(
      <KvirnProvider messages={sv}>
        <Calendar.Root today="2026-10-14">
          <Calendar.Heading />
          <Calendar.Grid />
        </Calendar.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('grid')).not.toHaveAttribute('aria-multiselectable')
  })

  test('the start, the days between and the end are aria-selected, and the ends are named', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '2026-10-19' }} />)
    await expect
      .element(day('fredag 16 oktober 2026, startdatum'))
      .toHaveAttribute('aria-selected', 'true')
    await expect
      .element(day('måndag 19 oktober 2026, slutdatum'))
      .toHaveAttribute('aria-selected', 'true')
    for (const between of ['lördag 17 oktober 2026', 'söndag 18 oktober 2026']) {
      await expect.element(day(between)).toHaveAttribute('aria-selected', 'true')
      await expect.element(day(between)).toHaveAttribute('data-in-range')
    }
    expect(document.querySelectorAll('[aria-selected]')).toHaveLength(4)
    expect(document.querySelectorAll('[data-range-start]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-range-end]')).toHaveLength(1)
  })

  test('a one-day range is both the start and the end date', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '2026-10-16' }} />)
    const only = day('fredag 16 oktober 2026, start- och slutdatum')
    await expect.element(only).toHaveAttribute('data-range-start')
    await expect.element(only).toHaveAttribute('data-range-end')
  })

  test('with only a start chosen, each possible end names its length in days', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '' }} />)
    await expect.element(day('torsdag 22 oktober 2026, 7 dagar')).toBeVisible()
    await expect.element(day('lördag 17 oktober 2026, 2 dagar')).toBeVisible()
    expect(document.querySelectorAll('[aria-selected]')).toHaveLength(1)
  })

  test('a day before the start is a plain start: no length, no reason', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '' }} />)
    await expect.element(day('torsdag 15 oktober 2026')).toBeVisible()
  })

  test('a day too far away says so and stays available as a new start', async () => {
    await render(
      <Example value={{ start: '2026-10-16', end: '' }} maximumDays={14} visibleMonths={2} />,
    )
    const far = day('fredag 6 november 2026, fler än 14 dagar')
    await expect.element(far).not.toHaveAttribute('aria-disabled')
  })

  test('a day too close says so', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '' }} minimumDays={3} />)
    await expect.element(day('lördag 17 oktober 2026, färre än 3 dagar')).toBeVisible()
  })

  test('a day past an unavailable day says one lies in between', async () => {
    await render(
      <Example
        value={{ start: '2026-10-16', end: '' }}
        isDateUnavailable={(date) => date === '2026-10-20'}
      />,
    )
    await expect
      .element(day('torsdag 22 oktober 2026, en otillgänglig dag ligger emellan'))
      .toBeVisible()
  })

  test('selects="end": an impossible end is aria-disabled with its reason', async () => {
    await render(<Example selects="end" value={{ start: '2026-10-16', end: '' }} maximumDays={5} />)
    const before = day('torsdag 15 oktober 2026, före startdatumet')
    await expect.element(before).toHaveAttribute('aria-disabled', 'true')
    await expect.element(before).toHaveAttribute('data-unavailable')
    await expect
      .element(day('måndag 26 oktober 2026, fler än 5 dagar'))
      .toHaveAttribute('aria-disabled', 'true')
    await expect
      .element(day('söndag 18 oktober 2026, 3 dagar'))
      .not.toHaveAttribute('aria-disabled')
  })

  test('allowUnavailableInRange keeps an unavailable day in the range, still aria-disabled', async () => {
    await render(
      <Example
        value={{ start: '2026-10-16', end: '2026-10-20' }}
        isDateUnavailable={(date) => date === '2026-10-18'}
        allowUnavailableInRange
      />,
    )
    const closed = day('söndag 18 oktober 2026')
    await expect.element(closed).toHaveAttribute('aria-selected', 'true')
    await expect.element(closed).toHaveAttribute('aria-disabled', 'true')
    await expect.element(closed).toHaveAttribute('data-unavailable')
  })

  test('the hint lines describe the grid: the limits, the span and the next step', async () => {
    await render(
      <Example minimum="2026-10-01" minimumDays={2} maximumDays={14} visibleMonths={2} />,
    )
    await expect
      .element(page.getByRole('grid').first())
      .toHaveAccessibleDescription('Datum från 1 oktober 2026 2 till 14 dagar Välj startdatum.')
  })

  test('the step line follows the presses', async () => {
    await render(<Example />)
    const hint = () => document.querySelector('.kv-calendar-range')
    expect(hint()?.textContent).toBe('Välj startdatum.')
    await day('fredag 16 oktober 2026').click()
    expect(hint()?.textContent).toBe('Startdatum fredag 16 oktober 2026. Välj slutdatum.')
    await starts('fredag 23 oktober 2026').click()
    expect(hint()?.textContent).toBe(
      'fredag 16 oktober 2026 till fredag 23 oktober 2026 valda, 8 dagar',
    )
  })

  test('hovering a possible end previews the days up to it, drawn only', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '' }} />)
    await starts('måndag 19 oktober 2026').hover()
    await expect.element(starts('lördag 17 oktober 2026')).toHaveAttribute('data-preview')
    await expect.element(starts('måndag 19 oktober 2026')).toHaveAttribute('data-preview-end')
    expect(document.querySelectorAll('[aria-selected]')).toHaveLength(1)
    await expect
      .element(starts('lördag 17 oktober 2026'))
      .toHaveAccessibleName('lördag 17 oktober 2026, 2 dagar')
  })

  test('a heading of your own is prepended to the grid name', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Calendar.Root today="2026-10-14" mode="range" selects="end">
          <h2 id="end-label">Slutdatum</h2>
          <Calendar.Heading />
          <Calendar.Grid aria-labelledby="end-label" />
        </Calendar.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('grid')).toHaveAccessibleName('Slutdatum oktober 2026')
  })
})

describe('two months', () => {
  test('from 64rem two months are shown, each grid named by its own heading', async () => {
    await render(<Example visibleMonths={2} />)
    expect(
      headings()
        .elements()
        .map((heading) => heading.textContent),
    ).toEqual(['oktober 2026', 'november 2026'])
    await expect.element(page.getByRole('grid', { name: 'november 2026' })).toBeVisible()
    expect(page.getByRole('grid').elements()).toHaveLength(2)
  })

  test('below 64rem one month is shown and the second parts render nothing', async () => {
    await page.viewport(800, 900)
    await render(<Example visibleMonths={2} />)
    expect(headings().elements()).toHaveLength(1)
    expect(page.getByRole('grid').elements()).toHaveLength(1)
  })

  test('a month button announces both months', async () => {
    await render(<Example visibleMonths={2} />)
    await button('Nästa månad').click()
    await expect.element(politeRegion()).toHaveTextContent('november 2026 och december 2026')
  })
})

describe('keyboard', () => {
  test('Tab with two months passes the month buttons, then both grids as one stop', async () => {
    await render(<Example visibleMonths={2} />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(button('Föregående månad')).toHaveFocus()
    await userEvent.tab()
    await expect.element(button('Nästa månad')).toHaveFocus()
    await userEvent.tab()
    await expect.element(starts('onsdag 14 oktober 2026')).toHaveFocus()
    await userEvent.tab()
    await expect.element(button('Efter')).toHaveFocus()
    expect(document.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1)
  })

  test('Shift+Tab from the grid goes back to the month buttons', async () => {
    await render(<Example visibleMonths={2} />)
    starts('onsdag 14 oktober 2026').element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Nästa månad')).toHaveFocus()
  })

  test('ArrowRight on the last day of the first grid crosses into the second without moving the view', async () => {
    await render(<Example visibleMonths={2} defaultFocusedDate="2026-10-31" />)
    starts('lördag 31 oktober 2026').element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(starts('söndag 1 november 2026')).toHaveFocus()
    expect(headings().elements()[0]?.textContent).toBe('oktober 2026')
  })

  test('ArrowLeft on the first day of the second grid crosses back', async () => {
    await render(<Example visibleMonths={2} defaultFocusedDate="2026-11-01" />)
    starts('söndag 1 november 2026').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(starts('lördag 31 oktober 2026')).toHaveFocus()
    expect(headings().elements()[0]?.textContent).toBe('oktober 2026')
  })

  test('ArrowRight and ArrowLeft flip in RTL across the two grids', async () => {
    await render(<Example visibleMonths={2} dir="rtl" defaultFocusedDate="2026-10-31" />)
    starts('lördag 31 oktober 2026').element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(starts('söndag 1 november 2026')).toHaveFocus()
  })

  test('PageDown with two months keeps the view until the day leaves both grids', async () => {
    await render(<Example visibleMonths={2} />)
    starts('onsdag 14 oktober 2026').element().focus()
    await userEvent.keyboard('{PageDown}')
    await expect.element(starts('lördag 14 november 2026')).toHaveFocus()
    expect(headings().elements()[0]?.textContent).toBe('oktober 2026')
    await userEvent.keyboard('{PageDown}')
    await expect.element(starts('måndag 14 december 2026')).toHaveFocus()
    expect(headings().elements()[0]?.textContent).toBe('november 2026')
  })

  test('PageUp with two months keeps the view until the day leaves both grids', async () => {
    await render(<Example visibleMonths={2} defaultFocusedDate="2026-11-14" />)
    starts('lördag 14 november 2026').element().focus()
    await userEvent.keyboard('{PageUp}')
    await expect.element(starts('onsdag 14 oktober 2026')).toHaveFocus()
    expect(headings().elements()[0]?.textContent).toBe('oktober 2026')
  })

  test('Enter on an available day at the start step sets the start', async () => {
    const reports: DateRange[] = []
    await render(<Controlled onReport={(range) => reports.push(range)} />)
    starts('fredag 16 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(reports).toEqual([{ start: '2026-10-16', end: '' }])
    await expect
      .element(politeRegion())
      .toHaveTextContent('Startdatum fredag 16 oktober 2026. Välj slutdatum.')
  })

  test('Space on a possible end sets the end and reports the finished range', async () => {
    const reports: DateRange[] = []
    await render(
      <Controlled
        initial={{ start: '2026-10-16', end: '' }}
        onReport={(range) => reports.push(range)}
      />,
    )
    starts('fredag 23 oktober 2026').element().focus()
    await userEvent.keyboard(' ')
    expect(reports).toEqual([{ start: '2026-10-16', end: '2026-10-23' }])
    await expect.element(starts('fredag 23 oktober 2026')).toHaveAttribute('aria-selected', 'true')
  })

  test('Enter on the start again at the end step makes a one-day range', async () => {
    const reports: DateRange[] = []
    await render(
      <Controlled
        initial={{ start: '2026-10-16', end: '' }}
        onReport={(range) => reports.push(range)}
      />,
    )
    starts('fredag 16 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(reports).toEqual([{ start: '2026-10-16', end: '2026-10-16' }])
  })

  test('Enter on a day that can not end the range makes it the new start, announced', async () => {
    const reports: DateRange[] = []
    await render(
      <Controlled
        initial={{ start: '2026-10-16', end: '' }}
        maximumDays={14}
        visibleMonths={2}
        onReport={(range) => reports.push(range)}
      />,
    )
    starts('fredag 6 november 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(reports).toEqual([{ start: '2026-11-06', end: '' }])
    await expect
      .element(politeRegion())
      .toHaveTextContent('Startdatum fredag 6 november 2026. Välj slutdatum.')
  })

  test('Enter on a day before the start makes it the new start', async () => {
    const reports: DateRange[] = []
    await render(
      <Controlled
        initial={{ start: '2026-10-16', end: '' }}
        onReport={(range) => reports.push(range)}
      />,
    )
    starts('torsdag 15 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(reports).toEqual([{ start: '2026-10-15', end: '' }])
  })

  test('Enter on an impossible end with selects="end" does nothing and focus stays', async () => {
    const onValueChange = vi.fn()
    await render(
      <Example
        selects="end"
        value={{ start: '2026-10-16', end: '' }}
        onValueChange={onValueChange}
      />,
    )
    const before = starts('torsdag 15 oktober 2026')
    before.element().focus()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(before).toHaveFocus()
  })

  test('Enter on an unavailable day does nothing and focus stays', async () => {
    const onValueChange = vi.fn()
    await render(
      <Example isDateUnavailable={(date) => date === '2026-10-16'} onValueChange={onValueChange} />,
    )
    const closed = starts('fredag 16 oktober 2026')
    closed.element().focus()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    await expect.element(closed).toHaveFocus()
  })

  test('Enter with selects="start" after the end clears the end and announces both', async () => {
    const reports: DateRange[] = []
    await render(
      <Controlled
        selects="start"
        initial={{ start: '2026-10-16', end: '2026-10-20' }}
        maximumDays={6}
        onReport={(range) => reports.push(range)}
      />,
    )
    starts('onsdag 14 oktober 2026').element().focus()
    await userEvent.keyboard('{Enter}')
    expect(reports).toEqual([{ start: '2026-10-14', end: '' }])
    await expect
      .element(politeRegion())
      .toHaveTextContent('onsdag 14 oktober 2026 vald Slutdatum rensat.')
  })

  test('a key with Control, Alt or Meta is left native in range mode', async () => {
    const onValueChange = vi.fn()
    await render(<Example onValueChange={onValueChange} />)
    starts('onsdag 14 oktober 2026').element().focus()
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('Escape is not handled by a standalone range calendar', async () => {
    await render(<Example />)
    const focused = starts('onsdag 14 oktober 2026')
    focused.element().focus()
    await userEvent.keyboard('{Escape}')
    await expect.element(focused).toHaveFocus()
  })
})

describe('focus when the view changes', () => {
  test('focus in the second grid stays on its day when the view drops to one month', async () => {
    await render(<Example visibleMonths={2} defaultFocusedDate="2026-11-14" />)
    starts('lördag 14 november 2026').element().focus()
    await page.viewport(800, 900)
    await expect.element(starts('lördag 14 november 2026')).toHaveFocus()
  })

  test('a controlled value that moves the Tab stop keeps focus that was in the grid', async () => {
    let change: () => void = () => {}
    function Outside() {
      const [value, setValue] = useState<DateRange>({ start: '2026-10-16', end: '' })
      change = () => setValue({ start: '2026-12-03', end: '' })
      return <Example value={value} />
    }
    await render(<Outside />)
    starts('fredag 16 oktober 2026').element().focus()
    await act(async () => change())
    await expect.element(starts('torsdag 3 december 2026')).toHaveFocus()
  })
})

describe('values and announcements', () => {
  test('a click on an available day reports at once and each press carries its reason', async () => {
    const changes: string[] = []
    await render(
      <Example
        onValueChange={(range, change) =>
          changes.push(`${range.start}|${range.end}|${change.reason}|${change.step}`)
        }
      />,
    )
    await day('fredag 16 oktober 2026').click()
    await starts('fredag 23 oktober 2026').click()
    expect(changes).toEqual(['2026-10-16||started|end', '2026-10-16|2026-10-23|completed|complete'])
  })

  test('an uncontrolled range keeps the presses', async () => {
    await render(<Example defaultValue={{ start: '2026-10-16', end: '2026-10-18' }} />)
    await starts('onsdag 21 oktober 2026').click()
    await expect.element(starts('onsdag 21 oktober 2026')).toHaveAttribute('data-range-start')
    expect(document.querySelectorAll('[data-range-end]')).toHaveLength(0)
  })

  test('a controlled range the parent does not change stays as it was', async () => {
    await render(<Example value={{ start: '2026-10-16', end: '' }} onValueChange={() => {}} />)
    await starts('fredag 23 oktober 2026').click()
    await expect.element(starts('fredag 16 oktober 2026')).toHaveAttribute('data-range-start')
    expect(document.querySelectorAll('[data-range-end]')).toHaveLength(0)
  })

  test('the first press announces the start and the next step, politely', async () => {
    const { container } = await render(<Example />)
    const announced = await readAnnouncements(container, () =>
      day('fredag 16 oktober 2026').click(),
    )
    expect(announced).toEqual(['polite: Startdatum fredag 16 oktober 2026. Välj slutdatum.'])
  })

  test('completing the range announces both dates and the length, politely', async () => {
    const { container } = await render(<Controlled initial={{ start: '2026-10-16', end: '' }} />)
    const announced = await readAnnouncements(container, () =>
      starts('fredag 23 oktober 2026').click(),
    )
    expect(announced).toEqual([
      'polite: fredag 16 oktober 2026 till fredag 23 oktober 2026 valda, 8 dagar',
    ])
  })

  test('a restart announces the new start', async () => {
    const { container } = await render(
      <Controlled initial={{ start: '2026-10-16', end: '' }} maximumDays={14} visibleMonths={2} />,
    )
    const announced = await readAnnouncements(container, () =>
      starts('fredag 6 november 2026').click(),
    )
    expect(announced).toEqual(['polite: Startdatum fredag 6 november 2026. Välj slutdatum.'])
  })

  test('selects="end" announces the end that was set', async () => {
    const { container } = await render(
      <Controlled selects="end" initial={{ start: '2026-10-16', end: '' }} />,
    )
    const announced = await readAnnouncements(container, () =>
      starts('fredag 23 oktober 2026').click(),
    )
    expect(announced).toEqual(['polite: Slutdatum fredag 23 oktober 2026 valt.'])
  })

  test('a press that changes nothing announces nothing', async () => {
    await render(<Example isDateUnavailable={(date) => date === '2026-10-16'} />)
    await starts('fredag 16 oktober 2026').click({ force: true })
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('announce={false} says nothing in range mode', async () => {
    await render(<Example announce={false} />)
    await day('fredag 16 oktober 2026').click()
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('a range changed from outside moves the Tab stop to the end the calendar chooses', async () => {
    function Pair() {
      const [value, setValue] = useState<DateRange>({ start: '', end: '' })
      return (
        <>
          <button type="button" onClick={() => setValue({ start: '2026-12-03', end: '' })}>
            Byt
          </button>
          <Example selects="end" value={value} />
        </>
      )
    }
    await render(<Pair />)
    await page.getByRole('button', { name: 'Byt' }).click()
    await expect.element(headings()).toHaveTextContent('december 2026')
  })

  test('minimumDays above maximumDays warns once and the limits are ignored', async () => {
    await render(
      <Example minimumDays={5} maximumDays={2} value={{ start: '2026-10-16', end: '' }} />,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('minimumDays'))
    await expect.element(day('lördag 17 oktober 2026, 2 dagar')).toBeVisible()
  })

  test('a range without a RangeHint warns once', async () => {
    await render(
      <KvirnProvider messages={sv}>
        <Calendar.Root today="2026-10-14" mode="range">
          <Calendar.Heading />
          <Calendar.Grid />
        </Calendar.Root>
      </KvirnProvider>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no Calendar.RangeHint'))
  })
})

describe('read aloud', () => {
  const phrasesOf = async (props: ExampleProps = {}) => {
    const { container } = await render(<Example {...props} />)
    return readAloud(container, { maxSteps: 600 })
  }

  test('a range grid reads as multi-selectable', async () => {
    const phrases = await phrasesOf()
    expect(phrases.some((phrase) => /^grid, oktober 2026.*multi-selectable/.test(phrase))).toBe(
      true,
    )
  })

  test('the start reads its date, start date and selected', async () => {
    const phrases = await phrasesOf({ value: { start: '2026-10-16', end: '2026-10-23' } })
    expect(phrases).toContain('gridcell, fredag 16 oktober 2026, startdatum, selected')
  })

  test('a day between reads as selected', async () => {
    const phrases = await phrasesOf({ value: { start: '2026-10-16', end: '2026-10-23' } })
    expect(phrases).toContain('gridcell, lördag 17 oktober 2026, selected')
  })

  test('the end reads its date, end date and selected', async () => {
    const phrases = await phrasesOf({ value: { start: '2026-10-16', end: '2026-10-23' } })
    expect(phrases).toContain('gridcell, fredag 23 oktober 2026, slutdatum, selected')
  })

  test('a possible end reads its length', async () => {
    const phrases = await phrasesOf({ value: { start: '2026-10-16', end: '' } })
    expect(phrases).toContain('gridcell, torsdag 22 oktober 2026, 7 dagar')
  })

  test('a day too far reads why it can not end the range', async () => {
    const phrases = await phrasesOf({
      value: { start: '2026-10-16', end: '' },
      maximumDays: 14,
      visibleMonths: 2,
    })
    expect(phrases).toContain('gridcell, fredag 6 november 2026, fler än 14 dagar')
  })

  test('an impossible end reads its reason and as disabled', async () => {
    const phrases = await phrasesOf({ selects: 'end', value: { start: '2026-10-16', end: '' } })
    expect(phrases).toContain('gridcell, torsdag 15 oktober 2026, före startdatumet, disabled')
  })

  test('a month button with two months announces both months, politely', async () => {
    const { container } = await render(<Example visibleMonths={2} />)
    const announced = await readAnnouncements(container, () => button('Nästa månad').click())
    expect(announced).toEqual(['polite: november 2026 och december 2026'])
  })

  test('selects="start" after the end announces the start and that the end was cleared, politely', async () => {
    const { container } = await render(
      <Controlled
        selects="start"
        initial={{ start: '2026-10-16', end: '2026-10-20' }}
        maximumDays={6}
      />,
    )
    const announced = await readAnnouncements(container, () =>
      starts('onsdag 14 oktober 2026').click(),
    )
    expect(announced).toEqual(['polite: onsdag 14 oktober 2026 vald Slutdatum rensat.'])
  })

  test('hover and an arrow key announce nothing', async () => {
    const { container } = await render(<Example value={{ start: '2026-10-16', end: '' }} />)
    starts('fredag 16 oktober 2026').element().focus()
    await expect(
      readAnnouncements(
        container,
        async () => {
          await starts('måndag 19 oktober 2026').hover()
          await userEvent.keyboard('{ArrowRight}')
        },
        { timeout: 400 },
      ),
    ).rejects.toThrow('No live-region announcement')
  })
})
