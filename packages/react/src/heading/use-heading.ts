/** The level of the page's outline: 1 is `<h1>`, 6 is `<h6>`. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * The look of a heading, apart from its level: the type roles of the same names (`display`,
 * `heading-1` to `heading-6`) in `@kvirn-ui/theme`.
 */
export type HeadingSize =
  | 'display'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'

/** Spread on the Heading's element. Only the part's classes: Heading adds no role or ARIA. */
export interface HeadingPartProps {
  /**
   * The part's classes, for `@kvirn-ui/theme` and your own CSS: `.kv-heading`, and the size's
   * modifier (`.kv-heading--heading-2`): the level's own, or the `size` you give.
   */
  className: string
}

export interface UseHeadingOptions {
  /** The level, which the element follows: `1` to `6`. */
  level: HeadingLevel
  /** The look, when it isn't the level's: levels 1 to 6 default to `heading-1` to `heading-6`. */
  size?: HeadingSize | undefined
}

export interface UseHeadingResult {
  /** The element for the level: `'h2'` for 2. */
  element: `h${HeadingLevel}`
  /** The size that applies: the one given, or the level's own (`heading-1` to `heading-6`). */
  size: HeadingSize
  rootProps: HeadingPartProps
}

const levelSizes: Record<HeadingLevel, HeadingSize> = {
  1: 'heading-1',
  2: 'heading-2',
  3: 'heading-3',
  4: 'heading-4',
  5: 'heading-5',
  6: 'heading-6',
}

/**
 * A heading's element and classes for your own element (contract: heading.a11y.md). The level is
 * the outline and `size` is the look, so an `h3` can be set as `heading-2`.
 *
 * @example
 * const heading = useHeading({ level: 3, size: 'heading-2' })
 * <h3 {...heading.rootProps}>Sophämtning</h3>
 */
export function useHeading({ level, size }: UseHeadingOptions): UseHeadingResult {
  const appliedSize = size ?? levelSizes[level]
  return {
    element: `h${level}`,
    size: appliedSize,
    rootProps: { className: `kv-heading kv-heading--${appliedSize}` },
  }
}
