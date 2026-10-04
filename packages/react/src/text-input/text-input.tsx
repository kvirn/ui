'use client'
import type { Mask } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMaskedInput } from '../mask/use-mask.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useTextInput } from './use-text-input.ts'
import type { TextInputChangeDetails, TextInputType } from './use-text-input.ts'

export type { TextInputChangeDetails, TextInputType } from './use-text-input.ts'

/** What `render` receives as its second argument. */
export interface TextInputState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface TextInputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'defaultValue'
> {
  /** Default `'text'`. Never `number` or `date`. */
  type?: TextInputType | undefined
  /** Controlled: the value from your form state. */
  value?: string | undefined
  /** Uncontrolled: the native input keeps the value, and a form submit sends it. */
  defaultValue?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: string, details: TextInputChangeDetails) => void) | undefined
  /**
   * Shapes what the user types: a preset from `masks`, or your own. The input stays
   * native, so paste, autofill and undo work. `onValueChange` then also gets `unmaskedValue`,
   * `isComplete`, `isWithinRange` (number masks) and `rejected`. Put the format in a hint, a
   * `<Prose>` in the Field (3.3.2).
   */
  mask?: Mask | undefined
  /**
   * With a `mask`: announce, politely and at most once every few seconds, when it drops
   * characters. Default `true`. Needs a `KvirnProvider`: without one nothing is announced.
   */
  announceRejections?: boolean | undefined
  /** With a `mask`: per-instance overrides for the rejection announcements. */
  messages?: Partial<KvirnMessages['mask']> | undefined
  render?: RenderProp<ComponentPropsWithRef<'input'>, TextInputState> | undefined
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
 * A native text `<input>`, wired to its Field: the label names it, and the hint and error
 * describe it (contract: text-input.a11y.md). It holds no form state: pass `value` and
 * `onValueChange`, or `defaultValue` and `name` for a plain form, or spread your form library's
 * props. For a quantity or an amount, use NumberInput.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Antal barn</Field.Label>
 *   <TextInput name="children" inputMode="numeric" spellCheck={false} className="kv-input--width-2" />
 * </Field.Root>
 */
export function TextInput({
  type,
  disabled,
  onValueChange,
  mask,
  announceRejections,
  messages,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: TextInputProps): ReactElement {
  const field = useContext(FieldContext)
  // With a mask the mask's handler reports, so `onValueChange` is called once, with its details.
  const input = useTextInput({
    type,
    disabled,
    onValueChange: mask === undefined ? onValueChange : undefined,
  })
  const maskInput = useMaskedInput({ mask, onValueChange, announceRejections, messages })
  const elementRef = useRef<HTMLInputElement | null>(null)
  const { ref: maskRef, ...maskProps } = maskInput.inputProps
  const { inputMode, autoCapitalize, spellCheck, dir, ...maskHandlers } = maskProps
  const mergedRef = useMergedRef(useMergedRef(ref, maskRef), elementRef)

  useEffect(() => {
    if (field !== null && id !== undefined) {
      warnOnce(
        'text-input-id-in-field',
        `A TextInput inside a Field got id="${id}", which is ignored so the Field's label and hint stay linked. Set the id with controlId on Field.Root.`,
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
        'text-input-in-field-without-label',
        'A TextInput in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else {
      warnOnce(
        'text-input-without-name',
        'A TextInput has no accessible name. A placeholder isn’t a label: it disappears when the user types (WCAG 3.3.2). Put it in a Field with a Field.Label, or give it aria-labelledby.',
      )
    }
  })

  const hasDescriptionText = ownDescribedBy !== undefined
  const controlId = field?.controlProps.id
  useEffect(() => {
    const element = elementRef.current
    if (mask === undefined || element === null) {
      return
    }
    if (type === 'email' && mask.attributes.inputMode !== 'email') {
      warnOnce(
        'text-input-mask-on-email',
        'A mask other than masks.email() is on a TextInput with type="email". The browser has no selection API for it, so the caret can’t be kept while the mask rewrites the value. Use type="text" with inputMode="email", or masks.email().',
      )
    }
    if (controlId !== undefined && !hasDescriptionText) {
      const prefix = `${controlId}-description`
      if (element.ownerDocument.querySelector(`[id^="${CSS.escape(prefix)}"]`) === null) {
        warnOnce(
          'text-input-mask-without-description',
          'A masked TextInput in a Field has no hint. The mask shapes what is typed, but it doesn’t explain the format: say it in a visible hint, a <Field.Hint> under the control, with an example (WCAG 3.3.2).',
        )
      }
    }
  })

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(input.inputProps['aria-describedby'], ownDescribedBy)

  return renderPart({
    render,
    defaultElement: 'input',
    partProps: {
      // The mask's suggested attributes come first, so your own props win.
      ...mergeProps(
        mask === undefined ? {} : { inputMode, autoCapitalize, spellCheck, dir },
        otherProps,
        ownId,
        input.inputProps,
        mask === undefined ? {} : maskHandlers,
      ),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
    state: {
      isInvalid: input.isInvalid,
      isRequired: input.isRequired,
      isDisabled: input.isDisabled,
      isFocusVisible: input.isFocusVisible,
    },
  })
}
TextInput.displayName = 'TextInput'
