import { DatePicker } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/date-picker/date-picker.a11y.md?raw'
import guide from '../../../../../packages/react/src/date-picker/date-picker.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { localeOf } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  LocalePickers,
  MaskedDatePicker,
  VisitDatePicker,
  closedDays,
  describeClosedDay,
  withCalendarProvider,
} from './date-picker.fixture.tsx'

// Components/DatePicker: a button after a typed date that opens a modal Dialog holding a Calendar
// (contract: date-picker.a11y.md; design spec docs/design/date-picker-and-calendar.md). Typing
// always works: the dialog is the slower path. Every story fixes `today` to 14 October 2026.

const source = (...names: string[]) => showSource('date-picker/date-picker.fixture.tsx', ...names)

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker.Root,
  argTypes: {
    value: {
      control: false,
      description: 'The field’s date, `YYYY-MM-DD`, or `""` for none. Controlled only.',
    },
    onValueChange: {
      control: false,
      description: 'Called with the day when an available day is chosen.',
    },
    open: {
      control: 'boolean',
      description:
        'Controlled: whether the dialog is open. Pair it with `onOpenChange`. Else it is mounted closed and never starts open.',
    },
    onOpenChange: {
      control: false,
      description:
        'Called with `(open, { reason, event })`; reason `"select"` when a day was chosen.',
    },
    minimum: { control: 'text', description: 'The first day that can be chosen.' },
    maximum: { control: 'text', description: 'The last day that can be chosen.' },
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
      description: 'Per-instance strings, `datePicker.trigger` and `datePicker.title`.',
    },
    calendarMessages: {
      control: false,
      description: 'Per-instance strings for the Calendar and "{date} selected".',
    },
  },
  args: { onValueChange: fn(), onOpenChange: fn() },
  globals: { locale: 'sv' },
  decorators: [withCalendarProvider],
  render: (args, { globals }) => <VisitDatePicker {...args} locale={localeOf(globals)} />,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof DatePicker.Root>

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
}) => openFrom(canvas.getByRole('button', { name: /^(Välj datum|Choose date)$/ }))

/** The main example: one `masks.date()` field with "Välj datum" beside it. One Tab stop, paste works, and the chosen day is written in the field's own format. */
export const MaskedTextInput: Story = {
  parameters: source('MaskedDatePicker'),
  render: (args, { globals }) => (
    <MaskedDatePicker {...args} locale={localeOf(globals)} initial="2026-10-20" />
  ),
  play: async ({ canvas, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    const trigger = canvas.getByRole('button', { name: 'Välj datum' })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(modalDialog()).toBeNull()
    await openFrom(trigger)
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(
      canvas.getByRole('textbox', { name: new RegExp(`^${text.oneFieldLabel}`) }),
    ).toHaveValue('2026-10-21')
    await expect(trigger).toHaveFocus()
  },
}

/** The second example: the three boxes with "Välj datum" last in the row, for when separate labelled day, month and year are wanted. Typing always works. */
export const WithDateInput: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datum' })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(modalDialog()).toBeNull()
  },
}

/** Open: the page behind is inert, focus is on today, and Close comes after the title. */
export const Open: Story = {
  parameters: source('MaskedDatePicker'),
  render: (args, { globals }) => <MaskedDatePicker {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await openPicker(canvas)
    const dialog = canvas.getByRole('dialog', { name: 'Välj ett datum' })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(
      canvas.getByRole('gridcell', { name: 'onsdag 14 oktober 2026, idag' }),
    ).toHaveFocus()
  },
}

/** A typed date: the dialog opens on it, with `aria-selected`, and choosing a day writes the boxes. */
export const WithValue: Story = {
  render: (args, { globals }) => (
    <VisitDatePicker
      {...args}
      locale={localeOf(globals)}
      initial={{ year: '2026', month: '10', day: '20' }}
    />
  ),
  parameters: source('VisitDatePicker'),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datum' })
    await openFrom(trigger)
    const selected = canvas.getByRole('gridcell', { name: 'tisdag 20 oktober 2026' })
    await expect(selected).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(selected).toHaveFocus())
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByTestId('stored')).toHaveTextContent('2026-10-21')
    await expect(trigger).toHaveFocus()
  },
}

