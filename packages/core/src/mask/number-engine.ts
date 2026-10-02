import type { NumberMaskDefinition } from './mask-types.ts'
import { createOutcomeRecorder, isDigit, isInserted } from './parse-support.ts'
import type { MaskEngine, ParseContext, ParseOutcome } from './parse-support.ts'

interface NumberSeparators {
  readonly decimal: string
  readonly group: string
}

const fallbackLocale = 'en'

/**
 * The separators of a locale, from `Intl` only. An unsupported locale falls back to `en`
 * instead of to the runtime's own locale, so the result doesn't depend on the machine.
 */
export function resolveNumberSeparators(locale: string): NumberSeparators {
  let supported = fallbackLocale
  try {
    if (Intl.NumberFormat.supportedLocalesOf([locale]).length > 0) supported = locale
  } catch {
    // An invalid tag: use the fallback.
  }
  const formatter = new Intl.NumberFormat(supported)
  const decimal = formatter.formatToParts(1.1).find((part) => part.type === 'decimal')?.value
  const group = formatter.formatToParts(1_000_000).find((part) => part.type === 'group')?.value
  return { decimal: decimal ?? '.', group: group ?? ',' }
}

const minusPattern = /^[-−]$/u
const decimalMarkPattern = /^[.,]$/
const whitespacePattern = /^\s$/u

export function createNumberEngine(definition: NumberMaskDefinition): MaskEngine {
  const locale = definition.locale ?? fallbackLocale
  const separators = resolveNumberSeparators(locale)
  const decimals = Math.max(0, Math.trunc(definition.decimals ?? 0))
  const allowNegative = definition.allowNegative ?? false
  const grouping = definition.grouping ?? false
  const { min, max } = definition

  function parse(value: string, context: ParseContext): ParseOutcome {
    // With `1,234.56` or `1 234,56` pasted, the last `,` or `.` is the decimal separator and the
    // earlier ones are grouping. A single one is the decimal separator.
    const groupingMarks = new Set<number>()
    if (context.isBulk) {
      const marks: number[] = []
      for (let index = context.insertedStart; index < context.insertedEnd; index += 1) {
        if (decimalMarkPattern.test(value.charAt(index))) marks.push(index)
      }
      const kinds = new Set(marks.map((index) => value.charAt(index)))
      const decimalIndex =
        decimals > 0 && (kinds.size > 1 || marks.length === 1) ? marks.at(-1) : undefined
      for (const index of marks) if (index !== decimalIndex) groupingMarks.add(index)
    }

    let isNegative = false
    let hasDecimalMark = false
    let integerDigits = ''
    let fractionDigits = ''
    let acceptedCount = 0

    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      const inserted = isInserted(context, start)
      const bulk = context.isBulk && inserted
      const reject = (reason: 'digits' | 'other' | 'length', silent = false): void =>
        record.reject(start, end, character, reason, silent)

      if (context.skipped.has(start)) {
        reject('length')
        return
      }
      if (isDigit(character)) {
        if (hasDecimalMark) {
          if (fractionDigits.length >= decimals) {
            reject('length')
            return
          }
          fractionDigits += character
        } else {
          integerDigits += character
        }
        acceptedCount += 1
        record.accept(start, end, 0, false)
        return
      }
      if (minusPattern.test(character)) {
        if (allowNegative && !isNegative && acceptedCount === 0) {
          isNegative = true
          acceptedCount += 1
          record.accept(start, end, 0, false)
        } else {
          reject(allowNegative ? 'other' : 'digits', bulk)
        }
        return
      }
      if (decimalMarkPattern.test(character)) {
        if (groupingMarks.has(start)) {
          record.markLiteral(start)
          return
        }
        if (decimals > 0 && !hasDecimalMark) {
          hasDecimalMark = true
          acceptedCount += 1
          record.accept(start, end, 0, false)
        } else {
          reject(decimals > 0 ? 'other' : 'digits', bulk)
        }
        return
      }
      if (whitespacePattern.test(character)) {
        // Grouping that the mask wrote earlier is not the user's input, and pasted grouping is
        // normalised. A space the user types alone is refused, and said so.
        record.markLiteral(start)
        if (inserted && !context.isBulk) reject('other')
        return
      }
      reject('digits')
    })

    // Build the output in the order the characters were accepted: the sign, the integer digits,
    // the decimal separator, the fraction digits. That is also the order in the input.
    let output = ''
    const ends: number[] = []
    if (isNegative) {
      output += '-'
      ends.push(output.length)
    }
    for (let position = 0; position < integerDigits.length; position += 1) {
      if (grouping && position > 0 && (integerDigits.length - position) % 3 === 0) {
        output += separators.group
      }
      output += integerDigits.charAt(position)
      ends.push(output.length)
    }
    if (hasDecimalMark) {
      output += separators.decimal
      ends.push(output.length)
      for (const digit of fractionDigits) {
        output += digit
        ends.push(output.length)
      }
    }

    const outcome = recorder.finish({
      value: output,
      unmaskedValue: `${isNegative ? '-' : ''}${integerDigits}${hasDecimalMark ? '.' : ''}${fractionDigits}`,
      isComplete: false,
      isWithinRange: true,
    })

    const hasDigits = integerDigits !== '' || fractionDigits !== ''
    const numeric = hasDigits ? Number(`${integerDigits || '0'}.${fractionDigits || '0'}`) : NaN
    const signed = isNegative ? -numeric : numeric
    return {
      ...outcome,
      endOfAccepted: [0, ...ends],
      isComplete: hasDigits && !(hasDecimalMark && fractionDigits === ''),
      isWithinRange:
        Number.isNaN(signed) ||
        ((min === undefined || signed >= min) && (max === undefined || signed <= max)),
    }
  }

  return {
    attributes: definition.attributes ?? {},
    parse,
    withLocale: (nextLocale) =>
      definition.locale === undefined
        ? createNumberEngine({ ...definition, locale: nextLocale })
        : undefined,
  }
}
