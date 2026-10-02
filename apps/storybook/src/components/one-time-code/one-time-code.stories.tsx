import { OneTimeCode } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/one-time-code/one-time-code.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import { OneTimeCodeField, oneTimeCodeTextsFor } from './one-time-code.fixture.tsx'

// Components/Form/OneTimeCode: a code from a text message, an email or an authenticator app,
// shown as a row of boxes over ONE native input (Plan 0014, ADR-0033, design spec
// docs/design/one-time-code.md). The input takes the typing, paste, SMS autofill, dictation and
// the screen reader. The boxes only draw its value, caret and selection, are hidden from
// assistive technology, and take no pointer events. Where they can't be drawn safely (forced
// colours, a narrow column, large text, before the script runs) the theme shows the plain
// input instead: the same element, so its value and focus stay. Nothing moves focus and nothing
// submits on its own (3.2.2).
//
// KvirnUI holds no form state (ADR-0029, item 0). Nothing here checks the code: an invalid story
// sets `invalid` and writes the message itself. one-time-code.e2e.ts runs the keys, the pointer,
// the fallback, RTL, forced colours, reflow and text spacing.

const meta = {
  title: 'Components/Form/OneTimeCode',
  component: OneTimeCode.Root,
  globals: { locale: 'sv' },
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'How many characters the code has: one box each. The theme draws 4 to 8.',
    },
    characters: {
      control: 'inline-radio',
      options: ['digits', 'lettersAndDigits'],
      description: '`digits` (default) or `lettersAndDigits`.',
    },
    value: { control: false },
    defaultValue: { control: 'text', description: 'Uncontrolled: the input keeps the value.' },
    disabled: { control: 'boolean' },
    announceRejections: {
      control: 'boolean',
      description: 'Announce when the mask drops a character. Default true; needs KvirnProvider.',
    },
    messages: { control: false },
    onValueChange: { action: 'onValueChange' },
    onComplete: { action: 'onComplete', description: 'Never submits and never moves focus.' },
    render: { control: false },
  },
  parameters: { a11yContract: contract },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <OneTimeCodeField locale={localeOf(globals)} {...args} />,
} satisfies Meta<typeof OneTimeCode.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The slots of the field in the canvas, as the page's text: a drawing, one box per character. */
const slotsOf = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('.kv-one-time-code-slot'),
]

/**
 * An empty six-digit code from a text message. The label says where the code is, and the hint
 * above the boxes says how many digits it has: the boxes are hidden from screen readers. Press a
 * box, or Tab in, and type, paste "481 920", or accept the SMS suggestion: it's one field.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.smsLabel })
    await expect(input).toHaveAccessibleDescription(texts.smsHint(6))
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('dir', 'ltr')
    await expect(input).not.toHaveAttribute('maxlength')
    await expect(slotsOf(canvasElement)).toHaveLength(6)
    for (const slot of slotsOf(canvasElement)) {
      await expect(slot).toHaveAttribute('aria-hidden', 'true')
    }
    await expectMinimumTargetSize(input)
  },
}

/**
 * Three digits typed. The boxes show them, and the input has no focus: no box is active until it
 * does. Focus the field to see the active box with its caret.
 */
export const PartlyFilled: Story = {
  args: { defaultValue: '481' },
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: texts.smsLabel })).toHaveValue('481')
    await expect(
      slotsOf(canvasElement).filter((slot) => slot.hasAttribute('data-filled')),
    ).toHaveLength(3)
  },
}

/**
 * Complete: the root has `data-complete`, and nothing changes but the characters. Complete isn't
 * correct, so no tick and no green edge. `onComplete` is only a callback: nothing submits and
 * nothing moves.
 */
export const Complete: Story = {
  args: { defaultValue: '481920' },
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: texts.smsLabel })).toHaveValue('481920')
    await expect(canvasElement.querySelector('.kv-one-time-code')).toHaveAttribute('data-complete')
  },
}

/**
 * A wrong code: a 2px `danger` edge on every box, and the message under the row, never colour
 * alone. The code stays in the field, so the user can compare it with the message and fix one
 * digit.
 */
