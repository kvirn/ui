// kv-lang-ok-file: the Sweden, Finland and Norway stories show per-country locale text drafts
import { AddressInput, ErrorSummary, Field, Fieldset } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/address-input/address-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/address-input/address-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import { AddressLookup, AddressStates, KeyboardAddress } from './address-input.fixture.tsx'

// Components/Forms/AddressInput: an address of one text box per line, each in the consumer's own
// Field inside a plain fieldset (docs/design/phone-and-address-inputs.md §6.2). The boxes hold no
// text and no form state: the labels, help texts and errors below are written here as a service
// would. Autofill tokens, the postal code's mask and width follow `country`, and nothing moves focus
// when a box is full. The lookup stories (AddressInput.Line1 with a geocoder and .Country, docs/design/address-input-autocomplete.md)
// use a fake geocoder in memory, so tests send nothing. LiveLookup is the one that calls Kvirn's map service.

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
        'The address’s country (ISO alpha-2). `SE`, `FI` and `NO` give the postal code its mask, a numeric keypad and a 6, 6 or 4 character box; any other country has no mask, a box that takes what is typed (phone keyboards are asked for capital letters) and a 10 character box. Default: the provider’s `country`, then the locale’s. Changing it never rewrites a typed value.',
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
 * An address abroad, `country="DE"`: no mask: the box takes what is typed, asks phone keyboards for capital letters and is ten characters wide,
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
            <Field.HelpText>For example 123 45</Field.HelpText>
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
            <Field.HelpText>For example 123 45</Field.HelpText>
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

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas']

const lookupInput = (canvas: Canvas) => canvas.getByRole('combobox', { name: /^Street address/ })

// The Country select's own options are `option`s too: wait for the suggestions in the listbox.
async function findSuggestions(canvas: Canvas) {
  await waitFor(() =>
    expect(canvas.getByRole('listbox').querySelectorAll('[role="option"]').length).toBeGreaterThan(
      0,
    ),
  )
}

async function searchFor(canvas: Canvas, text: string) {
  await userEvent.click(lookupInput(canvas))
  await userEvent.keyboard(`${text}{Enter}`)
}

async function pick(canvas: Canvas, text: string, position = 1) {
  await searchFor(canvas, text)
  await findSuggestions(canvas)
  await userEvent.keyboard('{ArrowDown}'.repeat(position) + '{Enter}')
}

const lookupStory = (name: string) => showSource('address-input/address-input.fixture.tsx', name)

/**
 * The street autocomplete on real addresses: with a country list and a geocoder, `AddressInput.Line1`
 * suggests addresses as you type and a pick fills the postal code and the city. It calls Kvirn's
 * map service (geo.kvirn.com), which receives what you type, so it is not run in tests. Do not type
 * a real address.
 */
export const LiveLookup: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup live withCountry suggest />,
  tags: ['!test'],
}

/**
 * With a `geocoder` on the Root, `AddressInput.Line1` is the lookup: type a street, press Enter
 * (or let it suggest as you type), and pick. A pick puts the street in Line 1, fills the postal code
 * and the city, never line 2, and keeps focus in Line 1 with the caret at the end. Line 1 stays
 * free text with its label, name and autofill token.
 * Try `Storgatan`, `Postgatan`, `Gatugatan`, `Platsgatan`, `nowhere`, `error` and `slow`.
 */
export const Lookup: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    const input = lookupInput(canvas)
    await expect(input).toHaveAttribute('autocomplete', 'address-line1')
    await expect(input).toHaveAttribute('name', 'line1')
  },
}

/** On request, Enter or Search with fewer than 3 characters says what is missing and sends nothing. */
export const LookupTooShort: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'St')
    await canvas.findByText('Type at least 3 characters to search.')
  },
}

/** The answer is on its way: a spinner and "Searching for addresses". */
export const LookupSearching: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'slow')
    await canvas.findByText('Searching for addresses')
  },
}

/** An answer with addresses: the list opens, nothing is active, and the count is announced once. */
export const LookupResults: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Postgatan')
    await findSuggestions(canvas)
  },
}

/** No address found is not an error: it says what to check and points to the boxes. */
export const LookupNoResults: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'nowhere')
    await canvas.findByText(/No address found for/)
  },
}

/** The service fails or does not answer: the text stays and the line points to the boxes. */
export const LookupFailed: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'error')
    await canvas.findByText('The address search isn’t working right now. Keep typing your address.')
  },
}

/** Offline: nothing is sent, and the line points to the boxes. */
// The fake goes in play, not beforeEach: the Docs page mounts every story at once and never runs a
// beforeEach cleanup, so a page-wide `navigator.onLine = false` would put every story offline.
export const LookupOffline: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine')
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    try {
      await searchFor(canvas, 'Storgatan')
      await canvas.findByText('You’re offline. Keep typing your address.')
    } finally {
      Reflect.deleteProperty(navigator, 'onLine')
      if (descriptor) {
        Object.defineProperty(Navigator.prototype, 'onLine', descriptor)
      }
    }
  },
}

/** A place with no postal address fills nothing; the line says so, the typed text comes back and the list stays open. */
export const LookupNoPostalAddress: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Platsgatan')
    await canvas.findByText(/This place has no postal address/)
    await expect(canvas.getByRole('combobox', { name: /^Street address/ })).toHaveValue(
      'Platsgatan',
    )
  },
}

