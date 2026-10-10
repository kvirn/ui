'use client'
import type { MaskInput } from '@kvirn-ui/core'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldGroupContext, FieldTextHostContext } from '../field/field-context.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { TextInput } from '../text-input/text-input.tsx'
import type { TextInputProps } from '../text-input/text-input.tsx'
import { useAddressInput } from './use-address-input.ts'
import type { AddressInputPart, UseAddressInputResult } from './use-address-input.ts'

export type { AddressInputPart, UseAddressInputOptions } from './use-address-input.ts'

export interface AddressInputRootProps extends ComponentPropsWithRef<'div'> {
  /**
   * The address's country, as an ISO 3166-1 alpha-2 code. It picks the postal code's mask and
   * width: `SE`, `FI` and `NO` have a mask, any other country takes letters and digits.
   * Default: the provider's `country`, else the one the locale implies.
   */
  country?: string | undefined
  /**
   * `'off'` turns every part off (someone else's address). Anything else, such as
   * `'section-postal'` or `'shipping'`, goes before each part's token. A part's own
   * `autoComplete` wins.
   */
  autoComplete?: string | undefined
}

export interface AddressInputLineProps extends Omit<
  TextInputProps,
  'type' | 'mask' | 'announceRejections' | 'messages'
> {}

export type AddressInputLine1Props = AddressInputLineProps
export type AddressInputLine2Props = AddressInputLineProps
export type AddressInputCityProps = AddressInputLineProps

export interface AddressInputPostalCodeProps extends Omit<TextInputProps, 'type' | 'mask'> {
  /**
   * Replaces the country's mask. `false`: no mask, the box takes what is typed. Your own mask's
   * `inputMode` and `dir` win over the country's.
   */
  mask?: MaskInput | false | undefined
}

type AddressInputContextValue = Pick<UseAddressInputResult, 'getInputProps' | 'postalCodeMask'>

const AddressInputContext = createContext<AddressInputContextValue | null>(null)

/**
 * An address of one text box per line (contract: address-input.a11y.md). Put it in a plain
 * `Fieldset.Root` whose `Fieldset.Legend` names the address, and each part in its own
 * `Field.Root` with a `Field.Label`, so a line has its own help text and error. It holds no form
 * state, never looks an address up, never moves focus when a box is full and never rewrites a
 * typed value when `country` changes. It has no text of its own: every label, help text and
 * error is yours.
 *
 * @example
 * <Fieldset.Root>
 *   <Fieldset.Legend>Din adress</Fieldset.Legend>
 *   <AddressInput.Root country="SE">
 *     <Field.Root required>
 *       <Field.Label>Gatuadress</Field.Label>
 *       <AddressInput.Line1 name="line1" />
 *     </Field.Root>
 *     <Field.Root required>
 *       <Field.Label>Postnummer</Field.Label>
 *       <AddressInput.PostalCode name="postalCode" />
 *       <Field.HelpText>Till exempel 123 45</Field.HelpText>
 *     </Field.Root>
 *   </AddressInput.Root>
 * </Fieldset.Root>
 */
export function AddressInputRoot({
  country,
  autoComplete,
  children,
  ref,
  ...otherProps
}: AddressInputRootProps): ReactElement {
  const address = useAddressInput({ country, autoComplete })
  const host = useContext(FieldTextHostContext)
  const isInGroup = useContext(FieldGroupContext)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    if (elementRef.current?.closest('fieldset, [role="group"], [role="radiogroup"]') === null) {
      warnOnce(
        'address-input-outside-fieldset',
        'An AddressInput.Root is not inside a group, so its boxes have no shared name (WCAG 1.3.1, 3.3.2). Put it in <Fieldset.Root> with a <Fieldset.Legend> such as "Your address".',
      )
    }
  })

  const isInGroupFieldset = host !== null && isInGroup
  useEffect(() => {
    if (isInGroupFieldset) {
      warnOnce(
        'address-input-in-group-fieldset',
        'An AddressInput.Root is in a `group` Fieldset, so no box can show "(optional)" (WCAG 3.3.2). An address is four answers: use a plain <Fieldset.Root> and one Field per line.',
      )
    }
  }, [isInGroupFieldset])

  const contextValue: AddressInputContextValue = {
    getInputProps: address.getInputProps,
    postalCodeMask: address.postalCodeMask,
  }

  return (
    <AddressInputContext.Provider value={contextValue}>
      <div {...mergeProps(otherProps, address.rootProps)} ref={mergedRef}>
        {children}
      </div>
    </AddressInputContext.Provider>
  )
}
AddressInputRoot.displayName = 'AddressInput.Root'

