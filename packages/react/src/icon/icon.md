# Icon

> **Draft** (Plan 0009). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [icon.a11y.md](icon.a11y.md), and the design spec is [docs/design/icon.md](../../../../docs/design/icon.md).

One component for every icon: the built-in set, your own SVGs, and icons from libraries such as Lucide, Heroicons and Phosphor. There are three routes, and you can mix them:

- **`icon`** for one icon from a library: `<Icon icon={Search} />`. No setup.
- **`name`** for icons you use everywhere: register them once in `KvirnProvider`, then write `<Icon name="close" />`.
- **`as`** (or children) for a one-off icon of your own, such as a municipality's mark.

Icon's `size` and `label` replace the library component's own in every route that draws a component, so you never size an icon on the component itself. `className` is joined with the component's own classes.

- **Decorative by default** (`aria-hidden="true"`). Give it a `label` from your translations when no text next to it says the same thing, and it becomes an image with that name.
- **`size` is the pixel size, as a string.** `<Icon size="20" />` (the default) is 20px at the default root font size: the theme turns it into `1.25rem` with the class `kv-icon--size-20`, so it follows the user's root font size and not the text around it. The sizes are `'12'`, `'14'`, `'16'`, `'20'`, `'24'`, `'28'`, `'32'`, `'40'`, `'48'`, `'56'`, `'64'`, `'80'` and `'96'`. A number or a CSS length (`'48px'`) is a type error: another size is a class you add (`<Icon className="my-icon" />`).
- **Colour is the text colour** (`currentColor`), so an icon in a primary Button is white without extra CSS. Icon has no colour or stroke props: set `color` with a class or `style` on a wrapper element of your own, and the icon follows. The built-in set draws a 1.5 stroke.
- **Attributes, never inline `style`,** so icons work under a strict Content-Security-Policy, and your CSS can still override them.
- Headless: no CSS. The `<svg>` gets `class="kv-icon kv-icon--size-20"` (the size class), `width` and `height` in rem, and `data-mirror-in-rtl` for a directional icon.

## Built-in icons

These work with no setup:

The Storybook page **Components/Content/Icon › Built In Set** shows every one of them, generated from the set itself. The drawings are decorative: the name is the text beside each.

| Name              | Use                                       | Mirrors in right-to-left text |
| ----------------- | ----------------------------------------- | ----------------------------- |
| `chevron-down`    | Opens a section or a menu, or points down | no                            |
| `chevron-up`      | Closes a section, or points up            | no                            |
| `chevron-back`    | Back or previous in reading direction     | yes                           |
| `chevron-forward` | Forward or next in reading direction      | yes                           |
| `arrow-back`      | Back to the previous page or step         | yes                           |
| `arrow-forward`   | Continue to the next page or step         | yes                           |
| `external`        | A link that leaves the site               | yes                           |
| `close`           | Closes a dialog, a panel or a message     | no                            |
| `menu`            | Opens the navigation menu                 | no                            |
| `search`          | Search                                    | no                            |
| `add`             | Adds an item                              | no                            |
| `check`           | Done or selected                          | no                            |
| `info`            | Information (a square)                    | no                            |
| `success`         | Success (a circle)                        | no                            |
| `warning`         | Warning (a triangle)                      | no                            |
| `error`           | Error (an octagon)                        | no                            |
| `calendar`        | A date or a date picker                   | no                            |
| `upload`          | Sends a file                              | no                            |
| `download`        | Downloads a file                          | no                            |
| `document`        | A document or a file                      | no                            |
| `delete`          | Removes an item                           | no                            |
| `language`        | Changes the language                      | no                            |
| `eye`             | Shows a hidden value, such as a password  | no                            |
| `eye-off`         | Hides a shown value                       | no                            |

They're original outline drawings in the style of Heroicons, on a 24 grid with a 1.5 stroke. The four status icons differ in shape, not only colour: info a square, success a circle, warning a triangle, error an octagon. The five that say "yes" in the table flip in right-to-left text. KvirnUI's own components use these names, so when you register an icon under the same name, every component uses yours. A plain override keeps the built-in's mirroring.

```tsx
import { Button, Icon } from '@kvirn-ui/react'

<Icon name="search" />
<Icon name="warning" label={messages.warning} size="24" />
<Button><Icon name="add" />Lägg till</Button>
```

## A library icon: `icon`

Pass the component, not an element. It needs no registration. A component can't cross from a server component to a client one, so use `icon` in a client component, and `name` (a string) in a server component.

```tsx
import { Icon } from '@kvirn-ui/react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { Search } from 'lucide-react'

<Icon icon={Search} label={messages.search} />
<Icon icon={MapPinIcon} size="24" />
```

