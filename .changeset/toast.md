---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

New: Toast, a short status message after something worked. `KvirnProvider` takes a `toast` prop (`{ limit?: number, autoDismiss?: boolean | number }`) and renders the toast region once, and `useToast()` returns `{ show, dismiss, dismissAll, focus }`. `toast.show({ variant, title, body, action, id, focus })` shows an info or success toast. Warning and danger toasts do not exist: use an inline `Alert`.

Toasts are persistent by default (`autoDismiss: false`, no timers). With `autoDismiss` on, only a toast without an action can time out, after at least `max(10 s, 100 ms × characters)`, and the timer pauses on hover, focus, a hidden tab and a blurred window. A number from 1 to 10 scales the time, for an app to tie to a user setting. Showing a toast never moves focus, the region is a named `region` landmark that exists only while a toast shows, one polite announcement is made per commit, and new toasts wait while a modal dialog is open. `@kvirn-ui/core` adds `createToastQueue` and `toastMinimumDuration`, and `@kvirn-ui/theme` styles the toast region and the toasts.

`@kvirn-ui/i18n` adds one key, `toast.regionLabel` (the region's name). A custom catalog that is typed as `KvirnMessages` must add it. The `se` text is a placeholder that needs native-speaker review.