export const Invalid: Story = {
  args: { defaultValue: '481920' },
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} invalid withSubmit {...args} />
  ),
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.smsLabel })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription(
      new RegExp(`${texts.smsHint(6).slice(0, 12)}.*${texts.errorWrong.slice(0, 12)}`),
    )
    for (const slot of slotsOf(canvasElement)) {
      await expect(slot).toHaveAttribute('data-invalid')
    }
  },
}

/**
 * Disabled: a dashed edge on the surface colour. It isn't focusable. While a code is being
 * checked prefer `readOnly`: a disabled input loses focus, which lands on the body.
 */
export const Disabled: Story = {
  args: { defaultValue: '481920', disabled: true },
  play: async ({ canvas, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: texts.smsLabel })).toBeDisabled()
  },
}

/**
 * Eight letters and digits, grouped 4 and 4 the way the email groups them (`kv-one-time-code--
 * grouped`). Capitals on a phone keyboard, and Plex's dotted zero in the boxes. At 320px the
 * eight boxes don't fit at 32px, so the plain input shows instead.
 */
export const LettersAndDigits: Story = {
  args: { length: 8, defaultValue: 'K7QX2M9P' },
  render: (args, { globals }) => (
    <OneTimeCodeField
      locale={localeOf(globals)}
      kind="email"
      characters="lettersAndDigits"
      grouped
      {...args}
    />
  ),
  play: async ({ canvas, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.emailLabel })
    await expect(input).toHaveAttribute('autocapitalize', 'characters')
    await expect(input).not.toHaveAttribute('inputmode')
    await expect(input).toHaveAccessibleDescription(texts.emailHint(8))
  },
}

/** Staff density from 64rem: 32px boxes 4px apart, and the same 16px characters. */
export const Compact: Story = {
  args: { defaultValue: '481' },
  decorators: [
    (Story) => (
      <div className="kv-compact">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} kind="app" {...args} />
  ),
  play: async ({ canvas, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('textbox', { name: texts.appLabel }))
  },
}

/**
 * Right to left, in English: a code is an identifier, so the input stays left to right and the
 * boxes read left to right, at the start (the right) of the column.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { defaultValue: '481920' },
  play: async ({ canvas }) => {
    const texts = oneTimeCodeTextsFor('en')
    const input = canvas.getByRole('textbox', { name: texts.smsLabel })
    await expect(input).toHaveAttribute('dir', 'ltr')
  },
}

/** Every state in one column, with names that stay unique on the page. */
function ForcedColorsStates({ locale }: { locale: ReturnType<typeof localeOf> }) {
  return (
    <div className="kv-story-form">
      <OneTimeCodeField locale={locale} name="empty" />
      <OneTimeCodeField locale={locale} kind="app" name="partly" defaultValue="481" />
      <OneTimeCodeField
        locale={locale}
        kind="email"
        characters="lettersAndDigits"
        length={8}
        name="invalid"
        invalid
        defaultValue="K7QX2M9P"
      />
      <OneTimeCodeField
        locale={locale}
        kind="signIn"
        name="disabled"
        defaultValue="481920"
        disabled
      />
    </div>
  )
}

/**
 * In forced colours the theme shows the plain input: system colours, a 2px edge when invalid, a
 * dashed edge when disabled, and the boxes hidden. This story only marks it
 * (`data-forced-colors`): the `chromium-forced-colors` e2e project asserts the fallback.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <ForcedColorsStates locale={localeOf(globals)} />,
}

/**
 * The fixture the keyboard tests drive: an empty six-digit code, then a Continue button, in a
 * form that does nothing on submit. Try the keys in the Keyboard section above: Tab into the
 * field and out to Continue, type, paste, Backspace, the arrows, Shift+arrows, Control+A and
 * Enter. No key moves focus between boxes, and the last digit submits nothing.
 */
export const Keyboard: Story = {
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} withSubmit {...args} />
  ),
  play: async ({ canvas, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: texts.smsLabel })).toHaveValue('')
    await expect(canvas.getByRole('button', { name: texts.submit })).toBeVisible()
  },
}
