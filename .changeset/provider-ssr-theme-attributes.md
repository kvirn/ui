---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

`KvirnThemeScript` now takes `theme={...}` (the provider's own object) and its flat `defaultColorScheme`, `defaultContrast` and `defaultMotion` props are removed. Without a provider `timeZone`, instants are formatted in UTC (not the runtime's zone, and `useDateSettings().timeZone` is `'UTC'` then), a time is written with `UTC`, and the first one warns in development (`date-without-time-zone`).

Add the server-safe entry `@kvirn-ui/react/server` (no `'use client'`): `KvirnThemeScript`, `getLocaleProps`, `getMessages` and `createMessageFormat`, for a Server Component layout.
