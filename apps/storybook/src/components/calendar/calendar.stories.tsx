import { Calendar } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/calendar/calendar.a11y.md?raw'
import guide from '../../../../../packages/react/src/calendar/calendar.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { localeOf } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  FromToCalendars,
  InlineCalendarWithField,
  LocaleCalendars,
  MonthCalendar,
  YearButtonsCalendar,
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from './calendar.fixture.tsx'

// Components/Calendar: a month as a grid of days, styled by @kvirn-ui/theme/theme.css (design spec
// docs/design/date-picker-and-calendar.md). It is a companion to typed entry (DateInput), never
// the only way to give a date. Every story fixes `today` to 14 October 2026.

const meta = {
  title: 'Components/Calendar',
  component: Calendar.Root,
  argTypes: {
    value: { control: 'text', description: 'Controlled: the chosen day, `YYYY-MM-DD`.' },
    defaultValue: { control: 'text', description: 'Uncontrolled: the day chosen at first.' },
    defaultFocusedDate: {
      control: 'text',
      description: 'Where the grid opens when nothing is chosen, such as a typed date. Else today.',
    },
    onValueChange: { control: false, description: 'Called with the day when one is chosen.' },
    minimum: { control: 'text', description: 'The first day that can be chosen.' },
    maximum: { control: 'text', description: 'The last day that can be chosen.' },
    isDateUnavailable: {
      control: false,
      description: 'A day inside the range that can not be chosen. It stays focusable.',
    },
    getDateDescription: {
      control: false,
      description: 'Words added to a day name, such as why it is unavailable.',
    },
    weekStart: {
      control: 'inline-radio',
      options: [undefined, 1, 7],
      description: 'First weekday, 1 Monday to 7 Sunday. Else the provider, the locale, Monday.',
    },
    weekNumbers: {
      control: 'boolean',
      description: 'ISO week numbers. Monday start only: another start hides them and warns.',
    },
    today: { control: 'text', description: 'Today, for tests and stories. Else the clock.' },
    announce: {
      control: 'boolean',
      description: 'Announce the new month and the chosen day. Default true.',
    },
    messages: { control: false, description: 'Per-instance strings, `calendar.*`.' },
    render: { control: false, description: 'Another element for the Root.' },
  },
  args: { today: '2026-10-14', weekNumbers: false, announce: true, onValueChange: fn() },
  globals: { locale: 'sv' },
  decorators: [withCalendarProvider],
  render: (args) => <MonthCalendar {...args} />,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Calendar.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: October 2026 with today marked, one Tab stop in the grid. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    await expect(grid).toHaveAccessibleName(canvas.getByRole('heading', { level: 3 }).textContent)
    await expect(canvas.getAllByRole('gridcell', { hidden: false }).length).toBeGreaterThan(27)
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(7)
    await expect(grid.querySelectorAll('[aria-current="date"]')).toHaveLength(1)
  },
}

/** No dialog: the Calendar sits in the page next to a masked field, and each follows the other. */
export const Inline: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'InlineCalendarWithField'),
  render: (_args, { globals }) => <InlineCalendarWithField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    const field = canvas.getByRole('textbox', { name: new RegExp(`^${text.oneFieldLabel}`) })
    await userEvent.type(field, '20261020')
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('20')
    await userEvent.click(canvas.getByRole('gridcell', { name: /\b21\b/ }))
    await expect(canvas.getByTestId('stored')).toHaveTextContent(`${text.stored}: 2026-10-21`)
  },
}

/**
 * Two inline Calendars, "from" and "to", each a single date: the "to" Calendar's minimum is the
 * "from" day. A preview of the range picker, which is not built yet. They stack below 40rem.
 */
export const FromAndTo: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'FromToCalendars'),
  render: (_args, { globals }) => <FromToCalendars locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    const grids = canvas.getAllByRole('grid')
    await expect(grids).toHaveLength(2)
    await expect(canvas.getAllByRole('group')).toHaveLength(2)
    const today = grids[0]?.querySelector<HTMLElement>('[aria-current="date"]') as HTMLElement
    await userEvent.click(today)
    await expect(canvas.getByTestId('stored')).toHaveTextContent(`${text.stored}: 2026-10-14 –`)
    await expect(grids[1]?.querySelectorAll('[data-outside-range]').length).toBeGreaterThan(0)
  },
}

/** A chosen day: a primary fill, bold text and `aria-selected`. */
export const Selected: Story = {
  args: { defaultValue: '2026-10-20' },
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    await expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(1)
    await expect(grid.querySelector('[data-selected]')).toHaveAttribute('tabindex', '0')
  },
}

