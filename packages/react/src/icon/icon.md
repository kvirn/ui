# Icon

> **Draft** (Plan 0009). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [icon.a11y.md](icon.a11y.md), and the design spec is [docs/design/icon.md](../../../../docs/design/icon.md).

One component for every icon: the built-in set, your own SVGs, and icons from libraries such as Lucide, Heroicons and Phosphor. Register them once by name in `KvirnProvider`, then write `<Icon name="close" />` everywhere.

- **Decorative by default** (`aria-hidden="true"`). Give it a `label` from your translations when no text next to it says the same thing, and it becomes an image with that name.
- **Sizes follow the text:** `sm`, `md` (default) and `lg` are 1em, 1.25em and 1.5em, which is 16, 20 and 24px next to 16px text. A number is pixels, and `'1rem'`, `'20px'` or `'2em'` work too.
- **Colour is the text colour** (`currentColor`), so an icon in a primary Button is white without extra CSS. `color`, `fill`, `stroke` and `strokeWidth` change it.
- **Attributes, never inline `style`,** so icons work under a strict Content-Security-Policy, and your CSS can still override them.
- Headless: no CSS. The `<svg>` gets `class="kv-icon"`, `data-size` for a step, and `data-mirror-in-rtl` for a directional icon.

## Built-in icons

These work with no setup:

`chevron-down`, `chevron-up`, `chevron-back`, `chevron-forward`, `arrow-back`, `arrow-forward`, `external`, `close`, `menu`, `search`, `add`, `check`, `info`, `success`, `warning`, `error`, `calendar`, `upload`, `download`, `document`, `delete`, `language`, `eye`, `eye-off`.

They're original outline drawings in the style of Heroicons, on a 24 grid with a 1.5 stroke. The four status icons differ in shape, not only colour: info a square, success a circle, warning a triangle, error an octagon. `chevron-forward`, `chevron-back`, `arrow-forward`, `arrow-back` and `external` flip in right-to-left text. KvirnUI's own components use these names, so when you register an icon under the same name, every component uses yours. A plain override keeps the built-in's mirroring.

```tsx
import { Button, Icon } from '@kvirn-ui/react'

<Icon name="search" />
<Icon name="warning" label={messages.warning} size="lg" />
<Button><Icon name="add" />Lägg till</Button>
```

## Registering icons

Put the registry in a client module, because it holds components. Register its type once, so `name` is checked.

```tsx
// app/icons.ts
'use client'
import { defineIcons } from '@kvirn-ui/react'
import { ArrowRight, Trash2 } from 'lucide-react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import MunicipalityLogo from './logo.svg?react'

export const icons = defineIcons({
  'arrow-forward': { component: ArrowRight, mirrorInRtl: true }, // replaces the built-in
  delete: Trash2,
  location: MapPinIcon, // libraries can be mixed
  logo: MunicipalityLogo,
})

declare module '@kvirn-ui/react' {
  interface Register {
    icons: typeof icons
  }
}
```

```tsx
// app/providers.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import { icons } from './icons'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KvirnProvider icons={icons} iconDefaults={{ strokeWidth: 1.5 }}>
      {children}
    </KvirnProvider>
  )
}
```

```tsx
// Anywhere, server components included: the name is a string.
<Icon name="delete" />
<Icon name="logo" label="Kvirnby kommun" size={48} />
<Icon name="delte" /> // type error, and a warning in development
```

- An entry is a component, or `{ component, mirrorInRtl }`. A component must forward its ref and spread SVG props onto one `<svg>`. Lucide, Heroicons, Phosphor, Tabler and SVGR output all do.
- A nested `KvirnProvider` adds icons and replaces names, over its parent's. `iconDefaults` (`size`, `strokeWidth`) merge field by field.
- Which value wins, lowest first: the icon's own defaults, the built-in's mirroring for that name, `iconDefaults`, your entry, then the props on `<Icon>`.
- An unknown name renders an empty `<svg>` at the right size and warns once in development.
- Every registered icon is in the bundle that holds the provider. Register the icons the app uses, and use `render` for a rare one.

## Props

| Prop          | Type                                                              | Default                                         |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `name`        | `IconName`: a built-in or registered name                         | –                                               |
| `size`        | `'sm' \| 'md' \| 'lg'`, a number (px), or an em, rem or px length | `iconDefaults.size`, else `'md'`                |
| `strokeWidth` | `number \| string`                                                | `iconDefaults.strokeWidth`, else the icon's own |
| `color`       | `string`, such as `'var(--kv-color-danger)'`                      | the text colour                                 |
| `fill`        | `string`                                                          | the icon's own                                  |
| `stroke`      | `string`                                                          | the icon's own                                  |
| `label`       | `string`                                                          | none: decorative                                |
| `mirrorInRtl` | `boolean`                                                         | the entry's, else `false`                       |
| `render`      | element or function, for a one-off icon                           | –                                               |
| `children`    | your own shapes, with Icon as the `<svg>`                         | –                                               |

`name`, `render` and `children` are exclusive. Other SVG attributes, such as `className` or `viewBox`, pass through. `aria-label`, `aria-hidden` and `role` can't be passed: `label` sets them.

## With Button

An icon in a Button takes the Button's colour and lines up with its text. Put it before or after the text: the order in the markup is the order on screen, and right-to-left text flips it.

```tsx
<Button><Icon name="add" />Lägg till</Button>
<Button>Nästa<Icon name="arrow-forward" /></Button>

// Icon-only: the name goes on the Button, from your translations. The icon stays decorative.
<Button className="kv-button--icon-only" aria-label={messages.close}>
  <Icon name="close" />
</Button>
```

Use icon-only buttons only for actions everyone knows: close, search, menu. In development, a Button with no accessible name warns.

## One-off icons

```tsx
import { TrashIcon } from '@heroicons/react/24/outline'

<Icon render={<TrashIcon />} size="sm" />

<Icon viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M5 12h14" />
</Icon>
```

## Hook

`useIcon` gives the props, and the component for a name, for your own markup.

```tsx
const icon = useIcon({ name: 'close', size: 'sm' })
const CloseIcon = icon.component
<CloseIcon {...icon.iconProps} />
```

It returns `iconProps`, `component` (`undefined` without a name, or for an unknown one) and `isDecorative`.

## Libraries

| Library     | What to know                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Lucide      | Works fully. Icon's `color` becomes Lucide's stroke colour. Lucide draws a 2 stroke unless `strokeWidth` is set |
| Heroicons   | Works fully. Its own `aria-hidden` is removed when you give a `label`                                           |
| Phosphor    | Fill-based: `strokeWidth` and `stroke` do nothing. Choose the weight with Phosphor's `weight`                   |
| Tabler      | Use `color`, not `stroke`: Tabler's `stroke` prop is the stroke width                                           |
| react-icons | Its own `size` wins over Icon's: size it on the component                                                       |
| Iconify     | Use its offline bundles. Its default mode fetches icons from a third-party server                               |
| Icon fonts  | Not supported. Use SVG                                                                                          |

Lucide, Heroicons and Phosphor are tested.
