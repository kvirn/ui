# Accessibility contract: Focus (`useFocus`, `FocusScope`)

- **APG pattern:** Dialog (Modal) focus rules: initial focus, Tab loop, return. The WCAG technique for moving focus on a view change (see [route-focus.a11y.md](../route-focus/route-focus.a11y.md)).
- **Deviations:** none. Dialog itself keeps the native Tab order (approved, `keyboard` skill) and uses only the shared return code.
- **Native elements used:** the consumer's own element (`<aside>`, `<div>`, `<section>`). Native `<dialog>.showModal()` and the `inert` attribute are the first choice; this is for what they don't cover.
- **Status:** in progress (Plan 0085). Gates pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `use-focus.test.tsx` next to this file.

`useFocus` moves focus into a scope when it becomes active, can hold it there (`contain`), and returns it when the scope ends. It renders nothing and adds no role or ARIA: the consumer picks `role="dialog"`, `aria-modal`, a label.

## Roles, states, properties

| Part  | Element / role         | ARIA | Notes                                                                                                                                                        |
| ----- | ---------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope | the consumer's element | none | `tabindex="-1"` is added only while the scope itself takes focus (no Tab stop inside) and removed on blur                                                    |
| Page  | siblings of the scope  | none | With `contain: 'inert'`, `inert` is set on the siblings of the scope and its ancestors while active and removed after. Elements already `inert` stay `inert` |
| Live  | Announcer, Toast       | none | Live regions and `.kv-toast-region` are never made `inert`                                                                                                   |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Focus moves programmatically when `active` changes. With `contain: 'loop'` only the two ends of the scope are handled; every other Tab is the browser's.

| Key       | Context                              | Action                                                                      | Test                                                                                                                               |
| --------- | ------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tab       | `contain: 'loop'`, on the last stop  | Moves to the first stop in the scope                                        | `use-focus.test.tsx › keyboard › Tab on the last stop wraps to the first`                                                          |
| Tab       | `contain: 'loop'`, elsewhere         | Native: the next stop                                                       | `use-focus.test.tsx › keyboard › Tab inside the loop moves on as the browser does`                                                 |
| Shift+Tab | `contain: 'loop'`, on the first stop | Moves to the last stop in the scope                                         | `use-focus.test.tsx › keyboard › Shift+Tab on the first stop wraps to the last`                                                    |
| Tab       | `contain: 'inert'`                   | Never reaches an element outside the scope; the browser decides at the ends | `use-focus.test.tsx › keyboard › inert keeps Tab inside and restores siblings`                                                     |
| Escape    | `contain` set                        | Calls `onEscape`; the consumer closes the scope                             | `use-focus.test.tsx › keyboard › Escape calls onEscape`, `use-focus.test.tsx › keyboard › Escape does nothing when contain is off` |
| Tab       | after a `moveOn` change              | Continues after the moved-to element                                        | `use-focus.test.tsx › keyboard › Tab after a move continues after the target`                                                      |
| Shift+Tab | after a `moveOn` change              | Goes back to the stop before the moved-to element                           | `use-focus.test.tsx › keyboard › Shift+Tab after a move goes back to the stop before the target`                                   |

## Focus management

- Initial focus (`initialFocus`): `'first'` (default), `'container'`, `'none'`, a selector or a ref. A target that is gone or disabled falls through to the first stop, then the container (`focus management › initialFocus as a selector falls through to the first stop when it matches nothing`, `› a scope with no focusable stop focuses the container`). Focus already inside the scope is left alone.
- Restore (`restore`, default `true`): to `finalFocusRef`, else `triggerRef`, else the element that had focus before the scope, else that element's popup invoker, never `body` (`focus management › focus goes to finalFocusRef first, then the trigger, then the opener`). Only when focus was inside the scope or lost to `body`: focus the user moved elsewhere is never taken (`› focus the user moved elsewhere is not taken back`). `restore: false` returns nothing (`› restore false leaves focus where it is`).
- `onLost` is called when nothing could take focus on return or when `moveOn` finds no element (`› onLost is called when nothing can take focus on return`, `moveOn › onLost is called when no element matches the selector`).
- `moveOn`: focus moves when `key` changes, never on the first render, and the target is made temporarily focusable (`moveOn › does not move on the first render, and adds no tabindex that stays`).
- StrictMode re-runs the effects and leaves the result the same (`› survives StrictMode`). On the server nothing runs (`imperative and types › renders nothing on the server`).
- Trap: only by choice (`contain`). Both modes need an exit: `onEscape`, and the development warning `focus-scope-no-exit` (`development warning › contain without onEscape warns once with focus-scope-no-exit text`) says when it is missing (2.1.2).
- Limit: `inert` is applied when the scope becomes active. A sibling added to the page while it is open is not made `inert`.

## WCAG

2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (Minimum), 3.2.1 On Focus. No axe violations with an open scope (`accessibility › an open scope has no axe violations`).
