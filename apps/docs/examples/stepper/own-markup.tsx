'use client'
import { Heading, useStepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts } = useStepperTexts()
  const stepper = useStepper({ current: 2, total: 5, name: texts.sectionName })
  return (
    <div>
      {/* An h1 on a real page: the docs page has its own h1, so the levels here stay below it. */}
      <Heading as="h4">{texts.heading}</Heading>
      <p {...stepper.rootProps}>{stepper.text}</p>
    </div>
  )
}
