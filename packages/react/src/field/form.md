# Form

> **Draft** (Plan 0017). The accessibility contracts are the ones of the parts: [field.a11y.md](field.a11y.md), [fieldset.a11y.md](../fieldset/fieldset.a11y.md) and each control's own. The decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** A form is a native `<form>` made of questions, and each question is a [Field](field.md) (one control) or a [Fieldset](../fieldset/fieldset.md) (several controls, or several questions). Nothing validates for you: your form library or your own code sets `invalid`, `required` and `disabled`, and writes the error messages.

This page is the overview. It shows one short form with every control, "Apply for a resident parking permit", and says which component answers which question. A real resident service asks one thing per page.

## API

| You need                             | Use                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One question with one control        | [Field](field.md): `Field.Root`, `Field.Label`, `Field.Prose`, `Field.HelpText` and `Field.ErrorMessage`                                                      |
| Text, a number, a postcode           | [TextInput](../text-input/text-input.md) (with a mask for a postcode), [NumberInput](../number-input/number-input.md) and [Textarea](../textarea/textarea.md) |
| A unit or an icon inside the box     | [InputGroup](../input-group/input-group.md)                                                                                                                   |
| A date in three boxes                | [DateInput](../date-input/date-input.md)                                                                                                                      |
| A code sent to the person            | [OneTimeCode](../one-time-code/one-time-code.md)                                                                                                              |
| One yes-or-no answer                 | [Checkbox](../checkbox/checkbox.md) in a Field                                                                                                                |
| Several answers that can all be true | [CheckboxGroup](../checkbox-group/checkbox-group.md)                                                                                                          |
| Exactly one answer out of a few      | [RadioGroup](../radio-group/radio-group.md)                                                                                                                   |
| One answer out of a long list        | [Listbox](../listbox/listbox.md), [Combobox](../combobox/combobox.md) or [Autocomplete](../autocomplete/autocomplete.md)                                      |
| Files to attach                      | [FileUpload](../file-upload/file-upload.md)                                                                                                                   |
| Several questions under one name     | [Fieldset](../fieldset/fieldset.md)                                                                                                                           |

## Notes

- **One column, `novalidate`.** Put `noValidate` on the `<form>` so the browser's validation bubbles, in the browser's language, never replace your messages. Required fields use `aria-required`, never native `required`.
- **The default order of every question** is the label (or legend), the description, the control, the help text, then the error. The reading order, the DOM order and the visual order are then the same.
- **Validate on submit, not on every key,** and keep what the user typed. On submit, move focus to the first invalid control, and keep `scroll-padding` on the page so the message under it isn't hidden by a sticky header or the on-screen keyboard (see [Field](field.md)).
- **An invalid group does not mark its controls.** Set `invalid` on the group for its message, and on each Field that is wrong for its control.
- **Don't wrap every Field in a fieldset.** A fieldset announces itself, and nested ones get noisy.
- **Redundant entry (3.3.7):** don't ask again for what the user has already given in the same process, and set `autoComplete` on personal data (3.3.8).
- **Every string** the library adds ("(valfritt)", "Fel:") follows the provider's locale in all six languages. The labels, descriptions and errors are yours.
