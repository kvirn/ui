import type {
  CommandButtonProps,
  CommandToggleProps,
  DefaultControlsProps,
  DefaultExtensionsOptions,
  RichTextEditorContentProps,
  RichTextEditorRootProps,
  RichTextEditorToolbarProps,
  ToolbarIconProps,
  UseRichTextEditorOptions,
  UseRichTextEditorResult,
} from '@kvirn-ui/rich-text'
import type { ToolbarGroupProps } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The options of the Root and of the hook: the Root passes all of these to the hook. */
const sharedOptionRows = {
  extensions: {
    type: 'Extensions',
    default: 'defaultExtensions()',
    description:
      'The Tiptap extensions, as an array. Keep it the same array between renders (a constant, or useMemo): Tiptap reads it when it creates the editor.',
  },
  format: {
    type: "'html' | 'json'",
    default: "'html'",
    description:
      'The format of the value. HTML is a string, and an empty text is an empty string. JSON is Tiptap’s document, and an empty text is null.',
  },
  value: {
    type: 'string | JSONContent | null',
    default: '–',
    description:
      'The value, when your own state holds it. The first value is the starting text. A later one that is not what the editor holds replaces the text. Typing never moves the caret.',
  },
  defaultValue: {
    type: 'string | JSONContent | null',
    default: '–',
    description:
      'The starting text when the editor holds the value itself. A form reset goes back to it.',
  },
  onValueChange: {
    type: '(value, details) => void',
    default: '–',
    description:
      'Called after each change to the text, with the new value and details: editor, transaction, isEmpty, and with characterCount also length, limit and isOverLimit. It only reports.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'The name a form sends the value under, through a hidden input. The input follows a form reset and is disabled while the editor is.',
  },
  editable: {
    type: 'boolean',
    default: 'true',
    description: 'false makes the text read-only, like readOnly.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'The text is not editable, not focusable and not sent. A disabled Field disables the editor too.',
  },
  readOnly: {
    type: 'boolean',
    default: 'false',
    description:
      'The text can be focused, selected and copied, but not changed. The toolbar is not rendered.',
  },
  maxLength: {
    type: 'number',
    default: '–',
    description:
      'The limit the character count counts against. It never blocks typing, and it renders nothing without characterCount.',
  },
  characterCount: {
    type: 'boolean',
    default: 'false',
    description:
      'Shows a count under the box, against maxLength. It counts the text a reader sees, with one line break between blocks. Without maxLength a development warning says so.',
  },
  countCharacters: {
    type: '(value: string) => number',
    default: '–',
    description: 'Counts the text your own way, for example the way your server counts it.',
  },
  messages: {
    type: "Partial<KvirnMessages['richText']>",
    default: '–',
    description: 'Per-instance override of the toolbar, the forms and the announcements.',
  },
  editorOptions: {
    type: 'Partial<EditorOptions>',
    default: '–',
    description:
      'The rest of Tiptap’s own options for the editor, for example injectCSS. The hook owns extensions, content and editable.',
  },
} as const

export type RichTextEditorRootDocumentedProps = Pick<
  RichTextEditorRootProps,
  | 'extensions'
  | 'format'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'name'
  | 'editable'
  | 'disabled'
  | 'readOnly'
  | 'maxLength'
  | 'characterCount'
  | 'countCharacters'
  | 'messages'
  | 'editorOptions'
  | 'labels'
  | 'tooltips'
  | 'countMessages'
  | 'ref'
>

