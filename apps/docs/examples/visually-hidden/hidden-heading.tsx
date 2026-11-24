'use client'
import { VisuallyHidden } from '@kvirn/ui'
import { useVisuallyHiddenTexts } from './texts.ts'

export function HiddenHeading() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <div>
      <VisuallyHidden as="h4">{texts.contactHeading}</VisuallyHidden>
      <p>{texts.contactText}</p>
    </div>
  )
}
