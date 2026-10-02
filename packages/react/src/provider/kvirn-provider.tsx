'use client'
import {
  createAnnouncer,
  createMessageFormat,
  findInvalidThemeOptions,
  getLanguage,
  getThemeStore,
  isSameThemeConfiguration,
  resolveDirection,
} from '@kvirn-ui/core'
import type { Direction, Env, ThemeOptions } from '@kvirn-ui/core'
import type { PartialMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Announcer } from '../announcer/announcer.tsx'
import { AnnouncerContext } from '../announcer/announcer-context.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import type { IconRegistry } from '../icon/icon-registry.ts'
import type { IconDefaults } from '../icon/use-icon.ts'
import { KvirnConfigContext, ThemeStoreContext } from './provider-context.ts'
import type { KvirnConfig } from './provider-context.ts'
import type { RegisteredLinkComponent } from './register.ts'
import { useEnv } from './use-env.ts'

export interface KvirnProviderProps {
  children?: ReactNode
  /** BCP 47 locale for `Intl.*`, `lang` and catalog lookup. Default `'en'`, or the parent's. */
  locale?: string | undefined
  /** Overrides the direction derived from `locale`. */
  dir?: Direction | undefined
  /**
   * A catalog (`sv` from `@kvirn-ui/i18n/sv`) or a partial override. Resolved over the
   * parent provider's messages, and finally over built-in `en` (ADR-0007).
   */
  messages?: PartialMessages | undefined
  /** IANA time zone. Set it explicitly to avoid a server/client date mismatch. */
  timeZone?: string | undefined
  /** The router's link component (ADR-0005). Register it for typed link props. */
  linkComponent?: RegisteredLinkComponent | undefined
  /**
   * Icons for `<Icon name>`, from `defineIcons` (ADR-0024). Merged over the parent provider's
   * by name, and over the built-in set: a name registered here replaces a built-in icon.
   * Register the registry's type for checked names.
   */
  icons?: IconRegistry | undefined
  /** Defaults for every Icon below, such as `{ strokeWidth: 1.5 }`. Merged over the parent's. */
  iconDefaults?: IconDefaults | undefined
  /**
   * Theme defaults and storage (ADR-0006). Read by the outermost provider only, once,
   * when the document's theme store is created.
   */
  theme?: ThemeOptions | undefined
  /** The window and document to use, for iframes, shadow roots and tests. */
  env?: Env | undefined
}

/**
 * Optional. Gives every KvirnUI component its locale, strings, direction, date settings,
 * router link and icons, and owns the document's theme preference. The outermost provider also
 * renders the two visually hidden live regions behind `useAnnouncer()` (ADR-0040), after its
 * children. It renders no other element: spread `useLocale().localeProps` where the language
 * changes.
 */
