import { Field } from '@kvirn-ui/react'
import { RichTextEditor } from '@kvirn-ui/rich-text'
import contract from '../../../../../packages/rich-text/src/rich-text-editor.a11y.md?raw'
import guide from '../../../../../packages/rich-text/src/rich-text-editor.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  BidirectionalEditor,
  ControlledJsonEditor,
  CountedEditor,
  DisabledEditor,
  editorTextsFor,
  HighlightEditor,
  InvalidEditor,
  KeyboardEditor,
  LongContentEditor,
  PlainEditor,
  PostedEditor,
  ReadOnlyEditor,
  ResidentEditor,
} from './rich-text-editor.fixture.tsx'

// Components/Form/Rich text editor: a formatted-text field on Tiptap (design spec
// docs/design/rich-text-editor.md, Plan 0036), styled by @kvirn-ui/theme/theme.css. It lives in a
// Field, which names, describes and validates it like any control. The output is never
// sanitized: a real app sanitizes it on the server.

const meta = {
  title: 'Components/Form/Rich text editor',
  component: RichTextEditor.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    name: 'news',
    format: 'html',
    editable: true,
    disabled: false,
    readOnly: false,
    characterCount: false,
    labels: 'icon',
    tooltips: true,
    onValueChange: fn(),
  },
  // Every prop of RichTextEditor.Root in rich-text-editor.tsx and use-rich-text-editor.ts. Any
  // other `<div>` prop passes through to the box.
  argTypes: {
    extensions: {
      control: false,
      description:
        'The Tiptap extensions. Default `defaultExtensions()`. Add or remove with the ordinary Tiptap API: see Custom extension and Without tables and images. Keep the array stable between renders.',
    },
    format: {
      control: 'inline-radio',
      options: ['html', 'json'],
      description:
        'The value’s format: an HTML string (`""` when empty), or Tiptap’s JSON document (`null` when empty).',
    },
    value: {
      control: false,
      description:
        'Controlled: the value from your form state. Pair it with `onValueChange`. See Controlled JSON.',
    },
    defaultValue: {
      control: 'text',
      description:
        'Uncontrolled: the starting value, and what a form reset goes back to. HTML here, or JSON with `format="json"`.',
    },
    onValueChange: {
      control: false,
      description:
        'Called with the new value and `{ editor, transaction, isEmpty }` on every change (`length`, `limit` and `isOverLimit` with `characterCount`). It only reports.',
    },
    name: {
      control: 'text',
      description:
        'The name a form submits the value under, through a hidden input. It follows the value and a form reset, and is not sent while disabled.',
    },
    editable: {
      control: 'boolean',
      description: '`false` makes the text read-only, like `readOnly`. Default `true`.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Not editable, not focusable and not posted, and every toolbar control is natively disabled. A disabled Field disables the editor too. Sets `data-disabled`.',
    },
    readOnly: {
      control: 'boolean',
      description:
        'Not editable, but focusable, selectable and copyable, with `aria-readonly`. The toolbar is not rendered. Sets `data-readonly`.',
    },
    maxLength: {
      control: 'number',
      description:
        'The limit the count counts against. It never blocks typing or paste: over the limit is a warning, and your form decides on submit.',
    },
    characterCount: {
      control: 'boolean',
      description:
        'Shows how many characters are left under the box, with `maxLength` as the limit, counting the text the user can read. Announced politely from 80% and when crossed, and only while the editor has focus.',
    },
    countCharacters: {
      control: false,
      description: 'Your own counting, `(text) => number`, such as your server’s.',
    },
    labels: {
      control: 'inline-radio',
      options: ['icon', 'icon-and-text'],
      description:
        'How the toolbar’s icon controls show their names. `icon`: only the icon, with an `aria-label` and a tooltip. `icon-and-text`: the name beside the icon, which suits resident-facing editors and touch screens. A `Toolbar` can set its own.',
    },
    tooltips: {
      control: 'boolean',
      description:
        'Whether icon-only controls get a tooltip with their name and shortcut. Default `true`. With `labels="icon"` and no tooltips nothing shows the names, and a development warning says so.',
    },
    messages: {
      control: 'object',
      description:
        'Per-instance overrides for the editor’s texts: the `richText` namespace (toolbar names, the forms, the announcements).',
    },
    countMessages: {
      control: 'object',
      description:
        'With `characterCount`: per-instance overrides for the count (`characterCount.*`).',
    },
    editorOptions: {
      control: false,
      description:
        'The rest of Tiptap’s `useEditor` options, passed through: `editorProps`, `autofocus`, `injectNonce`. The editor owns `extensions`, `content` and `editable`.',
    },
    ref: { control: false, description: 'A ref to the box (`<div class="kv-rich-text">`).' },
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
    const { text, lang } = editorTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.label}</Field.Label>
        <Field.Prose>
          <p>{text.description}</p>
        </Field.Prose>
        <RichTextEditor.Root {...args}>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
        <Field.HelpText>{text.hint}</Field.HelpText>
      </Field.Root>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof RichTextEditor.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a rich text editor in a Field, with a description above, the default toolbar,
 * and a help text under the box. Every option is a control below: try `labels`,
 * `readOnly`, `disabled`, and `maxLength` with `characterCount`.
 */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    const box = await canvas.findByRole('textbox', { name: text.label })
    await expect(box).toHaveAttribute('aria-multiline', 'true')
    await expect(box).toHaveAttribute('aria-required', 'true')
    await expect(canvas.getAllByRole('toolbar')).toHaveLength(1)
    for (const control of canvas.getAllByRole('button')) {
      await expectMinimumTargetSize(control)
    }
  },
}

