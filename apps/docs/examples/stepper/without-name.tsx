'use client'
import { Heading, Stepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WithoutName() {
  const { texts, isFallback } = useStepperTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Heading as="h4">{texts.detailsHeading}</Heading>
        <Stepper current={1} total={3} />
      </div>
    </InEnglishWhenFallback>
  )
}
