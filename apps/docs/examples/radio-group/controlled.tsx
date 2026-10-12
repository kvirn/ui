'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ControlledRadioGroup() {
  const { texts, isFallback } = useRadioGroupTexts()
  // This state stands in for your form library: `null` means controlled with nothing chosen.
  const [duration, setDuration] = useState<string | null>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <RadioGroup.Root name="duration" value={duration} onValueChange={setDuration}>
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
        <p>
          {texts.youChose}: {duration ?? texts.nothing}
        </p>
      </div>
    </InEnglishWhenFallback>
  )
}