/**
 * The fixture the keyboard tests drive: a button before, an editor holding a paragraph, a list and
 * a table, and a button after. Try the keys in the Keyboard section above: Tab into the toolbar and
 * on into the text, Tab and Shift+Tab to nest a list item and to move between cells (anywhere else
 * Tab leaves the editor), Alt+F10 to the toolbar, and Control+B, I, U and K.
 */
export const Keyboard: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'KeyboardEditor'),
  render: (_args, { globals }) => <KeyboardEditor locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    await canvas.findByRole('textbox', { name: text.label })
    await expect(canvas.getByRole('toolbar')).toBeVisible()
  },
}

/**
 * In a plain `<form>`: the hidden input posts the HTML under `name`, empty is `""` and never
 * `<p></p>`, and the reset button goes back to the default value. Submit shows what the form posts.
 */
export const InAForm: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'PostedEditor'),
  render: (_args, { globals }) => <PostedEditor locale={localeOf(globals)} />,
}

/** Invalid: the box takes the 2px danger edge and `aria-invalid`, and the Field’s message names the fix. */
export const Invalid: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'InvalidEditor'),
  render: (_args, { globals }) => <InvalidEditor locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    await expect(await canvas.findByRole('textbox', { name: text.label })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  },
}

/** Disabled: a dashed box, every control natively disabled and out of the Tab order, nothing posted. */
export const Disabled: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'DisabledEditor'),
  render: (_args, { globals }) => <DisabledEditor locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    const box = await canvas.findByRole('textbox', { name: new RegExp(text.label) })
    await expect(box).toHaveAttribute('aria-disabled', 'true')
    await expect(box).toHaveAttribute('contenteditable', 'false')
  },
}

/** Read-only: no toolbar. The text is focusable, selectable and copyable. */
export const ReadOnly: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'ReadOnlyEditor'),
  render: (_args, { globals }) => <ReadOnlyEditor locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const box = await canvas.findByRole('textbox')
    await expect(box).toHaveAttribute('aria-readonly', 'true')
    await expect(box).toHaveAttribute('tabindex', '0')
    await expect(canvas.queryByRole('toolbar')).toBeNull()
  },
}

/** Controlled, as Tiptap’s JSON: the value lives in `useState`, and an empty editor is `null`. */
export const ControlledJson: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'ControlledJsonEditor'),
  render: (_args, { globals }) => <ControlledJsonEditor locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    const box = await canvas.findByRole('textbox', { name: text.label })
    await expect(canvas.getByTestId('json')).toHaveTextContent('null')
    await userEvent.click(box)
    await userEvent.keyboard('Hej')
    await waitFor(() => expect(canvas.getByTestId('json')).toHaveTextContent('"type":"doc"'))
  },
}

/**
 * Add a feature with the ordinary Tiptap API: a `Highlight` mark in the extensions, and a
 * `CommandToggle` and `CommandButton` in a group of your own, next to the default controls.
 */
export const CustomExtension: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'HighlightEditor'),
  render: (_args, { globals }) => <HighlightEditor locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = editorTextsFor(localeOf(globals))
    await canvas.findByRole('textbox', { name: new RegExp(text.label) })
    await expect(canvas.getByRole('button', { name: text.highlight })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  },
}

/** Without tables and images: their buttons and the Table group are gone. */
export const WithoutTablesAndImages: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'PlainEditor'),
  render: (_args, { globals }) => <PlainEditor locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await canvas.findByRole('toolbar')
    await expect(canvas.queryByRole('button', { name: /^(Tabell|Bild|Table|Image)$/ })).toBeNull()
  },
}

/**
 * A small toolbar for a resident-facing editor, with the names visible: touch screens have no
 * tooltips, and nobody has to guess an icon.
 */
export const IconAndText: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'ResidentEditor'),
  render: (_args, { globals }) => <ResidentEditor locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const toolbar = await canvas.findByRole('toolbar')
    await expect(toolbar).toHaveClass('kv-toolbar--labels')
  },
}

/** A count of the characters left. Over the limit is a warning with an icon: typing and paste still work. */
export const CharacterCount: Story = {
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'CountedEditor'),
  render: (_args, { globals }) => <CountedEditor locale={localeOf(globals)} />,
}

/**
 * Finnish names in a narrow column, with the names visible: the toolbar wraps group by group, and a
 * group wider than the row wraps inside itself. Nothing shrinks, truncates or scrolls sideways
 * (1.4.10), except a wide table, inside its own wrapper.
 */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'LongContentEditor'),
  render: (_args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <LongContentEditor locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('toolbar')
    const narrow = canvasElement.querySelector<HTMLElement>('[data-testid="narrow"]')
    if (narrow !== null) {
      await expectNoHorizontalOverflow(narrow)
    }
  },
}

/** Right to left, in English: the direction comes from the page (the provider's `dir`): the toolbar flows right to left and the arrows flip. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'BidirectionalEditor'),
  render: (_args, { globals }) => <BidirectionalEditor locale={localeOf(globals)} />,
}

/**
 * Forced colours: the box keeps its edge, a pressed button is a `Highlight` fill with
 * `HighlightText`, and a focused editor’s ring is `Highlight`. This story sets forced colours for
 * review, and the dedicated sweep (`E2E_BROWSERS=sweep`) checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('rich-text-editor/rich-text-editor.fixture.tsx', 'KeyboardEditor'),
  render: (_args, { globals }) => <KeyboardEditor locale={localeOf(globals)} />,
}
