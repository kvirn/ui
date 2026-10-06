'use client'
import { Heading, Prose } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function InProse() {
  const { texts, textLang } = useHeadingTexts()
  return (
    <Prose lang={textLang}>
      <Heading level={4}>{texts.waste.heading}</Heading>
      <p>{texts.waste.text}</p>
      <Heading level={5}>{texts.opening.heading}</Heading>
      <p>{texts.opening.text}</p>
    </Prose>
  )
}
