# Toggle

> **Draft** (Plan 0035). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [toggle.a11y.md](toggle.a11y.md), the design spec is [docs/design/rich-text-editor.md](../../../../docs/design/rich-text-editor.md) (§6.4), and the decisions are in the api-conventions and accessibility skills.

A button that is on or off, and says which: "Visa bara olästa", bold text in an editor, a filter on a list. Use it for a choice with a **direct, visible effect** on the page. **For an answer in a form, use a [Checkbox](../checkbox/checkbox.md) or a radio group. For a setting that is saved at once, use a [Switch](../switch/switch.md).** For an action that happens once, use a [Button](../button/button.md). For a row of toggles that belong together, put them in a [Toolbar](../toolbar/toolbar.md).

- Renders a native `<button type="button">` with `aria-pressed="true"` or `"false"`, the classes `kv-button kv-toggle` and `data-pressed` while on. Your `className` joins them.
- **The name never changes with the state.** "Visa karta" stays "Visa karta" whether the map is shown or not: a screen reader says it is on from `aria-pressed`. A label that flips between "Visa" and "Dölj" says it twice and confuses people who can't see which is current (APG).
- Controlled with `pressed` and `onPressedChange`, or uncontrolled with `defaultPressed`, the same way a Popover is controlled with `open`.
- Disabled like a Button: natively, or with `focusableWhenDisabled` so it stays in the Tab order with `aria-disabled`. A disabled toggle still says whether it is on, and switching is blocked.
- Icon-only toggles need an `aria-label` from your translations. A development warning says so, as for Button.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled: pressed is a solid `primary` fill with a light label or icon, which differs from an unpressed button by more than colour.

## API

### Parts

| Part   | Renders                                      | Props                                                                                                                                                                                    |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle | `<button type="button">` (flat, one element) | `pressed`, `defaultPressed`, `onPressedChange`, `disabled`, `focusableWhenDisabled`, `onClick`, `render`, and every native button prop except `type`, `aria-pressed` and `aria-disabled` |

`onPressedChange(pressed, { event })` is called with the new value and the click that caused it (a press, or Enter or Space on the focused toggle). It only reports: with `pressed` set, you change `pressed`. It is never called while disabled. `onClick` is called after it, on every activation.

### What it sets on the `<button>`

| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| `type`          | `button`, always: a toggle never submits a form       |
| `aria-pressed`  | `true` or `false`, from `pressed` or `defaultPressed` |
| `disabled`      | Natively, with `disabled`                             |
| `aria-disabled` | `true`, with `disabled` and `focusableWhenDisabled`   |

| State attribute      | When                                           |
| -------------------- | ---------------------------------------------- |
| `data-pressed`       | While the toggle is on                         |
| `data-disabled`      | While it is disabled, natively or focusable    |
| `data-focus-visible` | While it has focus that came from the keyboard |

### Classes

| Class                  | Sets                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `kv-button`            | The button's look, and the density: 44px, or 32px in `kv-compact` from 64rem            |
| `kv-toggle`            | The pressed look: a solid `primary` fill, a light icon or label, no depth               |
| `kv-button--icon-only` | A square toggle with only an icon. Add it yourself, and give the toggle an `aria-label` |

### Strings

Toggle has no strings of its own: its name is its content or your `aria-label`.

### `render`

`render` takes an element or a function `(toggleProps, state)`, where `state` is `{ isPressed, isDisabled, isFocusVisible }`. It must still render a `<button>`, and a development warning names the element when it doesn't. An element's own `onClick` is gated like the Toggle's: it is not called while disabled. In the function form, spread `toggleProps` and keep `toggleProps.onClick`, which is what switches the state and blocks it while disabled.

### Development warnings

Keyed `toggle-*`, English, for the developer only: `render` produced something other than a `<button>` (`toggle-not-a-button:<element>`), and no accessible name (`toggle-without-name`).

## Component

```tsx
import { Toggle } from '@kvirn-ui/react'

function UnreadFilter() {
  const [isOn, setIsOn] = useState(false)
  return (
    <Toggle pressed={isOn} onPressedChange={setIsOn}>
      Visa bara olästa
    </Toggle>
  )
}
```

An icon-only toggle names itself with `aria-label` and keeps the icon decorative:

```tsx
<Toggle className="kv-button--icon-only" aria-label="Visa lösenord">
  <Icon name="eye" />
</Toggle>
```

Prefer a toggle for something the user sees change at once. If turning it on needs a Save button, it is a Checkbox.

## Hook

```tsx
import { useToggle } from '@kvirn-ui/react'

function Bold() {
  const toggle = useToggle({ defaultPressed: false })
  return (
    <button {...toggle.toggleProps} aria-label="Fetstil">
      B
    </button>
  )
}
```

`useToggle` takes `pressed`, `defaultPressed`, `onPressedChange`, `disabled`, `focusableWhenDisabled` and `onClick`. It returns `toggleProps`, `isPressed`, `isDisabled` and `isFocusVisible`. It is `useButton` plus the pressed state: pass your click handler as `onClick` here, so it is blocked while disabled.
