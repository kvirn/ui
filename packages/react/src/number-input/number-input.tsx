'use client'
import type { MaskInput } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import type { TextInputChangeDetails } from '../text-input/use-text-input.ts'
import { useNumberInput } from './use-number-input.ts'

/** What `render` receives as its second argument. */
export interface NumberInputState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface NumberInputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'defaultValue' | 'min' | 'max'
> {
  /** Controlled: the value from your form state, as shown (`1 250,50`). */
  value?: string | undefined
  /** Uncontrolled: the native input keeps the value, and a form submit sends it as shown. */
  defaultValue?: string | undefined
  /**
   * Reports each change, with `{ reason: 'input', event }` and the mask details:
   * `unmaskedValue` (the machine form, `-1234.5`), `isWithinRange`, `isComplete` and `rejected`.
   * `onChange` still works too.
   */
  onValueChange?: ((value: string, details: TextInputChangeDetails) => void) | undefined
  /** Digits after the decimal mark. Default 0: no decimal mark is accepted. */
  decimals?: number | undefined
  /** Accept a leading minus sign. Default `false`. */
  allowNegative?: boolean | undefined
  /** Group the whole digits in threes with the provider's separator. Default `false`. */
  grouping?: boolean | undefined
  /** Lower limit. Reported as `isWithinRange`, never clamped, and never a `min` attribute. */
  min?: number | undefined
  /** Upper limit. Reported as `isWithinRange`, never clamped, and never a `max` attribute. */
  max?: number | undefined
  /**
   * Replaces the number mask. `false`: no mask, a plain numeric text box that leaves nothing out
   * and reports no mask details (`decimals`, `allowNegative`, `grouping`, `min` and `max` then do
   * nothing, but the keypad still follows `decimals` and `allowNegative`). A name, `{ preset }`,
   * `{ pattern }`, a `RegExp` or a finished mask from `masks` shapes the value instead, and then
   * `details.unmaskedValue` is that mask's. Default: the number mask from the props above.
   */
  mask?: MaskInput | false | undefined
  /**
   * Announce, politely and at most once every few seconds, when a character is left out.
   * Default `true`. Needs a `KvirnProvider`: without one nothing is announced.
   */
  announceRejections?: boolean | undefined
  /** Per-instance overrides for the rejection announcements. */
  messages?: Partial<KvirnMessages['mask']> | undefined
  render?: RenderProp<ComponentPropsWithRef<'input'>, NumberInputState> | undefined
}

function hasNameSource(input: HTMLInputElement): boolean {
  return (
    input.hasAttribute('aria-label') ||
    input.hasAttribute('aria-labelledby') ||
    input.hasAttribute('title') ||
    (input.labels?.length ?? 0) > 0
  )
}

/**
 * A quantity or an amount: a native text box that takes digits, and the decimal mark of the page's
 * language, and leaves everything else out. It is not a `spinbutton`: no stepping with the arrow
 * keys, no spinner buttons, no `type="number"` (contract: number-input.a11y.md). It holds no form
 * state: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.
 *
 * For codes with leading zeros (postcodes, case numbers) use a TextInput with a mask.
 *
 * @example
 * <Field.Root required>
 *   <Field.Label>Hur mycket hyra betalar du per månad?</Field.Label>
 *   <NumberInput name="rent" decimals={2} grouping min={0} className="kv-input--width-10" />
 *   <Field.HelpText>I kronor, till exempel 1 250,50.</Field.HelpText>
 * </Field.Root>
 */
export function NumberInput({
  decimals,
  allowNegative,
  grouping,
  min,
  max,
  mask,
  disabled,
  onValueChange,
  announceRejections,
  messages,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: NumberInputProps): ReactElement {
  const field = useContext(FieldContext)
  const number = useNumberInput({
    decimals,
    allowNegative,
    grouping,
    min,
    max,
    mask,
    disabled,
    onValueChange,
    announceRejections,
    messages,
  })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const { ref: maskRef, inputMode, spellCheck, ...inputProps } = number.inputProps
  const mergedRef = useMergedRef(useMergedRef(ref, maskRef), elementRef)

  useEffect(() => {
    if (field !== null && id !== undefined) {
      warnOnce(
        'number-input-id-in-field',
        `A NumberInput inside a Field got id="${id}", which is ignored so the Field's label and help text stay linked. Set the id with controlId on Field.Root.`,
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
        'number-input-in-field-without-label',
        'A NumberInput in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else {
      warnOnce(
        'number-input-without-name',
        'A NumberInput has no accessible name. A placeholder isn’t a label: it disappears when the user types (WCAG 3.3.2). Put it in a Field with a Field.Label, or give it aria-labelledby.',
      )
    }
  })

  const hasDescriptionText = ownDescribedBy !== undefined
  const controlId = field?.controlProps.id
  // `decimals` only shapes the number mask: with your own mask, or `false`, there is no decimal mark.
  const hasDecimals = mask === undefined && (decimals ?? 0) > 0
  // Your own mask shapes what is typed, and like a masked TextInput it needs a help text (3.3.2).
  const hasOwnMask = mask !== undefined && mask !== false
  useEffect(() => {
    const element = elementRef.current
    if (
      !(hasDecimals || hasOwnMask) ||
      element === null ||
      controlId === undefined ||
      hasDescriptionText
    ) {
      return
    }
    // A whole number needs no format help text. The decimal mark does: it is a comma in some languages
    // and a point in others, so say it with an example.
    const prefix = `${controlId}-description`
    if (element.ownerDocument.querySelector(`[id^="${CSS.escape(prefix)}"]`) === null) {
      if (hasDecimals) {
        warnOnce(
          'number-input-decimals-without-help-text',
          'A NumberInput with decimals in a Field has no help text. The mask takes the decimal mark of the page’s language, but it doesn’t say so: add a visible help text, a <Field.HelpText> under the control, with an example such as 1 250,50 (WCAG 3.3.2).',
        )
      } else {
        warnOnce(
          'number-input-mask-without-description',
          'A NumberInput with its own mask in a Field has no help text. The mask shapes what is typed, but it doesn’t explain the format: say it in a visible help text, a <Field.HelpText> under the control, with an example (WCAG 3.3.2).',
        )
      }
    }
  })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(inputProps['aria-describedby'], ownDescribedBy)

  return renderPart({
    render,
    defaultElement: 'input',
    partProps: {
      // The mask's suggested attributes come first, so your own props win. The handlers chain.
      ...mergeProps({ inputMode, spellCheck }, otherProps, ownId, inputProps),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
    state: {
      isInvalid: number.isInvalid,
      isRequired: number.isRequired,
      isDisabled: number.isDisabled,
      isFocusVisible: number.isFocusVisible,
    },
  })
}
NumberInput.displayName = 'NumberInput'
