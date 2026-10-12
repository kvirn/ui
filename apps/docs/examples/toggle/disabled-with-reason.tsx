'use client'
import { Toggle } from '@kvirn-ui/react'
import { useId } from 'react'
import { useToggleTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DisabledWithReason() {
  const { texts, isFallback } = useToggleTexts()
  const reasonId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <p id={reasonId}>{texts.noMessages}</p>
        <Toggle disabled focusableWhenDisabled aria-describedby={reasonId}>
          {texts.unreadOnly}
        </Toggle>
      </>
    </InEnglishWhenFallback>
  )
}
