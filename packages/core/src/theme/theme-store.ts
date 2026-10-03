import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import {
  colorSchemeAttribute,
  colorSchemePreferences,
  colorSchemeQuery,
  contrastAttribute,
  contrastPreferences,
  contrastQuery,
  forcedColorsQuery,
  themeStorageKey,
} from './theme-constants.ts'

export type ColorSchemePreference = (typeof colorSchemePreferences)[number]
export type ContrastPreference = (typeof contrastPreferences)[number]
export type ResolvedColorScheme = Exclude<ColorSchemePreference, 'system'>
export type ResolvedContrast = Exclude<ContrastPreference, 'system'>

/** What the user (or the app's defaults) chose. `system` follows the OS. */
export interface ThemePreference {
  colorScheme: ColorSchemePreference
  contrast: ContrastPreference
}

/** What the OS reports through media queries. */
export interface SystemTheme {
  colorScheme: ResolvedColorScheme
  contrast: ResolvedContrast
  /** `forced-colors: active`. The OS palette wins; `@kvirn-ui/theme` never overrides it. */
  isForcedColors: boolean
}

/** The preference with `system` replaced by the OS value. Written to `<html>`. */
export interface ResolvedTheme {
  colorScheme: ResolvedColorScheme
  contrast: ResolvedContrast
}

export interface ThemeState {
  preference: ThemePreference
  system: SystemTheme
  resolved: ResolvedTheme
}

export interface ThemeActions {
  selectColorScheme: (colorScheme: ColorSchemePreference) => void
  selectContrast: (contrast: ContrastPreference) => void
}

/** Not exported: syncing with the OS and other tabs is not a user action. */
interface InternalThemeActions extends ThemeActions {
  syncSystem: (system: SystemTheme) => void
  syncPreference: (preference: ThemePreference) => void
}

export interface ThemeStore extends ComponentStore<ThemeState, ThemeActions> {
  /**
   * Starts following the OS and other tabs, and applies the resolved values to `<html>`.
   * Ref-counted: returns a cleanup, and listeners stay until the last cleanup runs.
   */
  connect: () => () => void
  /** The validated options this store was created with. */
  options: ResolvedThemeOptions
}

/** The axes that differ from the configured defaults. JSON in `localStorage`. */
export interface StoredThemePreference {
  colorScheme?: ColorSchemePreference
  contrast?: ContrastPreference
}

export interface ThemeStorageAdapter {
  read: () => StoredThemePreference | undefined
  /** `undefined` means "nothing to store": remove the entry. */
  write: (preference: StoredThemePreference | undefined) => void
}

/** `'local'`: `localStorage`. `'none'`: memory only. Or an adapter, for example a cookie. */
export type ThemeStorage = 'local' | 'none' | ThemeStorageAdapter

export interface ThemeOptions {
  /** Preference used until the user chooses. Default `'system'`. */
  defaultColorScheme?: ColorSchemePreference | undefined
  /** Preference used until the user chooses. Default `'system'`. */
  defaultContrast?: ContrastPreference | undefined
  /** Default `'local'`. Written only when the user selects a value. */
  storage?: ThemeStorage | undefined
}

/** `ThemeOptions` after validation: every value is known to be allowed. */
export interface ResolvedThemeOptions {
  defaultColorScheme: ColorSchemePreference
  defaultContrast: ContrastPreference
  storage: ThemeStorage
}

interface MediaQueryListLike {
  readonly matches: boolean
  addEventListener: (type: 'change', listener: () => void) => void
  removeEventListener: (type: 'change', listener: () => void) => void
}

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

interface StorageEventLike {
  readonly key: string | null
}

/**
 * The part of `Env` the theme store uses. Every `Env` satisfies it; the narrow shape
 * keeps the store testable in Node without a DOM.
 */
export interface ThemeEnv {
  readonly window: {
    matchMedia: (query: string) => MediaQueryListLike
    /** May throw (disabled storage, sandboxed frames), so every access is guarded. */
    readonly localStorage: StorageLike
    addEventListener: (type: 'storage', listener: (event: StorageEventLike) => void) => void
    removeEventListener: (type: 'storage', listener: (event: StorageEventLike) => void) => void
  }
  readonly document: {
    readonly documentElement: { setAttribute: (name: string, value: string) => void }
  }
}

const serverSystemTheme: SystemTheme = {
  colorScheme: 'light',
  contrast: 'standard',
  isForcedColors: false,
}

export function resolveTheme(preference: ThemePreference, system: SystemTheme): ResolvedTheme {
  return {
    colorScheme: preference.colorScheme === 'system' ? system.colorScheme : preference.colorScheme,
    contrast: preference.contrast === 'system' ? system.contrast : preference.contrast,
  }
}

function isOneOf<Value extends string>(allowed: readonly Value[], value: unknown): value is Value {
  return allowed.some((allowedValue) => allowedValue === value)
}

