'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function FieldDescription() {
  const { texts } = useProseTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.field.label}</Field.Label>
      <Field.Prose>
        <p>{texts.field.description}</p>
      </Field.Prose>
      <TextInput name="registration" autoComplete="off" />
    </Field.Root>
  )
}
