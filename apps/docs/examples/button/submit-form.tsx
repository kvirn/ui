'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SubmitForm() {
  const { texts, isFallback } = useExampleTexts()
  const nameId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <form
        onSubmit={(event) => {
          // A real form sends the data from here.
          event.preventDefault()
        }}
      >
        <p>
          <label htmlFor={nameId}>{texts.button.applicantName}</label>{' '}
          <input id={nameId} name="name" autoComplete="name" />
        </p>
        <Button type="submit" className="kv-button--primary">
          {texts.button.sendApplication}
        </Button>
      </form>
    </InEnglishWhenFallback>
  )
}
