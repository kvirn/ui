'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function AlwaysRegion() {
  const { texts, textLang } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel} region="always" lang={textLang}>
      <p>{texts.shortText}</p>
    </ScrollArea>
  )
}
