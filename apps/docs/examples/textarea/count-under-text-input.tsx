'use client'
import { CharacterCount, Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextareaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CountUnderTextInput() {
  const { texts, isFallback } = useTextareaTexts()
  const [value, setValue] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.summaryLabel}</Field.Label>
        <TextInput name="summary" value={value} onValueChange={setValue} />
        <CharacterCount value={value} limit={80} />
        <Field.HelpText>{texts.summaryHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
