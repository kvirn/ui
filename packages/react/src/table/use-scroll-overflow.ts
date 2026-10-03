import type { Env } from '@kvirn-ui/core'
import { useEffect, useState } from 'react'

/**
 * Internal. Whether `element` has content that doesn't fit, so a scroll region is a Tab stop only
 * while it scrolls: a keyboard user can then scroll it (2.1.1), and there is no empty stop when
 * it doesn't. Watches the element and its children, so rows added or a window resized update it.
 */
export function useScrollOverflow(element: HTMLElement | null, env: Env | undefined): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false)

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

  return isOverflowing
}
