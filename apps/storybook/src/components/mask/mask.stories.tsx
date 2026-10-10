import { masks, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/text-input/text-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/mask/mask.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { codeTextsFor } from '../one-time-code/one-time-code.fixture.tsx'
import {
  characterNotAllowedMessage,
  CustomMaskFields,
  FilterFields,
  GroupedNumberFields,
  IdentifierChecksForm,
  IdentifierFields,
  KeyboardForm,
  maskTextsFor,
  maximumLengthMessage,
  NordicCountryFields,
  NumberFields,
  OwnInputField,
  PatternOptionFields,
  PersonalIdentityNumberForm,
  PlainCodeField,
  RefusalFields,
  StoredValueField,
  withMaskLocale,
} from './mask.fixture.tsx'

// Components/Form/Mask: a TextInput with a `mask` (Plan 0014). The input stays a native
// <input>: paste, autofill and undo keep working, nothing is clamped or corrected, and a
// refused character is announced politely (4.1.3) through the KvirnProvider's live region. The
// mask shapes what is typed. It doesn't explain the format, so every field has a help text that does
// (3.3.2). KvirnUI holds no form state: the checks are helpers your form
// calls.

const meta = {
  title: 'Components/Forms/Mask',
  component: TextInput,
  globals: { locale: 'sv' },
  argTypes: {
    mask: {
      control: false,
      description:
        'A name (`"postal-code"`), `{ preset, country? }`, `{ pattern, ...options }`, a `RegExp`, or a mask from `masks`. See the examples.',
    },
    announceRejections: {
      control: 'boolean',
      description: 'Announce when the mask drops characters. Default true; needs KvirnProvider.',
    },
    messages: { control: false },
    onValueChange: { action: 'onValueChange' },
  },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withMaskLocale,
  ],
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

/** A label as the whole accessible name, escaped: several labels here start with the same words. */
const exactly = (label: string) =>
  new RegExp(`^${label.replaceAll(/[.*+?^$()[\]{}|\\]/g, String.raw`\$&`)}$`)

/**
 * The identifier presets: personal identity numbers (SE, FI, NO), an organisation number, a
 * postcode and an IBAN. Literals appear as you type past them, and a pasted value in any
 * separator style ends the same.
 */
export const Identifiers: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'IdentifierFields'),
  render: (_args, { globals }) => <IdentifierFields locale={localeOf(globals)} />,
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
  parameters: showSource('mask/mask.fixture.tsx', 'FilterFields'),
  render: (_args, { globals }) => <FilterFields locale={localeOf(globals)} />,
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
  parameters: showSource('mask/mask.fixture.tsx', 'CustomMaskFields'),
  render: (_args, { globals }) => <CustomMaskFields locale={localeOf(globals)} />,
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
 * never clamped or corrected: this page only shows a help text.
 */
export const Numbers: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'NumberFields'),
  render: (_args, { globals }) => <NumberFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const rent = canvas.getByRole('textbox', { name: new RegExp(`^${text.amount}`) })
    await userEvent.type(rent, '1250.5')
    await expect(rent).toHaveValue(locale === 'en' ? '1250.5' : '1250,5')
    await expect(canvas.getByTestId('range')).toHaveTextContent(text.amountInRange)
    await expect(canvas.getByTestId('unmasked')).toHaveTextContent('1250.5')

    // Two decimals at most: the third is refused, not rounded.
    await userEvent.type(rent, '00')
    await expect(rent).toHaveValue(locale === 'en' ? '1250.50' : '1250,50')
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
  parameters: showSource('mask/mask.fixture.tsx', 'PersonalIdentityNumberForm'),
  render: (_args, { globals }) => <PersonalIdentityNumberForm locale={localeOf(globals)} />,
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
 * A stored value is the plain one. `mask.format()` shows it with its separators, and TextInput
 * renders the controlled `value` exactly as given: it never rewrites it.
 */
export const StoredValue: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'StoredValueField'),
  render: (_args, { globals }) => <StoredValueField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.stored}`) })
    await expect(input).toHaveValue('19900101-2385')
    await expect(canvas.getByTestId('stored-details')).toHaveTextContent('199001012385')
  },
}

/** The hook on your own `<input>`: put your own props after `mask.inputProps`, and they win. */
export const OwnInput: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'OwnInputField'),
  render: (_args, { globals }) => <OwnInputField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.ownInput}`) })
    await userEvent.type(input, 'ab1234')
    await expect(input).toHaveValue('AB-1234')
    await expect(input).toHaveAttribute('data-own')
  },
}

/**
 * A refused character is never silent: each says why in the live region, politely, and at most
 * once every few seconds per field. Digits only, a letter-only field, letters and digits, a field
 * with a custom set of characters ("other"), and a full field ("You've entered all 5 characters").
 * The characters stay out of the field.
 */
