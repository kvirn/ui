# ADR-0037: Listbox, Combobox and Autocomplete share one ARIA 1.2 combobox core, with opt-in virtualization

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a combobox, a select and an autocomplete, with virtualization. Revised the same day: `NativeSelect` is dropped and becomes `Listbox` (a stylable list that uses the native `<select>` on touch devices). The details below are proposed and open to change.
- **Tags:** architecture, api, a11y, i18n

## Context

Choosing from a list is in almost every e-service: a municipality, a country, an occupation code, a school, a street. The roadmap has Listbox and Select in M2 and Combobox in M3. Vision principle 7 says Combobox is built from Popover, Listbox and Field.

"Combobox", "select" and "autocomplete" are used loosely. This ADR fixes what each one is:

| Component        | The user                           | The value                         | APG pattern                     |
| ---------------- | ---------------------------------- | --------------------------------- | ------------------------------- |
| **Listbox**      | picks from a list, can't type text | one of the options (or several)   | Select-Only Combobox            |
| **Combobox**     | types to filter, then picks        | one (or several) of the options   | Combobox with list autocomplete |
| **Autocomplete** | types free text, gets suggestions  | the text, which may match nothing | Combobox with list autocomplete |

Known failures in this area: the ARIA 1.0 and 1.1 combobox structures, `aria-activedescendant` pointing at an option that isn't rendered (virtualized lists), filtering that silently clears what the user typed, result counts that are never announced, matching that treats å, ä and ö as a and o, and custom selects that replace the native `<select>` on touch devices, where the platform picker serves users better.

## Decision drivers

- Native first (hard rule 2): on touch devices a single-choice Listbox renders a native `<select>`. Everywhere else the popup is ours, so it can be styled (rich options, groups, virtualization).
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
- ❌ Can't show rich options, can't be virtualized, and can't filter. Used only as the touch rendering of a single-choice Listbox (Decision item 2), not as a separate component.

## Decision

We will use Option A:

1. **Core.** `createListbox` (options, active index, selection, typeahead) and `createCombobox` on top of it (open state, input value, mode: `select`, `combobox` or `autocomplete`). Both are pure and live in `core`. Positioning comes from Popover (M2) and dismissal from DismissableLayer (M1). They aren't decided here.
2. **Listbox replaces NativeSelect.** The existing `NativeSelect` is renamed and rebuilt as `Listbox` (a breaking change, accepted pre-release, with a changeset). One component, two renderings of the same API (`value`, `onValueChange`, `items`, `itemToString`, `itemToKey`, groups, disabled items):
   - **Native rendering**: a `<select>` wired by Field (`<label for>`, `aria-describedby`, `aria-invalid`), with `<optgroup>` and `<option>`. Used when `native="auto"` (the default) and the primary pointer is coarse (`(pointer: coarse)`), for single choice only, and always for `native="always"`. It shows plain text labels only: rich option content, virtualization and `Listbox.Empty` don't apply, and the docs say so. `<select multiple>` is never used.
   - **Custom rendering**: the select-only combobox below. Used for `native="never"`, for `multiple`, for rich options, and on non-touch devices under `auto`.
   - SSR and hydration: the server and the first client render use the custom rendering, and `auto` switches after mount (the pointer is read once in an effect, the state starts as `false`), so there's no hydration mismatch. The switch only happens before the user interacts: nothing listens for a later change of `(pointer: coarse)`, because a rendering that swapped under the user would drop their focus to the page. Docs warn that a touch device sees one frame of the custom trigger, and recommend `native="always"` when that matters.
   - A change of rendering keeps `value`. Open state is closed when the rendering changes.
   - `kv-native-select` is renamed `kv-listbox-native`. Docs still recommend CheckboxGroup for up to about 15 multiple choices.
