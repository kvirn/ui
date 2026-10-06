---
name: forms
description: How KvirnUI form controls are built and wired - no form state, Field and Fieldset wiring (ids, aria-describedby, invalid, required, optional marker, errors, groups), the description (`Prose`) and the help text (`Field.HelpText`), the default order, text inputs and numbers and dates, InputGroup, input masks and checks, OneTimeCode and FileUpload. Use when you add or change a form control, a Field or Fieldset, a mask, or review any of them.
when_to_use: new form control, Field, Fieldset, Label, Legend, ErrorMessage, help text, Prose in a field, aria-describedby, invalid, required, optional marker, input mask, personal identity number, IBAN, postal code, number input, date input, OneTimeCode, verification code, InputGroup, unit or icon in an input, FileUpload, file validation, form story, error summary
---

# Forms

A form control reports changes up and renders what it is given. A Field wires the control to its label, description, help text and error. A Fieldset does the same for a group.

Load this with `accessibility` (names, errors, announcements), `keyboard` (keys) and `api-conventions` (hooks, parts, `render`, messages). The prop rules are in `docs/architecture.md`, API conventions.

## No form state

- **Controls hold no form state.** Values, `checked` and validity are props reported up (`onValueChange`, `onCheckedChange`, native events). Without `value` or `checked` the native element is uncontrolled and the component adds no React state.
- **State comes in as props only:** `invalid`, `required`, `disabled`. There is no validation, no touched and no dirty tracking.
- **Native props, events, `name` and `ref` pass through,** so a form library's spreads and `register()` refs work.
- **A group derives its state from `value`.** A control reports, never stores.
- **One exception:** FileUpload checks each file it is given (below), because drop and "All files" skip the browser's checks.

## Field and Fieldset wiring

Hooks `useField` and `useFieldset` return the props. The components (`Field`, `Label`, `ErrorMessage`, `Fieldset`, `Legend`) are those hooks plus context. All parts also have named exports (`FieldRoot`, `FieldLabel`, `FieldHelpText`, `FieldErrorMessage`, `FieldsetRoot`, `FieldsetLegend`, `FieldsetHelpText`, `FieldsetErrorMessage`, `ProseRoot`).

