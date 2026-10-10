# List

> **Draft** (Plan 0095). The accessibility contract is [list.a11y.md](list.a11y.md).

The one native list: link lists, related links, footer link groups and any other short list. `List.Root` renders `<ul class="kv-list">`, or `<ol>` with `as="ol"`, and `List.Item` renders `<li>`. There is no `List.Link`, no text and no strings.

- Marker and gap are classes you add: `kv-list--bullet` or `kv-list--decimal`, and `kv-list--gap-2`, `-6` or `-8`. The default has no marker and the `space-4` step.
- The list always gets `role="list"`, because WebKit and VoiceOver drop the list role under `list-style: none`. A role of your own wins.
- `as`: `'ul'` (default) or `'ol'`. `kv-list--decimal` is for `ol`: numbers on a `ul` say nothing about order to assistive technology.
- A list of links is a list, not a navigation. Wrap it in a `<nav>` with a name when it is navigation.
- Headless: no CSS. No state, so no `data-*`, no hook and no client code (usable in a server component). Your `className` joins the class. `@kvirn-ui/theme/theme.css` styles `kv-list`.

```tsx
import { Link, List } from '@kvirn-ui/react'

;<nav aria-label="Related links">
  <List.Root>
    <List.Item>
      <Link.Root href="/bygglov">Building permits</Link.Root>
    </List.Item>
    <List.Item>
      <Link.Root href="/avfall">Waste and recycling</Link.Root>
    </List.Item>
  </List.Root>
</nav>

;<List.Root className="kv-list--decimal" as="ol">
  <List.Item>Apply</List.Item>
  <List.Item>Wait for the decision</List.Item>
</List.Root>
```

## Accessibility

See the contract: [list.a11y.md](list.a11y.md).
