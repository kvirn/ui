'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NoAutoAdvance() {
  const { texts, isFallback } = useDateInputTexts()
  const { order } = useDateInput()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Fieldset.Root group required>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" autoAdvance={false} />
        <Fieldset.HelpText>
          {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
    </InEnglishWhenFallback>
  )
}
