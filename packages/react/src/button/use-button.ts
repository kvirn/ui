import { useCallback, useMemo } from 'react'
import type { FocusEventHandler, MouseEvent, MouseEventHandler } from 'react'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'

export interface UseButtonOptions {
  /** Mirrors HTML `disabled`. Blocks activation. */
  disabled?: boolean | undefined
  /**
   * Keeps a disabled button in the Tab order with `aria-disabled="true"` instead of
   * `disabled`, so users can find it and read why it's disabled. Activation stays blocked.
   */
  focusableWhenDisabled?: boolean | undefined
  /** Default `'button'`, so a button never submits a form by accident. */
  type?: 'button' | 'submit' | 'reset' | undefined
  /**
   * Called on activation (click, Enter, Space), and never while disabled. Pass it here
   * rather than merging your own `onClick` on top of `buttonProps`.
   */
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
}

/** Spread on a `<button>`. */
export interface ButtonPartProps {
  /** The stable part name, for `@kvirn-ui/theme` and your own CSS: `[data-kv='button']`. */
  'data-kv': 'button'
  type: 'button' | 'submit' | 'reset'
  disabled?: true
  'aria-disabled'?: 'true'
  'data-disabled'?: ''
  'data-focus-visible'?: ''
  onClick: MouseEventHandler<HTMLButtonElement>
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseButtonResult {
  buttonProps: ButtonPartProps
  isDisabled: boolean
  /** `true` while the button has keyboard (`:focus-visible`) focus. */
  isFocusVisible: boolean
}

/**
 * A button's behaviour for your own `<button>` (APG Button, contract: button.a11y.md).
 *
 * @example
 * const button = useButton({ disabled, focusableWhenDisabled: true, onClick: save })
 * <button {...button.buttonProps}>Spara</button>
 */
export function useButton({
  disabled = false,
  focusableWhenDisabled = false,
  type = 'button',
  onClick,
}: UseButtonOptions = {}): UseButtonResult {
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isFocusableWhenDisabled = disabled && focusableWhenDisabled
  const isNativelyDisabled = disabled && !focusableWhenDisabled
  // A natively disabled button can't hold focus, even if it had it when it became disabled.
  const isFocusVisibleNow = isFocusVisible && !isNativelyDisabled

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        // Blocks form submission and the reset of a focusable disabled button.
        event.preventDefault()
        return
      }
      onClick?.(event)
    },
    [disabled, onClick],
  )

  const buttonProps = useMemo<ButtonPartProps>(
    () => ({
      'data-kv': 'button',
      type,
      ...(isNativelyDisabled ? { disabled: true } : {}),
      ...(isFocusableWhenDisabled ? { 'aria-disabled': 'true' } : {}),
      ...(disabled ? { 'data-disabled': '' } : {}),
      ...(isFocusVisibleNow ? { 'data-focus-visible': '' } : {}),
      onClick: handleClick,
      ...focusVisibleProps,
    }),
    [
      type,
      isNativelyDisabled,
      isFocusableWhenDisabled,
      disabled,
      isFocusVisibleNow,
      handleClick,
      focusVisibleProps,
    ],
  )

  return { buttonProps, isDisabled: disabled, isFocusVisible: isFocusVisibleNow }
}
