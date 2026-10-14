'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function InputTypes() {
  const { texts } = useTextInputTexts()
  return (
    <>
      <Field.Root required>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput name="email" type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{texts.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" />
      </Field.Root>
      <Field.Root>
        <Field.Label>{texts.website}</Field.Label>
        <TextInput name="website" type="url" autoComplete="url" />
      </Field.Root>
    </>
  )
}
