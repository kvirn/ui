import { startsWithText } from '../filter/filter-items.ts'
import type { FilterLocale } from '../filter/filter-items.ts'

export interface TypeaheadMatchInput {
  /** What the user has typed since the last pause. */
  word: string
  /** The text of every item, in order. */
  labels: readonly string[]
  /** The index of the item that has focus, or `-1` when none has. */
  currentIndex: number
  locale?: FilterLocale
}

/**
 * The index of the item a typeahead word points at, or `undefined` when none starts with it. Pure,
 * and locale-aware as `startsWithText` is (å, ä and ö stay distinct in `sv`).
 *
 * - One character, or the same character repeated ("aaa"), looks from the item after the current
 *   one, so pressing it again cycles through the items that start with it, as a native select does.
 * - A longer word looks from the current item, so it stays on a match that still fits.
 * - The search wraps around the end.
 *
 * @example
 * getTypeaheadMatch({ word: 'a', labels: ['Apple', 'Apricot'], currentIndex: 0 }) // 1
 */
export function getTypeaheadMatch({
  word,
  labels,
  currentIndex,
  locale,
}: TypeaheadMatchInput): number | undefined {
  const letters = Array.from(word)
  const first = letters[0]
  if (first === undefined || labels.length === 0) {
    return undefined
  }
  const repeated =
    letters.length > 1 && letters.every((letter) => startsWithText(letter, first, locale))
  const query = repeated ? first : word
  const start = repeated || letters.length === 1 ? currentIndex + 1 : currentIndex
  for (let offset = 0; offset < labels.length; offset += 1) {
    const index = (Math.max(start, 0) + offset) % labels.length
    const label = labels[index]
    if (label !== undefined && startsWithText(label, query, locale)) {
      return index
    }
  }
  return undefined
}
