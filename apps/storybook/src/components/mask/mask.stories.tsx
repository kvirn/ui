import { masks, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/text-input/text-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/mask/mask.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { codeTextsFor } from '../one-time-code/one-time-code.fixture.tsx'
import {
  ContactFamilyFields,
  DateFamilyField,
  IbanFamilyField,
  familyTextsFor,
  OrganisationNumberFamilyFields,
  PatternFamilyFields,
  PersonalIdentityNumberFamilyFields,
  PostalCodeFamilyFields,
} from './mask-families.fixture.tsx'
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

interface DateStoryArgs {
  dateLocale: 'page' | 'sv' | 'fi' | 'nb' | 'en'
  minimum: string
  maximum: string
}

const fill = async (input: HTMLElement, value: string) => {
  await userEvent.clear(input)
  await userEvent.type(input, value)
}

const withoutSeparators = (value: string) => value.replaceAll(/\D/g, '')

/**
 * A date in one field, in the order and with the separator of the page's language (`2026-10-04`
 * in Swedish, `04.10.2026` in Norwegian). Type the digits only: the separators are written as
 * you go and a pasted ISO date is reordered. The stored value is the ISO date once the date is
 * complete. The mask checks the shape: `checks.date` finds `31.02` and a date outside
 * `minimum` and `maximum` on submit. Change the controls to pin another language's order or to
 * move the range.
 */
export const Date: StoryObj<DateStoryArgs> = {
  args: { dateLocale: 'page', minimum: '1900-01-01', maximum: '2026-12-31' },
  argTypes: {
    dateLocale: {
      control: 'select',
      options: ['page', 'sv', 'fi', 'nb', 'en'],
      description:
        '`page` follows the provider (`mask="date"`). Another value pins `masks.date({ locale })`.',
    },
    minimum: {
      control: 'text',
      description: 'The earliest date for `checks.date`, ISO `YYYY-MM-DD`. Empty for none.',
    },
    maximum: {
      control: 'text',
      description: 'The latest date for `checks.date`, ISO `YYYY-MM-DD`. Empty for none.',
    },
  },
  parameters: showSource('mask/mask-families.fixture.tsx', 'DateFamilyField'),
  render: (args, { globals }) => <DateFamilyField locale={localeOf(globals)} {...args} />,
  play: async ({ canvas, globals, args }) => {
    const { text, locale } = maskTextsFor(globals)
    const family = familyTextsFor(locale)
    const mask = masks.date(args.dateLocale === 'page' ? {} : { locale: args.dateLocale })
    const pageMask = args.dateLocale === 'page' ? mask.withLocale(locale) : mask
    const input = canvas.getByRole('textbox', { name: exactly(family.date) })
    const details = canvas.getByTestId('date-details')
    const send = canvas.getByRole('button', { name: text.send })

    const complete = pageMask.format('2026-10-04')
    await userEvent.type(input, withoutSeparators(complete))
    await expect(input).toHaveValue(complete)
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(details).toHaveTextContent(
      `${text.unmasked}: 2026-10-04 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.click(send)
    await expect(input).not.toHaveAttribute('aria-invalid')

    // A shape that is not a day: the mask accepts it, the check says why.
    await fill(input, withoutSeparators(pageMask.format('2026-02-31')))
    await userEvent.click(send)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(text.checkDate))

    // After the maximum.
    await fill(input, withoutSeparators(pageMask.format('2027-01-01')))
    await userEvent.click(send)
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(family.dateRange))

    // Still being typed: the unmasked value is empty and the shape is incomplete.
    await fill(input, withoutSeparators(complete).slice(0, 5))
    await expect(details).toHaveTextContent(`${text.complete}: ${text.no}`)
    await userEvent.click(send)
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining(text.checkFormatGeneric),
    )
  },
}

/**
 * Personal identity numbers: Swedish (`19900101-2385`), Finnish (`131052-308T`) and Norwegian
 * (eleven digits). Type the raw characters; the form's check runs on submit and says `format`,
 * `date` or `checkDigit`. The number stays as typed so the user can fix it.
 */
export const PersonalIdentityNumbers: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'PersonalIdentityNumberFamilyFields'),
  render: (_args, { globals }) => <PersonalIdentityNumberFamilyFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const send = canvas.getByRole('button', { name: text.send })
    const swedish = canvas.getByRole('textbox', { name: exactly(text.personalIdentityNumber) })
    const finnish = canvas.getByRole('textbox', { name: exactly(text.personalIdentityNumberFi) })
    const norwegian = canvas.getByRole('textbox', { name: exactly(text.personalIdentityNumberNo) })

    await userEvent.type(swedish, '199001012385')
    await expect(swedish).toHaveValue('19900101-2385')
    await expect(canvas.getByTestId('swedish-details')).toHaveTextContent(
      `${text.unmasked}: 199001012385 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.type(finnish, '131052-308t')
    await expect(finnish).toHaveValue('131052-308T')
    await userEvent.type(norwegian, '01019049961')
    await expect(canvas.getByTestId('norwegian-details')).toHaveTextContent(
      `${text.unmasked}: 01019049961 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.click(send)
    await expect(swedish).not.toHaveAttribute('aria-invalid')
    await expect(finnish).not.toHaveAttribute('aria-invalid')
    await expect(norwegian).not.toHaveAttribute('aria-invalid')

    await fill(swedish, '199001012386')
    await fill(finnish, '131352-308t')
    await fill(norwegian, '01019049962')
    await userEvent.click(send)
    await expect(swedish).toHaveAccessibleDescription(expect.stringContaining(text.checkControl))
    await expect(finnish).toHaveAccessibleDescription(expect.stringContaining(text.checkDate))
    await expect(norwegian).toHaveAccessibleDescription(expect.stringContaining(text.checkControl))
    await expect(swedish).toHaveValue('19900101-2386')

    // Ten digits is a complete number too; eight is not.
    await fill(swedish, '19900101')
    await expect(canvas.getByTestId('swedish-details')).toHaveTextContent(
      `${text.complete}: ${text.no}`,
    )
  },
}

/**
 * Organisation numbers: Swedish (`556000-0001`), Finnish (`0112038-9`) and Norwegian
 * (`974 760 673`). Each displays its country's grouping; the stored value has no separators.
 */
export const OrganisationNumbers: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'OrganisationNumberFamilyFields'),
  render: (_args, { globals }) => <OrganisationNumberFamilyFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const send = canvas.getByRole('button', { name: text.send })
    const swedish = canvas.getByRole('textbox', { name: exactly(text.organisationNumber) })
    const finnish = canvas.getByRole('textbox', { name: exactly(text.organisationNumberFi) })
    const norwegian = canvas.getByRole('textbox', { name: exactly(text.organisationNumberNo) })

    await userEvent.type(swedish, '5560000001')
    await expect(swedish).toHaveValue('556000-0001')
    await expect(canvas.getByTestId('swedish-details')).toHaveTextContent(
      `${text.unmasked}: 5560000001 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.type(finnish, '01120389')
    await expect(finnish).toHaveValue('0112038-9')
    await userEvent.type(norwegian, '974760673')
    await expect(norwegian).toHaveValue('974 760 673')
    await userEvent.click(send)
    await expect(swedish).not.toHaveAttribute('aria-invalid')
    await expect(finnish).not.toHaveAttribute('aria-invalid')
    await expect(norwegian).not.toHaveAttribute('aria-invalid')

    await fill(swedish, '5560000002')
    await fill(finnish, '12345678')
    await fill(norwegian, '97476067')
    await userEvent.click(send)
    await expect(swedish).toHaveAccessibleDescription(expect.stringContaining(text.checkControl))
    await expect(finnish).toHaveAccessibleDescription(expect.stringContaining(text.checkControl))
    await expect(norwegian).toHaveAccessibleDescription(
      expect.stringContaining(text.checkFormatGeneric),
    )
    await expect(norwegian).toHaveValue('974 760 67')
  },
}

/**
 * An IBAN, written in groups of four as you type in any case and with or without spaces. The
 * stored value is the compact upper-case IBAN. The check finds an unknown country, a wrong length
 * and a wrong check digit.
 */
export const BankAccount: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'IbanFamilyField'),
  render: (_args, { globals }) => <IbanFamilyField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const send = canvas.getByRole('button', { name: text.send })
    const iban = canvas.getByRole('textbox', { name: exactly(text.iban) })

    await userEvent.type(iban, 'se4550000000058398257466')
    await expect(iban).toHaveValue('SE45 5000 0000 0583 9825 7466')
    await expect(canvas.getByTestId('iban-details')).toHaveTextContent(
      `${text.unmasked}: SE4550000000058398257466 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.click(send)
    await expect(iban).not.toHaveAttribute('aria-invalid')

    await fill(iban, 'se4650000000058398257466')
    await userEvent.click(send)
    await expect(iban).toHaveAccessibleDescription(expect.stringContaining(text.checkControl))

    await fill(iban, 'zz89370400440532013000')
    await userEvent.click(send)
    await expect(iban).toHaveAccessibleDescription(expect.stringContaining(text.checkCountry))

    await fill(iban, 'se45 5000')
    await expect(canvas.getByTestId('iban-details')).toHaveTextContent(
      `${text.complete}: ${text.no}`,
    )
    await userEvent.click(send)
    await expect(iban).toHaveAccessibleDescription(expect.stringContaining(text.checkFormatGeneric))
  },
}

/**
 * Postal codes in Sweden (`123 45`), Finland (`00100`) and Norway (`0150`). A postcode has no
 * check digit: the mask reports whether the shape is complete, and your form decides.
 */
export const PostalCodes: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'PostalCodeFamilyFields'),
  render: (_args, { globals }) => <PostalCodeFamilyFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const swedish = canvas.getByRole('textbox', { name: exactly(text.postalCode) })
    const finnish = canvas.getByRole('textbox', { name: exactly(text.postalCodeFi) })
    const norwegian = canvas.getByRole('textbox', { name: exactly(text.postalCodeNo) })

    await userEvent.type(swedish, '12345')
    await expect(swedish).toHaveValue('123 45')
    await expect(canvas.getByTestId('swedish-details')).toHaveTextContent(
      `${text.unmasked}: 12345 · ${text.complete}: ${text.yes}`,
    )
    await userEvent.type(finnish, '00100')
    await expect(finnish).toHaveValue('00100')
    await userEvent.type(norwegian, '0150')
    await expect(norwegian).toHaveValue('0150')
    await expect(canvas.getByTestId('norwegian-details')).toHaveTextContent(
      `${text.unmasked}: 0150 · ${text.complete}: ${text.yes}`,
    )

    await fill(swedish, '1234')
    await expect(canvas.getByTestId('swedish-details')).toHaveTextContent(
      `${text.unmasked}: 1234 · ${text.complete}: ${text.no}`,
    )
  },
}

/**
 * A telephone number and an email address. They are filters: a character that can't be valid is
 * dropped and the value has no shape, so the stored value is what is displayed. Your form checks
 * the address.
 */
export const TelephoneAndEmail: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'ContactFamilyFields'),
  render: (_args, { globals }) => <ContactFamilyFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const telephone = canvas.getByRole('textbox', { name: exactly(text.telephone) })
    await userEvent.type(telephone, '+46 70-12x3')
    await expect(telephone).toHaveValue('+46 70-123')
    await expect(canvas.getByTestId('telephone-details')).toHaveTextContent(
      `${text.unmasked}: +46 70-123`,
    )

    const email = canvas.getByRole('textbox', { name: exactly(text.email) })
    await userEvent.type(email, 'anna @example.se')
    await expect(email).toHaveValue('anna@example.se')
    await expect(canvas.getByTestId('email-details')).toHaveTextContent(
      `${text.unmasked}: anna@example.se`,
    )
  },
}

/**
 * Card numbers and times have no preset: each is a `pattern`, so the literal is written as you
 * type and the stored value is the digits alone.
 */
export const CardAndTime: Story = {
  parameters: showSource('mask/mask-families.fixture.tsx', 'PatternFamilyFields'),
  render: (_args, { globals }) => <PatternFamilyFields locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, locale } = maskTextsFor(globals)
    const family = familyTextsFor(locale)
    const card = canvas.getByRole('textbox', { name: exactly(family.card) })
    await userEvent.type(card, '4111111111111111')
    await expect(card).toHaveValue('4111 1111 1111 1111')
    await expect(canvas.getByTestId('card-details')).toHaveTextContent(
      `${text.unmasked}: 4111111111111111 · ${text.complete}: ${text.yes}`,
    )

    const time = canvas.getByRole('textbox', { name: exactly(family.time) })
    await userEvent.type(time, '0830')
    await expect(time).toHaveValue('08:30')
    await expect(canvas.getByTestId('time-details')).toHaveTextContent(
      `${text.unmasked}: 0830 · ${text.complete}: ${text.yes}`,
    )
    await fill(time, '083')
    await expect(canvas.getByTestId('time-details')).toHaveTextContent(
      `${text.complete}: ${text.no}`,
    )
  },
}

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

    // A minus sign and one decimal: the temperature field allows negatives.
    const temperature = canvas.getByRole('textbox', { name: exactly(text.temperature) })
    await userEvent.type(temperature, '-4.5')
    await expect(temperature).toHaveValue(locale === 'en' ? '-4.5' : '-4,5')
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
