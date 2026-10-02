# ADR-0036: ScrollArea uses native scrolling, is focusable and named when it overflows, and can host a virtualized list

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a scrollable area, with TanStack Virtual when needed. The details below are proposed and open to change.
- **Tags:** api, a11y, theming

## Context

Wide tables (ADR-0035), code samples, long lists and panels need a region that scrolls on its own. The common failures:

- A scrolling `<div>` that keyboard users can't reach, because nothing inside it is focusable (axe `scrollable-region-focusable`, 2.1.1). Chrome makes such scrollers focusable by default since version 130, but Safari doesn't.
- Custom JavaScript scrollbars (as in Radix ScrollArea) that are tiny, ignore forced colours and platform settings ("always show scrollbars"), and reimplement scrolling.
- Overlay scrollbars on macOS, iOS and Android are hidden until the user scrolls, so nothing shows that there's more content.

There's no APG pattern for a scroll container. A focusable scroll region needs an accessible name.

## Decision drivers

- Native scrolling: keyboard, wheel, touch, scroll snapping, platform scrollbar settings and forced colours all work for free.
- Reachable and operable by keyboard in every browser (2.1.1).
- A visible cue that content continues, which also works in forced colours.
- A scroll element that a virtualizer can use (ADR-0034).

## Options considered

### Option A: native overflow, with edge cues (chosen)

- ✅ All platform behaviour and user settings are kept.
- ✅ Small: one scroll listener and one resize observer.
- ❌ Scrollbar look is limited to `scrollbar-color` and `scrollbar-gutter`.

### Option B: custom scrollbars

- ✅ Full visual control.
- ❌ Reimplements a user-agent control, breaks forced colours and user settings, and creates small drag targets. Rejected.

### Option C: no component, document a CSS recipe

- ✅ Nothing to maintain.
- ❌ The focusability, naming and overflow detection are the hard parts, and every adopter would get them wrong. Rejected.

## Decision

We will use Option A:

1. **Parts.** `ScrollArea.Root` (`<div>`, `kv-scroll-area`) doesn't scroll; it draws the edge cues. `ScrollArea.Viewport` (`<div>`, `kv-scroll-area-viewport`) is the element that scrolls. Each part is also a named export. The hook is `useScrollArea()`, which returns `rootProps`, `viewportProps`, `viewportRef` and the overflow state.
2. **Focusable when it overflows.** While the Viewport overflows on either axis, it gets `tabIndex={0}`, so arrow keys, Page Up, Page Down, Home, End and Space scroll it in every browser. When it doesn't overflow, it has no `tabIndex`, so there's no empty tab stop. Overflow is tracked with a `ResizeObserver` on the Viewport and its content.
3. **Named when focusable.** A focusable Viewport has `role="region"` and a name, from `aria-labelledby` (a visible heading or a table caption) or `aria-label`. The name is required: a missing name logs a development warning. A focusable element without a name fails 4.1.2. Inside a Table, the binding names it after the caption.
4. **Edge cues.** The hook sets `data-overflow-start`, `data-overflow-end`, `data-overflow-top` and `data-overflow-bottom` on Root while there's hidden content in that direction (RTL-aware: start and end follow `dir`). The theme draws a shadow at those edges and replaces it with a border in `forced-colors: active`. Updates are throttled to one per animation frame.
5. **Native scrollbars.** The theme sets `scrollbar-color` from tokens and `scrollbar-gutter: stable` where layout shift matters. It never sets `scrollbar-width: none` or `thin`, and never hides the scrollbar.
6. **Focus visible.** A focused Viewport shows the 2px focus ring. Content with sticky headers sets `scroll-padding` so a focused element is never under them (2.4.11).
7. **Virtualization.** ScrollArea doesn't virtualize by itself. It exposes `viewportRef` as the scroll element for a TanStack virtualizer (`getScrollElement: () => scrollArea.viewportRef.current`). For a plain virtualized list:
   - Use `<ul>` and `<li>` with `aria-setsize` and `aria-posinset` on each rendered item.
   - The rules in ADR-0034, item 5 apply: focused items stay mounted, and the binding scrolls before it moves focus.
   - For content that loads more as the user scrolls, use the APG Feed pattern (`role="feed"`, `aria-busy` while loading) in a later plan. Never load more on scroll without a "Load more" button as an alternative.
8. **Out of scope:** scroll snapping helpers, programmatic "scroll to" APIs beyond the native element, and horizontal carousels (which need their own pattern).
9. **Styling hooks.** Classes `kv-scroll-area`, `kv-scroll-area-viewport`. State as `data-overflow-*` and `data-focusable`.

## Accessibility impact

- 2.1.1: the region can be reached and scrolled by keyboard in every browser, including Safari.
- 4.1.2: a focusable region always has a name and the `region` role.
- 1.4.10: wide content such as data tables scrolls inside the region, while the page doesn't scroll sideways.
- 1.4.11 and 1.4.1: the edge cue is a non-text cue, and becomes a border in forced colours.
- 2.4.7 and 2.4.11: visible focus on the region, and sticky content doesn't cover focus.
- 2.5.8: native scrollbars are user-agent controls and are exempt, but we don't make them thinner.
- No APG deviation: there's no pattern. Feed is used for infinite loading.

## Consequences

- Positive: one correct building block for Table, code samples, Listbox popups and panels.
- Negative / trade-offs:
  - Adding and removing a tab stop when overflow changes can surprise a user who is mid-tab. It only happens on resize or content change, and never while the Viewport has focus: a focused Viewport keeps `tabIndex` until it loses focus.
  - The scrollbar can only be styled within what CSS allows.
- Follow-ups: plan and `scroll-area.a11y.md`, and a design spec for the edge cue. Roadmap row: ScrollArea, no APG pattern, M2 (Table and the Listbox popup depend on it).

## Validation

- Component tests: `tabIndex`, role and name only while overflowing, the development warning, `data-overflow-*` in LTR and RTL, and axe (`scrollable-region-focusable`) in every state.
- e2e: Tab reaches an overflowing region, and arrow keys scroll it, in Chromium, Firefox and WebKit. Edge cues in forced colours. Reflow at 320px. A focused item in a virtualized list survives scrolling.
- Manual AT (pending): the region name is announced on focus in NVDA, JAWS, VoiceOver and TalkBack.

## References

- axe rule `scrollable-region-focusable`; Chrome 130 "keyboard-focusable scrollers"
- WAI-ARIA APG: Feed pattern; WAI-ARIA 1.2: `region`, `aria-setsize`, `aria-posinset` on `listitem`
- Adrian Roselli, "Under-Engineered Responsive Tables" (focusable, named scroll container)
- CSS Scrollbars Styling Module Level 1
- ADR-0034, ADR-0035
