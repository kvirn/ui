'use client'
import { Heading, Section } from '@kvirn-ui/react'
import { useSectionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultSection() {
  const { texts, isFallback } = useSectionTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Section className="kv-prose">
        <Heading as="h3">{texts.news.heading}</Heading>
        <p>{texts.news.text}</p>
      </Section>
    </InEnglishWhenFallback>
  )
}
