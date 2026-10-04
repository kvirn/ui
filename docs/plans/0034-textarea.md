# Plan 0034: Textarea

- **Status:** Done (2026-10-04; manual AT `pending`)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** [0013](0013-form-fields.md), [0029](0029-field-hint.md), [0031](0031-pointer-focus-on-text-inputs.md), [0033](0033-text-input-and-number-input.md), [design spec](../design/rich-text-editor.md) (Textarea section), `forms`, `api-conventions`, `accessibility`, `keyboard`, `testing`, `storybook-docs` and `theme-css` skills

## Goal

A team asks for a longer answer ("Beskriv din situation") with a native multi-line text box that is labelled, described and validated by a Field in the same way as a TextInput, and that looks like one. When the answer has a limit, the user sees and hears how much room is left, and can still paste.

## Non-goals

- No rich text. That's Plan 0036.
- No auto-grow written in JavaScript. The box grows with CSS `field-sizing: content` where the browser supports it, and starts at `rows` (default 5, the native attribute, no new token).
- No mask. Masks are for one-line codes.

## Background

- There is no APG pattern for a text field. `<textarea>` is a native `textbox` with `aria-multiline`, and the browser supplies the keyboard, selection, spellcheck, paste and autofill.
- Plan 0013 deferred Textarea. The roadmap row "TextInput, NumberInput (Plan 0033), Textarea" stays `in progress` until this plan is done.
- Prior art: GOV.UK Textarea (`rows` 5, no resize limit, an error above the box), Designsystemet (NO) Textarea, Digdir and SKAT Textarea, and Base UI `Field.Control` with a `render` of `<textarea>`.
- The closest code is TextInput (`packages/react/src/text-input/`): `useTextInput` reads `FieldContext.controlProps`, calls `useFocusVisible`, and sets `data-focused` and `data-focus-visible`. `useFocusVisible`'s `textEntrySelector` already includes `textarea` (Plan 0031), so a click shows the focus edge and keyboard focus shows the ring with no change.

## Design

### API sketch

```tsx
<Field.Root required>
  <Field.Label>Beskriv din situation</Field.Label>
  <Prose>
    <p>Berätta vad som har hänt och vad du behöver hjälp med.</p>
  </Prose>
  <Textarea name="situation" maxLength={1000} characterCount />
  <Field.ErrorMessage>Beskriv din situation</Field.ErrorMessage>
</Field.Root>

// Your own element
const { textareaProps, isInvalid, isFocusVisible } = useTextarea({ onValueChange })
<textarea {...textareaProps} />
```

- **Flat, one element** (Plan 0028 rule 2). `Textarea` renders a `<textarea>` with the class `kv-textarea`. Your `className` is added after it, and `render` works as in TextInput.
- **`useTextarea({ disabled, onValueChange })`** returns `{ textareaProps, isInvalid, isRequired, isDisabled, isFocused, isFocusVisible }`. Its shape matches `useTextInput` without `type`.
- **`onValueChange(value, { reason: 'input', event })`** and `onChange` both fire, as in TextInput.
- **Props:** everything a native `<textarea>` takes. `rows` defaults to 5. Native `required`, `readOnly`, `disabled`, `maxLength`, `autoComplete` and `spellCheck` pass through.
- **`characterCount` (boolean, default false; the maintainer, 2026-10-04).** With `maxLength`, it renders a count right after the `<textarea>` ("Du har 120 tecken kvar", design spec §4.1 and §6.3). With `characterCount` on, `maxLength` is the count's limit and **is not written as the native attribute**, so pasting a long text is never cut silently (3.3.8) and the user can edit it down. The count is added to the textarea's `aria-describedby`. The Announcer reads it politely, debounced, only from 80% of the limit and when the limit is crossed. Over the limit is `data-over` on the count and on the textarea, shown as a warning, not an error: the form decides at submit (no form state, the forms skill). `characterCount` without `maxLength` warns in development and renders nothing. `onValueChange` details gain `{ length, limit, isOverLimit }`.
- **Shared with the editor:** the count's maths is a pure core helper (`getCharacterCount({ value, limit })`: length, remaining, over, and whether to announce), and the part is `CharacterCount` in `packages/react/src/character-count/`, which Plan 0036 reuses. The count is what the user sees: grapheme clusters (`Intl.Segmenter`), so a decomposed `å` or an emoji counts as one, and a line break counts as one (design spec §6.3). When the server counts differently, the consumer passes its rule (`countCharacters={(value) => number}`), and the docs tell adopters to count the same way on both sides.
- **Field wiring:** `FieldContext.controlProps` (id, `aria-describedby`, `aria-invalid`, `aria-required`, `disabled`, `data-*`) is spread first. Inside a Field your own `id` is dropped, and your `aria-describedby` ids come after the Field's (`joinIds`), as in TextInput.
- **Dev warnings:** no accessible name outside a Field, and an `id` inside a Field. `field/use-control-warnings.ts` is widened to `HTMLTextAreaElement`, so Textarea reuses it instead of copying TextInput's `hasNameSource`.

