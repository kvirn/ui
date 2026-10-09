// `@kvirn-ui/react/server`: the Provider's server side, safe to import in a Server Component
// (Plan 0094). It has no `'use client'` and its graph is `@kvirn-ui/core`, `@kvirn-ui/i18n` and
// React types only, so it must never import a file the client banner touches.
export { createMessageFormat } from '@kvirn-ui/core'
export type { MessageFormatter, ThemeOptions, ThemeScriptOptions } from '@kvirn-ui/core'
export { KvirnThemeScript } from './server/server-theme-script.tsx'
export type { KvirnThemeScriptProps } from './server/server-theme-script.tsx'
export { getLocaleProps } from './server/get-locale-props.ts'
export type { LocaleProps } from './server/get-locale-props.ts'
export { getMessages } from './server/get-messages.ts'
export type { GetMessagesOptions } from './server/get-messages.ts'
