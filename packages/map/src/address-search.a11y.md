# Accessibility contract: AddressSearch (Root, Label, Control, Input, Clear, Submit, HelpText, Notice, Popup, Status, List, Option)

- **Scope:** AddressSearch, an Autocomplete over a geocoder's answers. A visitor types a street, a postal code or a place, searches, and picks an address. `onResult` gets the address with its position. The roles, states and keys of the field, the popup and the suggestions are the Autocomplete's (`autocomplete.a11y.md`) and are tested there; this page lists what AddressSearch adds.
- **APG pattern:** [Combobox: Editable Combobox With List Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/), through Autocomplete (`aria-autocomplete="list"`, manual selection).
- **Deviations:** one, approved by the maintainer (2026-10-19, Plan 0117 D1; `keyboard` skill updated). Enter with no suggestion active, and no IME composition, **searches** and calls `preventDefault`, so it never submits a form: the text is a lookup, not an answer. The form's own submit button sends it. Enter on an active suggestion picks it, as in the APG.
- **Native elements used:** `<input type="text" role="combobox">`, `<label for>`, `<div popover="manual">`, `<div role="listbox">`, `<div role="option">`, `<button type="button">` (Clear, Search).
- **Tests:** `address-search.test.tsx` next to this file (a fake geocoder in memory: no test calls the network). `address-search.stories.tsx` in `apps/storybook/src/components/map/`.

Design: `docs/design/address-search.md`. The geocoder is the consumer's: the library names no URL and sends nothing until the visitor types and, on request, presses Search.

## Roles, states, properties

| Part                        | Element / role                                     | ARIA / state                                                                                        | Notes                                                                                                                                                       |
| --------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AddressSearch.Root          | a `Field.Root` (`<div class="kv-address-search">`) | `data-status`: `idle`, `too-short`, `searching`, `results`, `empty`, `error`, `offline`, `selected` | Owns `geocoder`, `onResult`, `minLength`, `debounce`, `timeoutMilliseconds`, `disabled`, `id`, `messages`. Put it in `<search>` beside a map, not in a form |
| AddressSearch.Label         | `<label for>`                                      | none                                                                                                | The visible name. Default `addressSearch.label`. No required or optional marker                                                                             |
| AddressSearch.Input         | `<input type="text" role="combobox">`              | the Autocomplete's; `aria-describedby` the help text, then the notice                               | `autocomplete="off"`                                                                                                                                        |
| AddressSearch.Clear         | `<button type="button" tabindex="-1">`             | named by `combobox.clear` and the label                                                             | Empties the text, calls `onResult(null)`, focus stays on the input                                                                                          |
| AddressSearch.Submit        | `<button type="button">`                           | none; named by its text, `addressSearch.submit`                                                     | Rendered only on request. Never submits a form                                                                                                              |
| AddressSearch.HelpText      | `<p>` (Field help text)                            | none                                                                                                | `addressSearch.helpRequest` or `helpSuggest`                                                                                                                |
| AddressSearch.Notice        | `<p>` (Field help text)                            | none                                                                                                | Says where the text goes (`addressSearch.privacy`), then the geocoder's `attribution`                                                                       |
| AddressSearch.Popup         | `<div popover="manual">`                           | the Autocomplete's                                                                                  | The status line, then the suggestions                                                                                                                       |
| AddressSearch.Status        | `<div>`, plain text with an icon                   | `data-state`; never a live region                                                                   | Searching, too short, no result, error, offline. Said again through the Announcer                                                                           |
| AddressSearch.List / Option | `role="listbox"` / `role="option"`                 | the Autocomplete's; `aria-selected="false"` always                                                  | The option text is the geocoder's `label`                                                                                                                   |

Rules, tested in `address-search.test.tsx`:

