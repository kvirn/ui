'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { useSyncExternalStore } from 'react'

export const exampleLocales = ['sv', 'en'] as const
export type ExampleLocale = (typeof exampleLocales)[number]
export const exampleCatalogs: Record<ExampleLocale, KvirnMessages> = { sv, en }

export const exampleLocaleStorageKey = 'kvirn-docs:example-locale'
const defaultLocale: ExampleLocale = 'sv'

const listeners = new Set<() => void>()

function readLocale(): ExampleLocale {
  try {
    const stored = window.localStorage.getItem(exampleLocaleStorageKey)
    return exampleLocales.find((candidate) => candidate === stored) ?? defaultLocale
  } catch {
    return defaultLocale
  }
}

// Storage can throw (blocked, full). The choice then lasts for this visit only.
let fallbackLocale: ExampleLocale | null = null

function getSnapshot(): ExampleLocale {
  return fallbackLocale ?? readLocale()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === exampleLocaleStorageKey) {
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function selectLocale(locale: ExampleLocale) {
  try {
    window.localStorage.setItem(exampleLocaleStorageKey, locale)
    fallbackLocale = null
  } catch {
    fallbackLocale = locale
  }
  listeners.forEach((listener) => listener())
}

/**
 * The language every example is shown in: one choice from Display settings, kept in this browser.
 * The server and the first client render use Swedish, so hydration matches.
 */
export function useExampleLocale() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => defaultLocale)
  return { locale, selectLocale }
}