- It takes any component that spreads SVG props onto one `<svg>` and forwards its ref (`IconComponent`): Lucide, Heroicons, Phosphor, Tabler, SVGR output, or your own. A component that doesn't fit is a type error.
- Icon passes `width`, `height`, `className` (joined with the component's own), `aria-*` and `role` to it, and they win over the library's own defaults (Lucide's 24px size, Heroicons' `aria-hidden`).
- `icon` doesn't mirror in right-to-left text by default. Set `mirrorInRtl` on the Icon, or register the icon under a name with `{ component, mirrorInRtl: true }`, which is the better place for a direction.
- A library draws its own stroke (Lucide's 2). To change it, register a wrapper component of your own that sets it, then use the name.
- `IconProps` is a union of four forms (`name`, `icon`, `as` or children). A wrapper that types its props as `Omit<IconProps, K>` flattens the union, so it must omit `name | icon | as | children` together (or use a distributive `Omit`), then pass the one form it wants.

## Registering icons: `name`

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
    <KvirnProvider icons={icons} iconDefaults={{ size: '24' }}>
      {children}
    </KvirnProvider>
  )
}
```

```tsx
// Anywhere, server components included: the name is a string.
<Icon name="delete" />
<Icon name="logo" label="Kvirnby kommun" size="48" />
<Icon name="delte" /> // type error, and a warning in development
```

- An entry is a component, or `{ component, mirrorInRtl }`. `mirrorInRtl: false` turns off the flip a built-in name has (`arrow-forward`), and `mirrorInRtl` on an `<Icon>` wins over the entry. A component must forward its ref and spread SVG props onto one `<svg>`. Lucide, Heroicons, Phosphor, Tabler and SVGR output all do.
- A nested `KvirnProvider` adds icons and replaces names, over its parent's. `iconDefaults` (`size`) merges field by field.
- Which value wins, lowest first: the icon's own defaults, the built-in's mirroring for that name, `iconDefaults`, your entry, then the props on `<Icon>`.
- An unknown name renders an empty `<svg>` at the right size and warns once in development.
- Every registered icon is in the bundle that holds the provider. Register the icons the app uses, and use `as` for a rare one.

## Props

| Prop          | Type                                                         | Default                          |
| ------------- | ------------------------------------------------------------ | -------------------------------- |
| `name`        | `IconName`: a built-in or registered name                    | –                                |
| `icon`        | `IconComponent`: a Lucide, Heroicons or other icon component | –                                |
| `size`        | `IconSize`: a pixel string, `'12'` to `'96'`                 | `iconDefaults.size`, else `'20'` |
| `label`       | `string`                                                     | none: decorative                 |
| `mirrorInRtl` | `boolean`                                                    | the entry's, else `false`        |
| `as`          | a component that draws the icon, for a one-off icon          | –                                |
| `children`    | your own shapes, with Icon as the `<svg>`                    | –                                |

`name`, `icon`, `as` and `children` are exclusive: the types forbid two, and in development, two together warn once. Other SVG attributes, such as `className` or `viewBox`, pass through. `aria-label`, `aria-hidden` and `role` can't be passed: `label` sets them.

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

## Your own SVG: `as` and children

Use these for an icon that isn't a library component: an imported `.svg`, or shapes you draw.

```tsx
// A component that spreads the props on its own <svg> and takes a ref.
<Icon as={MunicipalityLogo} size="24" label={messages.logo} />

// Shapes, with Icon as the <svg>.
<Icon viewBox="0 0 24 24">
  <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth={1.5} />
</Icon>
```

With an element, the element's own props (`<Search size={30} />`, in pixels) win over Icon's, which is why a library component should use `icon` instead.

## Hook

`useIcon` gives the props, and the component for a name, for your own markup.

```tsx
const icon = useIcon({ name: 'close', size: '16' })
const CloseIcon = icon.component
<CloseIcon {...icon.iconProps} />
```

It returns `iconProps`, `component` (`undefined` without a name, or for an unknown one) and `isDecorative`.

## Libraries

| Library     | What to know                                                                      |
| ----------- | --------------------------------------------------------------------------------- |
| Lucide      | Works fully. It follows the text colour and draws its own 2 stroke                |
| Heroicons   | Works fully. Its own `aria-hidden` is removed when you give a `label`             |
| Phosphor    | Fill-based. Choose the weight with Phosphor's `weight` in a wrapper you register  |
| Tabler      | Works fully. It follows the text colour                                           |
| react-icons | Its own `size` wins over Icon's: size it on the component                         |
| Iconify     | Use its offline bundles. Its default mode fetches icons from a third-party server |
| Icon fonts  | Not supported. Use SVG                                                            |

Lucide, Heroicons and Phosphor are tested, with `icon` and in the registry.
