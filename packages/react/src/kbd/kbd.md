# Kbd

> **Draft** (Plan 0024). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [kbd.a11y.md](kbd.a11y.md).

A key in running text: `Du kan flytta mellan fälten med` <kbd>Tab</kbd>. It renders the native `<kbd>`.

- One part: `Kbd`, also `useKbd()`. It renders `<kbd class="kv-kbd">`, and no role, ARIA, text or strings.
- One key per `Kbd`. For a combination, nest them: `<Kbd><Kbd>Ctrl</Kbd>+<Kbd>C</Kbd></Kbd>`. The theme draws each key and leaves the outer one plain.
- Key names are not translated. Set `lang="en"` on a key in a text of another language, so a screen reader doesn't read `Tab` in the page's accent.
- Attributes and the `ref` reach the element. A `className` joins `kv-kbd`.
- `render` changes the element. Its own semantics apply.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-kbd` draws a flat key (the body font, a 1px edge, no depth) in prose and outside it. [Prose](../prose/prose.md) styles a plain `<kbd>` with the same rule.
- A key is text and not a control: it isn't a Tab stop. If it should do something, use a Button.

## Component

```tsx
import { Kbd } from '@kvirn-ui/react'

;<p>
  Du kan flytta mellan fälten i formuläret med <Kbd lang="en">Tab</Kbd>.
</p>

// A combination
<Kbd>
  <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">C</Kbd>
</Kbd>
```

## Hook

```tsx
import { useKbd } from '@kvirn-ui/react'

const kbd = useKbd()
<kbd {...kbd.rootProps}>Tab</kbd>
```

## Accessibility

See the contract: [kbd.a11y.md](kbd.a11y.md).
