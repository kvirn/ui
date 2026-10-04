---
'@kvirn-ui/rich-text': minor
'@kvirn-ui/react': patch
'@kvirn-ui/theme': minor
---

The rich text editor's toolbar and default styles (Plan 0036, phase B).

- `@kvirn-ui/rich-text`: `RichTextEditor.Toolbar` (named "Formatering" and the Field's label, `aria-controls`, Alt+F10 and Escape between the toolbar and the text, wrapping group by group, `labels` and `tooltips` options), `DefaultControls` (`include` and `exclude`), `Group`, `CommandButton`, `CommandToggle` (with the Tiptap editor), `BlockFormat`, the Link and Image popover forms (Control+K opens the link form, inline errors, the image description is required unless the image is decorative), `TableControls` (present while the document has a table, unavailable outside one), and `Icon`. Every command is announced where nothing visible says it worked, and `richText.tableDeleted` now takes `{ shortcut }`.
- `@kvirn-ui/react`: `Popover.Popup` no longer inherits an enclosing `Toolbar`, so a form in a popover that a toolbar item opens doesn't register as toolbar items, warn about an unnamed `ButtonGroup`, or make a Listbox look native.
- `@kvirn-ui/theme`: a section for the rich text editor: `kv-rich-text` (the box, with the input group's edge and states), `kv-toolbar--attached` with flat buttons, `kv-toolbar--labels`, the editable text (`kv-prose`, no hyphenation while editing, a wide table scrolling inside its wrapper, selected cells and images, the gap cursor restyled and still under reduced motion), `kv-rich-text-popover`, and forced colours for all of it.
