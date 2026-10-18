'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'

export function ControlledRadioGroup() {
  const { texts } = useRadioGroupTexts()
  // This state stands in for your form library: `null` means controlled with nothing chosen.
  const [duration, setDuration] = useState<string | null>(null)
  return (
    <div>
      <RadioGroup.Root name="duration" value={duration} onValueChange={setDuration}>
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
      <p>
        {texts.youChose}: {duration ?? texts.nothing}
      </p>
    </div>
  )
}
