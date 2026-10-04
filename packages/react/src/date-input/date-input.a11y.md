# Accessibility contract: DateInput (DateInput.Root, DateInput.Day, DateInput.Month, DateInput.Year)

- **APG pattern:** none. There is no APG pattern for a date field made of text boxes. A date is a group of three labelled text inputs inside a `<fieldset>` with a `<legend>`, which is the pattern the GOV.UK and Nordic public-sector design systems use, and the one that works with autofill, dictation and any screen reader. A calendar DatePicker is a later component and also accepts typed input.
- **Deviations:** none from APG. Decisions (forms skill and Plan 0013, Phase 3): three native text inputs, never `type="date"`; the order follows the region through `Intl` and a month-first result becomes day first; three Tab stops, no auto-advance, no arrow-key stepping; the consumer writes the date hint; `Fieldset.Root`'s `invalid` does not cascade, each box has its own `invalid`.
- **Native elements used:** `<fieldset>` and `<legend>` (the consumer's `Fieldset.Root` and `Fieldset.Legend`), `<div>` (`DateInput.Root`, and one per box), `<label for>` (the box label), `<input type="text">` with `inputmode="numeric"` (the boxes).
- **Status:** alpha candidate (Plan 0013, Phase 3). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `date-input.test.tsx` next to this file. `date-input.stories.tsx` and `date-input.e2e.ts` in `apps/storybook/src/components/date-input/`. The group's parts (`Fieldset.Legend`, `Fieldset.Prose`, `Fieldset.Hint`, `Fieldset.ErrorMessage`): `fieldset.a11y.md`. The text keys of each box: `input.a11y.md`.

A DateInput is one question ("Födelsedatum") answered with three boxes: day, month and year. `DateInput.Root` renders the row of boxes and goes inside a `Fieldset.Root`, whose legend is the question and names the group. Each box is a `Field` with a visible label ("Dag", "Månad", "År") and a native `Input`. It holds no form state: the value is the `value` prop and each change is reported up, or the native inputs keep it and a form submit reads it. It never parses or validates the date: that is the form's job.

## Roles, states, properties

| Part                         | Element / role                              | ARIA / state                                                                                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The group (`Fieldset.Root`)  | `<fieldset>` → `group`                      | Named by its `<legend>`. `aria-describedby` = description and hint ids in DOM order, then the error id (`fieldset.a11y.md`)                                                                                                                 | The consumer renders it. Write `group`: the boxes never carry "(valfritt)" (`DateInput.Root` drops it), so only a `group` Fieldset puts it on the legend of an optional date. `required` removes it                                                                                                                                                                    |
| DateInput.Root               | `<div>`, no role                            | none. `data-*` none                                                                                                                                                                                                                         | Class `kv-date-input`. Props: `name`, `value`, `defaultValue`, `onValueChange`, `autoComplete`, `order`, `required`, `disabled`, `readOnly`, `invalidParts`, `messages`, `render`, and every div prop. Without children it renders Day, Month and Year in the locale's order. `required` and `disabled` default to the Fieldset's. Warns when it is not inside a group |
| DateInput.Day, .Month, .Year | `<div class="kv-field">` with label + input | The input is a `textbox` named by its visible label (`dateInput.day`, `.month`, `.year`). `aria-invalid="true"` only when this box is `invalid`. `aria-required="true"` when the group is required. Native `disabled`, `readOnly`, `data-*` | Classes `kv-field kv-date-input-day` (`-month`, `-year`) on the Field, `kv-input` on the input. `inputmode="numeric"`, `spellcheck="false"`, `autocomplete="bday-day"` (`-month`, `-year`) when the Root has `autoComplete="bday"`. No `maxlength`, no `pattern`, no placeholder. The label never has "(valfritt)"                                                     |
| `useDateInput`               | the logic, for your own elements            | returns `order`, `labels`, `rootProps`, `getBoxProps(part)`, `getInputProps(part)`                                                                                                                                                          | Options: `name`, `value`, `defaultValue`, `onValueChange`, `autoComplete`, `order`, `readOnly`, `messages`. `order` is the locale's, from `Intl`                                                                                                                                                                                                                       |

Rules, tested in `date-input.test.tsx`:

- **Three boxes in a named group.** In a `Fieldset.Root` with a `Fieldset.Legend`, the group is named by the legend and each box by its own label (`date-input.test.tsx › the group is named by its legend and each box by its label`).
- **The group describes the whole date.** The `Fieldset.Hint` (the format example) and the `Fieldset.ErrorMessage` are in the fieldset's `aria-describedby`, not in the boxes' (`date-input.test.tsx › the hint and the error describe the group`).
- **The field order follows the region** (`date-input.test.tsx › the order follows the locale: year first for sv-SE, day first for sv-FI, fi, nb and en`). `Intl.DateTimeFormat(locale).formatToParts` gives the order. A result that starts with the month (`en`, `en-US`) becomes day, month, year, because month first reads as day first for the EU readers this library serves. `se` follows `Intl` too (year first in Norway and Sweden): the native reviewer confirms it. A `order` prop on the Root or the hook, or writing `DateInput.Day`, `.Month` and `.Year` as children in your own order, overrides it (`date-input.test.tsx › children and the order option override the locale’s order`).
- **`invalid` is per box.** The Fieldset's `invalid` marks the group's parts only (`fieldset.a11y.md`). A box with `invalid` (or named in `invalidParts`) gets `aria-invalid="true"` and `data-invalid` on its input, label and Field; the others stay valid. The group's one error is the message (`date-input.test.tsx › only the invalid boxes are marked invalid, and the group’s invalid marks none`).
- **`name` is a prefix.** `name="birth"` gives the boxes `birth-day`, `birth-month` and `birth-year`, which a plain form submit sends. A `name` on one box wins (`date-input.test.tsx › name is a prefix for the three inputs, and a box’s own name wins`).
- **Controlled by `value`.** `value={{ year, month, day }}` (all strings) sets the three boxes, and each change calls `onValueChange({ year, month, day }, { reason: 'input', part, event })` with the whole date as the boxes show it. Nothing is stored (`date-input.test.tsx › controlled: value sets the boxes and a change reports the whole date`).
- **Uncontrolled without `value`.** `defaultValue` (any of the three) sets the starting text; the browser keeps it, and `onValueChange` still reports the whole date (`date-input.test.tsx › uncontrolled: defaultValue and onValueChange`).
- **Never parsed, never fixed.** Leading zeros, letters and impossible dates stay as typed; the value is strings (`date-input.test.tsx › the value is the typed text: nothing is parsed or padded`).
- **`autoComplete="bday"`** on the Root gives the boxes the tokens `bday-day`, `bday-month` and `bday-year` (1.3.5) (`date-input.test.tsx › autoComplete bday sets the three tokens`).
- **Required and disabled** come from the Fieldset when the Root doesn't set them: `required` makes every box `aria-required` and `disabled` disables them natively (`date-input.test.tsx › required and disabled come from the Fieldset`).
- **Strings** are `dateInput.day`, `dateInput.month` and `dateInput.year`, from the provider, the instance `messages` or the built-in English, in at least sv and en (`date-input.test.tsx › the labels follow the provider’s locale and the instance messages`).
- **No axe violations** in the default, invalid, disabled and read-only states (`date-input.test.tsx › has no axe violations in every state`).
- **Dev warnings:** a Root outside any group; a Day, Month or Year outside a Root (`date-input.test.tsx › warns when the Root is outside a group, and when a box is outside a Root`); a Root in a Fieldset that is neither `group` nor `required`, where an optional date would say so nowhere (`date-input.test.tsx › warns when the Fieldset is neither group nor required, and not when it is either`).
- **The optional marker is the legend's.** In a `group` Fieldset that isn't `required`, the legend ends with "(valfritt)", and no box does (`date-input.test.tsx › an optional date carries “(valfritt)” on its legend, never on a box`), also when the Fieldset is neither `group` nor `required` (`date-input.test.tsx › a Fieldset that is neither group nor required still keeps “(valfritt)” off the boxes`).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: DateInput handles no keys and never calls `preventDefault` on one. The group is **three Tab stops**, one per box, in the field order, because each box is its own text input (the date is not a composite widget). There is **no auto-advance**: filling a box never moves focus (3.2.2), and the arrow keys never step a value up or down (numbers are text). The legend, hint, labels and error are not Tab stops. Which box comes first depends on the locale (day first, or year first for sv-SE), and the table says "first" and "last" in that order. In right-to-left text the boxes flow right to left in DOM order, and Tab follows the DOM.

| Key                                 | Context             | Action                                                                                                              | Test                                                                                                                                                                                            |
| ----------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab                                 | before the date     | Moves focus to the first box in the field order                                                                     | `date-input.e2e.ts › Tab enters the date at the first box of the field order`                                                                                                                   |
| Tab                                 | on a box            | Moves focus to the next box in the field order. From the last box it leaves the date, to the next focusable element | `date-input.e2e.ts › Tab moves from box to box in the field order and leaves after the last`, `date-input.e2e.ts › right to left: Tab follows the DOM order and the arrow keys stay in the box` |
| Shift+Tab                           | on a box            | Moves focus to the previous box. From the first box it leaves the date, to the previous focusable element           | `date-input.e2e.ts › Shift+Tab moves back through the boxes and leaves before the first`                                                                                                        |
| Characters                          | on a box            | Types them. Nothing is filtered, and focus never moves to the next box, not even when the box looks full            | `date-input.e2e.ts › typing never moves focus to the next box and filters nothing`                                                                                                              |
| ArrowUp / ArrowDown                 | on a box            | Do not change the value. A number is text here: the keys only move the caret, as in any text field                  | `date-input.e2e.ts › ArrowUp and ArrowDown never step the value`                                                                                                                                |
| ArrowLeft / ArrowRight / Home / End | on a box            | Move the caret inside the box (flips in RTL: the browser's own). They never move focus to another box               | `date-input.e2e.ts › ArrowLeft, ArrowRight, Home and End move the caret and never leave the box`                                                                                                |
| Enter                               | on a box, in a form | Submits the form (native). DateInput does not intercept it                                                          | `date-input.e2e.ts › Enter in a box submits the form`                                                                                                                                           |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- On error: DateInput never moves focus. The error summary block (M4) will, and until then the consumer moves focus to the first invalid box, or the first box when the whole date is wrong.
- Never obscured by: nothing around the boxes clips the focus ring.

## Announcements

None. Nothing is live. On entering the first box a screen reader reads the legend, "group", the hint and, when invalid, "Fel: …"; then the box's label, "edit text" and its state. Moving to the next box reads its label only.

## Consumer responsibilities

- A `Fieldset.Root` around the DateInput, with a `Fieldset.Legend` that asks the question ("Födelsedatum"), first in the fieldset. The legend ends with "(valfritt)" in a `group` fieldset that isn't `required`.
- A native `<fieldset>` gets no dev warning and no marker for an optional date, so you write the legend's "(valfritt)" yourself.
- **A `Fieldset.Hint` with an example in the field order** ("Till exempel 2007 3 27" for sv-SE, "Till exempel 27 3 2007" for sv-FI), under the boxes. KvirnUI supplies no example text: it names the fields, and the example is the service's (3.3.2). Write it in the order the boxes are in.
- One message for the whole date in `Fieldset.ErrorMessage`, after the boxes, and `invalid` on the wrong boxes only ("must include a year" marks Year, "must be a real date" marks all three). Say what is wrong and how to fix it.
- Pass `value` and `onValueChange` from your form state, or `defaultValue` and `name` for a plain `<form>`. Validate the date yourself: DateInput never parses it.
- A date of birth gets `autoComplete="bday"`. Don't set it on other dates (1.3.5).
- Pick the order from the page's locale, or deliberately override it when the service must match a paper form. Then the hint follows the order.
- Don't use a DateInput for a date far from memory (a date to pick near today): a calendar DatePicker, when it exists, also accepts typed input.

## Visual / modes

- Focus indicator: the Input's own, a 2px `focus-ring` outline, 2px offset, on the focused box.
- Target size: each box is as high as an Input (44px, 32px in `kv-compact`) and at least 51px wide (2.5.8). The year box is wider than day and month.
- Colour: an invalid box takes the Input's invalid state, a 2px `danger` edge with no change of the text position, plus the group's message (never colour alone, 1.4.1). A disabled box is dashed; a read-only box has a solid `surface` edge.
- forced-colors behaviour: the Input's system colours; every box keeps a visible edge and the message stays visible (`date-input.e2e.ts › forced colours keep the edge of every box visible (1.4.11)`). That an invalid box's 2px edge is thicker than a valid one's is reviewed by eye and in the AT matrix's Windows Contrast Themes row, not asserted.
- reduced-motion behaviour: no motion of its own.
- Reflow: all three boxes fit one row at 320px, and wrap in order at 200% text size, never below their width (`date-input.e2e.ts › no horizontal scrolling at 320px in the Finnish and invalid stories (1.4.10)`).
- RTL: the boxes flow right to left in DOM order; digits stay left to right.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a fieldset with a legend, a visible label for each box.
- 1.3.5 Identify Input Purpose: `autocomplete="bday-day"`, `bday-month` and `bday-year`.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the invalid edge's width and the message.
- 2.1.1 Keyboard, 2.4.3 Focus Order: three Tab stops in the field order, native keys.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 3.2.2 On Input: no auto-advance, no context change.
- 3.3.1, 3.3.2, 3.3.3: the legend asks, the hint gives the format in the field order, the error says what to do.
- 3.3.7 Redundant Entry and 3.3.8 Accessible Authentication: paste and autofill work in each box; nothing asks the user to remember a code.

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

Research questions for the AT run: do NVDA, JAWS and VoiceOver announce the group name and its hint on the first box? Is the group's error read on entering the group when only one box is marked invalid, or does the box need its own link to the error? Do Swedish residents (year first) and Finland-Swedish residents (day first) both complete the date without errors in their own order?

## Known issues

- **`aria-describedby` on a `<fieldset>` isn't announced consistently by TalkBack.** See `fieldset.a11y.md`.
- **An invalid box isn't linked to the group's error.** The box has `aria-invalid="true"`, and the error is in the fieldset's description, which screen readers read on entering the group. A box added to the error's description would repeat it three times. The AT run decides.
- **`se` (Northern Sámi) is English** for the three labels until a native speaker provides them (`TODO(native-review)`), and the `Intl` order for `se` needs the native reviewer.
- **Pasting a whole date** ("27.3.2007") into one box isn't split across the three. Out of scope (Plan 0013).
