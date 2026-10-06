'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function DefaultTextInput() {
  const { texts, textLang } = useTextInputTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.fullName}</Field.Label>
      <TextInput name="name" autoComplete="name" />
    </Field.Root>
  )
}
