# AddressInput

> **Draft** (design spec [docs/design/phone-and-address-inputs.md](../../../../docs/design/phone-and-address-inputs.md) §6.2). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [address-input.a11y.md](address-input.a11y.md).

**KvirnUI holds no form state; bring your own form logic.** AddressInput renders what it's given. It keeps no value, looks nothing up and validates nothing.

An AddressInput asks for a postal address in separate boxes: street, line 2, postal code and city, in the Nordic order. Use it for an address the user types or autofill fills in one action. For showing an address the service already knows, use [Address](../address/address.md) (the static `<address>`) in a summary with a change link. For a foreign address of unknown format, use a `Textarea`.

- Five parts: `AddressInput.Root` (a `<div>`, the layout) and `AddressInput.Line1`, `.Line2`, `.PostalCode` and `.City`. Each is a native text `TextInput`, so it goes inside your own `Field.Root` with a `Field.Label`, and has its own help text and error. Each is also exported on its own (`AddressInputRoot`, `AddressInputLine1`, `AddressInputLine2`, `AddressInputPostalCode`, `AddressInputCity`), and the hook is `useAddressInput`.
- It goes inside a **plain** `Fieldset.Root` (not `group`) whose `Fieldset.Legend` names the address. An address is four answers: each Field marks itself, and Line 2 shows "(optional)". The Root warns inside a `group` Fieldset, and outside any group.
- **It holds no text.** Every label, help text and error is yours, and there are no message keys.
- **Autofill fills every box in one action.** The tokens are `address-line1`, `address-line2`, `postal-code` and `address-level2`. The Root's `autoComplete` is `off` for someone else's address, or a prefix such as `section-postal` or `shipping` for a second address on the page. A part's own `autoComplete` wins.
- **The country sets the postal code.** `country` (ISO alpha-2, default the provider's `country`, then the locale's) gives SE `123 45`, FI `00100` and NO `1234` through the `postal-code` mask, a numeric keypad and a box of 6, 6 or 4 characters. Any other country has no mask, letters and digits in upper case, and a 10-character box. Changing `country` never rewrites what was typed.
- **No auto-advance and no lookup.** A full postal code never moves focus (3.2.2), and the city is never derived from the postal code (no third-party calls, no bundled postal data).
- Headless: no CSS. The parts render `kv-address-input`, `kv-address-input-line1`, `-line2`, `-postal-code` and `-city`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part                      | Renders                                                                   | Props                                                                                       |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `AddressInput.Root`       | `<div class="kv-address-input">`                                          | `country`, `autoComplete`, `ref` and every div prop                                         |
| `AddressInput.Line1`      | `<input class="kv-input kv-address-input-line1">`                         | `ref` and every `TextInput` prop except `type`, `mask`, `announceRejections` and `messages` |
| `AddressInput.Line2`      | the same, `kv-address-input-line2`                                        | the same                                                                                    |
| `AddressInput.PostalCode` | `<input class="kv-input kv-address-input-postal-code kv-input--width-*">` | `mask` (`false` or your own, which wins), `ref` and every `TextInput` prop except `type`    |
| `AddressInput.City`       | the same, `kv-address-input-city`                                         | the same as Line1                                                                           |

What the parts do on their own:

- Line1, Line2 and City have `spellCheck={false}` and `autoCorrect="off"`.
- PostalCode has `dir="ltr"`. With a country mask: `inputMode="numeric"`, `kv-input--numeric` and `kv-input--width-6` (SE, FI) or `-4` (NO). Without one: `inputMode="text"`, `autoCapitalize="characters"` and `kv-input--width-10`.
- A part outside a Root still gets its token and attributes, with the provider's or locale's country, and warns.

| Classes for the default theme                               | On               | Sets                                                                                                                    |
| ----------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `kv-address-input`                                          | Root             | The fields stacked, 24px apart (16px with `kv-compact` from 64rem); the postal code and the city share a row from 22rem |
| `kv-address-input-line1`, `-line2`, `-postal-code`, `-city` | the part's input | The part the layout finds its Field by                                                                                  |

## Component

```tsx
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'

;<Fieldset.Root invalid={errors.address !== undefined}>
  <Fieldset.Legend>Din adress</Fieldset.Legend>
  <AddressInput.Root country="SE">
    <Field.Root controlId="address-line1" required invalid={errors.line1 !== undefined}>
      <Field.Label>Gatuadress</Field.Label>
      <AddressInput.Line1 name="line1" />
      <Field.ErrorMessage>{errors.line1}</Field.ErrorMessage>
    </Field.Root>
    <Field.Root controlId="address-line2">
      <Field.Label>Adressrad 2</Field.Label>
      <AddressInput.Line2 name="line2" />
      <Field.HelpText>Till exempel c/o och ett namn</Field.HelpText>
    </Field.Root>
    <Field.Root controlId="address-postal-code" required>
      <Field.Label>Postnummer</Field.Label>
      <AddressInput.PostalCode name="postalCode" />
      <Field.HelpText>Till exempel 123 45</Field.HelpText>
    </Field.Root>
    <Field.Root controlId="address-city" required>
      <Field.Label>Postort</Field.Label>
      <AddressInput.City name="city" />
    </Field.Root>
  </AddressInput.Root>
  <Fieldset.ErrorMessage>{errors.address}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

Your part:

- **Write the labels, the postal code's example in the country's form, and the errors.** A postal code error repeats the format ("Ange ett postnummer med 5 siffror, till exempel 123 45").
- **Errors per part** in its Field (`invalid` and `Field.ErrorMessage`); `Fieldset.ErrorMessage` only for a whole-address error ("We couldn't find this address"), linked from an `ErrorSummary` to Line1.
- **Keep the order**: street, line 2, postal code, city. c/o goes on line 2, where autofill stores it.
- **A country control** is your own Field with `autoComplete="country"` in the Root; pass its value as `country`.
- **Two addresses** on a page: `autoComplete="section-postal"` (or another `section-*`) on each Root, and `off` for someone else's.
- **Eastern Arabic digits** are refused by the `postal-code` mask. Where those keyboards are expected, set `mask={false}` on `AddressInput.PostalCode`.

## Hook

```tsx
import { Field, Fieldset, TextInput, useAddressInput } from '@kvirn-ui/react'

function Address() {
  const address = useAddressInput({ country: 'SE' })
  return (
    <Fieldset.Root>
      <Fieldset.Legend>Din adress</Fieldset.Legend>
      <div {...address.rootProps}>
        <Field.Root>
          <Field.Label>Postnummer</Field.Label>
          <TextInput {...address.getInputProps('postalCode')} mask={address.postalCodeMask} />
        </Field.Root>
      </div>
    </Fieldset.Root>
  )
}
```

`useAddressInput({ country, autoComplete })` returns `country` (upper case), `postalCodeMask` (`undefined` for a country without a mask), `rootProps` and `getInputProps(part)` with `'line1' | 'line2' | 'postalCode' | 'city'`.
