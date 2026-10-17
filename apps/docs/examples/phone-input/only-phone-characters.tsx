'use client'
import { Field, PhoneInput } from '@kvirn-ui/react'
import { usePhoneInputTexts } from './texts.ts'

export function OnlyPhoneCharacters() {
  const { texts } = usePhoneInputTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.label}</Field.Label>
      <PhoneInput.Number name="phone" mask="telephone" />
      <Field.HelpText>{texts.maskHelp}</Field.HelpText>
    </Field.Root>
  )
}
