import { Field, Input } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import {
  FieldStates,
  localeOf,
  fieldMessagesFor,
  textsFor,
  withFormLocale,
} from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Field: the headless Field, styled by @kvirn-ui/theme/theme.css (design
// spec docs/design/form-fields.md). KvirnUI holds no form state: every story
// passes `invalid`, `required` and `disabled` itself, and writes its own error text, as an
// implementor's form logic would. field.e2e.ts runs the keyboard rows, focus, forced-colours and
// reflow checks against Default, Invalid, InvalidWithHintUnder, LongFinnish and ForcedColors.

const meta = {
  title: 'Components/Form/Field',
  component: Field.Root,
  // A question most forms require: the label then has no "(optional)". See `Optional`.
  args: { required: true },
  argTypes: {
    invalid: {
      control: 'boolean',
      description:
        'You decide when. `aria-invalid` goes on the control, `data-invalid` on every part, and the Field.ErrorMessage renders.',
    },
    required: {
      control: 'boolean',
      description:
        '`aria-required` on the control, and no "(optional)" in the label. Not native `required`.',
    },
    disabled: { control: 'boolean' },
    controlId: { control: 'text' },
    messages: { control: false },
    render: { control: false },
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
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.name}</Field.Label>
        <Input name="name" autoComplete="name" />
      </Field.Root>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Field.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A label and an input: the label names the input, and a click on it focuses the input. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await expect(input).toHaveAttribute('aria-required', 'true')
    await expect(input).not.toHaveAttribute('aria-invalid')
    await expect(input).not.toHaveAttribute('aria-describedby')
    await expectMinimumTargetSize(input)
  },
}

/** A description between the label and the input: it is the input's accessible description. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.name}</Field.Label>
        <Field.Prose>
          <p>{text.nameHint}</p>
        </Field.Prose>
        <Input name="name" autoComplete="name" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.name })).toHaveAccessibleDescription(
      text.nameHint,
    )
  },
}

/**
 * Required fields aren't marked. A field that isn't required ends its label with the
 * `field.optional` text, which is part of the input's accessible name (3.3.2).
 */
export const Optional: Story = {
  args: { required: false },
  render: (args, { globals }) => {
    const locale = localeOf(globals)
    const { text, lang } = textsFor(locale)
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.phone}</Field.Label>
        <Field.Prose>
          <p>{text.phoneHint}</p>
        </Field.Prose>
        <Input name="phone" type="tel" autoComplete="tel" className="kv-input--width-20" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const input = canvas.getByRole('textbox', {
      name: `${text.phone} ${fieldMessagesFor(locale).optional}`,
    })
    await expect(input).not.toHaveAttribute('aria-required')
  },
}

/** Required: `aria-required`, never native `required`, so the browser shows no bubble. */
export const Required: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <Input name="email" type="email" autoComplete="email" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.email })
    await expect(input).toHaveAttribute('aria-required', 'true')
    await expect(input).not.toHaveAttribute('required')
  },
}

/**
 * The fixture the keyboard tests drive: every state of a text field in one form. Try the keys
 * in the Keyboard section above: Tab and Shift+Tab move through the inputs only. The label and
 * the hint text and the error are never Tab stops, a disabled input is skipped, and a read-only
 * one is a Tab stop.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}

/**
 * A description and a hint, in the default order: what to answer and where to find it, above the
 * input (`Field.Prose`), and the format under it (`Field.Hint`). Each has its own id, and the
 * input's `aria-describedby` lists them in DOM order.
 */
export const WithHintUnder: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
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
    await expect((input.getAttribute('aria-describedby') ?? '').split(' ')).toHaveLength(2)
  },
}

/**
 * The hint under the input and the error together: label, description, input, hint, error. The
 * two differ in size, colour, weight, icon and indent, so they never read as one paragraph, and
 * the input's description lists the description and the hint, then the error.
 */
