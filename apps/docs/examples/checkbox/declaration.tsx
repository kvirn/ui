'use client'
import { Button, Checkbox, Field } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useCheckboxTexts } from './texts.ts'

export function Declaration() {
  const { texts } = useCheckboxTexts()
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const checkboxRef = useRef<HTMLInputElement>(null)
  const isInvalid = attempts > 0 && !checked

  // The Checkbox never moves focus: after a failed send, you move it to the box, so a screen
  // reader reads the label, the state and the error together.
  useEffect(() => {
    if (attempts > 0) {
      checkboxRef.current?.focus()
    }
  }, [attempts])

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        if (!checked) {
          setAttempts((count) => count + 1)
        }
      }}
    >
      <Field.Root required invalid={isInvalid}>
        <Checkbox
          ref={checkboxRef}
          name="declaration"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Field.Label>{texts.declaration}</Field.Label>
        <Field.ErrorMessage>{texts.declarationError}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
