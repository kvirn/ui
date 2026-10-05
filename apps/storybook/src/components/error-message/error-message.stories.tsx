import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import guide from '../../../../../packages/react/src/field/field-error-message.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import {
  FieldStates,
  localeOf,
  fieldMessagesFor,
  textsFor,
  withFormLocale,
} from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/ErrorMessage: ErrorMessage, a <p> that renders only while its Field or
// Fieldset is invalid. It starts with the `field.errorPrefix` text ("Fel:"), which the theme
// hides visually, and the error icon, and it is part of the control's accessible description.
// It isn't a live region: it is heard when the user reaches the control. The
// consumer writes the message and decides when the field is invalid: KvirnUI validates nothing.
// The design spec is docs/design/form-fields.md §6.2 and §4.3.

const meta = {
  title: 'Components/Form/ErrorMessage',
  component: Field.ErrorMessage,
  argTypes: {
    className: {
      control: 'text',
      description: 'Your own classes, added to `kv-field-error-message`.',
    },
    render: {
      control: false,
      description: 'Another element for the message. It receives the host’s state.',
    },
    ref: { control: false, description: 'A ref to the `<p>`.' },
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
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" />
        <Field.ErrorMessage {...args}>{text.nameError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Field.ErrorMessage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * In a Field: the message under the input, with the icon and the hidden prefix. Screen
 * readers hear "Fel: Ange ditt fullständiga namn" as the input's description.
 */
export const InField: Story = {
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const input = canvas.getByRole('textbox', { name: text.name })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(
      `${fieldMessagesFor(locale).errorPrefix} ${text.nameError}`,
    )
    await expect(canvas.getByText(text.nameError)).toBeVisible()
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab goes
 * to the input and never stops on the error message.
 */
export const Keyboard: Story = {}

/** Valid: the message isn't rendered, so no stale error is ever referenced. */
export const NotInvalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" />
        <Field.ErrorMessage {...args}>{text.nameError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.queryByText(text.nameError)).toBeNull()
    await expect(canvas.getByRole('textbox', { name: text.name })).not.toHaveAttribute(
      'aria-describedby',
    )
  },
}

/** In a Fieldset: one message for the group, under its controls. It describes the group. */
export const InFieldset: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root invalid lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Fieldset.ErrorMessage {...args}>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    await expect(
      canvas.getByRole('group', { name: text.addressLegend }),
    ).toHaveAccessibleDescription(
      `${text.addressHint} ${fieldMessagesFor(locale).errorPrefix} ${text.addressError}`,
    )
  },
}

/**
 * After a help text under the input: the help text, then the error, one gap apart. The help text is `text` in
 * regular weight, and the error is `danger` in medium weight with the icon, so they never read
 * as one paragraph. The input's description lists the help text, then the error.
 */
export const UnderHelpText: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.registration}</Field.Label>
        <TextInput name="registration" className="kv-input--width-10" defaultValue="AB 1" />
        <Field.HelpText>{text.registrationHint}</Field.HelpText>
        <Field.ErrorMessage {...args}>{text.registrationError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    await expect(
      canvas.getByRole('textbox', { name: text.registration }),
    ).toHaveAccessibleDescription(
      `${text.registrationHint} ${fieldMessagesFor(locale).errorPrefix} ${text.registrationError}`,
    )
  },
}

/**
 * A long Finnish message wraps under the icon, and the icon stays beside the first line, also
 * under the 1.4.12 line height.
 */
export const LongMessage: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root required invalid lang={lang}>
          <Field.Label>{text.email}</Field.Label>
          <TextInput name="email" type="email" autoComplete="email" defaultValue="anna@" />
          <Field.ErrorMessage {...args}>{text.emailError}</Field.ErrorMessage>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByText(text.emailError)).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Compact density keeps the message at 16px: errors never go below it. */
export const Compact: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required invalid>
          <Field.Label>{text.name}</Field.Label>
          <TextInput name="name" autoComplete="name" />
          <Field.ErrorMessage {...args} data-testid="error">
            {text.nameError}
          </Field.ErrorMessage>
        </Field.Root>
      </div>
    )
  },
}

/** Right to left, in English: the icon and the text start at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: () => <FieldStates locale="en" />,
}

/** The message is drawn in the system text colour, with its icon, and the input's edge is 2px. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
