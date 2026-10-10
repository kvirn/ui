/** A link as the patterns take it: the text says where it goes (2.4.4). */
export interface PromotionLink {
  label: string
  href: string
}

/** Resident pages stop at `h3`; the level follows the page's outline, not the look. */
export type PromotionHeadingLevel = 'h2' | 'h3'

export function joinClassNames(...classNames: (string | undefined)[]): string {
  return classNames.filter(Boolean).join(' ')
}
