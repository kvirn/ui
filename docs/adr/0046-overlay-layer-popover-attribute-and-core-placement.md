# ADR-0046: Popups use the native `popover` attribute for the top layer and a small pure placement function in `core`

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked to build the parts Combobox needs (Listbox, Popover, DismissableLayer). The details below are proposed and open to change.
- **Tags:** architecture, api, a11y

## Context

ADR-0037 says positioning "comes from Popover (M2)" and dismissal "from DismissableLayer (M1)", and neither exists. Combobox, Select, Menu, Tooltip and Dialog all need a floating layer, so the mechanism has to be decided once.

Constraints already fixed:

- Browser support is the last 2 evergreen versions, Safari 17 or later, and no polyfills (`docs/architecture.md`).
- No runtime dependencies other than React and `@tanstack/store` (hard rule 6). That rules out Floating UI without an ADR.
- `core` is pure: no `window` or `document` at module scope, and DOM access goes through the injected `Env`.
- Floating layers never cover focus (2.4.11), and content must reflow at 320px (1.4.10).

## Decision drivers

- Escape the stacking context and `overflow: hidden` ancestors without a portal in every case.
- Light dismiss and Escape handled by the platform where possible.
- Placement that flips and shifts at viewport edges, and tracks scroll and resize.
- Works on Safari 17 and the iOS system browser.

## Options considered

### Option A: native `popover` attribute plus a pure placement function in `core` (chosen)

