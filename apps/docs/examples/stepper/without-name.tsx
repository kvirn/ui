'use client'
import { Heading, Stepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function WithoutName() {
  const { texts } = useStepperTexts()
  return (
    <div>
      <Heading as="h4">{texts.detailsHeading}</Heading>
      <Stepper current={1} total={3} />
    </div>
  )
}
