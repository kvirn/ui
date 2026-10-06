# Toast

> **Draft** (Plan 0071). This page moves to the docs site once `apps/docs` has a Toast page. The accessibility contract is [toast.a11y.md](toast.a11y.md), the design spec is [docs/design/toast.md](../../../../docs/design/toast.md).

> **When not to toast: use an inline Alert first.** A toast is a second channel for a result that is also shown in place. Never for an error, never for something needed to finish a task. `Alert` with `announce` stays the default.

A short status message after something worked, that does not move focus, is heard by screen readers and stays until dismissed by default. With `autoDismiss` a toast goes after the app's chosen time and pauses on hover, focus, a hidden tab and a blurred window. One shared list serves the whole page: the first `KvirnProvider` that mounted is the host (its `toast` options, locale and messages apply, and it renders the region); `useToast()` shows toasts from anywhere below it.

- A toast that will time out shows a decorative ring around Close that drains over the time left (`aria-hidden`, nothing announced, stepped under reduced motion); the toast carries `data-timed` and `data-paused`. The ring's span carries `--kv-toast-timer-from` (0 to 1, the share of the time left when the run starts) and `--kv-toast-timer-remaining` (the milliseconds it drains over); a resume starts a new run with at least 5 s.
- Persistent by default. Timers are an app switch (`autoDismiss`, a number of milliseconds), only for info and success toasts without an action. There is no minimum time: a short value can remove a toast before it is read (a stated WCAG 2.2.1 trade-off, see the contract), so tie it to a user setting.
- Info and success only. No warning or danger toast.
- Items are built from the Alert's parts (`kv-alert kv-toast`): the status word, an icon, the Title as a `<p>`, an optional Body, an optional action and an always-present Close.
- No role and no `aria-live` in the region. The provider announces once, politely, through the Announcer.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` it is styled and placed at the block-end, inline-end edge in the top layer.

## API

```tsx
import { KvirnProvider, useToast } from '@kvirn-ui/react'
;<KvirnProvider locale="sv" toast={{ limit: 5, autoDismiss: false }}>
  <App />
</KvirnProvider>

function SaveDraft() {
  const toast = useToast()
  return (
    <button
      type="button"
      onClick={() => {
        toast.show({
          variant: 'success',
          title: 'Utkastet sparades',
          body: <p>Du hittar det under Mina ärenden.</p>,
          action: { label: 'Ångra', onPress: restoreDraft },
          id: 'draft-saved',
        })
      }}
    >
      Spara
    </button>
  )
}
```

| `KvirnProvider` prop `toast` | Default | Meaning                                                                                                                                                                                            |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`                      | `10`    | The most toasts that show at once. Past it the oldest toast that may time out is evicted; otherwise the new toast is ignored (not queued), with a development warning                              |
| `autoDismiss`                | `false` | `false`: nothing times out. A number is the time in milliseconds a toast allowed to time out stays, with no minimum. `0`, a negative number or `NaN` acts as `false` and warns once in development |

| `useToast()` returns | Does                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `show(options)`      | Shows a toast and returns its id (an empty string when it was dropped). Showing an `id` that is already shown updates it in place |
| `dismiss(id)`        | Removes a toast. Returns `false` when there is none                                                                               |
| `dismissAll()`       | Removes every toast                                                                                                               |
| `focus()`            | Focuses the newest toast's Title, for a button of your own. The library adds no key                                               |

| `show` option | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | The message, one sentence, a string. Required                                                                                                                                                                                                                                                                                                                                                                                                    |
| `busy`        | `true` for a job in progress: a spinner replaces the status icon (`<span class="kv-alert-icon kv-spinner" aria-hidden="true">`). Show the result with the same `id` to replace it, and show a job toast without an auto-dismiss timer. The spinner loops until the result replaces it and rests under reduced motion (for WCAG 2.2.2 see [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators)); the timer ring is unchanged |
| `variant`     | `'info'` (default) or `'success'`                                                                                                                                                                                                                                                                                                                                                                                                                |
| `body`        | More to read. Optional                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `action`      | `{ label, onPress }`, at most one. The toast stays until dismissed (a development warning fires when `autoDismiss` asked for a timer)                                                                                                                                                                                                                                                                                                            |
| `id`          | Showing it again updates the toast and announces it once                                                                                                                                                                                                                                                                                                                                                                                         |
| `focus`       | `true` moves focus to the toast and skips the announcement. **Only for a user-initiated action** whose trigger is gone (3.2.2)                                                                                                                                                                                                                                                                                                                   |

| Message key (`messages.toast`) | Default (sv) | Used by                                                          |
| ------------------------------ | ------------ | ---------------------------------------------------------------- |
| `regionLabel`                  | Meddelanden  | The region's accessible name. It exists only while a toast shows |

The status word and Close's name reuse `alert.infoPrefix`, `alert.successPrefix` and `alert.close`.

## Behaviour in short

- A timer pauses on hover, focus inside, a hidden tab and a blurred window, and never runs for a toast with an action.
- Escape with focus inside a toast dismisses that toast. Close and the action dismiss it too. Focus returns to the element that had it before, else the next toast's Close.
- While a modal dialog is open new toasts are held and shown when it closes. Raise a message inside a dialog with the dialog's own Alert.
- Without a provider `useToast()` does nothing and warns once. Before the provider has mounted, `show` is dropped with a warning.
- No toast while an error summary is up: do not toast a failed submit (or call `dismissAll()` first).
- Changing `toast` on the provider (a user setting) keeps the toasts that show and re-times them.
- An action (Undo) needs a persistent alternative on the page.
