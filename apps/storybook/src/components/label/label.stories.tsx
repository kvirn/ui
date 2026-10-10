import { Field, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/field/field.a11y.md?raw'
import guide from '../../../../../packages/react/src/field/field-label.md?raw'
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

// Components/Form/Label: Label, a native <label for> that names the control. The
// stories render it inside a Field, because the Field links it to the control and decides
// whether it ends with the optional text. The design spec is
// docs/design/form-fields.md §6.2. KvirnUI holds no form state: `required` is a prop.

const meta = {
  title: 'Components/Forms/Label',
  component: Field.Label,
  argTypes: {
    marker: {
      control: 'select',
      options: [undefined, 'optional', 'none'],
      description:
        '`none` leaves out the optional text, for a lone search field or a single consent checkbox.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-field-label--heading'],
      description:
        'Joins `kv-field-label`. The theme styles `kv-field-label--heading`, for a label that is the page’s `h1`.',
    },
    ref: { control: false, description: 'A ref to the `<label>`.' },
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
      <Field.Root required lang={lang}>
        <Field.Label {...args}>{text.name}</Field.Label>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Field.Label>

export default meta
type Story = StoryObj<typeof meta>

/** The label names the input: clicking it focuses the input (2.5.3, 3.3.2). */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    const label = canvas.getByText(text.name)
    await expect(label.tagName).toBe('LABEL')
    await expect(label).toHaveAttribute('for', input.id)
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab goes
 * to the input and never stops on the label, and a click on the label focuses the input.
 */
export const Keyboard: Story = {}

/**
 * In a field that isn't required, the label ends with the `field.optional` text. It is part
 * of the accessible name, so a screen-reader user hears it too.
 */
export const Optional: Story = {
  render: (args, { globals }) => {
    const locale = localeOf(globals)
    const { text, lang } = textsFor(locale)
    return (
      <Field.Root lang={lang}>
        <Field.Label {...args}>{text.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" className="kv-input--width-20" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    await expect(
      canvas.getByRole('textbox', { name: `${text.phone} ${fieldMessagesFor(locale).optional}` }),
    ).toBeVisible()
  },
}

/** `marker="none"` leaves the optional text out of a field that isn't required. */
export const WithoutMarker: Story = {
  args: { marker: 'none' },
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label {...args}>{text.search}</Field.Label>
        <TextInput name="search" type="search" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('searchbox', { name: text.search })).toBeVisible()
  },
}

/** The label is the page's `h1`: put the label in the heading, not the heading in the label. */
export const AsPageHeading: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <h1>
          <Field.Label className="kv-field-label--heading">{text.nameQuestion}</Field.Label>
        </h1>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.nameQuestion })).toBeVisible()
  },
}

/** A long Finnish compound label wraps and hyphenates at 320px (1.4.10). */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <TextInput name="reference" inputMode="numeric" spellCheck={false} />
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

/** Staff density from 64rem: 14px, still weight 500. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.name}</Field.Label>
          <TextInput name="name" autoComplete="name" />
        </Field.Root>
      </div>
    )
  },
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: () => <FieldStates locale="en" />,
}

/** The label keeps its text colour in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
