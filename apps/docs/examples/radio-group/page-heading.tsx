'use client'
import { Button, Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function PageHeadingRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    // On your site, sending the form goes on to the next page.
    <form onSubmit={(event) => event.preventDefault()}>
      <RadioGroup.Root name="applicant" required>
        <RadioGroup.Legend className="kv-fieldset-legend--heading">
          <h2>{texts.applicantHeading}</h2>
        </RadioGroup.Legend>
        <RadioGroup.Prose>
          <p>{texts.applicantProse}</p>
        </RadioGroup.Prose>
        <RadioGroup.Option>
          <RadioGroup.Radio value="self" />
          <Field.Label>{texts.applicantSelf}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="someone-else" />
          <Field.Label>{texts.applicantSomeoneElse}</Field.Label>
        </RadioGroup.Option>
        <RadioGroup.Option>
          <RadioGroup.Radio value="organisation" />
          <Field.Label>{texts.applicantOrganisation}</Field.Label>
        </RadioGroup.Option>
      </RadioGroup.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.continue}
      </Button>
    </form>
  )
}
