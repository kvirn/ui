'use client'
import { Checkbox, Field } from '@kvirn-ui/react'
import { useCheckboxTexts } from './texts.ts'

export function WithHelpText() {
  const { texts } = useCheckboxTexts()
  return (
    <Field.Root>
      <Checkbox name="newsletter" />
      <Field.Label>{texts.newsletter}</Field.Label>
      <Field.HelpText>{texts.newsletterHint}</Field.HelpText>
    </Field.Root>
  )
}
