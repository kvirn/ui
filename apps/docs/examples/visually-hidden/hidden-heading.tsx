'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function HiddenHeading() {
  const { texts, textLang } = useVisuallyHiddenTexts()
  return (
    <div lang={textLang}>
      <VisuallyHidden as="h4">{texts.openingHours}</VisuallyHidden>
      <p>{texts.openingHoursText}</p>
    </div>
  )
}
