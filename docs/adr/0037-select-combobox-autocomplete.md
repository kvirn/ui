# ADR-0037: Select, Combobox and Autocomplete share one ARIA 1.2 combobox core, with opt-in virtualization

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a combobox, a select and an autocomplete, with virtualization. The details below are proposed and open to change.
- **Tags:** architecture, api, a11y, i18n

## Context

Choosing from a list is in almost every e-service: a municipality, a country, an occupation code, a school, a street. The roadmap has Listbox and Select in M2 and Combobox in M3. Vision principle 7 says Combobox is built from Popover, Listbox and Field.

"Combobox", "select" and "autocomplete" are used loosely. This ADR fixes what each one is:

| Component        | The user                           | The value                         | APG pattern                     |
| ---------------- | ---------------------------------- | --------------------------------- | ------------------------------- |
| **Select**       | picks from a list, can't type text | one of the options                | Select-Only Combobox            |
| **Combobox**     | types to filter, then picks        | one (or several) of the options   | Combobox with list autocomplete |
| **Autocomplete** | types free text, gets suggestions  | the text, which may match nothing | Combobox with list autocomplete |

Known failures in this area: the ARIA 1.0 and 1.1 combobox structures, `aria-activedescendant` pointing at an option that isn't rendered (virtualized lists), filtering that silently clears what the user typed, result counts that are never announced, matching that treats å, ä and ö as a and o, and custom selects used where a native `<select>` would serve users better, especially on touch devices.

## Decision drivers

- Native first (hard rule 2): a styled native `<select>` is the first recommendation.
- ARIA 1.2 combobox: `role="combobox"` on the focusable element, `aria-controls` to the listbox, `aria-activedescendant` for the active option (keyboard skill, rule 2).
- Long lists (thousands of options) stay fast and keyboard-reachable (ADR-0034).
- No form state (ADR-0029): value in, changes out.
- Locale-aware matching for sv, fi, nb, nn, se and en.

## Options considered

### Option A: one core machine, three thin components (chosen)

- ✅ One set of keyboard, announcement and virtualization behaviour, tested once.
- ✅ Each component has a small, clear API for its own use.
- ❌ The core machine has modes, which must stay well tested.

### Option B: one `Combobox` with `editable` and `freeText` flags

- ✅ One component.
- ❌ Flags change the role, keys and value type, which is hard to type and to document. Rejected.

### Option C: Select only as a styled native `<select>`

- ✅ The most robust and best on touch.
- ❌ Can't show rich options, can't be virtualized, and can't filter. Kept as `NativeSelect`, and as the first recommendation.

## Decision

We will use Option A:

1. **Core.** `createListbox` (options, active index, selection, typeahead) and `createCombobox` on top of it (open state, input value, mode: `select`, `combobox` or `autocomplete`). Both are pure and live in `core`. Positioning comes from Popover (M2) and dismissal from DismissableLayer (M1). They aren't decided here.
2. **NativeSelect.** A native `<select>` wired by Field, with the `kv-native-select` class for the default theme. Docs recommend it first, for short lists and touch-heavy services. For multiple choices, docs recommend CheckboxGroup for up to about 15 options, never `<select multiple>`.
3. **Select** (select-only combobox):
   - `Select.Trigger` is a `<div role="combobox" tabindex="0">` per the APG example, with `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, and `aria-labelledby` to the Field label, since `<label for>` doesn't name a `<div>`. Clicking the label focuses the trigger.
   - `Select.Value` shows the selected option's label, or `Select.Placeholder` (consumer text, never the only label).
   - Selection doesn't follow focus: Enter, Tab or a click selects.
4. **Combobox** (editable, value from the list):
   - `Combobox.Input` is a native `<input role="combobox" aria-autocomplete="list">`, named by `<label for>`. DOM focus stays on the input.
   - No option is highlighted until the user presses ArrowDown or ArrowUp, so Enter in the input never picks something the user didn't choose.
   - **Typed text is never cleared or replaced silently.** If the user leaves the input with text that matches no option, the text stays and the value stays `null`. `onInputValueChange` reports the text, and the consumer's validation says "Choose an option from the list". When the user selects an option, the input shows its label.
   - `multiple`: the listbox gets `aria-multiselectable="true"` and stays open after each choice. Chosen values are shown before the input as a list (`<ul>`), each with a remove button named `combobox.removeValue` ("Remove Stockholm"). Backspace in an empty input doesn't remove values. After a removal, focus goes to the next remove button, else the previous one, else the input.
5. **Autocomplete** (free text with suggestions): the same input as Combobox. The value is the text. Picking a suggestion fills the input. Suggestions never block submitting other text. It's for search fields and addresses, where the list helps but isn't the answer.
6. **No inline completion** (`aria-autocomplete="both"`) for now. Text inserted and selected after the caret confuses dictation and voice control and some screen readers. A later ADR can add it.
7. **Options.** `Listbox.Option` (`role="option"`, `aria-selected`, `aria-disabled`), `Listbox.Group` (`role="group"`, `aria-labelledby` to `Listbox.GroupLabel`) and `Listbox.Empty`. Disabled options stay reachable by arrows and can't be selected (keyboard skill, rule 5). Items are generic (`TItem`), with `itemToString` and `itemToKey`, and the types are inferred.
8. **Keyboard.** As in the key tables for select-only and editable combobox, with these choices recorded in each contract:
   - Arrows don't wrap. Page Up and Page Down move ten options. Home and End go to the first and last option in Select. In Combobox and Autocomplete they move the caret in the input.
   - Typeahead in Select matches the start of the label, with the same locale-aware matching as item 10.
   - Escape closes the popup and keeps the value and the typed text. A second Escape doesn't clear the input: losing typed text is worse than an extra key.
   - Tab in Select selects the active option and moves on (APG). Tab in Combobox and Autocomplete closes the popup without selecting.
   - Alt+ArrowDown opens without moving the active option. Alt+ArrowUp selects and closes.
9. **Announcements** through the shared Announcer, debounced (about 500 ms after typing stops): `combobox.resultCount` ("5 results", plural), `combobox.noResults` and `combobox.loading`. Nothing is announced while the user types, and the active option isn't announced by us (the screen reader reads it through `aria-activedescendant`).
10. **Filtering.** The default filter matches anywhere in the label, using `Intl.Collator` with the provider's locale and `sensitivity: "base"`. So å, ä and ö stay distinct letters in sv and fi, and other accents are ignored where the locale allows. Consumers can replace the filter, or filter on the server and pass `isLoading`. Debouncing and fetching are the consumer's.
11. **Virtualization** with the `virtualizer` prop on `Listbox.Root` (ADR-0034):
    - Every rendered option has `aria-setsize` (the number of options after filtering) and `aria-posinset`.
    - The active option and the selected option are always rendered. When the active index moves to an option that isn't rendered, the binding scrolls to it and sets `aria-activedescendant` only once it's in the DOM.
    - Page Up, Page Down, Home, End and typeahead work on the item list, not the DOM.
    - A virtualized list is flat: groups and virtualization aren't combined, because a partly rendered `role="group"` gives wrong group information. The group name can go in the option's description instead.
12. **Form integration** (ADR-0029). `value`, `defaultValue`, `onValueChange`, and for Combobox and Autocomplete `inputValue` and `onInputValueChange`. With `name`, Select and Combobox render a hidden `<input type="hidden">` per value, so a plain `<form>` and `FormData` work. `invalid`, `required` and `disabled` come from Field.
13. **Popup.** Not modal, and no focus trap. The popup has a maximum height and scrolls inside a ScrollArea Viewport (ADR-0036, without its own tab stop because focus stays on the combobox). It never covers its own input (2.4.11). At 320px, it's as wide as the input or wider, never narrower.
14. **Styling hooks.** Classes `kv-select-trigger`, `kv-select-value`, `kv-combobox-input`, `kv-listbox`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label`, `kv-listbox-empty`, `kv-combobox-value-list`, `kv-native-select`. State as `data-open`, `data-active`, `data-selected`, `data-disabled`, `data-placeholder`. The active option has a visible indicator that isn't only colour and that works in forced colours (2.4.7 with `aria-activedescendant`).

