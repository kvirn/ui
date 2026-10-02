import type { RegexpMaskDefinition } from './mask-types.ts'
import { createOutcomeRecorder, isInserted, isSeparator } from './parse-support.ts'
import type { MaskEngine, ParseContext, ParseOutcome } from './parse-support.ts'

/** A copy that holds no state: `g` and `y` make `test` depend on the last call. */
function withoutStatefulFlags(expression: RegExp): RegExp {
  return new RegExp(expression.source, expression.flags.replace(/[gy]/g, ''))
}

export function createRegexpEngine(definition: RegexpMaskDefinition): MaskEngine {
  const expression = withoutStatefulFlags(definition.expression)
  const complete =
    definition.complete === undefined ? undefined : withoutStatefulFlags(definition.complete)
  const allowed = definition.allowed ?? 'other'
  const transform = definition.transform

  function parse(value: string, context: ParseContext): ParseOutcome {
    let output = ''
    // A value that matches as a whole is accepted as it is, also when the expression doesn't
    // accept the partial values on the way there (a pasted `1234-56` for `/^\d{4}-\d{2}$/`).
    const acceptsWhole =
      value !== '' &&
      context.skipped.size === 0 &&
      expression.test(transform === undefined ? value : Array.from(value, transform).join(''))

    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      if (context.skipped.has(start)) {
        record.reject(start, end, character, 'length', false)
        return
      }
      const normalized = transform === undefined ? character : transform(character)
      const candidate = output + normalized
      if (acceptsWhole || expression.test(candidate)) {
        output = candidate
        record.accept(start, end, output.length, false)
        return
      }
      // The character fits somewhere, just not now: the value is full, not wrong.
      const fitsInPlaceOfTheLast =
        output !== '' && expression.test(Array.from(output).slice(0, -1).join('') + normalized)
      record.reject(
        start,
        end,
        character,
        fitsInPlaceOfTheLast ? 'length' : allowed,
        (!isInserted(context, start) || context.isBulk) && isSeparator(character),
      )
    })

    const unmaskedValue = definition.unmask === undefined ? output : definition.unmask(output)
    return recorder.finish({
      value: output,
      unmaskedValue,
      isComplete:
        complete === undefined ? output !== '' && expression.test(output) : complete.test(output),
    })
  }

  return { attributes: definition.attributes ?? {}, parse, withLocale: () => undefined }
}