interface AddressInputBoxProps extends Omit<TextInputProps, 'type' | 'mask'> {
  part: AddressInputPart
  mask?: MaskInput | false | undefined
}

function AddressInputBox({ part, mask, ref, ...inputProps }: AddressInputBoxProps): ReactElement {
  const root = useContext(AddressInputContext)
  // Outside a Root the part still has its token and keyboard, with the locale's country.
  const fallback = useAddressInput()
  const address = root ?? fallback

  useEffect(() => {
    if (root === null) {
      warnOnce(
        'address-input-part-outside-root',
        'An AddressInput.Line1, .Line2, .PostalCode or .City is outside an AddressInput.Root, so it has no country or autocomplete prefix from it. Put the parts in <AddressInput.Root> inside a <Fieldset.Root> (WCAG 1.3.1, 1.3.5).',
      )
    }
  }, [root])

  const { className, autoComplete, spellCheck, autoCorrect, inputMode, autoCapitalize, dir } =
    address.getInputProps(part)
  const hasOwnMask = mask !== undefined && mask !== false
  // The country's attributes yield to your own mask's, which TextInput sets from the mask.
  const ownProps = hasOwnMask
    ? { className, autoComplete }
    : { className, autoComplete, spellCheck, autoCorrect, inputMode, autoCapitalize, dir }
  const resolvedMask =
    part !== 'postalCode' || mask === false ? undefined : (mask ?? address.postalCodeMask)

  return <TextInput {...mergeProps(ownProps, inputProps)} mask={resolvedMask} ref={ref} />
}

/** The street address: `autocomplete="address-line1"`, no spell-check and no autocorrect. */
export function AddressInputLine1(props: AddressInputLine1Props): ReactElement {
  return <AddressInputBox {...props} part="line1" />
}
AddressInputLine1.displayName = 'AddressInput.Line1'

/** The second line (c/o, a flat): `autocomplete="address-line2"`. Optional in most services. */
export function AddressInputLine2(props: AddressInputLine2Props): ReactElement {
  return <AddressInputBox {...props} part="line2" />
}
AddressInputLine2.displayName = 'AddressInput.Line2'

/**
 * The postal code: `autocomplete="postal-code"`, the Root's country's mask, width and keyboard.
 * A country without a mask takes letters and digits, in upper case, ten characters wide.
 */
export function AddressInputPostalCode(props: AddressInputPostalCodeProps): ReactElement {
  return <AddressInputBox {...props} part="postalCode" />
}
AddressInputPostalCode.displayName = 'AddressInput.PostalCode'

/** The town or city: `autocomplete="address-level2"`. Never derived from the postal code. */
export function AddressInputCity(props: AddressInputCityProps): ReactElement {
  return <AddressInputBox {...props} part="city" />
}
AddressInputCity.displayName = 'AddressInput.City'

/**
 * An address of one text box per line: `AddressInput.Root` is the layout, with `.Line1`, `.Line2`,
 * `.PostalCode` and `.City` inside it, each in your own Field.
 */
export const AddressInput = {
  Root: AddressInputRoot,
  Line1: AddressInputLine1,
  Line2: AddressInputLine2,
  PostalCode: AddressInputPostalCode,
  City: AddressInputCity,
} as const
