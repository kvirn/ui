'use client'
import { Toggle } from '@kvirn-ui/react'
import { useId } from 'react'
import { useToggleTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts, textLang } = useToggleTexts()
  const reasonId = useId()
  return (
    <>
      <p id={reasonId} lang={textLang}>
        {texts.noMessages}
      </p>
      <Toggle lang={textLang} disabled focusableWhenDisabled aria-describedby={reasonId}>
        {texts.unreadOnly}
      </Toggle>
    </>
  )
}
