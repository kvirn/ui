'use client'
import { Field, Fieldset, TextInput } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'

export function DisabledGroup() {
  const { texts, textLang } = useFieldsetTexts()
  return (
    <Fieldset.Root disabled lang={textLang}>
      <Fieldset.Legend>{texts.lockedLegend}</Fieldset.Legend>
      <Field.Root>
        <Field.Label>{texts.applicant}</Field.Label>
        <TextInput name="applicant" defaultValue="Anna Andersson" />
      </Field.Root>
      <Fieldset.HelpText>{texts.lockedHelpText}</Fieldset.HelpText>
    </Fieldset.Root>
  )
}
