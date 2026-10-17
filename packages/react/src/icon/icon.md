# Icon

> **Draft** (Plan 0009). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [icon.a11y.md](icon.a11y.md), and the design spec is [docs/design/icon.md](../../../../docs/design/icon.md).

One component for every icon: icons from the icon library, your own SVGs, and icons from libraries such as Lucide, Heroicons and Phosphor. There are three routes, and you can mix them:

- **`icon`** for one icon from a library: `<Icon icon={Search} />`. No setup. It also takes an icon from `@kvirn-ui/icons` directly: `<Icon icon={add} />` with `import { add } from '@kvirn-ui/icons'`.
- **`name`** for icons you register once in `KvirnProvider`: `<Icon name="close" />`. Register first: nothing is built in.
- **`as`** (or children) for a one-off icon of your own, such as a municipality's mark.

Icon's `size` and `label` replace the library component's own in every route that draws a component, so you never size an icon on the component itself. `className` is joined with the component's own classes.

- **Decorative by default** (`aria-hidden="true"`). Give it a `label` from your translations when no text next to it says the same thing, and it becomes an image with that name.
- **`size` is the pixel size, as a string.** `<Icon size="20" />` (the default) is 20px at the default root font size: the theme turns it into `1.25rem` with the class `kv-icon--size-20`, so it follows the user's root font size and not the text around it. The sizes are `'12'`, `'14'`, `'16'`, `'20'`, `'24'`, `'28'`, `'32'`, `'40'`, `'48'`, `'56'`, `'64'`, `'80'` and `'96'`. A number or a CSS length (`'48px'`) is a type error: another size is a class you add (`<Icon className="my-icon" />`).
- **Colour is the text colour** (`currentColor`) unless you pass a `variant`, so an icon in a primary Button is white without extra CSS. `variant` is `'primary'`, `'secondary'`, `'accent'`, `'muted'`, `'info'`, `'success'`, `'warning'` or `'danger'` and adds `kv-icon--<variant>`; an unknown value warns once and adds nothing. It decorates: a status icon always comes with the status in words, and the variant never changes the icon's name. Icon has no colour or stroke props. The library icons draw a 1.5 stroke; the classes `kv-icon--stroke-1`, `kv-icon--stroke-1-5` and `kv-icon--stroke-2` set another one (a meaningful icon is at least `'20'`, and `'24'` with `stroke-1`). Any other colour is a class of your own.
- **Attributes, never inline `style`,** so icons work under a strict Content-Security-Policy, and your CSS can still override them.
- Headless: no CSS. The `<svg>` gets `class="kv-icon kv-icon--size-20"` (the size class, and `kv-icon--<variant>` with a variant), `width` and `height` in rem, and `data-mirror-in-rtl` for a directional icon.

## Icons come from your app

`@kvirn-ui/react` has no default icons, so an app bundles only the icons it imports. Every `name` is one you register once in `KvirnProvider` (below), and `icon` draws a drawing or component with no registration. [`@kvirn-ui/icons`](../../../icons) is the icon library: the page **Icons/Library** in Storybook (and the Icons page on the docs site) shows all of it. The drawings are decorative: the name is the text beside each.

Directional icons (`chevron-back`, `chevron-forward`, `arrow-back`, `arrow-forward`, `external`) flip in right-to-left text, because the library marks them with `mirrorInRtl`. Every KvirnUI component imports its own icon from `@kvirn-ui/icons` and passes it with its name (`<Icon name="close" icon={close} />`). So when you register an icon under that name (`close`, `chevron-down`, `info`, and so on), every component uses yours. Mirroring belongs to the name: your entry's `mirrorInRtl` wins, else your entry keeps the flip of the icon it replaces, so a plain `ArrowRight` registered as `arrow-forward` still flips in a component. A bare `<Icon name>` of a plain component doesn't flip unless its entry says `mirrorInRtl: true`.

```tsx
import { Button, Icon } from '@kvirn-ui/react'
import { search } from '@kvirn-ui/icons'

<Icon name="search" />                              // registered once in KvirnProvider
<Icon icon={search} label={messages.search} />      // no registration
<Icon name="close" icon={close} />                  // the registered "close" wins, else the import
<Button><Icon name="add" />Add</Button>
```

The Map (`mapIcons` in `@kvirn-ui/map`, with the default marker pin) and the rich text editor (`richTextIconNames` in `@kvirn-ui/rich-text`) have their own icons.

## An icon: `icon`

For an icon from `@kvirn-ui/icons`, import it by name (camelCase, with no `Icon` suffix, such as `chevronDown`; `deleteIcon` and `newIcon` end in `Icon` because the plain words are reserved) and pass it. Your bundle holds only the icons you import.

```tsx
import { Icon } from '@kvirn-ui/react'
import { search } from '@kvirn-ui/icons'

;<Icon icon={search} label={messages.search} />
```

