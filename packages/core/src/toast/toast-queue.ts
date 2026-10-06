import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'

/** What the queue needs from the page: timers and a monotonic clock. `Env` satisfies it. */
export interface ToastQueueEnv {
  readonly window: {
    readonly setTimeout: (handler: () => void, milliseconds: number) => number
    readonly clearTimeout: (handle: number) => void
    readonly performance: { readonly now: () => number }
  }
}

export type ToastVariant = 'info' | 'success'

/** `modal`: a modal dialog is open, and the region behind it is inert, so nobody can read or pause a toast. */
export type ToastPauseReason = 'hover' | 'focus' | 'hidden' | 'modal'

export interface ToastQueueOptions {
  /** How many toasts show at once; past it a timed toast is evicted, else the new one is ignored. Default 10. */
  limit?: number | undefined
  /**
   * `false` (default): no toast times out. `true`: toasts allowed to time out do, after their
   * reading time. A number from 1 to 10 multiplies that time, for an app to tie to a user setting.
   */
  autoDismiss?: boolean | number | undefined
}

export interface ToastInput {
  /** Showing an id that is already shown updates that toast in place. */
  id?: string | undefined
  /** Default `'info'`. */
  variant?: ToastVariant | undefined
  /** All the text the user must read, for the reading time: the title and the body. */
  text: string
  /** A toast with an action never times out. */
  hasAction?: boolean | undefined
}

export interface ToastEntry {
  id: string
  variant: ToastVariant
  text: string
  hasAction: boolean
  /** Set by `show` only: it changes when the toast is shown again, not when its timing is. */
  revision: number
  /** Whether a timer removes it. */
  timed: boolean
}

export interface ToastQueueState {
  /** Oldest first: DOM order, visual order and Tab order. */
  visible: ToastEntry[]
}

export interface ToastShowResult {
  id: string
  /** `'ignored'` when the limit was reached and no timed toast could make room: nothing was added. */
  placement: 'visible' | 'ignored'
  updated: boolean
  /** `autoDismiss` asked for a timer but the toast has an action: the caller may warn in dev. */
  timerDropped: boolean
}

export interface ToastQueueActions {
  show: (input: ToastInput) => ToastShowResult
  /** Returns `false` when no toast has this id. */
  dismiss: (id: string) => boolean
  dismissAll: () => void
  /** Stops every timer until each reason that was paused has resumed. */
  pause: (reason: ToastPauseReason) => void
  /** The last resume restarts the timers with at least `toastResumeMinimumMilliseconds` left. */
  resume: (reason: ToastPauseReason) => void
  /**
   * Changes how many toasts show at once. A toast that is showing is never removed to fit: the
   * new limit applies to the next `show`.
   */
  setLimit: (limit: number) => void
  /**
   * Changes the `autoDismiss` option, such as when the user turns "keep messages longer" on. The
   * toasts that show get their timers (or lack of them) and reading time anew.
   */
  setAutoDismiss: (autoDismiss: boolean | number) => void
}

export type ToastQueue = ComponentStore<ToastQueueState, ToastQueueActions>

export const toastMinimumMilliseconds = 10_000
export const toastMillisecondsPerCharacter = 100
export const toastResumeMinimumMilliseconds = 5000

const defaultLimit = 10

const normalizeLimit = (requested: number) =>
  Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : defaultLimit

/**
 * The reading time of a toast: `max(10 000, 100 × characters)` ms, times `scale` (1 to 10).
 */
export function toastMinimumDuration(text: string, scale = 1): number {
  const clampedScale = Number.isFinite(scale) ? Math.min(10, Math.max(1, scale)) : 1
  return (
    Math.max(toastMinimumMilliseconds, toastMillisecondsPerCharacter * text.length) * clampedScale
  )
}

interface Timer {
  handle: number | undefined
  remaining: number
  startedAt: number
}

/**
 * The state behind the toast region: what shows, and when a toast times out. It has no
 * DOM, and no `console`: `show` reports a dropped timer for the caller to warn about.
 *
 * `env` is `undefined` while server rendering, when no timer can run.
 */
