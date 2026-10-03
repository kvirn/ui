import { ErrorMessage, Field, Fieldset, Input, Label, Legend, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/fieldset/fieldset.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { expect } from 'storybook/test'
import { localeOf, fieldMessagesFor, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Fieldset: the native <fieldset> and <legend>, grouping questions under one
// name (ADR-0029, design spec docs/design/form-fields.md §6.2). The group's hint and error
// are its accessible description. `disabled` is native `fieldset[disabled]`, so every control
// inside is disabled. KvirnUI holds no form state: `invalid`, `required` and `disabled` are
// props from your form logic.

const meta = {
  title: 'Components/Form/Fieldset',
  component: Fieldset,
  argTypes: {
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    group: {
      control: 'boolean',
      description:
        'One question answered with several controls: the legend gets the optional text and the Fields inside drop theirs.',
    },
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
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} />,
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Fieldset>

export default meta
type Story = StoryObj<typeof meta>

interface AddressOptions {
  locale: FormLocale
  /** Show the hint under the legend. */
  hint?: boolean
  /** Show the group's error, and mark the street invalid under it. */
  error?: boolean
  /** The legend is the page's `h1`. */
  heading?: boolean
}

type AddressProps = AddressOptions & Omit<ComponentProps<typeof Fieldset>, 'children'>

/** A street, a postcode and a town: three questions in one group. */
function Address({
  locale,
  hint = false,
  error = false,
  heading = false,
  ...fieldsetProps
}: AddressProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Fieldset {...fieldsetProps} invalid={error || fieldsetProps.invalid} lang={lang}>
      {heading ? (
        <Legend className="kv-fieldset-legend--heading">
          <h1>{text.addressLegend}</h1>
        </Legend>
      ) : (
        <Legend>{text.addressLegend}</Legend>
      )}
      {hint ? (
        <Prose>
          <p>{text.addressHint}</p>
        </Prose>
      ) : null}
      <Field required invalid={error}>
        <Label>{text.street}</Label>
        <Input name="street" autoComplete="street-address" />
      </Field>
      <Field required>
        <Label>{text.postcode}</Label>
        <Input
          name="postcode"
          inputMode="numeric"
          spellCheck={false}
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field>
      <Field required>
        <Label>{text.town}</Label>
        <Input name="town" autoComplete="address-level2" className="kv-input--width-20" />
      </Field>
      <ErrorMessage>{text.addressError}</ErrorMessage>
    </Fieldset>
  )
}

/** An address: the legend names the group, and the fields are 24px apart. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: text.addressLegend })
    await expect(group.tagName).toBe('FIELDSET')
    await expect(canvas.getByRole('textbox', { name: text.street })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: text.postcode })).toBeVisible()
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through the three inputs only. The fieldset, its legend and its hint are never
 * Tab stops.
 */
export const Keyboard: Story = {
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} hint />,
}

/** The hint describes the group: it is announced when focus enters it. */
export const WithDescription: Story = {
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} hint />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(
      canvas.getByRole('group', { name: text.addressLegend }),
    ).toHaveAccessibleDescription(text.addressHint)
  },
}

/**
 * Invalid: one message for the group, under its fields. The fieldset's `invalid` marks its
 * own parts only: the street is marked invalid on its own Field, so only that edge is red.
 */
export const Invalid: Story = {
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} hint error />,
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    await expect(
      canvas.getByRole('group', { name: text.addressLegend }),
    ).toHaveAccessibleDescription(
      `${text.addressHint} ${fieldMessagesFor(locale).errorPrefix} ${text.addressError}`,
    )
    await expect(canvas.getByRole('textbox', { name: text.street })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(canvas.getByRole('textbox', { name: text.postcode })).not.toHaveAttribute(
      'aria-invalid',
    )
  },
}

/** Native `disabled` on the fieldset disables every control inside it. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.street })).toBeDisabled()
    await expect(canvas.getByRole('textbox', { name: text.town })).toBeDisabled()
  },
}

/** The legend is the page's heading: `legend.kv-fieldset-legend--heading > h1`. */
export const AsPageHeading: Story = {
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} hint heading />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.addressLegend })).toBeVisible()
    await expect(canvas.getByRole('group', { name: text.addressLegend })).toBeVisible()
  },
}

/** A long Finnish legend and labels wrap in a 320px column: the fieldset can shrink. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <Address {...args} locale={localeOf(globals)} hint />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Missä asut?' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Staff density from 64rem: 14px legend and labels, 4px between them. */
export const Compact: Story = {
  render: (args, { globals }) => (
    <div className="kv-compact">
      <Address {...args} locale={localeOf(globals)} hint />
    </div>
  ),
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (args) => <Address {...args} locale="en" hint error />,
}

/** The legend, the group's message and the fields' edges survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (args, { globals }) => <Address {...args} locale={localeOf(globals)} hint error />,
}
