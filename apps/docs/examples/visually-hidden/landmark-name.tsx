'use client'
import { Link, VisuallyHidden } from '@kvirn-ui/react'
import { useId } from 'react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function LandmarkName() {
  const { texts } = useVisuallyHiddenTexts()
  const headingId = useId()
  return (
    // The heading is in the page's outline, and aria-labelledby makes the same words the name of
    // the navigation. One hidden text does both, and they can't drift apart.
    <nav aria-labelledby={headingId}>
      <VisuallyHidden as="h4" id={headingId}>
        {texts.footerHeading}
      </VisuallyHidden>
      <ul>
        <li>
          <Link.Root href="#accessibility-statement">{texts.accessibilityStatement}</Link.Root>
        </li>
        <li>
          <Link.Root href="#privacy">{texts.privacy}</Link.Root>
        </li>
      </ul>
    </nav>
  )
}
