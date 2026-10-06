'use client'
import {
  createAnnouncer,
  createMessageFormat,
  findInvalidThemeOptions,
  getLanguage,
  getThemeStore,
  isSameThemeConfiguration,
  isWeekStart,
  resolveDirection,
} from '@kvirn-ui/core'
import type { Direction, Env, MaskCountry, ThemeOptions, WeekStart } from '@kvirn-ui/core'
import type { PartialMessages } from '@kvirn-ui/i18n'
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
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
import { ToastContext } from '../toast/toast-context.ts'
import { createToastController, getToastController } from '../toast/toast-controller.ts'
import { ToastRegion } from '../toast/toast-region.tsx'

export interface KvirnToastOptions {
  /**
   * The most toasts that show at once. Default 10. Past it the oldest toast that may time out is
   * removed for the new one, and if there is none (or the user is on a toast) the new toast is
   * ignored with a development warning: it is not queued. Read by the first provider on the page.
   */
  limit?: number | undefined
  /**
   * `false` (default): no toast times out. A number is how long, in milliseconds, an info or
   * success toast without an action stays. There is no minimum, so a short value can remove a toast
   * before it is read (WCAG 2.2.1): tie it to a user setting such as "keep messages longer", and never
   * time out what the user must act on. `0`, a negative number or `NaN` acts as `false` and warns in development.
   */
  autoDismiss?: false | number | undefined
}

export interface KvirnProviderProps {
  children?: ReactNode
  /** BCP 47 locale for `Intl.*`, `lang` and catalog lookup. Default `'en'`, or the parent's. */
  locale?: string | undefined
  /** Overrides the direction derived from `locale`. */
  dir?: Direction | undefined
  /**
   * The country for the masks that differ by country (`personal-identity-number`, `postal-code`,
   * `organisation-number`): `SE`, `FI` or `NO`. Default: the parent's, else the region of
   * `locale` (`sv-FI` is `FI`), else its language (`sv` is `SE`, `fi` is `FI`, `nb`, `nn`, `no` and
   * `se` are `NO`). Set it where the locale doesn't say, such as `se` (Northern Sami) in Finland.
   */
  country?: MaskCountry | undefined
  /**
   * A catalog (`sv` from `@kvirn-ui/i18n/sv`) or a partial override. Resolved over the
   * parent provider's messages, and finally over built-in `en`.
   */
  messages?: PartialMessages | undefined
  /** IANA time zone. Set it explicitly to avoid a server/client date mismatch. */
  timeZone?: string | undefined
  /**
   * The first day of the week in Calendar and DatePicker: `1` (Monday) to `7` (Sunday), the ISO
   * weekday. Default: the parent's, else the locale's when it names a region (`en-US` is Sunday),
   * else Monday: bare `en` is Monday. A `weekStart` on the Calendar wins.
   */
  weekStart?: WeekStart | undefined
  /** The router's link component. Register it for typed link props. */
  linkComponent?: RegisteredLinkComponent | undefined
  /**
   * Icons for `<Icon name>`, from `defineIcons`. Merged over the parent provider's
   * by name, and over the built-in set: a name registered here replaces a built-in icon.
   * Register the registry's type for checked names.
   */
  icons?: IconRegistry | undefined
  /** Defaults for every Icon below, such as `{ strokeWidth: 1.5 }`. Merged over the parent's. */
  iconDefaults?: IconDefaults | undefined
  /**
   * Theme defaults and storage. Read by the outermost provider only, once,
   * when the document's theme store is created.
   */
  theme?: ThemeOptions | undefined
  /**
   * Limit and timing of `useToast()`. Read by the outermost provider only, which renders the
   * toast region after its children while a toast shows.
   */
  toast?: KvirnToastOptions | undefined
  /** The window and document to use, for iframes, shadow roots and tests. */
  env?: Env | undefined
}

const getNoHost = () => undefined

/**
 * Optional. Gives every KvirnUI component its locale, strings, direction, date settings,
 * router link and icons, and owns the document's theme preference. The outermost provider also
 * renders the two visually hidden live regions behind `useAnnouncer()`, after its
 * children, and the toast region behind `useToast()` while a toast shows. It renders no other
 * element: spread `useLocale().localeProps` where the language changes.
 */
