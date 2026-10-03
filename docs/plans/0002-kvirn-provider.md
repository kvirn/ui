# Plan 0002: KvirnProvider (locale, dates, links, theme preference)

- **Status:** Done
- **Owner:** Maintainer
- **Created:** 2026-09-30 · **Target:** M0/M1
- **Related:** Plan 0001

## Goal

One optional provider gives every KvirnUI component its locale, strings, text direction, date settings and router link, and gives the app a persisted theme preference that a theme switcher can read and change.

## Non-goals

- The Announcer live region (own roadmap item). The provider will host it later.
- A theme switcher UI. That's a block or consumer markup built on `useTheme()`.
- Theme tokens and CSS. Those are `@kvirn-ui/theme`.
- Loading catalogs by locale string.

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
      linkComponent={NextLink}
      theme={{ defaultColorScheme: 'system', defaultContrast: 'system' }}
    >
      {children}
    </KvirnProvider>
  )
}

// Typed router props everywhere
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
// Replacing strings. Every provider's messages is deep-merged over its parent's; the root inherits en
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
- **Messages**:
  - Resolution order: children of a text part, then the instance `messages` prop, then the nearest provider and its ancestors, then built-in `en`.
  - Parameterised keys are functions with a `format` helper built on `Intl` (plural, number, date, list).
  - An empty override triggers a dev warning and falls through, so an accessible name is never empty.
  - Falling back to `en` under a non-`en` locale triggers a dev warning.
- **dir** comes from the locale (`Intl.Locale` text info, falling back to a small RTL list) and can be overridden with `dir`.
- **Theme**:
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

### Implementation notes (settled 2026-09-30)

**Package boundaries.** `core` must not depend on `i18n`.

- **`core` holds generic logic:** message layer resolution, `createMessageFormat`, `resolveDirection` and the theme store. It never imports `KvirnMessages`.
- **`i18n` holds types and catalogs:** `KvirnMessages`, `PartialMessages`, `MessageFormat` and `defineMessages`, plus the catalogs.
- **`react` glues them together.** A type test proves that `core`'s formatter satisfies `i18n`'s `MessageFormat`.

**Messages.**

- **First real key.** The catalog gets `link.newTabNotice` in all 6 locales (strings from Plan 0003), so resolution is tested against real types. Plan 0003 still owns the Link component.
  - `se` uses the English text with `// TODO(native-review)` until a native speaker provides it. It is listed under known issues.
- **Catalog depth is fixed at `namespace.key`.**
  - `PartialMessages = { [N in keyof KvirnMessages]?: Partial<KvirnMessages[N]> }`.
  - `defineMessages(base: KvirnMessages, overrides: PartialMessages): KvirnMessages`.
- **Function keys** are typed `(values: V, format: MessageFormat) => string`.
  - `MessageFormat` is `{ plural(count, forms: { zero?, one?, two?, few?, many?, other }), number(value, options?), date(value, options?), list(items, options?) }`.
  - It's built on `Intl` for the active locale, and `date` uses the provider's `timeZone`.
- **Providers keep an ordered list of layers:** `[nearest provider messages, …, root provider messages, en]`. They don't pre-merge, so an empty value can fall through to the next layer.
- **`useMessages(namespace, instanceMessages?)`** returns the resolved namespace.
  - A string key resolves to the first non-empty value, checking the instance messages first, then the provider layers.
  - A function key becomes a wrapper that calls the layers in order and returns the first non-empty result.
- **Dev warnings** fire once per key, and never in production. They must also work in Vitest browser mode, where `process` may be missing.
  - They cover empty overrides and falling back to `en` under a non-`en` locale.

**Locale and dates.**

- `resolveDirection(locale)` uses `Intl.Locale#getTextInfo()` (or the `textInfo` getter), and falls back to a list of RTL languages: `ar`, `he`, `fa`, `ur`, `ps`, `sd`, `ug`, `yi`, `dv`, `ckb`.
- `localeProps` is `{ lang, dir }`.
- `timeZone` is `string | undefined`, where `undefined` means the runtime's zone. Docs recommend setting it explicitly for SSR.

**Theme store** (`core/src/theme/`).

- **One store per document.** `getThemeStore(env, options)` keeps stores in a `WeakMap<Document, ThemeStore>`. `useTheme()` works without a provider (defaults, `storage: 'local'`). The outermost provider's `theme` options configure the store, and a nested provider passing `theme` gets a dev warning.
- **State and actions:**
  - State: preference `{ colorScheme, contrast }`, system `{ colorScheme, contrast, isForcedColors }`, and the derived resolved values.
  - Actions: `selectColorScheme` and `selectContrast`.
  - `prefers-contrast: more` resolves to `more`. Every other value resolves to `standard`.
