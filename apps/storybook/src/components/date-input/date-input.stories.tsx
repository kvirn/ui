import { DateInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/date-input/date-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/date-input/date-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { logChange } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  BirthDate,
  ControlledDate,
  dateTextsFor,
  KeyboardDate,
  PaperFormDate,
  PlainFormDate,
  VisitDate,
  withRegion,
} from './date-input.fixture.tsx'

// Components/Form/DateInput: a date of three text boxes, day, month and year, in a group
// fieldset (design spec docs/design/form-fields.md §6.6). The order follows the region through
// `Intl` (sv-SE year first, sv-FI day first, month first becomes day first). Three Tab stops in
// that order, no auto-advance, the arrow keys never step a value, and the value is three
// strings that nothing parses. KvirnUI holds no form state: `value` and `onValueChange` are the
// date, and without `value` the native inputs are uncontrolled. Nothing here validates: an
// invalid story sets `invalid` itself, on the wrong boxes only. The hint is the consumer's,
// with an example in the order of the boxes. date-input.e2e.ts runs the keyboard rows, forced
// colours and reflow checks.

const meta = {
  title: 'Components/Form/DateInput',
  component: DateInput.Root,
  args: {
    name: 'birth',
    autoComplete: 'bday',
    onValueChange: logChange('onValueChange'),
  },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-date-input`. The theme sizes each box by `kv-date-input-day`, `-month` and `-year` on its field.',
    },
    name: {
      control: 'text',
      description:
        'A prefix for the three inputs’ `name`: `birth` gives `birth-day`, `birth-month` and `birth-year`. A `name` on one box wins.',
    },
    value: {
      control: false,
      description:
        'Controlled: `{ year, month, day }`, all strings (`""` for an empty box). Pair it with `onValueChange`.',
    },
    defaultValue: {
      control: 'object',
      description:
        'Uncontrolled: the text each box starts with, any of `year`, `month` and `day`. The native inputs keep it after that.',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the whole date as the boxes show it, and `{ reason: "input", part, event }`. It only reports.',
    },
    autoComplete: {
      control: 'inline-radio',
      options: [undefined, 'bday'],
      description:
        '`"bday"` gives the boxes `bday-day`, `bday-month` and `bday-year` (1.3.5). For a date of birth only.',
    },
    order: {
      control: 'object',
      description:
        'The order of the boxes when the Root renders them itself, for example `["month", "day", "year"]`. Default: the locale’s, from `Intl`.',
    },
    required: {
      control: 'boolean',
      description:
        '`aria-required` on the three boxes. Default: the Fieldset’s `required` (this example’s Fieldset is required).',
    },
    disabled: {
      control: 'boolean',
      description:
        'Native `disabled` and `data-disabled` on the three boxes. Default: the Fieldset’s `disabled`.',
    },
    readOnly: { control: 'boolean', description: 'Native `readOnly` on the three boxes.' },
    invalidParts: {
      control: 'object',
      description:
        'The wrong boxes, for the boxes the Root renders itself: `["year"]` gives `aria-invalid` and `data-invalid` on the Year box only. With your own children, set `invalid` on each of Day, Month and Year. The Fieldset’s `invalid` marks none of them.',
    },
    messages: {
      control: false,
      description: 'Per-instance overrides for `dateInput.day`, `.month` and `.year`.',
    },
    render: { control: false, description: 'Another element. Day, Month and Year take it too.' },
  },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <BirthDate locale={localeOf(globals)} {...args} />,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof DateInput.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The labels of the boxes in the order a user meets them. */
const boxLabels = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('input')].map((input) => input.labels?.[0]?.textContent)

/** One box by its part, from the `birth` name prefix. */
const box = (canvasElement: HTMLElement, part: 'day' | 'month' | 'year') => {
  const input = canvasElement.querySelector<HTMLInputElement>(`input[name="birth-${part}"]`)
  if (input === null) {
    throw new Error(`no ${part} box`)
  }
  return input
}

/**
 * The main example: a date of birth, with every option of `DateInput.Root` as a control. The
 * boxes follow the Locale toolbar: Swedish writes the year first, Finnish and English the day.
 */
export const Default: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvas, canvasElement, globals }) => {
    const locale = localeOf(globals)
    const { text } = dateTextsFor(locale)
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.legend}`) })
    await expect(group.tagName).toBe('FIELDSET')
    const boxes = canvas.getAllByRole('textbox')
    await expect(boxes).toHaveLength(3)
    for (const textbox of boxes) {
      await expectMinimumTargetSize(textbox)
      await expect(textbox).toHaveAttribute('inputmode', 'numeric')
      await expect(textbox).not.toHaveAttribute('aria-invalid')
    }
    await expect(box(canvasElement, 'day')).toHaveAttribute('autocomplete', 'bday-day')
    // The hint, with an example in the order of the boxes, describes the whole date.
    const yearFirst = canvasElement.querySelector('input')?.name === 'birth-year'
    await expect(group).toHaveAccessibleDescription(
      yearFirst ? text.hintYearFirst : text.hintDayFirst,
    )
  },
}

