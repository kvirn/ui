# Toolbar

> **Draft** (Plan 0035). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [toolbar.a11y.md](toolbar.a11y.md), the design spec is [docs/design/rich-text-editor.md](../../../../docs/design/rich-text-editor.md) (§6.5 and §7.3), and the decisions are in Plan 0035.

A row of related controls that a keyboard user passes with **one Tab**, and moves through with the arrow keys: the formatting bar of an editor, the actions above a table. **Use it for three or more controls** (APG). For a few buttons that belong together, use a [ButtonGroup](../button-group/button-group.md): every button is its own Tab stop there. For navigation, use a `nav` with [Link](../link/link.md)s.

- Renders `<div role="toolbar">` with the class `kv-toolbar`. **Name it** with `aria-label` or `aria-labelledby`: a development warning fires without one. Set `aria-controls` to the element it acts on, when there is one.
- **One Tab stop, a roving `tabindex`.** The control that last had focus is the one Tab reaches (the first, the first time). Left and Right move to the next and previous control, across groups and rows, and flip in right-to-left text. Home and End go to the first and the last. The arrows wrap (`loop={false}` stops them at the ends).
- `orientation="vertical"` uses Down and Up and sets `aria-orientation="vertical"`. The default theme draws horizontal toolbars. In a vertical toolbar a Listbox item owns ArrowUp and ArrowDown, so use Tab or a horizontal toolbar for it.
- **Parts are items.** `Toolbar.Button` and `Toolbar.Toggle` are a [Button](../button/button.md) and a [Toggle](../toggle/toggle.md) that join the toolbar, and `Toolbar.Item` makes any other focusable control one: a Listbox trigger, a Popover trigger, a Link. **A Listbox in a toolbar needs `native="never"`**: by default a touch device renders a native `<select>` that replaces its children, so the item and the trigger's name never render (a dev warning fires). `Toolbar.Group` is a [ButtonGroup](../button-group/button-group.md) with `layout="attached"` by default (one joined strip of buttons; `layout="spaced"` gives a gap instead): a `role="group"` that needs a name inside a toolbar. Nothing else is an item: a Popover's form, which sits right after its trigger in the toolbar's DOM, never becomes one.
- **A disabled control stays focusable** with `aria-disabled`, so the arrows reach it and a screen reader says it is unavailable. Pressing it does nothing. This holds for `Toolbar.Button`, `Toolbar.Toggle` and `Toolbar.Item` alike. A natively disabled control (`focusableWhenDisabled={false}`) is skipped by the arrows and is never the Tab stop: Tab reaches the first control that can take focus, and when every control is natively disabled the toolbar leaves the Tab order.
- **A control's own keys win.** The toolbar doesn't take a key an item already handled, a key from a text field, and a key with Control, Alt, Meta or Shift. A Listbox trigger keeps ArrowDown, Home and End (they open it), and Left and Right still move on.
- **No overflow menu.** A toolbar that doesn't fit wraps, group by group, so every control stays visible and the keys follow the same order at every width.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled: a hairline between groups from 40rem, each group a joined strip, buttons at 44px (32px inside `kv-compact` from 64rem), and a pressed toggle as a solid fill.

## API

### Parts

