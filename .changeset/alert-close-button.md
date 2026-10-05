---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`Alert.Close`: an optional close (dismiss) button for an alert (Plan 0045). It is a native `<button type="button">` with the decorative `close` icon, named by the new message `alert.close` ("Stäng meddelandet", "Sulje ilmoitus", "Lukk meldingen", "Lukk meldinga" and "Close message"; `se` is an English placeholder that needs translator review). Override the name per provider, per alert (`messages` on the root) or per button (`messages` on `Alert.Close`). It takes `onClick` (never called while `disabled`), `disabled`, `children` (visible text of your own), `render` and `ref`. The Alert owns no open or closed state: remove it in `onClick`, and move focus to a sensible place in the same handler (WCAG 2.4.3), because the button that had focus goes with it. Dismissing announces nothing and never changes an alert's politeness.

- React: `Alert.Close` and the named export `AlertClose`, the types `AlertCloseProps`, `AlertCloseState` and `AlertClosePartProps`, and `closeProps` on `useAlert`'s result for your own `<button>`.
- i18n: the new key `alert.close` in `KvirnMessages` and all six catalogs. A custom catalog must add it.
- Theme: `kv-alert-close`, a quiet icon button at the control size (44px, 32px in `kv-compact`, never under 24px) at the inline end of the first line, with the focus ring, `ButtonText` in forced colours, hidden in print. An alert gets a last grid column only when it has a close button.
