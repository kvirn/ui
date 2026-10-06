'use client'
import { Field, TextInput, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'

export function ThrottledAnnouncer() {
  const { texts, textLang } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <Field.Root lang={textLang}>
      <Field.Label marker="none">{texts.digits.label}</Field.Label>
      <TextInput
        inputMode="numeric"
        autoComplete="off"
        onChange={(event) => {
          if (/\D/.test(event.currentTarget.value)) {
            announce(texts.digits.message, { key: 'phone-number' })
          }
        }}
      />
    </Field.Root>
  )
}
