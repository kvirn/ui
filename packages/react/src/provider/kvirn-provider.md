# KvirnProvider

> **Draft** (Plan 0002). This page moves to the docs site once `apps/docs` has a content system. The Next.js and TanStack Router recipes have not yet been verified in a sample app. `TODO(verify-recipe)`.

`KvirnProvider` gives every KvirnUI component its locale, strings, text direction, date settings and router link. It also owns the document's theme preference, which a theme switcher reads and changes through `useTheme()`.

It's optional. Without a provider, components use English (`en`), left-to-right text, the runtime's time zone and a native `<a>`, and the theme follows the operating system.

The provider renders no element of its own for layout or styling. The outermost one adds two empty, visually hidden live regions after its children, for `useAnnouncer()` (see [Announcer](../announcer/announcer.md)).

## Setup

### Next.js (App Router)

`KvirnProvider` is a client component. Passing a component such as `NextLink` as a prop needs a client wrapper:

```tsx
// app/providers.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider
      locale="sv-SE"
      messages={sv}
      timeZone="Europe/Stockholm"
      linkComponent={NextLink}
      theme={{ defaultColorScheme: 'system', defaultContrast: 'system' }}
    >
      {children}
    </KvirnProvider>
  )
}
```

```tsx
// app/layout.tsx
import { KvirnThemeScript } from '@kvirn-ui/react'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { Providers } from './providers'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="sv-SE" dir="ltr" suppressHydrationWarning>
      <head>
        <KvirnThemeScript nonce={nonce} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- **`<html lang dir>`:** set them to the root provider's locale and direction (WCAG 3.1.1). The provider renders no element that could hold it, so it can't set the page language. `resolveDirection(locale)` from `@kvirn-ui/core` gives `dir` for a locale that isn't known ahead of time.
- **Nested languages:** a nested provider that changes the language needs that language's catalog, for example `<KvirnProvider locale="fi-FI" messages={fi}>`. Also spread `useLocale().localeProps` on its section (3.1.2).
- **`timeZone`:** set it explicitly. Otherwise the server formats dates in its own zone and the browser in the visitor's, and the two renders differ.
- **`suppressHydrationWarning` on `<html>`:** `KvirnThemeScript` adds `data-kv-color-scheme` and `data-kv-contrast` before React hydrates, so the server markup and the page differ on purpose. The flag only affects `<html>`'s own attributes.

### TanStack Router

```tsx
// src/main.tsx
import { KvirnProvider } from '@kvirn-ui/react'
import { fi } from '@kvirn-ui/i18n/fi'
import { Link, RouterProvider } from '@tanstack/react-router'

export function App() {
  return (
    <KvirnProvider locale="fi-FI" messages={fi} timeZone="Europe/Helsinki" linkComponent={Link}>
      <RouterProvider router={router} />
    </KvirnProvider>
  )
}
```

If you render on the server, add `<KvirnThemeScript />` to the server-rendered document's `<head>` (see [The theme script](#the-theme-script)). In a client-only app, the provider applies the theme when it mounts, so a brief flash of the default theme is possible.

## Typed router links: `Register`

Register your router's link component once, and every KvirnUI component that renders a link gets that component's props, including typed routes:

```ts
// kvirn-ui.d.ts
import type NextLink from 'next/link'
import type { icons } from './icons'

declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
    icons: typeof icons
  }
}
```

Without the augmentation, `linkComponent` only accepts `'a'`, and link props are native `<a>` props. The registered component must forward its ref and render an `<a>`. `icons` is the registry you pass to `<KvirnProvider icons>` (see below): registering its type adds your names to `IconName`, so a misspelt `<Icon name>` is a type error. Both keys are optional and independent.

## Icons: `icons` and `iconDefaults`

Register your icons once, so `<Icon name>` works everywhere and names are checked. The registry holds components, so it lives in a client module next to this setup. See [Icon](../icon/icon.md#registering-icons).

```tsx
<KvirnProvider icons={icons} iconDefaults={{ strokeWidth: 1.5 }}>
```

## Locale and direction

```tsx
const locale = useLocale() // { locale, dir, country, localeProps: { lang, dir } }
const dateSettings = useDateSettings() // { timeZone, weekStart }
```

- `locale` is a BCP 47 tag, such as `sv-SE`, `fi-FI` or `nn-NO`. It drives `Intl.*` formatting and `lang`. `sv`, `fi`, `nb` and `nn` need no region, but `Intl` reads a bare `en` as US English (`10/14/26`, `October 14, 2026`). Pass `en-GB` for English written the way the rest of Europe writes it (`14/10/2026`, `14 October 2026`).
- `dir` comes from the locale. Use the `dir` prop to override it.
- `country` is `SE`, `FI` or `NO`, for the masks that differ by country (`mask="postal-code"`, `"personal-identity-number"`, `"organisation-number"` on a TextInput). It is the `country` prop, else the region of the locale (`sv-FI` is `FI`), else its language (`sv` is `SE`, `fi` is `FI`, `nb`, `nn`, `no` and `se` are `NO`), else `undefined` (`en`): then a country mask only takes digits and warns once. Set the prop where the locale doesn't say, such as `se` (Northern Sami) in Finland. A nested provider inherits the parent's `country` prop, so set it again when a section changes country.
- `weekStart` is the first day of the week in Calendar and DatePicker: `1` (Monday) to `7` (Sunday), the ISO weekday. It is the Calendar's own `weekStart`, else the provider's, else the locale's when the locale names a region (`en-US` is Sunday, `en-GB` Monday), else Monday. A bare `en` stays Monday, as in every Nordic country and the EU, though `Intl` alone would say Sunday. Week numbers are ISO 8601 and only show with a Monday start. `useDateSettings().weekStart` is the resolved provider-level value; outside React use `resolveWeekStart({ instance, provider, locale })` from `@kvirn-ui/core`. Set `weekStart` explicitly for server rendering, like `timeZone`: a runtime without `Intl` week data answers Monday where another answers Sunday, so the server and the browser could differ. A value that isn't a whole number from 1 to 7 is ignored with a development warning.

### A section in another language

A nested provider inherits everything it doesn't set. Because the provider renders no wrapper element, spread `localeProps` on the element that starts the section, so `lang` matches the strings inside it (WCAG 3.1.2):

```tsx
function FinnishSummary({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider locale="fi-FI" messages={fi}>
      <FinnishSection>{children}</FinnishSection>
    </KvirnProvider>
  )
}

function FinnishSection({ children }: { children: ReactNode }) {
  const locale = useLocale()
  return <section {...locale.localeProps}>{children}</section>
}
```

## Formatting: `useFormat`

`useFormat()` writes numbers, dates, lists and plurals the way the nearest provider's `locale` does. It is the same `format` that [messages](#strings-messages) receive, so a number reads the same in a message and in a table cell. You build no `Intl.*` object, keep no locale map and set no time zone by hand:

```tsx
import { useFormat } from '@kvirn-ui/react'

