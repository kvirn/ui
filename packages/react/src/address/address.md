# Address

> **Draft** (Plan 0095). This page moves to the docs site once `apps/docs` lists it. The accessibility contract is [address.a11y.md](address.a11y.md).

Contact details for the nearest article or for the page: a postal address, a visiting address, a phone number, an email address. It renders the native `<address>`.

- One part: `Address`. It renders `<address class="kv-address">`, and no role, ARIA, text or strings.
- Only for contact details of the page or of the article around it. Not for any text that looks like a postal address, such as an address in a news story or a place in a list.
- A visiting address and a postal address go in separate `Address` elements, or on separate lines with a label (`Visiting address:`). Use `<br />` for the line breaks inside one address.
- Put links for `tel:` and `mailto:` inside, with the number or the email address as the link text.
- Attributes and the `ref` reach the element. A `className` joins `kv-address`. There is no `as`.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-address` undoes the browser's italic and keeps the body text size and line height.

## Component

```tsx
import { Address, Link } from '@kvirn-ui/react'

;<Address>
  Kvirnby municipality
  <br />
  Storgatan 1
  <br />
  123 45 Kvirnby
  <br />
  <Link.Root href="tel:+46123456789">+46 123 456 789</Link.Root>
  <br />
  <Link.Root href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link.Root>
</Address>
```

## Accessibility

See the contract: [address.a11y.md](address.a11y.md).
