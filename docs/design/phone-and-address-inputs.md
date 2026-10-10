# Design spec: PhoneInput and AddressInput

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-10
- **Plan:** to be written (one plan, two components; this spec is its Design section)
- **Type:** component behaviour and default styling (two form controls in `@kvirn-ui/react`)

## 1. Brief

- **Users:** residents (hardest case: a 70-year-old on a phone at 400% zoom, in Swedish as a second language, with a tremor; and a screen reader user typing fast). Staff enter the same data for a resident at a counter.
- **Job:** "When a service needs to reach me or send me a letter, I want to give my phone number and address the way I always write them, so I can finish and get my decision."
- **Context:** once a year, on a phone, often under stress (deadline, money, a child). Autofill is the fastest path and must work.
- **Constraints:** AGENTS.md rule 7, so **no address lookup, autocomplete service or postal-code database**. No new dependency (no phone-number library). The components hold no text of their own: every label, help text and error is the consumer's. WCAG 1.3.5, 3.3.2, 3.3.7 and 3.3.8.
- **Success:** autofill fills every field in one action; no correctly typed number or address is refused; error rate on postal code and phone; time on task. Measured in the usability test (`pending`).
- **Evidence:** survey of 25 Swedish municipal sites (`kommunwebb-survey`, `tiers.csv`, field types): `tel` 7/25, phone asked in a plain `text` box 4/25, address 6/25, postal code 4/25. That's usage, not user performance, and it covers Sweden only.
- **Assumptions → research questions:**
  - Residents type their phone number in their own format and are confused when it's rewritten → RQ: do participants notice and trust a reformatted number? (GOV.UK Notify found confusion: §2.)
  - Arabic- and Persian-keyboard users type Eastern Arabic digits in a phone or postal-code box → RQ: how often, on which keyboards?
  - Postal code and city side by side read as one envelope line ("123 45 KVIRNBY") → RQ: do magnifier users find the city box beside the postal code?

## 2. Prior art

| Source                                | What we reuse                                                                                                                                                   | What we change and why                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI NumberInput                   | A flat control with a built-in mask, `mask={false}` as the opt-out, no format warning for the default mask, a thin hook                                         | Phone keeps the user's separators; NumberInput normalises                                                                   |
| KvirnUI DateInput                     | A Root inside a consumer `Fieldset`, parts that read the Root's context                                                                                         | No `group`, no labels from i18n, no auto-advance, one error per part                                                        |
| KvirnUI Field, Fieldset, ErrorSummary | All wiring: label, help text, `invalid`, `required`, "(optional)", error, `controlId` links                                                                     | Nothing: both components sit inside them                                                                                    |
| GOV.UK telephone numbers pattern      | `type="tel"`, `autocomplete="tel"`, 20-character width, accept spaces, dashes, brackets and country codes, no reformatting, "include the country code" hint     | GOV.UK says to avoid input masking: our `telephone` mask only leaves out letters, never formats, never limits length (§6.1) |
| GOV.UK addresses pattern              | Separate boxes, `address-line1/2`, `address-level2`, `postal-code`, line 2 optional, short postcode box, per-field errors, textarea for unknown foreign formats | Nordic order (postal code before city); no lookup (rule 7); postal code beside city when there's room                       |
| WHATWG HTML autofill                  | Tokens, `section-*`, `shipping`/`billing` prefixes; `street-address` is multi-line only                                                                         | We use `address-line1/2` on single-line boxes                                                                               |
| APG                                   | No pattern: native `textbox`es in a native `fieldset`                                                                                                           | None                                                                                                                        |

## 3. Flow

**Phone.** 1 Read the label (and "include the country code" help) → 2 focus: phone keypad (`inputmode="tel"`) → 3 autofill, type or paste in any format → 4 submit → 5 the form validates; on error, focus goes to the ErrorSummary, its link to the box, the value unchanged.

**Address.** 1 Legend "Your address" → 2 autofill fills all four boxes at once, or type: street → line 2 (optional) → postal code (digit keypad, `123 45`) → city → 3 submit → 4 per-box errors; a whole-address error from the service's own back end.