function Payment({ date, amount }: { date: string; amount: number }) {
  const format = useFormat()
  return (
    <p>
      {format.date(date, { dateStyle: 'long' })}: {format.number(amount)}
    </p>
  )
}
```

| Method                           | Formats                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `format.number(value, options?)` | `Intl.NumberFormat`: decimals, percent, currency (`{ style: 'currency', currency: 'SEK' }`) and units                        |
| `format.date(value, options?)`   | `Intl.DateTimeFormat`: `{ dateStyle: 'long' }`, `{ timeStyle: 'short' }`, `{ month: 'long' }`. See below for what a value is |
| `format.list(items, options?)`   | `Intl.ListFormat`: `sv, fi och en`, or `{ type: 'disjunction' }` for "or"                                                    |
| `format.plural(count, forms)`    | The form for the locale's plural rules: `{ one, other }`, and `zero` for exactly 0                                           |

- **An instant** (a `Date` or milliseconds) is shown in the provider's `timeZone`, or the runtime's when there is none. `options.timeZone` wins. Set `timeZone` on the provider, so the server and the browser agree.
- **A calendar date** is a string written `YYYY-MM-DD`: a day with no time of day and no time zone, such as a date of birth or a decision date from an API. It is shown on that day in every zone, because it is read as UTC and shown in UTC, so it never moves to the day before or after. Any other string (a time, `2026-02-30`, an empty one) throws a `RangeError`, as an invalid `Date` does. Check a missing value yourself.
- **`Intl` objects are reused**, so a table can call `format.number(amount)` in every cell. The `format` object stays the same until the locale or the time zone changes, so it is safe in a dependency list.
- **Without a provider** it is `en` and the runtime's time zone.
- **Outside React**, such as in a server component, build the same thing with `createMessageFormat({ locale, timeZone })` from `@kvirn-ui/core`. A hook can't run in a server component.

## Strings: `messages`

Every visible or announced string has a default and can be replaced. Import the catalog for your locale and pass it as `messages`. English is built in and is the fallback:

```tsx
import { sv } from '@kvirn-ui/i18n/sv'
;<KvirnProvider locale="sv-SE" messages={sv}>
```

Only the catalogs you import are bundled.

Resolution order, first match wins:

1. Children of a visible text part, for example `<Link.NewTabNotice>(nytt fönster)</Link.NewTabNotice>`.
2. The component's own `messages` prop, for example `<Link.Root messages={{ newTabNotice: '(nytt fönster)' }}>`.
3. The nearest provider's `messages`, then its ancestors'.
4. Built-in English. In development, you get a console warning when this happens under a non-English locale.

### Adjusting a catalog

`defineMessages` builds an adjusted catalog once, with typed keys:

```tsx
import { defineMessages } from '@kvirn-ui/i18n'
import { sv } from '@kvirn-ui/i18n/sv'

const messages = defineMessages(sv, {
  link: { newTabNotice: '(öppnas i nytt fönster)' },
})
```

A nested provider with a partial object changes only its section:

```tsx
<KvirnProvider locale="sv-SE" messages={messages}>
  <KvirnProvider messages={{ link: { newTabNotice: '(extern tjänst, ny flik)' } }}>
    {/* only this section */}
  </KvirnProvider>
</KvirnProvider>
```

- A misspelt key or namespace is a type error.
- An empty or whitespace-only string is ignored, with a development warning, and the next level is used. A component never gets an empty accessible name.
- If you change a string that is also an accessible name, keep it consistent with the visible label (WCAG 2.5.3 Label in Name).

### Your own i18n system

Any key can be a function, so strings can come from your translation system. The provider re-renders when you pass new messages, for example after a language change:

```tsx
const messages = defineMessages(sv, {
  link: { newTabNotice: () => t('kvirn.link.newTabNotice') },
})
```

Keys with parameters are always functions. They receive their values and a `format` helper built on `Intl` for the active locale (`plural`, `number`, `date` in the provider's `timeZone`, and `list`), the same one [`useFormat()`](#formatting-useformat) returns:

```ts
resultCount: ({ count }, format) =>
  format.plural(count, { one: '1 träff', other: `${format.number(count)} träffar` })
