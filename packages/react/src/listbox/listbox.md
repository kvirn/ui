# Listbox

> **Draft** (Plan 0022). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [listbox.a11y.md](listbox.a11y.md), and the decision is ADR-0037.

Choosing one option from a list, or several. Listbox replaces `NativeSelect` (ADR-0037, item 2). It has two renderings of one API:

- **The popup** (`Listbox.Root`, `Listbox.Trigger`, `Listbox.Popup` and the parts inside it): a stylable popup in the browser's top layer, the APG select-only combobox. It holds groups and rich options, and it is the only rendering for `multiple`.
- **The native select** (what `Listbox.Root` renders for `native="always"`, and on touch devices with `native="auto"`): the browser's own `<select>`, wired to its Field. On a phone it is better than anything custom.

Use a Combobox (a later part of Plan 0022) when the user should type to filter a long list, and a CheckboxGroup for up to about 15 choices that can all be shown.

## The popup

```tsx
import { Field, Label, Listbox } from '@kvirn-ui/react'

interface Municipality {
  code: string
  name: string
}

;<Field required>
  <Label>Kommun</Label>
  <Listbox.Root
    items={municipalities}
    itemToString={(municipality) => municipality.name}
    itemToKey={(municipality) => municipality.code}
    value={code}
    onValueChange={setCode}
    name="municipality"
  >
    <Listbox.Trigger>
      <Listbox.Value placeholder="Välj kommun" />
    </Listbox.Trigger>
    <Listbox.Popup>
      <Listbox.List>
        {(municipality: Municipality) => <Listbox.Option item={municipality} />}
      </Listbox.List>
      <Listbox.Empty />
    </Listbox.Popup>
  </Listbox.Root>
</Field>
```

### Root

`Listbox.Root` renders no element of its own (it renders hidden inputs after its children, and the native `<select>` when that is chosen). Props:

