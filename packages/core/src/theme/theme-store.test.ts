import { describe, expect, it, vi } from 'vite-plus/test'
import {
  colorSchemeAttribute,
  colorSchemeQuery,
  contrastAttribute,
  contrastQuery,
  forcedColorsQuery,
  themeStorageKey,
} from './theme-constants.ts'
import {
  createThemeStore,
  findInvalidThemeOptions,
  getThemeStore,
  isSameThemeConfiguration,
  resolveTheme,
} from './theme-store.ts'
import type {
  ColorSchemePreference,
  ContrastPreference,
  StoredThemePreference,
  ThemeEnv,
  ThemeOptions,
  ThemeStorageAdapter,
} from './theme-store.ts'

interface FakeEnvOptions {
  isDark?: boolean
  isMoreContrast?: boolean
  isForcedColors?: boolean
  storedValue?: string
  storageThrows?: boolean
}

/** A structural stand-in for the part of `Env` the theme store uses. No DOM in Node. */
function createFakeEnv(options: FakeEnvOptions = {}) {
  const matches = new Map<string, boolean>([
    [colorSchemeQuery, options.isDark ?? false],
    [contrastQuery, options.isMoreContrast ?? false],
    [forcedColorsQuery, options.isForcedColors ?? false],
  ])
  const mediaListeners = new Map<string, Set<() => void>>()
  const storageListeners = new Set<(event: { key: string | null }) => void>()
  const storageItems = new Map<string, string>()
  if (options.storedValue !== undefined) {
    storageItems.set(themeStorageKey, options.storedValue)
  }
  const attributes = new Map<string, string>()
  const storageAccess = { reads: 0, writes: 0 }

  const fakeStorage = {
    getItem: (key: string) => {
      storageAccess.reads += 1
      if (options.storageThrows === true) {
        throw new Error('SecurityError')
      }
      return storageItems.get(key) ?? null
    },
    setItem: (key: string, value: string) => {
      storageAccess.writes += 1
      if (options.storageThrows === true) {
        throw new Error('QuotaExceededError')
      }
      storageItems.set(key, value)
    },
    removeItem: (key: string) => {
      storageAccess.writes += 1
      if (options.storageThrows === true) {
        throw new Error('SecurityError')
      }
      storageItems.delete(key)
    },
  }

  const env: ThemeEnv = {
    window: {
      matchMedia: (query: string) => ({
        get matches() {
          return matches.get(query) ?? false
        },
        addEventListener: (_type: 'change', listener: () => void) => {
          const listeners = mediaListeners.get(query) ?? new Set()
          listeners.add(listener)
          mediaListeners.set(query, listeners)
        },
        removeEventListener: (_type: 'change', listener: () => void) => {
          mediaListeners.get(query)?.delete(listener)
        },
      }),
      get localStorage() {
        return fakeStorage
      },
      addEventListener: (_type: 'storage', listener: (event: { key: string | null }) => void) => {
        storageListeners.add(listener)
      },
      removeEventListener: (
        _type: 'storage',
        listener: (event: { key: string | null }) => void,
      ) => {
        storageListeners.delete(listener)
      },
    },
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes.set(name, value)
        },
      },
    },
  }

  return {
    env,
    attributes,
    storageItems,
    storageAccess,
    changeSystem(query: string, isMatching: boolean) {
      matches.set(query, isMatching)
      for (const listener of mediaListeners.get(query) ?? []) {
        listener()
      }
    },
    dispatchStorageEvent(key: string | null) {
      for (const listener of storageListeners) {
        listener({ key })
      }
    },
    listenerCount() {
      let count = storageListeners.size
      for (const listeners of mediaListeners.values()) {
        count += listeners.size
      }
      return count
    },
  }
}

const colorSchemes: ColorSchemePreference[] = ['light', 'dark', 'system']
const contrasts: ContrastPreference[] = ['standard', 'more', 'system']

describe('resolveTheme', () => {
  it('uses the preference when set, and the system value for `system`', () => {
    for (const colorScheme of colorSchemes) {
      for (const contrast of contrasts) {
        for (const isDark of [false, true]) {
          for (const isMoreContrast of [false, true]) {
            const system = {
              colorScheme: isDark ? ('dark' as const) : ('light' as const),
              contrast: isMoreContrast ? ('more' as const) : ('standard' as const),
              isForcedColors: false,
            }
            expect(resolveTheme({ colorScheme, contrast }, system)).toEqual({
              colorScheme: colorScheme === 'system' ? system.colorScheme : colorScheme,
              contrast: contrast === 'system' ? system.contrast : contrast,
            })
          }
        }
      }
    }
  })
})

