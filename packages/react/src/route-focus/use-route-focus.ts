import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { textEntrySelector } from '../focus-visible/use-focus-visible.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseRouteFocusOptions {
  /**
   * The router's location as a string: the pathname plus the search, never the hash. Focus moves
   * when it changes, so a hash-only change does nothing by construction.
   */
  key: string
  /** Where to look for `selector`: the `<main>` that holds the page. Defaults to the document. */
  containerRef?: RefObject<Element | null> | undefined
  /** The element to focus. Defaults to `h1`. */
  selector?: string
  /**
   * Also says "Navigated to {title}" in the shared live region, for a router with no announcer of
   * its own. Off by default, so Next.js's route announcer isn't doubled.
   */
  announce?: boolean
  messages?: Partial<KvirnMessages['routeFocus']>
}

/**
 * After a client-side navigation, moves focus to the new page's title (2.4.3) so a keyboard or
 * screen reader user starts there. Does nothing on the first load, on a hash-only change, on
 * Back and Forward while the browser restores scroll itself, when no target exists, or while the
 * user is typing in a field. Call it once, in the layout.
 */
export function useRouteFocus(options: UseRouteFocusOptions): void {
  const { key, containerRef, selector = 'h1', announce = false } = options
  const env = useEnv()
  const routeFocusMessages = useMessages('routeFocus', options.messages)
  const { announce: say, isAvailable } = useQuietAnnouncer()
  const previousKey = useRef<string>(undefined)
  const poppedAddress = useRef<string>(undefined)

  useEffect(() => {
    if (env === undefined) {
      return
    }
    // A fragment link also fires `popstate` but leaves the key alone, so the address is kept and
    // compared with the address at the next key change: only a Back or Forward that changed the
    // key matches. The address, not the key, because a router's key may omit a basePath or
    // re-encode the search.
    const markPopped = () => {
      poppedAddress.current = env.window.location.pathname + env.window.location.search
    }
    env.window.addEventListener('popstate', markPopped)
    return () => env.window.removeEventListener('popstate', markPopped)
  }, [env])

  useEffect(() => {
    if (env === undefined) {
      return
    }
    if (previousKey.current === undefined) {
      previousKey.current = key
      return
    }
    if (previousKey.current === key) {
      return
    }
    previousKey.current = key

    const popped =
      poppedAddress.current === env.window.location.pathname + env.window.location.search
    poppedAddress.current = undefined
    if (popped && env.window.history.scrollRestoration === 'auto') {
      return
    }

    const activeElement = env.document.activeElement
    if (activeElement !== null && activeElement.matches(textEntrySelector)) {
      return
    }

    const target = (containerRef?.current ?? env.document).querySelector<HTMLElement>(selector)
    if (target === null) {
      warnOnce(
        'route-focus-target-missing',
        `useRouteFocus found nothing matching "${selector}" after the route changed, so focus stayed where it was. Render the page title as an <h1> inside the container, or pass a \`selector\`.`,
      )
      return
    }

    const addedTabIndex = !target.hasAttribute('tabindex')
    if (addedTabIndex) {
      target.setAttribute('tabindex', '-1')
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
    }
    target.focus({ preventScroll: false })

    if (announce) {
      if (!isAvailable) {
        warnAnnouncerMissing()
        return
      }
      const title = env.document.title.trim() || (target.textContent ?? '').trim()
      say(routeFocusMessages.navigated({ title }))
    }
  }, [env, key, containerRef, selector, announce, isAvailable, say, routeFocusMessages])
}