```

## Theme preference

The default theme has two independent axes: colour scheme (`light`, `dark`) and contrast (`standard`, `more`). Each axis follows the operating system (`system`) until the user chooses. The resolved values are written to `<html>`:

```html
<html data-kv-color-scheme="dark" data-kv-contrast="more"></html>
```

`@kvirn-ui/theme` maps these attributes to `--kv-*` tokens, with media-query fallbacks when JavaScript is off. Under `forced-colors: active`, the operating system's palette always wins.

There is one theme store per document. The outermost provider's `theme` options configure it, and nested providers share it.

| `theme` option       | Values                                              | Default    |
| -------------------- | --------------------------------------------------- | ---------- |
| `defaultColorScheme` | `'light'`, `'dark'`, `'system'`                     | `'system'` |
| `defaultContrast`    | `'standard'`, `'more'`, `'system'`                  | `'system'` |
| `storage`            | `'local'`, `'none'`, or a `{ read, write }` adapter | `'local'`  |

### Theme switcher recipe

`useTheme()` works with or without a provider. Build the switcher from native controls with visible labels. Radio groups give you arrow-key navigation, one Tab stop per group and correct screen-reader semantics for free:

```tsx
import { useTheme } from '@kvirn-ui/react'
import type { ColorSchemePreference } from '@kvirn-ui/react'

const colorSchemeOptions: { value: ColorSchemePreference; label: string }[] = [
  { value: 'light', label: 'Ljust' },
  { value: 'dark', label: 'Mörkt' },
  { value: 'system', label: 'Följ systemet' },
]

