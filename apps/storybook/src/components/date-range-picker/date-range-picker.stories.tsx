import { DateRangePicker } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/date-range-picker/date-range-picker.a11y.md?raw'
import guide from '../../../../../packages/react/src/date-range-picker/date-range-picker.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  DateInputRangePicker,
  LocaleRangePickers,
  MaskedRangePicker,
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from './date-range-picker.fixture.tsx'

// Components/DateRangePicker: one button after a From and a To date that opens a modal Dialog
// holding a range Calendar (contract: date-range-picker.a11y.md; design spec
// docs/design/date-range.md). Typing always works: the dialog is the slower path. Every story fixes
// `today` to 14 October 2026, and none starts open: a story that shows the dialog opens it in `play`.

const source = (...names: string[]) =>
  showSource('date-range-picker/date-range-picker.fixture.tsx', ...names)

const meta = {
  title: 'Components/Forms/DateRangePicker',
  component: DateRangePicker.Root,
  argTypes: {
    value: {
      control: false,
      description:
        'The fields’ range, `{ start, end }` as `YYYY-MM-DD`, `""` for an empty end. Controlled only.',
    },
    onValueChange: {
      control: false,
      description: 'Called once, with the finished range, when the end is chosen.',
    },
    open: {
      control: 'boolean',
      description:
        'Controlled: whether the dialog is open. Pair it with `onOpenChange`. Else it is mounted closed and never starts open.',
    },
    onOpenChange: {
      control: false,
      description:
        'Called with `(open, { reason, event })`; reason `"select"` when the end was chosen.',
    },
    minimum: { control: 'text', description: 'The first day that can be chosen.' },
    maximum: { control: 'text', description: 'The last day that can be chosen.' },
    minimumDays: { control: 'number', description: 'The fewest days, counting both ends.' },
    maximumDays: {
      control: 'number',
      description: 'The most days, counting both ends. 14 nights is 15.',
    },
    allowUnavailableInRange: {
      control: 'boolean',
      description: 'A range may pass over an unavailable day. Default false.',
    },
    isDateUnavailable: {
      control: false,
      description: 'A day inside the range that can not be chosen.',
    },
    getDateDescription: {
      control: false,
      description: 'Words added to a day name, such as why it is unavailable.',
    },
    weekStart: {
      control: 'inline-radio',
      options: [undefined, 1, 7],
      description: 'First weekday, 1 Monday to 7 Sunday.',
    },
    weekNumbers: { control: 'boolean', description: 'ISO week numbers. Monday start only.' },
    today: {
      control: 'text',
      description: 'Today, for tests and stories. Else the clock, read each time the dialog opens.',
    },
    messages: {
      control: false,
      description: 'Per-instance strings, `dateRangePicker.trigger` and `dateRangePicker.title`.',
    },
    calendarMessages: {
      control: false,
      description: 'Per-instance strings for the Calendar and "{start} to {end} selected".',
    },
  },
  args: { onValueChange: fn(), onOpenChange: fn() },
  globals: { locale: 'sv' },
  decorators: [withCalendarProvider],
  render: (args, { globals }) => <MaskedRangePicker {...args} locale={localeOf(globals)} />,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof DateRangePicker.Root>

export default meta
type Story = StoryObj<typeof meta>

const modalDialog = () => document.querySelector<HTMLDialogElement>('dialog.kv-dialog:modal')

const openFrom = async (trigger: HTMLElement) => {
  await userEvent.click(trigger)
  await waitFor(() => expect(modalDialog()).not.toBeNull())
}

// A picker never starts open, so a story that shows the open dialog opens it from its play,
// which also keeps the Docs page closed: every modal dialog is in the top layer and would stack.
const openPicker = (canvas: {
  getByRole: (role: 'button', options: { name: RegExp }) => HTMLElement
}) => openFrom(canvas.getByRole('button', { name: /^(Välj datumen|Choose dates)$/ }))

const dayStartingWith = (
  canvas: { getByRole: (role: 'gridcell', options: { name: RegExp }) => HTMLElement },
  text: string,
) => canvas.getByRole('gridcell', { name: new RegExp(`^${text}`) })

/** The main example: two `masks.date()` fields and one "Välj datumen" after both. Two presses choose the range: the first sets the start, the second the end, and both fields are written in their own format. */
export const Default: Story = {
  parameters: source('MaskedRangePicker'),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datumen' })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(modalDialog()).toBeNull()
    await openFrom(trigger)
    await waitFor(() => expect(dayStartingWith(canvas, 'onsdag 14 oktober 2026')).toHaveFocus())
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{ArrowRight}')
    await expect(modalDialog()).not.toBeNull()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByRole('textbox', { name: /^Ankomst/ })).toHaveValue('2026-10-14')
    await expect(canvas.getByRole('textbox', { name: /^Avresa/ })).toHaveValue('2026-10-17')
    await expect(trigger).toHaveFocus()
  },
}

