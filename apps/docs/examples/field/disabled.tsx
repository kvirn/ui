'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DisabledWithReason() {
  const { texts, isFallback } = useFieldTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root disabled>
        <Field.Label>{texts.lockedName}</Field.Label>
        <TextInput name="name" defaultValue="Anna Andersson" />
        <Field.HelpText>{texts.lockedHelpText}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
