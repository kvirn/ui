import { Field, KvirnProvider, PhoneInput } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import contract from '../../../../../packages/react/src/phone-input/phone-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/phone-input/phone-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'

// Components/Forms/PhoneInput: a phone number, a native `type="tel"` box that never formats and
// never refuses a correctly typed number (design spec docs/design/phone-and-address-inputs.md
// §6.1). `PhoneInput.Root` with a `PhoneInput.Country` adds a calling-code select that inherits
// the provider's country and can be overridden; the number is never rewritten by it. The text below is the consumer's: the component has none of its own. The numbers are in
// Sweden's PTS fiction range (070-174 06 05 to 99). KvirnUI holds no form state, and nothing here
// validates: an invalid story sets `invalid` itself.

const text = {
  label: 'Phone number',
  optionalLabel: 'Phone number',
  help: 'If your number isn’t Swedish, start with the country code, for example +358.',
  error: 'Enter a phone number using digits, like 070-174 06 05 or +46 70 174 06 05',
  errorEmpty: 'Enter your phone number',
  otherLabel: 'Phone number of the other guardian',
  otherHelp: 'We use it only to reach them about this application.',
  readOnlyHelp: 'You can change your phone number under My pages.',
  maskHelp: 'Digits, spaces and dashes, for example 070-174 06 05.',
  countryLabel: 'Country calling code',
  nationalHelp: 'The number without the country code, for example 070-174 06 05.',
} as const

const withSwedenProvider: Decorator = (Story) => (
  <KvirnProvider country="SE">
    <Story />
  </KvirnProvider>
)

function CountryAndNumber({
  rootProps = {},
  controlId,
  required = true,
  invalid = false,
  disabled = false,
  defaultValue,
  errorMessage,
}: {
  rootProps?: Parameters<typeof PhoneInput.Root>[0]
  controlId: string
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  defaultValue?: string
  errorMessage?: string
}) {
  return (
    <PhoneInput.Root {...rootProps}>
      <Field.Root controlId={`${controlId}-country`} disabled={disabled}>
        <Field.Label>{text.countryLabel}</Field.Label>
        <PhoneInput.Country name="phoneCountry" />
      </Field.Root>
      <Field.Root controlId={controlId} required={required} invalid={invalid} disabled={disabled}>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone" defaultValue={defaultValue} />
        <Field.HelpText>{text.nationalHelp}</Field.HelpText>
        {errorMessage === undefined ? null : (
          <Field.ErrorMessage>{errorMessage}</Field.ErrorMessage>
        )}
      </Field.Root>
    </PhoneInput.Root>
  )
}

