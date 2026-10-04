# RichTextEditor

> **Draft** (Plan 0036). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [rich-text-editor.a11y.md](rich-text-editor.a11y.md), and the design spec is [docs/design/rich-text-editor.md](../../../docs/design/rich-text-editor.md).

A formatted-text field for text that will be published or sent: a news item, a case description in a staff tool, an association's event text. It is the control of a [Field](../../react/src/field/field.md), so it is labelled, described and validated like any control, and it posts its value with the form. It is built on [Tiptap](https://tiptap.dev) (ProseMirror), so a team that needs more adds or removes features with the ordinary Tiptap API, without forking our parts. For a plain answer in a resident's own words, use a [Textarea](../../react/src/textarea/textarea.md): residents rarely need formatting, and an editor is heavier to use with a keyboard and a screen reader. To show saved text, render it as [Prose](../../react/src/prose/prose.md).

- **Parts:** `RichTextEditor.Root` (the box, and the Tiptap editor), `Toolbar` (the formatting bar, attached to the box), `Content` (the editable text) and `KeyboardHint` (the instruction for leaving). The toolbar holds `DefaultControls`, or your own `Group`s of `CommandButton` and `CommandToggle`.
- **A separate package.** `@kvirn-ui/rich-text` depends on `@kvirn-ui/react`, and Tiptap and ProseMirror are **peers**: you install `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/extension-image` and `@tiptap/extensions` (each `^3.31.0`) once, so the app owns one copy of ProseMirror. `@kvirn-ui/react` has no Tiptap code.
- **Safe defaults.** Headings are levels 2 and 3 (the page owns the H1), typing rules (`# `, `* `, `**x**`) are off because they change the text without telling a screen reader user, links accept only `https`, `http`, `mailto` and `tel` and have no `target`, tables can't be resized by dragging, and images come from your own origin only.
- **Keyboard.** Shortcuts are on, limited to the platform's text-editing convention. Tab indents a list item and moves between table cells, but only where it can, and the instruction under the box tells everyone how to leave: Escape, then Tab. See the Keyboard section.
- **The output is never sanitized.** Tiptap's schema drops unknown tags and attributes, but that is not a security boundary. Always sanitize the HTML or JSON on the server before you store or publish it. The HTML has `dir="auto"` on blocks, and a pasted link can carry a `target`: allow `dir` and strip `target`.
- **No collaboration, comments, AI or upload.** Nothing from `@tiptap-pro` or Tiptap Cloud is used, because those call third-party servers. An image is inserted from an address with a description.
- Headless: the parts render `kv-rich-text`, `kv-rich-text-content` and the toolbar and popover classes below. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

