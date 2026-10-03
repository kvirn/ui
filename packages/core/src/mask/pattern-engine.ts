import type {
  MaskAllowedCharacters,
  MaskAttributes,
  MaskRejectionReason,
  PatternMaskDefinition,
} from './mask-types.ts'
import {
  createOutcomeRecorder,
  isDigit,
  isInserted,
  isLetter,
  isLetterOrDigit,
  isMark,
  isSeparator,
} from './parse-support.ts'
import type { MaskEngine, ParseContext, ParseOutcome } from './parse-support.ts'

export interface LiteralToken {
  readonly kind: 'literal'
  readonly character: string
}

export interface ClassToken {
  readonly kind: 'class'
  /** What the token accepts, for the rejection message. */
  readonly allowed: MaskAllowedCharacters
  /** Runs on the character before it is tested and placed, for example to upper case. */
  readonly normalize?: (character: string) => string
  readonly test: (character: string) => boolean
  /** The accepted character may take combining marks (dead keys: a then ¨). */
  readonly takesMarks: boolean
}

export type Token = LiteralToken | ClassToken

export interface TokenEngineOptions {
  readonly tokens: readonly Token[]
  /** Replaces the default "every class token is filled" test. Gets the unmasked value. */
  readonly isComplete?: (unmaskedValue: string) => boolean
  readonly attributes?: MaskAttributes
}

const symbolTokens: Record<'9' | 'a' | '*', Omit<ClassToken, 'normalize'>> = {
  '9': { kind: 'class', allowed: 'digits', test: isDigit, takesMarks: false },
  a: { kind: 'class', allowed: 'letters', test: isLetter, takesMarks: true },
  '*': { kind: 'class', allowed: 'lettersAndDigits', test: isLetterOrDigit, takesMarks: true },
}

export function compilePattern(
  pattern: string,
  transform: PatternMaskDefinition['transform'],
): Token[] {
  const tokens: Token[] = []
  let index = 0
  while (index < pattern.length) {
    const codePoint = pattern.codePointAt(index) ?? 0
    const character = String.fromCodePoint(codePoint)
    index += character.length
    if (character === '\\' && index < pattern.length) {
      // An escaped character is a literal. A trailing backslash is a literal backslash.
      const escaped = String.fromCodePoint(pattern.codePointAt(index) ?? 0)
      index += escaped.length
      tokens.push({ kind: 'literal', character: escaped })
    } else if (character === '9' || character === 'a' || character === '*') {
      const symbol = symbolTokens[character]
      const normalize = transform?.[character]
      tokens.push(normalize === undefined ? symbol : { ...symbol, normalize })
    } else {
      tokens.push({ kind: 'literal', character })
    }
  }
  return tokens
}

/**
 * The engine for pattern masks. The rules that make it lenient:
 * literals are inserted lazily, a typed literal is accepted and not doubled, characters that
 * don't fit are dropped (separators silently from pasted text), and nothing is cut before the
 * value is normalised.
 */
export function createTokenEngine({
  tokens,
  isComplete,
  attributes = {},
}: TokenEngineOptions): MaskEngine {
  const classTokenCount = tokens.filter((token) => token.kind === 'class').length

  function parse(value: string, context: ParseContext): ParseOutcome {
    let tokenIndex = 0
    let output = ''
    let unmaskedValue = ''
    let filledClassTokens = 0
    let lastWasLetter = false

    // The next class token, and the index after the literals before it.
    const findNextClassToken = (): number => {
      let position = tokenIndex
      while (position < tokens.length && tokens[position]?.kind === 'literal') position += 1
      return position
    }
    const emitLiterals = (until: number): void => {
      for (; tokenIndex < until; tokenIndex += 1) {
        const token = tokens[tokenIndex]
        if (token?.kind === 'literal') output += token.character
      }
    }

    const recorder = createOutcomeRecorder(value, (character, start, end, record) => {
      const inserted = isInserted(context, start)
      // Pasted separators are normalised. A separator that was already there, such as a literal
      // that has moved, is the mask's own, and isn't the user's input either.
      const isBulkSeparator = (!inserted || context.isBulk) && isSeparator(character)
      const report = (reason: MaskRejectionReason, silent: boolean): void =>
        record.reject(start, end, character, reason, silent)

      if (context.skipped.has(start)) {
        report('length', false)
        return
      }

      // A dead key or an IME can deliver a letter and its mark separately: the mark stays with the
      // letter instead of taking a token of its own.
      if (isMark(character) && lastWasLetter) {
        output += character
        unmaskedValue += character
        record.accept(start, end, output.length, false)
        return
      }

      const classPosition = findNextClassToken()

      // A typed literal is accepted once, not doubled.
      for (let position = tokenIndex; position < classPosition; position += 1) {
        const token = tokens[position]
        if (token?.kind === 'literal' && token.character === character) {
          emitLiterals(position + 1)
          lastWasLetter = false
          record.accept(start, end, output.length, true)
          return
        }
      }

      const token = tokens[classPosition]
      if (token === undefined || token.kind !== 'class') {
        report('length', isBulkSeparator)
        return
      }

      const normalized = token.normalize === undefined ? character : token.normalize(character)
      if (!token.test(normalized)) {
        report(token.allowed, isBulkSeparator)
        return
      }

      emitLiterals(classPosition)
      output += normalized
      unmaskedValue += normalized
      tokenIndex = classPosition + 1
      filledClassTokens += 1
      lastWasLetter = token.takesMarks && isLetter(normalized)
      record.accept(start, end, output.length, false)
    })

    return recorder.finish({
      value: output,
      unmaskedValue,
      isComplete:
        isComplete === undefined
          ? classTokenCount > 0 && filledClassTokens === classTokenCount
          : isComplete(unmaskedValue),
    })
  }

  return { attributes, parse, withLocale: () => undefined }
}

export function createPatternEngine(definition: PatternMaskDefinition): MaskEngine {
  const completeLengths = definition.completeLengths
  return createTokenEngine({
    tokens: compilePattern(definition.pattern, definition.transform),
    ...(completeLengths === undefined
      ? {}
      : { isComplete: (unmaskedValue: string) => completeLengths.includes(unmaskedValue.length) }),
    ...(definition.attributes === undefined ? {} : { attributes: definition.attributes }),
  })
}
