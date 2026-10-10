import { Button, Card, Field, KvirnProvider, masks, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/text-input/text-input.a11y.md?raw'
import guide from '../../../../../packages/react/src/text-input/text-input.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { dateTextsFor } from '../date-input/date-input.fixture.tsx'
import { FieldStates, localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { maskTextsFor } from '../mask/mask.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ChangeDetailsField,
  ControlledName,
  ExplicitPostcodeField,
  NameAndEmailForm,
  OwnDescribedByField,
  OwnMessagesField,
  PersonalIdentityNumberField,
  PostcodeField,
  ReferenceNumberField,
  StartDateField,
} from './text-input.fixture.tsx'

// Components/Form/TextInput: the native text <input>, styled by @kvirn-ui/theme/theme.css (design
// spec docs/design/form-fields.md §6.3). It lives in a Field, which gives it its name, help text and
// error. A quantity or an amount is a NumberInput, never `type="number"`: see
// Components/Form/NumberInput. KvirnUI holds no form state: an uncontrolled TextInput keeps its
// value in the browser and a form submit sends it (PlainForm), and a controlled one shows the
// `value` you give it and reports changes through `onValueChange` (Controlled). Nothing here
// validates: an invalid story sets `invalid` itself.

const meta = {
  title: 'Components/Forms/TextInput',
  component: TextInput,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    name: 'name',
    type: 'text',
    autoComplete: 'name',
    disabled: false,
    readOnly: false,
    announceRejections: true,
    onValueChange: fn(),
  },
  // Every prop in text-input.tsx and use-text-input.ts. Any other native `<input>` prop passes through.
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'tel', 'url', 'password', 'search'],
      description:
        'The input type. Default `text`. Never `number` (use NumberInput) or `date` (use DateInput).',
    },
    value: {
      control: 'text',
      description:
        'Controlled: the value from your form state. Pair it with `onValueChange`, or the box can’t be edited.',
    },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled: the browser keeps the value, and a form submit sends it.',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the new value and `{ reason: "input", event }` on every change. It only reports: the value lives in your form state.',
    },
    onChange: {
      control: false,
      description: 'The native change handler. It still works next to `onValueChange`.',
    },
    mask: {
      control: 'select',
      options: [
        undefined,
        'digits',
        'letters',
        'letters-and-digits',
        'personal-identity-number',
        'ssi',
        'organisation-number',
        'postal-code',
        'date',
        'iban',
        'email',
        'telephone',
      ],
      description:
        'Shapes what is typed. A name (the control lists them), `{ preset, country? }`, `{ pattern, ...options }`, a `RegExp` that accepts partial values, or a finished mask from `masks` (`masks.postalCode({ country: "SE" })`). The country masks read the country from the provider (`country`, else the locale). Objects, a RegExp and a mask can’t be typed into a control: see the masked examples below. The field then needs a help text with the format (3.3.2).',
    },
    announceRejections: {
      control: 'boolean',
      description:
        'With a `mask`: announce, politely and at most once every few seconds, when it drops characters. Default `true`. Needs a `KvirnProvider`.',
    },
    messages: {
      control: 'object',
      description:
        'With a `mask`: per-instance overrides for the rejection announcements (`mask.characterNotAllowed`, `mask.maximumLength`).',
    },
    name: {
      control: 'text',
      description: 'The field’s name in a form submit.',
    },
    autoComplete: {
      control: 'text',
      description:
        'The autofill token for the question: `name`, `email`, `tel`, `postal-code`. Set it wherever one exists (1.3.5).',
    },
    inputMode: {
      control: 'select',
      options: [undefined, 'text', 'numeric', 'decimal', 'tel', 'email', 'url', 'search', 'none'],
      description: 'The on-screen keyboard. A mask suggests one, and yours wins.',
    },
    spellCheck: {
      control: 'boolean',
      description: 'Turn spell checking off for codes and identifiers. A mask suggests `false`.',
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
        'kv-input--numeric',
      ],
      description:
        'Your own classes, added to `kv-input`. The theme styles `kv-input--width-2|4|6|10|20` and `kv-input--numeric`.',
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
  globals: { locale: 'sv' },
  decorators: [
    // The masked examples are Swedish whatever the toolbar's language, so the provider says so:
    // without `country` the country masks follow the locale (nb is Norway, English has none).
    (Story) => (
      <KvirnProvider country="SE">
        <Story />
      </KvirnProvider>
    ),
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
        <Field.Label>{text.name}</Field.Label>
        <TextInput {...args} />
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a text input in a Field, with every option as a control. Try `type`,
 * `className` (a width), `disabled` and `readOnly`. For a mask, see the masked examples below.
 */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('autocomplete', 'name')
    await expectMinimumTargetSize(input)
  },
}

