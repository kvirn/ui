import { ibanLengths } from './checks/iban.ts'
import { createMask, createMaskFromEngine } from './create-mask.ts'
import type {
  Mask,
  MaskAttributes,
  NumberMaskDefinition,
  PatternMaskDefinition,
  RegexpMaskDefinition,
} from './mask-types.ts'
import { compilePattern, createTokenEngine } from './pattern-engine.ts'
import type { ClassToken, Token } from './pattern-engine.ts'

export type MaskCountry = 'SE' | 'FI' | 'NO'

export interface DigitsMaskOptions {
  /** The most digits. Default: no limit. */
  readonly length?: number
}

export type NumberMaskOptions = Omit<NumberMaskDefinition, 'type' | 'attributes'>

export interface CountryMaskOptions {
  readonly country: MaskCountry
}

export interface OneTimeCodeMaskOptions {
  /**
   * The shape of the code, one symbol per character: `9` a digit, `*` a letter or digit, `a` a
   * letter, `A` an upper-case letter (lower case typed is upper-cased), `&` an upper-case letter
   * or digit, and `-` a separator between two of them. ASCII only. `****-****` is two groups of
   * four. An invalid pattern throws a `RangeError`.
   */
  readonly pattern: string
}

const identifierAttributes = {
  inputMode: 'numeric',
  spellCheck: false,
  dir: 'ltr',
} as const satisfies MaskAttributes

const upperCase = (character: string): string => character.toUpperCase()

function digits(options: DigitsMaskOptions = {}): Mask {
  const { length } = options
  return createMask({
    type: 'regexp',
    expression: length === undefined ? /^\d*$/ : new RegExp(`^\\d{0,${length}}$`),
    allowed: 'digits',
    complete: length === undefined ? /^\d+$/ : new RegExp(`^\\d{${length}}$`),
    attributes: { inputMode: 'numeric', spellCheck: false },
  })
}

function letters(): Mask {
  return createMask({
    type: 'regexp',
    expression: /^[\p{L}\p{M}]*$/u,
    allowed: 'letters',
    attributes: { inputMode: 'text' },
  })
}

function lettersAndDigits(): Mask {
  return createMask({
    type: 'regexp',
    expression: /^[\p{L}\p{M}0-9]*$/u,
    allowed: 'lettersAndDigits',
    attributes: { inputMode: 'text', spellCheck: false },
  })
}

function number(options: NumberMaskOptions = {}): Mask {
  // iOS's numeric keypads have no minus sign, so a mask that allows one asks for the text keypad.
  const inputMode = options.allowNegative
    ? 'text'
    : (options.decimals ?? 0) > 0
      ? 'decimal'
      : 'numeric'
  return createMask({
    type: 'number',
    ...options,
    attributes: { inputMode, spellCheck: false },
  })
}

/**
 * Sweden: ten or twelve digits, with `-` or `+` before the last four. A separator the user types
 * after six or eight digits decides the form. Without one, the number stays plain up to ten
 * digits, and the eleventh digit makes it the twelve-digit form with `-` (the plain form of
 * 19900101-1234 is 199001011234, and `YYMMDD-NNNN` has only ten digits).
 */
function resolveSwedishPersonalIdentityNumber(value: string): PatternMaskDefinition {
  const separatorIndex = value.search(/[-+]/)
  if (separatorIndex >= 0) {
    const digitsBefore = value.slice(0, separatorIndex).replace(/\D/g, '').length
    if (digitsBefore === 6 || digitsBefore === 8) {
      return {
        type: 'pattern',
        pattern: `${'9'.repeat(digitsBefore)}${value.charAt(separatorIndex)}9999`,
      }
    }
  }
  const digitCount = value.replace(/\D/g, '').length
  return digitCount >= 11
    ? { type: 'pattern', pattern: '99999999-9999' }
    : { type: 'pattern', pattern: '9'.repeat(12), completeLengths: [10, 12] }
}

const finnishPersonalIdentityNumberTokens: readonly Token[] = [
  ...compilePattern('999999', undefined),
  // The century sign: + (1800s), - and U to Y (1900s), A to F (2000s). Since 2023.
  {
    kind: 'class',
    allowed: 'other',
    normalize: upperCase,
    test: (character) => /^[+\-A-FU-Y]$/.test(character),
    takesMarks: false,
  },
  ...compilePattern('999', undefined),
  // The check character: a digit or a letter, without G, I, O, Q and Z.
  {
    kind: 'class',
    allowed: 'other',
    normalize: upperCase,
    test: (character) => /^[0-9A-FHJ-NPR-Y]$/.test(character),
    takesMarks: false,
  },
]

function personalIdentityNumber({ country }: CountryMaskOptions): Mask {
  switch (country) {
    case 'SE':
      return createMask({
        type: 'function',
        resolve: resolveSwedishPersonalIdentityNumber,
        attributes: identifierAttributes,
      })
    case 'FI':
      return createMaskFromEngine(
        createTokenEngine({
          tokens: finnishPersonalIdentityNumberTokens,
          attributes: {
            inputMode: 'text',
            autoCapitalize: 'characters',
            spellCheck: false,
            dir: 'ltr',
          },
        }),
      )
    case 'NO':
      return createMask({
        type: 'pattern',
        pattern: '9'.repeat(11),
        attributes: identifierAttributes,
      })
  }
}

function postalCode({ country }: CountryMaskOptions): Mask {
  const pattern = { SE: '999 99', FI: '99999', NO: '9999' }[country]
  return createMask({ type: 'pattern', pattern, attributes: identifierAttributes })
}

function organisationNumber({ country }: CountryMaskOptions): Mask {
  const pattern = { SE: '999999-9999', FI: '9999999-9', NO: '999 999 999' }[country]
  return createMask({ type: 'pattern', pattern, attributes: identifierAttributes })
}

/** Up to 34 letters and digits in groups of four, in upper case. Complete at the country's length. */
function iban(): Mask {
  const tokens: Token[] = []
  for (let position = 0; position < 34; position += 1) {
    if (position > 0 && position % 4 === 0) tokens.push({ kind: 'literal', character: ' ' })
    tokens.push({
      kind: 'class',
      allowed: 'lettersAndDigits',
      normalize: upperCase,
      test: (character) => /^[0-9A-Z]$/.test(character),
      takesMarks: false,
    })
  }
  return createMaskFromEngine(
    createTokenEngine({
      tokens,
      isComplete: (unmaskedValue) =>
        ibanLengths[unmaskedValue.slice(0, 2)] === unmaskedValue.length,
      attributes: {
        inputMode: 'text',
        autoCapitalize: 'characters',
        spellCheck: false,
        dir: 'ltr',
      },
    }),
  )
}

/** A filter that only drops whitespace. An email address has no fixed shape (ADR-0032). */
function email(): Mask {
  return createMask({
    type: 'regexp',
    expression: /^\S*$/u,
    attributes: { inputMode: 'email', autoCapitalize: 'off', spellCheck: false, dir: 'ltr' },
  })
}

/** A filter for digits, `+`, space, `-`, `(` and `)`. There is no national format (ADR-0032). */
function telephone(): Mask {
  return createMask({
    type: 'regexp',
    expression: /^[0-9+\-() ]*$/,
    attributes: { inputMode: 'tel', spellCheck: false, dir: 'ltr' },
  })
}

export type PatternMaskOptions = Omit<PatternMaskDefinition, 'type' | 'pattern'>
export type RegexpMaskOptions = Omit<RegexpMaskDefinition, 'type' | 'expression'>

function pattern(source: string, options: PatternMaskOptions = {}): Mask {
  return createMask({ type: 'pattern', pattern: source, ...options })
}

function regexp(expression: RegExp, options: RegexpMaskOptions = {}): Mask {
  return createMask({ type: 'regexp', expression, ...options })
}

const oneTimeCodeSymbols = '9*aA&'

