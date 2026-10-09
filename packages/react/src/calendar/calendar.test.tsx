import { sv } from '@kvirn-ui/i18n/sv'
import { act, useState } from 'react'
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Calendar } from './calendar.tsx'
import type { CalendarRootProps } from './calendar.tsx'
import { resolveIntlLocale } from './calendar-intl.ts'

// Contract: calendar.a11y.md. The date arithmetic is proved in core (calendar-keys.test.ts); these
// tests prove the wiring: roles, names, states, focus, preventDefault and announcements.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
  vi.restoreAllMocks()
})

function Example({
  dir,
  locale = 'sv',
  ...props
}: Partial<CalendarRootProps> & { dir?: 'ltr' | 'rtl' | undefined; locale?: string | undefined }) {
  return (
    <KvirnProvider locale={locale} dir={dir} messages={sv}>
      <button type="button">Före</button>
      <Calendar.Root today="2026-10-14" {...props}>
        <Calendar.PreviousYear />
        <Calendar.PreviousMonth />
        <Calendar.Heading />
        <Calendar.NextMonth />
        <Calendar.NextYear />
        <Calendar.RangeHint />
        <Calendar.Grid />
      </Calendar.Root>
      <button type="button">Efter</button>
    </KvirnProvider>
  )
}

describe('Calendar without a time zone', () => {
  const todayWarnings = () =>
    consoleWarn.mock.calls.filter(([message]) => String(message).includes('timeZone'))

  test('working out "today" without a provider time zone warns once, naming the fix', async () => {
    await render(
      <>
        <Calendar.Root>
          <Calendar.Grid />
        </Calendar.Root>
        <Calendar.Root>
          <Calendar.Grid />
        </Calendar.Root>
      </>,
    )
    expect(todayWarnings()).toHaveLength(1)
    expect(String(todayWarnings()[0]?.[0])).toContain('Pass `timeZone` on <KvirnProvider>')
  })

  test('a provider time zone, or an explicit today, does not warn', async () => {
    await render(
      <>
        <KvirnProvider timeZone="Europe/Stockholm">
          <Calendar.Root>
            <Calendar.Grid />
          </Calendar.Root>
        </KvirnProvider>
        <Calendar.Root today="2026-10-14">
          <Calendar.Grid />
        </Calendar.Root>
      </>,
    )
    expect(todayWarnings()).toHaveLength(0)
  })

  describe('"today" and the browser zone', () => {
    const stubBrowserZone = (zone: string) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: zone,
      } as Intl.ResolvedDateTimeFormatOptions)
    }
    afterEach(() => {
      vi.useRealTimers()
    })

    test('a Calendar mounted after hydration starts on the browser date with the Tab stop on it', async () => {
      stubBrowserZone('Pacific/Auckland')
      await render(
        <KvirnProvider locale="sv" messages={sv}>
          <Calendar.Root>
            <Calendar.Grid />
          </Calendar.Root>
        </KvirnProvider>,
      )
      const browserDay = day('torsdag 15 oktober 2026, idag')
      await expect.element(browserDay).toHaveAttribute('aria-current', 'date')
      await expect.element(browserDay).toHaveAttribute('tabindex', '0')
      await expect.element(day('onsdag 14 oktober 2026')).not.toHaveAttribute('aria-current')
      await expect.element(day('onsdag 14 oktober 2026')).toHaveAttribute('tabindex', '-1')
    })

    test('a provider timeZone is honoured and the browser zone is ignored', async () => {
      stubBrowserZone('Pacific/Auckland')
      await render(
        <KvirnProvider locale="sv" messages={sv} timeZone="America/New_York">
          <Calendar.Root>
            <Calendar.Grid />
          </Calendar.Root>
        </KvirnProvider>,
      )
      await expect.element(today()).toHaveAttribute('aria-current', 'date')
    })

    test('an explicit today is never moved by the browser zone', async () => {
      stubBrowserZone('Pacific/Auckland')
      await render(<Example />)
      await expect.element(today()).toHaveAttribute('aria-current', 'date')
    })
  })
})

