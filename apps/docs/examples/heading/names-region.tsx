'use client'
import { Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useHeadingTexts } from './texts.ts'

export function NamesRegion() {
  const { texts } = useHeadingTexts()
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <Heading as="h4" id={headingId}>
        {texts.opening.heading}
      </Heading>
      <p>{texts.opening.text}</p>
    </section>
  )
}
