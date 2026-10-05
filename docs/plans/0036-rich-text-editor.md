# Plan 0036: Rich text editor (`@kvirn-ui/rich-text`)

- **Status:** Approved (the maintainer, 2026-10-04)
- **Superseded 2026-10-05 (Plan 0045):** there is no "Escape, then Tab" way out, no `KeyboardHint` and no keyboard instruction under the box: Tab acts only where it can and leaves everywhere else. The editor and the Textarea take their direction from the page, with no `dir` prop. Where this plan says otherwise, 0045 and the contract win.
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M3
- **Related:** 0034, 0035 (Toolbar, ButtonGroup and Toggle, a prerequisite), [0037](0037-tooltip.md) (Tooltip, a prerequisite), 0034 (CharacterCount), [0022](0022-listbox-combobox-autocomplete.md) (Listbox), the Popover, [design spec](../design/rich-text-editor.md), `api-conventions`, `accessibility`, `keyboard`, `testing`, `storybook-docs`, `forms`, `overlays-and-lists`, `theme-css` and `regulations` skills

## Goal

A team adds a formatted-text answer (a case description, a news text in a staff tool) to a form. The editor is labelled, described and validated by a Field like any control. It has a sensible formatting bar that a keyboard and screen reader user can operate, and it posts its value with the form. A team that needs more adds or removes features with the ordinary Tiptap API, without forking our parts.

## Non-goals

- No collaboration, comments, AI or anything from `@tiptap-pro` or Tiptap Cloud (rule 7: no third-party network calls).
- No image upload in this plan. An image is inserted from a URL with alt text. Upload (`uploadImage(file) => Promise<{ src }>`) is a follow-up plan that reuses FileUpload's validation.
- No HTML sanitizer in the browser. Tiptap's schema drops unknown tags and attributes, but that is not a security boundary: the docs tell adopters to sanitize on the server.
- No markdown input rules by default (opt in), no text colour, no alignment, no font size, and no H1 (the page owns the H1).
- No overflow "More" menu (Menu is planned for M2). The toolbar wraps.

## Background

- **Tiptap 3.31.4** (2026-10-04). Every package we use is MIT, has no install scripts, and makes no network calls (the source was grepped for fetch, XHR, WebSocket and beacons). StarterKit now includes Underline, Link, ListKeymap, TrailingNode and UndoRedo. `@tiptap/extension-table` exports `TableKit`. Pro extensions live on a private registry and are out of scope.
- **Size:** react, starter-kit, TableKit and Image come to about 451 KB minified and 142 KB gzipped, including ProseMirror. The docs recommend `React.lazy`.
- **What Tiptap renders:** a `contenteditable` with `role="textbox"` and `tabindex="0"`. It does **not** set `aria-multiline`, a name, `aria-describedby`, `aria-invalid` or `aria-required`. We pass them through `editorProps.attributes`. Its placeholder is CSS only, and is not announced.
- **Tab:** ListItem binds Tab to sink and Shift+Tab to lift a list item. A table binds Tab to the next cell, and in the last cell it **adds a row instead of leaving** (a WCAG 2.1.2 risk). A code block captures Tab only with `enableTabIndentation`.
- **Default shortcuts:** Mod-b bold, Mod-i italic, Mod-u underline, Mod-Shift-s strikethrough, Mod-e code, Mod-Alt-c code block, Mod-Alt-1…6 headings, Mod-Shift-7 numbered list, Mod-Shift-8 bullet list, Mod-Shift-b quote, Mod-z undo, Mod-Shift-z and Mod-y redo. Link has no shortcut.
- **Link:** `isAllowedUri` blocks `javascript:` (a disallowed href renders as `href=""`). `openOnClick` defaults to true, and links default to `target="_blank"`.
- **Rendering:** `shouldRerenderOnTransaction` is false by default in v3. A toolbar reads its state with `useEditorState` and a selector. `immediatelyRender` must be false for SSR.
- **Duplicate ProseMirror** breaks silently (`instanceof` and plugin keys), so `@tiptap/core` and `@tiptap/pm` must resolve to one copy.
- **The convention for editors** (CKEditor, TinyMCE, Google Docs): Alt+F10 moves from the text to the toolbar, and Escape in the toolbar goes back.
- **AT:** contenteditable support varies across NVDA, JAWS and VoiceOver. Tiptap documents VoiceOver joining text across blocks. The manual AT matrix is essential, and agents mark it `pending`.

## Design

### Package

