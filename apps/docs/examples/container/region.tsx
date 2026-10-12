'use client'
import { Container, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useContainerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NamedRegion() {
  const { texts, isFallback } = useContainerTexts()
  const headingId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Container size="reading" as="section" aria-labelledby={headingId}>
        <Heading as="h2" id={headingId}>
          {texts.region.title}
        </Heading>
        <p>{texts.region.text}</p>
      </Container>
    </InEnglishWhenFallback>
  )
}
