'use client'
import { Container, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useContainerTexts } from './texts.ts'

export function NamedRegion() {
  const { texts, textLang } = useContainerTexts()
  const headingId = useId()
  return (
    <Container size="reading" as="section" aria-labelledby={headingId} lang={textLang}>
      <Heading as="h2" id={headingId}>
        {texts.region.title}
      </Heading>
      <p>{texts.region.text}</p>
    </Container>
  )
}
