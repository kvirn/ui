'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Controlled() {
  const { texts, isFallback } = useTextInputTexts()
  const [value, setValue] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <Field.Root required>
          <Field.Label>{texts.fullName}</Field.Label>
          <TextInput name="name" autoComplete="name" value={value} onValueChange={setValue} />
        </Field.Root>
        <p>
          {texts.youTyped}: {value}
        </p>
      </>
    </InEnglishWhenFallback>
  )
}
