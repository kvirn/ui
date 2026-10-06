import { useSyncExternalStore } from 'react'

// Two months need 2 × 340px and a gap: 64rem is the first width where a dialog holds them (design D10).
const wideQuery = '(min-width: 64rem)'

const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

function subscribe(onChange: () => void): () => void {
  if (!canMatchMedia()) {
    return () => {}
  }
  const list = window.matchMedia(wideQuery)
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

const getSnapshot = () => canMatchMedia() && window.matchMedia(wideQuery).matches

/** Internal. Whether the viewport is at least 64rem wide: `false` on the server, then the media query. */
export function useWideViewport(isNeeded: boolean): boolean {
  const matches = useSyncExternalStore(subscribe, getSnapshot, () => false)
  return isNeeded && matches
}
