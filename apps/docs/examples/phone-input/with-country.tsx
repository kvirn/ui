'use client'
import { Field, Fieldset, PhoneInput, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { usePhoneInputTexts } from './texts.ts'

export function WithCountry() {
  const { texts } = usePhoneInputTexts()
  const [country, setCountry] = useState('SE')
  const [number, setNumber] = useState('')
  return (
    <Stack className="kv-stack--gap-8">
      <Fieldset.Root>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <PhoneInput.Root defaultCountry="SE" onCountryChange={(next) => setCountry(next)}>
          <Field.Root>
            <Field.Label marker="none">{texts.countryLabel}</Field.Label>
            <PhoneInput.Country name="phoneCountry" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>{texts.numberLabel}</Field.Label>
            <PhoneInput.Number name="phone" onValueChange={(value) => setNumber(value)} />
            <Field.HelpText>{texts.nationalHelp}</Field.HelpText>
          </Field.Root>
        </PhoneInput.Root>
      </Fieldset.Root>
      <p>
        {texts.formHolds}: <code>{country}</code>, <code>{number}</code>
      </p>
    </Stack>
  )
}
