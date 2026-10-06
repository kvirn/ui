'use client'
import { Icon, Toggle } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useToggleTexts } from './texts.ts'

export function IconOnly() {
  const { texts, textLang } = useToggleTexts()
  const [isShown, setIsShown] = useState(false)
  const inputId = useId()
  return (
    <div lang={textLang}>
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
  )
}
