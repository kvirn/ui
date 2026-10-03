---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add Icon (Plan 0009): one component for built-in icons, your own SVGs, and icons from libraries such as Lucide, Heroicons and Phosphor.

- `Icon` and `useIcon`: `<Icon name="close" />`. Decorative by default (`aria-hidden="true"`). `label` makes it an image with that name, and removes a library's own `aria-hidden`. `size` is `sm`, `md` (default) or `lg` (1em, 1.25em, 1.5em), a number in pixels, or an em, rem or px length. `color`, `fill`, `stroke` and `strokeWidth` change the drawing. `mirrorInRtl` flips a directional icon in right-to-left text. Every value is an SVG attribute, never inline `style`, so icons work under a strict CSP. `render` or children for one-off icons.
- 24 built-in icons, original outline drawings in the style of Heroicons on a 24 grid with a 1.5 stroke: the chevrons and arrows, `external`, `close`, `menu`, `search`, `add`, `check`, the status icons `info`, `success`, `warning` and `error` (which differ in shape), `calendar`, `upload`, `download`, `document`, `delete`, `language`, `eye` and `eye-off`. The directional ones mirror in right-to-left text.
- `defineIcons`, and `KvirnProvider`'s new `icons` and `iconDefaults` props: register icons once by name. `Register['icons']` types the names. A registered name replaces a built-in icon. Nested providers merge by name.
- Button warns in development when it has no accessible name, such as an icon-only button without an `aria-label`.
- Theme: `.kv-icon`, `.kv-button--icon-only`, right-to-left mirroring and forced-colours rules.
