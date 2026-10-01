import { createMessageFormat } from '@kvirn-ui/core'
import type { Direction, Env, MessageFormatter, ThemeStore } from '@kvirn-ui/core'
import type { PartialMessages } from '@kvirn-ui/i18n'
import { createContext } from 'react'
import type { IconRegistry } from '../icon/icon-registry.ts'
import type { IconDefaults } from '../icon/use-icon.ts'
import type { RegisteredLinkComponent } from './register.ts'

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
  /** Nearest provider first, root last. Built-in `en` is added by `useMessages`. */
  messageLayers: readonly PartialMessages[]
  format: MessageFormatter
  linkComponent: LinkComponentOrAnchor<RegisteredLinkComponent>
  /** Every provider's icons, the nearest winning per name. Built-in icons are added by `useIcon`. */
  icons: IconRegistry
  /** Every provider's icon defaults, the nearest winning per field. */
  iconDefaults: IconDefaults
  /** Only an explicitly passed env. `useEnv` falls back to the page after mount. */
  env: Env | undefined
}

/** What components get without a provider: `en`, `ltr`, runtime zone, `<a>`, built-in icons. */
export const defaultKvirnConfig: KvirnConfig = {
  locale: 'en',
  dir: 'ltr',
  timeZone: undefined,
  messageLayers: [],
  format: createMessageFormat({ locale: 'en', timeZone: undefined }),
  linkComponent: 'a',
  icons: Object.freeze({}),
  iconDefaults: Object.freeze({}),
  env: undefined,
}

export const KvirnConfigContext = createContext<KvirnConfig>(defaultKvirnConfig)

/** The document's theme store, set by the outermost provider. `null` outside any provider. */
export const ThemeStoreContext = createContext<ThemeStore | null>(null)
