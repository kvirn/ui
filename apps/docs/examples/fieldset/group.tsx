'use client'
import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OneQuestion() {
  const { texts, isFallback } = useFieldsetTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Fieldset.Root group>
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
    </InEnglishWhenFallback>
  )
}