export const InvalidWithHintUnder: Story = {
  args: { invalid: true },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.registration}</Field.Label>
        <Field.Prose>
          <p>{text.registrationWhere}</p>
        </Field.Prose>
        <Input name="registration" className="kv-input--width-10" defaultValue="AB 1" />
        <Field.Hint>{text.registrationHint}</Field.Hint>
        <Field.ErrorMessage>{text.registrationError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const input = canvas.getByRole('textbox', { name: text.registration })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(
      `${text.registrationWhere} ${text.registrationHint} ${fieldMessagesFor(locale).errorPrefix} ${text.registrationError}`,
    )
    await expect(canvas.getByText(text.registrationError)).toBeVisible()
  },
}

/**
 * Invalid: the label, the hint, the input and then the error, under it. The input
 * gets `aria-invalid`, and its description lists the hint and then the error, which starts with
 * the hidden "Fel:". The error isn't a live region: it's heard when the user reaches the input.
 */
export const Invalid: Story = {
  args: { invalid: true },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <Input name="email" type="email" autoComplete="email" defaultValue="anna@" />
        <Field.ErrorMessage>{text.emailError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const input = canvas.getByRole('textbox', { name: text.email })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(
      `${text.emailHint} ${fieldMessagesFor(locale).errorPrefix} ${text.emailError}`,
    )
    await expect(canvas.getByText(text.emailError)).toBeVisible()
  },
}

/** Disabled: native `disabled` on the input. Say why on submit instead, where you can. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.registration}</Field.Label>
        <Input name="registration" defaultValue="ABC 123" className="kv-input--width-10" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.registration })).toBeDisabled()
  },
}

/** Read-only is for staff tools: the input stays focusable, and the hint under it says why. */
export const ReadOnly: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <Field.Label>{text.personalNumber}</Field.Label>
        <Input name="personal-number" readOnly defaultValue="19900101-1234" />
        <Field.Hint>{text.personalNumberHint}</Field.Hint>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.personalNumber })
    await expect(input).toHaveAttribute('readonly')
    input.focus()
    await expect(input).toHaveFocus()
  },
}

/** The label is the page's `h1`: one question per page, as in a service flow. */
export const AsPageHeading: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root {...args} lang={lang}>
        <h1>
          <Field.Label className="kv-field-label--heading">{text.nameQuestion}</Field.Label>
        </h1>
        <Field.Prose>
          <p>{text.nameHint}</p>
        </Field.Prose>
        <Input name="name" autoComplete="name" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.nameQuestion })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: text.nameQuestion })).toBeVisible()
  },
}

/**
 * A form in prose: prose stops at a field, so the heading label gets no prose margins, and the
 * field gets prose's block spacing. The description is a Prose of its own inside the field:
 * its paragraphs are prose, and it has no margin, so it stays close to its label.
 */
export const InsideProse: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <article className="kv-prose" lang={lang}>
        <h2>{text.proseHeading}</h2>
        <p>{text.proseText}</p>
        <Field.Root {...args}>
          <Field.Label>{text.name}</Field.Label>
          <Field.Prose data-testid="description">
            <p>{text.nameHint}</p>
          </Field.Prose>
          <Input name="name" autoComplete="name" />
        </Field.Root>
        <p>{text.proseText}</p>
      </article>
    )
  },
}

/**
 * Staff density from 64rem: 32px inputs and 14px labels. Descriptions, errors and values stay
 * 16px, and a hint stays 14px.
 */
export const Compact: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root {...args} invalid>
          <Field.Label>{text.email}</Field.Label>
          <Field.Prose>
            <p>{text.emailHint}</p>
          </Field.Prose>
          <Input name="email" type="email" autoComplete="email" defaultValue="anna@" />
          <Field.ErrorMessage>{text.emailError}</Field.ErrorMessage>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('textbox', { name: text.email }))
  },
}

/** A long Finnish compound label wraps and hyphenates in a 320px column (1.4.10). */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root {...args} lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <Field.Prose>
            <p>{text.caseNumberHint}</p>
          </Field.Prose>
          <Input name="reference" inputMode="numeric" spellCheck={false} />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /Asunnonmuutostyöavustushakemuksen/ }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: labels, hints and errors start at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <FieldStates locale="en" />,
}

/** Edges, the invalid state and disabled survive forced colours. The e2e suite emulates it. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