- **The ARIA 1.2 combobox, named by the visible label, described by the help text and then the notice** (`address-search.test.tsx › renders the ARIA 1.2 combobox, named by the visible label and described by the help text, then the notice`).
- **Nothing is sent on mount, on focus or with empty text** (`address-search.test.tsx › nothing is sent on mount, focus or with empty text`).
- **As you type** is used only when the geocoder declares `suggest: true`: below `minLength` nothing is sent or announced (`address-search.test.tsx › below minLength no request is sent and nothing is announced`), one request follows a pause, not each key (`address-search.test.tsx › one request after the debounce of no typing, not one per keystroke`), a new key abandons the request in flight and a late answer for old text is never shown (`address-search.test.tsx › a new keystroke aborts the request in flight and a late answer for old text is never shown`), and the request carries the intent and the provider's locale (`address-search.test.tsx › passes the intent suggest as you type and submit for Enter, with the provider locale`).
- **On request** (a geocoder without `suggest`, or `debounce={false}`): typing sends nothing, and Enter or Search sends one request (`address-search.test.tsx › typing sends nothing, and Enter or Search sends one request (a geocoder without suggest)`, `address-search.test.tsx › typing sends nothing with debounce={false} although the geocoder suggests`). Below `minLength` it says what is missing and sends nothing (`address-search.test.tsx › Enter or Search below minLength shows and announces tooShort and sends nothing`).
- **Every state has words, and the same words are announced once** (4.1.3): searching keeps the earlier options (`address-search.test.tsx › searching shows the status, announces searching and keeps the earlier options in place`), n results (`address-search.test.tsx › n results are listed, the count is announced once after the answer and nothing is active`), none, which is not invalid (`address-search.test.tsx › no results shows and announces noResults with the query, reports collapsed and is not invalid`), a rejection (`address-search.test.tsx › a rejection shows and announces error, and the text stays`), no answer in time (`address-search.test.tsx › no answer within the timeout shows and announces error`) and offline, with no request sent (`address-search.test.tsx › offline shows and announces offline and sends no request`). The Autocomplete's own count and "No results" are switched off (`announceResults={false}`), so nothing is said twice.
- **A pick** puts the label in the field, calls `onResult` once, keeps focus on the input and announces `addressSearch.picked` (3.2.2, 4.1.3): with Enter, Alt+ArrowUp or a press. A suggestion without a position is resolved first (`address-search.test.tsx › a suggestion without a position is resolved on pick: searching shows, resolve runs once and onResult gets the position`; `address-search.test.tsx › a resolve that fails shows error and calls no onResult`).
- **With a map**, `show(result)` fits the bounds or centres, draws a decorative result pin, keeps focus and announces `map.addressShown` once the view settles (`address-search.test.tsx › show(result) fits the bounds or centres, draws the pin, keeps focus and announces addressShown once settled`). `clearResult()` removes the pin and announces nothing (`address-search.test.tsx › clearResult removes the pin and announces nothing`).
- **In a form**, `result.address` fills the AddressInput boxes, which stay editable (3.3.7; `address-search.test.tsx › the result address fills the boxes, which stay editable`).
- **Every string comes from `addressSearch.*`** and is overridable per instance (`address-search.test.tsx › every string comes from addressSearch.* and is overridable per instance`, `address-search.test.tsx › a per-instance message replaces the catalog text`).

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** aria-activedescendant. DOM focus stays on the input, and the active suggestion is `aria-activedescendant`
- **Selection follows focus:** no (Enter, Alt+ArrowUp or a press picks a suggestion, and the arrow keys only move the highlight)
- **Arrows wrap:** no
- **Shortcuts:** none

