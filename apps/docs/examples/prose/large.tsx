'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function LargeProse() {
  const { texts, isFallback } = useProseTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Prose className="kv-prose--large">
        <h2>{texts.large.heading}</h2>
        <p>{texts.large.text}</p>
      </Prose>
    </InEnglishWhenFallback>
  )
}
