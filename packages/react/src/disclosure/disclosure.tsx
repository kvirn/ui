'use client'
import { useContext, useEffect } from 'react'
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { DisclosureContext, DisclosureOwnerContext } from './disclosure-context.ts'
import { useDisclosure } from './use-disclosure.ts'
import type { UseDisclosureOptions } from './use-disclosure.ts'

export type { DisclosureChangeDetails, DisclosureChangeReason } from './use-disclosure.ts'

/** The open and disabled state of a disclosure. */
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
export type DisclosureTriggerProps = Omit<
  ComponentPropsWithRef<'button'>,
  'id' | 'type' | 'aria-expanded' | 'aria-controls' | 'aria-disabled' | 'disabled'
>

/** `id` is left out: the Disclosure sets it, because the trigger's `aria-controls` points at it. */
export type DisclosurePanelProps = Omit<ComponentPropsWithRef<'div'>, 'id' | 'hidden'>

function warnOutsideRoot(owner: 'Disclosure' | 'Accordion', part: string): void {
  if (owner === 'Accordion') {
    warnOnce(
      `accordion-${part.toLowerCase()}-outside-root`,
      `An Accordion.${part} is outside an Accordion.Item, so it opens and closes nothing. Put it inside <Accordion.Item>.`,
    )
    return
  }
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
  ref,
  children,
  onClick,
  ...otherProps
}: DisclosureTriggerProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const owner = useContext(DisclosureOwnerContext)

  useEffect(() => {
    if (disclosure === null) {
      warnOutsideRoot(owner, 'Trigger')
    }
  }, [disclosure, owner])

  const isDisabled = disclosure?.isDisabled ?? false
  // The consumer's handler runs only while enabled: merging can't block it.
  const gatedOnClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return
    }
    onClick?.(event)
  }
  const isOpen = disclosure?.isOpen ?? false

  return (
    <button
      {...mergeProps(otherProps, disclosure?.triggerProps ?? { type: 'button' as const }, {
        onClick: gatedOnClick,
      })}
      ref={ref}
    >
      {children}
      <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="kv-disclosure-icon" />
    </button>
  )
}
DisclosureTrigger.displayName = 'Disclosure.Trigger'

/**
 * The content the trigger reveals: a `<div>` that is `hidden` while closed (or `until-found` with
 * `hiddenUntilFound` on the Root). It is always rendered, so `aria-controls` resolves, and its
 * content is in the Tab order only while it is open. Render it right after the trigger.
 */
export function DisclosurePanel({ ref, ...otherProps }: DisclosurePanelProps): ReactElement {
  const disclosure = useContext(DisclosureContext)
  const owner = useContext(DisclosureOwnerContext)
  const mergedRef = useMergedRef(ref, disclosure?.panelProps.ref ?? null)
  useEffect(() => {
    if (disclosure === null) {
      warnOutsideRoot(owner, 'Panel')
    }
  }, [disclosure, owner])
  return <div {...mergeProps(otherProps, disclosure?.panelProps ?? {})} ref={mergedRef} />
}
DisclosurePanel.displayName = 'Disclosure.Panel'

/** A button that shows and hides a panel of content (APG Disclosure). For a list of them, see Accordion. */
export const Disclosure = {
  Root: DisclosureRoot,
  Trigger: DisclosureTrigger,
  Panel: DisclosurePanel,
} as const
