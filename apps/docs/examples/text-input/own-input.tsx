'use client'
import { Field, useTextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnInput() {
  const { texts, isFallback } = useTextInputTexts()
  const input = useTextInput({ type: 'email' })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.email}</Field.Label>
        <input {...input.inputProps} name="email" autoComplete="email" />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