- **`connect()`** is ref-counted and returns a cleanup. It:
  - subscribes to the `matchMedia` changes (`prefers-color-scheme`, `prefers-contrast`, `forced-colors`),
  - listens for the `storage` event, so other tabs stay in sync,
  - applies `data-kv-color-scheme` and `data-kv-contrast` to `document.documentElement`.
- **Storage:**
  - The key is `kvirn-ui:theme`, holding JSON `{ colorScheme?, contrast? }`. Only axes that differ from the configured default are written. With the default `system` defaults, that means only non-`system` values, and the key is removed when both are `system`.
  - Every storage access is wrapped in `try/catch`, because storage can be disabled or in private mode.
  - Adapters: `'local'`, `'none'`, or `{ read(): StoredThemePreference | undefined, write(preference: StoredThemePreference | undefined): void }`.
- **`KvirnThemeScript`** renders `<script nonce>` with source from `core`'s `createThemeScriptSource(options)`. It supports `storage: 'local'` only. With a custom adapter, the server renders the attributes itself.
  - A browser test runs the script against every preference × system combination and asserts that it sets the same attributes as the store. That test is what keeps the two in sync.
  - The docs tell consumers to put `suppressHydrationWarning` on `<html>`.

**Links.** `react` exports `interface Register {}` and `type RegisteredLinkComponent`, which is `Register['linkComponent']` when augmented and `'a'` otherwise. The provider takes a `linkComponent` prop, and an internal `useLinkComponent()` reads it.

**Env.** The provider takes an `env` prop, and an internal `useEnv()` reads it. The default comes from `getDefaultEnv()` after mount, so it's `undefined` during SSR.

**Stories and e2e.**

- **Fixture:** it shows the locale, `dir`, a date formatted with `timeZone`, and the `newTabNotice` string. It also has a theme switcher built from native radio groups (`<fieldset>`/`<legend>`), which shows the resolved values.
- **Stories:** sv, fi and en, an RTL override, a nested-locale section, the theme switcher, and forced colors.
- **E2E:**
  - Arrow keys change the radio groups.
  - The choice persists across a reload.
  - `system` clears storage.
  - The forced-colors and reflow projects pass.

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

- [x] The decisions on catalog loading, the registry, themes and messages reviewed and accepted
- [x] `core`: locale utilities (`resolveDirection`, deep merge, message resolution with fallthrough, `format` helper), unit tests
- [x] `i18n`: `KvirnMessages` type, `defineMessages`, type tests (key typos, missing parameters, partial overrides)
- [x] `i18n:check`: function keys have matching parameters in all locales
- [x] `core`: theme store (preference, resolution via `Env.matchMedia`, storage adapters), unit tests
- [x] `i18n`: catalog type, `en` catalog, `@kvirn-ui/i18n/<locale>` subpath exports
- [x] `react`: `KvirnProvider`, `useLocale`, `useDateSettings`, `useTheme`, `Register`, `KvirnThemeScript`
- [x] Vitest browser tests: defaults without provider, nesting, `localeProps`, each message resolution level, empty-override fallthrough, persistence, OS changes, `system` clears storage, SSR render + hydration without mismatch
- [x] Stories: sv / fi / en, RTL override, all four theme combinations, forced-colors
- [x] Docs page draft + changeset

## Risks & open questions

- Implementation decisions not covered above were proposed separately: theme storage relative to non-`system` defaults, text keys that accept `() => string` (resolved function keys bind `format`, `plural` `zero`), and the `"use client"` banner on the react bundle.
- `i18n:check` compares function arity (`Function.length`). A locale whose function omits the unused `format` parameter would be reported as a mismatch even though the types accept it. No function keys exist yet; revisit with the first one.

- ePrivacy Art. 5(3) covers localStorage as well as cookies. Storing a preference the user explicitly chose should fall under the "strictly necessary" exemption. `TODO(legal-verify)` via the regulations skill before release.
- `Intl.Locale` text info support differs by browser. The fallback list covers this.
- A `KvirnThemeScript` string must stay in sync with the core resolution logic. Generate it from the same source.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`). Gates 1–5 pass (2026-09-30, WebKit projects not run locally); gate 6 accessibility-reviewer APPROVE after one round of fixes
- [x] Plan tasks ticked, `docs/roadmap.md` updated
