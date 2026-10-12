'use client'
import { Field, TextInput, useFieldset } from '@kvirn-ui/react'
import { useFieldsetTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnElements() {
  const { texts, isFallback } = useFieldsetTexts()
  const fieldset = useFieldset({ descriptions: ['helpText'] })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <fieldset {...fieldset.fieldsetProps}>
        <legend {...fieldset.legendProps}>{texts.address}</legend>
        <Field.Root required>
          <Field.Label>{texts.street}</Field.Label>
          <TextInput name="street" autoComplete="street-address" />
        </Field.Root>
        <p {...fieldset.getDescriptionProps('helpText')} className="kv-field-help-text">
          {texts.addressHelpText}
        </p>
      </fieldset>
    </InEnglishWhenFallback>
  )
}