/** Keeps only valid values from untrusted stored data. */
function isThemeStorage(value: unknown): value is ThemeStorage {
  if (value === 'local' || value === 'none') {
    return true
  }
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const adapter = value as Partial<Record<keyof ThemeStorageAdapter, unknown>>
  return typeof adapter.read === 'function' && typeof adapter.write === 'function'
}

/**
 * Lists the options whose values are outside their allowed set. Options can come from untyped
 * config or cookies, and they end up in `<html>` attributes and the no-flash script.
 */
export function findInvalidThemeOptions(options: ThemeOptions): (keyof ThemeOptions)[] {
  const invalidOptions: (keyof ThemeOptions)[] = []
  if (
    options.defaultColorScheme !== undefined &&
    !isOneOf(colorSchemePreferences, options.defaultColorScheme)
  ) {
    invalidOptions.push('defaultColorScheme')
  }
  if (
    options.defaultContrast !== undefined &&
    !isOneOf(contrastPreferences, options.defaultContrast)
  ) {
    invalidOptions.push('defaultContrast')
  }
  if (options.storage !== undefined && !isThemeStorage(options.storage)) {
    invalidOptions.push('storage')
  }
  return invalidOptions
}

/** Fills in defaults, and replaces any invalid value with its default (`system`, `local`). */
export function resolveThemeOptions(options: ThemeOptions): ResolvedThemeOptions {
  return {
    defaultColorScheme: isOneOf(colorSchemePreferences, options.defaultColorScheme)
      ? options.defaultColorScheme
      : 'system',
    defaultContrast: isOneOf(contrastPreferences, options.defaultContrast)
      ? options.defaultContrast
      : 'system',
    storage: isThemeStorage(options.storage) ? options.storage : 'local',
  }
}

const storageKind = (storage: ThemeStorage) => (typeof storage === 'string' ? storage : 'adapter')

/**
 * Whether `requested` would configure the store the same way as `configured`. Adapters only
 * compare by kind, because inline adapters are new objects on every render.
 */
export function isSameThemeConfiguration(
  configured: ResolvedThemeOptions,
  requested: ThemeOptions,
): boolean {
  const resolvedRequest = resolveThemeOptions(requested)
  return (
    configured.defaultColorScheme === resolvedRequest.defaultColorScheme &&
    configured.defaultContrast === resolvedRequest.defaultContrast &&
    storageKind(configured.storage) === storageKind(resolvedRequest.storage)
  )
}

export function parseStoredThemePreference(value: unknown): StoredThemePreference | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }
  const colorScheme: unknown = Reflect.get(value, 'colorScheme')
  const contrast: unknown = Reflect.get(value, 'contrast')
  return {
    ...(isOneOf(colorSchemePreferences, colorScheme) ? { colorScheme } : {}),
    ...(isOneOf(contrastPreferences, contrast) ? { contrast } : {}),
  }
}

function createLocalStorageAdapter(env: ThemeEnv): ThemeStorageAdapter {
  return {
    read: () => {
      const serialized = env.window.localStorage.getItem(themeStorageKey)
      return serialized === null ? undefined : parseStoredThemePreference(JSON.parse(serialized))
    },
    write: (preference) => {
      if (preference === undefined) {
        env.window.localStorage.removeItem(themeStorageKey)
      } else {
        env.window.localStorage.setItem(themeStorageKey, JSON.stringify(preference))
      }
    },
  }
}

/** Storage can be disabled, full or blocked; a theme preference is never worth an error. */
function createGuardedStorage(adapter: ThemeStorageAdapter | undefined): ThemeStorageAdapter {
  return {
    read: () => {
      try {
        // Validated for every adapter: a cookie can be edited by anyone.
        return parseStoredThemePreference(adapter?.read())
      } catch {
        return undefined
      }
    },
    write: (preference) => {
      try {
        adapter?.write(preference)
      } catch {
        // Keep the in-memory choice; it applies for this visit.
      }
    },
  }
}

function resolveStorageAdapter(
  env: ThemeEnv | undefined,
  storage: ThemeStorage,
): ThemeStorageAdapter | undefined {
  if (env === undefined || storage === 'none') {
    return undefined
  }
  return storage === 'local' ? createLocalStorageAdapter(env) : storage
}

function readSystemTheme(env: ThemeEnv | undefined): SystemTheme {
  if (env === undefined) {
    return serverSystemTheme
  }
  const isMatching = (query: string) => {
    try {
      return env.window.matchMedia(query).matches
    } catch {
      return false
    }
  }
  return {
    colorScheme: isMatching(colorSchemeQuery) ? 'dark' : 'light',
    contrast: isMatching(contrastQuery) ? 'more' : 'standard',
    isForcedColors: isMatching(forcedColorsQuery),
  }
}

function isSameSystemTheme(first: SystemTheme, second: SystemTheme): boolean {
  return (
    first.colorScheme === second.colorScheme &&
    first.contrast === second.contrast &&
    first.isForcedColors === second.isForcedColors
  )
}

/**
 * Creates a theme store for one document. Prefer `getThemeStore`, which shares one store
 * per document. Without an `env` (server rendering) the store uses the defaults and
 * never persists.
 */
