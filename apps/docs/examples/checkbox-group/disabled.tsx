'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DisabledCheckboxGroup() {
  const { texts, isFallback } = useCheckboxGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <CheckboxGroup.Root name="contact" defaultValue={['letter']} disabled>
        <CheckboxGroup.Legend>{texts.disabledLegend}</CheckboxGroup.Legend>
        <Field.Root>
          <Checkbox value="text" />
          <Field.Label>{texts.text}</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox value="letter" />
          <Field.Label>{texts.letter}</Field.Label>
        </Field.Root>
        <CheckboxGroup.HelpText>{texts.disabledHelp}</CheckboxGroup.HelpText>
      </CheckboxGroup.Root>
    </InEnglishWhenFallback>
  )
}
