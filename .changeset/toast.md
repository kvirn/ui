---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

New: Toast, a short status message after something worked. `KvirnProvider` takes a `toast` prop (`{ limit?: number, autoDismiss?: false | number }`) and renders the toast region once, and `useToast()` returns `{ show, dismiss, dismissAll, focus }`. `toast.show({ variant, title, body, action, id, focus })` shows an info or success toast. Warning and danger toasts do not exist: use an inline `Alert`.

Toasts are persistent by default (`autoDismiss: false`, no timers). `autoDismiss` is `false` or a number of milliseconds: only a toast without an action can time out, after exactly that time, and the timer pauses on hover, focus, a hidden tab and a blurred window. There is no minimum (a maintainer-approved WCAG 2.2.1 trade-off): tie the value to a user setting. `0`, a negative number or `NaN` acts as `false` and warns in development. A toast that will time out shows a decorative timer ring around its Close button (`aria-hidden`, stepped under reduced motion), and the toast carries `data-timed` and `data-paused`. The ring is drawn from `--kv-toast-timer-from` and `--kv-toast-timer-remaining`, and a resume leaves at least 5 s. `@kvirn-ui/core` adds `ToastTimer`, `ToastEntry.timer` and `ToastQueueState.paused`. Showing a toast never moves focus, the region is a named `region` landmark that exists only while a toast shows, one polite announcement is made per commit, and new toasts wait while a modal dialog is open. `@kvirn-ui/core` adds `createToastQueue`, and `@kvirn-ui/theme` styles the toast region and the toasts.

`@kvirn-ui/i18n` adds one key, `toast.regionLabel` (the region's name). A custom catalog that is typed as `KvirnMessages` must add it. The `se` text is a placeholder that needs native-speaker review.
