# Accessibility contract: PhoneInput

- **APG pattern:** none needed. PhoneInput is a native `<input type="tel">`, a `textbox`. The name, description and state come from HTML and `aria-describedby`, as for [TextInput](../text-input/text-input.a11y.md).
- **Deviations:** none from APG, because no APG pattern is used.
- **Native elements used:** `<input type="tel">` (`PhoneInput.Number`) with `inputmode="tel"`, `spellcheck="false"`, `dir="ltr"` and `autocomplete="tel"` (`tel-national` next to a country); optionally a native `<select autocomplete="tel-country-code">` (`PhoneInput.Country`) in a `<div>` (`PhoneInput.Root`). No mask by default; `mask="telephone"` or your own mask adds no element and no role.
- **Status:** draft, from [docs/design/phone-and-address-inputs.md](../../../../docs/design/phone-and-address-inputs.md): gates and accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `phone-input.test.tsx` next to this file (only what PhoneInput adds), and `../text-input/text-input.test.tsx`, `../field/field.test.tsx` and `../mask/use-mask.test.tsx` for the rest. `phone-input.stories.tsx` in `apps/storybook/src/components/phone-input/`.

PhoneInput is a phone number in a Field (`field.a11y.md`): a TextInput with the attributes a phone number needs, set once (1.3.5). It never formats and never limits what the user writes: the value is their text. It is a native input, so the browser supplies the role, the keyboard, selection, paste and autofill.

## Roles, states, properties

| Part               | Element / role                   | ARIA / state                                                                                                                                                                                         | Notes                                                                                                                                                         |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PhoneInput         | `<input type="tel">` → `textbox` | From the nearest Field: `id`, `aria-describedby` (description id, then error id), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled` | Classes `kv-input kv-input--numeric kv-phone-input`, and your `className` joins them. No `pattern` and no `maxlength`, ever                                   |
|                    | no Field                         | none added                                                                                                                                                                                           | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                           |
| PhoneInput.Root    | `<div>`, no role                 | none                                                                                                                                                                                                 | Layout and the country only. Name the pair with a Fieldset legend (1.3.1)                                                                                     |
| PhoneInput.Country | `<select>` → `combobox` (native) | From its own Field: `id`, `aria-describedby`, `aria-required`, `aria-invalid`, `disabled`. In the number's Field: only `disabled`                                                                    | No text of its own: its own `Field.Label`, or `aria-label` (dev warning `phone-input-country-without-name`, 4.1.2). Options `Sverige (+46)`, no flags (1.4.1) |

Defaults, all overridable by a prop of yours: `autoComplete="tel"` (the full number, which is what autofill stores; use `mobile tel`, `tel-national`, or `off` for someone else's number), `inputMode="tel"`, `spellCheck={false}`, `dir="ltr"`.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: PhoneInput handles no keys itself and never calls `preventDefault` on one. A mask doesn't either, and never moves focus or auto-advances. The rows are TextInput's, and the masked rows apply with `mask="telephone"`. In a Field, the Field.Label, the help text and the Field.ErrorMessage are not Tab stops (`field.a11y.md`). With a `PhoneInput.Country` there are two Tab stops, the select and then the number, in DOM order. The select's keys (Arrow keys, Home, End, type-ahead, Space or Alt+Down to open, Enter, Escape) are the browser's own native `<select>` and are never intercepted; choosing a country changes nothing in the number and never moves focus (3.2.2).

| Key                                 | Context                  | Action                                                                                                                                          | Test                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                     | PhoneInput               | Moves focus to and from the input, in DOM order: one Tab stop. Nothing is rewritten on blur                                                     | `text-input.test.tsx › Tab moves through the inputs in DOM order`, `phone-input.test.tsx › keeps the user’s spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing (%s)`                                  |
| Characters                          | PhoneInput               | Types them. By default nothing is left out. `mask="telephone"` leaves out what isn't a digit, `+`, space, `-`, `(` or `)`, and says so politely | `text-input.test.tsx › typing calls onValueChange with the value and the reason, and onChange too`, `phone-input.test.tsx › keeps the user’s spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing (%s)` |
| ArrowLeft / ArrowRight / Home / End | PhoneInput               | Move the caret (flips in RTL: the browser's own). Never intercepted                                                                             | `text-input.test.tsx › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`                                                                                                                                  |
| Control/Command+A                   | PhoneInput               | Selects all the text. Native                                                                                                                    | `text-input.test.tsx › Control/Command+A selects all the text`                                                                                                                                                                      |
| Control/Command+V                   | PhoneInput               | Pastes. Never blocked (3.3.8), and the pasted text is kept as pasted                                                                            | `text-input.test.tsx › paste is not blocked`, `phone-input.test.tsx › keeps the user’s spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing (%s)`                                                       |
| Enter                               | PhoneInput in a `<form>` | Submits the form with the number as written. Native, never prevented                                                                            | `text-input.test.tsx › Enter in a plain form submits it with the typed values (native)`                                                                                                                                             |
| Escape                              | PhoneInput               | Does nothing: the value and the focus stay                                                                                                      | `text-input.test.tsx › Escape does nothing: the value and the focus stay`                                                                                                                                                           |
| Tab / Shift+Tab                     | PhoneInput.Country       | Moves focus to the select, then to the number (DOM order). Nothing is rewritten                                                                 | `phone-input.test.tsx › Tab goes to the select and then to the number in DOM order, and Shift+Tab goes back`                                                                                                                        |
| Arrow keys, Home, End, characters   | PhoneInput.Country       | Native `<select>`: move through and pick a country. Never intercepted; the typed number is not rewritten                                        | `phone-input.test.tsx › changing the country never rewrites the typed number and reports the country and its calling code`                                                                                                          |
| –                                   | its Field.Label          | A click on the label focuses the input (native `<label for>`)                                                                                   | `text-input.test.tsx › clicking the label focuses the input`                                                                                                                                                                        |

Copy, cut and undo (Control/Command+C, X and Z) are native too. PhoneInput adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: PhoneInput renders no overlay. A sticky header needs the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event                                                        | Message key (i18n)                     | Politeness                                           | Test                                                                                                                            |
| ------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mask="telephone"` or your own mask: a character is left out | `mask.characterNotAllowed` (`allowed`) | Polite, once per field per window, never moves focus | `use-mask.test.tsx` (the mask machinery, proved once)                                                                           |
| Default (no mask): any character                             | none                                   | Nothing is left out, so nothing is announced         | `phone-input.test.tsx › keeps the user’s spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing (%s)` |

