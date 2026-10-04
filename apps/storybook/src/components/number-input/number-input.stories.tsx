import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/number-input/number-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/number-input/number-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/NumberInput: a quantity or an amount, a native text box with the number mask
// built in (design spec docs/design/form-fields.md §6.4). It is never `type="number"`, which
// changes on the mouse wheel, drops leading zeros and rounds silently, and it is not a spin
// button: the arrow keys move the caret and never step the value. A code (a postcode, a case
// number) is a TextInput with a mask, because a number would drop its leading zeros: see
// Components/Form/TextInput. KvirnUI holds no form state, and nothing here validates: an invalid
// story sets `invalid` itself. number-input.e2e.ts runs the keyboard rows and the reflow check.

const meta = {
  title: 'Components/Form/NumberInput',
  component: NumberInput,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    name: 'children',
    decimals: 0,
    allowNegative: false,
    grouping: false,
    min: undefined,
    max: undefined,
    autoComplete: 'off',
    disabled: false,
    readOnly: false,
    announceRejections: true,
    onValueChange: fn(),
  },
  // Every prop in number-input.tsx and use-number-input.ts. Any other native `<input>` prop passes through.
  argTypes: {
    decimals: {
      control: { type: 'number', min: 0, max: 4, step: 1 },
      description:
        'Digits after the decimal mark. Default `0`: no mark is accepted. The mark is the page’s language: a comma in sv, fi, nb, nn and se, a point in en. Sets `inputmode="decimal"`. With decimals, add a help text with an example (3.3.2).',
    },
    allowNegative: {
      control: 'boolean',
      description:
        'Accept a leading minus sign. Default `false`. Sets `inputmode="text"`, because iOS’s numeric keypads have no minus sign.',
    },
    grouping: {
      control: 'boolean',
      description:
        'Write the whole digits in threes with the page’s separator: `1 250 000`. Default `false`.',
    },
    min: {
      control: 'number',
      description:
        'Lower limit. Reported as `details.isWithinRange`, never clamped, and never written as a `min` attribute (it is invalid on a text input).',
    },
    max: {
      control: 'number',
      description:
        'Upper limit. Reported as `details.isWithinRange`, never clamped, and never written as a `max` attribute.',
    },
    mask: {
      control: 'select',
      options: [undefined, false, 'digits', 'letters-and-digits', 'telephone'],
      description:
        'Replaces the number mask. `false`: no mask, a plain numeric text box that leaves nothing out and reports no `unmaskedValue` (`decimals`, `allowNegative`, `grouping`, `min` and `max` then do nothing, but `inputmode` still follows `decimals` and `allowNegative`). A name, `{ pattern }`, a `RegExp` or a mask from `masks` shapes the value instead, and `unmaskedValue` is that mask’s. Default: the number mask.',
    },
    value: {
      control: 'text',
      description:
        'Controlled: the number as shown, from your form state (`1 250,50`). Pair it with `onValueChange`, or the box can’t be edited.',
    },
    defaultValue: {
      control: 'text',
      description:
        'Uncontrolled: the browser keeps the value, and a form submit sends it as shown.',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the number as shown and `{ reason: "input", event, unmaskedValue, isWithinRange, isComplete, rejected }` on every change. `unmaskedValue` is the machine form, `-1234.5`. It only reports: the value lives in your form state.',
    },
    onChange: {
      control: false,
      description: 'The native change handler. It still works next to `onValueChange`.',
    },
    announceRejections: {
      control: 'boolean',
      description:
        'Announce, politely and at most once every few seconds, when a character is left out. Default `true`. Needs a `KvirnProvider`.',
    },
    messages: {
      control: 'object',
      description:
        'Per-instance overrides for the announcements (`characterNotAllowed`, `maximumLength`, `maximumDecimals`).',
    },
    name: { control: 'text', description: 'The field’s name in a form submit.' },
    autoComplete: {
      control: 'text',
      description: 'The autofill token for the question, where one exists. Default: none.',
    },
    inputMode: {
      control: 'select',
      options: [undefined, 'numeric', 'decimal', 'text'],
      description:
        'The on-screen keyboard. The mask suggests one from its options, and yours wins.',
    },
    spellCheck: {
      control: 'boolean',
      description: 'The mask sets `false`, and yours wins.',
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
      options: [
        undefined,
        'kv-input--width-2',
        'kv-input--width-4',
        'kv-input--width-6',
        'kv-input--width-10',
        'kv-input--width-20',
      ],
      description:
        'Your own classes, added to `kv-input kv-input--numeric`. The theme styles `kv-input--width-2|4|6|10|20`.',
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
    render: {
      control: false,
      description: 'Another element. It must still be an `<input>`. Spread the props it gets.',
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
  render: (args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.children}</Field.Label>
        <NumberInput {...args} />
        <Field.HelpText>{text.childrenHint}</Field.HelpText>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof NumberInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a whole number in a Field, with every option as a control. Try `decimals`,
 * `allowNegative`, `grouping`, `min` and `max`, and a width class. A letter is left out and
 * announced, and a range is reported to `onValueChange` but never enforced.
 */
export const Default: Story = {
  play: async ({ canvas, args, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    // A text box with a numeric keypad: not a spinbutton, and no min or max attribute.
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('spellcheck', 'false')
    await expect(input).not.toHaveAttribute('min')
    await expect(canvas.queryByRole('spinbutton')).toBeNull()
    await expectMinimumTargetSize(input)
    // The mask leaves out what it can't take: the letters never reach the value.
    await userEvent.type(input, 'a2b')
    await expect(input).toHaveValue('2')
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      '2',
      expect.objectContaining({ reason: 'input', unmaskedValue: '2' }),
    )
  },
}

/**
 * The fixture the keyboard tests drive: an amount as text. Try the keys in the Keyboard section
 * above: ArrowUp and ArrowDown never step the number, and the other keys are the browser's own,
 * as in any text field.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rent}</Field.Label>
        <NumberInput name="rent" decimals={2} grouping className="kv-input--width-10" />
        <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
      </Field.Root>
    )
  },
}

/**
 * A quantity: digits only, with `kv-input--width-2` for a short answer. A letter is left out and
 * announced, and the range is reported to `onValueChange` for your form to check.
 */
export const WholeNumber: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.children}</Field.Label>
        <NumberInput name="children" min={0} max={12} className="kv-input--width-2" />
        <Field.HelpText>{text.childrenHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await userEvent.type(input, 'a2b')
    await expect(input).toHaveValue('2')
  },
}

/**
 * An amount: two decimals and grouping. The decimal mark and the grouping are the page’s
 * language, and the help text shows the amount that way and says to leave out the currency sign.
 */
export const Amount: Story = {
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rent}</Field.Label>
        <NumberInput name="rent" decimals={2} grouping min={0} className="kv-input--width-10" />
        <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text, rentExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rent })
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    // Typed the way people write amounts: the space is left out (and announced), the comma is
    // the decimal mark, and the mask writes the grouping and the page's decimal mark.
    await userEvent.type(input, '1 250,50')
    await expect(input).toHaveValue(rentExample)
    // A currency sign is a letter to the mask: it is left out.
    await userEvent.type(input, ' kr')
    await expect(input).toHaveValue(rentExample)
  },
}

