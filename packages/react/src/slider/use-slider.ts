import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, ChangeEventHandler, FocusEventHandler, RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import type { FieldControlPartProps } from '../field/use-field.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { useFormat } from '../provider/use-format.ts'

/** The second argument of `onValueChange`. */
export interface SliderChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLInputElement>
}

export interface UseSliderOptions {
  /** Controlled: the number from your form logic. Pair it with `onValueChange`. */
  value?: number | undefined
  /** Uncontrolled: the native input keeps the number, and a form submit sends it. */
  defaultValue?: number | undefined
  /** The lowest value (`0` by default). */
  min?: number | undefined
  /** The highest value (`100` by default). */
  max?: number | undefined
  /** The distance between values (`1` by default). */
  step?: number | undefined
  /** The `name` a form submit uses. */
  name?: string | undefined
  /** Native `disabled`. A disabled Field disables the slider too. */
  disabled?: boolean | undefined
  /**
   * Called with the new number on every change. It only reports: the number lives in your form
   * logic, or in the native input when you don't pass `value`.
   */
  onValueChange?: ((value: number, details: SliderChangeDetails) => void) | undefined
  /**
   * The value as a screen reader speaks it, with its unit (`15 km`). Without it, the number is
   * formatted the way the provider's `locale` writes it.
   */
  valueText?: ((value: number) => string) | undefined
  /**
   * Names the slider by another element, such as the label of a NumberInput that shares its
   * Field. It opts the slider out of the Field: no id, no description, never invalid.
   */
  'aria-labelledby'?: string | undefined
}

/** Spread on the `<input>`. */
export interface SliderPartProps extends Pick<
  FieldStateAttributes,
  'data-invalid' | 'data-disabled'
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-slider`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-slider'
  type: 'range'
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
  /** From a Field that is invalid. */
  'aria-invalid'?: 'true'
  'aria-valuetext': string
  disabled?: true
  name?: string
  min: number
  max: number
  step: number
  value?: number
  defaultValue?: number
  'data-focus-visible'?: ''
  /** Keeps `aria-valuetext` in step with the native value. Merge it with yours. */
  ref: RefCallback<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseSliderResult {
  inputProps: SliderPartProps
  isInvalid: boolean
  isDisabled: boolean
  isFocusVisible: boolean
  /** The current number: the `value` you gave, or the native input's. */
  value: number
  /** What `aria-valuetext` says. */
  valueText: string
}

// The browser's own start value for a range: halfway between min and max, on a step.
function defaultStart(min: number, max: number, step: number): number {
  if (max < min) {
    return min
  }
  const snapped = min + Math.round((max - min) / 2 / step) * step
  return Math.min(snapped, max)
}

/**
 * A slider's props for your own `<input>`, wired to the nearest Field (contract:
 * slider.a11y.md). A native `<input type="range">`: the browser supplies the keys and the drag.
 *
 * @example
 * const control = useSlider({ value: km, onValueChange: setKm, valueText: (km) => `${km} km` })
 * <input {...control.inputProps} name="distance" />
 */
export function useSlider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  name,
  disabled = false,
  onValueChange,
  valueText: formatValueText,
  'aria-labelledby': ariaLabelledBy,
}: UseSliderOptions = {}): UseSliderResult {
  const field = useContext(FieldContext)
  const format = useFormat()
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const elementRef = useRef<HTMLInputElement | null>(null)
  const setElement = useCallback((element: HTMLInputElement | null) => {
    elementRef.current = element
  }, [])

  const isControlled = value !== undefined
  const [startValue] = useState(() => defaultValue ?? defaultStart(min, max, step))
  const [nativeValue, setNativeValue] = useState(startValue)
  const currentValue = isControlled ? value : nativeValue

  // An explicit aria-labelledby is Pattern A: another control owns the Field.
  const claimsField = field !== null && ariaLabelledBy === undefined
  const isInvalid = claimsField && field.state.isInvalid
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  // A range has no required state: take the Field's required attributes off the control.
  const controlProps: Partial<FieldControlPartProps> = claimsField ? { ...field.controlProps } : {}
  delete controlProps['aria-required']
  delete controlProps['data-required']

  useEffect(() => {
    if (min >= max) {
      warnOnce(
        'slider-min-max',
        `A Slider has min=${min} and max=${max}. min must be lower than max, or the slider has no range.`,
      )
    }
  }, [min, max])
  useEffect(() => {
    const checked = value ?? defaultValue
    if (checked !== undefined && (checked < min || checked > max)) {
      warnOnce(
        'slider-value-out-of-range',
        `A Slider has a value of ${checked}, outside min=${min} and max=${max}. The browser moves the thumb to the nearest end, but your state keeps ${checked}.`,
      )
    }
  }, [value, defaultValue, min, max])

  // The browser clamps and snaps the value, so read the truth back on mount and when the range changes.
  useLayoutEffect(() => {
    const element = elementRef.current
    if (element === null || isControlled) {
      return
    }
    const actual = Number(element.value)
    if (actual !== nativeValue) {
      setNativeValue(actual)
    }
  }, [isControlled, nativeValue, min, max, step])

  // A form reset sets the native value without a change event, and the reset runs after its
  // event. The form can change after mount, so listen on the document and match the target.
  useEffect(() => {
    const ownerDocument = elementRef.current?.ownerDocument
    if (ownerDocument === undefined || isControlled) {
      return
    }
    let timeout: ReturnType<typeof setTimeout> | undefined
    const readBack = (event: Event) => {
      const element = elementRef.current
      if (element === null || element.form === null || event.target !== element.form) {
        return
      }
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (elementRef.current !== null) {
          setNativeValue(Number(elementRef.current.value))
        }
      })
    }
    ownerDocument.addEventListener('reset', readBack, true)
    return () => {
      ownerDocument.removeEventListener('reset', readBack, true)
      clearTimeout(timeout)
    }
  }, [isControlled])

  const valueTextFor = formatValueText ?? ((number: number) => format.number(number))
  const text = valueTextFor(currentValue)

  const inputProps: SliderPartProps = {
    ...controlProps,
    className: 'kv-slider',
    type: 'range',
    min,
    max,
    step,
    ...(name === undefined ? {} : { name }),
    ...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy }),
    ...(isControlled ? { value } : { defaultValue: startValue }),
    'aria-valuetext': text,
    ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
    ref: setElement,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.currentTarget.value)
      onValueChange?.(next, { reason: 'input', event })
      if (!isControlled) {
        setNativeValue(next)
      }
    },
    ...focusVisibleProps,
  }

  return { inputProps, isInvalid, isDisabled, isFocusVisible, value: currentValue, valueText: text }
}
