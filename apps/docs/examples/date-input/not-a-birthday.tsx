'use client'
import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function VisitDate() {
  const { texts, isFallback } = useDateInputTexts()
  const { order } = useDateInput()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Fieldset.Root group>
        <Fieldset.Legend>{texts.visitLegend}</Fieldset.Legend>
        <DateInput.Root name="visit" />
        <Fieldset.HelpText>
          {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
    </InEnglishWhenFallback>
  )
}