const day = (name: string) => page.getByRole('gridcell', { name, exact: true })
const today = () => day('onsdag 14 oktober 2026, idag')
const button = (name: string) => page.getByRole('button', { name, exact: true })
const politeRegion = () => page.getByRole('status')

/** The `defaultPrevented` of each keydown, read after the component's own handler has run. */
function recordDefaultPrevented() {
  const results: boolean[] = []
  const listener = (event: KeyboardEvent) => {
    if (event.key !== 'Alt') results.push(event.defaultPrevented)
  }
  document.addEventListener('keydown', listener)
  onTestFinished(() => document.removeEventListener('keydown', listener))
  return () => results
}

describe('roles, names and states', () => {
  test('the grid is a table with role grid, named by the heading', async () => {
    await render(<Example />)
    const grid = page.getByRole('grid', { name: 'oktober 2026' })
    await expect.element(grid).toBeVisible()
    expect(grid.element().tagName).toBe('TABLE')
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('oktober 2026')
  })

  test('the range hint describes the grid', async () => {
    await render(<Example minimum="2026-10-01" maximum="2026-12-31" />)
    await expect
      .element(page.getByRole('grid'))
      .toHaveAccessibleDescription('Datum från 1 oktober 2026 till 31 december 2026')
  })

  test('without a range there is no hint and no description', async () => {
    await render(<Example />)
    await expect.element(page.getByRole('grid')).not.toHaveAccessibleDescription()
    expect(document.querySelector('.kv-calendar-range')).toBeNull()
  })

  test('column headers carry the long weekday name in the week-start order', async () => {
    await render(<Example />)
    const headers = page.getByRole('columnheader').elements()
    expect(headers.map((header) => header.textContent)).toEqual([
      'månmåndag',
      'tistisdag',
      'onsonsdag',
      'torstorsdag',
      'frefredag',
      'lörlördag',
      'sönsöndag',
    ])
    expect(document.querySelectorAll('thead [aria-hidden="true"]')).toHaveLength(7)
  })

  test('a day is a gridcell named by its full date, with idag on today only', async () => {
    await render(<Example />)
    await expect.element(today()).toHaveAttribute('aria-current', 'date')
    await expect.element(day('torsdag 15 oktober 2026')).not.toHaveAttribute('aria-current')
  })

  test('only the chosen day has aria-selected, set from value', async () => {
    await render(<Example value="2026-10-20" />)
    const selected = day('tisdag 20 oktober 2026')
    await expect.element(selected).toHaveAttribute('aria-selected', 'true')
    expect(document.querySelectorAll('[aria-selected]')).toHaveLength(1)
  })

  test('a unavailable day is aria-disabled, keeps its description and stays focusable', async () => {
    await render(
      <Example
        isDateUnavailable={(date) => date === '2026-10-16'}
        getDateDescription={(date) => (date === '2026-10-16' ? 'Återvinningen stängd' : undefined)}
      />,
    )
    const closed = day('fredag 16 oktober 2026, Återvinningen stängd')
    await expect.element(closed).toHaveAttribute('aria-disabled', 'true')
    await expect.element(closed).toHaveAttribute('data-unavailable')
    expect(closed.element().getAttribute('tabindex')).toBe('-1')
  })

  test('a day outside minimum and maximum is aria-disabled', async () => {
    await render(<Example minimum="2026-10-10" maximum="2026-10-20" />)
    await expect.element(day('torsdag 1 oktober 2026')).toHaveAttribute('data-outside-range')
    await expect.element(day('torsdag 1 oktober 2026')).toHaveAttribute('aria-disabled', 'true')
  })

  test('the days outside the month are empty cells with no name and no tabindex', async () => {
    await render(<Example />)
    const empty = document.querySelectorAll('td.kv-calendar-empty')
    expect(empty.length).toBeGreaterThan(0)
    for (const cell of empty) {
      expect(cell.hasAttribute('tabindex')).toBe(false)
      expect(cell.hasAttribute('aria-label')).toBe(false)
    }
  })

  test('week numbers are row headers named Vecka N, from a Monday start', async () => {
    await render(<Example weekNumbers />)
    await expect.element(page.getByRole('rowheader', { name: 'Vecka 42' })).toHaveTextContent('42')
    await expect.element(page.getByRole('columnheader', { name: 'Vecka' })).toBeInTheDocument()
  })

  test('week numbers are hidden and warned about with a Sunday start', async () => {
    await render(<Example weekNumbers weekStart={7} />)
    expect(page.getByRole('rowheader').elements()).toHaveLength(0)
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('week numbers are hidden'))
  })

  test('the month buttons are named from the catalog', async () => {
    await render(<Example />)
    for (const name of ['Föregående månad', 'Nästa månad', 'Föregående år', 'Nästa år']) {
      await expect.element(button(name)).toBeVisible()
    }
  })

  test('at minimum a month button is aria-disabled and still focusable, not natively disabled', async () => {
    await render(<Example minimum="2026-10-01" />)
    const previous = button('Föregående månad')
    await expect.element(previous).toHaveAttribute('aria-disabled', 'true')
    await expect.element(previous).not.toHaveAttribute('disabled')
    previous.element().focus()
    await expect.element(previous).toHaveFocus()
  })

  test('a Sunday week start orders the columns from söndag', async () => {
    await render(<Example weekStart={7} />)
    expect(page.getByRole('columnheader').elements()[0]?.textContent).toBe('sönsöndag')
  })

  test('a chosen locale writes the month and the names in it', async () => {
    await render(<Example locale="fi" />)
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('lokakuu 2026')
  })
})

