# Accessibility contract: NumberInput

- **APG pattern:** none needed. NumberInput is a native text `<input>`, a `textbox`. It is deliberately **not** the APG spin button: there is no stepping with the arrow keys and no spinner buttons. The name, description and state come from HTML and `aria-describedby`, as for [TextInput](../text-input/text-input.a11y.md).
- **Deviations:** none from APG, because no APG pattern is used. `type="number"` is not used by design: it changes its value on the mouse wheel and on ArrowUp and ArrowDown, drops leading zeros, rounds silently, shows spinners that are hard to hit, and reads the decimal mark by the browser's language and not the page's (GOV.UK, and Plan 0013).
- **Native elements used:** `<input type="text">` with `inputmode` and `spellcheck="false"`. By default it also runs a number mask (`masks.number()`); `mask={false}` runs none and a custom `mask` replaces it. A mask adds no element and no role.
- **Status:** alpha candidate (Plan 0033): gates and accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `number-input.test.tsx` next to this file, and `../mask/use-mask.test.tsx` for the mask machinery. `number-input.stories.tsx` and `number-input.e2e.ts` in `apps/storybook/src/components/number-input/`.

NumberInput is a quantity or an amount in a Field (`field.a11y.md`): a TextInput with a number mask built in, in the provider's language. It is a native input, so the browser supplies the role (`textbox`), the keyboard, selection, paste, autofill and undo. NumberInput adds the Field's wiring, the number mask and the part classes. The mask is optional: `mask={false}` makes it a plain numeric text box (same role, keys and Field wiring, nothing left out), and another `mask` replaces the number mask. For a code with leading zeros (a postcode, a case number) use a [TextInput](../text-input/text-input.a11y.md) with a mask: a number would drop the zeros.

## Roles, states, properties