/**
 * The fixture the keyboard tests drive: a back button before the date, the date and a submit
 * button, in a form. Try the keys in the Keyboard section above: Tab goes box to box in the order
 * of the boxes (Shift+Tab leaves the first box for the back button), typing never moves
 * focus, the arrow keys never step a value, and Enter in a box submits the form.
 */
export const Keyboard: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'KeyboardDate'),
  render: (_args, { globals }) => <KeyboardDate locale={localeOf(globals)} />,
}

/** `sv-SE`: year, month, day, and the hint's example is written in that order. */
export const SwedishSweden: Story = {
  decorators: [withRegion('sv-SE')],
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvasElement, canvas }) => {
    await expect(boxLabels(canvasElement)).toEqual(['År', 'Månad', 'Dag'])
    await expect(canvas.getByText('Till exempel 1990 3 27')).toBeVisible()
  },
}

/**
 * `sv-FI`: the same Swedish catalog, but Finland-Swedish writes day, month, year. The language
 * alone would give these residents the wrong order, so the region decides.
 */
export const SwedishFinland: Story = {
  decorators: [withRegion('sv-FI')],
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvasElement, canvas }) => {
    await expect(boxLabels(canvasElement)).toEqual(['Dag', 'Månad', 'År'])
    await expect(canvas.getByText('Till exempel 27 3 1990')).toBeVisible()
  },
}

/** Finnish: day, month, year. The strings are designer drafts until a translator checks them. */
export const Finnish: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvasElement, canvas }) => {
    await expect(boxLabels(canvasElement)).toEqual(['Päivä', 'Kuukausi', 'Vuosi'])
    await expect(canvas.getByText('Esimerkiksi 27 3 1990')).toBeVisible()
  },
}

/**
 * English: day, month, year, though `Intl` puts the month first for `en`. Month first reads as
 * day first for the readers in the EU, and gives wrong dates (3 7 2007).
 */
export const English: Story = {
  globals: { locale: 'en' },
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvasElement }) => {
    await expect(boxLabels(canvasElement)).toEqual(['Day', 'Month', 'Year'])
  },
}

/**
 * Your own order: a service that must match a paper form writes the parts itself, and the hint
 * follows the order it chose.
 */
export const OwnOrder: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'PaperFormDate'),
  render: (_args, { globals }) => <PaperFormDate locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    await expect(boxLabels(canvasElement)).toEqual(['Dag', 'Månad', 'År'])
  },
}

/**
 * Only the Year box is wrong: "must include a year" marks Year, and the message is under the
 * boxes, once, for the whole date.
 */
export const InvalidYear: Story = {
  render: (args, { globals }) => <BirthDate {...args} locale={localeOf(globals)} error="year" />,
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    await expect(box(canvasElement, 'year')).toHaveAttribute('aria-invalid', 'true')
    await expect(box(canvasElement, 'month')).not.toHaveAttribute('aria-invalid')
    await expect(box(canvasElement, 'day')).not.toHaveAttribute('aria-invalid')
    await expect(
      canvas.getByRole('group', { name: new RegExp(`^${text.legend}`) }),
    ).toHaveAccessibleDescription(new RegExp(`${text.errorYear}$`))
  },
}

