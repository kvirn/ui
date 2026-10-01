import { isFixtureLocale } from './foundations.fixture.tsx'
import type { FixtureLocale } from './foundations.fixture.tsx'

// Shared by Foundation/Overview and the Typography pages (docs/design/foundations-and-prose.md
// §6.6). Storybook tooling only.

/** The Locale toolbar's value as a fixture locale. The preview's default is `sv`. */
export const fixtureLocaleOf = (locale: unknown): FixtureLocale =>
  isFixtureLocale(locale) ? locale : 'sv'

/** A computed length in px, as a number: `16px` is 16. */
export const computedPixels = (element: Element, property: string): number =>
  Number.parseFloat(getComputedStyle(element).getPropertyValue(property))

/** The fixture's reference number, for the code samples. */
export const caseNumberSample = 'BAB-2026-004512'

/** A title or story name as Storybook puts it in an id: `Text on surface` is `text-on-surface`. */
const idPartOf = (name: string): string =>
  name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

/**
 * A story's id, as Storybook builds it from the title and the story name: `Foundation/Colors`
 * and `Text on surface` are `foundation-colors--text-on-surface`.
 */
export const storyIdOf = (title: string, story: string): string =>
  `${idPartOf(title)}--${idPartOf(story)}`

/** The first element matching `selector`, or a failed play function that says what's missing. */
export function requireElement<ElementType extends Element = HTMLElement>(
  root: ParentNode,
  selector: string,
): ElementType {
  const element = root.querySelector<ElementType>(selector)
  if (element === null) {
    throw new Error(`Expected an element matching ${selector}`)
  }
  return element
}
