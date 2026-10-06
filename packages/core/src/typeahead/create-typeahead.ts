import type { FilterLocale } from '../filter/filter-items.ts'
import { getTypeaheadMatch } from './get-typeahead-match.ts'

/** What the typeahead needs from the page: timers, for the end of a word. `Env` satisfies it. */
export interface TypeaheadEnv {
  readonly window: {
    readonly setTimeout: (handler: () => void, milliseconds: number) => number
    readonly clearTimeout: (handle: number) => void
  }
}

export interface TypeaheadOptions {
  /** `undefined` while server rendering: a word is then only ended by `reset`. */
  env?: TypeaheadEnv | undefined
  locale?: FilterLocale
  /** How long a pause ends a word, in milliseconds. Default 500. */
  resetMilliseconds?: number | undefined
}

export interface Typeahead {
  /** Adds a character to the word and returns the index of the item to focus, if one matches. */
  type: (character: string, labels: readonly string[], currentIndex: number) => number | undefined
  /** Whether a word is in progress: a Space then belongs to it. */
  hasWord: () => boolean
  reset: () => void
}

/**
 * Typeahead for a list of items that is not a listbox (a Menu): it keeps the word, ends it after a
 * pause, and finds the match with `getTypeaheadMatch`. It holds the word and one timer, and has no
 * DOM and no `window` at import time.
 *
 * @example
 * const typeahead = createTypeahead({ env, locale: 'sv' })
 * typeahead.type('s', ['Dela', 'Skriv ut'], 0) // 1
 */
export function createTypeahead({
  env,
  locale,
  resetMilliseconds = 500,
}: TypeaheadOptions = {}): Typeahead {
  let word = ''
  let timer: number | undefined

  const stopTimer = () => {
    if (timer !== undefined) {
      env?.window.clearTimeout(timer)
      timer = undefined
    }
  }
  const reset = () => {
    stopTimer()
    word = ''
  }

  return {
    type: (character, labels, currentIndex) => {
      if (character === '') {
        return undefined
      }
      word += character
      stopTimer()
      if (env !== undefined) {
        timer = env.window.setTimeout(() => {
          timer = undefined
          word = ''
        }, resetMilliseconds)
      }
      return getTypeaheadMatch({ word, labels, currentIndex, locale })
    },
    hasWord: () => word !== '',
    reset,
  }
}
