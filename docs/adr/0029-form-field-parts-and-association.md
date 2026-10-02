# ADR-0029: Form fields: separate Label, Description and ErrorMessage parts, wired by Field and Fieldset

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for "label, error text and form hints, all separate components". The defaults below were proposed with Plan 0013 and are open to change.
- **Tags:** api, a11y, i18n, theming

## Context

M1 needs form controls (roadmap: Field, Label, Description, ErrorMessage, Fieldset, Input, Checkbox, CheckboxGroup, RadioGroup). Every control needs the same wiring: a visible label, an optional hint, an error message, and for groups a `fieldset` with a `legend`. When adopters wire these by hand they get the common failures: placeholder-only labels, hints that aren't announced, errors shown in colour only, and `aria-describedby` that points at ids that don't exist.

Nothing in the repository decides how the parts associate, how required and optional are shown, how an error is identified to screen-reader users, or whether errors are announced. `docs/architecture.md` already names the parts (`Label`, `Description`, `ErrorMessage`) and the prop objects (`labelProps`, `descriptionProps`, `errorMessageProps`). DESIGN.md sets the order (label, hint, error, control) and the invalid look (2px `danger` and a message, never colour alone). The design skill sets "validate on submit, error summary on top".

## Decision drivers

- Native semantics first: `<label for>`, `<fieldset>`/`<legend>`, native inputs (AGENTS.md hard rule 2).
- The maintainer wants each text part as its own component and its own Storybook page.
- Locality of behaviour: no DOM querying and no global ids. Parts register with their nearest Field or Fieldset.
- No hard-coded strings: every library string is in all six locales and can be overridden (ADR-0007).
- Behaviour that works across NVDA, JAWS, VoiceOver and TalkBack today, not only on paper.

## Options considered

### Option A: Field and Fieldset contexts with separate text parts (chosen)

- ✅ Each part renders one element and can be used, styled and documented on its own.
- ✅ The same Description and ErrorMessage work inside a Field (one control) and a Fieldset (a group).
- ❌ Parts depend on a context, so they warn in development when used outside one.

### Option B: one `<TextField label hint error />` component with props

- ✅ Least code for the adopter.
- ❌ The consumer no longer owns the markup, which is the library's premise (TanStack-style). Rejected.

### Option C: `aria-errormessage` instead of `aria-describedby` for errors

- ✅ Semantically precise.
- ❌ Support is still uneven across screen readers in 2026. `aria-describedby` is announced everywhere. Rejected for now.

## Decision

We will use Option A:

0. **No form state** (maintainer, 2026-10-02). The components deliver open APIs and leave form logic to the implementor, so TanStack Form, React Hook Form or a plain `<form>` all work:
   - Values, checked state and validity are props, and changes are reported up through callbacks (`onValueChange(value, details)`, `onCheckedChange(checked, details)`) and the native events.
   - Without `value` or `checked`, the native element is uncontrolled and holds its own value. The component never copies it into React state.
   - Groups (CheckboxGroup, RadioGroup, DateInput) derive what they render from the `value` prop and report the next value up. They never store it.
   - `invalid`, `required` and `disabled` are props only. There's no validation, no touched or dirty tracking and no error state.
   - Native props, events, `name` and `ref` pass through to the native element.
   - The only internal bookkeeping is which text parts are mounted, so `aria-describedby` references only ids that exist. That's markup wiring, not form state.
