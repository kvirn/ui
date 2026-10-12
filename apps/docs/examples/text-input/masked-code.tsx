'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function MaskedCode() {
  const { texts, isFallback } = useTextInputTexts()
  const [unmasked, setUnmasked] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <Field.Root required>
          <Field.Label>{texts.postalCode}</Field.Label>
          <TextInput
            name="postalCode"
            mask={{ preset: 'postal-code', country: 'SE' }}
            autoComplete="postal-code"
            className="kv-input--width-6"
            onValueChange={(_value, details) => setUnmasked(details.unmaskedValue ?? '')}
          />
          <Field.HelpText>{texts.postalCodeHelpText}</Field.HelpText>
        </Field.Root>
        <p>
          {texts.unmasked}: {unmasked}
        </p>
      </>
    </InEnglishWhenFallback>
  )
}