/**
 * The fixture the keyboard tests drive: two inputs and a submit button in a plain form. Try the
 * keys in the Keyboard section above: Tab and Shift+Tab, the arrow keys, Home and End in the
 * text, Control or Command with A, Escape (nothing happens), and Enter, which submits the form.
 */
export const Keyboard: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'NameAndEmailForm'),
  render: (_args, { globals }) => <NameAndEmailForm locale={localeOf(globals)} />,
}

/** Typing reaches `onValueChange` with the new value, and the input shows it. */
export const Typing: Story = {
  play: async ({ canvas, args, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await userEvent.type(input, 'Anna')
    await expect(input).toHaveValue('Anna')
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'Anna',
      expect.objectContaining({ reason: 'input' }),
    )
  },
}

/** The input types that look the same, each with its `autocomplete` (1.3.5). */
export const Types: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-form" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.email}</Field.Label>
          <TextInput name="email" type="email" autoComplete="email" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.phone}</Field.Label>
          <TextInput name="phone" type="tel" autoComplete="tel" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.website}</Field.Label>
          <TextInput name="website" type="url" autoComplete="url" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.password}</Field.Label>
          <TextInput name="password" type="password" autoComplete="current-password" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.search}</Field.Label>
          <TextInput name="search" type="search" />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.email })).toHaveAttribute('type', 'email')
    await expect(canvas.getByRole('textbox', { name: text.phone })).toHaveAttribute('type', 'tel')
    await expect(canvas.getByRole('textbox', { name: text.website })).toHaveAttribute('type', 'url')
    await expect(canvas.getByLabelText(text.password)).toHaveAttribute('type', 'password')
    await expect(canvas.getByRole('searchbox', { name: text.search })).toBeVisible()
  },
}

const widths = [
  ['kv-input--width-2', '12'],
  ['kv-input--width-4', '2007'],
  ['kv-input--width-6', '123 45'],
  ['kv-input--width-10', 'ABC 123'],
  ['kv-input--width-20', '19900101-1234'],
] as const

/**
 * The width reflects the expected answer: five steps by characters, and full width without a
 * class. Each is wide enough for its answer in the invalid state and under the text-spacing
 * overrides, and shrinks to fit a 320px screen. The width is a help text, never a limit.
 */
export const Widths: Story = {
  render: () => (
    <div className="kv-story-form">
      <Field.Root required>
        <Field.Label>
          <code>kv-input--width-2</code>
        </Field.Label>
        <TextInput name="width-2" defaultValue="12" className="kv-input--width-2" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          <code>kv-input--width-4</code>
        </Field.Label>
        <TextInput name="width-4" defaultValue="2007" className="kv-input--width-4" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          <code>kv-input--width-6</code>
        </Field.Label>
        <TextInput name="width-6" defaultValue="123 45" className="kv-input--width-6" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          <code>kv-input--width-10</code>
        </Field.Label>
        <TextInput name="width-10" defaultValue="ABC 123" className="kv-input--width-10" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          <code>kv-input--width-20</code>
        </Field.Label>
        <TextInput name="width-20" defaultValue="19900101-1234" className="kv-input--width-20" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          <code>kv-input</code>
        </Field.Label>
        <TextInput name="full-width" />
      </Field.Root>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    for (const [className, example] of widths) {
      const input = canvas.getByRole('textbox', { name: className })
      await expect(input).toHaveValue(example)
    }
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Invalid: a 2px edge and the message under the input, and the text stays where it was. */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.email}</Field.Label>
        <Field.Prose>
          <p>{text.emailHint}</p>
        </Field.Prose>
        <TextInput name="email" type="email" autoComplete="email" defaultValue="anna@" />
        <Field.ErrorMessage>{text.emailError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.email })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('data-invalid')
    // The answer stays as typed, so the user can fix it instead of starting over.
    await expect(input).toHaveValue('anna@')
  },
}