const meta = {
  title: 'Components/Forms/PhoneInput',
  component: PhoneInput.Number,
  args: {
    name: 'phone',
    disabled: false,
    readOnly: false,
    announceRejections: true,
    onValueChange: fn(),
  },
  // Every prop in phone-input.tsx and use-phone-input.ts. Any other native `<input>` prop passes through.
  argTypes: {
    mask: {
      control: 'select',
      options: [undefined, false, 'telephone', 'digits'],
      description:
        'Default `false`: no mask, so a correctly typed number is never refused. `"telephone"` leaves out everything but digits, `+`, space, `-`, `(` and `)`, and announces it. A `{ pattern }`, a `RegExp` or a mask from `masks` replaces it. No mask ever formats the number.',
    },
    value: {
      control: 'text',
      description:
        'Controlled: the number as the user wrote it, from your form state. Pair it with `onValueChange`, or the box can’t be edited.',
    },
    defaultValue: {
      control: 'text',
      description:
        'Uncontrolled: the browser keeps the value, and a form submit sends it as written.',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the number as written and `{ reason: "input", event }` on every change (with a mask also `unmaskedValue`, `isComplete` and `rejected`). It only reports: normalise to E.164 on the server.',
    },
    onChange: {
      control: false,
      description: 'The native change handler. It still works next to `onValueChange`.',
    },
    announceRejections: {
      control: 'boolean',
      description:
        'With a mask: announce, politely and at most once every few seconds, when a character is left out. Default `true`. Needs a `KvirnProvider`.',
    },
    messages: {
      control: 'object',
      description: 'Per-instance overrides for the mask’s announcements.',
    },
    name: { control: 'text', description: 'The field’s name in a form submit.' },
    autoComplete: {
      control: 'select',
      options: [undefined, 'tel', 'mobile tel', 'tel-national', 'off'],
      description:
        'Default `tel`: the full number, which is what autofill stores. Yours wins. `off` for someone else’s number.',
    },
    inputMode: {
      control: 'select',
      options: [undefined, 'tel', 'text'],
      description: 'The on-screen keyboard. Default `tel`, and yours wins.',
    },
    spellCheck: { control: 'boolean', description: 'Default `false`, and yours wins.' },
    dir: {
      control: 'select',
      options: [undefined, 'ltr', 'auto'],
      description: 'Default `ltr`, so `+46` stays first in a right-to-left page. Yours wins.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`.',
    },
    readOnly: {
      control: 'boolean',
      description: 'Native `readOnly`: focusable and read by screen readers, but not editable.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-input--width-10', 'kv-input--width-20'],
      description:
        'Your own classes, added to `kv-input kv-input--numeric kv-phone-input`. A `kv-input--width-*` class wins over the 20 characters.',
    },
    id: {
      control: false,
      description:
        'Ignored inside a Field (a dev warning says so): set `controlId` on `Field.Root`. Outside a Field it is the input’s id.',
    },
    'aria-describedby': {
      control: 'text',
      description:
        'Your own description ids. They are kept, after the Field’s help text and error.',
    },
    ref: { control: false, description: 'A ref to the `<input>`.' },
  },
  globals: { locale: 'en' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args) => (
    <Field.Root controlId="phone" required>
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number {...args} />
      <Field.HelpText>{text.help}</Field.HelpText>
    </Field.Root>
  ),
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof PhoneInput.Number>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a phone number in a Field with a help text. The number is kept exactly as
 * typed: spaces, dashes, brackets and a plus sign, with nothing formatted and nothing left out.
 */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(input).toHaveAttribute('type', 'tel')
    await expect(input).toHaveAttribute('inputmode', 'tel')
    await expect(input).toHaveAttribute('autocomplete', 'tel')
    await expect(input).toHaveAttribute('dir', 'ltr')
    await expect(input).toHaveAccessibleDescription(text.help)
    await expectMinimumTargetSize(input)
    await userEvent.type(input, '+46 (0)70-174 06 05')
    await expect(input).toHaveValue('+46 (0)70-174 06 05')
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      '+46 (0)70-174 06 05',
      expect.objectContaining({ reason: 'input' }),
    )
  },
}

/**
 * The calling-code select. The provider's country (Sweden) is the selected option and the first
 * in the list; the country's name is in the page's language, with its calling code. The number
 * is exactly what is typed: nothing is prefixed, and typing `+358` while Sweden is selected
 * changes nothing. The select and the number are two Tab stops.
 */
export const WithCountry: Story = {
  decorators: [withSwedenProvider],
  render: () => <CountryAndNumber controlId="phone-with-country" />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: new RegExp(text.countryLabel) })
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(select).toHaveValue('SE')
    await expect(select).toHaveAttribute('autocomplete', 'tel-country-code')
    await expect(input).toHaveAttribute('autocomplete', 'tel-national')
    await expect(select.querySelector('option')).toHaveTextContent('Sweden (+46)')
    await expectMinimumTargetSize(select)
    await userEvent.type(input, '+358 40 123 4567')
    await expect(input).toHaveValue('+358 40 123 4567')
    await expect(select).toHaveValue('SE')
  },
}

/** The Root's `country` overrides the provider's: Norway is selected, and its code is first. */
export const OverrideToNorway: Story = {
  decorators: [withSwedenProvider],
  render: () => <CountryAndNumber controlId="phone-norway" rootProps={{ country: 'NO' }} />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: new RegExp(text.countryLabel) })
    await expect(select).toHaveValue('NO')
    await expect(select.querySelector('option')).toHaveTextContent('Norway (+47)')
  },
}

/**
 * Uncontrolled with `defaultCountry`: Finland to start with, and the user's choice is kept.
 * Changing the country never rewrites what was typed.
 */
export const DefaultCountry: Story = {
  decorators: [withSwedenProvider],
  render: () => (
    <CountryAndNumber
      controlId="phone-default-country"
      rootProps={{ defaultCountry: 'FI' }}
      defaultValue="040 123 4567"
    />
  ),
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: new RegExp(text.countryLabel) })
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(select).toHaveValue('FI')
    await userEvent.selectOptions(select, 'DK')
    await expect(select).toHaveValue('DK')
    await expect(input).toHaveValue('040 123 4567')
  },
}

