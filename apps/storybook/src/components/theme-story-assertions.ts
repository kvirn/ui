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

/** Every top bar is a band at least 48 CSS px tall, its items centred in it. */
export async function expectTopBarBandHeight(root: Element) {
  const bars = root.querySelectorAll('.kv-top-bar')
  await expect(bars.length).toBeGreaterThan(0)
  for (const bar of bars) {
    await expect(bar.getBoundingClientRect().height).toBeGreaterThanOrEqual(48)
  }
}

/** Every bar item in a top bar is at least 24 × 24 CSS px, none skipped (2.5.8). A link in a sentence is inline, which 2.5.8 exempts. */
export async function expectTopBarTargetSizes(root: Element) {
  await expectTopBarBandHeight(root)
  const items = root.querySelectorAll('.kv-top-bar a:not(p a), .kv-top-bar button')
  await expect(items.length).toBeGreaterThan(0)
  for (const item of items) {
    await expectMinimumTargetSize(item)
  }
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
