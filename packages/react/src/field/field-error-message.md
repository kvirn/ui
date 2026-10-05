# Field.ErrorMessage

> **Draft** (Plan 0017). The accessibility contract is [field.a11y.md](field.a11y.md), shared with Field. The Field it sits in is described in [field.md](field.md).

The error under a control: what is wrong and how to fix it, in text. It renders only while its [Field](field.md) or [Fieldset](../fieldset/fieldset.md) is `invalid`, so a stale error is never referenced. KvirnUI validates nothing: you set `invalid` and write the message. A group has its own: `Fieldset.ErrorMessage`, `RadioGroup.ErrorMessage` and `CheckboxGroup.ErrorMessage`.

- It starts with an error icon and the `field.errorPrefix` text ("Fel:" in Swedish). The theme hides the prefix visually, so screen-reader users hear "Fel: Ange ditt namn" and the error never relies on colour (1.4.1).
- It is part of the control's accessible description, after the descriptions and help texts. It is **not a live region**: it is heard when the user reaches the control. On submit, move focus to the first invalid control.
- One per Field or Fieldset. Two share an id, so a dev warning fires: put all the text in one.
- Set `invalid` and render the message together. An `invalid` field with no message warns in development, because users are not told what is wrong (3.3.1, 3.3.3).

## API

| Prop     | Type                             | Meaning                                                                          |
| -------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `render` | `(props, state) => ReactElement` | Another element. `state` is the host's (`isInvalid`, `isRequired`, `isDisabled`) |

- **Renders** `<p class="kv-field-error-message" data-invalid>` with an `id` (`<controlId>-error`), the `error` icon, `<span class="kv-field-error-prefix">` and your text.
- **Message:** the prefix is `field.errorPrefix`, overridden per provider or per host with `messages`.
- **Outside a Field or Fieldset** it warns once in development (`field-error-message-outside-field`), always shows, and describes nothing.

## Notes

- Say what's wrong and how to fix it, in the field's own words, without blaming the user: "Ange ditt fullständiga namn", not "Ogiltigt värde". Repeat the format when the format is the problem: a help text is never the only place it lives.
- The message goes last, after the help text, so nothing moves when it appears.
- Validate on submit, not on every key, so the text doesn't shift under a magnifier.
