# Plan 0094: The Provider is SSR- and RSC-ready

- **Status:** Done
- **Owner:** lead
- **Created:** 2026-10-09 · **Target:** pre-alpha
- **Related:** Plan 0093 (`as` replaces `render`), Plan 0092 (motion preference), `kvirn-provider.md`, `.claude/skills/api-conventions/SKILL.md`

## Goal

Every part is SSR- and RSC-safe since Plan 0093. The Provider gets the same bar: a consumer writes one documented, small piece of code in a Next App Router `layout.tsx` (a Server Component) and gets locale, messages, theme without a flash, router link and icons, with no hydration error.

## Non-goals

- Cookie storage inside KvirnUI (policy: KvirnUI sets no cookies). A recipe only.
- A built-in Next adapter (`@kvirn-ui/react/next`): it would add a router dependency.

## Background (architect's audit, 2026-10-09)

- No SSR bug in the Provider itself. The two failing provider tests and the four `kvirn-provider.stories` failures were stale expectations: the fixture gained `, Full motion` (Plan 0092) and Vitest 5 matches whole strings. Fixed in this session; the SSR test's hydration checks (no recoverable errors, no `console.error`) now run and pass.
- What cannot cross from a Server Component to `<KvirnProvider>`: `messages` (catalogs hold functions, 83 in `en.ts`), `linkComponent` (`next/link` is a plain server wrapper on the server, not a client reference), `icons` (components, and `defineIcons` comes from the `'use client'` entry), `theme.storage` (functions), `env`. What can: `locale`, `dir`, `country`, `timeZone`, `weekStart`, `theme` defaults, `toast`, `iconDefaults`, `children`, the script's `nonce`.
- The server never knows the visitor: `resolvedColorScheme` is `light`, contrast `standard`, motion `full` until hydration. CSS on `data-kv-*` set by `KvirnThemeScript` is flash-free; JS that swaps visuals flashes.

## Findings to fix

| #   | Issue                                                                                                                                            | Where                                                                                  | Kind                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Theme defaults written twice in two shapes (flat props on the script, a `theme` object on the provider): drift gives a wrong first paint         | `kvirn-theme-script.tsx:8-13`, `apps/docs/app/layout.tsx`+`providers.tsx`              | API inconsistency      |
| 3   | `timeZone` defaults to the runtime zone with no warning; the docs app passes none                                                                | `kvirn-provider.tsx:71`, `apps/docs/app/providers.tsx:46`                              | server/client mismatch |
| 4   | `<html lang dir>` is a hand copy of the locale; recipes use `dir="ltr"`                                                                          | `apps/docs/app/layout.tsx:21`, `core` `resolveDirection`                               | API inconsistency      |
| 5   | Nonce under a real CSP is untested                                                                                                               | `kvirn-theme-script.test.tsx:126-137`                                                  | untested               |
| 6   | Stale docs: skill calls the script "a plain function" (it is a client component), motion attribute missing, `render` leftovers, `next/link` rule | `SKILL.md:32,62,76,138,149,155`, `architecture.md:20,142`, `kvirn-provider.a11y.md:77` | docs                   |

## Design

### The contract a consumer writes

```tsx
// app/kvirn-provider.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'
import { icons } from './icons' // a 'use client' module that calls defineIcons

export function AppKvirnProvider(
  props: Omit<KvirnProviderProps, 'messages' | 'linkComponent' | 'icons' | 'env'>,
) {
  return <KvirnProvider {...props} messages={sv} linkComponent={NextLink} icons={icons} />
}

// app/layout.tsx (a Server Component)
const locale = 'sv-SE'
const theme = { defaultColorScheme: 'system', defaultContrast: 'system', defaultMotion: 'system' } as const
<html lang={locale} dir={resolveDirection(locale)} suppressHydrationWarning>
  <head><KvirnThemeScript nonce={nonce} theme={theme} /></head>
  <body>
    <AppKvirnProvider locale={locale} timeZone="Europe/Stockholm" weekStart={1} theme={theme}>
      {children}
    </AppKvirnProvider>
  </body>
</html>
```

