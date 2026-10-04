import { maskCountryFromLocale } from '../locale/mask-country.ts'
import { masks } from './masks.ts'
import type { MaskCountry, PatternMaskOptions } from './masks.ts'
import type { Mask } from './mask-types.ts'

/**
 * The names a mask is asked for by, one per preset in kebab-case. `ssi` is a short alias of
 * `personal-identity-number`. `number` is not a name: NumberInput owns it.
 */
export const maskNames = Object.freeze([
  'digits',
  'letters',
  'letters-and-digits',
  'personal-identity-number',
  'ssi',
  'organisation-number',
  'postal-code',
  'date',
  'iban',
  'email',
  'telephone',
] as const)

export type MaskName = (typeof maskNames)[number]

/** A named preset with its country set for this one instance. */
export interface MaskPresetOptions {
  readonly preset: MaskName
  /** Default: the provider's `country`, else the one the locale implies. */
  readonly country?: MaskCountry | undefined
}

/** A custom pattern (`9` digit, `a` letter, `*` letter or digit) with the pattern options. */
export interface MaskPatternOptions extends PatternMaskOptions {
  readonly pattern: string
}

/**
 * What a `mask` prop takes: a name, `{ preset, country? }`, `{ pattern, ...options }`, a
 * `RegExp` that accepts partial values, or a finished `Mask` (`masks.postalCode({ country })`).
 */
export type MaskInput = Mask | MaskName | MaskPresetOptions | MaskPatternOptions | RegExp

export interface ResolveMaskContext {
  /** BCP 47 locale: the country is read from it unless `country` is set. */
  readonly locale: string
  /** Wins over the locale. The provider's `country`. */
  readonly country?: MaskCountry | undefined
}

export interface ResolvedMask {
  readonly mask: Mask
  /**
   * Set when a country mask was asked for and no country resolved: `mask` is then `digits`, and
   * this is the name that needed the country, for the developer warning.
   */
  readonly missingCountryFor: MaskName | undefined
}

function isMask(input: MaskInput): input is Mask {
  return typeof input === 'object' && !(input instanceof RegExp) && 'apply' in input
}

function isPreset(input: MaskPresetOptions | MaskPatternOptions): input is MaskPresetOptions {
  return 'preset' in input
}

/**
 * The name a `mask` asked for when it isn't one of `maskNames`, otherwise `undefined`. The types
 * rule this out, so it is for a JavaScript user, a typo or `'number'` (NumberInput owns it): the
 * caller warns and runs no mask, because nothing is guessed. Pure, like `resolveMask`.
 */
export function unknownMaskName(input: unknown): string | undefined {
  const name =
    typeof input === 'string'
      ? input
      : typeof input === 'object' &&
          input !== null &&
          'preset' in input &&
          typeof input.preset === 'string'
        ? input.preset
        : undefined
  return name !== undefined && !maskNames.some((known) => known === name) ? name : undefined
}

function resolveName(name: MaskName, country: MaskCountry | undefined): ResolvedMask {
  switch (name) {
    case 'digits':
      return { mask: masks.digits(), missingCountryFor: undefined }
    case 'letters':
      return { mask: masks.letters(), missingCountryFor: undefined }
    case 'letters-and-digits':
      return { mask: masks.lettersAndDigits(), missingCountryFor: undefined }
    case 'date':
      return { mask: masks.date(), missingCountryFor: undefined }
    case 'iban':
      return { mask: masks.iban(), missingCountryFor: undefined }
    case 'email':
      return { mask: masks.email(), missingCountryFor: undefined }
    case 'telephone':
      return { mask: masks.telephone(), missingCountryFor: undefined }
    case 'personal-identity-number':
    case 'ssi':
      return country === undefined
        ? { mask: masks.digits(), missingCountryFor: name }
        : { mask: masks.personalIdentityNumber({ country }), missingCountryFor: undefined }
    case 'organisation-number':
      return country === undefined
        ? { mask: masks.digits(), missingCountryFor: name }
        : { mask: masks.organisationNumber({ country }), missingCountryFor: undefined }
    case 'postal-code':
      return country === undefined
        ? { mask: masks.digits(), missingCountryFor: name }
        : { mask: masks.postalCode({ country }), missingCountryFor: undefined }
  }
}

/**
 * Turns whatever a `mask` prop takes into a `Mask`. A country mask reads its country from the
 * instance (`{ preset, country }`), then `context.country` (the provider's), then the locale
 * (`sv-FI` is Finland). Nothing is guessed: with no country the mask falls back to `digits` and
 * `missingCountryFor` names the preset, so the caller can warn. `masks.*` stay the explicit form.
 */
export function resolveMask(input: MaskInput, context: ResolveMaskContext): ResolvedMask {
  if (isMask(input)) {
    return { mask: input, missingCountryFor: undefined }
  }
  if (input instanceof RegExp) {
    return { mask: masks.regexp(input), missingCountryFor: undefined }
  }
  if (typeof input === 'string') {
    return resolveName(input, context.country ?? maskCountryFromLocale(context.locale))
  }
  if (isPreset(input)) {
    return resolveName(
      input.preset,
      input.country ?? context.country ?? maskCountryFromLocale(context.locale),
    )
  }
  const { pattern, ...options } = input
  return { mask: masks.pattern(pattern, options), missingCountryFor: undefined }
}
