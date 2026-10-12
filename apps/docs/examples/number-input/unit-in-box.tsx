'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function UnitInBox() {
  const { texts } = useNumberInputTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.rentInCrowns}</Field.Label>
      <InputGroup.Root>
        <NumberInput name="rent" grouping className="kv-input--width-10" />
        <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
      </InputGroup.Root>
    </Field.Root>
  )
}
