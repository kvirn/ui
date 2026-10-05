# Plan 0013: Form fields: Field, Fieldset, Input, Checkbox, RadioGroup and DateInput

- **Status:** Implemented (2026-10-05); manual AT matrix `pending`
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

The fi, nb and nn texts come from the design spec. se stays English, marked `lang="en"`, as for `link.newTabNotice`.

### Theming surface

The classes and `data-*` attributes are in the forms skill, plus `kv-input`, `kv-checkbox`, `kv-radio`, `kv-checkbox-group`, `kv-radio-group`, `kv-date-input`, the width modifiers from the spec (for example `kv-input--width-2`) and `data-state` on Checkbox. Tokens come from the spec. Any new token gets contrast pairs in `contrast-requirements.ts`, at least `danger` as a 3:1 non-text pair on `canvas`, `surface` and `surface-raised`. All new part classes go in prose's exclusion list.

## Tasks

Each phase is one PR and passes every gate on its own.

### Phase 0: decisions and design

- [x] Decisions recorded (Proposed)
- [x] Design spec `docs/design/form-fields.md` (ux-designer, Draft)
- [x] Maintainer approves the plan and the defaults (2026-10-05, Plan 0045: each date field limits its digits, addon text in `text` colour is fine)

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
  - [x] `InputGroup.Root invalid` and `disabled` change only the box's look: documented in `input-group.md` and the contract, and a dev warning when the Root's own prop disagrees with the control (`input-group-invalid-mismatch`, `input-group-disabled-mismatch`; decision: only an own prop is compared, since without one the Root follows the Field as the Input does). Row in `dev-warnings.mdx`.
  - [x] The `click` row moved from the Keyboard table to a `## Pointer` section of the contract. Its e2e test stays.
  - Check clicking an Addon on `mobile-safari` in CI.

### Phase 2: Checkbox, CheckboxGroup, RadioGroup, Radio

- [x] Contracts, failing tests, hooks and components (`packages/react/src/{checkbox,checkbox-group,radio-group}`, commit 300576e). Native inputs. Keyboard sections from the `keyboard` skill's Checkbox and Radio group tables: each checkbox its own Tab stop, the radio group one Tab stop
- [x] Theme (`kv-checkbox`, `kv-radio` in `packages/theme/theme.css`, commit 300576e): 24px marks per the spec, checked, indeterminate, forced colours (marks drawn so they survive), the whole label clickable
- [x] Stories (`apps/storybook/src/components/{checkbox,checkbox-group,radio-group}/*.stories.tsx`): `Components/Form/Checkbox`, `/CheckboxGroup`, `/RadioGroup`, each with a `Keyboard` story and `parameters.a11yContract`
- [x] e2e (`*.e2e.ts` next to the stories; every Keyboard-table row names its test, RTL radio arrows in `radio-group.e2e.ts`): one test per keyboard row, including radio arrows in RTL
- [x] Exports (`packages/react/src/index.ts`) and changeset (`.changeset/checkbox-radio-native-select.md`)
- [x] Docs pages (`checkbox.md`, `checkbox-group.md`, `radio-group.md` now exist next to the contracts; they are still untracked until committed)
- [x] Decided 2026-10-04: no automated check (the maintainer approved 383f811 as is). The marks stay reviewed by eye and in the manual AT matrix. Was: restore an automated threshold check that checked/indeterminate differ visibly from unchecked (webkit, firefox, forced colours), tied to the 383f811 gate-change decision
- [x] accessibility-reviewer APPROVE (re-review 2026-10-04, see below)

### Phase 2b: NativeSelect (item 2)

Superseded: `NativeSelect` was removed and replaced by Listbox native rendering (`native`), Plan 0022 (commit 407b8c5). The items below are kept for the record.

Scope: only the native `<select>` wired by Field. The custom `Select`, `Combobox` and `Autocomplete` need Listbox, Popover and DismissableLayer (all `planned`, M2) and get their own plan.