| Unhappy path                                     | What happens                                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A letter or `.` typed in a phone number          | Left out, announced politely (`mask.characterNotAllowed`). With M1 a `.` is kept                                                         |
| Pasted "Tel: +46 (0)70-174 06 05"                | "Tel:" left out, the rest kept as pasted. Never cut                                                                                      |
| Eastern Arabic or full-width digits              | Today refused: **a number is rejected.** M1 maps them to 0–9; without M1 PhoneInput defaults to `mask={false}`                           |
| Foreign phone number                             | Accepted: `+` and any length. The help text asks for the country code                                                                    |
| Someone else's phone or address (other guardian) | Consumer sets `autoComplete="off"`, so the user's own data isn't filled in                                                               |
| Two addresses on one page                        | Root `autoComplete="section-postal"`, so autofill keeps them apart                                                                       |
| Address abroad                                   | Root `country="DE"`: no postal mask, letters allowed, 10-character box. Unknown formats: the consumer uses a `Textarea` instead (GOV.UK) |
| Pasted "SE-123 45" or "12345"                    | Becomes `123 45` (existing pattern mask)                                                                                                 |
| Country changed after typing                     | The postal-code value stays as typed; the mask applies to the next edit                                                                  |
| Address the service already knows                | Not read-only boxes: show it as a SummaryList with a change link (3.3.7)                                                                 |
| Address not found by the service                 | `Fieldset.ErrorMessage`, ErrorSummary link to Line1                                                                                      |

## 4. Content

The components own **no strings and no i18n keys**. The only feedback strings are the mask's existing ones (`mask.characterNotAllowed`, `mask.maximumLength`). The keys below are **story and docs fixtures**, written by the consumer in real use. Example phone numbers come from Sweden's PTS fiction range (070-174 06 05 to 99).

| Fixture key               | en                                                                           | sv                                                                                    | fi (length check)                                                      | Notes                                       |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `phone.label`             | Phone number                                                                 | Telefonnummer                                                                         | Puhelinnumero                                                          | Field.Label                                 |
| `phone.help`              | If your number isn't Swedish, start with the country code, for example +358. | Om numret inte är svenskt, börja med landsnumret, till exempel +358.                  | Jos numero ei ole suomalainen, aloita maatunnuksella, esimerkiksi +46. | Field.HelpText                              |
| `phone.errorEmpty`        | Enter your phone number                                                      | Ange ditt telefonnummer                                                               | Anna puhelinnumerosi                                                   |                                             |
| `phone.errorFormat`       | Enter a phone number using digits, like 070-174 06 05 or +46 70 174 06 05    | Ange ett telefonnummer med siffror, till exempel 070-174 06 05 eller +46 70 174 06 05 | Anna puhelinnumero numeroina, esimerkiksi … (FI example: Q5)           | Never "invalid"                             |
| `address.legend`          | Your address                                                                 | Din adress                                                                            | Osoitteesi                                                             | Fieldset.Legend                             |
| `address.line1`           | Street address                                                               | Gatuadress                                                                            | Katuosoite                                                             |                                             |
| `address.line2`           | Address line 2                                                               | Adressrad 2                                                                           | Osoiterivi 2                                                           | Gets "(optional)" from Field                |
| `address.line2Help`       | For example c/o and a name                                                   | Till exempel c/o och ett namn                                                         | Esimerkiksi c/o ja nimi                                                |                                             |
| `address.postalCode`      | Postal code                                                                  | Postnummer                                                                            | Postinumero                                                            |                                             |
| `address.postalCodeHelp`  | For example 123 45                                                           | Till exempel 123 45                                                                   | Esimerkiksi 00100                                                      | Follows `country`                           |
| `address.city`            | Town or city                                                                 | Postort                                                                               | Postitoimipaikka                                                       | Longest label, 16 chars                     |
| `address.errorLine1`      | Enter your street address                                                    | Ange din gatuadress                                                                   | Anna katuosoitteesi                                                    |                                             |
| `address.errorPostalCode` | Enter a postal code with 5 digits, like 123 45                               | Ange ett postnummer med 5 siffror, till exempel 123 45                                | Anna postinumero, jossa on 5 numeroa, esimerkiksi 00100                | Repeats the format                          |
| `address.errorCity`       | Enter your town or city                                                      | Ange postort                                                                          | Anna postitoimipaikka                                                  |                                             |
| `address.errorNotFound`   | We couldn't find this address. Check the street address and postal code.     | Vi hittar inte adressen. Kontrollera gatuadressen och postnumret.                     | Emme löydä osoitetta. Tarkista katuosoite ja postinumero.              | Fieldset error, from the service's back end |

