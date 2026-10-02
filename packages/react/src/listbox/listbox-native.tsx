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
import { useListboxNative } from './use-listbox-native.ts'
import type { ListboxNativeChangeDetails } from './use-listbox-native.ts'

// Internal. The native rendering of `Listbox.Root` (`native="always"`, or `native="auto"` on touch
// devices): a native `<select>` wired to its Field. It is not part of the public API (ADR-0037,
// item 2: NativeSelect became Listbox).

export type { ListboxNativeChangeDetails } from './use-listbox-native.ts'

/** What `render` receives as its second argument. */
export interface ListboxNativeState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

export interface ListboxNativeProps extends Omit<
  ComponentPropsWithRef<'select'>,
  'value' | 'defaultValue' | 'multiple' | 'size'
> {
  /** Controlled: the chosen option's value from your form state. */
  value?: string | undefined
  /** Uncontrolled: the native select keeps the choice, and a form submit sends it. */
  defaultValue?: string | undefined
  /** Reports each change, with `{ reason: 'input', event }`. `onChange` still works too. */
  onValueChange?: ((value: string, details: ListboxNativeChangeDetails) => void) | undefined
  render?: RenderProp<ComponentPropsWithRef<'select'>, ListboxNativeState> | undefined
}

/**
 * The native rendering of a Listbox, rendered by `Listbox.Root` for `native="always"` and `native="auto"`
 * on touch devices: a native `<select>`, wired to its Field. The label names
 * it, and the hint and error describe it (ADR-0037, item 2; contract: listbox.a11y.md).
 * Children are plain `<option>` and `<optgroup>`. It holds no form state: pass `value` and
 * `onValueChange`, or `defaultValue` and `name` for a plain form, or spread your form library's
 * props. A single choice only: for several, use a CheckboxGroup.
 */
export function ListboxNative({
  disabled,
  onValueChange,
  id,
  'aria-describedby': ownDescribedBy,
  render,
  ref,
  ...otherProps
}: ListboxNativeProps): ReactElement {
  const field = useContext(FieldContext)
  const listbox = useListboxNative({ disabled, onValueChange })
  const elementRef = useRef<HTMLSelectElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  useControlWarnings({
    elementRef,
    isInField: field !== null,
    id,
    componentName: 'Listbox',
  })

  const askedFor: Record<string, unknown> = otherProps
  const isMultiple = askedFor['multiple'] === true
  const hasSize = askedFor['size'] !== undefined
  useEffect(() => {
    if (isMultiple || hasSize) {
      warnOnce(
        'listbox-native-multiple',
        'A native Listbox select got multiple or size. It is a single choice from a short list (ADR-0037, item 2); a list box or a multi-select is hard to use with a keyboard and a screen reader. For several choices use a CheckboxGroup.',
      )
    }
  }, [isMultiple, hasSize])

  // Inside a Field, the Field's id wins, and your own aria-describedby ids come after its ids.
  const ownId = field === null ? { id } : {}
  const describedBy = joinIds(listbox.nativeProps['aria-describedby'], ownDescribedBy)

  return renderPart({
    render,
    defaultElement: 'select',
    partProps: {
      ...mergeProps(otherProps, ownId, listbox.nativeProps),
      'aria-describedby': describedBy,
      ref: mergedRef,
    },
    state: {
      isInvalid: listbox.isInvalid,
      isRequired: listbox.isRequired,
      isDisabled: listbox.isDisabled,
      isFocusVisible: listbox.isFocusVisible,
    },
  })
}
ListboxNative.displayName = 'ListboxNative'