export function createThemeStore(
  env: ThemeEnv | undefined,
  options: ThemeOptions = {},
): ThemeStore {
  const resolvedOptions = resolveThemeOptions(options)
  const defaults: ThemePreference = {
    colorScheme: resolvedOptions.defaultColorScheme,
    contrast: resolvedOptions.defaultContrast,
  }
  const storage = createGuardedStorage(resolveStorageAdapter(env, resolvedOptions.storage))

  const readPreference = (): ThemePreference => ({ ...defaults, ...storage.read() })

  // Only the axes that differ from the defaults are stored, so an unchanged default is
  // never written, and with `system` defaults only non-system values are.
  const toStoredPreference = (preference: ThemePreference): StoredThemePreference | undefined => {
    const stored: StoredThemePreference = {
      ...(preference.colorScheme === defaults.colorScheme
        ? {}
        : { colorScheme: preference.colorScheme }),
      ...(preference.contrast === defaults.contrast ? {} : { contrast: preference.contrast }),
    }
    return Object.keys(stored).length === 0 ? undefined : stored
  }

  const createState = (preference: ThemePreference, system: SystemTheme): ThemeState => ({
    preference,
    system,
    resolved: resolveTheme(preference, system),
  })

  const store = createComponentStore<ThemeState, InternalThemeActions>(
    createState(readPreference(), readSystemTheme(env)),
    ({ getState, update }) => {
      const selectPreference = (preference: ThemePreference) => {
        update((state) => createState(preference, state.system))
        storage.write(toStoredPreference(getState().preference))
      }
      return {
        selectColorScheme: (colorScheme) => {
          selectPreference({ ...getState().preference, colorScheme })
        },
        selectContrast: (contrast) => {
          selectPreference({ ...getState().preference, contrast })
        },
        syncSystem: (system) => {
          if (!isSameSystemTheme(system, getState().system)) {
            update((state) => createState(state.preference, system))
          }
        },
        syncPreference: (preference) => {
          update((state) => createState(preference, state.system))
        },
      }
    },
  )

  const refreshSystem = () => {
    store.actions.syncSystem(readSystemTheme(env))
  }

  const applyAttributes = () => {
    if (env === undefined) {
      return
    }
    const { resolved } = store.getState()
    env.document.documentElement.setAttribute(colorSchemeAttribute, resolved.colorScheme)
    env.document.documentElement.setAttribute(contrastAttribute, resolved.contrast)
  }

  const startListening = (activeEnv: ThemeEnv): (() => void) => {
    refreshSystem()
    applyAttributes()
    const unsubscribeFromStore = store.subscribe(applyAttributes)

    const mediaQueryLists = [colorSchemeQuery, contrastQuery, forcedColorsQuery].flatMap(
      (query) => {
        try {
          return [activeEnv.window.matchMedia(query)]
        } catch {
          return []
        }
      },
    )
    for (const mediaQueryList of mediaQueryLists) {
      mediaQueryList.addEventListener('change', refreshSystem)
    }

    const handleStorage = (event: StorageEventLike) => {
      if (event.key === themeStorageKey || event.key === null) {
        store.actions.syncPreference(readPreference())
      }
    }
    const isSyncingTabs = resolvedOptions.storage === 'local'
    if (isSyncingTabs) {
      activeEnv.window.addEventListener('storage', handleStorage)
    }

    return () => {
      unsubscribeFromStore()
      for (const mediaQueryList of mediaQueryLists) {
        mediaQueryList.removeEventListener('change', refreshSystem)
      }
      if (isSyncingTabs) {
        activeEnv.window.removeEventListener('storage', handleStorage)
      }
    }
  }

  let connectionCount = 0
  let stopListening: (() => void) | undefined

  const connect = () => {
    if (env === undefined) {
      return () => {}
    }
    connectionCount += 1
    if (connectionCount === 1) {
      stopListening = startListening(env)
    }
    let isConnected = true
    return () => {
      if (!isConnected) {
        return
      }
      isConnected = false
      connectionCount -= 1
      if (connectionCount === 0) {
        stopListening?.()
        stopListening = undefined
      }
    }
  }

  const { selectColorScheme, selectContrast } = store.actions
  return {
    getState: store.getState,
    subscribe: store.subscribe,
    actions: { selectColorScheme, selectContrast },
    connect,
    options: resolvedOptions,
  }
}

const themeStores = new WeakMap<object, ThemeStore>()

/**
 * One theme store per document: the first caller's options configure it, and
 * later callers share it. Without an `env` it returns a new detached store (server rendering).
 */
export function getThemeStore(env: ThemeEnv | undefined, options: ThemeOptions = {}): ThemeStore {
  if (env === undefined) {
    return createThemeStore(undefined, options)
  }
  const existingStore = themeStores.get(env.document)
  if (existingStore !== undefined) {
    return existingStore
  }
  const themeStore = createThemeStore(env, options)
  themeStores.set(env.document, themeStore)
  return themeStore
}
