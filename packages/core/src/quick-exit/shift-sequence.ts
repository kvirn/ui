export interface ShiftSequenceOptions {
  /** How many presses complete the sequence. Default 3. */
  count?: number | undefined
  /** The longest gap between two presses that still counts as the same sequence. Default 5000. */
  windowMs?: number | undefined
}

export interface ShiftSequenceResult {
  /** Presses counted so far, `0` after a completed sequence. */
  pressed: number
  /** Presses still needed. `0` when `complete`. */
  remaining: number
  complete: boolean
}

export interface ShiftSequence {
  /** Counts one press at `now` (milliseconds). A gap over `windowMs` starts again at 1. */
  press: (now: number) => ShiftSequenceResult
  /** Forgets the count: any other key, or a timeout. */
  reset: () => void
}

export const defaultShiftSequenceCount = 3
export const defaultShiftSequenceWindowMs = 5000

/**
 * Counts presses of one key in a short window, for QuickExit's Shift ×3. Pure: the caller passes
 * timestamps and ignores key repeat, so there are no timers or DOM here.
 */
export function createShiftSequence({
  count = defaultShiftSequenceCount,
  windowMs = defaultShiftSequenceWindowMs,
}: ShiftSequenceOptions = {}): ShiftSequence {
  let pressed = 0
  let lastPress = 0

  return {
    press(now) {
      pressed = pressed > 0 && now - lastPress <= windowMs ? pressed + 1 : 1
      lastPress = now
      if (pressed >= count) {
        pressed = 0
        return { pressed: 0, remaining: 0, complete: true }
      }
      return { pressed, remaining: count - pressed, complete: false }
    },
    reset() {
      pressed = 0
    },
  }
}
