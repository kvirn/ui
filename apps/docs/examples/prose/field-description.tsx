'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function FieldDescription() {
  const { texts, isFallback } = useProseTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.field.label}</Field.Label>
        <Field.Prose>
          <p>{texts.field.description}</p>
        </Field.Prose>
        <TextInput name="registration" autoComplete="off" />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
