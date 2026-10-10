import { Button, Card, Field, RadioGroup } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/radio-group/radio-group.a11y.md?raw'
import guide from '../../../../../packages/react/src/radio-group/radio-group.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ControlledDurationGroup,
  ControlledEmptyDurationGroup,
  DurationForm,
  StandaloneDurationRadios,
} from './radio-group.fixture.tsx'

// Components/Form/RadioGroup: one question with one answer, in a native <fieldset> under a
// <legend>, with native radios that share a name (design spec
// docs/design/form-fields.md §6.5). The browser does the keys: the group is one Tab stop, and
// the arrow keys move and check, mirrored in right-to-left. KvirnUI holds no form state:
// `value` and `onValueChange` are the selected value, and without `value` the native radios are
// uncontrolled. Nothing here validates: an invalid story sets `invalid` itself. A radio never
// gets aria-invalid: the group's error is its description.

const meta = {
  title: 'Components/Choice and overlays/RadioGroup',
  component: RadioGroup.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { invalid: false, required: false, disabled: false },
  argTypes: {
    name: { control: 'text', description: 'The name every radio shares. Default: generated.' },
    value: {
      control: false,
      description: 'Controlled: the checked radio’s value, or `null` for none.',
    },
    defaultValue: {
      control: 'text',
      description:
        'Uncontrolled: the value checked at the start. The browser keeps the state after that.',
    },
    onValueChange: {
      control: false,
      description:
        "Called with the chosen radio’s value and `{ reason: 'input', event }`. It only reports: the group stores nothing.",
    },
    invalid: {
      control: 'boolean',
      description:
        'Sets `data-invalid` on the fieldset, its parts and every radio. No `aria-invalid` on radios: the error message describes the group.',
    },
    required: {
      control: 'boolean',
      description:
        'Sets `data-required` and removes the legend’s optional text. Not announced as required (see the contract’s Known issues).',
    },
    disabled: {
      control: 'boolean',
      description: 'Native `fieldset[disabled]`: every radio is disabled and skipped by Tab.',
    },
    messages: {
      control: false,
      description:
        'Per-instance overrides of the legend’s optional text (`field.optional`) and the error prefix (`field.errorPrefix`).',
    },
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
  // The design spec's duration question: three radios under a legend. The localised text is
  // taken at the top, and the locale comes from the toolbar through `withFormLocale`. Radios that
  // share a name are one group for the whole document, so the name carries the story's id: on a
  // Docs page every story's radios would otherwise act as one. In your own form, use a plain
  // `name="duration"`.
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof RadioGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: none selected. The group is one Tab stop, so Tab lands on the first radio. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.durationLegend}`) })
    await expect(group.tagName).toBe('FIELDSET')
    await expect(group).toHaveAccessibleDescription(text.durationHint)
    const names = new Set<string | null>()
    for (const label of [text.duration1, text.duration6, text.duration12]) {
      const radio = canvas.getByRole('radio', { name: label })
      await expectMinimumTargetSize(radio)
      await expect(radio).not.toBeChecked()
      names.add(radio.getAttribute('name'))
    }
    await expect(names.size).toBe(1)
    await expect([...names][0]).toMatch(/^duration-/)
  },
}

/** The label of the button before the group. */
const backTexts: Partial<Record<FormLocale, string>> = {
  sv: 'Tillbaka',
  fi: 'Takaisin',
  nb: 'Tilbake',
  nn: 'Tilbake',
}

/**
 * The fixture the keyboard tests drive: the group between a button before and a button after,
 * in a form. Try the keys in the Keyboard section above: Tab enters the group once, the arrow
 * keys move and check, and Space checks the focused radio.
 */
export const Keyboard: Story = {
  render: (_args, { globals, id }) => {
    const locale = localeOf(globals)
    const { text, lang } = choiceTextsFor(locale)
    return (
      <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="kv-button-group">
          <Button type="button" lang={backTexts[locale] === undefined ? 'en' : undefined}>
            {backTexts[locale] ?? 'Back'}
          </Button>
        </div>
        <RadioGroup.Root name={`duration-${id}`}>
          <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
          <RadioGroup.Prose>
            <p>{text.durationHint}</p>
          </RadioGroup.Prose>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>{text.duration1}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="6" />
            <Field.Label>{text.duration6}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>{text.duration12}</Field.Label>
          </Field.Root>
          <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            {text.send}
          </Button>
        </div>
      </form>
    )
  },
}

/** One radio is checked: Tab goes straight to it, and passes the others. */
export const Selected: Story = {
  args: { defaultValue: '6' },
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
        <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
          <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
          <RadioGroup.Prose>
            <p>{text.durationHint}</p>
          </RadioGroup.Prose>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>{text.duration1}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="6" />
            <Field.Label>{text.duration6}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>{text.duration12}</Field.Label>
          </Field.Root>
          <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            {text.send}
          </Button>
        </div>
      </form>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: text.duration1 })).not.toBeChecked()
  },
}

/** An option's own help text is in that radio's description, under its label. */
export const WithOptionHelpTexts: Story = {
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
          <Field.HelpText>{text.duration12Hint}</Field.HelpText>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toHaveAccessibleDescription(
      text.duration12Hint,
    )
  },
}

/** Invalid: every circle gets a 2px edge, and the message is under the options. No aria-invalid. */
export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.durationLegend}`) })
    await expect(group).toHaveAccessibleDescription(
      new RegExp(`${text.durationHint}.*${text.durationError}`),
    )
    const radio = canvas.getByRole('radio', { name: text.duration1 })
    await expect(radio).toHaveAttribute('data-invalid')
    await expect(radio).not.toHaveAttribute('aria-invalid')
  },
}

