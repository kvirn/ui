import type {
  Mask,
  MaskApplyOptions,
  MaskDefinition,
  MaskRejection,
  MaskRejectionReason,
  MaskResult,
} from './mask-types.ts'
import { createNumberEngine } from './number-engine.ts'
import { createPatternEngine } from './pattern-engine.ts'
import { createWholeValueContext, untouchedContext } from './parse-support.ts'
import type { MaskEngine, ParseContext, ParseOutcome } from './parse-support.ts'
import { createRegexpEngine } from './regexp-engine.ts'

function createEngine(definition: MaskDefinition): MaskEngine {
  switch (definition.type) {
    case 'pattern':
      return createPatternEngine(definition)
    case 'regexp':
      return createRegexpEngine(definition)
    case 'number':
      return createNumberEngine(definition)
    case 'function': {
      const attributes = definition.attributes ?? {}
      return {
        attributes,
        parse: (value, context) => createEngine(definition.resolve(value)).parse(value, context),
        withLocale: (locale) => {
          // The resolved definition may be a number mask: give it the locale.
          const resolve = (value: string) => {
            const resolved = definition.resolve(value)
            return resolved.type === 'number' && resolved.locale === undefined
              ? { ...resolved, locale }
              : resolved
          }
          return createEngine({ type: 'function', resolve, attributes })
        },
      }
    }
  }
}

interface Insertion {
  start: number
  end: number
}

/**
 * Finds what the user inserted, from the caret after the edit: the text after the caret is
 * untouched, and the common start of the old and the new value is untouched. Without the old
 * value the whole value counts as inserted (autofill, a stored value).
 */
function findInsertion(
  value: string,
  caret: number,
  previousValue: string | undefined,
): Insertion & { suffixLength: number } {
  if (previousValue === undefined) return { start: 0, end: value.length, suffixLength: 0 }
  let suffixLength = value.length - caret
  if (suffixLength > previousValue.length || !previousValue.endsWith(value.slice(caret))) {
    // The caret doesn't say where the edit ended: take the common end instead.
    suffixLength = 0
    while (
      suffixLength < value.length &&
      suffixLength < previousValue.length &&
      value.charAt(value.length - 1 - suffixLength) ===
        previousValue.charAt(previousValue.length - 1 - suffixLength)
    ) {
      suffixLength += 1
    }
  }
  const limit = Math.min(value.length, previousValue.length) - suffixLength
  let start = 0
  while (start < limit && value.charAt(start) === previousValue.charAt(start)) start += 1
  return { start, end: value.length - suffixLength, suffixLength }
}

function groupRejections(
  rejections: ParseOutcome['rejections'],
  insertion: Insertion,
): MaskRejection[] {
  const grouped = new Map<MaskRejectionReason, string>()
  for (const rejection of rejections) {
    if (rejection.isSeparator) continue
    if (rejection.index < insertion.start || rejection.index >= insertion.end) continue
    grouped.set(rejection.reason, (grouped.get(rejection.reason) ?? '') + rejection.character)
  }
  return [...grouped].map(([reason, characters]) => ({ reason, characters }))
}

/**
 * When the new characters push existing ones out of a full mask, drop the new characters and keep
 * what was there (like `maxlength`), instead of cutting the end of the value.
 */
function keepExistingValue(
  engine: MaskEngine,
  value: string,
  context: ParseContext,
  outcome: ParseOutcome,
): ParseOutcome {
  const isExisting = (index: number): boolean =>
    index < context.insertedStart || index >= context.insertedEnd
  const lostExisting = (candidate: ParseOutcome): boolean =>
    candidate.rejections.some((rejection) => isExisting(rejection.index) && !rejection.isSeparator)
  if (context.insertedStart === context.insertedEnd || !lostExisting(outcome)) return outcome

  // If the existing text alone doesn't parse cleanly, the new text isn't what pushed it out.
  const existing = value.slice(0, context.insertedStart) + value.slice(context.insertedEnd)
  if (engine.parse(existing, untouchedContext).rejections.length > 0) return outcome

  const skipped = new Set<number>()
  let current = outcome
  while (lostExisting(current)) {
    const last = current.acceptedContentIndexes.filter((index) => !isExisting(index)).at(-1)
    if (last === undefined) break
    skipped.add(last)
    current = engine.parse(value, { ...context, skipped })
  }
  return current
}

function clamp(position: number | null | undefined, length: number, fallback: number): number {
  if (position === null || position === undefined) return fallback
  return Math.min(Math.max(position, 0), length)
}