export const rootRows = propRows<RichTextEditorRootDocumentedProps>({
  ...sharedOptionRows,
  labels: {
    type: "'icon' | 'icon-and-text'",
    default: "'icon'",
    description:
      'How the toolbar’s controls show their names. icon shows only the icon, with a tooltip. icon-and-text shows each name beside its icon, which suits small resident-facing editors and touch screens. A Toolbar can set its own.',
  },
  tooltips: {
    type: 'boolean',
    default: 'true',
    description:
      'Whether icon-only controls get a tooltip with their name and shortcut. Without tooltips the names are not visible, and a development warning says so. A Toolbar can set its own.',
  },
  countMessages: {
    type: "Partial<KvirnMessages['characterCount']>",
    default: '–',
    description: 'Per-instance override of the count’s texts, with characterCount.',
  },
  ref: {
    type: 'Ref<HTMLDivElement>',
    default: '–',
    description: 'Reaches the box.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-rich-text',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  { name: 'data-empty', values: 'present or absent', meaning: 'There is nothing to read.' },
  {
    name: 'data-focused',
    values: 'present or absent',
    meaning: 'The editable text has focus, however it got it.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning:
      'The text has focus from the keyboard. A click does not set it, except in an invalid editor.',
  },
  {
    name: 'data-invalid',
    values: 'present or absent',
    meaning: 'The Field is invalid.',
  },
  {
    name: 'data-required',
    values: 'present or absent',
    meaning: 'The Field is required.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The Field or the disabled prop disables the editor.',
  },
  {
    name: 'data-readonly',
    values: 'present or absent',
    meaning: 'readOnly, or editable set to false.',
  },
]

export type RichTextEditorToolbarDocumentedProps = Pick<
  RichTextEditorToolbarProps,
  'labels' | 'tooltips' | 'aria-label' | 'aria-labelledby' | 'children'
>

export const toolbarRows = propRows<RichTextEditorToolbarDocumentedProps>({
  labels: {
    type: "'icon' | 'icon-and-text'",
    default: 'the Root’s labels',
    description: 'How this toolbar’s controls show their names, instead of the Root’s setting.',
  },
  tooltips: {
    type: 'boolean',
    default: 'the Root’s tooltips',
    description: 'Whether this toolbar’s icon-only controls get a tooltip, instead of the Root’s.',
  },
  'aria-label': {
    type: 'string',
    default: 'the message richText.toolbar, then the Field’s label',
    description:
      'The toolbar’s own name. It replaces the default name, so give one that tells two editors on a page apart.',
  },
  'aria-labelledby': {
    type: 'string',
    default: '–',
    description: 'The toolbar’s name from other elements. It replaces the default name.',
  },
  children: {
    type: 'ReactNode',
    default: '<RichTextEditor.DefaultControls />',
    description:
      'Your own groups and controls, or <RichTextEditor.CompactControls /> for one row on a phone. Without any, the toolbar holds the default ones.',
  },
})

export const toolbarAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-toolbar kv-toolbar--attached',
    values: 'always',
    meaning: 'The part classes. The toolbar joins the top of the box.',
  },
  {
    name: 'kv-toolbar--labels',
    values: 'with labels="icon-and-text"',
    meaning: 'Each control shows its name beside its icon.',
  },
  {
    name: 'kv-rich-text-toolbar-name',
    values: 'in a Field',
    meaning: 'The visually hidden first part of the toolbar’s name.',
  },
  {
    name: 'kv-rich-text-more',
    values: 'on the "More" button of CompactControls',
    meaning: 'The part class of the menu button, next to kv-button. The menu is the Menu’s own.',
  },
  {
    name: 'kv-rich-text-popups',
    values: 'always, after the toolbar',
    meaning: 'The place the link and image forms open in, next to the toolbar.',
  },
  {
    name: 'aria-controls, aria-keyshortcuts',
    values: 'the text’s id, Alt+F10',
    meaning: 'Set for you. They point at the editable text and name the key that reaches the bar.',
  },
]

export type RichTextEditorDefaultControlsDocumentedProps = Pick<
  DefaultControlsProps,
  'include' | 'exclude'
>

/** `CompactControls` takes the same `include` and `exclude` as `DefaultControls`. */
export const defaultControlsRows = propRows<RichTextEditorDefaultControlsDocumentedProps>({
  include: {
    type: 'readonly DefaultControlName[]',
    default: 'all of them',
    description:
      'Only these controls: undo, redo, blockFormat, bold, italic, underline, strike, code, bulletList, orderedList, indent, outdent, link, image, table, clearFormatting, tableControls. A control the extensions don’t provide is left out anyway.',
  },
  exclude: {
    type: 'readonly DefaultControlName[]',
    default: '–',
    description: 'All of them except these. The names are the same as for include.',
  },
})

export type RichTextEditorGroupDocumentedProps = Pick<
  ToolbarGroupProps,
  'aria-label' | 'aria-labelledby'
>

export const groupRows = propRows<RichTextEditorGroupDocumentedProps>({
  'aria-label': {
    type: 'string',
    default: '–',
    description:
      'The group’s name, from your translations. Give this or aria-labelledby: a group in a toolbar needs a name.',
  },
  'aria-labelledby': {
    type: 'string',
    default: '–',
    description: 'The group’s name from another element.',
  },
})

