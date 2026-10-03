---
name: forms
description: How KvirnUI form controls are built and wired - no form state, Field and Fieldset wiring (ids, aria-describedby, invalid, required, optional marker, errors, groups), the hint as a Prose, the default order, text inputs and numbers and dates, InputGroup, input masks and checks, OneTimeCode and FileUpload. Use when you add or change a form control, a Field or Fieldset, a mask, or review any of them.
when_to_use: new form control, Field, Fieldset, Label, Legend, ErrorMessage, hint, Prose in a field, aria-describedby, invalid, required, optional marker, input mask, personal identity number, IBAN, postal code, number input, date input, OneTimeCode, verification code, InputGroup, unit or icon in an input, FileUpload, file validation, form story, error summary
---

# Forms

A form control reports changes up and renders what it is given. A Field wires the control to its label, hint and error. A Fieldset does the same for a group.

Load this with `accessibility` (names, errors, announcements), `keyboard` (keys) and `api-conventions` (hooks, parts, `render`, messages). The prop rules are in `docs/architecture.md`, API conventions.

## No form state

- **Controls hold no form state.** Values, `checked` and validity are props reported up (`onValueChange`, `onCheckedChange`, native events). Without `value` or `checked` the native element is uncontrolled and the component adds no React state.
- **State comes in as props only:** `invalid`, `required`, `disabled`. There is no validation, no touched and no dirty tracking.
- **Native props, events, `name` and `ref` pass through,** so a form library's spreads and `register()` refs work.
- **A group derives its state from `value`.** A control reports, never stores.
- **One exception:** FileUpload checks each file it is given (below), because drop and "All files" skip the browser's checks.

## Field and Fieldset wiring

Hooks `useField` and `useFieldset` return the props. The components (`Field`, `Label`, `ErrorMessage`, `Fieldset`, `Legend`) are those hooks plus context. All parts also have named exports (`FieldRoot`, `FieldLabel`, `FieldErrorMessage`, `FieldsetRoot`, `FieldsetLegend`, `FieldsetErrorMessage`, `ProseRoot`).

- **Parts:** `Field` renders a `div`, `Label` a `label`, `ErrorMessage` a `p`, `Fieldset` a `fieldset`, `Legend` a `legend`. The hint is a `Prose`.
- **Ids come from `useId`.** `controlId` on the Field overrides the control's id (for an error-summary link). A control's own `id` inside a Field is ignored and warns. Derived ids: `<id>-label`, `<id>-description…`, `<id>-error`.
- **The control gets** `id`, and the Label gets `htmlFor` and an `id`. `aria-describedby` lists every rendered Prose id in DOM order, then the error id. Only parts that render are listed. A Fieldset puts the same on its `<fieldset>`, and your own `aria-describedby` ids come after.
- **A Prose in a Field or Fieldset registers itself** as a description at any depth, through `useDescriptionPart` (internal, also used by `FileUpload.Limits`). Outside a host it is a plain Prose and does not warn.
- **`invalid`:** `aria-invalid="true"` on the control and `data-invalid` on every part. `ErrorMessage` renders only while invalid. The error is linked with `aria-describedby`, not `aria-errormessage`. An invalid owner lists the error id from its first render, so a focus-on-submit effect reads the error.
- **`ErrorMessage`** starts with the error icon and a `kv-field-error-prefix` span holding `field.errorPrefix` ("Error:"). The theme hides the prefix visually and keeps it for screen readers. Render one `ErrorMessage` per owner, with all the text. It is not a live region.
- **`required`:** `aria-required="true"` and `data-required`, never native `required`. For native validation, pass `required` on the control as well and keep it on the Field.
- **Optional marker:** a Label appends `field.optional` ("(optional)") when the field is not required. `marker="none"` turns it off.
- **`disabled`:** on a Field it is native `disabled` on the control and `data-disabled` on every part. On a Fieldset it is native `fieldset[disabled]`.
- **Classes:** `kv-field`, `kv-field-label`, `kv-field-optional`, `kv-field-error-message`, `kv-field-error-prefix`, `kv-fieldset`, `kv-fieldset-legend`. State is `data-invalid`, `data-required`, `data-disabled`. The theme never styles `:invalid` or `:user-invalid`: validity is the form's, not the browser's.
- **Hint colour is `text`,** never `text-muted`, in every density.

### Groups

