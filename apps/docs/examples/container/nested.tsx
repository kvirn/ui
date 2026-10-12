'use client'
import { Container, Heading } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NestedContainers() {
  const { texts, isFallback } = useContainerTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Container>
        <Container size="reading">
          <Heading as="h2">{texts.main.title}</Heading>
          <p>{texts.main.text}</p>
        </Container>
      </Container>
    </InEnglishWhenFallback>
  )
}