function ControlledCountry() {
  const [country, setCountry] = useState('SE')
  return (
    <CountryAndNumber
      controlId="phone-controlled"
      rootProps={{ country, onCountryChange: setCountry }}
    />
  )
}

/** Controlled: `country` and `onCountryChange` from your form state. */
export const Controlled: Story = {
  decorators: [withSwedenProvider],
  render: () => <ControlledCountry />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: new RegExp(text.countryLabel) })
    await userEvent.selectOptions(select, 'DE')
    await expect(select).toHaveValue('DE')
  },
}

/** Without a Country part the Root changes nothing: one box, `autocomplete="tel"`. */
export const WithoutCountry: Story = {
  decorators: [withSwedenProvider],
  render: () => (
    <PhoneInput.Root>
      <Field.Root controlId="phone-without-country" required>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone" />
        <Field.HelpText>{text.help}</Field.HelpText>
      </Field.Root>
    </PhoneInput.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('combobox')).toBeNull()
    await expect(canvas.getByRole('textbox', { name: new RegExp(text.label) })).toHaveAttribute(
      'autocomplete',
      'tel',
    )
  },
}

/** Required, after a failed submit: the error is on the number, the country and the value stay. */
export const CountryRequiredWithError: Story = {
  decorators: [withSwedenProvider],
  render: () => (
    <CountryAndNumber
      controlId="phone-country-error"
      invalid
      defaultValue="070-174"
      errorMessage={text.error}
    />
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveValue('070-174')
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(text.error))
  },
}

/** Disabled: both skipped by Tab. */
export const CountryDisabled: Story = {
  decorators: [withSwedenProvider],
  render: () => <CountryAndNumber controlId="phone-country-disabled" disabled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toBeDisabled()
    await expect(canvas.getByRole('textbox')).toBeDisabled()
  },
}

/** Right to left: the select first at the right, the number stays `ltr`. */
export const CountryRTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  decorators: [withSwedenProvider],
  render: () => <CountryAndNumber controlId="phone-country-rtl" defaultValue="+46 70-174 06 05" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox')).toHaveAttribute('dir', 'ltr')
  },
}

/** Edges survive forced colours on the select and the number, also invalid. */
export const CountryForcedColors: Story = {
  globals: { forcedColors: 'active' },
  decorators: [withSwedenProvider],
  render: () => (
    <CountryAndNumber
      controlId="phone-country-forced"
      invalid
      defaultValue="070-174"
      errorMessage={text.error}
    />
  ),
}

/** Tab goes to the select and then to the number; the select's keys are the browser's own. */
export const CountryKeyboard: Story = {
  decorators: [withSwedenProvider],
  render: () => <CountryAndNumber controlId="phone-country-keyboard" />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: new RegExp(text.countryLabel) })
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await userEvent.tab()
    await expect(select).toHaveFocus()
    await userEvent.tab()
    await expect(input).toHaveFocus()
    await userEvent.type(input, '070 174 06 05')
    await expect(select).toHaveValue('SE')
  },
}

/**
 * The fixture the keyboard tests drive. Every key is the browser's own, as in any text field:
 * Tab leaves the box with the number unchanged, and nothing moves focus by itself.
 */
export const Keyboard: Story = {
  render: () => (
    <Field.Root controlId="phone-keyboard" required>
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number name="phone" />
      <Field.HelpText>{text.help}</Field.HelpText>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await userEvent.type(input, '070 174 06 05')
    await userEvent.tab()
    await expect(input).toHaveValue('070 174 06 05')
  },
}

/** Required, after a failed submit: the error says what to enter and how, and the value stays. */
export const RequiredWithError: Story = {
  render: () => (
    <Field.Root controlId="phone-error" required invalid>
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number name="phone" defaultValue="070-174" />
      <Field.HelpText>{text.help}</Field.HelpText>
      <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-required', 'true')
    await expect(input).toHaveValue('070-174')
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(text.error))
  },
}

/** Numbers from other countries are kept: `+`, any length, and the help text asks for the code. */
export const International: Story = {
  render: () => (
    <Field.Root controlId="phone-international" required>
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number name="phone" />
      <Field.HelpText>{text.help}</Field.HelpText>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await userEvent.type(input, '+358 40 123 4567')
    await expect(input).toHaveValue('+358 40 123 4567')
  },
}