| Part        | Element / role                           | ARIA / state                                                                                                                                                                                         | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NumberInput | `<input type="text">` → `textbox`        | From the nearest Field: `id`, `aria-describedby` (description id, then error id), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled` | Classes `kv-input kv-input--numeric`, and your `className` joins them. Never `type="number"` and never a `spinbutton`: `min` and `max` are props that are reported, not attributes (they're invalid on a text input). `inputmode` follows the mask: by default (the number mask) `numeric`, `decimal` with decimals, `text` when negatives are allowed (iOS numeric pads have no minus sign); with `mask={false}` the same values, read from the `decimals` and `allowNegative` props; with a custom `mask`, the one that mask suggests (`mask.attributes`). `spellcheck="false"`. `data-focused` while it has focus, and `data-focus-visible` only for keyboard focus |
|             | no Field                                 | none added                                                                                                                                                                                           | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                                                                                                                                                                                                                                                                                                                                        |
|             | in an `InputGroup.Root`, with an `Addon` | the Addon is `aria-hidden="true"`                                                                                                                                                                    | A unit such as "kr" is only a visual repeat: the label must say it ("Månadshyra i kronor")                                                                                                                                                                                                                                                                                                                                                                                 |

By default (no `mask` prop) these props become the number mask, in the provider's locale: `decimals` (default 0: no decimal mark), `allowNegative` (default `false`), `grouping` (default `false`), `min` and `max`. The decimal mark is the one of the page's language (a comma in sv, fi, nb, nn and se, a point in en), and a typed `,` or `.` is read as that mark. `onValueChange(value, details)` gets `details.unmaskedValue` (the machine form, `-1234.5`), `details.isWithinRange` (`min` and `max`), `isComplete` and `rejected`. With `mask={false}` none of these props shapes the value (the keypad still follows `decimals` and `allowNegative`; no `unmaskedValue`, `isWithinRange`, `isComplete` or `rejected`: only `reason` and `event`), and with a custom `mask` the details are that mask's. **A range is reported, never enforced:** the value is never clamped or corrected, and the form validates and writes the message (3.3.1, 3.3.4).

`useNumberInput` gives the same `inputProps` for your own `<input>`: it reads the nearest Field too, and returns `format` and `unmask` for the provider's locale.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: NumberInput handles no keys itself and never calls `preventDefault` on one. It is a text box, so ArrowUp and ArrowDown move the caret and never step the value. The mask reads the value after the browser's edit and rewrites it only when it must, and never moves focus or auto-advances. In a Field, the Field.Label, the hint and the error are not focusable and have no keys (`field.a11y.md`).

| Key                                 | Context                   | Action                                                                                                                          | Test                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                     | NumberInput               | Moves focus to and from the input, in DOM order. Never moves on by itself when the number is complete                           | `number-input.test.tsx › Tab and Shift+Tab move focus to and from the input, in DOM order`                                                                                                                          |
| Characters                          | NumberInput               | Default mask: types digits, and the decimal mark and a leading minus sign when the props allow them; leaves out the rest and says so politely. `mask={false}`: types anything, nothing is left out or announced. Custom `mask`: what that mask takes, with its announcements | `number-input.test.tsx › a whole number takes digits only: a letter and a decimal mark are left out`, `number-input.test.tsx › mask={false} is a plain numeric text box: nothing is left out, and no mask details are reported`, `number-input.test.tsx › a name replaces the number mask, with that mask’s unmaskedValue`, `number-input.e2e.ts › a letter is left out, and the number types as written` |
| Control/Command+V                   | NumberInput               | Pastes: `1 250,50`, `1250.50` and `1 250,50` are all read, and written the way the page writes a number. Never blocked          | `number-input.test.tsx › paste is not blocked: 1 250,50 and 1250.50 both read`                                                                                                                                      |
| ArrowLeft / ArrowRight / Home / End | NumberInput               | Move the caret (flips in RTL: the browser's own). Never intercepted                                                             | `number-input.e2e.ts › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`, `number-input.e2e.ts › ArrowLeft and ArrowRight move the caret in a right-to-left page and are not intercepted` |
| ArrowUp / ArrowDown                 | NumberInput               | Native caret movement only. Never steps, rounds or changes the number                                                           | `number-input.e2e.ts › ArrowUp and ArrowDown never change the value`                                                                                                                                                |
| Backspace / Delete                  | NumberInput               | Remove a character, also next to a group separator. Never intercepted                                                           | `number-input.e2e.ts › Backspace and Delete remove a character, also next to a group separator`                                                                                                                     |
| Control/Command+A                   | NumberInput               | Selects all the text. Typing then replaces it and the mask starts over                                                          | `number-input.e2e.ts › Control/Command+A selects all the text`                                                                                                                                                      |
| Enter                               | NumberInput in a `<form>` | Submits the form with the number as shown. Native, never prevented                                                              | `number-input.test.tsx › Enter in a form submits it with the shown value (native)`                                                                                                                                  |
| Escape                              | NumberInput               | Does nothing: the value and the focus stay                                                                                      | `number-input.e2e.ts › Escape does nothing: the value and the focus stay`                                                                                                                                           |
| –                                   | its Field.Label           | A click on the label focuses the input (native `<label for>`)                                                                   | `number-input.e2e.ts › clicking the label focuses the input`                                                                                                                                                        |

Copy, cut and undo (Control/Command+C, X and Z) are native too, and a dead key or IME composition is left alone until it ends (the mask's rows are in the [TextInput contract](../text-input/text-input.a11y.md#masked-input)). NumberInput adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: NumberInput renders no overlay. A sticky header needs the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event                                                                                                       | Message key (i18n)                     | Politeness                                           | Test                                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A character is left out (a letter, a currency sign, a second decimal mark, a minus sign that isn't allowed) | `mask.characterNotAllowed` (`allowed`) | Polite, once per field per window, never moves focus | `number-input.test.tsx › a letter is left out and announced politely, in the provider language (%s)`                |
| A digit is left out because the number already has all its `decimals`                                       | `mask.maximumDecimals` (no parameters) | Polite, same throttle                                | `number-input.test.tsx › a digit past the decimals is left out and announced as decimals, not as a full field (%s)` |
| Digits accepted                                                                                             | none                                   | Nothing is announced for input that works            | `number-input.test.tsx › accepted digits announce nothing`                                                          |
| `mask={false}`: any character                                                                               | none                                   | Nothing is left out, so nothing is announced         | `number-input.test.tsx › mask={false} announces nothing: a letter is kept and the live region stays empty`          |
| A custom `mask`: a character is left out                                                                    | the mask's own (`mask.*`)              | Polite, same throttle                                | `number-input.test.tsx › a custom mask announces its own rejections, in the provider language`                          |

Focus entering the input announces nothing live: the name, role, "required", "invalid" and the description (hint, then error) are read by the screen reader. NumberInput adds no strings of its own: the number mask (and a custom `mask`) use the mask's three messages (`characterNotAllowed`, `maximumLength` and `maximumDecimals`), in all six locales, and `mask={false}` uses none, and they can be overridden per provider and per instance (`messages`). `announceRejections={false}` turns the announcements off, for example when you show your own message. **The KvirnProvider is required for announcements.** Without one the mask still works, nothing is announced, and one development warning says so.

Dev warnings (English, for the developer, never announced): a NumberInput with no accessible name (`number-input-without-name`, `number-input-in-field-without-label`), an `id` inside a Field (`number-input-id-in-field`), `decimals` above 0 in a Field with no hint (`number-input-decimals-without-hint`, 3.3.2), and a custom `mask` in a Field with no hint (`number-input-mask-without-description`, 3.3.2: a mask shapes the input but doesn't explain the format). A whole number with the default mask needs no format hint, and `mask={false}` applies no format, so neither warns. A `mask` that is not a mask name warns once (`mask-unknown-name:<name>`) and runs no mask, and a country mask by name with no resolvable country warns (`mask-country-unresolved:<name>:<locale>`): both come from the mask hook (see the [TextInput contract](../text-input/text-input.a11y.md)).

## Consumer responsibilities

- Put every NumberInput in a Field with a Field.Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2). Never use the placeholder as the label (3.3.2).
- With `decimals` above 0, put the format and an example in a hint, a `Field.Hint` under the control: "I kronor, till exempel 1 250,50" (3.3.2, dev warning). The mask takes the decimal mark of the page's language, but it doesn't explain it.
- Put the unit in the label ("Månadshyra i kronor") or the hint. To also show it in the box, use an `InputGroup.Addon`: it is hidden from screen readers, so the label must still say it.
- Set `autoComplete` where a token exists, and never block paste (3.3.8). Don't set `pattern`: it triggers the browser's validation message, in the browser's language.
- Validate in your form, after submit, and say what's wrong and how to fix it in a Field.ErrorMessage (3.3.1, 3.3.3). `min` and `max` are only reported in `details.isWithinRange`: show your own hint, and never clamp.
- Choose a width class that fits the answer: `kv-input--width-2`, `-4`, `-6`, `-10`, `-20`. Width is a hint, never a limit.
- Wrap the app in `KvirnProvider`, so a left-out character is announced (4.1.3) and the decimal mark follows the page's language.
- Don't pass an `id` inside a Field: the Field's id wins. Use `<Field.Root controlId>`.

## Visual / modes

NumberInput renders the `kv-input` part of TextInput with `kv-input--numeric`, so the look, focus indicator, target size, boundary, forced colours and reflow are the TextInput contract's (`text-input.a11y.md`, Visual / modes), and its e2e proves them. In short:

- Focus indicator: 2px, 3:1 against the adjacent colours, on keyboard focus (2.4.7, 2.4.13).
- Target size: at least 24px high (2.5.8).
- forced-colors behaviour: the input keeps a real border, and invalid is not colour alone.
- reduced-motion behaviour: colour transitions only under `no-preference`.
- Reflow: no horizontal scrolling at 320 CSS px, also with a long Finnish label (`number-input.e2e.ts › no horizontal scrolling at 320px: Finnish, amounts and a unit (1.4.10)`).
- RTL: logical properties only. The arrow keys are the browser's own (`number-input.e2e.ts › ArrowLeft and ArrowRight move the caret in a right-to-left page and are not intercepted`). A negative number's minus sign: see Known issues.

## WCAG SCs covered

- 1.3.1 Info and Relationships: the label, hint and error are programmatically associated (`number-input.test.tsx › the label names it, the hint and the error describe it, and the state is on it`).
- 1.3.5 Identify Input Purpose: `autoComplete` passes through (`number-input.test.tsx › forwards its ref and native props, and the part classes join a consumer’s`).
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap: native input, and ArrowUp and ArrowDown are never taken (`number-input.e2e.ts › ArrowUp and ArrowDown never change the value`).
- 2.5.3 Label in Name: the visible label is the name.
- 3.2.2 On Input: typing never moves focus, and a complete number doesn't advance.
- 3.3.1 Error Identification and 3.3.2 Labels or Instructions: through the Field and its hint. A range is reported, never enforced or clamped (`number-input.test.tsx › min and max are reported as isWithinRange, never enforced`).
- 3.3.8 Accessible Authentication (Minimum): paste and autofill work, and no cognitive test is added (`number-input.test.tsx › paste is not blocked: 1 250,50 and 1250.50 both read`).
- 4.1.2 Name, Role, Value: a native `textbox` with name, `aria-invalid`, `aria-required` and `disabled` (`number-input.test.tsx › renders a native text box, not a spinbutton, with no min, max or pattern attribute`).
- 4.1.3 Status Messages: a left-out character is announced politely through the Announcer, and a digit past the decimals says so and not that the field is full (`number-input.test.tsx › a letter is left out and announced politely, in the provider language (%s)`, `number-input.test.tsx › a digit past the decimals is left out and announced as decimals, not as a full field (%s)`).

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

Research questions for the AT run: is a left-out character's message read once, after the echo, and not repeated while a key is held? Is a text box that takes digits understood as a number field by each screen reader, without the spinbutton role? Does `inputmode="numeric"` or `"decimal"` bring up the right keyboard with VoiceOver and TalkBack, and does `text` (negatives allowed) still make a minus sign reachable? Does Dragon dictate "one thousand two hundred and fifty" into the field without corruption?

## Known issues

- **Negative numbers use the text keypad.** iOS's numeric and decimal keypads have no minus sign, so `allowNegative` asks for `inputmode="text"`. The mask still leaves out letters.
- **No provider, no announcement.** `KvirnProvider` is required for announcements.
- **Undo.** When the mask rewrites the value (writes a group separator, leaves out a character), undo can't go back past that step. Accepted, as for TextInput masks.
- **`min` and `max` are not announced.** They are reported to your code only. Say the range in the hint.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
- **RTL: a negative number.** Number masks don't set `dir="ltr"`, so in a right-to-left page the minus sign of a negative number may show on the right of the digits. Use `dir="ltr"` on the NumberInput if your page needs it. To be checked with real readers.
- **A typed space is announced as not allowed when `grouping` is on.** The mask writes the group separator itself, so a space the user types is left out and announced (a core decision; an AT question is whether that is noise).
