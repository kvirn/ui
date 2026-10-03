import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Label,
  Legend,
  Prose,
  Radio,
  RadioGroup,
} from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/radio-group/radio-group.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { useId, useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/RadioGroup: one question with one answer, in a native <fieldset> under a
// <legend>, with native radios that share a name (ADR-0029, design spec
// docs/design/form-fields.md §6.5). The browser does the keys: the group is one Tab stop, and
// the arrow keys move and check, mirrored in right-to-left. KvirnUI holds no form state
// (ADR-0029, item 0): `value` and `onValueChange` are the selected value, and without `value`
// the native radios are uncontrolled. Nothing here validates: an invalid story sets `invalid`
// itself. A radio never gets aria-invalid (ADR-0029, item 10): the group's error is its
// description. radio-group.e2e.ts runs the keyboard rows, forced colours and reflow checks.

const meta = {
  title: 'Components/Form/RadioGroup',
  component: RadioGroup.Root,
  argTypes: {
    name: { control: 'text', description: 'The name every radio shares. Default: generated.' },
    value: {
      control: false,
      description: 'Controlled: the checked radio’s value, or `null` for none.',
    },
    defaultValue: { control: 'text', description: 'Uncontrolled: the value checked at the start.' },
    onValueChange: { control: false },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    messages: { control: false },
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
  render: (args, { globals }) => <Duration {...args} locale={localeOf(globals)} />,
  parameters: { a11yContract: contract },
} satisfies Meta<typeof RadioGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

interface DurationOptions {
  locale: FormLocale
  /** Show the hint under the legend. */
  hint?: boolean
  /** Show a hint under the 12 month option. */
  optionHints?: boolean
  /** The 6 month option is disabled. */
  disabledOption?: boolean
  /** The legend is the page's `h1`. */
  heading?: boolean
}

type DurationProps = DurationOptions & Omit<ComponentProps<typeof RadioGroup.Root>, 'children'>

/** The design spec's duration question: three radios under a legend. */
function Duration({
  locale,
  hint = true,
  optionHints = false,
  disabledOption = false,
  heading = false,
  ...groupProps
}: DurationProps) {
  const { text, lang } = choiceTextsFor(locale)
  // Radios that share a name are one group for the whole document, so on a Docs page every
  // story's radios would act as one. A name per instance keeps the stories apart.
  const name = `duration-${useId()}`
  return (
    <RadioGroup.Root name={name} lang={lang} {...groupProps}>
      {heading ? (
        <Legend className="kv-fieldset-legend--heading">
          <h1>{text.durationLegend}</h1>
        </Legend>
      ) : (
        <Legend>{text.durationLegend}</Legend>
      )}
      {hint ? (
        <Prose>
          <p>{text.durationHint}</p>
        </Prose>
      ) : null}
      <Field>
        <Radio value="1" />
        <Label>{text.duration1}</Label>
      </Field>
      <Field>
        <Radio value="6" disabled={disabledOption} />
        <Label>{text.duration6}</Label>
      </Field>
      <Field>
        <Radio value="12" />
        <Label>{text.duration12}</Label>
        {optionHints ? (
          <Prose>
            <p>{text.duration12Hint}</p>
          </Prose>
        ) : null}
      </Field>
      <ErrorMessage>{text.durationError}</ErrorMessage>
    </RadioGroup.Root>
  )
}

/** None selected: the group is one Tab stop, and the first Tab lands on the first radio. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.durationLegend}`) })
    await expect(group.tagName).toBe('FIELDSET')
    await expect(group).toHaveAccessibleDescription(text.durationHint)
    const names = new Set<string | null>()
    for (const label of [text.duration1, text.duration6, text.duration12]) {
      const radio = canvas.getByRole('radio', { name: label })
      await expectMinimumTargetSize(radio)
      await expect(radio).not.toBeChecked()
      names.add(radio.getAttribute('name'))
    }
    await expect(names.size).toBe(1)
    await expect([...names][0]).toMatch(/^duration-/)
  },
}

/**
 * The fixture the keyboard tests drive: the group and a button after it, in a form. Try the keys
 * in the Keyboard section above: Tab enters the group once, the arrow keys move and check, and
 * Space checks the focused radio.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Duration locale={locale} />
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/** One radio is checked: Tab goes straight to it, and passes the others. */
export const Selected: Story = {
  args: { defaultValue: '6' },
  render: (args, { globals }) => (
    <form
      className="kv-story-form"
      noValidate
      onSubmit={(e) => e.preventDefault()}
      lang={choiceTextsFor(localeOf(globals)).lang}
    >
      <Duration {...args} locale={localeOf(globals)} />
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {choiceTextsFor(localeOf(globals)).text.send}
        </Button>
      </div>
    </form>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: text.duration1 })).not.toBeChecked()
  },
}

