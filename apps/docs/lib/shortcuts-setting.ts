import { useCallback, useSyncExternalStore } from 'react'

export const shortcutsSettingKey = 'kvirn-ui:docs-shortcuts'

// Set when storage is blocked, so the switch still works until the page reloads.
let memory: boolean | undefined

const read = () => {
  if (memory !== undefined) {
    return memory
  }
  try {
    return window.localStorage.getItem(shortcutsSettingKey) !== 'off'
  } catch {
    return true
  }
}

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === shortcutsSettingKey || event.key === null) {
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useShortcutsSetting() {
  const enabled = useSyncExternalStore(subscribe, read, () => true)
  const setEnabled = useCallback((next: boolean) => {
    memory = undefined
    try {
      window.localStorage.setItem(shortcutsSettingKey, next ? 'on' : 'off')
    } catch {
      memory = next
    }
    listeners.forEach((listener) => listener())
  }, [])
  return [enabled, setEnabled] as const
}
