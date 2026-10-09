import { Card, Field, Switch } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/switch/switch.a11y.md?raw'
import guide from '../../../../../packages/react/src/switch/switch.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  KeyboardSettings,
  SavedAtOnceSetting,
  SettingsForm,
  switchTextsFor,
} from './switch.fixture.tsx'

// Components/Form/Switch: the native <input type="checkbox" role="switch">, styled by
// @kvirn-ui/theme/theme.css (design spec docs/design/switch.md). It sits directly in a Field,
// before the label, which makes the whole row the click target. Use it for a setting that takes
// effect at once; an answer sent with a form is a Checkbox.
//
// KvirnUI holds no form state. An uncontrolled Switch keeps its state in the browser and a form
// submit sends it (PlainForm). A controlled Switch shows the `checked` you give it and reports
// changes through `onCheckedChange` (Controlled). Nothing here validates or saves: an invalid
// story sets `invalid` itself.

const meta = {
  title: 'Components/Form/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean', description: 'Controlled: the state from your own logic.' },
    defaultChecked: {
      control: 'boolean',
      description: 'Uncontrolled: the browser keeps the state, and a form submit sends it.',
    },
    value: {
      control: 'text',
      description: 'What a form submit sends when the switch is on. Defaults to `on`.',
    },
    name: { control: 'text', description: 'The `name` a form submit uses.' },
    onCheckedChange: {
      control: false,
      description:
        "Reports each change with the new state and `{ reason: 'input', event }`. `onChange` still works too.",
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`.',
    },
  },
  args: { name: 'sms', disabled: false },
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
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Switch {...args} />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: an off switch, a 44 by 24px track, with the whole 44px row as the click target. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    const control = canvas.getByRole('switch', { name: text.smsReminders })
    await expect(control).toHaveAttribute('type', 'checkbox')
    await expect(control).not.toBeChecked()
    await expect(control).not.toHaveAttribute('aria-checked')
    await expect(control).toHaveAttribute('data-state', 'unchecked')
    await expectMinimumTargetSize(control)
  },
}

/** On: a primary track, the thumb at the end and a tick. Off and on differ in position and shape. */
export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    const control = canvas.getByRole('switch', { name: text.smsReminders })
    await expect(control).toBeChecked()
    await expect(control).toHaveAttribute('data-state', 'checked')
  },
}

/** The help text says what happens when the switch is on. It is the switch's description. */
export const WithDescription: Story = {
  render: (args, { globals }) => {
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Switch {...args} />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
        <Field.HelpText>{text.smsRemindersHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await expect(
      canvas.getByRole('switch', { name: new RegExp(`^${text.smsReminders}`) }),
    ).toHaveAccessibleDescription(text.smsRemindersHint)
  },
}

/** A setting that failed to save: a 2px edge and the message under the row. */
export const Invalid: Story = {
  render: (args, { globals }) => {
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Field.Root invalid lang={lang}>
        <Switch {...args} />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
        <Field.ErrorMessage>{text.saveFailed}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    const control = canvas.getByRole('switch', { name: text.smsReminders })
    await expect(control).toHaveAttribute('aria-invalid', 'true')
    await expect(control).toHaveAttribute('data-invalid')
    await expect(control).not.toHaveAttribute('aria-required')
  },
}

/** Disabled: a dashed edge on the surface colour. The help text says why, never a tooltip. */
export const Disabled: Story = {
  render: (args, { globals }) => {
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Switch {...args} disabled />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
        <Field.HelpText>{text.noMobileHint}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await expect(canvas.getByRole('switch', { name: text.smsReminders })).toBeDisabled()
  },
}

/** Disabled and on: a solid muted track with the thumb in the canvas colour. */
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    const control = canvas.getByRole('switch', { name: text.smsReminders })
    await expect(control).toBeDisabled()
    await expect(control).toBeChecked()
  },
}

/** A long label wraps over lines, and the track stays beside the first line. */
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
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Switch {...args} name="reminders" />
        <Field.Label marker="none">{text.longLabel}</Field.Label>
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * The fixture the keyboard tests drive. Try the keys in the Keyboard section above: Tab and
 * Shift+Tab move through each switch (the disabled one is skipped), Space toggles the focused
 * one, and Enter does nothing to a switch.
 */
export const Keyboard: Story = {
  parameters: showSource('switch/switch.fixture.tsx', 'KeyboardSettings'),
  render: (_args, { globals }) => <KeyboardSettings locale={localeOf(globals)} />,
}

/**
 * A setting that saves at once. This story's `useState` and the always-mounted `<output>` stand
 * in for your save call and its status line: Switch renders the `checked` it's given and calls
 * `onCheckedChange(checked, { reason: 'input', event })`. It never copies the state of its own.
 */
export const Controlled: Story = {
  parameters: showSource('switch/switch.fixture.tsx', 'SavedAtOnceSetting'),
  render: (_args, { globals }) => <SavedAtOnceSetting locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    const control = canvas.getByRole('switch', { name: new RegExp(`^${text.smsReminders}`) })
    await expect(canvas.getByTestId('status')).toBeEmptyDOMElement()
    await userEvent.click(control)
    await expect(control).toBeChecked()
    await expect(canvas.getByTestId('status')).toHaveTextContent(text.statusOn)
    await userEvent.click(control)
    await expect(canvas.getByTestId('status')).toHaveTextContent(text.statusOff)
  },
}

/**
 * A plain `<form>`: no `checked` and no handlers. The Switch is uncontrolled, the browser keeps
 * its state, and the form's `FormData` has it by `name` and `value` when it is on.
 */
export const PlainForm: Story = {
  parameters: showSource('switch/switch.fixture.tsx', 'SettingsForm'),
  render: (_args, { globals }) => <SettingsForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('switch', { name: text.smsReminders }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: sms`)
  },
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11). */
export const OnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field.Root>
          <Switch name="off" />
          <Field.Label marker="none">{text.smsReminders}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch name="on" defaultChecked />
          <Field.Label marker="none">{text.emailDecisions}</Field.Label>
        </Field.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await expect(canvas.getByRole('switch', { name: text.smsReminders })).toBeVisible()
    await expect(canvas.getByRole('switch', { name: text.emailDecisions })).toBeChecked()
  },
}

