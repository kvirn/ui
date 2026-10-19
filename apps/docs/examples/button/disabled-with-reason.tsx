'use client'
import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import { useButtonTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts } = useButtonTexts()
  const reasonId = useId()
  return (
    <>
      <p id={reasonId}>{texts.disabledReason}</p>
      <Button
        className="kv-button--primary"
        disabled
        focusableWhenDisabled
        aria-describedby={reasonId}
      >
        {texts.sendApplication}
      </Button>
    </>
  )
}
