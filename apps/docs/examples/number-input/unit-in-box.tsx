'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function UnitInBox() {
  const { texts, textLang } = useNumberInputTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.rentInCrowns}</Field.Label>
      <InputGroup.Root>
        <NumberInput name="rent" grouping className="kv-input--width-10" />
        <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
      </InputGroup.Root>
    </Field.Root>
  )
}
