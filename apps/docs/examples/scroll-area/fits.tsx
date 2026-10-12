'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Fits() {
  const { texts, isFallback } = useScrollAreaTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <ScrollArea aria-label={texts.feesLabel}>
        <p>{texts.shortText}</p>
      </ScrollArea>
    </InEnglishWhenFallback>
  )
}
