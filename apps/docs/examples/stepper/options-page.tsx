'use client'
import { Button, Field, RadioGroup, Stepper } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function OptionsPage() {
  const { texts } = useStepperTexts()
  return (
    <form
      onSubmit={(event) => {
        // A real form saves the answer and goes to the next page from here.
        event.preventDefault()
      }}
    >
      <RadioGroup.Root name="owner">
        <RadioGroup.Legend className="kv-fieldset-legend--heading">
          {/* An h1 on a real page: the docs page has its own h1, so the levels here stay below it. */}
          <h4>{texts.owner.question}</h4>
        </RadioGroup.Legend>
        <Stepper current={2} total={5} name={texts.sectionName} />
        <Field.Root>
          <RadioGroup.Radio value="me" />
          <Field.Label>{texts.owner.me}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="company" />
          <Field.Label>{texts.owner.company}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="family" />
          <Field.Label>{texts.owner.family}</Field.Label>
        </Field.Root>
      </RadioGroup.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.continue}
      </Button>
    </form>
  )
}
