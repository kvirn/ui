'use client'
import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'

export function QuestionAsHeading() {
  const { texts } = useFieldsetTexts()
  return (
    <Fieldset.Root>
      <Fieldset.Legend className="kv-fieldset-legend--heading">
        <h2>{texts.contactHeading}</h2>
      </Fieldset.Legend>
      <Field.Root required>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput name="email" type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root>
        <Field.Label>{texts.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" />
      </Field.Root>
    </Fieldset.Root>
  )
}
