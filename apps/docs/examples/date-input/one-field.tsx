'use client'
import { Field, TextInput, masks, useLocale } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateInputTexts } from './texts.ts'

export function OneFieldDate() {
  const { texts } = useDateInputTexts()
  const { locale } = useLocale()
  const [stored, setStored] = useState('')
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <Field.Root required>
      <Field.Label>{texts.oneFieldLabel}</Field.Label>
      <TextInput
        name="start"
        mask={masks.date()}
        className="kv-input--width-10"
        onValueChange={(_value, details) => setStored(details.unmaskedValue ?? '')}
      />
      <Field.HelpText>{texts.oneFieldHint(example)}</Field.HelpText>
      <p>
        {texts.youEntered} {stored}
      </p>
    </Field.Root>
  )
}
