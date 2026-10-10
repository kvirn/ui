import { Container } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { expect } from 'storybook/test'

// Shared by the pattern stories: the two viewports every chrome story is checked at, an assertion
// helper and a placeholder footer. A pattern story writes its composition as literal JSX, with
// literal text: nothing here builds content. Story-only, so it lives in the Storybook app.

/** The Viewport toolbar options of the chrome stories: a 320px phone and an 80rem desktop. */
export const chromeViewports = {
  narrow: { name: '320px wide', styles: { width: '320px', height: '640px' }, type: 'mobile' },
  wide: { name: '80rem wide', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
}

export const narrowGlobals = { viewport: { value: 'narrow', isRotated: false } }
export const wideGlobals = { viewport: { value: 'wide', isRotated: false } }

/**
 * An element the theme shows although it keeps `hidden` (the Menu panel from 64rem): it has a box.
 * `toBeVisible` reads the attribute and would fail.
 */
export async function expectDrawn(element: Element) {
  const { width, height } = element.getBoundingClientRect()
  await expect(width).toBeGreaterThan(0)
  await expect(height).toBeGreaterThan(0)
}

/** A stand-in for the Site footer, so a header story is seen in a page with a `contentinfo`. */
export function PlaceholderFooter({ children = 'Kvirnby municipality' }: { children?: ReactNode }) {
  return (
    <footer className="kv-section kv-section--surface kv-section--padding-md">
      <Container>{children}</Container>
    </footer>
  )
}