- ✅ The top layer is free. No z-index wars, no clipping by ancestors.
- ✅ `popover="manual"` for Combobox (focus stays in the input, so the platform's light dismiss must not steal it), `popover="auto"` for Popover and Menu.
- ✅ The placement maths (`computePlacement(anchorRect, popupRect, viewport, options)`) is pure and unit tested. The React binding measures and applies it.
- ✅ No dependency.
- ❌ We own flip, shift and size logic, and must test it well.

### Option B: CSS anchor positioning

- ✅ No JavaScript positioning.
- ❌ Not in Safari 17 to 25, and we ship no polyfills. Revisit as progressive enhancement in a later ADR.

### Option C: Floating UI

- ✅ Mature.
- ❌ A new runtime dependency (hard rule 6), and it still needs our own a11y layer. Rejected.

## Decision

We will use Option A:

1. **Core** (`packages/core/src/overlay/`):
   - `computePlacement`: inputs are rectangles and a preferred `placement` (`bottom-start` default), `offset`, `padding`, and `matchAnchorWidth`. Output is `{ x, y, placement, maxHeight, width }`. It flips when there's no room, shifts to stay inside the viewport, and limits `maxHeight` to the available space. It never returns a position that covers the anchor (2.4.11).
   - `createDismissableLayer`: a layer stack (for Escape and outside-press ordering, so only the top layer reacts). Pure state, with events passed in.
2. **React.**
   - `Popover` (Root, Trigger, Popup, Close): `Popup` renders with the `popover` attribute and is positioned with `computePlacement` on open, on scroll and on resize (`ResizeObserver` through `Env`).
   - `usePopup` is the shared hook (anchor ref, popup ref, placement, open state) used by Popover, Select and Combobox.
   - `DismissableLayer` as a hook, `useDismissableLayer`: Escape and outside press, with the option to ignore the anchor (Combobox's input and button are "inside").
   - No `Portal` part is needed for the popup (the top layer replaces it). A `Portal` stays on the roadmap for Dialog and Toast.
3. **Exposed state.** `data-open`, `data-placement`, and the CSS variables `--kv-popup-width`, `--kv-popup-max-height` and `--kv-anchor-width`, so the default theme can style without JavaScript knowing about it.
4. **Reduced motion.** No positional animation. Opacity only, and none under `prefers-reduced-motion`.
5. **Reflow.** At 320px the popup is at least as wide as the anchor and never wider than the viewport minus padding. It scrolls inside.
6. **CSS anchor positioning** is out of scope. A later ADR can use it as an enhancement once the baseline allows.

## Accessibility impact

- 2.4.11: placement never covers the anchor, and the popup doesn't cover the focused element.
- 1.4.10: the popup is constrained to the viewport and scrolls inside.
- 1.4.13: a popup that appears on hover or focus (Tooltip) must stay dismissible, hoverable and persistent. That belongs to the Tooltip plan.
- 2.1.1, 3.2.1: opening a popup never moves focus unless the pattern says so. Combobox keeps focus on the input.
- A popover doesn't make the page behind it `inert`. Modal behaviour is Dialog's job, not Popover's.

## Consequences

- Positive: one overlay mechanism for five components, no dependency, easy to unit test.
- Negative / trade-offs: we maintain placement logic. `popover` behaviour differs slightly between browsers (light dismiss, `toggle` events), so the e2e run on Safari 17 and the AT matrix must cover it.
- Follow-ups: plan for Listbox, Popover and Combobox (0021), and an ADR to adopt anchor positioning later.

## Implementation notes (Popover, Plan 0022 Phase 2)

Details settled while building `usePopup`, `useDismissableLayer` and `Popover`. They stay inside the decision above and are open to change in review.

1. **The popup is a non-modal `role="dialog"`,** named by the consumer (`aria-label` or `aria-labelledby`, with a dev warning). The trigger has `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. It is always rendered and hidden by the browser while closed, so `aria-controls` always points at an element.
2. **Opening never moves focus.** The popup follows the trigger in the DOM, so Tab goes into it. A consumer who wants focus in a form moves it in an effect after `open`. React's `autoFocus` and the native `autofocus` attribute don't help here: React runs `focus()` once at mount, while the popup is still hidden.
3. **Focus returns to the trigger** on Escape, Close, an outside press and a light dismiss, but only when focus was inside the popup, on `body` or on the trigger. A press on another control keeps focus on that control. A press on the trigger is a toggle and never an outside press (`ignore`).
4. **A mouse or touch click on the trigger toggles from the state its press found.** The platform's own light dismiss (`popover="auto"`) can hide the popup between `pointerup` and `click`, and the click must not open it again. Enter and Space (a click with `detail` 0) toggle from the current state.
5. **A touch outside press dismisses when the finger lifts,** and not at all when the gesture becomes a scroll (`pointercancel`), as the platform's light dismiss does. Mouse and pen dismiss on `pointerdown`. Escape is read on the document after the page's handlers: a key that was `preventDefault()`ed, or that is part of an IME composition, doesn't dismiss.
6. **`usePopup` reports a platform hide** (a light dismiss, or another auto popup opening) through `onNativeDismiss`, so the owner's state matches the page. The popover mode is a hook option: `auto` for Popover and Menu, `manual` for Combobox.
7. **Placement is measured at the popup's natural size** (in the corner, without `max-height`) and applied as inline `position: fixed`, `left`, `top`, `box-sizing: border-box`, `max-width` and `max-height`, plus the three CSS variables. The popup's own scroll position is kept, and a scroll inside the popup does not trigger a placement. Resizes of the anchor and the popup are handled in the next animation frame.
8. **Layer order is the order of opening,** held in one lazily created module-level stack (`getLayerRegistry`), so importing the React package reads no `window`. A layer keeps its place while its options change.
9. **One Escape closes one layer.** A nested popover is a DOM descendant of the outer popup, so the platform keeps the outer one open when the inner one shows. The bug was elsewhere: our document `keydown` handler closes the inner popup (hiding it synchronously), and then the browser's own close request, which is the key's default action, found the outer popup on top of the native stack and closed it too. `useDismissableLayer` therefore calls `preventDefault()` on an Escape it handles, which cancels the browser's close request (it only fires for an uncancelled keydown). We keep `popover="auto"` for Popover and handle dismissal with our stack. `showPopover({ source })` and `popover="manual"` for nested popups were considered and not needed. A native dialog or popover outside our stacks doesn't see that Escape: an Escape that closes one of our layers never reaches it.
10. **`onOpenChange` reasons** are `'trigger-press' | 'close-press' | 'escape' | 'outside-press' | 'light-dismiss'`.

## Validation

- Unit tests on `computePlacement`: flip, shift, `maxHeight`, RTL, tiny viewport, and "never covers anchor".
- Component tests: `popover` attribute state, Escape and outside press, only the top layer closes, and axe in open and closed states.
- e2e: 320px reflow and forced-colors projects with the popup open.

## References

- HTML Standard: `popover` attribute
- WCAG 2.2: 1.4.10, 1.4.13, 2.4.11
- ADR-0003, ADR-0036, ADR-0037
