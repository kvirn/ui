'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { FeesRows } from './fees-rows.tsx'
import { useScrollAreaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Tall() {
  const { texts, isFallback } = useScrollAreaTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <ScrollArea
        aria-label={texts.feesLabel}
        style={{ maxInlineSize: '24rem', maxBlockSize: '8rem' }}
      >
        <FeesRows headers={texts.headers} rows={texts.rows} />
      </ScrollArea>
    </InEnglishWhenFallback>
  )
}
