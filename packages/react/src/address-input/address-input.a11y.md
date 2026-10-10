# Accessibility contract: AddressInput (AddressInput.Root, .Line1, .Line2, .PostalCode, .City)

- **APG pattern:** none. There is no APG pattern for an address. An address is four labelled text inputs inside a `<fieldset>` with a `<legend>`, which is what the GOV.UK addresses pattern and the Nordic public-sector design systems do, and what autofill, dictation and every screen reader handle well.
- **Deviations:** none. Decisions (design spec `docs/design/phone-and-address-inputs.md` §6.2): a plain `Fieldset` (not `group`) so each Field marks itself and Line 2 shows "(optional)"; one Field per line, so help texts and errors are per line; no auto-advance (3.2.2); no lookup and no postal-code database (AGENTS.md rule 7); no Country part in v1; the components hold no text and no i18n keys.
- **Native elements used:** `<fieldset>` and `<legend>` (the consumer's `Fieldset.Root` and `Fieldset.Legend`), `<div>` (`AddressInput.Root`, and each Field), `<label for>` (the Field's label), `<input type="text">` (each part).
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `address-input.test.tsx` next to this file; the parts' own behaviour is `text-input.test.tsx`, `field.test.tsx`, `fieldset.test.tsx` and the mask tests. `address-input.stories.tsx` in `apps/storybook/src/components/address-input/`.

An address is one question ("Your address") answered with up to four boxes: street, line 2, postal code and city. `AddressInput.Root` is the layout and goes inside a plain `Fieldset.Root`, whose legend names the group. Each part is a `TextInput` inside the consumer's own `Field.Root` with a `Field.Label`, so a line has its own label, help text and error.

## Roles, states, properties

| Part                           | Element / role                    | ARIA / state                                                                                                                                                               | Notes |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| The group (`Fieldset.Root`)    | `<fieldset>` → `group`            | Named by its `<legend>`. A whole-address error is the fieldset's `Fieldset.ErrorMessage` (`fieldset.a11y.md`)                                                              |       |
| AddressInput.Root              | `<div>`, no role                  | none                                                                                                                                                                       |       |
| Line1, Line2, PostalCode, City | `<input type="text">` → `textbox` | Named by the Field's visible label ("(optional)" included). `aria-invalid`, `aria-required` and `aria-describedby` come from the Field. `autocomplete` is the part's token |       |
| `useAddressInput`              | the logic, for your own elements  | returns `country`, `postalCodeMask`, `rootProps`, `getInputProps(part)`                                                                                                    |       |

Rules, tested in `address-input.test.tsx`:

- **Autocomplete tokens (1.3.5).** Line1 `address-line1`, Line2 `address-line2`, PostalCode `postal-code`, City `address-level2`. A Root `autoComplete` of `off` turns every part off, any other value (`section-postal`, `shipping`) goes before each token, and a part's own `autoComplete` wins (`address-input.test.tsx › each part gets its token, a Root prefix or off, and a part’s own wins`).
- **Text lines are not corrected.** Line1, Line2 and City have `spellcheck="false"` and `autocorrect="off"`: street names are not words (same test).
- **The postal code follows the Root's country.** SE `123 45`, FI `00100` and NO `1234` through the existing `postal-code` mask, with `inputmode="numeric"` and `dir="ltr"`. Any other country: no mask, `inputmode="text"`, `autocapitalize="characters"`, `dir="ltr"`, so a foreign code is never refused. The default country is the provider's, then the locale's (`address-input.test.tsx › follows the Root’s country: SE groups the digits, DE keeps letters with no mask`, `› without a country on the Root, the provider’s country is used`).
- **Nothing is rewritten and focus never moves on its own.** A full postal code keeps focus in the box, and changing `country` leaves a typed value as it is; the mask applies to the next edit (`address-input.test.tsx › a full postal code never moves focus, and changing country never rewrites the value`).
- **Dev warnings:** a Root outside any group; a Root in a `group` Fieldset; a part outside a Root (`address-input.test.tsx › warns outside a fieldset, in a group fieldset, and for a part outside a Root`).
- **No strings, no announcements of its own.** The only messages are the mask's polite "character not allowed" ones (`text-input.a11y.md`).
- **No axe violations** in every story state, in the four theme projects (`address-input.stories.tsx`).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native. AddressInput handles no keys, never calls `preventDefault` on one and never moves focus when a box is full: the order of the parts is the DOM order the consumer writes (street, line 2, postal code, city).

