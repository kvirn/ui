'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useButtonTexts } from './texts.ts'

export function SubmitForm() {
  const { texts } = useButtonTexts()
  const nameId = useId()
  return (
    <form
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
      }}
    >
      <p>
        <label htmlFor={nameId}>{texts.applicantName}</label>{' '}
        <input id={nameId} name="name" autoComplete="name" />
      </p>
      <Button type="submit" className="kv-button--primary">
        {texts.sendApplication}
      </Button>
    </form>
  )
}
