'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultRadioGroup() {
  const { texts, isFallback } = useRadioGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <RadioGroup.Root name="duration">
        <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{texts.hint}</p>
        </RadioGroup.Prose>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{texts.oneMonth}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{texts.sixMonths}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{texts.twelveMonths}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
    </InEnglishWhenFallback>
  )
}
