# Announcer

> **Draft** (Plan 0014). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [announcer.a11y.md](announcer.a11y.md).

The shared way to tell a screen reader that something changed, without moving focus (WCAG 4.1.3 Status Messages): a count of results, a saved form, a rejected character, a finished upload.

- `useAnnouncer()` returns `{ announce }`. Call `announce(message, options)` from an event handler or an effect.
- The outermost `KvirnProvider` renders the two live regions, once, empty and visually hidden with inline styles (no CSS shipped). They exist before the first message, which is what makes screen readers announce it.
- `announce` does nothing, and a development warning says why, when there is no provider.

## Component

```tsx
import { useAnnouncer } from '@kvirn-ui/react'

function SaveButton() {
  const { announce } = useAnnouncer()

  return (
    <Button
      onClick={async () => {
        await save()
        announce(t('form.saved')) // text already resolved from your i18n, in the provider's language
      }}
    >
      {t('form.save')}
    </Button>
  )
}
```

```tsx
// Something that can repeat quickly: throttle it per field.
announce(messages.characterNotAllowed, { key: fieldId })
// Something to act on right now:
announce(messages.sessionExpired, { politeness: 'assertive' })
```

## API

`announce(message, options?)` returns `true` when the message was accepted, and `false` when it was dropped.

| Option                 | Default    | Meaning                                                                                                                |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `politeness`           | `'polite'` | `'polite'` waits for the screen reader to finish. `'assertive'` interrupts it                                          |
| `key`                  | none       | Throttles by key, such as a field's id. A message with a key that is inside its window is dropped. No key, no throttle |
| `throttleMilliseconds` | `3000`     | The window for `key`. `0` turns the throttle off. An invalid number is treated as the default                          |

- The region is emptied first and filled 100 ms later, so the same message twice is read twice.
- A message is removed after 5 seconds.
- A second message for the same politeness inside 100 ms replaces the first. Batch related changes into one sentence.
- Blank messages are ignored.

## Core

`createAnnouncer(env)` in `@kvirn-ui/core` is the state behind it: a store of `{ polite, assertive }` text with `announce` and `clear` actions, and no DOM. `env` only needs `window.setTimeout`, `window.clearTimeout` and `window.performance.now`, and is `undefined` while server rendering, when `announce` does nothing.

## Known limits

See the contract's Known issues: no per-message `lang`, no queue, no announcements without a provider, and nested providers with their own `env` share the outermost regions.
