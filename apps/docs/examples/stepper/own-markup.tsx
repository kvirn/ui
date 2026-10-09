'use client'
import { useStepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts, textLang } = useStepperTexts()
  const stepper = useStepper({ current: 4, total: 5, name: texts.sectionName })
  return (
    <p {...stepper.rootProps} lang={textLang}>
      {stepper.text}
    </p>
  )
}
