'use client'
import { Field, useTextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function OwnInput() {
  const { texts, textLang } = useTextInputTexts()
  const input = useTextInput({ type: 'email' })
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.email}</Field.Label>
      <input {...input.inputProps} name="email" autoComplete="email" />
    </Field.Root>
  )
}
