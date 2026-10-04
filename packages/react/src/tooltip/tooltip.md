# Tooltip

> **Draft** (Plan 0037). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [tooltip.a11y.md](tooltip.a11y.md), and the design spec is [docs/design/tooltip.md](../../../../docs/design/tooltip.md).

A short label for a control, shown when the pointer rests on it or it has keyboard focus: the name of an icon-only button, and its shortcut ("Fetstil Ctrl+B"). **A tooltip never holds anything a user needs.** The control has a name of its own, and the tooltip only shows it or adds a shortcut. For content a user can act on, such as a link or a short form, use a [Popover](../popover/popover.md). For help a user must read, use visible text, a [Field](../field/field.md) hint or a Details disclosure.

- **Parts:** `Tooltip.Root` (no element, it owns the state), `Tooltip.Trigger` (the control: a `<button>`, or your own through `render`), `Tooltip.Popup` (`<div popover="manual" role="tooltip">`), `Tooltip.Name` and `Tooltip.Shortcut` (`<span>`). Render the popup **right after the trigger**.
- **Opens** when the pointer has rested on the trigger for half a second, and **at once on keyboard focus** (focus that shows a focus ring: a click doesn't open it). Once one tooltip has opened, the next opens at once, so moving along a toolbar isn't slow. **Not on touch**: a long press isn't discoverable, and the control's name carries it.
- **Stays** while the pointer is on the trigger or on the tooltip, or the trigger has keyboard focus, and has no timeout. After the pointer leaves, a 100 ms grace lets it cross the gap onto the tooltip (WCAG 1.4.13: hoverable and persistent).
- **Closes** on Escape, when the pointer or focus leaves, on a press on the trigger, and while the trigger's own popup is open. **Escape hides only the tooltip**: focus stays, and an open Popover underneath stays open (1.4.13: dismissable). An open Listbox or Combobox that has focus handles Escape first and closes itself, so the tooltip needs a second Escape (see the contract's Known issues). After Escape it stays hidden until the pointer or focus leaves and comes back.
- **The name is heard once.** The popup is always in the DOM, hidden while closed. `Tooltip.Name` repeats the trigger's name and is `aria-hidden`. `Tooltip.Shortcut` is the trigger's description, so a screen reader says "Fetstil, växlingsknapp, inte nedtryckt, Ctrl+B". Plain text in the popup, with neither part, is the description as a whole. A tooltip with only a name adds nothing for assistive technology, so the whole popup is `aria-hidden` (its role stays) and the trigger gets no description.
- **Never the only name.** Give the trigger an `aria-label` from your translations (or visible text), and start the tooltip with the same text, so a voice-control user can say what they see (2.5.3). Don't use the `title` attribute next to it: it isn't shown on keyboard focus or touch, can't be hovered or dismissed, and is announced twice. A development warning fires for a trigger with no name of its own.
- **Text and keys only.** No link, button or field in a tooltip: a development warning fires. A tooltip on a natively `disabled` button never shows (no pointer events, no focus): use `aria-disabled` (toolbar items always do).
- No strings of its own: the text is yours. Headless: no CSS. With `@kvirn-ui/theme/theme.css` it is a level 3 popup with the `md` radius, 20rem at most, in the top layer, above its trigger and flipping below when there is no room.

## API

### Parts

| Part             | Renders                                                    | Props                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tooltip.Root     | no element                                                 | `open`, `defaultOpen`, `onOpenChange`, `placement`, `offset`, `padding`, `delay`, `closeDelay`, `group` (the controls above)                                                     |
| Tooltip.Trigger  | `<button type="button">`, or your `render`                 | `render` (for example `<Toolbar.Toggle aria-label="Fetstil" />`), and every `<button>` prop. Your `aria-describedby` is joined with the tooltip's. It gets no class and no state |
| Tooltip.Popup    | `<div popover="manual" role="tooltip">`, always in the DOM | `render`, and every `<div>` prop. State: `data-open`, `data-placement`                                                                                                           |
| Tooltip.Name     | `<span aria-hidden="true">`                                | `render`, and every `<span>` prop                                                                                                                                                |
| Tooltip.Shortcut | `<span dir="ltr">`                                         | `render`, and every `<span>` prop. Put `Kbd` in it for keys                                                                                                                      |

Each part is also exported on its own (`TooltipRoot`, `TooltipTrigger`, `TooltipPopup`, `TooltipName`, `TooltipShortcut`), and the hook is `useTooltip`. Every part takes `render`, `ref`, `className` and handlers, which merge with its own. `render` also receives the state: `{ isOpen }`.

### State attributes and classes

| Part             | Class                 | Attribute                                                                                                                                                |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tooltip.Popup    | `kv-tooltip`          | `data-open` while open. `data-placement`: the side in use after flipping (`top`, `bottom`, …). `data-detached` while the trigger is outside the viewport |
| Tooltip.Name     | `kv-tooltip-name`     | `aria-hidden="true"`                                                                                                                                     |
| Tooltip.Shortcut | `kv-tooltip-shortcut` | `dir="ltr"`, and an `id` that is the trigger's `aria-describedby`                                                                                        |

