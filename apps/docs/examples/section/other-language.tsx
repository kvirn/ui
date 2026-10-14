'use client'
import { Heading, KvirnProvider, Section, useLocale } from '@kvirn-ui/react'
import { useId } from 'react'
import { swedishNotice } from './texts.ts'

function SwedishNotice() {
  // The nested provider below is what sets this language. localeProps is its lang and dir, so a
  // screen reader switches voice for this region only.
  const { localeProps } = useLocale()
  const headingId = useId()
  return (
    <Section as="section" aria-labelledby={headingId} {...localeProps}>
      <Heading as="h4" id={headingId}>
        {swedishNotice.heading}
      </Heading>
      <p>{swedishNotice.text}</p>
    </Section>
  )
}

export function OtherLanguageSection() {
  return (
    <KvirnProvider locale="sv-FI">
      <SwedishNotice />
    </KvirnProvider>
  )
}
