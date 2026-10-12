'use client'
import { Field, useTextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function OwnInput() {
  const { texts } = useTextInputTexts()
  const input = useTextInput({ type: 'email' })
  return (
    <Field.Root required>
      <Field.Label>{texts.email}</Field.Label>
      <input {...input.inputProps} name="email" autoComplete="email" />
    </Field.Root>
  )
}
