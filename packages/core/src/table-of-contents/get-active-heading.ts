/** Where one heading is: its `id`, and how far its top edge is below the top of the viewport. */
export interface HeadingPosition {
  id: string
  /** `Element.getBoundingClientRect().top`: negative once the heading has scrolled out above. */
  top: number
}

export interface ActiveHeadingInput {
  /** Every heading that is rendered, in document order. */
  headings: readonly HeadingPosition[]
  /**
   * The line a heading has to reach, in px from the top of the viewport: the height of a sticky
   * header, and `scroll-padding-top` on `html`. `0` when nothing covers the top.
   */
  offset: number
  /** The page is scrolled to its end (and can scroll). The last heading is then the active one. */
  isAtEnd?: boolean | undefined
}

/** A heading counts as above the line when its top is at most this far below it: layout is sub-pixel. */
const tolerance = 1

/**
 * Which heading a reader is in (Plan 0049): the last one, in document order, whose top has
 * reached the line (`top <= offset + 1`), or `undefined` while every heading is still below it.
 * At the end of the page it is the last heading, because a last section shorter than the viewport
 * can never scroll its heading up to the line. Pure: no DOM.
 *
 * @example
 * getActiveHeading({ headings: [{ id: 'a', top: -300 }, { id: 'b', top: 200 }], offset: 0 }) // 'a'
 */
export function getActiveHeading({
  headings,
  offset,
  isAtEnd = false,
}: ActiveHeadingInput): string | undefined {
  if (isAtEnd) {
    return headings.at(-1)?.id
  }
  let active: string | undefined
  for (const heading of headings) {
    if (heading.top <= offset + tolerance) {
      active = heading.id
    }
  }
  return active
}
