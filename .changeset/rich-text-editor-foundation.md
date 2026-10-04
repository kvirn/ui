---
'@kvirn-ui/rich-text': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
---

The rich text editor, first phase (Plan 0036). The toolbar and the default styles are in `rich-text-editor-toolbar.md`.

- `@kvirn-ui/rich-text` (new): `RichTextEditor.Root`, `Content` and `KeyboardHint`, `useRichTextEditor`, and `defaultExtensions()` with the Kvirn keymap, on Tiptap 3. Tiptap and ProseMirror are peers (`^3.31.0`): install `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/extension-image` and `@tiptap/extensions` yourself. The editor is wired to its Field, posts its value (HTML or JSON, `''` when empty) through a hidden input and follows a form reset. Tab indents list items and moves between table cells only where it can, Escape then Tab always leaves, AltGr always types, and the output is never sanitized: sanitize it on the server.
- `@kvirn-ui/react`: a `@kvirn-ui/react/internal` entry for Kvirn packages only. It is unstable and not part of the public API. A contenteditable now counts as text entry for `data-focus-visible`, so a click in it shows no focus ring and Tab does.
- `@kvirn-ui/i18n`: a `richText` namespace in all six locales (`se` is an English placeholder).
