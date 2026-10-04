# Plan 0036: Rich text editor (`@kvirn-ui/rich-text`)

- **Status:** Approved (the maintainer, 2026-10-04)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M3
- **Related:** [0034](0034-textarea.md), [0035](0035-toggle-toolbar-button-group.md) (Toolbar, ButtonGroup and Toggle, a prerequisite), [0037](0037-tooltip.md) (Tooltip, a prerequisite), [0034](0034-textarea.md) (CharacterCount), [0022](0022-listbox-combobox-autocomplete.md) (Listbox), the Popover, [design spec](../design/rich-text-editor.md), `api-conventions`, `accessibility`, `keyboard`, `testing`, `storybook-docs`, `forms`, `overlays-and-lists`, `theme-css` and `regulations` skills

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
        aria-label="Markera"
        isPressed={(editor) => editor.isActive('highlight')}
        onPress={(editor) => editor.chain().focus().toggleHighlight().run()}
      >
        <Icon name="highlight" />
      </RichTextEditor.CommandToggle>
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

## Tasks

- [ ] **Gate and tooling changes (approved 2026-10-04):**
  - Root `vite.config.ts` test projects include `packages/rich-text`.
  - `tooling/keyboard-docs` scans `packages/*/src`.
  - `no-restricted-imports` bans `prosemirror-*`, and `@tiptap/*` outside `packages/rich-text` and storybook.
- [ ] **Dependencies (maintainer approval, given 2026-10-04):** catalog entries pinned exactly. In the PR description: licence (MIT), network (none) and install scripts (none).
- [ ] **Dependency docs:** update `docs/architecture.md`, `docs/vision.md` (principle 8), `docs/engineering.md` and the `regulations` skill.
- [ ] **Scaffold:** `packages/rich-text` (package.json, vite pack config with `@tiptap/*` never bundled, index with `'use client'`), the storybook dependency, then `pnpm install`.
- [ ] **`@kvirn-ui/react/internal` subpath (approved 2026-10-04):** exports `useMessages` (and `useFocusVisible` if needed), with a test that the public entry doesn't export them.
- [ ] **`richText` messages:** in `types.ts` and all six locales, then `vp run i18n:check`.
- [ ] **`defaultExtensions` and the Kvirn keymap,** tests first: link protocols, image `src`, Tab in lists and tables (only where it can act, last and first cell leave, never adds a row), Escape then Tab, Alt+F10, Mod-k, the removed shortcuts, input rules off, and every AltGr character on the sv, fi and nb Windows layouts typed as text.
- [ ] **`useRichTextEditor`, `Root` and `Content`,** tests first: Field wiring, the hidden input and form reset, empty is `''`, controlled and uncontrolled value, html and json, disabled and read-only, the label click, dev warnings, axe.
- [ ] **Toolbar parts,** tests first: `CommandButton`, `CommandToggle`, `DefaultControls` include and exclude, `BlockFormat`, `LinkControl`, `ImageControl`, `TableControls`, focus return, re-render scope.
- [ ] **Contract and docs:** `rich-text-editor.a11y.md`, plus `rich-text-editor.md` (usage, adapting with Tiptap, server-side sanitizing, lazy loading, SSR).
- [ ] **`theme.css`:** the section and content styles, then `vp run theme:check`.
- [ ] **Stories in `apps/storybook/src/components/rich-text-editor/`:**
  - Default (every option a control).
  - Keyboard.
  - In a form (post and reset), Invalid, Disabled, ReadOnly, Controlled (JSON).
  - Custom extension (Highlight), Without tables and images, Long Finnish content.
  - RTL, ForcedColors, and the 320px reflow check.
- [ ] **`rich-text-editor.e2e.ts`:** every keyboard row (the link and image forms, the table group, Tab never traps), and axe on every story.
- [ ] **Changesets:** `@kvirn-ui/rich-text` (new), `@kvirn-ui/react` (the internal subpath), `@kvirn-ui/i18n` and `@kvirn-ui/theme`.
- [ ] **Finish:** gates, then accessibility-reviewer. Roadmap: a new RichTextEditor row.

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

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
