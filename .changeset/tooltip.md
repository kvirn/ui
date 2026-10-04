---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Tooltip (Plan 0037). Additive.

- `@kvirn-ui/react`: `Tooltip` (`Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Popup`, `Tooltip.Name`, `Tooltip.Shortcut`, each also exported flat) and `useTooltip`. A short label for a control, shown on hover (after 500 ms) and at once on keyboard focus, never on touch. It stays while the pointer is on the trigger or the tooltip and has no timeout, Escape hides only the tooltip (through the dismissable layer stack: a Popover underneath stays open, and an outside press goes through to it), and it closes on blur, pointer leave, a press on the trigger and while the trigger's own popup is open (WCAG 1.4.13). The popup is a `popover="manual"` `role="tooltip"`, always in the DOM. `Tooltip.Name` is `aria-hidden` and `Tooltip.Shortcut` is the trigger's `aria-describedby`, so a screen reader hears the name once and learns the shortcut. Works on `Toolbar.Button`, `Toolbar.Toggle` and `Toolbar.Item` through `render`. Options: `open`, `defaultOpen`, `onOpenChange(open, { reason })`, `placement`, `offset`, `padding`, `delay`, `closeDelay` and `group`. Development warnings: a trigger with no name of its own, interactive content in the popup, and a part outside a Root. `createTooltipGroup` and the types `TooltipChangeReason` and `TooltipGroup` are re-exported from core. `usePopup` reads a new `--kv-popup-width-limit` (a length) that caps a popup's width, as `--kv-popup-height-limit` caps its height.
- `@kvirn-ui/core`: `createTooltipMachine` (the pure timing: hover delay, keyboard focus at once, the grace period, Escape and press dismissal), `createTooltipGroup` and `getTooltipGroup` (the shared delay), the defaults `defaultTooltipDelay`, `defaultTooltipCloseDelay` and `defaultTooltipSkipDelay`, and the types `TooltipMachine`, `TooltipMachineOptions`, `TooltipGroup`, `TooltipGroupOptions`, `TooltipTimers` and `TooltipChangeReason`.
- `@kvirn-ui/theme`: `kv-tooltip`, `kv-tooltip-name` and `kv-tooltip-shortcut`: a level 3 popup with the `md` radius, 20rem at most, fading in only when motion is allowed, and a `Canvas` and `CanvasText` edge in forced colours.
