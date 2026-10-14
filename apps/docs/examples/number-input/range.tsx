'use client'
import { Button, Field, NumberInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useNumberInputTexts } from './texts.ts'

export function Range() {
  const { texts } = useNumberInputTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Focus moves after the error has rendered, so the screen reader reads it with the input.
  useEffect(() => {
    if (attempts > 0 && hasError) {
      inputRef.current?.focus()
    }
  }, [attempts, hasError])

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setHasError(!isValid)
        setAttempts((count) => count + 1)
      }}
    >
      <Field.Root required invalid={hasError}>
        <Field.Label>{texts.people}</Field.Label>
        <NumberInput
          ref={inputRef}
          name="people"
          min={1}
          max={8}
          className="kv-input--width-2"
          onValueChange={(value, details) => {
            const isNowValid = value !== '' && details.isWithinRange !== false
            setIsValid(isNowValid)
            if (isNowValid) {
              setHasError(false)
            }
          }}
        />
        <Field.HelpText>{texts.peopleHint}</Field.HelpText>
        <Field.ErrorMessage>{texts.errorRange}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
