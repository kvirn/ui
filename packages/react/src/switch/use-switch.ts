import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

/** The second argument of `onCheckedChange`. */
export interface SwitchChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLInputElement>
}

/** What `data-state` says. The default theme styles `:checked` first. */
export type SwitchDataState = 'checked' | 'unchecked'

export interface UseSwitchOptions {
  /** Controlled: the state from your form logic. Pair it with `onCheckedChange`. */
  checked?: boolean | undefined
  /** Uncontrolled: the native input keeps the state, and a form submit sends it. */
  defaultChecked?: boolean | undefined
  /** The value a form submit sends when on (`on` by default). */
  value?: string | undefined
  /** The `name` a form submit uses. */
  name?: string | undefined
  /** Native `disabled`. A disabled Field disables the switch too. */
  disabled?: boolean | undefined
  /**
   * Called with the new checked state on every change. It only reports: the state lives in
   * your form logic, or in the native input when you don't pass `checked`.
   */
  onCheckedChange?: ((checked: boolean, details: SwitchChangeDetails) => void) | undefined
}

/** Spread on the `<input>`. */
export interface SwitchPartProps extends Pick<
  FieldStateAttributes,
  'data-invalid' | 'data-disabled'
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-switch`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-switch'
  type: 'checkbox'
  role: 'switch'
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  /** From a Field that is invalid. */
  'aria-invalid'?: 'true'
  disabled?: true
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  'data-state': SwitchDataState
  'data-focus-visible'?: ''
  /** Keeps `data-state` in step with the native state. Merge it with yours. */
  ref: RefCallback<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseSwitchResult {
  inputProps: SwitchPartProps
  isInvalid: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * A switch's props for your own `<input>`, wired to the nearest Field (contract:
 * switch.a11y.md). It holds no state: spread your form library's props next to it.
 *
 * @example
 * const control = useSwitch({ checked: sms, onCheckedChange: setSms })
 * <input {...control.inputProps} name="sms" />
 */
export function useSwitch({
  checked,
  defaultChecked,
  value,
  name,
  disabled = false,
  onCheckedChange,
}: UseSwitchOptions = {}): UseSwitchResult {
  const field = useContext(FieldContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const elementRef = useRef<HTMLInputElement | null>(null)
  const setElement = useCallback((element: HTMLInputElement | null) => {
    elementRef.current = element
  }, [])

  const isControlled = checked !== undefined
  const isInvalid = field?.state.isInvalid ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const isRequiredField = field?.state.isRequired ?? false
  // A Switch is never required: take the Field's required attributes off the control.
  const controlProps = { ...field?.controlProps }
  delete controlProps['aria-required']
  delete controlProps['data-required']

  useEffect(() => {
    if (isRequiredField) {
      warnOnce(
        'switch-required',
        'A Switch inside a required Field: a switch has no required state, because off is a valid answer, so no aria-required is set. Use a Checkbox for a consent or declaration, or remove required from the Field.',
      )
    }
  }, [isRequiredField])
  useEffect(() => {
    const labels = elementRef.current?.labels
    if (
      labels !== undefined &&
      labels !== null &&
      [...labels].some((label) => label.querySelector('.kv-field-optional') !== null)
    ) {
      warnOnce(
        'switch-optional-marker',
        'A Switch’s label shows "(optional)", which makes no sense for a setting. Set marker="none" on Field.Label.',
      )
    }
  })

  // The DOM state is the truth for data-state: after every render, put it in step.
  useLayoutEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }
    const state: SwitchDataState = element.checked ? 'checked' : 'unchecked'
    if (element.getAttribute('data-state') !== state) {
      element.setAttribute('data-state', state)
    }
  })

  const initialState: SwitchDataState =
    (checked ?? defaultChecked ?? false) ? 'checked' : 'unchecked'

  const inputProps: SwitchPartProps = {
    ...controlProps,
    className: 'kv-switch',
    type: 'checkbox',
    role: 'switch',
    ...(name === undefined ? {} : { name }),
    ...(value === undefined ? {} : { value }),
    ...(isControlled ? { checked } : {}),
    ...(!isControlled && defaultChecked !== undefined ? { defaultChecked } : {}),
    'data-state': initialState,
    ...(disabled ? { disabled: true, 'data-disabled': '' } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
    ref: setElement,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const element = event.currentTarget
      onCheckedChange?.(element.checked, { reason: 'input', event })
      if (!isControlled) {
        // A controlled switch is put back by React if the parent doesn't update it, and the next
        // render writes its data-state.
        element.setAttribute('data-state', element.checked ? 'checked' : 'unchecked')
      }
    },
    ...focusVisibleProps,
  }

  return { inputProps, isInvalid, isDisabled, isFocusVisible }
}
