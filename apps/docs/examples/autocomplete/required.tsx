'use client'
import { Autocomplete, Button, Field } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function RequiredAutocomplete() {
  const { texts } = useAutocompleteTexts()
  const [street, setStreet] = useState('')
  const [attempts, setAttempts] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const isInvalid = attempts > 0 && street.trim() === ''

  // The Autocomplete never moves focus: after a failed send, you move it to the input, so a
  // screen reader reads the label and the error together.
  useEffect(() => {
    if (attempts > 0) {
      formRef.current?.querySelector('input')?.focus()
    }
  }, [attempts])

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        if (street.trim() === '') {
          setAttempts((count) => count + 1)
        }
      }}
    >
      <Field.Root required invalid={isInvalid}>
        <Field.Label>{texts.street}</Field.Label>
        <Autocomplete.Root items={streets} value={street} onValueChange={setStreet}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(item: string) => <Autocomplete.Option item={item} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
        <Field.ErrorMessage>{texts.streetError}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
