'use client'
import { useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, MouseEventHandler, ReactElement } from 'react'
import { hasNameSource } from '../button/button.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useToggle } from './use-toggle.ts'
import type { TogglePressedChangeDetails } from './use-toggle.ts'

export type { TogglePressedChangeDetails } from './use-toggle.ts'

const isClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function'

/** What `render` receives as its second argument. */
export interface ToggleState {
  isPressed: boolean
  isDisabled: boolean
  isFocusVisible: boolean
}

/**
 * `aria-pressed` and `aria-disabled` are left out: `pressed` and `defaultPressed` set the first,
 * and `disabled` with `focusableWhenDisabled` the second. `type` is always `button`.
 */
export interface ToggleProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'aria-pressed' | 'aria-disabled' | 'type'
> {
  /** Controlled: whether the toggle is on. Pair it with `onPressedChange`. */
  pressed?: boolean | undefined
  /** Uncontrolled: whether the toggle starts on. Default `false`. */
  defaultPressed?: boolean | undefined
  /**
   * Called when the user switches the toggle, with the new value and `{ event }`. It only
   * reports: with `pressed` set, you change `pressed` yourself. Never called while disabled.
   */
  onPressedChange?: ((pressed: boolean, details: TogglePressedChangeDetails) => void) | undefined
  /**
   * Keeps a disabled toggle in the Tab order with `aria-disabled="true"`, so users can find it
   * and read why it's off limits. Switching stays blocked.
   */
  focusableWhenDisabled?: boolean | undefined
  /**
   * Change the element. It must still be a `<button>`. An element's own `onClick` is gated like
   * the Toggle's. In the function form, keep `toggleProps.onClick`.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, ToggleState> | undefined
}

/**
 * A native `<button type="button" aria-pressed>` that is on or off (APG Button, toggle button,
 * contract: toggle.a11y.md). Use it for a choice with a direct, visible effect, such as bold text
 * or "show only unread". For a setting that is saved with a form, use a Checkbox.
 *
 * **The name never changes with the state:** it is on when `aria-pressed` says so. Give an
 * icon-only toggle an `aria-label` from your translations.
 *
 * @example
 * <Toggle pressed={isUnread} onPressedChange={setIsUnread}>Visa bara olästa</Toggle>
 */
export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  focusableWhenDisabled,
  onClick,
  render,
  ref,
  ...otherProps
}: ToggleProps): ReactElement {
  // The element's onClick goes through useToggle too, so a disabled Toggle blocks it.
  const { render: renderWithoutClick, takenProps } = takeRenderElementProps(render, ['onClick'])
  const elementOnClick = takenProps.onClick
  const activationHandler = isClickHandler(elementOnClick)
    ? mergeProps({ onClick }, { onClick: elementOnClick }).onClick
    : onClick
  const toggle = useToggle({
    pressed,
    defaultPressed,
    onPressedChange,
    disabled,
    focusableWhenDisabled,
    onClick: activationHandler,
  })
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    const element = elementRef.current
    if (element === null || element.tagName !== 'BUTTON') {
      const rendered =
        element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `toggle-not-a-button:${rendered}`,
        `<Toggle render> must render a <button> and forward its ref, but it rendered ${rendered}. A toggle's role, keyboard activation and disabled state come from the native element.`,
      )
    } else if (!hasNameSource(element)) {
      warnOnce(
        'toggle-without-name',
        'A <Toggle> has no accessible name: its only content is hidden from assistive technology, such as a decorative <Icon>. Give an icon-only toggle an aria-label from your translations, or add visible text. The name must not change with the state (WCAG 4.1.2).',
      )
    }
  })

  return renderPart({
    render: renderWithoutClick,
    defaultElement: 'button',
    partProps: { ...mergeProps(otherProps, toggle.toggleProps), ref: mergedRef },
    state: {
      isPressed: toggle.isPressed,
      isDisabled: toggle.isDisabled,
      isFocusVisible: toggle.isFocusVisible,
    },
  })
}
Toggle.displayName = 'Toggle'
