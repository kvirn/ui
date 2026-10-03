/**
 * Why the mask dropped a character. The first four say what the field
 * accepts, so the message can be "Only digits can be entered here". `length` means the mask is
 * full.
 */
export type MaskRejectionReason = 'digits' | 'letters' | 'lettersAndDigits' | 'other' | 'length'

/** What a field accepts, as far as a message to the user can tell. */
export type MaskAllowedCharacters = Exclude<MaskRejectionReason, 'length'>

/** The characters the mask dropped for one reason. */
export interface MaskRejection {
  readonly reason: MaskRejectionReason
  readonly characters: string
}

/**
 * Attributes a preset suggests for the `<input>`. The consumer's own props win. A preset never sets `autocomplete`, because the right token depends on the question.
 */
export interface MaskAttributes {
  readonly inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
  readonly autoCapitalize?: 'off' | 'characters'
  readonly spellCheck?: boolean
  readonly dir?: 'ltr'
}

/**
 * Pattern tokens (as in Alpine's Mask plugin): `9` is a digit, `a` is a letter (`\p{L}` and
 * `\p{M}`, so å, ø, đ and ŋ count), `*` is a letter or a digit, `\` escapes the next character,
 * and anything else is a literal.
 */
export interface PatternMaskDefinition {
  readonly type: 'pattern'
  readonly pattern: string
  /** Changes an accepted character before it is placed, for example to upper case. */
  readonly transform?: Partial<Record<'9' | 'a' | '*', (character: string) => string>>
  /**
   * The unmasked lengths at which the value counts as complete. Default: every token filled.
   * For formats with a short and a long form, such as a Swedish personnummer (10 or 12 digits).
   */
  readonly completeLengths?: readonly number[]
  readonly attributes?: MaskAttributes
}

/**
 * Accepts a change only when the whole new value matches, so the expression must accept
 * partial values (`/^\d{0,4}$/`). A pasted value that matches as a whole is always accepted.
 */
export interface RegexpMaskDefinition {
  readonly type: 'regexp'
  readonly expression: RegExp
  /** What the expression accepts, for the rejection message. Default `other`. */
  readonly allowed?: MaskAllowedCharacters
  /** Changes a character before it is tested, for example to upper case. */
  readonly transform?: (character: string) => string
  /** Strips formatting from the value. Default: the value as it is. */
  readonly unmask?: (value: string) => string
  /**
   * Matches a complete value. Default: the value is not empty (which is loose when the
   * expression also accepts partial values).
   */
  readonly complete?: RegExp
  readonly attributes?: MaskAttributes
}

/**
 * A locale-aware number. Both `,` and `.` are accepted as typed and shown as the locale's
 * decimal separator. The unmasked value is the plain machine form (`-1234.5`). `min` and `max`
 * are reported as `isWithinRange` and never clamped.
 */
export interface NumberMaskDefinition {
  readonly type: 'number'
  /** BCP 47 locale for the separators. Default `en`. `mask.withLocale` sets it when absent. */
  readonly locale?: string
  /** Digits after the decimal separator. Default 0, which accepts no separator. */
  readonly decimals?: number
  readonly allowNegative?: boolean
  /** Group the integer digits in threes with the locale's separator. Default off. */
  readonly grouping?: boolean
  readonly min?: number
  readonly max?: number
  readonly attributes?: MaskAttributes
}

/** For formats that depend on the value, such as a 10- or 12-digit Swedish number. */
export interface FunctionMaskDefinition {
  readonly type: 'function'
  /** Called with the value as typed. Returns the definition that applies to it. */
  readonly resolve: (
    value: string,
  ) => PatternMaskDefinition | RegexpMaskDefinition | NumberMaskDefinition
  readonly attributes?: MaskAttributes
}

export type MaskDefinition =
  | PatternMaskDefinition
  | RegexpMaskDefinition
  | NumberMaskDefinition
  | FunctionMaskDefinition

export interface MaskApplyOptions {
  /** The value after the browser's edit. */
  readonly value: string
  /** The caret after the edit. Default: the end of the value. */
  readonly selectionStart?: number | null
  readonly selectionEnd?: number | null
  /** The value before the edit. Without it the whole value counts as inserted (autofill). */
  readonly previousValue?: string
  /** The InputEvent's `inputType`. `deleteContentForward` makes Delete skip over a literal. */
  readonly inputType?: string
}

export interface MaskResult {
  /** The value to show. */
  readonly value: string
  readonly selectionStart: number
  readonly selectionEnd: number
  /** The value without literals and separators. */
  readonly unmaskedValue: string
  /** The shape is complete. It doesn't mean the number exists. */
  readonly isComplete: boolean
  /** Number masks only: whether the number is within `min` and `max`. Never clamped. */
  readonly isWithinRange?: boolean
  /** `value` differs from the input value. Write back to the `<input>` only then. */
  readonly isChanged: boolean
  /** The characters the user inserted that the mask dropped, grouped by reason. */
  readonly rejected: readonly MaskRejection[]
}

/** A mask is a bundle of pure functions. It has no state and no DOM. */
export interface Mask {
  /** Attributes the preset suggests for the `<input>`. */
  readonly attributes: MaskAttributes
  apply: (options: MaskApplyOptions) => MaskResult
  /** Formats a stored (unmasked) value, for example a controlled initial value. */
  format: (unmaskedValue: string) => string
  /** Strips the literals from a formatted value. */
  unmask: (value: string) => string
  /**
   * The same mask with this locale's number separators. Returns the mask itself unless it is a
   * number mask whose definition has no `locale` of its own.
   */
  withLocale: (locale: string) => Mask
}

export type CheckResult<Reason extends string> =
  | { readonly isValid: true; readonly reason: undefined }
  | { readonly isValid: false; readonly reason: Reason }
