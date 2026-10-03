import { Input } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import {
  CustomMaskFields,
  FilterFields,
  IdentifierFields,
  KeyboardForm,
  maskTextsFor,
  NumberFields,
  OwnInputField,
  PersonalIdentityNumberForm,
  StoredValueField,
  withMaskLocale,
} from './mask.fixture.tsx'

// Components/Form/Mask: an Input with a `mask` (Plan 0014). The input stays a native
// <input>: paste, autofill and undo keep working, nothing is clamped or corrected, and a
// refused character is announced politely (4.1.3) through the KvirnProvider's live region. The
// mask shapes what is typed. It doesn't explain the format, so every field has a hint that does
// (3.3.2). KvirnUI holds no form state: the checks are helpers your form
// calls. mask.e2e.ts runs the keys, paste styles, caret, undo, composition and the throttle.

const meta = {
  title: 'Components/Form/Mask',
  component: Input,
  globals: { locale: 'sv' },
  argTypes: {
    mask: { control: false, description: 'A preset from `masks`, or your own pattern or regexp.' },
    announceRejections: {
      control: 'boolean',
      description: 'Announce when the mask drops characters. Default true; needs KvirnProvider.',
    },
    messages: { control: false },
    onValueChange: { action: 'onValueChange' },
  },
  decorators: [withMaskLocale],
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The identifier presets: personal identity numbers (SE, FI, NO), an organisation number, a
 * postcode and an IBAN. Literals appear as you type past them, and a pasted value in any
 * separator style ends the same.
 */
export const Identifiers: Story = {
  render: (_args, { globals }) => <IdentifierFields globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const personalIdentityNumber = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.personalIdentityNumber}`),
    })
    await userEvent.click(personalIdentityNumber)
    await userEvent.paste('19900101 2385')
    await expect(personalIdentityNumber).toHaveValue('19900101-2385')
    await expect(personalIdentityNumber).toHaveAttribute('inputmode', 'numeric')
    await expect(personalIdentityNumber).toHaveAttribute('dir', 'ltr')

    const postalCode = canvas.getByRole('textbox', { name: new RegExp(`^${text.postalCode}`) })
    await userEvent.type(postalCode, '12345')
    await expect(postalCode).toHaveValue('123 45')

    const iban = canvas.getByRole('textbox', { name: new RegExp(`^${text.iban}`) })
    await userEvent.type(iban, 'se4550000000058398257466')
    await expect(iban).toHaveValue('SE45 5000 0000 0583 9825 7466')

    const finnish = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.personalIdentityNumberFi}`),
    })
    await userEvent.type(finnish, '131052-308t')
    await expect(finnish).toHaveValue('131052-308T')
  },
}

/**
 * The filters: digits, letters, letters and digits, email and telephone. They drop what can't
 * be valid and give the value no shape. The email mask only removes spaces: an address has no
 * fixed format, so your form checks it.
 */
export const Filters: Story = {
  render: (_args, { globals }) => <FilterFields globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const digits = canvas.getByRole('textbox', { name: new RegExp(`^${text.digits}`) })
    await userEvent.type(digits, '00-45 12')
    await expect(digits).toHaveValue('004512')

    const email = canvas.getByRole('textbox', { name: new RegExp(`^${text.email}`) })
    await userEvent.type(email, 'anna @example.se')
    await expect(email).toHaveValue('anna@example.se')

    const telephone = canvas.getByRole('textbox', { name: new RegExp(`^${text.telephone}`) })
    await userEvent.type(telephone, '+46 70-12x3')
    await expect(telephone).toHaveValue('+46 70-123')
  },
}

