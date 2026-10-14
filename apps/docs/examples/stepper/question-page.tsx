'use client'
import { Button, Field, Heading, Stack, Stepper, TextInput } from '@kvirn-ui/react'
import { useStepperTexts } from './texts.ts'

export function QuestionPage() {
  const { texts } = useStepperTexts()
  return (
    <form
      onSubmit={(event) => {
        // A real form saves the answer and goes to the next page from here.
        event.preventDefault()
      }}
    >
      <Field.Root>
        <Stack className="kv-stack--gap-2">
          {/* An h1 on a real page: the docs page has its own h1, so the levels here stay below it. */}
          <Heading as="h4">
            <Field.Label className="kv-field-label--heading">
              {texts.registrationNumber}
            </Field.Label>
          </Heading>
          <Stepper current={2} total={5} name={texts.sectionName} />
        </Stack>
        <TextInput name="registration-number" />
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.continue}
      </Button>
    </form>
  )
}
