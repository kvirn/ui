# Design spec: AddressInput with street autocomplete

<!-- kv-lang-ok-file: a sample Swedish address (Storgatan, Malmö) and a Finnish town name in the examples -->

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-22 (revised the same day: model (a))
- **Plan:** 0149 (done, deleted; see `git log`). The lookup lives in `AddressInput` (`@kvirn-ui/react`), opt-in with `geocoder` on `AddressInput.Root`; geocoders (`kvirnGeocoder`, …) come from `@kvirn-ui/map`; the decisions are in §9.
- **Type:** component flow, content and default styling (`theme.css`)
- **Builds on:** [address-search.md](address-search.md) (states, strings, Enter deviation D1, privacy notice), [phone-and-address-inputs.md](phone-and-address-inputs.md), [geocoder-providers.md](geocoder-providers.md), `address-input.a11y.md`, `address-search.a11y.md`.

## 1. Brief

- **Users:** residents filling in their own address once, under stress, often on a phone; staff entering a caller's address many times a day.
- **Hardest cases:** a motor-impaired or cognitively disabled resident who relies on the browser's saved address (autofill); a screen-reader user who must hear how many addresses came back and what a pick changed in boxes they can't see; a 400% magnifier user who sees only the box in focus; a second-language reader; a resident whose street has no mapped house numbers; a phone on a dropped connection.
- **Job:** "When I give my address, I want to type my street, pick it if it's offered, and finish it myself, so I don't type the rest and don't get it wrong."
- **Constraints:** 1.3.5 and 3.3.7 (autofill and tokens keep working); rule 7 (nothing is sent until the visitor types `minLength` characters); GDPR (the street reaches the geocoder: say so before typing); rule 4; AddressInput holds no form state.
- **Success:** the address is correct at submit; autofill fills all four boxes as today; every lookup state is seen and heard; a missing house number is added, not lost.
- **Evidence:** none from KvirnUI users. Everything without a source is an assumption.
- **Assumptions → research questions:**
  - A browser's own autofill list beside ours (approved trade-off) doesn't confuse. → Do participants know which list they're in?
  - Residents read the street box as free text, not "pick or fail". → Do they finish a street that isn't listed?
  - A pick that replaces typed values is expected. → Are participants surprised?

## 2. Interaction model

| Option                                                   | Verdict                                                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **(a)** Line1 is the ARIA 1.2 combobox, still free text  | **Decided** (maintainer, 2026-10-22)                                                                        |
| (b) a separate "Find your address" field above the boxes | Superseded the same day: built (plan 0149 T3), replaced (T3b)                                               |
| (c) Line1 a textbox whose list appears after typing      | Rejected: a list under a `textbox` is hidden semantics (4.1.2), and a role that changes mid-typing is worse |

