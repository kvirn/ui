---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

`Prose` is the description of a Field or Fieldset (Plan 0025, ADR-0054). A hint is text set for reading, which `Prose` already is, so `Field.Description` and `Fieldset.Description` go away and a `<Prose>` directly inside a `Field.Root` or `Fieldset.Root` registers as the description of its control or group.

**Breaking** (accepted before 1.0, ADR-0054):

- `@kvirn-ui/react`: `Field.Description`, `Fieldset.Description`, `FieldDescription`, `FieldsetDescription`, `FieldDescriptionProps` and the `field-description-outside-field` warning are removed, with no deprecation. Migrate each hint: `<Field.Description>x</Field.Description>` becomes `<Prose><p>x</p></Prose>`, and `<Fieldset.Description>x</Fieldset.Description>` the same. A hint can now have several paragraphs. Keep it to plain text and short paragraphs: an accessible description has no structure, so a heading, list or link inside it is read as text.
- `@kvirn-ui/react`: `useField` and `useFieldset` keep `descriptions`, `descriptionProps` and `getDescriptionProps(name)`, but the class they return is now `kv-prose` (it was `kv-field-description`).
- `@kvirn-ui/theme`: the class `kv-field-description` is removed. A `kv-prose` that is a direct child of `kv-field` or `kv-fieldset` is the hint: prose inside, body size above the control and `body-small` (14px) under it, in the text colour in every density (never muted), no margin, and the `--kv-prose-measure` width. Change those in your own CSS on `.kv-field > .kv-prose`.

Added:

- `@kvirn-ui/react`: `Field.Prose` and `Fieldset.Prose`, aliases of `Prose` (the same component), so the hint reads as part of the Field: `<Field.Prose><p>x</p></Field.Prose>`.
- `@kvirn-ui/react`: a `Prose` inside a Field or Fieldset takes its `id` from the host, is listed in the control's (or group's) `aria-describedby` in DOM order, then the error, and gets `data-invalid` and `data-disabled`. Outside a Field or Fieldset `Prose` is unchanged, with no warning. A Prose that isn't a hint goes outside the Field, or inside a `kv-not-prose` element.
- `@kvirn-ui/theme`: a field and a fieldset are prose boundaries like a card, so the nearest of the two wins: a `kv-prose` inside a field is prose again, and the label, error and control are still not.
