import { Button, Card, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/checkbox-group/checkbox-group.a11y.md?raw'
import guide from '../../../../../packages/react/src/checkbox-group/checkbox-group.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/CheckboxGroup: one question with several answers, in a native <fieldset> under
// a <legend> (design spec docs/design/form-fields.md §6.2 and §6.5). `value` and
// `onValueChange` are the selected values: the group derives each box from `value` and reports
// the next array. KvirnUI holds no form state: without `value` the native
// checkboxes are uncontrolled. Nothing here validates: an invalid story sets `invalid` itself.
// checkbox-group.e2e.ts runs the keyboard rows, forced colours and reflow checks.

const meta = {
  title: 'Components/Form/CheckboxGroup',
  component: CheckboxGroup.Root,
  argTypes: {
    name: {
      control: 'text',
      description: 'The name every checkbox submits under. A checkbox’s own `name` wins.',
    },
    value: {
      control: false,
      description: 'Controlled: the values of the checked boxes, from your form logic.',
    },
    defaultValue: {
      control: false,
      description:
        'Uncontrolled: the values checked at the start. The browser keeps the state after that.',
    },
    onValueChange: {
      control: false,
      description:
        "Called with the next values and `{ reason: 'input', event }` when a box changes. It only reports: the group stores nothing.",
    },
    invalid: {
      control: 'boolean',
      description:
        'Sets `data-invalid` on the fieldset, its parts and every box. No `aria-invalid`: the error message describes the group.',
    },
    required: {
      control: 'boolean',
      description: 'Sets `data-required` and removes the legend’s optional text.',
    },
    disabled: {
      control: 'boolean',
      description: 'Native `fieldset[disabled]`: every box is disabled and skipped by Tab.',
    },
    messages: {
      control: false,
      description:
        'Per-instance overrides of the legend’s optional text (`field.optional`) and the error prefix (`field.errorPrefix`).',
    },
    render: { control: false, description: 'Another element. It must still be a `<fieldset>`.' },
  },
  args: { onValueChange: logChange('onValueChange') },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <Contact {...args} locale={localeOf(globals)} />,
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof CheckboxGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

interface ContactOptions {
  locale: FormLocale
  /** Show the hint under the legend. */
  hint?: boolean
  /** Show a hint under the e-post and brev options. */
  optionHints?: boolean
  /** Show the group's error under the options (set `invalid` too). */
  error?: boolean
}

type ContactProps = ContactOptions & Omit<ComponentProps<typeof CheckboxGroup.Root>, 'children'>

/** The design spec's contact question: three options under a legend. */
function Contact({
  locale,
  hint = true,
  optionHints = false,
  error = true,
  ...groupProps
}: ContactProps) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <CheckboxGroup.Root name="contact" lang={lang} {...groupProps}>
      <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
      {hint ? (
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
      ) : null}
      <Field.Root>
        <Checkbox value="email" />
        <Field.Label>{text.contactEmail}</Field.Label>
        {optionHints ? <Field.Hint>{text.contactEmailHint}</Field.Hint> : null}
      </Field.Root>
      <Field.Root>
        <Checkbox value="text" />
        <Field.Label>{text.contactText}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Checkbox value="letter" />
        <Field.Label>{text.contactLetter}</Field.Label>
        {optionHints ? <Field.Hint>{text.contactLetterHint}</Field.Hint> : null}
      </Field.Root>
      {error ? <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage> : null}
    </CheckboxGroup.Root>
  )
}

/** The main example: three options under a legend, the group named by the question. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.contactLegend}`) })
    await expect(group.tagName).toBe('FIELDSET')
    await expect(group).toHaveAccessibleDescription(text.contactHint)
    for (const label of [text.contactEmail, text.contactText, text.contactLetter]) {
      const checkbox = canvas.getByRole('checkbox', { name: label })
      await expectMinimumTargetSize(checkbox)
      await expect(checkbox).toHaveAttribute('name', 'contact')
    }
  },
}

/** The label of the button before the group: sv and fi are written, the rest show English. */
const backTexts: Partial<Record<FormLocale, string>> = { sv: 'Tillbaka', fi: 'Takaisin' }

