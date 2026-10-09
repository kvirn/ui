'use client'
import { Heading, Prose } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function InProse() {
  const { texts, textLang } = useHeadingTexts()
  return (
    <Prose lang={textLang}>
      <Heading as="h4">{texts.waste.heading}</Heading>
      <p>{texts.waste.text}</p>
      <Heading as="h5">{texts.opening.heading}</Heading>
      <p>{texts.opening.text}</p>
    </Prose>
  )
}
