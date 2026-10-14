'use client'
import { Button, Heading, useFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useFocusTexts } from './texts.ts'

export function WizardStep() {
  const { texts } = useFocusTexts()
  const [step, setStep] = useState(1)
  const stepRef = useRef<HTMLDivElement>(null)
  const total = texts.steps.length
  const current = texts.steps[step - 1] ?? texts.steps[0]!
  // The docs page already has an h1, so this example uses an h4.
  useFocus({ moveOn: { key: String(step), selector: 'h4', containerRef: stepRef } })
  return (
    <div>
      <div ref={stepRef}>
        <Heading as="h4">{texts.stepHeading({ step, total, title: current.title })}</Heading>
        <p>{current.body}</p>
      </div>
      <p>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>{texts.back}</Button>}{' '}
        {step < total && <Button onClick={() => setStep(step + 1)}>{texts.next}</Button>}
      </p>
    </div>
  )
}
