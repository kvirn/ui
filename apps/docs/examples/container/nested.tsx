'use client'
import { Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function NestedContainers() {
  const { texts, textLang } = useContainerTexts()
  return (
    <Container lang={textLang}>
      <Container size="reading">
        <Heading level={2}>{texts.main.title}</Heading>
        <p>{texts.main.text}</p>
      </Container>
    </Container>
  )
}
