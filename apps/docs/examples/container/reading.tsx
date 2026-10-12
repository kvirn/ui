'use client'
import { Container, Prose } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ReadingColumn() {
  const { texts, isFallback } = useContainerTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Container size="reading">
        <Prose>
          <h2>{texts.reading.title}</h2>
          <p>{texts.reading.intro}</p>
          <ul>
            {texts.reading.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Prose>
      </Container>
    </InEnglishWhenFallback>
  )
}
