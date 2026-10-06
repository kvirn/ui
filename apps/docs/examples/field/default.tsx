'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function DefaultField() {
  const { texts, textLang } = useFieldTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.fullName}</Field.Label>
      <TextInput name="name" autoComplete="name" />
    </Field.Root>
  )
}