function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="kv-button-group">
        {/* nb, nn and se come from a translator: until then the English text, marked as English (3.1.2). */}
        <Button type="button" lang={backTexts[locale] === undefined ? 'en' : undefined}>
          {backTexts[locale] ?? 'Back'}
        </Button>
      </div>
      <Contact locale={locale} />
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/**
 * The fixture the keyboard tests drive: the group between a button before and a button after,
 * in a form. Try the keys in the Keyboard section above: every checkbox is its own Tab stop,
 * Space toggles the focused one, and the arrow keys do nothing.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

/**
 * The description: a `CheckboxGroup.Prose` above the options says how many answers are allowed.
 * It is read as the group's description. The main example shows it too.
 */
export const WithDescription: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByText(text.contactHint)).toBeVisible()
  },
}

/** An option's own hint is in that checkbox's description, under its label. */
export const WithOptionHints: Story = {
  render: (args, { globals }) => <Contact {...args} locale={localeOf(globals)} optionHints />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('checkbox', { name: text.contactLetter }),
    ).toHaveAccessibleDescription(text.contactLetterHint)
  },
}

/** Invalid: every box gets a 2px edge, and the message is under the options. No aria-invalid. */
export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.contactLegend}`) })
    await expect(group).toHaveAccessibleDescription(
      new RegExp(`${text.contactHint}.*${text.contactError}`),
    )
    const checkbox = canvas.getByRole('checkbox', { name: text.contactEmail })
    await expect(checkbox).toHaveAttribute('data-invalid')
    await expect(checkbox).not.toHaveAttribute('aria-invalid')
  },
}

/** Disabled: native `fieldset[disabled]`, so every checkbox is disabled and skipped by Tab. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: ['email'] },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('checkbox', { name: text.contactEmail })).toBeDisabled()
    await expect(canvas.getByRole('checkbox', { name: text.contactEmail })).toBeChecked()
  },
}

/** In a card: the edges keep 3:1 against `surface-raised` (1.4.11). */
export const InCard: Story = {
  args: { invalid: true },
  render: (args, { globals }) => (
    <Card.Root>
      <Contact {...args} locale={localeOf(globals)} />
    </Card.Root>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('checkbox', { name: text.contactEmail })).toBeVisible()
  },
}

/** Staff density from 64rem: the rows are 32px high, the boxes still 24px. */
export const Compact: Story = {
  render: (args, { globals }) => (
    <div className="kv-compact">
      <Contact {...args} locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('checkbox', { name: text.contactEmail }))
  },
}

/** A long Finnish legend and options in a 320px column: they wrap and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Contact {...args} locale={locale} optionHints />
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Controlled: the values live in this story's `useState`; the group reports the next array. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text } = choiceTextsFor(locale)
  const [value, setValue] = useState<string[]>(['email'])
  return (
    <div className="kv-story-form">
      <Contact locale={locale} value={value} onValueChange={setValue} />
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value.join(', ')}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the group checks the boxes whose value is in `value`, and calls
 * `onValueChange(next, { reason: 'input', event })` with the array to store. It never stores it.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactLetter }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: email, letter`)
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactEmail }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: letter`)
  },
}

/** An uncontrolled form: the browser keeps the state, and the submit reads every checked box. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [sent, setSent] = useState<string[] | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new FormData(event.currentTarget).getAll('contact').map(String))
      }}
    >
      <Contact locale={locale} defaultValue={['text']} />
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent.join(', ')}
        </p>
      )}
    </form>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The checkboxes
 * are uncontrolled, and the form's `FormData` has every checked value under the group's name.
 */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactEmail }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: email, text`)
  },
}

/** Every state of the group in one column, for the RTL and forced-colours stories. */
function GroupStates({ locale }: { locale: FormLocale }) {
  return (
    <div className="kv-story-form">
      <Contact locale={locale} defaultValue={['email', 'letter']} error={false} />
      <Contact locale={locale} name="invalid" invalid defaultValue={['text']} />
      <Contact locale={locale} name="disabled" disabled defaultValue={['email']} error={false} />
    </div>
  )
}

/** Right to left, in English: the boxes are at the right of their labels. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <GroupStates locale="en" />,
}

/** Checked, invalid and disabled boxes stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <GroupStates locale={localeOf(globals)} />,
}
