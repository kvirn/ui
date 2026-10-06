'use client'
import { useState } from 'react'
import type { RefCallback } from 'react'
import { useEnv } from '../provider/use-env.ts'
import { getScrollAreaProps } from './scroll-area-props.ts'
import type { ScrollAreaRegion } from './scroll-area-props.ts'
import { useScrollOverflow } from './use-scroll-overflow.ts'

export type { ScrollAreaRegion } from './scroll-area-props.ts'

export interface UseScrollAreaOptions {
  /**
   * `'overflow'` (default): a named `region` only while the content doesn't fit. `'always'`: a named
   * region whether it scrolls or not. It is a Tab stop only while it scrolls, in both modes.
   */
  region?: ScrollAreaRegion | undefined
}

/**
 * Spread on the element that scrolls. Not scrolling, with the default `region`, it is a plain
 * `<div>`: no role, no tab stop. Name it yourself with `aria-labelledby` or `aria-label`, which
 * a region needs (4.1.2).
 */
export interface ScrollAreaPartProps {
  className: 'kv-scroll-region kv-scroll-area'
  /** Only while the area is one: it scrolls, or `region` is `'always'`. */
  role?: 'region'
  /** The content doesn't fit, so the area scrolls and is a Tab stop. */
  tabIndex?: 0
  'data-overflowing'?: ''
  ref: RefCallback<HTMLElement>
}

export interface UseScrollAreaResult {
  scrollAreaProps: ScrollAreaPartProps
  /** The content is wider or taller than the area (it stays `true` while the area holds focus). */
  isOverflowing: boolean
  /** The area has `role="region"` now: it overflows, or `region` is `'always'`. */
  isRegion: boolean
  /** The scroll element, once it is mounted. */
  element: HTMLElement | null
}

export function useScrollArea(options: UseScrollAreaOptions = {}): UseScrollAreaResult {
  const env = useEnv()
  const [element, setElement] = useState<HTMLElement | null>(null)
  const isOverflowing = useScrollOverflow(element, env)
  const scrollAreaProps: ScrollAreaPartProps = {
    ...getScrollAreaProps({
      className: 'kv-scroll-region kv-scroll-area',
      isOverflowing,
      region: options.region,
    }),
    ref: setElement,
  }
  return {
    scrollAreaProps,
    isOverflowing,
    isRegion: scrollAreaProps.role === 'region',
    element,
  }
}
