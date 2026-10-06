'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'

export function Controlled() {
  const { texts, textLang } = useTextInputTexts()
  const [value, setValue] = useState('')
  return (
    <>
      <Field.Root required lang={textLang}>
        <Field.Label>{texts.fullName}</Field.Label>
        <TextInput name="name" autoComplete="name" value={value} onValueChange={setValue} />
      </Field.Root>
      <p lang={textLang}>
        {texts.youTyped}: {value}
      </p>
    </>
  )
}
