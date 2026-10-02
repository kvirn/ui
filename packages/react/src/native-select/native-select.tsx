'use client'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { useControlWarnings } from '../field/use-control-warnings.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useNativeSelect } from './use-native-select.ts'
import type { NativeSelectChangeDetails } from './use-native-select.ts'

export type { NativeSelectChangeDetails } from './use-native-select.ts'

/** What `render` receives as its second argument. */
export interface NativeSelectState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface NativeSelectProps extends Omit<
  ComponentPropsWithRef<'select'>,
  'value' | 'defaultValue' | 'multiple' | 'size'
> {
  /** Controlled: the chosen option's value from your form state. */
  value?: string | undefined
  /** Uncontrolled: the native select keeps the choice, and a form submit sends it. */
  defaultValue?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: string, details: NativeSelectChangeDetails) => void) | undefined
  render?: RenderProp<ComponentPropsWithRef<'select'>, NativeSelectState> | undefined
}

/**
 * A native `<select>`, wired to its Field: the label names it, and the hint and error describe
 * it (ADR-0037, item 2; contract: native-select.a11y.md). Children are plain `<option>` and
 * `<optgroup>`. It holds no form state: pass `value` and `onValueChange`, or `defaultValue` and
 * `name` for a plain form, or spread your form library's props. A single choice only: for
 * several, use a CheckboxGroup.
 *
 * @example
 * <Field.Root required>
 *   <Field.Label>Kommun</Field.Label>
 *   <NativeSelect name="municipality" autoComplete="address-level2">
 *     <option value="gbg">Göteborg</option>
 *     <option value="sthlm">Stockholm</option>
 *   </NativeSelect>
 * </Field.Root>
 */
export function NativeSelect({
  disabled,
  onValueChange,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: NativeSelectProps): ReactElement {
  const field = useContext(FieldContext)
  const select = useNativeSelect({ disabled, onValueChange })
  const elementRef = useRef<HTMLSelectElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  useControlWarnings({ elementRef, isInField: field !== null, id, componentName: 'NativeSelect' })

  const askedFor: Record<string, unknown> = otherProps
  const isMultiple = askedFor['multiple'] === true
  const hasSize = askedFor['size'] !== undefined
  useEffect(() => {
    if (isMultiple || hasSize) {
      warnOnce(
        'native-select-multiple',
        'A NativeSelect got multiple or size. It is a single choice from a short list (ADR-0037, item 2); a list box or a multi-select is hard to use with a keyboard and a screen reader. For several choices use a CheckboxGroup.',
      )
    }
  }, [isMultiple, hasSize])

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(select.selectProps['aria-describedby'], ownDescribedBy)

  return renderPart({
    render,
    defaultElement: 'select',
    partProps: {
      ...mergeProps(otherProps, ownId, select.selectProps),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
    state: {
      isInvalid: select.isInvalid,
      isRequired: select.isRequired,
      isDisabled: select.isDisabled,
      isFocusVisible: select.isFocusVisible,
    },
  })
}
NativeSelect.displayName = 'NativeSelect'
