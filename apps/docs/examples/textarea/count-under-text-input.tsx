'use client'
import { CharacterCount, Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextareaTexts } from './texts.ts'

export function CountUnderTextInput() {
  const { texts } = useTextareaTexts()
  const [value, setValue] = useState('')
  return (
    <Field.Root required>
      <Field.Label>{texts.summaryLabel}</Field.Label>
      <TextInput name="summary" value={value} onValueChange={setValue} />
      <CharacterCount value={value} limit={80} />
      <Field.HelpText>{texts.summaryHint}</Field.HelpText>
    </Field.Root>
  )
}
