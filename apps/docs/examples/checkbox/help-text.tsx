'use client'
import { Checkbox, Field } from '@kvirn-ui/react'
import { useCheckboxTexts } from './texts.ts'

export function WithHelpText() {
  const { texts, textLang } = useCheckboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Checkbox name="newsletter" />
      <Field.Label>{texts.newsletter}</Field.Label>
      <Field.HelpText>{texts.newsletterHint}</Field.HelpText>
    </Field.Root>
  )
}