describe('keyboard', () => {
  test('Tab moves from before the calendar through the month buttons to the grid, one stop', async () => {
    await render(<Example />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    for (const name of ['Föregående år', 'Föregående månad', 'Nästa månad', 'Nästa år']) {
      await userEvent.tab()
      await expect.element(button(name)).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(today()).toHaveFocus()
    await userEvent.tab()
    await expect.element(button('Efter')).toHaveFocus()
  })

  test('Shift+Tab moves from the grid back to the month buttons', async () => {
    await render(<Example />)
    today().element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Nästa år')).toHaveFocus()
  })

  test('the grid opens on defaultFocusedDate when nothing is chosen', async () => {
    await render(<Example defaultFocusedDate="2026-10-20" />)
    expect(
      document.querySelector('[role="gridcell"][tabindex="0"]')?.getAttribute('aria-label'),
    ).toBe('tisdag 20 oktober 2026')
  })

  test('ArrowRight moves focus to the next day and the key is not left native', async () => {
    await render(<Example />)
    today().element().focus()
    const prevented = recordDefaultPrevented()
    await userEvent.keyboard('{ArrowRight}')
    expect(prevented()).toEqual([true])
    await expect.element(day('torsdag 15 oktober 2026')).toHaveFocus()
  })

  test('ArrowLeft moves focus to the previous day', async () => {
    await render(<Example />)
    today().element().focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(day('tisdag 13 oktober 2026')).toHaveFocus()
  })

  test('ArrowRight and ArrowLeft flip in RTL', async () => {
    await render(<Example dir="rtl" />)
    today().element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(day('tisdag 13 oktober 2026')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await expect.element(day('torsdag 15 oktober 2026')).toHaveFocus()
  })

  test('ArrowDown and ArrowUp move a week and do not flip in RTL', async () => {
    await render(<Example dir="rtl" />)
    today().element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(day('onsdag 21 oktober 2026')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(day('onsdag 7 oktober 2026')).toHaveFocus()
  })

  test('an arrow past the last day crosses into the next month and the heading follows', async () => {
    await render(<Example defaultFocusedDate="2026-10-31" />)
    page
      .getByRole('gridcell', { name: /^lördag 31 oktober 2026/ })
      .element()
      .focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(day('söndag 1 november 2026')).toHaveFocus()
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('november 2026')
  })

  test('Home and End go to the first and last day of the week by the week start', async () => {
    await render(<Example />)
    today().element().focus()
    await userEvent.keyboard('{Home}')
    await expect.element(day('måndag 12 oktober 2026')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect.element(day('söndag 18 oktober 2026')).toHaveFocus()
  })

  test('Home and End follow a Sunday week start', async () => {
    await render(<Example weekStart={7} />)
    today().element().focus()
    await userEvent.keyboard('{Home}')
    await expect.element(day('söndag 11 oktober 2026')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect.element(day('lördag 17 oktober 2026')).toHaveFocus()
  })

  test('PageDown and PageUp move a month', async () => {
    await render(<Example />)
    today().element().focus()
    await userEvent.keyboard('{PageDown}')
    await expect.element(day('lördag 14 november 2026')).toHaveFocus()
    await userEvent.keyboard('{PageUp}')
    await expect.element(today()).toHaveFocus()
  })

  test('Shift+PageDown and Shift+PageUp move a year', async () => {
    await render(<Example />)
    today().element().focus()
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}')
    await expect.element(day('torsdag 14 oktober 2027')).toHaveFocus()
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}')
    await expect.element(today()).toHaveFocus()
  })

  test('at the edge of the range the key is still taken and focus stays', async () => {
    await render(<Example today="2026-10-12" minimum="2026-10-12" maximum="2026-10-14" />)
    const first = day('måndag 12 oktober 2026, idag')
    first.element().focus()
    const prevented = recordDefaultPrevented()
    await userEvent.keyboard('{ArrowLeft}')
    expect(prevented()).toEqual([true])
    await expect.element(first).toHaveFocus()
  })

  test('a key with Control, Alt or Meta is left native', async () => {
    await render(<Example />)
    today().element().focus()
    const prevented = recordDefaultPrevented()
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}')
    expect(prevented()).toEqual([false])
    await expect.element(today()).toHaveFocus()
  })

  test('Enter selects an available day and reports it', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(<Example onValueChange={onValueChange} />)
    today().element().focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-10-15')
    await expect.element(day('torsdag 15 oktober 2026')).toHaveAttribute('aria-selected', 'true')
  })

  test('Space selects an available day and does not scroll the page', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(<Example onValueChange={onValueChange} />)
    today().element().focus()
    const prevented = recordDefaultPrevented()
    await userEvent.keyboard('{ }')
    expect(prevented()).toEqual([true])
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-10-14')
  })

  test('Enter and Space on an unavailable day select nothing', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(
      <Example onValueChange={onValueChange} isDateUnavailable={(date) => date === '2026-10-15'} />,
    )
    today().element().focus()
    await userEvent.keyboard('{ArrowRight}{Enter}{ }')
    await expect.element(day('torsdag 15 oktober 2026')).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(document.querySelector('[aria-selected]')).toBeNull()
  })

  test('a click selects a day, and a click on one outside the range does not', async () => {
    const onValueChange = vi.fn<(date: string) => void>()
    await render(<Example onValueChange={onValueChange} maximum="2026-10-20" />)
    await day('fredag 16 oktober 2026').click()
    await day('onsdag 21 oktober 2026').click({ force: true })
    expect(onValueChange.mock.calls).toEqual([['2026-10-16']])
  })

  test('Enter on a month button shows that month and focus stays on the button', async () => {
    await render(<Example />)
    button('Nästa månad').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('november 2026')
    await expect.element(button('Nästa månad')).toHaveFocus()
    expect(
      document.querySelector('[role="gridcell"][tabindex="0"]')?.getAttribute('aria-label'),
    ).toBe('lördag 14 november 2026')
  })

  test('Space on a year button shows the same month a year on', async () => {
    await render(<Example />)
    button('Nästa år').element().focus()
    await userEvent.keyboard('{ }')
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('oktober 2027')
  })

  test('Enter on a month button at the edge does nothing and focus stays', async () => {
    await render(<Example minimum="2026-10-01" />)
    button('Föregående månad').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('oktober 2026')
    await expect.element(button('Föregående månad')).toHaveFocus()
  })

  test('Escape is not handled by a standalone calendar', async () => {
    await render(<Example />)
    today().element().focus()
    const prevented = recordDefaultPrevented()
    await userEvent.keyboard('{Escape}')
    expect(prevented()).toEqual([false])
  })
})

