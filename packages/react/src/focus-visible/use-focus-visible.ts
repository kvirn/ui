import { useCallback, useMemo, useState } from 'react'
import type { FocusEvent, FocusEventHandler } from 'react'

export interface FocusVisibleProps {
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseFocusVisibleResult {
  /** `true` while the element has focus and the browser's `:focus-visible` heuristic matches. */
  isFocusVisible: boolean
  focusVisibleProps: FocusVisibleProps
}

/**
 * Internal. Mirrors the browser's own `:focus-visible` into state, for `data-focus-visible`.
 * Reads the page only inside event handlers, so it is SSR-safe.
 */
export function useFocusVisible(): UseFocusVisibleResult {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  const onFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    setIsFocusVisible(event.currentTarget.matches(':focus-visible'))
  }, [])
  const onBlur = useCallback(() => {
    setIsFocusVisible(false)
  }, [])

  return useMemo(
    () => ({ isFocusVisible, focusVisibleProps: { onFocus, onBlur } }),
    [isFocusVisible, onFocus, onBlur],
  )
}