const controlRows = {
  label: {
    type: 'string',
    description:
      'The control’s name, from your translations. With labels="icon" it is the accessible name and the first line of the tooltip. With labels="icon-and-text" it is the visible text. A control with no icon always shows it as text.',
  },
  icon: {
    type: 'ReactNode',
    default: '–',
    description:
      'The icon, such as <RichTextEditor.Icon name="bold" /> or one of your own. It is decoration: the label names the control.',
  },
  shortcut: {
    type: 'readonly string[]',
    default: '–',
    description:
      'The shortcut, written as Tiptap writes it: ["Mod-b"]. Mod is Command on macOS and Control elsewhere. It sets aria-keyshortcuts and is shown in the tooltip. It does not bind the key: do that in your extension.',
  },
  isAvailable: {
    type: '(editor: Editor) => boolean',
    default: 'always',
    description:
      'Whether the command can run now. When it can’t, the control is aria-disabled, still focusable, and pressing it does nothing.',
  },
  onPress: {
    type: '(editor: Editor) => void',
    description:
      'Runs the command with the Tiptap editor. After a keyboard press focus stays on the control, so several formats can be set in a row.',
  },
} as const

export type RichTextEditorCommandButtonDocumentedProps = Pick<
  CommandButtonProps,
  'label' | 'icon' | 'shortcut' | 'isAvailable' | 'onPress'
>

export const commandButtonRows = propRows<RichTextEditorCommandButtonDocumentedProps>(controlRows)

export type RichTextEditorCommandToggleDocumentedProps = Pick<
  CommandToggleProps,
  'label' | 'icon' | 'shortcut' | 'isAvailable' | 'onPress' | 'isPressed'
>

export const commandToggleRows = propRows<RichTextEditorCommandToggleDocumentedProps>({
  ...controlRows,
  isPressed: {
    type: '(editor: Editor) => boolean',
    description:
      'Whether the format is on at the caret or in the selection, read from the editor on every change. It sets aria-pressed.',
  },
})

export type RichTextEditorIconDocumentedProps = Pick<
  ToolbarIconProps,
  'name' | 'paths' | 'mirrorInRtl'
>

export const iconRows = propRows<RichTextEditorIconDocumentedProps>({
  name: {
    type: 'RichTextIconName',
    default: '–',
    description:
      'A built-in editor icon: undo, redo, bold, italic, underline, strike, code, bullet-list, numbered-list, indent, outdent, link, image, table or clear-formatting.',
  },
  paths: {
    type: 'readonly string[]',
    default: '–',
    description: 'Your own icon: path data on a 24 grid, drawn with a 1.5 stroke.',
  },
  mirrorInRtl: {
    type: 'boolean',
    default: 'true for the icons that point in a direction',
    description: 'Flips the icon in right-to-left text.',
  },
})

export const iconAttributes: readonly AttributeRow[] = [
  { name: 'kv-icon', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-hidden',
    values: 'true',
    meaning: 'It is decoration: the control has its own name.',
  },
]

export type RichTextEditorContentDocumentedProps = Pick<
  RichTextEditorContentProps,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'ref'
>

export const contentRows = propRows<RichTextEditorContentDocumentedProps>({
  'aria-label': {
    type: 'string',
    default: '–',
    description:
      'The editable text’s name, outside a Field. Inside one, the Field’s label names it. Without any name a development warning says so.',
  },
  'aria-labelledby': {
    type: 'string',
    default: '–',
    description: 'The editable text’s name from other elements, outside a Field.',
  },
  'aria-describedby': {
    type: 'string',
    default: '–',
    description: 'Extra ids that describe the text, after the Field’s own descriptions.',
  },
  ref: {
    type: 'Ref<HTMLDivElement>',
    default: '–',
    description: 'Reaches the wrapper around the editable text, not the editable element.',
  },
})

export const contentAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-rich-text-content kv-prose',
    values: 'on the editable text',
    meaning: 'The text is styled as the published Prose, so staff see what readers get.',
  },
  {
    name: 'role="textbox", aria-multiline',
    values: 'on the editable text',
    meaning: 'Set by Tiptap and the hook. Not passed directly.',
  },
  {
    name: 'aria-labelledby, aria-describedby, aria-invalid, aria-required',
    values: 'from the Field',
    meaning: 'Wired to the editable text, not to its wrapper.',
  },
  {
    name: 'aria-disabled, aria-readonly',
    values: 'when it applies',
    meaning:
      'A read-only text keeps tabindex="0" so it can be read and copied. A disabled one has no tabindex.',
  },
]