3. **Listbox, custom rendering** (select-only combobox):
   - `Listbox.Trigger` is a `<div role="combobox" tabindex="0">` per the APG example, with `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, and `aria-labelledby` to the Field label, since `<label for>` doesn't name a `<div>`. Clicking the label focuses the trigger.
   - `Listbox.Value` shows the selected option's label, or `Listbox.Placeholder` (consumer text, never the only label).
   - Selection doesn't follow focus: Enter, Tab or a click selects.
4. **Combobox** (editable, value from the list):
   - `Combobox.Input` is a native `<input role="combobox" aria-autocomplete="list">`, named by `<label for>`. DOM focus stays on the input.
   - No option is highlighted until the user presses ArrowDown or ArrowUp, so Enter in the input never picks something the user didn't choose.
   - **Typed text is never cleared or replaced silently.** If the user leaves the input with text that matches no option, the text stays and the value stays `null`. `onInputValueChange` reports the text, and the consumer's validation says "Choose an option from the list". When the user selects an option, the input shows its label.
   - `multiple`: the listbox gets `aria-multiselectable="true"` and stays open after each choice. Chosen values are shown before the input as a list (`<ul>`), each with a remove button named `combobox.removeValue` ("Remove Stockholm"). Backspace in an empty input doesn't remove values. After a removal, focus goes to the next remove button, else the previous one, else the input.
5. **Autocomplete** (free text with suggestions): the same input as Combobox. The value is the text. Picking a suggestion fills the input. Suggestions never block submitting other text. It's for search fields and addresses, where the list helps but isn't the answer.
6. **No inline completion** (`aria-autocomplete="both"`) for now. Text inserted and selected after the caret confuses dictation and voice control and some screen readers. A later ADR can add it.
7. **Options.** The popup parts are shared by Listbox, Combobox and Autocomplete: `Listbox.Popup`, `Listbox.Option` (`role="option"`, `aria-selected`, `aria-disabled`), `Listbox.Group` (`role="group"`, `aria-labelledby` to `Listbox.GroupLabel`) and `Listbox.Empty`. Disabled options stay reachable by arrows and can't be selected (keyboard skill, rule 5). Items are generic (`TItem`), with `itemToString` and `itemToKey`, and the types are inferred.
8. **Keyboard.** As in the key tables for select-only and editable combobox, with these choices recorded in each contract:
   - Arrows don't wrap. Page Up and Page Down move ten options. Home and End go to the first and last option in Listbox. In Combobox and Autocomplete they move the caret in the input.
   - Typeahead in Listbox matches the start of the label, with the same locale-aware matching as item 10.
   - Escape closes the popup and keeps the value and the typed text. A second Escape doesn't clear the input: losing typed text is worse than an extra key.
   - Tab in Listbox selects the active option and moves on (APG). Tab in Combobox and Autocomplete closes the popup without selecting.
   - Alt+ArrowDown opens without moving the active option. Alt+ArrowUp selects and closes.
9. **Announcements** through the shared Announcer, debounced (about 500 ms after typing stops): `combobox.resultCount` ("5 results", plural), `combobox.noResults` and `combobox.loading`. Nothing is announced while the user types, and the active option isn't announced by us (the screen reader reads it through `aria-activedescendant`).
10. **Filtering.** The default filter matches anywhere in the label, using `Intl.Collator` with the provider's locale and `sensitivity: "base"`. So å, ä and ö stay distinct letters in sv and fi, and other accents are ignored where the locale allows. Consumers can replace the filter, or filter on the server and pass `isLoading`. Debouncing and fetching are the consumer's.
11. **Virtualization** with the `virtualizer` prop on `Listbox.Root` (ADR-0034):
    - Every rendered option has `aria-setsize` (the number of options after filtering) and `aria-posinset`.
    - The active option and the selected option are always rendered. When the active index moves to an option that isn't rendered, the binding scrolls to it and sets `aria-activedescendant` only once it's in the DOM.
    - Page Up, Page Down, Home, End and typeahead work on the item list, not the DOM.
    - A virtualized list is flat: groups and virtualization aren't combined, because a partly rendered `role="group"` gives wrong group information. The group name can go in the option's description instead.
12. **Form integration** (ADR-0029). `value`, `defaultValue`, `onValueChange`, and for Combobox and Autocomplete `inputValue` and `onInputValueChange`. With `name`, Listbox and Combobox render a hidden `<input type="hidden">` per value, so a plain `<form>` and `FormData` work. `invalid`, `required` and `disabled` come from Field.
13. **Popup.** Not modal, and no focus trap. The popup has a maximum height and scrolls inside a ScrollArea Viewport (ADR-0036, without its own tab stop because focus stays on the combobox). It never covers its own input (2.4.11). At 320px, it's as wide as the input or wider, never narrower.
14. **Styling hooks.** Classes `kv-select-trigger`, `kv-select-value`, `kv-combobox-input`, `kv-listbox`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label`, `kv-listbox-empty`, `kv-combobox-value-list`, `kv-native-select`. State as `data-open`, `data-active`, `data-selected`, `data-disabled`, `data-placeholder`. The active option has a visible indicator that isn't only colour and that works in forced colours (2.4.7 with `aria-activedescendant`).