### Accessibility contract (draft)

`packages/react/src/textarea/textarea.a11y.md`:

- **Roles:** a native `<textarea>` (`textbox`, multi-line). Nothing is added except the Field wiring.
- **Keyboard:** native, with focus strategy native, selection follows focus n/a, arrows wrap n/a, and no shortcuts. Textarea handles no keys and never calls `preventDefault`.

| Key                                         | Context  | Action                                                                  | Test                                                                       |
| ------------------------------------------- | -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Tab / Shift+Tab                             | Textarea | Moves focus in and out, in DOM order. Tab never inserts a tab character | `textarea.e2e.ts › Tab moves in and out and never inserts a tab`           |
| Enter                                       | Textarea | Inserts a line break. It never submits the form                         | `textarea.e2e.ts › Enter inserts a line break and does not submit`         |
| Characters                                  | Textarea | Types them. Nothing is filtered                                         | `textarea.test.tsx › typing calls onValueChange with the value and reason` |
| Arrow keys / Home / End / PageUp / PageDown | Textarea | Move the caret (the browser's own, flips in RTL). Never intercepted     | `textarea.e2e.ts › caret keys are not intercepted`                         |

- **Focus:** keyboard focus shows the ring, and a click shows the focus edge (Plan 0031).
- **WCAG SCs:** 1.3.1, 1.3.5 (`autoComplete` passes through), 1.4.10 (no horizontal scroll at 320px: the box is full width there, and resize is vertical only), 1.4.12, 2.1.1, 2.1.2, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 4.1.2.

### i18n strings

A `characterCount` namespace, in all six locales. The copy is the design spec's §4.1 (GOV.UK's wording): characters remaining, characters too many, and the limit. Plural forms use `format.plural`. The label, hint and error stay the consumer's.

### Theming surface

