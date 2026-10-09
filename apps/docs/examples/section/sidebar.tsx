'use client'
import { Heading, Link, Section } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSectionTexts } from './texts.ts'

export function Sidebar() {
  const { texts, textLang } = useSectionTexts()
  const headingId = useId()
  return (
    <Section
      as="aside"
      aria-labelledby={headingId}
      className="kv-section--padding-lg kv-prose"
      lang={textLang}
    >
      <Heading as="h4" id={headingId}>
        {texts.contact.heading}
      </Heading>
      <p>{texts.contact.text}</p>
      <p>
        <Link href="#">{texts.contact.link}</Link>
      </p>
    </Section>
  )
}
