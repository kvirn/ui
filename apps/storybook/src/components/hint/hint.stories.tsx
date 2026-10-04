import { Field, Fieldset, Input, RadioGroup } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import { expect } from 'storybook/test'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import { fieldMessagesFor, localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Hint: a hint is a short instruction under the control, such as a format or an
// example, in 14px (`body-small`) and the text colour in every density and state. A description
// is a `Field.Prose` above the control, at 16px, and may hold paragraphs, lists and links. Both
// are listed in the control's `aria-describedby`, in DOM order, then the error. The size belongs
// to the part, not to its position. A hint is plain text, never a link, and never the only place
// the format lives: the error repeats it. The design spec is docs/design/field-hint.md. The
// contract is field.a11y.md, shared with Field, Label and ErrorMessage. KvirnUI holds no form
// state: every story sets `invalid` and `disabled` itself. `hint-outside-field` is a unit test,
// not a story, because it would warn in the console.

const meta = {
  title: 'Components/Form/Hint',
  component: Field.Hint,
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
        <Input
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="kv-input--width-20"
        />
        <Field.Hint {...args}>{text.personalNumberFormat}</Field.Hint>
      </Field.Root>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Field.Hint>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The fixture the keyboard tests drive: a description above the input and a hint under it. Try
 * the keys in the Keyboard section above: Tab goes to the input and never stops on the
 * description or the hint.
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
        <Input
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="kv-input--width-20"
        />
        <Field.Hint {...args}>{text.personalNumberFormat}</Field.Hint>
      </Field.Root>
    )
  },
}

/**
 * The default: label, input and a hint under it. The hint is a paragraph with its own id, and the
 * input's `aria-describedby` lists it. It says how to type the answer: plain words first, then
 * the pattern.
 */
export const UnderTheControl: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.personalNumber })
    const hint = canvas.getByText(text.personalNumberFormat)
    await expect(input.getAttribute('aria-describedby')).toBe(hint.id)
    await expect(input).toHaveAccessibleDescription(text.personalNumberFormat)
  },
}

/**
 * A description above the input and a hint under it. The description is what the user must read
 * before answering (16px, and it may hold paragraphs and links), and the hint is what helps while
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
        <Input name="registration" className="kv-input--width-10" />
        <Field.Hint>{text.registrationHint}</Field.Hint>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.registration })
    await expect(input).toHaveAccessibleDescription(
      `${text.registrationWhere} ${text.registrationHint}`,
    )
    // One id each, in DOM order: the description's, then the hint's.
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ')
    await expect(new Set(ids).size).toBe(2)
    await expect(canvas.getByText(text.registrationWhere).parentElement).toHaveAttribute(
      'id',
      ids[0],
    )
    await expect(canvas.getByText(text.registrationHint)).toHaveAttribute('id', ids[1])
  },
}

/**
 * Invalid: the hint does not change. The error comes last, repeats the format, and carries the
 * state with its icon, weight and "Fel:". A screen reader reads the label, the description, the
 * hint, then the error.
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
        <Input
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          defaultValue="19900101"
          className="kv-input--width-20"
        />
        <Field.Hint>{text.personalNumberFormat}</Field.Hint>
        <Field.ErrorMessage>{text.personalNumberError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const input = canvas.getByRole('textbox', { name: text.personalNumber })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(
      `${text.personalNumberWhy} ${text.personalNumberFormat} ${fieldMessagesFor(locale).errorPrefix} ${text.personalNumberError}`,
    )
    await expect(canvas.getByText(text.personalNumberFormat)).toHaveAttribute('data-invalid')
  },
}

/**
 * In a Fieldset: a `Fieldset.Hint` under the three date boxes describes the group, and is read
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
            <Input
              name="day"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-2"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>{text.visitMonth}</Field.Label>
            <Input
              name="month"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-2"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>{text.visitYear}</Field.Label>
            <Input
              name="year"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="kv-input--width-4"
            />
          </Field.Root>
        </div>
        <Fieldset.Hint>{text.visitDateExample}</Fieldset.Hint>
      </Fieldset.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('group', { name: text.visitDate })).toHaveAccessibleDescription(
      text.visitDateExample,
    )
    // The hint describes the group, not each box.
    await expect(canvas.getByRole('textbox', { name: text.visitDay })).not.toHaveAttribute(
      'aria-describedby',
    )
  },
}

interface DurationWithHintProps {
  locale: FormLocale
}

/** A radio group whose longest option has a hint under its label. */
function DurationWithHint({ locale }: DurationWithHintProps) {
  const { text, lang } = choiceTextsFor(locale)
  // Radios that share a name are one group for the whole document, so on a Docs page every
  // story's radios would act as one. A name per instance keeps the stories apart.
  const name = `duration-${useId()}`
  return (
    <RadioGroup.Root name={name} lang={lang}>
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
        <Field.Hint>{text.duration12Hint}</Field.Hint>
      </Field.Root>
    </RadioGroup.Root>
  )
}

/**
 * An option's hint is a `Field.Hint` in the option's Field. It is 14px, lines up with the
 * label's text, and sits directly under the label's box, outside the target: a tap on it checks
 * nothing. It describes that radio, not the group.
 */
