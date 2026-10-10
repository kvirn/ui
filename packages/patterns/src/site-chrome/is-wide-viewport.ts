import { useSyncExternalStore } from 'react'

/** From 64rem the header's navigation is a row and the mega menu panels overlay the page. */
export const wideViewportQuery = '(min-width: 64rem)'

// Read when a key or a press happens, never at import time (no `window` at module scope).
export function isWideViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(wideViewportQuery).matches
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(wideViewportQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * The server snapshot is wide: the navigation panels are then rendered open, so the links are
 * there before hydration, on a wide screen and without JavaScript. A narrow screen closes them
 * once the page is interactive.
 */
export function useIsWideViewport(): boolean {
  return useSyncExternalStore(subscribe, isWideViewport, () => true)
}
