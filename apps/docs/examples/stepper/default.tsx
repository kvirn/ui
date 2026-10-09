'use client'
import { Heading, Stepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function DefaultStepper() {
  const { texts, textLang } = useStepperTexts()
  return (
    <div lang={textLang}>
      <Heading as="h4">{texts.heading}</Heading>
      <Stepper current={2} total={5} name={texts.sectionName} />
    </div>
  )
}
