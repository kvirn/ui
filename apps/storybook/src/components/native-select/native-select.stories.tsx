import { Button, Card, Field, NativeSelect } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/native-select/native-select.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import type { ChoiceTexts } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/NativeSelect: the browser's own <select>, wired to a Field and styled by
// @kvirn-ui/theme/theme.css (ADR-0037, item 2; design spec docs/design/form-fields.md §6.3).
// It is the first recommendation for a short list, and the best choice on a phone, where the
// browser shows its own picker. The open list is the browser's: its keys are native.
//
// KvirnUI holds no form state (ADR-0029, item 0). An uncontrolled NativeSelect keeps its choice
// in the browser and a form submit sends it (PlainForm). A controlled one shows the `value` you
// give it and reports changes through `onValueChange` (Controlled). Nothing here validates: an
// invalid story sets `invalid` itself. native-select.e2e.ts runs the keyboard rows, forced
// colours and reflow checks.

const meta = {
  title: 'Components/Form/NativeSelect',
  component: NativeSelect,
  argTypes: {
    value: { control: 'text', description: 'Controlled: the chosen option’s value.' },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled: the browser keeps the choice, and a form submit sends it.',
    },
    onValueChange: { control: false },
    disabled: { control: 'boolean' },
    className: { control: 'text', description: 'Your own classes, added to `kv-native-select`.' },
    render: { control: false },
  },
  args: { onValueChange: logChange('onValueChange') },
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
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality" autoComplete="address-level2" {...args}>
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

/** The options: an instruction first, then a short list in alphabetical order. */
function Municipalities({ text }: { text: ChoiceTexts }) {
  return (
    <>
      <option value="">{text.municipalityPlaceholder}</option>
      <option value="gothenburg">{text.municipalityGothenburg}</option>
      <option value="malmo">{text.municipalityMalmo}</option>
      <option value="stockholm">{text.municipalityStockholm}</option>
      <option value="uppsala">{text.municipalityUppsala}</option>
    </>
  )
}

/** A select in a Field: 44px high, a 1px edge, a drawn chevron and a 2px ring on keyboard focus. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = canvas.getByRole('combobox', { name: text.municipality })
    await expect(select.tagName).toBe('SELECT')
    await expect(select).toHaveAttribute('autocomplete', 'address-level2')
    await expectMinimumTargetSize(select)
    await expect(select.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
  },
}

/**
 * The fixture the keyboard tests drive: a select, a disabled select and a button in a form. Try
 * the keys in the Keyboard section above: Tab and Shift+Tab, the arrow keys, Home and End,
 * typing a letter, and Alt+ArrowDown to open the list (the open list is the browser's).
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.longSelectLabel}</Field.Label>
        <NativeSelect name="disabled">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/** A chosen option shows in the closed box. */
export const Selected: Story = {
  args: { defaultValue: 'stockholm' },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('combobox', { name: text.municipality })).toHaveValue('stockholm')
  },
}

/** The hint is in the select's description. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.municipalityHint}</Field.Description>
        <NativeSelect name="municipality" {...args}>
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('combobox', { name: text.municipality }),
    ).toHaveAccessibleDescription(text.municipalityHint)
  },
}

/** Optional: the label says so ("valfritt"), as for every field that isn't required. */
export const Optional: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality" {...args}>
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
    )
  },
}

/** Invalid: a 2px edge and the message under the select, with the choice kept as it was. */
export const Invalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.municipalityHint}</Field.Description>
        <NativeSelect name="municipality" {...args}>
          <Municipalities text={text} />
        </NativeSelect>
        <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = canvas.getByRole('combobox', { name: text.municipality })
    await expect(select).toHaveAttribute('aria-invalid', 'true')
    await expect(select).toHaveAttribute('aria-required', 'true')
    await expect(select).toHaveAttribute('data-invalid')
    await expect(select).toHaveAccessibleDescription(
      new RegExp(`${text.municipalityHint}.*${text.municipalityError}`),
    )
  },
}

/** Disabled: a dashed edge on the surface colour, and the chevron is muted. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'malmo' },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('combobox', { name: text.municipality })).toBeDisabled()
  },
}

/** Option groups: `<optgroup label>` names each group of options. */
export const Groups: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality" {...args}>
          <option value="">{text.municipalityPlaceholder}</option>
          <optgroup label={text.regionWest}>
            <option value="gothenburg">{text.municipalityGothenburg}</option>
          </optgroup>
          <optgroup label={text.regionEast}>
            <option value="stockholm">{text.municipalityStockholm}</option>
            <option value="uppsala">{text.municipalityUppsala}</option>
          </optgroup>
          <optgroup label={text.regionSouth}>
            <option value="malmo">{text.municipalityMalmo}</option>
          </optgroup>
        </NativeSelect>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = canvas.getByRole('combobox', { name: text.municipality })
    await expect(select.querySelectorAll('optgroup')).toHaveLength(3)
  },
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11). */
export const OnSurfaces: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field.Root required invalid>
          <Field.Label>{text.municipality}</Field.Label>
          <NativeSelect name="municipality" {...args}>
            <Municipalities text={text} />
          </NativeSelect>
          <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
        </Field.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('combobox', { name: text.municipality })).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high, with the text still 16px. */
export const Compact: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.municipality}</Field.Label>
          <NativeSelect name="municipality" {...args}>
            <Municipalities text={text} />
          </NativeSelect>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('combobox', { name: text.municipality }))
  },
}

/** A long Finnish label in a 320px column: the label wraps, the select fills it, nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longSelectLabel}</Field.Label>
          <NativeSelect name="municipality" {...args}>
            <Municipalities text={text} />
          </NativeSelect>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Controlled: the value lives in this story's `useState`, and the select reports changes up. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState('gothenburg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality" value={value} onValueChange={setValue}>
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the select shows the `value` it's given and calls
 * `onValueChange(value, { reason: 'input', event })`. It never copies the value into state.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = canvas.getByRole('combobox', { name: text.municipality })
    await userEvent.selectOptions(select, 'uppsala')
    await expect(select).toHaveValue('uppsala')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: uppsala`)
  },
}

/** An uncontrolled form: the browser keeps the choice, and the submit reads it. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('municipality')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="municipality" defaultValue="gothenburg">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers. The select is uncontrolled, the browser keeps
 * the choice, and the form's `FormData` has it by `name` on submit.
 */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: text.municipality }),
      'malmo',
    )
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: malmo`)
  },
}

/** A change reaches `onValueChange` with the chosen value and the reason. */
export const Reports: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvas, args, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: text.municipality }),
      'malmo',
    )
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'malmo',
      expect.objectContaining({ reason: 'input' }),
    )
  },
}

/** Every state in one column, for the RTL and forced-colours stories. */
function SelectStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.municipalityHint}</Field.Description>
        <NativeSelect name="default" defaultValue="stockholm">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="invalid">
          <Municipalities text={text} />
        </NativeSelect>
        <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="optional">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.municipality}</Field.Label>
        <NativeSelect name="disabled" defaultValue="malmo">
          <Municipalities text={text} />
        </NativeSelect>
      </Field.Root>
    </div>
  )
}

/** Right to left, in English: the chevron is at the left, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <SelectStates locale="en" />,
}

/** The edge, the invalid width and a native chevron stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <SelectStates locale={localeOf(globals)} />,
}