For an icon from another library, pass the component, not an element. It needs no registration. A component can't cross from a server component to a client one, so use `icon` in a client component, and `name` (a string) in a server component.

```tsx
import { Icon } from '@kvirn-ui/react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { Search } from 'lucide-react'

<Icon icon={Search} label={messages.search} />
<Icon icon={MapPinIcon} size="24" />
```

- It takes any component that spreads SVG props onto one `<svg>` and forwards its ref (`IconComponent`): Lucide, Heroicons, Phosphor, SVGR output, or your own. A component that doesn't fit is a type error.
- Icon passes `width`, `height`, `className` (joined with the component's own), `aria-*` and `role` to it, and they win over the library's own defaults (Lucide's 24px size, Heroicons' `aria-hidden`).
- A component passed to `icon` doesn't mirror in right-to-left text by default. Set `mirrorInRtl` on the Icon, or register the icon under a name with `{ component, mirrorInRtl: true }`, which is the better place for a direction. An icon from `@kvirn-ui/icons` carries its own `mirrorInRtl` flag, so an arrow or chevron from the library flips with no prop.
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
  'arrow-forward': { component: ArrowRight, mirrorInRtl: true }, // replaces the library's arrow in every component
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
<Icon name="logo" label="Kvirnby municipality" size="48" />
<Icon name="delte" /> // type error, and a warning in development
```

- An entry is icon data (an icon from `@kvirn-ui/icons`), a component, or `{ component, mirrorInRtl }`. `mirrorInRtl: false` turns off the flip an icon from the library has (`arrow-forward`), and `mirrorInRtl` on an `<Icon>` wins over the entry. A component must forward its ref and spread SVG props onto one `<svg>`. Lucide, Heroicons, Phosphor and SVGR output all do.
- A nested `KvirnProvider` adds icons and replaces names, over its parent's. `iconDefaults` (`size`) merges field by field.
- Which value wins, lowest first: the icon's own defaults, the icon data's `mirrorInRtl`, `iconDefaults`, your entry, then the props on `<Icon>`.
- An unknown name renders an empty `<svg>` at the right size and warns once in development.
- Every registered icon is in the bundle that holds the provider. Register the icons the app uses, and use `as` for a rare one.

## Props

| Prop          | Type                                                                             | Default                                    |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| `name`        | `IconName`: a registered name, else any string                                   | –                                          |
| `icon`        | `IconRegistryEntry`: a library icon, a Lucide, Heroicons or other icon component | –                                          |
| `size`        | `IconSize`: a pixel string, `'12'` to `'96'`                                     | `iconDefaults.size`, else `'20'`           |
| `variant`     | `IconVariant`: the colour class, see Colour above                                | none (`currentColor`); no provider default |
| `label`       | `string`                                                                         | none: decorative                           |
| `mirrorInRtl` | `boolean`                                                                        | the entry's, else `false`                  |
| `as`          | a component that draws the icon, for a one-off icon                              | –                                          |
| `children`    | your own shapes, with Icon as the `<svg>`                                        | –                                          |

`name`, `icon`, `as` and `children` are exclusive: the types forbid two, and in development, two together warn once. The one pair that is allowed is `name` with `icon`: a registered name wins, else the `icon` draws, and nothing warns. It is how a library component lets your registry swap its icon, and how you can do the same. Other SVG attributes, such as `className` or `viewBox`, pass through. `aria-label`, `aria-hidden` and `role` can't be passed: `label` sets them.

## Labels for library icons

An icon from `@kvirn-ui/icons` that stands alone, such as a status or a place, has a translated label in the `icons` messages. `Icon` never reads it by itself, because most icons sit beside text that already names them. Ask for it with `useIconLabel`, which takes the kebab-case name and returns the label, or `undefined` for an icon that has none (it then stays decorative).

```tsx
import { Icon, useIconLabel } from '@kvirn-ui/react'

<Icon name="city-hall" size="24" label={useIconLabel('city-hall')} />

// One instance: pass messages as the second argument. A provider's `messages={{ icons: { cityHall } }}` changes every one.
<Icon name="city-hall" size="24" label={useIconLabel('city-hall', { cityHall: 'Town hall' })} />
```

Use a size of 20 or larger for an icon with a label. Only names with a label key compile (`IconLabelName`).

## With Button

An icon in a Button takes the Button's colour and lines up with its text. Put it before or after the text: the order in the markup is the order on screen, and right-to-left text flips it.

```tsx
<Button><Icon name="add" />Add</Button>
<Button>Next<Icon name="arrow-forward" /></Button>

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
| react-icons | Its own `size` wins over Icon's: size it on the component                         |
| Iconify     | Use its offline bundles. Its default mode fetches icons from a third-party server |
| Icon fonts  | Not supported. Use SVG                                                            |

Lucide, Heroicons and Phosphor are tested, with `icon` and in the registry.
