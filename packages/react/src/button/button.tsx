'use client'
import { useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useButton } from './use-button.ts'

/**
 * Whether a button has a source for its accessible name: its own label attributes, a `<label>`,
 * text outside `aria-hidden`, or a labelled image. A rough check for a dev warning, not the
 * accessible-name algorithm. Internal (not in the public entry): Toggle shares it.
 */
export function hasNameSource(button: HTMLButtonElement): boolean {
  if (
    button.hasAttribute('aria-label') ||
    button.hasAttribute('aria-labelledby') ||
    button.hasAttribute('title') ||
    button.labels.length > 0
  ) {
    return true
  }
  const hasName = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').trim() !== ''
    }
    if (!(node instanceof Element) || node.getAttribute('aria-hidden') === 'true') {
      return false
    }
    if (node.hasAttribute('aria-label') || node.getAttribute('alt')?.trim()) {
      return true
    }
    return [...node.childNodes].some(hasName)
  }
  return [...button.childNodes].some(hasName)
}

/**
 * `aria-disabled` is left out: `disabled` with `focusableWhenDisabled` sets it, and also blocks
 * activation.
 */
export interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-disabled'> {
  /**
   * Keeps a disabled button in the Tab order with `aria-disabled="true"`, so users can find
   * it and read why it's disabled. Activation stays blocked.
   */
  focusableWhenDisabled?: boolean | undefined
  /**
   * The action is running: `aria-disabled="true"` and `data-busy`, never native `disabled`, so
   * focus stays and every press is blocked. It renders a decorative `kv-spinner` first. Pair it with
   * a `Progress` beside the button, without a `Progress.Indicator`.
   */
  busy?: boolean | undefined
}

/**
 * A native `<button>` with `type="button"` by default, and an optional focusable disabled
 * state (APG Button, contract: button.a11y.md).
 *
 * @example
 * <Button onClick={save}>Spara</Button>
 * <Button type="submit">Skicka ansökan</Button>
 * <Button disabled focusableWhenDisabled>Skicka</Button>
 * <Button busy={isSending}>Skicka ansökan</Button>
 */
export function Button({
  disabled,
  focusableWhenDisabled,
  busy,
  type,
  onClick,
  children,
  ref,
  ...otherProps
}: ButtonProps): ReactElement {
  const button = useButton({
    disabled,
    focusableWhenDisabled,
    busy,
    type,
    onClick,
  })
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    const element = elementRef.current
    if (element !== null && !hasNameSource(element)) {
      warnOnce(
        'button-without-name',
        'A <Button> has no accessible name: its only content is hidden from assistive technology, such as a decorative <Icon>. Give an icon-only button an aria-label from your translations, or add visible text (WCAG 4.1.2).',
      )
    }
  })

  return (
    <button {...mergeProps(otherProps, button.buttonProps)} ref={mergedRef}>
      {/* Decorative and first, so the name stays the visible text (2.5.3). The 1000 ms delay is CSS. */}
      {button.isBusy ? <span className="kv-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
Button.displayName = 'Button'