| Key                                 | Context                         | Action                                                                                 | Test                                                                                                           |
| ----------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Tab                                 | before the address, or on a box | Moves focus to the next part in DOM order. From the last part it leaves the address    | `text-input.test.tsx › Tab moves through the inputs in DOM order`                                              |
| Shift+Tab                           | on a box                        | Moves focus to the previous part. From the first part it leaves the address            | `text-input.test.tsx › Tab moves through the inputs in DOM order`                                              |
| Characters                          | on the postal code              | Types them, shaped by the country's mask. A full code keeps focus: nothing advances    | `address-input.test.tsx › a full postal code never moves focus, and changing country never rewrites the value` |
| ArrowLeft / ArrowRight / Home / End | on a box                        | Move the caret inside the box (flips in RTL: the browser's own). They never move focus | `text-input.test.tsx › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`             |
| Enter                               | on a box, in a form             | Submits the form (native). AddressInput does not intercept it                          | `text-input.test.tsx › Enter in a plain form submits it with the typed values (native)`                        |
| Escape                              | on a box                        | Does nothing: the value and the focus stay                                             | `text-input.test.tsx › Escape does nothing: the value and the focus stay`                                      |

## Focus management

- Initial focus: none set by AddressInput.
- Trap: no.
- Restore to: n/a.
- Never obscured by: the consumer's sticky header: keep `scroll-padding` so a focused box and the error under it stay visible (2.4.11).

## Announcements

| Event                      | Message key (i18n)                                             | Politeness |
| -------------------------- | -------------------------------------------------------------- | ---------- |
| The mask drops a character | `mask.characterNotAllowed`, `mask.maximumLength` (TextInput's) | polite     |

AddressInput has no keys of its own. Nothing is announced for accepted input, autofill or a country change.

### Read aloud

Not asserted yet: the fieldset and Field phrases are proved by `fieldset.a11y.md` and `field.a11y.md`. Draft, `pending` AT: "Your address, group" · "Street address, edit text, required" · "Address line 2 (optional), edit text, For example c/o and a name" · "Postal code, edit text, required, For example 123 45".

## Consumer responsibilities

- A plain `Fieldset.Root` with a `Fieldset.Legend` that names the address; not `group`.
- One `Field.Root` per part with a `Field.Label`, `required` on the ones that are, and a `Field.HelpText` with an example for the postal code in the country's form (3.3.2).
- Per-part errors in `Field.ErrorMessage` with `invalid` on that Field, a whole-address error in `Fieldset.ErrorMessage`, and an `ErrorSummary` link per invalid part (the Field's `controlId`; the whole-address error links to Line1).
- `country` on the Root when the address is not in the provider's country. A country control, if the service asks for one, is the consumer's own Field with `autoComplete="country"`.
- `autoComplete="off"` for someone else's address, and `section-*` when a page has two.
- An address the service already knows is shown as a summary with a change link, not as read-only boxes (3.3.7).

## Visual / modes

- Focus indicator: the TextInput's own, a 2px `focus-ring` outline, 2px offset.
- Target size: each box is as high as a TextInput (44px, 32px in `kv-compact`), full width or wider than 24px.
- Layout: stacked below 22rem; from 22rem the postal code and the city share a row. 320px and 400% zoom always stack (1.4.10).
- forced-colors behaviour: the TextInput's system colours; an invalid box keeps the heavy edge plus the text error.
- reduced-motion behaviour: no motion.
- RTL: the postal code and city row mirrors; the postal code is `dir="ltr"`; street and city follow the page direction.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a fieldset with a legend, a visible label for each box.
- 1.3.5 Identify Input Purpose: the four autocomplete tokens.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the row wraps; nothing is fixed in height.
- 2.1.1 Keyboard, 2.4.3 Focus Order: one Tab stop per part in DOM order, native keys.
- 2.4.6 Headings and Labels, 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 3.2.2 On Input: no auto-advance.
- 3.3.1, 3.3.2, 3.3.3: per-part errors with what to do, labels and an example.
- 3.3.7 Redundant Entry and 3.3.8 Accessible Authentication: autofill and paste work in each box.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

Research questions for the AT run: do magnifier users find the city beside the postal code? Does autofill fill all four boxes at once on iOS and Android?

## Known issues

- **Eastern Arabic and full-width digits** in a masked postal code are refused today (the pattern mask takes 0-9). Set `mask={false}` on `AddressInput.PostalCode` where those keyboards are expected.
- **DK and IS** have no postal-code mask (`MaskCountry` is SE, FI and NO): their codes take letters and digits, in upper case, ten characters wide.
