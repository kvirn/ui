'use client'
import { Card, Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function DefaultContainer() {
  const { texts } = useContainerTexts()
  return (
    <Container>
      <Card.Root>
        <Card.Body>
          <Heading as="h2">{texts.page.title}</Heading>
          <p>{texts.page.text}</p>
        </Card.Body>
      </Card.Root>
    </Container>
  )
}
