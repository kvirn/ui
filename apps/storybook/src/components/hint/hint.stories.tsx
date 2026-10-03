import { Checkbox, Field, Fieldset, Input, Label, Legend, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { FieldStates, localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Hint: a Prose directly in a Field or Fieldset is the description of the
// control, or of a group inside a Fieldset (which replaced Field.Description). A hint
// carries what the user needs to answer, so it is in the text colour in every density, never
// muted: 16px above the control and for an option's hint, and 14px (body-small) under the control
//. Keep it to plain text and short paragraphs: an accessible description
// has no structure. The design spec is docs/design/form-fields.md §6.2. KvirnUI holds no form
// state.

const meta = {
  title: 'Components/Form/Hint',
  component: Prose,
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
      <Field required lang={lang}>
        <Label>{text.name}</Label>
        <Prose {...args}>
          <p>{text.nameHint}</p>
        </Prose>
        <Input name="name" autoComplete="name" />
      </Field>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab goes
 * to the input and never stops on the hint.
 */
export const Keyboard: Story = {}

/** In a Field: the Prose is the hint, and it is listed in the input's `aria-describedby`, first. */
export const InField: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await expect(input).toHaveAccessibleDescription(text.nameHint)
  },
}

/** In a Fieldset: the hint describes the group, and is announced when focus enters it. */
export const InFieldset: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset lang={lang}>
        <Legend>{text.addressLegend}</Legend>
        <Prose>
          <p>{text.addressHint}</p>
        </Prose>
        <Field required>
          <Label>{text.street}</Label>
          <Input name="street" autoComplete="street-address" />
        </Field>
      </Fieldset>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(
      canvas.getByRole('group', { name: text.addressLegend }),
    ).toHaveAccessibleDescription(text.addressHint)
  },
}

/** A format example in a hint, not in a placeholder: it stays when the user types. */
export const WithExample: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.registration}</Label>
        <Input name="registration" className="kv-input--width-10" />
        <Prose>
          <p>{text.registrationHint}</p>
        </Prose>
      </Field>
    )
  },
}

/**
 * Two hints in one Field: what to answer and where to find it above the
 * input, and the format under it. Each has its own id. The input's `aria-describedby` lists
 * them in DOM order, then the error's, so a screen reader reads both hints, then "Fel: …".
 */
export const AboveAndUnder: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.registration}</Label>
        <Prose>
          <p>{text.registrationWhere}</p>
        </Prose>
        <Input name="registration" className="kv-input--width-10" />
        <Prose>
          <p>{text.registrationHint}</p>
        </Prose>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.registration })
    await expect(input).toHaveAccessibleDescription(
      `${text.registrationWhere} ${text.registrationHint}`,
    )
    // One id each: never the same id twice.
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ')
    await expect(new Set(ids).size).toBe(2)
    await expect(canvas.getByText(text.registrationWhere).parentElement).toHaveAttribute(
      'id',
      ids[0],
    )
    await expect(canvas.getByText(text.registrationHint).parentElement).toHaveAttribute(
      'id',
      ids[1],
    )
  },
}

/** Compact density keeps a hint above the input at 16px and one under it at 14px (`body-small`). */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field required>
          <Label>{text.name}</Label>
          <Prose data-testid="description">
            <p>{text.nameHint}</p>
          </Prose>
          <Input name="name" autoComplete="name" />
          <Prose data-testid="under">
            <p>{text.registrationHint}</p>
          </Prose>
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('description')).fontSize).toBe('16px')
    await expect(getComputedStyle(canvas.getByTestId('under')).fontSize).toBe('14px')
  },
}

/**
 * Only a hint under the control is 14px. A hint above it, in a Field whose label is the page's
 * `h1` (one question per page), and an option's hint beside a checkbox are 16px: they are the
 * instruction a resident reads first.
 */
export const SixteenAboveAndForOptions: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <Field required>
          <h1>
            <Label className="kv-field-label--heading">{text.nameQuestion}</Label>
          </h1>
          <Prose data-testid="above">
            <p>{text.nameHint}</p>
          </Prose>
          <Input name="name" autoComplete="name" />
          <Prose data-testid="under">
            <p>{text.registrationHint}</p>
          </Prose>
        </Field>
        <Field>
          <Checkbox value="email" />
          <Label>{text.street}</Label>
          <Prose data-testid="option">
            <p>{text.addressHint}</p>
          </Prose>
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('above')).fontSize).toBe('16px')
    await expect(getComputedStyle(canvas.getByTestId('option')).fontSize).toBe('16px')
    await expect(getComputedStyle(canvas.getByTestId('under')).fontSize).toBe('14px')
  },
}

/** A long Finnish hint wraps in a 320px column (1.4.10). */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field required lang={lang}>
          <Label>{text.caseNumber}</Label>
          <Prose>
            <p>{text.caseNumberHint}</p>
          </Prose>
          <Input name="case-number" inputMode="numeric" spellCheck={false} />
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <FieldStates locale="en" />,
}

/** The hint stays in the system text colour in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
