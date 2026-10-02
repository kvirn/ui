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
    // Pasted text mixes decimal marks and grouping (`1,234.56`, `1 234,56`, `12.50`). A mark or a
    // space is grouping only when it looks like it: one to three digits (not a lone zero) before
    // it and exactly three after, within the pasted text. Anything else is the decimal mark or is
    // refused, and nothing is dropped without being reported. The stored value is not pasted text.
    const groupingMarks = new Set<number>()
    const trimmedWhitespace = new Set<number>()
    let chosenDecimalMark: number | undefined
    if (context.isBulk && context.isCanonical !== true) {
      const countDigits = (from: number, step: 1 | -1, limit: number): number => {
        let length = 0
        for (let index = from; index !== limit && isDigit(value.charAt(index)); index += step) {
          length += 1
        }
        return length
      }
      const looksLikeGrouping = (index: number): boolean => {
        const after = countDigits(index + 1, 1, context.insertedEnd)
        // The digits before count wherever they are, also those already in the field.
        const before = countDigits(index - 1, -1, -1)
        const characterBefore = value.charAt(index - before - 1)
        // A separator that has digits before it. A space before the number is not grouping.
        const isMiddleGroup =
          (decimalMarkPattern.test(characterBefore) || whitespacePattern.test(characterBefore)) &&
          isDigit(value.charAt(index - before - 2))
        if (after !== 3 || before < 1) return false
        // A middle group has exactly three digits. The first has one to three, and `0.500` or
        // `.500` is a fraction, not a thousand.
        if (isMiddleGroup) return before === 3
        return before <= 3 && !/^0+$/.test(value.slice(index - before, index))
      }
      const marks: number[] = []
      for (let index = context.insertedStart; index < context.insertedEnd; index += 1) {
        const character = value.charAt(index)
        if (decimalMarkPattern.test(character)) {
          marks.push(index)
        } else if (whitespacePattern.test(character)) {
          const betweenDigits = isDigit(value.charAt(index - 1)) && isDigit(value.charAt(index + 1))
          if (!betweenDigits) trimmedWhitespace.add(index)
          else if (looksLikeGrouping(index)) groupingMarks.add(index)
        }
      }
      const kinds = new Set(marks.map((index) => value.charAt(index)))
      const lastMark = marks.at(-1)
      const isLocaleMark = (index: number): boolean => value.charAt(index) === separators.decimal
      // A lone mark that looks like grouping but isn't the locale's own decimal mark, with room for
      // three decimals, could be either (`1,500` is 1500 or 1.5): refuse it and say so.
      const isAmbiguous =
        marks.length === 1 &&
        lastMark !== undefined &&
        decimals >= 3 &&
        looksLikeGrouping(lastMark) &&
        !isLocaleMark(lastMark) &&
        // The mask's own grouping mark, as it writes it, is not a question.
        !(grouping && value.charAt(lastMark) === separators.group)
      // The last mark is the decimal mark when the kinds are mixed (`1,250.75`) or when it doesn't
      // look like grouping (`12.50`), and a lone mark is when it is the locale's own (`1,000` is
      // one in sv, a thousand in en).
      const lastIsDecimal =
        lastMark !== undefined &&
        (kinds.size > 1 ||
          !looksLikeGrouping(lastMark) ||
          (marks.length === 1 && isLocaleMark(lastMark)))
      if (lastIsDecimal) chosenDecimalMark = lastMark
      for (const index of marks) {
        const repeatsTheDecimalMark =
          chosenDecimalMark !== undefined && value.charAt(index) === value.charAt(chosenDecimalMark)
        if (
          index !== chosenDecimalMark &&
          !repeatsTheDecimalMark &&
          !isAmbiguous &&
          looksLikeGrouping(index)
        ) {
          groupingMarks.add(index)
        }
      }
    }

    let isNegative = false
    let hasDecimalMark = false
    let integerDigits = ''
    let fractionDigits = ''
    let acceptedCount = 0
    // After a decimal mark that there is no room for, its digits are refused as well, so a
    // fraction is never merged into the whole number.
    let isRefusingFraction = false
    let isHalted = false

    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      const inserted = isInserted(context, start)
      const reject = (reason: 'digits' | 'other' | 'length'): void => {
        if (context.isCanonical === true && !whitespacePattern.test(character)) isHalted = true
        record.reject(start, end, character, reason, false)
      }

      // A stored value is read up to the first character that isn't canonical. Digits after it
      // are not merged into the number, because format can't report what it drops.
      if (isHalted) {
        reject('other')
        return
      }
      if (context.skipped.has(start)) {
        // Only a digit is refused because the value is full. A mark or a sign is refused because
        // it doesn't fit where it is.
        reject(isDigit(character) ? 'length' : 'other')
        return
      }
      if (isDigit(character)) {
        if (isRefusingFraction && inserted) {
          reject('other')
          return
        }
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
      if (!isDigit(character)) isRefusingFraction = false
      if (minusPattern.test(character)) {
        if (allowNegative && !isNegative && acceptedCount === 0) {
          isNegative = true
          acceptedCount += 1
          record.accept(start, end, 0, false)
        } else {
          reject(allowNegative ? 'other' : 'digits')
        }
        return
      }
      if (decimalMarkPattern.test(character)) {
        if (groupingMarks.has(start)) {
          record.markLiteral(start)
          return
        }
        // A grouping mark that the mask wrote earlier, where it is also a decimal mark (en), is
        // not the user's input and not a decimal mark.
        if (!inserted && grouping && character === separators.group && !context.isCanonical) {
          record.markLiteral(start)
          return
        }
        // The stored value has `.` as the decimal mark. In pasted text only the mark picked above
        // can be the decimal mark, and the others are refused, not turned into one.
        const isChosen =
          context.isCanonical === true
            ? character === '.'
            : !context.isBulk || !inserted || start === chosenDecimalMark
        if (decimals > 0 && !hasDecimalMark && isChosen) {
          hasDecimalMark = true
          acceptedCount += 1
          record.accept(start, end, 0, false)
        } else {
          reject(decimals > 0 ? 'other' : 'digits')
          isRefusingFraction = decimals === 0 && context.isBulk && inserted && isChosen
        }
        return
      }
      if (whitespacePattern.test(character)) {
        // Grouping that the mask wrote earlier is not the user's input, pasted grouping is
        // normalised and whitespace around a pasted number is trimmed. A space inside a pasted
        // number that isn't grouping, or one the user types alone, is refused and said so.
        record.markLiteral(start)
        if (inserted && !groupingMarks.has(start) && !trimmedWhitespace.has(start)) reject('other')
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