PhoneInput adds no strings of its own and no i18n keys. Dev warnings (English, never announced): no accessible name (`phone-input-without-name`, `phone-input-in-field-without-label`), an `id` inside a Field (`phone-input-id-in-field`), and your own mask in a Field with no help text (`phone-input-mask-without-description`, 3.3.2). The default and `mask="telephone"` need no help text: people know their number.

## Consumer responsibilities

- Put every PhoneInput in a Field with a Field.Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2). Never use the placeholder as the label (3.3.2).
- For international numbers without a `PhoneInput.Country`, say it in a help text: "Om numret inte är svenskt, börja med landsnumret, till exempel +358." With one, name the select (its own Field.Label, or `aria-label`), and say in a help text that the number goes without the country code, or both ways are accepted.
- Don't format the value and don't set `pattern`. Normalise to E.164 on the server.
- Validate in your form after submit, say what's wrong and how to fix it in a Field.ErrorMessage ("Ange ett telefonnummer med siffror, till exempel 070-174 06 05"), never only "invalid" (3.3.1, 3.3.3).
- For someone else's number set `autoComplete="off"`, so the user's own number isn't filled in.
- Never block paste (3.3.8). Wrap the app in `KvirnProvider` if you use a mask, so a left-out character is announced (4.1.3).

## Visual / modes

PhoneInput renders the `kv-input` of TextInput with `kv-input--numeric` and `kv-phone-input` (20 characters wide, never wider than its container), so the look, focus indicator, target size, forced colours and reflow are the TextInput contract's.

- Focus indicator: 2px, 3:1 against the adjacent colours (2.4.7, 2.4.13).
- Target size: at least 24px high (2.5.8).
- forced-colors behaviour: the input keeps a real border, and invalid is not colour alone.
- reduced-motion behaviour: colour transitions only under `no-preference`.
- RTL: `dir="ltr"`, so `+46` stays first; the box is still placed by the page's direction.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: through the Field (`text-input.test.tsx`, `field.test.tsx`).
- 1.3.5 Identify Input Purpose: `autocomplete="tel"` by default (`phone-input.test.tsx › sets type tel, inputmode tel, dir ltr and autocomplete tel, and yours wins`); `tel-national` and `tel-country-code` with a country (`phone-input.test.tsx › autocomplete is tel-national next to a Country and tel without, and the select is tel-country-code`).
- 1.4.1 Use of Color: no flags, the country is its name and calling code in text.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap: native input.
- 3.2.2 On Input: typing never moves focus, and choosing a country never rewrites or prefixes the number (`phone-input.test.tsx › changing the country never rewrites the typed number and reports the country and its calling code`).
- 3.3.2 Labels or Instructions: the Field's help text; a warning for your own mask without one (`phone-input.test.tsx › a custom mask in a Field without a help text warns once, the default and telephone do not (3.3.2)`).
- 3.3.8 Accessible Authentication (Minimum): paste and autofill work.

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

Research questions for the AT run: is a number that stays as the user wrote it read the same on returning to the field? Does `inputmode="tel"` bring up the phone keypad with VoiceOver and TalkBack, and does autofill fill the full number including `+46`?

## Known issues

- **No mask by default.** The `telephone` mask refuses Unicode digits (Eastern Arabic, full-width) and a dot, so a correctly typed number could be refused. Until the core mask maps them, `mask="telephone"` is the consumer's explicit choice.
- **Extensions.** With `mask="telephone"`, letters ("ankn. 123") are left out. Without a mask they are kept.
- **The select is optional.** Without a `PhoneInput.Country` one box takes `+358 …`. Whether autofill fills the select from `tel-country-code` depends on the browser, since an option's text is `Sverige (+46)`: pending the AT run.
- **`tel-national` is set after mount.** The Number learns of the Country part in an effect, so server-rendered markup has `tel` until hydration.
- **WebKit is not automated.** The manual AT matrix is `pending`.
