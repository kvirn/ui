---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

A hint and a description are now different parts (Plan 0029). A hint is a short instruction under the control, such as a format ("12 siffror, ÅÅÅÅMMDD-NNNN"). A description is a `Prose` above the control, for what the user must read before answering.

New in `@kvirn-ui/react`:

- `Field.Hint`, `Fieldset.Hint`, `CheckboxGroup.Hint` and `RadioGroup.Hint` (also `FieldHint`, `FieldsetHint`, `CheckboxGroupHint` and `RadioGroupHint`). A hint renders `<p class="kv-field-hint">` with an id, and `render` can change the element. It registers as a description like `Field.Prose`, so the control's `aria-describedby` lists the descriptions and hints in DOM order, then the error. It takes `data-invalid` and `data-disabled` from its Field or Fieldset. Outside a Field or Fieldset it warns once (`hint-outside-field`) and renders a plain paragraph with no id. Types: `FieldHintProps` and `FieldHintState`.
- The development warnings for a masked `Input`, a `OneTimeCode.Input` and a `FileUpload` with limits now suggest a `Field.Hint`. A `Field.Hint` clears them, as a `Field.Prose` did.

New in `@kvirn-ui/theme`:

- `.kv-field-hint`: `body-small` (14px, line height 1.5) in the `text` colour, in every density and position. An option's hint (a `Field.Hint` in a checkbox or radio's Field) sits in the second column directly under the label.

Changed, and what to do:

- **A `Prose` under a control is now 16px.** The theme used to size a `Prose` that came after the control at 14px with a position-based sibling rule, and that rule is removed: the size now belongs to the part. A `Prose` is `body` (16px) wherever it sits, and a `Hint` is `body-small` (14px) wherever it sits. To keep a short instruction under a control at 14px, change the `Prose` to `Field.Hint` (or `Fieldset.Hint`), and write plain text in it: no link, list or heading. A hint inside a checkbox or radio option, which was 16px, is now 14px as a `Field.Hint`.
- A hint on your own element with `useField` or `useFieldset`: spread `getDescriptionProps(name)` and set `className="kv-field-hint"` after it.