/** Open: the page behind is inert, focus is on today, and the step line says to choose the start. From 64rem two months show side by side, below it one. */
export const Open: Story = {
  parameters: source('MaskedRangePicker'),
  play: async ({ canvas }) => {
    await openPicker(canvas)
    const dialog = canvas.getByRole('dialog', { name: 'Välj perioden' })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(
      canvas.getByRole('gridcell', { name: 'onsdag 14 oktober 2026, idag' }),
    ).toHaveFocus()
    const isWide = window.matchMedia('(min-width: 64rem)').matches
    await expect(canvas.getAllByRole('grid')).toHaveLength(isWide ? 2 : 1)
  },
}

/** A typed range: the dialog opens on its start with the whole range selected. Escape drops anything pressed since, so both fields stay as they were. */
export const WithValue: Story = {
  parameters: source('MaskedRangePicker'),
  render: (args, { globals }) => (
    <MaskedRangePicker
      {...args}
      locale={localeOf(globals)}
      initial={{ start: '2026-10-16', end: '2026-10-23' }}
    />
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datumen' })
    await openFrom(trigger)
    const start = dayStartingWith(canvas, 'fredag 16 oktober 2026')
    await expect(start).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(start).toHaveFocus())
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByTestId('stored')).toHaveTextContent('2026-10-16 – 2026-10-23')
    await expect(trigger).toHaveFocus()
  },
}

