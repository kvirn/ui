# Badge

> **Draft** (Plan 0059). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [badge.a11y.md](badge.a11y.md).

A short status or category in words: `Beviljad`, `Pre-alpha`, `Nyheter`. It renders a `<span>`.

- One part: `Badge`, also `useBadge()`. It renders `<span class="kv-badge">`, and no role, ARIA, text or strings.
- `variant`: `neutral` (default), `primary`, `info`, `success`, `warning` or `danger`. The class is `kv-badge--<variant>`. Always say the status in words: the colour is only a second cue.
- Attributes and the `ref` reach the element. A `className` joins `kv-badge`.
- `as` changes the element to `strong` or `em`. Its own semantics apply.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-badge` draws a pill in measured colour pairs, with a `CanvasText` edge in forced colours.
- A badge is text and not a control: it isn't a Tab stop and announces nothing. If it should do something, use a Button.

## Component

```tsx
import { Badge } from '@kvirn-ui/react'

;<h3>
  Bygglov Storgatan 4 <Badge variant="success">Beviljad</Badge>
</h3>
```

## Hook

```tsx
import { useBadge } from '@kvirn-ui/react'

const badge = useBadge({ variant: 'warning' })
<span {...badge.rootProps}>Väntar</span>
```

## Accessibility

See the contract: [badge.a11y.md](badge.a11y.md).
