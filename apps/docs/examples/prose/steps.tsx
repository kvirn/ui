'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function StepsProse() {
  const { texts, isFallback } = useProseTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Prose>
        <h2>{texts.steps.heading}</h2>
        <ol className="kv-steps">
          {texts.steps.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </Prose>
    </InEnglishWhenFallback>
  )
}
