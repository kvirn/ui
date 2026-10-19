# Accessibility contract: Textarea

- **APG pattern:** none needed. Textarea is a native `<textarea>`. There is no APG pattern for a text field: the name, description and state come from HTML and `aria-describedby`.
- **Deviations:** none from APG. With `characterCount`, `maxLength` is the count's limit and is **not** written as the native `maxlength`: the browser cuts a pasted text without a word, so someone who pastes a text from a draft loses part of it and is not told. The user sees how many characters are over and shortens the text. It is a documented choice of this library.
- **Native elements used:** `<textarea>`. `CharacterCount` is a `<p>` (a help text). Neither adds a role.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `textarea.test.tsx`, `../character-count/character-count.test.tsx` and `packages/core/src/character-count/character-count.test.ts` (the maths). `textarea.stories.tsx` in `apps/storybook/src/components/textarea/`.

Textarea is the multi-line text control of a Field (see the Field page). It is a native element: the browser supplies the role (`textbox`, multi-line), the keyboard, selection, spellcheck, paste, undo and autofill. Textarea adds the Field's wiring, the part class, `rows` (5 unless you set it) and, with `characterCount`, a count under the box. The count's part is `CharacterCount`, which the rich text editor also uses.

## Roles, states, properties

| Part           | Element / role                                      | ARIA / state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Textarea       | `<textarea>` → `textbox` (multi-line)               | From the nearest Field: `id`, `aria-describedby` (descriptions, the count, help texts, then the error, in DOM order), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled`                                                                                                                                                                                                                                                                                                         | Class `kv-textarea`. `rows` is 5 unless set. Your own `aria-describedby` ids are kept, after the Field's. `data-focused` while it has focus, and `data-focus-visible` only while that focus came from the keyboard. `data-over` while the count is over the limit. Native `required`, `readOnly`, `disabled`, `autoComplete` and `spellCheck` pass through. No `aria-multiline`: a `<textarea>` already is |
|                | no Field (or only a Fieldset)                       | none added. With `characterCount`, `aria-describedby` points at the count                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                                                                                                                                                                                                                                                                        |
| CharacterCount | `<p>` (a help text), no role, **not a live region** | In a Field: the description id the Field lists in the control's `aria-describedby`. Outside one (also directly in a Fieldset, which is not the box's host): its own `id`, which the Textarea adds and lists in the box's `aria-describedby`, and the count never registers with the Fieldset. This holds for the public `CharacterCount` too: it registers with a Field only, so directly in a Fieldset it keeps the `id` you give it (list it in your control's `aria-describedby`). `data-over` over the limit, `data-near` from the threshold | Classes `kv-field-help-text kv-character-count`. Directly after the control, so the DOM order is the reading order. The warning icon shows only over the limit and is decorative (`aria-hidden`): the words carry the state                                                                                                                                                                                |

### The count (`characterCount`)

With `maxLength` and `characterCount`, Textarea renders a `CharacterCount` right after the box. `useTextarea` with `CharacterCount` serves your own markup.

- **Limit:** `maxLength` is the limit and is not written as the native attribute. A paste of any length is kept whole. Without `characterCount`, `maxLength` passes through as the native attribute.
- **Text:** while empty, `characterCount.limit` ("You can enter up to 500 characters."). While typing, `characterCount.remaining` ("You have 120 characters remaining."). Over the limit, `characterCount.over` ("You have 12 characters too many.") with the `warning` icon and weight 600, never `danger`: before submit it is not an error.
- **Counting:** characters as the user sees them (grapheme clusters, `Intl.Segmenter`), so a letter typed as a base letter plus a combining accent, or an emoji, counts as one, and a line break counts as one. `countCharacters={(value) => number}` replaces it when the server counts differently: count the same way on both sides.
- **Over the limit is a warning:** nothing blocks typing or paste, and nothing is marked `aria-invalid`. The form decides on submit and writes a Field.ErrorMessage that names the fix. `data-over` is on the count and on the Textarea.
- **`onValueChange(value, details)`** gets `details.length`, `details.limit` and `details.isOverLimit` with `characterCount`.
- **No limit, no count:** `characterCount` without `maxLength` warns once in development and renders nothing.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: Textarea handles no keys itself and never calls `preventDefault` on one. It never moves focus and never auto-advances. Tab leaves the box (it never inserts a tab character), and Enter is a line break: a `<textarea>` never submits its form. In a Field, the Field.Label, the description, the count, the help text and the Field.ErrorMessage are not Tab stops (see the Field page).

| Key                                         | Context         | Action                                                                                                                                                                     | Test                                                                                                                        |
| ------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                             | Textarea        | Moves focus in and out, in DOM order. Tab never inserts a tab character                                                                                                    | `textarea.test.tsx › Tab moves in and out and never inserts a tab`                                                          |
| Enter                                       | Textarea        | Inserts a line break. It never submits the form                                                                                                                            | `textarea.test.tsx › Enter inserts a line break and does not submit`                                                        |
| Characters                                  | Textarea        | Types them. Nothing is filtered, and nothing is cut at the limit                                                                                                           | `textarea.test.tsx › typing calls onValueChange with the value and reason, and onChange too`                                |
| Arrow keys / Home / End / PageUp / PageDown | Textarea        | Move the caret (the browser's own: ArrowLeft and ArrowRight flip in RTL). Never intercepted                                                                                | `textarea.test.tsx › caret keys are not intercepted`, `textarea.test.tsx › caret keys are not intercepted in right to left` |
| Control/Command+A                           | Textarea        | Selects all the text. Native                                                                                                                                               | `textarea.test.tsx › Control/Command+A selects all the text`                                                                |
| Control/Command+V                           | Textarea        | Pastes. Never blocked, and never cut by the limit: with `characterCount` the whole text is kept and the count says how many are over, so no text is lost without a message | `textarea.test.tsx › maxLength is the count’s limit and is not written as the native attribute, so a paste is never cut`    |
| Escape                                      | Textarea        | Does nothing: the value and the focus stay                                                                                                                                 | `textarea.test.tsx › Escape does nothing: the value and the focus stay`                                                     |
| –                                           | its Field.Label | A click on the label focuses the box (native `<label for>`)                                                                                                                | `textarea.test.tsx › clicking the label focuses the box`                                                                    |

Copy, cut and undo (Control/Command+C, X and Z) are native too. Textarea adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no. Tab leaves the box: it is never a keyboard trap (2.1.2 No Keyboard Trap, A).
- Restore to: not applicable.
- Never obscured by: Textarea renders no overlay. If your page has a sticky header, add `scroll-padding` so it never covers the focused box (2.4.11 Focus Not Obscured (Minimum), AA).

## Announcements

| Event                                                                       | Message key (i18n)                                                       | Politeness                                                                                                           | Test                                                                                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus enters the box                                                        | none                                                                     | None live. The name, role, "required", "invalid" and the description (description, count, help text, error) are read | `textarea.test.tsx › the count follows the box and describes it, inside a Field and outside one`                                                |
| The count is at or past 80% of the limit and typing pauses (default 500 ms) | `characterCount.remaining` (`count`), or `characterCount.over` (`count`) | Polite, through the Announcer. Not on every key                                                                      | `character-count.test.tsx › from 80%, it is announced politely when typing pauses`                                                              |
| The text crosses the limit                                                  | `characterCount.over` (`count`)                                          | Polite, at once, without waiting for a pause                                                                         | `character-count.test.tsx › crossing the limit is announced at once, without waiting for a pause`                                               |
| Below 80%, or the same text as the last announcement                        | none                                                                     | The live region stays quiet                                                                                          | `character-count.test.tsx › nothing is announced below 80% of the limit`, `character-count.test.tsx › the same text is not said twice in a row` |

Only changes made while the box has focus are announced: a text set from code (a draft restored, a form reset) changes the count but says nothing (`textarea.test.tsx › a text set from code is not announced, and what the user types is`). The count is **not** a live region: it is in the control's description, so it is read with the current value when the box gets focus, and the Announcer says it while the user types. A Textarea without `characterCount` announces nothing.

**The KvirnProvider is required for announcements.** Without one the count still shows and still describes the box, nothing is announced, and one development warning says so the first time it has something to say.

### Message keys

`characterCount.limit` (`limit`), `characterCount.remaining` (`count`) and `characterCount.over` (`count`), in all five locales. Counts and the limit are formatted for the locale, and the plural forms use `format.plural`. Override per provider or per instance (`messages`). The label, description, help text and error stay the consumer's.

## Consumer responsibilities

- Put every Textarea in a Field with a Field.Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2 Name, Role, Value, A).
- Never use the placeholder as the label (3.3.2 Labels or Instructions, A). Put an example in the help text or the description, not in the box.
- Set `autoComplete` where a token exists for the question (1.3.5 Identify Input Purpose, AA), and never block paste.
- Raise the limit before you add a count: a count is for a limit the user can plausibly hit. Say the limit in the description or label only if the count is off, and never as the only place it appears.
- Count the same way on both sides: pass `countCharacters` with the server's rule when it differs from what the user sees. Over the limit is a warning in the UI, so validate on submit and write a Field.ErrorMessage that names the field and the fix ("The description can be at most 500 characters. Remove 12 characters.").
- With `characterCount`, pass `value` when you set the text from code (a draft restored, a form reset by your library): an uncontrolled box counts what is typed, follows a native form reset and reads the value the browser restored on load and on `pageshow`, but not a value you write to the element directly later.
- In your own markup, outside a Field, pass `CharacterCount` an `id` and list it in your control's `aria-describedby`: nothing else links it to the box (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A).
- A long answer is the worst thing to lose: warn before a session timeout (2.2.1 Timing Adjustable, A) and, for staff tools, save drafts.
- Read-only is for staff tools. In a resident form, avoid both read-only and disabled.
- Wrap the app in `KvirnProvider` so the count is announced (4.1.3 Status Messages, AA).
- Don't pass an `id` inside a Field: the Field's id wins (dev warning). Use `<Field.Root controlId>`.

## Visual / modes

- Focus indicator: on keyboard focus, a ring at least 2px thick, set off from the box, with at least 3:1 contrast against the adjacent colours (2.4.7 Focus Visible, AA; 2.4.13 Focus Appearance, AAA). A click shows a thicker edge in the focus colour and no ring. An invalid box keeps its thick error edge when it has focus, and the ring shows on any focus, a click included.
- Target size: far above 24 × 24 CSS px (2.5.8 Target Size (Minimum), AA).
- Boundary: the edge has at least 3:1 contrast against every surface the default theme uses, checked by its contrast check (1.4.11 Non-text Contrast, AA). Invalid: a thicker edge in the error colour, without moving the text. Disabled: a dashed edge, and the box cannot be resized. Read-only: a solid edge on a tinted surface, still focusable and resizable.
- Size: the height is `rows` (5 by default). Where the browser supports `field-sizing: content` and typed `attr()`, the box grows with its text and `rows` is its minimum. No fixed height, so the extra room that 1.4.12 Text Spacing (AA) allows fits. Resize is vertical only: never wider than the field (1.4.10 Reflow, AA).
- The count has the look of a help text, in every state. Over the limit it adds a bolder weight and the warning icon, never colour alone (1.4.1 Use of Color, A).
- forced-colors behaviour (Windows contrast themes): the same system colours as TextInput. The box keeps a real border, an invalid box has a thicker border in the system text colour, and a disabled one a dashed border in the disabled-text colour. Keyboard focus draws a highlight ring. The count uses the system text colour: over the limit, the icon's shape and the weight carry it.
- reduced-motion behaviour: colour transitions only when the user allows motion. The box never animates its height.
- Reflow: full width and never wider than its container, long words wrap, no horizontal scrolling at 320 CSS px (1.4.10 Reflow, AA).
- RTL: logical properties only. The caret keys are the browser's.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): the label, description, count and error are programmatically associated (`textarea.test.tsx › the description lists the description, the help text and the error, in DOM order`). Directly in a Fieldset the count describes the box and not the fieldset (`textarea.test.tsx › directly in a Fieldset, the count describes the box and not the fieldset`, and for your own markup `character-count.test.tsx › directly in a Fieldset, a count keeps its own id and describes the box, not the fieldset`).
- 1.3.5 Identify Input Purpose (AA): `autoComplete` passes through (`textarea.test.tsx › forwards its ref and native props, and the part class kv-textarea joins a consumer’s`).
- 1.4.1 Use of Color (A), 1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA): the invalid edge and message, text contrast and edge contrast.
- 1.4.10 Reflow (AA): the box is never wider than its container (`textarea.stories.tsx › Widths`).
- 2.1.1 Keyboard (A) and 2.1.2 No Keyboard Trap (A): native, and Tab leaves (`textarea.test.tsx › Tab moves in and out and never inserts a tab`).
- 2.4.7 Focus Visible (AA): the focus ring.
- 2.4.13 Focus Appearance (AAA): the ring's thickness and contrast. Not counted toward the AA bar.
- 2.5.3 Label in Name (A): the visible label is the name.
- 2.5.8 Target Size (Minimum) (AA): the box is far above 24px (the `Default` story's `expectMinimumTargetSize`).
- 3.3.1 Error Identification (A) and 3.3.2 Labels or Instructions (A): through the Field. The count says the limit before the user hits it.
- 4.1.2 Name, Role, Value (A): native role, name, `aria-invalid`, `aria-required`, `disabled`.
- 4.1.3 Status Messages (AA): the count is announced politely through the Announcer (`character-count.test.tsx › announcements (4.1.3)`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | textarea.stories.tsx, every story, 4 themes                                                                   |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | textarea.test.tsx › the Field’s label is the name, and its id links them; expectNoA11yViolations              |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 8 rows, each names a test (textarea.test.tsx › Tab moves in and out and never inserts a tab)                  |
| Focus order and management                                                 | pass        | n/a         | pass    | textarea.test.tsx asserts focus (toHaveFocus); first rule: Tab moves in and out and never inserts a tab       |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

Research questions for the AT run: is the count read once with the value when the box gets focus, and not read again by the polite announcement at the same moment? Is a pause of 500 ms right, or does it interrupt a slow typist? Is "too many characters" understood as a warning without a visual cue? Does Dragon dictate a long text without the count lagging?

### What to check

With a screen reader and the keyboard, try:

- Tab in: the label, the role and the count ("You can enter up to 500 characters.") are read.
- Enter starts a new line and does not send the form. Tab leaves the box and types no tab character.
- Type to 80% of the limit and pause: "You have N characters remaining." is said politely once, not on every key.
- Paste past the limit: nothing is cut, and "You have N characters too many." is said at once.
- Submit a text that is too long, with focus moved to the box: the error is read with the box.
- At 200% zoom and in a Windows contrast theme the count and the over-limit warning stay visible.

## Known issues

- **The direction is the page's.** The Textarea has no `dir` prop and never sets `dir="auto"`. It inherits the direction like every input: set it with the provider (`dir`, or an RTL `locale`) and put `useLocale().localeProps` where the language is set. A resident who writes Arabic in a left-to-right page gets left-aligned text; that is a page-language question, not a per-box one.
- **Auto-grow needs `field-sizing: content` and typed `attr()`.** Elsewhere `rows` sets the height and the text scrolls inside, with a native scrollbar and a resize handle. There is no JavaScript auto-grow, by decision.
- **An uncontrolled box with `characterCount` doesn't see a value set from code.** It counts typing, follows a native form reset, and reads the element's value on mount and on `pageshow` (the browser restores a form without an input event). A value you write to the element later is not seen: pass `value`.
- **Test the count with assistive technology.** The debounce (500 ms) and the 80% threshold are worth testing with NVDA, VoiceOver, TalkBack and Dragon.
- **Keyboard tests run in Chromium only.** The keyboard rows run in Vitest browser mode on Chromium, not in WebKit. Test in Safari with your own assistive technology.
