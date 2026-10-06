'use client'
import { Button, Checkbox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxTexts } from './texts.ts'

export function Declaration() {
  const { texts, textLang } = useCheckboxTexts()
  const [checked, setChecked] = useState(false)
  const [hasTriedToSend, setHasTriedToSend] = useState(false)
  return (
    <form
      noValidate
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        setHasTriedToSend(true)
      }}
    >
      <Field.Root required invalid={hasTriedToSend && !checked} lang={textLang}>
        <Checkbox name="declaration" checked={checked} onCheckedChange={setChecked} />
        <Field.Label>{texts.declaration}</Field.Label>
        <Field.ErrorMessage>{texts.declarationError}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.send}
      </Button>
    </form>
  )
}
