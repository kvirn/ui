'use client'
import { Field, TextInput, useFieldset } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'

export function OwnElements() {
  const { texts, textLang } = useFieldsetTexts()
  const fieldset = useFieldset({ descriptions: ['helpText'] })
  return (
    <fieldset {...fieldset.fieldsetProps} lang={textLang}>
      <legend {...fieldset.legendProps}>{texts.address}</legend>
      <Field.Root required>
        <Field.Label>{texts.street}</Field.Label>
        <TextInput name="street" autoComplete="street-address" />
      </Field.Root>
      <p {...fieldset.getDescriptionProps('helpText')} className="kv-field-help-text">
        {texts.addressHelpText}
      </p>
    </fieldset>
  )
}
