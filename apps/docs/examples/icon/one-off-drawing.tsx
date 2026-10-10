'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function OneOffDrawing() {
  const { texts, textLang } = useIconTexts()
  return (
    <Icon label={texts.ownDrawing} size="40" viewBox="0 0 24 24" lang={textLang}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path d="M8 13h8M12 8v8" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </Icon>
  )
}
