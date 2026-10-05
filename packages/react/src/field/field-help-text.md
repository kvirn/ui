# Field.HelpText

> **Draft** (Plan 0017). The accessibility contract is [field.a11y.md](field.a11y.md), shared with Field. The Field it sits in is described in [field.md](field.md).

A short instruction under a control that helps while typing: a format, an example or a limit, such as "12 siffror, ÅÅÅÅMMDD-NNNN". Use it inside a [Field](field.md), or as `Fieldset.HelpText`, `RadioGroup.HelpText` and `CheckboxGroup.HelpText` under a group. Text the user must read before answering is a description: write a `Field.Prose` above the control instead.

- **Under the control, in 14px.** A help text never goes above the control: a dev warning (`help-text-before-control`) fires when it does.
- **Plain text.** The accessible description is the text content, so a heading, list or link inside it loses its structure for a screen-reader user, and a link in it can't be followed from there. Keep it to one or two short sentences or a format example. Anything with structure is a `Field.Prose`.
- It registers with its Field or Fieldset, gets its own id, and is listed in the control's `aria-describedby` in DOM order, then the error. A field can have several.
- It never moves focus, is never a live region, and keeps its look when the field is invalid, disabled or read-only: the error carries the invalid state, and a disabled field's help text stays readable because it often says why.
- It is never the only place a format lives: the error repeats it.

## API

| Prop     | Type                             | Meaning                                                                                 |
| -------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `render` | `(props, state) => ReactElement` | Another element: `render={<div />}`. Never something interactive. `state` is the host's |

- **Renders** `<p class="kv-field-help-text">` with an `id` and the host's state attributes (`data-invalid`, `data-disabled`).
- **Outside a Field or Fieldset** it warns once in development (`help-text-outside-field`) and renders a plain paragraph with no id.
- **A help text for one option** of a checkbox or radio is a `Field.HelpText` in that option's own Field, under its label: it describes that input, not the group.

## Notes

- A description and a help text are different things: the description is read before answering and may hold paragraphs and links (16px), the help text is short and helps while typing (14px). When in doubt: if the user must read it before they start, it's a description.
- The help text is not a place for the only copy of an instruction a magnifier user may not see under the box: say it in the label or description too.
