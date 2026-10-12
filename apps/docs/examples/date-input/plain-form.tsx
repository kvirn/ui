'use client'
import { Button, DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function PlainForm() {
  const { texts, isFallback } = useDateInputTexts()
  const { order } = useDateInput()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSent(
            (['year', 'month', 'day'] as const)
              .map((part) => {
                const text = data.get(`birth-${part}`)
                return typeof text === 'string' ? text : ''
              })
              .join('-'),
          )
        }}
      >
        <Fieldset.Root group required>
          <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
          <DateInput.Root name="birth" autoComplete="bday" />
          <Fieldset.HelpText>
            {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
          </Fieldset.HelpText>
        </Fieldset.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
        {sent === undefined ? null : (
          <p>
            {texts.sent} {sent}
          </p>
        )}
      </form>
    </InEnglishWhenFallback>
  )
}
