# Popover

> **Draft** (Plan 0022, Phase 2). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [popover.a11y.md](popover.a11y.md), and the decisions are in the overlays-and-lists skill.

A Popover is a small floating panel that a button opens: a hint, a short form, a few controls. The browser puts it in the **top layer**, so no ancestor's `overflow` clips it and you never fight `z-index`. KvirnUI places it next to the button, flips it when there is no room, keeps it inside the viewport and lets it scroll inside when it is too tall.

- Four parts: `Popover.Root` (no element, it owns the open state), `Popover.Trigger` (`<button>`), `Popover.Popup` (`<div popover="auto" role="dialog">`) and `Popover.Close` (`<button>`). Each is also exported on its own (`PopoverRoot`, `PopoverTrigger`, `PopoverPopup`, `PopoverClose`), and the hook is `usePopover`.
- **Non-modal.** The page behind stays reachable and is never `inert`. For content that must take over the page, use a Dialog.
- **Escape and a press outside close it,** and focus goes back to the button if it was in the popup. Pressing the button again toggles.
- **Opening never moves focus.** The popup follows the trigger in the Tab order, so render `Popover.Popup` right after `Popover.Trigger`.
- **Name the popup** with `aria-label` or `aria-labelledby`: its role is `dialog`. A development warning fires without a name.
- **In a toolbar.** A `Popover.Trigger` can be a `Toolbar.Item`. The popup then sits in the toolbar's React tree, so `Popover.Popup` leaves the toolbar's context: a form in it never registers as toolbar items, and its `ButtonGroup` or `Listbox` doesn't act as if it were in the toolbar (Plan 0036).
- No strings of its own: the labels are yours, in the page's language.
- Headless: no CSS. The parts render `kv-popover-trigger`, `kv-popover-popup` and `kv-popover-close`, and your `className` joins them. The only inline styles are the placement: `position: fixed`, `left`, `top`, `box-sizing`, `max-width` and `max-height`. The default theme doesn't style Popover yet.

## Component

```tsx
import { Popover } from '@kvirn-ui/react'

;<Popover.Root>
  <Popover.Trigger>Om tjänsten</Popover.Trigger>
  <Popover.Popup aria-label="Om tjänsten">
    <p>Tjänsten drivs av kommunen och är öppen dygnet runt.</p>
    <Popover.Close>Stäng</Popover.Close>
  </Popover.Popup>
</Popover.Root>
```

`Popover.Root` takes the options. They're also the options of the hook:

| Option                        | Default          | Meaning                                                                                                                                                                                                                                |
| ----------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`        | `false`          | Controlled with `onOpenChange`, or uncontrolled                                                                                                                                                                                        |
| `onOpenChange(open, details)` |                  | Every request to open or close. `details.reason` is `'trigger-press'`, `'close-press'`, `'escape'`, `'outside-press'` or `'light-dismiss'` (the platform hid it), and `details.event` the native event. With `open` set, you change it |
| `placement`                   | `'bottom-start'` | `top`, `bottom`, `start` or `end`, with `-start`, `-center` or `-end`. `start` and `end` follow the reading direction. It flips when it does not fit                                                                                   |
| `offset`                      | `4`              | The gap to the trigger, in pixels                                                                                                                                                                                                      |
| `padding`                     | `8`              | The space kept to the edge of the viewport, in pixels                                                                                                                                                                                  |
| `matchAnchorWidth`            | `false`          | Make the popup exactly as wide as the trigger                                                                                                                                                                                          |

Every part takes `render` to change its element, and `className`, `style`, handlers and refs merge with its own. `render` also receives the state: `{ isOpen }`.

## Hook

```tsx
import { usePopover } from '@kvirn-ui/react'

function Help() {
  const popover = usePopover({ placement: 'bottom-end' })
  return (
    <>
      <button {...popover.triggerProps}>Hjälp</button>
      <div {...popover.popupProps} aria-label="Hjälp">
        <button {...popover.closeProps}>Stäng</button>
      </div>
    </>
  )
}
```

It returns `isOpen`, `placement` (the one in use, after a flip), `triggerProps`, `popupProps` and `closeProps`. The refs are in the props: `mergeProps(yourProps, popover.triggerProps)` merges yours.

## Placement and the CSS variables

The popup is placed with `position: fixed`, so it needs no positioned ancestor, and it never animates its position. It carries:

| Attribute or variable     | Meaning                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-open`               | Present while open                                                                                                                                              |
| `data-placement`          | The side in use after flipping: `bottom-start`, `top`, `end-start`                                                                                              |
| `--kv-popup-width`        | The popup's width: never more than the viewport minus `padding`                                                                                                 |
| `--kv-popup-max-height`   | The room left on its side of the trigger. The popup is limited to it and scrolls inside, so it fits at 320px and at 400% zoom                                   |
| `--kv-popup-height-limit` | Yours: a length that caps the popup height below the room left (default none). The default theme sets 20rem on the listbox popup, so a long list scrolls inside |
| `--kv-popup-width-limit`  | Yours: a length that caps the popup width below the room left (default none). The default theme sets 20rem on the tooltip, so long text wraps                   |
| `--kv-anchor-width`       | The trigger's width, for `min-width: var(--kv-anchor-width)`                                                                                                    |

It never covers the trigger (WCAG 2.4.11). It is placed again on scroll, on resize and when the trigger or the popup changes size.

## Shared hooks

`usePopup` and `useDismissableLayer` are what Popover is built on, and what Listbox, Combobox, Menu and Select reuse:

- `usePopup({ open, anchorRef, popupRef, placement, offset, padding, matchAnchorWidth, popover, onNativeDismiss })` shows and hides the element with the native `popover` attribute and places it. `popover: 'manual'` leaves the closing to you: use it where focus stays in an input. Where the Popover API is missing it toggles `hidden`.
- `useDismissableLayer({ open, onDismiss, ref, ignore, dismissOnEscape, dismissOnOutsidePress, passOutsidePressThrough })` reports Escape and outside presses, with the reason `'escape'` or `'outside-press'`. Open layers share one stack and only the top one reacts. `dismissOnOutsidePress: false` alone still shields the layers below it, and `passOutsidePressThrough: true` (a tooltip) lets an outside press go through to the next layer. `ignore` takes predicates that make targets outside the layer, such as a Combobox's input and button, count as inside.

## Accessibility

Read the [contract](popover.a11y.md) for the keys, focus and what you must provide. In short: name the popup, name the trigger, render the popup right after the trigger, and give a popup with a form or several controls a visible Close button. A card that opens on hover or focus is a Tooltip, not a Popover (1.4.13).
