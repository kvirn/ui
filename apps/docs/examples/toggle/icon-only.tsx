'use client'
import { eye } from '@kvirn-ui/icons'
import { Icon, Toggle } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useToggleTexts } from './texts.ts'

export function IconOnly() {
  const { texts } = useToggleTexts()
  const [isShown, setIsShown] = useState(false)
  const inputId = useId()
  return (
    <div>
      <label htmlFor={inputId}>{texts.passwordLabel}</label>
      <input id={inputId} type={isShown ? 'text' : 'password'} autoComplete="current-password" />
      <Toggle
        className="kv-button--icon-only"
        aria-label={texts.showPassword}
        pressed={isShown}
        onPressedChange={setIsShown}
      >
        <Icon icon={eye} />
      </Toggle>
    </div>
  )
}
