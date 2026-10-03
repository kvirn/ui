import { Button, Card, Checkbox, ErrorMessage, Field, Label, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/checkbox/checkbox.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Checkbox: the native <input type="checkbox">, styled by
// @kvirn-ui/theme/theme.css (design spec docs/design/form-fields.md §6.5). It sits
// directly in a Field, before the label, which makes the whole row the click target.
//
// KvirnUI holds no form state. An uncontrolled Checkbox keeps its state in
// the browser and a form submit sends it (PlainForm). A controlled Checkbox shows the `checked`
// you give it and reports changes through `onCheckedChange` (Controlled): here the state lives
// in the story's `useState`, where your form library's state would live. Nothing here
// validates: an invalid story sets `invalid` itself. checkbox.e2e.ts runs the keyboard rows,
// the click target, forced colours and reflow checks.

const meta = {
  title: 'Components/Form/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean', description: 'Controlled: the state from your form logic.' },
    defaultChecked: {
      control: 'boolean',
      description: 'Uncontrolled: the browser keeps the state, and a form submit sends it.',
    },
    indeterminate: {
      control: 'boolean',
      description: 'The mixed state, set as the DOM property after render.',
    },
    value: { control: 'text' },
    onCheckedChange: { control: false },
    disabled: { control: 'boolean' },
    render: { control: false },
  },
  args: { onCheckedChange: logChange('onCheckedChange') },
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
      <Field required lang={lang}>
        <Checkbox name="declaration" {...args} />
        <Label>{text.declaration}</Label>
      </Field>
    )
  },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

/** An unchecked box: 24px, with the whole 44px row as the click target. */
export const Unchecked: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await expect(checkbox).toHaveAttribute('type', 'checkbox')
    await expect(checkbox).not.toBeChecked()
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    await expectMinimumTargetSize(checkbox)
  },
}

/** Checked: a primary fill with a drawn tick. Unchecked and checked differ in shape. */
export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toHaveAttribute('data-state', 'checked')
  },
}

/** A staff "select all rows" box, mixed while some rows are chosen. It's a DOM property. */
export const Indeterminate: Story = {
  render: (_args, { globals }) => <SelectAllExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.selectAll })
    await expect((checkbox as HTMLInputElement).indeterminate).toBe(true)
    await expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await expect((checkbox as HTMLInputElement).indeterminate).toBe(false)
  },
}

/** An option's hint is in the checkbox's description. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field lang={lang}>
        <Checkbox name="newsletter" {...args} />
        <Label>{text.newsletter}</Label>
        <Prose>
          <p>{text.newsletterHint}</p>
        </Prose>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('checkbox', { name: new RegExp(`^${text.newsletter}`) }),
    ).toHaveAccessibleDescription(text.newsletterHint)
  },
}

/** The declaration is required: a 2px edge and the message under the row. */
export const Invalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required invalid lang={lang}>
        <Checkbox name="declaration" {...args} />
        <Label>{text.declaration}</Label>
        <Prose>
          <p>{text.declarationHint}</p>
        </Prose>
        <ErrorMessage>{text.declarationError}</ErrorMessage>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    await expect(checkbox).toHaveAttribute('aria-required', 'true')
    await expect(checkbox).toHaveAttribute('data-invalid')
  },
}

/** Disabled: a dashed edge on the surface colour, and the label is muted. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('checkbox', { name: text.declaration })).toBeDisabled()
  },
}

/** Disabled and checked: a solid muted box with the tick in the canvas colour. */
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await expect(checkbox).toBeDisabled()
    await expect(checkbox).toBeChecked()
  },
}

