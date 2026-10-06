'use client'
import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'

export function OneQuestion() {
  const { texts, textLang } = useFieldsetTexts()
  return (
    <Fieldset.Root group lang={textLang}>
      <Fieldset.Legend>{texts.contactPerson}</Fieldset.Legend>
      <Field.Root>
        <Field.Label>{texts.firstName}</Field.Label>
        <TextInput name="contactFirstName" />
      </Field.Root>
      <Field.Root>
        <Field.Label>{texts.lastName}</Field.Label>
        <TextInput name="contactLastName" />
      </Field.Root>
    </Fieldset.Root>
  )
}