- `kv-textarea` in `theme.css` §12 (form fields), from the design spec. It shares the `kv-input` tokens for border, radius, padding, focus, invalid, disabled and read-only. The block padding is fixed (the `kv-input` box has `padding-block: 0`, which suits one line only), and `resize: vertical` is the default.
- `kv-character-count` uses the Field.Hint style (14px, the hint's colour), with `data-over` adding weight 600 and the `warning` icon (design spec §6.3). No new tokens.
- State attributes: `data-invalid`, `data-required`, `data-disabled`, `data-focused`, `data-focus-visible`, and `data-over` with a count.

## Tasks

- [x] Core `getCharacterCount`, unit tests first (remaining, over, the 80% threshold, announce only on crossing)
- [x] `CharacterCount` part, `characterCount` messages (all six locales, `vp run i18n:check`), the debounced announcement, tests first
- [x] Widen `use-control-warnings.ts` to `HTMLTextAreaElement` (test first)
- [x] `useTextarea` and `Textarea`, tests first: the Field wiring, own `id` dropped in a Field, `aria-describedby` merged, `onValueChange`, `render`, the dev warnings, `characterCount` (no native `maxlength`, paste over the limit is kept, `aria-describedby`, `data-over`), and axe in every state
- [x] `textarea.md` and `textarea.a11y.md`
- [x] Export from `packages/react/src/index.ts`, and add it to the naming tooling if it needs an entry
- [x] `theme.css` `kv-textarea` (theme-css skill), then `vp run theme:check`
- [x] Stories in `apps/storybook/src/components/textarea/` (storybook-docs template): Default with every prop as a control, Keyboard, Invalid, Disabled, ReadOnly, Controlled, CharacterCount (under, near and over the limit), Widths, LongFinnish, RTL, ForcedColors, and the 320px reflow check
- [x] `textarea.e2e.ts`: every keyboard row, pasting past the limit, the count announced at 80% and when crossing, and axe on every story
- [x] Update the `forms` skill (control list) and `docs/design/form-fields.md` (Textarea is no longer out of scope)
- [x] Changeset: `@kvirn-ui/core`, `@kvirn-ui/react`, `@kvirn-ui/i18n` and `@kvirn-ui/theme` minor
- [x] Gates (the orchestrator), then accessibility-reviewer (APPROVE on the third review, 2026-10-04). Roadmap row: Textarea `alpha` (the orchestrator)

## Decisions

- **A separate component and not `TextInput multiline`.** The element, the props (`rows`) and the keyboard (Enter) differ, and Plan 0033 names a control by what it asks for.
- **Character count in this plan, as a boolean** (the maintainer, 2026-10-04). `maxLength` is the limit, and the native attribute is dropped while the count is on.
- **No new tokens** (the maintainer, 2026-10-04: reuse, don't reinvent). The height is `rows`, and the count reuses the hint's style.
- **The count is a registered description** (implementation, 2026-10-04). `useCharacterCount` calls `useDescriptionPart`, the same hook `Field.Prose`, `Field.Hint` and `FileUpload.Limits` use, so inside a Field the count's id is in the control's `aria-describedby` in DOM order (description, count, hint, error) with no id plumbing in Textarea. Outside a Field the Textarea adds the count's own id to its `aria-describedby`. A Textarea directly in a Fieldset (no Field) used to register the count with the Fieldset, so it described the `<fieldset>` and not the box (1.3.1, 4.1.2; accessibility review, 2026-10-04). First fix: a null `FieldTextHostContext` provider in Textarea. The re-review found the public `CharacterCount` had the same defect in own markup (the registered id replaced the consumer's `id`), so the fix moved into `useCharacterCount`: it reads `FieldContext` and calls `useDescriptionPart(ref, field !== null)`, whose new internal `isRegistering` parameter makes it ignore the host. A count registers with a Field only; a Fieldset's description is the group's. Outside a Field the count uses `id ?? ownId`, and the Textarea's wrapper is gone. Tested in `character-count.test.tsx › directly in a Fieldset, a count keeps its own id and describes the box, not the fieldset` and `textarea.test.tsx › directly in a Fieldset, the count describes the box and not the fieldset`.
- **How the count is announced** (implementation). Core `getCharacterCount` returns `announce: 'none' | 'now' | 'afterPause'`: `'now'` only on the change that crosses the limit (needs `previousLength`), `'afterPause'` from the threshold (`ceil(limit × 0.8)`) and while over, else `'none'`. The React hook says `'now'` at once and `'afterPause'` after the Combobox's debounce (`announcementDebounceMilliseconds`, 500 ms, overridable per instance), restarts the pause on every change, never repeats the same text, says nothing on the first render (focus reads the description), and warns once (`announcer-without-provider`) only when it had something to say and there is no provider.
- **Counting** (the maintainer's Q15 decision, 2026-10-04): grapheme clusters through `Intl.Segmenter` (code points where it doesn't exist), `countCharacters` replaces it. The design spec §6.3's "(Plan 0034 counts `value.length`)" was stale and is corrected.
- **An uncontrolled box with `characterCount` tracks its value in React state** from `defaultValue`, each change, a native form reset (a `reset` listener that reads the element a task later, and its timer is cleared on unmount), and a read of the element on mount and on `pageshow` (the browser restores a form's values without an input event). It can't see a value written to the element from code later: the contract and `textarea.md` say to pass `value` then. This is the one place Textarea keeps state of its own, and only for the count.
- **Only what the user types is announced** (implementation, accessibility review, 2026-10-04). `useCharacterCount` and `CharacterCount` take `announceChanges` (default `true`, so a standalone count behaves as before); Textarea passes whether the box has focus. A text set from code (a restored draft) changes the count and says nothing, also when the pause ends after focus left. A small public option rather than a Textarea-only mechanism, because the editor (0036) needs the same. Tested in `character-count.test.tsx` and `textarea.test.tsx › a text set from code is not announced, and what the user types is`.
- **Tests removed as repeats** (AGENTS.md rule 13, accessibility review, 2026-10-04). The e2e "box is at least 24px high" (the `Default` story's `expectMinimumTargetSize` proves it), "clicking the label focuses the box" and "a click marks focus, but not focus-visible" (component tests prove both; the click half moved into `sets data-focus-visible on keyboard focus only`), and "the count is read with the box on focus" (the component test proves the description). The component test "paste is not blocked" (the real paste facts are `maxLength is the count’s limit…` and the e2e Control/Command+V test), the announcement half of the sv test (`character-count.test.tsx` proves it), and the class-list assertions in `character-count.test.tsx` beyond the one consumer-class-plus-part-classes test. The contract's Test cells now cite the surviving tests.
- **`rows` lives in `useTextarea`** (`rows`, default 5), so your own `<textarea>` gets the same height as the component. `useCharacterCount` and `CharacterCount` are public (`index.ts`), not internal, because the editor (0036) and your own markup use them. `CharacterCount` is flat: one element, no `.Root`, no alias.
- **`TextareaState` has `isOverLimit`**, and `data-over` is on both the Textarea and the count. `data-near` is on the count only. No `aria-multiline` (a `<textarea>` already is).
- **Theme:** the `kv-input` rules are widened to `:is(.kv-input, .kv-textarea)` (same specificity), and `.kv-textarea` adds block padding (−1px on a 2px edge), `resize: vertical`, `overflow-wrap: break-word`, and the grow rule in one `@supports (field-sizing: content) and (min-block-size: calc(attr(rows type(<number>), 5) * 1lh))`. A disabled box is not resizable (spec §6.8). The over-limit look is `.kv-character-count[data-over]` (weight 600, icon laid out like the error's). No token, no custom property, no colour.
- **`se` strings are English** (the catalog's convention for `mask`, `fileUpload` and `table`), and `fi`, `nb` and `nn` are written by the agent and need a native-speaker review like the others. The wording follows the design spec §4.1 (GOV.UK's).
- **Contract rows beyond the plan's four:** Control/Command+A, Control/Command+V (paste past the limit), Escape and the label click, copied from TextInput's table because they are native and cheap to prove, plus an RTL check that the caret keys aren't intercepted. The arrows are the browser's, so the RTL e2e proves "not intercepted", not caret positions.
- **Widths story:** a Textarea has no width classes, so `Widths` shows the full-width box in a 20rem column and in the form column.
- **`use-control-warnings.ts` widened** to `HTMLTextAreaElement`; TextInput keeps its own copy of `hasNameSource` (no drive-by refactor).
- **No change to the Field, to `TextInput`, or to the form fixture's static `messageLimit` text.**

## Risks & open questions

- **`characterCount` makes Textarea two elements** (the textarea and the count after it). It's still one component with no compound parts, and `useTextarea` with `CharacterCount` serves your own markup.
- **`dir="auto"`** on the Textarea by default (spec §9) is still open: not the default here, and `textarea.a11y.md` lists it under Known issues.

## Testing strategy

Standard. The keyboard rows are e2e, because Enter and Tab need a real page. The Field wiring is a component test.

## Rollout

`@kvirn-ui/react` minor. No migration.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
