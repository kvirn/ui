'use client'
import { Heading, Link, Section } from '@kvirn-ui/react'
import { useId } from 'react'
import { useSectionTexts } from './texts.ts'

export function SectionNavigation() {
  const { texts, textLang } = useSectionTexts()
  const headingId = useId()
  return (
    <Section as="nav" aria-labelledby={headingId} lang={textLang}>
      <Heading as="h4" id={headingId}>
        {texts.navigation.heading}
      </Heading>
      <ul>
        <li>
          <Link href="#">{texts.navigation.overview}</Link>
        </li>
        <li>
          <Link href="#">{texts.navigation.open}</Link>
        </li>
        <li>
          <Link href="#">{texts.navigation.closed}</Link>
        </li>
      </ul>
    </Section>
  )
}
