# Divider

A horizontal line between two blocks of content. It renders the native `<hr>`, a thematic break.

- One part: `Divider`. It renders `<hr class="kv-divider">`, and no text, strings or behaviour.
- A screen reader may announce it as a separator. When the line is only decoration, pass `role="presentation"` and it is not announced. Use the default when the content on each side is a different topic.
- Attributes and the `ref` reach the element. A `className` joins `kv-divider`. There is no `as`, no `orientation`, no `variant` and no `size`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-divider` draws a hairline with a block margin. Change it with CSS variables, set from a class on the element or on any ancestor: `--kv-divider-margin-block`, `--kv-divider-margin-inline`, `--kv-divider-width`, `--kv-divider-style` and `--kv-divider-color`.

## Component

```tsx
import { Divider } from '@kvirn-ui/react'

;<>
  <p>Opening hours</p>
  <Divider />
  <p>Contact details</p>
  <Divider role="presentation" />
  <p>Only decoration above</p>
</>
```

## Accessibility

See the contract: [divider.a11y.md](divider.a11y.md).
