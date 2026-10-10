import type { MaskCountry, MaskInput } from '@kvirn-ui/core'
import { useLocale } from '../provider/use-locale.ts'

export type AddressInputPart = 'line1' | 'line2' | 'postalCode' | 'city'

export interface UseAddressInputOptions {
  /**
   * The address's country, as an ISO 3166-1 alpha-2 code (`SE`, `FI`, `NO`, `DE`). It picks the
   * postal code's mask and width. Default: the provider's `country`, else the one the locale
   * implies. It is the address's country, not the page's.
   */
  country?: string | undefined
  /**
   * `'off'` turns every part off. Anything else goes before each part's token, as the HTML
   * autofill detail tokens do: `'section-postal'`, `'shipping'`, `'billing'` or
   * `'section-postal shipping'`. Default: the plain tokens.
   */
  autoComplete?: string | undefined
}

/** Spread on the `<div>` that holds the parts. */
export interface AddressInputRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-address-input`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-address-input'
}

/** Spread on the `<input>` of one part, next to the Field's `controlProps`. */
export interface AddressInputInputPartProps {
  /** `kv-address-input-line1`, `-line2`, `-postal-code` or `-city`, and the postal code's width class. */
  className: string
  /** The part's token, with the Root's prefix, or `off`. */
  autoComplete: string
  /** Line 1, line 2 and city: a street or a town is not a word to correct. */
  spellCheck?: false
  autoCorrect?: 'off'
  /** Postal code only: `numeric` with a mask, else `text`. */
  inputMode?: 'numeric' | 'text'
  /** Postal code with no mask: letters are upper case. */
  autoCapitalize?: 'characters'
  /** Postal code only: the code is read left to right in every direction. */
  dir?: 'ltr'
}

export interface UseAddressInputResult {
  /** The country that applies, upper case, or `undefined` when neither the option, the provider nor the locale says. */
  country: string | undefined
  /**
   * The postal code's mask for the country: `{ preset: 'postal-code', country }` for SE, FI and
   * NO, `undefined` for any other country. Give it to `<TextInput mask>` or `useMaskedInput`.
   */
  postalCodeMask: MaskInput | undefined
  rootProps: AddressInputRootPartProps
  getInputProps: (part: AddressInputPart) => AddressInputInputPartProps
}

const rootProps: AddressInputRootPartProps = Object.freeze({ className: 'kv-address-input' })

const tokens = {
  line1: 'address-line1',
  line2: 'address-line2',
  postalCode: 'postal-code',
  city: 'address-level2',
} as const

const classNames = {
  line1: 'kv-address-input-line1',
  line2: 'kv-address-input-line2',
  postalCode: 'kv-address-input-postal-code',
  city: 'kv-address-input-city',
} as const

/** The box is the format hint: the characters of the longest postal code the country writes. */
const postalCodeWidths = { SE: 6, FI: 6, NO: 4 } as const satisfies Record<MaskCountry, number>

function isMaskCountry(country: string | undefined): country is MaskCountry {
  return country === 'SE' || country === 'FI' || country === 'NO'
}

/**
 * An address made of one text box per line, for your own markup (contract:
 * address-input.a11y.md): the autofill tokens, and the postal code's mask, width and keyboard
 * for the country. It holds no value, never looks an address up and never moves focus. Wrap the
 * parts in a plain `<fieldset>` with a `<legend>`, each in its own Field. Changing `country`
 * never rewrites what was typed.
 *
 * @example
 * const address = useAddressInput({ country: 'SE' })
 * <Fieldset.Root>
 *   <Fieldset.Legend>Din adress</Fieldset.Legend>
 *   <div {...address.rootProps}>
 *     <Field.Root>
 *       <Field.Label>Postnummer</Field.Label>
 *       <TextInput {...address.getInputProps('postalCode')} mask={address.postalCodeMask} />
 *     </Field.Root>
 *   </div>
 * </Fieldset.Root>
 */
export function useAddressInput({
  country,
  autoComplete,
}: UseAddressInputOptions = {}): UseAddressInputResult {
  const { country: defaultCountry } = useLocale()
  const resolved = country?.toUpperCase() ?? defaultCountry
  const maskCountry = isMaskCountry(resolved) ? resolved : undefined

  const getInputProps = (part: AddressInputPart): AddressInputInputPartProps => {
    const token = tokens[part]
    const autoCompleteValue =
      autoComplete === 'off'
        ? 'off'
        : autoComplete === undefined
          ? token
          : `${autoComplete} ${token}`
    if (part !== 'postalCode') {
      return {
        className: classNames[part],
        autoComplete: autoCompleteValue,
        spellCheck: false,
        autoCorrect: 'off',
      }
    }
    return maskCountry === undefined
      ? {
          className: `${classNames.postalCode} kv-input--width-10`,
          autoComplete: autoCompleteValue,
          inputMode: 'text',
          autoCapitalize: 'characters',
          dir: 'ltr',
        }
      : {
          className: `${classNames.postalCode} kv-input--numeric kv-input--width-${postalCodeWidths[maskCountry]}`,
          autoComplete: autoCompleteValue,
          inputMode: 'numeric',
          dir: 'ltr',
        }
  }

  return {
    country: resolved,
    postalCodeMask:
      maskCountry === undefined ? undefined : { preset: 'postal-code', country: maskCountry },
    rootProps,
    getInputProps,
  }
}