/** A long label wraps over lines, and the box stays beside the first line. */
export const LongLabel: Story = {
  globals: { locale: 'fi' },
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field required lang={lang}>
          <Checkbox name="consent" {...args} />
          <Label>{text.longLabel}</Label>
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** The fixture the keyboard tests drive: four checkboxes in a form. Try the keys in the table. */
function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Field>
        <Checkbox name="newsletter" />
        <Label marker="none">{text.newsletter}</Label>
      </Field>
      <SelectAllExample locale={locale} />
      <Field disabled>
        <Checkbox name="disabled" />
        <Label marker="none">{text.rowOne}</Label>
      </Field>
      <Field required>
        <Checkbox name="declaration" />
        <Label>{text.declaration}</Label>
      </Field>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through each checkbox (the disabled one is skipped), Space toggles the focused
 * one and checks the mixed one, and Enter does nothing to a checkbox.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

/** A "select all" box: mixed while some rows are chosen, checked once the user chooses it. */
function SelectAllExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [state, setState] = useState<'some' | 'all' | 'none'>('some')
  return (
    <Field lang={lang}>
      <Checkbox
        name="all"
        checked={state === 'all'}
        indeterminate={state === 'some'}
        onCheckedChange={(checked) => setState(checked ? 'all' : 'none')}
      />
      <Label marker="none">{text.selectAll}</Label>
    </Field>
  )
}

/** Controlled: the state lives in this story's `useState`, and Checkbox reports changes up. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [checked, setChecked] = useState(false)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Checkbox name="declaration" checked={checked} onCheckedChange={setChecked} />
        <Label>{text.declaration}</Label>
      </Field>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {String(checked)}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: Checkbox renders the `checked` it's given and calls
 * `onCheckedChange(checked, { reason: 'input', event })`. It never copies the state of its own.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: true`)
  },
}

/** A form's text field value, `''` when the field is missing. */
const fieldText = (data: FormData, name: string): string => {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

/** An uncontrolled form: the browser keeps the state, and the submit reads it. */
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
        const data = new FormData(event.currentTarget)
        setSent(fieldText(data, 'declaration') === '' ? '–' : fieldText(data, 'declaration'))
      }}
    >
      <Field required>
        <Checkbox name="declaration" value="intygat" />
        <Label>{text.declaration}</Label>
      </Field>
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
 * A plain `<form>`: no `checked` and no handlers. The Checkbox is uncontrolled, the browser
 * keeps its state, and the form's `FormData` has it by `name` and `value` on submit.
 */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('checkbox', { name: text.declaration }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: intygat`)
  },
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11). */
export const OnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field required invalid>
          <Checkbox name="declaration" />
          <Label>{text.declaration}</Label>
          <ErrorMessage>{text.declarationError}</ErrorMessage>
        </Field>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(canvas.getByRole('checkbox', { name: text.declaration })).toBeVisible()
  },
}

/** Staff density from 64rem: the row is 32px high, and the box is still 24px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field required>
          <Checkbox name="declaration" defaultChecked />
          <Label>{text.declaration}</Label>
        </Field>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('checkbox', { name: text.declaration }))
  },
}

/** Every state in one column, for the RTL and forced-colours stories. */
function CheckboxStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Checkbox name="unchecked" />
        <Label>{text.declaration}</Label>
      </Field>
      <Field required>
        <Checkbox name="checked" defaultChecked />
        <Label>{text.newsletter}</Label>
      </Field>
      <Field required>
        <Checkbox name="indeterminate" indeterminate />
        <Label>{text.selectAll}</Label>
      </Field>
      <Field required invalid>
        <Checkbox name="invalid" />
        <Label>{text.longLabel}</Label>
        <ErrorMessage>{text.declarationError}</ErrorMessage>
      </Field>
      <Field required disabled>
        <Checkbox name="disabled" />
        <Label>{text.rowOne}</Label>
      </Field>
      <Field required disabled>
        <Checkbox name="disabled-checked" defaultChecked />
        <Label>{text.rowTwo}</Label>
      </Field>
    </div>
  )
}

/** Right to left, in English: the box is at the right, and the tick doesn't mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <CheckboxStates locale="en" />,
}

/** Checked, indeterminate, invalid and disabled stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <CheckboxStates locale={localeOf(globals)} />,
}

/** A change reaches `onCheckedChange` with the new state and the reason. */
export const Reports: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ canvas, args, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await userEvent.click(checkbox)
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'input' }),
    )
  },
}