## Accessibility impact

- 4.1.2: ARIA 1.2 combobox structure. Select's trigger is named with `aria-labelledby`, and the inputs with `<label for>`.
- 2.1.1, 2.4.3, 2.4.7: APG keys. Focus stays on the combobox, and the active option is always rendered and visibly marked.
- 4.1.3: result count, no results and loading are announced, debounced, with strings from i18n.
- 3.2.2: choosing doesn't submit or move focus outside the component.
- 3.3.1, 3.3.3: unmatched text is kept and reported, not silently dropped.
- 1.3.1: `aria-setsize` and `aria-posinset` keep the list size known when virtualized.
- APG choices that are allowed by the pattern and recorded here: no wrap, a second Escape doesn't clear, Tab doesn't select in the editable modes. Those aren't deviations. No inline completion. A `div` trigger for Select, as in the APG example.
- VoiceOver and TalkBack have known gaps with `aria-activedescendant`, especially in virtualized lists. The manual AT run must cover them before `beta`.

## Consequences

- Positive: three components with one tested core. A native option first, and long lists that stay accessible.
- Negative / trade-offs:
  - Select (M2) depends on Listbox, Popover and DismissableLayer. Combobox and Autocomplete (M3) also depend on ScrollArea.
  - Groups can't be virtualized.
  - i18n keys to add in all six locales: `combobox.resultCount`, `combobox.noResults`, `combobox.loading`, `combobox.removeValue`, `combobox.clear`, `combobox.showOptions` (the name of the optional open button).
- Follow-ups: plans and contracts (`listbox.a11y.md`, `select.a11y.md`, `combobox.a11y.md`, `autocomplete.a11y.md`), and a design spec for the trigger, the popup, the active and selected look, and the value list. Roadmap rows: add NativeSelect (M1) and Autocomplete (M3).

## Validation

- Unit tests on `createListbox` and `createCombobox`: modes, active index, typeahead and filtering with sv, fi and en text (å, ä, ö).
- Component tests: roles, `aria-controls`, `aria-activedescendant` always pointing at a rendered option, `aria-setsize` and `aria-posinset`, hidden inputs, announcements, and axe in every state.
- e2e: every row in each Keyboard table, with RTL rows, a 10 000-option virtualized list (End, Page Down, typeahead), and the forced-colors, reduced-motion and 320px projects.
- Manual AT (pending): NVDA, JAWS, VoiceOver (macOS and iOS), TalkBack and Dragon with Select, Combobox and Autocomplete, with and without virtualization.

## References

- WAI-ARIA APG: Combobox pattern, Select-Only Combobox example, Editable Combobox with List Autocomplete example, Listbox pattern
- WAI-ARIA 1.2: `combobox`, `aria-activedescendant`, `aria-setsize`, `aria-posinset`
- Sarah Higley, "Select your poison" (2019 and 2023)
- GOV.UK Design System: Select, and the accessible-autocomplete component
- ADR-0007, ADR-0009, ADR-0029, ADR-0039 (keyboard), ADR-0034, ADR-0036