- `packages/rich-text`, published as `@kvirn-ui/rich-text`. It contains a `'use client'` entry, the hook, the parts, the default extensions and their toolbar controls. `@kvirn-ui/react` has no Tiptap code and no Tiptap types.
- **Dependencies:**
  - `dependencies`: `@kvirn-ui/react`, `@kvirn-ui/core`, `@kvirn-ui/i18n`.
  - `peerDependencies`: `react`, `react-dom`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/extension-image` and `@tiptap/extensions`, all `^3.31.0`. Every Tiptap package is a peer, so the adopter owns one version of each and ProseMirror is never duplicated. The docs give the one install line.
  - `devDependencies`: the same Tiptap packages, pinned exactly in the pnpm catalog.
- **Imports:** ProseMirror only through `@tiptap/pm/*`. A `no-restricted-imports` rule in the root `vite.config.ts` bans `prosemirror-*`, and bans `@tiptap/*` outside `packages/rich-text` and the storybook app.

### API sketch

```tsx
import { RichTextEditor, defaultExtensions } from '@kvirn-ui/rich-text'

// The usual case: one Field, the default toolbar
;<Field.Root required>
  <Field.Label>Beskriv ärendet</Field.Label>
  <RichTextEditor.Root name="description" defaultValue="<p></p>">
    <RichTextEditor.Toolbar />
    <RichTextEditor.Content />
  </RichTextEditor.Root>
  <Field.Hint>Du kan använda rubriker, listor och länkar.</Field.Hint>
  <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
</Field.Root>

// Adapt with the Tiptap API: configure, remove or add extensions
import Highlight from '@tiptap/extension-highlight'
;<RichTextEditor.Root
  extensions={[...defaultExtensions({ heading: { levels: [2, 3] }, table: false }), Highlight]}
>
  <RichTextEditor.Toolbar>
    <RichTextEditor.DefaultControls exclude={['table', 'image']} />
    <RichTextEditor.Group aria-label="Markering">
      <RichTextEditor.CommandToggle
        label="Markera"
        icon={<RichTextEditor.Icon paths={highlightPaths} />}
        isPressed={(editor) => editor.isActive('highlight')}
        onPress={(editor) => editor.chain().toggleHighlight().run()}
      />
    </RichTextEditor.Group>
  </RichTextEditor.Toolbar>
  <RichTextEditor.Content />
</RichTextEditor.Root>

// Full control: the hook gives you the Tiptap Editor
const richText = useRichTextEditor({ extensions, value, onValueChange, format: 'json' })
richText.editor // Tiptap Editor | null
```

- **`useRichTextEditor(options)`** wraps Tiptap's `useEditor`.
  - **Options:** `extensions` (default `defaultExtensions()`), `maxLength` and `characterCount` (boolean, as Textarea's: the shared `CharacterCount` part from Plan 0034, counting `editor.getText()`, never blocking input), `value` and `defaultValue`, `onValueChange(value, { editor, transaction })`, `format` (`'html'` by default, or `'json'`), `editable`, `disabled`, `readOnly`, and `editorOptions` (the rest of Tiptap's `useEditor` options, passed through). It sets `immediatelyRender: false`.
  - **Returns** `{ editor, rootProps, contentProps, hiddenInputProps, isEmpty, isFocused, isFocusVisible, isDisabled, isReadOnly }`.
  - **Empty:** content with no text and no node other than an empty paragraph is `''` (not `<p></p>`), so `required` works.
- **`defaultExtensions(options)`** returns the sensible set, each part configurable or `false`:
  - StarterKit with headings 2 and 3, and input rules off.
  - Link: `openOnClick: false`, `autolink: true`, `protocols` limited to `https`, `http`, `mailto` and `tel`, and no `target` attribute.
  - Underline, lists, quote, code, code block, undo and redo, and TrailingNode.
  - `TableKit` with `resizable: false` and a header row.
  - `Image`: block, `allowBase64: false`, and `src` limited by `imageSources` (same-origin and relative by default).
  - The Kvirn keymap: Mod-k opens the link form, Alt+F10 (Option+F10 on macOS) moves to the toolbar, and Escape arms a one-shot exit (the next Tab or Shift+Tab leaves the editor, and any other key disarms it). Tab and Shift+Tab are rebound as the contract says. The shortcuts that clash with AltGr, browsers or AT keys are removed.
- **Parts:**
  - `Root`: context, the Field wiring, and a hidden `<input type="hidden" name>` that follows the value and the form's `reset`.
  - `Toolbar`: a `Toolbar.Root` named "Formatering" or "Formatting" with `aria-controls` set to the content id. Without children it renders `DefaultControls`. `labels="icon"` (default) or `labels="icon-and-text"` shows the names as visible text next to the icons, and `tooltips` (default true) puts a Tooltip (Plan 0037) with the name and the platform shortcut on every icon-only control. Both can be set on `Root` for the whole editor.
  - `DefaultControls` (`include` and `exclude`).
  - `Group` (ButtonGroup), `CommandButton` and `CommandToggle`.
  - `BlockFormat`: a `Listbox` with `native="never"` for Normal text, the configured heading levels (2 and 3 by default), Quote and Code block.
  - `LinkControl` and `ImageControl`: a Popover with a form.
  - `TableControls`: the Table group, present while the document has a table (see below).
  - `Content`: wraps `EditorContent`, with the class `kv-prose` (no editor-specific type styles).
  - `KeyboardHint`: the visible instruction for leaving the editor (2.1.2), in the editor's `aria-describedby`. `DefaultControls` renders it whenever lists or tables are enabled. Placement and copy are the design spec's.
  - `CharacterCount`: from `@kvirn-ui/react`, when `characterCount` is set.
- **The toolbar's state** is read with `useEditorState` and a selector of flat primitives per control (`isActive`, and `can().chain()…run()`), so typing re-renders only what changed.
- **Field wiring:** `Content` puts the Field's `controlProps` on the contenteditable through `editorProps.attributes`:
  - `id`, `aria-labelledby` (the Field's `labelId`, because a `<label for>` doesn't name a contenteditable), `aria-describedby`, `aria-invalid`, `aria-required` and `aria-multiline="true"`.
  - When disabled: `aria-disabled="true"` and `contenteditable=false`. When read-only: `aria-readonly="true"` and `contenteditable=false`.
  - A click on the `Field.Label` focuses the editor (the label's `for` points at a div, so `Root` handles it).
  - Outside a Field, `aria-label` or `aria-labelledby` on `Content` is required (dev warning).

### The default toolbar

The design spec ([§5.2, §6.6](../design/rich-text-editor.md)) owns the order, the icons, the visible names and the copy. Every control is a toolbar item. Icon-only buttons carry an i18n name and, where there is a shortcut, `aria-keyshortcuts` for the platform (`Control+B`, or `Meta+B` on macOS).

| Group   | Control                                                                                             | Element                                    | State                                                                  | Shortcut                        |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------- |
| History | Undo, Redo                                                                                          | Toolbar.Button (icon)                      | unavailable when it can't                                              | Mod-z; Mod-Shift-z, Ctrl-y      |
| Block   | Block type: Normal text, Heading 2, Heading 3, Quote, Code block                                    | Listbox (`native="never"`)                 | the current block, or "Several types"                                  | –                               |
| Text    | Bold, Italic, Underline, Strikethrough, Code                                                        | Toolbar.Toggle (icon)                      | `aria-pressed`                                                         | Mod-b, Mod-i, Mod-u             |
| Lists   | Bulleted list, Numbered list, Increase indent, Decrease indent                                      | Toolbar.Toggle and Toolbar.Button (icon)   | `aria-pressed`; the indent buttons are unavailable when they can't act | Tab, Shift+Tab (in a list item) |
| Insert  | Link, Image, Table                                                                                  | Toolbar.Item + Popover.Trigger, and Button | Link is pressed on a link                                              | Mod-k (link)                    |
| Clear   | Clear formatting                                                                                    | Toolbar.Button (icon)                      | unavailable with nothing to clear                                      | –                               |
| Table   | Add row above, below; Add column before, after; Delete row; Delete column; Delete table; Header row | Toolbar.Button and Toolbar.Toggle (text)   | present while the document has a table (see below)                     | –                               |

- **"Italic", not "em":** Tiptap's Italic mark renders `<em>`. The control is named Kursiv or Italic, the word users know.
- **Headings 2 and 3 by default** (DESIGN.md: resident text stops at `h3`). `defaultExtensions({ heading: { levels: [2, 3, 4] } })` adds more, and the picker follows the configured levels.
- **Link form:** an Address field (TextInput `type="url"`, required, checked against the allowed protocols, with an inline error), the link text with a hint about 2.4.4, "Save", "Remove link" (on a link only) and "Cancel". Escape closes it, and focus returns to the text at the selection.
- **Image form:** an Address field, "What does the image show?" (required unless "Decorative image" is ticked, which writes `alt=""`), "Insert" and "Cancel".
- **The Table group never makes the toolbar jump** (spec §6.6.5). It's present, as the last group, while the document has at least one table. Its buttons are available while the caret is in a table and `aria-disabled` outside one. It appears when the user inserts or pastes a table (focus goes to the first cell) and goes when the user deletes the last one (focus goes back to the text), so it changes only on the user's own action (3.2.1, 3.2.2). If the remembered toolbar item was in the group, the Tab stop falls back to the first item. New tables are 3×3 with a header row.
- **Input rules are off** (`# `, `* `, `**x**`, `--`), because they change content without telling a screen reader user. `defaultExtensions({ inputRules: true })` turns them on.

### Accessibility contract (draft)

`packages/rich-text/src/rich-text-editor.a11y.md`. The design spec §7.4 is the source.

- **Roles:** the content is `textbox` with `aria-multiline="true"`, named by the Field label and described by the Field. The toolbar is `toolbar` with a name and `aria-controls`. Groups are `group` with names. Toggles carry `aria-pressed`. The block type is a select-only `combobox`. Link and image are Popover `dialog`s with names. Headings, lists, quotes, tables and images in the text are the HTML elements, so the AT reads the structure.
- **Focus:** Tab order is the toolbar (one stop), then the text. Alt+F10 from the text goes to the toolbar's last focused control. Escape in the toolbar (with no popup open) goes back to the text, at the selection. After a toolbar command from the keyboard, focus stays on the control, as APG's toolbar does, so several formats can be set in a row; Escape goes back to the text. A pointer press doesn't take focus from the text (the control prevents focus on `pointerdown`), so the caret and selection stay. The Listbox and Popover controls return focus to the text when they close with a choice.
- **Keyboard:** the toolbar uses a roving tabindex and the text is native. Arrows wrap in the toolbar. **Shortcuts are on** for the platform's text-editing convention only (a change to the keyboard skill's rule 7 for text editors, approved by the maintainer on 2026-10-04).

| Key                                  | Context                          | Action                                                                                                                                                                |
| ------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                      | Editor, outside lists and tables | The toolbar (one stop), then the text, then the next field                                                                                                            |
| Tab / Shift+Tab                      | Text, in a list item             | Indent and outdent the item, only when that is possible. Otherwise they move focus as usual. Shift+Tab never indents and never lifts a top-level item out of its list |
| Tab / Shift+Tab                      | Text, in a table                 | Next and previous cell. Tab in the last cell and Shift+Tab in the first cell leave the editor. Tab never adds a row                                                   |
| Escape, then Tab / Shift+Tab         | Text, anywhere                   | Leaves the editor forwards or backwards. Any other key after Escape cancels it                                                                                        |
| Alt+F10 (Option+F10 on macOS)        | Text                             | Moves focus to the toolbar                                                                                                                                            |
| Escape                               | Toolbar                          | Back to the text at the selection                                                                                                                                     |
| ArrowLeft / ArrowRight, Home / End   | Toolbar                          | As Toolbar (Plan 0035)                                                                                                                                                |
| Mod-b / Mod-i / Mod-u                | Text                             | Bold, italic, underline. Announces "on" or "off" politely (`richText.formatOn`, `formatOff`)                                                                          |
| Mod-k                                | Text                             | Opens the link form                                                                                                                                                   |
| Mod-z; Mod-Shift-z, Ctrl-y (Windows) | Text                             | Undo; redo                                                                                                                                                            |
| AltGr (Control+Alt) + a key          | Text, Windows, Nordic layouts    | Types the character (`@ £ $ € { [ ] } \`). Never a shortcut                                                                                                           |
| Arrow keys                           | Text, in a table                 | Move between cells (ProseMirror's own)                                                                                                                                |
| Shift+Enter                          | Text                             | Line break                                                                                                                                                            |
| Escape                               | Link or image form               | Closes it, focus back to the text at the selection                                                                                                                    |

Off by default, because they clash with AltGr, browsers, AT keys or Nordic layouts (spec §6.6.6). No shortcut uses Caps Lock, Insert, Scroll Lock or Control+Option on macOS (APG keyboard practice): Control+Alt+1–6 and Control+Alt+C, Control+Shift+S, Control+E, Control+Shift+B, and Control+Shift+7 and 8.

- **Advice (2.1.2):** the `KeyboardHint` says how Tab works in lists and tables and that Escape then Tab leaves. It's visible and in the editor's `aria-describedby`, as in WCAG's own Understanding example for 2.1.2.
- **Announcements:** a polite "on" or "off" after a formatting shortcut. Nothing for toolbar presses, because the state is in `aria-pressed`. The link form's error is announced through its Field.
- **WCAG SCs:** 1.1.1, 1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.1.2, 2.1.4, 2.4.3, 2.4.4, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.1, 3.2.2, 3.3.1, 3.3.2, 3.3.8, 4.1.2, 4.1.3.

### i18n strings

A new `richText` namespace in `KvirnMessages` (`packages/i18n/src/types.ts`) and all six locales. It includes the toolbar name, every control name, the block format names, the link and image form labels, buttons and errors, the table controls, and the table announcement. The design spec owns the en and sv copy. fi, nb and nn are written by the agent, as in earlier plans, and `se` uses the English placeholder like the other strings that aren't translated yet.

`@kvirn-ui/rich-text` needs `useMessages`, which is internal to `@kvirn-ui/react` by design. It's exported from a `@kvirn-ui/react/internal` subpath, documented as unstable and for Kvirn packages only, and not part of the public API (see Decisions).

### Theming surface

- `kv-rich-text`, `kv-rich-text__toolbar` and `kv-rich-text__content` in a new `theme.css` section, from the design spec. The content uses `kv-prose` typography for headings, lists, quotes, code and tables, scaled to the field.
- State: `data-focused`, `data-focus-visible`, `data-invalid`, `data-required`, `data-disabled`, `data-readonly` and `data-empty` on the root.

## Phases

The work is split in two, because the toolbar parts wait for [Plan 0037](0037-tooltip.md) (Tooltip):

- **Phase A (written 2026-10-04, gates not yet run):** the gate and tooling changes, the dependencies and their docs, the `@kvirn-ui/rich-text` scaffold, the `@kvirn-ui/react/internal` subpath, the `richText` messages, `defaultExtensions` with the Kvirn keymap, and `useRichTextEditor` with `Root`, `Content` and `KeyboardHint`.
- **Phase B (written 2026-10-04, gates not yet run):** `Toolbar`, `DefaultControls`, `CommandButton`, `CommandToggle`, `Group`, `BlockFormat`, `LinkControl`, `ImageControl`, `TableControls`, `Icon`, the `labels` and `tooltips` options, the contract and docs, the `theme.css` section, the stories and the e2e spec. Plan 0037 (Tooltip) and Plan 0035 (Toolbar, Toggle, ButtonGroup) are built, and the toolbar uses them.

## Tasks

- [x] **Gate and tooling changes (approved 2026-10-04):**
  - Root `vite.config.ts` test projects include `packages/rich-text`.
  - `tooling/keyboard-docs` scans `packages/*/src`.
  - `no-restricted-imports` bans `prosemirror-*`, and `@tiptap/*` outside `packages/rich-text` and storybook.
- [x] **Dependencies (maintainer approval, given 2026-10-04):** catalog entries pinned exactly. In the PR description: licence (MIT), network (none) and install scripts (none). (Audited: every one of the 52 added packages is MIT and has no install script, see the PR description.)
- [x] **Dependency docs:** update `docs/architecture.md`, `docs/vision.md` (principle 8), `docs/engineering.md` and the `regulations` skill. (And AGENTS.md rule 6 and the repo maps.)
- [x] **Scaffold:** `packages/rich-text` (package.json, vite pack config with `@tiptap/*` never bundled, index with `'use client'`), the storybook dependency, then `pnpm install`.
- [x] **`@kvirn-ui/react/internal` subpath (approved 2026-10-04):** exports `useMessages` (and `useFocusVisible` if needed), with a test that the public entry doesn't export them.
- [x] **`richText` messages:** in `types.ts` and all six locales, then `vp run i18n:check`. (Written; `i18n:check` is the orchestrator's.)
- [x] **`defaultExtensions` and the Kvirn keymap,** tests first: link protocols, image `src`, Tab in lists and tables (only where it can act, last and first cell leave, never adds a row), Escape then Tab, Alt+F10, Mod-k, the removed shortcuts, input rules off, and every AltGr character on the sv, fi and nb Windows layouts typed as text. (Tests written, not yet run.)
- [x] **`useRichTextEditor`, `Root` and `Content`,** tests first: Field wiring, the hidden input and form reset, empty is `''`, controlled and uncontrolled value, html and json, disabled and read-only, the label click, dev warnings, axe. (Tests written, not yet run. `KeyboardHint` is in this phase too.)
- [x] **Toolbar parts,** tests first: `CommandButton`, `CommandToggle`, `DefaultControls` include and exclude, `BlockFormat`, `LinkControl`, `ImageControl`, `TableControls`, focus return, re-render scope. (`rich-text-toolbar.test.tsx` and `link-image-forms.test.tsx` written, not yet run. Re-render scope: the controls read flat primitives through `useEditorState`, and the context value is memoized, but no test measures renders.)
- [x] **Contract and docs:** `rich-text-editor.a11y.md`, plus `rich-text-editor.md` (usage, adapting with Tiptap, server-side sanitizing, lazy loading, SSR). (Also the keyboard skill's rule 7 exception and an editor table in `key-tables.md`, and the editor's rows in `dev-warnings.md`.)
- [x] **`theme.css`:** the section and content styles, then `vp run theme:check`. (Section 16 written. `theme:check` is the orchestrator's.)
- [x] **Stories in `apps/storybook/src/components/rich-text-editor/`:** (written, not yet run)
  - Default (every option a control).
  - Keyboard.
  - In a form (post and reset), Invalid, Disabled, ReadOnly, Controlled (JSON).
  - Custom extension (Highlight), Without tables and images, Long Finnish content.
  - RTL, ForcedColors, and the 320px reflow check.
- [x] **`rich-text-editor.e2e.ts`:** every keyboard row (the link and image forms, the table group, Tab never traps), and axe on every story. (Written, not yet run. The AltGr characters are unit-tested only: Playwright on Linux can't type AltGr.)
- [x] **Changesets:** `@kvirn-ui/rich-text` (new), `@kvirn-ui/react` (the internal subpath), `@kvirn-ui/i18n` and `@kvirn-ui/theme`. (`rich-text-editor-foundation.md` and `rich-text-editor-toolbar.md`.)
- [ ] **Finish:** gates, then accessibility-reviewer. (The roadmap row is added: `in progress`.)

## Decisions

- **A separate package with every Tiptap package as a peer** (the maintainer chose the package on 2026-10-04, and peers are this plan's choice). One version of ProseMirror, chosen by the adopter. `@kvirn-ui/react` stays free of Tiptap.
- **Gate and tooling changes approved** (the maintainer, 2026-10-04): the test projects, the keyboard-docs scan and the import rules in Tasks.
- **The text is `kv-prose`, and nothing is restyled for the editor** (the maintainer, 2026-10-04: reuse, don't reinvent). The hint and the count reuse the Field.Hint style.
- **Tiptap as a runtime dependency of `@kvirn-ui/rich-text`** (the maintainer asked for Tiptap on 2026-10-04). Rule 6's list becomes: React as a peer, the three TanStack packages in core, and Tiptap as peers of `@kvirn-ui/rich-text` only.
- **Link, image and table use Popover forms and a contextual group** (the maintainer, 2026-10-04). Nothing waits for Menu or Dialog.
- **Tab indents in lists and moves between cells in tables, with an advised exit** (the maintainer, 2026-10-04; an accessibility trade-off recorded in the `keyboard` skill). WCAG 2.1.2 allows a component to use Tab if the user is told how to leave, and its Understanding page uses a rich text editor with Tab indentation and Alt+F10 as a passing example. Tab only acts where it can (a list item that can be nested, a table cell that isn't the last), so otherwise it still leaves. Escape then Tab always leaves. Shift+Tab never indents: it is the standard key for moving back and for outdenting in every editor. Tiptap's Tab in a table's last cell (it adds a row) is replaced. The toolbar's indent buttons do the same without Tab.
- **Alt+F10 and Escape** follow the editor convention (CKEditor, TinyMCE), in addition to Tab order.
- **`useMessages` through an internal subpath,** not the public API (the maintainer, 2026-10-04). The alternative, making `useMessages` public, would commit us to its shape.
- **No H1, headings 2 and 3 by default.** The page owns its H1, and DESIGN.md stops resident text at `h3`. Levels are configurable.
- **Shortcuts on, limited to Mod-b, i, u, k, z, Shift-z and Ctrl-y** (the maintainer, 2026-10-04, provided none gets in the way of keyboard navigation or AT keys). This changes keyboard skill rule 7 for text editors. Control+Alt is AltGr on Windows, and Nordic users type `@ £ $ € { [ ] }` with it.
- **The Table group is present while a table exists, disabled outside one** (spec D7), instead of showing and hiding with the caret, so moving the caret never makes the toolbar jump.
- **Icon-only buttons, with Tooltips, configurable** (the maintainer, 2026-10-04). Icon-only buttons are used for the well-known formatting actions, with i18n names, `aria-keyshortcuts` and a Tooltip (Plan 0037, not `title`). `labels="icon-and-text"` turns visible text on, and `tooltips={false}` turns tooltips off. The table actions are text buttons. DESIGN.md gets the exception for formatting toolbars.
- **The toolbar wraps group by group and has no "More" button** (spec D5), so everything stays visible at 320px.
- **Underline and Strikethrough stay in the default toolbar,** because the maintainer asked for them. The docs say that underlined text looks like a link, and that screen readers don't announce strikethrough.

- **Escape inside a Dialog** (the maintainer, 2026-10-04): the first Escape in the text arms the exit and is consumed, and a second Escape reaches the Dialog. Dialog isn't built yet. This is recorded for when it is.
- **Deleting a table needs no confirmation** (the maintainer, 2026-10-04; an exception to DESIGN.md's rule for destructive actions, written there): it is undoable with Mod-z, and it's announced politely ("Tabellen togs bort. Ångra med Ctrl+Z"), like every other edit in the text.
- **`imageSources`** (the maintainer, 2026-10-04): an allow-list of image origins. The default is same-origin and relative addresses only, so a resident's text never loads images from a third-party server (GDPR, rule 7). An address outside the list gets an inline error in the image form, and a pasted image from outside the list is dropped with a polite message.
- **The visual items in the design specs are accepted** (the maintainer, 2026-10-04): a disabled pressed toggle as a grey tile (`text-muted` as a fill), tooltips with the `md` radius and 16px text, and the DESIGN.md wording for icon-only formatting buttons and toolbar density.

### Decisions taken in phase A

- **Keys are decided in one place, a plugin's `handleDOMEvents.keydown`, not in Tiptap's keymaps.** ProseMirror runs a plugin's DOM handlers before its own key handling and skips that handling when one returns `true`. That is the only way to let Tab leave (or Escape then Tab leave) without ListItem's, ListKeymap's or the table's own Tab binding acting behind it, and without `stopPropagation`, so a Dialog's own Tab handling still sees the key. Tiptap's ListKeymap also binds Tab at the start of a paragraph after a list, which pulls the paragraph into the list: it is skipped the same way. The same handler keeps Control+Alt (and Command+Option) chords and the removed shortcuts (Mod+Shift+S, Mod+E, Mod+Shift+B, Mod+Shift+7 and 8) away from ProseMirror, so AltGr always types: ProseMirror matches `@` by its key code (`2`), which Tiptap binds to a heading.
- **The first Escape is consumed (`preventDefault` and `stopPropagation`),** per the accepted Q12, so a native `<dialog>` or a Popover around the editor doesn't close on it. The second Escape passes on.
- **The keymap's callbacks live in `editor.storage.kvirnKeymap`,** set by the Root after the editor exists (`onFocusToolbar`, `onOpenLinkForm`, `onFormatToggle`, `onListLevelChange`), so `defaultExtensions()` stays plain data and an adopter can spread it into their own list.
- **Typing rules are switched off by the keymap extension** (`onBeforeCreate` sets the editor's `enableInputRules`), because that is an editor option in Tiptap, not an extension option, and `defaultExtensions({ inputRules: true })` has to turn it back on.
- **`@kvirn-ui/react/internal` exports more than `useMessages`:** the Field's context and `useDescriptionPart` (so the editor is wired to its Field and the instruction registers as one of its descriptions), `joinIds`, `renderPart`, `useMergedRef`, `warnOnce`, the quiet announcer, and `isKeyboardFocus` with `trackModality` (the editor's focus ring, not `useFocusVisible`, because its handler reads `currentTarget`, which is the wrapper). Each is the minimum the editor needs. All are unstable.
- **`isKeyboardFocus` treats a contenteditable as text entry** (`use-focus-visible.ts`), so a click in the editor shows only the 2px edge and Tab shows the ring, as for text inputs (Plan 0031). A one-selector change in `@kvirn-ui/react`.
- **Empty is wider than the spec's wording:** a document with no text and no image, table or other non-text content is `''` (or `null` as JSON), so an empty heading or list item counts as empty too, not only a single empty paragraph. Otherwise `required` would pass on an empty heading. Whitespace-only text is empty.
- **The keyboard instruction is rendered by the Root, under the box** (`keyboardHint`, default true), not by `DefaultControls`: the design spec puts it outside the box, after it, and `DefaultControls` renders inside the toolbar. `keyboardHint={false}` plus a `RichTextEditor.KeyboardHint` of your own places it elsewhere. The part registers as one of the Field's descriptions, in DOM order, and is not rendered (and not registered) while the editor is read-only, disabled, or has neither lists nor tables. The dev warning for a custom toolbar with lists and no instruction is therefore not needed: the Root always has one unless it was turned off on purpose.
- **Two message keys beyond the design spec's table:** `richText.imageUrlNotAllowed` (an address outside `imageSources`, as an inline error in the image form) and `richText.imageSourceNotAllowed` (a pasted image dropped because of it). Both are added to the spec's §4.3. The paste announcement is wired in phase B with the Image control.
- **No `dir` anywhere** (the maintainer, 2026-10-04): the editor writes no `dir` attribute and sets no `textDirection`; the direction comes from `KvirnProvider` and the page, so a table inherits it and the column buttons follow its computed direction.
- **Links carry no `target` and no `rel`,** and typing or pasting an address autolinks only an allowed one. A pasted link that already has a `target` keeps it (Tiptap parses any declared attribute): sanitize on the server.
- **Tiptap injects a small `<style>` of ProseMirror's structural rules at runtime** (`injectCSS`, `white-space: pre-wrap`, the gap cursor). They are needed for editing to work without the theme, so the default stays on. `editorOptions.injectCSS: false` plus `injectNonce` turns it off or adds a CSP nonce. Open for the maintainer (rule 5, "headless packages ship zero CSS"): the gap cursor is `black` and blinks without checking `prefers-reduced-motion`, and phase B's theme section should restyle it and the hide-selection rule.

### Decisions taken in phase B

- **Controls take `label` and `icon`, not `aria-label` and children.** The plan's sketch (`aria-label="Markera"` with an icon as children) can't show the name in `labels="icon-and-text"` mode, so `CommandButton` and `CommandToggle` take `label` (the name: `aria-label` and the tooltip's first line when icon-only, the visible text otherwise), `icon`, `shortcut` (`['Mod-b']`, for `aria-keyshortcuts` and the tooltip), `isAvailable(editor)`, and `isPressed(editor)` and `onPress(editor)`. A control with no `icon` is a text button in both modes (the table actions). The sketch in the API section is updated to match.
- **Icons are the editor's own.** The built-in set has no bold, italic or list icons, and the `Icon` component's API is changing in another plan, so `RichTextEditor.Icon` draws `name` (fifteen built-in editor icons) or `paths` (your own) as a decorative `<svg class="kv-icon">`. It takes `currentColor` and the text size.
- **Pointer press keeps focus in the text, keyboard press keeps focus on the button.** `mousedown` is prevented on every control. Commands never chain `.focus()`. `CommandButton`'s `onPress` can, if the command should move focus into the text.
- **Popovers render into a slot after the toolbar** (`createPortal` into `div.kv-rich-text-popups`, `display: contents`), so they are siblings of the toolbar as the spec's §5.5 says. This needed the Plan 0035 follow-up: `Popover.Popup` provides `ToolbarContext` as `null`, so the forms inside don't register as items or make an unnamed `ButtonGroup` warn. The Toolbar's key handler already ignores keys from elements that aren't items.
- **Focus after Escape, Cancel and Apply goes to the text, at the selection,** also when the form was opened with the toolbar button (the brief and the plan's Link form text; the design spec §7.4 says "where it was opened from"). A press outside a popover leaves focus where the user pressed. The contract says so. Revisit if the review prefers the spec's wording.
- **Link and Image anchor to their toolbar button, also for Control+K,** not to the caret's line (the spec §6.6.7). Placing a popover at the caret needs a virtual anchor the Popover doesn't have yet. Recorded as a known issue in the contract.
- **The Link button is not `aria-pressed` on a link** (the plan's table said "pressed on a link"). It is a popup button (`aria-haspopup`, `aria-expanded`), and a button that is both a toggle and a popup is a muddled role. The form's title ("Ändra länk") and the "Ta bort länk" button say it is on a link.
- **Link and image address checks.** A link must be a full `https`, `http`, `mailto` or `tel` address, or a path or fragment on this site. A bare `www.exempel.se` gets the format error, because guessing a scheme would link somewhere the author didn't see. An image address must be `http(s)` or a path, and whether its origin is allowed is the editor's answer (`editor.can().setImage`), so the allow-list lives in one place, the Image extension.
- **The picker is not the Field's control.** `BlockFormat` wraps its Listbox in `FieldContext` as `null`: otherwise it would take the Field's id (a duplicate of the text's), description and state.
- **The toolbar's name** is a visually hidden "Formatering" followed by the Field's label (`aria-labelledby`), and `aria-label="Formatering"` outside a Field. The toolbar is not rendered while the editor is read-only, and while it is disabled the controls are natively disabled with no tooltips.
- **Escape on the toolbar** is handled in the capture phase: a control with an open popup (`aria-expanded="true"`) and an open tooltip take it first, otherwise it goes back to the text.
- **`richText.tableDeleted` takes `{ shortcut }`** (the platform's undo key, "Ctrl+Z" or "⌘Z"), so the announcement says how to undo (the maintainer's decision, written into the spec's §4.3).
- **The picker names heading levels 2 to 4.** Other configured levels have no message and warn. Levels 1, 5 and 6 are outside the design (the page owns the H1).
- **Stories use a `Highlight` mark of our own** for Custom extension, not `@tiptap/extension-highlight`, which would be a new dependency. `@tiptap/core` is a devDependency of the Storybook app for it.
- **Not built:** the inactive-selection highlight while focus is on a toolbar button (the browser's own is used), the picker's stacked-option width (a `min-inline-size` floor of 12em instead), a sticky toolbar option, and the paste handler that announces `imageSourceNotAllowed`: the parse rule already drops the image, but nothing says so yet.

## Risks & open questions

- **Screen reader support for contenteditable** is the biggest risk. Agents mark the manual AT matrix `pending`. The `beta` exit needs NVDA with Firefox and Chrome, JAWS with Chrome, VoiceOver on macOS and iOS, and TalkBack.
- **Bundle size** (about 142 KB gzipped): document `React.lazy`, and check that the package tree-shakes (`sideEffects: false`).
- **Shortcut clashes:** Mod-Shift-b toggles the bookmarks bar in some browsers, and Mod-Shift-s and Mod-Shift-7/8 may clash on some keyboard layouts. Every shortcut is shown on its button (the design spec) and has a toolbar route, so none is the only way (2.1.4 needs a modifier, and there is one).
- **The Listbox trigger in the toolbar,** with Home and End (see Plan 0035).
- **The label click** on a contenteditable is handled in code, not by the browser. Test it.
- **Server-side sanitizing** is the adopter's job. The docs must say so plainly, and never call the output safe.

## Testing strategy

- Component tests in Vitest browser mode, using the real Tiptap.
- e2e for every keyboard row, the popover forms and the contextual table group.
- One test asserts that two Tiptap copies can't load: the package resolves to one `@tiptap/pm`.

## Rollout

`@kvirn-ui/rich-text` 0.x, `alpha` once gates 1 to 6 pass. Adopters install `@kvirn-ui/rich-text` and the Tiptap peers.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`) (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
