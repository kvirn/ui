'use client'
import { useScrollArea } from '@kvirn-ui/react'
import { FeesRows } from './fees-rows.tsx'
import { useScrollAreaTexts } from './texts.ts'

export function OwnMarkup() {
  const { texts } = useScrollAreaTexts()
  const scrollArea = useScrollArea()
  return (
    <div
      {...scrollArea.scrollAreaProps}
      aria-label={scrollArea.isRegion ? texts.feesLabel : undefined}
      style={{ maxInlineSize: '24rem' }}
    >
      <FeesRows headers={texts.headers} rows={texts.rows} />
    </div>
  )
}
