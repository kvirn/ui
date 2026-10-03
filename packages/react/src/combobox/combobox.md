# Combobox

> **Draft** (Plan 0022). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [combobox.a11y.md](combobox.a11y.md), and the decisions are in the overlays-and-lists skill.

Choosing one option from a long list, or several, by typing to filter it. The user types a few letters, the list shrinks to what contains them, and they choose with the arrow keys and Enter, or with a press. The value is one of the options, never the text.

Use a Combobox when the list is too long to scan, about 15 options or more: a municipality, a country, an occupation code, a school. For a short list use a Listbox (or a RadioGroup, which shows every choice at once). When the answer is free text and the list only suggests, use an Autocomplete.

## How it works

```tsx
import { Combobox, Field, Label } from '@kvirn-ui/react'

interface Municipality {
  code: string
  name: string
}

;<Field required>
  <Label>Kommun</Label>
  <Combobox.Root
    items={municipalities}
    itemToString={(municipality) => municipality.name}
    itemToKey={(municipality) => municipality.code}
    value={code}
    onValueChange={setCode}
    name="municipality"
  >
    <Combobox.Control>
      <Combobox.Input />
      <Combobox.Clear />
      <Combobox.Toggle />
    </Combobox.Control>
    <Combobox.Popup>
      <Combobox.List>
        {(municipality: Municipality) => <Combobox.Option item={municipality} />}
      </Combobox.List>
      <Combobox.Empty />
    </Combobox.Popup>
  </Combobox.Root>
</Field>
```

- **Put the input in a `Combobox.Control` with a `Combobox.Toggle` and a `Combobox.Clear`.** That is the default way to build it: a bare input looks like a plain text field, and a click on it opens nothing, so a user who doesn't know to type has no sign that there is a list. The Toggle (a chevron) says there is one and opens it. A bare `Combobox.Input` is the minimal variant, for when the question itself says to type.
- **DOM focus stays on the input.** The input is a native `<input role="combobox">`, named by the Field's label, and the highlighted option is `aria-activedescendant`. Opening never moves focus.
- **No option is highlighted until the user presses ArrowDown or ArrowUp.** So Enter never chooses something the user didn't move to. With nothing highlighted, Enter keeps its native meaning and a form can submit.
- **The typed text is never cleared silently.** Text that matches no option stays in the field and the value is `null`. Say what to do in your own validation ("Välj ett alternativ i listan"). Choosing an option puts its text in the input, and only the Clear button empties it (with several choices it empties the typed text only).
- **Typing never moves focus or changes the page.** The popup opens and the list filters, and that is all.
- **The result count is announced** ("5 resultat"), once the user has stopped typing, and so are "no results" and "loading". The highlighted option is never announced by KvirnUI: the screen reader reads it. This needs a `KvirnProvider`, which renders the live regions.

## Root

`Combobox.Root` renders no element of its own (it renders hidden inputs after its children). Props:

