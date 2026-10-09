# Focus management

> **Draft** (Plan 0085). The accessibility contract is [focus.a11y.md](focus.a11y.md).

`useFocus` and `FocusScope` move, hold and return focus for your own drawer, wizard step or layout, so what you build behaves like Dialog, Menu and the docs site. Every example below is a live story.

```tsx
const { scopeProps } = useFocus({ active: open, contain: 'loop', onEscape: close })
<aside {...scopeProps} aria-label="Filter">…</aside>

<FocusScope active={open} contain="loop" onEscape={close} as="aside" aria-label="Filter">…</FocusScope>
```

## Native first

A native `<dialog>` opened with `showModal()` holds focus, makes the page `inert` and returns focus, with no code. The `inert` attribute and the native `popover` do the same for their cases. Reach for `useFocus` only for what they don't cover: a drawer that is not a dialog, a wizard step, a layout that changes under a router. Inside a native modal `<dialog>` the page is already `inert`, so `contain` is redundant there.

## API

- `active`: focus moves in when it becomes `true` and returns when it becomes `false`.
- `restore` (default `true`): focus returns to `finalFocusRef`, else `triggerRef`, else the element that had focus before, never `body`. Focus the user moved elsewhere is never taken.
- `initialFocus`: `'first'` (default), `'container'`, `'none'`, a selector or a ref. A target that is gone falls through to the first stop, then the container.
- `contain`: `false` (default), `'loop'` or `'inert'`.
- `onEscape`: called on Escape inside a contained scope. You close the scope.
- `moveOn`: `{ key, selector, containerRef }`. Focus moves to `selector` (default `h1`) when `key` changes, never on the first render.
- `onLost`: called when nothing could take focus.

It returns `{ scopeProps, captureOpener, wasFocusSeen, focusFirstAvailable, isFocusTarget }`. `focusFirstAvailable` never focuses `body`. `useRouteFocus` is built on the same move code and keeps its own options.

## Which mode

- **`contain: false`**: restore and initial focus only. The right choice for most drawers and panels: Tab can leave, as it can on the page.
- **`'loop'`**: Tab and Shift+Tab wrap at the scope's ends, as in the APG dialog. It reads the stops at key time, so a stop added later is included.
- **`'inert'`**: the rest of the page is `inert` while the scope is active, so Tab stays inside without any wrapping and the browser's own chrome stays reachable. Live regions and the Toast region are left alone. A sibling added while the scope is open is not made `inert`.
- **`moveOn`**: no scope at all. A wizard step or a route changes, focus goes to its heading, and Tab continues after it.

## Always give a way out

A scope that holds focus must give a keyboard user a way out (2.1.2). Pass `onEscape` and close the scope in it. A development warning (`focus-scope-no-exit`) says when `contain` is set without it.

## Focus ring

Where focus lands shows the ring under `:focus-visible`. See [Focus ring](?path=/docs/foundation-focus--docs). Keep `scroll-padding` above a sticky header so the focused element is not hidden (2.4.11).
