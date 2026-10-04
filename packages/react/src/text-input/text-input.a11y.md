# Accessibility contract: TextInput

- **APG pattern:** none needed. TextInput is a native `<input>` with a text-like `type`. There is no APG pattern for a text field: the name, description and state come from HTML and `aria-describedby`.
- **Deviations:** none from APG. `type="number"` and `type="date"` are not accepted by design.
- **Native elements used:** `<input type="text | email | tel | url | password | search">`. A mask adds no element and no role.
- **Status:** alpha candidate (Plan 0013, Phase 1). The `mask` prop and `useMask` are Plan 0014, Phase 2: gates pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `text-input.test.tsx` and `../mask/use-mask.test.tsx`. `text-input.stories.tsx` and `text-input.e2e.ts` in `apps/storybook/src/components/text-input/`, `mask.stories.tsx` and `mask.e2e.ts` in `…/mask/`. NumberInput, a TextInput with a number mask built in, has its own contract, stories and spec: [number-input.a11y.md](../number-input/number-input.a11y.md).

TextInput is the text control of a Field (`field.a11y.md`). It is a native input: the browser supplies the role (`textbox`, `searchbox`), the keyboard, selection, paste and autofill. TextInput adds the Field's wiring and the part class.

## Roles, states, properties

| Part  | Element / role                                          | ARIA / state                                                                                                                                                                                         | Notes                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TextInput | `<input>` → `textbox` (`searchbox` for `type="search"`) | From the nearest Field: `id`, `aria-describedby` (description id, then error id), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled` | Class `kv-input`. `type` is `text` (the default), `email`, `tel`, `url`, `password` or `search`. Your own `aria-describedby` ids are kept, after the Field's. `data-focused` while it has focus, and `data-focus-visible` only while that focus came from the keyboard (browsers also match `:focus-visible` on a click in a text input). Native `required`, `readOnly`, `disabled` and `aria-invalid` pass through |
|       | no Field                                                | none added                                                                                                                                                                                           | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                                                                                                                                                                                                                                                                                 |
|       | `type="number"` or `type="date"`                        | –                                                                                                                                                                                                    | Rejected by the type. At runtime: a dev warning says to use NumberInput or DateInput. It still renders what was asked for                                                                                                                                                                                                                                                                                                                |

A quantity or an amount is a [NumberInput](../number-input/number-input.a11y.md), not a TextInput. A code with leading zeros (a case number, a postcode) stays a TextInput: `<TextInput mask={masks.digits()} />`, or `inputMode="numeric"` with `spellCheck={false}` for a plain one. No `pattern` (the browser's own message would appear in its language), and no key filtering by `TextInput` itself. A mask drops a character it can't take and announces it politely, and paste and autofill still work.

`useTextInput` gives the same `inputProps` for your own `<input>`: it reads the nearest Field too.

## Masked input

A `TextInput` with a `mask` (or `useMask` on your own `<input>`) shapes what the user types: it drops characters that can't be valid, inserts separators as the user types past them, and limits the length. The control stays a native `<input>`: no role, no `maxlength`, no `pattern`, no placeholder characters in the value. The mask holds no form state and corrects nothing: `min` and `max` are reported as `isWithinRange`, and the `checks.*` helpers are called by your form.

| Action                     | Result                                                                                                                                                                                                                          | Test                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type an allowed character  | Inserted at the caret. A literal is inserted after it only when the next character is typed                                                                                                                                     | `mask.e2e.ts › typing an allowed character inserts it, and a literal comes only when the next character is typed`                                                         |
| Type a literal at its spot | Accepted once, not doubled                                                                                                                                                                                                      | `mask.e2e.ts › typing a literal at its spot is accepted once, not doubled`                                                                                                |
| Type a refused character   | Not inserted, the caret stays. `details.rejected` says why, and the Announcer says it, at most once every few seconds per field                                                                                                 | `mask.e2e.ts › typing a refused character inserts nothing, and the caret stays`, `mask.e2e.ts › a refused character is announced once, and throttled per field`           |
| Paste, drop or autofill    | Separators and refused characters are stripped, the rest fills the mask. Nothing is truncated early                                                                                                                             | `mask.e2e.ts › Control/Command+V pastes in each separator style and fills the mask`, `mask.e2e.ts › a paste with refused characters drops them, and nothing is cut early` |
| Backspace / Delete         | Always removes a character, also next to a literal                                                                                                                                                                              | `mask.e2e.ts › Backspace next to a literal removes a character`, `mask.e2e.ts › Delete before a literal removes the next character`                                       |
| Caret                      | Stays right after the character the user typed, also across a literal the mask inserts                                                                                                                                          | `mask.e2e.ts › the caret stays after the typed character, also when the mask inserts a literal`                                                                           |
| IME or dead key            | Left alone until `compositionend`: the raw text shows while composing, and the mask applies once                                                                                                                                | `mask.e2e.ts › an IME or dead key composition is left alone until compositionend`                                                                                         |
| Undo                       | Native. Undo can't go back past the last step the mask rewrote (inserted a literal or removed a refused character), because writing the value clears the history before it. The mask writes back only when it changed the value | `mask.e2e.ts › Control/Command+Z undoes typing that the mask did not rewrite`, `mask.e2e.ts › Control/Command+Z after a step the mask rewrote leaves a valid value`       |

- **Roles / ARIA:** a native `<input>`, no added role, state or property. Field wiring as above.
- **Attributes the preset suggests** (your own props win): `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. A preset never sets `autocomplete`: the right token depends on the question (1.3.5). RTL: an identifier stays left to right in a right-to-left page (`mask.e2e.ts › right to left: identifiers stay left to right`).
- **Value and details:** `onValueChange(value, details)` gets the masked value, and `details.unmaskedValue`, `isComplete`, `isWithinRange` (number masks) and `rejected`. A controlled `value` is rendered as given and never rewritten: use `mask.format()` for a stored value.
- **Composition:** while composing, `onValueChange` reports the raw value without mask details, so a controlled field keeps following what the IME shows. At `compositionend` it reports once more, with the `CompositionEvent` as `details.event`.
- **Numbers:** the decimal separator is the provider's locale (a comma in sv, fi, nb, nn and se), whichever separator is typed. The value is never clamped.
- **Types:** a mask works on `text`, `tel`, `search`, `url` and `password`. On `type="email"` the browser has no selection API, so only `masks.email()` is accepted: another mask warns in development, and the caret goes to the end when the mask rewrites.
- **Dev warnings:** a masked TextInput in a Field without a hint (a `Field.Prose` in the Field) or an `aria-describedby` of its own (3.3.2: the mask doesn't explain the format), and a mask other than `masks.email()` on `type="email"`. Without a `KvirnProvider`, the first refused character warns once that nothing is announced.
- **Format in text (3.3.2):** the hint says the format with an example. The mask is never the only explanation.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: TextInput handles no keys itself and never calls `preventDefault` on one. A mask doesn't either: it reads the value after the browser's edit and rewrites it only when it must, and never moves focus or auto-advances. The masked rows are in the Keyboard table and in Masked input above. NumberInput's rows, including that ArrowUp and ArrowDown never step a value, are in its own contract. In a Field, the Field.Label, the hint (a `Prose`) and the Field.ErrorMessage are not Tab stops (`field.a11y.md`).

| Key                                 | Context                    | Action                                                                                                             | Test                                                                                                                                                                                                      |
| ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                     | TextInput                      | Moves focus to and from the input, in DOM order                                                                    | `text-input.e2e.ts › Tab moves through the inputs in DOM order`                                                                                                                                                |
| Characters                          | TextInput                      | Types them. Without a mask nothing is filtered. A mask leaves out what it can't take, and says so politely        | `text-input.test.tsx › typing calls onValueChange with the value and the reason, and onChange too`, `text-input.e2e.ts › without a mask nothing is filtered, and a mask leaves out what it cannot take`                            |
| ArrowLeft / ArrowRight / Home / End | TextInput                      | Move the caret (flips in RTL: the browser's own). Never intercepted                                                | `text-input.e2e.ts › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`                                                                                                               |
| Control/Command+A                   | TextInput                      | Selects all the text. Native                                                                                       | `text-input.e2e.ts › Control/Command+A selects all the text`                                                                                                                                                   |
| Control/Command+V                   | TextInput                      | Pastes. Never blocked (3.3.8)                                                                                      | `text-input.test.tsx › paste is not blocked`                                                                                                                                                                   |
| Enter                               | TextInput in a `<form>`        | Submits the form (implicit submission). Native, never prevented                                                    | `text-input.e2e.ts › Enter in a plain form submits it with the typed values (native)`                                                                                                                          |
| Escape                              | TextInput                      | Does nothing: the value and the focus stay                                                                         | `text-input.e2e.ts › Escape does nothing: the value and the focus stay`                                                                                                                                        |
| Tab / Shift+Tab                     | Masked input               | Moves focus to and from the input, in DOM order. Never moves on when the mask is full                              | `mask.e2e.ts › Tab and Shift+Tab move through the masked inputs in DOM order`                                                                                                                             |
| Characters                          | Masked input               | Types the ones the mask allows, inserts a literal as the user types past it, drops the rest and says so            | `mask.e2e.ts › typing an allowed character inserts it, and a literal comes only when the next character is typed`, `mask.e2e.ts › typing a refused character inserts nothing, and the caret stays`        |
| Control/Command+V                   | Masked input               | Pastes: separators and refused characters are stripped, the rest fills the mask. Never blocked                     | `mask.e2e.ts › Control/Command+V pastes in each separator style and fills the mask`, `use-mask.test.tsx › %s fills the mask and ends as 19900101-1234`                                                    |
| Backspace / Delete                  | Masked input               | Removes a character, also next to a literal. Never intercepted                                                     | `mask.e2e.ts › Backspace next to a literal removes a character`, `mask.e2e.ts › Delete before a literal removes the next character`, `mask.e2e.ts › Backspace and Delete are not intercepted by the page` |
| ArrowLeft / ArrowRight / Home / End | Masked input               | Move the caret (flips in RTL: the browser's own). Never intercepted                                                | `mask.e2e.ts › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`                                                                                                                |
| ArrowUp / ArrowDown                 | Masked number              | Native caret movement only. Never steps or changes the value                                                       | `mask.e2e.ts › ArrowUp and ArrowDown never change a masked number`                                                                                                                                        |
| Control/Command+A                   | Masked input               | Selects all the text. Typing then replaces it and the mask starts over                                             | `mask.e2e.ts › Control/Command+A selects all the text`                                                                                                                                                    |
| Control/Command+Z                   | Masked input               | Undo is native: it works for typing the mask didn't rewrite, and can't go back past the last step the mask rewrote | `mask.e2e.ts › Control/Command+Z undoes typing that the mask did not rewrite`, `mask.e2e.ts › Control/Command+Z after a step the mask rewrote leaves a valid value`                                       |
| Dead key, IME                       | Masked input               | Left alone until the composition ends, then the mask applies once                                                  | `mask.e2e.ts › an IME or dead key composition is left alone until compositionend`, `mask.e2e.ts › a composed character the mask accepts is kept, and nothing is rewritten during it`                      |
| Enter                               | Masked input in a `<form>` | Submits the form with the masked value. Native, never prevented                                                    | `mask.e2e.ts › Enter in the form submits it with the masked values (native)`                                                                                                                              |
| Escape                              | Masked input               | Does nothing: the value and the focus stay                                                                         | `mask.e2e.ts › Escape does nothing: the value and the focus stay`                                                                                                                                         |
| –                                   | its Field.Label            | A click on the label focuses the input (native `<label for>`)                                                      | `text-input.e2e.ts › clicking the label focuses the input`                                                                                                                                                     |

Copy, cut and undo (Control/Command+C, X and Z) are native too. TextInput adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: TextInput renders no overlay. A sticky header needs the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event                  | Message key (i18n) | Politeness                                                                                       |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Focus enters the input | none               | None live. The name, role, "required", "invalid" and the description (hint, then error) are read |

A TextInput without a mask announces nothing itself. Its texts are the Field's (`field.a11y.md`).

A masked TextInput announces a rejection through the shared Announcer (4.1.3): a polite message in the live region that the outermost `KvirnProvider` renders, throttled to one every three seconds per field (the Field's control id). Strings come from i18n in all six locales, and can be overridden per provider and per instance (`messages`). `announceRejections={false}` turns it off, for example when you show your own message.

| Event                                                               | Message key (i18n)                     | Politeness                                           | Test                                                                                                                                                                                      |
| ------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A character is refused (digits, letters, letters and digits, other) | `mask.characterNotAllowed` (`allowed`) | Polite, once per field per window, never moves focus | `use-mask.test.tsx › a refused character is announced politely, in the provider language (sv, fi and en)`, `mask.e2e.ts › a refused character is announced once, and throttled per field` |
| The mask is full and another character is refused                   | `mask.maximumLength` (`length`)        | Polite, same throttle                                | `use-mask.test.tsx › a full mask says so, with the number of characters`, `mask.e2e.ts › a full mask says so with the number of characters`                                               |
| A number mask has all its decimals and another digit is refused     | `mask.maximumDecimals` (no parameters) | Polite, same throttle                                | `number-input.test.tsx › a digit past the decimals is left out and announced as decimals, not as a full field (%s)` |
| Characters accepted, a literal inserted                             | none                                   | Nothing is announced for input that works            | `use-mask.test.tsx › nothing is announced for accepted input`                                                                                                                             |
| `announceRejections={false}`                                        | none                                   | The live region stays quiet                          | `mask.e2e.ts › announceRejections off keeps the live region quiet, and the character is still refused`                                                                                    |

**The KvirnProvider is required for announcements.** Without one the mask still works, nothing is announced, and one development warning says so.

## Consumer responsibilities

- Put every TextInput in a Field with a Field.Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2).
- Never use the placeholder as the label (3.3.2). Put an example in the hint (a `Field.Prose` in the Field), not in the box.
- Set `autoComplete` on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste (3.3.8).
- Use NumberInput for a quantity or an amount, and a TextInput with a mask (or `inputMode="numeric"` and `spellCheck={false}`) for a code. Don't use `type="number"` or `type="date"`. Validate ranges and formats yourself and say what's wrong in a Field.ErrorMessage.
- Choose a width class that fits the answer: `kv-input--width-2`, `-4`, `-6`, `-10`, `-20`. Width is a hint, never a limit: no `maxlength` comes from it.
- Read-only is for staff tools showing a value the user can't change here. Say why in the hint. In a resident form, avoid both read-only and disabled.
- With a `mask`, put the format and an example in a hint, a `Field.Prose` in the Field (3.3.2, dev warning): the mask shapes input, it doesn't explain it. A hint is text: keep it short and plain, because its accessible description is only the Prose's text content (`field.a11y.md`). Wrap the app in `KvirnProvider` so refused characters are announced (4.1.3).
- Validate in your form, after submit: the mask never says a value is wrong. Call `checks.personalIdentityNumber`, `checks.organisationNumber` and `checks.iban` and write a specific message from `reason`. Don't clamp numbers to `min` and `max`: show your own hint from `isWithinRange`.
- Set `autoComplete` on masked fields yourself where a token exists (`postal-code`, `tel`, `email`). `masks.letters()` isn't for names: names have spaces, hyphens and apostrophes.
- Don't pass an `id` inside a Field: the Field's id wins, so the label stays associated (dev warning). Use `<Field.Root controlId>`.

## Visual / modes

- Focus indicator: on keyboard focus, a 2px `focus-ring` outline, 2px offset, 3:1 against the adjacent colours (2.4.7, 2.4.13). Before the script runs, `:focus-visible` draws it. A click shows focus as a 2px `border-focus` edge, with no ring, so it changes width as well as colour. The text doesn't move. Focused and invalid keeps the 2px `danger` edge, and keyboard focus adds the ring.
- Target size: 44px high, 32px in compact from 64rem, at least 51px wide (2.5.8). Value text stays 16px in compact.
- Boundary: 1px `border-control`, 3:1 on every surface (1.4.11, `theme:check`). Invalid: 2px `danger`, without moving the text.
- forced-colors behaviour: the input keeps a real border in `ButtonBorder`. Invalid is a 2px `CanvasText` border. Disabled is dashed `GrayText` (`text-input.e2e.ts › forced colours keep the input edge and the focus indicator visible (1.4.11, 2.4.7)`). Focus turns the edge `Highlight` at 1px (2px alone means invalid there), and keyboard focus draws the `Highlight` ring. A click's transparent outline is painted by the system, so a click shows a ring there too.
- reduced-motion behaviour: colour transitions only under `no-preference`.
- Reflow: no fixed widths beyond the width classes, which have `max-inline-size: 100%`. No horizontal scrolling at 320 CSS px (`text-input.e2e.ts › no horizontal scrolling at 320px: widths, Finnish label and masked fields (1.4.10)`). The width classes include the 1.4.12 letter-spacing allowance, so the expected answer stays visible.
- RTL: logical properties only.

## WCAG SCs covered

- 1.3.1 Info and Relationships: the label, description and error are programmatically associated (`text-input.test.tsx › in a Field`).
- 1.3.5 Identify Input Purpose: `autoComplete` passes through (`text-input.test.tsx › passes autoComplete, inputMode and spellCheck for numbers`).
- 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.13: invalid edge and message, text and edge contrast, the focus ring.
- 2.1.1 Keyboard: native input.
- 2.5.3 Label in Name: the visible label is the name.
- 3.3.2 Labels or Instructions, 3.3.1 Error Identification: through the Field.
- 3.3.8 Accessible Authentication (Minimum): paste and autofill work, and no cognitive test is added. A mask normalises a pasted value instead of refusing it (`mask.e2e.ts › Control/Command+V pastes in each separator style and fills the mask`).
- 3.3.1 and 3.3.4: a mask never auto-fixes or clamps what the user entered, and dropped characters are reported (`text-input.test.tsx › onValueChange gets the masked value and the mask details, once per change`).
- 3.2.2 On Input: typing never moves focus, and a full mask doesn't advance (`mask.e2e.ts › Tab and Shift+Tab move through the masked inputs in DOM order`).
- 4.1.3 Status Messages: a refused character is announced politely through the Announcer (`use-mask.test.tsx › a refused character is announced politely, in the provider language (sv, fi and en)`).
- 4.1.2 Name, Role, Value: native role, name, `aria-invalid`, `aria-required`, `disabled`.

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

Research questions for the AT run: is a refused character's message read once, after the echo, and not repeated while a key is held? Does the caret stay where the user expects after the mask inserts a literal, with each screen reader? Does Dragon dictate into a masked field without corruption?

Also: does `inputMode="numeric"` bring up the right keyboard with VoiceOver and TalkBack? Is a decimal comma accepted by the form's own parser (consumer)?

## Known issues

- **No Textarea yet.** It comes later and reuses Field (Plan 0013, non-goals).
- **No prefix or suffix (`kr`, `€`), no show-password button.** Out of scope for this phase (design spec, open question 9). Put the unit in the label or hint.
- **Masks: manual AT is `pending`.** The throttle (three seconds), the clear-then-set message and the caret behaviour need NVDA, VoiceOver, TalkBack and Dragon. Real IMEs, dead keys and dictation are tested by hand: e2e uses a CDP composition in Chromium, and dispatched composition events in Firefox and WebKit.
- **Masks: undo.** When the mask rewrites the value (inserts a literal, removes a refused character), undo can't go back past that step: writing the value clears the browser's history before it. Accepted.
- **Masks: no provider, no announcement.** `KvirnProvider` is required for announcements.
- **Masks: `type="email"`** has no caret control, so only `masks.email()` is supported on it.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