/** A range: days outside it are struck through, the month buttons stop at it, and the hint says it in words. */
export const MinMax: Story = {
  args: { minimum: '2026-10-08', maximum: '2026-12-20' },
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    await expect(grid.querySelectorAll('[data-outside-range]').length).toBeGreaterThan(0)
    await expect(grid).toHaveAccessibleDescription()
    const [previous] = canvas.getAllByRole('button')
    await expect(previous).toHaveAttribute('aria-disabled', 'true')
  },
}

/** Unavailable days stay focusable and say why in their name. Prefer radios when most days are unavailable. */
export const UnavailableDates: Story = {
  render: (args, { globals }) => (
    <MonthCalendar
      {...args}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    await expect(grid.querySelectorAll('[data-unavailable]')).toHaveLength(closedDays.size)
    const closed = grid.querySelector<HTMLElement>('[data-unavailable]')
    await expect(closed).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(closed as HTMLElement)
    await expect(grid.querySelector('[aria-selected]')).toBeNull()
  },
}

/** Today has an edge and bold text, and `aria-current="date"`. The name ends with the word for today. */
export const Today: Story = {
  args: { today: '2026-10-14', defaultValue: '2026-10-21' },
  play: async ({ canvas }) => {
    const today = canvas.getByRole('grid').querySelector('[aria-current="date"]')
    await expect(today).toHaveAttribute('data-today')
    await expect(today).not.toHaveAttribute('aria-selected')
  },
}

/** ISO week numbers in a row header column, with a Monday start. */
export const WeekNumbers: Story = {
  args: { weekNumbers: true },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('rowheader').length).toBeGreaterThanOrEqual(5)
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(8)
  },
}

/** `weekStart={7}`: the columns start on Sunday, and Home and End follow it. Week numbers need Monday. */
export const WeekStartSunday: Story = {
  args: { weekStart: 7 },
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    const first = canvas.getAllByRole('columnheader')[0]
    await expect(first).toHaveTextContent(/sun/i)
  },
}

/** Optional year buttons, outside the month buttons, for a date far from today. */
export const YearButtons: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'YearButtonsCalendar'),
  render: (args) => <YearButtonsCalendar {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(4)
    await userEvent.click(canvas.getAllByRole('button')[3] as HTMLElement)
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('2027')
  },
}

/** The seven locales: months and weekdays from `Intl`; `se` is English text with Sámi names from the browser. */
export const Locales: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'LocaleCalendars'),
  render: () => <LocaleCalendars />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('grid')).toHaveLength(7)
  },
}

/** Staff density from 64rem: day cells are 32px. */
export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="kv-compact">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const cell = canvas.getByRole('grid').querySelector('[role="gridcell"]')
    await expect(cell).toBeInTheDocument()
  },
}

/** Right to left: the columns and the chevrons mirror, and ArrowRight moves to the previous day. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { defaultValue: '2026-10-20', minimum: '2026-10-08', maximum: '2026-12-20' },
  play: async ({ canvas }) => {
    const today = canvas.getByRole('grid').querySelector<HTMLElement>('[aria-current="date"]')
    today?.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('grid').contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).not.toBe(today)
  },
}

/** Selected, today, unavailable and the month buttons stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { defaultValue: '2026-10-20', minimum: '2026-10-08' },
  render: (args, { globals }) => (
    <MonthCalendar
      {...args}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
}

const reflowViewport = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        reflow: { name: '400% zoom', styles: { width: '320px', height: '256px' }, type: 'mobile' },
      },
    },
  },
} as const

/** A 320px screen (400% zoom): the heading takes its own row, cells are 36px with week numbers, nothing scrolls sideways. */
export const Narrow: Story = {
  ...reflowViewport,
  args: { weekNumbers: true, defaultValue: '2026-10-20' },
  decorators: [
    (Story) => (
      <div data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

/** The same 320px screen without week numbers: 40px cells, 7 × 40 + 8 × 4 = 312px. */
export const NarrowWithoutWeekNumbers: Story = {
  ...Narrow,
  args: { weekNumbers: false, defaultValue: '2026-10-20' },
}

/**
 * Try the keys in the Keyboard section above: Tab reaches the month buttons and then the grid as
 * one stop, the arrow keys, Home, End, PageUp and PageDown move through the days, and Enter or
 * Space chooses one.
 */
export const Keyboard: Story = {
  args: { minimum: '2026-09-01', maximum: '2026-12-31' },
  play: async ({ canvas, args }) => {
    const grid = canvas.getByRole('grid')
    const today = grid.querySelector<HTMLElement>('[aria-current="date"]')
    today?.focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-15')
    const monthBefore = canvas.getByRole('heading', { level: 3 }).textContent
    await userEvent.keyboard('{PageDown}')
    await expect(canvas.getByRole('heading', { level: 3 }).textContent).not.toBe(monthBefore)
  },
}
