'use client'
import { useProse } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function OwnElementProse() {
  const { texts, textLang } = useProseTexts()
  const prose = useProse()
  return (
    <section {...prose.rootProps} aria-labelledby="processing-times" lang={textLang}>
      <h2 id="processing-times">{texts.own.heading}</h2>
      <p>{texts.own.text}</p>
    </section>
  )
}