- **Parts:** `Field` renders a `div`, `Label` a `label`, `ErrorMessage` a `p`, `Fieldset` a `fieldset`, `Legend` a `legend`. **A description and a help text are different parts.** The description is a `Field.Prose` (a `div.kv-prose`, 16px, above the control, may hold paragraphs, lists and links: what to answer, why, where to find it). The help text is a `Field.HelpText` (a `p.kv-field-help-text`, 14px, always under the control, never above it, plain text: a format, an example or a limit). The group aliases are `Fieldset.HelpText`, `CheckboxGroup.HelpText` and `RadioGroup.HelpText`.
- **Ids come from `useId`.** `controlId` on the Field overrides the control's id (for an error-summary link). A control's own `id` inside a Field is ignored and warns. Derived ids: `<id>-label`, `<id>-description…`, `<id>-error`.
- **The control gets** `id`, and the Label gets `htmlFor` and an `id`. `aria-describedby` lists every rendered Prose and HelpText id in DOM order, then the error id. Only parts that render are listed. A Fieldset puts the same on its `<fieldset>`, and your own `aria-describedby` ids come after.
- **A Prose or a HelpText in a Field or Fieldset registers itself** as a description at any depth, through `useDescriptionPart` (internal, also used by `FileUpload.Limits`). Outside a host a Prose is a plain Prose and does not warn. A HelpText outside a host warns once (`help-text-outside-field`) and renders a plain `<p class="kv-field-help-text">` with no id. A HelpText gets `data-invalid` and `data-disabled` from its host, and the theme never styles them.
- **`invalid`:** `aria-invalid="true"` on the control and `data-invalid` on every part. `ErrorMessage` renders only while invalid. The error is linked with `aria-describedby`, not `aria-errormessage`. An invalid owner lists the error id from its first render, so a focus-on-submit effect reads the error.
- **`ErrorMessage`** starts with the error icon and a `kv-field-error-prefix` span holding `field.errorPrefix` ("Error:"). The theme hides the prefix visually and keeps it for screen readers. Render one `ErrorMessage` per owner, with all the text. It is not a live region.
- **`required`:** `aria-required="true"` and `data-required`, never native `required`. For native validation, pass `required` on the control as well and keep it on the Field.
- **Optional marker:** a Label appends `field.optional` ("(optional)") when the field is not required. `marker="none"` turns it off.
- **`disabled`:** on a Field it is native `disabled` on the control and `data-disabled` on every part. On a Fieldset it is native `fieldset[disabled]`.
- **Classes:** `kv-field`, `kv-field-label`, `kv-field-optional`, `kv-field-help-text`, `kv-field-error-message`, `kv-field-error-prefix`, `kv-fieldset`, `kv-fieldset-legend`. State is `data-invalid`, `data-required`, `data-disabled`. The theme never styles `:invalid` or `:user-invalid`: validity is the form's, not the browser's.
- **Help text and description colour is `text`,** never `text-muted`, in every density.
- **The size belongs to the part, not its position.** A Prose is `body` (16px) and a HelpText is `body-small` (14px), in a choice row or not, in both densities. The theme has no rule that sizes a Prose by what comes before it. **A help text goes under the control, never above it** (maintainer, 2026-10-04): text read before answering is a description, so it is a `Prose` above the control. A HelpText rendered before its control warns in development (`help-text-before-control`).
- **A help text is plain text, short and never alone.** One or two sentences or a format example, no link, list or heading (a screen reader reads it as one flat string, and a link in it can't be followed from the control). It is never the only place a format lives: the error repeats it. No dev warning for rich content. In a disabled or read-only field its copy says why.
- **An option's help text** is a `Field.HelpText` in the option's Field (a checkbox or radio is a direct child): column 2 of the choice row, 14px, directly under the label's box (0 gap) and outside the label, so it is not in the target or the name. It describes that option's input, not the group.

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

- **Default order:** label, description (`Prose`, optional), control, help text (`Field.HelpText`, optional), then `ErrorMessage`. In a Fieldset: legend, description, controls, help text, `ErrorMessage`. The error goes last so the visual order is the `aria-describedby` order (1.3.2) and nothing moves when it appears. Every part is one `--kv-field-gap` from the next (an option help text is the one 0-gap exception). The order stays the consumer's, and `aria-describedby` follows the DOM.
- **Several Prose and HelpText per Field are allowed,** each with its own id. One `ErrorMessage`; a second warns.
- **On submit,** move focus to the first invalid field or to an `ErrorSummary` (Plan 0063: each link is `#controlId`, a group's is its first option; focus is the announcement, so no live region). Keep `scroll-padding` so the message under the field is not hidden.

## Text inputs, numbers and dates

- **`TextInput` accepts** `text`, `email`, `tel`, `url`, `password` and `search`. `type="number"` and `type="date"` warn.
- **`Textarea` is a longer answer** (Plan 0034): a native `<textarea>` with the Field wiring of a `TextInput`, class `kv-textarea`, `rows` 5 unless set, full width and vertical resize only, growing with its text through CSS `field-sizing` and never through JavaScript. A separate component, not `TextInput multiline`. Enter is a line break and Tab leaves: it handles no keys and never calls `preventDefault`. **`characterCount` with `maxLength`** renders a `CharacterCount` after the box (a `Field.HelpText` look with `kv-character-count`, registered as one of the control's descriptions, so `aria-describedby` lists it in DOM order). `maxLength` is then the count's limit and is **not** written as the native `maxlength`, so a paste is never cut silently (3.3.8). Over the limit is a warning (`data-over` on the count and the box, the `warning` icon and weight 600), never `aria-invalid`: the form decides on submit. The count is not a live region: it is announced through the Announcer, polite and debounced, only from 80% of the limit and at once when the limit is crossed. It counts what the user sees (grapheme clusters), and `countCharacters` replaces it for a server that counts differently. `characterCount` without `maxLength` warns and renders nothing.
- **Numbers are text:** a quantity or an amount is a `NumberInput` (Plan 0033): a text box (`type="text"`, never `type="number"`, never a spinbutton) with `masks.number()` built in, in the provider's locale, so letters are left out and announced. Its props are `decimals`, `allowNegative`, `grouping`, `min`, `max` and `mask` (Plan 0039: `false` makes the masking optional, a plain numeric text box that reports no mask details, and another mask, a name or a pattern replaces the number mask and its `unmaskedValue`); `inputMode` follows them (`numeric`, `decimal`, or `text` when negatives are allowed, because iOS numeric pads have no minus) and `spellCheck` is `false`. `min` and `max` are reported as `details.isWithinRange`, never enforced and never written as attributes. A whole number needs no format help text, but `decimals` above 0 does (`number-input-decimals-without-help-text`). ArrowUp and ArrowDown never step the value. **A code that keeps its leading zeros** (a postcode, a case number, a personal identity number) is a `TextInput` with a mask (`mask="digits"`, `mask="postal-code"`), never a NumberInput. Set `autoComplete` where one applies. `TextInput` itself never adds a mask.
- **Dates are three text fields,** day, month and year, each a Field with a visible label inside a group Fieldset. `DateInput.Root` (a `div`, `kv-date-input`) holds `DateInput.Day`, `.Month` and `.Year`, and goes inside a `Fieldset.Root` with a legend, then the boxes, a `Fieldset.HelpText` under them and a `Fieldset.ErrorMessage`. `autoComplete="bday"` on the Root gives `bday-day`, `bday-month` and `bday-year`, for a date of birth only (1.3.5). The consumer validates, and the value (`{ year, month, day }`, strings) is never parsed, padded or cut.
  - **The order follows the region through `Intl`:** `sv-SE` is year, month, day; `sv-FI`, `fi`, `nb` and `en-GB` are day, month, year; a result that starts with the month (`en`, `en-US`) becomes day, month, year. A Root without children renders the boxes in that order and `useDateInput().order` exposes it. The consumer's own children are the order they write. The help text is the consumer's, with an example in the order of the boxes (read `useDateInput().order`): there is no `dateInput.example` message.
  - **Three Tab stops, no arrow-key stepping, and auto-advance on by default** (Plan 0040, the maintainer's approved exception to 3.2.2, for DateInput only: OneTimeCode and every other control never move focus on typing). The boxes are plain `TextInput`s with `inputMode="numeric"`, `spellCheck={false}` and no native `maxlength` or `pattern`, but typing stops at the box's length (2, 2, 4: the key past it is refused in `beforeinput`, and a paste is never cut). When the user's typing fills a box (two digits for day and month, four for year, digits only), focus moves to the next box in the DOM with its text selected, never from the last box or to a disabled one, and never on paste, drop, autofill, deletion, a prefilled or controlled `value`, or the edit of a box that was already full. Backspace and Delete never move focus. `DateInput.Root` renders a visible hint under the boxes (`dateInput.autoAdvanceHint`) in the group's `aria-describedby`, before the consumer's `Fieldset.HelpText`, only while `autoAdvance` is on. `autoAdvance={false}` is the opt-out and removes both. `useDateInput({ autoAdvance })` returns `autoAdvanceHint` for custom markup.
  - **`invalid` is per box:** a box with `invalid` (or in the Root's `invalidParts`) gets `aria-invalid` and `data-invalid` on its input, label and field, set by the box itself and not by an invalid Field, so a box expects no `ErrorMessage`. The date has one message, the Fieldset's. `required` and `disabled` default to the Fieldset's, and `name` is a prefix (`birth-day`).
- **One field is an option:** `TextInput` with `masks.date()` inside a Field with a label and a `Field.HelpText` with an example in the locale's form, built with the field's own mask (`mask.withLocale(locale).format(iso)`) and with a day above 12 so the order shows (`kv-input--width-10`). The order and separator follow the locale (`withLocale`, like a number mask); `unmaskedValue` is the padded ISO date once complete, and `checks.date(iso, { min?, max? })` reports `format`, `date` or `range`. A separator typed after a day or month closes it (`4.10.2026`), a pasted ISO date or eight digits is reformatted, and the mask checks the shape only. Use it for dates read off a document and as the DatePicker's text field. A date of birth stays three boxes (`bday`, 1.3.5).
- **A calendar DatePicker** is a later component and also accepts typed input, through `masks.date()`.

## InputGroup

`InputGroup.Root` (a `div`, `kv-input-group`) carries the input's box: border, radius, invalid and disabled state, and the focus ring when its TextInput has keyboard focus (`data-focus-visible`).

- **`InputGroup.Addon`** (a `span`, `kv-input-group-addon`) holds a short unit or a decorative Icon. It is `aria-hidden`, never focusable, and never the only place meaning lives: the label names the unit. It warns if it contains focusable content.
- **Start and end follow DOM order** and the reading direction. There is no `side` prop.
- **A pointer press on an Addon or the box's padding focuses the TextInput.**
- **An interactive add-on** (clear, show password) is a real `Button` placed directly in the Root, with its own name and Tab stop.
- State: `data-invalid`, `data-disabled`, `data-focus-visible`. It takes `invalid` and `disabled` from the Field.

## Masks

A mask shapes what the user types into a native input. The engine is pure, in `core/src/mask/`. `TextInput` takes `mask`, and `useMask({ mask, onValueChange })` serves your own `<input>` (`mergeProps(mask.inputProps, ownProps)`). Details, presets and checks: [references/masks.md](references/masks.md).

- **`mask` is a union, and a name is the common case** (Plan 0039): a kebab-case name (`digits`, `letters`, `letters-and-digits`, `personal-identity-number` with the alias `ssi`, `organisation-number`, `postal-code`, `date`, `iban`, `email`, `telephone`), `{ preset, country? }`, `{ pattern, ...PatternMaskOptions }`, a `RegExp`, or a `Mask` from `masks.*` (the explicit, typed form, and what `core` users build). `number` is not a name: NumberInput owns it. There is no `pattern` prop, because the native attribute is taken. The hook resolves it (`resolveMask` in `core`) before anything reads `mask.attributes`.
- **The country comes from the locale** (`maskCountryFromLocale`): the instance's `{ preset, country }`, else `<KvirnProvider country>`, else the region of the locale (`sv-FI` is `FI`), else its language (`sv` is `SE`, `fi` is `FI`, `nb`, `nn`, `no` and `se` are `NO`). No hidden default: an unresolvable country makes a country mask fall back to `digits` and warns once (`mask-country-unresolved:<name>:<locale>`). `useLocale().country` exposes it. DateInput's boxes still take no mask.

- **Lenient, never silent.** Checksums and ranges are reported, never enforced. A rejected character is reported in `details.rejected` and announced politely, throttled (`mask.characterNotAllowed`, `mask.maximumLength`, or `mask.maximumDecimals` for a number past its decimals). `announceRejections={false}` turns it off. Announcing needs a `KvirnProvider`.
- **The input stays native:** no placeholder characters in the value, no native `maxlength` or `pattern`, paste, drop, autofill and dictation are normalised, and undo keeps working because the value is written back only when the mask changed it.
- **Never rewrite during IME composition.** `onChange` reports the raw value then, and the mask applies once at `compositionend`.
- **A masked TextInput in a Field without a help text warns (3.3.2).** The mask does not explain the format: say it in a `Field.HelpText` under the control, with an example. Any registered description (a `Field.HelpText` or a `Field.Prose`, above or under the TextInput) counts, so the warning clears when one renders.
- **Presets never set `autocomplete`;** the right token depends on the question. They suggest `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. The consumer's props win.

## OneTimeCode

One native input with presentational slots, so SMS autofill, paste, dictation and undo work. Parts: `OneTimeCode.Root` (`div`, `kv-one-time-code`), `OneTimeCode.Input` and `OneTimeCode.Slot` (`span`). `useOneTimeCode()` returns `rootProps`, `inputProps`, `getSlotProps(index)`, `slots`, `value`, `isComplete`, `isReady`.

- **Input attributes:** `type="text"`, `autoComplete="one-time-code"`, `spellCheck={false}`, `autoCorrect="off"`, `dir="ltr"`. Never `type="password"`. No `maxlength` or `pattern`.
- **`pattern`, default `'999999'`.** Symbols (ASCII only): `9` digit, `*` letter or digit, `a` letter, `A` upper-case letter, `&` upper-case letter or digit, `-` separator. A separator is drawn but is not part of the unmasked code. Any other character, a leading, trailing or doubled `-`, or a pattern with no character symbol throws a `RangeError`, in production too.
- **The value includes the separator** (`ABCD-1234`). `onComplete(value, unmaskedValue)` fires when a change leaves the code complete and different. It never submits and never moves focus.
- **Native attributes follow the pattern:** `inputMode="numeric"` only when every character symbol is `9`. `autoCapitalize="characters"` only when no symbol is `a` or `*`.
- **Slots** are one cell per pattern position, `aria-hidden` and not focusable. Character slots carry `data-filled`, `data-active`, `data-caret="before|after"`, `data-selected` and `data-invalid`. A separator has class `kv-one-time-code-separator` and no state. The active slot is the first character slot at or after the caret. A press on a slot focuses the input.
- **`data-ready`** is set once the hook has started and read the input's value (autofill, a controlled value and a form reset are drawn as they are). Until then the theme shows the plain input. The theme shows the plain input instead of the slots in forced colours, and for a pattern outside 4 to 10 characters with at most 2 separators.
- **The consumer writes** the visible Label and a Prose help text with the length, the grouping and where to find the code. Keep a submit button, say the code is checked as it is entered (3.2.2), and keep the code after a wrong-code error.
- **No auto-advance and no auto-submit.** Countdowns, resend and timeouts belong to blocks (2.2.1), not to the control.

## FileUpload

A native `<input type="file">` is always present and always works. Parts, statuses and rejection reasons: [references/file-upload.md](references/file-upload.md).

- **One Tab stop:** the Trigger, a native `<button>`. It carries the Field's control id and the label's `for`. The native input is `aria-hidden`, `tabIndex={-1}` and visually hidden (never `display: none`), without `required`. The Trigger's name is its visible text, then the Field label (2.5.3). It never has `aria-required`.
- **The drop zone is an enhancement:** not focusable, no role. It shows when a fine pointer is attached or while a file is dragged over the page.
- **Validation is the one place a component validates.** Each added file is checked in this order: folder, `accept` (MIME and extension), empty, `maxFileSize`, `minFileSize`, duplicate, `validate(file)`, then `maxFiles`. A rejected file never enters the list. Rejections show for the latest add only, go to `onFilesReject`, and clear on the next add, a removal or `reset()`. Client checks are not security.
- **The library does no network calls** and has no timeouts. `upload(file, { signal, onProgress })` is the consumer's.
- **When a focused button disappears** (Remove, Cancel, Retry), focus moves to the same item, else the next item's `<li tabIndex={-1}>`, else the previous, else the Trigger. Never `body`, and never another button.
- **Progress** is a native `<progress>` named `fileUpload.uploadingFile`, in whole percent. Unknown size is a static indeterminate bar (2.2.2). Progress is never announced.
- **Languages.** Agents write nb and nn; `se` stays English, marked `lang="en"` (3.1.2). This holds for the `fileUpload` and `table` strings too.

## Maintainer preferences

- The label, the description (a `Prose`), the help text (`Field.HelpText`) and the error text are separate components, and no form state is built in.
- Order: label, description, control, help text, then the error (the maintainer's rule of 2026-10-04: "a help text is a help text, 14px, always under the input; a Prose above the input is a description"). Icons and add-ons sit inside the input's box.
- `type="number"` is left out of `TextInput`.
- Masks are in-house, with zero dependencies, modelled on iMask and Alpine's Mask plugin.
- OneTimeCode takes a `pattern` with the symbols `9`, `*`, `a`, `A`, `&` and `-`, not a length.
- FileUpload offers preview, metadata, multiple files, a type restriction, a file-count limit and upload progress.
- A help text is `body-small` (14px), in the `text` colour, in every position and density, and an option help text is 14px too. A description is `body` (16px).
