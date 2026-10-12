'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DescriptionAndHelpText() {
  const { texts, isFallback } = useFieldTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.email}</Field.Label>
        <Field.Prose>
          <p>{texts.emailDescription}</p>
        </Field.Prose>
        <TextInput name="email" type="email" autoComplete="email" />
        <Field.HelpText>{texts.emailHelpText}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
