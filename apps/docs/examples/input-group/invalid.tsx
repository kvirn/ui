'use client'
import { Field, InputGroup, NumberInput } from '@kvirn-ui/react'
import { useInputGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Invalid() {
  const { texts, isFallback } = useInputGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required invalid>
        <Field.Label>{texts.distance}</Field.Label>
        <InputGroup.Root>
          <NumberInput name="distance" className="kv-input--width-6" />
          <InputGroup.Addon>{texts.unit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.ErrorMessage>{texts.errorDistance}</Field.ErrorMessage>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
