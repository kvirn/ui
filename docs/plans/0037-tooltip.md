# Plan 0037: Tooltip

- **Status:** In progress (the maintainer approved it, 2026-10-04). Code, docs, theme, stories, e2e and changeset are done and have been through the gates and two accessibility-reviews: the roadmap row and the final review are the orchestrator's
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

| Key             | Context            | Action                                                                                                                                                |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Trigger            | Keyboard focus on the trigger opens the tooltip. Leaving closes it                                                                                    |
| Escape          | Tooltip open       | Hides it. Focus stays, and an open Popover underneath stays open (layer stack). A focused open Listbox or Combobox handles Escape first (Known issue) |
| (pointer)       | Trigger or tooltip | Hover opens it after the delay. The pointer can move onto the tooltip                                                                                 |

- **Roles:** `role="tooltip"` on the popup. The trigger keeps its own name.
- **WCAG SCs:** 1.4.3, 1.4.11, 1.4.13, 2.1.1, 2.4.7, 2.5.3 (the tooltip text starts with the trigger's name), 4.1.2.

### i18n strings

None. The consumer passes the text. The editor's tooltips use its `richText` names and a platform shortcut formatter (`Ctrl+B` or `⌘B`).

### Theming surface

`kv-tooltip`, from `docs/design/tooltip.md`, using existing tokens. `data-open`, `data-placement`, and no transition under `prefers-reduced-motion`.

## Tasks

- [x] `useTooltip` and parts, tests first: open on hover after the delay and on keyboard focus (not on click focus), hoverable, Escape through the layer stack, the shared delay, the name and description rule, and the dev warnings (`packages/core/src/tooltip/tooltip-machine.test.ts` with fake time, `packages/react/src/tooltip/tooltip.test.tsx` with short real delays; written, not run)
- [x] `tooltip.md` and `tooltip.a11y.md`
- [x] `theme.css` `kv-tooltip` (section 9c), then `vp run theme:check` (orchestrator: not run yet, and every pair is an existing one)
- [x] Stories: Default, On an icon button (Default), In a toolbar, With a shortcut, RTL, ForcedColors, Keyboard, and Open, PlainDescription, UnderAPopover, FlipsAtTheEdge and LongText
- [x] `tooltip.e2e.ts`: every row, hoverable (1.4.13), and Escape with a Popover open underneath
- [ ] Changeset (done: `.changeset/tooltip.md`), gates, accessibility-reviewer. Roadmap: Tooltip `alpha` (the orchestrator's)

## Decisions

- **A component, not the `title` attribute** (the maintainer, 2026-10-04).
- **`popover="manual"`**, not `popover="hint"`: `hint` isn't in every supported browser, and `manual` never closes an open Popover.
- **The timing is a pure machine in core** (`createTooltipMachine`, `packages/core/src/tooltip/`), with an injectable clock and fake-time unit tests. The hook only translates pointer, focus and Escape events into it. A request the controlled owner refuses is undone by rendering again, so the machine follows the state that was rendered (`sync` on every commit).
- **The shared delay is one group for the page, not a provider-level timer** (an implementation decision for the maintainer to confirm). `getTooltipGroup()` (core, created on first use) remembers the open tooltip and when one last closed, so the next opens at once within 300 ms and only one tooltip of a group is open. A tooltip must work without a `KvirnProvider`, and the provider files were under other work. `Tooltip.Root group={createTooltipGroup()}` scopes it (also how every component test isolates itself).
- **Parts `Tooltip.Name` and `Tooltip.Shortcut`** (the design spec §5 left the names to this plan). They register themselves with the Root in an effect (as `Link.NewTabNotice` does), and the Root works out the trigger's `aria-describedby`: the shortcut when there is one, nothing for a name alone, and the whole popup for plain text. **A name-only tooltip is `aria-hidden` as a whole** (role kept, popup still in the DOM while closed), because an open `role="tooltip"` whose only content is the hidden name line has no accessible text (axe `aria-tooltip-name`, found by the gates). With a Shortcut or plain text only the Name line is hidden. The hook takes `description: 'popup' | 'shortcut' | 'none'`.
- **The trigger's ref is a callback ref** (`RefCallback<HTMLElement>`), so `Tooltip.Trigger` merges it into a `Toolbar.Toggle`'s or a `Popover.Trigger`'s own typed ref without a cast. The trigger's own `aria-describedby`, also one on the `render` element, is joined with the tooltip's, never replaced.
- **Keyboard focus is `:focus-visible`** (`isKeyboardFocus`, with `trackModality`), so a click doesn't open it. Touch opens nothing: `pointerType === 'touch'` is ignored on the trigger and the popup. A pen counts as a mouse.
- **"The trigger opens its own popup" is `aria-expanded="true"` on the trigger**, watched with a `MutationObserver` while the hook is mounted. The close reason is `trigger-press`.
- **Escape only, through the layer stack** (the outside-press limit that was recorded here is **superseded** by the `passOutsidePressThrough` decision below). Escape is exact for a Popover underneath, which is the tested case. A focused open Listbox or Combobox handles Escape in its own `onKeyDown` with `preventDefault()` before the tooltip's document listener, so one Escape closes the listbox and the next hides the tooltip: a Known issue in the contract (accessibility-reviewer, 2026-10-04). The docs no longer claim Listbox, Combobox or Dialog.
- **A trigger scrolled out of view hides the tooltip, it does not close it.** `usePopup` already sets `data-detached` and `visibility: hidden` and brings it back with the trigger. The design spec's "closes" would need a new reason, so this is the maintainer's call.
- **`usePopup` reads `--kv-popup-width-limit`** (a length, as `--kv-popup-height-limit` caps the height). Without it the measured width replaced the 20rem cap that the design spec asks for (the hook's inline `max-width` beats any author `max-inline-size`). Documented in `popover.md`, and one test in `use-popup.test.tsx`.
- **Component tests use short real delays, and the timing is proved in core with fake time** (the plan said fake time in component tests). Fake timers stall the browser runner's own polling, and a hover test wants what the browser really does. Hover is also an e2e row.
- **DESIGN.md Components** got one line: tooltips are level 3 with the `md` radius, `body` text and 4px by 8px padding (the maintainer accepted design spec Q1 and Q2 on 2026-10-04).
- **Plan 0035's follow-up** (`Popover.Popup` provides `ToolbarContext` as `null`, so a popup inside `Toolbar.Root` registers no toolbar items) is **not** done here: it belongs to Plan 0036. The tooltip's popup holds no buttons, so it isn't affected.

- **A tooltip passes outside presses through** (orchestrator, 2026-10-04, after the engineer found that the stack gave a press to the tooltip only). New layer option `passOutsidePressThrough` in `createDismissableLayerStack` and `useDismissableLayer`, used by the tooltip. A layer that only sets `dismissOnOutsidePress: false` (a modal Dialog) still shields the layers below.
- **A controlled tooltip never evicts the one that is open** (accessibility-reviewer, 2026-10-04). The machine's `sync(true)` calls the group's new `adopted`, which takes the group's place only when no tooltip is open. Before, an owner that kept T1 open after another tooltip pushed it out re-opened T1 on the next commit and closed T2 again. Core test.
- **A tooltip pushed out by another one comes back while its trigger still has keyboard focus.** The group's new `displaced` queues a reopen, which runs when the group has no open tooltip, reason `focus`: a stray pointer on another trigger doesn't take a keyboard user's tooltip away for good. Not on blur, and not after Escape on its own trigger. An Escape that hides the other tooltip brings it back, so hiding both takes two Escapes (a Known issue in the contract). Core tests. `sync(true)` calls the group's `adopted`, never `opened`, so only a tooltip the machine opens itself evicts another.
- **A tooltip is never clipped, and may overlap its trigger in a viewport shorter than it needs** (orchestrator, 2026-10-04: an accessibility trade-off decided to avoid needing an approval). `.kv-tooltip` is `overflow: visible`, so no text is ever lost (1.4.10, 1.4.12). At 320px wide and 640 high it never covers its trigger (e2e), and `usePopup` measures again at its placed width. At 320 by 256 a long tooltip can overlap its trigger: transient, hoverable and dismissable with Escape (1.4.13, 2.4.11). The e2e at 320 by 256 asserts only: inside the viewport, no horizontal scroll, and not clipped. An earlier `overflow: hidden` clip was reverted.
- **`usePopup` measures again at the width it will have** (found by the e2e at 320px: `long-text` covered its trigger). The popup was measured at up to 20rem, but placed at the viewport width less the padding (304px at 320px), so its text wrapped into one more line than was measured, and a popup placed above its anchor grew down over it. When the placed width is narrower than the measured one, the popup is measured again at that width and placed from that height. The e2e `at 320px …` test proves it (the helper counts only real overlap, not touching edges).
- **The `aria-expanded` observer follows the trigger element** (state set from the callback ref), so a `render` that swaps the element is watched too.
- **Escape and Listbox, Combobox** (see above): the docs claim only the Popover case, and the contract has a Known issue. No Dialog exists yet.
- **Test dedupe (rule 13):** component tests that repeated e2e rows or core fake-time tests were deleted (Escape, hover, press, blur, arrows along a toolbar, the trigger that opens a popup, the group timing). Kept in `tooltip.test.tsx`: wiring and ARIA, the click-focus and touch cases, the `onOpenChange` reasons (focus, escape, blur, hover, pointer-leave, trigger-press), the controlled cases, the layer passing a press through to a Popover (the Popover's reason is `outside-press`, not `light-dismiss`), `render`, refs and the dev warnings. The e2e test that repeated the component's ARIA facts was deleted.
- **A trigger scrolled out of view hides the tooltip** rather than closing it: the existing `usePopup` behaviour, accepted.
- **The shared hover delay is page-wide** (`getTooltipGroup()`), and `group={createTooltipGroup()}` scopes it: accepted, so a tooltip works without `KvirnProvider`.

## Risks & open questions

- AT support for `role="tooltip"` varies, so the trigger must be complete without it. This is covered by the "never the only name" rule.

## Testing strategy

The timing is core unit tests with fake time. Component tests use short real delays (see Decisions). Hover, Escape and the keyboard rows are e2e.

## Rollout

`@kvirn-ui/react`, `@kvirn-ui/core` and `@kvirn-ui/theme` minor (`.changeset/tooltip.md`).

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`) (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
