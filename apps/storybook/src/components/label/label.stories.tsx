import { Field, Input, Label } from '@kvirn-ui/react'
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
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Label: Field.Label, a native <label for> that names the control. The
// stories render it inside a Field, because the Field links it to the control and decides
// whether it ends with the optional text (ADR-0029). The design spec is
// docs/design/form-fields.md §6.2. KvirnUI holds no form state: `required` is a prop.

const meta = {
  title: 'Components/Form/Label',
  component: Label,
  argTypes: {
    marker: {
      control: 'select',
      options: [undefined, 'optional', 'none'],
      description:
        '`none` leaves out the optional text, for a lone search field or a single consent checkbox.',
    },
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
      <Field required lang={lang}>
        <Label {...args}>{text.name}</Label>
        <Input name="name" autoComplete="name" />
      </Field>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab goes
 * to the input and never stops on the label, and a click on the label focuses the input.
 */
export const Keyboard: Story = {}

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
 * In a field that isn't required, the label ends with the `field.optional` text. It is part
 * of the accessible name, so a screen-reader user hears it too.
 */
export const Optional: Story = {
  render: (args, { globals }) => {
    const locale = localeOf(globals)
    const { text, lang } = textsFor(locale)
    return (
      <Field lang={lang}>
        <Label {...args}>{text.phone}</Label>
        <Input name="phone" type="tel" autoComplete="tel" className="kv-input--width-20" />
      </Field>
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
      <Field lang={lang}>
        <Label {...args}>{text.search}</Label>
        <Input name="search" type="search" />
      </Field>
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
      <Field required lang={lang}>
        <h1>
          <Label className="kv-field-label--heading">{text.nameQuestion}</Label>
        </h1>
        <Input name="name" autoComplete="name" />
      </Field>
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
        <Field required lang={lang}>
          <Label>{text.longLabel}</Label>
          <Input name="reference" inputMode="numeric" spellCheck={false} />
        </Field>
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
        <Field required>
          <Label>{text.name}</Label>
          <Input name="name" autoComplete="name" />
        </Field>
      </div>
    )
  },
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <FieldStates locale="en" />,
}

/** The label keeps its text colour in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