/** Disabled: a dashed edge on the surface colour. Say why on submit instead, where you can. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Anna Andersson' },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.name })).toBeDisabled()
  },
}

/** Read-only is for staff tools: a solid edge on the surface colour, and still focusable. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Anna Andersson' },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await expect(input).toHaveAttribute('readonly')
    input.focus()
    await expect(input).toHaveFocus()
  },
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React
 * Hook Form or your own reducer: TextInput renders the `value` it's given and calls
 * `onValueChange(value, { reason: 'input', event })`. It never copies the value into state of
 * its own.
 */
export const Controlled: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'ControlledName'),
  render: (_args, { globals }) => <ControlledName locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await userEvent.type(input, 'Anna')
    await expect(input).toHaveValue('Anna')
    await expect(canvas.getByText(`${text.youTyped}: Anna`)).toBeVisible()
  },
}

/**
 * A plain `<form>`: no `value` and no handlers. Each TextInput is uncontrolled, keeps what the
 * user typed, and the form's `FormData` has it by `name` on submit. Nothing here says a value is
 * wrong: that's your form logic's job.
 */
export const PlainForm: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'NameAndEmailForm'),
  render: (_args, { globals }) => <NameAndEmailForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await userEvent.type(canvas.getByRole('textbox', { name: text.name }), 'Anna Andersson')
    await userEvent.type(canvas.getByRole('textbox', { name: text.email }), 'anna@example.se')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByText(`${text.sent}: Anna Andersson, anna@example.se`)).toBeVisible()
  },
}

/** On a `surface` section and in a card: the edge keeps 3:1 against each (1.4.11). */
export const OnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-form" lang={lang}>
        <div className="kv-story-form-surface">
          <Field.Root required>
            <Field.Label>{text.surface}</Field.Label>
            <TextInput name="on-surface" />
          </Field.Root>
        </div>
        <Card.Root>
          <Field.Root required invalid>
            <Field.Label>{text.inCard}</Field.Label>
            <TextInput name="in-card" />
            <Field.ErrorMessage>{text.nameError}</Field.ErrorMessage>
          </Field.Root>
        </Card.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.surface })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: text.inCard })).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high, with the value text still 16px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.name}</Field.Label>
          <TextInput name="name" autoComplete="name" defaultValue="Anna Andersson" />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('textbox', { name: text.name }))
  },
}

/**
 * A mask shapes what is typed: here a Swedish personal identity number, which takes ten or
 * twelve digits with or without the hyphen. The help text says the format, because the mask doesn't
 * (3.3.2). More on Components/Form/Mask.
 */
export const MaskedPersonalIdentityNumber: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'PersonalIdentityNumberField'),
  render: (_args, { globals }) => <PersonalIdentityNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.personalIdentityNumber}`),
    })
    await expect(input).toHaveAccessibleDescription(text.personalIdentityNumberHint)
    await userEvent.type(input, '199001012385')
    await expect(input).toHaveValue('19900101-2385')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('dir', 'ltr')
  },
}

/** A postcode mask: the space is inserted as the user types past it. */
export const MaskedPostcode: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'PostcodeField'),
  render: (_args, { globals }) => <PostcodeField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.postalCode}`) })
    await expect(input).toHaveAccessibleDescription(text.postalCodeHint)
    await userEvent.type(input, '12345')
    await expect(input).toHaveValue('123 45')
  },
}

/**
 * The explicit form of a mask: `masks.postalCode({ country })` builds the same mask the name
 * `"postal-code"` resolves to, without the provider's locale. Prefer the name.
 */
export const ExplicitMask: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'ExplicitPostcodeField'),
  render: (_args, { globals }) => <ExplicitPostcodeField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.postalCode}`) })
    await userEvent.type(input, '12345')
    await expect(input).toHaveValue('123 45')
  },
}

/**
 * A date in one field, in the page's order and separator: `masks.date()` follows the provider's
 * locale. The help text's example is written from the field's own mask, with a day above 12. For a
 * date of birth, use DateInput with three boxes.
 */
export const MaskedDate: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'StartDateField'),
  render: (_args, { globals }) => <StartDateField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = dateTextsFor(locale)
    const example = masks.date().withLocale(locale).format('2026-10-27')
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.oneFieldLabel}`) })
    await expect(input).toHaveAccessibleDescription(text.oneFieldHint(example))
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    // The digits are enough: the mask puts the separators in, in the locale's order.
    await userEvent.type(input, example.replaceAll(/\D/g, ''))
    await expect(input).toHaveValue(example)
  },
}

