'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function DisabledWithReason() {
  const { texts } = useExampleTexts()
  const reasonId = useId()
  return (
    <>
      <p id={reasonId}>{texts.button.disabledReason}</p>
      <Button
        className="kv-button--primary"
        disabled
        focusableWhenDisabled
        aria-describedby={reasonId}
      >
        {texts.button.sendApplication}
      </Button>
    </>
  )
}
