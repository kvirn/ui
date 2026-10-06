'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function SubmitForm() {
  const { texts, textLang } = useExampleTexts()
  const nameId = useId()
  return (
    <form
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
      }}
    >
      <p>
        <label htmlFor={nameId} lang={textLang}>
          {texts.button.applicantName}
        </label>{' '}
        <input id={nameId} name="name" autoComplete="name" />
      </p>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.button.sendApplication}
      </Button>
    </form>
  )
}
