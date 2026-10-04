import { Field, Input, InputGroup, masks } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Number: numbers are an Input, not a new component (design spec
// docs/design/form-fields.md §6.4). `type="number"` changes the value on mouse wheel, drops
// leading zeros ("004512" becomes 4512), rounds silently, shows spinners that are hard to hit
// and, in some browsers, reads the decimal mark by the browser's language, not the page's. So
// every field here is a text Input with a mask:
//
//   <Input mask={masks.number()} />                                whole numbers
//   <Input mask={masks.number({ decimals: 2, grouping: true })} />  amounts, with , or .
//   <Input mask={masks.digits()} />                                codes: leading zeros stay
//   <Input mask={masks.postalCode({ country: 'SE' })} />           postcodes
//
// The mask drops a character it can't take (a letter in a whole number) and says so politely,
// puts the separators in, and follows the page's language for the decimal mark. Paste and
// autofill still work (3.3.8): "1 250,50", "1250.50" and " 2 " are all read. The mask only
// shapes what is typed: your form still validates (a value can be out of range) and parses
// `details.unmaskedValue`. Every masked field needs a hint that says the format with an
// example (3.3.2).
//
// Put the unit in the label or the hint, not in the box. Set `autoComplete` where a value
// exists (`postal-code`, `tel`). Don't set `pattern`: it triggers the browser's validation
// bubbles, in the browser's language. The mask sets `inputMode` and `spellCheck` for you, and
// the width classes only hint at the expected length. KvirnUI holds no form state: you keep
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

type PostalCountry = 'SE' | 'FI' | 'NO'

/**
 * The postcode mask follows the story's language: Swedish `123 45`, Finnish `00100`, Norwegian
 * `0150`. English and Northern Sami show the Swedish one. `typed` is what a resident types,
 * `shown` what the mask makes of it.
 */
const postalCountries: Record<FormLocale, PostalCountry> = {
  sv: 'SE',
  fi: 'FI',
  nb: 'NO',
  nn: 'NO',
  se: 'SE',
  en: 'SE',
}
const postcodeExamples: Record<PostalCountry, { typed: string; shown: string }> = {
  SE: { typed: '12345', shown: '123 45' },
  FI: { typed: '00100', shown: '00100' },
  NO: { typed: '0150', shown: '0150' },
}

/** A whole number: `masks.number()` takes digits only and brings up the numeric keypad. */
function WholeNumberField({ locale, invalid = false }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required invalid={invalid} lang={lang}>
      <Field.Label>{text.children}</Field.Label>
      <Input
        name="children"
        mask={masks.number()}
        autoComplete="off"
        defaultValue={invalid ? '25' : undefined}
        className="kv-input--width-2 kv-input--numeric"
      />
      <Field.Hint>{text.childrenHint}</Field.Hint>
      <Field.ErrorMessage>{text.childrenRangeError}</Field.ErrorMessage>
    </Field.Root>
  )
}

/**
 * An amount: `masks.number({ decimals: 2, grouping: true })` follows the page's language, so
 * the decimal mark and the grouping are the ones the hint shows.
 */
function AmountField({ locale }: NumberFieldProps) {
  const { text, lang, rentExample } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.rent}</Field.Label>
      <Input
        name="rent"
        mask={masks.number({ decimals: 2, grouping: true })}
        autoComplete="off"
        className="kv-input--width-10 kv-input--numeric"
      />
      <Field.Hint>{text.rentHint(rentExample)}</Field.Hint>
    </Field.Root>
  )
}

/** A reference number: `masks.digits()` keeps the leading zeros, which `type="number"` would drop. */
function ReferenceNumberField({ locale }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.caseNumber}</Field.Label>
      <Input
        name="case-number"
        mask={masks.digits()}
        autoComplete="off"
        defaultValue="004512"
        className="kv-input--width-6 kv-input--numeric"
      />
      <Field.Hint>{text.caseNumberHint}</Field.Hint>
    </Field.Root>
  )
}