- **`Fieldset group`** marks one question answered with several controls (CheckboxGroup, RadioGroup, a date). `CheckboxGroup.Root` and `RadioGroup.Root` are a `Fieldset.Root` with `group` set.
- **A Fieldset's `invalid` marks its own parts only.** It does not cascade to the Fields inside.
- **A Field inside a group fieldset defaults to `marker="none"`.** The `Legend` marker defaults to optional in a group that is not required, and to none in a plain Fieldset.
- **A checkbox in an invalid group gets `data-invalid` only.** A radio never gets `aria-invalid` or `aria-required` (ARIA does not support them on `radio`). The group's error is its description.
- **A Radio sits directly in a `Field`,** inside a `RadioGroup.Root`.

### A new control

1. Read `FieldContext` for `controlProps`, and spread them on the native element. Add `data-*` state from the Field.
2. Call `useControlWarnings` (internal) for the shared warnings: an ignored `id`, and no accessible name.
3. Disabled comes from the Field or the control's own `disabled`.
4. Contract: list the Field wiring in `<name>.a11y.md`. Stories go under `Components/Form/<Name>`.

### Order and submit

- **Default order:** label, Prose, control, an optional second Prose under the control (the 14px hint), then `ErrorMessage`. In a Fieldset: legend, Prose, controls, `ErrorMessage`. The order stays the consumer's, and `aria-describedby` follows the DOM.
- **Several Prose per Field are allowed,** each with its own id. One `ErrorMessage`; a second warns.
- **On submit,** move focus to the first invalid field or to an error summary. Keep `scroll-padding` so the message under the field is not hidden.

## Text inputs, numbers and dates

- **`Input` accepts** `text`, `email`, `tel`, `url`, `password` and `search`. `type="number"` and `type="date"` warn.
- **Numbers are text:** `type="text"`, `inputMode="numeric"` or `"decimal"`, `autoComplete` where one applies, `spellCheck={false}`. The form validates ranges. A mask that allows a minus sign asks for the text keypad, because iOS numeric pads have no minus.
- **Dates are three text fields,** day, month and year, each a Field with a visible label inside a group Fieldset. `autoComplete` is `bday-day`, `bday-month` and `bday-year` for a date of birth. The consumer validates, and the value is never parsed silently. Field order follows the locale. `DateInput` (a compound of these) is not built yet, and `use-input.ts` still tells users to use it.
- **A calendar DatePicker** is a later component and also accepts typed input.

## InputGroup

`InputGroup.Root` (a `div`, `kv-input-group`) carries the input's box: border, radius, invalid and disabled state, and the focus ring when its Input has keyboard focus (`data-focus-visible`).

- **`InputGroup.Addon`** (a `span`, `kv-input-group-addon`) holds a short unit or a decorative Icon. It is `aria-hidden`, never focusable, and never the only place meaning lives: the label names the unit. It warns if it contains focusable content.
- **Start and end follow DOM order** and the reading direction. There is no `side` prop.
- **A pointer press on an Addon or the box's padding focuses the Input.**
- **An interactive add-on** (clear, show password) is a real `Button` placed directly in the Root, with its own name and Tab stop.
- State: `data-invalid`, `data-disabled`, `data-focus-visible`. It takes `invalid` and `disabled` from the Field.

## Masks

A mask shapes what the user types into a native input. The engine is pure, in `core/src/mask/`. `Input` takes `mask`, and `useMask({ mask, onValueChange })` serves your own `<input>` (`mergeProps(mask.inputProps, ownProps)`). Details, presets and checks: [references/masks.md](references/masks.md).