## Accessibility impact

- 4.1.2: ARIA 1.2 combobox structure. Listbox's trigger is named with `aria-labelledby`, and the inputs with `<label for>`.
- 2.1.1, 2.4.3, 2.4.7: APG keys. Focus stays on the combobox, and the active option is always rendered and visibly marked.
- 4.1.3: result count, no results and loading are announced, debounced, with strings from i18n.
- 3.2.2: choosing doesn't submit or move focus outside the component.
- 3.3.1, 3.3.3: unmatched text is kept and reported, not silently dropped.
- 1.3.1: `aria-setsize` and `aria-posinset` keep the list size known when virtualized.
- APG choices that are allowed by the pattern and recorded here: no wrap, a second Escape doesn't clear, Tab doesn't select in the editable modes. Those aren't deviations. No inline completion. A `div` trigger for the custom Listbox, as in the APG example.
- VoiceOver and TalkBack have known gaps with `aria-activedescendant`, especially in virtualized lists. The manual AT run must cover them before `beta`.

## Consequences

- Positive: three components with one tested core. A native option first, and long lists that stay accessible.
- Negative / trade-offs:
  - Listbox (M2) depends on Popover and the dismiss layer (ADR-0046). Combobox and Autocomplete (M3) also depend on ScrollArea.
  - Two renderings to test and document. Touch devices get a different look (the platform picker) than desktop, by design.
  - Renaming `NativeSelect` breaks its few call sites (stories, docs, `field` examples), which the plan updates.
  - Groups can't be virtualized.
  - i18n keys to add in all six locales: `combobox.resultCount`, `combobox.noResults`, `combobox.loading`, `combobox.removeValue`, `combobox.clear`, `combobox.showOptions` (the name of the optional open button).
- Follow-ups: plans and contracts (`listbox.a11y.md` (covers both renderings), `combobox.a11y.md`, `autocomplete.a11y.md`), and a design spec for the trigger, the popup, the active and selected look, and the value list. Roadmap rows: replace "Listbox, Select" with "Listbox" and add Autocomplete (M3).

## Implementation notes (Listbox custom rendering, Plan 0022 Phase 2)

Details settled while building `Listbox.Root`, `useListbox` and the shared popup parts. They stay inside the decision above and are open to change in review.

