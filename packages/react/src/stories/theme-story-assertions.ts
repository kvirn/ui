import { expect, waitFor } from 'storybook/test'

// Play-function checks shared by the component stories, which the Storybook preview styles
// with @kvirn-ui/theme/theme.css (ADR-0013). Story-only: nothing in the package imports this.

export type FixedStoryTheme = 'light' | 'dark' | 'light-contrast' | 'dark-contrast'

const resolvedAttributes: Record<FixedStoryTheme, readonly ['light' | 'dark', string]> = {
  light: ['light', 'standard'],
  dark: ['dark', 'standard'],
  'light-contrast': ['light', 'more'],
  'dark-contrast': ['dark', 'more'],
}

/** `#5e6ad2` as `getComputedStyle` reports it: `rgb(94, 106, 210)`. */
export function hexToRgb(hex: string): string {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16))
  return `rgb(${channels.join(', ')})`
}

const rootStyle = (element: Element) => getComputedStyle(element.ownerDocument.documentElement)

/** A `--kv-color-*` token's current value on `<html>`, as a computed colour. */
export const tokenColor = (element: Element, token: string): string =>
  hexToRgb(rootStyle(element).getPropertyValue(`--kv-color-${token}`).trim())

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

/** Compact density and the stacked button group depend on the viewport width. */
export const isViewportAtLeast = (canvasElement: HTMLElement, width: string): boolean =>
  canvasElement.ownerDocument.defaultView?.matchMedia(`(width >= ${width})`).matches ?? false

export const blockSize = (element: Element): number => element.getBoundingClientRect().height

/** Nothing inside the element is wider than it (1.4.10). */
export async function expectNoHorizontalOverflow(element: HTMLElement) {
  await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth)
  for (const child of element.querySelectorAll<HTMLElement>('*')) {
    await expect(child.getBoundingClientRect().right).toBeLessThanOrEqual(
      element.getBoundingClientRect().right + 0.5,
    )
  }
}
