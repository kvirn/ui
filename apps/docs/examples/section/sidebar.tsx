'use client'
import { Heading, Link, Section } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSectionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Sidebar() {
  const { texts, isFallback } = useSectionTexts()
  const headingId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Section as="aside" aria-labelledby={headingId} className="kv-section--padding-lg kv-prose">
        <Heading as="h4" id={headingId}>
          {texts.contact.heading}
        </Heading>
        <p>{texts.contact.text}</p>
        <p>
          <Link href="#">{texts.contact.link}</Link>
        </p>
      </Section>
    </InEnglishWhenFallback>
  )
}