export function ColorSchemeSwitcher() {
  const theme = useTheme()

  return (
    <fieldset>
      <legend>Färgschema</legend>
      {colorSchemeOptions.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="color-scheme"
            value={option.value}
            checked={theme.colorScheme === option.value}
            onChange={() => theme.selectColorScheme(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
```

Build the contrast group the same way with `theme.contrast` and `theme.selectContrast`. `theme.resolvedColorScheme` and `theme.resolvedContrast` tell you what is in use after the operating system setting is applied. When `theme.isForcedColors` is `true` (for example Windows Contrast Themes), the system's colours win over any choice. Say so next to the switcher instead of claiming a theme is in use, and keep the controls working, since the choice applies again when forced colours are turned off.

- The checked radio is the feedback. Don't move focus, and don't put the resolved values in a live region (`<output>`, `role="status"`): a theme change shouldn't be announced.
- Keep each option at least 24 × 24 CSS pixels (WCAG 2.5.8).

### Storage

- The preference is written only when the user selects a value, never on load or when the operating system setting changes.
- Only the axes that differ from your defaults are stored. With the default `system` defaults, choosing `system` on both axes removes the entry.
- `'local'` stores JSON under the `localStorage` key `kvirn-ui:theme`. If storage is disabled or full, the choice still applies for the current visit.
- `'none'` keeps the choice in memory only.
- Other tabs follow a change through the `storage` event (`'local'` only).

`TODO(legal-verify)`: storing a preference the user explicitly chose is expected to fall under the "strictly necessary" exemption of ePrivacy Directive Art. 5(3), which covers `localStorage` as well as cookies. This hasn't been verified yet. Check it with your data protection officer, and describe the storage in your privacy notice.

### Cookie storage adapter recipe

With a first-party cookie, the server can read the preference and render the attributes itself, so there is no flash and no inline script. KvirnUI doesn't set cookies: this adapter is your code.

```ts
// theme-cookie.ts
import type { StoredThemePreference, ThemeStorageAdapter } from '@kvirn-ui/react'

export const themeCookieName = 'theme-preference'
const oneYearInSeconds = 60 * 60 * 24 * 365

export const cookieThemeStorage: ThemeStorageAdapter = {
  read() {
    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${themeCookieName}=`))
    if (cookie === undefined) {
      return undefined
    }
    return JSON.parse(decodeURIComponent(cookie.slice(themeCookieName.length + 1)))
  },
  write(preference: StoredThemePreference | undefined) {
    const value = preference === undefined ? '' : encodeURIComponent(JSON.stringify(preference))
    const maxAge = preference === undefined ? 0 : oneYearInSeconds
    document.cookie = `${themeCookieName}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  },
}
```

```tsx
<KvirnProvider theme={{ storage: cookieThemeStorage }}>
```

The store validates whatever the adapter returns and ignores unknown values, and a `read` or `write` that throws is caught.

On the server, read the same cookie and render the attributes on `<html>`. Render an attribute only for an explicit `light`/`dark` or `standard`/`more` choice. For `system`, leave it out: `@kvirn-ui/theme`'s media-query fallback applies until the provider sets the attribute after hydration.

`KvirnThemeScript` reads `localStorage` only, so don't render it with a custom adapter.

### The theme script

`KvirnThemeScript` is a small blocking inline script. It reads the stored preference and the operating system settings and sets the attributes before first paint, so there is no flash of the wrong theme.

- It takes a CSP `nonce`, so it works with a strict `script-src` without `'unsafe-inline'`.
- If you configure `defaultColorScheme` or `defaultContrast`, pass the same values to the script.
- Render it only in the server-rendered document. React never runs scripts it creates in the browser, and it warns in development if it does.

```tsx
<KvirnThemeScript nonce={nonce} defaultColorScheme="system" defaultContrast="system" />
```

## Advanced: `env`

`env` sets the window and document the provider works with, for example an iframe's, or a fresh document in tests. By default, the page's own window and document are used after hydration. During server rendering there is none.

```tsx
<KvirnProvider env={{ window: frame.contentWindow, document: frame.contentDocument }}>
```

## API

### `KvirnProvider` props

| Prop            | Type                                                | Default                                                                                                         |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `locale`        | `string` (BCP 47)                                   | `'en'`, or the parent's                                                                                         |
| `dir`           | `'ltr' \| 'rtl'`                                    | From `locale`, or the parent's                                                                                  |
| `country`       | `'SE' \| 'FI' \| 'NO'`                              | The parent's, else from `locale`: its region, then its language                                                 |
| `messages`      | `PartialMessages` (a catalog or a partial override) | Inherited, then built-in `en`                                                                                   |
| `timeZone`      | `string` (IANA)                                     | The parent's, or the runtime's zone                                                                             |
| `weekStart`     | `1` to `7` (ISO weekday, 1 is Monday)               | The parent's, else the locale's when it names a region (`en-US` is `7`), else `1`                               |
| `linkComponent` | `RegisteredLinkComponent`                           | `'a'`, or the parent's                                                                                          |
| `icons`         | `IconRegistry`, from `defineIcons`                  | The built-in icons, then the parent's, merged by name ([Icon](../icon/icon.md))                                 |
| `iconDefaults`  | `IconDefaults` (`size`, `strokeWidth`)              | The parent's, merged by field                                                                                   |
| `theme`         | `ThemeOptions`                                      | Outermost provider only                                                                                         |
| `toast`         | `{ limit?, autoDismiss? }`                          | First provider on the page only: `limit` 10, `autoDismiss` `false` or milliseconds ([Toast](../toast/toast.md)) |
| `env`           | `Env`                                               | The page, after hydration                                                                                       |

### Hooks

| Hook                | Returns                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `useLocale()`       | `{ locale, dir, country, localeProps: { lang, dir } }`                                                                |
| `useDateSettings()` | `{ timeZone, weekStart }`                                                                                             |
| `useFormat()`       | `{ number, date, list, plural }`: the `format` that messages receive ([Formatting](#formatting-useformat))            |
| `useTheme()`        | `{ colorScheme, contrast, resolvedColorScheme, resolvedContrast, isForcedColors, selectColorScheme, selectContrast }` |

### `KvirnThemeScript` props

| Prop                 | Type                               | Default    |
| -------------------- | ---------------------------------- | ---------- |
| `nonce`              | `string`                           | none       |
| `defaultColorScheme` | `'light' \| 'dark' \| 'system'`    | `'system'` |
| `defaultContrast`    | `'standard' \| 'more' \| 'system'` | `'system'` |

## Accessibility

See [kvirn-provider.a11y.md](kvirn-provider.a11y.md). KvirnUI is designed and tested to meet WCAG 2.2 AA. Conformance belongs to your finished site.
