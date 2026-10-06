'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'

export function Invalid() {
  const { texts, textLang } = useInputGroupTexts()
  return (
    <Field.Root required invalid lang={textLang}>
      <Field.Label>{texts.distance}</Field.Label>
      <InputGroup.Root>
        <NumberInput name="distance" className="kv-input--width-6" />
        <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
      </InputGroup.Root>
      <Field.ErrorMessage>{texts.errorDistance}</Field.ErrorMessage>
    </Field.Root>
  )
}