- **Lenient, never silent.** Checksums and ranges are reported, never enforced. A rejected character is reported in `details.rejected` and announced politely, throttled (`mask.characterNotAllowed` or `mask.maximumLength`). `announceRejections={false}` turns it off. Announcing needs a `KvirnProvider`.
- **The input stays native:** no placeholder characters in the value, no native `maxlength` or `pattern`, paste, drop, autofill and dictation are normalised, and undo keeps working because the value is written back only when the mask changed it.
- **Never rewrite during IME composition.** `onChange` reports the raw value then, and the mask applies once at `compositionend`.
- **A masked Input in a Field without a hint warns (3.3.2).** The mask does not explain the format: say it in a Prose with an example.
- **Presets never set `autocomplete`;** the right token depends on the question. They suggest `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. The consumer's props win.

## OneTimeCode

One native input with presentational slots, so SMS autofill, paste, dictation and undo work. Parts: `OneTimeCode.Root` (`div`, `kv-one-time-code`), `OneTimeCode.Input` and `OneTimeCode.Slot` (`span`). `useOneTimeCode()` returns `rootProps`, `inputProps`, `getSlotProps(index)`, `slots`, `value`, `isComplete`, `isReady`.

- **Input attributes:** `type="text"`, `autoComplete="one-time-code"`, `spellCheck={false}`, `autoCorrect="off"`, `dir="ltr"`. Never `type="password"`. No `maxlength` or `pattern`.
- **`pattern`, default `'999999'`.** Symbols (ASCII only): `9` digit, `*` letter or digit, `a` letter, `A` upper-case letter, `&` upper-case letter or digit, `-` separator. A separator is drawn but is not part of the unmasked code. Any other character, a leading, trailing or doubled `-`, or a pattern with no character symbol throws a `RangeError`, in production too.
- **The value includes the separator** (`ABCD-1234`). `onComplete(value, unmaskedValue)` fires when a change leaves the code complete and different. It never submits and never moves focus.
- **Native attributes follow the pattern:** `inputMode="numeric"` only when every character symbol is `9`. `autoCapitalize="characters"` only when no symbol is `a` or `*`.
- **Slots** are one cell per pattern position, `aria-hidden` and not focusable. Character slots carry `data-filled`, `data-active`, `data-caret="before|after"`, `data-selected` and `data-invalid`. A separator has class `kv-one-time-code-separator` and no state. The active slot is the first character slot at or after the caret. A press on a slot focuses the input.
- **`data-ready`** is set once the hook has started and read the input's value (autofill, a controlled value and a form reset are drawn as they are). Until then the theme shows the plain input. The theme shows the plain input instead of the slots in forced colours, and for a pattern outside 4 to 10 characters with at most 2 separators.
- **The consumer writes** the visible Label and a Prose hint with the length, the grouping and where to find the code. Keep a submit button, say the code is checked as it is entered (3.2.2), and keep the code after a wrong-code error.
- **No auto-advance and no auto-submit.** Countdowns, resend and timeouts belong to blocks (2.2.1), not to the control.

## FileUpload

A native `<input type="file">` is always present and always works. Parts, statuses and rejection reasons: [references/file-upload.md](references/file-upload.md).

- **One Tab stop:** the Trigger, a native `<button>`. It carries the Field's control id and the label's `for`. The native input is `aria-hidden`, `tabIndex={-1}` and visually hidden (never `display: none`), without `required`. The Trigger's name is its visible text, then the Field label (2.5.3). It never has `aria-required`.
- **The drop zone is an enhancement:** not focusable, no role. It shows when a fine pointer is attached or while a file is dragged over the page.
- **Validation is the one place a component validates.** Each added file is checked in this order: folder, `accept` (MIME and extension), empty, `maxFileSize`, `minFileSize`, duplicate, `validate(file)`, then `maxFiles`. A rejected file never enters the list. Rejections show for the latest add only, go to `onFilesReject`, and clear on the next add, a removal or `reset()`. Client checks are not security.
- **The library does no network calls** and has no timeouts. `upload(file, { signal, onProgress })` is the consumer's.
- **When a focused button disappears** (Remove, Cancel, Retry), focus moves to the same item, else the next item's `<li tabIndex={-1}>`, else the previous, else the Trigger. Never `body`, and never another button.
- **Progress** is a native `<progress>` named `fileUpload.uploadingFile`, in whole percent. Unknown size is a static indeterminate bar (2.2.2). Progress is never announced.
- **Northern Sámi strings** for `fileUpload` and `table` are English placeholders until a native speaker reviews them, and they block `beta`.

## Maintainer preferences

- The label, the hint (a `Prose`) and the error text are separate components, and no form state is built in.
- Order: label, hint, control, a hint under the control, then the error (the Designsystemet and Material order). Icons and add-ons sit inside the input's box.
- `type="number"` is left out of `Input`.
- Masks are in-house, with zero dependencies, modelled on iMask and Alpine's Mask plugin.
- OneTimeCode takes a `pattern` with the symbols `9`, `*`, `a`, `A`, `&` and `-`, not a length.
- FileUpload offers preview, metadata, multiple files, a type restriction, a file-count limit and upload progress.
- A hint under the control may be `body-small` (14px), in the `text` colour.

Pending: Plan 0028 / 0029 changes these rules once it lands (`Field.Hint` and the compound names).
