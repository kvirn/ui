# Plan 0060: CopyButton and CodeBlock

- **Status:** Approved
- **Owner:** component-engineer
- **Created:** 2026-10-06 · **Target:** M1
- **Related:** [design spec](../design/docs-site-components.md) §5 G7, [municipality-reference-site](../design/municipality-reference-site.md) (B23, P8), [0053](0053-docs-as-municipality-site.md), Announcer (`packages/react/src/announcer`), `keyboard`, `accessibility`, `api-conventions`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

A resident copies the case or payment reference number on the confirmation page, and a developer copies a code sample, with one button that says "Copy", tells a screen-reader user whether it worked, and still lets them copy by hand when the browser refuses.

## Non-goals

- Syntax highlighting (it needs a dependency, which needs maintainer approval).
- The `numeric` text class for a reference number (B23): a plain span with `font-family-mono` is the adopter's, decided with the confirmation page slice.
- A visible "Copied" cue (see Decisions): the confirmation is announced; a visual cue needs a `ux-designer` spec.
- Copying rich content, images or HTML. Text only.
- A legacy `document.execCommand('copy')` fallback.

## Background

- Reference numbers are copied from the confirmation page (municipality-reference-site P8, B23, G7 amended). The docs copy code samples (`apps/docs` interim `CodeBlock`: a `pre` that wraps).
- The Clipboard API (`navigator.clipboard.writeText`) exists only in secure contexts, needs a user activation, and rejects when permission is denied or the document isn't focused. A server render has no `navigator`.
- Prior art: GOV.UK has no copy button; Primer's `ClipboardCopy` and Bootstrap docs change the visible label to "Copied", which changes the accessible name (a 4.1.3 workaround that makes the name unstable and trips 2.5.3). Here the name stays "Copy" and the result goes through the shared live region (4.1.3).
- Layout of a small component: `packages/react/src/card/` (parts) and `kbd/` (flat).

## Design

### API sketch

```tsx
// A reference number
<p>
  Ditt ärendenummer är <span ref={numberRef}>PK-2026-004217</span>
  <CopyButton text="PK-2026-004217" textRef={numberRef} aria-label={…} />
</p>

// A code sample
<CodeBlock.Root>
  <CodeBlock.Label>Installera</CodeBlock.Label>
  <CodeBlock.Code>pnpm add @kvirn-ui/react</CodeBlock.Code>
  <CodeBlock.Copy />
</CodeBlock.Root>
```

