'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function Fits() {
  const { texts, textLang } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel} lang={textLang}>
      <p>{texts.shortText}</p>
    </ScrollArea>
  )
}