## 5. Structure

```
320px (288px column)                     40rem and wider
fieldset                                 fieldset
  legend  Your address                     legend  Your address
  Street address                           Street address
  [__________________________]             [________________________________________]
  Address line 2 (optional)                Address line 2 (optional)
  [__________________________]             [________________________________________]
  For example c/o and a name               For example c/o and a name
  Postal code                              Postal code          Town or city
  [123 45]                                 [123 45]             [_____________________]
  For example 123 45                       For example 123 45
  Town or city
  [__________________________]
  (Fieldset error, last)                   (Fieldset error, last)
```

- Reading order = Tab order = DOM order: legend, line 1, line 2, postal code, city. RTL mirrors the row (postal code at the start, on the right).
- PostalCode and City share a row only when both fit: no media query, the row wraps (City's Field has a 12rem minimum). That's about a 22rem column, so 320px and 400% zoom always stack.
- 64rem: same as 40rem (the form column stays 40rem). Phone: one Field, 20 characters wide, at every width (it shrinks to fit at 320px).

## 6. Component design and API

### 6.1 PhoneInput: its own flat component (decision)

| Decision            | Chosen                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected, and why                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape               | `PhoneInput`, one part like NumberInput, inside the consumer's `Field`; hook `usePhoneInput` → `inputProps`, `mask`                                                                                                                                                                                                                                                                                                                                       | A documented `TextInput type="tel" mask="telephone"` preset: 4 of 25 sites already get the attributes wrong, so the defaults belong in a component    |
| Element             | `<input type="tel">`, `inputmode="tel"`, `spellcheck="false"`, `dir="ltr"`                                                                                                                                                                                                                                                                                                                                                                                | `type="text"`: weaker autofill heuristics                                                                                                             |
| `autoComplete`      | Default `tel` (the full number, which is what autofill stores); yours wins (`mobile tel`, `tel-national`, `off` for someone else's number)                                                                                                                                                                                                                                                                                                                | `tel-national`: autofill drops the `+46`, and then a foreign number has no country                                                                    |
| Mask                | `telephone` (digits, `+`, space, `-`, `(`, `)`; with M1 also `.`, Unicode digits mapped, no-break spaces as spaces). `mask={false}` turns it off                                                                                                                                                                                                                                                                                                          | No mask: a typed `O` for zero would pass silently. National formatting: needs numbering-plan data (a dependency) and breaks paste                     |
| Formatting          | **Never**: not while typing, not on blur. The value is the user's text, minus refused characters                                                                                                                                                                                                                                                                                                                                                          | Format on blur: rewrites without the user's action, a returning screen reader user hears a different value, GOV.UK Notify found it confusing          |
| Value               | `onValueChange(value, details)`: `value` and `details.unmaskedValue` are the text as shown (`+46 70-174 06 05`). Normalise to E.164 on the server                                                                                                                                                                                                                                                                                                         | A built-in normalised value: "+46 (0)70" can't be stripped right without numbering-plan data                                                          |
| Validation          | The consumer's, with the message in `Field.ErrorMessage`. No length limit, no `pattern`                                                                                                                                                                                                                                                                                                                                                                   | Built-in validity: KvirnUI holds no form state                                                                                                        |
| Format help text    | Not required (no 3.3.2 dev warning with the default mask: people know their number); recommended for international numbers (M2). A custom `mask` without a help text warns, as on NumberInput                                                                                                                                                                                                                                                             | Always required: a help text nobody needs is noise for the hardest-case user                                                                          |
| Calling-code select | **In (maintainer's decision, reverses "out of v1").** `PhoneInput.Root` (country: its prop, then the provider's, then the locale's) with an optional `PhoneInput.Country` (native `<select>`, `tel-country-code`, `Sverige (+46)`, no flags) and `PhoneInput.Number` (`tel-national` next to a Country, else `tel`). The number is never prefixed or rewritten, and changing the country never changes it. Without a Country part it is the one box above | A select of about 240 codes is a second Tab stop and a wrong default is a top error source: the default is the provider's country, and it is optional |
| Width               | 20 characters (the `--width-20` formula) from `kv-phone-input`; a `kv-input--width-*` class of yours wins. `kv-input--numeric` figures                                                                                                                                                                                                                                                                                                                    | Full width: a long box doesn't signal "a phone number"                                                                                                |

### 6.2 AddressInput: Root plus one control per line (decision)

`Address` already exists (the static `<address>`), so the form control is `AddressInput`.

| Decision               | Chosen                                                                                                                                                                                                                                                                                                                                          | Rejected, and why                                                                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape                  | `AddressInput.Root` (a `div.kv-address-input` inside the consumer's **plain** `Fieldset.Root`) and four controls: `.Line1`, `.Line2`, `.PostalCode`, `.City`, each a text `<input>` inside the consumer's own `Field.Root` with a `Field.Label` child. Hook `useAddressInput` → `rootProps`, `getInputProps(part)`, `country`, `postalCodeMask` | (a) Each part a Field that inserts its input among the consumer's children: needs child sorting to keep label, description, control, help text, error. (b) A flat component with a `labels` prop: the component would hold text, and errors and help texts per line would need more props |
| Fieldset               | Plain, not `group`: an address is four answers, so each Field marks itself and Line 2 shows "(optional)". The legend names the group                                                                                                                                                                                                            | `group` (as DateInput): Line 2 would lose "(optional)" (3.3.2). A Root inside a `group` Fieldset warns                                                                                                                                                                                    |
| Parts                  | Line1 `address-line1`, Line2 `address-line2`, PostalCode `postal-code`, City `address-level2`                                                                                                                                                                                                                                                   | `street-address` on one box: the token is for a multi-line textarea                                                                                                                                                                                                                       |
| Order (SE, FI, NO)     | Line 1, Line 2, postal code, city: the consumer's JSX order. c/o goes on Line 2 (autofill stores it there), not above the street as on an envelope                                                                                                                                                                                              | c/o first: autofill would put the street in the c/o box                                                                                                                                                                                                                                   |
| Country                | Root `country` (ISO alpha-2; default the provider's `country`, then the locale's, as masks resolve it). It's the address's country, not the page's                                                                                                                                                                                              | Country from the locale only: an `sv` page in Finland, or an address abroad, would get the wrong mask                                                                                                                                                                                     |
| Country control        | **Not a part in v1.** If the service asks, the consumer puts a Field with their own control (`autoComplete="country"`) in the Root and passes its value as `country`                                                                                                                                                                            | A built-in list: about 250 codes as data in the component, and the select-or-combobox choice is the service's                                                                                                                                                                             |
| Postal code            | SE `999 99`, FI `99999`, NO `9999` from the existing `postal-code` mask with the Root's country: `inputmode="numeric"`, `dir="ltr"`, widths `-6`, `-6`, `-4`. Any other country: no mask, `inputmode="text"`, `autocapitalize="characters"`, `dir="ltr"`, `-10`. A `mask` of yours (or `false`) wins                                            | One width for all: the box size is the format hint (1.3.5, 3.3.2)                                                                                                                                                                                                                         |
| Text lines             | Line1, Line2, City: `spellcheck="false"`, `autocorrect="off"`, full width (City fills its row)                                                                                                                                                                                                                                                  | Spell-check on: street names show as errors, iOS autocorrect rewrites them                                                                                                                                                                                                                |
| `autoComplete` on Root | Not set: plain tokens. `"off"`: every part `off`. A prefix (`section-*`, `shipping`, `billing`) goes before each token. A part's own wins                                                                                                                                                                                                       | Per-part only: two addresses on a page would collide                                                                                                                                                                                                                                      |
| Errors                 | Per part in its Field (`Field.ErrorMessage`, `invalid` on that Field). `Fieldset.ErrorMessage` only for a whole-address error. ErrorSummary: one link per invalid part (its Field's `controlId`); the group error links to Line 1                                                                                                               | One group message, as in DateInput: an address has four separate fixes                                                                                                                                                                                                                    |
| Auto-advance           | **None** (3.2.2): a full postal code never moves focus. DateInput's exception isn't extended                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                           |
| Lookup                 | None (rule 7). The city isn't derived from the postal code                                                                                                                                                                                                                                                                                      | Postal-code lookup or a bundled database: a third-party call, or licensed data                                                                                                                                                                                                            |

### 6.3 Intended usage

```tsx
<Field.Root controlId="phone" required invalid={errors.phone !== undefined}>
  <Field.Label>Phone number</Field.Label>
  <PhoneInput name="phone" value={phone} onValueChange={setPhone} />
  <Field.HelpText>If your number isn't Swedish, start with the country code, for example +358.</Field.HelpText>
  <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
</Field.Root>

<Fieldset.Root invalid={errors.address !== undefined}>
  <Fieldset.Legend>Your address</Fieldset.Legend>
  <AddressInput.Root country="SE">
    <Field.Root controlId="address-line1" required invalid={errors.line1 !== undefined}>
      <Field.Label>Street address</Field.Label>
      <AddressInput.Line1 name="line1" />
      <Field.ErrorMessage>{errors.line1}</Field.ErrorMessage>
    </Field.Root>
    <Field.Root controlId="address-line2">
      <Field.Label>Address line 2</Field.Label>
      <AddressInput.Line2 name="line2" />
      <Field.HelpText>For example c/o and a name</Field.HelpText>
    </Field.Root>
    <Field.Root controlId="address-postal-code" required invalid={errors.postalCode !== undefined}>
      <Field.Label>Postal code</Field.Label>
      <AddressInput.PostalCode name="postalCode" />
      <Field.HelpText>For example 123 45</Field.HelpText>
      <Field.ErrorMessage>{errors.postalCode}</Field.ErrorMessage>
    </Field.Root>
    <Field.Root controlId="address-city" required invalid={errors.city !== undefined}>
      <Field.Label>Town or city</Field.Label>
      <AddressInput.City name="city" />
      <Field.ErrorMessage>{errors.city}</Field.ErrorMessage>
    </Field.Root>
  </AddressInput.Root>
  <Fieldset.ErrorMessage>{errors.address}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

An optional section ("Postal address, if different") is `<Fieldset.Legend marker="optional">` with `autoComplete="section-postal"` on the Root.

### 6.4 Core versus react

- **react:** both components, both hooks, the Root context, the country-to-mask/width/`inputMode` mapping, the autocomplete prefix, three dev warnings (`address-input-outside-fieldset`, `address-input-in-group-fieldset`, `address-input-part-outside-root`).
- **core:** nothing new is required. The `postal-code` mask already takes a `country` (`{ preset: 'postal-code', country }`), so the Root passes its country. M1 (Unicode digits, no-break spaces, `.`) is a `masks.ts` change and needs approval.

## 7. Visual specification

No new tokens, colours or radii. Every box is `kv-input` with TextInput's look and states; the Fields are `kv-field`.

| Part                                 | Class and layout                                                                                                                                 | Tokens                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| PhoneInput                           | `kv-input kv-input--numeric kv-phone-input`: 20 characters by the width formula, `max-inline-size: 100%`. A width class wins (declared after it) | TextInput's                                                                                                   |
| AddressInput.Root                    | `kv-address-input`: `display: flex; flex-wrap: wrap; align-items: flex-start`                                                                    | gap `--kv-space-6` (24px, the address gap from form-fields §6.2); `--kv-space-4` with `kv-compact` from 64rem |
| Field around Line1, Line2, any other | `flex: 1 1 100%` (via `:has(> .kv-address-input-line1)` and so on, or `>*` default)                                                              |                                                                                                               |
| Field around PostalCode              | `flex: 0 1 auto`: as wide as its label, help text and box                                                                                        |                                                                                                               |
| Field around City                    | `flex: 1 1 12rem`                                                                                                                                |                                                                                                               |
| PostalCode box                       | `kv-address-input-postal-code` + `kv-input--width-6` (SE, FI), `-4` (NO), `-10` (other); `kv-input--numeric` for SE, FI, NO                      |                                                                                                               |

**States:** default, hover, focus-visible, focus (click), invalid, disabled, read-only and autofilled are TextInput's, unchanged. Only the invalid part takes the heavy `danger` edge; a group error marks only the legend.

**Modes.**

- Dark and contrast themes: TextInput's tokens; nothing new to measure.
- Forced colours: TextInput's system-colour edges; invalid stays the heavy edge plus the text error. No state in background or shadow.
- RTL: the PostalCode/City row mirrors. Phone and postal-code boxes are `dir="ltr"` (`+46` stays first) with text aligned as other identifier masks. Street and city follow the page direction.
- Motion: none.
- 320px, 400% zoom, 1.4.12: every Field stacks; the row wraps on content width, so extra letter spacing makes it stack sooner, never overflow. Width classes include the 1.4.12 allowance and cap at 100%.
- Target size: control height 44px (32px compact), full width or wider than 24px.

## 8. Accessibility annotations

- **Names:** the visible `Field.Label` (2.5.3); "(optional)" is part of Line 2's name. The group: "Your address, group". A part outside a Field needs `aria-label` (TextInput's warning).
- **Roles:** native `textbox` in a native `fieldset`/`legend`. No ARIA added beyond the Field's.
- **Tab stops:** PhoneInput 1. AddressInput 4 in DOM order (5 with the consumer's country). Keys: TextInput's and the masked-input rows; no key handled, nothing prevented, no auto-advance, Escape does nothing.
- **Focus moves:** none by the components. On submit: ErrorSummary, then its link to the part's `controlId`; `scroll-padding` keeps the error under the box visible.
- **Announcements:** the mask's existing polite, throttled messages only. Nothing for accepted input, autofill or a country change.
- **Read aloud (draft, `pending` AT):** "Your address, group" · "Street address, edit text, required" · "Address line 2 (optional), edit text, For example c/o and a name" · "Postal code, edit text, required, For example 123 45" · "Phone number, edit text, required, If your number isn't Swedish …".
- **SC of note:** 1.3.1, 1.3.5 (tokens), 2.4.6, 2.5.3, 3.2.2 (no auto-advance), 3.3.1–3.3.3, 3.3.7 (known address shown, not re-asked), 3.3.8, 1.4.10, 1.4.12.

### 8.1 Stories (Components/Forms)

- **PhoneInput:** Default (help text), Required with error, International numbers, Optional, Someone else's number (`autoComplete="off"`), Without mask, Disabled, Read-only, RTL, Forced colours, Keyboard.
- **AddressInput:** Sweden, Finland, Norway, Address abroad (`country="DE"`), Errors per part with ErrorSummary, Address not found (group error), Optional section (`section-postal`), Two addresses (applicant and other guardian, `off`), Disabled, RTL, Forced colours, Keyboard.

### 8.2 Tests (only behaviour these components add)

| File › name                                                                                                         | Proves                        |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `phone-input.test.tsx` › sets type tel, inputmode tel, dir ltr and autocomplete tel, and yours wins                 | 1.3.5, defaults               |
| › keeps the user's spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing                 | No formatting, value contract |
| › mask={false} leaves out and announces nothing                                                                     | Opt-out                       |
| › the default mask needs no help text; a custom mask without one warns                                              | M2                            |
| › Tab and Shift+Tab: one stop                                                                                       | Keyboard row                  |
| `masks.test.ts` › telephone maps Eastern Arabic and full-width digits and keeps a dot (and postal code maps digits) | M1, if approved               |
| `address-input.test.tsx` › each part gets its token, a Root prefix or off, and a part's own wins                    | 1.3.5                         |
| › the postal code follows the Root's country: SE 12345 → 123 45, FI, NO, and DE keeps letters with no mask          | Country mapping               |
| › without country the provider's country is used                                                                    | Default                       |
| › changing country never rewrites the postal code                                                                   | No silent change              |
| › the text lines turn off spell-check and autocorrect                                                               | Decision                      |
| › warns outside a fieldset, inside a group fieldset, and for a part outside a Root                                  | Warnings                      |
| › Tab moves through the parts in DOM order, and a full postal code never moves focus                                | Keyboard rows, 3.2.2          |

Field wiring, errors, ErrorSummary links and mask keys are already proved by Field, Fieldset, ErrorSummary and `use-mask` tests.

## 9. Validation

- [x] Self-review against `review-checklist.md`: no open blockers (the Unicode-digit refusal is a blocker for the phone default; M1 or `mask={false}` resolves it).
- [x] Contrast: no new colour pair.
- [x] Usability test plan written. Result: `pending`.

**Usability test plan (`pending`).** 8–10 residents: 2 screen reader users (NVDA, VoiceOver iOS), 2 magnifier or 400% zoom, 2 second-language (Arabic, Finnish), 1 with a tremor, 2 low digital confidence. Tasks on a phone: give your number and home address with autofill; again typing; a foreign number; a second address for another person; fix a postal-code error from the summary. Measure: completion, refused input, errors, time, whether autofill filled the wrong person's data, whether the city beside the postal code was missed.

## 10. Maintainer asks

| #   | Ask                                                                                                                                                                                                                                                                                                                                          | Owner doc                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| M1  | Core: `masks.telephone()` maps Unicode decimal digits to 0–9 and Unicode space separators to a space, and keeps `.`; the pattern `9` token maps Unicode digits (postal code, all digit masks). Otherwise a phone or postal code typed on an Arabic keyboard is refused                                                                       | `forms/references/masks.md` |
| M2  | Forms skill: PhoneInput's default mask needs no format help text (no 3.3.2 warning), as NumberInput's whole number                                                                                                                                                                                                                           | `forms` skill               |
| M3  | DESIGN.md Forms: add "Phone input" (one `tel` box, 20 characters, tabular figures, `ltr`, the user's format kept, no calling-code select) and "Address input" (plain fieldset, one Field per line, order street, line 2, postal code, city; postal code 4/6/10 characters beside the city when there's room; `space-6` gap; errors per line) | `DESIGN.md`                 |
| M4  | Names `PhoneInput` and `AddressInput` (`Address` is taken)                                                                                                                                                                                                                                                                                   | plan                        |
| –   | No new token, no i18n key, no dependency, no network call                                                                                                                                                                                                                                                                                    | –                           |

## 11. Open questions (maintainer's)

1. Approve M1? If not, PhoneInput ships with `mask={false}` as its default.
2. Country calling-code select and a Country part: **in**, as `PhoneInput.Country` (maintainer's decision; the lead's defaults in §6.1 stand until overridden). Agree with the defaults?
3. PostalCode beside City from about 22rem, or always stacked?
4. Postal-code masks for DK and IS (`MaskCountry` is SE, FI, NO only): later?
5. Fiction-range example phone numbers for FI and NO: which ranges are reserved?
6. Phone extensions ("ankn. 123"): letters are left out today. A separate field in the docs, or accept them?
