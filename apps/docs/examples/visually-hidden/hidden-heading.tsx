'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function HiddenHeading() {
  const { texts, isFallback } = useVisuallyHiddenTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <VisuallyHidden as="h4">{texts.openingHours}</VisuallyHidden>
        <p>{texts.openingHoursText}</p>
      </div>
    </InEnglishWhenFallback>
  )
}
