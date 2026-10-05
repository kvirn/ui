import type { Env } from '@kvirn-ui/core'
import { useEffect, useState } from 'react'

/**
 * Internal. Whether `element` is a scroll stop: it has content that doesn't fit, so a scroll
 * region is a Tab stop only while it scrolls. A keyboard user can then scroll it (2.1.1), and there
 * is no empty stop when it doesn't. Watches the element and its children, so rows added or a
 * window resized update it.
 *
 * It stays a stop while it holds focus, even if the content stops overflowing (a wider window,
 * zooming out): taking the tab stop and the role away from the focused element would drop focus
 * to the page. It lets go once focus leaves.
 */
export function useScrollOverflow(element: HTMLElement | null, env: Env | undefined): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  useEffect(() => {
    if (element === null || env === undefined) {
      return undefined
    }
    const measure = () => {
      setIsOverflowing(
        element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
      )
    }
    measure()
    const observer = new env.window.ResizeObserver(measure)
    observer.observe(element)
    for (const child of element.children) {
      observer.observe(child)
    }
    return () => observer.disconnect()
  }, [element, env])

  // The element's own focus, not a descendant's: `focus` and `blur` don't bubble.
  useEffect(() => {
    if (element === null) {
      return undefined
    }
    const onFocus = () => setHasFocus(true)
    const onBlur = () => setHasFocus(false)
    element.addEventListener('focus', onFocus)
    element.addEventListener('blur', onBlur)
    return () => {
      element.removeEventListener('focus', onFocus)
      element.removeEventListener('blur', onBlur)
    }
  }, [element])

  return isOverflowing || hasFocus
}
