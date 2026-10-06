import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { MouseEvent, RefCallback } from 'react'
import { useButton } from '../button/use-button.ts'
import type { ButtonPartProps, UseButtonOptions } from '../button/use-button.ts'

/** Why the disclosure opened or closed, in the second argument of `onOpenChange`. */
export type DisclosureChangeReason = 'trigger-press' | 'find-in-page'

/** What `onOpenChange` gets besides the new state: why, and the event behind it. */
export type DisclosureChangeDetails =
  | { reason: 'trigger-press'; event: MouseEvent<HTMLButtonElement> }
  | { reason: 'find-in-page'; event: Event }

export interface UseDisclosureOptions extends Pick<
  UseButtonOptions,
  'disabled' | 'focusableWhenDisabled' | 'onClick'
> {
  /** Controlled: whether the panel is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the panel starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /**
   * Called when the user opens or closes the panel, with the new state and `{ reason, event }`.
   * It only reports: with `open` set, you change `open` yourself. `'trigger-press'` is a click,
   * Enter or Space on the trigger, and `'find-in-page'` is the browser revealing a match (see
   * `hiddenUntilFound`). Never called for a trigger press while disabled.
   */
  onOpenChange?: ((open: boolean, details: DisclosureChangeDetails) => void) | undefined
  /**
   * Keeps a closed panel's text findable with the browser's find-in-page and `#fragment` links
   * (`hidden="until-found"`). The browser then reveals the panel by itself, and the hook reports
   * `open` with the reason `'find-in-page'`. Default `false`: a closed panel is `hidden`. A
   * browser without support treats it as `hidden`, so nothing is lost.
   */
  hiddenUntilFound?: boolean | undefined
}

/** Spread on the disclosure's button: a `<button>`. */
export interface DisclosureTriggerPartProps extends Omit<ButtonPartProps, 'className'> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-disclosure-trigger`. Add a
   * class of your own next to it with `mergeProps`: class names join.
   */
  className: 'kv-disclosure-trigger'
  id: string
  type: 'button'
  'aria-expanded': boolean
  /** The id of the panel. The panel is always rendered, so it resolves on every render. */
  'aria-controls': string
  'data-open'?: ''
}

/** Spread on the revealed content: a `<div>`. */
export interface DisclosurePanelPartProps {
  /** The part's class: `.kv-disclosure-panel`. */
  className: 'kv-disclosure-panel'
  id: string
  /**
   * Set while closed. With `hiddenUntilFound` the hook then writes the value `until-found` on the
   * element after each render, so find-in-page can reveal it. React renders `hidden` as a
   * boolean attribute and drops the string, so the server markup says plain `hidden`.
   */
  hidden?: true
  'data-open'?: ''
  /** Listens for the browser revealing the panel. Only attached with `hiddenUntilFound`. */
  ref: RefCallback<HTMLElement>
}

export interface UseDisclosureResult {
  triggerProps: DisclosureTriggerPartProps
  panelProps: DisclosurePanelPartProps
  isOpen: boolean
  isDisabled: boolean
  /** `true` while the trigger has keyboard (`:focus-visible`) focus. */
  isFocusVisible: boolean
  triggerId: string
  panelId: string
}

/**
 * A disclosure's behaviour for your own button and panel (APG Disclosure, contract:
 * disclosure.a11y.md). The trigger is a native `<button>` with `aria-expanded` and
 * `aria-controls`, and the panel is `hidden` while closed. Enter and Space are the button's own,
 * and opening never moves focus. Name the trigger with visible text that does not change with the
 * state: it says what the panel holds, and `aria-expanded` says whether it is open.
 *
 * @example
 * const disclosure = useDisclosure({ defaultOpen: false })
 * <button {...disclosure.triggerProps}>Öppettider</button>
 * <div {...disclosure.panelProps}>Måndag till fredag 10–19.</div>
 */
export function useDisclosure({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hiddenUntilFound = false,
  disabled,
  focusableWhenDisabled,
  onClick,
}: UseDisclosureOptions = {}): UseDisclosureResult {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen
  const id = useId()
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`

  const change = (next: boolean, details: DisclosureChangeDetails) => {
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next, details)
  }

  // Through useButton, so a disabled disclosure never toggles and never calls a handler.
  const button = useButton({
    disabled,
    focusableWhenDisabled,
    type: 'button',
    onClick: (event) => {
      change(!isOpen, { reason: 'trigger-press', event })
      onClick?.(event)
    },
  })

  // The listener is attached once per element, and reads the latest `change` and state.
  const latest = useRef({ change, isOpen })
  useEffect(() => {
    latest.current = { change, isOpen }
  })
  // Detaches on a null call, because a ref merged with the consumer's can't return a cleanup.
  const attached = useRef<{ element: HTMLElement; reveal: (event: Event) => void } | null>(null)
  const panelElement = useRef<HTMLElement | null>(null)
  const panelRef = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      panelElement.current = element
      if (attached.current !== null) {
        attached.current.element.removeEventListener('beforematch', attached.current.reveal)
        attached.current = null
      }
      if (element === null || !hiddenUntilFound) {
        return
      }
      const reveal = (event: Event) => {
        if (!latest.current.isOpen) {
          latest.current.change(true, { reason: 'find-in-page', event })
          // The browser removes `hidden` after this event. A controlled consumer that keeps the
          // state closed never re-renders, so put it back once the browser is done, or the
          // panel shows under aria-expanded="false". It reads the committed DOM, not `latest`,
          // which only catches up in a passive effect and can still say closed after the commit.
          setTimeout(() => {
            if (!element.hasAttribute('data-open') && element.isConnected && !element.hidden) {
              element.setAttribute('hidden', 'until-found')
            }
          })
        }
      }
      element.addEventListener('beforematch', reveal)
      attached.current = { element, reveal }
    },
    [hiddenUntilFound],
  )

  // React sets `hidden` as a boolean attribute, so the value `until-found` is written here.
  useEffect(() => {
    const element = panelElement.current
    if (element !== null && hiddenUntilFound && !isOpen && element.hidden) {
      element.setAttribute('hidden', 'until-found')
    }
  })

  return {
    triggerProps: {
      ...button.buttonProps,
      className: 'kv-disclosure-trigger',
      id: triggerId,
      type: 'button',
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      ...(isOpen ? { 'data-open': '' as const } : {}),
    },
    panelProps: {
      className: 'kv-disclosure-panel',
      id: panelId,
      ...(isOpen ? { 'data-open': '' as const } : {}),
      ...(isOpen ? {} : { hidden: true }),
      ref: panelRef,
    },
    isOpen,
    isDisabled: button.isDisabled,
    isFocusVisible: button.isFocusVisible,
    triggerId,
    panelId,
  }
}