export const OptionHints: Story = {
  render: (_args, { globals }) => <DurationWithHint locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const radio = canvas.getByRole('radio', { name: text.duration12 })
    await expect(radio).toHaveAccessibleDescription(text.duration12Hint)
    await expect(canvas.getByRole('radio', { name: text.duration1 })).not.toHaveAttribute(
      'aria-describedby',
    )
    // Outside the label, so it is not part of the target.
    await expect(canvas.getByText(text.duration12Hint).closest('label')).toBeNull()
  },
}

/**
 * The size belongs to the part, not to where it sits. A `Field.Prose` (the description) is 16px
 * above the control and under it. A `Field.Hint` is 14px under the control and above it. A hint
 * above the control is allowed but rare: what the user must read before answering is a
 * description, so use a Prose there.
 */
export const SizeFollowsThePart: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-form" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.registration}</Field.Label>
          <Field.Prose data-testid="prose-above">
            <p>{text.registrationWhere}</p>
          </Field.Prose>
          <Input name="registration" className="kv-input--width-10" />
          <Field.Prose data-testid="prose-under">
            <p>{text.registrationHint}</p>
          </Field.Prose>
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.personalNumber}</Field.Label>
          <Field.Hint data-testid="hint-above">{text.personalNumberWhy}</Field.Hint>
          <Input
            name="personal-number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            className="kv-input--width-20"
          />
          <Field.Hint data-testid="hint-under">{text.personalNumberFormat}</Field.Hint>
        </Field.Root>
      </div>
    )
  },
}

/**
 * A disabled field: the input is muted, and the hint stays in the text colour, because it often
 * says why the field can't be used.
 */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required disabled lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Input name="personal-number" defaultValue="19900101-1234" className="kv-input--width-20" />
        <Field.Hint>{text.personalNumberHint}</Field.Hint>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.personalNumber })
    await expect(input).toBeDisabled()
    await expect(input).toHaveAccessibleDescription(text.personalNumberHint)
    await expect(canvas.getByText(text.personalNumberHint)).toHaveAttribute('data-disabled')
  },
}

/**
 * A read-only personal identity number: the input stays focusable, and the hint says why the
 * value can't change.
 */
export const ReadOnly: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Input
          name="personal-number"
          readOnly
          defaultValue="19900101-1234"
          className="kv-input--width-20"
        />
        <Field.Hint>{text.personalNumberHint}</Field.Hint>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.personalNumber })
    await expect(input).toHaveAttribute('readonly')
    await expect(input).toHaveAccessibleDescription(text.personalNumberHint)
    input.focus()
    await expect(input).toHaveFocus()
  },
}

/**
 * Staff density from 64rem: the label is 14px and the gaps are 4px. The description stays 16px
 * and the hint stays 14px, so there is no smaller step.
 */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.personalNumber}</Field.Label>
          <Field.Prose data-testid="description">
            <p>{text.personalNumberWhy}</p>
          </Field.Prose>
          <Input
            name="personal-number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            className="kv-input--width-20"
          />
          <Field.Hint data-testid="hint">{text.personalNumberFormat}</Field.Hint>
        </Field.Root>
      </div>
    )
  },
}

/**
 * A long Finnish hint in a 320px column (1.4.10). The 34-letter compound has soft hyphens, so it
 * breaks the same way in every browser, because Chromium has no Finnish hyphenation dictionary.
 */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <Input name="reference" inputMode="numeric" spellCheck={false} />
          <Field.Hint>{text.grantReferenceHint}</Field.Hint>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(
      canvas.getByRole('textbox', { name: /Asunnonmuutostyöavustushakemuksen/ }),
    ).toHaveAccessibleDescription(text.grantReferenceHint)
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Splits "For example, ABC 123" into the sentence and the example, so the example can go in `<bdi>`. */
function splitExample(hint: string): { lead: string; example: string } {
  const match = /^(.*?)(ABC.\d{3})$/.exec(hint)
  return { lead: match?.[1] ?? hint, example: match?.[2] ?? '' }
}

/** The hint's states in one column, for the RTL and forced-colours stories. */
function HintStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const { lead, example } = splitExample(text.registrationHint)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.registration}</Field.Label>
        <Field.Prose>
          <p>{text.registrationWhere}</p>
        </Field.Prose>
        <Input name="registration" className="kv-input--width-10" />
        {/* The example is neutral text at the edge of a right-to-left sentence: `bdi` keeps it in place. */}
        <Field.Hint>
          {lead}
          {example === '' ? null : <bdi>{example}</bdi>}
        </Field.Hint>
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Input
          name="personal-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          defaultValue="19900101"
          className="kv-input--width-20"
        />
        <Field.Hint>{text.personalNumberFormat}</Field.Hint>
        <Field.ErrorMessage>{text.personalNumberError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Input name="personal-number" defaultValue="19900101-1234" className="kv-input--width-20" />
        <Field.Hint>{text.personalNumberHint}</Field.Hint>
      </Field.Root>
      <DurationWithHint locale={locale} />
    </div>
  )
}

/** Right to left, in English: a hint and an option hint start at the right, the example in `<bdi>`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <HintStates locale="en" />,
}

/**
 * Forced colours: the hint is `CanvasText`, with no border or fill to lose. The error is still
 * told apart from it by its icon, weight, size, indent and the spoken "Fel:".
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <HintStates locale={localeOf(globals)} />,
}
