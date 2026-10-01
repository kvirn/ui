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

/**
 * A story title's component id, as Storybook builds it (`Foundation/Colors/Text on surface` is
 * `foundation-colors-text-on-surface`). Storybook opens the first story of a component id.
 */
export const storyIdOf = (title: string): string =>
  title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

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
