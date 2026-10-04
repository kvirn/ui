import { Field, Fieldset, RadioGroup, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/HelpText: a help text is a short instruction under the control, such as a format or an
// example, in 14px (`body-small`) and the text colour in every density and state. A description
// is a `Field.Prose` above the control, at 16px, and may hold paragraphs, lists and links. Both
// are listed in the control's `aria-describedby`, in DOM order, then the error. A help text always
// goes under the control, and the description above it. A help text is plain text, never a link, and never the only place
// the format lives: the error repeats it. The design spec is docs/design/field-help-text.md. The
// contract is field.a11y.md, shared with Field, Label and ErrorMessage. KvirnUI holds no form
// state: every story sets `invalid` and `disabled` itself. `help-text-outside-field` is a unit test,
// not a story, because it would warn in the console.

const meta = {
  title: 'Components/Form/HelpText',
  component: Field.HelpText,
  argTypes: { render: { control: false } },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <TextInput
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="kv-input--width-20"
        />
        <Field.HelpText {...args}>{text.personalNumberFormat}</Field.HelpText>
      </Field.Root>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Field.HelpText>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The fixture the keyboard tests drive: a description above the input and a help text under it. Try
 * the keys in the Keyboard section above: Tab goes to the input and never stops on the
 * description or the help text.
 */
export const Keyboard: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Field.Prose>
          <p>{text.personalNumberWhy}</p>
        </Field.Prose>
        <TextInput
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="kv-input--width-20"
        />
        <Field.HelpText {...args}>{text.personalNumberFormat}</Field.HelpText>
      </Field.Root>
    )
  },
}

/**
 * The default: label, input and a help text under it. The help text is a paragraph with its own id, and the
 * input's `aria-describedby` lists it. It says how to type the answer: plain words first, then
 * the pattern.
 */
export const UnderTheControl: Story = {}

/**
 * A description above the input and a help text under it. The description is what the user must read
 * before answering (16px, and it may hold paragraphs and links), and the help text is what helps while
 * typing (14px). Each has its own id, and `aria-describedby` lists them in DOM order.
 */
export const WithDescription: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.registration}</Field.Label>
        <Field.Prose>
          <p>{text.registrationWhere}</p>
        </Field.Prose>
        <TextInput name="registration" className="kv-input--width-10" />
        <Field.HelpText>{text.registrationHint}</Field.HelpText>
      </Field.Root>
    )
  },
}

/**
 * Invalid: the help text does not change. The error comes last, repeats the format, and carries the
 * state with its icon, weight and "Fel:". A screen reader reads the label, the description, the
 * help text, then the error.
 */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Field.Prose>
          <p>{text.personalNumberWhy}</p>
        </Field.Prose>
        <TextInput
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          defaultValue="19900101"
          className="kv-input--width-20"
        />
        <Field.HelpText>{text.personalNumberFormat}</Field.HelpText>
        <Field.ErrorMessage>{text.personalNumberError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
}

/**
 * In a Fieldset: a `Fieldset.HelpText` under the three date boxes describes the group, and is read
 * when focus enters it. Each box is its own Field with no description of its own.
 */
export const InFieldset: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root group required lang={lang}>
        <Fieldset.Legend>{text.visitDate}</Fieldset.Legend>
        <div className="kv-story-date-boxes">
          <Field.Root>
            <Field.Label>{text.visitDay}</Field.Label>
            <TextInput
              name="day"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-2"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>{text.visitMonth}</Field.Label>
            <TextInput
              name="month"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-2"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>{text.visitYear}</Field.Label>
            <TextInput
              name="year"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-4"
            />
          </Field.Root>
        </div>
        <Fieldset.HelpText>{text.visitDateExample}</Fieldset.HelpText>
      </Fieldset.Root>
    )
  },
}

/**
 * An option's help text is a `Field.HelpText` in the option's Field. It is 14px, lines up with the
 * label's text, and sits directly under the label's box, outside the target: a tap on it checks
 * nothing. It describes that radio, not the group.
 */
export const OptionHelpTexts: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <RadioGroup.Root name="duration" lang={lang}>
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
      </RadioGroup.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const radio = canvas.getByRole('radio', { name: text.duration12 })
    await expect(radio).toHaveAccessibleDescription(text.duration12Hint)
    await expect(canvas.getByRole('radio', { name: text.duration1 })).not.toHaveAttribute(
      'aria-describedby',
    )
  },
}

