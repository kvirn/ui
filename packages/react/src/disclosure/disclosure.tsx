'use client'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { DisclosureContext } from './disclosure-context.ts'
import { useDisclosure } from './use-disclosure.ts'
import type { UseDisclosureOptions } from './use-disclosure.ts'

export type { DisclosureChangeDetails, DisclosureChangeReason } from './use-disclosure.ts'

/** What `render` receives as its second argument, for every part. */
export interface DisclosureState {
  isOpen: boolean
  isDisabled: boolean
}

export interface DisclosureRootProps extends UseDisclosureOptions {
  children?: ReactNode
}

/**
 * `id`, `type` and the `aria-expanded` and `aria-controls` pair are left out: the Disclosure sets
 * them, so the trigger and the panel always point at each other.
 */
export interface DisclosureTriggerProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'id' | 'type' | 'aria-expanded' | 'aria-controls' | 'aria-disabled' | 'disabled'
> {
  /**
   * Change the element. It must still be a `<button>` and forward its ref. An element's own
   * `onClick` is gated like the trigger's. The function form spreads the props it gets, and you
   * add the chevron yourself.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, DisclosureState> | undefined
}

/** `id` is left out: the Disclosure sets it, because the trigger's `aria-controls` points at it. */
export interface DisclosurePanelProps extends Omit<ComponentPropsWithRef<'div'>, 'id' | 'hidden'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, DisclosureState> | undefined
}

function warnOutsideRoot(part: string): void {
  warnOnce(
    `disclosure-${part.toLowerCase()}-outside-root`,
    `A Disclosure.${part} is outside a Disclosure.Root, so it opens and closes nothing. Put it inside <Disclosure.Root>.`,
  )
}

/**
 * Owns the open state of a disclosure (contract: disclosure.a11y.md). It renders no element: put
 * a `Disclosure.Trigger` and its `Disclosure.Panel` inside it, the panel right after the trigger.
 * Open it from state with `open` and `onOpenChange`, or let it keep its own with `defaultOpen`.
 *
 * @example
 * <Disclosure.Root>
 *   <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
 *   <Disclosure.Panel>Måndag till fredag 10–19.</Disclosure.Panel>
 * </Disclosure.Root>
 */
export function DisclosureRoot({ children, ...options }: DisclosureRootProps): ReactElement {
  const disclosure = useDisclosure(options)
  return <DisclosureContext.Provider value={disclosure}>{children}</DisclosureContext.Provider>
}
DisclosureRoot.displayName = 'Disclosure.Root'

/**
 * The `<button>` that opens and closes the panel, with `aria-expanded` and `aria-controls`, and a
 * decorative chevron at the inline end that points down while closed and up while open. Enter and
 * Space work natively. **Name it with text that says what the panel holds** and never changes with
 * the state: `aria-expanded` says whether it is open.
 */
export function DisclosureTrigger({
  render,
  ref,
  children,
  onClick,
  ...otherProps
}: DisclosureTriggerProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const { render: renderWithoutClick, takenProps } = takeRenderElementProps(render, ['onClick'])
  const elementOnClick = takenProps.onClick

  useEffect(() => {
    if (disclosure === null) {
      warnOutsideRoot('Trigger')
      return
    }
    const element = elementRef.current
    if (element === null || element.tagName !== 'BUTTON') {
      const rendered =
        element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `disclosure-not-a-button:${rendered}`,
        `<Disclosure.Trigger render> must render a <button> and forward its ref, but it rendered ${rendered}. The trigger's role, keyboard activation and disabled state come from the native element.`,
      )
    }
  })

  const isDisabled = disclosure?.isDisabled ?? false
  // The consumer's and the element's handlers run only while enabled: merging can't block them.
  const gatedOnClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return
    }
    onClick?.(event)
    if (typeof elementOnClick === 'function') {
      elementOnClick(event)
    }
  }
  const isOpen = disclosure?.isOpen ?? false

  return renderPart({
    render: renderWithoutClick,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(
        otherProps,
        disclosure?.triggerProps ?? { type: 'button' as const },
        { onClick: gatedOnClick },
        {
          children: (
            <>
              {children}
              <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="kv-disclosure-icon" />
            </>
          ),
        },
      ),
      ref: mergedRef,
    },
    state: { isOpen, isDisabled },
  })
}
DisclosureTrigger.displayName = 'Disclosure.Trigger'

/**
 * The content the trigger reveals: a `<div>` that is `hidden` while closed (or `until-found` with
 * `hiddenUntilFound` on the Root). It is always rendered, so `aria-controls` resolves, and its
 * content is in the Tab order only while it is open. Render it right after the trigger.
 */
export function DisclosurePanel({
  render,
  ref,
  ...otherProps
}: DisclosurePanelProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const mergedRef = useMergedRef(ref, disclosure?.panelProps.ref ?? null)
  useEffect(() => {
    if (disclosure === null) {
      warnOutsideRoot('Panel')
    }
  }, [disclosure])
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, disclosure?.panelProps ?? {}), ref: mergedRef },
    state: { isOpen: disclosure?.isOpen ?? false, isDisabled: disclosure?.isDisabled ?? false },
  })
}
DisclosurePanel.displayName = 'Disclosure.Panel'

/** A button that shows and hides a panel of content (APG Disclosure). For a list of them, see Accordion. */
export const Disclosure = {
  Root: DisclosureRoot,
  Trigger: DisclosureTrigger,
  Panel: DisclosurePanel,
} as const
