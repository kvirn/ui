'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function DefaultTextInput() {
  const { texts } = useTextInputTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.fullName}</Field.Label>
      <TextInput name="name" autoComplete="name" />
    </Field.Root>
  )
}
