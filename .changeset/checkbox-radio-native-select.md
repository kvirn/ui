---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Form fields, phase 2 (Plan 0013). Native controls, wired to Field and Fieldset, with no form state of their own.

- `react`: `Checkbox` (with `indeterminate`), `CheckboxGroup.Root`, `RadioGroup.Root` and `RadioGroup.Radio`, and the hooks `useCheckbox`, `useCheckboxGroup`, `useRadioGroup` and `useRadio`. A group renders the `<fieldset>` and acts as a `Fieldset.Root`. Radios in a group are one Tab stop, and the browser's arrow keys move and check them. A radio never gets `aria-invalid`: the group's error describes it.
- `theme`: styles for `kv-checkbox` and `kv-radio`: 24px marks drawn so they survive forced colours, and checked, indeterminate, invalid and disabled looks.