/**
 * A disabled field: the input is muted, and the help text stays in the text colour, because it often
 * says why the field can't be used.
 */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required disabled lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <TextInput
          name="personal-number"
          defaultValue="19900101-1234"
          className="kv-input--width-20"
        />
        <Field.HelpText>{text.personalNumberHint}</Field.HelpText>
      </Field.Root>
    )
  },
}

/**
 * A read-only personal identity number: the input stays focusable, and the help text says why the
 * value can't change.
 */
export const ReadOnly: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <TextInput
          name="personal-number"
          readOnly
          defaultValue="19900101-1234"
          className="kv-input--width-20"
        />
        <Field.HelpText>{text.personalNumberHint}</Field.HelpText>
      </Field.Root>
    )
  },
}

/**
 * Staff density from 64rem: the label is 14px and the gaps are 4px. The description stays 16px
 * and the help text stays 14px, so there is no smaller step.
 */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.personalNumber}</Field.Label>
          <Field.Prose>
            <p>{text.personalNumberWhy}</p>
          </Field.Prose>
          <TextInput
            name="personal-number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            className="kv-input--width-20"
          />
          <Field.HelpText>{text.personalNumberFormat}</Field.HelpText>
        </Field.Root>
      </div>
    )
  },
}

/**
 * A long Finnish help text in a 320px column (1.4.10). The 34-letter compound has soft hyphens, so it
 * breaks the same way in every browser, because Chromium has no Finnish hyphenation dictionary.
 */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.longLabel}</Field.Label>
        <TextInput name="reference" inputMode="numeric" spellCheck={false} />
        <Field.HelpText>{text.grantReferenceHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Splits "For example, ABC 123" into the sentence and the example, so the example can go in `<bdi>`. */
function splitExample(helpText: string): { lead: string; example: string } {
  const match = /^(.*?)(ABC.\d{3})$/.exec(helpText)
  return { lead: match?.[1] ?? helpText, example: match?.[2] ?? '' }
}

// The help text's states in one column, for the RTL and forced-colours stories: the same Fields
// as the stories above. A radio group's name is document-wide, so each story passes its own.
const renderHelpTextStates =
  (radioName: string): NonNullable<Story['render']> =>
  (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const { lead, example } = splitExample(text.registrationHint)
    const choices = choiceTextsFor(localeOf(globals)).text
    return (
      <div lang={lang}>
        <Field.Root required>
          <Field.Label>{text.registration}</Field.Label>
          <Field.Prose>
            <p>{text.registrationWhere}</p>
          </Field.Prose>
          <TextInput name="registration" className="kv-input--width-10" />
          {/* The example is neutral text at the edge of a right-to-left sentence: `bdi` keeps it in place. */}
          <Field.HelpText>
            {lead}
            {example === '' ? null : <bdi>{example}</bdi>}
          </Field.HelpText>
        </Field.Root>
        <Field.Root required invalid>
          <Field.Label>{text.personalNumber}</Field.Label>
          <TextInput
            name="personal-number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            defaultValue="19900101"
            className="kv-input--width-20"
          />
          <Field.HelpText>{text.personalNumberFormat}</Field.HelpText>
          <Field.ErrorMessage>{text.personalNumberError}</Field.ErrorMessage>
        </Field.Root>
        <Field.Root required disabled>
          <Field.Label>{text.personalNumber}</Field.Label>
          <TextInput
            name="personal-number"
            defaultValue="19900101-1234"
            className="kv-input--width-20"
          />
          <Field.HelpText>{text.personalNumberHint}</Field.HelpText>
        </Field.Root>
        <RadioGroup.Root name={radioName}>
          <RadioGroup.Legend>{choices.durationLegend}</RadioGroup.Legend>
          <RadioGroup.Prose>
            <p>{choices.durationHint}</p>
          </RadioGroup.Prose>
          <Field.Root>
            <RadioGroup.Radio value="1" />
            <Field.Label>{choices.duration1}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="6" />
            <Field.Label>{choices.duration6}</Field.Label>
          </Field.Root>
          <Field.Root>
            <RadioGroup.Radio value="12" />
            <Field.Label>{choices.duration12}</Field.Label>
            <Field.HelpText>{choices.duration12Hint}</Field.HelpText>
          </Field.Root>
        </RadioGroup.Root>
      </div>
    )
  }

/** Right to left, in English: a help text and an option help text start at the right, the example in `<bdi>`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderHelpTextStates('duration-rtl'),
}

/**
 * Forced colours: the help text is `CanvasText`, with no border or fill to lose. The error is still
 * told apart from it by its icon, weight, size, indent and the spoken "Fel:".
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderHelpTextStates('duration-forced-colors'),
}
