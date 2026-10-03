'use client'
import { useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, MouseEventHandler, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useButton } from './use-button.ts'

/**
 * Whether a button has a source for its accessible name: its own label attributes, a `<label>`,
 * text outside `aria-hidden`, or a labelled image. A rough check for a dev warning, not the
 * accessible-name algorithm.
 */
function hasNameSource(button: HTMLButtonElement): boolean {
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

const isClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function'

/** What `render` receives as its second argument. */
export interface ButtonState {
  isDisabled: boolean
  isFocusVisible: boolean
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
   * Change the element. It must still be a `<button>`: use Link for navigation. An element's
   * own `onClick` is gated like the Button's. In the function form, keep `buttonProps.onClick`.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, ButtonState> | undefined
}

/**
 * A native `<button>` with `type="button"` by default, and an optional focusable disabled
 * state (APG Button, contract: button.a11y.md).
 *
 * @example
 * <Button onClick={save}>Spara</Button>
 * <Button type="submit">Skicka ansökan</Button>
 * <Button disabled focusableWhenDisabled>Skicka</Button>
 */
export function Button({
  disabled,
  focusableWhenDisabled,
  type,
  onClick,
  render,
  ref,
  ...otherProps
}: ButtonProps): ReactElement {
  // The element's onClick goes through useButton too, so a disabled Button blocks it.
  const { render: renderWithoutClick, takenProps } = takeRenderElementProps(render, ['onClick'])
  const elementOnClick = takenProps.onClick
  const activationHandler = isClickHandler(elementOnClick)
    ? mergeProps({ onClick }, { onClick: elementOnClick }).onClick
    : onClick
  const button = useButton({ disabled, focusableWhenDisabled, type, onClick: activationHandler })
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    const element = elementRef.current
    if (element === null || element.tagName !== 'BUTTON') {
      const rendered =
        element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `button-not-a-button:${rendered}`,
        `<Button render> must render a <button> and forward its ref, but it rendered ${rendered}. A button's role, keyboard activation and disabled state come from the native element. For navigation, use Link.`,
      )
    } else if (!hasNameSource(element)) {
      warnOnce(
        'button-without-name',
        'A <Button> has no accessible name: its only content is hidden from assistive technology, such as a decorative <Icon>. Give an icon-only button an aria-label from your translations, or add visible text (WCAG 4.1.2).',
      )
    }
  })

  return renderPart({
    render: renderWithoutClick,
    defaultElement: 'button',
    partProps: { ...mergeProps(otherProps, button.buttonProps), ref: mergedRef },
    state: { isDisabled: button.isDisabled, isFocusVisible: button.isFocusVisible },
  })
}
