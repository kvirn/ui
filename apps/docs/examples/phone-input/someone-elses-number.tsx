'use client'
import { Field, PhoneInput, Stack } from '@kvirn-ui/react'
import { usePhoneInputTexts } from './texts.ts'

export function SomeoneElsesNumber() {
  const { texts } = usePhoneInputTexts()
  return (
    <Stack className="kv-stack--gap-8">
      <Field.Root required>
        <Field.Label>{texts.yourLabel}</Field.Label>
        <PhoneInput.Number name="phone" />
      </Field.Root>
      <Field.Root>
        <Field.Label>{texts.otherLabel}</Field.Label>
        <PhoneInput.Number name="otherPhone" autoComplete="off" />
        <Field.HelpText>{texts.otherHelp}</Field.HelpText>
      </Field.Root>
    </Stack>
  )
}
