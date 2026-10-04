import { Button, Card, Field, Input, masks } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { FieldStates, localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { MaskedField, maskLocaleOf, maskTextsFor } from '../mask/mask.fixture.tsx'
import type { MaskLocale } from '../mask/mask.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Input: the native text <input>, styled by @kvirn-ui/theme/theme.css (design spec docs/design/form-fields.md §6.3 and §6.4). It lives in a Field, which gives it
// its name, hint and error. Numbers are Input with `inputMode`, never `type="number"`
//: see Components/Form/Number.
//
// KvirnUI holds no form state. An uncontrolled Input keeps its value in the
// browser and a form submit sends it (PlainForm). A controlled Input shows the `value` you give
// it and reports changes through `onValueChange` (Controlled): here the value lives in the
// story's `useState`, where your form library's state would live. Nothing here validates: an
// invalid story sets `invalid` itself. input.e2e.ts runs the keyboard rows, focus ring,
// forced-colours and reflow checks.

/**
 * The presets the `mask` control offers. A control can only hold text, so each choice is a name
 * that `argTypes.mask.mapping` turns into the preset the Input gets. In your code, pass the
 * preset itself: `<Input mask={masks.postalCode({ country: 'SE' })} />`.
 */
const maskChoices = {
  none: undefined,
  digits: masks.digits(),
  number: masks.number(),
  'number (2 decimals)': masks.number({ decimals: 2 }),
  'postalCode SE': masks.postalCode({ country: 'SE' }),
  'personalIdentityNumber SE': masks.personalIdentityNumber({ country: 'SE' }),
  date: masks.date(),
}
type MaskChoice = keyof typeof maskChoices

const isMaskChoice = (value: unknown): value is MaskChoice =>
  typeof value === 'string' && value in maskChoices

interface MaskExample {
  label: string
  hint: string
  /** `en` when the label and hint are in English on a page in another language (3.1.2). */
  lang: 'en' | undefined
}

/**
 * A masked field needs a label that fits the mask and a hint with an example (3.3.2). One
 * pair per choice, in sv, nb, nn and en. The other languages show the English pair, marked `lang="en"`.
 */
function maskExampleFor(
  globals: Record<string, unknown>,
  choice: unknown,
): MaskExample | undefined {
  if (!isMaskChoice(choice) || choice === 'none') return undefined
  const { text, lang } = maskTextsFor(globals)
  const locale: MaskLocale = maskLocaleOf(globals)
  const pick = (sv: string, en: string, nb: string, nn: string): string =>
    ({ sv, en, nb, nn })[locale]
  // From the mask the field uses, in the provider's locale, so the example always types as shown.
  // A day above 12 shows the order (3.3.2).
  const dateExample = maskChoices.date.withLocale(localeOf(globals)).format('2026-10-27')
  const examples: Record<Exclude<MaskChoice, 'none'>, { label: string; hint: string }> = {
    digits: { label: text.digits, hint: text.digitsHint },
    number: {
      label: pick('Antal', 'Quantity', 'Antall', 'Tal'),
      hint: pick(
        'Skriv ett heltal, till exempel 12.',
        'Enter a whole number, for example 12.',
        'Skriv et heltall, for eksempel 12.',
        'Skriv eit heiltal, til dømes 12.',
      ),
    },
    'number (2 decimals)': {
      label: pick('Belopp i kronor', 'Amount in kronor', 'Beløp i kroner', 'Beløp i kroner'),
      hint: pick(
        'Skriv med komma eller punkt, till exempel 1250,50.',
        'Use a comma or a point, for example 1250.50.',
        'Skriv med komma eller punktum, for eksempel 1250,50.',
        'Skriv med komma eller punktum, til dømes 1250,50.',
      ),
    },
    'postalCode SE': { label: text.postalCode, hint: text.postalCodeHint },
    'personalIdentityNumber SE': {
      label: text.personalIdentityNumber,
      hint: text.personalIdentityNumberHint,
    },
    date: {
      label: pick('Startdatum', 'Start date', 'Startdato', 'Startdato'),
      hint: pick(
        `Till exempel ${dateExample}.`,
        `For example, ${dateExample}.`,
        `For eksempel ${dateExample}.`,
        `Til dømes ${dateExample}.`,
      ),
    },
  }
  return { ...examples[choice], lang }
}

const meta = {
  title: 'Components/Form/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'tel', 'url', 'password', 'search'],
      description: 'Never `number` or `date`.',
    },
    value: { control: 'text', description: 'Controlled: the value from your form state.' },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled: the browser keeps the value, and a form submit sends it.',
    },
    onValueChange: { action: 'onValueChange' },
    mask: {
      control: 'select',
      options: Object.keys(maskChoices),
      mapping: maskChoices,
      description:
        'Shapes what is typed: `masks.digits()`, `masks.number({ decimals })`, `masks.postalCode({ country })`, `masks.personalIdentityNumber({ country })`, `masks.date()` and others. The control picks a preset, and the example adds the hint a masked field needs (3.3.2). See Components/Form/Mask.',
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-input`. The theme styles `kv-input--width-2|4|6|10|20` and `kv-input--numeric`.',
    },
    render: { control: false },
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
  render: (args, { globals, unmappedArgs }) => {
    const { text, lang } = textsFor(localeOf(globals))
    // The control holds the preset's name. Without a mask, a name field: with one, a field that fits it.
    const example = maskExampleFor(globals, unmappedArgs?.['mask'])
    return (
      <Field.Root required lang={example?.lang ?? lang}>
        <Field.Label>{example?.label ?? text.name}</Field.Label>
        <Input name="name" autoComplete={example === undefined ? 'name' : 'off'} {...args} />
        {example === undefined ? null : <Field.Hint>{example.hint}</Field.Hint>}
      </Field.Root>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A text input in a Field: 44px high, a 1px edge, and a 2px ring on keyboard focus. Pick a
 * `mask` in the controls to see how a masked field is written: the label and the hint fit the
 * mask, and `autoComplete` is off because the field no longer asks for a name.
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
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
}

/** Typing reaches `onValueChange` with the new value, and the input shows it. */
export const Typing: Story = {
  args: { onValueChange: fn() },
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
          <Input name="email" type="email" autoComplete="email" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.phone}</Field.Label>
          <Input name="phone" type="tel" autoComplete="tel" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.website}</Field.Label>
          <Input name="website" type="url" autoComplete="url" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.password}</Field.Label>
          <Input name="password" type="password" autoComplete="current-password" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{text.search}</Field.Label>
          <Input name="search" type="search" />
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
 * overrides, and shrinks to fit a 320px screen. The width is a hint, never a limit.
 */
export const Widths: Story = {
  render: () => (
    <div className="kv-story-form" data-testid="widths">
      {widths.map(([className, example]) => (
        <Field.Root key={className} required>
          <Field.Label>
            <code>{className}</code>
          </Field.Label>
          <Input name={className} defaultValue={example} className={className} />
        </Field.Root>
      ))}
      <Field.Root required>
        <Field.Label>
          <code>kv-input</code>
        </Field.Label>
        <Input name="full-width" />
      </Field.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const [className, example] of widths) {
      const input = canvas.getByRole('textbox', { name: className })
      await expect(input).toHaveValue(example)
    }
    await expectNoHorizontalOverflow(canvas.getByTestId('widths'))
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
        <Input name="email" type="email" autoComplete="email" defaultValue="anna@" />
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

/** Controlled: the value lives in this story's `useState`, and Input reports changes up. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const [value, setValue] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.name}</Field.Label>
        <Input name="name" autoComplete="name" value={value} onValueChange={setValue} />
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youTyped}: {value}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React
 * Hook Form or your own reducer: Input renders the `value` it's given and calls
 * `onValueChange(value, { reason: 'input', event })`. It never copies the value into state of
 * its own.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.name })
    await userEvent.type(input, 'Anna')
    await expect(input).toHaveValue('Anna')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youTyped}: Anna`)
  },
}

