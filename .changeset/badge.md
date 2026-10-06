---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

`Badge` and `useBadge`: a static status or category in words (Plan 0059). It renders `<span class="kv-badge">`, with no role, ARIA, strings or behaviour: it is not a Tab stop and announces nothing. `variant` is `neutral` (default), `primary`, `info`, `success`, `warning` or `danger`, and adds `kv-badge--<variant>`. The visible text is the status, so the colour is never the only cue. `render`, `ref` and `className` work as on the other flat parts.

- React: `Badge`, `useBadge`, the types `BadgeProps`, `BadgeState`, `BadgeElementProps`, `BadgePartProps`, `BadgeVariant`, `UseBadgeOptions` and `UseBadgeResult`. No new i18n keys.
- Theme: `kv-badge` draws a pill (`body-small`, `full` radius, a 1px edge) in already measured pairs: `text` on `surface`, `link` on `primary-subtle` and `text` on the `-subtle` backgrounds. A `CanvasText` edge in forced colours.
