'use client'
import type { MaskInput } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent, ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldContextValue } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useListboxNative } from '../listbox/use-listbox-native.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useLocale } from '../provider/use-locale.ts'
import type { TextInputChangeDetails } from '../text-input/use-text-input.ts'
import { countryOptions } from './country-options.ts'
import { defaultPhoneMask, usePhoneInput } from './use-phone-input.ts'
import { usePhoneInputRoot } from './use-phone-input-root.ts'
import type { UsePhoneInputRootOptions } from './use-phone-input-root.ts'

export type { PhoneInputCountryChangeDetails } from './use-phone-input-root.ts'

export interface PhoneInputChangeDetails extends TextInputChangeDetails {
  /** The country that applies to the number (`SE`), or `undefined` when none resolves. */
  country: string | undefined
  /** Its calling code, digits only (`46`). The number is never prefixed with it. */
  callingCode: string | undefined
}

export interface PhoneInputRootProps
  extends ComponentPropsWithRef<'div'>, UsePhoneInputRootOptions {}

export interface PhoneInputCountryProps extends Omit<
  ComponentPropsWithRef<'select'>,
  'value' | 'defaultValue' | 'children'
> {}

interface PhoneInputContextValue {
  country: string | undefined
  callingCode: string | undefined
  selectCountry: ReturnType<typeof usePhoneInputRoot>['selectCountry']
  hasCountryPart: boolean
  registerCountryPart: () => () => void
  /** The Field the Root sits in, if any: a Country part in the same Field has no wiring of its own. */
  rootField: FieldContextValue | null
}

const PhoneInputContext = createContext<PhoneInputContextValue | null>(null)

export interface PhoneInputNumberProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'defaultValue'
> {
  /** Controlled: the value from your form state, as the user wrote it (`+46 70-174 06 05`). */
  value?: string | undefined
  /** Uncontrolled: the native input keeps the value, and a form submit sends it as written. */
  defaultValue?: string | undefined
  /**
   * Reports each change, with `{ reason: 'input', event, country, callingCode }`. `value` is the
   * text as shown: it is never formatted or prefixed with the calling code. With a `mask`, the
   * mask's `unmaskedValue`, `isComplete` and `rejected` come too. `onChange` still works too.
   */
  onValueChange?: ((value: string, details: PhoneInputChangeDetails) => void) | undefined
  /**
   * Default `false`: no mask, so a correctly typed number is never refused. `'telephone'` leaves
   * out everything but digits, `+`, space, `-`, `(` and `)`, and announces it. A `{ pattern }`, a
   * `RegExp` or a finished mask from `masks` replaces it. No mask ever formats the number.
   */
  mask?: MaskInput | false | undefined
  /**
   * Announce, politely and at most once every few seconds, when a character is left out.
   * Default `true`. Needs a `KvirnProvider`: without one nothing is announced.
   */
  announceRejections?: boolean | undefined
  /** Per-instance overrides for the rejection announcements. */
  messages?: Partial<KvirnMessages['mask']> | undefined
}

function hasNameSource(input: HTMLInputElement): boolean {
  return (
    input.hasAttribute('aria-label') ||
    input.hasAttribute('aria-labelledby') ||
    input.hasAttribute('title') ||
    (input.labels?.length ?? 0) > 0
  )
}

function hasSelectNameSource(select: HTMLSelectElement): boolean {
  return (
    select.hasAttribute('aria-label') ||
    select.hasAttribute('aria-labelledby') ||
    select.hasAttribute('title') ||
    (select.labels?.length ?? 0) > 0
  )
}

/**
 * The country and the layout of a phone number with a calling-code select (contract:
 * phone-input.a11y.md). The country resolves from `country`, then the provider's, then the
 * locale's, and changing it never rewrites the number. Without a `PhoneInput.Country` inside it,
 * `PhoneInput.Number` is the plain one-box input. It has no text of its own.
 *
 * @example
 * <Fieldset.Root>
 *   <Fieldset.Legend>Telefonnummer</Fieldset.Legend>
 *   <PhoneInput.Root>
 *     <Field.Root>
 *       <Field.Label>Land</Field.Label>
 *       <PhoneInput.Country name="phoneCountry" />
 *     </Field.Root>
 *     <Field.Root required>
 *       <Field.Label>Nummer</Field.Label>
 *       <PhoneInput.Number name="phone" />
 *     </Field.Root>
 *   </PhoneInput.Root>
 * </Fieldset.Root>
 */
