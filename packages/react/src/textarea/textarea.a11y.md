# Accessibility contract: Textarea

- **APG pattern:** none needed. Textarea is a native `<textarea>`. There is no APG pattern for a text field: the name, description and state come from HTML and `aria-describedby`.
- **Deviations:** none from APG. With `characterCount`, `maxLength` is the count's limit and is **not** written as the native `maxlength`: the browser cuts a pasted text without a word, which fails 3.3.8 for a user who pastes from a draft. The user sees how many characters are over and shortens the text. It is a documented choice of this library, approved by the maintainer (Plan 0034, 2026-10-04).
- **Native elements used:** `<textarea>`. `CharacterCount` is a `<p>` (a help text). Neither adds a role.
- **Status:** alpha candidate (Plan 0034). Gates pass, accessibility-reviewer APPROVE (2026-10-04). Manual AT is `pending`.
- **Tests:** `textarea.test.tsx`, `../character-count/character-count.test.tsx` and `packages/core/src/character-count/character-count.test.ts` (the maths). `textarea.stories.tsx` and `textarea.e2e.ts` in `apps/storybook/src/components/textarea/`.

Textarea is the multi-line text control of a Field (`field.a11y.md`). It is a native element: the browser supplies the role (`textbox`, multi-line), the keyboard, selection, spellcheck, paste, undo and autofill. Textarea adds the Field's wiring, the part class, `rows` (5 unless you set it) and, with `characterCount`, a count under the box. The count's part is `CharacterCount`, which the rich text editor (Plan 0036) reuses.

## Roles, states, properties

