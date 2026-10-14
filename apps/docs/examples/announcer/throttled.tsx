'use client'
import { Field, TextInput, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'

export function ThrottledAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <Field.Root>
      <Field.Label marker="none">{texts.digits.label}</Field.Label>
      <TextInput
        inputMode="numeric"
        autoComplete="tel"
        onChange={(event) => {
          const input = event.currentTarget
          const digits = input.value.replaceAll(/\D/g, '')
          if (digits !== input.value) {
            input.value = digits
            announce(texts.digits.message, { key: 'phone-number' })
          }
        }}
      />
      <Field.HelpText>{texts.digits.hint}</Field.HelpText>
    </Field.Root>
  )
}
