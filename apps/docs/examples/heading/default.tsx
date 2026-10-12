'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultHeading() {
  const { texts, isFallback } = useHeadingTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Heading as="h3">{texts.contact.heading}</Heading>
    </InEnglishWhenFallback>
  )
}
