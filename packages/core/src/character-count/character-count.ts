/**
 * The share of the limit from which a count is announced when typing pauses. Below it a user who
 * is nowhere near the limit is never interrupted.
 */
export const defaultCharacterCountAnnounceFrom = 0.8

export interface CharacterCountOptions {
  /** The text as the user typed it. */
  value: string
  /** The most characters the text may have. */
  limit: number
  /**
   * Counts a text in your own way, for example the way your server does, so the count and the
   * server agree. Default: {@link countCharacters}, the characters the user sees.
   */
  countCharacters?: ((value: string) => number) | undefined
  /** A share of the limit from `0` to `1`, from which the count is announced. Default `0.8`. */
  announceFrom?: number | undefined
  /** The length before this change. It lets the result say that the change crossed the limit. */
  previousLength?: number | undefined
}

/**
 * What an announcement should do for this count: nothing, say it now (the count has just crossed
 * the limit), or say it when typing pauses (it is at or past the threshold).
 */
export type CharacterCountAnnouncement = 'none' | 'now' | 'afterPause'

export interface CharacterCountResult {
  /** The characters in the text, counted as asked. */
  length: number
  /** The limit, as a whole number of at least `0`. */
  limit: number
  /** How many more characters fit. `0` when at or over the limit. */
  remaining: number
  /** How many characters are over the limit. `0` when at or under it. */
  excess: number
  /** There is no text: the count says what the limit is. */
  isEmpty: boolean
  /** The text is longer than the limit. Exactly at the limit is not over. */
  isOver: boolean
  /** The text has reached the announce threshold (and is not empty). Also true when over. */
  isNear: boolean
  /** This change took the text from within the limit to over it. Needs `previousLength`. */
  crossedOver: boolean
  announce: CharacterCountAnnouncement
}

/**
 * The characters a user sees in a text: grapheme clusters, so a letter built from two code points
 * (`a` and a combining ring) and an emoji count as one, and a line break counts as one (`\r\n`
 * included). Where `Intl.Segmenter` doesn't exist it counts code points.
 */
export function countCharacters(value: string): number {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value))
      .length
  }
  return Array.from(value).length
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

/**
 * The maths of a character count: the length, what remains, whether the text is over the limit,
 * and whether and when to announce it (design spec §6.3). It decides nothing about the text: it
 * never cuts or refuses it.
 *
 * @example
 * getCharacterCount({ value: 'Hej', limit: 500 }) // { length: 3, remaining: 497, … }
 */
export function getCharacterCount({
  value,
  limit,
  countCharacters: count = countCharacters,
  announceFrom = defaultCharacterCountAnnounceFrom,
  previousLength,
}: CharacterCountOptions): CharacterCountResult {
  const wholeLimit = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 0
  const length = count(value)
  const isEmpty = length === 0
  const isOver = length > wholeLimit
  // The small allowance keeps 80% of 15 at 12 and not 13 when the product is a hair over.
  const threshold = Math.ceil(wholeLimit * clamp(announceFrom, 0, 1) - 1e-9)
  const isNear = !isEmpty && length >= threshold
  const crossedOver = isOver && previousLength !== undefined && previousLength <= wholeLimit
  let announce: CharacterCountAnnouncement = 'none'
  if (crossedOver) {
    announce = 'now'
  } else if (isNear) {
    announce = 'afterPause'
  }
  return {
    length,
    limit: wholeLimit,
    remaining: Math.max(0, wholeLimit - length),
    excess: Math.max(0, length - wholeLimit),
    isEmpty,
    isOver,
    isNear,
    crossedOver,
    announce,
  }
}
