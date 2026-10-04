import { getRovingTarget } from '@kvirn-ui/core'
import type { RovingOrientation } from '@kvirn-ui/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEventHandler, KeyboardEvent, RefCallback } from 'react'

export interface UseToolbarOptions {
  /**
   * The axis of the arrow keys. `'horizontal'` (default) uses Left and Right, which flip in
   * right-to-left text. `'vertical'` uses Down and Up and sets `aria-orientation`.
   */
  orientation?: RovingOrientation | undefined
  /** Whether the arrows wrap from the last control to the first, and back. Default `true`, as in APG's example. */
  loop?: boolean | undefined
}

/** Spread on the toolbar's element: a `<div>`. */
export interface ToolbarRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-toolbar`. Add a class of your
   * own next to it with `mergeProps`: class names join.
   */
  className: 'kv-toolbar'
  role: 'toolbar'
  /** Only set when vertical: horizontal is the default of the role. */
  'aria-orientation'?: 'vertical'
  /** Sets the element the hook reads and watches. A callback, so a new element is picked up. */
  ref: RefCallback<HTMLDivElement>
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

/** Spread on a control that is one of the toolbar's items: a roving tabindex, and its registration. */
export interface ToolbarItemPartProps {
  /** Registers the element while it is mounted. The same function for the same key, so React never detaches it between renders. */
  ref: RefCallback<HTMLElement>
  /**
   * `0` for the one control the Tab key reaches, `-1` for the rest. A natively disabled control is
   * never the Tab stop. Before any item has registered (a server render), every item is `0`, so the
   * toolbar degrades to ordinary buttons.
   */
  tabIndex: 0 | -1
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseToolbarResult {
  toolbarProps: ToolbarRootPartProps
  /**
   * The props of one item. `key` names it and is the same on every render: a part uses
   * `useId()`, a list uses its own ids. Items are ordered by their place in the page, not by
   * the order they are registered in.
   */
  getItemProps: (key: string) => ToolbarItemPartProps
  orientation: RovingOrientation
  /** How many items are mounted. It lags the first render by one commit, because items register after it. */
  itemCount: number
}

interface ToolbarEntry {
  key: string
  element: HTMLElement
}

interface ActiveItem {
  key: string
  /** Where it was in the order when it had focus, so its neighbour can take over when it unmounts. */
  index: number
}

const nonTextInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/** `input` of a text type, `textarea` and `contenteditable`: they own the arrow keys, Home and End. */
function isTextEntry(target: EventTarget): boolean {
  const element = target as Partial<HTMLElement>
  if (element.nodeType !== 1) {
    return false
  }
  if (element.isContentEditable === true || element.tagName === 'TEXTAREA') {
    return true
  }
  return (
    element.tagName === 'INPUT' &&
    !nonTextInputTypes.has((element as HTMLInputElement).type.toLowerCase())
  )
}

function sortInDocumentOrder(entries: ToolbarEntry[]): ToolbarEntry[] {
  return [...entries].sort((first, second) => {
    if (first.element === second.element) {
      return 0
    }
    return first.element.compareDocumentPosition(second.element) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1
  })
}

const orderSeparator = '\n'

function splitKeys(joined: string): string[] {
  return joined === '' ? [] : joined.split(orderSeparator)
}

/**
 * The one item that gets `tabindex="0"`: the last focused one if it is still there and enabled,
 * else the next enabled one in DOM order (the one that took its place if it unmounted), else the
 * nearest enabled one before it. `undefined` only when every item is natively disabled.
 */
function chooseTabStop(
  keys: string[],
  disabledKeys: ReadonlySet<string>,
  active: ActiveItem | null,
): string | undefined {
  const activeIndex = active === null ? -1 : keys.indexOf(active.key)
  const activeKey = activeIndex === -1 ? undefined : keys[activeIndex]
  if (activeKey !== undefined && !disabledKeys.has(activeKey)) {
    return activeKey
  }
  const forwardStart = activeIndex === -1 ? (active?.index ?? 0) : activeIndex + 1
  for (let index = forwardStart; index < keys.length; index += 1) {
    const key = keys[index]
    if (key !== undefined && !disabledKeys.has(key)) {
      return key
    }
  }
  for (let index = Math.min(forwardStart, keys.length) - 1; index >= 0; index -= 1) {
    const key = keys[index]
    if (key !== undefined && !disabledKeys.has(key)) {
      return key
    }
  }
  return undefined
}

/**
 * A toolbar's props for your own elements (APG Toolbar, contract: toolbar.a11y.md): one Tab stop
 * with a roving tabindex, and the arrow keys, Home and End between the controls.
 *
 * - **One Tab stop.** The item that last had focus has `tabindex="0"` (the first, before any
 *   has), the others `-1`. If the active item unmounts or becomes natively disabled, the next
 *   enabled one takes over (and focus moves to it from a disabled one). Before the items have
 *   registered (a server render) every item is `0`, so the toolbar degrades to ordinary buttons.
 * - **Arrows** move to the next and previous item across groups and rows (Left and Right,
 *   flipped in right-to-left text, or Down and Up when vertical), Home and End to the ends, and
 *   wrap unless `loop` is `false`. Direction is read from the toolbar's computed `direction`.
 * - **Nothing else is taken:** a key with Control, Alt, Meta or Shift, a key an item already
 *   handled (`defaultPrevented`), a key from a text field, `textarea` or `contenteditable`, and a
 *   key from an element that isn't an item (a popup next to its trigger) are left alone.
 * - **Disabled items stay focusable** with `aria-disabled` (`useButton`'s `focusableWhenDisabled`).
 *   A natively disabled item can't take focus, so the arrows skip it and it is never the Tab
 *   stop. When every item is natively disabled there is no Tab stop: the toolbar leaves the Tab
 *   order. The hook watches the `disabled` attribute, so it needs no other signal.
 * - **Name it** with `aria-label` or `aria-labelledby`. APG: use a toolbar for three or more controls.
 *
 * @example
 * const toolbar = useToolbar()
 * <div {...toolbar.toolbarProps} aria-label="Formatering">
 *   <button {...toolbar.getItemProps('bold')}>Fet</button>
 * </div>
 */
export function useToolbar({
  orientation = 'horizontal',
  loop = true,
}: UseToolbarOptions = {}): UseToolbarResult {
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  /** The toolbar element as state, so the observer follows it if it mounts later or is swapped. */
  const [toolbarElement, setToolbarElement] = useState<HTMLDivElement | null>(null)
  const toolbarRefCallback = useCallback<RefCallback<HTMLDivElement>>((element) => {
    toolbarRef.current = element
    setToolbarElement(element)
  }, [])
  /** The registered items in DOM order. Handlers read it, so they never see a stale list. */
  const entriesRef = useRef<ToolbarEntry[]>([])
  /** One ref callback per key, so a part's ref doesn't change between renders. */
  const refCallbacksRef = useRef(new Map<string, RefCallback<HTMLElement>>())
  /**
   * The keys in order, as one string: registering again (React detaches and attaches a ref when a
   * consumer's inline ref changes) writes the same string, which React bails out of.
   */
  const [order, setOrder] = useState('')
  /** The keys of the natively disabled items, as one string for the same reason. */
  const [disabledOrder, setDisabledOrder] = useState('')
  const [active, setActive] = useState<ActiveItem | null>(null)
  /** The same as `active`, for the observer, which must not read a stale render. */
  const activeRef = useRef<ActiveItem | null>(null)
  /** The item that has focus, kept while it becomes disabled and the browser blurs it. */
  const focusedKeyRef = useRef<string | null>(null)

  const keys = splitKeys(order)
  // Never a natively disabled item. `undefined` when every item is disabled, or none has registered.
  const tabStopKey = chooseTabStop(keys, new Set(splitKeys(disabledOrder)), active)

  const publishOrder = useCallback(() => {
    const entries = entriesRef.current
    setOrder(entries.map((entry) => entry.key).join(orderSeparator))
    setDisabledOrder(
      entries
        .filter((entry) => entry.element.matches(':disabled'))
        .map((entry) => entry.key)
        .join(orderSeparator),
    )
  }, [])

  // A control that becomes natively disabled can no longer hold focus or the Tab stop: pick the
  // new one, and move focus there if the disabled control had it, so it isn't lost to the page.
  const handleDisabledChange = useCallback(() => {
    publishOrder()
    const focusedKey = focusedKeyRef.current
    const entries = entriesRef.current
    const focused = entries.find((entry) => entry.key === focusedKey)
    if (focused === undefined || !focused.element.matches(':disabled')) {
      return
    }
    focusedKeyRef.current = null
    const ownerDocument = focused.element.ownerDocument
    const holder = ownerDocument.activeElement
    if (holder !== focused.element && holder !== ownerDocument.body && holder !== null) {
      return
    }
    const disabledKeys = new Set(
      entries.filter((entry) => entry.element.matches(':disabled')).map((entry) => entry.key),
    )
    const nextKey = chooseTabStop(
      entries.map((entry) => entry.key),
      disabledKeys,
      activeRef.current,
    )
    entries.find((entry) => entry.key === nextKey)?.element.focus()
  }, [publishOrder])

  useEffect(() => {
    const ObserverConstructor = toolbarElement?.ownerDocument.defaultView?.MutationObserver
    if (toolbarElement === null || ObserverConstructor === undefined) {
      return
    }
    const observer = new ObserverConstructor(handleDisabledChange)
    observer.observe(toolbarElement, {
      attributes: true,
      attributeFilter: ['disabled'],
      subtree: true,
    })
    return () => observer.disconnect()
  }, [toolbarElement, handleDisabledChange])

  const getRefCallback = (key: string): RefCallback<HTMLElement> => {
    const known = refCallbacksRef.current.get(key)
    if (known !== undefined) {
      return known
    }
    const callback: RefCallback<HTMLElement> = (element) => {
      if (element === null) {
        return
      }
      entriesRef.current = sortInDocumentOrder([
        ...entriesRef.current.filter((entry) => entry.key !== key),
        { key, element },
      ])
      publishOrder()
      return () => {
        entriesRef.current = entriesRef.current.filter((entry) => entry.element !== element)
        // Only forget this callback: a newer one for the same key may have replaced it already.
        if (refCallbacksRef.current.get(key) === callback) {
          refCallbacksRef.current.delete(key)
        }
        publishOrder()
      }
    }
    refCallbacksRef.current.set(key, callback)
    return callback
  }

  return {
    orientation,
    itemCount: keys.length,
    toolbarProps: {
      className: 'kv-toolbar',
      role: 'toolbar',
      ...(orientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}),
      ref: toolbarRefCallback,
      onKeyDown: (event) => {
        const toolbar = toolbarRef.current
        if (
          toolbar === null ||
          event.defaultPrevented ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextEntry(event.target)
        ) {
          return
        }
        // A natively disabled item can't take focus, so it isn't a stop.
        const stops = entriesRef.current.filter((entry) => !entry.element.matches(':disabled'))
        const target = event.target as Node
        const currentIndex = stops.findIndex(
          (entry) => entry.element === target || entry.element.contains(target),
        )
        if (currentIndex === -1) {
          return
        }
        const view = toolbar.ownerDocument.defaultView
        const next = getRovingTarget({
          key: event.key,
          currentIndex,
          count: stops.length,
          orientation,
          direction: view?.getComputedStyle(toolbar).direction === 'rtl' ? 'rtl' : 'ltr',
          loop,
        })
        if (next === null) {
          return
        }
        event.preventDefault()
        stops[next]?.element.focus()
      },
    },
    getItemProps: (key) => ({
      ref: getRefCallback(key),
      // Before anything has registered, every item is an ordinary Tab stop.
      tabIndex: keys.length === 0 || key === tabStopKey ? 0 : -1,
      onFocus: () => {
        const item = {
          key,
          index: Math.max(
            0,
            entriesRef.current.findIndex((entry) => entry.key === key),
          ),
        }
        focusedKeyRef.current = key
        activeRef.current = item
        setActive(item)
      },
      onBlur: (event) => {
        // Two blurs keep the item as the focused one: the browser's own, on a control that became
        // disabled (so the observer can move focus on), and the window losing focus, where the
        // element is still the active one. Any other blur means focus went somewhere else.
        const element = event.currentTarget
        const isStillActive = element.ownerDocument.activeElement === element
        if (event.relatedTarget !== null || !(element.matches(':disabled') || isStillActive)) {
          focusedKeyRef.current = null
        }
      },
    }),
  }
}
