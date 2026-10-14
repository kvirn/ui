'use client'
import { Field, NumberInput, useLocale } from '@kvirn-ui/react'
import { useState } from 'react'
import { exampleHours, useNumberInputTexts } from './texts.ts'

export function Amount() {
  const { texts } = useNumberInputTexts()
  const { locale } = useLocale()
  const [unmaskedValue, setUnmaskedValue] = useState('')
  return (
    <div>
      <Field.Root required>
        <Field.Label>{texts.hours}</Field.Label>
        <NumberInput
          name="hours"
          decimals={1}
          className="kv-input--width-6"
          onValueChange={(_value, details) => {
            setUnmaskedValue(details.unmaskedValue ?? '')
          }}
        />
        <Field.HelpText>{texts.hoursHint(exampleHours(locale))}</Field.HelpText>
      </Field.Root>
      <p>
        {texts.valueToSend}: <code>{unmaskedValue}</code>
      </p>
    </div>
  )
}
