# DisplaySettings

> **Draft** (Plan 0099). The accessibility contract is [display-settings.a11y.md](display-settings.a11y.md).

Colour scheme, contrast and motion in one place, on `useTheme()`. One content, three layouts, and the choices on their own so you can put them anywhere.

- `DisplaySettings.Inline`: a Disclosure. The panel opens in flow and pushes the content below it down.
- `DisplaySettings.Floating`: a Popover. The panel opens over the page, in the top layer, next to its button, and closes on Escape or a press outside.
- `DisplaySettings.Compact`: a small Popover with a row of segments per group. Still native radios, so the arrows and the names are the browser's.
- `DisplaySettings.Panel` and `DisplaySettings.CompactPanel`: the choices with no container and no trigger. Put them in a Card, a Popover, a Dialog or on a page. The three layouts are these inside a Disclosure or a Popover.

The component has no notes of its own. Pass what you want to say after the groups, such as what less motion does or where the choice is kept, as children. The only text it adds is the forced-colours note, and only while forced colours are on.

- **Choosing is the feedback.** The checked radio is the only feedback: nothing is announced and focus stays.
- **Opening never moves focus.** The popups follow their button in the Tab order.
- **The choices are kept by `KvirnProvider`** in this browser only. Nothing is sent anywhere.
- **Strings:** the `displaySettings` messages of `@kvirn-ui/i18n`, in all five locales. Override them in the provider, or per instance with `messages`.
- Headless: no CSS. The parts render `kv-display-settings-*` classes; the default theme styles them.

## API

```tsx
import { DisplaySettings } from '@kvirn-ui/react'

;<DisplaySettings.Inline />
;<DisplaySettings.Floating />
;<DisplaySettings.Compact />
;<DisplaySettings.Panel />
```

| Part                           | Renders                                               | Props                                                                                           |
| ------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DisplaySettings.Inline`       | a `<button>` and an in-flow panel                     | `messages`, `className` (on the button), `defaultOpen`, children (your notes, after the groups) |
| `DisplaySettings.Floating`     | a `<button>` and a `popover` panel in a Card          | The same                                                                                        |
| `DisplaySettings.Compact`      | a `<button>` with an icon and a small `popover` panel | The same                                                                                        |
| `DisplaySettings.Panel`        | a `<div>` with three fieldsets                        | `messages`, `className`, children. No container, no trigger                                     |
| `DisplaySettings.CompactPanel` | a `<div>` with three fieldsets as rows of segments    | The same                                                                                        |

Each part is also a flat export (`DisplaySettingsInline`, `DisplaySettingsFloating`, `DisplaySettingsCompact`, `DisplaySettingsPanel`, `DisplaySettingsCompactPanel`).

## Hook

`useDisplaySettings({ messages, short })` returns `{ text, groups, isForcedColors }`: the three groups, each with its `legend`, `options`, current `value` and `select(value)`, for your own markup.

## Classes for the default theme

`kv-display-settings-trigger`, `-panel`, `-card`, `-popup`, `-content`, `-groups`, `-segments`, `-compact-trigger` and `-compact-popup`. Everything is a class: a gap, a width or a colour is yours to add.
