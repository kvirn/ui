import { OneTimeCode } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/one-time-code/one-time-code.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { logChange } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import { OneTimeCodeField, oneTimeCodeTextsFor } from './one-time-code.fixture.tsx'

// Components/Form/OneTimeCode: a code from a text message, an email or an authenticator app,
// shown as a row of boxes over ONE native input (Plan 0014, Plan 0019, ADR-0033, ADR-0045, design
// spec docs/design/one-time-code.md). A `pattern` shapes it: one box per character symbol and a
// drawn dash for each `-`. The input takes the typing, paste, SMS autofill, dictation and the
// screen reader. The boxes and dashes only draw its value, caret and selection, are hidden from
// assistive technology, and take no pointer events. Where they can't be drawn safely (forced
// colours, a narrow column, large text, before the script runs) the theme shows the plain
// input instead: the same element, so its value and focus stay. Nothing moves focus and nothing
// submits on its own (3.2.2).
//
// KvirnUI holds no form state (ADR-0029, item 0). Nothing here checks the code: an invalid story
// sets `invalid` and writes the message itself. one-time-code.e2e.ts runs the keys, the pointer,
// the fallback, RTL, forced colours, reflow, the pattern limits and text spacing.

const meta = {
  title: 'Components/Form/OneTimeCode',
  component: OneTimeCode.Root,
  globals: { locale: 'sv' },
  argTypes: {
    pattern: {
      control: 'text',
      description:
        'The shape of the code, one symbol per position: `9` digit, `*` letter or digit, `a` letter, `A` capital letter, `&` capital letter or digit (lower case typed becomes a capital), `-` a separator between two of them, drawn as its own cell and kept in the value. ASCII only. Default `999999`. An invalid pattern throws a `RangeError`.',
    },
    value: { control: false },
    defaultValue: { control: 'text', description: 'Uncontrolled: the input keeps the value.' },
    disabled: { control: 'boolean' },
    announceRejections: {
      control: 'boolean',
      description: 'Announce when the mask drops a character. Default true; needs KvirnProvider.',
    },
    messages: { control: false },
    onValueChange: { control: false },
    onComplete: { action: 'onComplete', description: 'Never submits and never moves focus.' },
    render: { control: false },
  },
  // Not `action`: it serializes the React event in the second argument on every keystroke, which
  // lags the canvas (see logChange).
  args: { onValueChange: logChange('onValueChange') },
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

/** The boxes of the field in the canvas: a drawing, one per character of the pattern. */
const slotsOf = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('.kv-one-time-code-slot'),
]

/** Every cell of the pattern in order, boxes and separators: one per position of the pattern. */
const cellsOf = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>(
    '.kv-one-time-code-slot, .kv-one-time-code-separator',
  ),
]

/** The positions of the separators among the cells. */
const separatorIndexes = (canvasElement: HTMLElement) =>
  cellsOf(canvasElement).flatMap((cell, index) =>
    cell.classList.contains('kv-one-time-code-separator') ? [index] : [],
  )

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
    await expect(separatorIndexes(canvasElement)).toEqual([])
    for (const slot of cellsOf(canvasElement)) {
      await expect(slot).toHaveAttribute('aria-hidden', 'true')
    }
    // The pattern's counts, for the theme (always rendered).
    const root = canvasElement.querySelector('.kv-one-time-code')
    await expect(root).toHaveAttribute('data-character-count', '6')
    await expect(root).toHaveAttribute('data-separator-count', '0')
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
 * Eight capital letters and digits, in two groups of 4 with a dash between, the way the email
 * shows them (`&&&&-&&&&`): `K7QX-2M9P`. The value includes the dash, and a pasted code with or
 * without it ends the same. Capitals on a phone keyboard (a typed lower case becomes a capital),
 * and Plex's dotted zero in the boxes. At 320px the eight boxes and the dash don't fit at 32px,
 * so the plain input shows, as wide as the pattern.
 */
export const TwoGroups: Story = {
  args: { pattern: '&&&&-&&&&', defaultValue: 'K7QX-2M9P' },
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} kind="email" {...args} />
  ),
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.emailLabel })
    await expect(input).toHaveValue('K7QX-2M9P')
    await expect(input).toHaveAttribute('autocapitalize', 'characters')
    await expect(input).not.toHaveAttribute('inputmode')
    await expect(input).toHaveAccessibleDescription(texts.emailGroupsHint(8, 2, 4))
    // Eight boxes and one separator at the fifth position, all hidden from assistive technology.
    await expect(cellsOf(canvasElement)).toHaveLength(9)
    await expect(slotsOf(canvasElement)).toHaveLength(8)
    await expect(separatorIndexes(canvasElement)).toEqual([4])
    for (const cell of cellsOf(canvasElement)) {
      await expect(cell).toHaveAttribute('aria-hidden', 'true')
    }
    const root = canvasElement.querySelector('.kv-one-time-code')
    await expect(root).toHaveAttribute('data-character-count', '8')
    await expect(root).toHaveAttribute('data-separator-count', '1')
  },
}