| Part           | Renders                                | Props                                                                                                                                |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Toolbar.Root   | `<div role="toolbar">`                 | `orientation`, `loop`, `as` (`div` or `section`), and every `<div>` prop except `role` and `aria-orientation`                        |
| Toolbar.Group  | `<div>`, `role="group"` with a name    | The props of [ButtonGroup](../button-group/button-group.md): `aria-label` or `aria-labelledby`                                       |
| Toolbar.Button | `<button type="button">`               | The props of [Button](../button/button.md). `focusableWhenDisabled` defaults to `true`                                               |
| Toolbar.Toggle | `<button type="button" aria-pressed>`  | The props of [Toggle](../toggle/toggle.md). `focusableWhenDisabled` defaults to `true`                                               |
| Toolbar.Item   | `<button type="button">`, or your `as` | `as`, `focusableWhenDisabled` (default `true`), and every `<button>` prop (or the target's). The element must be focusable by itself |

Each part is also exported on its own (`ToolbarRoot`, `ToolbarGroup`, `ToolbarButton`, `ToolbarToggle`, `ToolbarItem`), and the hook is `useToolbar`. `Toolbar.Root` takes `ref`, `className` and any handler: they merge with its own.

### What Toolbar.Root sets

| Attribute or class | Value                                                            |
| ------------------ | ---------------------------------------------------------------- |
| `class`            | `kv-toolbar`. Your `className` joins it                          |
| `role`             | `toolbar`                                                        |
| `aria-orientation` | `vertical`, only when vertical: horizontal is the role's default |

### What an item gets

| Attribute  | Value                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tabindex` | `0` on the one control the Tab key reaches, `-1` on the others. It wins over the element's own (Listbox.Trigger honours a `tabIndex` it is given). Never on a natively disabled control |

Items are registered while they are mounted and ordered by their place in the page. If the control that was the Tab stop unmounts or becomes natively disabled, the next enabled one takes over, and focus moves to it from a control that was disabled while focused, so it is never lost to the page. Before the first render has registered the items (a server render), every item has `tabindex="0"`, so the toolbar works as ordinary buttons until it hydrates.

### Strings

Toolbar has no strings of its own and announces nothing. Every name is yours, from your translations: the toolbar's, each group's and each icon-only control's.

### `as`

`Toolbar.Root` takes `as="section"` (default `div`); it keeps the role, the class and the keys. `Toolbar.Item` takes `as`, a component or tag that is focusable by itself: `<Toolbar.Item as={Popover.Trigger}>` makes a Popover trigger an item, and its props are plain props of the item (`<Toolbar.Item as={Listbox.Trigger} aria-label="Texttyp" />`). The toolbar's `tabindex` wins over the target's own. `disabled` on a `Toolbar.Item` sets `aria-disabled="true"` and `data-disabled`, and blocks a click, Enter and Space, also for the target's own handlers. To give a `Toolbar.Item` and another part (a `Tooltip.Trigger`) each their own `as`, put one of them in a small component of yours.

### Development warnings

Keyed `toolbar-*` and `button-group-*`, English, for the developer only: a toolbar with no name (`toolbar-without-name`), a toolbar with fewer than three controls (`toolbar-with-few-controls`), a `Toolbar.Item` that renders an element that isn't focusable by itself (`toolbar-item-not-focusable:<tag>`), a `Toolbar.Item` that renders an element that is natively disabled anyway (`toolbar-item-natively-disabled:<tag>`), a Listbox that renders its native `<select>` inside a toolbar (`listbox-native-in-toolbar`), a part outside a `Toolbar.Root` (`toolbar-<part>-outside-root`), and a group in a toolbar with no name (`button-group-in-toolbar-without-name`).

## Component

```tsx
import { Icon, Toolbar } from '@kvirn-ui/react'

;<Toolbar.Root aria-label="Formatering" aria-controls={editorId}>
  <Toolbar.Group aria-label="Historik">
    <Toolbar.Button onClick={undo} disabled={!canUndo}>
      Ångra
    </Toolbar.Button>
    <Toolbar.Button onClick={redo} disabled={!canRedo}>
      Gör om
    </Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Group aria-label="Textstil">
    <Toolbar.Toggle pressed={isBold} onPressedChange={setIsBold}>
      Fet
    </Toolbar.Toggle>
  </Toolbar.Group>
</Toolbar.Root>
```

An icon-only control takes `kv-button--icon-only` and an `aria-label`, and a tooltip where the toolbar's users might not know the icons (`bold` is an icon you register with `defineIcons`):

```tsx
<Toolbar.Toggle
  className="kv-button--icon-only"
  aria-label="Fetstil"
  pressed={isBold}
  onPressedChange={setIsBold}
>
  <Icon name="bold" />
</Toolbar.Toggle>
```

A control that opens something goes in with `Toolbar.Item` and `as`. Render its popup right after it:

```tsx
<Popover.Root>
  <Toolbar.Item as={Popover.Trigger}>Länk</Toolbar.Item>
  <Popover.Popup aria-label="Lägg till länk">…</Popover.Popup>
</Popover.Root>
```

Pitfalls: a plain `<Button>` inside the toolbar is an ordinary Tab stop and is skipped by the arrows, so use `Toolbar.Button`. A text field as an item keeps the arrow keys, Home and End for its caret, so don't put one in unless it is the point. Keep a disabled control focusable (the default), and set `focusableWhenDisabled={false}` only when the whole toolbar is disabled: a natively disabled control can't take focus, so the toolbar picks the first control that can, and leaves the Tab order when there is none. Disable a Listbox on its own Root, not on the `Toolbar.Item`. To keep a text field in the toolbar from being changed, make it `readOnly`: `disabled` on a `Toolbar.Item` stops Enter, Space and clicks, but a text `<input>` stays editable. Where focus goes after a command is a decision for the component built on the toolbar: here, it stays on the button, so a keyboard user can press Fet and then Kursiv.

## Hook

```tsx
import { mergeProps, useToolbar } from '@kvirn-ui/react'

function Actions() {
  const toolbar = useToolbar({ orientation: 'horizontal', loop: true })
  return (
    <div {...toolbar.toolbarProps} aria-label="Åtgärder">
      {['spara', 'skriv ut', 'dela'].map((name) => (
        <button type="button" key={name} {...toolbar.getItemProps(name)}>
          {name}
        </button>
      ))}
    </div>
  )
}
```

`useToolbar({ orientation, loop })` returns `toolbarProps` (class, role, `aria-orientation`, a ref and the key handler), `getItemProps(key)`, `orientation` and `itemCount`. `getItemProps(key)` gives an item's `ref`, `tabIndex` and `onFocus`. The key names the item and must be the same on every render. Spread it on the control, and merge your own props with `mergeProps(yourProps, toolbar.getItemProps(key))`. The `ref` registers the element: it is stable for a key, so React doesn't re-register it each render.
