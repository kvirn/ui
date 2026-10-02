import type { MaskAttributes, MaskRejectionReason } from './mask-types.ts'

/** Where the user's edit is in the value, so the engine knows what to report and what to drop. */
export interface ParseContext {
  /** The inserted text is `value.slice(insertedStart, insertedEnd)`. */
  readonly insertedStart: number
  readonly insertedEnd: number
  /** More than one character was inserted: paste, drop, autofill or dictation. */
  readonly isBulk: boolean
  /** Inserted characters (by index) that the mask must drop because the value is full. */
  readonly skipped: ReadonlySet<number>
  /**
   * The value is a stored one, not text the user typed or pasted. A number mask then reads `.` as
   * the decimal mark and `-` as the sign, without guessing.
   */
  readonly isCanonical?: boolean
}

export interface ParseRejection {
  readonly index: number
  readonly character: string
  readonly reason: MaskRejectionReason
  /** A separator dropped from pasted text. Normalised, so it's not worth a message. */
  readonly isSeparator: boolean
}

export interface ParseOutcome {
  readonly value: string
  readonly unmaskedValue: string
  readonly isComplete: boolean
  readonly isWithinRange?: boolean
  readonly rejections: readonly ParseRejection[]
  /** For each position in the input value, how many characters the mask had accepted by then. */
  readonly acceptedBefore: readonly number[]
  /** For each accepted character (index 0 is none), the end of it in the output value. */
  readonly endOfAccepted: readonly number[]
  /** Input characters that the mask treats as formatting it would put back. */
  readonly literalFlags: readonly boolean[]
  /** Input indexes of the accepted characters that aren't literals. */
  readonly acceptedContentIndexes: readonly number[]
}

export interface MaskEngine {
  readonly attributes: MaskAttributes
  parse: (value: string, context: ParseContext) => ParseOutcome
  /** The engine with another locale, or `undefined` when the locale doesn't matter. */
  withLocale: (locale: string) => MaskEngine | undefined
}

const letterPattern = /^\p{L}$/u
const markPattern = /^\p{M}$/u
const digitPattern = /^[0-9]$/
// Whitespace, dashes, dots, commas, slashes, underscores and parentheses: what people put
// between the groups of a number. Pasted separators are normalised, not refused (ADR-0032, 5.3).
const separatorPattern = /^[\s\-‐-―−./,_()]$/u

export const isDigit = (character: string): boolean => digitPattern.test(character)
export const isLetter = (character: string): boolean => letterPattern.test(character)
export const isMark = (character: string): boolean => markPattern.test(character)
export const isLetterOrDigit = (character: string): boolean =>
  isDigit(character) || isLetter(character)
export const isSeparator = (character: string): boolean => separatorPattern.test(character)

export function isInserted(context: ParseContext, index: number): boolean {
  return index >= context.insertedStart && index < context.insertedEnd
}

/** The context for a value that isn't being edited: nothing is inserted, nothing is reported. */
export const untouchedContext: ParseContext = {
  insertedStart: 0,
  insertedEnd: 0,
  isBulk: false,
  skipped: new Set(),
}

/** The context for a whole value that arrives at once, such as a stored value or autofill. */
export function createWholeValueContext(value: string): ParseContext {
  return { insertedStart: 0, insertedEnd: value.length, isBulk: true, skipped: new Set() }
}

export interface OutcomeRecorder {
  accept: (start: number, end: number, endOfOutput: number, isLiteral: boolean) => void
  reject: (
    start: number,
    end: number,
    character: string,
    reason: MaskRejectionReason,
    isSeparator: boolean,
  ) => void
  /** A character the mask treats as formatting but doesn't output now (a grouping separator). */
  markLiteral: (start: number) => void
  finish: (fields: {
    value: string
    unmaskedValue: string
    isComplete: boolean
    isWithinRange?: boolean
  }) => ParseOutcome
}

/**
 * Walks the value one character (code point) at a time, so a surrogate pair stays whole. The
 * callback gets the start and end index of the character. It must report it to the recorder.
 */
export function createOutcomeRecorder(
  value: string,
  visit: (
    character: string,
    start: number,
    end: number,
    recorder: Omit<OutcomeRecorder, 'finish'>,
  ) => void,
): OutcomeRecorder {
  const acceptedBefore: number[] = Array.from({ length: value.length + 1 }, () => 0)
  const endOfAccepted: number[] = [0]
  const literalFlags: boolean[] = Array.from({ length: value.length }, () => false)
  const acceptedContentIndexes: number[] = []
  const rejections: ParseRejection[] = []
  let acceptedCount = 0

  const recorder: Omit<OutcomeRecorder, 'finish'> = {
    accept(start, _end, endOfOutput, isLiteral) {
      acceptedCount += 1
      endOfAccepted.push(endOfOutput)
      if (isLiteral) {
        literalFlags[start] = true
      } else {
        acceptedContentIndexes.push(start)
      }
    },
    reject(start, _end, character, reason, isSeparator) {
      rejections.push({ index: start, character, reason, isSeparator })
    },
    markLiteral(start) {
      literalFlags[start] = true
    },
  }

  let index = 0
  while (index < value.length) {
    const codePoint = value.codePointAt(index) ?? 0
    const character = String.fromCodePoint(codePoint)
    const end = index + character.length
    visit(character, index, end, recorder)
    for (let position = index + 1; position <= end; position += 1) {
      acceptedBefore[position] = acceptedCount
    }
    index = end
  }

  return {
    ...recorder,
    finish: (fields) => ({
      ...fields,
      rejections,
      acceptedBefore,
      endOfAccepted,
      literalFlags,
      acceptedContentIndexes,
    }),
  }
}
