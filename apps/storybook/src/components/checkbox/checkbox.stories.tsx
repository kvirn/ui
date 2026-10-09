import { Card, Checkbox, Field } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/checkbox/checkbox.a11y.md?raw'
import guide from '../../../../../packages/react/src/checkbox/checkbox.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ControlledDeclaration,
  DeclarationForm,
  KeyboardForm,
  SelectAllCheckbox,
} from './checkbox.fixture.tsx'

// Components/Form/Checkbox: the native <input type="checkbox">, styled by
// @kvirn-ui/theme/theme.css (design spec docs/design/form-fields.md §6.5). It sits
// directly in a Field, before the label, which makes the whole row the click target.
//
// KvirnUI holds no form state. An uncontrolled Checkbox keeps its state in
// the browser and a form submit sends it (PlainForm). A controlled Checkbox shows the `checked`
// you give it and reports changes through `onCheckedChange` (Controlled): here the state lives
// in the story's `useState`, where your form library's state would live. Nothing here
// validates: an invalid story sets `invalid` itself.

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
    value: {
      control: 'text',
      description:
        'What a form submit sends when checked, and the item’s value inside a CheckboxGroup (required there).',
    },
    name: {
      control: 'text',
      description:
        'The `name` a form submit uses. Inside a CheckboxGroup, the group’s `name` is the default.',
    },
    onCheckedChange: {
      control: false,
      description:
        "Reports each change with the new checked state and `{ reason: 'input', event }`. `onChange` still works too.",
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`.',
    },
  },
  // Every option at its default, so the main example starts where an adopter starts.
  args: { name: 'declaration', indeterminate: false, disabled: false },
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
        <Checkbox {...args} />
        <Field.Label>{text.declaration}</Field.Label>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: an unchecked box, 24px, with the whole 44px row as the click target. */
export const Default: Story = {
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
  parameters: showSource('checkbox/checkbox.fixture.tsx', 'SelectAllCheckbox'),
  render: (_args, { globals }) => <SelectAllCheckbox locale={localeOf(globals)} />,
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

/** An option's help text is in the checkbox's description. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Checkbox {...args} name="newsletter" />
        <Field.Label>{text.newsletter}</Field.Label>
        <Field.HelpText>{text.newsletterHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('checkbox', { name: new RegExp(`^${text.newsletter}`) }),
    ).toHaveAccessibleDescription(text.newsletterHint)
  },
}

/**
 * Without a visible label of its own, such as a row selector where the row's text is the label: a
 * Checkbox outside a Field names itself with `aria-label`, and the name repeats the text beside it
 * (2.5.3). It has no Field wiring, so no description and no invalid state. Wherever a person has
 * to read a question, use a Field with a `Field.Label`.
 */
export const Standalone: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <p>
          <Checkbox name="row-1" aria-label={text.rowOne} /> {text.rowOne}
        </p>
        <p>
          <Checkbox name="row-2" aria-label={text.rowTwo} defaultChecked /> {text.rowTwo}
        </p>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const first = canvas.getByRole('checkbox', { name: text.rowOne })
    await expect(first).not.toBeChecked()
    await expect(first).not.toHaveAttribute('aria-describedby')
    await expect(canvas.getByRole('checkbox', { name: text.rowTwo })).toBeChecked()
    await expectMinimumTargetSize(first)
    await userEvent.click(first)
    await expect(first).toBeChecked()
  },
}

/** The declaration is required: a 2px edge and the message under the row. */
export const Invalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Checkbox {...args} />
        <Field.Label>{text.declaration}</Field.Label>
        <Field.HelpText>{text.declarationHint}</Field.HelpText>
        <Field.ErrorMessage>{text.declarationError}</Field.ErrorMessage>
      </Field.Root>
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
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Checkbox {...args} name="consent" />
        <Field.Label>{text.longLabel}</Field.Label>
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through each checkbox (the disabled one is skipped), Space toggles the focused
 * one and checks the mixed one, and Enter does nothing to a checkbox.
 */
export const Keyboard: Story = {
  parameters: showSource('checkbox/checkbox.fixture.tsx', 'KeyboardForm'),
  render: (_args, { globals }) => <KeyboardForm locale={localeOf(globals)} />,
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React Hook
 * Form or your own reducer: Checkbox renders the `checked` it's given and calls
 * `onCheckedChange(checked, { reason: 'input', event })`. It never copies the state of its own.
 */
export const Controlled: Story = {
  parameters: showSource('checkbox/checkbox.fixture.tsx', 'ControlledDeclaration'),
  render: (_args, { globals }) => <ControlledDeclaration locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const checkbox = canvas.getByRole('checkbox', { name: text.declaration })
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: true`)
  },
}

/**
 * A plain `<form>`: no `checked` and no handlers. The Checkbox is uncontrolled, the browser
 * keeps its state, and the form's `FormData` has it by `name` and `value` on submit.
 */
export const PlainForm: Story = {
  parameters: showSource('checkbox/checkbox.fixture.tsx', 'DeclarationForm'),
  render: (_args, { globals }) => <DeclarationForm locale={localeOf(globals)} />,
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
        <Field.Root required invalid>
          <Checkbox name="declaration" />
          <Field.Label>{text.declaration}</Field.Label>
          <Field.ErrorMessage>{text.declarationError}</Field.ErrorMessage>
        </Field.Root>
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
        <Field.Root required>
          <Checkbox name="declaration" defaultChecked />
          <Field.Label>{text.declaration}</Field.Label>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('checkbox', { name: text.declaration }))
  },
}

// Every state in one column. The RTL and ForcedColors stories render it, so a reader of either
// sees the real parts.
const renderCheckboxStates: NonNullable<Story['render']> = (_args, { globals }) => {
  const { text, lang } = choiceTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Checkbox name="unchecked" />
        <Field.Label>{text.declaration}</Field.Label>
      </Field.Root>
      <Field.Root required>
        <Checkbox name="checked" defaultChecked />
        <Field.Label>{text.newsletter}</Field.Label>
      </Field.Root>
      <Field.Root required>
        <Checkbox name="indeterminate" indeterminate />
        <Field.Label>{text.selectAll}</Field.Label>
      </Field.Root>
      <Field.Root required invalid>
        <Checkbox name="invalid" />
        <Field.Label>{text.longLabel}</Field.Label>
        <Field.ErrorMessage>{text.declarationError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required disabled>
        <Checkbox name="disabled" />
        <Field.Label>{text.rowOne}</Field.Label>
      </Field.Root>
      <Field.Root required disabled>
        <Checkbox name="disabled-checked" defaultChecked />
        <Field.Label>{text.rowTwo}</Field.Label>
      </Field.Root>
    </div>
  )
}

/** Right to left, in English: the box is at the right, and the tick doesn't mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderCheckboxStates,
}

/** Checked, indeterminate, invalid and disabled stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderCheckboxStates,
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
