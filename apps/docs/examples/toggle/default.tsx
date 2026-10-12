'use client'
import { Toggle } from '@kvirn-ui/react'
import { useToggleTexts } from './texts.ts'

export function DefaultToggle() {
  const { texts } = useToggleTexts()
  return <Toggle>{texts.unreadOnly}</Toggle>
}