- [x] ~~`native-select.a11y.md` contract. Native `<select>`: Tab stop, arrows, typeahead and Alt+Down are browser behaviour, documented per the `keyboard` skill. No placeholder option as the only label~~ Superseded by Listbox `native`, Plan 0022 (407b8c5)
- [x] ~~Failing tests first, then `useNativeSelect` and `NativeSelect` (Field wiring: `id`, `aria-describedby`, `aria-invalid`, `aria-required`, `disabled`). `value`/`defaultValue`/`onValueChange` with no stored state (item 0). Children are plain `<option>` and `<optgroup>`~~ Superseded by Listbox `native`, Plan 0022 (407b8c5)
- [x] ~~Theme: `kv-native-select` per the Input look, with a drawn chevron that survives forced colours. Tokens only, no new contrast pairs unless needed~~ Superseded by Listbox `native`, Plan 0022 (407b8c5)
- [x] ~~Stories: `Components/Form/NativeSelect` (default, selected, with description, invalid, disabled, groups, RTL, forced colours, long Finnish label, `Keyboard`, `parameters.a11yContract`). e2e: Tab order, label click focuses, 320px reflow~~ Superseded by Listbox `native`, Plan 0022 (407b8c5)
- [x] ~~Docs, export, changeset, roadmap row for NativeSelect, accessibility-reviewer APPROVE~~ Superseded by Listbox `native`, Plan 0022 (407b8c5)

### Phase 3: DateInput

- [x] i18n: `dateInput.day`, `.month`, `.year`
- [x] Contract, failing tests, `useDateInput`, `DateInput.*`. Keyboard per the `keyboard` skill: three Tab stops in the locale's order, no auto-advance, arrows never step a value
- [x] Stories: `Components/Form/DateInput` (sv, fi, en orders, invalid, date of birth with `autocomplete`, a `Keyboard` story, `parameters.a11yContract`)
- [x] `Components/Form/Overview`: a short form with every control
- [x] e2e, docs, exports, changeset. Gates 2026-10-04: `vp check` clean; `vp test` date-input, DateInput and Form stories in four themes, keyboard-docs and component-naming green; e2e chromium date-input 36/36, form 13/13; `i18n:check` and `theme:check` pass
- [x] accessibility-reviewer APPROVE (re-review 2026-10-04)

### Wrap-up

- [x] Roadmap rows to `alpha` (InputGroup; Field stays in progress for its later plans). Plans index. The manual AT run stays `pending`

## Risks & open questions

- **Design spec open questions, resolved 2026-10-02** (spec §9):
  1. Hints use `text` (item 11). Update DESIGN.md's token table in Phase 1.
  2. The choice layout uses `.kv-field:has(> .kv-checkbox, > .kv-radio)`, so the control must be a direct child of Field.Root (documented). Width classes as in the spec.
  3. DateInput order follows the region via `Intl`, and month first becomes day first. `useDateInput` exposes the order. Phase 3.
  4. The consumer writes the date hint. The docs show one per locale. Revisit a `dateInput.example` message in Phase 3.
  5. No red inline-start bar on invalid fields for now.
  6. Description stays before the error in `aria-describedby`. Recorded as an AT research question.
  7. No `aria-invalid` on radios (item 10).
  8. Until the error summary block ships, the docs say: on submit, move focus to the first invalid field.
  9. Textarea, Yes/No radios side by side, currency affixes, show-password and pasting a whole date into the three boxes are out of scope.
  10. No `kv-form` class yet. Stories space questions with story CSS.
  11. Check and dot marks drawn with `::before` on the input must render in Firefox and WebKit. Commit 383f811 deleted the e2e tests that checked this, so nothing automated checks the marks now: they are reviewed by eye and checked in the manual AT matrix (the Windows Contrast Themes row). A hidden indicator element is the fallback if a browser doesn't draw them. The Phase 2 follow-up (maintainer decision) asks whether to restore an automated threshold check.
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

