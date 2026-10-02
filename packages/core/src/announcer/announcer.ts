import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'

/**
 * What the announcer needs from the page: timers and a monotonic clock. `Env` satisfies it (`createAnnouncer(env)` accepts one), and
 * a Node test can pass a few functions instead of a DOM (ADR-0003).
 */
export interface AnnouncerEnv {
  readonly window: {
    readonly setTimeout: (handler: () => void, milliseconds: number) => number
    readonly clearTimeout: (handle: number) => void
    readonly performance: { readonly now: () => number }
  }
}

export type AnnouncerPoliteness = 'polite' | 'assertive'

export interface AnnounceOptions {
  /**
   * `'polite'` (default) waits for the screen reader to finish speaking. `'assertive'`
   * interrupts it: only for something the user must act on right now.
   */
  politeness?: AnnouncerPoliteness | undefined
  /**
   * Throttles by key, such as a field's id: while a message with this key is inside its window,
   * later ones with the same key are dropped. Without a key, nothing is throttled.
   */
  key?: string | undefined
  /** The throttle window for `key`, in milliseconds. Default 3000. `0` turns it off. */
  throttleMilliseconds?: number | undefined
}

/** What each live region should hold right now. Empty means nothing to say. */
export interface AnnouncerState {
  polite: string
  assertive: string
}

export interface AnnouncerActions {
  /**
   * Queues a message for the live region. Returns `true` when it was accepted and `false` when
   * it was dropped (blank, throttled, or no page to announce on, as during server rendering).
   * A message queued while another for the same politeness is still waiting replaces it.
   */
  announce: (message: string, options?: AnnounceOptions) => boolean
  /** Empties both regions, cancels pending timers and forgets the throttle. Still usable after. */
  clear: () => void
}

export type Announcer = ComponentStore<AnnouncerState, AnnouncerActions>

/** The default throttle window for a message that has a `key`. */
export const defaultThrottleMilliseconds = 3000

/**
 * The region is emptied first and filled this many milliseconds later. Both changes need their own
 * render, or the browser never sees the text change and a repeated message is not read again.
 */
const setDelayMilliseconds = 100

/** How long a message stays in its region. Removing it keeps stale text out of browse mode. */
const keepMilliseconds = 5000

interface RegionTimers {
  set: number | undefined
  clear: number | undefined
}

/**
 * The state behind the shared live region (ADR-0040). It holds the text for a polite and an
 * assertive region, and the React `Announcer` renders it into regions that are already in the
 * page. Strings come from the caller, resolved from i18n: this module has none of its own.
 *
 * `env` is `undefined` while server rendering, when there is nothing to announce to.
 */
export function createAnnouncer(env: AnnouncerEnv | undefined): Announcer {
  return createComponentStore<AnnouncerState, AnnouncerActions>(
    { polite: '', assertive: '' },
    ({ getState, update }) => {
      const timers: Record<AnnouncerPoliteness, RegionTimers> = {
        polite: { set: undefined, clear: undefined },
        assertive: { set: undefined, clear: undefined },
      }
      /** When each key's throttle window ends, on the `performance.now()` clock. */
      const throttledUntil = new Map<string, number>()

      const setText = (politeness: AnnouncerPoliteness, text: string) => {
        if (getState()[politeness] !== text) {
          update((state) => ({ ...state, [politeness]: text }))
        }
      }

      const cancelTimers = (politeness: AnnouncerPoliteness) => {
        const regionTimers = timers[politeness]
        for (const name of ['set', 'clear'] as const) {
          if (regionTimers[name] !== undefined) {
            env?.window.clearTimeout(regionTimers[name])
            regionTimers[name] = undefined
          }
        }
      }

      const announce = (message: string, options: AnnounceOptions = {}): boolean => {
        if (env === undefined || message.trim() === '') {
          return false
        }
        const { politeness = 'polite', key } = options
        const now = env.window.performance.now()

        if (key !== undefined) {
          for (const [throttledKey, until] of throttledUntil) {
            if (until <= now) {
              throttledUntil.delete(throttledKey)
            }
          }
          if (throttledUntil.has(key)) {
            return false
          }
          const requested = options.throttleMilliseconds
          const windowMilliseconds =
            requested !== undefined && Number.isFinite(requested) && requested >= 0
              ? requested
              : defaultThrottleMilliseconds
          if (windowMilliseconds > 0) {
            throttledUntil.set(key, now + windowMilliseconds)
          }
        }

        cancelTimers(politeness)
        setText(politeness, '')
        timers[politeness].set = env.window.setTimeout(() => {
          timers[politeness].set = undefined
          setText(politeness, message)
          timers[politeness].clear = env.window.setTimeout(() => {
            timers[politeness].clear = undefined
            setText(politeness, '')
          }, keepMilliseconds)
        }, setDelayMilliseconds)
        return true
      }

      const clear = () => {
        cancelTimers('polite')
        cancelTimers('assertive')
        throttledUntil.clear()
        update(() => ({ polite: '', assertive: '' }))
      }

      return { announce, clear }
    },
  )
}
