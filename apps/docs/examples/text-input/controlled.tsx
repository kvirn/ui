'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'

export function Controlled() {
  const { texts } = useTextInputTexts()
  const [value, setValue] = useState('')
  return (
    <>
      <Field.Root required>
        <Field.Label>{texts.fullName}</Field.Label>
        <TextInput name="name" autoComplete="name" value={value} onValueChange={setValue} />
      </Field.Root>
      <p>
        {texts.youTyped}: {value}
      </p>
    </>
  )
}
