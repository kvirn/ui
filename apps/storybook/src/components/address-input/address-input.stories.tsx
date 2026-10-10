import { AddressInput, ErrorSummary, Field, Fieldset } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/address-input/address-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/address-input/address-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import { AddressStates, KeyboardAddress } from './address-input.fixture.tsx'

// Components/Forms/AddressInput: an address of one text box per line, each in the consumer's own
// Field inside a plain fieldset (docs/design/phone-and-address-inputs.md §6.2). The component holds
// no text, no form state and no lookup: the labels, help texts and errors below are written here as
// a service would. Autofill tokens, the postal code's mask and width follow `country`, and nothing
// moves focus when a box is full.

const meta = {
  title: 'Components/Forms/AddressInput',
  component: AddressInput.Root,
  args: { country: 'SE' },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-address-input`. The theme lays the fields out by it, and finds the postal code’s and the city’s field by `kv-address-input-postal-code` and `-city` on the inputs.',
    },
    country: {
      control: 'select',
      options: [undefined, 'SE', 'FI', 'NO', 'DE'],
      description:
        'The address’s country (ISO alpha-2). `SE`, `FI` and `NO` give the postal code its mask, a numeric keypad and a 6, 6 or 4 character box; any other country has no mask, upper-case letters and a 10 character box. Default: the provider’s `country`, then the locale’s. Changing it never rewrites a typed value.',
    },
    autoComplete: {
      control: 'select',
      options: [undefined, 'off', 'section-postal', 'shipping', 'billing'],
      description:
        '`off` turns every part off (someone else’s address). A prefix goes before each token: `section-postal address-line1`. A part’s own `autoComplete` wins.',
    },
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
  render: (args) => (
    <Fieldset.Root>
      <Fieldset.Legend>Din adress</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root required>
          <Field.Label>Gatuadress</Field.Label>
          <AddressInput.Line1 name="line1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Adressrad 2</Field.Label>
          <AddressInput.Line2 name="line2" />
          <Field.HelpText>Till exempel c/o och ett namn</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postnummer</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
          <Field.HelpText>Till exempel 123 45</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postort</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof AddressInput.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sweden, the main example: every option of `AddressInput.Root` is a control. Autofill fills the
 * four boxes at once. Type `12345` in the postal code and it becomes `123 45`; a full code keeps
 * focus in the box.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: /^Din adress/ })
    await expect(group.tagName).toBe('FIELDSET')
    const street = canvas.getByRole('textbox', { name: /^Gatuadress/ })
    const line2 = canvas.getByRole('textbox', { name: /^Adressrad 2/ })
    const postalCode = canvas.getByRole('textbox', { name: /^Postnummer/ })
    const city = canvas.getByRole('textbox', { name: /^Postort/ })
    for (const textbox of [street, line2, postalCode, city]) {
      await expectMinimumTargetSize(textbox)
    }
    await expect(street).toHaveAttribute('autocomplete', 'address-line1')
    await expect(line2).toHaveAttribute('autocomplete', 'address-line2')
    await expect(postalCode).toHaveAttribute('autocomplete', 'postal-code')
    await expect(city).toHaveAttribute('autocomplete', 'address-level2')
    await expect(line2).toHaveAccessibleName('Adressrad 2 (valfritt)')
    await userEvent.type(postalCode, '12345')
    await expect(postalCode).toHaveValue('123 45')
    await expect(postalCode).toHaveFocus()
    await expect(postalCode).toHaveAccessibleDescription('Till exempel 123 45')
  },
}

/** Finland: five digits, no space, in a box of six characters. The strings are designer drafts, for length checks. */
export const Finland: Story = {
  args: { country: 'FI' },
  globals: { locale: 'fi' },
  render: (args) => (
    <Fieldset.Root>
      <Fieldset.Legend>Osoitteesi</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root required>
          <Field.Label>Katuosoite</Field.Label>
          <AddressInput.Line1 name="line1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Osoiterivi 2</Field.Label>
          <AddressInput.Line2 name="line2" />
          <Field.HelpText>Esimerkiksi c/o ja nimi</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postinumero</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
          <Field.HelpText>Esimerkiksi 00100</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postitoimipaikka</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  play: async ({ canvas }) => {
    const postalCode = canvas.getByRole('textbox', { name: /^Postinumero/ })
    await userEvent.type(postalCode, '00100')
    await expect(postalCode).toHaveValue('00100')
    await expect(postalCode).toHaveAttribute('inputmode', 'numeric')
  },
}

/** Norway: four digits, in a box of four characters. The strings are drafts, for length checks. */
export const Norway: Story = {
  args: { country: 'NO' },
  globals: { locale: 'nb' },
  render: (args) => (
    <Fieldset.Root>
      <Fieldset.Legend>Din adresse</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root required>
          <Field.Label>Gateadresse</Field.Label>
          <AddressInput.Line1 name="line1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Adresselinje 2</Field.Label>
          <AddressInput.Line2 name="line2" />
          <Field.HelpText>For eksempel c/o og et navn</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postnummer</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
          <Field.HelpText>For eksempel 0150</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Poststed</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  play: async ({ canvas }) => {
    const postalCode = canvas.getByRole('textbox', { name: /^Postnummer/ })
    await userEvent.type(postalCode, '01501')
    await expect(postalCode).toHaveValue('0150')
  },
}

/**
 * An address abroad, `country="DE"`: no mask, letters allowed and upper case, ten characters wide,
 * so a foreign code is never refused. For a format you don’t know, use a `Textarea` instead.
 */
export const AddressAbroad: Story = {
  args: { country: 'DE' },
  globals: { locale: 'en' },
  render: (args) => (
    <Fieldset.Root>
      <Fieldset.Legend>Your address abroad</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root required>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 name="line1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address line 2</Field.Label>
          <AddressInput.Line2 name="line2" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  play: async ({ canvas }) => {
    const postalCode = canvas.getByRole('textbox', { name: /^Postal code/ })
    await userEvent.type(postalCode, '10115 b')
    await expect(postalCode).toHaveValue('10115 b')
    await expect(postalCode).toHaveAttribute('inputmode', 'text')
    await expect(postalCode).toHaveAttribute('autocapitalize', 'characters')
  },
}

/**
 * One error per wrong part, in its own Field, and one link per part in the summary at the top.
 * Each message says what to do, and the postal code’s repeats the format.
 */
export const ErrorsPerPart: Story = {
  globals: { locale: 'en' },
  render: (args) => (
    <>
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="errors-line1">
              Enter your street address
            </ErrorSummary.Link>
          </ErrorSummary.Item>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="errors-postal-code">
              Enter a postal code with 5 digits, like 123 45
            </ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>
      <Fieldset.Root>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressInput.Root {...args}>
          <Field.Root controlId="errors-line1" required invalid>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="line1" />
            <Field.ErrorMessage>Enter your street address</Field.ErrorMessage>
          </Field.Root>
          <Field.Root>
            <Field.Label>Address line 2</Field.Label>
            <AddressInput.Line2 name="line2" />
            <Field.HelpText>For example c/o and a name</Field.HelpText>
          </Field.Root>
          <Field.Root controlId="errors-postal-code" required invalid>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="postalCode" defaultValue="123 4" />
            <Field.HelpText>For example 123 45</Field.HelpText>
            <Field.ErrorMessage>Enter a postal code with 5 digits, like 123 45</Field.ErrorMessage>
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="city" defaultValue="Kvirnby" />
          </Field.Root>
        </AddressInput.Root>
      </Fieldset.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const street = canvas.getByRole('textbox', { name: /^Street address/ })
    const postalCode = canvas.getByRole('textbox', { name: /^Postal code/ })
    await expect(street).toHaveAttribute('aria-invalid', 'true')
    await expect(postalCode).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByRole('textbox', { name: /^Town or city/ })).not.toHaveAttribute(
      'aria-invalid',
    )
    await expect(canvas.getByRole('link', { name: /^Enter your street address/ })).toHaveAttribute(
      'href',
      '#errors-line1',
    )
  },
}

/**
 * The service’s back end can’t find the address: a `Fieldset.ErrorMessage` for the whole address,
 * after the parts, and no part marked wrong. The summary links to Line 1.
 */
export const AddressNotFound: Story = {
  globals: { locale: 'en' },
  render: (args) => (
    <>
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="not-found-line1">
              We couldn’t find this address. Check the street address and postal code.
            </ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>
      <Fieldset.Root invalid>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressInput.Root {...args}>
          <Field.Root controlId="not-found-line1" required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="line1" defaultValue="Storgatan 99" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Address line 2</Field.Label>
            <AddressInput.Line2 name="line2" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="postalCode" defaultValue="123 45" />
            <Field.HelpText>For example 123 45</Field.HelpText>
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="city" defaultValue="Kvirnby" />
          </Field.Root>
        </AddressInput.Root>
        <Fieldset.ErrorMessage>
          We couldn’t find this address. Check the street address and postal code.
        </Fieldset.ErrorMessage>
      </Fieldset.Root>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: /^Your address/ })).toHaveAccessibleDescription(
      /We couldn’t find this address/,
    )
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expect(textbox).not.toHaveAttribute('aria-invalid')
    }
  },
}

/**
 * An optional postal address, "if different": the legend carries "(optional)" and the Root
 * `autoComplete="section-postal"`, so autofill keeps it apart from the home address.
 */
export const OptionalSection: Story = {
  args: { autoComplete: 'section-postal' },
  globals: { locale: 'en' },
  render: (args) => (
    <Fieldset.Root>
      <Fieldset.Legend marker="optional">Postal address, if different</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 name="postalLine1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address line 2</Field.Label>
          <AddressInput.Line2 name="postalLine2" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode name="postalPostalCode" />
          <Field.HelpText>For example 123 45</Field.HelpText>
        </Field.Root>
        <Field.Root>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City name="postalCity" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: /^Street address/ })).toHaveAttribute(
      'autocomplete',
      'section-postal address-line1',
    )
    await expect(canvas.getByRole('group', { name: /^Postal address, if different/ })).toBeVisible()
  },
}

/**
 * The applicant’s address, which autofill fills, and another guardian’s with `autoComplete="off"`,
 * so the applicant’s own data isn’t put in someone else’s boxes.
 */
export const TwoAddresses: Story = {
  globals: { locale: 'en' },
  render: (args) => (
    <>
      <Fieldset.Root>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressInput.Root {...args}>
          <Field.Root required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="applicantLine1" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="applicantPostalCode" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="applicantCity" />
          </Field.Root>
        </AddressInput.Root>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend>Other guardian’s address</Fieldset.Legend>
        <AddressInput.Root {...args} autoComplete="off">
          <Field.Root required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1 name="guardianLine1" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode name="guardianPostalCode" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Town or city</Field.Label>
            <AddressInput.City name="guardianCity" />
          </Field.Root>
        </AddressInput.Root>
      </Fieldset.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('input[name="applicantLine1"]')).toHaveAttribute(
      'autocomplete',
      'address-line1',
    )
    await expect(canvasElement.querySelector('input[name="guardianLine1"]')).toHaveAttribute(
      'autocomplete',
      'off',
    )
  },
}

/** The whole address disabled: a dashed edge on each box, skipped by Tab. */
export const Disabled: Story = {
  globals: { locale: 'en' },
  render: (args) => (
    <Fieldset.Root disabled>
      <Fieldset.Legend>Your address</Fieldset.Legend>
      <AddressInput.Root {...args}>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 name="line1" defaultValue="Storgatan 12" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode name="postalCode" defaultValue="123 45" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City name="city" defaultValue="Kvirnby" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  ),
  play: async ({ canvas }) => {
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expect(textbox).toBeDisabled()
    }
  },
}

/** Right to left: the postal code and city row mirrors, and the postal code stays left to right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('address-input/address-input.fixture.tsx', 'AddressStates'),
  render: () => <AddressStates />,
}

/** A wrong postal code and a wrong address stay distinguishable in forced colours: the edge and the text. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', locale: 'en' },
  parameters: showSource('address-input/address-input.fixture.tsx', 'AddressStates'),
  render: () => <AddressStates />,
}

/**
 * The fixture the keyboard tests drive: a back button, the address and a submit button, in a form.
 * Try the keys in the Keyboard section above: Tab goes part to part in DOM order, a full postal
 * code keeps focus, and Enter in a box submits the form.
 */
export const Keyboard: Story = {
  globals: { locale: 'en' },
  parameters: showSource('address-input/address-input.fixture.tsx', 'KeyboardAddress'),
  render: () => <KeyboardAddress />,
  play: async ({ canvas }) => {
    const postalCode = canvas.getByRole('textbox', { name: /^Postal code/ })
    await userEvent.type(postalCode, '12345')
    await expect(postalCode).toHaveFocus()
    await userEvent.type(canvas.getByRole('textbox', { name: /^Town or city/ }), 'Kvirnby{Enter}')
    await expect(canvas.getByTestId('submits')).toHaveTextContent('Sent: 1')
  },
}