describe('announcements', () => {
  test('a month button announces the new month, politely', async () => {
    await render(<Example />)
    await button('Nästa månad').click()
    await expect.element(politeRegion()).toHaveTextContent('november 2026')
  })

  test('two quick presses announce the latest month', async () => {
    await render(<Example />)
    await button('Nästa månad').click()
    await button('Nästa månad').click()
    await expect.element(politeRegion()).toHaveTextContent('december 2026')
  })

  test('a key that crosses a month announces nothing: the day name carries it', async () => {
    await render(<Example defaultFocusedDate="2026-10-31" />)
    page
      .getByRole('gridcell', { name: /^lördag 31 oktober 2026/ })
      .element()
      .focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(day('söndag 1 november 2026')).toHaveFocus()
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('choosing a day announces it, politely', async () => {
    await render(<Example />)
    await day('fredag 16 oktober 2026').click()
    await expect.element(politeRegion()).toHaveTextContent('fredag 16 oktober 2026 vald')
  })

  test('announce={false} says nothing', async () => {
    await render(<Example announce={false} />)
    await button('Nästa månad').click()
    await day('måndag 16 november 2026').click()
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(politeRegion()).toHaveTextContent('')
  })
})

describe('state', () => {
  test('a controlled value follows the prop', async () => {
    function Controlled() {
      const [value, setValue] = useState('2026-10-20')
      return (
        <>
          <button type="button" onClick={() => setValue('2026-10-22')}>
            Byt
          </button>
          <Example value={value} />
        </>
      )
    }
    await render(<Controlled />)
    await expect.element(day('tisdag 20 oktober 2026')).toHaveAttribute('aria-selected', 'true')
    await page.getByRole('button', { name: 'Byt' }).click()
    await expect.element(day('torsdag 22 oktober 2026')).toHaveAttribute('aria-selected', 'true')
    expect(document.querySelectorAll('[aria-selected]')).toHaveLength(1)
  })

  test('a day chosen when uncontrolled stays chosen', async () => {
    await render(<Example defaultValue="2026-10-20" />)
    await expect.element(day('tisdag 20 oktober 2026')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('development warnings and locale', () => {
  test('a Calendar.Grid without a Heading warns once', async () => {
    await render(
      <KvirnProvider>
        <Calendar.Root today="2026-10-14">
          <Calendar.Grid />
        </Calendar.Root>
      </KvirnProvider>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no Calendar.Heading'))
  })

  test('a range without a RangeHint warns once', async () => {
    await render(
      <KvirnProvider>
        <Calendar.Root today="2026-10-14" minimum="2026-10-01">
          <Calendar.Heading />
          <Calendar.Grid />
        </Calendar.Root>
      </KvirnProvider>,
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('no Calendar.RangeHint'))
  })

  test('a part outside Calendar.Root renders nothing and warns', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Calendar.Grid />
      </KvirnProvider>,
    )
    expect(container.querySelector('table')).toBeNull()
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('outside Calendar.Root'))
  })

  test('a locale the browser has no data for falls back by region: se-FI to fi, se-SE to sv, else nb', () => {
    const unsupported = () => false
    expect(resolveIntlLocale('se-FI', unsupported)).toBe('fi')
    expect(resolveIntlLocale('se-SE', unsupported)).toBe('sv')
    expect(resolveIntlLocale('se-NO', unsupported)).toBe('nb')
    expect(resolveIntlLocale('se', unsupported)).toBe('nb')
    expect(resolveIntlLocale('se', () => true)).toBe('se')
    expect(resolveIntlLocale('sv-FI', unsupported)).toBe('sv-FI')
  })
})

describe('read aloud', () => {
  const phrasesOf = async (props: Parameters<typeof Example>[0] = {}) => {
    const { container } = await render(<Example {...props} />)
    return readAloud(container, { maxSteps: 400 })
  }

  test('today reads as a gridcell with its full date, idag and the current date', async () => {
    const phrases = await phrasesOf()
    expect(phrases).toContain('grid, oktober 2026')
    expect(phrases).toContain('gridcell, onsdag 14 oktober 2026, idag, current date')
  })

  test('the chosen day reads as selected', async () => {
    const phrases = await phrasesOf({ value: '2026-10-16' })
    expect(phrases).toContain('gridcell, fredag 16 oktober 2026, selected')
  })

  test('an unavailable day reads its reason and as disabled', async () => {
    const phrases = await phrasesOf({
      isDateUnavailable: (date) => date === '2026-10-16',
      getDateDescription: (date) => (date === '2026-10-16' ? 'Återvinningen stängd' : undefined),
    })
    expect(phrases).toContain('gridcell, fredag 16 oktober 2026, Återvinningen stängd, disabled')
  })

  test('a month button at the edge reads as a disabled button', async () => {
    const phrases = await phrasesOf({ minimum: '2026-10-01' })
    expect(phrases).toContain('button, Föregående månad, disabled')
  })

  test('a range is the grid description', async () => {
    const phrases = await phrasesOf({ minimum: '2026-10-01' })
    expect(phrases).toContain('grid, oktober 2026, Datum från 1 oktober 2026')
  })

  test('a week number reads as a row header named Vecka 42', async () => {
    const phrases = await phrasesOf({ weekNumbers: true })
    expect(phrases).toContain('rowheader, Vecka 42')
  })

  test('Next month announces the new month, politely', async () => {
    const { container } = await render(<Example />)
    const announced = await readAnnouncements(container, () => button('Nästa månad').click())
    expect(announced).toEqual(['polite: november 2026'])
  })

  test('choosing a day announces it, politely', async () => {
    const { container } = await render(<Example />)
    const announced = await readAnnouncements(container, () =>
      day('fredag 16 oktober 2026').click(),
    )
    expect(announced).toEqual(['polite: fredag 16 oktober 2026 vald'])
  })
})

describe('language, messages and settings', () => {
  test('a locale the browser has no data for marks the heading and column headers, not the grid', async () => {
    const original = Intl.DateTimeFormat.supportedLocalesOf
    vi.spyOn(Intl.DateTimeFormat, 'supportedLocalesOf').mockImplementation((locales, options) =>
      String(locales).startsWith('se') ? [] : original(locales, options),
    )
    await render(<Example locale="se-FI" messages={undefined} />)
    expect(document.querySelector('h3')?.getAttribute('lang')).toBe('fi')
    const headers = document.querySelectorAll('th.kv-calendar-weekday')
    expect(headers).toHaveLength(7)
    for (const header of headers) {
      expect(header.getAttribute('lang')).toBe('fi')
    }
    expect(document.querySelector('table')?.hasAttribute('lang')).toBe(false)
    expect(document.querySelector('h3')?.textContent).toBe('lokakuu 2026')
  })

  test('a per-instance messages override replaces the catalog string', async () => {
    await render(<Example messages={{ nextMonth: 'Förra veckan, fast framåt' }} />)
    await expect.element(button('Förra veckan, fast framåt')).toBeVisible()
  })

  test('an invalid weekStart falls back to the provider setting', async () => {
    await render(<Example weekStart={9 as 1} />)
    expect(page.getByRole('columnheader').elements()[0]?.textContent).toBe('månmåndag')
  })

  test('without a provider nothing is announced and a development warning says so', async () => {
    await render(
      <Calendar.Root today="2026-10-14">
        <Calendar.NextMonth />
        <Calendar.Heading />
        <Calendar.Grid />
      </Calendar.Root>,
    )
    await page.getByRole('button', { name: 'Next month' }).click()
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('outside a <KvirnProvider>'))
  })

  test('a new range that moves the focused day to another month keeps focus in the grid', async () => {
    let narrow: () => void = () => {}
    function Range() {
      const [minimum, setMinimum] = useState('2026-09-01')
      narrow = () => setMinimum('2026-11-20')
      return <Example minimum={minimum} />
    }
    await render(<Range />)
    today().element().focus()
    await act(async () => narrow())
    await expect.element(day('fredag 20 november 2026')).toHaveFocus()
  })

  test('a controlled value that changes moves the Tab stop and the month to it', async () => {
    function Controlled() {
      const [value, setValue] = useState('2026-10-20')
      return (
        <>
          <button type="button" onClick={() => setValue('2026-12-03')}>
            Byt
          </button>
          <Example value={value} />
        </>
      )
    }
    await render(<Controlled />)
    await page.getByRole('button', { name: 'Byt' }).click()
    await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('december 2026')
    expect(
      document.querySelector('[role="gridcell"][tabindex="0"]')?.getAttribute('aria-label'),
    ).toBe('torsdag 3 december 2026')
  })
})
