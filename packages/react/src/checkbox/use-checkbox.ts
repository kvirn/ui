import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler, RefCallback } from 'react'
import { CheckboxGroupContext } from '../checkbox-group/checkbox-group-context.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/** The second argument of `onCheckedChange`. */
export interface CheckboxChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLInputElement>
}

/** What `data-state` says. The default theme styles `:checked` and `:indeterminate` first. */
export type CheckboxDataState = 'checked' | 'unchecked' | 'indeterminate'

export interface UseCheckboxOptions {
  /** Controlled: the state from your form logic. Pair it with `onCheckedChange`. */
  checked?: boolean | undefined
  /** Uncontrolled: the native input keeps the state, and a form submit sends it. */
  defaultChecked?: boolean | undefined
  /**
   * The mixed state, set as the DOM `indeterminate` property after render (it can't be set in
   * markup). The prop decides: a click checks the box but doesn't clear it, you do.
   */
  indeterminate?: boolean | undefined
  /** The value a form submit sends, and the item's value inside a CheckboxGroup. */
  value?: string | undefined
  /** The `name` a form submit uses. Inside a CheckboxGroup, the group's `name` is the default. */
  name?: string | undefined
  /** Native `disabled`. A disabled Field disables the checkbox too. */
  disabled?: boolean | undefined
  /**
   * Called with the new checked state on every change. It only reports: the state lives in
   * your form logic, or in the native input when you don't pass `checked`.
   */
  onCheckedChange?: ((checked: boolean, details: CheckboxChangeDetails) => void) | undefined
}

/** Spread on the `<input type="checkbox">`. */
export interface CheckboxPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-checkbox`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-checkbox'
  type: 'checkbox'
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  /** From a Field that is invalid. A checkbox in an invalid group gets only `data-invalid`. */
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  'data-state': CheckboxDataState
  'data-focus-visible'?: ''
  /** Sets the DOM `indeterminate` property and keeps `data-state` in step. Merge it with yours. */
  ref: RefCallback<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseCheckboxResult {
  inputProps: CheckboxPartProps
  isIndeterminate: boolean
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/** Internal. The state the DOM has right now. */
function nativeState(element: HTMLInputElement): CheckboxDataState {
  if (element.indeterminate) return 'indeterminate'
  return element.checked ? 'checked' : 'unchecked'
}

/**
 * A checkbox's props for your own `<input type="checkbox">`, wired to the nearest Field and
 * CheckboxGroup (contract: checkbox.a11y.md). It holds no state: spread your form
 * library's props next to it.
 *
 * @example
 * const checkbox = useCheckbox({ indeterminate: someChecked && !allChecked })
 * <input {...checkbox.inputProps} name="all" />
 */
export function useCheckbox({
  checked,
  defaultChecked,
  indeterminate = false,
  value,
  name,
  disabled = false,
  onCheckedChange,
}: UseCheckboxOptions = {}): UseCheckboxResult {
  const field = useContext(FieldContext)
  const group = useContext(CheckboxGroupContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const elementRef = useRef<HTMLInputElement | null>(null)

  const item = group !== null && value !== undefined ? group.getCheckboxProps(value) : undefined
  const resolvedChecked = item?.checked ?? checked
  const resolvedDefaultChecked = item?.defaultChecked ?? defaultChecked
  const isControlled = resolvedChecked !== undefined
  const isInvalid = (field?.state.isInvalid ?? false) || item?.['data-invalid'] !== undefined
  const isRequired = field?.state.isRequired ?? false
  const isDisabled =
    (field?.state.isDisabled ?? false) || disabled || item?.['data-disabled'] !== undefined
  const controlProps = field?.controlProps
  const inGroup = group !== null

  useEffect(() => {
    if (inGroup && value === undefined) {
      warnOnce(
        'checkbox-in-group-without-value',
        'A Checkbox in a CheckboxGroup has no value, so the group can’t tell which option it is. Give each Checkbox a value.',
      )
    }
  }, [inGroup, value])
  const givesOwnState = checked !== undefined || defaultChecked !== undefined
  const groupSetsState = item?.checked !== undefined || item?.defaultChecked !== undefined
  useEffect(() => {
    if (givesOwnState && groupSetsState) {
      warnOnce(
        'checkbox-checked-in-group',
        'A Checkbox in a CheckboxGroup got checked or defaultChecked, which is ignored: the group sets it from its value or defaultValue. Change the group’s value instead.',
      )
    }
  }, [givesOwnState, groupSetsState])

  const setElement = useCallback((element: HTMLInputElement | null) => {
    elementRef.current = element
  }, [])

  // The DOM property can't be set in markup, and the DOM state is the truth for data-state:
  // after every render, put both in step with the props and the native input.
  useLayoutEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }
    element.indeterminate = indeterminate
    const state = nativeState(element)
    if (element.getAttribute('data-state') !== state) {
      element.setAttribute('data-state', state)
    }
  })

  const initialState: CheckboxDataState = indeterminate
    ? 'indeterminate'
    : (resolvedChecked ?? resolvedDefaultChecked ?? false)
      ? 'checked'
      : 'unchecked'
  const groupOnChange = item?.onChange

  const inputProps: CheckboxPartProps = {
    ...controlProps,
    className: 'kv-checkbox',
    type: 'checkbox',
    ...(name === undefined ? (item?.name === undefined ? {} : { name: item.name }) : { name }),
    ...(value === undefined ? {} : { value }),
    ...(isControlled ? { checked: resolvedChecked } : {}),
    ...(!isControlled && resolvedDefaultChecked !== undefined
      ? { defaultChecked: resolvedDefaultChecked }
      : {}),
    'data-state': initialState,
    ...(item?.['data-invalid'] === undefined ? {} : { 'data-invalid': '' }),
    ...(item?.['data-disabled'] === undefined ? {} : { 'data-disabled': '' }),
    ...(disabled ? { disabled: true, 'data-disabled': '' } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
    ref: setElement,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const element = event.currentTarget
      groupOnChange?.(event)
      onCheckedChange?.(element.checked, { reason: 'input', event })
      // The prop is the truth: a click clears the DOM property, so put it back.
      element.indeterminate = indeterminate
      if (!isControlled) {
        // A controlled box is put back by React if the parent doesn't update it, and the next
        // render writes its data-state.
        element.setAttribute('data-state', nativeState(element))
      }
    },
    ...focusVisibleProps,
  }

  return {
    inputProps,
    isIndeterminate: indeterminate,
    isInvalid,
    isRequired,
    isDisabled,
    isFocusVisible,
  }
}
