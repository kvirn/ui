import type { MapHandle } from '@kvirn-ui/core'
import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Runs `callback` once per animation frame while the engine moves, and once more when it stops,
 * without a React render. Whatever follows the camera (markers, a popup) is placed from it.
 */
export function useMapFrame(handle: MapHandle | null, callback: () => void) {
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })
  useEffect(() => {
    if (!handle) {
      return
    }
    let frame = 0
    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(() => {
          frame = 0
          callbackRef.current()
        })
      }
    }
    const unsubscribers = [handle.on('move', schedule), handle.on('moveend', schedule)]
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe()
      cancelAnimationFrame(frame)
    }
  }, [handle])
}
