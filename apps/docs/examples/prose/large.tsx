'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function LargeProse() {
  const { texts, textLang } = useProseTexts()
  return (
    <Prose className="kv-prose--large" lang={textLang}>
      <h2>{texts.large.heading}</h2>
      <p>{texts.large.text}</p>
    </Prose>
  )
}
