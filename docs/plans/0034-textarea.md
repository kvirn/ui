# Plan 0034: Textarea

- **Status:** Approved (the maintainer, 2026-10-04)
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

- [ ] Core `getCharacterCount`, unit tests first (remaining, over, the 80% threshold, announce only on crossing)
- [ ] `CharacterCount` part, `characterCount` messages (all six locales, `vp run i18n:check`), the debounced announcement, tests first
- [ ] Widen `use-control-warnings.ts` to `HTMLTextAreaElement` (test first)
- [ ] `useTextarea` and `Textarea`, tests first: the Field wiring, own `id` dropped in a Field, `aria-describedby` merged, `onValueChange`, `render`, the dev warnings, `characterCount` (no native `maxlength`, paste over the limit is kept, `aria-describedby`, `data-over`), and axe in every state
- [ ] `textarea.md` and `textarea.a11y.md`
- [ ] Export from `packages/react/src/index.ts`, and add it to the naming tooling if it needs an entry
- [ ] `theme.css` `kv-textarea` (theme-css skill), then `vp run theme:check`
- [ ] Stories in `apps/storybook/src/components/textarea/` (storybook-docs template): Default with every prop as a control, Keyboard, Invalid, Disabled, ReadOnly, Controlled, CharacterCount (under, near and over the limit), Widths, LongFinnish, RTL, ForcedColors, and the 320px reflow check
- [ ] `textarea.e2e.ts`: every keyboard row, pasting past the limit, the count announced at 80% and when crossing, and axe on every story
- [ ] Update the `forms` skill (control list) and `docs/design/form-fields.md` (Textarea is no longer out of scope)
- [ ] Changeset: `@kvirn-ui/core`, `@kvirn-ui/react`, `@kvirn-ui/i18n` and `@kvirn-ui/theme` minor
- [ ] Gates, then accessibility-reviewer. Roadmap row: Textarea `alpha`

## Decisions

- **A separate component and not `TextInput multiline`.** The element, the props (`rows`) and the keyboard (Enter) differ, and Plan 0033 names a control by what it asks for.
- **Character count in this plan, as a boolean** (the maintainer, 2026-10-04). `maxLength` is the limit, and the native attribute is dropped while the count is on.
- **No new tokens** (the maintainer, 2026-10-04: reuse, don't reinvent). The height is `rows`, and the count reuses the hint's style.

## Risks & open questions

- **`characterCount` makes Textarea two elements** (the textarea and the count after it). It's still one component with no compound parts, and `useTextarea` with `CharacterCount` serves your own markup.
- **`dir="auto"`** on the Textarea by default (spec §9) is still open.

## Testing strategy

Standard. The keyboard rows are e2e, because Enter and Tab need a real page. The Field wiring is a component test.

## Rollout

`@kvirn-ui/react` minor. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
