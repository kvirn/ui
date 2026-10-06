# Menu

> **Draft** (Plan 0070). This page moves to the docs site with the component page. The accessibility contract is [menu.a11y.md](menu.a11y.md).

A Menu is a short list of **actions** that a button opens: print, share, delete. It is not navigation. Links to pages are a `Navigation` or a `Disclosure`, never `role="menu"`: a screen reader then switches to a mode that does not read links as links, and a development warning fires for a `Menu.Item` rendered as a link. A single action is a button, not a menu with one item.

The browser puts the menu in the **top layer**, so no ancestor's `overflow` clips it and you never fight `z-index`. KvirnUI places it next to the button, flips it when there is no room and lets it scroll inside when it is too tall. Focus moves onto the items as the user arrows through them, Enter or Space runs one, and focus returns to the button.

- Ten parts: `Menu.Root` (no element, it owns the open state), `Menu.Trigger` (`<button>`), `Menu.Popup` (`<div popover="auto" role="menu">`), `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.Separator`, `Menu.Group` and `Menu.GroupLabel`. Each is also exported on its own (`MenuRoot`, `MenuItem`, …), and the hook is `useMenu`. `Menu.RadioGroup` is not `RadioGroup`.
- **Keys.** Enter, Space or ArrowDown on the trigger opens the menu on the first item, ArrowUp on the last. Arrows wrap, Home and End jump, a typed character moves to the next item that starts with it (by the page's locale). Escape closes and returns focus to the trigger. Tab closes the menu and moves on: it never traps.
- **A menu that starts open** (`defaultOpen`, or `open` true on the first render) does not move focus on load (WCAG 3.2.1). Only a later opening takes focus on the first item.
- **Disabled items stay focusable** with `aria-disabled`, so a screen reader user finds them. They cannot be run.
- **Checkbox and radio items** are controlled or uncontrolled and close the menu by default. `closeOnSelect={false}` keeps it open.
- **No submenus, menubar, context menu or hover-to-open** in this version.
- **Pointer movement over an item focuses it,** so there is one highlight. Moving never opens a menu.
- **The popup and its items are always in the DOM,** hidden by the browser while closed, so an uncontrolled checkbox or radio item keeps its state. Keep the items light.
- No strings of its own: the labels are yours, in the page's language.
- Headless: no CSS. The parts render the `kv-menu-*` classes and `data-*` state; your `className` joins them. The only inline styles are the placement.

## API

```tsx
import { Menu } from '@kvirn-ui/react'

;<Menu.Root onOpenChange={(open, { reason }) => {}}>
  <Menu.Trigger>Åtgärder</Menu.Trigger>
  <Menu.Popup>
    <Menu.Item onSelect={() => print()}>Skriv ut</Menu.Item>
    <Menu.Item disabled>Dela</Menu.Item>
    <Menu.Separator />
    <Menu.Group>
      <Menu.GroupLabel>Visa</Menu.GroupLabel>
      <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
        Rutnät
      </Menu.CheckboxItem>
    </Menu.Group>
    <Menu.RadioGroup value={sort} onValueChange={setSort} aria-label="Sortera">
      <Menu.RadioItem value="name">Namn</Menu.RadioItem>
      <Menu.RadioItem value="date">Datum</Menu.RadioItem>
    </Menu.RadioGroup>
  </Menu.Popup>
</Menu.Root>
```

| Part                | Renders                                | Class                   | Notes                                                                  |
| ------------------- | -------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `Menu.Root`         | No element                             |                         | The options below                                                      |
| `Menu.Trigger`      | `<button>` with `aria-haspopup="menu"` | `kv-menu-trigger`       | `aria-expanded`, `aria-controls`, `data-open`                          |
| `Menu.Popup`        | `<div popover="auto" role="menu">`     | `kv-menu-popup`         | Named by the trigger unless you pass `aria-label` or `aria-labelledby` |
| `Menu.Item`         | `<button role="menuitem">`             | `kv-menu-item`          | `onSelect`, `closeOnSelect`, `disabled`, `textValue`                   |
| `Menu.CheckboxItem` | `<button role="menuitemcheckbox">`     | `kv-menu-checkbox-item` | `checked` / `defaultChecked` / `onCheckedChange`                       |
| `Menu.RadioGroup`   | `<div role="group">`                   | `kv-menu-radio-group`   | `value` / `defaultValue` / `onValueChange`; name it                    |
| `Menu.RadioItem`    | `<button role="menuitemradio">`        | `kv-menu-radio-item`    | `value`                                                                |
| `Menu.Group`        | `<div role="group">`                   | `kv-menu-group`         | Named by its `Menu.GroupLabel`                                         |
| `Menu.GroupLabel`   | `<div>`                                | `kv-menu-group-label`   |                                                                        |
| `Menu.Separator`    | `<div role="separator">`               | `kv-menu-separator`     |                                                                        |

`Menu.Root` takes `open` / `defaultOpen`, `onOpenChange(open, { reason, event })` (reasons: `'trigger-press'`, `'key'`, `'item-press'`, `'escape'`, `'outside-press'`, `'light-dismiss'`, `'tab'`, `'focus-out'`), `placement` (default `'bottom-start'`), `offset` (4) and `padding` (8). With `open` set, `onOpenChange` only reports: you change `open`.

Every part takes `render` to change its element, and `className`, `style`, handlers and refs merge with its own. `render` also receives the state: `{ isOpen }` for the Trigger and Popup, `{ isOpen, isChecked, isDisabled, isHighlighted }` for items. Call `event.preventDefault()` in `onSelect` to keep the menu open and skip the toggle.

## Hook

```tsx
import { useMenu } from '@kvirn-ui/react'

function Actions() {
  const menu = useMenu()
  const [current, setCurrent] = useState<string>()
  return (
    <>
      <button {...menu.triggerProps}>Åtgärder</button>
      <div {...menu.popupProps}>
        <button
          {...menu.getItemProps('item', { isCurrent: current === 'print' })}
          onFocus={() => setCurrent('print')}
          onBlur={() => setCurrent(undefined)}
        >
          Skriv ut
        </button>
      </div>
    </>
  )
}
```

It returns `isOpen`, `placement`, `triggerProps`, `popupProps` and `getItemProps(kind, options)`, where `kind` is `'item'`, `'checkbox'` or `'radio'` and `options` are `{ disabled, closeOnSelect, onSelect, textValue, checked }` (`checked` is the state of a checkbox or radio item, which you keep), plus `isCurrent`: whether the item has focus, which you track with `onFocus` and `onBlur`. The focused item then gets `tabindex="0"` (the rest `-1`) and `data-highlighted`, which the theme styles.

## Developer warnings

In development a Menu warns once when a part is outside `Menu.Root`, when `Menu.Trigger` is not a `<button>`, when a `Menu.Item` is rendered as a link, and when a `Menu.RadioGroup` or `Menu.Group` has no name. Each has a code on the Foundation page Dev warnings.

## Accessibility

Read the [contract](menu.a11y.md). In short: use a menu for actions, name the trigger, name every group, and know that a checkbox or radio change is not announced after the menu closes.
