import { useContext, useEffect } from 'react'
import type { ChangeEventHandler } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { RadioGroupContext } from './radio-group-context.ts'

export interface UseRadioOptions {
  /** What a form submit sends when checked, and the option's value inside a RadioGroup. */
  value?: string | undefined
  /** The `name` that groups the radios. Inside a RadioGroup, the group's name is the default. */
  name?: string | undefined
  /** Native `disabled`: skipped by Tab and by the arrow keys. */
  disabled?: boolean | undefined
  /** Controlled outside a RadioGroup: whether this radio is checked. */
  checked?: boolean | undefined
  /** Uncontrolled outside a RadioGroup. */
  defaultChecked?: boolean | undefined
}

/** Spread on the `<input type="radio">`. */
export interface RadioPartProps extends FieldStateAttributes {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-radio`. Add your own class
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-radio'
  type: 'radio'
  /** From the Field: the control's id. */
  id?: string
  'aria-describedby'?: string
  disabled?: true
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  /** Only when the radio's state is known from props. Style `:checked` for the native state. */
  'data-state'?: 'checked' | 'unchecked'
  onChange: ChangeEventHandler<HTMLInputElement>
}

export interface UseRadioResult {
  inputProps: RadioPartProps
  /** Known from props only: `undefined` for an uncontrolled radio. */
  isChecked: boolean | undefined
  isInvalid: boolean
  isDisabled: boolean
}

/**
 * A radio's props for your own `<input type="radio">`, wired to the nearest Field and
 * RadioGroup (ADR-0029, contract: radio-group.a11y.md). Never `aria-invalid`, even in an
 * invalid Field: ARIA doesn't support it on `radio`, so the group's error is its description
 * (ADR-0029, item 10). The browser does the keys. There's no `data-focus-visible` and no focus
 * state: a re-render while a radio has focus makes React write its `name` again, and Chromium
 * then stops treating the group as one Tab stop (radio-group.a11y.md, Known issues).
 *
 * @example
 * const radio = useRadio({ value: 'sv' })
 * <input {...radio.inputProps} />
 */
export function useRadio({
  value,
  name,
  disabled = false,
  checked,
  defaultChecked,
}: UseRadioOptions = {}): UseRadioResult {
  const field = useContext(FieldContext)
  const group = useContext(RadioGroupContext)

  const item = group !== null && value !== undefined ? group.getRadioProps(value) : undefined
  const resolvedChecked = item?.checked ?? checked
  const resolvedDefaultChecked = item?.defaultChecked ?? defaultChecked
  const isInvalid = (field?.state.isInvalid ?? false) || item?.['data-invalid'] !== undefined
  const isDisabled =
    (field?.state.isDisabled ?? false) || disabled || item?.['data-disabled'] !== undefined
  // Radios take no aria-invalid and no aria-required (ARIA 1.2): only the data-* attributes.
  const {
    'aria-invalid': _ariaInvalid,
    'aria-required': _ariaRequired,
    ...controlProps
  } = field?.controlProps ?? {}
  const inGroup = group !== null

  useEffect(() => {
    if (inGroup && value === undefined) {
      warnOnce(
        'radio-in-group-without-value',
        'A Radio in a RadioGroup has no value, so the group can’t tell which option it is. Give each Radio a value.',
      )
    }
  }, [inGroup, value])
  const givesOwnState = checked !== undefined || defaultChecked !== undefined
  const groupSetsState = item?.checked !== undefined || item?.defaultChecked !== undefined
  useEffect(() => {
    if (givesOwnState && groupSetsState) {
      warnOnce(
        'radio-checked-in-group',
        'A Radio in a RadioGroup got checked or defaultChecked, which is ignored: the group sets it from its value or defaultValue. Change the group’s value instead.',
      )
    }
  }, [givesOwnState, groupSetsState])

  const inputProps: RadioPartProps = {
    ...controlProps,
    className: 'kv-radio',
    type: 'radio',
    ...(name === undefined ? (item?.name === undefined ? {} : { name: item.name }) : { name }),
    ...(value === undefined ? {} : { value }),
    ...(resolvedChecked === undefined
      ? resolvedDefaultChecked === undefined
        ? {}
        : { defaultChecked: resolvedDefaultChecked }
      : { checked: resolvedChecked, 'data-state': resolvedChecked ? 'checked' : 'unchecked' }),
    ...(item?.['data-invalid'] === undefined ? {} : { 'data-invalid': '' }),
    ...(item?.['data-disabled'] === undefined ? {} : { 'data-disabled': '' }),
    ...(disabled ? { disabled: true, 'data-disabled': '' } : {}),
    onChange: (event) => {
      item?.onChange(event)
    },
  }

  return { inputProps, isChecked: resolvedChecked, isInvalid, isDisabled }
}
