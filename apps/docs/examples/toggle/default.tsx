'use client'
import { Toggle } from '@kvirn-ui/react'
import { useToggleTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultToggle() {
  const { texts, isFallback } = useToggleTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Toggle>{texts.unreadOnly}</Toggle>
    </InEnglishWhenFallback>
  )
}