**Why (a).** The lookup is a helper, never the deciding factor. House numbers are often not mapped (common outside Swedish cities), so the resident completes the street in the same field: one field, no second answer to reconcile, and the GOV.UK principle of manual entry always available ([patterns/addresses](https://design-system.service.gov.uk/patterns/addresses/)) holds because the field is the manual entry.

**Approved accessibility trade-off** (maintainer, 2026-10-22): Line1 keeps `autocomplete="address-line1"` and its `name` while it is a combobox, so autofill and 1.3.5 stay, and a browser may show its own autofill list beside ours. **A cost to name, not a WCAG failure:** typing the street in the ordinary box sends it to the geocoder, with no way to use the box without the lookup; so the privacy notice is read before typing (§5), autofill and the fill never search, and nothing is sent below `minLength`.

**Enter deviation (D1), approved:** in Line1 with a geocoder, Enter with no active option searches and never submits the form, as AddressSearch. **Country:** the optional `AddressInput.Country` select, first in the group, is the country searched and the postal code's format (D4, D6).

## 3. Flow

1. With the Country part: check the country (the Root's country is preselected and listed first). Autofill can fill it.
2. Focus Line1: label, privacy notice, help. Or let autofill fill the boxes: nothing is sent, nothing announced, no list opens.
3. Type ≥ `minLength` (as you type with a `suggest: true` geocoder), or type and press Enter or Search (on request). Searching → n results.
4. Pick (Enter, Alt+ArrowUp, press): Line1 gets the street, with its number when known; PostalCode and City are filled. Focus stays in Line1, caret at the end, so a missing number is typed straight after. Typing on may offer house-level matches. Or ignore the list and keep typing.

| Case                                             | What happens                                                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pick, `precision: 'address'`                     | Line1 = `address.line1` (never the result's `label`), PostalCode, City replaced. **Line2 never touched.** The fill reaches the consumer as typing does (controlled `value`, a form library's `input` listener, the DOM value) |
| Pick, `precision: 'street'`                      | Filled the same way; the note and announcement add `missingHouseNumber`. The caret at the end is where the number goes                                                                                                        |
| Boxes already typed or autofilled                | The pick overwrites Line1, PostalCode and City: a pick is an explicit request. No confirm (plan 0149 decision)                                                                                                                |
| Result without postal code or city               | Fill what it has. A value an earlier pick left is emptied; a value the user typed stays. `missingPostalCode` / `missingCity` only when the box is empty after the fill. Never `aria-invalid`                                  |
| Result has no `address` (a place)                | Fill nothing; `noAddressDetails`, the list stays open                                                                                                                                                                         |
| Typing after a pick                              | Searches again (house-level matches); the earlier fill stays until a new pick                                                                                                                                                 |
| Autofill, paste of a whole address, our own fill | Autofill and the fill never search or open the list. A paste is typing: it searches after the pause                                                                                                                           |
| Searched country                                 | With Country: every country listed, the selected one first (`country` search option, D3). Without: only the Root's `country`; other results dropped (D6). The help names it (`lookupScope`)                                   |
| Country changed by the user                      | Native select, nothing announced. The postal code's mask follows; a typed code is never rewritten. The next search uses it                                                                                                    |
| Pick in another country                          | With Country: the select is set first (a change event), so the mask follows; then the boxes. Adds `countryChanged`. Without: not offered (D6)                                                                                 |
| No results / error, timeout / offline            | `lookupNoResults` / `lookupError` / `lookupOffline`: each says to keep typing. Not invalid; the text stays                                                                                                                    |
| Clear (×)                                        | Empties Line1 only, focus stays; other boxes untouched                                                                                                                                                                        |
| No `geocoder` on Root                            | Line1 is today's plain textbox                                                                                                                                                                                                |

## 4. Content

English final; sv, fi, nb, nn in all 5 locales (nb/nn for a native reviewer). Length check with the longest fi string at 320px. `lookupLabel` is dropped: Line1's label is the consumer's `Field.Label`.

| i18n key                                   | en                                                                                                              | Where                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `addressSearch.privacy` / `privacyUnnamed` | What you type is sent to {service} to find the address.                                                         | notice, then attribution |
| `addressInput.lookupHelpSuggest`           | Addresses are suggested after {min} characters. Choose one to fill in the postal code and town, or keep typing. | help, as you type        |
| `addressInput.lookupHelpRequest`           | Press Search to look up your street and fill in the postal code and town, or keep typing.                       | help, on request         |
| `addressInput.lookupScope`                 | Suggests addresses in {country}.                                                                                | help, last               |
| `addressSearch.submit`                     | Search                                                                                                          | button, on request       |
| `addressSearch.tooShort`                   | Type at least {min} characters to search.                                                                       | status + announced       |
| `addressSearch.searching`                  | Searching for addresses                                                                                         | status + announced       |
| `addressSearch.resultCount`                | 1 address found / {count} addresses found                                                                       | announced                |
| `addressInput.lookupNoResults`             | No address found for "{query}". Keep typing: your address doesn't have to be in the list.                       | status + announced       |
| `addressInput.lookupError`                 | The address search isn't working right now. Keep typing your address.                                           | status + announced       |
| `addressInput.lookupOffline`               | You're offline. Keep typing your address.                                                                       | status + announced       |
| `addressInput.noAddressDetails`            | This place has no postal address. Choose another, or keep typing your address.                                  | status + announced       |
| `addressSearch.pickedFilled`               | Chosen: {label}. The address is filled in below. Check it before you continue.                                  | announced                |
| `addressInput.filledNote`                  | Filled in from the address search. Check the address.                                                           | note, visible            |
| `addressInput.missingHouseNumber`          | Type your house number after the street name.                                                                   | note + announced         |
| `addressInput.missingPostalCode`           | Add the postal code: the search didn't have it.                                                                 | note + announced         |
| `addressInput.missingCity`                 | Add the town or city: the search didn't have it.                                                                | note + announced         |
| `addressInput.countryChanged`              | The country is now {country}.                                                                                   | note + announced         |
| `combobox.clear`                           | Clear                                                                                                           | Clear's name             |

**Country names, no catalog keys:** `Intl.DisplayNames(locale, { type: 'region' })` in the provider's locale, falling back to the ISO code (`countryNameOptions`, from `PhoneInput.Country`'s list); the Root's country first, then the locale's order; no flags. The Country part's label is the consumer's `Field.Label`.

**Privacy.** The consumer names the geocoder in the service's privacy notice (GDPR: the typed street and the IP address reach it).

## 5. Structure and API

```tsx
<Fieldset.Root>
  <Fieldset.Legend>Home address</Fieldset.Legend>
  <AddressInput.Root geocoder={kvirnGeocoder({ url })} onLookupResult={…}>
    <Field.Root><Field.Label>Country</Field.Label><AddressInput.Country /></Field.Root>   {/* optional, first */}
    <Field.Root required><Field.Label>Street address</Field.Label><AddressInput.Line1 name="line1" /></Field.Root>
    … Line2, PostalCode, City as today
  </AddressInput.Root>
</Fieldset.Root>
```

- Root: `geocoder?`, `onLookupResult?(result)` (picks only); `country` unchanged. With a geocoder, Line1 also takes `minLength` 3, `debounce` 400 or `false`, `timeoutMilliseconds` 10000, `messages`. No presentation props (rule 14).
- Line1 with a geocoder renders, inside the consumer's Field: the notice (a description, above the input), the InputGroup (input, Clear, Search on request), the popup, the lookup help and the fill note (help texts, under it), then the consumer's own help and error. `aria-describedby`: notice, lookup help, fill note, consumer's help, error.
- Country: native `<select autocomplete="country">` (`kv-listbox-native`), ISO code values, native `value` / `defaultValue` / `onChange`.
- Tab order = reading order: Country → Line1 → Search (on request) → Line2 → PostalCode → City.

```
Home address                                                ← legend
Country  [ Sweden          ▾ ]                              ← optional
Street address                                              ← consumer's label
What you type is sent to geo.kvirn.com to find the address. © OpenStreetMap contributors   ← notice
[ Storgatan |                                    × ]        ← combobox (caret after a street pick)
Addresses are suggested after 3 characters. … Suggests addresses in Sweden.   ← help
✓ Filled in from the address search. Check the address. Type your house number after the street name.
Address line 2 (optional) [                  ]
Postal code [211 22]  City [ Malmö           ]              ← one row from 22rem, stacked below
```

## 6. Visual specification

| Part                   | Tokens / style (DESIGN.md)                                                                                     | Notes                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Notice                 | `Field.Prose` look: `body` in `text`; attribution may be a `link`                                              | Above the input: read before typing, and never covered by the popup (DESIGN.md: what must be read before answering is a description) |
| Line1 input group      | `kv-input` in an InputGroup, Clear icon button, Search secondary button, the `kv-address-lookup-*` classes     | Same width as Line1 today                                                                                                            |
| Popup, status, options | The shared lookup's popup and status line (icon + text)                                                        | Under the input, flips above (2.4.11)                                                                                                |
| Lookup help, fill note | `body-small` in `text`; the note has a leading `check` icon (`currentColor`, decorative), `--kv-space-2` above | Plain text, never a live region; the Announcer says it                                                                               |
| Country select         | `kv-listbox-native`, sized to its content, full width at 320px if needed                                       |                                                                                                                                      |
| Other boxes            | Unchanged                                                                                                      | No per-box "filled" colour: colour alone would carry it                                                                              |

**States (stories):** idle · too short (on request) · searching · results · no results · error/timeout · offline · no postal address · filled · filled, street precision (note asks for the number) · filled with a missing postal code · with Country · Country changed (FI: postal code 6 wide, help says Finland) · pick in another country with Country (`countryChanged`) · edited after fill · autofilled (no list) · no geocoder (today's Line1) · disabled · compact (32px, Search ≥ 24px; comfortable below 64rem) · RTL (Clear, Search at the inline end; postal code `ltr`; check icon not mirrored) · forced colours (icons `currentColor`; Search `ButtonText`/`ButtonFace`/`ButtonBorder`; active option `Highlight`).

**Modes:** same tokens in every theme; only the spinner moves (no-preference only). 320px, 400%, 1.4.12: notice, help and note wrap; Search wraps below the input. **New tokens or colour pairs:** none.

## 7. Accessibility annotations (draft contract rows)

- **Names:** Line1 named by the consumer's `Field.Label` (2.5.3), described as in §5; Search by its text; Clear by `combobox.clear` + label; Country by its Field label.
- **Roles:** with a geocoder Line1 is `<input role="combobox">` (ARIA 1.2, `aria-autocomplete="list"`, `aria-activedescendant`, `autocomplete="address-line1"`, its `name`, `spellcheck="false"`); without one, a `textbox`. The role is fixed at mount, never switched while typing. Country is a native `<select>`.
- **Focus:** stays in Line1 after a pick with the caret at the end; never moved by a search, result, error or offline (3.2.2).

| Key                                    | Context                             | Action                                                                                 |
| -------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                        | the address                         | Country → Line1 → Search (on request) → Line2 → PostalCode → City. Clear is no stop    |
| ArrowUp / ArrowDown, letters           | Country                             | Native select (never intercepted): mask and searched country follow; nothing announced |
| Characters                             | Line1                               | Free text; searches after the pause (as you type)                                      |
| ArrowLeft / Right, Home, End           | Line1                               | Move the caret; no option stays active                                                 |
| Enter                                  | Line1, no option active (in a form) | Searches now; never submits (D1, approved)                                             |
| Enter / Space                          | Search                              | Searches                                                                               |
| ArrowDown / ArrowUp, PageDown / PageUp | popup open                          | Move the active option (one, or ten); stop at the ends                                 |
| Enter, Alt+ArrowUp                     | an option active                    | Picks: fills, focus stays in Line1, caret at the end                                   |
| Escape                                 | popup open                          | Closes it; text and focus stay                                                         |
| Tab                                    | popup open                          | Closes without picking; moves on                                                       |
| Pointer press                          | an option / Clear                   | Picks / empties Line1 only                                                             |

| Event                                          | Message key(s), polite                                                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Too short (on request) / searching             | `addressSearch.tooShort` / `addressSearch.searching` (dropped if the answer comes first)                        |
| n results / none                               | `addressSearch.resultCount` / `addressInput.lookupNoResults`                                                    |
| Error, timeout / offline / a place             | `lookupError` / `lookupOffline` / `noAddressDetails`                                                            |
| A pick that fills                              | one message: `pickedFilled` + any of `countryChanged`, `missingHouseNumber`, `missingPostalCode`, `missingCity` |
| Autofill, typing, edits, Clear, Country change | nothing                                                                                                         |

**WCAG SCs of note:** 1.3.1, 1.3.5, 1.4.1, 1.4.10, 1.4.12, 2.1.1, 2.1.2, 2.4.3, 2.4.11, 2.5.3, 2.5.8, 3.2.2, 3.3.2, 3.3.7, 3.3.8, 4.1.2, 4.1.3.

## 8. Validation

- [x] Self-review against `review-checklist.md` (every state has text and an announcement; no colour-only state; no placeholder label; targets per density; autofill tokens kept; no compliance claim) · [x] no new colour pair · [x] usability test plan written, result `pending`, AT runs `pending`.

**Usability test plan (pending).** Participants (8): NVDA, VoiceOver iOS and TalkBack users; a 400% magnifier user; a tremor or switch user who relies on autofill; an older resident with low digital confidence; a second-language reader (fi or sv); a staff user. Tasks: (1) give your address by picking it; (2) with the browser's saved address; (3) a street with no house numbers mapped; (4) a street that isn't listed; (5) with the network off; (6) staff: five addresses in a row by keyboard; (7) an address in a neighbouring country with the Country part. Measure: correct address at submit, house numbers lost, confusion between the browser's list and ours, surprise at overwrite, whether "Chosen" is heard twice, whether the magnifier user finds the filled boxes, recovery time.

## 9. Decisions and open questions

Decided (maintainer, 2026-10-22, unless noted; plan 0149 §Decisions):

1. **Model (a):** Line1 is the combobox and stays free text; (b), the separate Lookup, is superseded. Pick fills the street (number when known), focus stays in Line1, caret at the end.
2. **Accessibility trade-off:** Line1 keeps `autocomplete="address-line1"` as a combobox; a browser may show its own list beside ours.
3. **D1 Enter deviation** in Line1 with a geocoder: approved; the `keyboard` skill names it.
4. **D2** the lookup lives in `@kvirn-ui/react` (`useAddressLookup`); AddressSearch builds on it.
5. **D3** `precision` and the `country` search option: approved.
6. **D4** no country props on the Root; the optional `AddressInput.Country` part instead.
7. **D6** (lead): without Country, only the Root's country is offered; with it, every country, the selected one first, and a pick switches the select. `otherCountry` is dropped.
8. Overwrite on pick without a confirm step; revisit after the research.

Open: 9. **Notice above the input** here (read before typing, never covered by the popup), while AddressSearch keeps it under: should AddressSearch follow? 10. **Result labels without a country:** append the name when it differs from the selected country.
