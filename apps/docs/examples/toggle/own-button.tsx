'use client'
import { useToggle } from '@kvirn-ui/react'
import { useToggleTexts } from './texts.ts'

export function OwnButton() {
  const { texts } = useToggleTexts()
  // The hook keeps the state, so nothing else here does. Read isPressed to choose what to show.
  const toggle = useToggle()
  return (
    <div>
      <button {...toggle.toggleProps}>{texts.easyToRead}</button>
      <p>{toggle.isPressed ? texts.easyToReadText : texts.decisionText}</p>
    </div>
  )
}
