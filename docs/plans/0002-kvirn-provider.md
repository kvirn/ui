# Plan 0002: KvirnProvider (locale, dates, links, theme preference)

- **Status:** Approved
- **Owner:** Maintainer
- **Created:** 2026-09-30 · **Target:** M0/M1
- **Related:** ADR-0003, ADR-0005, ADR-0006, ADR-0007, ADR-0008, Plan 0001

## Goal

One optional provider gives every KvirnUI component its locale, strings, text direction, date settings and router link, and gives the app a persisted theme preference that a theme switcher can read and change.

## Non-goals

- The Announcer live region (own roadmap item). The provider will host it later.
- A theme switcher UI. That's a block or consumer markup built on `useTheme()`.
- Theme tokens and CSS. Those are `@kvirn-ui/theme`.
- Loading catalogs by locale string (ADR-0007).

## Background

- `architecture.md` already assumes `<KvirnProvider locale>` and `dir` from context.
- React Aria (`I18nProvider`, `RouterProvider`), Radix (`DirectionProvider`) and TanStack Router (`Register` interface) are prior art.

## Design

### API sketch

```tsx
// app/providers.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KvirnProvider
      locale="sv-SE" // BCP 47, drives Intl.* and catalog lookup
      messages={sv} // en is built in and used as the fallback
      timeZone="Europe/Stockholm" // explicit to avoid SSR/client date mismatch
      weekStart={1} // Monday (default)
      linkComponent={NextLink} // ADR-0005
      theme={{ defaultColorScheme: 'system', defaultContrast: 'system' }}
    >
      {children}
    </KvirnProvider>
  )
}

// Typed router props everywhere (ADR-0005)
declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
  }
}

// app/layout.tsx: no-flash theme script, CSP-friendly
;<head>
  <KvirnThemeScript nonce={nonce} />
</head>
```

```tsx
// Replacing strings (ADR-0008). Every provider's messages is deep-merged over its parent's; the root inherits en
import { defineMessages } from '@kvirn-ui/i18n'

const messages = defineMessages(sv, {
  link: { newTabNotice: '(öppnas i nytt fönster)' },
})
<KvirnProvider locale="sv-SE" messages={messages}>
  …
  <KvirnProvider messages={{ link: { newTabNotice: '(extern tjänst, ny flik)' } }}>
    {/* only this section */}
  </KvirnProvider>
</KvirnProvider>

// Existing i18n system: function values
defineMessages(sv, { link: { newTabNotice: () => t('kvirn.link.newTabNotice') } })

// Inside components (internal): instance messages > providers > en
const linkMessages = useMessages('link', props.messages)
```

```tsx
// Reading config
const locale = useLocale() // { locale, dir, localeProps: { lang, dir } }
const dateSettings = useDateSettings() // { timeZone, weekStart }

// Theme switcher (consumer markup, e.g. a RadioGroup)
const theme = useTheme()
theme.colorScheme // 'light' | 'dark' | 'system'   (preference)
theme.contrast // 'standard' | 'more' | 'system'
theme.resolvedColorScheme // 'light' | 'dark'              (after OS)
theme.resolvedContrast // 'standard' | 'more'
theme.selectColorScheme('dark')
theme.selectContrast('more')
```

### Behaviour

- **Optional.** Every component works without a provider: `en`, `ltr`, Monday, the runtime time zone, a native `<a>`, and theme following the OS.
- **Nesting.** A nested provider inherits unset props from its parent. For a section in another language, the consumer spreads `locale.localeProps` on the section's element, so `lang` matches the strings (3.1.2). The provider itself renders no element.
- **Messages** (ADR-0008):
  - Resolution order: children of a text part, then the instance `messages` prop, then the nearest provider and its ancestors, then built-in `en`.
  - Parameterised keys are functions with a `format` helper built on `Intl` (plural, number, date, list).
  - An empty override triggers a dev warning and falls through, so an accessible name is never empty.
  - Falling back to `en` under a non-`en` locale triggers a dev warning.
- **dir** comes from the locale (`Intl.Locale` text info, falling back to a small RTL list) and can be overridden with `dir`.
- **Theme** (ADR-0006):
  - Store lives in `core/src/theme/` (built on `createComponentStore`) and reads `matchMedia` through `Env`.
  - One store per document. Only the outermost provider creates it, and nested providers share it.
  - The provider writes `data-kv-color-scheme` and `data-kv-contrast` (resolved values) to `<html>` through `Env`.
  - Persistence is pluggable: `storage: 'local'` (default) | `'none'` | `{ read, write }` (for example a first-party cookie, so the server renders the right attributes).
  - Storage is written only when the user explicitly selects a value. Selecting `system` removes the key.
  - `KvirnThemeScript` is a blocking inline script with a `nonce` prop, for strict CSP.
  - Under `forced-colors: active` the OS palette wins. `@kvirn-ui/theme` must not override it.
- **Env.** An optional `env` prop, for iframes, shadow roots and tests. The default is resolved lazily from `globalThis`.
- **Performance.** Config context is memoised. Theme is read via `useStoreSelector`, so only theme consumers re-render on change.
- **RSC.** Client component (`"use client"`). Passing `linkComponent` needs a client wrapper, as shown above.

### Accessibility contract (draft)

The provider is not interactive. Its contract is about what it guarantees for other components:

- `lang` / `dir` are available as `localeProps` wherever the locale changes (3.1.1, 3.1.2).
- All visible and announced component strings come from `messages`, with `en` as the fallback (hard rule 4).
- Theme follows `prefers-color-scheme` and `prefers-contrast` until the user chooses, and never overrides `forced-colors` (1.4.3, 1.4.6, 1.4.11).
- A theme change doesn't move focus and doesn't announce. The switcher's own control state is the feedback.

### i18n strings

None of its own.

### Theming surface

`<html data-kv-color-scheme="light|dark" data-kv-contrast="standard|more">`. `@kvirn-ui/theme` maps these to `--kv-*` tokens, with media-query fallbacks when JavaScript is off.

## Tasks

- [ ] ADR-0005, ADR-0006, ADR-0007, ADR-0008 reviewed and accepted
- [ ] `core`: locale utilities (`resolveDirection`, deep merge, message resolution with fallthrough, `format` helper), unit tests
- [ ] `i18n`: `KvirnMessages` type, `defineMessages`, type tests (key typos, missing parameters, partial overrides)
- [ ] `i18n:check`: function keys have matching parameters in all locales
- [ ] `core`: theme store (preference, resolution via `Env.matchMedia`, storage adapters), unit tests
- [ ] `i18n`: catalog type, `en` catalog, `@kvirn-ui/i18n/<locale>` subpath exports
- [ ] `react`: `KvirnProvider`, `useLocale`, `useDateSettings`, `useTheme`, `Register`, `KvirnThemeScript`
- [ ] Vitest browser tests: defaults without provider, nesting, `localeProps`, each message resolution level, empty-override fallthrough, persistence, OS changes, `system` clears storage, SSR render + hydration without mismatch
- [ ] Stories: sv / fi / en, RTL override, all four theme combinations, forced-colors
- [ ] Docs page draft + changeset

## Risks & open questions

- ePrivacy Art. 5(3) covers localStorage as well as cookies. Storing a preference the user explicitly chose should fall under the "strictly necessary" exemption. `TODO(legal-verify)` via the regulations skill before release.
- `Intl.Locale` text info support differs by browser. The fallback list covers this.
- A `KvirnThemeScript` string must stay in sync with the core resolution logic. Generate it from the same source.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated
