'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useFocus } from './use-focus.ts'
import type { UseFocusOptions } from './use-focus.ts'

/** What `render` receives as its second argument. */
export interface FocusScopeState {
  active: boolean
}

/** What a `render` function gets to spread: your attributes, the key handler and a callback ref. */
export interface FocusScopeElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface FocusScopeProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onKeyDown'>, UseFocusOptions {
  ref?: Ref<HTMLElement> | undefined
  onKeyDown?: HTMLAttributes<HTMLElement>['onKeyDown']
  /**
   * Change the element: `render={<aside aria-labelledby={id} />}`. Its own semantics apply. The
   * scope adds no role and no ARIA.
   */
  render?: RenderProp<FocusScopeElementProps, FocusScopeState> | undefined
}

/**
 * A container that moves focus in when `active`, can hold it (`contain`) and returns it when it
 * ends (contract: focus.a11y.md). Prefer a native `<dialog>` where it fits. A `FocusScope` is one element, so it is written `<FocusScope>`.
 *
 * @example
 * <FocusScope active={open} contain="loop" onEscape={close} render={<aside aria-label="Filter" />}>
 *   …
 * </FocusScope>
 */
export function FocusScope({
  render,
  ref,
  active = false,
  restore,
  finalFocusRef,
  triggerRef,
  initialFocus,
  contain,
  onEscape,
  moveOn,
  onLost,
  ...otherProps
}: FocusScopeProps): ReactElement {
  const { scopeProps } = useFocus({
    active,
    restore,
    finalFocusRef,
    triggerRef,
    initialFocus,
    contain,
    onEscape,
    moveOn,
    onLost,
  })
  const elementRef = useMergedRef(ref, scopeProps.ref)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { onKeyDown: scopeProps.onKeyDown }),
      ref: elementRef,
    },
    state: { active },
  })
}
FocusScope.displayName = 'FocusScope'
