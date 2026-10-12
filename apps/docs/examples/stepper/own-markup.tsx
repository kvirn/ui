'use client'
import { useStepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnMarkup() {
  const { texts, isFallback } = useStepperTexts()
  const stepper = useStepper({ current: 4, total: 5, name: texts.sectionName })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p {...stepper.rootProps}>{stepper.text}</p>
    </InEnglishWhenFallback>
  )
}
