'use client'
import { Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function NestedContainers() {
  const { texts } = useContainerTexts()
  return (
    <Container>
      <Container size="reading">
        <Heading as="h2">{texts.main.title}</Heading>
        <p>{texts.main.text}</p>
      </Container>
    </Container>
  )
}
