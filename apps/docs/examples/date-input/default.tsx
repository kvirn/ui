'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function BirthDate() {
  const { texts } = useDateInputTexts()
  const { order } = useDateInput()
  return (
    <Fieldset.Root group required>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <DateInput.Root name="birth" autoComplete="bday" />
      <Fieldset.HelpText>
        {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
      </Fieldset.HelpText>
    </Fieldset.Root>
  )
}
