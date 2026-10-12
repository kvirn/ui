'use client'
import { Field, Textarea } from '@kvirn-ui/react'
import { useTextareaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CharacterLimit() {
  const { texts, isFallback } = useTextareaTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.label}</Field.Label>
        <Field.Prose>
          <p>{texts.description}</p>
        </Field.Prose>
        <Textarea name="situation" maxLength={200} characterCount />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
