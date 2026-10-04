# Plan 0037: Tooltip

- **Status:** Approved (the maintainer, 2026-10-04)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0035](0035-toggle-toolbar-button-group.md), [0036](0036-rich-text-editor.md) (the first user), Popover and the dismissable layer stack, [design spec](../design/tooltip.md), `overlays-and-lists`, `accessibility`, `keyboard`, `api-conventions`, `testing`, `storybook-docs` and `theme-css` skills

## Goal

A sighted user who hovers or tabs to an icon-only button sees what it does and its shortcut ("Fetstil (Ctrl+B)"). A magnifier user can move the pointer onto the tooltip without it vanishing, and anyone can hide it with Escape. A screen reader user hears the name once.

## Non-goals

- No interactive content in a tooltip (links, buttons). That is a Popover.
- No tooltip on touch. A long press isn't discoverable, and an icon-only control must be named without its tooltip anyway.
- No `title` attribute anywhere (the maintainer, 2026-10-04). It doesn't show on keyboard focus or touch, it can't be hovered or dismissed (1.4.13), and next to `aria-label` it's announced twice.
- No tooltips on disabled native buttons, which get no pointer events. Toolbar buttons are focusable when disabled (Plan 0035), so they work.

## Background

- **APG Tooltip** (<https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/>): `role="tooltip"`, shown on focus and hover, Escape hides it, focus stays on the trigger. The pattern is still marked as work in progress, and AT support for `role="tooltip"` varies.
- **WCAG 1.4.13 Content on Hover or Focus:** the tooltip is dismissable without moving the pointer or focus (Escape), hoverable (the pointer can move onto it), and persistent (it stays until hover or focus ends, or it's dismissed).
- **The keyboard skill** already has the row "Tooltip, Escape: hides the tooltip without moving focus (1.4.13)".
- **Reusable code:** `computePlacement` and `usePopup` for placement and flipping, the native `popover` top layer (`popover="manual"`, so it never light-dismisses an open Popover), and the dismissable layer stack for Escape.

## Design

### API sketch

```tsx
<Tooltip.Root>
  <Tooltip.Trigger render={<Toolbar.Toggle aria-label="Fetstil" aria-keyshortcuts="Control+B" />}>
    <Icon name="bold" />
  </Tooltip.Trigger>
  <Tooltip.Popup>Fetstil (Ctrl+B)</Tooltip.Popup>
</Tooltip.Root>
```

- **`useTooltip`** takes `{ open, defaultOpen, onOpenChange(open, { reason }), placement = 'top', delay, closeDelay }`. It returns `{ isOpen, triggerProps, popupProps }`. The reasons are `hover`, `focus`, `escape`, `pointer-leave`, `blur` and `trigger-press`.
- **Opens** on hover, after a delay, and on keyboard focus (focus-visible, so a click doesn't open it). **Stays open** while the pointer is on the trigger or the tooltip, with a short grace period to cross the gap. **Closes** on Escape, blur, pointer leave or a press on the trigger. Once one tooltip has opened, moving to the next trigger opens its tooltip without the delay (a shared provider-level timer), so moving along a toolbar isn't slow.
- **Name versus description** (design spec `tooltip.md` §7): the popup stays in the DOM while closed (hidden with the `popover` attribute), so a reference to it always resolves. Its name line is `aria-hidden`, because the trigger already has that name. Its shortcut line is the trigger's `aria-describedby`, because `aria-keyshortcuts` alone isn't reliably announced. A screen reader hears "Fetstil, knapp, Ctrl+B" once.
- **Dev warnings:** interactive content inside `Tooltip.Popup`, and a trigger without an accessible name of its own (a tooltip is never the only name).

### Accessibility contract (draft)

| Key             | Context            | Action                                                                                    |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Trigger            | Keyboard focus on the trigger opens the tooltip. Leaving closes it                        |
| Escape          | Tooltip open       | Hides it. Focus stays, and an open Popover or Listbox underneath stays open (layer stack) |
| (pointer)       | Trigger or tooltip | Hover opens it after the delay. The pointer can move onto the tooltip                     |

- **Roles:** `role="tooltip"` on the popup. The trigger keeps its own name.
- **WCAG SCs:** 1.4.3, 1.4.11, 1.4.13, 2.1.1, 2.4.7, 2.5.3 (the tooltip text starts with the trigger's name), 4.1.2.

### i18n strings

None. The consumer passes the text. The editor's tooltips use its `richText` names and a platform shortcut formatter (`Ctrl+B` or `⌘B`).

### Theming surface

`kv-tooltip`, from `docs/design/tooltip.md`, using existing tokens. `data-open`, `data-placement`, and no transition under `prefers-reduced-motion`.

## Tasks

- [ ] `useTooltip` and parts, tests first: open on hover after the delay and on keyboard focus (not on click focus), hoverable, Escape through the layer stack, the shared delay, the name and description rule, and the dev warnings
- [ ] `tooltip.md` and `tooltip.a11y.md`
- [ ] `theme.css` `kv-tooltip`, then `vp run theme:check`
- [ ] Stories: Default, On an icon button, In a toolbar, With a shortcut, RTL, ForcedColors, Keyboard
- [ ] `tooltip.e2e.ts`: every row, hoverable (1.4.13), and Escape with a Popover open underneath
- [ ] Changeset, gates, accessibility-reviewer. Roadmap: Tooltip `alpha`

## Decisions

- **A component, not the `title` attribute** (the maintainer, 2026-10-04).
- **`popover="manual"`**, not `popover="hint"`: `hint` isn't in every supported browser, and `manual` never closes an open Popover.

## Risks & open questions

- AT support for `role="tooltip"` varies, so the trigger must be complete without it. This is covered by the "never the only name" rule.

## Testing strategy

Timers use fake time in component tests. Hover and Escape are e2e.

## Rollout

`@kvirn-ui/react` minor.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
