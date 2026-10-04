---
'@kvirn-ui/react': minor
---

BREAKING: `Input` is now `TextInput`. This is a hard rename with no deprecated alias, because the library is in alpha. Replace the names in your imports and JSX:

| Before                                                        | After                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `Input`                                                       | `TextInput` (its `displayName` is `TextInput`)                                |
| `useInput`                                                    | `useTextInput`                                                                |
| `InputProps`, `InputState`, `InputType`, `InputChangeDetails` | `TextInputProps`, `TextInputState`, `TextInputType`, `TextInputChangeDetails` |
| `InputPartProps`, `UseInputOptions`, `UseInputResult`         | `TextInputPartProps`, `UseTextInputOptions`, `UseTextInputResult`             |

What stays the same: the `kv-input` class and its modifiers (`kv-input--width-*`, `kv-input--numeric`), and the part names `InputGroup.Input`, `Combobox.Input` and `Autocomplete.Input` with their flat exports (`InputGroupInput`, `ComboboxInput`, `AutocompleteInput`). `InputGroup.Input` renders a `TextInput`.

The development warnings now say "A TextInput …" and are keyed `text-input-*`. The `type="number"` warning points to NumberInput: "Use NumberInput for a quantity or an amount, or a TextInput with a mask for a code."
