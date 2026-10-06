'use client'
import { Button, DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateInputTexts } from './texts.ts'

export function PlainForm() {
  const { texts, textLang } = useDateInputTexts()
  const { order } = useDateInput()
  const [sent, setSent] = useState<string | undefined>()
  return (
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
      <Fieldset.Root group required lang={textLang}>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" />
        <Fieldset.HelpText>
          {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p lang={textLang}>
          {texts.sent} {sent}
        </p>
      )}
    </form>
  )
}