/** "Must be a real date" marks all three boxes: the message is the same one, under them. */
export const InvalidDate: Story = {
  render: (args, { globals }) => <BirthDate {...args} locale={localeOf(globals)} error="date" />,
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvasElement }) => {
    for (const part of ['day', 'month', 'year'] as const) {
      await expect(box(canvasElement, part)).toHaveAttribute('aria-invalid', 'true')
    }
  },
}

/** A date that is not a birthday has no `autoComplete`, and an optional one ends its legend with "(valfritt)". */
export const NotABirthday: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'VisitDate'),
  render: (_args, { globals }) => <VisitDate locale={localeOf(globals)} />,
  play: async ({ canvasElement, canvas, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('group', { name: new RegExp(`^${text.visitLegend}`) }),
    ).toBeVisible()
    for (const input of canvasElement.querySelectorAll('input')) {
      await expect(input).not.toHaveAttribute('autocomplete')
    }
  },
}

/** The whole date disabled: a dashed edge on each box, skipped by Tab. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: { year: '1990', month: '3', day: '27' } },
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvas }) => {
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expect(textbox).toBeDisabled()
    }
  },
}

/** Read only: a solid edge on the surface colour, and the boxes still take focus. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: { year: '1990', month: '3', day: '27' } },
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  play: async ({ canvas }) => {
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expect(textbox).toHaveAttribute('readonly')
    }
  },
}

/** Staff density from 64rem: 32px boxes and 12px between them, the digits still 16px. */
export const Compact: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  render: (args, { globals }) => (
    <div className="kv-compact">
      <BirthDate {...args} locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expectMinimumTargetSize(textbox)
    }
  },
}

/** A narrow column: the three boxes stay in one row, and wrap in order at larger text sizes. */
export const Narrow: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('date-input/date-input.fixture.tsx', 'BirthDate'),
  render: (args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <BirthDate {...args} locale={localeOf(globals)} error="year" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the Root reports the whole date, three strings as typed, and never
 * stores it.
 */
export const Controlled: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'ControlledDate'),
  render: (_args, { globals }) => <ControlledDate locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    await userEvent.type(box(canvasElement, 'day'), '027')
    // Nothing is padded or parsed: the day is what was typed.
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youTyped}: 1990-3-027`)
  },
}

/** A plain `<form>`: only `name`, and the submit reads three fields from `FormData`. */
export const PlainForm: Story = {
  parameters: showSource('date-input/date-input.fixture.tsx', 'PlainFormDate'),
  render: (_args, { globals }) => <PlainFormDate locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = dateTextsFor(localeOf(globals))
    await userEvent.type(box(canvasElement, 'day'), '27')
    await userEvent.type(box(canvasElement, 'month'), '3')
    await userEvent.type(box(canvasElement, 'year'), '1990')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: 1990-3-27`)
  },
}

/** Every state of the date in one column, for the RTL and forced-colours stories. */
function DateStates({ locale }: { locale: FormLocale }) {
  const id = useId()
  return (
    <div className="kv-story-form">
      <BirthDate
        locale={locale}
        name={`filled-${id}`}
        defaultValue={{ year: '1990', month: '3', day: '27' }}
      />
      <BirthDate
        locale={locale}
        name={`year-${id}`}
        error="year"
        defaultValue={{ month: '3', day: '27' }}
      />
      <BirthDate
        locale={locale}
        name={`date-${id}`}
        error="date"
        defaultValue={{ year: '1990', month: '13', day: '27' }}
      />
      <BirthDate
        locale={locale}
        name={`disabled-${id}`}
        disabled
        defaultValue={{ year: '1990', month: '3', day: '27' }}
      />
      <BirthDate
        locale={locale}
        name={`readonly-${id}`}
        readOnly
        defaultValue={{ year: '1990', month: '3', day: '27' }}
      />
    </div>
  )
}

/** Right to left, in English: the boxes flow right to left in DOM order, and Tab follows it. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <DateStates locale="en" />,
}

/** Filled, invalid, disabled and read-only boxes stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <DateStates locale={localeOf(globals)} />,
}