describe('createThemeStore: initial state', () => {
  it('follows the OS by default', () => {
    const fake = createFakeEnv({ isDark: true, isMoreContrast: true })
    const themeStore = createThemeStore(fake.env)
    expect(themeStore.getState()).toEqual({
      preference: { colorScheme: 'system', contrast: 'system' },
      system: { colorScheme: 'dark', contrast: 'more', isForcedColors: false },
      resolved: { colorScheme: 'dark', contrast: 'more' },
    })
  })

  it('uses the configured defaults when nothing is stored', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env, {
      defaultColorScheme: 'dark',
      defaultContrast: 'more',
    })
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'dark', contrast: 'more' })
    expect(themeStore.getState().resolved).toEqual({ colorScheme: 'dark', contrast: 'more' })
  })

  it('reads a stored preference over the defaults', () => {
    const fake = createFakeEnv({ storedValue: JSON.stringify({ colorScheme: 'dark' }) })
    const themeStore = createThemeStore(fake.env, { defaultContrast: 'more' })
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'dark', contrast: 'more' })
  })

  it.each(['not json', '"dark"', 'null', JSON.stringify({ colorScheme: 'blue', contrast: 5 })])(
    'ignores an invalid stored value (%s)',
    (storedValue) => {
      const themeStore = createThemeStore(createFakeEnv({ storedValue }).env)
      expect(themeStore.getState().preference).toEqual({
        colorScheme: 'system',
        contrast: 'system',
      })
    },
  )

  it('survives storage that throws (disabled storage, private mode)', () => {
    const fake = createFakeEnv({ storageThrows: true })
    const themeStore = createThemeStore(fake.env)
    expect(themeStore.getState().preference.colorScheme).toBe('system')
    expect(() => themeStore.actions.selectColorScheme('dark')).not.toThrow()
    expect(themeStore.getState().preference.colorScheme).toBe('dark')
  })

  it('reports forced colors without changing the resolved values', () => {
    const fake = createFakeEnv({ isForcedColors: true, isDark: true })
    const themeStore = createThemeStore(fake.env, { defaultContrast: 'standard' })
    expect(themeStore.getState().system.isForcedColors).toBe(true)
    expect(themeStore.getState().resolved).toEqual({ colorScheme: 'dark', contrast: 'standard' })
  })

  it('without an env (server rendering) uses the defaults and never persists', () => {
    const themeStore = createThemeStore(undefined, { defaultColorScheme: 'dark' })
    expect(themeStore.getState()).toEqual({
      preference: { colorScheme: 'dark', contrast: 'system' },
      system: { colorScheme: 'light', contrast: 'standard', isForcedColors: false },
      resolved: { colorScheme: 'dark', contrast: 'standard' },
    })
    themeStore.actions.selectContrast('more')
    expect(themeStore.getState().resolved.contrast).toBe('more')
    expect(themeStore.connect()).toBeTypeOf('function')
  })
})

