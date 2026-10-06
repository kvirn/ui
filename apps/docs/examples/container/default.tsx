'use client'
import { Card, Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function DefaultContainer() {
  const { texts, textLang } = useContainerTexts()
  return (
    <Container lang={textLang}>
      <Card.Root>
        <Card.Body>
          <Heading level={2}>{texts.page.title}</Heading>
          <p>{texts.page.text}</p>
        </Card.Body>
      </Card.Root>
    </Container>
  )
}