1. **`Listbox.Popup` is the role-less shell, and `Listbox.List` is the `role="listbox"` and the scroller.** The popup is `<div popover="manual">`: the element with the `popover` attribute, the placement, the maximum height, the edge and the shadow. The List inside it is `<div role="listbox">` with an `id` (the target of `aria-controls`), `aria-multiselectable` when `multiple`, and the Field's label (`aria-labelledby`) or the consumer's `aria-label` as its name. It is the part with `overflow-y: auto`, so axe's exemption for a scrolling combobox popup (`aria-controls` from a `role="combobox"`) from `scrollable-region-focusable` applies and it scrolls without a tab stop of its own (item 13). `Listbox.Empty` is plain text with no role, rendered as a sibling of the List inside the popup, so it is never an option and never inside the listbox (an earlier draft made it a disabled `role="option"` to satisfy `aria-required-children`, which screen readers read as "option 1 of 1"). While the popup is open with no option the List is `hidden` (it stays in the DOM, so `aria-controls` is valid) and has `data-empty`, and Combobox and Autocomplete report `aria-expanded="false"` unless they are loading. A popup with no option, no group and no Empty draws nothing. `Popup`, `List`, `Option`, `Group`, `GroupLabel` and `Empty` read one `ListboxListContext` (`packages/react/src/listbox/listbox-context.ts`), so `Combobox.Root` can provide the same context and reuse them.
2. **Options render only while the popup is open.** The popup and the List are always in the DOM (so `aria-controls` points at an element), and `Listbox.List` renders no options while it is closed. The chosen option is scrolled into view when the popup opens, and the active option when a key moves it (not when the pointer does, since it is already under it).
3. **Focus never leaves the trigger.** `mousedown` in the popup is cancelled, so a press on an option, the padding or the scrollbar keeps focus. Losing focus any other way closes the popup (`reason: 'blur'`). Clicking the Field's label focuses the trigger through a listener on the label's element, because `<label for>` does not name a `<div>`.
4. **The trigger's name is the Field's label followed by the value** (`aria-labelledby="<label id> <value id>"`), as in React Aria's select. A consumer's own `aria-label` or `aria-labelledby` wins. Disabled: no `tabindex`, `aria-disabled="true"`.
5. **The value is a key.** Single: `string | null`. Multiple: `string[]`, in the order chosen. The props are two types (`UseListboxSingleOptions`, `UseListboxMultipleOptions`) joined by the `multiple` flag, so `onValueChange` is typed per mode. `value` and `open` are controlled by the page: the machine in `core` follows them, and a parent that refuses a change gets the old state back. Changing `multiple` builds a new machine and keeps the choice. `items` is read when a new array arrives, so a change in `isItemDisabled`, `itemToString` or `itemToKey` needs a new `items`.
6. **`name` gives hidden inputs.** One per chosen key, after the Root's children. A single choice sends `''` when nothing is chosen, so the field is always present, like a native select with an empty option. None when disabled, and none in the native rendering, where the `<select>` carries the name.
7. **Native rendering** is an internal `<select>` component (`listbox-native.tsx`, not exported) that `Listbox.Root` renders, chosen by reading `(pointer: coarse)` once, in an effect after mount (the state starts as `false`, so the server and the first client render are the popup, and a later change of the pointer never swaps the rendering). It gets an empty `<option value="">` while nothing is chosen, or when a `placeholder` is set, so the select's value matches the state. Choosing the empty option reports `null`. `native="always"` with `multiple` renders the popup and warns in development. `Listbox.Empty`, rich option content and the popup parts do not exist in the native rendering. The open state is closed when the rendering switches.
8. **No announcements** for the Listbox: `createCombobox` in `'listbox'` mode never produces one, the list does not change while it is open, and the screen reader reads the active option through `aria-activedescendant`.
9. **NativeSelect became Listbox, with no public native part.** `NativeSelect`, `useNativeSelect` and their types are removed (breaking, with a changeset): the native `<select>` is only reachable as the rendering of `Listbox.Root` (`native="always"`, or `"auto"` on touch devices). The internal component and hook keep their tests. `useListbox` and `UseListboxOptions` are the popup's. Stories: one group, `Components/Form/Listbox`, with the native rendering in the stories named `Native…`.
10. **Class names.** Item 14 predates the rename of Select to Listbox. The classes are `kv-listbox-trigger` (not `kv-select-trigger`), `kv-listbox-value` (not `kv-select-value`), `kv-listbox-popup` (not `kv-listbox`, which would read as the whole component), `kv-listbox-list`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label` and `kv-listbox-empty`. The state attributes are as in item 14.
11. **Default theme.** The trigger draws its chevron with `::after` (the native select keeps its gradients), the popup uses level 3 elevation, the `xl` radius and 8px padding, options are at least `--kv-control-min-block-size` high (44px, 32px compact), the active option has a 4px inline-start bar and a tinted fill, and the chosen option a tick. In forced colours the active option becomes `Highlight` with `HighlightText`. No new token.

## Validation

- Unit tests on `createListbox` and `createCombobox`: modes, active index, typeahead and filtering with sv, fi and en text (å, ä, ö).
- Component tests: roles, `aria-controls`, `aria-activedescendant` always pointing at a rendered option, `aria-setsize` and `aria-posinset`, hidden inputs, announcements, and axe in every state.
- e2e: every row in each Keyboard table, with RTL rows, a 10 000-option virtualized list (End, Page Down, typeahead), and the forced-colors, reduced-motion and 320px projects.
- Manual AT (pending): NVDA, JAWS, VoiceOver (macOS and iOS), TalkBack and Dragon with Listbox (native and custom), Combobox and Autocomplete, with and without virtualization.

## References

- WAI-ARIA APG: Combobox pattern, Select-Only Combobox example, Editable Combobox with List Autocomplete example, Listbox pattern
- WAI-ARIA 1.2: `combobox`, `aria-activedescendant`, `aria-setsize`, `aria-posinset`
- Sarah Higley, "Select your poison" (2019 and 2023)
- GOV.UK Design System: Select, and the accessible-autocomplete component
- ADR-0007, ADR-0009, ADR-0029, ADR-0039 (keyboard), ADR-0034, ADR-0036
