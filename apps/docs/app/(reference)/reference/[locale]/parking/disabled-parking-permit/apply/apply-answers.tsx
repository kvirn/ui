'use client'
import { createContext, use, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

export interface ApplyAnswers {
  who: string | null
  vehicle: string
  contact: string
}

const emptyAnswers: ApplyAnswers = { who: null, vehicle: '', contact: '' }
const storageKey = 'kvirnby-reference-parking-permit'

interface ApplyState {
  answers: ApplyAnswers
  reference: string | undefined
  setAnswer: <Key extends keyof ApplyAnswers>(key: Key, value: ApplyAnswers[Key]) => void
  send: () => void
}

const ApplyContext = createContext<ApplyState | undefined>(undefined)

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const readStored = () => window.sessionStorage.getItem(storageKey) ?? ''
const readServer = () => ''

// The layout stays mounted between steps, so answers survive Back and Change (3.3.7); sessionStorage keeps them across a reload. Nothing leaves the browser.
export function ApplyAnswersProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, readStored, readServer)
  const { answers, reference } = useMemo<{ answers: ApplyAnswers; reference?: string }>(
    () => (stored === '' ? { answers: emptyAnswers } : JSON.parse(stored)),
    [stored],
  )

  const state = useMemo<ApplyState>(() => {
    const store = (nextAnswers: ApplyAnswers, nextReference: string | undefined) => {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ answers: nextAnswers, reference: nextReference }),
      )
      for (const listener of listeners) {
        listener()
      }
    }
    return {
      answers,
      reference,
      setAnswer: (key, value) => store({ ...answers, [key]: value }, reference),
      send: () => store(answers, `PK-2026-${Math.floor(Math.random() * 900000) + 100000}`),
    }
  }, [answers, reference])
  return <ApplyContext value={state}>{children}</ApplyContext>
}

export function useApplyAnswers(): ApplyState {
  const state = use(ApplyContext)
  if (state === undefined) {
    throw new Error('useApplyAnswers must be used inside ApplyAnswersProvider')
  }
  return state
}
