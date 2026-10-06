'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'

export function MaskedCode() {
  const { texts, textLang } = useTextInputTexts()
  const [unmasked, setUnmasked] = useState('')
  return (
    <>
      <Field.Root required lang={textLang}>
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
      <p lang={textLang}>
        {texts.unmasked}: {unmasked}
      </p>
    </>
  )
}
