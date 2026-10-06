'use client'
import type { ToastEntry } from '@kvirn-ui/core'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { readText } from '../alert/use-alert.ts'
import { Alert } from '../alert/alert.tsx'
import { useQuietAnnouncer } from '../announcer/use-announcer.ts'
import { Button } from '../button/button.tsx'
import { useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { useEnv } from '../provider/use-env.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useStoreSelector } from '../store/use-store-selector.ts'
import type { ToastController } from './toast-controller.ts'

const selectVisible = (state: { visible: ToastEntry[] }) => state.visible
const selectPaused = (state: { paused: boolean }) => state.paused

interface ToastItemProps {
  controller: ToastController
  entry: ToastEntry
  isPaused: boolean
}

/** Internal. One toast: an Alert's parts in a list item, with a Close that is never optional. */
function ToastItem({ controller, entry, isPaused }: ToastItemProps) {
  const { id, timer } = entry
  const content = controller.contentOf(id)
  const { locale } = useLocale()
  const itemRef = useRef<HTMLLIElement | null>(null)
  const [hasFocus, setHasFocus] = useState(false)
  const setItem = useCallback(
    (element: HTMLLIElement | null) => {
      itemRef.current = element
      controller.registerItem(id, element)
    },
    [controller, id],
  )

  useEffect(() => {
    const item = itemRef.current
    if (item === null) {
      return
    }
    const onFocusIn = () => {
      setHasFocus(true)
    }
    const onFocusOut = (event: globalThis.FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !item.contains(event.relatedTarget)) {
        setHasFocus(false)
      }
    }
    item.addEventListener('focusin', onFocusIn)
    item.addEventListener('focusout', onFocusOut)
    return () => {
      item.removeEventListener('focusin', onFocusIn)
      item.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // A layer only while focus is inside, so Escape elsewhere is never taken.
  useDismissableLayer({
    open: hasFocus,
    ref: itemRef,
    dismissOnOutsidePress: false,
    // A press outside still reaches a Popover or Menu underneath that light-dismisses.
    passOutsidePressThrough: true,
    onDismiss: () => {
      controller.dismiss(id)
    },
  })

  if (content === undefined) {
    return null
  }
  const Root = content.variant === 'success' ? Alert.Success : Alert.Info
  const lang = content.lang !== undefined && content.lang !== locale ? content.lang : undefined
  const { action } = content
  return (
    <li ref={setItem} className="kv-toast-item">
      <Root
        icon={
          content.isBusy ? (
            <span className="kv-alert-icon kv-spinner" aria-hidden="true" />
          ) : undefined
        }
        className="kv-toast"
        data-timed={timer === undefined ? undefined : ''}
        data-paused={timer !== undefined && isPaused ? '' : undefined}
      >
        <Alert.Title render={<p tabIndex={-1} />}>
          {lang === undefined ? content.title : <span lang={lang}>{content.title}</span>}
        </Alert.Title>
        {content.body === undefined ? null : <Alert.Body lang={lang}>{content.body}</Alert.Body>}
        {action === undefined ? null : (
          <Alert.Actions>
            <Button
              onClick={(event) => {
                action.onPress()
                controller.dismiss(id, event.detail > 0)
              }}
            >
              {action.label}
            </Button>
          </Alert.Actions>
        )}
        <Alert.Close
          onClick={(event) => {
            controller.dismiss(id, event.detail > 0)
          }}
          render={(closeProps) => (
            <button {...closeProps}>
              {closeProps.children}
              {timer === undefined ? null : (
                // Decorative: the time left is never announced. A new run restarts the animation, and
                // Close keeps its element and focus.
                <span
                  key={timer.run}
                  className="kv-toast-timer"
                  aria-hidden="true"
                  style={
                    {
                      '--kv-toast-timer-from': Math.min(1, timer.remaining / timer.duration),
                      '--kv-toast-timer-remaining': `${timer.remaining}ms`,
                    } as CSSProperties
                  }
                />
              )}
            </button>
          )}
        />
      </Root>
    </li>
  )
}

interface ToastRegionContentProps {
  controller: ToastController
  visible: ToastEntry[]
}

function ToastRegionContent({ controller, visible }: ToastRegionContentProps) {
  const env = useEnv()
  const messages = useMessages('toast')
  const { localeProps } = useLocale()
  const { announce } = useQuietAnnouncer()
  const sectionRef = useRef<HTMLElement | null>(null)
  const blockEndInset = useRef(0)
  // A region that takes over from another host starts with toasts that are not new: no scroll for them.
  const [isHandover] = useState(() => controller.takeHandover())
  const shownCount = useRef(isHandover ? visible.length : 0)
  const isScrolledToEnd = useRef(true)
  const { queue } = controller
  const isPaused = useStoreSelector(queue, selectPaused)

  const setSection = useCallback(
    (element: HTMLElement | null) => {
      sectionRef.current = element
      controller.registerRegion(element)
    },
    [controller],
  )

  // Shown in the top layer where the browser can. Hiding first lets Strict Mode show it again.
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (section === null || typeof section.showPopover !== 'function') {
      return
    }
    if (!section.matches(':popover-open')) {
      section.showPopover()
    }
    return () => {
      if (section.matches(':popover-open')) {
        section.hidePopover()
      }
    }
  }, [])

  useLayoutEffect(() => {
    controller.restoreHandoverFocus()
    controller.flushFocusRequest()
  }, [controller, visible])

  // Pointer and focus pause the timers. A removed toast sends no blur or leave, so the focus state
  // is read again after every change, and both end with the region.
  const syncFocusPause = useCallback(() => {
    const active = env?.document.activeElement
    if (active && sectionRef.current?.contains(active)) {
      queue.actions.pause('focus')
    } else {
      queue.actions.resume('focus')
    }
  }, [env, queue])
  useEffect(() => {
    syncFocusPause()
  }, [syncFocusPause, visible])
  useEffect(() => {
    const section = sectionRef.current
    if (section === null) {
      return
    }
    const onPointerEnter = () => {
      queue.actions.pause('hover')
    }
    const onPointerLeave = () => {
      queue.actions.resume('hover')
    }
    const onFocusIn = () => {
      queue.actions.pause('focus')
    }
    const onFocusOut = (event: globalThis.FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !section.contains(event.relatedTarget)) {
        queue.actions.resume('focus')
      }
    }
    // A region that replaces the old host's cannot count on an enter event for a resting pointer.
    if (section.matches(':hover')) {
      queue.actions.pause('hover')
    } else {
      queue.actions.resume('hover')
    }
    section.addEventListener('pointerenter', onPointerEnter)
    section.addEventListener('pointerleave', onPointerLeave)
    section.addEventListener('focusin', onFocusIn)
    section.addEventListener('focusout', onFocusOut)
    return () => {
      section.removeEventListener('pointerenter', onPointerEnter)
      section.removeEventListener('pointerleave', onPointerLeave)
      section.removeEventListener('focusin', onFocusIn)
      section.removeEventListener('focusout', onFocusOut)
      // When another host takes the toasts over, the new region reads the pointer and focus itself.
      if (queue.getState().visible.length === 0) {
        queue.actions.resume('hover')
        queue.actions.resume('focus')
      }
    }
  }, [queue])

  // One polite message per commit. The status word, title and body are read from what is shown, so
  // the announcement says what the screen shows. A toast shown again is a new entry.
  useEffect(() => {
    const known = controller.announced
    const spoken: string[] = []
    for (const entry of visible) {
      if (known.get(entry.id) === entry.revision) {
        continue
      }
      known.set(entry.id, entry.revision)
      if (controller.takeSilenced(entry.id)) {
        continue
      }
      const item = controller.itemElement(entry.id)
      const text = [
        readText(item?.querySelector<HTMLElement>('.kv-alert-title') ?? null),
        readText(item?.querySelector<HTMLElement>('.kv-alert-body') ?? null),
      ]
        .filter((part) => part !== '')
        .join(' ')
      if (text !== '') {
        spoken.push(text)
      }
    }
    for (const id of known.keys()) {
      if (!visible.some((entry) => entry.id === id)) {
        known.delete(id)
      }
    }
    if (spoken.length > 0) {
      announce(spoken.join(' '), { politeness: 'polite' })
    }
  }, [controller, visible, announce])

  // The region sits at the block end. When the focused element would be under it, it moves to the
  // block start (2.4.11). While focus is inside the region it stays where it is. The attribute is
  // set on the element, not through a prop, because it is read from layout.
  const updatePlacement = useCallback(() => {
    const section = sectionRef.current
    const active = env?.document.activeElement
    if (!env || section === null) {
      return
    }
    if (active && section.contains(active)) {
      return
    }
    if (!(active instanceof env.window.HTMLElement) || active === env.document.body) {
      section.removeAttribute('data-placement')
      return
    }
    const regionBox = section.getBoundingClientRect()
    const focusBox = active.getBoundingClientRect()
    const viewportHeight = env.window.innerHeight
    // The gap to the block-end edge, read while the region sits there (the theme's inset).
    if (!section.hasAttribute('data-placement')) {
      blockEndInset.current = Math.max(0, viewportHeight - regionBox.bottom)
    }
    const blockEndBottom = viewportHeight - blockEndInset.current
    const isCovered =
      focusBox.bottom > blockEndBottom - regionBox.height &&
      focusBox.top < blockEndBottom &&
      focusBox.right > regionBox.left &&
      focusBox.left < regionBox.right
    if (isCovered) {
      section.setAttribute('data-placement', 'block-start')
    } else {
      section.removeAttribute('data-placement')
    }
  }, [env])
  useEffect(() => {
    if (!env) {
      return
    }
    updatePlacement()
    env.document.addEventListener('focusin', updatePlacement)
    env.window.addEventListener('resize', updatePlacement)
    return () => {
      env.document.removeEventListener('focusin', updatePlacement)
      env.window.removeEventListener('resize', updatePlacement)
    }
  }, [env, updatePlacement, visible])

  // Up to ten toasts can fill a capped region: a new one scrolls into view, in the region only (never
  // the page), without animation, and never while the user is reading in it or has scrolled it up.
  useEffect(() => {
    const section = sectionRef.current
    if (section === null) {
      return
    }
    const onScroll = () => {
      isScrolledToEnd.current = section.scrollTop + section.clientHeight >= section.scrollHeight - 2
    }
    section.addEventListener('scroll', onScroll)
    return () => {
      section.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const previousCount = shownCount.current
    shownCount.current = visible.length
    if (!env || !section || visible.length <= previousCount) {
      return
    }
    const isInteracting = section.matches(':hover') || section.contains(env.document.activeElement)
    if (!isInteracting && isScrolledToEnd.current && section.scrollHeight > section.clientHeight) {
      section.scrollTo({ top: section.scrollHeight, behavior: 'instant' })
    }
  }, [env, visible])

  // A region that is taller than the viewport scrolls (the theme caps it), and a scroll container
  // needs the keyboard (2.1.1): it is a Tab stop only while it overflows. Set on the element, as
  // the observer reads layout.
  useEffect(() => {
    const section = sectionRef.current
    const list = section?.firstElementChild
    if (!env || !section || !list) {
      return
    }
    // Kept while the region has focus, or focus would fall to `body`; dropped when it leaves.
    const sync = () => {
      if (section.scrollHeight > section.clientHeight || env.document.activeElement === section) {
        section.setAttribute('tabindex', '0')
      } else {
        section.removeAttribute('tabindex')
      }
    }
    sync()
    const observer = new env.window.ResizeObserver(sync)
    observer.observe(section)
    observer.observe(list)
    section.addEventListener('blur', sync)
    return () => {
      observer.disconnect()
      section.removeEventListener('blur', sync)
      section.removeAttribute('tabindex')
    }
  }, [env])

  return (
    <section
      ref={setSection}
      className="kv-toast-region"
      popover="manual"
      aria-label={messages.regionLabel}
      lang={localeProps.lang}
      dir={localeProps.dir}
    >
      <ul role="list" className="kv-toast-list">
        {visible.map((entry) => (
          <ToastItem key={entry.id} controller={controller} entry={entry} isPaused={isPaused} />
        ))}
      </ul>
    </section>
  )
}

/**
 * Internal. The region of toasts, rendered once by the outermost `KvirnProvider`, after its
 * children. It exists only while a toast shows, so the landmark does too. It is never a live
 * region: the provider announces through the Announcer.
 */
export function ToastRegion({ controller }: { controller: ToastController }) {
  const visible = useStoreSelector(controller.queue, selectVisible)
  return visible.length === 0 ? null : (
    <ToastRegionContent controller={controller} visible={visible} />
  )
}
