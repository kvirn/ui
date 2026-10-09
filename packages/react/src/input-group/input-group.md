# InputGroup

> **Draft** (Plan 0013, Phase 1b). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [input-group.a11y.md](input-group.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md) §6.13, and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** InputGroup renders what it's given. It keeps no value and doesn't validate: the value lives in your form state, or in the native input.

An InputGroup puts a unit, a symbol, a decorative icon or a Button **inside the input's box**: "kr" after a rent, "%" after a percentage, a search icon before a query, a "Rensa" Button after it.

- Three parts: `InputGroup.Root` (`<div>`, the box), `InputGroup.Input` (a `TextInput`, laid out by the box) and `InputGroup.Addon` (`<span>`, a unit or an icon). Each is also exported on its own (`InputGroupRoot`, `InputGroupInput`, `InputGroupAddon`), which is the form to import in a React Server Component, and the hook is `useInputGroup`.
- The Root looks exactly like a TextInput: same height, edge, radius, fill and states. It takes `data-invalid` and `data-disabled` from the nearest Field, and `data-focus-visible` while the Input has keyboard focus, so the focus ring goes around the whole box. The Input inside has no edge or ring of its own.
- **Addons are visual only.** `aria-hidden="true"`, never focusable, and never the only place a meaning lives: the label says the unit.
- **Start and end follow DOM order and reading direction.** An Addon before the Input is at the start, and it moves to the right in right-to-left. There's no `side` prop.
- Clicking an Addon, or the box's padding, focuses the Input, so the whole box is one target.
- **Interactive add-ons are real Buttons,** placed directly in the Root, never inside an Addon.
- Headless: no CSS. They render `kv-input-group` and `kv-input-group-addon`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part               | Renders                                                                   | What it is                                                                                                |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `InputGroup.Root`  | `<div class="kv-input-group">`                                            | The box. Takes `invalid`, `disabled` and every `<div>` prop. A Button goes directly in it                 |
| `InputGroup.Input` | the [TextInput](../text-input/text-input.md) (`<input class="kv-input">`) | The one input. Takes every TextInput prop and reads the Field the same way                                |
| `InputGroup.Addon` | `<span class="kv-input-group-addon" aria-hidden="true">`                  | A unit, a symbol or a decorative icon. Visual only: never focusable, never the only place a meaning lives |

- **`invalid` and `disabled` on the Root change only the box's look** (`data-invalid`, `data-disabled`) and, when `disabled`, stop a click on the box or an Addon from focusing the Input. They never reach the control: a screen reader hears the error only from `aria-invalid` on the Input, and the Input stays editable and in the Tab sequence until it is natively `disabled`. They default to the nearest Field's, which sets both the box and the Input. Without a Field, set them on the Root **and** on the Input (`aria-invalid`, native `disabled`). When the Root's own prop disagrees with the Input, a dev warning says so.
- **Without a Field** name the Input with a native `<label for>` (or `aria-labelledby`) and describe it with `aria-describedby`: nothing else wires them.
- **State the Root exposes:** `data-invalid`, `data-disabled` and `data-focus-visible` (see the table below).
- **Messages:** none. An Addon's text and a Button's name are yours, in the page's language.
- **Dev warnings (once):** an Addon outside a Root (`input-group-addon-outside-root`); focusable content inside an Addon (`input-group-addon-focusable`); the Root's own `invalid` or `disabled` disagreeing with the input inside it (`input-group-invalid-mismatch`, `input-group-disabled-mismatch`). Inside a Field the Root takes the Field's state, so nothing is compared.

## Component

```tsx
import { Field, InputGroup } from '@kvirn-ui/react'

;<Field.Root invalid={errors.rent !== undefined} required>
  <Field.Label>Månadshyra i kronor</Field.Label>
  <InputGroup.Root>
    <InputGroup.Input
      name="rent"
      inputMode="decimal"
      spellCheck={false}
      autoComplete="off"
      className="kv-input--width-10 kv-input--numeric"
    />
    <InputGroup.Addon>kr</InputGroup.Addon>
  </InputGroup.Root>
  <Field.Prose>
    <p>Till exempel 8 450</p>
  </Field.Prose>
  <Field.ErrorMessage>{errors.rent}</Field.ErrorMessage>
</Field.Root>
```

