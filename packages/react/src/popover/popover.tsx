'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ElementType, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsComponent, AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { ToolbarContext } from '../toolbar/toolbar-context.ts'
import { usePopover } from './use-popover.ts'
import type { UsePopoverOptions, UsePopoverResult } from './use-popover.ts'

export type { PopoverChangeDetails, PopoverChangeReason } from './use-popover.ts'

const popupTags = ['div', 'section'] as const

export interface PopoverRootProps extends UsePopoverOptions {
  children?: ReactNode
}

/**
 * `as` is a component that renders a focusable control, such as `as={Button}`: its props are plain
 * props of the trigger. Without `as` it is a `<button type="button">`.
 */
export type PopoverTriggerProps<Component extends ElementType = 'button'> = AsComponent<Component>

/** `as` is `div` (default) or `section`. The role is `dialog` either way. */
export type PopoverPopupProps = AsTag<(typeof popupTags)[number], 'div'>

/** `as` is a component that renders a button, such as `as={Button}`. */
export type PopoverCloseProps<Component extends ElementType = 'button'> = AsComponent<Component>

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
export function PopoverTrigger<Component extends ElementType = 'button'>(
  props: PopoverTriggerProps<Component>,
): ReactElement
export function PopoverTrigger({
  as,
  ref,
  ...otherProps
}: PopoverTriggerProps<'button'>): ReactElement {
  const popover = useContext(PopoverContext)
  const mergedRef = useMergedRef(ref, popover?.triggerProps.ref ?? null)
  useEffect(() => {
    if (popover === null) {
      warnOutsideRoot('Trigger')
    }
  }, [popover])
  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, popover?.triggerProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
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
export function PopoverPopup({ as, ref, ...otherProps }: PopoverPopupProps): ReactElement {
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
  // The popup holds a form or other content, never toolbar items. A Popover trigger can be a
  // Toolbar.Item, so the popup sits in the toolbar's React tree: leave it, so a ButtonGroup or a
  // Listbox in it doesn't act as if it were in the toolbar (Plan 0036).
  return (
    <ToolbarContext.Provider value={null}>
      {renderPart({
        as: resolveAsTag({ part: 'Popover.Popup', as, allowedTags: popupTags }),
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, popover?.popupProps ?? {}),
          ref: mergedRef,
        },
      })}
    </ToolbarContext.Provider>
  )
}
PopoverPopup.displayName = 'Popover.Popup'

/**
 * A `<button>` that closes the popover. Focus goes back to the trigger. Give it a visible label,
 * or an `aria-label` from your translations when it only holds an icon.
 */
export function PopoverClose<Component extends ElementType = 'button'>(
  props: PopoverCloseProps<Component>,
): ReactElement
export function PopoverClose({
  as,
  ref,
  ...otherProps
}: PopoverCloseProps<'button'>): ReactElement {
  const popover = useContext(PopoverContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (popover === null) {
      warnOutsideRoot('Close')
    }
  }, [popover])
  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, popover?.closeProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
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