/** A postcode: text, so Finnish `00100` keeps its zeros, with `autocomplete="postal-code"`. */
function PostcodeField({ locale }: NumberFieldProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.postcode}</Field.Label>
      <Input
        name="postcode"
        mask={masks.postalCode({ country: postalCountries[locale] })}
        autoComplete="postal-code"
        className="kv-input--width-6 kv-input--numeric"
      />
      <Field.Hint>{text.postcodeHint}</Field.Hint>
    </Field.Root>
  )
}

/**
 * Number of children: `masks.number()` takes digits only (a letter is left out and announced),
 * with `kv-input--width-2`.
 */
export const WholeNumber: Story = {
  render: (_args, { globals }) => <WholeNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    // A text input with a numeric keypad: not a spinbutton.
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('spellcheck', 'false')
    // The mask leaves out what it can't take: the letters never reach the value.
    await userEvent.type(input, 'a2b')
    await expect(input).toHaveValue('2')
  },
}

/**
 * Rent per month: a number mask with two decimals and grouping. The hint shows the amount the
 * way the page's language writes it, and says to leave out the currency sign.
 */
export const Amount: Story = {
  render: (_args, { globals }) => <AmountField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, rentExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rent })
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    // Typed the way people write amounts: the space is refused (and announced), the comma
    // is the decimal mark, and the mask writes the grouping and the page's decimal mark.
    await userEvent.type(input, '1 250,50')
    await expect(input).toHaveValue(rentExample)
    // A currency sign is a letter to the mask: it is left out.
    await userEvent.type(input, ' kr')
    await expect(input).toHaveValue(rentExample)
  },
}

/**
 * The fixture the keyboard tests drive: an amount as text. Try the keys in the Keyboard
 * section above: ArrowUp and ArrowDown never step the number, and the other keys are
 * the browser's own, as in any text field.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <AmountField locale={localeOf(globals)} />,
}

/**
 * An amount with its unit shown in the box: an `InputGroup` with a "kr" Addon. The
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
          <InputGroup.Input
            name="rent"
            mask={masks.number({ grouping: true })}
            autoComplete="off"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.Hint>{text.rentUnitExample(amountExample)}</Field.Hint>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text, amountExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    // The unit isn't in the name or the description: the label already says it.
    await expect(input).toHaveAccessibleDescription(text.rentUnitExample(amountExample))
    await userEvent.type(input, '8450')
    await expect(input).toHaveValue(amountExample)
  },
}

/** A case number: `masks.digits()` keeps the leading zeros, because the value is text. */
export const ReferenceNumber: Story = {
  render: (_args, { globals }) => <ReferenceNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.caseNumber })
    await expect(input).toHaveValue('004512')
    await userEvent.clear(input)
    // A letter is left out, and the zeros stay.
    await userEvent.type(input, '00x4513')
    await expect(input).toHaveValue('004513')
  },
}

/**
 * `masks.postalCode({ country })` follows the page's language. A Finnish postcode starts with
 * zeros and a Swedish one has a space, which the mask writes: both are text.
 */
export const Postcode: Story = {
  render: (_args, { globals }) => <PostcodeField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const { typed, shown } = postcodeExamples[postalCountries[locale]]
    const input = canvas.getByRole('textbox', { name: text.postcode })
    await expect(input).toHaveAttribute('autocomplete', 'postal-code')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await userEvent.type(input, typed)
    await expect(input).toHaveValue(shown)
  },
}

/**
 * Invalid: 25 is a number the mask lets through, because it can't know the limit. The message
 * says what's wrong and how to fix it, in the field's own words, and the answer stays as typed.
 * Your form logic checks the range and decides: nothing here validates.
 */
export const Invalid: Story = {
  render: (_args, { globals }) => <WholeNumberField locale={localeOf(globals)} invalid />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveValue('25')
    // The hint stays, and the error joins it in the description.
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(text.childrenHint))
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining(text.childrenRangeError),
    )
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