1. **Parts.** `Field.Root` (`<div>`), `Field.Label` (`<label>`), `Field.Description` (`<p>`), `Field.ErrorMessage` (`<p>`). `Fieldset.Root` (`<fieldset>`), `Fieldset.Legend` (`<legend>`), and `Fieldset.Description` and `Fieldset.ErrorMessage`, which are the same components as Field's. Each part is also a named export (`FieldLabel`, `FieldDescription`, `FieldErrorMessage`, `FieldsetLegend`, …). The hooks are `useField()` and `useFieldset()` for your own elements.
2. **Wiring.** Field generates the ids (`useId`, overridable with `id`). The control (Input, Checkbox, or your own element via `field.controlProps`) gets `id`, the label's `htmlFor`, and `aria-describedby` listing the description id and then the error id, but only for parts that are rendered. A Fieldset puts the same `aria-describedby` on the `<fieldset>`. The nearest Field or Fieldset wins, so a Field inside a Fieldset (DateInput) works.
3. **Invalid.** `invalid` on Field.Root or Fieldset.Root. The control gets `aria-invalid="true"`, and every part gets `data-invalid`. `ErrorMessage` renders nothing unless its field is invalid, so a hidden or stale message is never referenced. We use `aria-describedby`, not `aria-errormessage`.
4. **Error prefix.** ErrorMessage starts with a prefix part (`kv-field-error-prefix`) with the `field.errorPrefix` message ("Error:", "Fel:"). The default theme hides it visually and shows the `error` icon. Without the theme it stays visible, which is still correct. Screen-reader users hear "Error: Enter your name" (3.3.1).
5. **Required and optional.** `required` on Field.Root sets `aria-required="true"` and `data-required` on the control, not native `required`. So the browser's own validation bubbles (in the browser's language, gone on blur) don't replace the form's own messages. A consumer who wants native validation passes `required` on the control. The label marks the optional fields, not the required ones: Field.Label appends `field.optional` ("(optional)", "(valfritt)") when its field isn't required. `marker="none"` on the Label turns that off, for example for a lone search field or a single consent checkbox.
6. **No live announcement of errors.** Errors appear after submit, and the error summary block (M4) takes focus. A live region per field would read every error at once, or interrupt typing. An error is announced when the user reaches the field, through `aria-describedby`.
7. **Disabled** on Field.Root sets native `disabled` on the control and `data-disabled` on the parts. On Fieldset.Root it's native `fieldset[disabled]`, which disables every control inside.
8. **Styling hooks.** Classes `kv-field`, `kv-field-label`, `kv-field-optional`, `kv-field-description`, `kv-field-error-message`, `kv-field-error-prefix`, `kv-fieldset`, `kv-fieldset-legend`. State as `data-invalid`, `data-required`, `data-disabled`. The theme never styles `:invalid` or `:user-invalid`, only `[data-invalid]`.
9. **Storybook.** Form components go under `Components/Form/<Name>`, one page per component. This extends ADR-0023's `Components/<Name>` with one nested group. Everything else in ADR-0023 holds.
10. **Groups and nesting** (added with the design spec, 2026-10-02):
    - A Fieldset's `invalid` marks the fieldset's own parts only. It doesn't pass down to the Fields inside, so a DateInput marks only the wrong box under one message.
    - A Field inside a CheckboxGroup, RadioGroup or DateInput defaults to `marker="none"`: an option or a date box is never "(optional)". The group's legend carries the marker instead.
    - `Fieldset.Legend` takes the same `marker`. It defaults to `"optional"` in a CheckboxGroup, RadioGroup or DateInput fieldset that isn't required, and to `"none"` in a plain Fieldset, which only groups questions.
    - Radios get no `aria-invalid`, because ARIA 1.2 doesn't support it on `radio`. The group's error reaches users through the fieldset's `aria-describedby`.
11. **Hint colour.** Description uses `text`, not `text-muted`. A hint carries what the user needs to answer, and DESIGN.md's Don'ts keep `text-muted` away from must-read text. DESIGN.md's token table is updated to match.

## Accessibility impact

- 1.3.1 and 4.1.2: native label, fieldset and legend, and the description and error in the accessible description.
- 3.3.1 and 3.3.3: errors in text, with a text prefix, and linked to the control. 3.3.2: a visible label always, and the optional text in the label.
- 1.4.1: invalid is a 2px border, the icon and the message, never colour alone.
- Using `aria-required` instead of `required` keeps the browser from showing its own bubble, which isn't translated and disappears on blur. Screen readers still announce "required".
- `aria-describedby` on a `<fieldset>` is announced by NVDA, JAWS and VoiceOver when the user enters the group (as on GOV.UK). TalkBack is less consistent. The manual AT run checks it.
- No APG deviation: there is no APG pattern for fields. Checkbox and Radio Group use native inputs (ADR-0030 and Plan 0013).

## Consequences

- Positive: one wiring model for every control in M1 and later (Select, Combobox, DateInput).
- Negative / trade-offs: optional marking is on by default, so an adopter who marks required fields with an asterisk has to set `marker="none"` and add their own text. A later `marker="required"` can cover that without breaking anything.
- Follow-ups: the error summary block (M4) links to the control ids generated here. VisuallyHidden (M1) may later replace the prefix's theme rule.

## Validation

- Component tests assert the accessible name and description per state (`toHaveAccessibleName`, `toHaveAccessibleDescription`) and that `aria-describedby` never references a missing id.
- Manual AT run (pending): the error prefix, the optional text and the fieldset description in NVDA, JAWS, VoiceOver and TalkBack.

## References

- GOV.UK Design System: Text input, Error message, Fieldset, Validation
- Designsystemet (NO): Field, Fieldset, ValidationMessage
- Adrian Roselli, "Avoid Default Field Validation" (2019) and "Exposing Field Errors" (2023)
- docs/architecture.md (API conventions), DESIGN.md (Text inputs, Checkboxes and radios)