- `useCopyButton({ text, textRef?, onCopied?, onCopyError?, disabled?, focusableWhenDisabled?, messages? })` returns `buttonProps` (from `useButton`, so a disabled button blocks it), `label` (`copyButton.label`), `status` (`'idle' | 'copied' | 'failed'`), `isDisabled`, `isFocusVisible`. `text` is a string or a function that returns it at click time.
- `CopyButton` is flat (one `<button>`): `ButtonProps` plus `text`, `textRef`, `onCopied`, `onCopyError`, `messages`. `children` replace the label (the adopter's language and wording, 2.5.3). `render` must stay a `<button>`. Display name `CopyButton`.
- `useCodeBlock()` returns `rootProps`, `labelProps`, `codeProps`, the shared context value (`codeRef`, `labelId`) and `hasLabel`. `CodeBlock` is a namespace (`Root`, `Label`, `Code`, `Copy`) with flat exports `CodeBlockRoot`, `CodeBlockLabel`, `CodeBlockCode`, `CodeBlockCopy`. `Copy` is a thin typed wrapper over `CopyButton` that reads the Code's text and element from context (`text` and `textRef` can still be given).
- Elements: Root `<div class="kv-code-block">`, with `role="group"` and `aria-labelledby` once a Label is mounted; Label `<p class="kv-code-block-label">`; Code `<pre class="kv-code-block-code">` (children are the code; an adopter may nest `<code>`); Copy `<button class="kv-button kv-code-block-copy">`. Each takes `render`, `ref` and a merged `className`.
- Behaviour on click: write `text` with `navigator.clipboard.writeText` (from the provider's env, `undefined` on the server and when the API is missing). Success: `status` becomes `copied`, announce `copyButton.copied` (polite), call `onCopied`. Failure (no API, insecure context, rejection): `status` becomes `failed`, announce `copyButton.failed` (assertive: the user must act), select the `textRef` element's contents with `getSelection().selectAllChildren` so Ctrl+C works, call `onCopyError`. Focus never moves. `status` returns to `idle` after 5 s.

### Accessibility contract (draft)

Keyboard per the `keyboard` skill: focus strategy native, selection follows focus n/a, arrows wrap n/a, shortcuts none. Rows are the Button's (Plan 0003) plus the copy result.

| Key       | Action                                                                        |
| --------- | ----------------------------------------------------------------------------- |
| Tab       | Moves focus to the copy button (the Code `pre` is never a Tab stop)           |
| Shift+Tab | Moves focus to the previous focusable element, and off the button             |
| Enter     | Copies. Focus stays on the button. The result is announced                    |
| Space     | Copies on key up. Focus stays on the button. The result is announced          |
| Tab       | Disabled button: skipped. Focusable disabled: reached, and copying is blocked |
| –         | On failure the text is selected and focus stays on the button                 |

- Roles / ARIA: CopyButton is a `<button type="button">`, name from its content (`copyButton.label`, "Copy"), never changed to "Copied". `data-status` is `idle`, `copied` or `failed`. `CodeBlock.Root` is `role="group"` named by the Label through `aria-labelledby`, only while a Label is mounted. `Code` is a `<pre>` with no role, no `tabindex`, no scroll: it wraps.
- Focus management: never moved, no trap. Selection on failure is not focus.
- Announcements: `copyButton.copied` (polite) and `copyButton.failed` (assertive) through `useAnnouncer`. Nothing on render. A repeat press says it again.
- WCAG SCs: 4.1.3 (the result), 4.1.2, 2.5.3 (visible label is in the name), 2.1.1, 1.4.10 (the code wraps, no 2D scroll), 1.3.1, 2.5.8 (the Button's size), 3.1.2 (`lang` on the code is the adopter's).

### i18n strings

| Key                 | en                                                    | sv                                                               |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `copyButton.label`  | Copy                                                  | Kopiera                                                          |
| `copyButton.copied` | Copied                                                | Kopierat                                                         |
| `copyButton.failed` | Could not copy. Select the text and copy it yourself. | Det gick inte att kopiera. Markera texten och kopiera den själv. |

fi Kopioi / Kopioitu / Kopiointi epäonnistui. Valitse teksti ja kopioi se itse. nb Kopier / Kopiert / Kunne ikke kopiere. Marker teksten og kopier den selv. nn Kopier / Kopiert / Kunne ikkje kopiere. Marker teksten og kopier han sjølv. se is an English placeholder. fi, nb and nn are drafts for native review (`pending`). CodeBlock has no strings: its Label is the adopter's text.

### Theming surface

Classes: `kv-code-block`, `kv-code-block-label`, `kv-code-block-code`, `kv-code-block-copy`. State: `data-status` on the button, `data-disabled`, `data-focus-visible` (Button's). Tokens: existing only (`surface`, `border-subtle`, `text`, `font-family-mono`, `font-code-*`, `space-*`, `radius-md`); no new token or colour pair. The code surface and text are the prose `pre` pair (`text` on `surface`), already in `theme:check`. The Root is a `not-prose` boundary. Forced colours: the code keeps a `CanvasText` edge.

## Tasks

- [x] Plan and draft contract
- [x] Core: none needed (no machine; `core` untouched)
- [x] `copy-button/`: `use-copy-button.ts`, `copy-button.tsx`, test, `.md`, `.a11y.md`
- [x] `code-block/`: `use-code-block.ts`, `code-block.tsx`, test, `.md`, `.a11y.md`
- [x] i18n `copyButton` in all six locales (types, en, sv, fi, nb, nn, se)
- [x] Theme section 9e in `theme.css`
- [x] Exports in `index.ts`, `naming.test.tsx`
- [x] Stories (every state, RTL, forced-colors, 320px, Keyboard, `a11yContract`)
- [x] Changeset, roadmap row
- [x] Visible status (spec `docs/design/copy-button.md`): hook (failed stays), `kv-copy-status` in `CopyButton`, theme 9f, both contracts, DESIGN.md, stories, tests
- [ ] AT matrix run (`pending`), accessibility-reviewer (`pending`)
- [ ] Docs pages (a later step: `apps/docs` is not touched here)

## Decisions

- **Name stays "Copy"** (spec G7): the alternative, swapping the label to "Copied", changes the name mid-interaction and needs a live region anyway.
- **`failed` is assertive, `copied` polite.** Success is confirmation; failure needs an action now.
- **Selection on failure goes through `textRef`** (an element the adopter owns), because the button can't know where the text is displayed. `CodeBlock.Copy` supplies the Code element itself. Without a `textRef` the failure is still announced.
- **No `execCommand` fallback.** It is deprecated and a second path to test; the manual-copy path covers the same users.
- **Visible status, accepted 2026-10-06** (`docs/design/copy-button.md`): (1) `CopyButton` renders `span.kv-copy-status` as a sibling after the button (a fragment); `CodeBlock.Copy` inherits it; `status={false}` opts out; no separate Status parts. (2) `failed` stays until the next press and never times out; `copied` clears after 5 s or on the next press. (3) The icon (`check` / `warning`) is not tinted: no new colour pair. (4) One failure string. (5) The status reuses `copyButton.copied` / `copyButton.failed`: no new i18n key. It is not a live region and not the button's description (the Announcer speaks it). The label and name never change (2.5.3). A disabled button renders no status. `.kv-code-block` became `flex-flow: row wrap`.
- **`CodeBlockContext` stays unexported:** no component's context is public (only `FieldContext`, in `/internal`), so the `useCodeBlock` comment now says your own parts read `labelId` and `codeRef` from `context`.
- **`CodeBlock.Root` is `role="group"` only while labelled**, via a layout-effect registration, so an unlabelled block adds no empty group.
- **`Code` renders `pre` only.** `<code>` inside is the adopter's; the theme resets `pre code`.
- **No highlighting, no new dependency.**
- **`onCopied`, not `onCopy`:** `onCopy` is the native clipboard event on `ButtonProps` and would clash.
- **`CopyButton` renders through `Button`** (an internal `useCopyAction` holds the write, the announcement and the status), so the Button's gating and dev warnings apply. `useCopyButton` is the same action over `useButton`.
- DESIGN.md: a "Code block and copy button" subsection marked "Maintainer review (Plan 0060)".
- The `status` reset timer uses `window.setTimeout` from the provider env and is cleared on unmount.

## Risks & open questions

- Safari needs the write inside the user activation: `writeText` is called synchronously in the click handler (a function `text` is read synchronously too).
- Selecting text moves the selection, not focus: a screen reader in browse mode may not read it. The `failed` message tells the user what to do.
- Open: fi, nb, nn and se strings need native review.

## Testing strategy

Standard pyramid. The clipboard is a stub on `navigator` that records the written text; a second stub rejects. A named test per contract row, per ARIA state and per announcement (read from the live region), and axe on every state. No CSS tests.

## Rollout

Minor changeset for `@kvirn-ui/react`, `@kvirn-ui/i18n` and `@kvirn-ui/theme`. `0.x`, no migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
