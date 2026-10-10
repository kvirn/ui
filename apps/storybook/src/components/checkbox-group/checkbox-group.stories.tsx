import { Button, Card, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/checkbox-group/checkbox-group.a11y.md?raw'
import guide from '../../../../../packages/react/src/checkbox-group/checkbox-group.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { ContactForm, ControlledContactGroup } from './checkbox-group.fixture.tsx'

// Components/Form/CheckboxGroup: one question with several answers, in a native <fieldset> under
// a <legend> (design spec docs/design/form-fields.md §6.2 and §6.5). `value` and
// `onValueChange` are the selected values: the group derives each box from `value` and reports
// the next array. KvirnUI holds no form state: without `value` the native
// checkboxes are uncontrolled. Nothing here validates: an invalid story sets `invalid` itself.

const meta = {
  title: 'Components/Choice and overlays/CheckboxGroup',
  component: CheckboxGroup.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { name: 'contact', invalid: false, required: false, disabled: false },
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
  // The design spec's contact question: three options under a legend. The localised text is
  // taken at the top, and the locale comes from the toolbar through `withFormLocale`.
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <CheckboxGroup.Root {...args} lang={lang}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
        <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
      </CheckboxGroup.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof CheckboxGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

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

/** The label of the button before the group. se shows English, marked lang="en". */
const backTexts: Partial<Record<FormLocale, string>> = {
  sv: 'Tillbaka',
  fi: 'Takaisin',
  nb: 'Tilbake',
  nn: 'Tilbake',
}

/**
 * The fixture the keyboard tests drive: the group between a button before and a button after,
 * in a form. Try the keys in the Keyboard section above: every checkbox is its own Tab stop,
 * Space toggles the focused one, and the arrow keys do nothing.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    const { text, lang } = choiceTextsFor(locale)
    return (
      <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="kv-button-group">
          {/* se: English, marked lang="en" (3.1.2). */}
          <Button type="button" lang={backTexts[locale] === undefined ? 'en' : undefined}>
            {backTexts[locale] ?? 'Back'}
          </Button>
        </div>
        <CheckboxGroup.Root name="contact">
          <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
          <CheckboxGroup.Prose>
            <p>{text.contactHint}</p>
          </CheckboxGroup.Prose>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>{text.contactEmail}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="text" />
            <Field.Label>{text.contactText}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="letter" />
            <Field.Label>{text.contactLetter}</Field.Label>
          </Field.Root>
          <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
        </CheckboxGroup.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            {text.send}
          </Button>
        </div>
      </form>
    )
  },
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

/** An option's own help text is in that checkbox's description, under its label. */
export const WithOptionHelpTexts: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <CheckboxGroup.Root {...args} lang={lang}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
          <Field.HelpText>{text.contactEmailHint}</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
          <Field.HelpText>{text.contactLetterHint}</Field.HelpText>
        </Field.Root>
        <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
      </CheckboxGroup.Root>
    )
  },
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

/**
 * Required: the legend has no optional text (the other examples end with "(valfritt)") and the
 * fieldset gets `data-required`. ARIA has no `aria-required` on a group, so it is not announced
 * as required: say what is required in the legend or the description.
 */
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: text.contactLegend })
    await expect(group).toHaveAttribute('data-required')
    await expect(group).not.toHaveAttribute('aria-required')
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
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root>
        <CheckboxGroup.Root {...args} lang={lang}>
          <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
          <CheckboxGroup.Prose>
            <p>{text.contactHint}</p>
          </CheckboxGroup.Prose>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>{text.contactEmail}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="text" />
            <Field.Label>{text.contactText}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="letter" />
            <Field.Label>{text.contactLetter}</Field.Label>
          </Field.Root>
          <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
        </CheckboxGroup.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('checkbox', { name: text.contactEmail })).toBeVisible()
  },
}

/** Staff density from 64rem: the rows are 32px high, the boxes still 24px. */
export const Compact: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact">
        <CheckboxGroup.Root {...args} lang={lang}>
          <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
          <CheckboxGroup.Prose>
            <p>{text.contactHint}</p>
          </CheckboxGroup.Prose>
          <Field.Root>
            <Checkbox value="email" />
            <Field.Label>{text.contactEmail}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="text" />
            <Field.Label>{text.contactText}</Field.Label>
          </Field.Root>
          <Field.Root>
            <Checkbox value="letter" />
            <Field.Label>{text.contactLetter}</Field.Label>
          </Field.Root>
          <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
        </CheckboxGroup.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('checkbox', { name: text.contactEmail }))
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
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <CheckboxGroup.Root {...args} lang={lang}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
          <Field.HelpText>{text.contactEmailHint}</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
          <Field.HelpText>{text.contactLetterHint}</Field.HelpText>
        </Field.Root>
        <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
      </CheckboxGroup.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the group checks the boxes whose value is in `value`, and calls
 * `onValueChange(next, { reason: 'input', event })` with the array to store. It never stores it.
 */
export const Controlled: Story = {
  parameters: showSource('checkbox-group/checkbox-group.fixture.tsx', 'ControlledContactGroup'),
  render: (_args, { globals }) => <ControlledContactGroup locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactLetter }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: email, letter`)
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactEmail }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: letter`)
  },
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The checkboxes
 * are uncontrolled, and the form's `FormData` has every checked value under the group's name.
 */
export const PlainForm: Story = {
  parameters: showSource('checkbox-group/checkbox-group.fixture.tsx', 'ContactForm'),
  render: (_args, { globals }) => <ContactForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('checkbox', { name: text.contactEmail }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: email, text`)
  },
}

// Every state of the group in one column: checked, invalid and disabled. The RTL and ForcedColors
// stories render it, so a reader of either sees the real parts.
const renderGroupStates: NonNullable<Story['render']> = (_args, { globals }) => {
  const { text, lang } = choiceTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <CheckboxGroup.Root name="contact" defaultValue={['email', 'letter']}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>
      <CheckboxGroup.Root name="invalid" invalid defaultValue={['text']}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
        <CheckboxGroup.ErrorMessage>{text.contactError}</CheckboxGroup.ErrorMessage>
      </CheckboxGroup.Root>
      <CheckboxGroup.Root name="disabled" disabled defaultValue={['email']}>
        <CheckboxGroup.Legend>{text.contactLegend}</CheckboxGroup.Legend>
        <CheckboxGroup.Prose>
          <p>{text.contactHint}</p>
        </CheckboxGroup.Prose>
        <Field.Root>
          <Checkbox value="email" />
          <Field.Label>{text.contactEmail}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{text.contactText}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{text.contactLetter}</Field.Label>
        </Field.Root>
      </CheckboxGroup.Root>
    </div>
  )
}

/** Right to left, in English: the boxes are at the right of their labels. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderGroupStates,
}

/** Checked, invalid and disabled boxes stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderGroupStates,
}
