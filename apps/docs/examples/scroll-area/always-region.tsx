'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function AlwaysRegion() {
  const { texts } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel} region="always">
      <p>{texts.shortText}</p>
    </ScrollArea>
  )
}