function buildMask(engine: MaskEngine): Mask {
  const caretAfter = (outcome: ParseOutcome, position: number): number => {
    const accepted = outcome.acceptedBefore[Math.min(position, outcome.acceptedBefore.length - 1)]
    return outcome.endOfAccepted[accepted ?? 0] ?? 0
  }

  function apply(options: MaskApplyOptions): MaskResult {
    const { value, previousValue } = options
    const caretStart = clamp(options.selectionStart, value.length, value.length)
    const caretEnd = clamp(options.selectionEnd, value.length, caretStart)
    const insertion = findInsertion(value, caretEnd, previousValue)
    const insertedLength = Array.from(value.slice(insertion.start, insertion.end)).length
    const context: ParseContext = {
      insertedStart: insertion.start,
      insertedEnd: insertion.end,
      isBulk: insertedLength > 1,
      skipped: new Set(),
    }

    let outcome = keepExistingValue(engine, value, context, engine.parse(value, context))
    let selectionStart = caretAfter(outcome, caretStart)
    let selectionEnd = caretAfter(outcome, caretEnd)
    let rejected = groupRejections(outcome.rejections, insertion)

    // Backspace and Delete always make progress: when the deletion only removed a literal that the
    // mask puts back, delete the neighbouring character too (ADR-0032, 5.6).
    const isDeletion =
      previousValue !== undefined &&
      insertion.start === insertion.end &&
      value.length < previousValue.length
    if (isDeletion && outcome.value === previousValue) {
      const progress = deleteNeighbour(engine, previousValue, insertion, options.inputType)
      if (progress !== undefined) {
        outcome = progress.outcome
        selectionStart = progress.selection
        selectionEnd = progress.selection
        rejected = []
      }
    }

    const isChanged = outcome.value !== value
    return {
      value: outcome.value,
      // An unchanged value isn't written back, so the caret stays where the browser put it.
      selectionStart: isChanged ? selectionStart : caretStart,
      selectionEnd: isChanged ? selectionEnd : caretEnd,
      unmaskedValue: outcome.unmaskedValue,
      isComplete: outcome.isComplete,
      ...(outcome.isWithinRange === undefined ? {} : { isWithinRange: outcome.isWithinRange }),
      isChanged,
      rejected,
    }
  }

  function deleteNeighbour(
    activeEngine: MaskEngine,
    previousValue: string,
    insertion: Insertion & { suffixLength: number },
    inputType: string | undefined,
  ): { outcome: ParseOutcome; selection: number } | undefined {
    const previous = activeEngine.parse(previousValue, untouchedContext)
    const deletedStart = insertion.start
    const deletedEnd = previousValue.length - insertion.suffixLength
    const isForward = inputType?.includes('Forward') === true

    let target = isForward ? deletedEnd : deletedStart - 1
    while (target >= 0 && target < previousValue.length && previous.literalFlags[target] === true) {
      target += isForward ? 1 : -1
    }
    if (target < 0 || target >= previousValue.length) return undefined

    const next = isForward
      ? previousValue.slice(0, deletedStart) +
        previousValue.slice(deletedEnd, target) +
        previousValue.slice(target + 1)
      : previousValue.slice(0, target) +
        previousValue.slice(target + 1, deletedStart) +
        previousValue.slice(deletedEnd)
    const caret = isForward ? deletedStart : target
    const outcome = activeEngine.parse(next, {
      insertedStart: caret,
      insertedEnd: caret,
      isBulk: false,
      skipped: new Set(),
    })
    return { outcome, selection: caretAfter(outcome, caret) }
  }

  const format = (unmaskedValue: string): string =>
    engine.parse(unmaskedValue, { ...createWholeValueContext(unmaskedValue), isCanonical: true })
      .value
  const unmask = (value: string): string => engine.parse(value, untouchedContext).unmaskedValue

  const mask: Mask = {
    attributes: engine.attributes,
    apply,
    format,
    unmask,
    withLocale: (locale) => {
      const localized = engine.withLocale(locale)
      return localized === undefined ? mask : buildMask(localized)
    },
  }
  return mask
}

/** Builds a mask from a definition. The result is a bundle of pure functions (ADR-0032). */
export function createMask(definition: MaskDefinition): Mask {
  return buildMask(createEngine(definition))
}

/** For presets whose engine is built from tokens that the pattern syntax can't express. */
export function createMaskFromEngine(engine: MaskEngine): Mask {
  return buildMask(engine)
}