export function createToastQueue(
  env: ToastQueueEnv | undefined,
  { limit: requestedLimit = defaultLimit, autoDismiss = false }: ToastQueueOptions = {},
): ToastQueue {
  let timersAllowed = autoDismiss !== false
  let scale = typeof autoDismiss === 'number' ? autoDismiss : 1

  return createComponentStore<ToastQueueState, ToastQueueActions>(
    { visible: [] },
    ({ getState, update }) => {
      let limit = normalizeLimit(requestedLimit)
      let nextId = 1
      let nextRevision = 1
      const pausedReasons = new Set<ToastPauseReason>()
      const timers = new Map<string, Timer>()

      const publish = (visible: ToastEntry[]) => {
        update(() => ({ visible }))
      }

      const stopTimer = (id: string) => {
        const timer = timers.get(id)
        if (timer?.handle !== undefined) {
          env?.window.clearTimeout(timer.handle)
        }
        timers.delete(id)
      }

      const startTimer = (id: string, timer: Timer) => {
        if (env === undefined) {
          return
        }
        timer.startedAt = env.window.performance.now()
        timer.handle = env.window.setTimeout(() => {
          timer.handle = undefined
          dismiss(id)
        }, timer.remaining)
      }

      const armTimer = (entry: ToastEntry) => {
        stopTimer(entry.id)
        if (!entry.timed || env === undefined) {
          return
        }
        const timer: Timer = {
          handle: undefined,
          remaining: toastMinimumDuration(entry.text, scale),
          startedAt: 0,
        }
        timers.set(entry.id, timer)
        if (pausedReasons.size === 0) {
          startTimer(entry.id, timer)
        }
      }

      function dismiss(id: string): boolean {
        const { visible } = getState()
        if (visible.some((entry) => entry.id === id)) {
          stopTimer(id)
          publish(visible.filter((entry) => entry.id !== id))
          return true
        }
        return false
      }

      const show = (input: ToastInput): ToastShowResult => {
        const id = input.id ?? `toast-${nextId++}`
        const hasAction = input.hasAction ?? false
        const entry: ToastEntry = {
          id,
          variant: input.variant ?? 'info',
          text: input.text,
          hasAction,
          timed: timersAllowed && !hasAction,
          revision: nextRevision++,
        }
        const timerDropped = timersAllowed && hasAction
        const { visible } = getState()

        const shownIndex = visible.findIndex((candidate) => candidate.id === id)
        if (shownIndex !== -1) {
          const next = [...visible]
          next[shownIndex] = entry
          armTimer(entry)
          publish(next)
          return { id, placement: 'visible', updated: true, timerDropped }
        }

        let room = visible
        // A toast the user is on (pointer or focus) is never removed under them: the new one is ignored.
        const isUserOnAToast = pausedReasons.has('focus') || pausedReasons.has('hover')
        if (room.length >= limit && !isUserOnAToast) {
          const evictedIndex = room.findIndex((candidate) => candidate.timed)
          if (evictedIndex !== -1) {
            stopTimer((room[evictedIndex] as ToastEntry).id)
            room = room.filter((_, index) => index !== evictedIndex)
          }
        }
        if (room.length >= limit) {
          return { id, placement: 'ignored', updated: false, timerDropped }
        }
        armTimer(entry)
        publish([...room, entry])
        return { id, placement: 'visible', updated: false, timerDropped }
      }

      const dismissAll = () => {
        for (const id of timers.keys()) {
          stopTimer(id)
        }
        publish([])
      }

      const pause = (reason: ToastPauseReason) => {
        const wasRunning = pausedReasons.size === 0
        pausedReasons.add(reason)
        if (!wasRunning || env === undefined) {
          return
        }
        const now = env.window.performance.now()
        for (const timer of timers.values()) {
          if (timer.handle !== undefined) {
            env.window.clearTimeout(timer.handle)
            timer.handle = undefined
            timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt))
          }
        }
      }

      const resume = (reason: ToastPauseReason) => {
        if (!pausedReasons.delete(reason) || pausedReasons.size > 0) {
          return
        }
        for (const [id, timer] of timers) {
          timer.remaining = Math.max(timer.remaining, toastResumeMinimumMilliseconds)
          startTimer(id, timer)
        }
      }

      const setLimit = (nextLimit: number) => {
        limit = normalizeLimit(nextLimit)
      }

      const setAutoDismiss = (next: boolean | number) => {
        timersAllowed = next !== false
        scale = typeof next === 'number' ? next : 1
        const retime = (entry: ToastEntry): ToastEntry => ({
          ...entry,
          timed: timersAllowed && !entry.hasAction,
        })
        const visible = getState().visible.map(retime)
        for (const entry of visible) {
          armTimer(entry)
        }
        publish(visible)
      }

      return { show, dismiss, dismissAll, pause, resume, setLimit, setAutoDismiss }
    },
  )
}
