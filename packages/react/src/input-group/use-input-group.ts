import { useCallback, useContext, useMemo, useState } from 'react'
import type { FocusEvent, FocusEventHandler, MouseEvent, MouseEventHandler } from 'react'
import { FieldContext } from '../field/field-context.ts'

export interface UseInputGroupOptions {
  /** `data-invalid` on the root. Default: the nearest Field's `invalid`. */
  invalid?: boolean | undefined
  /** `data-disabled` on the root, and clicks no longer focus the input. Default: the nearest Field's. */
  disabled?: boolean | undefined
}

/** Spread on the box: a `<div>` that holds one input, and its addons or button. */
export interface InputGroupRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-input-group`. Add your own
   * class next to it with `mergeProps`: class names join.
   */
  className: 'kv-input-group'
  'data-invalid'?: ''
  'data-disabled'?: ''
  /** Set while the input inside has keyboard focus, so the focus ring is drawn around the box. */
  'data-focus-visible'?: ''
  /** Focuses the input when the pointer goes down on an addon or on the box's padding. */
  onMouseDown: MouseEventHandler<HTMLElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

/** Spread on a unit or a decorative icon inside the box. */
export interface InputGroupAddonPartProps {
  /** The part's class: `.kv-input-group-addon`. */
  className: 'kv-input-group-addon'
  /** Addons are visual only: the label already says the unit. */
  'aria-hidden': 'true'
}

export interface UseInputGroupResult {
  rootProps: InputGroupRootPartProps
  addonProps: InputGroupAddonPartProps
  isInvalid: boolean
  isDisabled: boolean
  /** `true` while the input inside has keyboard focus (`:focus-visible`). */
  isFocusVisible: boolean
}

/** Internal. The props every addon gets: one constant, since an addon has no state of its own. */
export const inputGroupAddonProps: InputGroupAddonPartProps = Object.freeze({
  className: 'kv-input-group-addon',
  'aria-hidden': 'true',
})

const textEntryTags = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

// A pointer going down on one of these keeps its own behaviour.
const ownBehaviourSelector = 'input, textarea, select, button, a[href], label, [tabindex]'

/**
 * The box around an input and its addons or buttons, for your own elements (ADR-0031, contract:
 * input-group.a11y.md). It takes `data-invalid` and `data-disabled` from the nearest Field, sets
 * `data-focus-visible` while the input inside has keyboard focus, and focuses the input when the
 * pointer goes down on an addon or on the box's padding. It holds no form state.
 *
 * Buttons (clear, show password) go directly in the box, never in an addon: each keeps its own
 * name and Tab stop. Addons are `aria-hidden` and never focusable, so the label must say what
 * they show ("Månadshyra i kronor" for a "kr" addon).
 *
 * @example
 * const group = useInputGroup()
 * <div {...group.rootProps}>
 *   <input {...input.inputProps} />
 *   <span {...group.addonProps}>kr</span>
 * </div>
 */
export function useInputGroup({
  invalid,
  disabled,
}: UseInputGroupOptions = {}): UseInputGroupResult {
  const field = useContext(FieldContext)
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  const isInvalid = invalid ?? field?.state.isInvalid ?? false
  const isDisabled = disabled ?? field?.state.isDisabled ?? false

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const target = event.target
      if (isDisabled || event.button !== 0 || event.defaultPrevented) {
        return
      }
      if (!(target instanceof Element)) {
        return
      }
      // A control inside the box keeps its own behaviour. Ancestors outside the box don't count.
      const own = target.closest(ownBehaviourSelector)
      if (own !== null && own !== event.currentTarget && event.currentTarget.contains(own)) {
        return
      }
      // Read in an event handler only, never while rendering (SSR-safe).
      const input = event.currentTarget.querySelector('input')
      if (input !== null) {
        // Stops the focus from moving to the body and back, so the ring doesn't flicker.
        event.preventDefault()
        input.focus()
      }
    },
    [isDisabled],
  )
  const onFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    const target = event.target
    if (textEntryTags.has(target.tagName)) {
      setIsFocusVisible(target.matches(':focus-visible'))
    }
  }, [])
  const onBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (textEntryTags.has(event.target.tagName)) {
      setIsFocusVisible(false)
    }
  }, [])

  const rootProps = useMemo<InputGroupRootPartProps>(
    () => ({
      className: 'kv-input-group',
      ...(isInvalid ? { 'data-invalid': '' } : {}),
      ...(isDisabled ? { 'data-disabled': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      onMouseDown,
      onFocus,
      onBlur,
    }),
    [isInvalid, isDisabled, isFocusVisible, onMouseDown, onFocus, onBlur],
  )

  return { rootProps, addonProps: inputGroupAddonProps, isInvalid, isDisabled, isFocusVisible }
}
