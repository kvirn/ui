'use client'
import { Heading, Section } from '@kvirn-ui/react'
import { useSectionTexts } from './texts.ts'

export function SectionList() {
  const { texts } = useSectionTexts()
  const parts = [texts.guide.eligibility, texts.guide.documents, texts.guide.cost]
  // The default theme draws no marker on a section, and Safari can then drop the list role.
  // role="list" on the <ul> keeps it announced as a list.
  return (
    <ul role="list">
      {parts.map((part) => (
        <Section as="li" key={part.heading}>
          <Heading as="h4">{part.heading}</Heading>
          <p>{part.text}</p>
        </Section>
      ))}
    </ul>
  )
}