/**
 * Nine capital letters and digits in three groups of 3 (`&&&-&&&-&&&`), partly filled: the second
 * dash is drawn before the empty boxes after it. The theme draws up to 10 characters and 2
 * dashes, so this is the widest pattern with boxes. At 320px the plain input shows.
 */
export const ThreeGroups: Story = {
  args: { pattern: '&&&-&&&-&&&', defaultValue: 'H4T-K92' },
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} kind="email" {...args} />
  ),
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.emailLabel })
    await expect(input).toHaveValue('H4T-K92')
    await expect(input).toHaveAccessibleDescription(texts.emailGroupsHint(9, 3, 3))
    await expect(cellsOf(canvasElement)).toHaveLength(11)
    await expect(separatorIndexes(canvasElement)).toEqual([3, 7])
    const root = canvasElement.querySelector('.kv-one-time-code')
    await expect(root).toHaveAttribute('data-character-count', '9')
    await expect(root).toHaveAttribute('data-separator-count', '2')
  },
}

/**
 * Two capital letters, a dash and four digits (`AA-9999`): `HT-4829`. Lower case typed in the
 * letters becomes a capital, and the digits refuse letters. The hint says "2 letters and then 4
 * digits". Boxes draw at 320px in the page column. Plex's dotted zero tells 0 from O.
 */
export const LetterPrefix: Story = {
  args: { pattern: 'AA-9999', defaultValue: 'HT-4829' },
  play: async ({ canvas, canvasElement, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: texts.smsLabel })
    await expect(input).toHaveValue('HT-4829')
    await expect(input).toHaveAttribute('autocapitalize', 'characters')
    await expect(input).not.toHaveAttribute('inputmode')
    await expect(input).toHaveAccessibleDescription(texts.smsPrefixHint(2, 4))
    await expect(cellsOf(canvasElement)).toHaveLength(7)
    await expect(separatorIndexes(canvasElement)).toEqual([2])
  },
}

/** The patterns the theme draws (4 to 10 characters, 0 to 2 dashes) and the ones it doesn't. */
const drawnPatterns = ['AAAA', 'AAAAAAAAAA', 'AAA-AAA-AAA'] as const
const plainPatterns = ['AAA', 'AAAAAAAAAAA', 'AA-AA-AA-AA'] as const

/**
 * The limits of the drawing. The first three patterns are at the limit and get boxes; the last
 * three have 3 characters, 11 characters and 3 dashes, so the theme shows the plain input for
 * them, as wide as the pattern. Every one is the same field underneath.
 */
export const PatternLimits: Story = {
  render: (args, { globals }) => (
    <div className="kv-story-form">
      {[...drawnPatterns, ...plainPatterns].map((pattern) => (
        <OneTimeCodeField
          key={pattern}
          locale={localeOf(globals)}
          kind="letters"
          name={pattern}
          {...args}
          pattern={pattern}
        />
      ))}
    </div>
  ),
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
 * boxes and the dash read left to right (`HT-4829`: the letters on the left, then the dash, then
 * the digits), at the start (the right) of the column.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { pattern: 'AA-9999', defaultValue: 'HT-4829' },
  play: async ({ canvas }) => {
    const texts = oneTimeCodeTextsFor('en')
    const input = canvas.getByRole('textbox', { name: texts.smsLabel })
    await expect(input).toHaveAttribute('dir', 'ltr')
    await expect(input).toHaveValue('HT-4829')
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
        pattern="&&&&-&&&&"
        name="invalid"
        invalid
        defaultValue="K7QX-2M9P"
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
 * dashed edge when disabled, and the boxes and dashes hidden. The dash is part of the value, so
 * the invalid `K7QX-2M9P` field shows it as text. This story only marks it
 * (`data-forced-colors`): the `chromium-forced-colors` e2e project asserts the fallback.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <ForcedColorsStates locale={localeOf(globals)} />,
}

/**
 * The fixture the keyboard tests drive: an empty code in two groups of 4 (`****-****`), then a
 * Continue button, in a form that does nothing on submit. Try the keys in the Keyboard section
 * above: Tab into the field and out to Continue, type across the dash, type the dash yourself,
 * paste with and without it, Backspace and Delete over it, the arrows, Shift+arrows, Control+A
 * and Enter. No key moves focus between boxes, and the last character submits nothing.
 */
export const Keyboard: Story = {
  args: { pattern: '****-****' },
  render: (args, { globals }) => (
    <OneTimeCodeField locale={localeOf(globals)} kind="email" withSubmit {...args} />
  ),
  play: async ({ canvas, globals }) => {
    const texts = oneTimeCodeTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: texts.emailLabel })).toHaveValue('')
    await expect(canvas.getByRole('button', { name: texts.submit })).toBeVisible()
  },
}
