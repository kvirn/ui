import type { Announcer as AnnouncerStore } from '@kvirn-ui/core'
import type { CSSProperties } from 'react'
import { useStoreSelector } from '../store/use-store-selector.ts'

/**
 * Visually hidden, but still in the accessibility tree and the layout: `display: none`,
 * `visibility: hidden` and `hidden` would make screen readers ignore the region. Inline, so the
 * headless packages ship no CSS (hard rule 5).
 */
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

const selectPolite = (state: { polite: string }) => state.polite
const selectAssertive = (state: { assertive: string }) => state.assertive

/**
 * Internal. The two live regions behind `useAnnouncer()`, rendered once by the outermost
 * `KvirnProvider`. They are empty on the server and on first render, and text is added later by
 * the announcer, because a live region that appears together with its text is not announced
 * (4.1.3). Never render a second one: the same message would be read twice.
 *
 * The polite region is `<output>`, the native element with the implicit role `status`. The
 * assertive one has no native element, so it is a `<div role="alert">`.
 */
export function Announcer({ announcer }: { announcer: AnnouncerStore }) {
  const polite = useStoreSelector(announcer, selectPolite)
  const assertive = useStoreSelector(announcer, selectAssertive)
  return (
    <>
      <output aria-live="polite" aria-atomic="true" style={visuallyHidden}>
        {polite}
      </output>
      <div role="alert" aria-live="assertive" aria-atomic="true" style={visuallyHidden}>
        {assertive}
      </div>
    </>
  )
}
