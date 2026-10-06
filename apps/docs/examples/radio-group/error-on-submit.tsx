'use client'
import { Button, Field, RadioGroup } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useRadioGroupTexts } from './texts.ts'

export function ErrorOnSubmitRadioGroup() {
  const { texts, textLang } = useRadioGroupTexts()
  const [duration, setDuration] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const isInvalid = attempts > 0 && duration === null

  // The group never moves focus: after a failed submit, you move it to the first radio.
  useEffect(() => {
    if (attempts > 0) {
      formRef.current?.querySelector('input')?.focus()
    }
  }, [attempts])

  return (
    <form
      ref={formRef}
      lang={textLang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (duration === null) {
          setAttempts((count) => count + 1)
        }
      }}
    >
      <RadioGroup.Root
        name="duration"
        required
        invalid={isInvalid}
        value={duration}
        onValueChange={setDuration}
      >
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
        <RadioGroup.ErrorMessage>{texts.errorMissing}</RadioGroup.ErrorMessage>
      </RadioGroup.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
