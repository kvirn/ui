---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`Dialog` and `AlertDialog` (Plan 0067): modal dialogs on the native `<dialog>` and `showModal()`, so the page behind is inert and no Portal is needed. Parts: `Root`, `Trigger`, `Popup`, `Title`, `Description`, `Body`, `Actions`, `Close` (Dialog: a quiet icon button; AlertDialog: a plain button with children). Hooks `useDialog` and `useAlertDialog`.

- Escape and a press on the backdrop go through the dismissable layer stack, so one Escape closes the top layer only. A Dialog does not close on a backdrop press unless `dismissOnOutsidePress` is set; an AlertDialog never does. `onOpenChange(open, { reason, event })` reports `trigger-press`, `close-press`, `escape`, `outside-press` or `native-close`, and a controlled owner may refuse.
- Focus: `initialFocusRef`, else the first tabbable that is not a Close button, else the Title. On close it returns to `finalFocusRef`, the trigger, or the element focused before opening, never `body`.
- Tab at the end of the dialog leaves to the browser UI before wrapping (native behaviour; an approved deviation from the APG, recorded in the `keyboard` skill).
- Scroll lock: the hook sets `data-kv-scroll-locked` on `<html>` (ref-counted); `theme.css` applies it. Without the theme there is no scroll lock.
- The Dialog hosts its own live region, because the provider's are inert behind a modal.
- Core: `createScrollLock`, `isPointInsideRect`. React: `useDismissableLayer` gets the option `backdrop`. i18n: the new key `dialog.close` in all six catalogs (a custom catalog must add it; `se` needs translator review). Theme: `kv-dialog`, `kv-dialog-title`, `-description`, `-body`, `-actions`, `-close`.
