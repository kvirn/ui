'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultTextInput() {
  const { texts, isFallback } = useTextInputTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.fullName}</Field.Label>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