/** An option's own hint is in that radio's description, under its label. */
export const WithOptionHints: Story = {
  render: (args, { globals }) => <Duration {...args} locale={localeOf(globals)} optionHints />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toHaveAccessibleDescription(
      text.duration12Hint,
    )
  },
}

/** Invalid: every circle gets a 2px edge, and the message is under the options. No aria-invalid. */
export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const group = canvas.getByRole('group', { name: new RegExp(`^${text.durationLegend}`) })
    await expect(group).toHaveAccessibleDescription(
      new RegExp(`${text.durationHint}.*${text.durationError}`),
    )
    const radio = canvas.getByRole('radio', { name: text.duration1 })
    await expect(radio).toHaveAttribute('data-invalid')
    await expect(radio).not.toHaveAttribute('aria-invalid')
  },
}

/** One option is disabled: a dashed circle, skipped by Tab and by the arrow keys. */
export const DisabledOption: Story = {
  args: { defaultValue: '1' },
  render: (args, { globals }) => <Duration {...args} locale={localeOf(globals)} disabledOption />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeDisabled()
    await expect(canvas.getByRole('radio', { name: text.duration12 })).not.toBeDisabled()
  },
}

/** The whole group disabled: native `fieldset[disabled]`. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: '12' },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeDisabled()
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeChecked()
  },
}

/** One question per page: the legend is the page's heading (an `h1` inside the legend). */
export const AsPageHeading: Story = {
  render: (args, { globals }) => <Duration {...args} locale={localeOf(globals)} heading />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('heading', { level: 1, name: text.durationLegend })).toBeVisible()
  },
}

/** In a card: the edges keep 3:1 against `surface-raised` (1.4.11). */
export const InCard: Story = {
  args: { invalid: true, defaultValue: '6' },
  render: (args, { globals }) => (
    <Card.Root>
      <Duration {...args} locale={localeOf(globals)} />
    </Card.Root>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('radio', { name: text.duration6 })).toBeChecked()
  },
}

/** Staff density from 64rem: the rows are 32px high, the circles still 24px. */
export const Compact: Story = {
  render: (args, { globals }) => (
    <div className="kv-compact">
      <Duration {...args} locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('radio', { name: text.duration1 }))
  },
}

/** A long Finnish legend and options in a 320px column: they wrap and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <Duration {...args} locale={localeOf(globals)} optionHints />
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Controlled: the value lives in this story's `useState`; the group reports the chosen value. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>('6')
  return (
    <div className="kv-story-form">
      <Duration locale={locale} value={value} onValueChange={setValue} />
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: the group checks the radio whose value equals `value` (`null` for
 * none), and calls `onValueChange(value, { reason: 'input', event })`. It never stores it.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('radio', { name: text.duration12 }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: 12`)
    await expect(canvas.getByRole('radio', { name: text.duration12 })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: text.duration6 })).not.toBeChecked()
  },
}

/** An uncontrolled form: the browser keeps the state, and the submit reads the checked radio. */
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
        const radio = event.currentTarget.querySelector<HTMLInputElement>('input[type=radio]')
        const value = new FormData(event.currentTarget).get(radio?.name ?? '')
        setSent(typeof value === 'string' ? value : '–')
      }}
    >
      <Duration locale={locale} defaultValue="1" />
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
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The radios are
 * uncontrolled, and the form's `FormData` has the checked value under the group's name.
 */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('radio', { name: text.duration12 }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: 12`)
  },
}

/** Every state of the group in one column, for the RTL and forced-colours stories. */
function GroupStates({ locale }: { locale: FormLocale }) {
  const id = useId()
  return (
    <div className="kv-story-form">
      <Duration locale={locale} name={`selected-${id}`} defaultValue="6" optionHints />
      <Duration locale={locale} name={`invalid-${id}`} invalid />
      <Duration locale={locale} name={`disabled-${id}`} disabled defaultValue="12" />
    </div>
  )
}

/** Right to left, in English: the circles are at the right, and the arrow keys are mirrored. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <GroupStates locale="en" />,
}

/** Checked, invalid and disabled circles stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <GroupStates locale={localeOf(globals)} />,
}