export const RefusedCharacter: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'RefusalFields'),
  render: (_args, { globals }) => <RefusalFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const digits = canvas.getByRole('textbox', { name: exactly(text.digits) })
    await userEvent.type(digits, 'a')
    await expect(digits).toHaveValue('')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        locale === 'sv'
          ? 'Här kan du bara skriva siffror.'
          : locale === 'en'
            ? 'Only digits can be entered here.'
            : characterNotAllowedMessage(locale, 'digits'),
      ),
    )

    const postalCode = canvas.getByRole('textbox', { name: exactly(text.postalCode) })
    await userEvent.type(postalCode, '123456')
    await expect(postalCode).toHaveValue('123 45')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(maximumLengthMessage(locale, 5)),
    )

    const letters = canvas.getByRole('textbox', { name: exactly(text.letters) })
    await userEvent.type(letters, '1')
    await expect(letters).toHaveValue('')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        characterNotAllowedMessage(locale, 'letters'),
      ),
    )

    const lettersAndDigits = canvas.getByRole('textbox', {
      name: exactly(text.lettersAndDigits),
    })
    await userEvent.type(lettersAndDigits, '!')
    await expect(lettersAndDigits).toHaveValue('')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        characterNotAllowedMessage(locale, 'lettersAndDigits'),
      ),
    )

    const telephone = canvas.getByRole('textbox', { name: exactly(text.telephone) })
    await userEvent.type(telephone, 'x')
    await expect(telephone).toHaveValue('')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        characterNotAllowedMessage(locale, 'other'),
      ),
    )
  },
}

/**
 * The Finnish and Norwegian postcodes and organisation numbers, each with its country set for this
 * one input: `{ preset: 'postal-code', country: 'FI' }`. Without `country` they follow the
 * provider (here Sweden), as on Identifiers.
 */
export const NordicCountries: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'NordicCountryFields'),
  render: (_args, { globals }) => <NordicCountryFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const postalCodeFi = canvas.getByRole('textbox', { name: exactly(text.postalCodeFi) })
    await userEvent.type(postalCodeFi, '00100')
    await expect(postalCodeFi).toHaveValue('00100')

    const postalCodeNo = canvas.getByRole('textbox', { name: exactly(text.postalCodeNo) })
    await userEvent.type(postalCodeNo, '0150')
    await expect(postalCodeNo).toHaveValue('0150')

    const organisationNumberFi = canvas.getByRole('textbox', {
      name: exactly(text.organisationNumberFi),
    })
    await userEvent.type(organisationNumberFi, '01120389')
    await expect(organisationNumberFi).toHaveValue('0112038-9')

    const organisationNumberNo = canvas.getByRole('textbox', {
      name: exactly(text.organisationNumberNo),
    })
    await userEvent.type(organisationNumberNo, '974760673')
    await expect(organisationNumberNo).toHaveValue('974 760 673')
  },
}

/**
 * The other checks, each with its own reasons: Finnish and Norwegian personal identity numbers,
 * a Norwegian organisation number and an IBAN. Your form calls them on submit and writes the error
 * from the reason (`format`, `date`, `checkDigit` or `country`). The Norwegian number also takes
 * the test registry's synthetic numbers (`allowSyntheticNumbers`), which a production form leaves
 * off. The values stay as typed. These are published test numbers and deliberate mistakes.
 */
export const IdentifierChecks: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'IdentifierChecksForm'),
  render: (_args, { globals }) => <IdentifierChecksForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const finnish = canvas.getByRole('textbox', { name: exactly(text.personalIdentityNumberFi) })
    await userEvent.type(finnish, '131352-308t')
    await expect(finnish).toHaveValue('131352-308T')

    const norwegian = canvas.getByRole('textbox', {
      name: exactly(text.personalIdentityNumberNo),
    })
    // A synthetic number of the test registry: the month is 91 (11 plus 80).
    await userEvent.type(norwegian, '01912450097')

    const organisation = canvas.getByRole('textbox', {
      name: exactly(text.organisationNumberNo),
    })
    await userEvent.type(organisation, '97476067')
    await expect(organisation).toHaveValue('974 760 67')

    const iban = canvas.getByRole('textbox', { name: exactly(text.iban) })
    await userEvent.type(iban, 'zz89370400440532013000')
    await expect(iban).toHaveValue('ZZ89 3704 0044 0532 0130 00')

    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(finnish).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText(text.checkDate)).toBeVisible()
    await expect(norwegian).not.toHaveAttribute('aria-invalid')
    await expect(organisation).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText(text.checkFormatGeneric)).toBeVisible()
    await expect(iban).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText(text.checkCountry)).toBeVisible()
    // The values stay as typed, so the user can fix them instead of starting over.
    await expect(finnish).toHaveValue('131352-308T')
  },
}

