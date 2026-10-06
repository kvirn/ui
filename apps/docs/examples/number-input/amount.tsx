'use client'
import { Field, NumberInput, useLocale } from '@kvirn-ui/react'
import { useState } from 'react'
import { exampleAmount, useNumberInputTexts } from './texts.ts'

export function Amount() {
  const { texts, textLang } = useNumberInputTexts()
  const { locale } = useLocale()
  const [unmaskedValue, setUnmaskedValue] = useState('')
  return (
    <div lang={textLang}>
      <Field.Root required>
        <Field.Label>{texts.rent}</Field.Label>
        <NumberInput
          name="rent"
          decimals={2}
          grouping
          className="kv-input--width-10"
          onValueChange={(_value, details) => {
            setUnmaskedValue(details.unmaskedValue ?? '')
          }}
        />
        <Field.HelpText>{texts.rentHint(exampleAmount(locale))}</Field.HelpText>
      </Field.Root>
      <p>
        {texts.valueToSend}: <code>{unmaskedValue}</code>
      </p>
    </div>
  )
}