/** A booking window with closed days: they stay focusable, struck through, and say why in their name. */
export const Booking: Story = {
  args: { minimum: '2026-10-08', maximum: '2026-12-20' },
  render: (args, { globals }) => (
    <VisitDatePicker
      {...args}
      locale={localeOf(globals)}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  parameters: source('VisitDatePicker'),
  play: async ({ canvas }) => {
    await openPicker(canvas)
    const grid = canvas.getByRole('grid')
    await expect(grid).toHaveAccessibleDescription()
    await expect(grid.querySelectorAll('[data-unavailable]')).toHaveLength(closedDays.size)
    await expect(grid.querySelectorAll('[data-outside-range]').length).toBeGreaterThan(0)
    await userEvent.click(grid.querySelector<HTMLElement>('[data-unavailable]') as HTMLElement)
    await expect(modalDialog()).not.toBeNull()
  },
}

/** The field has an error: the picker still opens, and the form validates, not the picker. */
export const Invalid: Story = {
  render: (args, { globals }) => (
    <VisitDatePicker
      {...args}
      locale={localeOf(globals)}
      isInvalid
      initial={{ year: '2026', month: '2', day: '31' }}
    />
  ),
  parameters: source('VisitDatePicker'),
  play: async ({ canvas }) => {
    await openFrom(canvas.getByRole('button', { name: 'Välj datum' }))
    await expect(
      canvas.getByRole('gridcell', { name: 'onsdag 14 oktober 2026, idag' }),
    ).toHaveFocus()
  },
}

/** A 320px screen (400% zoom): the dialog is a sheet at the bottom, the heading takes its own row, cells are 40px (36px with week numbers). */
export const Narrow: Story = {
  globals: { viewport: { value: 'reflow', isRotated: false } },
  parameters: {
    viewport: {
      options: {
        reflow: { name: '400% zoom', styles: { width: '320px', height: '256px' }, type: 'mobile' },
      },
    },
  },
  args: { weekNumbers: true },
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBeLessThanOrEqual(320)
    await openPicker(canvas)
    await expectNoHorizontalOverflow(canvas.getByRole('dialog'))
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

/** The same 320px sheet without week numbers, the default picker: the grid must not scroll sideways inside the dialog (1.4.10). */
export const NarrowDefault: Story = {
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
    await openPicker(canvas)
    const dialog = canvas.getByRole('dialog')
    await expectNoHorizontalOverflow(dialog)
    await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}

/** The seven locales, closed: the trigger's text in each (Finnish is the longest and wraps below the boxes). */
export const Locales: Story = {
  parameters: source('LocalePickers'),
  render: () => <LocalePickers />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('button', { name: /Välj|Valitse|Velg|Vel |Choose/ }),
    ).toHaveLength(7)
  },
}

/** Staff density from 64rem: the trigger and the day cells are 32px. */
export const Compact: Story = {
  play: async ({ canvas }) => {
    await openPicker(canvas)
  },
  decorators: [
    (Story) => (
      <div className="kv-compact">
        <Story />
      </div>
    ),
  ],
}

/** Right to left: the row, the chevrons and the columns mirror, and ArrowRight moves to the previous day. */
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

/** Selected, today, unavailable, the trigger and Close stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { minimum: '2026-10-08' },
  render: (args, { globals }) => (
    <VisitDatePicker
      {...args}
      locale={localeOf(globals)}
      initial={{ year: '2026', month: '10', day: '20' }}
      isDateUnavailable={(date) => closedDays.has(date)}
      getDateDescription={describeClosedDay(localeOf(globals))}
    />
  ),
  parameters: source('VisitDatePicker'),
  play: async ({ canvas }) => {
    await openPicker(canvas)
  },
}

/**
 * Try the keys in the Keyboard section above: Enter or Space on the trigger opens the dialog on
 * the day, the arrows move, Enter chooses and focus returns to the trigger, Escape closes
 * without a change.
 */
export const Keyboard: Story = {
  parameters: source('VisitDatePicker'),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Välj datum' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await waitFor(() =>
      expect(canvas.getByRole('gridcell', { name: 'onsdag 14 oktober 2026, idag' })).toHaveFocus(),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(canvas.getByTestId('stored')).not.toHaveTextContent('2026')
    await userEvent.keyboard(' ')
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(canvas.getByTestId('stored')).toHaveTextContent('2026-10-15')
    await expect(trigger).toHaveFocus()
  },
}
