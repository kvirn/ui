'use client'
import { Card, Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultContainer() {
  const { texts, isFallback } = useContainerTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Container>
        <Card.Root>
          <Card.Body>
            <Heading as="h2">{texts.page.title}</Heading>
            <p>{texts.page.text}</p>
          </Card.Body>
        </Card.Root>
      </Container>
    </InEnglishWhenFallback>
  )
}
