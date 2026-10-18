# Accessibility contract: Focus (`useFocus`, `FocusScope`)

- **APG pattern:** Dialog (Modal) focus rules: initial focus, Tab loop, return. The WCAG technique for moving focus on a view change (see the Route focus page).
- **Deviations:** none. Dialog itself keeps the native Tab order (approved by the maintainer) and uses only the shared return code.
- **Native elements used:** the consumer's own element (`<aside>`, `<div>`, `<section>`). Native `<dialog>.showModal()` and the `inert` attribute are the first choice; this is for what they don't cover.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `use-focus.test.tsx` next to this file.

`useFocus` moves focus into a scope when it becomes active, can hold it there (`contain`), and returns it when the scope ends. It renders nothing and adds no role or ARIA: the consumer picks `role="dialog"`, `aria-modal`, a label.

**Allowed elements** for `FocusScope`'s `as`: `div` (default), `section`, `aside`, `nav` or `form`. Another tag warns once (`as-not-allowed`) and falls back to `div`. The scope adds no role or ARIA, so the element's own semantics apply: `nav` and `form` are landmarks and need a name, which is the consumer's.

## Roles, states, properties

| Part  | Element / role         | ARIA | Notes                                                                                                                                                        |
| ----- | ---------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope | the consumer's element | none | `tabindex="-1"` is added only while the scope itself takes focus (no Tab stop inside) and removed on blur                                                    |
| Page  | siblings of the scope  | none | With `contain: 'inert'`, `inert` is set on the siblings of the scope and its ancestors while active and removed after. Elements already `inert` stay `inert` |
| Live  | Announcer, Toast       | none | Live regions and the Toast region are never made `inert`                                                                                                     |

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
- Restore (`restore`, default `true`): to `finalFocusRef`, else `triggerRef`, else the element that had focus before the scope, else the button that opened the popup that element was in, never `body` (`focus management › focus goes to finalFocusRef first, then the trigger, then the opener`). Only when focus was inside the scope or lost to `body`: focus the user moved elsewhere is never taken (`› focus the user moved elsewhere is not taken back`). `restore: false` returns nothing (`› restore false leaves focus where it is`).
- `onLost` is called when nothing could take focus on return or when `moveOn` finds no element (`› onLost is called when nothing can take focus on return`, `moveOn › onLost is called when no element matches the selector`).
- `moveOn`: focus moves when `key` changes, never on the first render, and the target is made temporarily focusable (`moveOn › does not move on the first render, and adds no tabindex that stays`).
- React's StrictMode (a development check that runs effects twice) leaves the result the same (`› survives StrictMode`). On the server nothing runs (`imperative and types › renders nothing on the server`).
- Trap: only by choice (`contain`). Both modes need an exit: `onEscape`, and a development warning says when it is missing (`development warning › contain without onEscape warns once with focus-scope-no-exit text`, 2.1.2 No Keyboard Trap, level A).
- Limit: `inert` is applied when the scope becomes active. A sibling added to the page while it is open is not made `inert`.

## Consumer responsibilities

- Name the scope: give your element a label (`aria-label` or `aria-labelledby`) and the role that fits (`dialog`, a landmark). The scope adds neither, and `nav` and `form` are landmarks that need a name.
- With `contain`, pass `onEscape` and close the scope in it: holding focus needs an exit (2.1.2 No Keyboard Trap, A).
- Keep `scroll-padding` on the page when a sticky header can cover the element that gets focus (2.4.11 Focus Not Obscured (Minimum), AA).

## WCAG SCs covered

- 2.1.1 Keyboard (A): the Tab loop and Escape are in the Keyboard table, and every other key is the browser's.
- 2.1.2 No Keyboard Trap (A): holding focus (`contain`) is your choice and needs an exit, `onEscape`. A development warning says when it is missing.
- 2.4.3 Focus Order (A): focus moves into the scope, returns to where it was, and Tab continues after a heading that focus moved to.
- 2.4.7 Focus Visible (AA): focus goes to an element that can show a focus ring, never to the page body.
- 2.4.11 Focus Not Obscured (Minimum) (AA): the scope draws nothing over the page, and each element it focuses is scrolled into view (`use-focus.test.tsx › focus management › a stop far below the fold is scrolled into view when the scope opens (2.4.11)`). A sticky header still needs `scroll-padding` (consumer).
- 3.2.1 On Focus (A): an element in the scope getting focus never moves focus or changes context (`use-focus.test.tsx › focus management › focus moving to another element in the scope, or a re-render, never moves focus again (3.2.1)`). The scope moves focus only when `active` or `moveOn`'s `key` changes, never on the first render (`moveOn › does not move on the first render, and adds no tabindex that stays`).
- No axe violations with an open scope (`accessibility › an open scope has no axe violations`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                       |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ----------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                             |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | focus.stories.tsx, every story, 4 themes                    |
| Markup and ARIA (roles, names, ids, states)                                | pending     | n/a         | pending | a hook that renders nothing: no markup of its own to assert |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 7 rows, each names a test in `use-focus.test.tsx`           |
| Focus order and management                                                 | pass        | n/a         | pass    | `use-focus.test.tsx` asserts focus                          |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | n/a         | n/a         | n/a     | renders nothing: no visible part                            |
| **Core (required for beta)**                                               |             |             |         |                                                             |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                             |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                             |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                             |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                             |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                             |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                             |