The label carries the unit, because the Addon is hidden from screen readers. The example is under the box, and the error under the example, in the default order ([Field](../field/field.md#the-default-order)).

### A search with a clear Button

The value lives in your own state. The clear Button renders only while there's a value, and clearing moves focus to the Input, so focus never lands on `body` when the Button goes away.

```tsx
const [query, setQuery] = useState('')
const inputRef = useRef<HTMLInputElement>(null)

<Field.Root>
  <Field.Label marker="none">Sök bland e-tjänster</Field.Label>
  <InputGroup.Root>
    <InputGroup.Addon>
      <Icon name="search" size={5} />
    </InputGroup.Addon>
    <InputGroup.Input ref={inputRef} type="search" name="q" enterKeyHint="search" value={query} onValueChange={setQuery} />
    {query === '' ? null : (
      <Button
        onClick={() => {
          setQuery('')
          inputRef.current?.focus()
        }}
      >
        Rensa
      </Button>
    )}
  </InputGroup.Root>
</Field.Root>
```

- A text Button's name is its visible text. An icon-only Button (`className="kv-button--icon-only"`) needs an `aria-label` from your translations: "Rensa sökningen".
- The theme hides the native clear button of the search input only when the group has a Button, so there are never two.
- Disable the Button when the Field is disabled, and leave it out of a read-only group.
- The show-password and calendar behaviours themselves aren't part of InputGroup: a DatePicker (M4) will put its named calendar Button in the same place.

### Your part

- **The label says the unit.** "Månadshyra i kronor", not "Månadshyra" with a "kr" Addon. If the label can't say it, a description (a `Prose`) above the control does.
- **Addon text is a symbol or a widely known abbreviation,** at most 4 characters: `kr`, `€`, `%`, `km`, `m²`. Never a word or a phrase ("per månad" goes in the label). Every Addon string comes from your translations.
- **One Addon per side at most.** A start Addon and an end Addon, or an Addon and a Button, are fine.
- **An icon Addon is decorative.** A calendar icon opens nothing until a date picker exists, so clicking it only focuses the Input. It repeats what the label says, and never looks like it does something it doesn't. Don't set `inputMode="numeric"` on a date field with separators.
- **Don't put focusable content in an Addon.** A dev warning says so. Put a Button directly in the Root.
- **Width classes stay on the Input** (`kv-input--width-10`). The Root fits around the Input and its Addons. Without a width class the Root is full width.
- **Compact density** (`kv-compact` from 64rem) gives a 32px box and a 32px Button. Values and units stay 16px.

### Classes and state for the default theme

| Class / attribute      | On    | Sets                                                                                            |
| ---------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `kv-input-group`       | Root  | the box: edge, fill, radius, states, focus ring                                                 |
| `kv-input-group-addon` | Addon | a unit or icon in `body` type and `text` colour, with no fill or divider                        |
| `data-invalid`         | Root  | a 2px `danger` edge, with no content shift. From the Field, or from `aria-invalid` on the Input |
| `data-disabled`        | Root  | a dashed edge on the `surface` colour                                                           |
| `data-focus-visible`   | Root  | the focus ring around the whole box. Also drawn from `:has(> .kv-input:focus-visible)`          |

A `kv-button` directly in the Root is a flat segment of the box, as tall as the box (44px, 32px compact) with a 1px divider and its own focus ring. Only the default Button look is styled there: a submit or destructive action belongs outside the box.

## Hook

For your own elements, `useInputGroup` returns the props:

```tsx
import { useInputGroup } from '@kvirn-ui/react'

function Rent() {
  const group = useInputGroup()
  return (
    <div {...group.rootProps}>
      <input {...input.inputProps} name="rent" />
      <span {...group.addonProps}>kr</span>
    </div>
  )
}
```

`useInputGroup({ invalid, disabled })` reads the nearest Field, and returns `rootProps` (class, state attributes and the pointer and focus handlers), `addonProps` (class and `aria-hidden`), `isInvalid`, `isDisabled` and `isFocusVisible`.

### Your own element

The parts render a `<div>` and a `<span>`. To build your own, use `useInputGroup()` and spread `rootProps` and `addonProps`.
