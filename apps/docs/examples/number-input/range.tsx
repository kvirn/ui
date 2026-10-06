'use client'
import { Button, Field, NumberInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useNumberInputTexts } from './texts.ts'

export function Range() {
  const { texts, textLang } = useNumberInputTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isWithinRange, setIsWithinRange] = useState(true)
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
      lang={textLang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setHasError(!isWithinRange)
        setAttempts((count) => count + 1)
      }}
    >
      <Field.Root required invalid={hasError}>
        <Field.Label>{texts.children}</Field.Label>
        <NumberInput
          ref={inputRef}
          name="children"
          min={0}
          max={12}
          className="kv-input--width-2"
          onValueChange={(_value, details) => {
            setIsWithinRange(details.isWithinRange !== false)
          }}
        />
        <Field.HelpText>{texts.childrenHint}</Field.HelpText>
        <Field.ErrorMessage>{texts.errorRange}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
