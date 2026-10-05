import { Field, Textarea } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/textarea/textarea.a11y.md?raw'
import guide from '../../../../../packages/react/src/textarea/textarea.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ControlledSituation,
  CountedSituation,
  CountStates,
  SituationForm,
  TextareaStates,
  textareaTextsFor,
} from './textarea.fixture.tsx'

// Components/Form/Textarea: the native multi-line <textarea>, styled by @kvirn-ui/theme/theme.css
// like the TextInput (design spec docs/design/rich-text-editor.md §6.2 and §6.3). It lives in a
// Field, which gives it its name, description, help text and error. With `characterCount` and
// `maxLength` a count of the characters left follows it: the limit is not written as the native
// `maxlength`, so a pasted text is kept whole. KvirnUI holds no form state: an uncontrolled
// Textarea keeps its value in the browser and a form submit sends it (Keyboard), and a controlled
// one shows the `value` you give it and reports changes through `onValueChange` (Controlled).
// Nothing here validates: an invalid story sets `invalid` itself.

const meta = {
  title: 'Components/Form/Textarea',
  component: Textarea,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    name: 'situation',
    rows: 5,
    characterCount: false,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
  },
  // Every prop in textarea.tsx and use-textarea.ts. Any other native `<textarea>` prop passes through.
  argTypes: {
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
        'Called with the new value and `{ reason: "input", event }` on every change. With `characterCount` the details also have `length`, `limit` and `isOverLimit`. It only reports: the value lives in your form state.',
    },
    onChange: {
      control: false,
      description: 'The native change handler. It still works next to `onValueChange`.',
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description:
        'The height in lines, and the minimum where the theme lets the box grow with its text. Default 5.',
    },
    maxLength: {
      control: { type: 'number', min: 1 },
      description:
        'The most characters. With `characterCount` it is the count’s limit and is **not** written as the native `maxlength`, so a paste is never cut. Without it, it is the native attribute.',
    },
    characterCount: {
      control: 'boolean',
      description:
        'Shows how many characters are left under the box, with `maxLength` as the limit. Announced politely from 80% of the limit and when it is crossed. Over the limit is a warning (`data-over`), never an error. Without `maxLength` it warns and renders nothing.',
    },
    countCharacters: {
      control: false,
      description:
        'With `characterCount`: your own counting, `(value) => number`, such as your server’s. Default: the characters the user sees (`å` and an emoji are one). Count the same way on both sides.',
    },
    messages: {
      control: 'object',
      description:
        'With `characterCount`: per-instance overrides for the count (`characterCount.limit`, `remaining` and `over`).',
    },
    name: {
      control: 'text',
      description: 'The field’s name in a form submit.',
    },
    autoComplete: {
      control: 'text',
      description:
        'The autofill token, where one exists for the question (1.3.5). A long free-text answer usually has none.',
    },
    spellCheck: {
      control: 'boolean',
      description: 'Native spell checking. On by default in a text box.',
    },
    placeholder: {
      control: 'text',
      description: 'Native placeholder. Never the label (3.3.2): put examples in the description.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Natively disabled: skipped by Tab, not resizable. A disabled Field disables it too. Sets `data-disabled`.',
    },
    readOnly: {
      control: 'boolean',
      description: 'Native `readOnly`: focusable and read by screen readers, but not editable.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-textarea`. The theme has no width class: the box is the full width of its field.',
    },
    id: {
      control: false,
      description:
        'Ignored inside a Field (a dev warning says so): set `controlId` on `Field.Root`. Outside a Field it is the box’s id.',
    },
    'aria-describedby': {
      control: 'text',
      description:
        'Your own description ids. They are kept, after the Field’s description, count, help text and error.',
    },
    ref: { control: false, description: 'A ref to the `<textarea>`.' },
    render: {
      control: false,
      description: 'Another element. It must still be a `<textarea>`. Spread the props it gets.',
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
    const { text, lang } = textareaTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <Textarea {...args} />
        <Field.HelpText>{text.hint}</Field.HelpText>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a textarea in a Field, with a description above and a help text under it, and
 * every option as a control. Try `rows`, `maxLength` with `characterCount`, `disabled` and
 * `readOnly`.
 */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await expect(box).toHaveAttribute('rows', '5')
    await expect(box).toHaveAccessibleDescription(`${text.description} ${text.hint}`)
    await expectMinimumTargetSize(box)
  },
}

/**
 * The fixture the keyboard tests drive: a textarea and a submit button in a plain form. Try the
 * keys in the Keyboard section above: Tab and Shift+Tab (Tab never types a tab), Enter (a line
 * break, never a submit), the arrow keys, Home, End, Page Up and Page Down in the text, Control
 * or Command with A, and Escape (nothing happens).
 */
export const Keyboard: Story = {
  parameters: showSource('textarea/textarea.fixture.tsx', 'SituationForm'),
  render: (_args, { globals }) => <SituationForm locale={localeOf(globals)} />,
}