export function KvirnProvider({
  children,
  locale: localeProp,
  dir: dirProp,
  country: countryProp,
  messages,
  timeZone: timeZoneProp,
  weekStart: weekStartProp,
  linkComponent: linkComponentProp,
  icons: iconsProp,
  iconDefaults: iconDefaultsProp,
  theme,
  toast,
  env: envProp,
}: KvirnProviderProps) {
  const parentConfig = useContext(KvirnConfigContext)
  const parentThemeStore = useContext(ThemeStoreContext)
  const parentAnnouncer = useContext(AnnouncerContext)
  const parentToast = useContext(ToastContext)
  const inheritedEnv = useEnv()

  const locale = localeProp ?? parentConfig.locale
  const dir =
    dirProp ?? (localeProp === undefined ? parentConfig.dir : resolveDirection(localeProp))
  const country = countryProp ?? parentConfig.country
  const timeZone = timeZoneProp ?? parentConfig.timeZone
  const weekStart = isWeekStart(weekStartProp) ? weekStartProp : parentConfig.weekStart
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
      country,
      timeZone,
      weekStart,
      messageLayers,
      format,
      linkComponent,
      icons,
      iconDefaults,
      env: explicitEnv,
    }),
    [
      locale,
      dir,
      country,
      timeZone,
      weekStart,
      messageLayers,
      format,
      linkComponent,
      icons,
      iconDefaults,
      explicitEnv,
    ],
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
  if (weekStartProp !== undefined && !isWeekStart(weekStartProp)) {
    warnOnce(
      `invalid-week-start:${String(weekStartProp)}`,
      `<KvirnProvider weekStart="${String(weekStartProp)}"> is not a whole number from 1 (Monday) to 7 (Sunday), so it is ignored.`,
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

  if (parentToast !== null && toast !== undefined) {
    warnOnce(
      'nested-toast',
      'A nested <KvirnProvider> received `toast`, which is ignored: only the outermost provider of a tree takes part: configure `toast` there (and see `toast-multiple-providers` for several trees).',
    )
  }
  const toastLimit = toast?.limit
  const toastAutoDismiss = toast?.autoDismiss
  // One controller per document, shared by every provider on the page (`getToastController`). The
  // first outermost provider to mount is the host: it owns the options and renders the region, and
  // the next one takes over if it unmounts. Registered in a layout effect, which runs before the
  // passive effects where an app normally shows its first toast.
  const toastController = useMemo(
    () =>
      parentToast ??
      (env === undefined ? createToastController(undefined) : getToastController(env)),
    [parentToast, env],
  )
  // Not `useId`: two React roots that hydrate without an `identifierPrefix` get the same ids.
  const [toastProviderId] = useState(() => Symbol('kvirn-toast-provider'))
  const isToastOutermost = parentToast === null
  const hostId = useSyncExternalStore(
    toastController.subscribeHost,
    toastController.getHostId,
    getNoHost,
  )
  const initialToast = useRef({
    options: { limit: toastLimit, autoDismiss: toastAutoDismiss },
    isConfigured: toast !== undefined,
  })
  useLayoutEffect(
    () =>
      isToastOutermost
        ? toastController.register(
            toastProviderId,
            initialToast.current.options,
            initialToast.current.isConfigured,
          )
        : undefined,
    // The options are applied by the effect below, so a change never unregisters the provider.
    [isToastOutermost, toastController, toastProviderId],
  )
  useLayoutEffect(() => {
    if (isToastOutermost) {
      toastController.updateOptions(toastProviderId, {
        limit: toastLimit,
        autoDismiss: toastAutoDismiss,
      })
    }
  }, [isToastOutermost, toastController, toastProviderId, toastLimit, toastAutoDismiss])

  return (
    <KvirnConfigContext.Provider value={config}>
      <ThemeStoreContext.Provider value={themeStore}>
        <AnnouncerContext.Provider value={announcer}>
          <ToastContext.Provider value={toastController}>
            {children}
            {isToastOutermost && hostId === toastProviderId ? (
              <ToastRegion controller={toastController} />
            ) : null}
          </ToastContext.Provider>
          {parentAnnouncer === null ? <Announcer announcer={announcer} /> : null}
        </AnnouncerContext.Provider>
      </ThemeStoreContext.Provider>
    </KvirnConfigContext.Provider>
  )
}
KvirnProvider.displayName = 'KvirnProvider'