| Key                 | Context                                       | Action                                                                            | Test                                                                                                                                               |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab                 | before the search                             | Moves focus to the input, one stop. Clear is not a stop                           | `autocomplete.test.tsx › Tab moves to the input, one stop`                                                                                         |
| Tab                 | on the input, on request                      | Moves focus to the Search button, then on. In as-you-type mode there is no button | `address-search.test.tsx › Search is a native type=button, one Tab stop after the input, searches on Enter and on Space, and never submits a form` |
| Shift+Tab           | on the Search button                          | Moves focus back to the input                                                     | `address-search.test.tsx › Search is a native type=button, one Tab stop after the input, searches on Enter and on Space, and never submits a form` |
| Shift+Tab           | on the input                                  | Moves focus to the previous focusable element                                     | `autocomplete.test.tsx › Shift+Tab leaves the input backwards`                                                                                     |
| Enter               | on the input, no suggestion active            | Searches now, flushing the debounce, and never submits a form                     | `address-search.test.tsx › Enter with no suggestion active, standalone, searches now and flushes the debounce`                                     |
| Enter               | on the input in a form, no suggestion active  | Searches now. The form is not submitted: its own submit button sends it           | `address-search.test.tsx › Enter with no suggestion active, inside a form, searches now and the form does not submit`                              |
| Enter               | on the input, text unchanged since the answer | Opens the last list without activating a suggestion, and says the count again     | `address-search.test.tsx › Enter on text unchanged since the last answer reopens the list without activating it and says the count again`          |
| Enter / Space       | on the Search button                          | Searches with the text in the field                                               | `address-search.test.tsx › typing sends nothing, and Enter or Search sends one request (a geocoder without suggest)`                               |
| Enter               | popup open, a suggestion is active            | Picks it: the label fills the input, the popup closes, focus stays                | `address-search.test.tsx › pick with Enter: the text becomes the label, onResult is called once, focus stays and picked is announced`              |
| Alt+ArrowUp         | popup open, a suggestion is active            | Picks it, as Enter does                                                           | `address-search.test.tsx › pick with Alt+ArrowUp: the text becomes the label, onResult is called once, focus stays and picked is announced`        |
| ArrowDown / ArrowUp | popup open                                    | Activates the next or the previous suggestion. Stops at the ends                  | `autocomplete.test.tsx › arrows move the active suggestion and stop at the ends, and typing clears it`                                             |
| PageDown / PageUp   | popup open                                    | Moves the active suggestion ten on or back                                        | `autocomplete.test.tsx › PageDown and PageUp move ten suggestions and stop at the ends`                                                            |
| Home / End          | on the input                                  | Move the caret, as in any input. No suggestion stays active                       | `autocomplete.test.tsx › Home, End, ArrowLeft, ArrowRight and Space are left to the input: the caret moves, and no suggestion stays active`        |
| Escape              | popup open                                    | Closes the popup. The text stays, and so does focus                               | `autocomplete.test.tsx › the text is never cleared silently: Escape and Tab keep it`                                                               |
| Tab                 | popup open                                    | Closes the popup without picking, keeps the text, and moves focus on              | `autocomplete.test.tsx › Tab closes the popup without picking the active suggestion, and moves focus on`                                           |
| Shift+Tab           | popup open                                    | Closes the popup without picking, and moves focus back                            | `autocomplete.test.tsx › Shift+Tab closes the popup without picking and moves focus back`                                                          |
| Pointer press       | on a suggestion                               | Picks it, and keeps focus on the input                                            | `address-search.test.tsx › pick by press: the text becomes the label, onResult is called once, focus stays and picked is announced`                |
| Pointer press       | on Clear                                      | Empties the text, calls `onResult(null)` and keeps focus on the input             | `address-search.test.tsx › Clear empties the text, calls onResult(null) and leaves focus on the input`                                             |

The input is one Tab stop and Clear is not (`tabindex="-1"`). Nothing here moves focus on its own: a pick, a search and a map that moves leave focus in the field (3.2.2). A key that is not in this table is left to the browser.

## Focus management

- Initial focus: not moved. A result, an error and the map moving never take focus.
- Trap: no. The popup is not modal, and Tab always leaves the input (2.1.2).
- Restore to: the input, which never lost focus. A pick, Clear and Escape keep it there.
- Never obscured by: the popup is placed under the Control and flips above it when there is no room (2.4.11).

## Announcements

| Event                                                       | Message key (i18n)                                                  | Politeness |
| ----------------------------------------------------------- | ------------------------------------------------------------------- | ---------- |
| Enter or Search with fewer than `minLength` characters      | `addressSearch.tooShort`                                            | polite     |
| A request is on its way (dropped if the answer comes first) | `addressSearch.searching`                                           | polite     |
| The answer has addresses                                    | `addressSearch.resultCount`                                         | polite     |
| The answer has none                                         | `addressSearch.noResults`                                           | polite     |
| The search fails or gets no answer in time                  | `addressSearch.error`                                               | polite     |
| The browser is offline when a search is sent                | `addressSearch.offline`                                             | polite     |
| A pick                                                      | `addressSearch.picked` (`pickedFilled` in a form, set per instance) | polite     |
| A pick with a map: when the view settles                    | `map.addressShown`                                                  | polite     |

Not announced: the active suggestion (the screen reader reads it through `aria-activedescendant`), typing, opening the list, and `clearResult()`. The status line is shown text, never a live region, so a message is not said twice.

### Read aloud