| Part                                                                         | Renders                                                                                                   | Props                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RichTextEditor.Root`                                                        | the box `<div class="kv-rich-text">`, then the instruction, the count and a hidden `<input name>`         | The options below, and any `<div>` prop on the box                                                                                                                                                                   |
| `RichTextEditor.Toolbar`                                                     | `Toolbar.Root` with `kv-toolbar--attached` (and `kv-toolbar--labels`), a hidden name, a slot for popovers | `labels`, `tooltips`, `aria-label`, `aria-labelledby`, and the `Toolbar.Root` props. Without children it is `DefaultControls`                                                                                        |
| `RichTextEditor.DefaultControls`                                             | the default groups and controls                                                                           | `include`, `exclude`: `undo`, `redo`, `blockFormat`, `bold`, `italic`, `underline`, `strike`, `code`, `bulletList`, `orderedList`, `indent`, `outdent`, `link`, `image`, `table`, `clearFormatting`, `tableControls` |
| `RichTextEditor.Group`                                                       | a named `ButtonGroup` (`role="group"`)                                                                    | `aria-label` (required in a toolbar)                                                                                                                                                                                 |
| `RichTextEditor.CommandButton`                                               | a `Toolbar.Button`, with a tooltip when icon-only                                                         | `label`, `icon`, `shortcut`, `isAvailable(editor)`, `onPress(editor)`, and `Toolbar.Button` props                                                                                                                    |
| `RichTextEditor.CommandToggle`                                               | a `Toolbar.Toggle` (`aria-pressed`)                                                                       | as above, and `isPressed(editor)`                                                                                                                                                                                    |
| `RichTextEditor.BlockFormat`, `LinkControl`, `ImageControl`, `TableControls` | the default controls on their own, for a toolbar you build                                                | none                                                                                                                                                                                                                 |
| `RichTextEditor.Icon`                                                        | an `<svg aria-hidden class="kv-icon">`                                                                    | `name` (a built-in editor icon) or `paths` (your own, on a 24 grid), `mirrorInRtl`                                                                                                                                   |
| `RichTextEditor.Content`                                                     | Tiptap's `EditorContent`, around the `contenteditable`                                                    | `aria-label`, `aria-labelledby`, `aria-describedby` (go on the editable text), and any `<div>` prop for the wrapper                                                                                                  |
| `RichTextEditor.KeyboardHint`                                                | `<p class="kv-field-hint kv-rich-text-keyboard-hint">`                                                    | `render`                                                                                                                                                                                                             |

The Root's options are also the hook's (`useRichTextEditor`): `extensions`, `format`, `value`, `defaultValue`, `onValueChange(value, { editor, transaction, isEmpty, length, limit, isOverLimit })`, `name`, `editable`, `disabled`, `readOnly`, `maxLength`, `characterCount`, `countCharacters`, `messages` and `editorOptions` (the rest of Tiptap's `useEditor` options). The Root adds `labels`, `tooltips`, `keyboardHint` and `countMessages`. The hook returns `editor`, `rootProps`, `contentProps`, `hiddenInputProps`, `text`, `isEmpty`, `isFocused`, `isFocusVisible`, `isDisabled`, `isReadOnly`, `isInvalid`, `isRequired`, `isEditable`, `features` and `contentId`.

| State attribute      | On the box when                                       |
| -------------------- | ----------------------------------------------------- |
| `data-empty`         | There is nothing to read                              |
| `data-focused`       | The editable text has focus, however it got it        |
| `data-focus-visible` | The text has focus from the keyboard (a click is not) |
| `data-invalid`       | The Field is invalid                                  |
| `data-required`      | The Field is required                                 |
| `data-disabled`      | The Field or `disabled` disables it                   |
| `data-readonly`      | `readOnly`, or `editable={false}`                     |

**Classes** (theme): `kv-rich-text`, `kv-rich-text-content` (with `kv-prose`), `kv-toolbar kv-toolbar--attached`, `kv-toolbar--labels`, `kv-rich-text-control-label`, `kv-rich-text-toolbar-name`, `kv-rich-text-popups`, `kv-rich-text-popover`, `kv-rich-text-popover-title`, `kv-rich-text-popover-form` and `kv-rich-text-keyboard-hint`. The editable text is `kv-rich-text-content kv-prose`: exactly the published prose, so what staff see is what readers get, with no copy of its type styles.

**Message keys:** the `richText` namespace, listed in the contract. Override per instance with `messages`, or per provider.

## Component

`RichTextEditor.Root` goes in a Field, with `Toolbar` and `Content` inside it. The Field's label names the editable text, and a click on the label focuses it. Under the box, the Root renders the keyboard instruction (when lists or tables are on), the character count (with `characterCount` and `maxLength`) and a hidden input that posts the value under `name`. Empty is `''` as HTML and `null` as JSON, never `<p></p>`, so `required` works. A form reset goes back to `defaultValue`.

The editor is created after the first render (`immediatelyRender: false`), so the server renders the box, the instruction and the hidden input, and the editable text appears on the client. The first render of a controlled `value` is the starting content, and a later `value` that isn't what the editor holds replaces the text. Typing never resets the caret.

## The toolbar

The toolbar is a `role="toolbar"` named "Formatering" and the Field's label, with `aria-controls` pointing at the text and `aria-keyshortcuts="Alt+F10"`. It is one Tab stop with the arrow keys between its controls, and it **wraps group by group** at narrow widths: nothing is hidden behind a "More" button. It is not rendered while the editor is read-only.

- **Default groups,** in this order: Undo and Redo; the block type picker (Normal text, the configured heading levels, Quote, Code block, or "Several types" over a mixed selection); Bold, Italic, Underline, Strikethrough and Code; Bulleted list, Numbered list, Increase indent and Decrease indent; Link, Image and Table; Clear formatting; and the Table group while the document has a table. A control the extensions don't provide is left out.
- **`labels="icon"` (default)** shows icon-only buttons with an `aria-label` and a tooltip with the name and the platform's shortcut. **`labels="icon-and-text"`** shows each name beside its icon, which suits small resident-facing editors and touch screens, where there are no tooltips. `tooltips={false}` turns tooltips off, with a development warning when the names are then not visible. Set either on the Root, or on the `Toolbar` to override it.
- **A pointer press keeps focus and the selection in the text.** After a keyboard command focus stays on the control, so several formats can be set in a row. Escape on the toolbar goes back to the text.
- **Underline and Strikethrough** are in the default set. Underlined text looks like a link, and screen readers don't announce strikethrough, so its meaning is lost: use them sparingly.
- **The Table group** is in the toolbar while the document has at least one table, and its buttons are unavailable (`aria-disabled`, still focusable) while the caret is outside every table, so moving the caret never makes the toolbar jump. It appears when the user inserts or pastes a table, and goes when the last table is deleted, with focus back in the text. New tables are 3 by 3 with a header row, which the published table needs (1.3.1). "Add column to the left" is the left of what the user sees, so it swaps in right-to-left text. Deleting a table has no confirmation: it is undoable with Control+Z, and it is announced.
- **The Link and Image forms** open in a non-modal popover after the toolbar. Link asks for the web address (checked against the allowed schemes, with an inline error that keeps focus in the form), and for the link text when nothing is selected, so a link is never its bare address (2.4.4). Image asks for the address and "Vad visar bilden?", which is required unless "Bilden är bara dekoration" is ticked: that saves an empty `alt` and disables the description field without clearing it. Escape, Cancel and Apply return focus to the text, and the result is announced. Control+K opens the link form.

## Adapting with the Tiptap API

`defaultExtensions(options)` returns the extensions a Kvirn editor starts with: StarterKit with headings 2 and 3, safe links, tables (`TableKit`) without column dragging, images from your own origin, and the Kvirn keymap. Each part takes Tiptap's own options or `false`, and you spread it into your own list. **Keep the array stable** (a constant, or `useMemo`): Tiptap reads it when it creates the editor.

- **Headings:** `heading: { levels: [2, 3, 4] }` adds a level, and the picker follows. The picker names levels 2 to 4.
- **Tables and images:** `table: false` and `image: false` remove them, with their buttons, the Table group and the table half of the instruction.
- **Images from other origins:** `imageSources: ['https://bilder.example.se']`, or `['*']` for any `http` or `https` address. The default is this site's origin and relative addresses only, so a text never makes readers' browsers fetch from a third-party server (GDPR). An address outside the list is refused in the image form, dropped from stored or pasted content, and refused by `setImage`.
- **Typing rules:** `inputRules: true` turns on `# `, `* `, `**x**` for staff who want Markdown habits. Off by default: a screen reader user isn't told their line became a heading.
- **Anything else in StarterKit:** `starterKit: { underline: false, codeBlock: false }`.
- **Your own feature:** add an extension (`Highlight`, say) to the array, and a `CommandToggle` in your own `Group`: its `isPressed` and `onPress` get the Tiptap editor. For a button that has no icon, leave `icon` out: it is a text button in both label modes. `RichTextEditor.Icon` draws the built-in icons or your own paths. The keymap is `KvirnKeymap`, and `keymap: false` leaves it out. Its Tab handling replaces every other Tab binding (a task list's, for example): add your own after turning it off.
- **Tiptap's `Editor`** is in `useRichTextEditorContext()` (inside a Root) and in `useRichTextEditor().editor`. Tiptap injects a small `<style>` of ProseMirror's structural rules (`injectCSS`, with `injectNonce` for a CSP).

## Size and loading

React, `@tiptap/react`, StarterKit, TableKit and Image come to about 450 KB minified and 140 KB gzipped, including ProseMirror. Load the editor with `React.lazy` where it is used, and give the empty place a height (the editable text is at least five lines) so nothing jumps when it arrives. The package is `sideEffects: false`.

## Strings

A new `richText` namespace in all six locales (`se` is an English placeholder until it is translated). The toolbar's names, the block names, the table actions, the link and image forms with their errors, the instruction (one of three keys by what is enabled), and every announcement are messages. Key names in shortcuts (Ctrl, ⌘) are not translated: they are what is printed on the keys.

## Notes

- **Screen reader support for a `contenteditable` varies** across NVDA, JAWS and VoiceOver. The manual AT matrix is `pending`, and nothing here is claimed until it is run.
- **Development warnings** (once, in English): a text with no accessible name (no `Field.Label`, `aria-label` or `aria-labelledby`), a `characterCount` with no `maxLength`, icon-only controls with `tooltips={false}`, a configured heading level the picker has no name for, and no provider for the announcements.
- **Save drafts.** A long text is the worst thing to lose to a session timeout: in a staff tool, save drafts and warn before a session ends (WCAG 2.2.1).
- **Inside a Dialog,** the first Escape in the text arms the way out and is not passed on, so a Dialog doesn't close and lose the text. A second Escape reaches the Dialog.
