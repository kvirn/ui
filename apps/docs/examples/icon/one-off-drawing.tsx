'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function OneOffDrawing() {
  const { texts } = useIconTexts()
  return (
    <Icon label={texts.ownDrawing} size="40" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path d="M7 15l5-7 5 7z" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </Icon>
  )
}
