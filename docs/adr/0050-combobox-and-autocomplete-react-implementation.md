# ADR-0050: Combobox and Autocomplete share one hook, one input and the Listbox's popup parts, and a Control box anchors the popup

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Plan 0022, Phase 2 (the React binding of ADR-0037 items 4, 5, 9, 12, 13 and 14). The details below are proposed and open to change in review.
- **Tags:** architecture, api, a11y, i18n

## Context

ADR-0037 decides what Combobox and Autocomplete are, and the core (`createCombobox`, `filterItems`) and the Listbox exist. Building the React parts needed a few decisions that the ADR leaves open: how the two components share parts, where the popup anchors when there are buttons beside the input, what opens the popup, how the optional buttons behave on the keyboard, and how the controlled props and the announcements work.

## Decision

1. **One machine hook, two public hooks.** `useComboboxMachine` (internal) wraps `createCombobox` for both. `useCombobox` maps the value to a key or an array of keys and the text to `inputValue`. `useAutocomplete` maps the text to `value`, with `variant: 'autocomplete'`. Both return the same `UseComboboxResult`, so `Combobox.Root` and `Autocomplete.Root` render the same providers. The input's classes follow the variant (`kv-combobox-input`, `kv-autocomplete-input`), and so do Control, Toggle and Clear.
2. **The popup parts are the Listbox's, not copies.** `Popup`, `List`, `Option`, `Group`, `GroupLabel` and `Empty` are re-exported as `Combobox.*` and `Autocomplete.*`. Each Root provides the Listbox's `ListboxListContext`, which was general enough as it stands. Their classes stay `kv-listbox-*`, so the default theme adds no popup styles. Their dev warnings say "Listbox" where a Combobox is meant: acceptable for now, and the cost of one set of parts.
3. **`Combobox.Control` is an added optional part.** It is a `<div>` with no role around the input and its Toggle and Clear. The popup is placed against it (as wide as it) when it is there, and against the input when it is not, and a press on any of them is not "outside" for the dismiss layer. Without a wrapper the buttons couldn't sit inside the field's box, and `kv-input-group` is for plain inputs. The default theme draws the edge and ring on the Control, as it does for the input group.
4. **What opens the popup.** Typing, ArrowDown, ArrowUp, Alt+ArrowDown and the Toggle open it. **A click on the input does not**: the user may only want to place the caret, and the APG manual-selection example doesn't open on a click either. In Autocomplete, typing opens it only for text, and emptying the text closes it.
5. **Toggle and Clear are not tab stops** (`tabindex="-1"`), by ADR-0037's own wording ("not tab stops unless justified"). The justification: everything they do has a key (ArrowDown and Alt+ArrowDown open the list, and the text can be selected and deleted), and they stay in the accessibility tree, so touch screen readers and voice control reach them by name. A press on either keeps focus on the input (`mousedown` is cancelled, and `click` focuses the input), so Safari and Firefox behave like Chromium. Clear is rendered only while there is text or a value. In `multiple`, the remove buttons are normal tab stops before the input: they are the only keyboard way to remove a value, because Backspace in an empty input removes nothing.
6. **The value list** is a `<ul role="list">` named by the Field's label (the `role` is redundant on purpose: Safari drops list semantics when the theme removes the markers), rendered only while a value is chosen. The remove button's name is `combobox.removeValue` and it has no text, so the theme draws the cross with borders, which survive forced colours. After a removal focus goes to the next button, else the previous, else the input, in the commit after the list re-renders. A controlled parent that refuses the removal gets the chip and its focus back.
7. **Announcements.** The core's `announcement` data goes to the Announcer after `announcementDebounceMilliseconds` (500 by default, a public option so a slow server or a test can change it). The timer restarts on every change of the text, so nothing is said while typing even when the count doesn't change. Without a `KvirnProvider` nothing is announced and one dev warning says so.
8. **Loading.** While `isLoading`, an empty list shows `combobox.loading` in `Combobox.Empty` instead of "No results", and the popup has `data-loading`. A list that still has options keeps showing them.
9. **Controlled props pull back.** `value`, `inputValue` and `open` follow the page, and a change that the parent refuses is put back (`syncCount`, as in `useListbox`). The text from outside never opens the popup, and showing a new value changes the text without reporting it. `onValueChange` reasons: `option-press`, `key`, `input` (the text no longer names the chosen option), `remove`, `clear`. `onInputValueChange` reasons are the core's: `input`, `selection`, `clear`. `onOpenChange` reasons add `toggle-press` and `clear` to the Listbox's.
10. **Keys during composition.** `keydown` with `isComposing` is left to the IME, so Enter in a composition doesn't choose an option.
11. **Forms.** A Combobox puts hidden inputs for its keys in the form and never sends the text. An Autocomplete puts its `name` on the input, because the text is the value. `autocomplete="off"` is the default on the input (the browser's list would compete with ours), and the consumer's own `autoComplete` replaces it.
12. **An open popup with nothing to show draws nothing** (an Autocomplete with no suggestions and no `Empty`): the theme hides a `kv-listbox-popup` with no option, no group and no Empty text. The popup is the role-less shell and the List is the listbox (ADR-0037, implementation note 1), so `Empty` is plain text and the popup measures and places itself as before. The count or "No results" is still announced.
13. **Caret keys clear the active option.** Home, End, ArrowLeft and ArrowRight (with or without Shift or Control, never with Alt) in the text field clear the active option, so `aria-activedescendant` goes and visual focus is back in the field, as the APG says. The key is never cancelled: the caret moves natively. This is in the core (`createCombobox`, editable modes), so Combobox and Autocomplete both get it.
14. **Collapsed when there is nothing to move into.** `aria-expanded` is `false` while there is no option and nothing is loading (the popup may still show the Empty text, and the List is `hidden`). Opening with a key or the Toggle doesn't announce a count, because the list didn't change: a count is said for typing, and "no results" and "loading" are always said.
15. **Theme.** The input looks like `kv-input`. Toggle and Clear fill the Control's height (44px, 32px compact), the remove buttons are 44px square, the chevron and the crosses are drawn with borders, and no new token is added.

## Consequences

- Positive: one hook, one set of tests for the keys and the announcements, and a popup that is styled once. Combobox and Autocomplete differ only in their value.
- Negative / trade-offs:
  - `Combobox.Control` is an addition to ADR-0037's part list.
  - Dev warnings from the shared popup parts name the Listbox.
  - A click on the input doesn't open the list, which some users expect. The Toggle and ArrowDown are the ways, and a later change is a one-line one.
  - Non-tab-stop buttons are reached on touch by swiping and by name, not with Tab. The AT matrix has to confirm that this is enough.
  - The controlled `inputValue` plus a chosen `value` must agree: the docs say to set it to the chosen option's text.
- Follow-ups: virtualization (`aria-setsize`, `aria-posinset`), a design review of the chips and the Control, and the manual AT run (NVDA, JAWS, VoiceOver, TalkBack, Dragon).

## Validation

- Component tests (`combobox.test.tsx`, `autocomplete.test.tsx`): roles and wiring, `aria-activedescendant` always pointing at a rendered option, every key, filtering with å, ä and ö, the text never cleared, the value list and its focus rules, hidden inputs and `FormData`, controlled and refused changes, announcements, axe in each state, and server rendering.
- e2e (`combobox.e2e.ts`, `autocomplete.e2e.ts`): one test per Keyboard row, and the forced-colors, reduced-motion, 320px and right-to-left checks.
- Manual AT (pending): see the AT record in each contract.

## References

- ADR-0037, ADR-0046, ADR-0039, ADR-0040, ADR-0029, ADR-0007
- WAI-ARIA APG: Editable Combobox With List Autocomplete