| Prop                                                    | What it does                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                                                 | A flat list of any item type. Pass a new array when the items, or what `isItemDisabled` says about them, change, and memoize it when you build it in render.                                                                                                                                                                                                              |
| `groups`                                                | Items in named groups: `{ key, label, items }`. Flat: groups don't nest. A group with no match is left out while filtering.                                                                                                                                                                                                                                               |
| `itemToString`, `itemToKey`                             | The text of an item (shown, matched by the filter, put in the input when chosen), and its unique key (what the value holds). Defaults: `String(item)`, and the text.                                                                                                                                                                                                      |
| `isItemDisabled`                                        | Disabled options stay reachable with the arrow keys, are read as unavailable, and can't be chosen.                                                                                                                                                                                                                                                                        |
| `value`, `defaultValue`, `onValueChange`                | A key or `null`, or with `multiple` an array of keys. `onValueChange(value, { reason })` has the reason `'option-press'`, `'key'`, `'input'` (the text no longer names the chosen option), `'remove'` or `'clear'`. It only reports: a parent that keeps the old value when told `null` gets the chosen text put back, so apply `null` to let the user type a new search. |
| `inputValue`, `defaultInputValue`, `onInputValueChange` | The text. Uncontrolled by default: it shows the chosen option's text. Control it when you need the text, and set it to the chosen option's text while a value is chosen. `onInputValueChange(text, { reason })`: `'input'`, `'selection'` or `'clear'`.                                                                                                                   |
| `multiple`                                              | Several choices. The popup stays open after a choice, the text is emptied, and each chosen value is a remove button in `Combobox.ValueList`.                                                                                                                                                                                                                              |
| `filter`, `isLoading`                                   | Your own filter, or `filter={false}` for results that the server has filtered, with `isLoading` while it works. The default matches anywhere in the text, in the provider's locale.                                                                                                                                                                                       |
| `name`                                                  | One `<input type="hidden">` per chosen key, so a plain `<form>` and `FormData` work. A single choice sends `''` when nothing is chosen. The typed text is never sent. None when disabled.                                                                                                                                                                                 |
| `disabled`, `id`                                        | `disabled` (a disabled Field disables it too), and the input's id outside a Field.                                                                                                                                                                                                                                                                                        |
| `open`, `defaultOpen`, `onOpenChange`                   | The popup's state. `onOpenChange(open, { reason })`: `'input'`, `'key'`, `'escape'`, `'toggle-press'`, `'option-press'`, `'outside-press'`, `'blur'`, `'light-dismiss'` or `'clear'`.                                                                                                                                                                                     |
| `placement`, `offset`, `padding`                        | Where the popup goes (default `'bottom-start'`, 4px gap, 8px from the viewport's edge). It is as wide as the input (or its Control), flips when there is no room and scrolls inside.                                                                                                                                                                                      |
| `virtualize`                                            | `true`, or `{ estimateSize, overscan }`: renders only the options in view, for a flat list of thousands. Off by default. See Long lists.                                                                                                                                                                                                                                  |
| `announcementDebounceMilliseconds`, `messages`          | How long after typing stops the count is announced (default 500), and per-instance overrides of the `combobox` strings.                                                                                                                                                                                                                                                   |

`invalid`, `required` and the description (a `Prose` in the Field) come from the Field, as for every control. The value is never copied into KvirnUI state: `value` and `onValueChange` are yours, or `defaultValue` and `name` for a plain form.

## Parts

- **`Combobox.Input`**: the text field. Typing filters the list and opens the popup, and a click on it doesn't open anything. Outside a Field give it `aria-label` or `aria-labelledby`.
- **`Combobox.Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`**: the Listbox's parts, shared. The popup is a role-less `<div popover="manual">` in the top layer, placed under the input, and a press in it never takes focus from the input. The `Combobox.List` inside it is the `role="listbox"` (named by the Field's label, or your `aria-label` on the List) and the part that scrolls. Options render only while the popup is open. `Combobox.Empty` says "No results" (or "Loading results") in the locale when nothing matches, as plain text beside the hidden list; the input then reports `aria-expanded="false"`. Annotate the item in the `Combobox.List` function to type it.
- **`Combobox.Control`**: the box around the input and its buttons, recommended (see above). The popup is placed against it, and the default theme draws the field's edge and focus ring on it.
- **`Combobox.Toggle`**: a button, recommended, that opens and closes the popup, named "Visa alternativ". It is not a tab stop: ArrowDown and Alt+ArrowDown do the same from the keyboard.
- **`Combobox.Clear`**: an optional button that empties the text and, with one choice, the value, named "Rensa". With several choices it empties the typed text only: each chosen value is removed with its own remove button. It shows only while there is something to clear, and it is not a tab stop. It is the only thing that empties the text.
- **`Combobox.ValueList`, `Combobox.Value`**: for `multiple`. A `<ul>` before the input with one `<li>` per chosen value, each with a remove button named "Ta bort Stockholm". After a removal focus goes to the next remove button, else the previous one, else the input. Backspace in the empty input removes nothing.
- **`useCombobox(options)`** returns `controlProps`, `inputProps`, `toggleProps`, `clearProps`, `valueListProps`, `getValueProps(value)`, `getRemoveButtonProps(value)`, `popupProps`, `listProps`, `emptyProps`, `getOptionProps(entry)`, `getGroupProps(section)`, `getGroupLabelProps(section)`, `hiddenInputs`, `entries`, `sections`, `selectedValues`, `isOpen`, `inputValue` and the Field's `isInvalid`, `isRequired`, `isDisabled`, for your own markup.

