---
'@kvirn-ui/core': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/react': minor
---

Add `KvirnProvider` (Plan 0002): locale, strings, text direction, date settings, router link and a persisted theme preference.

- `react`: `KvirnProvider`, `KvirnThemeScript`, `useLocale`, `useDateSettings`, `useTheme`, and the `Register` interface for typed router links. The entry is marked `"use client"`.
- `core`: `resolveDirection`, `createMessageFormat`, `resolveMessageNamespace`, and the theme store (`getThemeStore`, `createThemeStore`, `createThemeScriptSource`) with `'local'`, `'none'` or custom storage.
- `i18n`: `defineMessages`, the `MessageFormat`, `MessageFunction`, `TextMessage` and `PartialMessages` types, and the first key, `link.newTabNotice`, in all six locales. The Northern Sámi text is an English placeholder until a native speaker reviews it.
