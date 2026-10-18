'use client'
import { Button, Field, RadioGroup } from '@kvirn-ui/react'
import { useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'

export function PlainFormRadioGroup() {
  const { texts } = useRadioGroupTexts()
  const [sent, setSent] = useState<string | undefined>(undefined)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const duration = new FormData(event.currentTarget).get('duration')
        setSent(typeof duration === 'string' ? duration : undefined)
      }}
    >
      <RadioGroup.Root name="duration" defaultValue="6">
        <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
        <RadioGroup.Option>
          <RadioGroup.Radio value="1" />
          <Field.Label>{texts.oneMonth}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="6" />
          <Field.Label>{texts.sixMonths}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="12" />
          <Field.Label>{texts.twelveMonths}</Field.Label>
        </RadioGroup.Option>
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
