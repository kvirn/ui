# Autocomplete

> **Draft** (Plan 0022). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [autocomplete.a11y.md](autocomplete.a11y.md), and the decision is ADR-0037.

A text field that suggests. The user types, a list of suggestions appears, and they can pick one, which fills the field, or keep what they typed. The value is the text, which may match nothing: suggestions help, they never block other text.

Use an Autocomplete for a question whose answer is free text: a street, a search, a place name. When the answer must be one of the options (a municipality, a country, an occupation code), use a Combobox, where the value is the chosen option and text that matches nothing is reported as no value.

## How it works

```tsx
import { Autocomplete, Field, Label } from '@kvirn-ui/react'
;<Field>
  <Label>Gatuadress</Label>
  <Autocomplete.Root items={streets} value={street} onValueChange={setStreet} name="street">
    <Autocomplete.Control>
      <Autocomplete.Input />
      <Autocomplete.Clear />
      <Autocomplete.Toggle />
    </Autocomplete.Control>
    <Autocomplete.Popup>
      <Autocomplete.List>
        {(street: string) => <Autocomplete.Option item={street} />}
      </Autocomplete.List>
    </Autocomplete.Popup>
  </Autocomplete.Root>
</Field>
```

- **Put the input in an `Autocomplete.Control` with a `Toggle` and a `Clear`.** That is the default way to build it: a bare input looks like a plain text field, and a click on it opens nothing. The Toggle shows that there are suggestions and opens them, and Clear empties the text. A bare `Autocomplete.Input` is the minimal variant, for a search field where the question itself says to type.
- **It is the same input and popup as a Combobox.** DOM focus stays on the native `<input role="combobox">`, named by the Field's label, and the highlighted suggestion is `aria-activedescendant`. The parts are the Combobox's, so the two are built the same way.
- **Picking a suggestion fills the input** and closes the popup. Nothing is "selected": no option is ever `aria-selected`, and the text is never turned into a key.
- **The popup opens for text** (and for ArrowDown), and closes when the text is emptied. A click on the input opens nothing.
- **Suggestions never block other text.** No suggestion is highlighted until the user presses ArrowDown or ArrowUp, and with none highlighted Enter keeps its native meaning: a form submits what was typed.
- **The typed text is never cleared silently.** Escape, Tab and leaving the field keep it. Only the Clear button empties it.
- **The suggestion count is announced** ("2 resultat") once the user has stopped typing, and so are "no results" and "loading". The highlighted suggestion is never announced by KvirnUI: the screen reader reads it. This needs a `KvirnProvider`, which renders the live regions.

## Root

`Autocomplete.Root` renders no element of its own. It takes the Combobox's options for the list and the popup (`items` or `groups`, `itemToString`, `itemToKey`, `isItemDisabled`, `filter`, `isLoading`, `disabled`, `id`, `open`, `defaultOpen`, `onOpenChange`, `placement`, `offset`, `padding`, `announcementDebounceMilliseconds`, `messages`), and the text as its value:

| Prop                                     | What it does                                                                                                                                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`, `defaultValue`, `onValueChange` | The text. `onValueChange(text, { reason })` has the reason `'input'` (the user typed), `'selection'` (a suggestion was picked) or `'clear'`. It only reports: a parent that doesn't update `value` leaves the text as it was.                                            |
| `name`                                   | Put on the `<input>`, so a plain `<form>` and `FormData` send the text. There is no hidden input.                                                                                                                                                                        |
| `items`, `groups`, `filter`, `isLoading` | The suggestions. The default filter matches anywhere in the text, in the provider's locale (å, ä and ö are not a and o in Swedish). For suggestions that your server chooses, pass `filter={false}` and `isLoading` while it works, and keep the last result in `items`. |

`invalid`, `required` and the description (a `Prose` in the Field) come from the Field, as for every control. The value is never copied into KvirnUI state (ADR-0029).

## Parts

- **`Autocomplete.Input`**: the text field. Outside a Field give it `aria-label` or `aria-labelledby`. Set `autoComplete` where the field is for a known purpose; the default is `off`, so the browser's own list doesn't compete with yours.
- **`Autocomplete.Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`**: the Listbox's parts, shared. Options render only while the popup is open. `Autocomplete.Empty` says "No results" in the locale when nothing matches, as plain text beside the hidden list; leave it out when you don't want to say it, because for free text that isn't an error. With no suggestion the input reports `aria-expanded="false"` either way.
- **`Autocomplete.Control`, `Toggle`, `Clear`**: recommended, as in the Combobox: a box around the input and its buttons, a button that opens the popup, and a button that empties the text. Toggle and Clear are not tab stops.
- **`useAutocomplete(options)`** returns the same props as `useCombobox`, for your own markup.

Every part renders exactly one element, takes `render` and your own `className`, `ref` and handlers (merged with its own), and has a stable class: `kv-autocomplete-control`, `kv-autocomplete-input`, `kv-autocomplete-toggle`, `kv-autocomplete-clear`, and the Listbox's popup classes. With `@kvirn-ui/theme/theme.css` imported, the input looks like an Input and the popup like the Listbox's.

## Keys

Typing filters and opens the popup. ArrowDown and ArrowUp open it and move the highlight, and don't wrap. Page Up and Page Down move ten. Enter picks the highlighted suggestion (with none highlighted it is the browser's own). Escape closes and keeps the text. Tab closes without picking and moves on. Alt+ArrowDown opens without highlighting, and Alt+ArrowUp picks and closes. Home, End, ArrowLeft, ArrowRight and Space are the text field's own: the caret moves, and the four caret keys leave no suggestion highlighted. The full table is the Keyboard section of [autocomplete.a11y.md](autocomplete.a11y.md), shown on the Docs page.

## Your own look

Spread the hook's props on your own elements, or put your own `className` on a part. The parts carry stable classes and `data-*` state, and the default theme is opt-in.

## Classes for the default theme

`kv-autocomplete-control`, `kv-autocomplete-input`, `kv-autocomplete-toggle` and `kv-autocomplete-clear`, plus the Listbox's popup classes.

## Hook

`useAutocomplete` is the state and props behind the parts, for your own markup.