/** Staff density from 64rem: the row is 32px high, and the track is still 24px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = switchTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root>
          <Switch name="sms" defaultChecked />
          <Field.Label marker="none">{text.smsReminders}</Field.Label>
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('switch', { name: text.smsReminders }))
  },
}

// Every state in one column. The RTL and ForcedColors stories render it, so a reader of either
// sees the real parts.
const renderSwitchStates: NonNullable<Story['render']> = (_args, { globals }) => {
  const { text, lang } = switchTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Switch name="off" />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Switch name="on" defaultChecked />
        <Field.Label marker="none">{text.emailDecisions}</Field.Label>
      </Field.Root>
      <Field.Root invalid>
        <Switch name="invalid" />
        <Field.Label marker="none">{text.longLabel}</Field.Label>
        <Field.ErrorMessage>{text.saveFailed}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root disabled>
        <Switch name="disabled" />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
        <Field.HelpText>{text.noMobileHint}</Field.HelpText>
      </Field.Root>
      <Field.Root disabled>
        <Switch name="disabled-on" defaultChecked />
        <Field.Label marker="none">{text.emailDecisions}</Field.Label>
      </Field.Root>
    </div>
  )
}

/** Right to left, in English: the track is at the right, the thumb moves right to left, the tick doesn't mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderSwitchStates,
}

/** On, off, invalid and disabled stay distinguishable in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderSwitchStates,
}

/** A change reaches `onCheckedChange` with the new state and the reason. */
export const Reports: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ canvas, args, globals }) => {
    const { text } = switchTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('switch', { name: text.smsReminders }))
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'input' }),
    )
  },
}
