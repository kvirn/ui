'use client'
import { Button, Heading, useFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useFocusTexts } from './texts.ts'

export function WizardStep() {
  const { texts, textLang } = useFocusTexts()
  const [step, setStep] = useState(1)
  const stepRef = useRef<HTMLDivElement>(null)
  // The docs page already has an h1, so this example uses an h4.
  useFocus({ moveOn: { key: String(step), selector: 'h4', containerRef: stepRef } })
  return (
    <div lang={textLang}>
      <div ref={stepRef}>
        <Heading as="h4">{texts.step({ step })}</Heading>
        <p>{texts.stepBody}</p>
      </div>
      <Button onClick={() => setStep(step + 1)}>{texts.next}</Button>
    </div>
  )
}
