import { Field, Input, InputGroup } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Number: numbers are an Input, not a new component (ADR-0030, design spec
// docs/design/form-fields.md §6.4). `type="number"` changes the value on mouse wheel, drops
// leading zeros ("004512" becomes 4512), rounds silently, shows spinners that are hard to hit
// and, in some browsers, reads the decimal mark by the browser's language, not the page's. So:
//
//   <Input type="text" inputMode="numeric" spellCheck={false} />   whole numbers and codes
//   <Input type="text" inputMode="decimal" spellCheck={false} />   amounts, with , or .
//
// Put the unit in the label or the hint, not in the box. Set `autoComplete` where a value
// exists (`postal-code`, `tel`). Don't set `pattern`: it triggers the browser's validation
// bubbles, in the browser's language. Never filter keys or block paste (3.3.8): your form
// parses what people type ("1 250,50", "1250.50", " 2 ") and validates it, and the width
// classes only hint at the expected length. KvirnUI holds no form state: you parse and keep
// the value.

const meta = {
  title: 'Components/Form/Number',
  component: Input,
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

interface NumberFieldProps {
  locale: FormLocale
  invalid?: boolean
}

/** A whole number: `inputMode="numeric"` brings up the numeric keypad. */
function WholeNumberField({ locale, invalid = false }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required invalid={invalid} lang={lang}>
      <Field.Label>{text.children}</Field.Label>
      <Input
        name="children"
        inputMode="numeric"
        spellCheck={false}
        autoComplete="off"
        defaultValue={invalid ? '2,5' : undefined}
        className="kv-input--width-2 kv-input--numeric"
      />
      <Field.ErrorMessage>{text.childrenError}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** An amount: `inputMode="decimal"`, with the locale's decimal mark in the example. */
function AmountField({ locale }: NumberFieldProps) {
  const { text, lang, rentExample } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.rent}</Field.Label>
      <Field.Description>{text.rentHint(rentExample)}</Field.Description>
      <Input
        name="rent"
        inputMode="decimal"
        spellCheck={false}
        autoComplete="off"
        className="kv-input--width-10 kv-input--numeric"
      />
    </Field.Root>
  )
}

/** A reference number: leading zeros are kept, which `type="number"` would drop. */
function ReferenceNumberField({ locale }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.caseNumber}</Field.Label>
      <Field.Description>{text.caseNumberHint}</Field.Description>
      <Input
        name="case-number"
        inputMode="numeric"
        spellCheck={false}
        autoComplete="off"
        defaultValue="004512"
        className="kv-input--width-6 kv-input--numeric"
      />
    </Field.Root>
  )
}

/** A postcode: text, so Finnish `00100` keeps its zeros, with `autocomplete="postal-code"`. */
function PostcodeField({ locale }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.postcode}</Field.Label>
      <Field.Description>{text.postcodeHint}</Field.Description>
      <Input
        name="postcode"
        inputMode="numeric"
        spellCheck={false}
        autoComplete="postal-code"
        className="kv-input--width-6 kv-input--numeric"
      />
    </Field.Root>
  )
}

/** Number of children: `inputMode="numeric"` and `kv-input--width-2`. */
export const WholeNumber: Story = {
  render: (_args, { globals }) => <WholeNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    // A text input with a numeric keypad: not a spinbutton.
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('spellcheck', 'false')
  },
}

/**
 * Rent per month: `inputMode="decimal"`. The hint shows the amount the way the page's language
 * writes it, and says to leave out the currency sign.
 */
export const Amount: Story = {
  render: (_args, { globals }) => <AmountField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rent })
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    // Typed the way people write amounts: spaces, a comma and a point all stay as typed.
    await userEvent.type(input, '1 250,50')
    await expect(input).toHaveValue('1 250,50')
  },
}

/**
 * The fixture the keyboard tests drive: an amount as text. Try the keys in the Keyboard
 * section above: ArrowUp and ArrowDown never step the number (ADR-0030), and the other keys are
 * the browser's own, as in any text field.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <AmountField locale={localeOf(globals)} />,
}

/**
 * An amount with its unit shown in the box (ADR-0031): an `InputGroup` with a "kr" Addon. The
 * Addon is `aria-hidden`, so the label carries the unit: "Månadshyra i kronor". See
 * Components/Form/InputGroup for the other add-ons.
 */
export const AmountWithUnit: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rentWithUnit}</Field.Label>
        <InputGroup.Root>
          <Input
            name="rent"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.Description>{text.rentUnitExample(amountExample)}</Field.Description>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text, amountExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    // The unit isn't in the name or the description: the label already says it.
    await expect(input).toHaveAccessibleDescription(text.rentUnitExample(amountExample))
    await userEvent.type(input, '8 450')
    await expect(input).toHaveValue('8 450')
  },
}

/** A case number: the leading zeros survive, because the value is text. */
export const ReferenceNumber: Story = {
  render: (_args, { globals }) => <ReferenceNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.caseNumber })
    await expect(input).toHaveValue('004512')
    await userEvent.clear(input)
    await userEvent.type(input, '004513')
    await expect(input).toHaveValue('004513')
  },
}

/** A Finnish postcode starts with zeros, and a Swedish one has a space: both are text. */
export const Postcode: Story = {
  render: (_args, { globals }) => <PostcodeField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.postcode })
    await expect(input).toHaveAttribute('autocomplete', 'postal-code')
    await userEvent.type(input, '00100')
    await expect(input).toHaveValue('00100')
  },
}

/**
 * Invalid: the message says what's wrong and how to fix it, in the field's own words. The
 * answer stays as typed. Your form logic parses and decides: nothing here validates.
 */
export const Invalid: Story = {
  render: (_args, { globals }) => <WholeNumberField locale={localeOf(globals)} invalid />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveValue('2,5')
  },
}

/** Each kind of number once, the whole number with its error: names stay unique on the page. */
function AllNumbers({ locale }: { locale: FormLocale }) {
  return (
    <>
      <WholeNumberField locale={locale} invalid />
      <AmountField locale={locale} />
      <ReferenceNumberField locale={locale} />
      <PostcodeField locale={locale} />
    </>
  )
}

/** Finnish: longer labels, and the decimal comma. Nothing overflows in a 320px column. */
export const Finnish: Story = {
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <div className="kv-story-form">
        <AllNumbers locale="fi" />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Montako lasta asuu kanssasi?' }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <AllNumbers locale="en" />,
}

/** Edges survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <AllNumbers locale={localeOf(globals)} />,
}
