'use client'
import { useScrollArea } from '@kvirn-ui/react'
import { FeesRows } from './fees-rows.tsx'
import { useScrollAreaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnMarkup() {
  const { texts, isFallback } = useScrollAreaTexts()
  const scrollArea = useScrollArea()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div
        {...scrollArea.scrollAreaProps}
        aria-label={scrollArea.isRegion ? texts.feesLabel : undefined}
        style={{ maxInlineSize: '24rem' }}
      >
        <FeesRows headers={texts.headers} rows={texts.rows} />
      </div>
    </InEnglishWhenFallback>
  )
}
