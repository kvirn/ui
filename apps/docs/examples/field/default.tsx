'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultField() {
  const { texts, isFallback } = useFieldTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.fullName}</Field.Label>
        <TextInput name="name" autoComplete="name" />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
