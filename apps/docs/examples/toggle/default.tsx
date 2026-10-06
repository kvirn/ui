'use client'
import { Toggle } from '@kvirn-ui/react'
import { useToggleTexts } from './texts.ts'

export function DefaultToggle() {
  const { texts, textLang } = useToggleTexts()
  return <Toggle lang={textLang}>{texts.unreadOnly}</Toggle>
}