/** Typing reaches `onValueChange` with the new value, and the box shows it. */
export const Typing: Story = {
  play: async ({ canvas, args, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await userEvent.type(box, 'Hej')
    await expect(box).toHaveValue('Hej')
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'Hej',
      expect.objectContaining({ reason: 'input' }),
    )
  },
}

/** Invalid: a 2px edge and the message under the box, and the text stays where it was. */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textareaTextsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <Textarea name="situation" />
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await expect(box).toHaveAttribute('aria-invalid', 'true')
    await expect(box).toHaveAttribute('data-invalid')
  },
}

/** Disabled: a dashed edge on the surface colour, and no resize handle. Say why on submit instead, where you can. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Jag har fått ett brev om mitt bostadsbidrag.' },
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.label })).toBeDisabled()
  },
}

/** Read-only is for staff tools: a solid edge on the surface colour, and still focusable. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Jag har fått ett brev om mitt bostadsbidrag.' },
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await expect(box).toHaveAttribute('readonly')
    box.focus()
    await expect(box).toHaveFocus()
  },
}

/**
 * Controlled by your form state. This story's `useState` stands in for TanStack Form, React
 * Hook Form or your own reducer: Textarea renders the `value` it's given and calls
 * `onValueChange(value, { reason: 'input', event })`. It never copies the value into state of
 * its own.
 */
export const Controlled: Story = {
  parameters: showSource('textarea/textarea.fixture.tsx', 'ControlledSituation'),
  render: (_args, { globals }) => <ControlledSituation locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await userEvent.type(box, 'Hej')
    await expect(box).toHaveValue('Hej')
  },
}

/**
 * A count of the characters left: `characterCount` with `maxLength`. It sits under the box, is in
 * the box's description, and is announced politely from 80% of the limit when typing pauses, and
 * when the limit is crossed. The limit is not written as the native `maxlength`: paste a longer
 * text and it is kept whole, with the number of characters that are over. Over the limit is a
 * warning, and the form decides on submit.
 */
export const CharacterCount: Story = {
  parameters: showSource('textarea/textarea.fixture.tsx', 'CountedSituation'),
  render: (_args, { globals }) => <CountedSituation locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const box = canvas.getByRole('textbox', { name: text.label })
    await userEvent.type(box, 'Hej')
    // 3 of 200 typed: the count says 197 are left, in whichever language the toolbar says.
    await expect(box).toHaveAccessibleDescription(/197/)
    await expect(box).not.toHaveAttribute('maxlength')
  },
}

/**
 * The count under, near and over the limit. Near is from 80%. Over is a warning with an icon
 * and weight, never colour alone, and nothing is cut. The last one is invalid after a submit,
 * with an error that names the fix.
 */
export const CharacterCountStates: Story = {
  parameters: showSource('textarea/textarea.fixture.tsx', 'CountStates'),
  render: (_args, { globals }) => <CountStates locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textareaTextsFor(localeOf(globals))
    const under = canvas.getByRole('textbox', { name: new RegExp(`${text.label} \\(under\\)`) })
    const near = canvas.getByRole('textbox', { name: new RegExp(`${text.label} \\(near\\)`) })
    const over = canvas.getByRole('textbox', { name: new RegExp(`${text.label} \\(over\\)`) })
    await expect(under).not.toHaveAttribute('data-over')
    await expect(near).not.toHaveAttribute('data-over')
    await expect(over).toHaveAttribute('data-over')
    // Over the limit is a warning on the box, and the form's own error is what marks it invalid.
    await expect(over).toHaveAttribute('aria-invalid', 'true')
  },
}

/** The box is the full width of its field, in a narrow column and in the form column. */
export const Widths: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textareaTextsFor(localeOf(globals))
    return (
      <div className="kv-story-form" lang={lang}>
        <div className="kv-story-narrow">
          <Field.Root required>
            <Field.Label>{`${text.label} (20rem)`}</Field.Label>
            <Textarea name="narrow" rows={3} />
          </Field.Root>
        </div>
        <Field.Root required>
          <Field.Label>{`${text.label} (40rem)`}</Field.Label>
          <Textarea name="wide" rows={3} />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** A long Finnish label in a 320px column, with a count: the box fills it and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textareaTextsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow">
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <Textarea name="reasons" maxLength={500} characterCount />
          <Field.HelpText>{text.hint}</Field.HelpText>
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

/** Right to left, in English: the text starts at the right, and the edge and the count are the same. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('textarea/textarea.fixture.tsx', 'TextareaStates'),
  render: () => <TextareaStates locale="en" />,
}

/** Edges, the 2px invalid edge, dashed disabled, the ring and the over-limit icon survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('textarea/textarea.fixture.tsx', 'TextareaStates'),
  render: (_args, { globals }) => <TextareaStates locale={localeOf(globals)} />,
}