export function PhoneInputRoot({
  country: countryOption,
  defaultCountry,
  onCountryChange,
  children,
  ref,
  ...otherProps
}: PhoneInputRootProps): ReactElement {
  const root = usePhoneInputRoot({ country: countryOption, defaultCountry, onCountryChange })
  const rootField = useContext(FieldContext)
  const [countryPartCount, setCountryPartCount] = useState(0)
  const { country, callingCode, selectCountry } = root
  const registerCountryPart = useMemo(
    () => () => {
      setCountryPartCount((count) => count + 1)
      return () => setCountryPartCount((count) => count - 1)
    },
    [],
  )
  const hasCountryPart = countryPartCount > 0

  const contextValue = useMemo<PhoneInputContextValue>(
    () => ({
      country,
      callingCode,
      selectCountry,
      hasCountryPart,
      registerCountryPart,
      rootField,
    }),
    [country, callingCode, selectCountry, hasCountryPart, registerCountryPart, rootField],
  )

  return (
    <PhoneInputContext.Provider value={contextValue}>
      <div {...mergeProps(otherProps, root.rootProps)} ref={ref}>
        {children}
      </div>
    </PhoneInputContext.Provider>
  )
}
PhoneInputRoot.displayName = 'PhoneInput.Root'

/**
 * The calling-code select: a native `<select>` of every country, `Sverige (+46)`, the Root's
 * country first and the rest in alphabetical order. It holds no text: name it with a Field.Label
 * in its own Field.Root, or `aria-label`. `autocomplete="tel-country-code"`.
 */
