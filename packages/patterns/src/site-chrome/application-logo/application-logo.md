# Application logo

> **Draft** (Plan 0095). A pattern in the private `@kvirn-ui/patterns`. The accessibility contract is [application-logo.a11y.md](application-logo.a11y.md).

The link to the start page: the organisation's or service's mark, its name as text, and an optional slogan. Put it first in the Site header's `Masthead`, or anywhere else the start page is one step away.

- Parts: `ApplicationLogo.Root` (the `<a href>`, through the registered router link or `as`; `current="page"` on the start page), `.Logo` (`<img alt="">`, decorative), `.Name` (the text, and the link's name) and `.Slogan` (text under the name, the link's description).
- No strings of its own: the name and the slogan are children.
- With `@kvirn-ui/theme/theme.css`, `kv-application-logo` draws the mark beside the name, in the sans family at weight 600, underlined on hover. It takes the colour of what it sits on, so it is right on a canvas and on the primary Site header with no variant.

```tsx
import { ApplicationLogo } from '@kvirn-ui/patterns'

;<ApplicationLogo.Root href="/" current="page">
  <ApplicationLogo.Logo src="/logo.svg" />
  <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
  <ApplicationLogo.Slogan>Where the river meets the hills</ApplicationLogo.Slogan>
</ApplicationLogo.Root>
```

## Accessibility

See the contract: [application-logo.a11y.md](application-logo.a11y.md).
