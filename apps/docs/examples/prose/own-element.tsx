'use client'
import { useProse } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnElementProse() {
  const { texts, isFallback } = useProseTexts()
  const prose = useProse()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <section {...prose.rootProps} aria-labelledby="processing-times">
        <h2 id="processing-times">{texts.own.heading}</h2>
        <p>{texts.own.text}</p>
      </section>
    </InEnglishWhenFallback>
  )
}
