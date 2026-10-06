'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts, textLang } = useInputGroupTexts()
  return (
    <Field.Root disabled lang={textLang}>
      <Field.Label>{texts.distance}</Field.Label>
      <InputGroup.Root>
        <NumberInput name="distance" defaultValue="12" className="kv-input--width-6" />
        <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
      </InputGroup.Root>
      <Field.HelpText>{texts.lockedHint}</Field.HelpText>
    </Field.Root>
  )
}