| Part           | Element / role                                      | ARIA / state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Textarea       | `<textarea>` → `textbox` (multi-line)               | From the nearest Field: `id`, `aria-describedby` (descriptions, the count, help texts, then the error, in DOM order), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled`                                                                                                                                                                                                                                                                                                                                                                                                                                | Class `kv-textarea`. `rows` is 5 unless set. Your own `aria-describedby` ids are kept, after the Field's. `data-focused` while it has focus, and `data-focus-visible` only while that focus came from the keyboard. `data-over` while the count is over the limit. Native `required`, `readOnly`, `disabled`, `autoComplete` and `spellCheck` pass through. No `aria-multiline`: a `<textarea>` already is |
|                | no Field (or only a Fieldset)                       | none added. With `characterCount`, `aria-describedby` points at the count                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                                                                                                                                                                                                                                                                        |
| CharacterCount | `<p>` (a help text), no role, **not a live region** | In a Field: the description id the Field lists in the control's `aria-describedby`. Outside one (also directly in a Fieldset, which is not the box's host): its own `id`, which the Textarea adds and lists in the box's `aria-describedby`, and the count never registers with the Fieldset. This holds for the public `CharacterCount` too: it registers with a Field only, so directly in a Fieldset it keeps the `id` you give it (list it in your control's `aria-describedby`; `character-count.test.tsx › directly in a Fieldset, a count keeps its own id and describes the box, not the fieldset`). `data-over` over the limit, `data-near` from the threshold | Classes `kv-field-help-text kv-character-count`. Directly after the control, so the DOM order is the reading order. The warning icon shows only over the limit and is decorative (`aria-hidden`): the words carry the state                                                                                                                                                                                |

### The count (`characterCount`)

With `maxLength` and `characterCount`, Textarea renders a `CharacterCount` right after the box. `useTextarea` with `CharacterCount` serves your own markup.

- **Limit:** `maxLength` is the limit and is not written as the native attribute. A paste of any length is kept whole (3.3.8). Without `characterCount`, `maxLength` passes through as the native attribute.
- **Text:** while empty, `characterCount.limit` ("Du kan skriva högst 500 tecken."). While typing, `characterCount.remaining` ("Du har 120 tecken kvar."). Over the limit, `characterCount.over` ("Du har 12 tecken för mycket.") with the `warning` icon and weight 600, never `danger`: before submit it is not an error.
- **Counting:** characters as the user sees them (grapheme clusters, `Intl.Segmenter`), so `å` typed as `a` plus a combining ring, or an emoji, counts as one, and a line break counts as one. `countCharacters={(value) => number}` replaces it when the server counts differently: count the same way on both sides.
- **Over the limit is a warning:** nothing blocks typing or paste, and nothing is marked `aria-invalid`. The form decides on submit and writes a Field.ErrorMessage that names the fix. `data-over` is on the count and on the Textarea.
- **`onValueChange(value, details)`** gets `details.length`, `details.limit` and `details.isOverLimit` with `characterCount`.
- **No limit, no count:** `characterCount` without `maxLength` warns once in development and renders nothing.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: Textarea handles no keys itself and never calls `preventDefault` on one. It never moves focus and never auto-advances. Tab leaves the box (it never inserts a tab character), and Enter is a line break: a `<textarea>` never submits its form. In a Field, the Field.Label, the description, the count, the help text and the Field.ErrorMessage are not Tab stops (`field.a11y.md`).

| Key                                         | Context         | Action                                                                                                                                       | Test                                                                                                                    |
| ------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                             | Textarea        | Moves focus in and out, in DOM order. Tab never inserts a tab character                                                                      | `textarea.e2e.ts › Tab moves in and out and never inserts a tab`                                                        |
| Enter                                       | Textarea        | Inserts a line break. It never submits the form                                                                                              | `textarea.e2e.ts › Enter inserts a line break and does not submit`                                                      |
| Characters                                  | Textarea        | Types them. Nothing is filtered, and nothing is cut at the limit                                                                             | `textarea.test.tsx › typing calls onValueChange with the value and reason`                                              |
| Arrow keys / Home / End / PageUp / PageDown | Textarea        | Move the caret (the browser's own: ArrowLeft and ArrowRight flip in RTL). Never intercepted                                                  | `textarea.e2e.ts › caret keys are not intercepted`, `textarea.e2e.ts › caret keys are not intercepted in right to left` |
| Control/Command+A                           | Textarea        | Selects all the text. Native                                                                                                                 | `textarea.e2e.ts › Control/Command+A selects all the text`                                                              |
| Control/Command+V                           | Textarea        | Pastes. Never blocked, and never cut by the limit: with `characterCount` the whole text is kept and the count says how many are over (3.3.8) | `textarea.e2e.ts › Control/Command+V keeps a text that is longer than the limit`                                        |
| Escape                                      | Textarea        | Does nothing: the value and the focus stay                                                                                                   | `textarea.e2e.ts › Escape does nothing: the value and the focus stay`                                                   |
| –                                           | its Field.Label | A click on the label focuses the box (native `<label for>`)                                                                                  | `textarea.test.tsx › clicking the label focuses the box`                                                                |

Copy, cut and undo (Control/Command+C, X and Z) are native too. Textarea adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no. Tab leaves the box: it is never a keyboard trap (2.1.2).
- Restore to: not applicable.
- Never obscured by: Textarea renders no overlay. A sticky header needs the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event                                                                       | Message key (i18n)                                                       | Politeness                                                                                                           | Test                                                                                                                                                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus enters the box                                                        | none                                                                     | None live. The name, role, "required", "invalid" and the description (description, count, help text, error) are read | `textarea.test.tsx › the count follows the box and describes it, inside a Field and outside one`                                                                      |
| The count is at or past 80% of the limit and typing pauses (default 500 ms) | `characterCount.remaining` (`count`), or `characterCount.over` (`count`) | Polite, through the Announcer. Not on every key                                                                      | `character-count.test.tsx › from 80%, it is announced politely when typing pauses`, `textarea.e2e.ts › the count is announced from 80% and when the limit is crossed` |
| The text crosses the limit                                                  | `characterCount.over` (`count`)                                          | Polite, at once, without waiting for a pause                                                                         | `character-count.test.tsx › crossing the limit is announced at once, without waiting for a pause`                                                                     |
| Below 80%, or the same text as the last announcement                        | none                                                                     | The live region stays quiet                                                                                          | `character-count.test.tsx › nothing is announced below 80% of the limit`, `character-count.test.tsx › the same text is not said twice in a row`                       |

Only changes made while the box has focus are announced: a text set from code (a draft restored, a form reset) changes the count but says nothing (`textarea.test.tsx › a text set from code is not announced, and what the user types is`). The count is **not** a live region: it is in the control's description, so it is read with the current value when the box gets focus, and the Announcer says it while the user types. A Textarea without `characterCount` announces nothing.

**The KvirnProvider is required for announcements.** Without one the count still shows and still describes the box, nothing is announced, and one development warning says so the first time it has something to say.

### Message keys

`characterCount.limit` (`limit`), `characterCount.remaining` (`count`) and `characterCount.over` (`count`), in all six locales (`se` is English until a native speaker writes it). Counts and the limit are formatted for the locale, and the plural forms use `format.plural`. Override per provider or per instance (`messages`). The label, description, help text and error stay the consumer's.

## Consumer responsibilities

- Put every Textarea in a Field with a Field.Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2).
- Never use the placeholder as the label (3.3.2). Put an example in the help text or the description, not in the box.
- Set `autoComplete` where a token exists for the question (1.3.5), and never block paste (3.3.8).
- Raise the limit before you add a count: a count is for a limit the user can plausibly hit. Say the limit in the description or label only if the count is off, and never as the only place it appears.
- Count the same way on both sides: pass `countCharacters` with the server's rule when it differs from what the user sees. Over the limit is a warning in the UI, so validate on submit and write a Field.ErrorMessage that names the field and the fix ("Beskrivningen kan vara högst 500 tecken. Ta bort 12 tecken.").
- With `characterCount`, pass `value` when you set the text from code (a draft restored, a form reset by your library): an uncontrolled box counts what is typed, follows a native form reset and reads the value the browser restored on load and on `pageshow`, but not a value you write to the element directly later.
- In your own markup, outside a Field, pass `CharacterCount` an `id` and list it in your control's `aria-describedby`: nothing else links it to the box (1.3.1, 4.1.2).
- A long answer is the worst thing to lose: warn before a session timeout (2.2.1) and, for staff tools, save drafts.
- Read-only is for staff tools. In a resident form, avoid both read-only and disabled.
- Wrap the app in `KvirnProvider` so the count is announced (4.1.3).
- Don't pass an `id` inside a Field: the Field's id wins (dev warning). Use `<Field.Root controlId>`.

## Visual / modes

- Focus indicator: keyboard focus draws a 2px `focus-ring` outline, 2px offset, 3:1 against the adjacent colours (2.4.7, 2.4.13). A click shows a 2px `border-focus` edge and no ring (Plan 0031). Focused and invalid keeps the 2px `danger` edge.
- Target size: at least 44px high, far above 24×24 CSS px (2.5.8).
- Boundary: 1px `border-control`, 3:1 on every surface (1.4.11, `theme:check`). Invalid: 2px `danger` without moving the text. Disabled: dashed and not resizable. Read-only: solid on `surface`, still focusable and resizable.
- Size: the height is `rows` (5 by default). Where the browser supports `field-sizing: content` and typed `attr()`, the box grows with its text and `rows` is its minimum. No fixed height, so the 1.4.12 text spacing fits. Resize is vertical only: never wider than the field (1.4.10).
- The count has the help text's look: 14px, the text colour, in every state. Over the limit it adds weight 600 and the `warning` icon, never colour alone (1.4.1).
- forced-colors behaviour: the same system colours as `kv-input` (`Field`, `FieldText`, `ButtonBorder`, a 2px `CanvasText` edge when invalid, dashed `GrayText` when disabled, a `Highlight` ring). The count is `CanvasText`: over the limit the icon's shape and the weight carry it.
- reduced-motion behaviour: colour transitions only under `no-preference`. The box never animates its height.
- Reflow: full width and `max-inline-size: 100%`, long words wrap, no horizontal scrolling at 320 CSS px (1.4.10).
- RTL: logical properties only. The caret keys are the browser's.

## WCAG SCs covered

- 1.3.1 Info and Relationships: the label, description, count and error are programmatically associated (`textarea.test.tsx › the description lists the description, the help text and the error, in DOM order`). Directly in a Fieldset the count describes the box and not the fieldset (`textarea.test.tsx › directly in a Fieldset, the count describes the box and not the fieldset`, and for your own markup `character-count.test.tsx › directly in a Fieldset, a count keeps its own id and describes the box, not the fieldset`).
- 1.3.5 Identify Input Purpose: `autoComplete` passes through (`textarea.test.tsx › forwards its ref and native props, and the part class kv-textarea joins a consumer’s`).
- 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.13: the invalid edge and message, text and edge contrast, the focus ring.
- 1.4.10 Reflow: no horizontal scroll at 320px (`textarea.e2e.ts › no horizontal scrolling at 320px: the box, the count and a Finnish label (1.4.10)`).
- 1.4.12 Text Spacing: nothing is clipped with the spacing overrides (`textarea.e2e.ts › the box and the count wrap and nothing is clipped with the text spacing overrides (1.4.12)`).
- 2.1.1 Keyboard and 2.1.2 No Keyboard Trap: native, and Tab leaves (`textarea.e2e.ts › Tab moves in and out and never inserts a tab`).
- 2.5.3 Label in Name: the visible label is the name. 2.5.8 Target Size: the box is far above 24px (the `Default` story's `expectMinimumTargetSize`).
- 3.3.1 Error Identification and 3.3.2 Labels or Instructions: through the Field. The count says the limit before the user hits it.
- 3.3.8 Accessible Authentication (Minimum), in spirit: paste works and is never cut (`textarea.test.tsx › maxLength is the count’s limit and is not written as the native attribute, so a paste is never cut`).
- 4.1.2 Name, Role, Value: native role, name, `aria-invalid`, `aria-required`, `disabled`.
- 4.1.3 Status Messages: the count is announced politely through the Announcer (`character-count.test.tsx › announcements (4.1.3)`).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

Research questions for the AT run: is the count read once with the value when the box gets focus, and not read again by the polite announcement at the same moment? Is a pause of 500 ms right, or does it interrupt a slow typist? Is "tecken för mycket" understood as a warning without a visual cue? Does Dragon dictate a long text without the count lagging?

## Known issues

- **`dir="auto"` is not the default.** The design spec (§6.2, Q8) recommends it so a resident writing Arabic gets right-to-left text in a left-to-right page. It is still open: set `dir="auto"` yourself where it applies.
- **Auto-grow needs `field-sizing: content` and typed `attr()`.** Elsewhere `rows` sets the height and the text scrolls inside, with a native scrollbar and a resize handle. There is no JavaScript auto-grow, by decision (Plan 0034).
- **An uncontrolled box with `characterCount` doesn't see a value set from code.** It counts typing, follows a native form reset, and reads the element's value on mount and on `pageshow` (the browser restores a form without an input event). A value you write to the element later is not seen: pass `value`.
- **Manual AT is `pending`.** The debounce (500 ms) and the 80% threshold need NVDA, VoiceOver, TalkBack and Dragon.
- **`se` strings are English** until a native speaker writes them.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
