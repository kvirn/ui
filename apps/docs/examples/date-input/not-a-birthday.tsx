'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function VisitDate() {
  const { texts, textLang } = useDateInputTexts()
  const { order } = useDateInput()
  return (
    <Fieldset.Root group lang={textLang}>
      <Fieldset.Legend>{texts.visitLegend}</Fieldset.Legend>
      <DateInput.Root name="visit" />
      <Fieldset.HelpText>
        {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
      </Fieldset.HelpText>
    </Fieldset.Root>
  )
}
