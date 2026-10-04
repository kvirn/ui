---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

**Breaking (minor while 0.x):** `Hint` becomes `HelpText` (Plan 0041). The part under a control that gives a format, an example or a limit now has a name that says what it is. Nothing else changes: it is still a plain paragraph under the control, 14px in the default theme, with its own id in the control's `aria-describedby`, in DOM order, then the error. There is no deprecated alias, so update every use.

Rename map:

- `Field.Hint` to `Field.HelpText`, `Fieldset.Hint` to `Fieldset.HelpText`, `CheckboxGroup.Hint` to `CheckboxGroup.HelpText` and `RadioGroup.Hint` to `RadioGroup.HelpText`.
- Named exports: `FieldHint` to `FieldHelpText`, `FieldsetHint` to `FieldsetHelpText`, `CheckboxGroupHint` to `CheckboxGroupHelpText` and `RadioGroupHint` to `RadioGroupHelpText`.
- Types: `FieldHintProps` to `FieldHelpTextProps` and `FieldHintState` to `FieldHelpTextState`.
- Class (theme): `kv-field-hint` to `kv-field-help-text`. If you style the old class, or put it on your own element after spreading `getDescriptionProps(name)` from `useField` or `useFieldset`, use the new one.
- Development warnings (English, for the developer): `hint-outside-field` to `help-text-outside-field`, `hint-before-control:<text>` to `help-text-before-control:<text>`, and `number-input-decimals-without-hint` to `number-input-decimals-without-help-text`.

Unchanged: `FileUpload.DropHint` and `kv-file-upload-drop-hint`, the Listbox option hint (`optionHint`, `--kv-listbox-option-hint`), `RichTextEditor.KeyboardHint`, and every message key (`dateInput.autoAdvanceHint`, `richText.linkUrlHint`, and so on).

To migrate, search your code for `.Hint`, `FieldHint`, `FieldsetHint`, `CheckboxGroupHint`, `RadioGroupHint` and `kv-field-hint`, and replace them with the names above.
