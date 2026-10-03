'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { usePopover } from './use-popover.ts'
import type { UsePopoverOptions, UsePopoverResult } from './use-popover.ts'

export type { PopoverChangeDetails, PopoverChangeReason } from './use-popover.ts'

/** What `render` receives as its second argument, for every part. */
export interface PopoverState {
  isOpen: boolean
}

export interface PopoverRootProps extends UsePopoverOptions {
  children?: ReactNode
}

export interface PopoverTriggerProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, PopoverState> | undefined
}

export interface PopoverPopupProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, PopoverState> | undefined
}

export interface PopoverCloseProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, PopoverState> | undefined
}

const PopoverContext = createContext<UsePopoverResult | null>(null)

function warnOutsideRoot(part: string): void {
  warnOnce(
    `popover-${part.toLowerCase()}-outside-root`,
    `A Popover.${part} is outside a Popover.Root, so it opens and closes nothing. Put it inside <Popover.Root>.`,
  )
}

/**
 * Owns the open state of a popover (contract: popover.a11y.md). It renders no element:
 * put a `Popover.Trigger` and a `Popover.Popup` inside it, the popup right after the trigger.
 * Open it from state with `open` and `onOpenChange`, or let it keep its own with `defaultOpen`.
 *
 * @example
 * <Popover.Root>
 *   <Popover.Trigger>Om tjänsten</Popover.Trigger>
 *   <Popover.Popup aria-label="Om tjänsten">
 *     <p>Tjänsten drivs av kommunen.</p>
 *     <Popover.Close>Stäng</Popover.Close>
 *   </Popover.Popup>
 * </Popover.Root>
 */
export function PopoverRoot({ children, ...options }: PopoverRootProps): ReactElement {
  const popover = usePopover(options)
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>
}
PopoverRoot.displayName = 'Popover.Root'

/**
 * The `<button>` that opens and closes the popover. It has `aria-expanded`, `aria-controls` and
 * `aria-haspopup="dialog"`, and it is the anchor the popup is placed against. Enter and Space
 * work natively, as on any button.
 */
export function PopoverTrigger({ render, ref, ...otherProps }: PopoverTriggerProps): ReactElement {
  const popover = useContext(PopoverContext)
  const mergedRef = useMergedRef(ref, popover?.triggerProps.ref ?? null)
  useEffect(() => {
    if (popover === null) {
      warnOutsideRoot('Trigger')
    }
  }, [popover])
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, popover?.triggerProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
    state: { isOpen: popover?.isOpen ?? false },
  })
}
PopoverTrigger.displayName = 'Popover.Trigger'

/**
 * The popup: a `<div popover="auto" role="dialog">` in the top layer, so no z-index and no
 * clipping by an ancestor. It is always rendered and hidden by the browser while closed, so
 * keep its content light. **Name it** with `aria-label` or `aria-labelledby` (4.1.2): the role
 * is `dialog`, which needs a name. It is placed next to the trigger, flips when there's no room
 * and scrolls inside when it is too tall (`--kv-popup-max-height`). Escape and a press outside
 * close it, and opening never moves focus: move it yourself, in an effect after the popup is open, if the pattern calls for it.
 */
export function PopoverPopup({ render, ref, ...otherProps }: PopoverPopupProps): ReactElement {
  const popover = useContext(PopoverContext)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(useMergedRef(ref, popover?.popupProps.ref ?? null), elementRef)
  useEffect(() => {
    if (popover === null) {
      warnOutsideRoot('Popup')
    }
  }, [popover])
  useEffect(() => {
    const element = elementRef.current
    if (
      element !== null &&
      !(
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.hasAttribute('title')
      )
    ) {
      warnOnce(
        'popover-popup-without-name',
        'A Popover.Popup has no accessible name. Its role is "dialog", which needs one (WCAG 4.1.2): give it aria-label, or aria-labelledby that points at a heading inside it.',
      )
    }
  })
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, popover?.popupProps ?? {}),
      ref: mergedRef,
    },
    state: { isOpen: popover?.isOpen ?? false },
  })
}
PopoverPopup.displayName = 'Popover.Popup'

/**
 * A `<button>` that closes the popover. Focus goes back to the trigger. Give it a visible label,
 * or an `aria-label` from your translations when it only holds an icon.
 */
export function PopoverClose({ render, ref, ...otherProps }: PopoverCloseProps): ReactElement {
  const popover = useContext(PopoverContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (popover === null) {
      warnOutsideRoot('Close')
    }
  }, [popover])
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, popover?.closeProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
    state: { isOpen: popover?.isOpen ?? false },
  })
}
PopoverClose.displayName = 'Popover.Close'

/** A popover: a trigger that opens a popup in the top layer, placed next to it. */
export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Popup: PopoverPopup,
  Close: PopoverClose,
} as const
