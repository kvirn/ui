'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function CompactRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    <div className="kv-compact">
      <RadioGroup.Root name="decision" required>
        <RadioGroup.Legend>{texts.caseLegend}</RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{texts.caseProse}</p>
        </RadioGroup.Prose>
        <RadioGroup.Option>
          <RadioGroup.Radio value="approve" />
          <Field.Label>{texts.caseApprove}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="partly" />
          <Field.Label>{texts.casePartly}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="reject" />
          <Field.Label>{texts.caseReject}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="more-information" />
          <Field.Label>{texts.caseMoreInformation}</Field.Label>
        </RadioGroup.Option>
      </RadioGroup.Root>
    </div>
  )
}