/** A text value of a submitted form, `''` when the field is missing. */
const fieldText = (data: FormData, name: string): string => {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

/** An uncontrolled form: the browser keeps the values, and the submit reads them. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = textsFor(locale)
  const [sent, setSent] = useState<{ name: string; email: string } | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSent({ name: fieldText(data, 'name'), email: fieldText(data, 'email') })
      }}
    >
      <Field.Root required>
        <Field.Label>{text.name}</Field.Label>
        <Input name="name" autoComplete="name" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.email}</Field.Label>
        <Input name="email" type="email" autoComplete="email" />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent.name}, {sent.email}
        </p>
      )}
    </form>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers. Each Input is uncontrolled, keeps what the
 * user typed, and the form's `FormData` has it by `name` on submit. Without `type="submit"`
 * validation of your own, nothing here says a value is wrong: that's your form logic's job.
 */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await userEvent.type(canvas.getByRole('textbox', { name: text.name }), 'Anna Andersson')
    await userEvent.type(canvas.getByRole('textbox', { name: text.email }), 'anna@example.se')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(
      `${text.sent}: Anna Andersson, anna@example.se`,
    )
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
            <Input name="on-surface" />
          </Field.Root>
        </div>
        <Card.Root>
          <Field.Root required invalid>
            <Field.Label>{text.inCard}</Field.Label>
            <Input name="in-card" />
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
          <Input name="name" autoComplete="name" defaultValue="Anna Andersson" />
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
 * With a `mask` the input shapes what is typed: here a Swedish personal identity
 * number, which takes ten or twelve digits with or without the hyphen. The hint says the
 * format, because the mask doesn't (3.3.2). More on Components/Form/Mask.
 */
export const Masked: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = maskTextsFor(globals)
    return (
      <div className="kv-story-form" lang={lang}>
        <MaskedField
          label={text.personalIdentityNumber}
          hint={text.personalIdentityNumberHint}
          name="personalIdentityNumber"
          mask={masks.personalIdentityNumber({ country: 'SE' })}
          autoComplete="off"
          className="kv-input--width-20"
        />
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', {
      name: new RegExp(`^${text.personalIdentityNumber}`),
    })
    await userEvent.type(input, '199001012385')
    await expect(input).toHaveValue('19900101-2385')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('dir', 'ltr')
  },
}

/** A postcode mask: the space is inserted as the user types past it. */
export const MaskedPostcode: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = maskTextsFor(globals)
    return (
      <div className="kv-story-form" lang={lang}>
        <MaskedField
          label={text.postalCode}
          hint={text.postalCodeHint}
          name="postalCode"
          mask={masks.postalCode({ country: 'SE' })}
          autoComplete="postal-code"
          className="kv-input--width-6"
        />
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = maskTextsFor(globals)
    const input = canvas.getByRole('textbox', { name: new RegExp(`^${text.postalCode}`) })
    await userEvent.type(input, '12345')
    await expect(input).toHaveValue('123 45')
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
          <Input name="name" autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>{text.caseNumber}</Field.Label>
          <Input name="case" autoComplete="off" spellCheck={false} />
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
          <Input name="name" autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>{text.caseNumber}</Field.Label>
          <Input name="case" autoComplete="off" spellCheck={false} />
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
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <Input name="reference" inputMode="numeric" spellCheck={false} />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Right to left, in English: the text starts at the right, and the edge is the same. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <FieldStates locale="en" />,
}

/** Edges, the 2px invalid edge, dashed disabled and the ring survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <FieldStates locale={localeOf(globals)} />,
}
