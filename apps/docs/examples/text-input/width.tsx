'use client'
import { Field, Stack, TextInput } from '@kvirn-ui/react'
import { useTextInputTexts } from './texts.ts'

export function Widths() {
  const { texts, textLang } = useTextInputTexts()
  return (
    <Stack className="kv-stack--gap-8" lang={textLang}>
      <Field.Root required>
        <Field.Label>{texts.houseNumber}</Field.Label>
        <TextInput name="houseNumber" className="kv-input--width-4" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{texts.postalCode}</Field.Label>
        <TextInput
          name="postalCode"
          autoComplete="postal-code"
          inputMode="numeric"
          spellCheck={false}
          className="kv-input--width-6"
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{texts.street}</Field.Label>
        <TextInput name="street" autoComplete="street-address" className="kv-input--width-20" />
      </Field.Root>
    </Stack>
  )
}
