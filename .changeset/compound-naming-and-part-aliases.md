---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

A component with parts is now written `X.Root` + `X.Part`, and a part of another component is offered under the parent's name. Nothing is removed: the old names still work and are marked `@deprecated` until 1.0.

New in `@kvirn-ui/react`:

- `Link.Root`. `Link.Root` and `Link.NewTabNotice` are the namespace form, and the callable `<Link>` still works.
- `Field.Root`, `Field.Label`, `Field.Prose` and `Field.ErrorMessage`, and `Fieldset.Root`, `Fieldset.Legend`, `Fieldset.Prose` and `Fieldset.ErrorMessage`. `Fieldset.ErrorMessage` is now its own component with the name `Fieldset.ErrorMessage` (it renders `Field.ErrorMessage`). The callable `<Field>` and `<Fieldset>` still work.
- `CheckboxGroup.Legend`, `CheckboxGroup.Prose` and `CheckboxGroup.ErrorMessage`, and `RadioGroup.Radio`, `RadioGroup.Legend`, `RadioGroup.Prose` and `RadioGroup.ErrorMessage`.
- `InputGroup.Input`.
- `Combobox` and `Autocomplete` parts that were the Listbox's or Combobox's own component (`Combobox.Popup`, `.List`, `.Option`, `.Group`, `.GroupLabel`, `.Empty`, and Autocomplete's `Control`, `Input`, `Toggle` and `Clear`) are now their own components. They render the same elements, and a generic `TItem` is still inferred.
- Every exported component has a `displayName`, and it is the name you write (`Card.Header`, `Combobox.Option`, `Button`). Tools such as Storybook's "Show code" print it.
- Every part has a flat named export from the package entry, for React Server Components, which can't dot into a client module (`FieldRoot`, `FieldLabel`, `FieldProse`, `FieldsetProse`, `CheckboxGroupLegend`, `RadioGroupRadio`, `InputGroupInput`, `LinkRoot`, `ComboboxOption`, and so on). In a server component, import these instead of the namespace.

Deprecated, with the replacement (removed in 1.0):

- The flat `Label`: use `Field.Label`.
- The flat `ErrorMessage`: use `Field.ErrorMessage`, or `Fieldset.ErrorMessage`, `CheckboxGroup.ErrorMessage` or `RadioGroup.ErrorMessage` in a group.
- The flat `Legend`: use `Fieldset.Legend`, `CheckboxGroup.Legend` or `RadioGroup.Legend`.
- The flat `Radio`: use `RadioGroup.Radio`, or `RadioGroupRadio` in a Server Component.
- `Prose.Root`: use `Prose`. `Section.Root`: use `Section`. A Prose and a Section are one element.
- `<Field>`, `<Fieldset>` and `<Link>` as the root: use `Field.Root`, `Fieldset.Root` and `Link.Root`. They are still the same function, so nothing breaks.

`@kvirn-ui/core`: the type `FileUploadItem` is renamed `FileUploadEntry`, because the React component `FileUploadItem` has the same name. `FileUploadItem` stays as a deprecated alias of the same type.
