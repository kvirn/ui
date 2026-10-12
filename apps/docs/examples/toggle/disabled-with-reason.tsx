'use client'
import { Toggle } from '@kvirn-ui/react'
import { useId } from 'react'
import { useToggleTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts } = useToggleTexts()
  const reasonId = useId()
  return (
    <>
      <p id={reasonId}>{texts.noMessages}</p>
      <Toggle disabled focusableWhenDisabled aria-describedby={reasonId}>
        {texts.unreadOnly}
      </Toggle>
    </>
  )
}
