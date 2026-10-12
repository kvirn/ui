'use client'
import { Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useHeadingTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NamesRegion() {
  const { texts, isFallback } = useHeadingTexts()
  const headingId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <section aria-labelledby={headingId}>
        <Heading as="h4" id={headingId}>
          {texts.opening.heading}
        </Heading>
        <p>{texts.opening.text}</p>
      </section>
    </InEnglishWhenFallback>
  )
}
