# Plan 0013: Form fields: Field, Fieldset, Input, Checkbox, RadioGroup and DateInput

- **Status:** In progress
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** design spec [form-fields.md](../design/form-fields.md)

## Goal

Adopters build an accessible public-sector form from separate parts: a label, a hint, an error message and a native control, wired together automatically. Storybook has a `Components/Form` group with text, number, date, checkbox and radio inputs, and one page each for Label, Description and ErrorMessage.

## Non-goals

- Textarea, Select, Switch: they're on the roadmap and come after this plan. They reuse Field.
- The error summary and form wizard blocks (M4).
- The calendar DatePicker (M4).
- A validation engine. The consumer validates and sets `invalid`.
- Form state of any kind (item 0). Components hold no value, checked or validity state. They render what they're given and report changes up, so the implementor's form logic (TanStack Form, React Hook Form, plain `<form>`) owns it. No core machine either.

## Background

- APG: no pattern for fields. Checkbox and Radio Group are native inputs. Native radios already handle the arrow keys and the Tab stop the way the APG Radio Group pattern does.
- WCAG: 1.3.1, 1.3.5, 1.4.1, 1.4.11, 2.5.3, 2.5.8, 3.3.1, 3.3.2, 3.3.3, 3.3.8, 4.1.2.
- Prior art: GOV.UK (Text input, Date input, Error message, Fieldset), Designsystemet (NO, Field and Fieldset), Base UI Field, React Aria TextField.
- Decisions (now in the forms skill): the parts, wiring, required and optional, the error prefix and no live errors; numbers as text with `inputMode` and dates as three fields.

## Design

The visual spec is [docs/design/form-fields.md](../design/form-fields.md) (ux-designer). It covers tokens, states, width classes, the checkbox and radio marks, DateInput field order per locale, i18n texts and the story list.

### API sketch

```tsx
// Text input with a hint and an error
<Field.Root invalid={errors.name !== undefined} required>
  <Field.Label>Namn</Field.Label>
  <Field.Description>Som det står i ditt pass.</Field.Description>
  <Field.ErrorMessage>{errors.name}</Field.ErrorMessage>
  <Input name="name" autoComplete="name" />
</Field.Root>

// Number: Input with inputMode, never type="number"
<Field.Root>
  <Field.Label>Antal barn</Field.Label>
  <Input name="children" inputMode="numeric" spellCheck={false} className="kv-input--width-2" />
</Field.Root>

// Checkboxes
<CheckboxGroup.Root name="contact" value={contact} onValueChange={setContact}>
  <Fieldset.Legend>Hur vill du bli kontaktad?</Fieldset.Legend>
  <Fieldset.Description>Välj alla som passar.</Fieldset.Description>
  <Field.Root>
    <Checkbox value="email" />
    <Field.Label>E-post</Field.Label>
  </Field.Root>
  …
</CheckboxGroup.Root>

// Radios: native, so arrows and Tab work as the APG pattern says
<RadioGroup.Root name="language" value={language} onValueChange={setLanguage} required>
  <Fieldset.Legend>Vilket språk vill du använda?</Fieldset.Legend>
  <Field.Root>
    <Radio value="sv" />
    <Field.Label>Svenska</Field.Label>
  </Field.Root>
  …
</RadioGroup.Root>

// Date: three fields in a fieldset
<Fieldset.Root invalid={dateError !== undefined}>
  <Fieldset.Legend>När är du född?</Fieldset.Legend>
  <Fieldset.Description>Till exempel 1990 3 27</Fieldset.Description>
  <Fieldset.ErrorMessage>{dateError}</Fieldset.ErrorMessage>
  <DateInput.Root value={date} onValueChange={setDate} autoComplete="bday">
    <DateInput.Year />
    <DateInput.Month />
    <DateInput.Day />
  </DateInput.Root>
</Fieldset.Root>

// Hooks, for your own elements
const field = useField({ invalid, required, hasDescription: true })
<label {...field.labelProps}>Namn</label>
<p {...field.descriptionProps}>…</p>
{invalid ? <p {...field.errorMessageProps}>…</p> : null}
<input {...field.controlProps} />
```

Exports (each part also as a named export, for example `FieldLabel`): `Field` (`Root`, `Label`, `Description`, `ErrorMessage`), `Fieldset` (`Root`, `Legend`, `Description`, `ErrorMessage`), `Input`, `Checkbox`, `CheckboxGroup` (`Root`), `RadioGroup` (`Root`), `Radio`, `DateInput` (`Root`, `Day`, `Month`, `Year`). Hooks: `useField`, `useFieldset`, `useInput`, `useCheckbox`, `useCheckboxGroup`, `useRadioGroup`, `useRadio`, `useDateInput`. Types: `UseXOptions`, `UseXResult`, `XPartProps`, `XProps`, `XState`.

