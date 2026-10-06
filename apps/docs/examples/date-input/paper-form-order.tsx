'use client'
import { DateInput, Fieldset } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function PaperFormOrder() {
  const { texts, textLang } = useDateInputTexts()
  return (
    <Fieldset.Root group required lang={textLang}>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <DateInput.Root name="birth" autoComplete="bday">
        <DateInput.Day />
        <DateInput.Month />
        <DateInput.Year />
      </DateInput.Root>
      <Fieldset.HelpText>{texts.hintDayFirst}</Fieldset.HelpText>
    </Fieldset.Root>
  )
}