export function KvirnProvider({
  children,
  locale: localeProp,
  dir: dirProp,
  messages,
  timeZone: timeZoneProp,
  linkComponent: linkComponentProp,
  icons: iconsProp,
  iconDefaults: iconDefaultsProp,
  theme,
  env: envProp,
}: KvirnProviderProps) {
  const parentConfig = useContext(KvirnConfigContext)
  const parentThemeStore = useContext(ThemeStoreContext)
  const parentAnnouncer = useContext(AnnouncerContext)
  const inheritedEnv = useEnv()

  const locale = localeProp ?? parentConfig.locale
  const dir =
    dirProp ?? (localeProp === undefined ? parentConfig.dir : resolveDirection(localeProp))
  const timeZone = timeZoneProp ?? parentConfig.timeZone
  const linkComponent = linkComponentProp ?? parentConfig.linkComponent
  const explicitEnv = envProp ?? parentConfig.env
  const parentLayers = parentConfig.messageLayers
  const parentIcons = parentConfig.icons
  const parentIconDefaults = parentConfig.iconDefaults

  const format = useMemo(() => createMessageFormat({ locale, timeZone }), [locale, timeZone])
  const messageLayers = useMemo(
    () => (messages === undefined ? parentLayers : [messages, ...parentLayers]),
    [messages, parentLayers],
  )
  const icons = useMemo(
    () => (iconsProp === undefined ? parentIcons : Object.freeze({ ...parentIcons, ...iconsProp })),
    [iconsProp, parentIcons],
  )
  const iconDefaultsSize = iconDefaultsProp?.size
  const iconDefaultsStrokeWidth = iconDefaultsProp?.strokeWidth
  const iconDefaults = useMemo<IconDefaults>(
    () =>
      iconDefaultsSize === undefined && iconDefaultsStrokeWidth === undefined
        ? parentIconDefaults
        : Object.freeze({
            size: iconDefaultsSize ?? parentIconDefaults.size,
            strokeWidth: iconDefaultsStrokeWidth ?? parentIconDefaults.strokeWidth,
          }),
    [iconDefaultsSize, iconDefaultsStrokeWidth, parentIconDefaults],
  )
  const config = useMemo<KvirnConfig>(
    () => ({
      locale,
      dir,
      timeZone,
      messageLayers,
      format,
      linkComponent,
      icons,
      iconDefaults,
      env: explicitEnv,
    }),
    [locale, dir, timeZone, messageLayers, format, linkComponent, icons, iconDefaults, explicitEnv],
  )

  const isOutermost = parentThemeStore === null
  if (
    !isOutermost &&
    localeProp !== undefined &&
    messages === undefined &&
    getLanguage(localeProp) !== getLanguage(parentConfig.locale)
  ) {
    warnOnce(
      `nested-locale-without-messages:${parentConfig.locale}:${localeProp}`,
      `A nested <KvirnProvider locale="${localeProp}"> has no \`messages\`, so its strings stay in the parent's language (${parentConfig.locale}) while its \`lang\` says ${localeProp}. Pass the catalog for ${localeProp} as \`messages\`.`,
    )
  }
  if (!isOutermost && theme !== undefined) {
    warnOnce(
      'nested-theme',
      'A nested <KvirnProvider> received `theme`, which is ignored: there is one theme store per document, configured by the outermost provider.',
    )
  }

  const env = envProp ?? inheritedEnv
  const defaultColorScheme = theme?.defaultColorScheme
  const defaultContrast = theme?.defaultContrast
  const storage = theme?.storage
  const themeStore = useMemo(
    () => parentThemeStore ?? getThemeStore(env, { defaultColorScheme, defaultContrast, storage }),
    [parentThemeStore, env, defaultColorScheme, defaultContrast, storage],
  )

  if (isOutermost && theme !== undefined) {
    const invalidOptions = findInvalidThemeOptions(theme)
    if (invalidOptions.length > 0) {
      warnOnce(
        `invalid-theme-options:${invalidOptions.join(',')}`,
        `<KvirnProvider theme> has invalid ${invalidOptions.join(', ')}. Using the defaults ('system', storage 'local') instead.`,
      )
    } else if (!isSameThemeConfiguration(themeStore.options, theme)) {
      warnOnce(
        'theme-store-already-configured',
        "This document's theme store was already created with other options (by another outermost <KvirnProvider>, or by useTheme() outside any provider), so this `theme` is ignored. Configure the theme once, on the first provider.",
      )
    }
  }

  useEffect(() => (isOutermost ? themeStore.connect() : undefined), [isOutermost, themeStore])

  // One announcer and one pair of live regions per document: nested providers use the outermost's.
  // Creating it only builds state, so it is safe in render; timers start on the first announce.
  const announcer = useMemo(() => parentAnnouncer ?? createAnnouncer(env), [parentAnnouncer, env])
  useEffect(
    () => (parentAnnouncer === null ? () => announcer.actions.clear() : undefined),
    [parentAnnouncer, announcer],
  )

  return (
    <KvirnConfigContext.Provider value={config}>
      <ThemeStoreContext.Provider value={themeStore}>
        <AnnouncerContext.Provider value={announcer}>
          {children}
          {parentAnnouncer === null ? <Announcer announcer={announcer} /> : null}
        </AnnouncerContext.Provider>
      </ThemeStoreContext.Provider>
    </KvirnConfigContext.Provider>
  )
}