| State or action    | Expected phrase(s) as read aloud                                                                                                                                                        | Live region politeness | Test                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus on the field | `combobox, Find an address, Type a street and number, …, has popup listbox, not expanded, autocomplete in list, 1 control`, then `button, Search`                                       | none                   | `address-search.test.tsx › AddressSearch read aloud › focus: the field is read with its label, help text, privacy notice and state, then the Search button` |
| Typing             | nothing (the active suggestion is read through `aria-activedescendant`)                                                                                                                 | none                   | `address-search.test.tsx › AddressSearch read aloud › typing says nothing, and no request is sent`                                                          |
| Searching          | `polite: Searching for addresses`                                                                                                                                                       | polite                 | `address-search.test.tsx › AddressSearch read aloud › a slow search says it is searching`                                                                   |
| n results          | `polite: 2 addresses found`, then `option, Storgatan 1, 211 22 Malmö, not selected, position 1, set size 2` and the next <!-- kv-lang-ok: the Swedish address the test fixture uses --> | polite                 | `address-search.test.tsx › AddressSearch read aloud › Search says the count, and the list is read as options`                                               |
| Too short          | `polite: Type at least 3 characters to search.`                                                                                                                                         | polite                 | `address-search.test.tsx › AddressSearch read aloud › Search below minLength says what is missing`                                                          |
| No results         | `polite: No address found for “nowhere”. Check the spelling, or add the town.`                                                                                                          | polite                 | `address-search.test.tsx › AddressSearch read aloud › no address found says what to check`                                                                  |
| Error              | `polite: The address search isn’t working right now. Try again in a moment.`                                                                                                            | polite                 | `address-search.test.tsx › AddressSearch read aloud › an error says to try again`                                                                           |
| Offline            | `polite: You’re offline. Connect to the internet, then search again.`                                                                                                                   | polite                 | `address-search.test.tsx › AddressSearch read aloud › offline says to connect and search again`                                                             |
| Pick               | `polite: Chosen: <address label>.`                                                                                                                                                      | polite                 | `address-search.test.tsx › AddressSearch read aloud › a pick says which address was chosen`                                                                 |
| Pick with a map    | `polite: Chosen: <address label>.`, then `polite: The map shows the address. 0 places.`                                                                                                 | polite                 | `address-search.test.tsx › AddressSearch with a map › a pick with a map says which address was chosen, then that the map shows it`                          |
| Clear              | nothing                                                                                                                                                                                 | none                   | `address-search.test.tsx › AddressSearch read aloud › Clear says nothing`                                                                                   |

Each row has a named test using `readAloud` or `readAnnouncements` (`@kvirn-ui/testing/read-aloud`). The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording, and it does not prove modality or focus containment; that stays a component test.

## Consumer responsibilities

- **Name where the text goes.** The notice names the geocoder (`name`) and carries its `attribution`. Name the service in your privacy notice too (GDPR): the typed text and the visitor's IP address reach it.
- **Choose a geocoder that allows your use.** Set `suggest: true` only if its terms allow a request per pause in typing. A public Nominatim server does not.
- **Keep the boxes.** In a form, keep the address boxes editable and the search optional: a lookup can fail, and the visitor must be able to type the address (3.3.7).
- **Put the search where the result lands.** Before the map, or above the address boxes, in that reading order. Wrap it in `<search>` beside a map, and not inside a form.
- **Keep the list on the map.** The result pin is decoration; the map's list and details remain the way to reach places.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                             |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                   |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pending     | n/a         | pending | address-search.stories.tsx                        |
| Markup and ARIA (roles, names, ids, states)                                | pending     | n/a         | pending |                                                   |
| Keyboard contract rows (Vitest browser)                                    | pending     | n/a         | pending | address-search.test.tsx and autocomplete.test.tsx |
| Focus order and management                                                 | pending     | n/a         | pending |                                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending |                                                   |
| **Core (required for beta)**                                               |             |             |         |                                                   |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                   |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                   |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                   |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                   |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                   |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                   |

## Known issues

- **Review the translations before you launch.** Have a native speaker review the Swedish, Finnish, Norwegian Bokmål and Norwegian Nynorsk texts. <!-- kv-lang-ok: the language name Bokmål -->
- **"Chosen" may be heard twice.** Some screen readers also read the new value of the field. Check it with your users' assistive technology.
- **Test with your users and their assistive technology.**
