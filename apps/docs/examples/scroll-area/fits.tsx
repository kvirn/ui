'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function Fits() {
  const { texts } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel}>
      <p>{texts.shortText}</p>
    </ScrollArea>
  )
}
