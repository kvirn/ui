import { expect } from 'storybook/test'

// Play-function checks shared by the component stories, which the Storybook preview styles
// with @kvirn-ui/theme/theme.css. Story-only, so it lives in the Storybook app.
// Functionality and WCAG only: the look is reviewed visually, not asserted.

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
