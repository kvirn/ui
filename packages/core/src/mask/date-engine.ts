import { dateInputOrder, dateSeparator } from '../locale/date-order.ts'
import type { DateInputPart } from '../locale/date-order.ts'
import type { MaskAttributes, MaskRejectionReason } from './mask-types.ts'
import { createOutcomeRecorder, isDigit, isInserted, isSeparator } from './parse-support.ts'
import type { MaskEngine, ParseContext, ParseOutcome } from './parse-support.ts'

export interface DateEngineOptions {
  /** BCP 47 locale for the order and the separator. Default `en`. `withLocale` sets it when absent. */
  readonly locale?: string | undefined
}

const fallbackLocale = 'en'

const attributes: MaskAttributes = { inputMode: 'numeric', spellCheck: false }

const maximumLength: Readonly<Record<DateInputPart, number>> = { day: 2, month: 2, year: 4 }

// What a person types after a day or a month to say "that part is done".
const closingCharacters = new Set(['.', '-', '/', ' '])

// Day and month may be one digit (`2026-1-4`): they're written as they came, and padded in the
// unmasked value only.
const isoDatePattern = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/

/** An unsupported locale falls back to `en`, not to the machine's own locale. */
function resolveLocale(locale: string | undefined): string {
  if (locale === undefined) return fallbackLocale
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0 ? locale : fallbackLocale
  } catch {
    return fallbackLocale
  }
}

/**
 * The engine for `masks.date()`: one text field for a day, a month and a year, in the order and
 * with the separator of a locale. Lenient like the pattern engine: the separator is written when
 * the next part starts, a separator typed after a day or month closes it (`4.10.2026` is not
 * padded), and a pasted ISO date is reordered. It checks the shape only: 31.02.2026 is complete.
 */
export function createDateEngine(options: DateEngineOptions = {}): MaskEngine {
  const locale = resolveLocale(options.locale)
  const order = dateInputOrder(locale)
  const separator = dateSeparator(locale)

  const isoFor = (parts: Readonly<Record<DateInputPart, string>>): string =>
    `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`

  /** A whole ISO date arrives (paste, drop, autofill): write it in the locale's form. */
  function parseIsoDate(value: string, match: RegExpExecArray): ParseOutcome {
    const parts: Record<DateInputPart, string> = {
      year: match[1] ?? '',
      month: match[2] ?? '',
      day: match[3] ?? '',
    }
    const output = order.map((part) => parts[part]).join(separator)
    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      if (isDigit(character) || character === '-') {
        // The caret ends after the date.
        record.accept(start, end, output.length, !isDigit(character))
      } else {
        // Whitespace around the date.
        record.markLiteral(start)
      }
    })
    return recorder.finish({ value: output, unmaskedValue: isoFor(parts), isComplete: true })
  }

  function parse(value: string, context: ParseContext): ParseOutcome {
    if (context.isBulk || context.isCanonical === true) {
      const match = isoDatePattern.exec(value)
      if (match !== null) return parseIsoDate(value, match)
    }

    const digits: Record<DateInputPart, string> = { day: '', month: '', year: '' }
    let output = ''
    // The part being filled. When it is `owed`, the part before it is finished and its separator
    // is written with the first digit of this one (the pattern engine's lazy literals).
    let current = 0
    let isSeparatorOwed = false

    const currentPart = (): DateInputPart => order[current] ?? 'year'

    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      const inserted = isInserted(context, start)
      // Separators that don't fit are silent when pasted, and when they were already there.
      const isPastedSeparator = (!inserted || context.isBulk) && isSeparator(character)
      const reject = (reason: MaskRejectionReason, isSilent: boolean): void =>
        record.reject(start, end, character, reason, isSilent)

      if (context.skipped.has(start)) {
        reject('length', false)
        return
      }

      if (isDigit(character)) {
        const part = currentPart()
        if (digits[part].length >= maximumLength[part]) {
          reject('length', false)
          return
        }
        if (isSeparatorOwed) {
          output += separator
          isSeparatorOwed = false
        }
        digits[part] += character
        output += character
        if (digits[part].length === maximumLength[part] && current < 2) {
          current += 1
          isSeparatorOwed = true
        }
        record.accept(start, end, output.length, false)
        return
      }

      if (closingCharacters.has(character)) {
        if (isSeparatorOwed) {
          // The part is full: the separator is the one the mask would write.
          output += separator
          isSeparatorOwed = false
          record.accept(start, end, output.length, true)
          return
        }
        const part = currentPart()
        if (current < 2 && part !== 'year' && digits[part] !== '') {
          output += separator
          current += 1
          record.accept(start, end, output.length, true)
          return
        }
        reject('other', isPastedSeparator)
        return
      }

      reject(isSeparator(character) ? 'other' : 'digits', isPastedSeparator)
    })

    const isComplete =
      digits.day !== '' && digits.month !== '' && digits.year.length === maximumLength.year
    return recorder.finish({
      value: output,
      unmaskedValue: isComplete ? isoFor(digits) : '',
      isComplete,
    })
  }

  return {
    attributes,
    parse,
    withLocale: (nextLocale) =>
      options.locale === undefined ? createDateEngine({ locale: nextLocale }) : undefined,
  }
}