/**
 * Masks are optional: `mask={false}` is a plain numeric text box. Nothing is left out or
 * announced, and `onValueChange` reports no `unmaskedValue`: read the typed value and parse it
 * yourself. Use it where the number mask's filtering is in the way, for instance an amount pasted
 * from a spreadsheet. The help text still says the format you expect.
 */
export const WithoutMask: Story = {
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rent}</Field.Label>
        <NumberInput name="rent" mask={false} decimals={2} className="kv-input--width-10" />
        <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rent })
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    // Nothing is left out: a letter and a currency sign stay as typed.
    await userEvent.type(input, 'ca 1250 kr')
    await expect(input).toHaveValue('ca 1250 kr')
  },
}

/**
 * An amount with its unit shown in the box: an `InputGroup` with a "kr" Addon. The Addon is
 * `aria-hidden`, so the label carries the unit: "Månadshyra i kronor". See Components/Form/InputGroup
 * for the other add-ons.
 */
export const AmountWithUnit: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rentWithUnit}</Field.Label>
        <InputGroup.Root>
          <NumberInput name="rent" grouping className="kv-input--width-10" />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text, amountExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    // The unit isn't in the name or the description: the label already says it.
    await expect(input).toHaveAccessibleDescription(text.rentUnitExample(amountExample))
    await userEvent.type(input, '8450')
    await expect(input).toHaveValue(amountExample)
  },
}

