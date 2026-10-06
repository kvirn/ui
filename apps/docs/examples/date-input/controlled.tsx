'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import type { DateInputValue } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateInputTexts } from './texts.ts'

export function ControlledDate() {
  const { texts, textLang } = useDateInputTexts()
  const { order } = useDateInput()
  const [value, setValue] = useState<DateInputValue>({ year: '', month: '', day: '' })
  return (
    <Fieldset.Root group required lang={textLang}>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <DateInput.Root name="birth" autoComplete="bday" value={value} onValueChange={setValue} />
      <Fieldset.HelpText>
        {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
      </Fieldset.HelpText>
      <p>
        {texts.youEntered} {value.year}-{value.month}-{value.day}
      </p>
    </Fieldset.Root>
  )
}