Props follow docs/architecture.md. No component stores form state (item 0): `defaultValue` and `defaultChecked` go straight to the native element, never into React state.

- Input: `value`/`defaultValue`/`onValueChange(value, { reason: 'input', event })`, plus every native prop.
- Checkbox: `checked`/`defaultChecked`/`onCheckedChange(checked, details)`, and `indeterminate`, which sets the DOM property and `data-state="indeterminate"`.
- CheckboxGroup and RadioGroup: `value`/`onValueChange` (the next array or value, computed from the `value` prop and reported up). Without `value`, the native inputs are uncontrolled. Also `name` (RadioGroup generates one if it's missing), `disabled`, `required`, `invalid`.

- CheckboxGroup.Root and RadioGroup.Root render the `<fieldset>` and act as a Fieldset.Root, so Legend, Description and ErrorMessage work inside them.

### Accessibility contract (draft)

| Part               | Element                 | ARIA / state                                                                             |
| ------------------ | ----------------------- | ---------------------------------------------------------------------------------------- |
| Field.Root         | `<div>`                 | none. `data-invalid`, `data-required`, `data-disabled`                                   |
| Field.Label        | `<label for>`           | the control's name. Appends the `field.optional` text unless required or `marker="none"` |
| Field.Description  | `<p id>`                | in the control's `aria-describedby`, first                                               |
| Field.ErrorMessage | `<p id>`, only invalid  | in `aria-describedby`, after the description. Starts with the `field.errorPrefix` part   |
| Fieldset.Root      | `<fieldset>`            | `aria-describedby` = description and error. Native `disabled`                            |
| Fieldset.Legend    | `<legend>`              | the group's name                                                                         |
| Input              | `<input>`               | `id`, `aria-describedby`, `aria-invalid`, `aria-required`, native `disabled` from Field  |
| Checkbox           | `<input type=checkbox>` | the same, plus `indeterminate` (`aria-checked` mixed comes from the native property)     |
| Radio              | `<input type=radio>`    | the same `name` from RadioGroup. Native grouping                                         |
| DateInput.Day etc. | Field + `<input>`       | visible label from `dateInput.*`, `inputMode="numeric"`, `autocomplete` when given       |

| Key                       | Context                | Action                                                                                              |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab           | any control            | moves through the controls in DOM order. A radio group is one stop: the checked radio, or the first |
| Space                     | Checkbox               | toggles (native)                                                                                    |
| Arrow Down/Right, Up/Left | Radio                  | moves to and checks the next or previous radio, wrapping (native). Mirrored in RTL by the browser   |
| Space                     | Radio                  | checks the focused radio if it isn't checked (native)                                               |
| click on the label        | Checkbox, Radio, Input | focuses or toggles the control (native `<label for>`)                                               |

- Focus management: nothing moves focus. The error summary block (M4) owns focus on submit.
- Announcements: none live. The name, description, error, required, invalid and checked state are announced on focus.
- WCAG SCs: listed under Background.

### i18n strings

| Key                 | en         | sv         |
| ------------------- | ---------- | ---------- |
| `field.optional`    | (optional) | (valfritt) |
| `field.errorPrefix` | Error:     | Fel:       |
| `dateInput.day`     | Day        | Dag        |
| `dateInput.month`   | Month      | Månad      |
| `dateInput.year`    | Year       | År         |

The fi, nb and nn texts come from the design spec. se stays English with `TODO(native-review)`, as for `link.newTabNotice`.

### Theming surface

The classes and `data-*` attributes are in the forms skill, plus `kv-input`, `kv-checkbox`, `kv-radio`, `kv-checkbox-group`, `kv-radio-group`, `kv-date-input`, the width modifiers from the spec (for example `kv-input--width-2`) and `data-state` on Checkbox. Tokens come from the spec. Any new token gets contrast pairs in `contrast-requirements.ts`, at least `danger` as a 3:1 non-text pair on `canvas`, `surface` and `surface-raised`. All new part classes go in prose's exclusion list.

## Tasks

Each phase is one PR and passes every gate on its own.

### Phase 0: decisions and design

- [x] Decisions recorded (Proposed)
- [x] Design spec `docs/design/form-fields.md` (ux-designer, Draft)
- [ ] Maintainer approves the plan and the defaults

### Phase 1: Field, Fieldset, Label, Description, ErrorMessage, Input (text and number)

- [x] Tests show it works without our state: an uncontrolled `<form>` submit (`FormData` has the value), a controlled value from the parent, and a form library's spread props and `ref`
- [x] `input.md` has a TanStack Form example

- [x] `field.a11y.md`, `fieldset.a11y.md`, `input.a11y.md` from the draft contract
- [x] Failing component tests first, then `useField`, `Field.*`, `useFieldset`, `Fieldset.*`, `useInput`, `Input`
- [x] i18n: `field.optional`, `field.errorPrefix` in `types.ts` and all six catalogs
- [x] theme.css section 12 "Form fields": field text parts, input, width classes, invalid, disabled, read-only, forced colours, compact density. New tokens and contrast pairs. `theme-css.test.ts` guards
- [x] Stories: `Components/Form/Field`, `/Label`, `/Description`, `/ErrorMessage`, `/Fieldset`, `/Input`, `/Number`, each with every state, RTL, forced colours, a long Finnish label
- [x] e2e: Tab order, label click focuses the input, forced colours (border and invalid visible), 320px reflow
- [x] `field.md`, `fieldset.md`, `input.md`. DESIGN.md Components and Theming entries
- [x] Exports in `packages/react/src/index.ts`
- [x] Changeset (`react`, `theme`, `i18n` minor)
- [x] accessibility-reviewer APPROVE (after one round: error linked from the first invalid render)

### Phase 1b: field order and InputGroup

Maintainer's instruction: implement everything first, then write and update the tests and run the gates once at the end.

The spec is in [form-fields.md](../design/form-fields.md):

- spacing in the new order: §6.2
- width classes stay on the Input, and the group fits around it: §6.4
- InputGroup: §6.13
- DESIGN.md wording: §6.14
- fixtures: §4.4–4.5
- stories and e2e: §7.1

There are no new public tokens and no new `theme:check` pairs.

The spec's open questions, resolved on 2026-10-02 as defaults the maintainer can change:

- 14: keep the single date field with a decorative calendar icon. The docs say it's decorative until the M4 DatePicker turns it into a named button.
- 15: Addon text uses `text`, not `text-muted`.
- 16: no `scroll-margin` in the theme. The docs say to use `scroll-padding` on the page.
- 17: a Button in a group is a flat segment with a divider (no button depth), and only the default look is supported.

- [x] Design spec update: the new default order, and InputGroup (ux-designer)
- [x] Several Descriptions per Field and Fieldset: one id each, in DOM order in `aria-describedby`, then the error. `useField` and `useFieldset` support several descriptions with complete server-rendered markup. A dev warning when a Field renders two ErrorMessages
- [x] `InputGroup.Root` and `InputGroup.Addon` (`useInputGroup`). Addons are `aria-hidden`, and clicking one focuses the Input. A dev warning for focusable content in an Addon. Field state on the Root. Buttons go directly in the Root
- [x] theme.css: the new order's spacing, InputGroup (box, focus ring around the group, invalid, disabled, read-only, forced colours, compact, RTL, width classes), any new contrast pairs
- [x] Stories: every Form page in the new order. A new `Components/Form/InputGroup` page (kr, %, km, search icon with a clear Button, calendar icon, RTL prefix, invalid, disabled, a long Finnish label at 320px)
- [x] Docs: `field.md`, `input.md`, a new `input-group.md`, `input-group.a11y.md` (Keyboard section per the `keyboard` skill: the text-input keys, addons never Tab stops, a Button in the group is its own stop), DESIGN.md wording per the spec, the changeset
- [x] Then the tests: component tests for several Descriptions and InputGroup, the updated story play functions, e2e for InputGroup (forced colours, RTL, reflow, focus ring, Tab order with a Button)
- [x] Gates once at the end (e2e on Chromium only, by the maintainer's choice during heavy development)
- [x] accessibility-reviewer APPROVE (no blocking findings). The hover fill no longer covers the group's edge, and the Tab row names both of its tests
- [ ] Follow-ups before beta:
  - `InputGroup.Root invalid` and `disabled` change only the box's look: document this, and warn when they disagree with the control.
  - Move the `click` row out of the Keyboard table.
  - Check clicking an Addon on `mobile-safari` in CI.

### Phase 2: Checkbox, CheckboxGroup, RadioGroup, Radio

- [ ] Contracts, failing tests, hooks and components. Native inputs. Keyboard sections from the `keyboard` skill's Checkbox and Radio group tables: each checkbox its own Tab stop, the radio group one Tab stop
- [ ] Theme: 24px marks per the spec, checked, indeterminate, forced colours (marks drawn so they survive), the whole label clickable
- [ ] Stories: `Components/Form/Checkbox`, `/CheckboxGroup`, `/RadioGroup`, each with a `Keyboard` story and `parameters.a11yContract`
- [ ] e2e: one test per keyboard row, including radio arrows in RTL
- [ ] Docs, exports, changeset, accessibility-reviewer APPROVE

### Phase 2b: NativeSelect (item 2)

Scope: only the native `<select>` wired by Field. The custom `Select`, `Combobox` and `Autocomplete` need Listbox, Popover and DismissableLayer (all `planned`, M2) and get their own plan.

- [ ] `native-select.a11y.md` contract. Native `<select>`: Tab stop, arrows, typeahead and Alt+Down are browser behaviour, documented per the `keyboard` skill. No placeholder option as the only label
- [ ] Failing tests first, then `useNativeSelect` and `NativeSelect` (Field wiring: `id`, `aria-describedby`, `aria-invalid`, `aria-required`, `disabled`). `value`/`defaultValue`/`onValueChange` with no stored state (item 0). Children are plain `<option>` and `<optgroup>`
- [ ] Theme: `kv-native-select` per the Input look, with a drawn chevron that survives forced colours. Tokens only, no new contrast pairs unless needed
- [ ] Stories: `Components/Form/NativeSelect` (default, selected, with description, invalid, disabled, groups, RTL, forced colours, long Finnish label, `Keyboard`, `parameters.a11yContract`). e2e: Tab order, label click focuses, 320px reflow
- [ ] Docs, export, changeset, roadmap row for NativeSelect, accessibility-reviewer APPROVE

### Phase 3: DateInput

- [ ] i18n: `dateInput.day`, `.month`, `.year`
- [ ] Contract, failing tests, `useDateInput`, `DateInput.*`. Keyboard per the `keyboard` skill: three Tab stops in the locale's order, no auto-advance, arrows never step a value
- [ ] Stories: `Components/Form/DateInput` (sv, fi, en orders, invalid, date of birth with `autocomplete`, a `Keyboard` story, `parameters.a11yContract`)
- [ ] `Components/Form/Overview`: a short form with every control
- [ ] e2e, docs, exports, changeset, accessibility-reviewer APPROVE

### Wrap-up

- [ ] Roadmap rows to `alpha`. Plans index. The manual AT run stays `pending`

## Risks & open questions

- **Design spec open questions, resolved 2026-10-02** (spec §9):
  1. Hints use `text` (item 11). Update DESIGN.md's token table in Phase 1.
  2. The choice layout uses `.kv-field:has(> .kv-checkbox, > .kv-radio)`, so the control must be a direct child of Field.Root (documented). Width classes as in the spec.
  3. DateInput order follows the region via `Intl`, and month first becomes day first. `useDateInput` exposes the order. `se` needs the native reviewer. Phase 3.
  4. The consumer writes the date hint. The docs show one per locale. Revisit a `dateInput.example` message in Phase 3.
  5. No red inline-start bar on invalid fields for now.
  6. Description stays before the error in `aria-describedby`. Recorded as an AT research question.
  7. No `aria-invalid` on radios (item 10).
  8. Until the error summary block ships, the docs say: on submit, move focus to the first invalid field.
  9. Textarea, Yes/No radios side by side, currency affixes, show-password and pasting a whole date into the three boxes are out of scope.
  10. No `kv-form` class yet. Stories space questions with story CSS.
  11. Check and dot marks drawn with `::before` on the input must render in Firefox and WebKit. Phase 2 e2e checks this, with a hidden indicator element as the fallback.
  12. and 13. "(optional)" on group options and DateInput boxes, and a Fieldset's `invalid` cascading down: resolved in the forms skill.

- **Defaults chosen without the maintainer's answer** (2026-10-02): three-field date, `inputMode` numbers, mark optional rather than required, a visible-in-markup "Error:" prefix, phased PRs. All are in the forms skill.
- `aria-describedby` on a `<fieldset>` isn't announced consistently by TalkBack. GOV.UK ships it, and the manual AT run checks it.
- `aria-required` instead of native `required` is unusual. Revisit if AT testing shows a gap.
- DateInput field order: following the locale (sv year first) against a fixed order. The design spec decides.
- Indeterminate checkboxes: the native property can't be set in SSR markup, so it's set in an effect and the first paint is unchecked. The test covers it.

## Testing strategy

Standard pyramid. Every component test checks the accessible name and description per state in sv and en, and that `aria-describedby` never references a missing id. No core tests: there's no core machine.

## Rollout

Alpha in the next 0.x, one minor per phase. New public API only.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