/** A pick fills the street, the postal code and the city, and a note under the lookup says to check them. Focus stays in the lookup. */
export const LookupFilled: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Storgatan')
    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: /^Street address/ })).toHaveValue('Storgatan 1'),
    )
    await expect(canvas.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('211 22')
    await expect(canvas.getByRole('textbox', { name: /^Town or city/ })).toHaveValue('Malmö')
    await canvas.findByText('Filled in from the address search. Check the address.')
    await expect(lookupInput(canvas)).toHaveFocus()
  },
}

/** The result has no postal code: the note and the announcement ask for it, and the box is left empty. */
export const LookupFilledMissingPostalCode: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Postgatan')
    await canvas.findByText(/Add the postal code: the search didn’t have it\./)
    await expect(canvas.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('')
  },
}

/** The result is a street without a number: the street is filled and the note asks for the number. */
export const LookupFilledStreetOnly: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Gatugatan')
    await canvas.findByText(/Type your house number after the street name\./)
  },
}

/** After picking a street, the house number typed after it is looked up and the postal code and the city are filled; Line 1 stays as typed. */
export const LookupHouseNumber: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Gatugatan')
    const street = lookupInput(canvas)
    await waitFor(() => expect(street).toHaveValue('Gatugatan'))
    await userEvent.type(street, ' 12')
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('211 24'),
    )
    await expect(street).toHaveValue('Gatugatan 12')
    await expect(street).toHaveFocus()
  },
}

/** After a pick the boxes are edited: nothing is re-searched or announced, and the note stays. */
export const LookupEditedAfterFill: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Storgatan')
    const street = canvas.getByRole('combobox', { name: /^Street address/ })
    await waitFor(() => expect(street).toHaveValue('Storgatan 1'))
    await userEvent.type(street, '2')
    await expect(street).toHaveValue('Storgatan 12')
    await canvas.findByText('Filled in from the address search. Check the address.')
  },
}

/** The browser filled the boxes: the lookup is not used, nothing is sent and nothing is announced. */
export const LookupAutofilled: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup autofilled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: /^Street address/ })).toHaveValue(
      'Storgatan 12',
    )
    await expect(canvas.queryByText(/^Filled in from/)).toBeNull()
  },
}

/**
 * `AddressInput.Country`, first in the Root: the country the lookup searches in and the postal
 * code's format. Without it the lookup offers only the Root's country. With it every country is
 * listed, the selected one first.
 */
export const WithCountry: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    const country = canvas.getByRole('combobox', { name: /^Country/ })
    await expect(country).toHaveValue('SE')
    await expect(country).toHaveAttribute('autocomplete', 'country')
    await canvas.findByText(/Suggests addresses in Sweden\./)
  },
}

/** The visitor changes the country: the postal code is 6 wide for Finland and the help says Finland. */
export const CountryChangedByUser: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /^Country/ }), 'Finland')
    await canvas.findByText(/Suggests addresses in Finland\./)
    const postalCode = canvas.getByRole('textbox', { name: /^Postal code/ })
    await userEvent.type(postalCode, '001009')
    await expect(postalCode).toHaveValue('00100')
  },
}

/** A pick in another country, with the Country part: the select is set first, the mask follows, and the note says the country is now Finland. */
export const FilledOtherCountry: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Storgatan', 3)
    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: /^Country/ })).toHaveValue('FI'),
    )
    await canvas.findByText(/The country is now Finland\./)
    await expect(canvas.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('00100')
  },
}

/** Without the Country part an address in another country is not listed: the form can't record it. */
export const ForeignResultNotListed: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await waitFor(() =>
      expect(canvas.getByRole('listbox').querySelectorAll('[role="option"]')).toHaveLength(2),
    )
  },
}

/** The whole address disabled: the lookup and its Search button are skipped by Tab. */
export const LookupDisabled: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup disabled />,
  play: async ({ canvas }) => {
    await expect(lookupInput(canvas)).toBeDisabled()
  },
}

/** Compact density: 32px controls from 64rem; Search and Clear stay at least 24px. */
export const LookupCompact: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup compact withCountry />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Storgatan')
    await canvas.findByText('Filled in from the address search. Check the address.')
    await expectMinimumTargetSize(canvas.getByRole('button', { name: 'Search' }))
    await expectMinimumTargetSize(canvas.getByRole('button', { name: 'Clear' }))
  },
}

/** Right to left: Clear then Search sit at the inline end, the postal code stays left to right, and the check is not mirrored. */
export const LookupRTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    await pick(canvas, 'Storgatan')
    await canvas.findByText('Filled in from the address search. Check the address.')
  },
}

/** In forced colours the status line, the note and the active suggestion stay visible: icons are `currentColor`, Search is `ButtonText` on `ButtonFace`. */
export const LookupForcedColors: Story = {
  globals: { forcedColors: 'active', locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Storgatan')
    await findSuggestions(canvas)
    await userEvent.keyboard('{ArrowDown}')
  },
}

/** The fixture the lookup's keyboard tests drive: every key is in the contract's Keyboard table. */
export const LookupKeyboard: Story = {
  globals: { locale: 'en' },
  parameters: lookupStory('AddressLookup'),
  render: () => <AddressLookup withCountry />,
  play: async ({ canvas }) => {
    await searchFor(canvas, 'Postgatan')
    await findSuggestions(canvas)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(lookupInput(canvas)).toHaveFocus()
    await expect(canvas.getByTestId('submits')).toHaveTextContent('Sent: 0')
  },
}