- [x] All quality gates in AGENTS.md pass (manual AT `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated

## Decisions during Phase 3 (DateInput), 2026-10-04

- [x] **Approved by the maintainer 2026-10-04 (visual rule):** `:where(.kv-heading)` now hyphenates (`hyphens: auto`, `hyphenate-limit-chars: 10 4 4`) and falls back to `overflow-wrap: break-word`, like prose, cards and notifications. Cause: the Overview's page title ("Ansök om boendeparkeringstillstånd", "Hae asukaspysäköintitunnusta") overflowed 320px (1.4.10, `form.stories.tsx > Finnish` and `form.e2e.ts`). DESIGN.md's text-expansion rule now lists headings. Revert both if not approved, and wrap the fixture title instead.
- Order comes from `Intl.DateTimeFormat(locale).formatToParts`; only a month-first result becomes day, month, year; an unknown locale is day first. `useDateInput().order` exposes it; an `order` option and the consumer's own children override it.
- No `dateInput.example` message: the fixture reads `useDateInput().order` to pick the hint example.
- A `DateInput.Root` without children renders Day, Month and Year in the locale's order.
- `value` is `{ year, month, day }` strings, never parsed or padded. `onValueChange(value, { reason: 'input', part, event })` reports the whole date, read from the sibling boxes' refs (no React state).
- `name` is a prefix: `birth` gives `birth-day`, `birth-month`, `birth-year`.
- `invalid` is per box (`invalid` on a box, or `invalidParts` on the Root); the box sets `aria-invalid` and `data-invalid` itself. The Fieldset's `invalid` marks no box, and the date's one error is the Fieldset's.
- `DateInput.Root` provides `FieldGroupContext`, so box labels never get the optional marker; `required` and `disabled` follow the Fieldset.
- Dev warnings: a Root outside a `fieldset` or `role=group`; a box outside a Root.
- `tooling/component-naming` lists `DateInput` as a namespace (extends the check to the new component).
- Open: an invalid box isn't linked to the group's error (AT matrix question); DESIGN.md needs a DateInput line next to InputGroup (design spec §6.14).

## Review 2026-10-04 (choice controls)

Fixes after the accessibility review of Checkbox, CheckboxGroup and RadioGroup (Phase 2). The reviewer item in Phase 2 stays unticked until a re-review returns APPROVE.

Fixed:

- [x] The contracts said the e2e checks the check and dash marks. Commit 383f811 removed those tests, so `checkbox.a11y.md` (Known issues) and open question 11 now say the truth: the marks are reviewed by eye and in the manual AT matrix (Windows Contrast Themes row). The maintainer decision to restore an automated check is a follow-up in Phase 2.
- [x] `checkbox-group.a11y.md` claimed `indeterminate`, `onCheckedChange` and call order for a select-all box in a group. One component test now proves it (`checkbox-group.test.tsx › a "select all" Checkbox in a group: onValueChange first, with its value added, then its own onCheckedChange`) and the contract sentence matches the code: the box needs a `value`, and a box without one gets nothing from the group.
- [x] Rule 13, component tests that repeated e2e keyboard rows, deleted: the Checkbox keyboard tests and the label-click test, the CheckboxGroup "handles no keys" and "own Tab stop" tests, the RadioGroup keyboard tests. The contracts cite the e2e tests by name.
- [x] Rule 13, e2e tests that repeated a cheaper layer, deleted: Checkbox 2.5.8 sizes and invalid error (the Default and Compact stories assert `expectMinimumTargetSize`; the component test covers the error in the description), CheckboxGroup plain form, named group and invalid group (component tests), RadioGroup name and sizes and invalid group (Default story, component tests).
- [x] `Field.Prose` became `Field.Hint` in the Checkbox hint test, to match the contract.
- [x] Reworded "Space on an indeterminate box checks it": it toggles the underlying state; with `checked={false}`, as in the docs example, it checks it.
- [x] `radio-group.a11y.md`: `data-state` is set only when the radio is controlled. The Tab row cites the controlled-group test, and the ArrowUp/ArrowLeft row cites the right-to-left test.
- [x] The `CheckboxGroup` and `RadioGroup` Keyboard stories have a button before and after the group, and the Shift+Tab and Tab rows assert that the neighbouring button gets focus.
- [x] The `CheckboxGroup` `WithDescription` story JSDoc no longer calls the description a "hint". The story renders the same as Default (Default already shows the Prose description), so it is redundant; kept so its Docs entry and axe run stay.

Open follow-ups:

- [x] 1.4.12 Text Spacing for the choice rows (Checkbox, CheckboxGroup, RadioGroup): no generic sweep covers it, so one test per spec (`text spacing overrides clip nothing at 320px`) uses the shared `e2e-text-spacing.ts` helper over the long Finnish and invalid stories. Asserts no clipped text and no sideways scroll, not theme values.
- [x] Ruled 2026-10-04: keep them (testing skill, standing exception). Was: story `play` functions that repeat component tests, repo-wide (rule 13).

## Review 2026-10-04 (DateInput)

Fixes after the accessibility review of DateInput (Phase 3). The reviewer item in Phase 3 stays unticked until a re-review returns APPROVE.

Re-review: APPROVE, 2026-10-04. The non-blocking items are done:

- [x] The optional-marker test has a case with a plain `Fieldset.Root` (no `group`, no `required`) that proves the Root's own `FieldGroupContext` keeps "(valfritt)" off the boxes (`date-input.test.tsx › a Fieldset that is neither group nor required still keeps “(valfritt)” off the boxes`).
- [x] The order test now has the `nb` case (Dag, Måned, År).
- [x] The uncontrolled test is renamed to `uncontrolled: defaultValue and onValueChange` (it never submitted a form), and `date-input.a11y.md` cites the new name.
- [x] Stale comments fixed: the `showSubmits` JSDoc in `permit.fixture.tsx`, the Overview `Keyboard` story JSDoc, and the DateInput `Keyboard` story JSDoc (it names the back button before the date).
- [x] `date-input.a11y.md`, Consumer responsibilities: a native `<fieldset>` gets no warning and no marker for an optional date, so the consumer writes the legend's marker.

Fixed:

- [x] Rule 13, e2e tests that repeated a cheaper layer, deleted: the 2.5.8 sizes (the Default and Compact story plays call `expectMinimumTargetSize`), the order and hint per locale (the locale story plays and the component order test), the order of your own (the `OwnOrder` play and the component test), only the wrong box invalid (the `InvalidYear` play and the component test), the focus indicator (`input.e2e.ts` proves it for `kv-input`, and `.kv-date-input .kv-input` changes no outline), and the Overview Enter-submits test (the input and date-input Enter rows cover it).
- [x] The forced-colours e2e no longer compares border widths. It keeps "the boundary of every box is visible" and the visible message. The thicker invalid edge is reviewed by eye and in the AT matrix's Windows Contrast Themes row (`date-input.a11y.md`, Visual / modes).
- [x] Optional marker (design spec §6.14, open question 12; 1.3.1, 3.3.2): without `group`, an optional date carried "(valfritt)" nowhere, because its boxes never do. Every example and fixture now writes `Fieldset.Root group`. `DateInput.Root` warns in development when its Fieldset is neither `group` nor `required`, with a component test, and a test proves the legend of an optional date carries the marker and no box does. The contract says `group` is needed for the legend's marker.
- [x] The `Keyboard` fixture has a button before the date, and the Shift+Tab row asserts that it gets focus. The Tab rows start from it.
- [x] `date-input.a11y.md` cites the `name` prefix test by its exact name.
- [x] `.changeset/date-input.md` notes the `kv-heading` hyphenation change in `@kvirn-ui/theme`, awaiting maintainer approval.

Recorded:

- `form.e2e.ts › Tab walks every control once, in reading order` has no contract row. It proves the Overview requirement (Plan 0013, Phase 3: a short form with every control composes, a date is three stops, a radio group one, each checkbox its own) and the Overview contract is `fieldset.a11y.md`, whose Tab rows are about a Fieldset's controls.

Open follow-ups:

- [x] 1.4.12 Text Spacing for the year box (four characters plus the invalid edge): `date-input.e2e.ts › the widest answer stays visible in every box…` fills `88`, `88`, `8888` and checks the valid and both invalid stories.
- [x] Ruled 2026-10-04: keep them (testing skill, standing exception). Was: story `play` functions that repeat component tests, repo-wide (rule 13). The DateInput stories follow the existing pattern.
- [x] DESIGN.md: a DateInput line next to the InputGroup text and `kv-date-input`, `kv-date-input-day`, `-month` and `-year` in the class list (spec §6.14 has the wording).
- [ ] Research question for the AT run: an invalid box is not linked to the group's error. Does a screen reader read the error on entering the group when only one box is invalid?

### Re-review (choice controls), 2026-10-04

- [x] accessibility-reviewer: APPROVE on re-review. It does not cover how the marks render in Firefox and WebKit: that waits for the maintainer's decision on a threshold check (Phase 2 item above).
- [x] Gates 2026-10-04: `vp check` 0 errors (5 warnings already on HEAD); `vp test` 274; e2e chromium checkbox 34, checkbox-group 29, radio-group 39.
- [x] Nits: full citation of `works in a plain form: the browser keeps the state and FormData has it`; the no-`value` sentence corrected for an uncontrolled group without a `name`; the English fallback "Back" button in the Keyboard stories is marked `lang="en"` for nb, nn and se.