/**
 * A number with grouping, written in the page's language, and one that pins its own `locale`.
 * The provider applies the page's locale to a number mask that has none (`mask.withLocale`), and a
 * mask with its own `locale` keeps it. Both hints give the example the way their field writes it.
 */
export const GroupedNumbers: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'GroupedNumberFields'),
  render: (_args, { globals }) => <GroupedNumberFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const pageMask = masks.number({ decimals: 2, grouping: true }).withLocale(locale)
    const finnishMask = masks.number({ decimals: 2, grouping: true, locale: 'fi' })

    const amount = canvas.getByRole('textbox', { name: exactly(text.groupedAmount) })
    await userEvent.type(amount, '1250000')
    await expect(amount).toHaveValue(pageMask.format('1250000'))

    const amountFi = canvas.getByRole('textbox', { name: exactly(text.finnishAmount) })
    await userEvent.type(amountFi, '1250000')
    await expect(amountFi).toHaveValue(finnishMask.format('1250000'))

    await expect(canvas.getByTestId('stored').textContent).toContain(pageMask.format('1250000.5'))
  },
}

/**
 * A one-time code on a plain TextInput: `masks.oneTimeCode({ pattern })` shapes eight capitals and
 * digits in two groups of four, and the dash goes in as you type. It is the GOV.UK "security code"
 * pattern. For the row of boxes, use OneTimeCode.
 */
export const PlainCode: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'PlainCodeField'),
  render: (_args, { globals }) => <PlainCodeField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { label, hint } = codeTextsFor(localeOf(globals), 'email', '&&&&-&&&&')
    const input = canvas.getByRole('textbox', { name: exactly(label) })
    await expect(input).toHaveAccessibleDescription(hint)
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    await userEvent.type(input, 'k7qx2m9p')
    await expect(input).toHaveValue('K7QX-2M9P')
  },
}

/**
 * The options of your own mask. A literal `9` (`\9`) and a `*` made a capital with `transform`; a
 * pattern that is complete at two lengths (`completeLengths`: eight or ten, not nine); and a
 * regular expression whose `unmask` strips the spaces and hyphens for the value you store.
 */
export const PatternOptions: Story = {
  parameters: showSource('mask/mask.fixture.tsx', 'PatternOptionFields'),
  render: (_args, { globals }) => <PatternOptionFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const bookingCode = canvas.getByRole('textbox', { name: exactly(text.bookingCode) })
    await userEvent.type(bookingCode, 'k2407')
    await expect(bookingCode).toHaveValue('9K2-407')

    const customerNumber = canvas.getByRole('textbox', { name: exactly(text.customerNumber) })
    const complete = canvas.getByTestId('customer-complete')
    await userEvent.type(customerNumber, '12345678')
    await expect(complete).toHaveTextContent(`${text.complete}: ${text.yes}`)
    await userEvent.type(customerNumber, '9')
    await expect(complete).toHaveTextContent(`${text.complete}: ${text.no}`)
    await userEvent.type(customerNumber, '0')
    await expect(complete).toHaveTextContent(`${text.complete}: ${text.yes}`)

    const accountNumber = canvas.getByRole('textbox', { name: exactly(text.accountNumber) })
    const details = canvas.getByTestId('account-details')
    await userEvent.type(accountNumber, '8327-9 12')
    await expect(details).toHaveTextContent(
      `${text.unmasked}: 8327912 · ${text.complete}: ${text.no}`,
    )
    await userEvent.type(accountNumber, '3')
    await expect(accountNumber).toHaveValue('8327-9 123')
    await expect(details).toHaveTextContent(
      `${text.unmasked}: 83279123 · ${text.complete}: ${text.yes}`,
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
  parameters: showSource('mask/mask.fixture.tsx', 'KeyboardForm'),
  render: (_args, { globals }) => <KeyboardForm locale={localeOf(globals)} />,
}

/** The same fixture in English: the number mask shows a decimal point, and the messages are English. */
export const English: Story = {
  globals: { locale: 'en' },
  parameters: showSource('mask/mask.fixture.tsx', 'KeyboardForm'),
  render: (_args, { globals }) => <KeyboardForm locale={localeOf(globals)} />,
}

/** Right to left, in English: identifiers stay left to right, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('mask/mask.fixture.tsx', 'IdentifierFields'),
  render: (_args, { globals }) => <IdentifierFields locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: /^Personal identity number$/ })
    await expect(input).toHaveAttribute('dir', 'ltr')
  },
}

/** Edges, the ring and the help text survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('mask/mask.fixture.tsx', 'IdentifierFields'),
  render: (_args, { globals }) => <IdentifierFields locale={localeOf(globals)} />,
}
