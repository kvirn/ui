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
   * `false` (default): no toast times out. A number is the time in milliseconds every toast that
   * is allowed to time out stays, with no minimum. A number that is not finite or is `<= 0` acts as `false`.
   */
  autoDismiss?: false | number | undefined
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

/** What a ring needs to draw the time left: all in milliseconds, nothing per frame. */
export interface ToastTimer {
  /** The time the toast was given. */
  duration: number
  /** What was left when this run started: the whole `duration`, or what a resume restarted with. */
  remaining: number
  /** Changes whenever the timer starts over (shown again, `setAutoDismiss`, resume), so a ring can restart. */
  run: number
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
  /** Set while a timer exists: `timed` and a page that can run timers. */
  timer?: ToastTimer | undefined
}

export interface ToastQueueState {
  /** Oldest first: DOM order, visual order and Tab order. */
  visible: ToastEntry[]
  /** Whether the timers are stopped (a hover, focus, hidden tab or modal). */
  paused: boolean
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
   * toasts that show get their timers (or lack of them) and duration anew.
   */
  setAutoDismiss: (autoDismiss: false | number) => void
}

export type ToastQueue = ComponentStore<ToastQueueState, ToastQueueActions>

export const toastResumeMinimumMilliseconds = 5000

const defaultLimit = 10

const normalizeLimit = (requested: number) =>
  Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : defaultLimit

const normalizeAutoDismiss = (requested: false | number): false | number =>
  typeof requested === 'number' && Number.isFinite(requested) && requested > 0 ? requested : false

interface Timer {
  handle: number | undefined
  remaining: number
  startedAt: number
  duration: number
  runRemaining: number
  run: number
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
  let duration = normalizeAutoDismiss(autoDismiss)

  return createComponentStore<ToastQueueState, ToastQueueActions>(
    { visible: [], paused: false },
    ({ getState, update }) => {
      let limit = normalizeLimit(requestedLimit)
      let nextId = 1
      let nextRevision = 1
      let nextRun = 1
      const pausedReasons = new Set<ToastPauseReason>()
      const timers = new Map<string, Timer>()

      const withTimer = (entry: ToastEntry): ToastEntry => {
        const timer = timers.get(entry.id)
        if (timer === undefined) {
          return entry.timer === undefined ? entry : { ...entry, timer: undefined }
        }
        if (entry.timer?.run === timer.run && entry.timer.remaining === timer.runRemaining) {
          return entry
        }
        return {
          ...entry,
          timer: { duration: timer.duration, remaining: timer.runRemaining, run: timer.run },
        }
      }

      const publish = (visible: ToastEntry[]) => {
        update((state) => ({ ...state, visible: visible.map(withTimer) }))
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
        const total = duration === false ? 0 : duration
        const timer: Timer = {
          handle: undefined,
          remaining: total,
          startedAt: 0,
          duration: total,
          runRemaining: total,
          run: nextRun++,
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
          timed: duration !== false && !hasAction,
          revision: nextRevision++,
        }
        const timerDropped = duration !== false && hasAction
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
        if (!wasRunning) {
          return
        }
        update((state) => ({ ...state, paused: true }))
        if (env === undefined) {
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
          timer.runRemaining = timer.remaining
          timer.run = nextRun++
          startTimer(id, timer)
        }
        update((state) => ({ ...state, paused: false, visible: state.visible.map(withTimer) }))
      }

      const setLimit = (nextLimit: number) => {
        limit = normalizeLimit(nextLimit)
      }

      const setAutoDismiss = (next: false | number) => {
        duration = normalizeAutoDismiss(next)
        const retime = (entry: ToastEntry): ToastEntry => ({
          ...entry,
          timed: duration !== false && !entry.hasAction,
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
