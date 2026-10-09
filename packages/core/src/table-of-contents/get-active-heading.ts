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
  /**
   * The height of the viewport, in px. With it the line moves down to the top 20% of the space
   * below `offset`, and the first heading that is visible is active before any has reached it.
   * Left out, the line is `offset` and nothing is active until a heading reaches it.
   */
  viewportHeight?: number | undefined
}

/** A heading counts as above the line when its top is at most this far below it: layout is sub-pixel. */
const tolerance = 1

/** The share of the viewport below `offset` that is the switch band: a heading in it is being read. */
const bandShare = 0.2

/**
 * Which heading a reader is in (Plan 0049): the last one, in document order, whose top has
 * reached the line (`top <= line + 1`), or, before that, the first one that is visible. `undefined`
 * only while none is. The line is `offset`, or with a `viewportHeight` the top 20% band below it.
 * At the end of the page it is the last heading, because a last section shorter than the viewport
 * can never scroll its heading up to the line, unless a heading sits exactly on the line: the
 * browser put it there for a jump, so that one is read. Pure: no DOM.
 *
 * @example
 * getActiveHeading({ headings: [{ id: 'a', top: -300 }, { id: 'b', top: 200 }], offset: 0 }) // 'a'
 */
export function getActiveHeading({
  headings,
  offset,
  isAtEnd = false,
  viewportHeight,
}: ActiveHeadingInput): string | undefined {
  if (isAtEnd) {
    const jumpedTo = headings.findLast((heading) => Math.abs(heading.top - offset) <= tolerance)
    return (jumpedTo ?? headings.at(-1))?.id
  }
  const line =
    viewportHeight === undefined ? offset : offset + bandShare * (viewportHeight - offset)
  let active: string | undefined
  for (const heading of headings) {
    if (heading.top <= line + tolerance) {
      active = heading.id
    }
  }
  if (active === undefined && viewportHeight !== undefined) {
    return headings.find((heading) => heading.top < viewportHeight)?.id
  }
  return active
}
