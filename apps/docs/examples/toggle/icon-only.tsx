'use client'
import { Icon, Toggle } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useToggleTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function IconOnly() {
  const { texts, isFallback } = useToggleTexts()
  const [isShown, setIsShown] = useState(false)
  const inputId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <label htmlFor={inputId}>{texts.passwordLabel}</label>
        <input id={inputId} type={isShown ? 'text' : 'password'} />
        <Toggle
          className="kv-button--icon-only"
          aria-label={texts.showPassword}
          pressed={isShown}
          onPressedChange={setIsShown}
        >
          <Icon name="eye" />
        </Toggle>
      </div>
    </InEnglishWhenFallback>
  )
}
