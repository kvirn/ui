'use client'
import { Field, PhoneInput } from '@kvirn-ui/react'
import { usePhoneInputTexts } from './texts.ts'

export function DefaultPhoneInput() {
  const { texts } = usePhoneInputTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.label}</Field.Label>
      <PhoneInput.Number name="phone" />
      <Field.HelpText>{texts.help}</Field.HelpText>
    </Field.Root>
  )
}
