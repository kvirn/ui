'use client'
import { Card, Heading, Section } from '@kvirn-ui/react'
import { useSectionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Band() {
  const { texts, isFallback } = useSectionTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Section className="kv-section--canvas">
        <Heading as="h4">{texts.band.heading}</Heading>
        <p>{texts.band.text}</p>
        <Card.Root className="kv-prose">
          <Heading as="h5">{texts.band.cardHeading}</Heading>
          <p>{texts.band.cardText}</p>
        </Card.Root>
      </Section>
    </InEnglishWhenFallback>
  )
}
