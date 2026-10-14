'use client'
import { Button, Checkbox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxTexts } from './texts.ts'

export function PlainForm() {
  const { texts } = useCheckboxTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        const newsletter = new FormData(event.currentTarget).get('newsletter')
        setSent(typeof newsletter === 'string' ? newsletter : texts.notChosen)
      }}
    >
      <Field.Root>
        <Checkbox name="newsletter" value="yes" />
        <Field.Label>{texts.newsletter}</Field.Label>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p>
          {texts.sent} {sent}
        </p>
      )}
    </form>
  )
}
