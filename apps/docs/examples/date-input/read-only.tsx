'use client'
import { DateInput, Field, Fieldset, TextInput, masks } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function ReadOnlyDate() {
  const { texts } = useDateInputTexts()
  return (
    <>
      <Fieldset.Root group required>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <DateInput.Root
          name="birth"
          readOnly
          autoAdvance={false}
          defaultValue={{ year: '1990', month: '3', day: '27' }}
        />
        <Fieldset.HelpText>{texts.readOnlyReason}</Fieldset.HelpText>
      </Fieldset.Root>
      <Field.Root required>
        <Field.Label>{texts.oneFieldLabel}</Field.Label>
        <TextInput
          name="start"
          mask={masks.date()}
          readOnly
          defaultValue="2026-10-27"
          className="kv-input--width-10"
        />
        <Field.HelpText>{texts.readOnlyReason}</Field.HelpText>
      </Field.Root>
    </>
  )
}
