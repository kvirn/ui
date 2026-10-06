---
'@kvirn-ui/react': minor
---

`useFocus` and `FocusScope` (Plan 0085): one public place to move, hold and return focus for your own drawer, wizard step or layout. `useFocus({ active, restore, initialFocus, contain, onEscape, moveOn, onLost })` returns `scopeProps` to spread on the scope's element, and `FocusScope` is the same as a part with `render`. `contain: 'loop'` wraps Tab and Shift+Tab at the scope's ends, `contain: 'inert'` makes the rest of the page `inert` while it is active (Announcer and Toast regions stay reachable), and both need `onEscape` as the way out (2.1.2): a development warning `focus-scope-no-exit` says so. Prefer a native `<dialog>` with `showModal()` where it fits. `useRouteFocus` keeps its API and now shares the move code.

- React: `useFocus`, `FocusScope`, the types `UseFocusOptions`, `UseFocusResult`, `FocusMoveOn`, `FocusScopePartProps`, `FocusScopeProps`, `FocusScopeElementProps` and `FocusScopeState`. No new i18n keys.