/** Your own pattern (`9` a digit, `a` a letter, the rest literals) and your own regular expression. */
export const PatternAndRegexp: Story = {
  render: (_args, { globals }) => <CustomMaskFields globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const caseNumber = canvas.getByRole('textbox', { name: new RegExp(`^${text.caseNumber}`) })
    await userEvent.type(caseNumber, 'ab1234')
    await expect(caseNumber).toHaveValue('AB-1234')

    const registration = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.registration}`),
    })
    await userEvent.type(registration, 'abc123')
    await expect(registration).toHaveValue('ABC123')
  },
}

/**
 * A number with `min` and `max`. The decimal separator is the page's: a comma in Swedish, a
 * point in English, whichever the user types. `isWithinRange` is reported and the number is
 * never clamped or corrected: this page only shows a hint.
 */
export const Numbers: Story = {
  render: (_args, { globals }) => <NumberFields globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const rent = canvas.getByRole('textbox', { name: new RegExp(`^${text.amount}`) })
    await userEvent.type(rent, '1250.5')
    await expect(rent).toHaveValue(locale === 'sv' ? '1250,5' : '1250.5')
    await expect(canvas.getByTestId('range')).toHaveTextContent(text.amountInRange)
    await expect(canvas.getByTestId('unmasked')).toHaveTextContent('1250.5')

    // Two decimals at most: the third is refused, not rounded.
    await userEvent.type(rent, '00')
    await expect(rent).toHaveValue(locale === 'sv' ? '1250,50' : '1250.50')
    await userEvent.clear(rent)
    await userEvent.type(rent, '200000')
    // Out of range, and still exactly what was typed.
    await expect(rent).toHaveValue('200000')
    await expect(canvas.getByTestId('range')).toHaveTextContent(text.amountOutOfRange)
  },
}

/**
 * A personal identity number with a check on submit. The mask never blocks a number the user
 * is still typing, and never says it is wrong: the form calls `checks.personalIdentityNumber`
 * and writes the message from its reason (`format`, `date` or `checkDigit`).
 */
export const PersonalIdentityNumberCheck: Story = {
  render: (_args, { globals }) => <PersonalIdentityNumberForm globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.personalIdentityNumber}`),
    })
    await userEvent.type(input, '199001012386')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText(text.checkDigit)).toBeVisible()
    // The number stays as typed, so the user can fix the last digit.
    await expect(input).toHaveValue('19900101-2386')

    await userEvent.clear(input)
    await userEvent.type(input, '199001012385')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(input).not.toHaveAttribute('aria-invalid')
    await expect(canvas.getByTestId('sent')).toHaveTextContent('19900101-2385')
  },
}

/**
 * A stored value is the plain one. `mask.format()` shows it with its separators, and Input
 * renders the controlled `value` exactly as given: it never rewrites it.
 */
export const StoredValue: Story = {
  render: (_args, { globals }) => <StoredValueField globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.stored}`) })
    await expect(input).toHaveValue('19900101-2385')
    await expect(canvas.getByTestId('stored-details')).toHaveTextContent('199001012385')
  },
}

/** The hook on your own `<input>`: put your own props after `mask.inputProps`, and they win. */
export const OwnInput: Story = {
  render: (_args, { globals }) => <OwnInputField globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.ownInput}`) })
    await userEvent.type(input, 'ab1234')
    await expect(input).toHaveValue('AB-1234')
    await expect(input).toHaveAttribute('data-own')
  },
}

/**
 * A refused character is never silent: this one says "Bara siffror" in the live region, politely,
 * and at most once every few seconds per field. The characters stay out of the field.
 */
export const RefusedCharacter: Story = {
  render: (_args, { globals }) => <FilterFields globals={globals} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const digits = canvas.getByRole('textbox', { name: new RegExp(`^${text.digits}`) })
    await userEvent.type(digits, 'a')
    await expect(digits).toHaveValue('')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        locale === 'sv' ? 'Här kan du bara skriva siffror.' : 'Only digits can be entered here.',
      ),
    )
  },
}

/**
 * The fixture the keyboard tests drive: masked fields in a plain form. Try the keys in the
 * Keyboard section above: type, paste (Control or Command with V), Backspace and Delete next to
 * a separator, undo (Control or Command with Z), the arrow keys, Home and End, Tab and
 * Shift+Tab, and Enter, which submits the form.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardForm globals={globals} />,
}

/** The same fixture in English: the number mask shows a decimal point, and the messages are English. */
export const English: Story = {
  globals: { locale: 'en' },
  render: (_args, { globals }) => <KeyboardForm globals={globals} />,
}

/** Right to left, in English: identifiers stay left to right, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (_args, { globals }) => <IdentifierFields globals={globals} />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: /^Personal identity number$/ })
    await expect(input).toHaveAttribute('dir', 'ltr')
    await userEvent.type(input, '199001012385')
    await expect(input).toHaveValue('19900101-2385')
  },
}

/** Edges, the ring and the hint text survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <IdentifierFields globals={globals} />,
}
