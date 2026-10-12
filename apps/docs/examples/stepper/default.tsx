'use client'
import { Heading, Stepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultStepper() {
  const { texts, isFallback } = useStepperTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Heading as="h4">{texts.heading}</Heading>
        <Stepper current={2} total={5} name={texts.sectionName} />
      </div>
    </InEnglishWhenFallback>
  )
}
