# Field.Label

The visible label of one control: a native `<label for>` that names the control, and the click target that focuses it. Use it first inside a [Field](field.md). A group of controls takes a `Legend` instead ([Fieldset](../fieldset/fieldset.md), [RadioGroup](../radio-group/radio-group.md), [CheckboxGroup](../checkbox-group/checkbox-group.md)). A placeholder is never a label.

- The Field links the label to the control, so you write no `for` and no `id`.
- A field that isn't `required` ends its label with the `field.optional` text, "(optional)" in English. It is a span (`kv-field-optional`) inside the label, so it is part of the control's accessible name (3.3.2). A required field carries no marker.
- Inside a group fieldset (`group`), the marker is `none`: an option or a date box is never optional. The question is the legend.
- A label that is the page's heading goes in the heading: `<h1><Field.Label className="kv-field-label--heading">…</Field.Label></h1>`, not the heading in the label.

## API

| Prop     | Type                   | Meaning                                                                                                                                |
| -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `marker` | `'optional' \| 'none'` | `'none'` leaves out the optional text, for a lone search field or a single consent checkbox. Default `'optional'`, `'none'` in a group |

- **Renders** `<label for class="kv-field-label">` with an `id` (`<controlId>-label`), and the state attributes `data-invalid`, `data-required` and `data-disabled` of the Field.
- **Message:** the optional text is `field.optional`, overridden per provider or per Field with `messages` (see [Field](field.md)).
- **Outside a `Field.Root`** it warns once in development (`field-label-outside-field`) and renders a plain `<label class="kv-field-label">` that names nothing.
- **The class for the default theme:** `kv-field-label--heading` (the label is the page's `h1`).

## Notes

- Write the label as the question or the name of the answer: "Phone number", not "Fill in your phone number".
- A label whose text is in another language goes in a nested `KvirnProvider` with `useLocale().localeProps` on your own element (3.1.2).
- Examples and format hints go in a `Field.HelpText` ([Field.HelpText](field-help-text.md)), not in the label.
