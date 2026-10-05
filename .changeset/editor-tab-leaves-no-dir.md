---
'@kvirn-ui/rich-text': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
---

The rich text editor's keyboard docs now say what the code does, and `Textarea` and the editor take their direction from the page (Plan 0045).

- `@kvirn-ui/rich-text` (breaking, pre-1.0): there is no "Escape, then Tab" way out and no keyboard instruction under the box. Tab nests a list item (Shift+Tab outdents it) and moves to the next table cell, and leaves the editor everywhere else, as in any field. `RichTextEditor.KeyboardHint`, `RichTextEditorKeyboardHint`, its props type and the Root's `keyboardHint` prop are removed, and so is the `kv-rich-text-keyboard-hint` class. The first Escape in the text is still not passed on, so a Dialog around the editor stays open. The docs and the contract no longer say that blocks carry `dir="auto"` (they never did): sanitize with `target` stripped, there is no `dir` to allow.
- `@kvirn-ui/react`: `Textarea` has no `dir` prop in its types. Its direction is the page's, from the provider (`dir`, or an RTL `locale`, with `useLocale().localeProps` where the language is set), and the docs no longer suggest `dir="auto"`.
- `@kvirn-ui/i18n` (breaking, pre-1.0): the `richText.keyboardHintListsAndTables`, `keyboardHintLists` and `keyboardHintTables` messages are removed from the type and from all six locales.