Several languages: the wrapper takes a `catalog: LocaleCode` string and picks the catalog itself.

### Options weighed

- **A. Docs and tests only:** write the contract down, fix the stale docs, add SSR, hydration and CSP tests. No API change.
- **B. A plus small serializable additions:** B1 `KvirnThemeScript theme={…}` (the provider's own object); B3 a dev warning when an instant is formatted without a `timeZone`. (B2, a server helper that turns a cookie into `<html>` attributes, and B4, `theme.initialPreference`, were dropped: no cookie path.)
- **C. Ship `@kvirn-ui/react/server` now:** a real server `KvirnThemeScript`, `getLocaleProps`, `getMessages` (server `useMessages`), `createMessageFormat`. Needs a per-chunk banner and a test that the entry has no `'use client'`. Chosen by the maintainer.
- **D. The provider renders the script itself:** one step fewer, but a first paint can come before the script. Rejected.
- **E. Catalogs and icons through a user `'use client'` re-export:** depends on the bundler, and `strings-block.tsx` reads catalogs on the server. Rejected as the documented path.

**Chosen:** A, B1, B3 and C (maintainer, 2026-10-09).

## Decisions (maintainer, 2026-10-09)

1. Option C: ship `@kvirn-ui/react/server` now. Its Provider part: a server `KvirnThemeScript` (no hook, no client JS), `getLocaleProps(locale, dir?)`, `getMessages(namespace, { locale, messages, timeZone })`, `createMessageFormat`. The pure presentational parts (Heading, Section, ...) are a later step.
2. `KvirnThemeScript` takes `theme={…}` only, the provider's own object. The flat default props are removed, no alias.
3. `timeZone`: a missing one falls back to `'UTC'` (server and client agree) and warns once in development when an instant is formatted without it.
4. No built-in cookie storage (recipe only). `NextLink` needs a client module: the "client component crosses" rule names that exception.
5. B4 `theme.initialPreference`: not now.

## Tasks

- [x] **T1** Fix the stale text in `kvirn-provider-ssr.test.tsx`, `use-theme-without-provider.test.tsx` and `kvirn-provider.stories.tsx` (done).
- [x] **T2** SSR tests in `kvirn-provider-ssr.test.tsx`: `renderToString` without env gives defaults and both live regions; hydration with a stored `{dark, more, reduce}` has no recoverable errors, no `console.error` and unchanged `<html>` attributes; an instant with `timeZone` set reads the same on the server and the client; a nested `fi-FI` section; `useTheme` without a provider (SSR then hydrate).
- [x] **T4** (S1) `KvirnThemeScript theme={…}` only (flat props removed); `timeZone` UTC fallback and its warning (T6).
- [x] **T4b** (S2) `@kvirn-ui/react/server` entry: pack config with the banner per chunk, exports, a test that the entry and its chunks carry no `'use client'`, server `KvirnThemeScript`, `getLocaleProps`, `getMessages`, `createMessageFormat`.
- [x] **T5** CSP test: an iframe `srcdoc` with `script-src 'nonce-…'`; the script ran, `nonce` reads back empty, hydration is clean. Header-CSP hydration is automated in `packages/react/src/provider/kvirn-provider-ssr-csp.test.tsx` (a test-only Vite middleware, `tooling/vite-preset/csp-fixture.ts`, serves the page with a real CSP header; Chromium empties the script's `nonce` attribute there and hydration is clean). Also proven by hand in real Chromium 2026-10-09: `DOCS_CSP_NONCE=1` enables `apps/docs/proxy.ts` (nonce CSP + `x-nonce`; layout reads it, pages become dynamic); `/`, `/components/button`, `/foundation/kvirn-provider` and a stored `{dark, more}` preference all passed: theme attributes set before hydration, no pageerror, no console error or warning, no nonce hydration mismatch. Default build stays static.
- [x] **T6** `date-without-time-zone` dev warning (B3) and its row in `dev-warnings.md`.
- [x] **T7** apps/docs: one shared theme constant with `defaultMotion`, `timeZone`, `dir={resolveDirection(locale)}`, the recipe in `kvirn-provider-page.tsx`. Check: `next build && next start`, a stored preference, no hydration error in the console.
- [x] **T8** Docs in the same PR: `kvirn-provider.md` (a table of what crosses from a Server Component, and why), `kvirn-provider.a11y.md:77`, `architecture.md:20,142`, `api-conventions/SKILL.md` (the script is a client component; `next/link` is a server wrapper on the server, so import it in a client module; `render` leftovers; the render-time warning exception).
- [x] **T9** Changeset (minor for core and react) and `accessibility-reviewer` once on the diff (3.1.1 `lang`, the motion attribute, nothing announced on a theme change).

## Implementation decisions (S1)

- UTC fallback: a time shown from an instant names its zone (`timeZoneName: 'short'`; `timeStyle` short/medium cannot combine with it, so ` UTC` is appended). `useDateSettings().timeZone` and the Calendar's "today" use `UTC` without a provider `timeZone`; no calendar, date-picker or date-range-picker test relied on the runtime zone (all pass `today`).
- `KvirnThemeScript theme` is typed `ThemeScriptOptions` (the three defaults); `storage` is not accepted.
- `timeZone` fallback is `createProviderFormat` (`provider/provider-format.ts`): `createMessageFormat` gets `'UTC'`, and a wrapper warns `date-without-time-zone` once for an instant (not a `YYYY-MM-DD` string, no `options.timeZone`). `useDateSettings().timeZone` is unchanged (`undefined`, so the Calendar's "today" still uses the runtime zone): open for the maintainer.
- The docs app shares `apps/docs/app/theme.ts` and passes `timeZone="UTC"`.

## Implementation decisions (T4b)

- Rolldown's `banner.js` takes a string only, so the pack config is an array of two builds: the client entries (`index`, `internal`) with the banner, and `server` alone, no banner, `clean: false`. The server graph shares no chunk with the client one (it imports only external `core`/`i18n`), so no chunk needs per-file logic.
- The server `KvirnThemeScript` and `LocaleProps` are small duplicates of the client files, because importing them would pull in files the client banner touches. `getMessages` uses `resolveMessageNamespace` and `createMessageFormat` from core, with `timeZone` defaulting to `'UTC'` like the provider and no dev warnings.
- `tooling/react-server-entry` runs `vp pack` in `packages/react` in `beforeAll` (the dist is not committed), then walks the imports of `server.mjs`/`.cjs`.

## Implementation decisions (T7, T8)

- The docs app's client wrapper is `AppKvirnProvider` (`app/providers.tsx`, also hosts `SiteShell`); `layout.tsx` imports the server `KvirnThemeScript` and `getLocaleProps`, and passes `locale`, `timeZone="UTC"` and the shared `theme`. `lang`/`dir` are written as two attributes from `getLocaleProps` because `jsx-a11y/lang` cannot see a spread; the documented recipe spreads it.
- Dev server on :3000: `pages.mjs` and `all.mjs` (56 pages) report no hydration errors. `next build && next start` not run.

## Decisions (final)

- No cookie path and no `getThemeAttributes`: storage stays localStorage/sessionStorage; the first paint is the inline script plus theme.css's own `prefers-*` fallbacks (maintainer, 2026-10-09). `parseStoredThemePreference` is internal to the theme store again. The S1 `getThemeAttributes` notes above, B2, B4 and the cookie-layout variant are void.

## Implementation decisions (review fixes)

- Calendar without a provider `timeZone`: SSR and the first client render use the UTC "today"; a mount effect re-reads it in the browser zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and moves `aria-current`. Focus follows only while the user has not chosen, moved or set `defaultFocusedDate`. `useFormat` stays UTC; a passed `today` or a provider `timeZone` is untouched.
- A date-only instant in the UTC fallback keeps no zone label (maintainer: document, not change); docs say to use the `YYYY-MM-DD` form for a calendar date.
- Dropped the duplicate "no role on the div root" check in accordion.test.tsx; added "a consumer role wins" tests to columns, stack and accordion.
