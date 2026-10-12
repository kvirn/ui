'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function HiddenHeading() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <div>
      <VisuallyHidden as="h4">{texts.openingHours}</VisuallyHidden>
      <p>{texts.openingHoursText}</p>
    </div>
  )
}
