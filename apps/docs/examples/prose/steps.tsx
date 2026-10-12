'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function StepsProse() {
  const { texts } = useProseTexts()
  return (
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
  )
}