| Prop                                     | What it does                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                                  | A flat list of any item type. Pass a new array when the items, or what `isItemDisabled` says about them, change, and memoize it when you build it in render.                                                                                      |
| `groups`                                 | Items in named groups: `{ key, label, items }`. Flat: groups don't nest. Instead of `items`.                                                                                                                                                      |
| `itemToString`, `itemToKey`              | The text of an item (shown, matched by typeahead, the native option's label), and its unique key (what the value holds). Defaults: `String(item)`, and the text.                                                                                  |
| `isItemDisabled`                         | Disabled options stay reachable with the arrow keys, are read as unavailable, and can't be chosen.                                                                                                                                                |
| `value`, `defaultValue`, `onValueChange` | Single choice: a key or `null`. With `multiple`: an array of keys. `onValueChange(value, { reason })` has the reason `'option-press'`, `'key'` or `'native'`. It only reports: a parent that doesn't update `value` leaves the listbox as it was. |
| `multiple`                               | Several choices. The popup stays open after a choice, and every option toggles. Always the popup, never the native select.                                                                                                                        |
| `native`                                 | `'auto'` (default): a native `<select>` on touch devices (`(pointer: coarse)`), for a single choice. `'always'`, or `'never'`.                                                                                                                    |
| `name`                                   | One `<input type="hidden">` per chosen key, so a plain `<form>` and `FormData` work. A single choice sends `''` when nothing is chosen. None when disabled.                                                                                       |
| `placeholder`                            | Shown while nothing is chosen (and the label of the native select's empty option). `Listbox.Value` can override it. Never the only label.                                                                                                         |
| `autoComplete`                           | `autocomplete` of the native select (1.3.5).                                                                                                                                                                                                      |
| `disabled`, `id`                         | `disabled` (a disabled Field disables it too), and the trigger's id outside a Field.                                                                                                                                                              |
| `open`, `defaultOpen`, `onOpenChange`    | The popup's state. `onOpenChange(open, { reason })`: `'trigger-press'`, `'option-press'`, `'key'`, `'escape'`, `'outside-press'`, `'blur'` or `'light-dismiss'`.                                                                                  |
| `placement`, `offset`, `padding`         | Where the popup goes (default `'bottom-start'`, 4px gap, 8px from the viewport's edge). It is as wide as the trigger, flips when there is no room and scrolls inside.                                                                             |
| `messages`                               | Per-instance overrides of the `combobox` strings (ADR-0007). `noResults` is the default text of `Listbox.Empty`.                                                                                                                                  |

`invalid`, `required` and the description (a `Prose` in the Field) come from the Field, as for every control. The value is never copied into KvirnUI state: `value` and `onValueChange` are yours, or `defaultValue` and `name` for a plain form (ADR-0029).

### Parts

- **`Listbox.Trigger`**: `<div role="combobox" tabindex="0">` with `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"` and `aria-activedescendant`. **DOM focus stays on it.** Named by the Field's label followed by the value; outside a Field give it `aria-label` or `aria-labelledby`. Clicking the Field's label focuses it. With no children it renders a `Listbox.Value`.
- **`Listbox.Value`**: the chosen options' texts joined by a comma, or `placeholder` with `data-placeholder`. A function child gets the chosen items: `(items) => items.length`.
- **`Listbox.Popup`**: a role-less `<div popover="manual">`, in the top layer, always rendered: the shell with the edge, the shadow and the position. Escape and a press outside close it, and a press inside never takes focus from the trigger. `Popup`, `List`, `Option`, `Group`, `GroupLabel` and `Empty` are shared with Combobox and Autocomplete.
- **`Listbox.List`**: the `<div role="listbox">` inside the popup: `aria-controls` points at it, the Field's label names it (or your `aria-label`), it has `aria-multiselectable` for `multiple`, and it is the part that scrolls. Its function child renders one `Listbox.Option` per item, or per group when the Root has `groups`. Options render **only while the popup is open**. Annotate the item to type it: `(municipality: Municipality) => …`.
- **`Listbox.Option`**: `<div role="option">` with `aria-selected` and `aria-disabled`. Its children are the item's text, or your rich content (its name is then its text content). A click chooses it, and moving the mouse over it makes it active.
- **`Listbox.Group`, `Listbox.GroupLabel`**: `role="group"` named by its label. `Listbox.List` renders them for `groups`.
- **`Listbox.Empty`**: shown only while the popup is open and there are no options, as plain text beside the (then hidden) list, not an option. Default text: "No results" in the locale.
- **`useListbox(options)`** returns `triggerProps`, `valueProps`, `popupProps`, `listProps`, `emptyProps`, `getOptionProps(entry)`, `getGroupProps(section)`, `getGroupLabelProps(section)`, `hiddenInputs`, `entries`, `sections`, `selectedItems`, `isOpen`, `isNative` and the Field's `isInvalid`, `isRequired`, `isDisabled`, for your own markup.

Every part renders exactly one element, takes `render` and your own `className`, `ref` and handlers (merged with its own), and has a stable class: `kv-listbox-trigger`, `kv-listbox-value`, `kv-listbox-popup`, `kv-listbox-list`, `kv-listbox-option`, `kv-listbox-group`, `kv-listbox-group-label` and `kv-listbox-empty`. State is in `data-open`, `data-active`, `data-selected`, `data-disabled`, `data-placeholder` and `data-placement`. With `@kvirn-ui/theme/theme.css` imported, the trigger looks like an Input with a chevron and the popup has level 3 elevation; headless, it is unstyled.

### Keys

Arrows move the highlight and don't wrap, Home and End go to the first and last option, Page Up and Page Down move ten, Enter, Space, Tab or a click choose, Escape closes and keeps the value, Alt+ArrowDown opens without highlighting, and a letter jumps to the next option that starts with it, in the provider's locale (å, ä and ö are not a and o in Swedish). The full table is the Keyboard section of [listbox.a11y.md](listbox.a11y.md), shown on the Docs page.

### Native on touch devices

With `native="auto"`, the server and the first client render are the popup, and a device whose primary pointer is coarse switches to the native select right after mount. Only a **single choice** switches, and the native `<select>` shows **plain text**: `Listbox.Empty`, rich option content and the popup's look don't apply there. The value, `name` and Field wiring are the same, a choice survives the switch, and the popup is closed when it happens. The pointer is read once, right after mount: the rendering never changes while the user is on the page, because a swap would drop their focus. A touch device sees one frame of the custom trigger first: use `native="always"` when that matters, or `native="never"` to keep the popup everywhere. The native select gets an empty option for "nothing chosen" (carrying `placeholder`), which reports `null` when chosen.

## The native select

`NativeSelect` became `Listbox`: there is no separate native part. `<Listbox.Root native="always">` (and `native="auto"` on touch devices) renders one `<select class="kv-listbox-native">` from the same `items`, `groups`, `itemToString`, `itemToKey` and `isItemDisabled`, with `<option>` and `<optgroup>`. `Listbox.Trigger`, `Listbox.Popup` and the other children are not rendered then, so leave them in: they serve the popup.

- Named by its `Label`, described by the Field's hint and error. `aria-invalid`, `aria-required` and `disabled` come from the Field.
- The same API as the popup: `value` (a key or `null`), `defaultValue`, `onValueChange(value, { reason: 'native' })`, `name` and `autoComplete`, which go on the `<select>`. No form state (ADR-0029, item 0).
- An empty `<option value="">` stands for "nothing chosen" and carries `placeholder`. It goes once something is chosen, unless a placeholder is set. Choosing it reports `null`.
- It takes plain text only: rich option content and `Listbox.Empty` don't apply, and `multiple` never renders it.

```tsx
<Field required>
  <Label>Kommun</Label>
  <Listbox.Root
    native="always"
    items={municipalities}
    itemToString={(municipality) => municipality.name}
    itemToKey={(municipality) => municipality.code}
    placeholder="Välj kommun"
    name="municipality"
    autoComplete="address-level2"
  />
</Field>
```

## Migrating from `NativeSelect`

| Before                                      | After                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `<NativeSelect>` with `<option>` children   | `<Listbox.Root native="always" items={…} />`, a key as the value         |
| `value="gbg"` and `onValueChange(value)`    | `value="gbg"` (the item's key) and `onValueChange(key \| null, details)` |
| `useNativeSelect()` and `selectProps`       | removed: spread your own `<select>` with the Field's `useField` props    |
| `.kv-native-select`, `--kv-native-select-*` | `.kv-listbox-native`, `--kv-listbox-native-*`                            |
| story title `Components/Form/NativeSelect`  | `Components/Form/Listbox` (the Native… stories)                          |

Markup and keys of the native select are unchanged. `useListbox` and `UseListboxOptions` are the popup's hook and types.
