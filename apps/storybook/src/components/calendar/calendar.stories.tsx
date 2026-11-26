import { Calendar } from '@kvirn/ui'
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
  RangeCalendar,
  RangeFromToPair,
  YearButtonsCalendar,
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from './calendar.fixture.tsx'

// Components/Calendar: a month as a grid of days, styled by @kvirn/theme/theme.css (design spec
// docs/design/date-picker-and-calendar.md). It is a companion to typed entry (DateInput), never
// the only way to give a date. Every story fixes `today` to 14 October 2026.

const meta = {
  title: 'Components/Data and behaviour/Calendar',
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
      description: 'Announce the new month and what a press did. Default true.',
    },
    mode: {
      control: false,
      description:
        '`single` (default) or `range`: value, defaultValue and onValueChange are a { start, end }.',
    },
    selects: {
      control: false,
      description: 'Range: which end a press sets, both (default), start or end.',
    },
    minimumDays: { control: false, description: 'Range: the span in inclusive days, at least.' },
    maximumDays: { control: false, description: 'Range: the span in inclusive days, at most.' },
    allowUnavailableInRange: {
      control: false,
      description: 'Range: a range may pass over an unavailable day. Default false.',
    },
    visibleMonths: {
      control: false,
      description: 'The most months side by side: two from 64rem only. Default 1.',
    },
    messages: { control: false, description: 'Per-instance strings, `calendar.*`.' },
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
export const Default: Story = {}

/** No dialog: the Calendar sits in the page next to a masked field, and each follows the other. */
export const Inline: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'InlineCalendarWithField'),
  render: (_args, { globals }) => <InlineCalendarWithField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    const field = canvas.getByRole('textbox', { name: new RegExp(`^${text.oneFieldLabel}`) })
    await userEvent.type(field, '20261020')
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
    const today = grids[0]?.querySelector<HTMLElement>('[aria-current="date"]') as HTMLElement
    await userEvent.click(today)
    await expect(canvas.getByTestId('stored')).toHaveTextContent(`${text.stored}: 2026-10-14 –`)
  },
}

/** A chosen day: a primary fill, bold text and `aria-selected`. */
export const Selected: Story = {
  args: { defaultValue: '2026-10-20' },
}

/** A range: days outside it are struck through, the month buttons stop at it, and the hint says it in words. */
export const MinMax: Story = {
  args: { minimum: '2026-10-08', maximum: '2026-12-20' },
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
}

/** Today has an edge and bold text, and `aria-current="date"`. The name ends with the word for today. */
export const Today: Story = {
  args: { today: '2026-10-14', defaultValue: '2026-10-21' },
}

/** ISO week numbers in a row header column, with a Monday start. */
export const WeekNumbers: Story = {
  args: { weekNumbers: true },
}

/** `weekStart={7}`: the columns start on Sunday, and Home and End follow it. Week numbers need Monday. */
export const WeekStartSunday: Story = {
  args: { weekStart: 7 },
  globals: { locale: 'en' },
}

/** Optional year buttons, outside the month buttons, for a date far from today. */
export const YearButtons: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'YearButtonsCalendar'),
  render: (args) => <YearButtonsCalendar {...args} />,
}

/** The locales: months and weekdays from `Intl`. */
export const Locales: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'LocaleCalendars'),
  render: () => <LocaleCalendars />,
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
}

/** Right to left: the columns and the chevrons mirror, and ArrowRight moves to the previous day. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { defaultValue: '2026-10-20', minimum: '2026-10-08', maximum: '2026-12-20' },
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

const wideViewport = {
  globals: { viewport: { value: 'wide', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        wide: {
          name: '64rem and wider',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
      },
    },
  },
} as const

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
}

const rangeDays = (canvas: { getByTestId: (id: string) => HTMLElement }) =>
  canvas.getByTestId('stored')

/** Range mode, one month: the first press sets the start, the second the end. The step line says which is next. */
export const Range: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  render: () => <RangeCalendar />,
  play: async ({ canvas }) => {
    const days = canvas.getByRole('grid').querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(days[15] as HTMLElement)
    await userEvent.click(days[22] as HTMLElement)
  },
}

/** Two months side by side from 64rem (one below it), one Tab stop across both grids. */
export const RangeTwoMonths: Story = {
  ...wideViewport,
  parameters: {
    ...wideViewport.parameters,
    ...showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  },
  render: () => (
    <RangeCalendar visibleMonths={2} initial={{ start: '2026-10-28', end: '2026-11-04' }} />
  ),
}

/** A span of 2 to 15 days (up to 14 nights): the hint says it, and a day too far is named so and starts a new range. */
export const RangeSpan: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  render: () => (
    <RangeCalendar minimumDays={2} maximumDays={15} initial={{ start: '2026-10-16', end: '' }} />
  ),
  play: async ({ canvas }) => {
    const days = canvas.getByRole('grid').querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(days[30] as HTMLElement)
  },
}

/** An unavailable day blocks the range: a day beyond it starts a new range instead. */
export const RangeUnavailableBlocked: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  render: (_args, { globals }) => (
    <RangeCalendar
      initial={{ start: '2026-10-14', end: '' }}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    const days = grid.querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(days[19] as HTMLElement)
  },
}

/** `allowUnavailableInRange`: leave across a closed day. The closed days stay struck through inside the band. */
export const RangeUnavailableAllowed: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  render: (_args, { globals }) => (
    <RangeCalendar
      allowUnavailableInRange
      initial={{ start: '2026-10-14', end: '' }}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    const days = grid.querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(days[19] as HTMLElement)
  },
}

/** A start alone, the end still to choose: hovering or focusing a day previews the range up to it (drawn only). */
export const RangePartial: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeCalendar'),
  render: () => <RangeCalendar initial={{ start: '2026-10-16', end: '' }} />,
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid')
    const days = grid.querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.hover(days[19] as HTMLElement)
  },
}

/** A from/to pair on one range: the first Calendar sets the start, the second the end, and the end follows the start's month. */
export const RangeFromAndToPair: Story = {
  parameters: showSource('calendar/calendar.fixture.tsx', 'RangeFromToPair'),
  render: (_args, { globals }) => <RangeFromToPair locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const grids = canvas.getAllByRole('grid')
    const startDays = grids[0]?.querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(startDays?.[15] as HTMLElement)
    await expect(rangeDays(canvas)).toHaveTextContent('2026-10-16 –')
    const endDays = grids[1]?.querySelectorAll<HTMLElement>('[role="gridcell"]')
    await userEvent.click(endDays?.[21] as HTMLElement)
    await expect(rangeDays(canvas)).toHaveTextContent('2026-10-16 – 2026-10-22')
  },
}

/** Right to left: the band, the squared corners and the chevrons mirror, and the arrows follow the direction. */
export const RangeRTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <RangeCalendar initial={{ start: '2026-10-16', end: '2026-10-23' }} />,
}

/** Start, end, the band, a previewed end and an unavailable day stay distinguishable in forced colours. */
export const RangeForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => (
    <RangeCalendar
      allowUnavailableInRange
      initial={{ start: '2026-10-14', end: '2026-10-21' }}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
}

/** A 320px screen: one month in a range Calendar, nothing scrolls sideways. */
export const RangeNarrow: Story = {
  ...reflowViewport,
  render: () => (
    <div data-testid="narrow">
      <RangeCalendar
        visibleMonths={2}
        initial={{ start: '2026-10-16', end: '2026-10-23' }}
        minimumDays={2}
        maximumDays={15}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}
