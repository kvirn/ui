'use client'
import { DateInput, Fieldset } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function PaperFormOrder() {
  const { texts, isFallback } = useDateInputTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Fieldset.Root group required>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday">
          <DateInput.Day />
          <DateInput.Month />
          <DateInput.Year />
        </DateInput.Root>
        <Fieldset.HelpText>{texts.hintDayFirst}</Fieldset.HelpText>
      </Fieldset.Root>
    </InEnglishWhenFallback>
  )
}
