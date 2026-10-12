'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function DefaultField() {
  const { texts } = useFieldTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.fullName}</Field.Label>
      <TextInput name="name" autoComplete="name" />
    </Field.Root>
  )
}