/** Optional: the Field adds "(optional)" to the name, and the box is no different. */
export const Optional: Story = {
  render: () => (
    <Field.Root controlId="phone-optional">
      <Field.Label>{text.optionalLabel}</Field.Label>
      <PhoneInput.Number name="phone" />
      <Field.HelpText>{text.help}</Field.HelpText>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: /\(optional\)/ })
    await expect(input).not.toHaveAttribute('aria-required')
  },
}

/**
 * Someone else's number: `autoComplete="off"`, so the user's own number isn't filled in for
 * another person.
 */
export const SomeoneElsesNumber: Story = {
  render: () => (
    <Field.Root controlId="phone-other" required>
      <Field.Label>{text.otherLabel}</Field.Label>
      <PhoneInput.Number name="otherPhone" autoComplete="off" />
      <Field.HelpText>{text.otherHelp}</Field.HelpText>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.otherLabel) })
    await expect(input).toHaveAttribute('autocomplete', 'off')
  },
}

/**
 * Without mask is the default: nothing is left out, so a number pasted as "Tel: 070-174 06 05"
 * is kept as pasted. `mask="telephone"` is a choice: it leaves out what isn't a digit, `+`,
 * space, `-`, `(` or `)`, and announces it, but never formats. Compare the two below.
 */
export const WithoutMask: Story = {
  render: () => (
    <>
      <Field.Root controlId="phone-no-mask" required>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone" mask={false} />
        <Field.HelpText>{text.help}</Field.HelpText>
      </Field.Root>
      <Field.Root controlId="phone-telephone-mask" required>
        <Field.Label>Phone number, telephone mask</Field.Label>
        <PhoneInput.Number name="phoneMasked" mask="telephone" />
        <Field.HelpText>{text.maskHelp}</Field.HelpText>
      </Field.Root>
    </>
  ),
  play: async ({ canvas }) => {
    const plain = canvas.getByRole('textbox', { name: new RegExp(`^${text.label}$`) })
    await userEvent.type(plain, 'ca 070-174 06 05')
    await expect(plain).toHaveValue('ca 070-174 06 05')
    const masked = canvas.getByRole('textbox', { name: /telephone mask/ })
    await userEvent.type(masked, 'ca 070-174 06 05')
    await expect(masked).toHaveValue(' 070-174 06 05')
  },
}

/** Disabled: skipped by Tab, and the number is not submitted. */
export const Disabled: Story = {
  render: () => (
    <Field.Root controlId="phone-disabled" disabled>
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number name="phone" defaultValue="070-174 06 05" />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: new RegExp(text.label) })).toBeDisabled()
  },
}

/** Read-only: focusable and read by screen readers, the help text says where to change it. */
export const ReadOnly: Story = {
  render: () => (
    <Field.Root controlId="phone-read-only">
      <Field.Label>{text.label}</Field.Label>
      <PhoneInput.Number name="phone" readOnly defaultValue="070-174 06 05" />
      <Field.HelpText>{text.readOnlyHelp}</Field.HelpText>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: new RegExp(text.label) })
    await expect(input).toHaveAttribute('readonly')
    await userEvent.type(input, '9')
    await expect(input).toHaveValue('070-174 06 05')
  },
}

/** Right to left: the label and help text start at the right, and the number stays `ltr`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <>
      <Field.Root controlId="phone-rtl" required>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone" defaultValue="+46 70-174 06 05" />
        <Field.HelpText>{text.help}</Field.HelpText>
      </Field.Root>
      <Field.Root controlId="phone-rtl-error" required invalid>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone2" />
        <Field.HelpText>{text.help}</Field.HelpText>
        <Field.ErrorMessage>{text.errorEmpty}</Field.ErrorMessage>
      </Field.Root>
    </>
  ),
  play: async ({ canvas }) => {
    for (const input of canvas.getAllByRole('textbox')) {
      await expect(input).toHaveAttribute('dir', 'ltr')
    }
  },
}

/** Edges survive forced colours, also on an invalid box. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <>
      <Field.Root controlId="phone-forced" required>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone" />
        <Field.HelpText>{text.help}</Field.HelpText>
      </Field.Root>
      <Field.Root controlId="phone-forced-error" required invalid>
        <Field.Label>{text.label}</Field.Label>
        <PhoneInput.Number name="phone2" defaultValue="070-174" />
        <Field.HelpText>{text.help}</Field.HelpText>
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
    </>
  ),
}
