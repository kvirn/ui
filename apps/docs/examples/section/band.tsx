'use client'
import { Card, Heading, Section } from '@kvirn-ui/react'
import { useSectionTexts } from './texts.ts'

export function Band() {
  const { texts, textLang } = useSectionTexts()
  return (
    <Section className="kv-section--canvas" lang={textLang}>
      <Heading as="h4">{texts.band.heading}</Heading>
      <p>{texts.band.text}</p>
      <Card.Root className="kv-prose">
        <Heading as="h5">{texts.band.cardHeading}</Heading>
        <p>{texts.band.cardText}</p>
      </Card.Root>
    </Section>
  )
}
