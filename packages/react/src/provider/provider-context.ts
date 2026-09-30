import { createMessageFormat } from '@kvirn-ui/core'
import type { Direction, Env, MessageFormatter, ThemeStore } from '@kvirn-ui/core'
import type { PartialMessages } from '@kvirn-ui/i18n'
import { createContext } from 'react'
import type { RegisteredLinkComponent } from './register.ts'

/** ISO 8601 weekday: 1 is Monday, 7 is Sunday (the same numbering as `Intl.Locale` week info). */
export type WeekStart = 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * The registered router link, or the native `<a>` used when no provider sets one. Generic,
 * because the registered type is `'a'` itself until an app augments `Register`.
 */
export type LinkComponentOrAnchor<LinkComponent> = LinkComponent | 'a'

/** Everything a provider resolves for its subtree. Memoised per provider. */
export interface KvirnConfig {
  locale: string
  dir: Direction
  timeZone: string | undefined
  weekStart: WeekStart
  /** Nearest provider first, root last. Built-in `en` is added by `useMessages`. */
  messageLayers: readonly PartialMessages[]
  format: MessageFormatter
  linkComponent: LinkComponentOrAnchor<RegisteredLinkComponent>
  /** Only an explicitly passed env. `useEnv` falls back to the page after mount. */
  env: Env | undefined
}

/** What components get without a provider: `en`, `ltr`, Monday, runtime zone, `<a>`. */
export const defaultKvirnConfig: KvirnConfig = {
  locale: 'en',
  dir: 'ltr',
  timeZone: undefined,
  weekStart: 1,
  messageLayers: [],
  format: createMessageFormat({ locale: 'en', timeZone: undefined }),
  linkComponent: 'a',
  env: undefined,
}

export const KvirnConfigContext = createContext<KvirnConfig>(defaultKvirnConfig)

/** The document's theme store, set by the outermost provider. `null` outside any provider. */
export const ThemeStoreContext = createContext<ThemeStore | null>(null)