/** A booking window with closed days: they stay focusable, struck through, and block a range that would pass over them. The limit is in the help text, in nights. */
export const Booking: Story = {
  args: { minimum: '2026-10-08', maximum: '2026-12-20', maximumDays: 15 },
  parameters: source('MaskedRangePicker'),
  render: (args, { globals }) => (
    <MaskedRangePicker
      {...args}
      locale={localeOf(globals)}
      hasLimit
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  play: async ({ canvas }) => {
    await openPicker(canvas)
    const grid = canvas.getAllByRole('grid')[0] as HTMLElement
    await expect(grid.querySelectorAll('[data-unavailable]').length).toBeGreaterThanOrEqual(
      closedDays.size,
    )
    await userEvent.click(grid.querySelector<HTMLElement>('[data-unavailable]') as HTMLElement)
    await expect(modalDialog()).not.toBeNull()
    await expect(canvas.getByRole('dialog')).not.toHaveTextContent('Välj slutdatum')
  },
}

/** Span limits: at least 3 and at most 15 days, both ends counted. A day that would break them says so in its name and becomes a new start. */
export const Span: Story = {
  args: { minimumDays: 3, maximumDays: 15 },
  parameters: source('MaskedRangePicker'),
  render: (args, { globals }) => (
    <MaskedRangePicker {...args} locale={localeOf(globals)} hasLimit />
  ),
  play: async ({ canvas }) => {
    await openPicker(canvas)
    await userEvent.keyboard('{Enter}')
    await expect(dayStartingWith(canvas, 'torsdag 15 oktober 2026')).toHaveAccessibleName(
      /färre än 3 dagar/,
    )
    await expect(dayStartingWith(canvas, 'fredag 30 oktober 2026')).toHaveAccessibleName(
      /fler än 15 dagar/,
    )
  },
}

/** The alternative: three boxes per end, each end its own group with its own help text, and the trigger after the end's boxes. Every feature is the same. */
export const DateInputs: Story = {
  parameters: source('DateInputRangePicker'),
  render: (args, { globals }) => <DateInputRangePicker {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datumen' })
    await expect(modalDialog()).toBeNull()
    await openFrom(trigger)
    await userEvent.keyboard('{Enter}{ArrowRight}{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByTestId('stored')).toHaveTextContent('2026-10-14 – 2026-10-15')
    await expect(trigger).toHaveFocus()
  },
}

/** The end is before the start: the form's error is on the To field, and the picker still opens on the start at the end step. */
export const Invalid: Story = {
  parameters: source('MaskedRangePicker'),
  render: (args, { globals }) => (
    <MaskedRangePicker
      {...args}
      locale={localeOf(globals)}
      isInvalid
      initial={{ start: '2026-10-23', end: '2026-10-16' }}
    />
  ),
  play: async ({ canvas }) => {
    await openPicker(canvas)
    await waitFor(() => expect(dayStartingWith(canvas, 'fredag 23 oktober 2026')).toHaveFocus())
  },
}

/** A 320px screen (400% zoom): the dialog is a sheet at the bottom with one month, the fields stack, and nothing scrolls sideways (1.4.10). */
export const Narrow: Story = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        reflow: { name: '400% zoom', styles: { width: '320px', height: '256px' }, type: 'mobile' },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
    await openPicker(canvas)
    await expect(canvas.getAllByRole('grid')).toHaveLength(1)
    const dialog = canvas.getByRole('dialog')
    await expectNoHorizontalOverflow(dialog)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

/** The seven locales, closed: the trigger's text in each (Finnish is the longest and wraps below the To field). */
export const Locales: Story = {
  parameters: source('LocaleRangePickers'),
  render: () => <LocaleRangePickers />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('button', { name: /Välj|Valitse|Velg|Vel |Choose/ }),
    ).toHaveLength(7)
  },
}

/** Staff density from 64rem: the trigger and the day cells are 32px. */
export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="kv-compact">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    await openPicker(canvas)
  },
}

/** Right to left: the row, the chevrons and the grids mirror, and ArrowRight moves to the previous day. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await openPicker(canvas)
    await waitFor(() =>
      expect(canvas.getByRole('gridcell', { name: /14 October 2026/ })).toHaveFocus(),
    )
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('gridcell', { name: /13 October 2026/ })).toHaveFocus()
  },
}

/** The start, the days between, the end, today, unavailable days, the trigger and Close stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { minimum: '2026-10-08' },
  parameters: source('MaskedRangePicker'),
  render: (args, { globals }) => (
    <MaskedRangePicker
      {...args}
      locale={localeOf(globals)}
      initial={{ start: '2026-10-19', end: '2026-10-23' }}
      allowUnavailableInRange
      isDateUnavailable={(date) => closedDays.has(date) || date === '2026-10-21'}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  play: async ({ canvas }) => {
    await openPicker(canvas)
  },
}

/**
 * Try the keys in the Keyboard section above: Enter or Space on the trigger opens the dialog on
 * the day, the arrows move, Enter sets the start, Enter on a later day sets the end and focus
 * returns to the trigger, Escape closes without a change.
 */
export const Keyboard: Story = {
  parameters: source('MaskedRangePicker'),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datumen' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await waitFor(() => expect(dayStartingWith(canvas, 'onsdag 14 oktober 2026')).toHaveFocus())
    await userEvent.keyboard('{Enter}{ArrowRight}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(canvas.getByTestId('stored')).not.toHaveTextContent('2026')
    await userEvent.keyboard(' ')
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await userEvent.keyboard('{Enter}{ArrowRight}{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByTestId('stored')).toHaveTextContent('2026-10-14 – 2026-10-15')
    await expect(trigger).toHaveFocus()
  },
}
