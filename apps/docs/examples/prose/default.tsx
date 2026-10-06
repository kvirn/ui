'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function DefaultProse() {
  const { texts, textLang } = useProseTexts()
  return (
    <Prose lang={textLang}>
      <h2>{texts.contact.heading}</h2>
      <p>{texts.contact.text}</p>
      <p>
        {texts.contact.hours} <a href="#example">{texts.contact.link}</a>.
      </p>
    </Prose>
  )
}
