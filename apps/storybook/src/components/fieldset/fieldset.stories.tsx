import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/fieldset/fieldset.a11y.md?raw'
import guide from '../../../../../packages/react/src/fieldset/fieldset.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Fieldset: the native <fieldset> and <legend>, grouping questions under one
// name (design spec docs/design/form-fields.md §6.2). The group's help text and error
// are its accessible description. `disabled` is native `fieldset[disabled]`, so every control
// inside is disabled. KvirnUI holds no form state: `invalid`, `required` and `disabled` are
// props from your form logic.

const meta = {
  title: 'Components/Form/Fieldset',
  component: Fieldset.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: { invalid: false, required: false, disabled: false, group: false },
  argTypes: {
    invalid: {
      control: 'boolean',
      description:
        'Sets `data-invalid` on the fieldset and its parts, and shows `Fieldset.ErrorMessage`. The Fields inside keep their own state.',
    },
    required: {
      control: 'boolean',
      description: 'Sets `data-required` and drops the legend’s optional text.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Native `fieldset[disabled]`: every control inside is disabled and skipped by Tab.',
    },
    group: {
      control: 'boolean',
      description:
        'One question answered with several controls: the legend gets the optional text and the Fields inside drop theirs.',
    },
    messages: {
      control: false,
      description:
        'Per-instance overrides of the legend’s optional text (`field.optional`) and the error prefix (`field.errorPrefix`).',
    },
    render: { control: false, description: 'Another element. It must still be a `<fieldset>`.' },
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
  // A street, a postcode and a town: three questions in one group. The localised text is taken at
  // the top, and the locale comes from the toolbar through `withFormLocale`.
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.HelpText>{text.addressFormat}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Fieldset.Root>

export default meta
type Story = StoryObj<typeof meta>

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
 * Shift+Tab move through the three inputs only. The fieldset, its legend, its description and its
 * help text are never Tab stops.
 */
export const Keyboard: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.HelpText>{text.addressFormat}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
}

/** The description (a Prose) describes the group: it is announced when focus enters it. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
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
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} invalid lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required invalid>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.HelpText>{text.addressFormat}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
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
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} lang={lang}>
        <Fieldset.Legend className="kv-fieldset-legend--heading">
          <h1>{text.addressLegend}</h1>
        </Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.addressLegend })).toBeVisible()
    await expect(canvas.getByRole('group', { name: text.addressLegend })).toBeVisible()
  },
}

/** A long Finnish legend and labels wrap in a 320px column: the fieldset can shrink. */
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
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Fieldset.Root {...args} lang={lang}>
        <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{text.addressHint}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{text.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.postcode}</Field.Label>
          <TextInput
            name="postcode"
            inputMode="numeric"
            spellCheck={false}
            autoComplete="postal-code"
            className="kv-input--width-6"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.town}</Field.Label>
          <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
        </Field.Root>
        <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Missä asut?' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Staff density from 64rem: 14px legend and labels, 4px between them. */
export const Compact: Story = {
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact">
        <Fieldset.Root {...args} lang={lang}>
          <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
          <Fieldset.Prose>
            <p>{text.addressHint}</p>
          </Fieldset.Prose>
          <Field.Root required>
            <Field.Label>{text.street}</Field.Label>
            <TextInput name="street" autoComplete="street-address" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>{text.postcode}</Field.Label>
            <TextInput
              name="postcode"
              inputMode="numeric"
              spellCheck={false}
              autoComplete="postal-code"
              className="kv-input--width-6"
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>{text.town}</Field.Label>
            <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
          </Field.Root>
          <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
        </Fieldset.Root>
      </div>
    )
  },
}

// The group with its description and an error, for the RTL and ForcedColors stories.
const renderInvalidAddress: NonNullable<Story['render']> = (args, { globals }) => {
  const { text, lang } = textsFor(localeOf(globals))
  return (
    <Fieldset.Root {...args} invalid lang={lang}>
      <Fieldset.Legend>{text.addressLegend}</Fieldset.Legend>
      <Fieldset.Prose>
        <p>{text.addressHint}</p>
      </Fieldset.Prose>
      <Field.Root required invalid>
        <Field.Label>{text.street}</Field.Label>
        <TextInput name="street" autoComplete="street-address" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.postcode}</Field.Label>
        <TextInput
          name="postcode"
          inputMode="numeric"
          spellCheck={false}
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.town}</Field.Label>
        <TextInput name="town" autoComplete="address-level2" className="kv-input--width-20" />
      </Field.Root>
      <Fieldset.ErrorMessage>{text.addressError}</Fieldset.ErrorMessage>
    </Fieldset.Root>
  )
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderInvalidAddress,
}

/** The legend, the group's message and the fields' edges survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderInvalidAddress,
}
