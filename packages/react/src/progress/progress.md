# Progress

> **Draft** (Plan 0074). This page moves to the docs site. The accessibility contract is [progress.a11y.md](progress.a11y.md) and the design spec is [docs/design/status-patterns.md](../../../../docs/design/status-patterns.md).

Progress says that something is working, and how far along when you know. It is text first: **no spinner and no indeterminate bar**. A native `<progress>` is drawn only when you pass a `value`.

- It renders **nothing for the first second**, so a quick wait never flashes and says nothing.
- After that it shows the label and announces it **once**, politely. After ten seconds it adds a sentence ("This is taking longer than usual. Keep this page open.") and announces that once. The percent is never announced. Set `announce={false}` when focus already reads the state or another part announces it.
- Put it where the result will appear, or right after the busy button. Never a Toast, never an overlay.

```tsx
import { Button, Progress } from '@kvirn-ui/react'

;<div className="kv-button-group">
  <Button type="submit" busy={isSending}>
    Skicka ansökan
  </Button>
  {isSending ? (
    <Progress.Root label="Skickar din ansökan.">
      <Progress.Label />
    </Progress.Root>
  ) : null}
</div>

// A known value adds the bar and the percent.
;<Progress.Root label="Exporterar ärenden." value={percent}>
  <Progress.Label />
  <Progress.Bar />
</Progress.Root>
```

- Keep the Root's `label` and any `Progress.Label` children the same words: the bar's value text is built from `label`. A `label` that changes while waiting is not announced again, so remount with a `key` for a new wait.

## Wording

Name the thing and the action, and end with a full stop: "Hämtar dina ärenden.", never "Laddar…" or "Vänta". No ellipsis, no tech words.

## API

| Prop                    | Type                | Meaning                                                                                                          |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `label`                 | `string`            | What is happening. It names the bar and is announced. Default: the message `progress.loading` with a dev warning |
| `value`, `max`          | `number`            | Known progress. The bar renders only with `value`. `max` defaults to 100                                         |
| `delayMilliseconds`     | `number`            | Invisible for this long. Default 1000                                                                            |
| `slowAfterMilliseconds` | `number \| false`   | When the slow sentence is added. Default 10000, `false` never                                                    |
| `announce`              | `boolean`           | Announce the label once and the slow sentence once. Default `true`                                               |
| `messages`              | `Partial<progress>` | Per-instance `loading`, `slow` and `valueText`                                                                   |

Parts: `Progress.Root` (`kv-progress`, `data-state`, `data-determinate`), `Progress.Label` (`kv-progress-label`) and `Progress.Bar` (`kv-progress-bar`). `useProgress` returns `isShown`, `isSlow`, `rootProps`, `labelProps`, `barProps` and `labelId` for your own markup.

## Button busy

`<Button busy>` sets `aria-disabled="true"` and `data-busy`, never native `disabled`: focus stays on the button and every press is blocked. See [button.a11y.md](../button/button.a11y.md).

## Empty state

`kv-empty-state` is a class for your own markup: no role, no strings, no focus.

```tsx
<div className="kv-empty-state">
  <Heading level={2} className="kv-empty-state-title">
    Du har inga ärenden än
  </Heading>
  <p className="kv-empty-state-body">När du ansöker om något visas det här.</p>
  <div className="kv-button-group">
    <Button className="kv-button--primary">Starta en ansökan</Button>
  </div>
</div>
```

Say what isn't there and what to do next, in that order. Never "No data".
