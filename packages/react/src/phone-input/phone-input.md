# PhoneInput

> **Draft.** The accessibility contract is [phone-input.a11y.md](phone-input.a11y.md), and the design spec is [docs/design/phone-and-address-inputs.md](../../../../docs/design/phone-and-address-inputs.md).

A phone number in a form. A native `<input type="tel">` with the attributes a phone number needs, set once: the phone keypad, no spell-check, left to right, `autocomplete="tel"`, 20 characters wide. **It never formats**: the number is kept as the user typed, pasted or autofilled it (`070-174 06 05`, `+46 (0)70 174 06 05`), on input and on blur. Normalise it to E.164 on the server.

- Renders a native `<input type="tel">`, classes `kv-input kv-input--numeric kv-phone-input`. Your `className` joins them.
- Inside a [Field](../field/field.md) it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- **No mask by default**, so no correctly typed number is ever refused. `mask="telephone"` leaves out everything but digits, `+`, space, `-`, `(` and `)`, and says so politely. A custom `mask` replaces it.
- No length limit, no `pattern`. Without a `PhoneInput.Country` one box takes `+358 …`: say so in the help text. With one, the country is a native select that is never turned into a prefix: the number is what the user typed.
- **KvirnUI holds no form state; bring your own form logic.** Pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

`PhoneInput` is a namespace: `PhoneInput.Root`, `PhoneInput.Country` and `PhoneInput.Number` (flat exports `PhoneInputRoot`, `PhoneInputCountry`, `PhoneInputNumber`).

| Part               | Renders                                | Props                                                                                                                                                     |
| ------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PhoneInput.Root    | `<div class="kv-phone-input-group">`   | `country`, `defaultCountry`, `onCountryChange`, and every native div prop                                                                                 |
| PhoneInput.Country | `<select>` of calling codes (optional) | every native select prop except `value`, `defaultValue` and `children`                                                                                    |
| PhoneInput.Number  | `<input type="tel">` (one element)     | `mask`, `value`, `defaultValue`, `onValueChange`, `announceRejections`, `messages`, and every native input prop except `type`, `value` and `defaultValue` |

**Country.** `country` (controlled, ISO 3166-1 alpha-2) wins, then `defaultCountry` and the user's choice, then the provider's `country`, then the country the locale implies: the same resolution the masks use. Without any, the select shows an empty option. `onCountryChange(country, { reason: 'input', event, callingCode })`. Changing the country never rewrites the typed number, and nothing prefixes it with the calling code: typing `+358` while Sweden is selected changes nothing.

**Options.** `Sverige (+46)`: the country's name in the page's language (`Intl.DisplayNames`, the ISO code when unsupported) and its calling code, the resolved country first and the rest alphabetical. No flags. `callingCodeFor(country)` and `callingCodeCountries` are in `@kvirn-ui/core`.

**Name.** `PhoneInput.Country` has no text: put it in its own `Field.Root` with a `Field.Label` ("Land"), or give it `aria-label`. If it is in the same Field as the number (a `PhoneInput.Root` inside one Field), it takes only `aria-label` and the disabled state from it, never its id or error. A Fieldset legend around both names the pair.

`onValueChange(value, details)`: `value` is the text as shown. `details` is TextInput's: `reason` (always `'input'`) and `event`, with a `mask` also `unmaskedValue`, `isComplete` and `rejected`, and always `country` and `callingCode` (digits, `46`) of the Root's country.

### What it sets on the `<input>`

| Attribute                                                 | Value                                                                                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`                                                    | `tel`                                                                                                                                                                                                  |
| `inputmode`, `spellcheck`, `dir`                          | `tel`, `false`, `ltr`. Yours wins                                                                                                                                                                      |
| `autocomplete`                                            | `tel`: the full number, which is what autofill stores. Next to a `PhoneInput.Country`: `tel-national` (the select is `tel-country-code`). Yours wins: `mobile tel`, or `off` for someone else's number |
| `id`, `aria-describedby`, `aria-invalid`, `aria-required` | From the nearest Field. Your own `aria-describedby` ids come after the Field's, and your `id` is ignored in a Field (use `controlId` on `Field.Root`)                                                  |
| `disabled`                                                | Natively, from `disabled` or a disabled Field                                                                                                                                                          |

### Classes

| Class                                         | Sets                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| `kv-input`                                    | The text box's look, shared with TextInput                                  |
| `kv-input--numeric`                           | Tabular figures, so digits line up                                          |
| `kv-phone-input`                              | 20 characters wide, never wider than its container                          |
| `kv-phone-input-group`                        | The Root's layout: select and number side by side from 30rem, stacked below |
| `kv-listbox-native kv-phone-input-country`    | The select: the look of a native listbox, sized to its content              |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | A width of yours: it wins over `kv-phone-input`. A help text, never a limit |

### Strings

PhoneInput has no strings of its own and no i18n keys. A mask uses the mask's messages, in all five locales; override them per provider, or per instance with `messages`. `announceRejections={false}` turns the announcements off. Labels, help text and errors are yours, in your translations.

### Your own element

To build your own, use `usePhoneInput()` and spread `inputProps` with `mergeProps`: they hold the Field's wiring, the attributes above and the classes. `usePhoneInputRoot()` holds the country (`country`, `callingCode`, `selectCountry`, `rootProps`).

### Development warnings

Keyed `phone-input-*`, English, for the developer only: no accessible name (`phone-input-without-name`, `phone-input-in-field-without-label`), an `id` inside a Field (`phone-input-id-in-field`), a `PhoneInput.Country` with no name (`phone-input-country-without-name`), one outside a Root (`phone-input-country-outside-root`), and your own `mask` in a Field with no help text (`phone-input-mask-without-description`). The default, and `mask="telephone"`, need no format help text.

## Example

```tsx
<Field.Root controlId="phone" required invalid={errors.phone !== undefined}>
  <Field.Label>Telefonnummer</Field.Label>
  <PhoneInput.Number name="phone" value={phone} onValueChange={setPhone} />
  <Field.HelpText>
    Om numret inte är svenskt, börja med landsnumret, till exempel +358.
  </Field.HelpText>
  <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
</Field.Root>
```

With a calling-code select:

```tsx
<Fieldset.Root>
  <Fieldset.Legend>Telefonnummer</Fieldset.Legend>
  <PhoneInput.Root>
    <Field.Root>
      <Field.Label>Land</Field.Label>
      <PhoneInput.Country name="phoneCountry" />
    </Field.Root>
    <Field.Root required>
      <Field.Label>Nummer</Field.Label>
      <PhoneInput.Number name="phone" />
    </Field.Root>
  </PhoneInput.Root>
</Fieldset.Root>
```
