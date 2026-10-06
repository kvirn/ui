import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'

/** What the timer needs from the page: timers. `Env` satisfies it, and a Node test can pass two functions. */
export interface ProgressTimerEnv {
  readonly window: {
    readonly setTimeout: (handler: () => void, milliseconds: number) => number
    readonly clearTimeout: (handle: number) => void
  }
}

/** `waiting`: inside the show delay, nothing is shown. `shown`: the wait is visible. `slow`: it passed the slow limit. */
export type ProgressPhase = 'waiting' | 'shown' | 'slow'

export interface ProgressTimerOptions {
  /** How long a wait stays invisible, so a quick one never flashes. Default 1000. */
  delayMilliseconds?: number | undefined
  /**
   * When, counted from `start`, the wait counts as slow. `false` never. Default 10000. It is
   * never earlier than the end of the show delay.
   */
  slowAfterMilliseconds?: number | false | undefined
}

export interface ProgressTimerState {
  phase: ProgressPhase
}

export interface ProgressTimerActions {
  /** Begins a wait: the phase is `waiting` again and both timers run from now. */
  start: () => void
  /** Cancels the timers and goes back to `waiting`. */
  stop: () => void
}

export type ProgressTimer = ComponentStore<ProgressTimerState, ProgressTimerActions>

export const defaultProgressDelayMilliseconds = 1000
export const defaultProgressSlowAfterMilliseconds = 10_000

const isUsable = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value) && value >= 0

/**
 * The timing behind Progress: nothing for the first second, then shown, then slow after ten
 * seconds. Pure: the percent is not here, and no strings. `env` is `undefined` while server
 * rendering, when no timer can run and the phase stays `waiting`.
 */
export function createProgressTimer(
  env: ProgressTimerEnv | undefined,
  { delayMilliseconds, slowAfterMilliseconds }: ProgressTimerOptions = {},
): ProgressTimer {
  const delay = isUsable(delayMilliseconds) ? delayMilliseconds : defaultProgressDelayMilliseconds
  const slowAfter =
    slowAfterMilliseconds === false
      ? undefined
      : isUsable(slowAfterMilliseconds)
        ? slowAfterMilliseconds
        : defaultProgressSlowAfterMilliseconds

  return createComponentStore<ProgressTimerState, ProgressTimerActions>(
    { phase: 'waiting' },
    ({ update }) => {
      let handle: number | undefined

      const setPhase = (phase: ProgressPhase) => {
        update((state) => (state.phase === phase ? state : { phase }))
      }

      const cancel = () => {
        if (handle !== undefined) {
          env?.window.clearTimeout(handle)
          handle = undefined
        }
      }

      const start = () => {
        cancel()
        setPhase('waiting')
        if (env === undefined) {
          return
        }
        handle = env.window.setTimeout(() => {
          setPhase('shown')
          if (slowAfter === undefined) {
            handle = undefined
            return
          }
          // A separate timer, so a slow limit inside the delay still shows `shown` first.
          handle = env.window.setTimeout(
            () => {
              handle = undefined
              setPhase('slow')
            },
            Math.max(slowAfter - delay, 0),
          )
        }, delay)
      }

      const stop = () => {
        cancel()
        setPhase('waiting')
      }

      return { start, stop }
    },
  )
}
