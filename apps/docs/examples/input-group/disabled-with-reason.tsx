'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DisabledWithReason() {
  const { texts, isFallback } = useInputGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root disabled>
        <Field.Label>{texts.distance}</Field.Label>
        <InputGroup.Root>
          <NumberInput name="distance" defaultValue="12" className="kv-input--width-6" />
          <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{texts.lockedHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
