'use client'
import { Button, Heading, useFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useFocusTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WizardStep() {
  const { texts, isFallback } = useFocusTexts()
  const [step, setStep] = useState(1)
  const stepRef = useRef<HTMLDivElement>(null)
  // The docs page already has an h1, so this example uses an h4.
  useFocus({ moveOn: { key: String(step), selector: 'h4', containerRef: stepRef } })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <div ref={stepRef}>
          <Heading as="h4">{texts.step({ step })}</Heading>
          <p>{texts.stepBody}</p>
        </div>
        <Button onClick={() => setStep(step + 1)}>{texts.next}</Button>
      </div>
    </InEnglishWhenFallback>
  )
}
