'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function WrongYear() {
  const { texts, textLang } = useDateInputTexts()
  const { order } = useDateInput()
  return (
    <Fieldset.Root group required invalid lang={textLang}>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <DateInput.Root
        name="birth"
        autoComplete="bday"
        defaultValue={{ day: '27', month: '3', year: '07' }}
        invalidParts={['year']}
      />
      <Fieldset.HelpText>
        {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
      </Fieldset.HelpText>
      <Fieldset.ErrorMessage>{texts.errorYear}</Fieldset.ErrorMessage>
    </Fieldset.Root>
  )
}
