import type { ResolvedMessages } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseTagGroupOptions {
  /**
   * Say `tag.removed` (polite) when a tag is removed. Default `true`. Set `false` when you
   * announce one combined message yourself, because the live region keeps only the last one.
   */
  announceRemoval?: boolean | undefined
  /**
   * Where focus goes when no remove button is left. Default: the group's label, which gets
   * `tabindex="-1"` for the purpose. Return a focusable element (a button, or one with
   * `tabindex="-1"`) that is in the page after the removal; if it can't take focus the label is used.
   */
  focusFallback?: (() => HTMLElement | null) | undefined
  /** Replaces the group's `tag` messages for this instance. */
  messages?: Partial<KvirnMessages['tag']> | undefined
}

export interface UseTagGroupResult {
  /** The id of the label: set it on the label and as `aria-labelledby` on the list. */
  labelId: string
  /** Attach to the label, the default focus fallback. */
  labelRef: RefCallback<HTMLElement>
  /** Attach to the list, so the group can find the remove buttons around a removed tag. */
  listRef: RefCallback<HTMLElement>
  /** Whether the list has a tag. For the empty text and Clear all. */
  hasItems: boolean
  /** Called by the list as its items change. */
  setHasItems: (hasItems: boolean) => void
  /**
   * Call first in a remove button's click handler, before your state changes: it notes the
   * neighbouring button, announces the removal and moves focus after the next render. Your
   * state must change in the same event.
   */
  prepareRemoval: (button: HTMLElement, label: string | undefined) => void
  /** Like `prepareRemoval` for a button that removes every tag: focus goes to the fallback. */
  prepareClear: () => void
  /** The resolved `tag` messages. */
  messages: ResolvedMessages<KvirnMessages['tag']>
}

/** Internal. The attribute that marks a remove button, so the group finds its neighbours. */
export const removeButtonAttribute = 'data-kv-tag-remove'

type PendingFocus = {
  buttons: HTMLElement[]
  target: HTMLElement | undefined
  label: string | undefined
}

/**
 * The focus-after-removal rule and the removal announcement of a group of tags, for your own
 * markup (contract: tag.a11y.md). Focus never lands on `body` (2.4.3): after a removal it goes to
 * the next remove button, else the previous, else the fallback.
 *
 * @example
 * const group = useTagGroup()
 * <span id={group.labelId} ref={group.labelRef}>Valda filter</span>
 * <ul ref={group.listRef} aria-labelledby={group.labelId}>…</ul>
 */
export function useTagGroup({
  announceRemoval = true,
  focusFallback,
  messages: instanceMessages,
}: UseTagGroupOptions = {}): UseTagGroupResult {
  const labelId = useId()
  const messages = useMessages('tag', instanceMessages)
  const { announce, isAvailable } = useQuietAnnouncer()
  const labelElement = useRef<HTMLElement | null>(null)
  const listElement = useRef<HTMLElement | null>(null)
  const labelRef = useCallback((element: HTMLElement | null) => {
    labelElement.current = element
  }, [])
  const listRef = useCallback((element: HTMLElement | null) => {
    listElement.current = element
  }, [])
  // True at first, so tags rendered on the server don't sit beside the empty text; the list
  // reports an empty list in a layout effect.
  const [hasItems, setHasItems] = useState(true)
  // A state change makes the group render after the consumer's, so the layout effect below runs
  // once the removed tag is gone.
  const [, setRevision] = useState(0)
  const pending = useRef<PendingFocus | undefined>(undefined)

  useEffect(() => {
    if (labelElement.current === null && focusFallback === undefined) {
      warnOnce(
        'tag-group-without-label',
        'A TagGroup has no TagGroup.Label and no `focusFallback`, so after the last tag is removed focus has nowhere to go and the list has no accessible name. Render a TagGroup.Label, or pass `focusFallback`.',
      )
    }
  }, [focusFallback])

  useLayoutEffect(() => {
    const focus = pending.current
    if (focus === undefined) {
      return
    }
    pending.current = undefined
    // A removal the consumer refused leaves the buttons in place: nothing moves, nothing is said.
    if (focus.buttons.some((button) => button.isConnected)) {
      return
    }
    if (focus.buttons.length === 0) {
      return
    }
    if (focus.label !== undefined && announceRemoval) {
      if (isAvailable) {
        announce(messages.removed({ label: focus.label }))
      } else {
        warnAnnouncerMissing()
      }
    }
    if (focus.target?.isConnected === true) {
      focus.target.focus()
      return
    }
    const custom = focusFallback?.()
    custom?.focus()
    if (custom !== null && custom !== undefined && document.activeElement === custom) {
      return
    }
    if (custom !== null && custom !== undefined) {
      warnOnce(
        'tag-focus-fallback-not-focusable',
        'The element `focusFallback` returned did not take focus, so the group label is used. Return a focusable element (a button, or an element with tabindex="-1") that is in the page after the removal.',
      )
    }
    const label = labelElement.current
    if (label !== null) {
      label.setAttribute('tabindex', '-1')
      label.focus()
    }
  })

  const removeButtons = () => [
    ...(listElement.current?.querySelectorAll<HTMLElement>(`[${removeButtonAttribute}]`) ?? []),
  ]

  const prepareRemoval = useCallback((button: HTMLElement, label: string | undefined) => {
    const buttons = removeButtons()
    const index = buttons.indexOf(button)
    pending.current = {
      buttons: [button],
      target: buttons[index + 1] ?? buttons[index - 1],
      label,
    }
    setRevision((revision) => revision + 1)
  }, [])

  const prepareClear = useCallback(() => {
    // The items, not the remove buttons: a list of static tags has none, and Clear all still goes.
    pending.current = {
      buttons: [...(listElement.current?.children ?? [])] as HTMLElement[],
      target: undefined,
      label: undefined,
    }
    setRevision((revision) => revision + 1)
  }, [])

  return {
    labelId,
    labelRef,
    listRef,
    hasItems,
    setHasItems,
    prepareRemoval,
    prepareClear,
    messages,
  }
}