describe('createThemeStore: selecting', () => {
  it('updates the preference and the resolved values', () => {
    const themeStore = createThemeStore(createFakeEnv().env)
    themeStore.actions.selectColorScheme('dark')
    themeStore.actions.selectContrast('more')
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'dark', contrast: 'more' })
    expect(themeStore.getState().resolved).toEqual({ colorScheme: 'dark', contrast: 'more' })
  })

  it('writes only non-system values to storage', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    themeStore.actions.selectColorScheme('dark')
    expect(fake.storageItems.get(themeStorageKey)).toBe(JSON.stringify({ colorScheme: 'dark' }))
    themeStore.actions.selectContrast('more')
    expect(JSON.parse(fake.storageItems.get(themeStorageKey) ?? '')).toEqual({
      colorScheme: 'dark',
      contrast: 'more',
    })
    themeStore.actions.selectColorScheme('system')
    expect(fake.storageItems.get(themeStorageKey)).toBe(JSON.stringify({ contrast: 'more' }))
  })

  it('removes the key when both axes are `system`', () => {
    const fake = createFakeEnv({ storedValue: JSON.stringify({ colorScheme: 'dark' }) })
    const themeStore = createThemeStore(fake.env)
    themeStore.actions.selectColorScheme('system')
    expect(fake.storageItems.has(themeStorageKey)).toBe(false)
  })

  it('writes storage only on an explicit selection, never on creation or OS changes', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    const disconnect = themeStore.connect()
    fake.changeSystem(colorSchemeQuery, true)
    expect(fake.storageAccess.writes).toBe(0)
    disconnect()
  })

  it('keeps an explicit `system` choice when the configured default is not `system`', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env, { defaultColorScheme: 'dark' })
    themeStore.actions.selectColorScheme('system')
    expect(fake.storageItems.get(themeStorageKey)).toBe(JSON.stringify({ colorScheme: 'system' }))
    expect(
      createThemeStore(fake.env, { defaultColorScheme: 'dark' }).getState().preference,
    ).toEqual({ colorScheme: 'system', contrast: 'system' })
    themeStore.actions.selectColorScheme('dark')
    expect(fake.storageItems.has(themeStorageKey)).toBe(false)
  })

  it("never touches localStorage with storage: 'none'", () => {
    const fake = createFakeEnv({ storedValue: JSON.stringify({ colorScheme: 'dark' }) })
    const themeStore = createThemeStore(fake.env, { storage: 'none' })
    themeStore.actions.selectContrast('more')
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'system', contrast: 'more' })
    expect(fake.storageAccess).toEqual({ reads: 0, writes: 0 })
  })

  it('reads and writes through a custom adapter (for example a cookie)', () => {
    let cookieValue: StoredThemePreference | undefined = { contrast: 'more' }
    const cookieStorage: ThemeStorageAdapter = {
      read: () => cookieValue,
      write: vi.fn<ThemeStorageAdapter['write']>((preference) => {
        cookieValue = preference
      }),
    }
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env, { storage: cookieStorage })
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'system', contrast: 'more' })

    themeStore.actions.selectColorScheme('light')
    expect(cookieStorage.write).toHaveBeenLastCalledWith({ colorScheme: 'light', contrast: 'more' })
    themeStore.actions.selectColorScheme('system')
    themeStore.actions.selectContrast('system')
    expect(cookieStorage.write).toHaveBeenLastCalledWith(undefined)
    expect(fake.storageAccess).toEqual({ reads: 0, writes: 0 })
  })

  it('ignores invalid values from a custom adapter (for example a tampered cookie)', () => {
    const tamperedStorage = {
      read: () => JSON.parse('{"colorScheme":"purple","contrast":"more"}') as StoredThemePreference,
      write: () => {},
    }
    const themeStore = createThemeStore(createFakeEnv().env, { storage: tamperedStorage })
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'system', contrast: 'more' })
  })

  it('survives a custom adapter that throws', () => {
    const themeStore = createThemeStore(createFakeEnv().env, {
      storage: {
        read: () => {
          throw new Error('cookie parse error')
        },
        write: () => {
          throw new Error('cookie write error')
        },
      },
    })
    expect(themeStore.getState().preference.colorScheme).toBe('system')
    expect(() => themeStore.actions.selectColorScheme('dark')).not.toThrow()
  })
})

describe('createThemeStore: connect', () => {
  it('applies the resolved values to <html> and keeps them current', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    const disconnect = themeStore.connect()
    expect(fake.attributes.get(colorSchemeAttribute)).toBe('light')
    expect(fake.attributes.get(contrastAttribute)).toBe('standard')

    themeStore.actions.selectColorScheme('dark')
    expect(fake.attributes.get(colorSchemeAttribute)).toBe('dark')
    disconnect()
  })

  it('follows OS changes while the preference is `system`', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    const disconnect = themeStore.connect()

    fake.changeSystem(colorSchemeQuery, true)
    fake.changeSystem(contrastQuery, true)
    fake.changeSystem(forcedColorsQuery, true)
    expect(themeStore.getState().system).toEqual({
      colorScheme: 'dark',
      contrast: 'more',
      isForcedColors: true,
    })
    expect(fake.attributes.get(colorSchemeAttribute)).toBe('dark')
    expect(fake.attributes.get(contrastAttribute)).toBe('more')

    themeStore.actions.selectColorScheme('light')
    fake.changeSystem(colorSchemeQuery, false)
    fake.changeSystem(colorSchemeQuery, true)
    expect(themeStore.getState().resolved.colorScheme).toBe('light')
    disconnect()
  })

  it('re-reads the system values on connect', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    fake.changeSystem(colorSchemeQuery, true)
    const disconnect = themeStore.connect()
    expect(themeStore.getState().resolved.colorScheme).toBe('dark')
    disconnect()
  })

  it('syncs with other tabs through the storage event', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    const disconnect = themeStore.connect()

    fake.storageItems.set(
      themeStorageKey,
      JSON.stringify({ colorScheme: 'dark', contrast: 'more' }),
    )
    fake.dispatchStorageEvent(themeStorageKey)
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'dark', contrast: 'more' })

    fake.dispatchStorageEvent('some-other-key')
    fake.storageItems.clear()
    fake.dispatchStorageEvent(null)
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'system', contrast: 'system' })
    disconnect()
  })

  it('is ref-counted: listeners stay until the last connection is cleaned up', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env)
    const disconnectFirst = themeStore.connect()
    const listenersWhenConnected = fake.listenerCount()
    expect(listenersWhenConnected).toBeGreaterThan(0)

    const disconnectSecond = themeStore.connect()
    expect(fake.listenerCount()).toBe(listenersWhenConnected)
    disconnectFirst()
    disconnectFirst()
    expect(fake.listenerCount()).toBe(listenersWhenConnected)
    disconnectSecond()
    expect(fake.listenerCount()).toBe(0)

    themeStore.actions.selectColorScheme('dark')
    expect(fake.attributes.get(colorSchemeAttribute)).toBe('light')
  })

  it("doesn't listen for storage events with a custom adapter or 'none'", () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env, { storage: 'none' })
    const disconnect = themeStore.connect()
    fake.storageItems.set(themeStorageKey, JSON.stringify({ colorScheme: 'dark' }))
    fake.dispatchStorageEvent(themeStorageKey)
    expect(themeStore.getState().preference.colorScheme).toBe('system')
    disconnect()
  })
})

