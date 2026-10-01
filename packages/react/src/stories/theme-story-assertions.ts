import { expect, waitFor } from 'storybook/test'

// Play-function checks shared by the component stories, which the Storybook preview styles
// with @kvirn-ui/theme/theme.css (ADR-0013). Story-only: nothing in the package imports this.
// Functionality and WCAG only: the look is reviewed visually, not asserted.

export type FixedStoryTheme = 'light' | 'dark' | 'light-contrast' | 'dark-contrast'

const resolvedAttributes: Record<FixedStoryTheme, readonly ['light' | 'dark', string]> = {
  light: ['light', 'standard'],
  dark: ['dark', 'standard'],
  'light-contrast': ['light', 'more'],
  'dark-contrast': ['dark', 'more'],
}

const rootStyle = (element: Element) => getComputedStyle(element.ownerDocument.documentElement)

/** Whether theme.css is on the page: its tokens are defined on `<html>`. */
export const isThemeLoaded = (element: Element): boolean =>
  rootStyle(element).getPropertyValue('--kv-color-primary').trim() !== ''

/** The theme store resolved the fixed theme, and theme.css applied it to `<html>`. */
export async function expectThemeApplied(canvasElement: HTMLElement, theme: FixedStoryTheme) {
  const root = canvasElement.ownerDocument.documentElement
  const [colorScheme, contrast] = resolvedAttributes[theme]
  await waitFor(() => expect(root).toHaveAttribute('data-kv-color-scheme', colorScheme))
  await expect(root).toHaveAttribute('data-kv-contrast', contrast)
  await expect(rootStyle(canvasElement).colorScheme).toBe(colorScheme)
}

/** At least 24 × 24 CSS px, the 2.5.8 Target Size (Minimum). */
export async function expectMinimumTargetSize(element: Element) {
  const { width, height } = element.getBoundingClientRect()
  await expect(width).toBeGreaterThanOrEqual(24)
  await expect(height).toBeGreaterThanOrEqual(24)
}

/** Nothing inside the element is wider than it (1.4.10). */
export async function expectNoHorizontalOverflow(element: HTMLElement) {
  await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth)
  for (const child of element.querySelectorAll<HTMLElement>('*')) {
    await expect(child.getBoundingClientRect().right).toBeLessThanOrEqual(
      element.getBoundingClientRect().right + 0.5,
    )
  }
}
