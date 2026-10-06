'use client'
import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'

export function DefaultFieldset() {
  const { texts, textLang } = useFieldsetTexts()
  return (
    <Fieldset.Root lang={textLang}>
      <Fieldset.Legend>{texts.address}</Fieldset.Legend>
      <Field.Root required>
        <Field.Label>{texts.street}</Field.Label>
        <TextInput name="street" autoComplete="street-address" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{texts.postalCode}</Field.Label>
        <TextInput
          name="postalCode"
          autoComplete="postal-code"
          inputMode="numeric"
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{texts.city}</Field.Label>
        <TextInput name="city" autoComplete="address-level2" />
      </Field.Root>
    </Fieldset.Root>
  )
}