/**
 * Required: the legend has no optional text (the other examples end with "(valfritt)") and the
 * fieldset gets `data-required`. ARIA has no `aria-required` on a group or a radio, so it is not
 * announced as required: say what is required in the legend or the description.
 */
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: text.durationLegend })
    await expect(group).toHaveAttribute('data-required')
    await expect(group).not.toHaveAttribute('aria-required')
  },
}

/** One option is disabled: a dashed circle, skipped by Tab and by the arrow keys. */
export const DisabledOption: Story = {
  args: { defaultValue: '1' },
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" disabled />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeDisabled()
    await expect(canvas.getByRole('radio', { name: text.duration12 })).not.toBeDisabled()
  },
}

/** The whole group disabled: native `fieldset[disabled]`. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: '12' },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeDisabled()
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeChecked()
  },
}

/** One question per page: the legend is the page's heading (an `h1` inside the legend). */
export const AsPageHeading: Story = {
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
        <RadioGroup.Legend className="kv-fieldset-legend--heading">
          <h1>{text.durationLegend}</h1>
        </RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.durationLegend })).toBeVisible()
  },
}

/** In a card: the edges keep 3:1 against `surface-raised` (1.4.11). */
export const InCard: Story = {
  args: { invalid: true, defaultValue: '6' },
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root>
        <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
          <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
          <RadioGroup.Prose>
            <p>{text.durationHint}</p>
          </RadioGroup.Prose>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>{text.duration1}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="6" />
            <Field.Label>{text.duration6}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>{text.duration12}</Field.Label>
          </Field.Root>
          <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeChecked()
  },
}

/** Staff density from 64rem: the rows are 32px high, the circles still 24px. */
export const Compact: Story = {
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact">
        <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
          <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
          <RadioGroup.Prose>
            <p>{text.durationHint}</p>
          </RadioGroup.Prose>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>{text.duration1}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="6" />
            <Field.Label>{text.duration6}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>{text.duration12}</Field.Label>
          </Field.Root>
          <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
        </RadioGroup.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('radio', { name: text.duration1 }))
  },
}

/** A long Finnish legend and options in a 320px column: they wrap and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals, id }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name={`duration-${id}`} {...args} lang={lang}>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
          <Field.HelpText>{text.duration12Hint}</Field.HelpText>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the group checks the radio whose value equals `value` (`null` for
 * none), and calls `onValueChange(value, { reason: 'input', event })`. It never stores it.
 */
export const Controlled: Story = {
  parameters: showSource('radio-group/radio-group.fixture.tsx', 'ControlledDurationGroup'),
  render: (_args, { globals }) => <ControlledDurationGroup locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('radio', { name: text.duration12 }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: 12`)
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: text.duration6 })).not.toBeChecked()
  },
}

/**
 * Controlled, with nothing chosen yet: `value={null}`. Nothing is checked, Tab enters the group at
 * its first radio, and the group follows the `value` your state gives it once a radio is chosen.
 */
export const ControlledEmpty: Story = {
  parameters: showSource('radio-group/radio-group.fixture.tsx', 'ControlledEmptyDurationGroup'),
  render: (_args, { globals }) => <ControlledEmptyDurationGroup locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.queryAllByRole('radio', { checked: true })).toHaveLength(0)
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: –`)
    await userEvent.click(canvas.getByRole('radio', { name: text.duration6 }))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeChecked()
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: 6`)
  },
}

/**
 * Radios outside a RadioGroup, in a Fieldset: each takes its own `name`, `value` and `checked`.
 * The controlled radios carry `data-state`, and none gets `aria-invalid` (ARIA doesn't allow it on
 * a radio).
 */
export const Standalone: Story = {
  parameters: showSource('radio-group/radio-group.fixture.tsx', 'StandaloneDurationRadios'),
  render: (_args, { globals }) => <StandaloneDurationRadios locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const six = canvas.getByRole('radio', { name: text.duration6 })
    const one = canvas.getByRole('radio', { name: text.duration1 })
    await expect(six).toHaveAttribute('data-state', 'checked')
    await expect(one).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(one)
    await expect(one).toHaveAttribute('data-state', 'checked')
    await expect(six).toHaveAttribute('data-state', 'unchecked')
    await expect(one).not.toHaveAttribute('aria-invalid')
  },
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The radios are
 * uncontrolled, and the form's `FormData` has the checked value under the group's name.
 */
export const PlainForm: Story = {
  parameters: showSource('radio-group/radio-group.fixture.tsx', 'DurationForm'),
  render: (_args, { globals }) => <DurationForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('radio', { name: text.duration12 }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: 12`)
  },
}

// Every state of the group in one column: checked, invalid and disabled. The RTL and ForcedColors
// stories render it, so a reader of either sees the real parts.
const renderGroupStates: NonNullable<Story['render']> = (_args, { globals, id }) => {
  const { text, lang } = choiceTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <RadioGroup.Root name={`selected-${id}`} defaultValue="6">
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
          <Field.HelpText>{text.duration12Hint}</Field.HelpText>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
      <RadioGroup.Root name={`invalid-${id}`} invalid>
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
      <RadioGroup.Root name={`disabled-${id}`} disabled defaultValue="12">
        <RadioGroup.Legend>{text.durationLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{text.durationHint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{text.duration1}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{text.duration6}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{text.duration12}</Field.Label>
        </Field.Root>
        <RadioGroup.ErrorMessage>{text.durationError}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
    </div>
  )
}

/** Right to left, in English: the circles are at the right, and the arrow keys are mirrored. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderGroupStates,
}

/** Checked, invalid and disabled circles stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderGroupStates,
}