const upperCaseAscii = (character: string): string =>
  character >= 'a' && character <= 'z' ? character.toUpperCase() : character

// ASCII only (ADR-0045, item 4): a code is an identifier, so å, ø and đ are not letters here.
const oneTimeCodeTokens: Record<string, ClassToken> = {
  '9': { kind: 'class', allowed: 'digits', test: (c) => /^[0-9]$/.test(c), takesMarks: false },
  '*': {
    kind: 'class',
    allowed: 'lettersAndDigits',
    test: (c) => /^[0-9A-Za-z]$/.test(c),
    takesMarks: false,
  },
  a: { kind: 'class', allowed: 'letters', test: (c) => /^[A-Za-z]$/.test(c), takesMarks: false },
  A: {
    kind: 'class',
    allowed: 'letters',
    normalize: upperCaseAscii,
    test: (c) => /^[A-Z]$/.test(c),
    takesMarks: false,
  },
  '&': {
    kind: 'class',
    allowed: 'lettersAndDigits',
    normalize: upperCaseAscii,
    test: (c) => /^[0-9A-Z]$/.test(c),
    takesMarks: false,
  },
}

/** Throws a `RangeError` that names the character and its position (counting from 0). */
function assertOneTimeCodePattern(source: string): void {
  const where = (index: number): string =>
    `"${source.charAt(index)}" at position ${index} in the pattern "${source}"`
  let hasCharacterSymbol = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source.charAt(index)
    if (oneTimeCodeSymbols.includes(character)) {
      hasCharacterSymbol = true
    } else if (character === '-') {
      if (index === 0 || index === source.length - 1) {
        throw new RangeError(
          `masks.oneTimeCode: the separator ${where(index)} must sit between two character symbols, not first or last.`,
        )
      }
      if (source.charAt(index - 1) === '-') {
        throw new RangeError(
          `masks.oneTimeCode: the separator ${where(index)} follows another "-". Use one between groups.`,
        )
      }
    } else {
      throw new RangeError(
        `masks.oneTimeCode: unknown character ${where(index)}. Use 9 * a A & for characters and - between groups.`,
      )
    }
  }
  if (!hasCharacterSymbol) {
    throw new RangeError(
      `masks.oneTimeCode: the pattern "${source}" has no character symbol. Use at least one of 9 * a A &.`,
    )
  }
}

/**
 * A one-time code shaped by `pattern` (ADR-0045): `9` digit, `*` letter or digit, `a` letter, `A`
 * and `&` the same in upper case, `-` a separator. Typing, paste and autofill all end as the
 * pattern's value (`ABCD1234` and `ABCD-1234` both become `ABCD-1234`). A pattern that is invalid
 * throws a `RangeError`: it is a literal in your code, so it fails in development.
 */
function oneTimeCode({ pattern: source }: OneTimeCodeMaskOptions): Mask {
  assertOneTimeCodePattern(source)
  const tokens: Token[] = [...source].map((symbol): Token => {
    const token = oneTimeCodeTokens[symbol]
    return token ?? { kind: 'literal', character: symbol }
  })
  const symbols = [...source].filter((symbol) => symbol !== '-')
  const isAllDigits = symbols.every((symbol) => symbol === '9')
  const isCaseless = symbols.every((symbol) => symbol !== 'a' && symbol !== '*')
  return createMaskFromEngine(
    createTokenEngine({
      tokens,
      attributes: {
        inputMode: isAllDigits ? 'numeric' : 'text',
        ...(isCaseless ? { autoCapitalize: 'characters' } : {}),
        spellCheck: false,
        dir: 'ltr',
      },
    }),
  )
}

/** Presets (ADR-0032, item 3). Every one returns a `Mask` of pure functions. */
export const masks = {
  digits,
  letters,
  lettersAndDigits,
  number,
  personalIdentityNumber,
  postalCode,
  organisationNumber,
  iban,
  email,
  telephone,
  pattern,
  regexp,
  oneTimeCode,
}