/**
 * A reference number is a code, not a quantity: `masks.digits()` keeps the leading zeros that a
 * number would drop, and leaves a letter out. For an amount or a quantity, use
 * NumberInput.
 */
export const ReferenceNumber: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'ReferenceNumberField'),
  render: (_args, { globals }) => <ReferenceNumberField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.caseNumber })
    await expect(input).toHaveAccessibleDescription(text.caseNumberHint)
    await expect(input).toHaveValue('004512')
    await userEvent.clear(input)
    // A letter is left out, and the zeros stay.
    await userEvent.type(input, '00x4513')
    await expect(input).toHaveValue('004513')
  },
}

/**
 * A masked value you control, and what `onValueChange` reports besides the value: `unmaskedValue`,
 * `isComplete` and `rejected` (the characters the mask dropped, by reason). The mask's announcement
 * is off here (`announceRejections={false}`) because the field says it in its own words, in a
 * live region that is already on the page. `isWithinRange` is for number masks: see
 * Components/Form/Mask.
 */
export const ChangeDetails: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'ChangeDetailsField'),
  render: (_args, { globals }) => <ChangeDetailsField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: text.digits })
    await userEvent.type(input, '12345a')
    await expect(input).toHaveValue('12345')
    await expect(canvas.getByTestId('own-message')).toHaveTextContent(text.ownRejection)
    await expect(canvas.getByTestId('details')).toHaveTextContent(
      `${text.rejected}: a (digits) · ${text.unmasked}: 12345 · ${text.complete}: ${text.no}`,
    )
    // The next change has nothing to refuse: the message goes, and the code is complete.
    await userEvent.type(input, '6')
    await expect(canvas.getByTestId('own-message')).toBeEmptyDOMElement()
    await expect(canvas.getByTestId('details')).toHaveTextContent(
      `${text.unmasked}: 123456 · ${text.complete}: ${text.yes}`,
    )
  },
}

/**
 * Your own words for the announcement of one input: `messages` replaces `characterNotAllowed`
 * here, and the provider's strings still apply to every other field.
 */
export const OwnMessages: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'OwnMessagesField'),
  render: (_args, { globals }) => <OwnMessagesField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: text.digits })
    await userEvent.type(input, 'a')
    await expect(input).toHaveValue('')
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(text.ownRejection))
  },
}

/**
 * Your own `aria-describedby` is kept: the Field's help text is read first and your ids after it.
 * Use it for a note that belongs to the field but sits elsewhere.
 */
export const OwnDescribedBy: Story = {
  parameters: showSource('text-input/text-input.fixture.tsx', 'OwnDescribedByField'),
  render: (_args, { globals }) => <OwnDescribedByField locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: text.caseNumber })
    await expect(input).toHaveAccessibleDescription(
      `${text.caseNumberHint} ${text.describedByNote}`,
    )
  },
}

/** An inline filter: the inputs and the Button side by side are the same height (44px). */
export const InlineFilter: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <form className="kv-story-filter" lang={lang} onSubmit={(event) => event.preventDefault()}>
        <Field.Root>
          <Field.Label>{text.name}</Field.Label>
          <TextInput name="name" autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>{text.caseNumber}</Field.Label>
          <TextInput name="case" autoComplete="off" spellCheck={false} />
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {text.filter}
        </Button>
      </form>
    )
  },
}

/** The same filter in staff density from 64rem: all three are 32px. */
export const InlineFilterCompact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <form
        className="kv-compact kv-story-filter"
        lang={lang}
        onSubmit={(event) => event.preventDefault()}
      >
        <Field.Root>
          <Field.Label>{text.name}</Field.Label>
          <TextInput name="name" autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>{text.caseNumber}</Field.Label>
          <TextInput name="case" autoComplete="off" spellCheck={false} />
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {text.filter}
        </Button>
      </form>
    )
  },
}

/** A long Finnish label in a 320px column: the input fills it and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <TextInput name="reference" inputMode="numeric" spellCheck={false} />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left, in English: the text starts at the right, and the edge is the same. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: () => <FieldStates locale="en" />,
}

/** Edges, the 2px invalid edge, dashed disabled and the ring survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('form/form.fixture.tsx', 'FieldStates'),
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