Every part renders exactly one element, takes `render` and your own `className`, `ref` and handlers (merged with its own), and has a stable class: `kv-combobox-control`, `kv-combobox-input`, `kv-combobox-toggle`, `kv-combobox-clear`, `kv-combobox-value-list`, `kv-combobox-value` (with `kv-combobox-value-label` and `kv-combobox-value-remove` inside), and the Listbox's `kv-listbox-popup`, `kv-listbox-list`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label` and `kv-listbox-empty`. State is in `data-open`, `data-active`, `data-selected`, `data-disabled`, `data-loading` and `data-placement`. With `@kvirn-ui/theme/theme.css` imported, the input looks like an Input and the popup like the Listbox's; headless, it is unstyled.

## Keys

Typing filters. ArrowDown and ArrowUp open the popup and move the highlight, and don't wrap. Page Up and Page Down move ten. Enter chooses the highlighted option (with none highlighted it is the browser's own). Escape closes and keeps the text and the value. Tab closes without choosing and moves on. Alt+ArrowDown opens without highlighting, and Alt+ArrowUp chooses and closes. Home, End, ArrowLeft, ArrowRight and Space are the text field's own: the caret moves, and the four caret keys leave no option highlighted. The full table is the Keyboard section of [combobox.a11y.md](combobox.a11y.md), shown on the Docs page.

## Long lists

Let the user filter first: that is what a Combobox is for, and a list that shrinks as they type is short enough to render in full. `virtualize` is for a list that stays long after filtering, such as the first letters of a register of thousands of entries.

```tsx
<Combobox.Root items={streets} virtualize>
  …
</Combobox.Root>

<Combobox.Root items={streets} virtualize={{ estimateSize: 56, overscan: 8 }}>
  …
</Combobox.Root>
```

With `virtualize`, the popup renders only the options that are scrolled into view, plus the active and the chosen ones, so a list of 10 000 opens at once. It is off by default. `true` uses the defaults; `{ estimateSize, overscan }` sets the height in pixels of an option that hasn't been measured (default 44) and how many options to render beyond the visible ones (default 5). Options are measured when they render, so an option that wraps gets its real height.

What stays the same for the user: every rendered option says how many options there are after filtering and where it is (`aria-setsize` and `aria-posinset`), the arrows and Page Up and Page Down work on the whole filtered list, and the active and chosen options are always in the page, so `aria-activedescendant` on the input never points at nothing. Typing filters the whole list, and the size follows. Home and End still move the caret in the text field.

The caveat: options that aren't rendered can't be found with the browser's find in page, aren't printed, and are out of reach of a screen reader's browse mode. It needs a flat list: with `groups` the list renders in full and a warning is logged in development. Screen-reader support for `aria-setsize` and `aria-activedescendant` in a long list varies, and the manual run on NVDA, JAWS, VoiceOver and TalkBack is still to do.

The list is the scroll element, so give `Combobox.List` a height limit and `overflow-y: auto` (the default theme does). It carries `data-virtualized`, and inside it one element (`kv-listbox-virtual-sizer`) has the height of the whole list, with each option absolutely positioned in it. That geometry is inline and nothing else is. Write the function child of `Combobox.List`, as always: it is what lets the list render only some of the options.

## Several choices

With `multiple`, each choice moves out of the field and into the value list, and the popup stays open so the next one is a few keys away. The chosen option stays in the list, marked, and choosing it again takes the value away. The remove buttons are normal buttons in the Tab order, before the input.

## Your own look

Spread the hook's props on your own elements, or put your own `className` on a part. The parts carry stable classes and `data-*` state, and the default theme is opt-in.

## Classes for the default theme

`kv-combobox-control`, `kv-combobox-input`, `kv-combobox-toggle`, `kv-combobox-clear`, `kv-combobox-value-list`, `kv-combobox-value`, `kv-combobox-value-label` and `kv-combobox-value-remove`, plus the Listbox's popup classes.

## Hook

`useCombobox` is the state and props behind the parts, for your own markup.
