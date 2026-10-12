'use client'
import { useHeading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnElement() {
  const { texts, isFallback } = useHeadingTexts()
  const heading = useHeading({ level: 4, size: 'heading-3' })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <h4 {...heading.rootProps}>{texts.waste.heading}</h4>
    </InEnglishWhenFallback>
  )
}
