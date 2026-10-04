import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useButton } from '../button/use-button.ts'
import type { ButtonPartProps, UseButtonOptions } from '../button/use-button.ts'

export interface TogglePressedChangeDetails {
  /** The click behind the change: a press, or Enter or Space on the focused button. */
  event: MouseEvent<HTMLButtonElement>
}

export interface UseToggleOptions extends Omit<UseButtonOptions, 'type'> {
  /** Controlled: whether the toggle is on. Pair it with `onPressedChange`. */
  pressed?: boolean | undefined
  /** Uncontrolled: whether the toggle starts on. Default `false`. */
  defaultPressed?: boolean | undefined
  /**
   * Called when the user switches the toggle, with the new value. It only reports: with `pressed`
   * set, you change `pressed` yourself. Never called while disabled.
   */
  onPressedChange?: ((pressed: boolean, details: TogglePressedChangeDetails) => void) | undefined
}

/** Spread on a `<button>`. */
export interface TogglePartProps extends Omit<ButtonPartProps, 'className'> {
  /**
   * The part's classes, for `@kvirn-ui/theme` and your own CSS: `.kv-button` and `.kv-toggle`.
   * Add classes of your own next to them with `mergeProps`: class names join.
   */
  className: 'kv-button kv-toggle'
  'aria-pressed': boolean
  'data-pressed'?: ''
}

export interface UseToggleResult {
  toggleProps: TogglePartProps
  isPressed: boolean
  isDisabled: boolean
  /** `true` while the toggle has keyboard (`:focus-visible`) focus. */
  isFocusVisible: boolean
}

/**
 * A toggle button's behaviour for your own `<button>` (APG Button, toggle button, contract:
 * toggle.a11y.md). It is `useButton` plus `aria-pressed` and `data-pressed`, and it holds the
 * pressed state the way `usePopover` holds `open`: controlled with `pressed`, or uncontrolled.
 *
 * The name must never change with the state: "Fetstil", not "Slå på fetstil". It's on when
 * `aria-pressed` says so.
 *
 * @example
 * const toggle = useToggle({ pressed: isBold, onPressedChange: setIsBold })
 * <button {...toggle.toggleProps} aria-label="Fetstil">B</button>
 */
export function useToggle({
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  disabled,
  focusableWhenDisabled,
  onClick,
}: UseToggleOptions = {}): UseToggleResult {
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed)
  const isControlled = pressedProp !== undefined
  const isPressed = isControlled ? pressedProp : uncontrolledPressed

  // Through useButton, so a disabled toggle never switches and never calls a handler.
  const button = useButton({
    disabled,
    focusableWhenDisabled,
    type: 'button',
    onClick: (event) => {
      const next = !isPressed
      if (!isControlled) {
        setUncontrolledPressed(next)
      }
      onPressedChange?.(next, { event })
      onClick?.(event)
    },
  })

  return {
    toggleProps: {
      ...button.buttonProps,
      className: 'kv-button kv-toggle',
      'aria-pressed': isPressed,
      ...(isPressed ? { 'data-pressed': '' as const } : {}),
    },
    isPressed,
    isDisabled: button.isDisabled,
    isFocusVisible: button.isFocusVisible,
  }
}