export const defaultExtensionsRows = propRows<DefaultExtensionsOptions>({
  heading: {
    type: 'StarterKitOptions["heading"]',
    default: '{ levels: [2, 3] }',
    description:
      'Heading options, or false for no headings. There is no level 1: the page owns it. { levels: [2, 3, 4] } adds a level and the block picker follows.',
  },
  link: {
    type: 'StarterKitOptions["link"]',
    default: 'https, http, mailto and tel only',
    description:
      'The Link mark’s options, or false for no links. By default links have no target, a click puts the caret in the link, and only the four schemes (and relative addresses) are accepted.',
  },
  table: {
    type: 'Partial<TableKitOptions> | false',
    default: 'not resizable',
    description:
      'The table options, or false for no tables. Columns can’t be dragged, because dragging has no keyboard alternative.',
  },
  image: {
    type: 'Partial<ImageOptions> | false',
    default: 'a block image',
    description:
      'The Image options, or false for no images. Without images the Image button is gone too.',
  },
  imageSources: {
    type: 'readonly string[]',
    default: 'the page’s own origin',
    description:
      'The origins images may come from, such as https://bilder.example.se, or ["*"] for any http or https address. The page’s own origin and relative addresses are always allowed. An address outside the list is refused in the form, and in pasted or dropped content with a polite announcement. In stored content or a value set from code it is dropped without a message.',
  },
  inputRules: {
    type: 'boolean',
    default: 'false',
    description:
      'Typing rules: "# " makes a heading, "* " a list and **x** bold. Off by default, because they change the text without telling a screen reader user.',
  },
  starterKit: {
    type: 'Partial<StarterKitOptions>',
    default: '–',
    description: 'Any other StarterKit option, such as underline: false or codeBlock: false.',
  },
  keymap: {
    type: 'boolean',
    default: 'true',
    description:
      'false leaves out the Kvirn keymap: Tab, Escape, Alt+F10, Control+K and the AltGr guard. Its Tab handling replaces every other Tab binding, so add your own after turning it off.',
  },
})

export const useRichTextEditorHook: ApiHook = {
  name: 'useRichTextEditor',
  intro:
    'It creates the Tiptap editor after the first render, so it is safe to render on the server, and it wires the editor to the nearest Field. Put rootProps on your box, contentProps on the element around Tiptap’s EditorContent, and hiddenInputProps on a hidden input.',
  options: propRows<UseRichTextEditorOptions>({
    ...sharedOptionRows,
    'aria-label': {
      type: 'string',
      default: '–',
      description: 'The editable text’s name, outside a Field.',
    },
    'aria-labelledby': {
      type: 'string',
      default: '–',
      description: 'The editable text’s name from other elements, outside a Field.',
    },
    'aria-describedby': {
      type: 'string',
      default: '–',
      description: 'Extra ids that describe the text, after the Field’s own.',
    },
    onFocusToolbar: {
      type: '() => boolean | void',
      default: '–',
      description:
        'Alt+F10 (Option+F10): move focus to your toolbar. Return false when there is none.',
    },
    onOpenLinkForm: {
      type: '() => boolean | void',
      default: '–',
      description: 'Control+K: open your link form. Return false to let the key pass.',
    },
  }),
  result: propRows<UseRichTextEditorResult>({
    editor: {
      type: 'Editor | null',
      default: '–',
      description:
        'Tiptap’s editor. It is null until it mounts, because it is created after the first render.',
    },
    rootProps: {
      type: 'RichTextRootPartProps',
      default: '–',
      description: 'Spread on the box: the class, a ref and the data-* state.',
    },
    contentProps: {
      type: 'RichTextContentPartProps',
      default: '–',
      description: 'Spread on the element around the editable text: the focus handlers.',
    },
    hiddenInputProps: {
      type: 'RichTextHiddenInputPartProps | undefined',
      default: '–',
      description: 'Spread on a hidden input. undefined without a name.',
    },
    text: {
      type: 'string',
      default: '–',
      description: 'The text as the count counts it, with one line break between blocks.',
    },
    isEmpty: {
      type: 'boolean',
      default: '–',
      description: 'There is nothing to read.',
    },
    isFocused: {
      type: 'boolean',
      default: '–',
      description: 'The editable text has focus, however it got it.',
    },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'The editable text has focus from the keyboard. A click does not set it.',
    },
    isDisabled: { type: 'boolean', default: '–', description: 'The editor is disabled.' },
    isReadOnly: {
      type: 'boolean',
      default: '–',
      description: 'The text can’t be changed but can be read and copied.',
    },
    isInvalid: { type: 'boolean', default: '–', description: 'The Field is invalid.' },
    isRequired: { type: 'boolean', default: '–', description: 'The Field is required.' },
    isEditable: {
      type: 'boolean',
      default: '–',
      description: 'Whether the text can be edited.',
    },
    features: {
      type: 'RichTextFeatures',
      default: '–',
      description:
        'What the extensions let the text contain: lists, tables, links, images, marks and the heading levels. They decide which controls apply.',
    },
    contentId: {
      type: 'string',
      default: '–',
      description: 'The editable text’s id: the Field’s control id, or a generated one.',
    },
  }),
}