/**
 * A number that can be below zero: `allowNegative` takes a leading minus sign. The keypad shows
 * text, because iOS's numeric keypads have no minus sign, and the help text shows how to write it.
 */
export const Negative: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.balance}</Field.Label>
        <NumberInput name="balance" allowNegative className="kv-input--width-10" />
        <Field.HelpText>{text.balanceHint('-8450')}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.balance })
    await expect(input).toHaveAttribute('inputmode', 'text')
    // The minus sign is taken once, at the start: a second one is left out.
    await userEvent.type(input, '-8450-')
    await expect(input).toHaveValue('-8450')
  },
}

/**
 * Out of range: 25 is a number the mask lets through, because it reports `max` and never
 * enforces it. The error under the field says what's wrong and how to fix it, and the answer
 * stays as typed. Your form checks `details.isWithinRange` and decides: nothing here validates.
 */
export const OutOfRange: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.children}</Field.Label>
        <NumberInput
          name="children"
          min={0}
          max={12}
          defaultValue="25"
          className="kv-input--width-2"
        />
        <Field.HelpText>{text.childrenHint}</Field.HelpText>
        <Field.ErrorMessage>{text.childrenRangeError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.children })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveValue('25')
    // The range is only reported: it isn't an attribute on the input.
    await expect(input).not.toHaveAttribute('max')
    // The help text stays, and the error joins it in the description.
    await expect(input).toHaveAccessibleDescription(expect.stringContaining(text.childrenHint))
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining(text.childrenRangeError),
    )
  },
}

/** Finnish: longer labels, and the decimal comma. Nothing overflows in a 320px column. */
export const Finnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.children}</Field.Label>
          <NumberInput name="children" min={0} max={12} className="kv-input--width-2" />
          <Field.HelpText>{text.childrenHint}</Field.HelpText>
        </Field.Root>
        <Field.Root required lang={lang}>
          <Field.Label>{text.rent}</Field.Label>
          <NumberInput name="rent" decimals={2} grouping className="kv-input--width-10" />
          <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Montako lasta asuu kanssasi?' }),
    ).toBeVisible()
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left, in English: the label and help text start at the right, and the keys still work. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <>
        <Field.Root required lang={lang}>
          <Field.Label>{text.rent}</Field.Label>
          <NumberInput name="rent" decimals={2} grouping className="kv-input--width-10" />
          <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
        </Field.Root>
        <Field.Root required invalid lang={lang}>
          <Field.Label>{text.children}</Field.Label>
          <NumberInput name="children" defaultValue="25" className="kv-input--width-2" />
          <Field.HelpText>{text.childrenHint}</Field.HelpText>
          <Field.ErrorMessage>{text.childrenRangeError}</Field.ErrorMessage>
        </Field.Root>
      </>
    )
  },
}

/** Edges survive forced colours, also on an invalid input. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => {
    const { text, lang, rentExample } = textsFor(localeOf(globals))
    return (
      <>
        <Field.Root required lang={lang}>
          <Field.Label>{text.rent}</Field.Label>
          <NumberInput name="rent" decimals={2} grouping className="kv-input--width-10" />
          <Field.HelpText>{text.rentHint(rentExample)}</Field.HelpText>
        </Field.Root>
        <Field.Root required invalid lang={lang}>
          <Field.Label>{text.children}</Field.Label>
          <NumberInput name="children" defaultValue="25" className="kv-input--width-2" />
          <Field.HelpText>{text.childrenHint}</Field.HelpText>
          <Field.ErrorMessage>{text.childrenRangeError}</Field.ErrorMessage>
        </Field.Root>
      </>
    )
  },
}