The popup also carries the inline placement of [Popover](../popover/popover.md#placement-and-the-css-variables): `position: fixed`, `left`, `top`, and the variables `--kv-popup-width`, `--kv-popup-max-height` and `--kv-anchor-width`. The theme sets `--kv-popup-width-limit: 20rem` on it.

### `onOpenChange` reasons

| Reason          | When                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `hover`         | The pointer rested on the trigger for `delay`, or arrived while the next tooltip skips the delay            |
| `focus`         | The trigger got keyboard focus. Closing: never                                                              |
| `escape`        | Escape hid it                                                                                               |
| `pointer-leave` | The pointer left the trigger and the tooltip, after `closeDelay`. Also: another tooltip of the group opened |
| `blur`          | The trigger lost focus                                                                                      |
| `trigger-press` | A pointer press on the trigger, or the trigger opened its own popup (`aria-expanded="true"`)                |

### Strings

Tooltip has no strings of its own and announces nothing. The name, the shortcut and the key labels are yours, from your translations.

### Development warnings

Keyed `tooltip-*`, English, for the developer only: a trigger with no accessible name of its own (`tooltip-trigger-without-name`), a popup that holds interactive content (`tooltip-interactive-content`), and a part outside a `Tooltip.Root` (`tooltip-<part>-outside-root`).

## Component

```tsx
import { Icon, Kbd, Toolbar, Tooltip } from '@kvirn-ui/react'

;<Tooltip.Root>
  <Tooltip.Trigger render={<Toolbar.Toggle aria-label="Fetstil" aria-keyshortcuts="Control+B" />}>
    <Icon name="bold" />
  </Tooltip.Trigger>
  <Tooltip.Popup>
    <Tooltip.Name>Fetstil</Tooltip.Name>
    <Tooltip.Shortcut>
      <Kbd>
        <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">B</Kbd>
      </Kbd>
    </Tooltip.Shortcut>
  </Tooltip.Popup>
</Tooltip.Root>
```

The trigger is complete without the tooltip: its name is its own, and `aria-keyshortcuts` is set on it too (keyboard rule: shortcuts are exposed to assistive technology). A screen reader that announces both may read the shortcut twice, but never the name.

`Tooltip.Root` takes the options. They're also the options of the hook:

| Option                 | Default    | Meaning                                                                                                                                                                                  |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen` | `false`    | Controlled with `onOpenChange`, or uncontrolled                                                                                                                                          |
| `onOpenChange`         |            | Every request to open or close, with `{ reason }`. With `open` set, you change it                                                                                                        |
| `placement`            | `top`      | `top`, `bottom`, `start` or `end`, with `-start`, `-center` or `-end`. Above by default, so a tooltip doesn't cover the text the user works on below it. It flips when it doesn't fit    |
| `offset`, `padding`    | 4, 8       | The gap to the trigger and the space kept to the edge of the viewport, in pixels                                                                                                         |
| `delay`                | `500`      | Milliseconds of hover before it opens. Keyboard focus opens it at once                                                                                                                   |
| `closeDelay`           | `100`      | Milliseconds after the pointer leaves before it closes                                                                                                                                   |
| `group`                | the page's | Where tooltips share their delay: when one is open or closed less than 300 ms ago, the next opens at once, and only one tooltip of a group is open. Make one with `createTooltipGroup()` |

## The name and the description

How a screen reader hears it follows from the parts you use:

| In the popup                          | The trigger's `aria-describedby`  | A screen reader says                             |
| ------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `Tooltip.Name` and `Tooltip.Shortcut` | the shortcut                      | "Fetstil, växlingsknapp, inte nedtryckt, Ctrl+B" |
| `Tooltip.Name` only                   | none (the popup is `aria-hidden`) | "Sök, knapp"                                     |
| `Tooltip.Shortcut` only               | the shortcut                      | "Fetstil, växlingsknapp, Ctrl+B"                 |
| plain text, neither part              | the popup as a whole              | "Skriv ut, knapp, Öppnar en utskriftsvy"         |

The popup stays in the DOM while it is closed, so the reference always resolves, even before the tooltip has opened.

## In a toolbar

Wrap a `Toolbar.Button`, `Toolbar.Toggle` or `Toolbar.Item` with `render`: the tooltip adds only a ref, an `aria-describedby` and handlers, so the toolbar's roving `tabindex` and keys work as before. Arrowing along the toolbar gives each control keyboard focus, so each tooltip opens at once and replaces the last. The popup has no focusable content and no role a toolbar treats as an item, so the arrows never land on it. A disabled `Toolbar.Button` stays focusable, so its tooltip works.

## When the trigger opens its own popup

A trigger that opens a Popover or a Listbox (`aria-expanded="true"`) closes its tooltip, and the tooltip stays closed while that popup is open. Wrap it the same way: `<Tooltip.Trigger render={<Popover.Trigger aria-label="Länk" />}>`.

## Hook

```tsx
import { useTooltip } from '@kvirn-ui/react'

function BoldButton() {
  const tooltip = useTooltip({ description: 'shortcut' })
  return (
    <>
      <button {...tooltip.triggerProps} aria-label="Fetstil">
        B
      </button>
      <div {...tooltip.popupProps}>
        <span {...tooltip.nameProps}>Fetstil</span>
        <span {...tooltip.shortcutProps}>Ctrl+B</span>
      </div>
    </>
  )
}
```

It returns `isOpen`, `placement` (the one in use, after a flip), `triggerProps`, `popupProps`, `nameProps` and `shortcutProps`. `description` says what `aria-describedby` points at: `'popup'` (default), `'shortcut'` or `'none'`. The trigger's ref is a callback ref, so it fits any element: `mergeProps(yourProps, tooltip.triggerProps)` merges yours, but join your own `aria-describedby` with `triggerProps['aria-describedby']` instead of replacing it. The timing is `createTooltipMachine` in `@kvirn-ui/core`, which holds no DOM.

## Accessibility

Read the [contract](tooltip.a11y.md) for the keys, focus and what you must provide. In short: give the trigger its own name, start the tooltip with the same text, put only text and keys in it, and never put essential information in it.