export function PhoneInputCountry({
  onChange,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: PhoneInputCountryProps): ReactElement {
  const context = useContext(PhoneInputContext)
  const fallback = usePhoneInputRoot()
  const field = useContext(FieldContext)
  const { locale } = useLocale()
  const native = useListboxNative({ disabled: otherProps.disabled })
  const elementRef = useRef<HTMLSelectElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const { registerCountryPart } = context ?? {}

  useEffect(() => registerCountryPart?.(), [registerCountryPart])
  useEffect(() => {
    if (context === null) {
      warnOnce(
        'phone-input-country-outside-root',
        'A PhoneInput.Country is outside a PhoneInput.Root, so the PhoneInput.Number next to it can’t read its country. Put both in <PhoneInput.Root>.',
      )
    }
  }, [context])
  useEffect(() => {
    const element = elementRef.current
    if (element === null || hasSelectNameSource(element)) {
      return
    }
    warnOnce(
      'phone-input-country-without-name',
      'A PhoneInput.Country has no accessible name (WCAG 1.3.1, 4.1.2). Put it in its own <Field.Root> with a <Field.Label>, or give it aria-label.',
    )
  })

  const { country, selectCountry } = context ?? fallback
  const options = useMemo(() => countryOptions(locale, country), [locale, country])
  const hasCountry = options.some((option) => option.country === country)
  // A Country in the Number's own Field shares its id, description and error: it keeps only the
  // disabled state and takes its name from aria-label.
  const isSharingField = field !== null && field === context?.rootField
  const {
    id: fieldId,
    'aria-describedby': fieldDescribedBy,
    'aria-invalid': fieldInvalid,
    'aria-required': fieldRequired,
    onChange: nativeOnChange,
    ...nativeProps
  } = native.nativeProps
  const fieldProps = isSharingField
    ? { id }
    : {
        id: field === null ? id : fieldId,
        'aria-invalid': fieldInvalid,
        'aria-required': fieldRequired,
      }
  const describedBy = joinIds(isSharingField ? undefined : fieldDescribedBy, ownDescribedBy)

  return createElement(
    'select',
    {
      ...mergeProps(
        { autoComplete: 'tel-country-code', className: 'kv-phone-input-country' },
        otherProps,
        fieldProps,
        nativeProps,
      ),
      'aria-describedby': describedBy,
      value: hasCountry ? country : '',
      onChange: (event: ChangeEvent<HTMLSelectElement>) => {
        nativeOnChange(event)
        onChange?.(event)
        selectCountry(event.currentTarget.value, event)
      },
      ref: mergedRef,
    },
    hasCountry ? null : createElement('option', { value: '', disabled: true }),
    options.map((option) => (
      <option key={option.country} value={option.country}>
        {option.label}
      </option>
    )),
  )
}
PhoneInputCountry.displayName = 'PhoneInput.Country'

/**
 * A phone number in a form: a native `<input type="tel">` with the phone keypad, no spell-check,
 * left to right and `autocomplete="tel"`, 20 characters wide. It never formats or limits what the
 * user writes, so `070-174 06 05` and `+46 (0)70 174 06 05` are kept as typed or pasted
 * (contract: phone-input.a11y.md). It holds no form state: pass `value` and `onValueChange`, or
 * `defaultValue` and `name` for a plain form. Next to a `PhoneInput.Country` it is
 * `autocomplete="tel-national"`.
 *
 * @example
 * <Field.Root controlId="phone" required>
 *   <Field.Label>Telefonnummer</Field.Label>
 *   <PhoneInput.Number name="phone" />
 *   <Field.HelpText>Om numret inte är svenskt, börja med landsnumret, till exempel +358.</Field.HelpText>
 * </Field.Root>
 */
export function PhoneInputNumber({
  mask,
  disabled,
  onValueChange,
  announceRejections,
  messages,
  id,
  'aria-describedby': ownDescribedBy,
  ref,
  ...otherProps
}: PhoneInputNumberProps): ReactElement {
  const field = useContext(FieldContext)
  const context = useContext(PhoneInputContext)
  const fallback = usePhoneInputRoot()
  const { country, callingCode } = context ?? fallback
  const hasCountryPart = context?.hasCountryPart ?? false
  const phone = usePhoneInput({
    mask,
    disabled,
    onValueChange:
      onValueChange === undefined
        ? undefined
        : (value, details) => onValueChange(value, { ...details, country, callingCode }),
    announceRejections,
    messages,
  })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const {
    ref: maskRef,
    inputMode,
    spellCheck,
    dir,
    autoComplete: fullNumberToken,
    ...inputProps
  } = phone.inputProps
  // Next to a country select the number is the national part, which is what `tel-national` stores.
  const autoComplete = hasCountryPart ? 'tel-national' : fullNumberToken
  const mergedRef = useMergedRef(useMergedRef(ref, maskRef), elementRef)

  useEffect(() => {
    if (field !== null && id !== undefined) {
      warnOnce(
        'phone-input-id-in-field',
        `A PhoneInput inside a Field got id="${id}", which is ignored so the Field's label and help text stay linked. Set the id with controlId on Field.Root.`,
      )
    }
  }, [field, id])
  useEffect(() => {
    const element = elementRef.current
    if (element === null || hasNameSource(element)) {
      return
    }
    if (field !== null) {
      warnOnce(
        'phone-input-in-field-without-label',
        'A PhoneInput in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else {
      warnOnce(
        'phone-input-without-name',
        'A PhoneInput has no accessible name. A placeholder isn’t a label: it disappears when the user types (WCAG 3.3.2). Put it in a Field with a Field.Label, or give it aria-labelledby.',
      )
    }
  })

  const hasDescriptionText = ownDescribedBy !== undefined
  const controlId = field?.controlProps.id
  // The telephone mask only leaves out letters and explains itself, like the default: no help text
  // is required. Your own mask shapes what is typed and needs one (3.3.2).
  const maskInput = mask ?? defaultPhoneMask
  const hasOwnMask = maskInput !== false && maskInput !== 'telephone'
  useEffect(() => {
    const element = elementRef.current
    if (!hasOwnMask || element === null || controlId === undefined || hasDescriptionText) {
      return
    }
    const prefix = `${controlId}-description`
    if (element.ownerDocument.querySelector(`[id^="${CSS.escape(prefix)}"]`) === null) {
      warnOnce(
        'phone-input-mask-without-description',
        'A PhoneInput with its own mask in a Field has no help text. The mask shapes what is typed, but it doesn’t explain the format: say it in a visible help text, a <Field.HelpText> under the control, with an example (WCAG 3.3.2).',
      )
    }
  })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(inputProps['aria-describedby'], ownDescribedBy)

  return createElement('input', {
    // The suggested attributes come first, so your own props win. The handlers chain.
    ...mergeProps({ inputMode, spellCheck, dir, autoComplete }, otherProps, ownId, inputProps),
    'aria-describedby': describedBy,
    ref: mergedRef,
  })
}
PhoneInputNumber.displayName = 'PhoneInput.Number'

/**
 * A phone number: `PhoneInput.Number` is the one-box input, and `PhoneInput.Root` with a
 * `PhoneInput.Country` next to it adds a calling-code select that inherits the provider's country.
 */
export const PhoneInput = {
  Root: PhoneInputRoot,
  Country: PhoneInputCountry,
  Number: PhoneInputNumber,
} as const
