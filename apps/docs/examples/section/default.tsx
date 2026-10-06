'use client'
import { Heading, Section } from '@kvirn-ui/react'
import { useSectionTexts } from './texts.ts'

export function DefaultSection() {
  const { texts, textLang } = useSectionTexts()
  return (
    <Section className="kv-prose" lang={textLang}>
      <Heading level={3}>{texts.news.heading}</Heading>
      <p>{texts.news.text}</p>
    </Section>
  )
}
