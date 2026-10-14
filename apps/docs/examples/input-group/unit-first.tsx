'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'

export function UnitFirst() {
  const { texts } = useInputGroupTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.rent}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Addon>{texts.currency}</InputGroup.Addon>
        <NumberInput name="rent" className="kv-input--width-10" />
      </InputGroup.Root>
    </Field.Root>
  )
}
