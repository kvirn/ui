'use client'
import { useProse } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function OwnElementProse() {
  const { texts } = useProseTexts()
  const prose = useProse()
  return (
    <section {...prose.rootProps} aria-labelledby="processing-times">
      <h2 id="processing-times">{texts.own.heading}</h2>
      <p>{texts.own.text}</p>
    </section>
  )
}
