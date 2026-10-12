'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'

export function DefaultInputGroup() {
  const { texts } = useInputGroupTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.distance}</Field.Label>
      <InputGroup.Root>
        <NumberInput name="distance" className="kv-input--width-6" />
        <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
      </InputGroup.Root>
    </Field.Root>
  )
}