describe('getThemeStore', () => {
  it('keeps one store per document', () => {
    const fake = createFakeEnv()
    const otherFake = createFakeEnv()
    const themeStore = getThemeStore(fake.env)
    expect(getThemeStore({ ...fake.env }, { defaultColorScheme: 'dark' })).toBe(themeStore)
    expect(getThemeStore(otherFake.env)).not.toBe(themeStore)
  })

  it('creates a detached store without an env', () => {
    expect(getThemeStore(undefined)).not.toBe(getThemeStore(undefined))
  })
})

/** Untyped input, as from plain JavaScript or a CMS: the type system can't be relied on. */
const hostileOptions = JSON.parse(
  JSON.stringify({
    defaultColorScheme: '</script><script>alert(1)</script>',
    defaultContrast: 'more" onload="alert(1)',
    storage: 'session',
  }),
) as ThemeOptions

describe('invalid theme options', () => {
  it('lists every option with a value outside its allowed set', () => {
    expect(findInvalidThemeOptions(hostileOptions)).toEqual([
      'defaultColorScheme',
      'defaultContrast',
      'storage',
    ])
    expect(findInvalidThemeOptions({})).toEqual([])
    expect(
      findInvalidThemeOptions({
        defaultColorScheme: 'dark',
        defaultContrast: 'more',
        storage: { read: () => undefined, write: () => {} },
      }),
    ).toEqual([])
  })

  it('falls back to `system` and local storage, and never writes an invalid attribute value', () => {
    const fake = createFakeEnv()
    const themeStore = createThemeStore(fake.env, hostileOptions)
    expect(themeStore.options).toEqual({
      defaultColorScheme: 'system',
      defaultContrast: 'system',
      storage: 'local',
    })
    expect(themeStore.getState().preference).toEqual({ colorScheme: 'system', contrast: 'system' })
    const disconnect = themeStore.connect()
    expect([...fake.attributes.values()]).toEqual(['light', 'standard'])
    disconnect()
  })
})

describe('isSameThemeConfiguration', () => {
  const adapter: ThemeStorageAdapter = { read: () => undefined, write: () => {} }

  it('compares defaults and the kind of storage', () => {
    const configured = createThemeStore(undefined, { defaultColorScheme: 'dark' }).options
    expect(isSameThemeConfiguration(configured, { defaultColorScheme: 'dark' })).toBe(true)
    expect(
      isSameThemeConfiguration(configured, { defaultColorScheme: 'dark', storage: 'local' }),
    ).toBe(true)
    expect(isSameThemeConfiguration(configured, {})).toBe(false)
    expect(
      isSameThemeConfiguration(configured, { defaultColorScheme: 'dark', storage: 'none' }),
    ).toBe(false)
  })

  it('treats any two adapters as the same, since inline adapters are new objects each render', () => {
    const configured = createThemeStore(undefined, { storage: adapter }).options
    expect(isSameThemeConfiguration(configured, { storage: { ...adapter } })).toBe(true)
    expect(isSameThemeConfiguration(configured, { storage: 'local' })).toBe(false)
  })

  it('lets a caller detect that the document store was configured by someone else first', () => {
    const fake = createFakeEnv()
    getThemeStore(fake.env)
    const requested: ThemeOptions = { defaultContrast: 'more' }
    expect(isSameThemeConfiguration(getThemeStore(fake.env, requested).options, requested)).toBe(
      false,
    )
  })
})
