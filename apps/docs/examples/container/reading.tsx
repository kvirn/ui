'use client'
import { Container, Prose } from '@kvirn-ui/react'
import { useContainerTexts } from './texts.ts'

export function ReadingColumn() {
  const { texts, textLang } = useContainerTexts()
  return (
    <Container size="reading" lang={textLang}>
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
  )
}
