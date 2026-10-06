'use client'
import { Button, Field, RadioGroup } from '@kvirn-ui/react'
import { useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'

export function PlainFormRadioGroup() {
  const { texts, textLang } = useRadioGroupTexts()
  const [sent, setSent] = useState<string | undefined>(undefined)
  return (
    <form
      lang={textLang}
      onSubmit={(event) => {
        event.preventDefault()
        const duration = new FormData(event.currentTarget).get('duration')
        setSent(typeof duration === 'string' ? duration : undefined)
      }}
    >
      <RadioGroup.Root name="duration" defaultValue="6">
        <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
        <Field.Root>
          <RadioGroup.Radio value="1" />
          <Field.Label>{texts.oneMonth}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="6" />
          <Field.Label>{texts.sixMonths}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{texts.twelveMonths}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p>
          {texts.sent}: {sent}
        </p>
      )}
    </form>
  )
}
